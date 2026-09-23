# Region Contract — Administrative Hierarchy & Identifiers

> **Status:** `DRAFT — TAHAP REVIEW BERSAMA`  
> Dokumen ini mendefinisikan hierarki wilayah dan kode identifikasi standar untuk basis pengetahuan lokal Pahami V2.

## 1. Hierarki Wilayah Administratif
Sistem menggunakan hierarki 4-tingkat berbasis kode wilayah resmi Indonesia (BPS / Kemendagri):
```
Provinsi (Province)
  └── Kabupaten / Kota (Regency / City)
        └── Kecamatan (District)
              └── Kelurahan / Desa (Village / Subdistrict - Opsional)
```

## 2. Aturan Identifikasi (*Primary Identifier*)
- **Wajib menggunakan kode wilayah administratif standar** sebagai *Primary Identifier* (`region_id`), **bukan string nama** (karena rentan variasi ejaan seperti *Kabupaten* vs *Kab.*, atau *Kota* vs *Kotamadya*).
- Format standar: Kode numerik bertitik standar Kemendagri/BPS (contoh: `35.77` untuk Kota Madiun).
- Hierarki turunan menggunakan format gabungan:
  - Provinsi: `35`
  - Kabupaten/Kota: `35.77`
  - Kecamatan: `35.77.01`
  - Desa/Kelurahan: `35.77.01.1001` (opsional jika dibutuhkan pada resolusi mikro)

## 3. Cakupan Awal: Karesidenan Madiun (Madiun Residency Scope)
Prototipe Pahami V2 berfokus pada 6 wilayah administratif di Provinsi Jawa Timur (`35`):

| Region ID | Tipe | Nama Wilayah Resmi | Nama Populer / Wilayah | Scope Status |
| :--- | :--- | :--- | :--- | :--- |
| `35.77` | Kota | Kota Madiun | Madiun Kota (Pendekar) | Prioritas 1 |
| `35.19` | Kabupaten | Kabupaten Madiun | Madiun (Caruban) | Prioritas 1 |
| `35.21` | Kabupaten | Kabupaten Ngawi | Ngawi (Ramah) | Prioritas 1 |
| `35.20` | Kabupaten | Kabupaten Magetan | Magetan (Kaki Lawu) | Prioritas 1 |
| `35.02` | Kabupaten | Kabupaten Ponorogo | Ponorogo (Reog) | Prioritas 1 |
| `35.01` | Kabupaten | Kabupaten Pacitan | Pacitan (1001 Goa) | Prioritas 1 |

## 4. Skema Data Wilayah (Planned Database Schema / JSON)
```json
{
  "region_id": "35.77",
  "level": "regency_city",
  "name": "Kota Madiun",
  "province_id": "35",
  "province_name": "Jawa Timur",
  "residency": "Madiun",
  "postal_codes": ["63111", "63119"],
  "metadata": {
    "center_lat": -7.6298,
    "center_lng": 111.5239,
    "geographical_characteristics": ["urban", "dataran_rendah"],
    "economic_pillars": ["industri_kereta_api", "kuliner_pecel", "perdagangan"]
  }
}
```

## 5. Hubungan dengan Aplikasi
- **Member 1 (Data & RAG):** Mengaitkan setiap dokumen, entitas konteks, dan embedding vektor dengan `region_id` yang terstandarisasi.
- **Member 2 (Full-Stack & AI):** Menyimpan relasi sekolah, guru, kelas, serta materi/ujian dengan `region_id` pengguna untuk menentukan resolusi konteks yang relevan.
