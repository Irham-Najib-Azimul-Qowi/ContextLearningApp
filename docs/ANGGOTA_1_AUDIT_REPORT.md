# LAPORAN AUDIT, VALIDASI, DAN PENYESUAIAN HASIL PEKERJAAN ANGGOTA 1
**Proyek:** PAHAMI V2 (AI-Powered Contextual Learning)  
**Peran Auditor:** Senior Full-Stack Engineer, Data Engineer, RAG Engineer, Software Architect & Security Engineer  
**Pihak Pengembang Diperiksa:** Anggota 1 (Data Pipeline, Local Knowledge Base & RAG Engineer)  
**Target Runtime:** Vercel (Next.js) + Supabase (PostgreSQL + pgvector) + Google Gemini API (Zero-Cloud Run / Zero Python Server Online)  
**Tanggal Audit:** 24 September 2026  
**Status Integrasi:** `TERVERIFIKASI & SIAP DEPLOYMENT VERCEL (PRODUCTION READY)`

---

## 1. KONDISI AWAL REPOSITORY & BRANCH

### 1.1 Status Cabang Git (Branch Audit)
- **Branch Awal Anggota 1:** Terdapat diskrepansi penamaan remote branch pada repository GitHub:
  - Local tracking branch `feature/local-knowledge-rag` awalnya tertinggal pada base commit `b44a480`.
  - Remote branch yang memuat commit implementasi aktual Anggota 1 bernama `origin/local-knowledge-RAG` (dengan huruf kapital `RAG`), memuat 5 commit:
    1. `5371428` *feat(rag): add local context retrieval contract and Supabase pgvector migration*
    2. `9fa351e` *feat(data-pipeline): implement Pydantic schemas, source registry, and embedding wrapper*
    3. `7487c33` *feat(evaluation): add Madiun Raya seed dataset, 30 benchmark queries, and test suite*
    4. `58624a1` *chore(supabase): initialize Supabase configuration and pin CLI dependency*
    5. `3a6626b` *chore(ide): configure python extraPaths in .vscode/settings.json and update .gitignore*
- **Tindakan Auditor Sesuai Prosedur:**
  - Branch lokal disinkronkan secara *fast-forward* ke commit `3a6626b`.
  - Dibuat branch audit terisolasi: `feature/audit-local-knowledge-vercel` langsung dari commit `3a6626b`.
  - Pekerjaan Anggota 2 (`feature/pahami-core-web`, commit `23070fd`) diintegrasikan secara bersih tanpa menimpa kode asli (*clean merge with zero git conflicts*).

---

## 2. FITUR YANG SUDAH TERSEDIA (SESUAI SPESIFIKASI)

1. **Local Knowledge Base Schema:**
   - 7 tabel relasional lengkap di PostgreSQL Supabase: `lkb_regions`, `lkb_sources`, `lkb_entities`, `lkb_entity_evidence`, `lkb_entity_relations`, `lkb_passages`, `lkb_ingestion_runs`.
   - Ekstensi `uuid-ossp` dan `vector` (pgvector 384-dimensi untuk E5-small).
   - Indeks performa (B-tree, GIN full-text search, HNSW vector cosine distance).
2. **Offline Data Pipeline (Python):**
   - Struktur folder modular: `schemas/`, `sources/`, `processing/`, `embedding/`, `storage/`, `retrieval/`, `evaluation/`.
   - Pydantic models v2 (`models.py`) memvalidasi format entitas, bukti (*evidence*), batasan angka (*quantitative constraints*), dan region ID resmi Kemendagri.
   - Registry sumber resmi (`registry.py`) dengan 10 publisher valid (BPS, Pemkot/Pemkab, Kemdikbud, OSM).
   - Wrapper model embedding `intfloat/multilingual-e5-small` dengan prefix wajib `passage: ` dan `query: ` serta normalisasi L2 unit vector.
   - CLI Tool (`cli.py`) dengan flag `--dry-run`, `--region`, `--source`, `--report`, `--evaluate`, dan `--export-seed`.
3. **Dataset Terverifikasi Karesidenan Madiun:**
   - 15 entitas faktual terverifikasi 100% dari 6 wilayah (Kota Madiun, Kab Madiun, Kab Ngawi, Kab Magetan, Kab Ponorogo, Kab Pacitan).
   - Seluruh entitas dilengkapi bukti audit (*provenance URL*, nama reviewer, kutipan fakta resmi).
