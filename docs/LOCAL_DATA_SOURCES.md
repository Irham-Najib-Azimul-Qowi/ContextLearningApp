# Daftar Sumber Data Resmi: Local Knowledge Base (LKB) PAHAMI V2
**Dokumen:** `docs/LOCAL_DATA_SOURCES.md`  
**Status:** Terverifikasi & Aktif  
**Wilayah Cakupan:** Karesidenan Madiun (Jawa Timur) & Kota Semarang (Jawa Tengah)  
**Target Pembelajaran:** Kurikulum Merdeka Fase C (Kelas 5 SD)

---

## 1. Prinsip Kurasi Data
Dalam PAHAMI V2, Local Knowledge Base (LKB) tidak mengumpulkan seluruh informasi ensiklopedis tanpa tujuan. Data dipilih dengan kriteria:
1. **Relevansi Pedagogis Kelas 5 SD**: Dapat digunakan sebagai variabel soal cerita matematika (harga komoditas, bobot hasil panen, satuan panjang/waktu), teks bacaan deskriptif Bahasa Indonesia, atau materi interaksi sosial-lingkungan pada IPAS.
2. **Legalitas & Provenance**: Berasal dari publikasi terbuka Badan Pusat Statistik (BPS), portal Satu Data Indonesia, website resmi pemerintah daerah, atau basis data dengan lisensi terbuka yang sah.
3. **Pemisahan Administratif Tegas**: Kota Madiun (`35.77`) terpisah dari Kabupaten Madiun (`35.19`), dan Kota Semarang (`33.74`) terpisah mutlak dari Kabupaten Semarang (`33.22`).

---

## 2. Registry Sumber Data Terdaftar (`lkb_sources`)

| Source ID | Penerbit / Lembaga | Judul Publikasi | Wilayah | Lisensi | Metode Ingestion |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `src_bps_kota_madiun_2024` | BPS Kota Madiun | Kota Madiun Dalam Angka 2024 | Kota Madiun (`35.77`) | BPS Open Data | Kurasi Manual & Ekstraksi Fakta |
| `src_pemkot_madiun_official` | Pemkot Madiun | Portal Resmi Kota Madiun | Kota Madiun (`35.77`) | Public Domain Gov Portal | Kurasi Resmi Pemda |
| `src_pt_inka_official` | PT INKA (Persero) | Profil Perusahaan & Sejarah Perkeretaapian | Kota Madiun (`35.77`) | Profil Publik BUMN | Ekstraksi Data Fasilitas |
| `src_bps_kab_madiun_2024` | BPS Kabupaten Madiun | Kabupaten Madiun Dalam Angka 2024 | Kab. Madiun (`35.19`) | BPS Open Data | Data Pertanian Porang & Irigasi |
| `src_bps_kab_ngawi_2024` | BPS Kabupaten Ngawi | Kabupaten Ngawi Dalam Angka 2024 | Kab. Ngawi (`35.21`) | BPS Open Data | Statistik Kehutanan & Pertanian |
| `src_bps_kab_magetan_2024` | BPS Kabupaten Magetan | Kabupaten Magetan Dalam Angka 2024 | Kab. Magetan (`35.20`) | BPS Open Data | Pariwisata Sarangan & Industri Kulit |
| `src_bps_kab_ponorogo_2024` | BPS Kabupaten Ponorogo | Kabupaten Ponorogo Dalam Angka 2024 | Kab. Ponorogo (`35.02`) | BPS Open Data | Pertanian & Telaga Ngebel |
| `src_bps_kab_pacitan_2024` | BPS Kabupaten Pacitan | Kabupaten Pacitan Dalam Angka 2024 | Kab. Pacitan (`35.01`) | BPS Open Data | Perikanan Tangkap Tamperan |
| `src_bps_kota_semarang_2024` | BPS Kota Semarang | Kota Semarang Dalam Angka 2024 | Kota Semarang (`33.74`) | BPS Open Data | Statistik Perdagangan & Mobilitas |
| `src_pemkot_semarang_official` | Pemkot Semarang | Portal Informasi & Satu Data Kota Semarang | Kota Semarang (`33.74`) | Public Domain Gov Portal | Cagar Budaya & Sarana Publik |
| `src_pelabuhan_tanjung_emas` | Pelindo Regional 3 | Profil Pelabuhan Tanjung Emas | Kota Semarang (`33.74`) | Profil Publik Pelindo | Data Mobilitas Peti Kemas Laut |
| `src_kemdikbud_cagar_budaya` | Kemendikbudristek | Registrasi Warisan Budaya Takbenda | Nasional / Jawa | Hak Cipta Kementerian Terbuka | Reog Ponorogo, Benteng, Pecel |
| `src_wikimedia_commons_edu` | Wikimedia Commons | Wikimedia Commons Educational Media | Global / Indonesia | CC-BY-SA 3.0 / 4.0 / Public Domain | Aset Visual Foto Berlisensi Bebas |

---

## 3. Matriks Entitas Lokal Berdasarkan Wilayah

