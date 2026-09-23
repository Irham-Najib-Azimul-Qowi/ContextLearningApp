# Pahami V2 — Repository Architecture & Module Ownership

Dokumen ini menjelaskan arsitektur repositori, batas antarmodul (*module boundaries*), dan pembagian kepemilikan kode antara dua pengembang inti dalam proyek **Pahami V2**.

---

## 1. Ikhtisar Arsitektur Tingkat Tinggi
Pahami V2 dirancang dengan pendekatan modular yang memisahkan rekayasa data & RAG (Python) dengan antarmuka studio pembuatan materi dan soal (Next.js), yang dihubungkan melalui *shared database* (Supabase PostgreSQL + pgvector).

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
|  [Dikelola oleh Member 1]                         [Dikelola oleh Member 2]        |
|  - regions                                        - educational_materials        |
|  - context_entities                               - questions & question_items    |
|  - context_sources                                - context_variables             |
|  - context_embeddings (pgvector)                  - contextualized_versions       |
|  - rpc/match_context_entities                     - distribution & shared_links   |
+-----------------------------------------------------------------------------------+
                                        ^
                                        | (Server-Side Supabase Client / RPC)
                                        |
                     +---------------------------------------+
                     |   Member 2: Full-Stack & AI Engineer  |
                     +---------------------------------------+
                                        |
                   [Next.js App Router Web Application (Root)]
                   ├── app/ (Studio Materi & Soal, Preview Kontekstual)
                   ├── features/ (Modul Contextualization Engine)
                   ├── lib/ (Utilitas & AI Provider)
                   └── components/ (Design System)
```

---

## 2. Struktur Repositori & Boundary Modul

### A. Web Application Root (`app/`, `components/`, `features/`, `lib/`)
- **Teknologi:** Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS v4, TypeScript 5.
- **Pemilik:** **Member 2 (Full-Stack & AI Engineer)**.
- **Tanggung Jawab:**
  - Halaman Studio pembuatan materi pembelajaran dan soal kontekstual.
  - Input manual dan ekstraksi lembar foto soal (OCR).
  - Contextualization Engine (deteksi variabel kontekstual & substitusi entitas lokal).
  - Integrasi API Google Gemini untuk augmentasi pedagogis.
  - Preview interaktif guru, ekspor naskah cetak, dan tautan berbagi materi.

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
  - `region-contract.md`: Standar kode wilayah administratif BPS Karesidenan Madiun.
  - `context-entity-contract.md`: Schema entitas pengetahuan lokal terstruktur.
  - `retrieval-contract.md`: Schema permintaan dan tanggapan pencarian konteks hybrid.

### D. Database Migrations (`supabase/migrations/`)
- **Pemilik:** **Member 1 & Member 2 (Berdasarkan Domain Tabel)**.
- **Aturan Koordinasi:**
  - Skema database prototipe V2 akan dibuat mulai dari migrasi baru yang additive.
  - Migrasi lama LMS tidak dibawa ke dalam baseline V2 dan telah diarsipkan di branch `backup/pre-context-engine-refactor`.
  - Database Supabase live tidak diubah maupun dihapus.
