# Context Entity Contract — Knowledge Base Entity Specification

> **Status:** `DRAFT — TAHAP REVIEW BERSAMA`  
> Dokumen ini mendefinisikan struktur data terstandardisasi untuk entitas pengetahuan lokal (*context entities*) di dalam basis pengetahuan Pahami V2.

## 1. Definisi Entitas Konteks
Entitas konteks adalah representasi terstruktur dari fakta lokal, elemen budaya, bentang alam, tokoh inspiratif, kearifan lokal, komoditas ekonomi, atau sejarah di suatu wilayah administratif yang dapat diinjeksikan secara pedagogis ke dalam soal dan materi ajar.

## 2. Kategori Entitas (*Standard Categories*)
Untuk menjaga konsistensi ekstraksi dan retrieval, kategori entitas dikelompokkan ke dalam enum standar:
- `geography`: Bentang alam, sungai, gunung, iklim, topografi (misal: Telaga Sarangan, Sungai Bengawan Madiun, Gunung Lawu).
- `historical`: Peristiwa sejarah, situs purbakala, peninggalan era kolonial (misal: Pabrik Gula Pagottan, Trinil Ngawi).
- `cultural_tradition`: Upacara adat, kesenian daerah, festival rakyat (misal: Reog Ponorogo, Tari Gambyong, Larung Sesaji Telaga Ngebel).
- `culinary_craft`: Makanan khas, seni kriya, batik lokal (misal: Pecel Madiun, Brem Madiun, Kerajinan Kulit Magetan).
- `notable_figures`: Tokoh pejuang, pahlawan nasional, sastrawan, ilmuwan lokal (misal: KH Hasyim Asy'ari relasi pesantren Madiun, Suryo, dll).
- `local_economy`: Sektor mata pencaharian utama, industri spesifik, pasar tradisional (misal: PT INKA Kota Madiun, Sentra Susu Sapi Magetan).
- `flora_fauna`: Tumbuhan atau hewan endemik/khas (misal: Tanaman Porang Madiun, Jati Ngawi).

## 3. Struktur Entitas Konteks (Spesifikasi JSON)
```json
{
  "entity_id": "ctx_ent_3577_inka_01",
  "region_id": "35.77",
  "name": "PT Industri Kereta Api (INKA)",
  "category": "local_economy",
  "subcategory": "transportation_manufacturing",
  "description": "PT INKA (Persero) adalah industri manufaktur kereta api pertama dan terbesar di Asia Tenggara yang berbasis di Kota Madiun, memproduksi lokomotif, kereta rel diesel, dan gerbong penumpang untuk pasar nasional maupun ekspor.",
  "source_reference": {
    "source_type": "official_profile",
    "publisher": "Humas PT INKA / Pemkot Madiun",
    "year": 2024,
    "url": "https://www.inka.co.id",
    "verified_by": "member1_rag_engineer"
  },
  "verification_status": "verified",
  "educational_suitability": {
    "levels": ["SD", "SMP", "SMA"],
    "subjects": ["Matematika", "Fisika", "Ekonomi", "IPAS", "Geografi"],
    "keywords": ["kecepatan", "massa", "ekspor", "industri", "baja", "transportasi"],
    "pedagogical_notes": "Sangat cocok untuk soal fisika dinamika kereta api, perhitungan kapasitas penumpang, serta soal ekonomi perdagangan internasional."
  },
  "relationship_metadata": {
    "related_entities": ["ctx_ent_3577_stasiun_madiun", "ctx_ent_3577_politeknik_negeri_madiun"],
    "synonyms": ["INKA Madiun", "Pabrik Kereta Api Madiun"]
  },
  "created_at": "2026-09-23T00:00:00Z",
  "updated_at": "2026-09-23T00:00:00Z"
}
```

## 4. Penjelasan Field

| Field | Tipe | Keterangan |
| :--- | :--- | :--- |
| `entity_id` | `VARCHAR(64)` | Primary key unik, deterministik (misal: prefix `ctx_ent_` + kode region + slug). |
| `region_id` | `VARCHAR(16)` | Foreign key ke tabel wilayah (misal: `35.77`). Wajib valid sesuai [Region Contract](./region-contract.md). |
| `name` | `VARCHAR(255)` | Nama resmi entitas konteks. |
| `category` | `VARCHAR(64)` | Enum kategori utama (lihat bagian 2). |
| `subcategory` | `VARCHAR(64)` | Sub-kategori opsional untuk pengelompokan spesifik. |
| `description` | `TEXT` | Deskripsi informatif berbasis fakta lokal teruji (100–300 kata). |
| `source_reference` | `JSONB` | Jejak audit sumber data (tipe, penerbit, URL, kurator). |
| `verification_status`| `VARCHAR(32)` | Status validasi: `draft`, `in_review`, `verified`, atau `deprecated`. |
| `educational_suitability`| `JSONB` | Rekomendasi jenjang pendidikan (`SD`, `SMP`, `SMA`), mata pelajaran, dan kata kunci konteks. |
| `relationship_metadata` | `JSONB` | Hubungan antar entitas lokal lain dan sinonim pencarian. |

## 5. Batasan & Tanggung Jawab
- **Member 1 (Data & RAG):** Mengisi dan memvalidasi entitas melalui Python pipeline, menghasilkan *embedding* teks dari field `name`, `category`, `description`, dan `keywords`.
- **Member 2 (Full-Stack & AI):** Mengonsumsi entitas yang berstatus `verified` untuk injeksi prompt kontekstualisasi pada pembuatan soal dan materi ajar.