4. **Evaluasi Benchmark Kuantitatif:**
   - 30 kueri evaluasi ditinjau manusia (`evaluation_30_queries.json`), mencakup 26 kueri standar pedagogis SD dan 4 kasus uji menipu (*trick/boundary cases*).

---

## 3. TEMUAN KETIDAKSESUAIAN & BUG (AUDIT DEFECTS)

Sebelum audit, ditemukan beberapa kelemahan kritis yang telah diperbaiki:

### Bug 1: Foreign Key Violation pada `lkb_regions`
- **Gejala:** Seluruh 6 kabupaten/kota pada `seed_madiun_raya.sql` memiliki `parent_id = '35'` (Provinsi Jawa Timur). Namun kode `'35'` belum dimasukkan ke dalam `lkb_regions`.
- **Dampak:** Eksekusi migrasi pada database Supabase baru akan gagal dengan *Postgres Foreign Key Constraint Violation*.
- **Solusi:** Menambahkan entitas root `'35'` (Provinsi Jawa Timur, level `'province'`, `parent_id = NULL`) sebelum kabupaten/kota, serta mendaftarkan 25 kecamatan resmi ke dalam `lkb_regions`.

### Bug 2: Fallback Kecamatan Fiktif pada Stored Procedure SQL (`eval_30`)
- **Gejala:** Pada `lkb_retrieve_context` SQL sebelumnya, kode kecamatan hanya diperiksa melalui regex `^35\.\d{2}\.\d{2}$`. Jika pengguna menginput kecamatan fiktif seperti `35.77.99`, regex tetap cocok dan mengambil substring `35.77` sehingga data Kota Madiun bocor ke kecamatan palsu.
- **Dampak:** Kegagalan pada kasus evaluasi `eval_30` (*anti-hallucination boundary test*).
- **Solusi:** Memperbarui SQL RPC untuk memverifikasi keberadaan kode kecamatan secara ketat di tabel `lkb_regions`. Kecamatan yang tidak terdaftar langsung ditolak dengan `results: []`, `region_fallback_level: 'none'`, dan pesan peringatan.

### Bug 3: Incomplete Vector Cosine Distance pada SQL Semantic Mode
- **Gejala:** Parameter `p_query_embedding vector(384)` sudah ada pada signature RPC `lkb_retrieve_context`, namun blok SQL-nya belum mengeksekusi operator jarak vektor `<=>` pada tabel `lkb_passages`, melainkan hanya menjalankan query teks biasa.
- **Dampak:** Silent fallback tanpa perhitungan vektor sesungguhnya jika vektor embedding dikirimkan.
- **Solusi:** Mengimplementasikan CTE `scored_passages` dengan operator `(1 - (p.embedding <=> p_query_embedding))` dan join ke `lkb_entities`, serta memberikan peringatan transparan jika mode semantik diminta tanpa vektor query.

### Bug 4: Ketidakcocokan Format Output dengan Kebutuhan Anggota 2
- **Gejala:** `lkb_retrieve_context` sebelumnya mengembalikan format entitas tanpa field `region_name`, `description`, dan `source_url` langsung di tingkat root entitas (hanya ada di sub-array evidence), serta case-sensitive pada parameter kategori dan mata pelajaran.
- **Dampak:** `ContextualAIEngine` milik Anggota 2 mengharapkan atribut tersebut untuk inferensi template Gemini dan validasi UI.
- **Solusi:** Menggabungkan tabel `lkb_regions` untuk menyertakan `region_name`, menambahkan alias `description` dan `source_url`, serta membuat query SQL case-insensitive dan toleran terhadap alias kategori (`commodity`, `tradition`, `location`, `occupation`).

### Bug 5: Inkonsistensi Dokumentasi `.env.example`
- **Gejala:** Root `.env.example` mencatat `EMBEDDING_MODEL_NAME=gemini-text-embedding-004` dan `EMBEDDING_DIMENSION=768`, padahal schema pgvector dan data pipeline Anggota 1 menggunakan `intfloat/multilingual-e5-small` (384 dimensi).
- **Dampak:** Kebingungan konfigurasi yang dapat menyebabkan error ketidakcocokan dimensi pada pgvector.
- **Solusi:** Memperbarui `.env.example` untuk mencantumkan model E5-small (384-dimensi) untuk pipeline offline dan menegaskan mode retrieval online Vercel berbasis structured lexical.

