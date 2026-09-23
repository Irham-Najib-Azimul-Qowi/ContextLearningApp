# Data Pipeline & Local Knowledge Base (LKB) — Pahami V2

Modul ini merupakan ruang kerja **Anggota 1 (Data & RAG Engineer)** untuk basis pengetahuan lokal wilayah historis Karesidenan Madiun (**Kota Madiun, Kabupaten Madiun, Ngawi, Magetan, Ponorogo, Pacitan**).

---

## 1. Arsitektur & Prinsip Desain

- **Database:** PostgreSQL + pgvector (Supabase) dengan namespacing `lkb_*`.
- **Zero-Python Server di Produksi:** Next.js backend (Anggota 2) mengakses fungsi retrieval via stored procedure `lkb_retrieve_context` langsung dari SQL/PostgREST.
- **Model Embedding:** `intfloat/multilingual-e5-small` (384 dimensi, prefix `passage: ` dan `query: `).
- **Hirarki Retrieval:** Validasi wilayah → Filter kategori/kelas → Pencarian leksikal berbobot → Fallback wilayah terukur → Output berbukti audit.

---

## 2. Struktur Modul

```text
data-pipeline/
  README.md
  requirements.txt
  pyproject.toml
  .env.example
  config/
    regions.yaml                 # Kode BPS dan batas 6 wilayah Madiun Raya
    categories.yaml              # 8 taksonomi kategori konteks pendidikan SD
    pipeline.yaml                # Konfigurasi model E5-small, dimensi 384, chunking
  datasets/
    samples/
      madiun_raya_seed.json      # Dataset entitas terverifikasi bersumber BPS/Pemda
      evaluation_30_queries.json # 30 kueri benchmark ditinjau manusia (termasuk trick cases)
    validated/
      seed_madiun_raya.sql       # Script SQL seed idempotent untuk Supabase
  src/pahami_data/
    schemas/                     # Pydantic v2 models (Entity, Source, Retrieval)
    sources/                     # Legal source registry & provenance metadata
    processing/                  # Normalizer, deduplication fingerprint, chunker
    embedding/                   # E5-small wrapper, 384-dim check, L2-norm
    storage/                     # Local store & SQL seed generator
    retrieval/                   # Structured-lexical engine & region fallback
    evaluation/                  # 30-query benchmark evaluator
    cli.py                       # CLI tool (--dry-run, --evaluate, --export-seed)
  tests/                         # Unit tests (schemas, pipeline, retrieval)
  reports/
    curation_report.md           # Laporan audit sumber dan cakupan entitas
    evaluation_report.md         # Hasil metrik benchmark 30 kueri uji
```

---

## 3. Cara Menjalankan Pipeline & Pengujian

### A. Pengujian Unit (Pytest)
```powershell
py -3 -m pytest data-pipeline/tests -v
```

### B. Dry Run Ingestion & Audit
```powershell
py -3 "data-pipeline/src/pahami_data/cli.py" --dry-run --report
```

### C. Eksekusi Benchmark Evaluasi 30 Kueri
```powershell
py -3 "data-pipeline/src/pahami_data/cli.py" --evaluate
```

### D. Ekspor SQL Seed untuk Supabase
```powershell
py -3 "data-pipeline/src/pahami_data/cli.py" --export-seed "data-pipeline/datasets/validated/seed_madiun_raya.sql"
```

---

## 4. Migrasi Database Supabase

File migrasi database telah disiapkan di:
- [`supabase/migrations/20260923140000_local_knowledge.sql`](../supabase/migrations/20260923140000_local_knowledge.sql)

Migrasi ini bersifat **non-destruktif**, membuat tabel ber-prefix `lkb_*`, mengaktifkan pgvector (384 dimensi), membuat indeks pencarian teks penuh (GIN) dan vektor (HNSW), serta mendefinisikan stored procedure `lkb_retrieve_context`.

---

## 5. Dokumen Integrasi untuk Anggota 2

- Kontrak JSON Schema: [`contracts/local-context-retrieval.schema.json`](../contracts/local-context-retrieval.schema.json)
- Panduan Pemanggilan di Next.js: [`contracts/LOCAL_CONTEXT_INTEGRATION.md`](../contracts/LOCAL_CONTEXT_INTEGRATION.md)
