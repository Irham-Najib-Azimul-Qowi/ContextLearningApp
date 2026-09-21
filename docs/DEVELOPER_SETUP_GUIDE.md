# PANDUAN LENGKAP PENGATURAN & DEPLOYMENT DEVELOPER CONTEXTLEARNING V2

Dokumen ini disusun dalam Bahasa Indonesia sebagai panduan teknis resmi bagi tim pengembang ContextLearning untuk mengonfigurasi autentikasi Google OAuth, basis data multi-tenant Supabase, kredensial AI Gemini terpusat, dan deployment ke Vercel.

---

## DAFTAR ISI
1. [A. Pengaturan Google Cloud Project](#a-pengaturan-google-cloud-project)
2. [B. Pembuatan Kredensial Google OAuth](#b-pembuatan-kredensial-google-oauth)
3. [C. Konfigurasi Autentikasi Supabase](#c-konfigurasi-autentikasi-supabase)
4. [D. Konfigurasi Environment Variables (.env.example)](#d-konfigurasi-environment-variables-envexample)
5. [E. Pengaturan API Gemini Terpusat](#e-pengaturan-api-gemini-terpusat)
6. [F. Provisi Administrator Platform Pertama (Bootstrap)](#f-provisi-administrator-platform-pertama-bootstrap)
7. [G. Geolokasi Sekolah & Sensor GPS](#g-geolokasi-sekolah--sensor-gps)
8. [H. Setup Database & Migrasi Supabase](#h-setup-database--migrasi-supabase)
9. [I. Deployment ke Vercel](#i-deployment-ke-vercel)
10. [J. Checklist Integrasi Sistem](#j-checklist-integrasi-sistem)

---

## A. PENGATURAN GOOGLE CLOUD PROJECT

ContextLearning V2 mewajibkan setiap pendidik (Guru) masuk menggunakan Google OAuth resmi demi keamanan identitas dan pencegahan akun palsu.

1. Buka [Google Cloud Console](https://console.cloud.google.com/).
2. Buat project baru dengan nama **`contextlearning-production`** (atau pilih project yang sudah ada).
3. Buka menu navigasi: **APIs & Services** → **OAuth consent screen**.
4. Pilih User Type:
   - Pilih **External** (agar dapat diakses oleh guru dengan akun `@gmail.com` maupun Google Workspace sekolah `@guru.sd.belajar.id`).
   - Klik **Create**.
5. Lengkapi informasi aplikasi pada layar persetujuan:
   - **App name**: `ContextLearning`
   - **User support email**: Pilih email pengembang/admin Anda.
   - **App logo**: Unggah logo resmi ContextLearning (opsional pada tahap pengujian).
   - **Developer contact information**: Masukkan email pengembang Anda.
   - Klik **Save and Continue**.
6. Atur Scopes:
   - Klik **Add or Remove Scopes**.
   - Pilih scopes dasar: `.../auth/userinfo.email`, `.../auth/userinfo.profile`, dan `openid`.
   - Klik **Update** lalu **Save and Continue**.
7. Mode Testing vs Production:
   - Selama aplikasi dalam status **Testing**, Anda wajib mendaftarkan email guru yang akan menguji pada menu **Test Users** (maksimal 100 email).
   - Saat siap rilis publik, klik tombol **Publish App** agar seluruh guru di Indonesia dapat masuk tanpa batasan daftar uji.

---

## B. PEMBUATAN KREDENSIAL GOOGLE OAUTH

1. Masuk ke menu **APIs & Services** → **Credentials**.
2. Klik **+ Create Credentials** di bagian atas, lalu pilih **OAuth client ID**.
3. Pilih Application type: **Web application**.
4. Berikan nama: `ContextLearning Web Client`.
5. Atur **Authorized JavaScript origins**:
   - Untuk pengembangan lokal: `http://localhost:3000`
   - Untuk produksi (Vercel): `https://contextlearning.vercel.app` (sesuaikan dengan domain Anda).
6. Atur **Authorized redirect URIs**:
   > **PENTING**: Google OAuth tidak mengarahkan callback langsung ke Next.js frontend, melainkan diarahkan terlebih dahulu ke endpoint Supabase Auth yang memverifikasi token OAuth secara aman.
   - Dapatkan URL callback resmi dari Dashboard Supabase Anda:
     `https://<project-ref>.supabase.co/auth/v1/callback`
   - Tambahkan URL tersebut ke daftar *Authorized redirect URIs* di Google Cloud Console.
   - Klik **Create**.
7. Salin dan simpan:
   - **Client ID** (contoh: `123456789-xxxx.apps.googleusercontent.com`)
   - **Client Secret** (contoh: `GOCSPX-xxxxxxxxxxxxxx`)

---

## C. KONFIGURASI AUTENTIKASI SUPABASE

1. Buka [Dashboard Supabase](https://supabase.com/dashboard) dan pilih project Anda.
2. Masuk ke menu **Authentication** → **Providers**.
3. Cari provider **Google**, aktifkan tombol toggle:
   - Tempelkan **Client ID** yang diperoleh dari Google Cloud Console.
   - Tempelkan **Client Secret** yang diperoleh dari Google Cloud Console.
   - Pastikan toggle **Enable Google provider** dalam posisi aktif.
   - Klik **Save**.
4. Masuk ke menu **Authentication** → **URL Configuration**:
   - **Site URL**: `http://localhost:3000` (atau URL Vercel pada produksi).
   - **Redirect URLs**:
     - `http://localhost:3000/**`
     - `https://*.vercel.app/**`
5. Kebijakan Autentikasi Tiga Peran ContextLearning V2:
   - **GURU**: Autentikasi wajib Google OAuth. Pendaftaran berbasis password mandiri dinonaktifkan di frontend.
   - **SISWA**: Tidak memerlukan akun Google. Diprovisi secara aman oleh guru kelas dengan Nomor Induk Siswa (NISN) dan kata sandi sementara melalui URL login khusus sekolah (`/login/[school-slug]`).
   - **ADMIN**: Login terisolasi di `/admin/login` dengan verifikasi allowlist ketat (`admin@contextlearning.id`).

---

## D. KONFIGURASI ENVIRONMENT VARIABLES (.ENV.EXAMPLE)

Buat file `.env.local` pada direktori root proyek. Berikut contoh konfigurasi lengkapnya:

```bash
# ===================================================
# CONTEXTLEARNING V2 ENVIRONMENT CONFIGURATION
# ===================================================

# --- 1. SUPABASE CONFIGURATION ---
# URL publik project Supabase Anda (Bisa dilihat di Settings -> API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Kunci Anon Publik (Aman untuk frontend, dibatasi oleh RLS)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Kunci Service Role (SANGAT RAHASIA - HANYA DI SERVER, JANGAN PAKAI NEXT_PUBLIC)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# --- 2. GOOGLE GEMINI AI CONFIGURATION ---
# Kunci API Google AI Studio / Vertex AI untuk server-side AI Provider Manager.
# Guru dan Siswa TIDAK PERNAH memasukkan kunci ini secara manual.
GEMINI_API_KEY=AIzaSyB3_example_production_key_here

# Model default yang diizinkan untuk generasi konten lokal
GEMINI_MODEL=gemini-2.5-flash

# --- 3. APLIKASI WEB URL ---
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# --- 4. PLATFORM ADMIN BOOTSTRAP ALLOWLIST ---
ADMIN_ALLOWLIST=admin@contextlearning.id,operations@contextlearning.id
```

---

## E. PENGATURAN API GEMINI TERPUSAT

ContextLearning V2 menerapkan arsitektur **Centralized AI Provider Manager**. Guru maupun siswa tidak dibebani kewajiban membuat atau membayar API key Gemini pribadi.

1. Buka [Google AI Studio](https://aistudio.google.com/) atau Vertex AI Console.
2. Buat API Key baru di bawah project Google Cloud yang memiliki billing aktif.
3. Batas Kuota dan Isolasi:
   - Pahami bahwa beberapa kunci API yang dibuat dalam project Google Cloud yang sama **berbagi kuota rate-limit yang sama**.
   - Untuk skala produksi besar, daftarkan kredensial dari project GCP independen yang berbeda di halaman `/admin/ai`.
4. Mendaftarkan Kredensial di Dashboard Admin ContextLearning:
   - Buka `/admin/ai` setelah login sebagai Platform Admin.
   - Klik **Tambah Kredensial Gemini**.
   - Masukkan label internal (contoh: `Kluster Produksi 01 - Jakarta`).
   - Masukkan API Key dan nomor Project ID.
   - Pilih prioritas (Priority 1 untuk beban utama, Priority 2 untuk cadangan/fallback).
   - Kunci API akan langsung **dimasking** (contoh: `AIzaSyB3...881kQ`) dan tersimpan aman di server.
5. Mekanisme Failover & Perlindungan Anggaran:
   - Jika kuota Google GenAI habis atau terjadi error jaringan, sistem tidak akan crash melainkan otomatis beralih ke kluster cadangan atau menjalankan **Curriculum Fallback Engine** deterministik lokal.

---

## F. PROVISI ADMINISTRATOR PLATFORM PERTAMA (BOOTSTRAP)

Platform Admin memiliki hak istimewa untuk mengelola seluruh sekolah, memverifikasi instansi baru, mengatur kredensial AI, dan meninjau audit logs.

1. Tidak ada halaman registrasi admin publik (`Register Admin`) demi mencegah eskalasi hak akses ilegal.
2. Rute login admin bersifat terpisah di `/admin/login`.
3. Akun admin dibatasi menggunakan `ADMIN_ALLOWLIST`:
   - Akun default pra-konfigurasi: `admin@contextlearning.id`.
   - Kode otorisasi demo: `AdminMaster2026#` (atau gunakan tombol *Akses Cepat Pengujian* pada halaman login admin).
4. Untuk menambahkan admin operasional baru:
   - Masukkan email ke dalam tabel `profiles` Supabase dengan `role = 'platform_admin'`.

---

## G. GEOLOKASI SEKOLAH & SENSOR GPS

ContextLearning mengadaptasi soal berdasarkan lokasi nyata sekolah di Indonesia.

1. **Persyaratan Browser & HTTPS**:
   - Geolocation API membutuhkan koneksi aman (`HTTPS`) di lingkungan produksi. Pada `localhost`, browser mengizinkan HTTP untuk pengujian.
2. **Izin Eksplisit**:
   - Sistem **tidak** mengambil GPS secara otomatis atau terus-menerus.
   - Pendidik harus mengklik tombol **"Gunakan GPS"** secara sadar saat berada di lokasi sekolah.
3. **Penanganan Penolakan Izin**:
   - Jika izin lokasi ditolak oleh browser, sistem menampilkan notifikasi ramah dan pendidik tetap dapat memasukkan provinsi, kabupaten/kota, dan kecamatan secara manual tanpa hambatan.
4. **Hierarki Konteks Wilayah**:
   - `Kecamatan` → `Kabupaten/Kota` → `Provinsi` → `Umum Nasional`.

---

## H. SETUP DATABASE & MIGRASI SUPABASE

1. Buka SQL Editor di Dashboard Supabase.
2. Jalankan migrasi tahap 1 dari file:
   [`supabase/migrations/001_initial_schema.sql`](file:///x:/folder_website/contextlearning/supabase/migrations/001_initial_schema.sql)
3. Jalankan migrasi multi-tenant V2 dari file:
   [`supabase/migrations/002_multi_tenant_v2.sql`](file:///x:/folder_website/contextlearning/supabase/migrations/002_multi_tenant_v2.sql)
4. Migrasi ini secara otomatis membuat:
   - Tabel `schools` dengan kolom `code`, `slug`, `educational_level` (SD, SMP, SMA), `verification_status`.
   - Tabel `school_memberships` (memungkinkan satu guru mengajar di lebih dari satu sekolah).
   - Tabel `ai_credentials` & `ai_generation_logs`.
   - Tabel `scanned_answer_sheets`.
   - Tabel `audit_logs`.
   - Kebijakan keamanan Row Level Security (RLS) untuk isolasi data antar sekolah.

---

## I. DEPLOYMENT KE VERCEL

1. Masuk ke akun [Vercel](https://vercel.com/) dan klik **Add New** → **Project**.
2. Hubungkan repository GitHub:
   `https://github.com/Irham-Najib-Azimul-Qowi/ContextLearningApp.git`
3. Konfigurasi Framework Preset:
   - Framework: **Next.js**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. Masukkan Environment Variables di Vercel Settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY`
   - `NEXT_PUBLIC_SITE_URL` (masukkan domain vercel Anda, contoh: `https://contextlearning.vercel.app`)
5. Klik **Deploy**.
6. Setelah deployment selesai:
   - Buka Google Cloud Console → tambahkan domain Vercel ke *Authorized JavaScript origins*.
   - Buka Supabase Dashboard → Authentication → URL Configuration → tambahkan domain Vercel ke *Redirect URLs*.

---

## J. CHECKLIST INTEGRASI SISTEM

Gunakan checklist ini sebelum merilis sistem ke pengguna akhir atau dewan juri:

| Komponen | Status Verifikasi |
| :--- | :--- |
| **Google OAuth Guru** | Tombol "Lanjutkan dengan Google" berfungsi dan mengarahkan ke dashboard guru. |
| **Portal Siswa Sekolah** | Siswa dapat login melalui URL `/login/[school-slug]` dengan ID siswa dan password. |
| **Isolasi Tenant** | Siswa Sekolah A ditolak jika mencoba login di portal Sekolah B. |
| **Manajemen Multi-Sekolah** | Guru dapat berpindah sekolah melalui Left Workspace Rail tanpa logout. |
| **Daftar Sekolah Baru** | Guru dapat mendaftarkan instansi SD/SMP/SMA dengan deteksi duplikasi nama. |
| **Sinkronisasi GPS** | Tombol GPS mendeteksi koordinat latitude/longitude secara akurat. |
| **Impor Spreadsheet Siswa** | Guru dapat mengunggah file `.csv` atau `.xlsx` dan membagikan kredensial login. |
| **Pusat Cetak Dokumen** | Lembar ujian, kunci jawaban guru, dan materi ajar dapat dicetak rapi format A4. |
| **Koreksi Lembar Scan (LJK)** | Tanda jawaban pada lembar LJK terdeteksi dan dinilai secara deterministik. |
| **Manajemen Kredensial AI** | Admin dapat menambah dan menonaktifkan API key Gemini di `/admin/ai`. |
| **Kerahasiaan Secret** | Tidak ada API key atau password siswa yang bocor ke bundle JavaScript klien. |
| **Audit Logging** | Semua tindakan penting (verifikasi, pembuatan akun siswa) tercatat di log audit. |
