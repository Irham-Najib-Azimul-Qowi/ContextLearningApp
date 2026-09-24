# PANDUAN PENGATURAN ADMIN CONTROL CENTER — PAHAMI V2
**Hak Cipta © 2026 Tim PAHAMI — Hackathon IT Comp 2026**  
*Principal Software Engineer, AI Infrastructure Engineer, & Security Architect*

---

## 1. PENDAHULUAN & TUJUAN SISTEM

**Admin Control Center PAHAMI V2** adalah portal operasional internal yang didesain khusus bagi developer dan technical administrator untuk:
1. **Mengelola Kredensial Multi-Provider AI**: Menyimpan API Key Google Gemini dalam basis data terenkripsi AES-256-GCM authenticated cipher.
2. **Automatic Failover & Circuit Breaker**: Mencegah kegagalan aplikasi saat kuota Google AI Studio habis (HTTP 429), dengan rotasi kredensial otomatis lintas *quota group* dan safe pedagogical fallback.
3. **Model & Feature Routing**: Memetakan model Gemini (Flash vs Pro) ke fitur spesifik (pembuatan kuis, pemindaian OCR lembar kerja, materi adaptif).
4. **Pemantauan Telemetri & Token**: Menganalisis latensi, konsumsi token input/output, dan distribusi fitur.
5. **Manajemen Pengguna & Sekolah**: Mengaktifkan/menonaktifkan akun guru atau siswa, memverifikasi sekolah, dan meninjau keanggotaan kelas.
6. **Audit Forensik Keamanan**: Mencatat setiap aktivitas administratif dalam log audit yang tidak dapat diubah (*immutable audit logs*).

Arsitektur ini **100% Serverless** di atas Vercel dan Supabase PostgreSQL, tanpa memerlukan server Python permanen, VPS, ataupun Cloud Run saat runtime.

---

## 2. KEBUTUHAN VARIABEL LINGKUNGAN (.env.local)

Pastikan variabel-variabel berikut telah dikonfigurasi di file `.env.local` pada root project:

```bash
# ==============================================================================
# PAHAMI V2 - ADMIN CONTROL CENTER SECURITY SECRETS
# ==============================================================================

# Master Encryption Key (32 bytes / 64 hex characters) untuk AES-256-GCM
ADMIN_ENCRYPTION_KEY=c39f860fa0c1efbe948ebcbfa429d20c572a11b65da98e6c888d388656d0d2b7

# Salt kriptografi untuk password hashing scrypt
ADMIN_PASSWORD_SALT=pahami_v2_admin_secure_salt_2026_madiun_semarang

# Kredensial Default Gemini AI Studio (Opsional jika sudah diisi via Admin UI)
GEMINI_API_KEY=AIzaSy...your-gemini-key...

# Supabase PostgreSQL Database & Auth
NEXT_PUBLIC_SUPABASE_URL=https://ubwsgabbongnbbflxmxo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
DATABASE_URL=postgresql://postgres.ubwsgabbongnbbflxmxo:V3ryS3cur3P@ssw0rd2026@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres
```

> [!NOTE]
> Jika `ADMIN_ENCRYPTION_KEY` tidak diatur di environment, sistem secara aman menggunakan fallback key bawaan development. Untuk lingkungan produksi, gunakan nilai hex acak 64 karakter (`crypto.randomBytes(32).toString('hex')`).

---

## 3. EKSEKUSI MIGRASI DATABASE REMOTE SUPABASE

Tabel-tabel Admin Control Center telah disusun dalam file migrasi:  
`supabase/migrations/20260924020000_admin_control_center.sql`

Tabel yang dibuat:
- `admin_accounts`: Menyimpan akun developer dengan password hash scrypt dan proteksi brute-force.
- `admin_sessions`: Token sesi terisolasi (SHA-256 hash token) dengan masa berlaku 8 jam.
- `ai_credentials`: Kredensial API key terenkripsi AES-256-GCM beserta metadata circuit breaker.
- `ai_models`: Konfigurasi routing fitur ke model Gemini utama dan cadangan.
- `ai_usage_events`: Telemetri token, latensi, dan status eksekusi AI.
- `ai_failover_events`: Jejak pengalihan failover saat terjadi error kuota.
- `admin_audit_logs`: Log audit keamanan setiap tindakan developer.
- `system_settings`: Key-value store untuk maintenance mode dan global AI switch.
- `system_notifications`: Notifikasi alert operasional.

### Cara Menjalankan Migrasi ke Remote Supabase
Jalankan script Python migrasi terpadu:
```powershell
uv run python scripts/apply_remote_migrations.py
```
Output konfirmasi berhasil:
```text
Connecting to remote Supabase DB at aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres...
Successfully connected to remote Supabase PostgreSQL!
Applying migration: 20260924020000_admin_control_center.sql ...
  Executed 10 SQL statements successfully.
Migration completed successfully!
```

---

## 4. BOOTSTRAP AKUN SUPER ADMIN PERTAMA

Untuk membuat akun Super Admin pertama (`irham_admin`), jalankan salah satu script bootstrap:

### Opsi A: Via Node.js / TypeScript
```powershell
npx tsx scripts/bootstrap_admin.ts
```