### 3.1 Kota Madiun (`35.77`)
- **PT INKA Madiun (`ctx_ent_3577_inka_01`)**: Industri manufaktur perkeretaapian. (Matematika: kecepatan kereta api, panjang gerbong; IPS: industri transportasi).
- **Nasi Pecel Madiun (`ctx_ent_3577_pecel_01`)**: Kuliner khas bumbu kacang daun jeruk. (Matematika: harga porsi, laba jual beli; Bahasa Indonesia: teks deskripsi).
- **Pasar Besar Kota Madiun (`ctx_ent_3577_pasar_besar_01`)**: Pusat perdagangan rakyat. (Matematika: berat timbangan kg/kuintal, transaksi).
- **Sungai Bengawan Madiun (`ctx_ent_3577_bengawan_madiun_01`)**: Aliran air lereng Gunung Wilis. (IPAS: daur air, pencegahan banjir).
- **Brem Padat Tradisional (`ctx_ent_3577_brem_01`)**: Olahan fermentasi ketan. (Matematika: pembagian kardus oleh-oleh, pecahan).

### 3.2 Kabupaten Madiun (`35.19`)
- **Komoditas Porang Saradan (`ctx_ent_3519_porang_01`)**: Umbi bernilai ekspor tinggi glukomanan. (Matematika: bobot panen kg, perkalian).
- **Waduk Bening Widas (`ctx_ent_3519_waduk_bening_01`)**: Waduk irigasi pertanian ratusan hektare. (Matematika: luas hektare, debit air).

### 3.3 Kabupaten Ngawi (`35.21`)
- **Benteng Pendem Van den Bosch (`ctx_ent_3521_benteng_pendem_01`)**: Cagar budaya benteng abad ke-19. (IPS: peninggalan sejarah kolonial).
- **Hutan Kayu Jati Ngawi (`ctx_ent_3521_kayu_jati_01`)**: Hutan jati tropis KPH Ngawi. (Matematika: volume kayu m3, penanaman bibit pohon).

### 3.4 Kabupaten Magetan (`35.20`)
- **Telaga Sarangan (`ctx_ent_3520_telaga_sarangan_01`)**: Danau vulkanik lereng Gunung Lawu 1.200 mdpl. (Matematika: keliling danau km, tiket wisata).
- **Sentra Kerajinan Kulit Gandu/Jalan Sawo (`ctx_ent_3520_kerajinan_kulit_01`)**: Kerajinan sepatu dan jaket kulit sapi. (Matematika: diskon persen, harga jual beli).

### 3.5 Kabupaten Ponorogo (`35.02`)
- **Kesenian Reog Ponorogo (`ctx_ent_3502_reog_ponorogo_01`)**: Warisan budaya Singo Barong dan dadak merak 40-50 kg. (Matematika: massa beban kg; Bahasa Indonesia: narasi budaya).
- **Telaga Ngebel (`ctx_ent_3502_telaga_ngebel_01`)**: Danau alami kaki Gunung Wilis 734 mdpl. (Matematika: keliling danau 5 km, kecepatan perahu).

### 3.6 Kabupaten Pacitan (`35.01`)
- **Goa Gong Pacitan (`ctx_ent_3501_goa_gong_01`)**: Gua karst stalaktit berbunyi mirip gong. (IPAS: pembentukan batuan karst; Matematika: panjang lorong meter).
- **Pelabuhan Perikanan Nusantara Tamperan (`ctx_ent_3501_ikan_tamperan_01`)**: Pusat perikanan tuna & cakalang pesisir selatan. (Matematika: timbangan tangkapan ikan kg/kuintal).

### 3.7 Kota Semarang (`33.74`) — Wilayah Prioritas Baru
- **Lawang Sewu Semarang (`ctx_ent_3374_lawang_sewu_01`)**: Gedung cagar budaya pintu dan jendela banyak kantor kereta api kolonial. (Matematika: simetri, hitungan pintu/jendela; IPS: sejarah transportasi).
- **Kawasan Kota Lama Semarang (`ctx_ent_3374_kota_lama_01`)**: Cagar budaya Eropa Little Netherland & Gereja Blenduk 1753. (Bahasa Indonesia: deskripsi arsitektur cagar budaya).
- **Pelabuhan Tanjung Emas (`ctx_ent_3374_tanjung_emas_01`)**: Pelabuhan peti kemas & kapal kargo laut Jawa. (Matematika: muatan peti kemas ton; IPS: perdagangan antarpulau).
- **Lumpia Semarang (`ctx_ent_3374_lumpia_semarang_01`)**: Kuliner akulturasi Tionghoa-Jawa isi rebung dan ayam/udang. (Matematika: perkalian porsi, bahan perbandingan).
- **Pasar Johar Semarang (`ctx_ent_3374_pasar_johar_01`)**: Pasar tradisional bersejarah karya Thomas Karsten. (Matematika: aritmetika sosial jual beli komoditas; IPS: rantai distribusi).

---

## 4. Kepatuhan Hak Cipta & Lisensi
1. Tidak ada data pribadi warga atau anak sekolah yang disimpan dalam basis data pengetahuan lokal.
2. Setiap entitas terhubung ke record bukti (`lkb_entity_evidence`) dengan peninjau (*reviewer*), nomor referensi bab publikasi, dan tautan sumber.
3. Semua gambar pendukung mematuhi atribusi Creative Commons (CC-BY-SA) atau Domain Publik Wikimedia.
