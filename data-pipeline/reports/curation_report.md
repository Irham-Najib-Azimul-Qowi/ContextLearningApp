# Laporan Kurasi & Provenance Basis Pengetahuan Lokal (LKB)
**Wilayah:** Karesidenan Madiun (Kota Madiun, Kab. Madiun, Ngawi, Magetan, Ponorogo, Pacitan)  
**Penyusun:** Anggota 1 (Data & RAG Engineer)  
**Tanggal:** 23 September 2026  
**Status:** `TERVERIFIKASI & DISETUJUI`

---

## 1. Ringkasan Eksekutif

Proses kurasi data dilakukan secara berjenjang dengan mengutamakan kualitas, keterlacakan sumber resmi (*provenance*), dan relevansi pedagogis untuk jenjang SD (Matematika, Bahasa Indonesia, IPS).

- **Total Entitas Terverifikasi:** 15 entitas utama tersebar di 6 wilayah
- **Total Wilayah Resmi:** 6 wilayah (Kota Madiun sebagai prioritas utama)
- **Sumber Data Terdaftar:** 10 sumber resmi legal (BPS, Pemda, OpenStreetMap ODbL, Kemendagri, Kemdikbud)
- **Status Tinjauan Manusia:** 100% data ditinjau manual tanpa klaim otomatis dari AI

---

## 2. Cakupan Wilayah dan Entitas Terverifikasi

### 1. Kota Madiun (`35.77`) — Wilayah Prioritas Utama
| Entity ID | Nama Kanonikal | Kategori | Subkategori | Sumber Resmi |
| :--- | :--- | :--- | :--- | :--- |
| `ctx_ent_3577_inka_01` | PT Industri Kereta Api (INKA) Madiun | `mobility` | `railway` | PT INKA Corporate Profile |
| `ctx_ent_3577_pecel_01` | Nasi Pecel Madiun | `culture` | `culinary` | Portal Resmi Pemkot Madiun |
| `ctx_ent_3577_pasar_besar_01` | Pasar Besar Kota Madiun | `built_environment` | `market` | BPS Kota Madiun Dalam Angka 2024 |
| `ctx_ent_3577_bengawan_madiun_01` | Sungai Bengawan Madiun | `geography` | `river` | OpenStreetMap POI & Geodata |
| `ctx_ent_3577_brem_01` | Brem Padat Tradisional | `culture` | `culinary` | BPS Kota Madiun Dalam Angka 2024 |

### 2. Kabupaten Madiun (`35.19`)
| Entity ID | Nama Kanonikal | Kategori | Subkategori | Sumber Resmi |
| :--- | :--- | :--- | :--- | :--- |
| `ctx_ent_3519_porang_01` | Komoditas Porang Saradan | `livelihood` | `plantation` | BPS Kab. Madiun Dalam Angka 2024 |
| `ctx_ent_3519_waduk_bening_01` | Waduk Bening Widas | `geography` | `lake` | BPS Kab. Madiun Dalam Angka 2024 |

### 3. Kabupaten Ngawi (`35.21`)
| Entity ID | Nama Kanonikal | Kategori | Subkategori | Sumber Resmi |
| :--- | :--- | :--- | :--- | :--- |
| `ctx_ent_3521_benteng_pendem_01` | Benteng Pendem Van den Bosch Ngawi | `built_environment` | `monument` | Kemdikbud Cagar Budaya |
| `ctx_ent_3521_kayu_jati_01` | Hutan Kayu Jati Ngawi | `livelihood` | `forestry` | BPS Kab. Ngawi Dalam Angka 2024 |

### 4. Kabupaten Magetan (`35.20`)
| Entity ID | Nama Kanonikal | Kategori | Subkategori | Sumber Resmi |
| :--- | :--- | :--- | :--- | :--- |
| `ctx_ent_3520_telaga_sarangan_01` | Telaga Sarangan Magetan | `geography` | `lake` | BPS Kab. Magetan Dalam Angka 2024 |
| `ctx_ent_3520_kerajinan_kulit_01` | Sentra Kerajinan Kulit Jalan Sawo Magetan | `livelihood` | `craftmanship` | BPS Kab. Magetan Dalam Angka 2024 |

### 5. Kabupaten Ponorogo (`35.02`)
| Entity ID | Nama Kanonikal | Kategori | Subkategori | Sumber Resmi |
| :--- | :--- | :--- | :--- | :--- |
| `ctx_ent_3502_reog_ponorogo_01` | Kesenian Reog Ponorogo | `culture` | `performing_arts` | Kemdikbud Warisan Budaya Takbenda |
| `ctx_ent_3502_telaga_ngebel_01` | Telaga Ngebel Ponorogo | `geography` | `lake` | BPS Kab. Ponorogo Dalam Angka 2024 |

### 6. Kabupaten Pacitan (`35.01`)
| Entity ID | Nama Kanonikal | Kategori | Subkategori | Sumber Resmi |
| :--- | :--- | :--- | :--- | :--- |
| `ctx_ent_3501_goa_gong_01` | Goa Gong Pacitan | `geography` | `cave` | BPS Kab. Pacitan Dalam Angka 2024 |
| `ctx_ent_3501_ikan_tamperan_01` | Pelabuhan Perikanan Nusantara Tamperan | `livelihood` | `fishery` | BPS Kab. Pacitan Dalam Angka 2024 |

---

## 3. Ketentuan Lisensi & Hak Redistribusi

1. **BPS (Badan Pusat Statistik):** Publikasi *Dalam Angka 2024* digunakan secara legal sebagai referensi statistik publik. Tidak ada buku utuh yang di-scrape secara otomatis.
2. **OpenStreetMap (ODbL 1.0):** Digunakan untuk koordinat dan bentang alam; atribusi `© OpenStreetMap contributors` dicantumkan pada field `attribution_note` di tabel `lkb_sources`.
3. **Kementerian Kebudayaan:** Referensi cagar budaya mengacu pada SK penetapan warisan budaya takbenda nasional terbuka.
