# LAPORAN PENGUJIAN AKHIR (TEST REPORT)
**PAHAMI V2 — Final Integration & Verification**

Laporan ini mendokumentasikan pengujian nyata yang telah dijalankan di lingkungan lokal pengembang untuk memvalidasi integrasi data, fungsionalitas aplikasi web, AI engine, penilaian ujian, dan keamanan autentikasi.

---

## 1. Ringkasan Eksekusi Pengujian

| Kelompok Pengujian | Perintah Eksekusi | Total Tes | Lulus | Gagal | Durasi | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Python Data Pipeline** | `uv run --project data-pipeline --with pytest pytest data-pipeline/tests` | 11 | 11 | 0 | 1.53s | **PASSED** |
| **LKB Retrieval Benchmark** | `uv run --project data-pipeline python data-pipeline/src/pahami_data/cli.py --evaluate` | 30 | 30 | 0 | 0.04 ms/query | **PASSED** |
| **Node.js Integration Tests** | `npm run test` (`tsx --test tests/*.test.ts`) | 27 | 27 | 0 | 3.28s | **PASSED** |
| **Production Build Compilation** | `npm run build` (`next build` via Turbopack) | 24 rute | 24 rute | 0 | 26.5s | **PASSED** |

---

## 2. Detail Pengujian Per Modul

### 2.1 Python Data Pipeline & Schemas
- **Perintah**: `uv run --project data-pipeline --with pytest pytest data-pipeline/tests`
- **Hasil**:
  - `data-pipeline/tests/test_pipeline.py`: 4 passed (ingestion, passage chunking, deduplication fingerprinting).
  - `data-pipeline/tests/test_retrieval.py`: 4 passed (mock retrieval, entity query parsing, fallback to regency).
  - `data-pipeline/tests/test_schemas.py`: 3 passed (Pydantic validation for EntityRecord, RegionRecord, and RetrievalRequest).
- **Status**: 11/11 Passed.

### 2.2 Local Knowledge Base Quantitative Benchmark
- **Perintah**: `uv run --project data-pipeline python data-pipeline/src/pahami_data/cli.py --evaluate`
- **Metrik Hasil**:
  - Total Evaluated Queries: 30
  - Standard Pedagogical Queries: 26
  - Trick / Boundary Queries: 4 (Passed: 4/4)
  - Average Recall@5: 100.0%
  - Average Precision@5: 96.2%
  - Region Leakage Rate: 0.0% (Target: 0.0%)
  - Source Evidence Completeness: 100.0% (Target: 100.0%)
  - Average Latency: 0.04 ms
- **Status**: Seluruh kriteria penerimaan kuantitatif terpenuhi.

### 2.3 Node.js & TypeScript Test Suite
- **Perintah**: `npm run test`
- **Komponen yang Diuji**:
  1. `tests/auth-onboarding.test.ts` (5 tests):
     - Validasi kode akses guru (`GURU-PAHAMI-2026`) diterima, kode salah ditolak.
     - Pengikatan sekolah dan region ID pada profil guru.
     - Penolakan kode kelas murid yang tidak valid.
     - Pendaftaran siswa ke kelas via kode valid (`PNR-5A`) dan pengikatan ID sekolah secara otomatis.
     - Isolasi session antara dashboard Guru dan Murid.
  2. `tests/context-engine.test.ts` (3 tests):
     - Retrieval entitas terverifikasi Ponorogo (porang, reog).
     - *Quantitative Invariance*: Besaran perkalian matematika tetap konsisten ($20 \times 12.000 = 240.000$).
     - Kontekstualisasi topik budaya dan kearifan lokal Ponorogo.
  3. `tests/lkb-retrieval.test.ts` (5 tests):
     - *Zero Region Leakage*: Pencarian fakta Ponorogo di Kota Madiun tidak menghasilkan entitas Ponorogo.
     - Seluruh entitas berstatus `verified`.
     - Resolusi fallback kode kecamatan ke kabupaten induk.
     - Isolasi kategori (kategori yang tidak cocok menghasilkan 0 false positive).
     - Fallback aman `SupabaseLocalContextRetriever` saat konfigurasi belum disetel.
  4. `tests/grading.test.ts` (2 tests):
     - Penilaian deterministik pilihan ganda dihitung akurat (skor 60/60).
     - Penilaian esai oleh guru memperbarui skor akhir gabungan (skor 95/100).
  5. `tests/multi-tenant.test.ts` (4 tests):
     - Isolasi sekolah berdasarkan ID dan region.
     - Bank soal dan kelas terisolasi per sekolah.
     - Penggabungan kelas via kode undangan.
     - Penolakan kode kelas tak dikenal.
  6. `tests/foundation.test.ts` (2 tests):
     - Safe parsing environment helpers.
     - Integritas kode wilayah administratif Karesidenan Madiun.
