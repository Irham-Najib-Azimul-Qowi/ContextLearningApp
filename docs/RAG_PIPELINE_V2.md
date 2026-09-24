# Arsitektur Pipeline RAG & Retrieval Engine PAHAMI V2
**Dokumen:** `docs/RAG_PIPELINE_V2.md`  
**Status:** Produksi / Siap Vercel Serverless  
**Tanggal:** 24 September 2026  

---

## 1. Ikhtisar Desain Dual-Runtime
Untuk memenuhi target kompetisi Hackathon IT Comp 2026 dengan deployment Vercel Serverless tanpa biaya Google Cloud Run / VPS permanen, PAHAMI V2 menggunakan pemisahan runtime:

```
+-------------------------------------------------------------------------+
| OFFLINE DATA PIPELINE (Python 3.11 + uv + Pydantic v2 + SentenceTransf) |
| - Sumber Data BPS / Pemda / Wikimedia                                  |
| - Normalisasi Entitas & Validasi Pydantic                              |
| - Penulisan Passage & Evaluasi Benchmark Retrieval                     |
| - Ekspor SQL Migration & Batch Embedding (multilingual-e5-small)       |
+------------------------------------+------------------------------------+
                                     | (SQL Migrations & Seed Data)
                                     v
+-------------------------------------------------------------------------+
| SUPABASE POSTGRESQL + PGVECTOR (Region: Seoul ap-northeast-2)          |
| - Indeks Relasional (lkb_regions, lkb_entities, lkb_entity_evidence)    |
| - Indeks Media Visual (lkb_media_assets, lkb_entity_media_relations)   |
| - Indeks Vektor (lkb_knowledge_passages dengan vector(384))            |
| - Stored Procedure RPC: lkb_retrieve_context (Fungsi SQL PL/pgSQL)     |
+------------------------------------+------------------------------------+
                                     | (Database Client RPC via HTTPS)
                                     v
+-------------------------------------------------------------------------+
| ONLINE RUNTIME (Next.js 16 App Router on Vercel Serverless)             |
| - ContextualAIEngine (TypeScript Pipeline)                             |
| - SupabaseLocalContextRetriever (<15ms via Stored Procedure)           |
| - Fail-Safe Cache Lokal (MockLocalContextRetriever)                    |
| - Gemini 2.5 Flash API (Structured JSON Generation & Rewriting)        |
+-------------------------------------------------------------------------+
```

---

## 2. Tahapan Pipeline Data Offline (Python)

### 2.1 Tahap 1: Validasi Skema & Wilayah
- File: `data-pipeline/src/pahami_data/schemas/models.py`
- Pydantic models memvalidasi kode wilayah resmi (Kemendagri / BPS 2024):
  - Karesidenan Madiun: `35.77`, `35.19`, `35.21`, `35.20`, `35.02`, `35.01`
  - Kota Semarang: `33.74`
  - Pola Regex yang didukung: `^(35\.(77|19|21|20|02|01)|33\.74)(\.\d{2})?$`
- Setiap entitas harus memiliki `grade_suitability` (rentang 1-6 SD) dan batasan kuantitatif (`QuantitativeConstraints`) untuk menjaga rasionalitas soal matematika (misal bobot 10-500 kg, bukan jutaan kg).

### 2.2 Tahap 2: Deduplikasi & Verifikasi Fakta
- Entitas di-deduplikasi menggunakan fingerprint SHA256 dari nama kanonikal dan kode wilayah.
- Setiap fakta wajib menyertakan minimal 1 bukti (`lkb_entity_evidence`) dengan rujukan bab/halaman dokumen penerbit.

### 2.3 Tahap 3: Pembuatan Knowledge Passage
- Passage tidak dibuat secara mentah dari potongan dokumen panjang, melainkan diformat khusus untuk keperluan soal cerita:
  > *"Stasiun Madiun merupakan fasilitas transportasi perkeretaapian di Kota Madiun. Sangat ideal untuk materi kecepatan jarak dan waktu matematika SD."*
- Model embedding: `intfloat/multilingual-e5-small` (384 dimensi), menggunakan prefix `passage: ` saat proses embedding dokumen.

---

## 3. Runtime Retrieval Online di Next.js (Supabase RPC)

### 3.1 Fungsi PostgreSQL: `lkb_retrieve_context`
Dijalankan langsung di dalam database PostgreSQL melalui protokol Supabase RPC, menghindari kebutuhan microservice Python runtime:

```sql
SELECT public.lkb_retrieve_context(
    p_region_id := '33.74',
    p_query := 'lawang sewu',
    p_grade := 5,
    p_subject := 'Matematika',
    p_limit := 5
);
```

### 3.2 Fitur Unggulan RPC:
1. **Pencegahan Kebocoran Wilayah (Zero Region Leakage)**: Entitas dari wilayah lain tidak akan muncul pada hasil pencarian wilayah aktif sekolah.
2. **Fallback Hierarki Cerdas**: Jika pengguna memasukkan kode kecamatan (misal `33.74.01`), sistem memeriksa ketersediaan data kecamatan. Jika data kecamatan belum ada, secara transparan melakukan fallback ke tingkat kota (`33.74`) dengan mencatat warning pedagogis.
3. **Penyertaan Media Visual**: RPC secara otomatis melakukan `JOIN` dengan `lkb_entity_media_relations` dan `lkb_media_assets` untuk melampirkan gambar utama (*primary media*) berlisensi terbuka beserta teks atribusinya.

### 3.3 Fail-Safe Resilience di Next.js Adapter
Pada `lib/context-engine/retrieval-adapter.ts`:
- Apabila jaringan internet ke Supabase terputus atau kredensial belum dikonfigurasi, sistem secara otomatis beralih (*fallback*) ke `MockLocalContextRetriever` yang menyimpan snapshot data Karesidenan Madiun dan Kota Semarang terverifikasi.
- Aplikasi web **tidak akan pernah crash (500 Error)** di depan guru atau siswa hanya karena database remote sedang mengalami *cold start*.
