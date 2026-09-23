# Retrieval Contract — Local Context Hybrid Retrieval Specification

> **Status:** `DRAFT — TAHAP REVIEW BERSAMA`  
> Dokumen ini mendefinisikan kontrak pertukaran data antarmuka pencarian konteks (*context retrieval interface*) antara modul web Next.js (aplikasi) dan lapisan database pgvector (Supabase).

## 1. Tujuan Antarmuka Retrieval
Menyediakan antarmuka pencarian konteks lokal yang deterministik dan relevan berdasarkan wilayah pengajar/siswa, mata pelajaran, kata kunci konsep soal, dan jenjang pendidikan.

> **PENTING:**  
> Fungsi retrieval sesungguhnya **belum diimplementasikan** pada tahap persiapan repositori ini. Kontrak ini adalah acuan rancangan (*blueprint*) yang akan diimplementasikan sebagai fungsi PostgreSQL (contoh: `rpc/match_context_entities`) oleh Member 1 dan dipanggil via server-side action / route handler oleh Member 2.

## 2. Struktur Permintaan (*Request Payload*)
Permintaan pencarian dikirimkan oleh Contextualization Engine (Next.js server-side) menuju lapisan retrieval:

```json
{
  "region_id": "35.77",
  "category": "local_economy",
  "query": "kecepatan gerak laju roda rel dan gesekan baja",
  "subject": "Fisika",
  "grade": "SMP",
  "limit": 5
}
```

### Spesifikasi Field Request

| Field | Tipe | Wajib / Opsional | Keterangan |
| :--- | :--- | :--- | :--- |
| `region_id` | `string` | **Wajib** | Kode administratif wilayah standar (contoh: `"35.77"` untuk Kota Madiun). |
| `category` | `string \| null` | Opsional | Filter kategori entitas (misal: `"geography"`, `"local_economy"`). Nilai `null` mencari lintas kategori. |
| `query` | `string` | **Wajib** | Kalimat kueri atau konsep materi yang ingin dicarikan konteks lokalnya. |
| `subject` | `string \| null` | Opsional | Mata pelajaran yang relevan (misal: `"Fisika"`, `"Matematika"`, `"Ekonomi"`). |
| `grade` | `string \| null` | Opsional | Jenjang pendidikan target (`"SD"`, `"SMP"`, `"SMA"`). |
| `limit` | `number` | Opsional | Jumlah maksimum kandidat konteks yang dikembalikan (default: `5`, max: `20`). |

## 3. Struktur Tanggapan (*Response Payload*)
Hasil pencarian mengembalikan daftar entitas terverifikasi beserta metadata pengambilan (*retrieval metadata*):

```json
{
  "status": "success",
  "data": [
    {
      "entity_id": "ctx_ent_3577_inka_01",
      "region_id": "35.77",
      "name": "PT Industri Kereta Api (INKA)",
      "category": "local_economy",
      "description": "PT INKA (Persero) adalah industri manufaktur kereta api pertama dan terbesar di Asia Tenggara yang berbasis di Kota Madiun, memproduksi lokomotif, kereta rel diesel, dan gerbong penumpang untuk pasar nasional maupun ekspor.",
      "source": {
        "publisher": "Humas PT INKA / Pemkot Madiun",
        "url": "https://www.inka.co.id",
        "source_type": "official_profile"
      },
      "verification_status": "verified",
      "retrieval_metadata": {
        "matched_terms": ["rel", "kereta", "baja"],
        "match_type": "hybrid_vector_keyword",
        "search_rank": 1
      }
    }
  ],
  "meta": {
    "total_found": 1,
    "execution_time_ms": 14,
    "query_region_id": "35.77"
  }
}
```

### Spesifikasi Field Response

| Field | Tipe | Keterangan |
| :--- | :--- | :--- |
| `entity_id` | `string` | ID unik entitas konteks sesuai kontrak entitas. |
| `region_id` | `string` | ID wilayah tempat entitas berada. |
| `name` | `string` | Nama entitas konteks lokal. |
| `category` | `string` | Kategori entitas. |
| `description` | `string` | Teks deskripsi informatif untuk disuntikkan ke prompt LLM. |
| `source` | `object` | Metadata sumber informasi untuk akuntabilitas pedagogis. |
| `verification_status`| `string` | Hanya entitas terverifikasi (`"verified"`) yang dapat dikembalikan. |
| `retrieval_metadata`| `object` | Metadata teknis hasil retrieval (istilah cocok, tipe pencarian, peringkat relevansi). *Tidak menggunakan angka persentase fiktif.* |

## 4. Mekanisme Evaluasi & Kepemilikan
- **Member 1 (Data & RAG):** Bertanggung jawab atas fungsi SQL pencarian hybrid (semantic cosine distance + full-text search tsvector) dan optimasi indeks vector (HNSW/IVFFlat).
- **Member 2 (Full-Stack & AI):** Bertanggung jawab atas pemanggilan RPC dari server Next.js dan pemformatan konteks ke dalam prompt Gemini AI.
