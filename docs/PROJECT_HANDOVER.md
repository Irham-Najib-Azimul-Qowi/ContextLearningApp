# DOKUMEN SERAH TERIMA PROYEK (PROJECT HANDOVER)
**PAHAMI V2 — Final Integration & Architecture Handover**

Dokumen ini disusun untuk memudahkan anggota tim (Anggota 1, Anggota 2, dan kontributor berikutnya) dalam melanjutkan pemeliharaan, pengembangan fitur, serta operasional sistem PAHAMI V2 setelah integrasi final.

---

## 1. Struktur Repository Final

```text
pahami-v2/
├── app/                               # Next.js 16 App Router (Frontend & Route Handlers)
│   ├── api/
│   │   └── auth/onboarding/           # Backend Onboarding Endpoint (Validasi Role Guru & Siswa)
│   ├── auth/
│   │   ├── callback/                  # Google OAuth SSR Callback (Penukaran Auth Code ke Session)
│   │   └── onboarding/                # Halaman Pilihan Role & Verifikasi Identitas
│   ├── login/                         # Portal Masuk Tunggal ("Masuk dengan Google" + Akses Juri)
│   ├── student/                       # Portal Siswa SD (Kelas, Materi Lokal, Ujian, Hasil Nilai)
│   │   ├── classes/
│   │   ├── dashboard/
│   │   ├── examinations/
│   │   │   └── [id]/session/          # Antarmuka Pengerjaan Ujian Online Ramah Anak
│   │   └── materials/
│   ├── teacher/                       # Workspace Guru (Bank Soal, Generator AI, Kelas, Evaluasi)
│   │   ├── classes/
│   │   ├── dashboard/
│   │   ├── examinations/
│   │   │   └── review-essay/          # Antarmuka Penilaian Esai Guru
│   │   ├── materials/
│   │   └── questions/
│   │       ├── context-preview/       # Studio Kontekstualisasi Soal
│   │       ├── generator/             # Generator Soal AI (Gemini 2.5 Flash)
│   │       ├── manual/
│   │       └── scan/
│   ├── globals.css                    # TailwindCSS v4 Styling
│   ├── layout.tsx                     # Root Layout dengan Font Inter & Sans-Serif
│   └── page.tsx                       # Landing Page Resmi Prototipe Madiun Raya
├── components/                        # Komponen UI Reusable
│   ├── layout/global-controls.tsx     # Bar Navigasi Kontrol Atas (Ganti Sekolah, Notif, Profil)
│   └── ui/                            # Card, Badge, Modal, Input Elements
├── data-pipeline/                     # Modul Ingestion & RAG Offline (Pekerjaan Anggota 1)
│   ├── datasets/samples/              # Naskah Dataset & 30 Benchmark Queries JSON
│   ├── src/pahami_data/
│   │   ├── cli.py                     # CLI Tool: --evaluate, --export-seed, --report
│   │   ├── evaluation/                # Benchmark Runner (Recall, Precision, Leakage)
│   │   ├── processing/                # Normalizer & Passage Chunker
│   │   ├── schemas/                   # Pydantic Models (Entity, Region, Request)
│   │   ├── sources/                   # Registry Sumber Data Pemda/BPS
│   │   └── storage/                   # Database Store & SQL Seed Generator
│   ├── tests/                         # Pytest Suite Pipeline (11 Tests)
│   └── pyproject.toml                 # Konfigurasi Python Virtual Environment (uv)
├── docs/                              # Dokumentasi Teknis & Panduan
│   ├── SETUP_MANUAL_IRHAM.md          # PANDUAN UTAMA: Setup Supabase, OAuth & Vercel
│   ├── FINAL_ARCHITECTURE.md          # Arsitektur Lengkap & Diagram Mermaid
│   ├── BRANCH_MERGE_REPORT.md         # Laporan Riwayat Merge & Resolusi Cabang
│   ├── DEPLOYMENT_READINESS.md        # Checklist Kesiapan Deployment
│   ├── TEST_REPORT.md                 # Hasil Pengujian Nyata & Bukti Uji
│   └── PROJECT_HANDOVER.md            # Dokumen Serah Terima Ini
├── lib/                               # Core Logic & Application Services
│   ├── context-engine/                # Contextual AI Engine (Rewriting, Invariance, Retrieval)
│   ├── db/                            # Repository Service & TypeScript Types
│   └── supabase/                      # Universal Supabase Client (@supabase/ssr)
├── supabase/                          # Database PostgreSQL & Migrations
│   ├── migrations/
│   │   ├── 20260923140000_local_knowledge.sql # Skema LKB + pgvector + RPC Function
│   │   └── 20260924000000_pahami_core_schema.sql  # Skema Multi-School, RLS, Ujian, Soal
│   └── seed/
│       └── 20260923150000_madiun_raya_seed.sql    # Dataset Entitas Terverifikasi Madiun Raya
├── tests/                             # Node.js Test Suite (27 Tests)
├── .env.example                       # Contoh Konfigurasi Environment Aman
├── package.json                       # Dependencies & Scripts
└── README.md                          # Dokumentasi Utama Repository
```

