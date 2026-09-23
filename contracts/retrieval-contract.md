# Retrieval Contract — Local Context Hybrid Retrieval Specification

> **Status:** `DRAFT — TAHAP REVIEW BERSAMA`  
> Dokumen ini mendefinisikan kontrak awal pertukaran data antarmuka pencarian konteks (*context retrieval interface*) antara modul web Next.js (Member 2) dan lapisan database pgvector (Member 1).
> Nilai pada contoh adalah **placeholder ilustratif**, bukan data wilayah yang sudah diverifikasi.

## 1. Tujuan Antarmuka Retrieval
Menyediakan antarmuka pencarian konteks lokal yang deterministik dan relevan berdasarkan wilayah pengajar/siswa, kategori entitas, kueri konsep, mata pelajaran, dan jenjang pendidikan.

> **PENTING:**  
> Fungsi retrieval belum diimplementasikan pada tahap persiapan repositori ini. Kontrak ini adalah acuan rancangan (*blueprint*) untuk diimplementasikan oleh Member 1 (SQL RPC pgvector) dan dikonsumsi oleh Member 2 (Server-side Next.js). **Dilarang membuat endpoint palsu (*fake mocks*) pada tahap ini.**

---

## 2. Struktur Permintaan (*Request Payload*)
Permintaan pencarian konteks dikirimkan oleh Contextualization Engine menuju fungsi retrieval:

```json
{
  "region_id": "KODE_WILAYAH_RESMI",
  "category": "commodity",
  "query": "Komoditas yang relevan untuk soal matematika kelas 5",
  "subject": "mathematics",
  "grade": 5,
  "limit": 5
}
```

### Spesifikasi Field Request

| Field | Tipe | Wajib / Opsional | Keterangan |
| :--- | :--- | :--- | :--- |
| `region_id` | `string` | **Wajib** | Kode administratif wilayah resmi (contoh: `"35.77"` untuk Kota Madiun). |
| `category` | `string \| null` | Opsional | Kategori entitas (contoh: `"commodity"`, `"geography"`, `"tradition"`, dll). |
| `query` | `string` | **Wajib** | Teks kueri pencarian konsep atau materi pelajaran. |
| `subject` | `string \| null` | Opsional | Nama mata pelajaran (contoh: `"mathematics"`, `"science"`). |
| `grade` | `number \| null` | Opsional | Tingkat jenjang kelas (contoh: `5` untuk Kelas 5 SD). |
| `limit` | `number` | Opsional | Batas maksimal kandidat entitas (default: `5`, max: `20`). |

---

## 3. Struktur Tanggapan (*Response Payload*)
Hasil pencarian mengembalikan array kandidat entitas terverifikasi:

```json
{
  "results": [
    {
      "entity_id": "CONTOH_ID",
      "region_id": "KODE_WILAYAH_RESMI",
      "name": "CONTOH_ENTITAS",
      "category": "commodity",
      "description": "Deskripsi singkat berbasis sumber terverifikasi.",
      "source_url": "URL_SUMBER_ASLI",
      "verification_status": "verified"
    }
  ]
}
```

### Penanganan Ketika Data Tidak Ditemukan (*Empty State Handling*)
Jika tidak ada entitas yang cocok atau wilayah belum memiliki entitas terverifikasi, response mengembalikan array kosong:

```json
{
  "results": []
}
```

Sistem pemanggil (Contextualization Engine) wajib menangani kondisi ini dengan:
1. Melakukan fallback ke level wilayah yang lebih tinggi (Kecamatan → Kabupaten/Kota → Provinsi).
2. Atau mengembalikan naskah soal standar tanpa substitusi variabel bila tidak ada entitas lokal yang lolos ambang batas relevansi.

---

## 4. Pembagian Tanggung Jawab
- **Member 1 (Data & RAG):** Mengimplementasikan fungsi pencarian hybrid (vector similarity cosine + keyword search) di PostgreSQL Supabase yang menghasilkan struktur data di atas.
- **Member 2 (Web & AI):** Mengonsumsi hasil retrieval di server Next.js dan memformatnya menjadi context prompt untuk LLM Gemini.
