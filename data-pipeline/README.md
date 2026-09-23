# Data Pipeline — Pahami V2 Local Knowledge Base

Direktori ini merupakan boundary kerja utama bagi **Member 1 (Data & RAG Engineer)**.

## 1. Peran & Tanggung Jawab
- Pengumpulan dan dokumentasi sumber data konteks lokal (khususnya wilayah Karesidenan Madiun).
- Pembersihan (*cleaning*), normalisasi (*normalization*), dan kurasi entitas konteks.
- Klasifikasi entitas konteks (*historical*, *culinary*, *geography*, *tradition*, *figures*, *flora_fauna*, *economy*).
- *Chunking* dokumen dan pembuatan *embedding vector* lokal.
- Penyimpanan ke shared PostgreSQL + pgvector (Supabase).
- Evaluasi kualitas *retrieval* dan optimasi pencarian hybrid (*dense vector* + *sparse/full-text*).

## 2. Arsitektur Alur Data
```
Python Data Pipeline (Local/Batch)
  ├── 1. Ingestion: Sumber data lokal (BPS, Pemda, Budaya Madiun Raya)
  ├── 2. Processing & Validation: Sesuai contracts/context-entity-contract.md
  └── 3. Embeddings: Vektorisasi teks konteks
           ↓
Validated Local Knowledge
           ↓
Supabase PostgreSQL + pgvector (Shared Database)
           ↓
Next.js Server-Side Retrieval (API / Server Actions)
           ↓
Contextualization Engine (Member 2 - Full-Stack & AI)
```

> **Catatan Arsitektur:**
> Pipeline data ini berjalan secara *batch / ad-hoc scripts* (Python) untuk memproses dan menyuntikkan data konteks terverifikasi ke database Supabase. Pipeline tidak memerlukan runtime public web service terpisah (seperti FastAPI) yang berjalan terus-menerus pada fase persiapan dan prototipe awal.

## 3. Struktur Direktori
- `config/`: Konfigurasi pipeline, parameter embedding, dan konektor database.
- `datasets/raw/`: Data mentah hasil scraping atau ekstraksi manual (diabaikan oleh Git via `.gitignore`).
- `datasets/processed/`: Data hasil normalisasi awal (diabaikan oleh Git via `.gitignore`).
- `datasets/validated/`: Data terverifikasi yang siap dimuat ke database.
- `datasets/samples/`: Sampel data kecil yang telah ditinjau untuk keperluan testing & integrasi (dapat di-commit).
- `ingestion/`: Modul pengumpul data dari berbagai format/sumber.
- `processing/`: Modul pembersihan teks, chunking, validasi format schema.
- `embeddings/`: Modul pembentukan vektor embedding.
- `retrieval/`: Script pengujian dan evaluasi akurasi pencarian konteks.
- `scripts/`: CLI helper scripts (misal: `ingest_madiun.py`, `seed_pgvector.py`).
- `tests/`: Unit test & integrasi untuk modul Python pipeline.

## 4. Standar dan Kontrak
Seluruh data yang diproses wajib mematuhi kontrak integrasi yang disepakati bersama:
- [Region Contract](../contracts/region-contract.md)
- [Context Entity Contract](../contracts/context-entity-contract.md)
- [Retrieval Contract](../contracts/retrieval-contract.md)
