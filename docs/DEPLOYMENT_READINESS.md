# CHECKLIST KESIAPAN DEPLOYMENT (DEPLOYMENT READINESS)
**PAHAMI V2 — Vercel & Supabase Production Readiness**

Dokumen ini memetakan status kesiapan setiap komponen aplikasi PAHAMI V2 menuju rilis produksi di Vercel dan Supabase.

### Kategori Status:
- **`READY`**: Fitur/komponen telah diimplementasikan, diintegrasikan, dan diverifikasi melalui build serta pengujian otomatis.
- **`NEEDS MANUAL CONFIGURATION`**: Kode siap, namun membutuhkan tindakan pendaftaran atau input credential di dashboard eksternal oleh pemilik proyek (Irham).
- **`BLOCKED`**: Implementasi terhalang oleh dependency eksternal yang belum tersedia.
- **`NOT IMPLEMENTED`**: Fitur belum dibuat.

---

## 1. Matriks Kesiapan Komponen

| Komponen & Modul | Status | Verifikasi yang Dilakukan | Dependency / Tindakan Manual yang Diperlukan |
| :--- | :---: | :--- | :--- |
| **Git Repository & Branch Merging** | `READY` | Seluruh branch (`feature/local-knowledge-rag`, `feature/pahami-core-web`, `feature/audit-local-knowledge-vercel`) digabungkan ke `integration/pahami-v2-final` tanpa konflik. | Merge ke `main` dan push ke remote GitHub `origin`. |
| **Next.js 16 Production Build** | `READY` | `npm run build` sukses mengompilasi 24 rute statis dan dinamis dengan Turbopack. | Siap di-deploy ke Vercel. |
| **TypeScript Type Checking** | `READY` | Tidak ada error type compilation (`tsc` clean). | Tidak ada tindakan lanjutan. |
| **Unit & Integration Test Suite** | `READY` | 27/27 test lulus pada Node.js test runner (`npm run test`). | Terus jalankan saat CI/CD. |
| **Python Pipeline & Benchmark** | `READY` | 11/11 pytest lulus; evaluasi 30 query mencapai Recall@5 100% dan Region Leakage 0.0%. | Pipeline offline siap digunakan sewaktu-waktu. |
| **Database Schema (LKB & Core)** | `READY` | Migrasi `20260923140000` dan `20260924000000` lengkap dengan RLS dan pgvector index. | Perlu dijalankan di SQL Editor Supabase target. |
| **Google OAuth Authentication** | `NEEDS MANUAL CONFIGURATION` | Komponen `/login`, `/auth/callback`, dan `/auth/onboarding` selesai diuji secara lokal & build. | Pemilik proyek perlu mendaftarkan OAuth Client ID di Google Cloud Console dan memasukkannya ke Supabase. |
| **Google Gemini AI Integration** | `NEEDS MANUAL CONFIGURATION` | SDK `@google/genai` terpasang; generator soal dan fallback manual diverifikasi. | Membutuhkan input `GEMINI_API_KEY` resmi di environment Vercel. |
| **Multi-School & RLS Isolation** | `READY` | Pengujian multi-tenant (`tests/multi-tenant.test.ts`) dan RLS policy membatasi akses antar sekolah dan antar murid. | Diterapkan otomatis saat migrasi SQL dijalankan di Supabase. |
| **Contextual AI Engine** | `READY` | Ekstraksi entitas, invariance check matematika, mapping Ponorogo/Madiun, dan integrasi retrieval adapter lulus uji. | Menggunakan structured/lexical mode sebagai default Vercel. |
| **Exam & Auto-Grading Engine** | `READY` | Uji deterministik pilihan ganda, auto-scoring, dan review esai oleh guru berjalan mulus (`tests/grading.test.ts`). | Kunci jawaban aman dari inspeksi murid. |
| **Vercel Cloud Deployment** | `NEEDS MANUAL CONFIGURATION` | Konfigurasi framework preset Next.js, root directory `./`, dan zero-dependency serverless terverifikasi. | Pemilik proyek perlu meng-import repository di Vercel dan mengisi Environment Variables. |
| **Zero Cloud Run / No Python Server** | `READY` | Arsitektur online 100% bebas dari server Python/FastAPI permanen atau Cloud Run. | Memenuhi batasan arsitektur target. |

---

## 2. Tindakan Manual Wajib Sebelum Peluncuran (Pre-Flight Actions)

Pemilik proyek harus menyelesaikan 5 langkah berikut sesuai panduan di [`docs/SETUP_MANUAL_IRHAM.md`](file:///x:/folder_website/contextlearning/docs/SETUP_MANUAL_IRHAM.md):

1. **Jalankan SQL Migration di Supabase**:
   - Eksekusi `supabase/migrations/20260923140000_local_knowledge.sql`.
   - Eksekusi `supabase/migrations/20260924000000_pahami_core_schema.sql`.
   - Eksekusi SQL Seed `supabase/seed/20260923150000_madiun_raya_seed.sql`.
2. **Daftarkan Google Cloud OAuth 2.0 Client**:
   - Buat Web Client di Google Cloud Console (tanpa mengaktifkan Cloud Run).
   - Masukkan callback Supabase: `https://<project-ref>.supabase.co/auth/v1/callback`.
3. **Aktifkan Google Provider di Supabase Auth**:
   - Masukkan Google Client ID dan Google Client Secret ke menu Authentication > Providers > Google di Supabase Dashboard.
4. **Dapatkan API Key Google Gemini**:
   - Dapatkan key dari Google AI Studio dan daftarkan sebagai `GEMINI_API_KEY`.
5. **Konfigurasi Environment Variables di Vercel**:
   - Hubungkan repository GitHub ke Vercel.
   - Daftarkan `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, dan `ADMIN_ALLOWLIST`.

---

## 3. Penilaian Risiko & Mitigasi

| Risiko Potensial | Dampak | Probabilitas | Rencana Mitigasi |
| :--- | :--- | :---: | :--- |
| **Kuota Gemini API Habis saat Demo Juri** | Fitur generate otomatis terhenti | Rendah | Aplikasi dilengkapi fallback manual: Guru tetap dapat membuat/mengedit soal secara mandiri serta memakai bank soal yang sudah tersedia. |
| **Mismatch Redirect URI saat Login Google** | Login Google gagal di Vercel Preview | Sedang | URL redirect di Supabase dikonfigurasi dengan wildcard (`https://*-<team-slug>.vercel.app/**`) sesuai panduan setup. |
| **Juri Mengakses Tanpa Akun Google** | Evaluasi terhambat jika juri tidak login | Rendah | Halaman login `/login` menyediakan tombol "Akses Cepat Pengujian Juri / Evaluator" untuk langsung menjelajah sebagai Guru atau Murid. |
