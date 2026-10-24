---
name: secure-coding-supabase
description: >-
  Use this skill when implementing, auditing, or modifying authentication, authorization,
  Supabase PostgreSQL access, RLS policies, API routes, data synchronization, student privacy,
  or secret and credential management.
---

# Secure Coding & Supabase Engineering Skill

Panduan keamanan aplikasi web dan akses data Supabase untuk Depaskan, diadaptasi dari **Supabase Agent Skills** (`supabase/agent-skills`) dan standar OWASP ASVS.

## 1. Arsitektur Otentikasi & Sesi

- **Supabase SSR Helper**: Gunakan `@supabase/ssr` untuk validasi sesi pada Server Components, Route Handlers, dan Middleware.
- **Prinsip Validasi Server-Side**:
  - Jangan pernah mempercayai klaim peran atau `userId` yang dikirim dari klien browser tanpa memvalidasi session token (`auth.getUser()` atau `auth.getSession()`).
  - Tolak akses rute terlindungi (`/admin`, `/guru`, `/api/sync/*`) jika otentikasi gagal atau kadaluarsa.
- **Penanganan Proyek Supabase Paused/Inaktif**:
  - Aplikasi harus menangani kesalahan koneksi Supabase (`NXDOMAIN`, timeout, connection refused) secara elegan tanpa membocorkan stack trace internal atau menyebabkan crash aplikasi, memanfaatkan Local Storage Repository sebagai benteng pertahanan offline.

## 2. Row Level Security (RLS) & Akses PostgreSQL

1. **Wajib RLS**: Setiap tabel di database PostgreSQL Supabase harus mengaktifkan RLS:
   ```sql
   ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.user_sync ENABLE ROW LEVEL SECURITY;
   ```
2. **Prinsip Hak Akses Terkecil (Least Privilege)**:
   - Kebijakan RLS harus membatasi akses berdasarkan relasi kepemilikan (`auth.uid() = teacher_id` atau keanggotaan kelas `school_id`).
   - Dilarang membuat kebijakan `USING (true)` atau `WITH CHECK (true)` untuk operasi `INSERT`, `UPDATE`, atau `DELETE` pada tabel sensitif.
3. **Kerahasiaan Service-Role Key**:
   - `SUPABASE_SERVICE_ROLE_KEY` HANYA boleh diakses di backend server-side rahasia.
   - Dilarang keras menaruh service-role key di variabel `NEXT_PUBLIC_*` atau membundelnya ke kode klien.
   - Jangan pernah melakukan *bypass* RLS untuk permintaan yang berasal dari pengguna publik.

## 3. Sinkronisasi Data Lokal & Perlindungan Tombstone

- Rute sinkronisasi (`app/api/sync/user-data/route.ts`) menerapkan arsitektur tombstone untuk mencegah kebangkitan item yang sudah dihapus:
  - Validasi bahwa payload sinkronisasi tidak dapat menimpa data milik guru atau sekolah lain.
  - Jangan biarkan respons cloud yang terlambat menghapus item lokal yang baru saja disimpan oleh pengguna.
  - Setiap operasi pembaruan harus bersifat idempoten (*idempotent*).

## 4. Keamanan Kredensial & AI Endpoint

1. **Masking Kredensial**:
   - API Key Gemini yang dimasukkan oleh admin atau guru di antarmuka harus selalu dimaskir (contoh: `AIK...9xy`).
   - Dilarang mencetak kunci API ke dalam log konsol, error handler, atau respon JSON publik.
2. **Perlindungan Endpoint AI dari Penyalahgunaan**:
   - Terapkan validasi input ketat (skema Zod) sebelum memanggil model AI untuk mencegah eksploitasi prompt injection atau pembakaran kuota token yang sia-sia.
   - Tolak prompt kosong atau payload melebihi batas ukuran secara instan di level klien/server sebelum menyentuh API eksternal.
3. **Audit Kredensial Default**:
   - Script inisialisasi lokal (seperti `scripts/bootstrap_admin.ts`) tidak boleh menggunakan kata sandi default lemah di lingkungan produksi. Wajib mewajibkan perubahan kredensial admin saat setup pertama kali.

## 5. Privasi Siswa & Perlindungan Data Anak

- Minimalkan pengumpulan data pribadi (PII) siswa SD. Gunakan kode kelas atau alias numerik (NISN) tanpa menuntut data identitas sensitif berlebih.
- Upload file (PDF, gambar soal) wajib divalidasi MIME type, dibatasi ukurannya (< 10 MB), dan dibersihkan dari metadata berbahaya sebelum diproses oleh parser.
