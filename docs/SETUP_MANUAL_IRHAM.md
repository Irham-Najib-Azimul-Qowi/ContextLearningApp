# PANDUAN SETUP DAN DEPLOYMENT MANUAL PAHAMI V2
**Khusus untuk Pemilik Proyek (Irham) — Hackathon IT Comp 2026**

Dokumen ini adalah panduan operasional langkah-demi-langkah terlengkap untuk menyelesaikan konfigurasi manual yang membutuhkan akses ke akun dashboard eksternal (GitHub, Supabase, Google Cloud Console, Google AI Studio, dan Vercel).

---

## DAFTAR ISI
1. [A. Persiapan Repository GitHub](#a-persiapan-repository-github)
2. [B. Konfigurasi Supabase Project](#b-konfigurasi-supabase-project)
3. [C. Penerapan Database Migrations](#c-penerapan-database-migrations)
4. [D. Konfigurasi Google OAuth di Supabase Auth](#d-konfigurasi-google-oauth-di-supabase-auth)
5. [E. Konfigurasi Google Cloud Console (OAuth Client Tanpa Cloud Run)](#e-konfigurasi-google-cloud-console-oauth-client-tanpa-cloud-run)
6. [F. Konfigurasi Redirect URL (Localhost, Vercel Preview, Production)](#f-konfigurasi-redirect-url-localhost-vercel-preview-production)
7. [G. Konfigurasi Supabase Auth Settings](#g-konfigurasi-supabase-auth-settings)
8. [H. Konfigurasi Google Gemini API Key](#h-konfigurasi-google-gemini-api-key)
9. [I. Konfigurasi Local Knowledge Base (LKB)](#i-konfigurasi-local-knowledge-base-lkb)
10. [J. Cara Mengimpor Dataset Wilayah Karesidenan Madiun](#j-cara-mengimpor-dataset-wilayah-karesidenan-madiun)
11. [K. Menjalankan Pipeline Python Offline (Jika Dataset Diperbarui)](#k-menjalankan-pipeline-python-offline-jika-dataset-diperbarui)
12. [L. Memverifikasi Fungsi Retrieval Online](#l-memverifikasi-fungsi-retrieval-online)
13. [M. Menghubungkan Repository ke Vercel](#m-menghubungkan-repository-ke-vercel)
14. [N. Konfigurasi Build & Environment Variables di Vercel](#n-konfigurasi-build--environment-variables-di-vercel)
15. [O. Deployment Preview & Pengujian Staging](#o-deployment-preview--pengujian-staging)
16. [P. Deployment Production](#p-deployment-production)
17. [Q. Verifikasi & Smoke Test Pasca Deployment](#q-verifikasi--smoke-test-pasca-deployment)
18. [R. Setup Akun Pertama Guru dan Murid](#r-setup-akun-pertama-guru-dan-murid)
19. [S. Pembuatan Sekolah dan Kelas Pertama](#s-pembuatan-sekolah-dan-kelas-pertama)
20. [T. Pengujian Alur Kontekstualisasi Soal Nyata](#t-pengujian-alur-kontekstualisasi-soal-nyata)
21. [U. Backup dan Pemulihan Database](#u-backup-dan-pemulihan-database)
22. [V. Prosedur Update Aplikasi & Dataset di Masa Depan](#v-prosedur-update-aplikasi--dataset-di-masa-depan)
23. [W. Pemantauan Kuota Gratis (Supabase, Gemini, Vercel)](#w-pemantauan-kuota-gratis-supabase-gemini-vercel)

---

### A. Persiapan Repository GitHub
- **Tujuan**: Memastikan cabang integrasi `integration/pahami-v2-final` tersinkronisasi ke repository remote GitHub dan digabungkan ke `main`.
- **Apa yang harus dibuka**: Terminal lokal dan halaman repository GitHub: `https://github.com/Irham-Najib-Azimul-Qowi/ContextLearningApp`.
- **Pengaturan yang perlu dibuat**:
  1. Pastikan seluruh commit integrasi telah di-push:
     ```powershell
     git checkout main
     git merge integration/pahami-v2-final
     git push origin main
     ```
  2. Buka tab **Settings** > **Branches** di GitHub jika branch protection aktif, dan setujui Pull Request integrasi final.
- **Informasi yang diperoleh**: URL commit hash terbaru di branch `main`.
- **Cara memverifikasi**: Buka tab *Code* di GitHub dan pastikan folder `data-pipeline/`, `supabase/migrations/`, `app/login/`, `app/auth/` terlihat di branch `main`.
- **Masalah umum**: *Rejected non-fast-forward push*. Solusi: Jalankan `git pull origin main --rebase` terlebih dahulu, jangan gunakan `--force`.

---

### B. Konfigurasi Supabase Project
- **Tujuan**: Membuat database PostgreSQL terkelola dengan ekstensi `vector` aktif untuk menyimpan dataset kontekstual dan data operasional PAHAMI.
- **Apa yang harus dibuka**: Dashboard Supabase: `https://supabase.com/dashboard`.
- **Pengaturan yang perlu dibuat**:
  1. Klik **New Project**.
  2. Isi Project Name: `pahami-v2-production`.
  3. Masukkan Database Password yang kuat (catat password ini).
  4. Pilih Region: `Southeast Asia (Singapore)` agar latency rendah ke Indonesia.
  5. Pilih Pricing Plan: **Free Tier**.
  6. Setelah database aktif (~2 menit), buka **Project Settings** > **API**.
- **Nilai yang diperoleh**:
  - `Project URL` (contoh: `https://abcdefghijkl.supabase.co`)
  - `anon public key` (kunci publik frontend)
  - `service_role secret key` (kunci rahasia serverless backend)
  - Database connection string di **Database Settings** > **Connection Pooling**
- **Di mana digunakan**: Di `.env.local` lokal dan Dashboard Vercel Environment Variables.
- **Cara memverifikasi**: Buka **Table Editor** di Supabase; pastikan halaman dapat dimuat tanpa error koneksi.

---

### C. Penerapan Database Migrations
- **Tujuan**: Membuat skema database terintegrasi (Local Knowledge Base + Core LMS PAHAMI V2).
- **Apa yang harus dibuka**: Supabase Dashboard > **SQL Editor** > **New Query**.
- **Pengaturan yang perlu dibuat**:
  1. Buka file migration pertama: `supabase/migrations/20260923140000_local_knowledge.sql` di repository. Salin seluruh isinya, tempel ke SQL Editor Supabase, lalu klik **Run**.
  2. Buka file migration kedua: `supabase/migrations/20260924000000_pahami_core_schema.sql` di repository. Salin seluruh isinya, tempel ke SQL Editor Supabase, lalu klik **Run**.
- **Informasi yang diperoleh**: Status pesan `Success. No rows returned`.
- **Cara memverifikasi**:
  Buka tab **Database** > **Tables** di Supabase. Pastikan tabel-tabel berikut ada:
  - `lkb_regions`, `lkb_entities`, `lkb_entity_facts`, `lkb_entity_embeddings`, `lkb_curriculum_mappings`, `lkb_retrieval_logs`
  - `schools`, `user_profiles`, `classrooms`, `class_memberships`, `questions`, `learning_materials`, `exams`, `exam_attempts`, `notifications`
  Buka **Database** > **Functions**, pastikan fungsi `lkb_retrieve_context` terdaftar.
- **Masalah umum**: *Error: type "vector" does not exist*. Solusi: Buka **Database** > **Extensions**, cari `vector`, dan aktifkan sebelum menjalankan migration.

---

### D. Konfigurasi Google OAuth di Supabase Auth
- **Tujuan**: Mengaktifkan penyedia Google OAuth pada Supabase Auth sebagai satu-satunya pintu masuk pengguna.
- **Apa yang harus dibuka**: Supabase Dashboard > **Authentication** > **Providers** > **Google**.
- **Pengaturan yang perlu dibuat**:
  1. Ubah toggle **Enable Sign in with Google** menjadi **ON**.
  2. Masukkan **Client ID (for OAuth)** dari Google Cloud Console.
  3. Masukkan **Client Secret (for OAuth)** dari Google Cloud Console.
  4. Salin URL **Callback URL (for OAuth)** yang disediakan oleh Supabase:
     Format: `https://<project-ref>.supabase.co/auth/v1/callback`
  5. Klik **Save**.
- **Informasi yang diperoleh**: URL Supabase OAuth Callback untuk dimasukkan ke Google Cloud Console.
- **Cara memverifikasi**: Di tab Providers, badge di samping **Google** berwarna hijau bertuliskan *Enabled*.

---

### E. Konfigurasi Google Cloud Console (OAuth Client Tanpa Cloud Run)
- **Tujuan**: Mendaftarkan OAuth 2.0 Client ID di Google Cloud tanpa membuat VM atau Cloud Run apa pun (100% gratis).
- **Apa yang harus dibuka**: Google Cloud Console: `https://console.cloud.google.com/`.
- **Pengaturan yang perlu dibuat**:
  1. Buat project baru dengan nama `PAHAMI-V2-OAuth`.
  2. Buka menu **APIs & Services** > **OAuth consent screen**:
     - User Type: Pilih **External**. Klik **Create**.
     - App Name: `PAHAMI V2 Contextual Learning`.
     - User support email: Email Google Anda.
     - Developer contact information: Email Anda.
     - Scopes: Tambahkan scopes `.../auth/userinfo.email` dan `.../auth/userinfo.profile`.
     - Test Users: Tambahkan email Anda dan akun tester tim.
     - Klik **Save and Continue**.
  3. Buka menu **APIs & Services** > **Credentials**:
     - Klik **Create Credentials** > **OAuth client ID**.
     - Application type: Pilih **Web application**.
     - Name: `PAHAMI Web Client`.
     - **Authorized JavaScript origins**:
       - `http://localhost:3000`
       - `https://<nama-project-vercel>.vercel.app`
     - **Authorized redirect URIs**:
       - `https://<project-ref>.supabase.co/auth/v1/callback` *(Paling penting: URL dari Supabase)*
       - `http://localhost:3000/auth/callback`
       - `https://<nama-project-vercel>.vercel.app/auth/callback`
     - Klik **Create**.
- **Nilai yang diperoleh**:
  - `Client ID` (contoh: `123456789-abcdef.apps.googleusercontent.com`)
  - `Client Secret` (contoh: `GOCSPX-xyz123456789`)
- **Di mana digunakan**: Dimasukkan ke Supabase Authentication Providers (Langkah D).
- **Peringatan Penting**: **JANGAN** membuat layanan Google Cloud Run atau Google Compute Engine. Google Cloud Console hanya digunakan untuk OAuth Client!

---

### F. Konfigurasi Redirect URL (Localhost, Vercel Preview, Production)
- **Tujuan**: Mencegah serangan open-redirect dan memastikan Supabase mengizinkan pengalihan kembali ke domain aplikasi setelah login Google berhasil.
- **Apa yang harus dibuka**: Supabase Dashboard > **Authentication** > **URL Configuration**.
- **Pengaturan yang perlu dibuat**:
  1. **Site URL**: Masukkan domain production atau local utama:
     - Development: `http://localhost:3000`
     - Production: `https://<nama-project-vercel>.vercel.app`
  2. **Redirect URLs** (Tambahkan satu per satu):
     - `http://localhost:3000/**`
     - `http://127.0.0.1:3000/**`
     - `https://<nama-project-vercel>.vercel.app/**`
     - `https://*-<team-slug>.vercel.app/**` *(Mendukung Vercel Preview deployments)*
  3. Klik **Save**.
- **Cara memverifikasi**: Saat login dari localhost atau preview Vercel, Supabase tidak menampilkan pesan `redirect_uri_mismatch`.

---

### G. Konfigurasi Supabase Auth Settings
- **Tujuan**: Mengoptimalkan autentikasi untuk sekolah dasar dengan mematikan registrasi email publik biasa dan hanya mengizinkan Google OAuth.
- **Apa yang harus dibuka**: Supabase Dashboard > **Authentication** > **Providers** > **Email**.
- **Pengaturan yang perlu dibuat**:
  1. Nonaktifkan **Enable Email provider** jika ingin mencegah login email/password manual biasa, atau biarkan hanya untuk akun internal darurat.
  2. Di tab **Authentication** > **Sessions**:
     - Set JWT Expiry: `3600` detik (1 jam) atau default.
- **Cara memverifikasi**: Di halaman `/login`, tombol "Masuk dengan Google" adalah satu-satunya metode login publik.

---

### H. Konfigurasi Google Gemini API Key
- **Tujuan**: Mendapatkan API Key resmi untuk Contextual AI Engine (ekstraksi variabel konteks, contextual rewriting soal, dan validasi pedagogis).
- **Apa yang harus dibuka**: Google AI Studio: `https://aistudio.google.com/app/apikey`.
- **Pengaturan yang perlu dibuat**:
  1. Klik **Create API Key**.
  2. Pilih project Google Cloud yang telah dibuat atau buat project baru.
  3. Salin API key yang dihasilkan.
- **Nilai yang diperoleh**: `GEMINI_API_KEY` (string berawalan `AIza...`).
- **Di mana digunakan**:
  - Di `.env.local` lokal: `GEMINI_API_KEY=AIzaSy...`
  - Di Vercel Project Settings > Environment Variables: `GEMINI_API_KEY` (Production & Preview, Server Only).
- **Cara memverifikasi**: Jalankan generator soal guru di `/teacher/questions/generator` dan pastikan soal ter-generate otomatis.

---

### I. Konfigurasi Local Knowledge Base (LKB)
- **Tujuan**: Menyiapkan data master 6 wilayah Karesidenan Madiun di database Supabase:
  - `35.77`: Kota Madiun
  - `35.19`: Kabupaten Madiun
  - `35.21`: Kabupaten Ngawi
  - `35.20`: Kabupaten Magetan
  - `35.02`: Kabupaten Ponorogo
  - `35.01`: Kabupaten Pacitan
- **Apa yang harus dibuka**: Supabase Dashboard > **Table Editor** > `lkb_regions`.
- **Cara memverifikasi**: 6 wilayah di atas dan 25 kecamatan turunan sudah terdaftar melalui migration `20260923140000_local_knowledge.sql`.

---

### J. Cara Mengimpor Dataset Wilayah Karesidenan Madiun
- **Tujuan**: Mengisi entitas lokal (komoditas, tradisi, lokasi geografis, dan profesi) beserta fakta terverifikasi dan embedding ke dalam Supabase.
- **Apa yang harus dibuka**: Supabase Dashboard > **SQL Editor** > **New Query**.
- **Pengaturan yang perlu dibuat**:
  1. Buka file seed SQL di repository: `supabase/seed/20260923150000_madiun_raya_seed.sql`.
  2. Salin seluruh isi SQL seed tersebut.
  3. Tempelkan ke SQL Editor Supabase dan klik **Run**.
- **Cara memverifikasi**:
  Jalankan query berikut di SQL Editor:
  ```sql
  SELECT count(*) FROM public.lkb_entities;
  SELECT count(*) FROM public.lkb_entity_facts;
  ```
  Pastikan jumlah entitas minimal 30 entitas terverifikasi mencakup 6 kabupaten/kota.

---

### K. Menjalankan Pipeline Python Offline (Jika Dataset Diperbarui)
- **Tujuan**: Mengolah naskah dataset baru, memvalidasi schema, dan meng-export SQL seed secara offline dari laptop pengembang (tanpa memerlukan server Python online).
- **Apa yang harus dibuka**: Terminal lokal di folder project.
- **Perintah yang dijalankan**:
  ```powershell
  # 1. Jalankan unit test validasi skema dataset
  uv run --project data-pipeline --with pytest pytest data-pipeline/tests

  # 2. Jalankan benchmark kuantitatif retrieval
  uv run --project data-pipeline python data-pipeline/src/pahami_data/cli.py --evaluate

  # 3. Export seed SQL jika ada data entitas baru yang ditambahkan
  uv run --project data-pipeline python data-pipeline/src/pahami_data/cli.py --export-seed supabase/seed/madiun_raya_seed_updated.sql
  ```
- **Cara memverifikasi**: Seluruh 11 test lulus, dan benchmark menghasilkan Recall@5 100% dan Region Leakage 0.0%.

---

### L. Memverifikasi Fungsi Retrieval Online
- **Tujuan**: Memastikan backend Next.js dapat memanggil fungsi RPC `lkb_retrieve_context` di Supabase tanpa server Python tambahan.
- **Apa yang harus dibuka**: Terminal lokal.
- **Perintah yang dijalankan**:
  ```powershell
  npm run test
  ```
- **Cara memverifikasi**: Test suite `tests/lkb-retrieval.test.ts` berhasil mengeksekusi tes isolasi region, fallback kecamatan ke kabupaten, dan penanganan status verified.

---

### M. Menghubungkan Repository ke Vercel
- **Tujuan**: Melakukan deployment otomatis aplikasi Next.js ke infrastruktur Vercel Serverless Edge & Node.js.
- **Apa yang harus dibuka**: Dashboard Vercel: `https://vercel.com/new`.
- **Pengaturan yang perlu dibuat**:
  1. Hubungkan akun GitHub Irham (`Irham-Najib-Azimul-Qowi`).
  2. Cari repository: `ContextLearningApp`. Klik **Import**.
  3. Konfigurasi Proyek:
     - Project Name: `pahami-v2`
     - Framework Preset: **Next.js**
     - Root Directory: `./` (Root repository)
     - Build Command: Biarkan default (`next build`)
     - Output Directory: Biarkan default (`.next`)
     - Install Command: Biarkan default (`npm install`)

---

### N. Konfigurasi Build & Environment Variables di Vercel
- **Tujuan**: Mendaftarkan credential Supabase dan Google Gemini secara aman di Vercel.
- **Apa yang harus dibuka**: Halaman konfigurasi proyek Vercel > Bagian **Environment Variables**.
- **Daftar Environment Variables yang WAJIB dimasukkan**:

| Nama Variabel | Target Lingkungan | Contoh Nilai |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview, Dev | `https://abcdefghijkl.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview, Dev | `eyJhbGciOi...` *(anon public key)* |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview, Dev | `eyJhbGciOi...` *(service role secret, server only)* |
| `NEXT_PUBLIC_APP_URL` | Production | `https://pahami-v2.vercel.app` |
| `GEMINI_API_KEY` | Production, Preview, Dev | `AIzaSy...` *(Google AI Studio key)* |
| `GEMINI_MODEL` | Production, Preview, Dev | `gemini-2.5-flash` |
| `ADMIN_ALLOWLIST` | Production, Preview, Dev | `irham@contextlearning.id` |

- **Peringatan Keamanan**: JANGAN memasukkan `SUPABASE_SERVICE_ROLE_KEY` atau `GEMINI_API_KEY` dengan awalan `NEXT_PUBLIC_`.

---

### O. Deployment Preview & Pengujian Staging
- **Tujuan**: Menguji aplikasi pada Vercel Preview URL sebelum rilis publik.
- **Pengaturan yang perlu dibuat**:
  1. Klik tombol **Deploy** di Vercel.
  2. Tunggu proses build selesai (~1-2 menit).
  3. Buka URL Preview yang dihasilkan Vercel (contoh: `https://pahami-v2-git-main-irham.vercel.app`).
- **Cara memverifikasi**: Halaman utama dapat dibuka, badge *Prototipe Tahap Pengembangan* muncul, dan tidak ada halaman 500 error.

---

### P. Deployment Production
- **Tujuan**: Menetapkan deployment utama sebagai versi Production resmi untuk Hackathon IT Comp 2026.
- **Apa yang harus dibuka**: Dashboard Vercel > **Deployments**.
- **Pengaturan yang perlu dibuat**:
  1. Klik deployment branch `main` yang sukses.
  2. Klik ikon menu tiga titik `...` > **Assign to Production Domain**.
  3. Masukkan Custom Domain jika tersedia, atau gunakan domain resmi Vercel (`pahami-v2.vercel.app`).
- **Cara memverifikasi**: Buka URL production dari browser di luar jaringan lokal (misal ponsel via paket data seluler).

---

### Q. Verifikasi & Smoke Test Pasca Deployment
Lakukan pemeriksaan cepat 5 menit pada URL Production:
1. **Beranda**: Buka `/` -> periksa rendering kartu wilayah Madiun Raya.
2. **Login**: Buka `/login` -> pastikan tombol "Masuk dengan Google" muncul dan tombol "Akses Cepat Pengujian Juri" tersedia.
3. **Workspace Guru**: Buka `/teacher/dashboard` -> periksa profil Ibu Siti Aminah, sekolah SD Negeri 1 Ponorogo, dan kartu metrik soal/materi/ujian.
4. **Portal Murid**: Buka `/student/dashboard` -> periksa materi pelajaran dan kartu ujian.
5. **Ujian Online**: Buka `/student/examinations` -> mulai sesi ujian `/student/examinations/exam-pnr-01/session` -> pilih jawaban -> kumpulkan -> pastikan skor otomatis terhitung (60/100 pada pilihan ganda).

---

### R. Setup Akun Pertama Guru dan Murid
- **Akun Guru**:
  1. Pengguna masuk melalui `/login` dengan Google Account.
  2. Sistem mengarahkan ke `/auth/onboarding`.
  3. Pilih kartu **Guru / Pendidik SD**.
  4. Isi Nama Lengkap (misal: `Bapak Irham Najib, S.Pd.`).
  5. Pilih Sekolah: `SD Negeri 1 Ponorogo`.
  6. Masukkan Kode Akses Pendidik: **`GURU-PAHAMI-2026`**.
  7. Klik **Selesaikan Pendaftaran & Masuk** -> Masuk ke Workspace Guru.
- **Akun Murid**:
  1. Siswa masuk melalui `/login` dengan Google Account.
  2. Pilih kartu **Murid / Siswa SD**.
  3. Isi Nama Siswa (misal: `Ahmad Pratama`).
  4. Masukkan Kode Kelas dari Guru: **`PNR-5A`** (atau `PNR-5B`).
  5. Klik **Selesaikan Pendaftaran & Masuk** -> Otomatis terdaftar di kelas dan langsung melihat materi serta ujian kelas tersebut.

---

### S. Pembuatan Sekolah dan Kelas Pertama
- **Membuat Kelas Baru (sebagai Guru)**:
  1. Masuk ke Workspace Guru > Menu **Kelas** (`/teacher/classes`).
  2. Klik **Buat Kelas Baru**.
  3. Masukkan Nama Kelas: `Kelas 5C (Matematika Kontekstual)`.
  4. Pilih Jenjang: `Kelas 5 SD`.
  5. Mata Pelajaran: `Matematika`.
  6. Sistem akan otomatis menghasilkan kode undangan unik (contoh: `PNR-5C`).
  7. Bagikan kode tersebut kepada siswa.

---

### T. Pengujian Alur Kontekstualisasi Soal Nyata
- **Tujuan**: Menguji Contextual AI Engine dari naskah mentah menjadi soal berkonteks Karesidenan Madiun.
- **Langkah Pengujian**:
  1. Buka Workspace Guru > **Bank Soal & AI** > **Generator Soal AI** (`/teacher/questions/generator`).
  2. Pilih Mata Pelajaran: `Matematika`.
  3. Kelas: `Kelas 5 SD`.
  4. Topik: `Aritmetika Sosial dan Perdagangan Komoditas`.
  5. Target Konteks: `Kabupaten Ponorogo` (atau `Kota Madiun`).
  6. Klik **Hasilkan Soal Kontekstual**.
  7. Verifikasi:
     - Soal matematika memuat variabel lokal (misal: *porang*, *susu sapi perah Pudak*, atau *brem Madiun*).
     - Angka perhitungan aritmetika tetap matematis dan konsisten ($20 \text{ kg} \times \text{Rp}12.000 = \text{Rp}240.000$).
     - Fakta geografis terbukti terverifikasi.
  8. Klik **Simpan ke Bank Soal**.

---

### U. Backup dan Pemulihan Database
- **Melakukan Backup**:
  1. Buka Supabase Dashboard > **Database** > **Backups**.
  2. Supabase otomatis melakukan backup harian (Daily Backup) pada paket Free Tier.
  3. Untuk backup manual seketika: Gunakan SQL Editor dan export schema melalui Supabase CLI:
     ```powershell
     npx supabase db dump -f pahami_backup_$(Get-Date -Format "yyyyMMdd").sql
     ```
- **Melakukan Pemulihan**:
  1. Buka SQL Editor di Supabase.
  2. Buka file backup `.sql`, salin isinya, dan klik **Run**.

---

### V. Prosedur Update Aplikasi & Dataset di Masa Depan
1. **Update Kode Aplikasi**:
   - Buat perubahan kode di lokal.
   - Jalankan `npm run test` dan `npm run build` untuk memastikan tidak ada regresi.
   - Push commit ke branch `main`: Vercel akan otomatis melakukan build dan deploy zero-downtime.
2. **Update Dataset Wilayah**:
   - Tambahkan entitas baru ke file `data-pipeline/datasets/samples/madiun_raya_seed.json`.
   - Jalankan validasi offline: `uv run --project data-pipeline python data-pipeline/src/pahami_data/cli.py --evaluate`.
   - Terapkan seed baru ke database Supabase melalui SQL Editor.

---

### W. Pemantauan Kuota Gratis (Supabase, Gemini, Vercel)
Untuk menjaga agar proyek tetap 100% gratis tanpa biaya tak terduga selama masa kompetisi Hackathon:
1. **Supabase Free Tier Limits**:
   - Database Storage: 500 MB (Data PAHAMI saat ini < 20 MB).
   - Egress Bandwidth: 5 GB per bulan.
   - Pantau di: Supabase Dashboard > **Organization Settings** > **Billing**.
2. **Google Gemini Free Tier Limits**:
   - Gemini 2.5 Flash: 15 Requests Per Minute (RPM), 1.500 Requests Per Day (RPD).
   - Contextual Engine PAHAMI dilengkapi caching variabel dan fallback manual sehingga tidak akan melebihi kuota.
   - Pantau di: Google AI Studio > **Dashboard** > **Usage**.
3. **Vercel Hobby Plan Limits**:
   - Fast Data Transfer: 100 GB per bulan.
   - Serverless Function Execution: 100 GB-hours per bulan.
   - Pantau di: Vercel Dashboard > **Usage**.