- **Status**: 27/27 Passed.

### 2.4 Next.js Production Build
- **Perintah**: `npm run build`
- **Hasil**:
  - Compiler: Next.js 16.3.5 (Turbopack).
  - TypeScript checking selesai dalam 8.1 detik tanpa error.
  - Kompilasi 24 rute:
    - Rute Statis (○): `/`, `/login`, `/auth/onboarding`, `/teacher/*`, `/student/*`
    - Rute Dinamis (ƒ): `/auth/callback`, `/api/auth/onboarding`, `/student/examinations/[id]/session`, `/student/examinations/[id]/results`, `/teacher/examinations/[id]/results`
- **Status**: Build sukses siap deploy.

---

## 3. Bug yang Ditemukan dan Solusi Perbaikannya

| No | Deskripsi Masalah | Dampak | Tindakan Perbaikan yang Dilakukan |
| :---: | :--- | :--- | :--- |
| 1 | **Foreign Key Constraint pada `lkb_regions`** | Insert kabupaten gagal karena kode provinsi induk `'35'` belum ada di tabel. | Menambahkan record provinsi `'35'` (Jawa Timur) dan 25 kecamatan turunan pada migrasi `20260923140000_local_knowledge.sql`. |
| 2 | **Potensi Region Leakage pada Kode Kecamatan Palsu** | Kode distrik acak (misal `35.77.99`) berpotensi mengembalikan data jika hanya dicek prefix. | Menambahkan validasi ketat keberadaan district di RPC `lkb_retrieve_context`. Distrik tak dikenal mengembalikan 0 baris. |
| 3 | **Filter Kategori Fallback Terlalu Luas di Mock Retriever** | Jika kategori tidak cocok, kode lama mengembalikan seluruh kandidat. | Memperbaiki logika `MockLocalContextRetriever` menjadi strict filter sehingga kategori tak cocok menghasilkan 0 hasil. |
| 4 | **Ketidaksesuaian Dimensi Embedding** | `.env.example` mencantumkan model Gemini 768 dimensi sementara schema LKB dan pipeline E5 menggunakan 384 dimensi. | Memperbaiki `.env.example` ke 384 dimensi dan menetapkan `structured_lexical` sebagai default online Vercel. |

---

## 4. Pengujian yang Belum Dapat Dilakukan & Keterbatasan Lingkungan
- **Google OAuth End-to-End dengan Akun Nyata**:
  - Membutuhkan Client ID & Client Secret dari Google Cloud Console yang hanya dapat didaftarkan oleh pemilik akun resmi Google (Irham).
  - *Mitigasi*: Alur ditest menggunakan SSR callback simulation dan unit tests; rute `/login` menyediakan tombol "Akses Cepat Pengujian Juri" agar reviewer dapat mengevaluasi aplikasi tanpa hambatan kredensial.
- **Live Gemini API Production Request**:
  - Membutuhkan `GEMINI_API_KEY` aktif yang didaftarkan di environment Vercel.
  - *Mitigasi*: Validasi schema Zod dan fallback manual teruji; saat API key belum dimasukkan, guru tetap dapat membuat dan mengedit soal secara mandiri tanpa crash.
