# Pahami V2 — Repository Architecture & Module Ownership

Dokumen ini menjelaskan arsitektur repositori, batas antarmodul (*module boundaries*), dan pembagian kepemilikan kode antara dua pengembang inti dalam proyek **Pahami V2**.

---

## 1. Ikhtisar Arsitektur Tingkat Tinggi
Pahami V2 dirancang dengan pendekatan modular yang memisahkan rekayasa data & RAG (Python) dengan antarmuka web interaktif guru/siswa (Next.js), yang dihubungkan melalui *shared database* (Supabase PostgreSQL + pgvector).

```
                     +---------------------------------------+
                     |    Member 1: Data & RAG Engineer      |
                     +---------------------------------------+
                                        |
                 [Data Collection, Normalization, & Chunking]
                                        |
                     +---------------------------------------+
                     |      Python Data Pipeline (Local)     |
                     |            (data-pipeline/)           |
                     +---------------------------------------+
                                        |
                    [SQL Seed / Direct Ingestion via Script]
                                        v
+-----------------------------------------------------------------------------------+
|               Shared Database Architecture (Supabase PostgreSQL + pgvector)        |
|                                                                                   |
|  [Owned by Member 1]                              [Owned by Member 2]             |
|  - regions                                        - profiles / users              |
|  - context_entities                               - schools / classes             |
|  - context_sources                                - educational_materials        |
|  - context_embeddings (pgvector)                  - questions & test_items        |
|  - rpc/match_context_entities                     - examinations & attempts       |
|                                                   - grading_results & answers     |
+-----------------------------------------------------------------------------------+
                                        ^
                                        | (Server-Side Supabase Client / RPC)
                                        |
                     +---------------------------------------+
                     |   Member 2: Full-Stack & AI Engineer  |
                     +---------------------------------------+
                                        |
                   [Next.js App Router Web Application (Root)]
                   ├── app/ (Teacher & Student Dashboards, Exam UI)
                   ├── lib/ai/ (Gemini AI Contextualization)
                   ├── lib/context-engine/ (Variable Extraction & Prompting)
                   └── components/ (Unified Design System)
```

---

## 2. Struktur Repositori & Boundary Modul

### A. Web Application Root (`app/`, `components/`, `features/`, `lib/`, `types/`)
- **Teknologi:** Next.js 16.3.5 (App Router, Turbopack), React 19.2.8, Tailwind CSS v4, TypeScript 5.
- **Pemilik:** **Member 2 (Full-Stack & AI Engineer)**.
- **Tanggung Jawab:**
  - UI/UX alur guru (pembuatan materi, input soal manual/scan OCR, preview kontekstualisasi, distribusi ujian).
  - UI/UX alur siswa (pengerjaan ujian online, tampilan hasil & umpan balik, materi kontekstual).
  - Integrasi API Google Gemini via centralized provider manager server-side.
  - Ekstraksi variabel konteks dan pembuatan prompt pembelajaran berdiferensiasi lokal.

### B. Python Data Pipeline (`data-pipeline/`)
- **Teknologi:** Python 3.10+, PostgreSQL client (psycopg2/asyncpg), embedding toolkit.
- **Pemilik:** **Member 1 (Data & RAG Engineer)**.
- **Tanggung Jawab:**
  - Pengumpulan data budaya, sejarah, kuliner, bentang alam Karesidenan Madiun (Kota Madiun, Kab. Madiun, Ngawi, Magetan, Ponorogo, Pacitan).
  - Normalisasi data mentah menjadi entitas terstruktur sesuai `contracts/context-entity-contract.md`.
  - Pembuatan representasi vektor (*embeddings*) dan penyiapan file seeding / skrip injeksi database.
  - Pipeline ini berjalan sebagai toolchain lokal/batch pengembang data, bukan layanan web publik terpisah.

### C. Shared Contracts (`contracts/`)
- **Pemilik:** **Member 1 & Member 2 (Co-owned)**.
- **Fungsi:** Titik temu teknis spesifikasi data agar kedua modul dapat berkomunikasi secara deterministik tanpa asumsi sepihak.
  - `region-contract.md`: Standar kode wilayah administratif BPS.
  - `context-entity-contract.md`: Schema entitas pengetahuan lokal.
  - `retrieval-contract.md`: Schema permintaan dan tanggapan pencarian konteks hybrid.

### D. Database Migrations (`supabase/migrations/`)
- **Pemilik:** **Member 1 & Member 2 (Berdasarkan Domain Tabel)**.
- **Aturan Koordinasi:**
  - Setiap perubahan skema wajib berbentuk file migrasi SQL baru dengan penamaan timestamp/sekuensial unik (contoh: `003_add_local_context_entities.sql`).
  - Dilarang memodifikasi file migrasi yang telah di-apply sebelumnya.
  - Member 1 mengelola tabel domain geografi, entitas konteks, indeks pgvector, dan fungsi retrieval.
  - Member 2 mengelola tabel domain sekolah, kelas, bank soal, hasil ujian, dan sesi siswa.

---

## 3. Integrasi RAG Terencana (*Planned RAG Integration*)
Alur retrieval konteks lokal dirancang untuk berjalan secara server-side dalam Next.js:
1. Guru memilih materi atau memasukkan draft soal di dashboard web.
2. Contextualization Engine mengekstrak kata kunci konsep dan mengidentifikasi wilayah sekolah guru (`region_id`).
3. Server Next.js memanggil fungsi SQL RPC Supabase (`match_context_entities`) yang mengeksekusi pencarian vektor dan kata kunci (hybrid).
4. Kandidat konteks lokal terverifikasi dikirimkan ke model Gemini API bersama instruksi pedagogis untuk menghasilkan soal berkonteks lokal.
5. Guru meninjau (*review*) hasil sebelum mempublikasikannya ke siswa.

Dokumen arsitektur ini menjadi panduan agar kedua anggota tim dapat bekerja secara independen pada cabangnya masing-masing tanpa konflik struktural.