### Opsi B: Via Python Script
```powershell
uv run python scripts/bootstrap_admin.py
```

### Kredensial Default Super Admin:
- **URL Login**: `http://localhost:3000/admin/login` (atau domain Vercel Anda di `/admin/login`)
- **Username**: `irham_admin`
- **Password**: `PahamiAdmin2026!`
- **Role**: `SUPER_ADMIN`
- **Akses**: Penuh ke seluruh fitur kontrol AI, pengguna, sekolah, dan sistem.

---

## 5. PANDUAN PENGGUNAAN HARIAN DEVELOPER

### A. Akses & Login Portal
1. Buka browser dan arahkan ke: `http://localhost:3000/admin/login`
2. Masukkan username `irham_admin` dan kata sandi `PahamiAdmin2026!`.
3. Klik **"Masuk ke Control Center"**.
4. Sistem akan membuat cookie sesi aman `HttpOnly`, `SameSite=Lax` bernama `pahami_admin_session` yang terisolasi total dari cookie login Google pengguna umum.

### B. Menambah Kredensial API Key Gemini Baru
1. Buka menu **Multi-Provider AI -> Kredensial API Key** (`/admin/ai/credentials`).
2. Klik tombol **"Tambah Kredensial"**.
3. Isi formulir:
   - **Nama Kredensial**: Contoh: `Gemini Secondary Proyek B`
   - **API Key**: `AIzaSy...` (akan langsung dienkripsi AES-256-GCM).
   - **Kelompok Kuota (Quota Group)**: Isi ID proyek Google Cloud yang berbeda, misal `project_standby_02` agar tidak berbagi kuota limit.
   - **Prioritas**: 1 untuk utama, 2 untuk sekunder, 3 untuk cadangan ketiga.
4. Klik **"Simpan & Enkripsi Kredensial"**.
5. Klik tombol **"Uji Koneksi"** pada baris kredensial untuk memverifikasi validitas key secara langsung ke Google AI Studio.

### C. Mengatur Model Routing Per Fitur
1. Buka menu **Multi-Provider AI -> Model & Routing** (`/admin/ai/models`).
2. Sesuaikan konfigurasi fitur:
   - **Pembuatan Soal Kontekstual**: Primary `gemini-2.5-flash`, Fallback `gemini-1.5-flash`, Temp `0.20`.
   - **Pemindaian Soal (OCR & Vision)**: Primary `gemini-2.5-flash` (kapabilitas vision), Temp `0.10`.
   - **Penyusunan Materi**: Primary `gemini-2.5-flash`, Fallback `gemini-1.5-flash`.
3. Klik **"Simpan Konfigurasi"**.

### D. Mengatasi Circuit Breaker yang Tripped
Jika sebuah kredensial mengalami error beruntun sebanyak 3 kali:
1. Buka menu **Multi-Provider AI -> Failover & Circuit** (`/admin/ai/failover`).
2. Tinjau penyebab error pada card kredensial (misal `QUOTA_EXCEEDED` atau `TIMEOUT`).
3. Setelah batas kuota pulih atau API key diganti, klik tombol **"Reset Circuit"** untuk mengembalikan status ke `CLOSED` (Normal).

### E. Manajemen Pengguna & Sekolah
1. Buka menu **Manajemen Pengguna** (`/admin/users`):
   - Filter berdasarkan role: Guru, Siswa, Admin.
   - Nonaktifkan akun bermasalah dengan tombol **"Nonaktifkan"** (disertai alasan audit).
2. Buka menu **Manajemen Sekolah** (`/admin/schools`):
   - Tinjau sekolah di Kota Madiun, Kabupaten Madiun, Ponorogo, Semarang, dll.
   - Verifikasi status sekolah atau tinjau statistik guru dan murid terdaftar.

### F. Mengaktifkan Mode Pemeliharaan (Maintenance Mode)
1. Buka menu **Sistem & Keamanan -> Pengaturan & Mode** (`/admin/system/settings`).
2. Aktifkan toggle **"Mode Pemeliharaan"** dan tuliskan pesan penjelasan untuk siswa/guru.
3. Klik **"Simpan Mode Pemeliharaan"**. Pengguna umum akan dialihkan secara santun sementara admin tetap dapat mengakses dashboard.

---

## 6. VALIDASI & PENGUJIAN OTOMATIS

Seluruh mekanisme Admin Control Center telah teruji dengan unit test komprehensif:
```powershell
npm run test
```
Hasil uji: **36 dari 36 test suite PASSED**, mencakup:
- Enkripsi AES-256-GCM dan verifikasi tag otentikasi.
- Hashing password `scrypt` dan verifikasi `timingSafeEqual`.
- Proteksi brute force lockout (15 menit setelah 5 percobaan).
- Isolasi wewenang role (`SUPER_ADMIN`, `AI_ADMIN`, `SUPPORT_ADMIN`, `AUDITOR`).
- Klasifikasi error (429 Quota Exceeded, 403 Invalid Key, 503 Overloaded).
- Rotasi failover cerdas berbasis *quota group* dan transisi state circuit breaker.
