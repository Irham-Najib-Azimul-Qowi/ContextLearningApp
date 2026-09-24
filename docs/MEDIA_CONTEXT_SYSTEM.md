# Sistem Konteks Visual & Media Pendukung Pembelajaran PAHAMI V2
**Dokumen:** `docs/MEDIA_CONTEXT_SYSTEM.md`  
**Status:** Terimplementasi & Aktif  
**Fitur Utama:** Integrasi Media Pembelajaran Berlisensi Bebas untuk Siswa Kelas 5 SD  

---

## 1. Latar Belakang & Tujuan
Pembelajaran kontekstual pada jenjang Sekolah Dasar (terutama Kelas 5 SD, usia 10-11 tahun) sangat membutuhkan **dukungan visual** konkret. Siswa lebih mudah memahami soal cerita mengenai:
- Arsitektur gedung bersejarah (misal menghitung jendela di Lawang Sewu Semarang atau Benteng Van den Bosch Ngawi).
- Sarana mobilitas publik (misal Stasiun Kereta Api Madiun atau Pelabuhan Tanjung Emas).
- Kekayaan budaya & kesenian (misal penari Singo Barong dalam Reog Ponorogo).
- Bentang alam daerah (misal Telaga Sarangan Magetan atau Pantai Klayar Pacitan).

---

## 2. Prinsip Legalitas & Kebijakan Hak Cipta
Master Prompt menetapkan aturan ketat:
1. **Dilarang Scraping Liar**: Tidak mengambil foto secara otomatis dari Google Images atau website pemerintah yang berhak cipta tanpa izin.
2. **Prioritas Repositori Terbuka**: Menggunakan media edukatif dari **Wikimedia Commons** dengan lisensi resmi:
   - Creative Commons Attribution-ShareAlike 4.0 International (CC-BY-SA 4.0)
   - Creative Commons CC-BY-SA 3.0
   - Public Domain
3. **Kewajiban Atribusi**: Setiap media yang ditampilkan pada pratinjau soal guru, lembar pengerjaan ujian daring siswa, maupun ekspor cetak PDF A4 **wajib mencantumkan teks atribusi dan sumber lisensi yang sah**.
4. **Pencegahan Halusinasi AI**: Tidak menggunakan AI generatif untuk memalsukan foto dokumentasi cagar budaya atau lokasi nyata. Foto cagar budaya harus merupakan dokumentasi asli yang terverifikasi.

---

## 3. Struktur Skema Database (`lkb_media_assets`)

```sql
CREATE TABLE public.lkb_media_assets (
    media_id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    caption TEXT NOT NULL,
    alt_text TEXT NOT NULL,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    source_url TEXT NOT NULL,
    author TEXT NOT NULL,
    license_type TEXT NOT NULL DEFAULT 'Wikimedia Commons / CC-BY-SA',
    license_url TEXT,
    attribution_text TEXT NOT NULL,
    media_type TEXT NOT NULL DEFAULT 'image/jpeg',
    width INTEGER,
    height INTEGER,
    verification_status TEXT NOT NULL DEFAULT 'verified',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.lkb_entity_media_relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id TEXT NOT NULL REFERENCES public.lkb_entities(entity_id) ON DELETE CASCADE,
    media_id TEXT NOT NULL REFERENCES public.lkb_media_assets(media_id) ON DELETE CASCADE,
    is_primary BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT unique_entity_media UNIQUE (entity_id, media_id)
);
```

---

## 4. Katalog Aset Media yang Tersedia dalam Prototipe

| Media ID | Nama Entitas Terkait | Wilayah | Caption Edukasi | Lisensi & Atribusi |
| :--- | :--- | :--- | :--- | :--- |
| `med_lawang_sewu_01` | Lawang Sewu Semarang | Kota Semarang (`33.74`) | *"Lawang Sewu, bangunan bersejarah di Kota Semarang."* | Wikimedia Commons / CC-BY-SA 4.0 |
| `med_kota_lama_01` | Kawasan Kota Lama | Kota Semarang (`33.74`) | *"Gereja Blenduk di Kawasan Kota Lama Semarang."* | Wikimedia Commons / CC-BY-SA 3.0 |
| `med_tanjung_emas_01` | Pelabuhan Tanjung Emas | Kota Semarang (`33.74`) | *"Pelabuhan Tanjung Emas, mobilitas logistik laut Semarang."* | Pelindo / Wikimedia Commons / CC |
| `med_lumpia_semarang_01`| Lumpia Khas Semarang | Kota Semarang (`33.74`) | *"Lumpia Semarang, kuliner tradisional akulturasi rebung."* | Wikimedia Commons / CC-BY-SA 4.0 |
| `med_pasar_johar_01` | Pasar Johar Semarang | Kota Semarang (`33.74`) | *"Pasar Johar Semarang, pusat perniagaan tradisional."* | Wikimedia Commons / CC-BY-SA 4.0 |
| `med_reog_ponorogo_01` | Kesenian Reog Ponorogo | Kab. Ponorogo (`35.02`) | *"Kesenian Reog Ponorogo dengan topeng Singo Barong."* | Kemdikbud / Wikimedia / CC-BY-SA |
| `med_stasiun_madiun_01` | Stasiun / PT INKA Madiun | Kota Madiun (`35.77`) | *"Stasiun Madiun, simpul transportasi perkeretaapian."* | PT KAI / Wikimedia Commons / CC |
| `med_sarangan_magetan_01`| Telaga Sarangan Magetan| Kab. Magetan (`35.20`) | *"Telaga Sarangan di lereng Gunung Lawu, Magetan."* | Wikimedia Commons / CC-BY-SA 4.0 |
| `med_benteng_ngawi_01` | Benteng Van den Bosch | Kab. Ngawi (`35.21`) | *"Benteng Pendem Van den Bosch di Kabupaten Ngawi."* | Wikimedia Commons / CC-BY-SA 3.0 |
| `med_klayar_pacitan_01` | Pantai Klayar & Karst | Kab. Pacitan (`35.01`) | *"Pantai Klayar dengan bentang karang di Pacitan."* | Wikimedia Commons / CC-BY-SA 4.0 |

---

## 5. Integrasi End-to-End pada Modul Aplikasi
1. **Retrieval**: Saat guru membuat soal di Kota Semarang atau Madiun, RPC menyertakan `primary_media`.
2. **Pratinjau Guru (`context-preview`)**: Guru dapat melihat thumbnail gambar dan mencentang opsi *"Sertakan Gambar Pendukung"*.
3. **Ujian Daring Siswa (`student/examinations`)**: Gambar ditampilkan secara responsif di atas opsi jawaban dengan rasio aspek terjaga di layar smartphone maupun komputer sekolah.
4. **Ekspor Lembar Cetak A4 (`teacher/print/exam/[id]`)**: Gambar dicetak dalam resolusi optimal dengan keterangan atribusi di bawahnya tanpa memakan ruang berlebihan atau merusak tata letak halaman.