---

## 2. Modul Penting & Fungsinya

1. **Contextual AI Engine (`lib/context-engine/`)**:
   - Membaca soal mentah, mengekstrak variabel umum, memanggil retrieval adapter untuk mencari konteks lokal Karesidenan Madiun yang sesuai, dan menulis ulang soal tanpa merusak esensi logika atau angka aritmetika.
2. **Local Knowledge Base Retrieval Adapter (`lib/context-engine/retrieval-adapter.ts`)**:
   - Menghubungkan Contextual Engine ke Supabase RPC `lkb_retrieve_context`.
   - Mengimplementasikan isolasi wilayah yang ketat (*Zero Region Leakage*).
3. **Sistem Autentikasi Google (`app/login/`, `app/auth/`)**:
   - Menggunakan Supabase Auth + Google OAuth.
   - Mengarahkan guru ke verifikasi kode akses sekolah (`GURU-PAHAMI-2026`) dan murid ke verifikasi kode kelas (`PNR-5A`).
4. **Modul Ujian & Auto-Grading (`app/student/examinations/`, `app/teacher/examinations/`)**:
   - Menjamin keamanan kunci jawaban (tidak pernah dikirim ke browser siswa sebelum ujian dipublikasikan).
   - Penilaian otomatis pilihan ganda dan antarmuka koreksi esai guru.
5. **Multi-Tenant School Isolation**:
   - Memungkinkan banyak sekolah menggunakan satu platform PAHAMI tanpa risiko pencampuran data bank soal, siswa, maupun ujian.

---

## 3. Cara Menjalankan Aplikasi Secara Lokal

### Menjalankan Web Application (Next.js):
```powershell
# 1. Install dependencies
npm install

# 2. Siapkan file konfigurasi lokal
Copy-Item .env.example .env.local

# 3. Jalankan unit test
npm run test

# 4. Jalankan dev server
npm run dev
# Buka http://localhost:3000 di browser
```

### Menjalankan Pipeline Data Python (Offline):
```powershell
# Jalankan test suite Python
uv run --project data-pipeline --with pytest pytest data-pipeline/tests

# Jalankan benchmark kuantitatif retrieval
uv run --project data-pipeline python data-pipeline/src/pahami_data/cli.py --evaluate
```

---

## 4. Cara Memperbarui Dataset Wilayah
Jika ingin menambahkan data komoditas, lokasi, atau tradisi baru untuk kabupaten lain:
1. Buka file `data-pipeline/datasets/samples/madiun_raya_seed.json`.
2. Tambahkan entitas baru dengan format yang sesuai skema `EntityRecord`.
3. Verifikasi validitas skema dengan menjalankan `uv run --project data-pipeline --with pytest pytest data-pipeline/tests`.
4. Hasilkan seed SQL baru:
   ```powershell
   uv run --project data-pipeline python data-pipeline/src/pahami_data/cli.py --export-seed supabase/seed/update_seed.sql
   ```
5. Terapkan file seed tersebut ke database Supabase melalui SQL Editor.

---

## 5. Cara Memperbarui Skema Database
1. **JANGAN PERNAH** mengedit migration lama yang sudah pernah dieksekusi di database production bersama.
2. Buat migration baru dengan format tanggal: `supabase/migrations/YYYYMMDDHHMMSS_nama_perubahan.sql`.
3. Tulis DDL yang menyertakan klausa `IF NOT EXISTS` dan `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`.
4. Jalankan migration baru tersebut di SQL Editor Supabase.

---

## 6. Tips Mengatasi Masalah Umum (Troubleshooting)

1. **Error `redirect_uri_mismatch` saat Login Google**:
   - *Penyebab*: URL callback Vercel atau localhost belum didaftarkan di Supabase URL Configuration atau Google Cloud Console.
   - *Solusi*: Ikuti panduan di [docs/SETUP_MANUAL_IRHAM.md](file:///x:/folder_website/contextlearning/docs/SETUP_MANUAL_IRHAM.md) Bagian E dan F.
2. **Kuota Gemini API Habis**:
   - *Penyebab*: Request melebihi 15 RPM pada paket gratis.
   - *Solusi*: Guru dapat beralih ke pembuatan soal manual atau memilih soal yang sudah ada di Bank Soal. Contextual Engine juga memiliki cache lokal.
3. **Error Vector Extension di Supabase**:
   - *Penyebab*: Ekstensi `vector` belum diaktifkan di project Supabase baru.
   - *Solusi*: Buka Supabase Dashboard > Database > Extensions > Cari `vector` > Aktifkan (Toggle ON).
