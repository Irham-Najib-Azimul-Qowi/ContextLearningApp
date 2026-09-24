# Pahami V2 — AI-Powered Contextual Learning Platform
**Versi Integrasi Final (Production-Ready) — Hackathon IT Comp 2026**

> **Platform Pembelajaran Kontekstual Berbasis AI & Karakteristik Wilayah Lokal untuk Siswa Sekolah Dasar (SD)**  
> *Fokus Wilayah: Karesidenan Madiun (Kota Madiun, Kab. Madiun, Kab. Ngawi, Kab. Magetan, Kab. Ponorogo, Kab. Pacitan)*

---

## 1. Tentang PAHAMI V2
**PAHAMI V2** menyatukan inovasi **Local Knowledge Base RAG** (Anggota 1) dan **Contextual AI Engine Next.js** (Anggota 2) menjadi satu platform web terintegrasi penuh. Sistem ini mentransformasi soal teks standar kurikulum nasional menjadi soal yang kaya dengan konteks lokal wilayah siswa (bentang alam, komoditas unggulan, kesenian daerah, sejarah, dan profesi lokal) dengan tetap menjaga integritas perhitungan matematika, fakta pedagogis, dan capaian pembelajaran SD.

### Arsitektur Deployment Utama
- **Frontend & Backend**: Next.js 16.3.5 (React 19, Turbopack, App Router) di **Vercel Serverless Edge & Node.js**.
- **Database & Vector Search**: Managed PostgreSQL dengan ekstensi `pgvector` di **Supabase**.
- **Autentikasi**: Supabase Auth + **Google OAuth 2.0** ("Masuk dengan Google" sebagai metode login publik tunggal).
- **AI Engine**: Google Gemini 2.5 Flash API via `@google/genai`.
- **Zero Cloud Run / No Permanent Python Server**: Seluruh fitur online berjalan tanpa membutuhkan VM atau server Python aktif. Pipeline data Python dijalankan secara offline di laptop pengembang untuk pemeliharaan dataset.

---

## 2. Struktur Repositori Terintegrasi

```text
ContextLearningApp/
├── app/                  # Next.js 16 App Router (Portal Siswa, Workspace Guru, Login, Onboarding)
│   ├── (auth)/ & auth/   # Google OAuth SSR Callback & Onboarding
│   ├── login/            # Halaman Masuk Tunggal dengan Google OAuth
│   ├── student/          # Portal Belajar Siswa (Materi Bacaan Lokal & Pengerjaan Ujian SD)
│   └── teacher/          # Workspace Guru (Bank Soal, Generator AI, Kelas, Penilaian Esai)
├── components/           # Komponen UI Reusable & Bar Navigasi Global
├── data-pipeline/        # Pipeline Python Offline Anggota 1 (Ingestion, Normalizer, Benchmark CLI)
├── docs/                 # Dokumentasi Teknis Lengkap Bahasa Indonesia
│   ├── SETUP_MANUAL_IRHAM.md    # [PENTING] Panduan Setup Google Cloud, Supabase & Vercel
│   ├── FINAL_ARCHITECTURE.md    # Arsitektur Final & Diagram Mermaid
│   ├── BRANCH_MERGE_REPORT.md   # Laporan Penggabungan Git Branch
│   ├── DEPLOYMENT_READINESS.md  # Checklist Kesiapan Deployment
│   ├── TEST_REPORT.md           # Laporan Pengujian Nyata (Python & Node.js)
│   └── PROJECT_HANDOVER.md      # Panduan Serah Terima Pemeliharaan Proyek
├── lib/                  # Contextual AI Engine, Universal Supabase Client, & Database Repository
├── supabase/
│   ├── migrations/       # Migrasi LKB pgvector (20260923) & Core LMS Multi-Tenant RLS (20260924)
│   └── seed/             # Dataset Entitas Terverifikasi Karesidenan Madiun
└── tests/                # Test Suite Otomatis (27 Unit/Integration Tests Node.js)
```

---

## 3. Cakupan Wilayah Karesidenan Madiun
1. `35.77` — **Kota Madiun** (Pusat industri kereta api PT INKA, kuliner pecel, kearifan lokal)
2. `35.19` — **Kabupaten Madiun** (Komoditas pertanian, tanaman porang, sentra Caruban)
3. `35.21` — **Kabupaten Ngawi** (Bentang alam Bengawan Solo/Madiun, situs purbakala Trinil, kerajinan kayu jati)
4. `35.20` — **Kabupaten Magetan** (Kaki Gunung Lawu, Telaga Sarangan, sentra kerajinan kulit)
5. `35.02` — **Kabupaten Ponorogo** (Seni budaya Reog, kearifan lokal Telaga Ngebel, komoditas sapi perah Pudak)
6. `35.01` — **Kabupaten Pacitan** (Bentang alam pesisir selatan, gua karst, geodiversitas)

---

## 4. Cara Menjalankan Aplikasi Secara Lokal

### Prasyarat
- Node.js versi 20 atau lebih baru (direkomendasikan v22/v24)
- Python 3.11 dengan `uv` (khusus data pipeline offline)

### Menjalankan Web Application:
```bash
# 1. Install dependencies
npm install

# 2. Siapkan environment file
cp .env.example .env.local

# 3. Jalankan unit test aplikasi web
npm run test

# 4. Jalankan development server
npm run dev
```
Buka browser pada alamat `http://localhost:3000`.

### Menjalankan Pengujian Pipeline Data Python (Offline):
```bash
# 1. Jalankan unit test Python
uv run --project data-pipeline --with pytest pytest data-pipeline/tests

# 2. Jalankan benchmark kuantitatif 30 query LKB
uv run --project data-pipeline python data-pipeline/src/pahami_data/cli.py --evaluate
```

---

## 5. Ringkasan Hasil Pengujian

- **Unit & Integration Test Web (Node.js)**: 27/27 test lulus (`npm run test`).
- **Data Pipeline Test (Python)**: 11/11 test lulus (`pytest`).
- **Benchmark Evaluasi LKB (30 Query)**: Recall@5: 100.0%, Precision@5: 96.2%, Region Leakage: 0.0%, Latensi: 0.04 ms.
- **Production Build (Next.js 16 Turbopack)**: Sukses mengompilasi 24 rute statis & dinamis (`npm run build`).

---

## 6. Dokumentasi Wajib untuk Pemilik Proyek
Silakan baca panduan lengkap pada folder `docs/`:
- 📘 **[Panduan Setup Manual Pemilik Proyek (Irham)](./docs/SETUP_MANUAL_IRHAM.md)** — Langkah demi langkah konfigurasi Supabase, Google Cloud Console OAuth 2.0 (tanpa Cloud Run), Gemini API, dan Vercel.
- 📐 **[Spesifikasi Arsitektur Final](./docs/FINAL_ARCHITECTURE.md)** — Diagram arsitektur teknis sistem dan batas serverless.
- 📋 **[Checklist Kesiapan Deployment](./docs/DEPLOYMENT_READINESS.md)** — Matriks kesiapan komponen dan pra-penerbangan.
- 🧪 **[Laporan Hasil Pengujian](./docs/TEST_REPORT.md)** — Rincian hasil eksekusi pengujian nyata dan bug yang telah diselesaikan.
- 🤝 **[Dokumen Serah Terima Proyek](./docs/PROJECT_HANDOVER.md)** — Panduan pemeliharaan untuk anggota tim berikutnya.