---

## 4. PERBAIKAN ARSITEKTUR RUNTIME VERCEL

| Komponen | Arsitektur Lama / Eksperimental | Arsitektur Final Pahami V2 | Alasan & Manfaat |
|---|---|---|---|
| **Online Retrieval Runtime** | Kebutuhan FastAPI Python / Potensi Cloud Run | **Next.js Serverless + Supabase RPC** | Menghapus biaya Cloud Run, zero server maintenance, latensi < 10ms. |
| **Penyedia AI Generatif** | - | **Google Gemini API Server-Side** | Efisien, terpusat melalui `lib/ai/gemini-provider.ts`. |
| **Database & Vector Search** | PostgreSQL Mandiri / Docker | **Managed Supabase PostgreSQL + pgvector** | RLS terjamin, backup otomatis, satu database terpadu. |
| **Mode Retrieval Online** | Tidak pasti (potensi ONNX berat di Vercel) | **`structured_lexical` (Default)** | Deterministic, zero cold-start, 100% recall pada ground truth. |
| **Pipeline Data & Embedding** | - | **Python Offline CLI Tool** | Dijalankan offline di laptop Anggota 1 untuk kurasi dataset dan injeksi SQL. |

---

## 5. AUDIT KEAMANAN (SECURITY ASSESSMENT)

1. **Row Level Security (RLS):**
   - Seluruh 7 tabel LKB telah mengaktifkan RLS (`ENABLE ROW LEVEL SECURITY`).
   - Kebijakan `lkb_entities_read_verified` dan `lkb_passages_read_verified` memastikan pengguna anonim hanya dapat membaca data berstatus `verified`. Data kandidat/draft tidak dapat diakses publik.
   - Tabel audit sensitif `lkb_ingestion_runs` tidak memiliki *public read policy*, hanya dapat dibaca melalui *service role key*.
2. **Keamanan Stored Procedure (RPC):**
   - Fungsi `lkb_retrieve_context` menggunakan `SECURITY DEFINER` dengan penguncian search path eksplisit: `SET search_path = public` untuk mencegah *search_path hijacking*.
   - Parameter `p_limit` divalidasi dan dibatasi secara ketat antara 1 hingga 20 (`LEAST(GREATEST(p_limit, 1), 20)`) untuk mencegah *resource exhaustion / DoS query*.
3. **Kredensial dan Variabel Lingkungan:**
   - Kredensial sensitif `SUPABASE_SERVICE_ROLE_KEY` dan `DATABASE_URL` tidak memiliki prefix `NEXT_PUBLIC_` dan dilarang diakses oleh browser.
   - Dibuat adapter universal `lib/supabase/lkb-client.ts` yang membedakan lingkungan eksekusi secara aman.

---

## 6. HASIL PENGUJIAN AKHIR

1. **Python Unit & Pipeline Tests:**
   - `data-pipeline/tests/`: **11/11 Lulus** (1.17 detik).
2. **Benchmark Kuantitatif (30 Kueri Manusia):**
   - **Average Recall@5:** 100.0%
   - **Average Precision@5:** 96.2%
   - **Region Leakage Rate:** 0.0% (Strict Isolation)
   - **Source Evidence Completeness:** 100.0%
   - **Trick Cases:** 4/4 Lulus
   - **Average Retrieval Latency:** 0.04 ms
3. **TypeScript / Next.js Test Suite:**
   - `tests/*.test.ts`: **21/21 Lulus** (0.79 detik), termasuk uji kebocoran wilayah dan integrasi retrieval adapter.
4. **Production Build Next.js 16 (Turbopack):**
   - `npm run build`: **LULUS 100%** (20 rute static & dynamic berhasil di-build tanpa error).

---

## 7. REKOMENDASI DAN LANGKAH SELANJUTNYA

1. **Pull Request ke Main:**
   - Seluruh perbaikan telah selesai pada branch `feature/audit-local-knowledge-vercel`.
   - Tim dapat mereview PR dari branch ini menuju `main` setelah berkoordinasi dengan Anggota 1 dan Anggota 2.
2. **Migrasi Supabase Production:**
   - Terapkan file migrasi `supabase/migrations/20260923140000_local_knowledge.sql` pada proyek Supabase produksi.
   - Muat seed data melalui SQL editor menggunakan `data-pipeline/datasets/validated/seed_madiun_raya.sql`.
