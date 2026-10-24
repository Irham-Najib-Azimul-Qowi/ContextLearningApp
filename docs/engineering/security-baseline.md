# Security Baseline & Vulnerability Assessment — Depaskan

Dokumen ini memetakan postur keamanan, proteksi data, kontrol otentikasi, dan status kerentanan pada repositori Depaskan.

## 1. Postur Otentikasi & Sesi

- **Supabase Auth**:
  - Menggunakan library resmi `@supabase/ssr` dan `@supabase/supabase-js`.
  - Integrasi login Google OAuth dan Email/Password.
  - Sesi disimpan secara aman di cookies HTTP-only via middleware Supabase SSR.
- **Penyimpanan Lokal Sesi Offline**:
  - Untuk lingkungan kelas offline, sistem mendukung fallback sesi guru/siswa di Local Storage (`lib/db/repository.ts`) dengan validasi scoped ke `school_id`.

## 2. Row Level Security (RLS) & Akses Database

- **Kebijakan Multi-Tenant**:
  - Data materi, soal, dan ruang ujian diisolasi secara ketat berdasarkan `school_id` dan `teacher_id`.
  - Siswa hanya dapat membaca materi dan soal dari ruang kelas (`room`) yang aktif dan memiliki kode undangan (*room code*) yang sah.
- **Kerahasiaan Service-Role Key**:
  - Variabel `SUPABASE_SERVICE_ROLE_KEY` hanya boleh diakses di API Serverless/Edge Route rahasia (`/api/sync/*`).
  - Dilarang menempatkan kunci ini di variabel browser publik (`NEXT_PUBLIC_*`).

## 3. Manajemen Kredensial AI & Pool Multi-Slot

- **Penyimpanan Kunci API Gemini**:
  - Disimpan dalam pool multi-slot di server/admin settings (`lib/admin/admin-repository.ts` dan `lib/ai/ai-provider-manager.ts`).
  - Dilindungi fungsi masking: Pada UI dan log, kunci ditampilkan sebagai `AIK...9xy` (hanya menampilkan 3 karakter awal dan 3 karakter akhir).
- **Proteksi Quota & Abuse Prevention**:
  - Failover otomatis: Ketika slot ke-1 mencapai rate limit (429), sistem otomatis beralih ke slot ke-2 hingga ke-5.
  - Circuit Breaker: Kunci yang non-aktif atau kuotanya habis ditandai sementara untuk menghindari spam panggilan gagal.

## 4. Analisis Isu Keamanan Teridentifikasi & Mitigasi

| Komponen | Isu / Temuan Sebelumnya | Status Verifikasi & Mitigasi |
| :--- | :--- | :--- |
| **Admin Bootstrap** (`scripts/bootstrap_admin.ts`) | Potensi kredensial default admin hardcoded jika dijalankan di produksi. | **Terkendali**: Skrip hanya untuk inisialisasi lokal. Di produksi, admin wajib mendaftar melalui antarmuka setup pertama kali (`/admin/setup`) dengan kata sandi unik. |
| **Dual-Storage Sync** (`app/api/sync/user-data/route.ts`) | Potensi race condition antara data lokal dan cloud yang menimpa pekerjaan baru guru. | **Terkendali & Teruji**: Dilindungi oleh matriks sinkronisasi berbasis tombstone. Item lokal yang baru dibuat tidak pernah dihapus oleh respon cloud yang terlambat (terverifikasi pada test suite). |
| **Dual-Storage Sync Auth Fallback** (`app/api/sync/user-data/route.ts:166-175`) | Fallback `bodyCandidate.userId` diterima jika Bearer token & SSR cookies tidak tersedia. | **Temuan Bukti (Evidence-Based Finding)**: Diperlukan untuk mendukung classroom offline mode saat Supabase tidak terhubung. Namun, untuk produksi publik, endpoint ini harus mewajibkan JWT valid atau signature lokal agar tidak dapat dieksploitasi untuk spoofing `userId`. Direkomendasikan untuk diperketat pada iterasi keamanan berikutnya. |
| **Koneksi Supabase Paused** | Kasus Supabase instance paused karena inaktivitas (`NXDOMAIN` saat DNS query). | **Terkendali**: Aplikasi memiliki fallback lokal di `lib/db/repository.ts`, sehingga fungsionalitas kelas tetap berjalan lancar secara offline di browser. Pengguna diarahkan untuk klik "Resume" di dasbor Supabase. |
| **Privasi Siswa SD** | Kepatuhan terhadap UU Perlindungan Data Pribadi (UU PDP Indonesia). | **Terkendali**: Tidak ada pengumpulan data pribadi sensitif anak (alamat rumah, NIK orang tua, data finansial). Hanya menggunakan nama panggilan/NISN dan kode kelas. |

