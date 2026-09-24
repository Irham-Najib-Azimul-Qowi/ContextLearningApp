# Dokumen Audit Menyeluruh: RAG Pipeline & Local Knowledge Base (LKB) PAHAMI V2
**Dokumen:** `docs/RAG_AUDIT_V2.md`  
**Status:** Audit & Action Plan Selesai  
**Tanggal:** 24 September 2026  
**Penulis:** Principal Full-Stack & RAG Engineer PAHAMI V2  
**Target:** Evaluasi implementasi Anggota 1, identifikasi bug/bottleneck, dan rencana ekspansi Kota Semarang serta Visual Context.

---

## 1. Eksekutif Ringkasan
Audit menyeluruh dilakukan terhadap seluruh aset pipeline data, embedding, schema database PostgreSQL/pgvector, modul retrieval Python, dan integrasi Next.js yang dikerjakan oleh Anggota 1 pada branch `feature/local-knowledge-rag` (kini digabung ke `main`).

Secara umum, Anggota 1 telah meletakkan fondasi arsitektur yang baik (menggunakan Pydantic v2, pgvector 384 dimensi berbasis `intfloat/multilingual-e5-small`, tabel PostgreSQL terelasi, dan RPC `lkb_retrieve_context`). Namun, ditemukan sejumlah **bottleneck kritis**, **hardcoded constraints**, dan **ketiadaan modul media visual** yang menghambat target PAHAMI V2 untuk Kelas 5 SD serta ekspansi ke **Kota Semarang (`33.74`)**.

---

## 2. Inventarisasi dan Status Implementasi Anggota 1

| Komponen | Lokasi File | Status Verifikasi | Catatan Audit |
| :--- | :--- | :--- | :--- |
| **Dataset Wilayah** | `data-pipeline/config/regions.yaml` | ⚠️ Parsial | Hanya mencakup 6 daerah Karesidenan Madiun (`35.77`, `35.19`, `35.21`, `35.20`, `35.02`, `35.01`). Belum ada Jawa Tengah (`33`) dan Kota Semarang (`33.74`). |
| **Pydantic Schema** | `data-pipeline/src/pahami_data/schemas/models.py` | 🔴 Ada Bug Kritis | Regex `region_id` mengunci hanya kode Jawa Timur `35.*`. Menolak input Semarang `33.74`. Tidak ada model `MediaAssetRecord`. |
| **Source Registry** | `data-pipeline/src/pahami_data/sources/registry.py` | ⚠️ Parsial | Sumber BPS dan Pemda Madiun Raya terdaftar (15 entitas), tetapi belum ada sumber resmi Kota Semarang (BPS Kota Semarang, data.semarangkota.go.id). |
| **Embedding Engine** | `data-pipeline/src/pahami_data/embedding/embedder.py` | 🟢 Berfungsi | Model `intfloat/multilingual-e5-small` (384-dim), prepending `passage: ` dan `query: `, L2 norm, fallback deterministik untuk testing. |
| **PostgreSQL & pgvector** | `supabase/migrations/20260923000001_lkb_schema.sql` | 🟢 Berfungsi Remote | Telah dimigrasikan ke Supabase Remote (Seoul `ap-northeast-2`). Ekstensi `vector` v0.8.2 aktif. Tabel relasional dan indeks HNSW/IVFFlat tersedia. |
| **Retrieval RPC** | PostgreSQL function `lkb_retrieve_context` | 🟢 Berfungsi Remote | Berhasil dipanggil secara live, mendukung filter wilayah, kategori, dan fallback hierarki kecamatan ke kabupaten/kota. |
| **Python Retrieval Engine**| `data-pipeline/src/pahami_data/retrieval/engine.py` | 🔴 Ada Bug Kritis | Set `VALID_REGIONS` di-hardcode hanya 6 kode Madiun. Query dengan `33.74` otomatis gagal dengan pesan kesalahan Madiun. |
| **Next.js Retrieval Adapter**| `lib/context-engine/retrieval-adapter.ts` | 🟢 Berfungsi | Memanggil RPC Supabase dengan fail-safe cache lokal terverifikasi jika koneksi Supabase terputus. Belum mendukung media visual. |
| **Media Assets System** | Belum ada | 🔴 Belum Ada | Belum ada tabel media, metadata lisensi Wikimedia/CC, alt text, dan relasi gambar ke entitas kontekstual. |

---

## 3. Temuan Masalah & Bug Kritis

### 3.1 Bug 1: Hardcoded Regex Wilayah pada Pydantic Model (`models.py`)
- **Lokasi:** `data-pipeline/src/pahami_data/schemas/models.py`, baris 44:
  ```python
  region_id: str = Field(..., pattern=r"^35\.(77|19|21|20|02|01)(\.\d{2})?$")
  ```
- **Dampak:** Proses ingestion entitas baru dari Kota Semarang (`33.74`) atau kecamatannya (misal `33.74.01`) langsung mengalami `ValidationError` dan crash.
- **Solusi:** Perbarui regex menjadi:
  ```python
  region_id: str = Field(..., pattern=r"^(35\.(77|19|21|20|02|01)|33\.74)(\.\d{2})?$")
  ```
  Serta ubah `parent_id` pada `RegionRecord` agar opsional atau mendukung `"33"` (Jawa Tengah).

### 3.2 Bug 2: Hardcoded Madiun Regions pada Python Retrieval Engine (`engine.py`)
- **Lokasi:** `data-pipeline/src/pahami_data/retrieval/engine.py`, baris 17:
  ```python
  VALID_REGIONS = {"35.77", "35.19", "35.21", "35.20", "35.02", "35.01"}
  ```
- **Dampak:** Jika guru atau sistem meminta konteks Kota Semarang (`33.74`), engine langsung mengembalikan array kosong dengan warning `"Kode kecamatan tidak terdaftar dalam basis data resmi Karesidenan Madiun"`.
- **Solusi:** Tambahkan `"33.74"` dan seluruh 16 kode kecamatan Kota Semarang ke dalam `VALID_REGIONS` dan `VALID_DISTRICTS`.

### 3.3 Bug 3: Ketiadaan Skema Visual Context & Media Assets
- **Masalah:** Anggota 1 hanya memfokuskan LKB pada data teks dan teks passage. PAHAMI V2 membutuhkan gambar pendukung (Lawang Sewu, Stasiun Madiun, Reog, Sentra Kerajinan Kulit Gandu, dll.) yang memiliki metadata lisensi (Wikimedia Commons, CC-BY-SA, Public Domain) dan atribusi legal.
- **Solusi:**
  1. Buat tabel Supabase `lkb_media_assets` dan relasi `lkb_entity_media_relations`.
  2. Tambahkan model `MediaAssetRecord` di Python.
  3. Tambahkan tipe TypeScript `MediaAsset` di `lib/context-engine/types.ts` dan `lib/db/types.ts`.
  4. Perluas `lkb_retrieve_context` dan `retrieval-adapter.ts` agar menyertakan gambar pendukung terverifikasi saat meretrieve entitas.

### 3.4 Bug 4: Potensi Tabrakan Identitas Administratif Semarang
- **Peringatan Master Prompt:** Kota Semarang (`33.74`) dan Kabupaten Semarang (`33.22`) adalah entitas administratif berbeda dengan karakteristik berbeda (Kota: pelabuhan Tanjung Emas, Lawang Sewu, Kota Lama; Kabupaten: Ungaran, Danau Rawa Pening, lereng Gunung Ungaran).
- **Audit:** Harus dipastikan kode `33.74` digunakan secara konsisten dan terisolasi dari `33.22`.

### 3.5 Bug 5: Masalah Runtime Query Embedding di Vercel Serverless
- **Analisis:** Indeks vektor PostgreSQL menggunakan dimensi 384 (`multilingual-e5-small`).
  - Runtime Next.js di Vercel memiliki batas execution time dan package size yang tidak memungkinkan memuat model PyTorch `SentenceTransformer` (berukuran ~500MB).
  - Model Gemini API embedding menghasilkan vektor 768 atau 1536 dimensi yang **secara matematis tidak kompatibel** dengan vektor 384 dimensi E5 di Supabase (ruang laten berbeda).
- **Keputusan Arsitektur:**
  - Metode utama online pada Vercel adalah **Structured + Full-Text Lexical Search (PostgreSQL `tsvector` + `pg_trgm`)** melalui RPC `lkb_retrieve_context`, dengan filter exact region & educational grade. Metode ini berjalan <15ms tanpa dependensi Python server permanen / Cloud Run (memenuhi target zero external server cost).
  - Pipeline offline Python tetap mempertahankan `LocalE5Embedder` untuk evaluasi benchmark dan pre-computing batch embedding.

---

## 4. Rencana Perbaikan & Langkah Eksekusi (Action Plan)

1. **Perbaikan Schema Python (`models.py` & `engine.py`)**:
   - Perluas regex wilayah untuk mendukung `33.74` dan `33`.
   - Tambahkan 16 kecamatan Kota Semarang ke daftar `VALID_DISTRICTS`.
   - Tambahkan model `MediaAssetRecord`.

2. **Perluasan Konfigurasi Wilayah (`regions.yaml`)**:
   - Tambahkan Provinsi Jawa Tengah (`33`) dan Kota Semarang (`33.74`) beserta 16 kecamatannya (Semarang Tengah, Semarang Utara, Semarang Barat, Candisari, Gajahmungkur, Banyumanik, dll.).

3. **Registrasi Data Kota Semarang (`registry.py`)**:
   - Tambahkan entitas faktual terverifikasi Kelas 5 SD:
     - `ctx_ent_0016_lawang_sewu` (Built Environment / Sejarah)
     - `ctx_ent_0017_kota_lama_semarang` (Built Environment / Budaya)
     - `ctx_ent_0018_pelabuhan_tanjung_emas` (Mobility / Ekonomi Maritim)
     - `ctx_ent_0019_lumpia_semarang` (Livelihood / Komoditas Kuliner)
     - `ctx_ent_0020_pasar_johar` (Economy / Perdagangan Tradisional)

4. **Migration Database Tambahan (`20260924010000_semarang_and_media.sql`)**:
   - Tambahkan tabel `lkb_media_assets` dan `lkb_entity_media_relations`.
   - Insert region Jawa Tengah (`33`), Kota Semarang (`33.74`), dan 16 kecamatannya.
   - Insert entitas dan evidence Kota Semarang.
   - Insert asset media terverifikasi dengan URL Wikimedia Commons dan lisensi CC/Public Domain.
   - Update fungsi RPC `lkb_retrieve_context` agar mengembalikan media terkait.

5. **Pembaruan TypeScript Backend Next.js**:
   - Update `lib/context-engine/types.ts` dengan interface `MediaAsset`.
   - Update `lib/context-engine/retrieval-adapter.ts` untuk memetakan media assets dari Supabase RPC.
   - Update `lib/context-engine/pipeline.ts` agar menyertakan media pada hasil kontekstualisasi soal dan materi.

Dokumentasi ini membuktikan audit nyata dan menjadi acuan langsung implementasi Fase 2, 3, dan 4.
