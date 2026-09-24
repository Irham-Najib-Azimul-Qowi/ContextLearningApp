# Rekomendasi Revisi Total Pahami: Fokus pada AI Contextual Learning Engine

Saya memahami arah baru yang kalian inginkan. Menurut saya, keputusan untuk menyederhanakan Pahami dan memusatkan pengembangan pada fitur kontekstualisasi soal serta materi merupakan langkah yang tepat untuk prototype hackathon kalian.

Dari perkembangan proyek yang sudah kita diskusikan, sistem Pahami sempat berkembang menjadi platform pendidikan yang sangat luas: ada manajemen sekolah, akun guru dan murid, admin, kelas, API key, materi, ujian, dan banyak fitur lainnya.

Padahal, permasalahan utama yang ingin kalian selesaikan adalah bagaimana membuat materi dan soal pembelajaran menjadi lebih relevan dengan kondisi geografis, sosial, ekonomi, dan budaya di lingkungan siswa.

Menurut saya, prototype yang sekarang perlu dikembangkan sebagai sebuah sistem dengan identitas utama:

Konsep baru Pahami

# Pahami

## AI-Powered Contextual Learning Engine

Platform yang membantu guru membuat, menganalisis, dan mengadaptasi materi serta soal pembelajaran berdasarkan pengetahuan lokal suatu wilayah.

Fokus inovasi

Materi dan soal pembelajaran

Identifikasi variabel kontekstual

Pencarian pengetahuan lokal berbasis RAG

Materi dan soal sesuai konteks wilayah

Saya akan membahas terlebih dahulu rancangan yang menurut saya perlu kita tetapkan, terutama pendekatan AI, pengelolaan data wilayah Indonesia, dan hubungan antara materi, soal, serta ujian.

Setelah konsep ini disepakati, barulah kita membuat satu master prompt untuk AI Agent agar revisi sistem tidak menghasilkan arsitektur yang kembali terlalu kompleks.

# 1. Tentukan terlebih dahulu batas prototype

Saya menyarankan kita membagi fitur Pahami menjadi empat modul utama.

## 1. Local Knowledge Engine

Mengelola pengetahuan mengenai wilayah Indonesia dan mengambil konteks yang relevan untuk digunakan dalam pembelajaran.

## 2. Material & Question Studio

Tempat guru memasukkan, memotret, membuat, menganalisis, dan mengontekstualisasikan materi maupun soal.

## 3. Assessment & Distribution

Membagikan materi dan soal melalui URL, menyelenggarakan ujian daring, mencetak soal, serta melakukan koreksi jawaban.

## 4. Prototype Configuration

Pengaturan sederhana untuk lokasi sekolah, jenjang, kelas, konfigurasi AI, dan data pengetahuan lokal. Tidak perlu membangun sistem administrasi SaaS yang lengkap.

Untuk sementara, pengguna yang mengoperasikan sistem adalah guru. Siswa hanya mengakses materi atau ujian melalui tautan yang dibagikan, tanpa perlu membuat akun.

Fitur seperti pendaftaran sekolah, manajemen banyak guru, dashboard admin yang kompleks, dan sistem multi-tenant lengkap dapat kita keluarkan dari cakupan prototype.

Namun, pengamanan akses guru dan data ujian tetap diperlukan. Tidak adanya halaman login bukan berarti seluruh endpoint aplikasi boleh diakses secara bebas.

# 2. Teknologi RAG: Apakah sebaiknya menggunakan ChromaDB?

Pertama, saya ingin meluruskan sedikit konsep yang kalian sebutkan.

Kalian tidak hanya membutuhkan RAG, tetapi membutuhkan kombinasi antara:

Structured Local Knowledge Base + Semantic Retrieval + Context Mapping + Controlled Text Generation.

RAG merupakan bagian dari sistem tersebut.

## Apa sebenarnya fungsi RAG?

Misalnya seorang guru berada di wilayah Samarinda dan ingin mengontekstualisasikan materi mengenai kegiatan ekonomi.

Sistem perlu mengetahui kegiatan ekonomi apa saja yang relevan di wilayah tersebut.

Alih-alih meminta Gemini menebak karakteristik Samarinda, sistem mengambil informasi dari pengetahuan lokal yang telah disiapkan.

Kebutuhan konteks

Aktivitas ekonomi, transportasi sungai, dan kondisi geografis wilayah Samarinda.

Knowledge Retrieval

Mencari data wilayah Samarinda dari basis pengetahuan yang sudah diindeks.

Konteks ditemukan

Sungai Mahakam, transportasi sungai, kegiatan perdagangan, pasar, dan karakteristik lingkungan sekitar sungai.

Contextualization Engine

Menggunakan hasil pencarian untuk menyesuaikan materi dan soal.

Poin terpentingnya adalah AI menggunakan data lokal yang telah disiapkan sebagai referensi, bukan mengandalkan pengetahuan internal model semata.

Namun, hasil pencarian vektor tidak otomatis menjamin kebenaran informasi. Karena itu, kita tetap membutuhkan metadata wilayah, sumber, dan validasi.

## ChromaDB atau PostgreSQL + pgvector?

## ChromaDB

Alternatif

ChromaDB mendukung penyimpanan embedding, metadata, dan pencarian semantik. Chroma juga menyediakan penyimpanan lokal untuk pengembangan dan server untuk penggunaan melalui jaringan.

![](https://www.google.com/s2/favicons?domain=https://docs.trychroma.com\&sz=32)

Chroma Docs

+1

Cocok jika kalian ingin menjalankan eksperimen RAG secara terpisah, terutama menggunakan Python. Akan tetapi, penggunaan server Chroma terpisah menambah komponen infrastruktur yang harus dikelola.

## PostgreSQL + pgvector

Rekomendasi saya

PostgreSQL dapat menyimpan fakta wilayah, metadata, dan embedding melalui ekstensi pgvector. Supabase juga mendukung pencarian gabungan antara pencarian teks dan kemiripan semantik.

![](https://www.google.com/s2/favicons?domain=https://supabase.com\&sz=32)

Supabase Docs

+1

Cocok dengan proyek Next.js dan Supabase yang sudah kalian bangun, karena data sekolah, soal, materi, dan konteks dapat dikelola dalam satu database.

Saya menyarankan tetap menggunakan Supabase PostgreSQL, kemudian menambahkan pgvector.

Kalian tidak perlu memindahkan semua data ke ChromaDB hanya karena ingin mengimplementasikan RAG.

Untuk skala prototype, pgvector sudah dapat digunakan membangun mekanisme retrieval yang dibutuhkan. Apabila nantinya ada alasan performa atau infrastruktur yang jelas, kalian dapat mengevaluasi penggunaan ChromaDB sebagai layanan vector database terpisah.

# 3. Bagaimana menyiapkan data konteks wilayah Indonesia?

Ini menurut saya merupakan bagian terpenting sekaligus pekerjaan yang perlu dirancang paling matang.

Jangan menjadikan prosesnya sekadar:

`Cari informasi wilayah → masukkan semua teks ke vector database.`

Cara tersebut belum cukup karena sistem harus membedakan antara nama tempat, pekerjaan, kegiatan ekonomi, budaya, dan fakta yang benar-benar sesuai dengan wilayah sekolah.

Saya menyarankan membangun sebuah komponen bernama:

## Indonesian Local Knowledge Base (ILKB)

ILKB adalah basis pengetahuan lokal yang akan menjadi sumber utama Contextualization Engine Pahami.

### 3.1 Kategori data yang perlu disiapkan

|
Kategori

|

Informasi yang disimpan

|
| --- | --- |
|

Administratif

|

Provinsi, kabupaten/kota, kecamatan, desa/kelurahan, kode wilayah

|
|

Geografi

|

Sungai, danau, gunung, pantai, dataran, pegunungan, karakteristik lingkungan

|
|

Infrastruktur

|

Pasar, terminal, stasiun, pelabuhan, jembatan, bangunan umum

|
|

Transportasi

|

Angkutan darat, transportasi sungai, transportasi laut, angkutan lokal

|
|

Ekonomi

|

Perdagangan, pertanian, perikanan, peternakan, industri, pariwisata

|
|

Profesi

|

Petani, nelayan, pedagang, pengrajin, pekerja industri, dan pekerjaan lokal lainnya

|
|

Komoditas

|

Hasil pertanian, perikanan, kerajinan, produk unggulan, makanan lokal

|
|

Sosial

|

Kegiatan masyarakat, aktivitas sehari-hari, gotong royong, kegiatan komunitas

|
|

Budaya

|

Kesenian, adat, tradisi, pakaian, kuliner, permainan tradisional

|
|

Lingkungan

|

Ekosistem, kondisi alam, pemanfaatan sumber daya, isu lingkungan lokal

|
|

Sejarah

|

Peristiwa, tokoh, bangunan bersejarah, asal-usul wilayah yang terverifikasi

|
|

Konteks keseharian

|

Aktivitas sekolah, pasar, perjalanan, belanja, permainan, dan kegiatan rumah tangga

|

Data juga sebaiknya mencakup hubungan antarkategori.

Misalnya, jenis transportasi tertentu berkaitan dengan karakteristik geografisnya. Profesi berkaitan dengan kegiatan ekonomi, sementara komoditas dapat berhubungan dengan hasil produksi lokal.

Hal ini memungkinkan AI membangun cerita yang masuk akal, bukan sekadar mengganti satu nama benda dengan nama benda lain.

### 3.2 Jangan langsung mengejar seluruh Indonesia

Saya menyarankan menggunakan strategi bertahap.

Tahap prototype

## Tiga wilayah percontohan

Pilih wilayah yang memiliki karakteristik cukup berbeda untuk memperlihatkan kemampuan adaptasi konteks.

Ponorogo atau Madiun

Contoh konteks pertanian, pasar, transportasi, kesenian, dan karakteristik wilayah setempat.

Samarinda

Contoh konteks sungai, transportasi perairan, perdagangan, dan kehidupan masyarakat di sekitar Sungai Mahakam.

Satu wilayah pesisir

Contoh konteks perikanan, pelabuhan, aktivitas pesisir, dan lingkungan laut yang diambil dari wilayah pilihan kalian.

Tiga wilayah ini merupakan usulan dataset awal, bukan batas arsitektur.

Struktur database tetap harus mendukung seluruh wilayah Indonesia, sehingga penambahan data nantinya tidak memerlukan perubahan besar pada sistem.

Keberhasilan prototype sebaiknya dinilai dari kualitas data dan akurasi kontekstualisasi, bukan jumlah nama wilayah yang tersedia.

# 4. Sumber data yang dapat kalian gunakan

Kalian tidak perlu menyusun seluruh data pengetahuan lokal secara manual.

Ada beberapa sumber yang dapat menjadi fondasi, meskipun tidak ada satu sumber yang memuat seluruh karakteristik geografis, ekonomi, sosial, dan budaya Indonesia sekaligus.

![](https://www.google.com/s2/favicons?domain=https://data.go.id\&sz=32)

Satu Data Indonesia

Portal dataset pemerintah untuk mencari data sektoral dan kewilayahan, seperti ekonomi, infrastruktur, dan pendidikan. Ketersediaan serta kelengkapan data berbeda antarwilayah.

![](https://www.google.com/s2/favicons?domain=https://data.go.id\&sz=32)

Dataset

Akses portal dataset 

![](https://www.google.com/s2/favicons?domain=https://www.bps.go.id\&sz=32)

Badan Pusat Statistik (BPS)

Data statistik wilayah, ekonomi, penduduk, dan publikasi daerah. WebAPI BPS menyediakan akses terprogram ke berbagai publikasi dan tabel statistik.

![](https://www.google.com/s2/favicons?domain=https://webapi.bps.go.id\&sz=32)

webapi.bps.go.id

WebAPI BPS 

![](https://www.google.com/s2/favicons?domain=https://www.openstreetmap.org\&sz=32)

OpenStreetMap

Data geografis mengenai tempat, jalan, fasilitas, pasar, bangunan, dan infrastruktur. Data OSM menggunakan lisensi ODbL yang memiliki ketentuan atribusi dan penggunaan ulang.

![](https://www.google.com/s2/favicons?domain=https://www.openstreetmap.org\&sz=32)

OpenStreetMap

Akses OpenStreetMap 

![](https://www.google.com/s2/favicons?domain=https://www.wikidata.org\&sz=32)

Wikidata

Data terstruktur mengenai wilayah, tempat, sejarah, budaya, tokoh, dan berbagai entitas lainnya. Data terstruktur Wikidata disediakan dengan lisensi CC0.

![](https://www.google.com/s2/favicons?domain=https://www.wikidata.org\&sz=32)

Wikidata

+1

Akses Wikidata 

Selain sumber tersebut, kalian dapat menggunakan publikasi pemerintah daerah, dinas kebudayaan, dinas pariwisata, dan informasi yang diverifikasi guru setempat.

Saran saya, data dari sumber eksternal dikumpulkan melalui proses terpisah, bukan melakukan pencarian internet setiap kali guru membuat soal.

Untuk data OpenStreetMap, jangan menggunakan server Overpass publik sebagai backend pengumpulan data nasional secara massal. Server publik memiliki batas penggunaan dan tidak dirancang untuk beban ekstraksi besar secara terus-menerus.

![](https://www.google.com/s2/favicons?domain=https://wiki.openstreetmap.org\&sz=32)

OpenStreetMap Wiki

# 5. Bagaimana data disimpan, di-chunking, dan di-index?

Di sinilah saya menyarankan pendekatan yang sedikit berbeda dari RAG dokumen biasa.

Tidak semua konteks perlu di-chunking dan diubah menjadi vektor.

Nama pasar, nama sungai, kategori pekerjaan, dan kode wilayah merupakan data terstruktur.

Sementara itu, uraian tentang aktivitas masyarakat, budaya, dan kondisi ekonomi dapat disimpan sebagai potongan teks yang kemudian diubah menjadi embedding.

Jadi, sistem memiliki dua lapisan data.

Layer 1

## Structured Knowledge

Data fakta dan entitas yang dapat dicari secara pasti menggunakan ID wilayah, kategori, dan atribut lainnya.

Contoh: `region_id`, `entity_type`, `entity_name`, `source`, `verification_status`.

Layer 2

## Semantic Knowledge

Uraian singkat mengenai karakteristik dan hubungan antarkonteks yang disimpan bersama embedding untuk pencarian semantik.

Contoh: deskripsi pemanfaatan Sungai Mahakam dalam kehidupan masyarakat dan kegiatan ekonomi.

## Contoh struktur data

Misalnya sistem menyimpan informasi mengenai Sungai Mahakam.

JSON

```
{
  "id": "ctx_mahakam_001",
  "region_id": "REGION_SAMARINDA",
  "entity_name": "Sungai Mahakam",
  "category": "geography",
  "subcategory": "river",
  "context_tags": [
    "transportation",
    "economy",
    "environment"
  ],
  "description": "Sungai Mahakam merupakan bagian penting dari kondisi geografis dan aktivitas transportasi sungai di Samarinda.",
  "source_url": "URL_SUMBER_TERVERIFIKASI",
  "verification_status": "verified",
  "embedding": "VECTOR_GENERATED_BY_EMBEDDING_MODEL"
}
```

Contoh tersebut merupakan rancangan format data, bukan hasil ekstraksi dataset sungguhan.

Field `embedding` nantinya berisi representasi numerik dari teks yang dihasilkan embedding model.

### Apakah data harus di-chunking?

Untuk dokumen sumber yang panjang, iya.

Misalnya kalian memperoleh dokumen publikasi mengenai kondisi ekonomi suatu kabupaten.

Daripada memasukkan seluruh dokumen sebagai satu embedding, pecah menjadi bagian berdasarkan topik:

* Pertanian.

* Perikanan.

* Perdagangan.

* Transportasi.

* Industri.

Setiap bagian disimpan sebagai satu atau beberapa potongan yang memiliki metadata sumber, wilayah, dan kategori.

Namun, untuk data seperti `Nama pasar: Pasar X`, tidak perlu membuat potongan teks panjang. Simpan sebagai entitas terstruktur.

Dengan pendekatan ini, pencarian menjadi lebih akurat dan pemeliharaan data lebih mudah.

# 6. Bagaimana data lokal dipilih untuk mengganti isi materi atau soal?

Ini bagian yang paling saya sarankan kalian jadikan inovasi utama.

Sistem harus memahami dua hal yang berbeda:

1. Bagian mana dari soal atau materi yang boleh diubah?

2. Konteks lokal apa yang sesuai untuk menggantikan bagian tersebut?

Keduanya sebaiknya ditangani oleh komponen berbeda.

## Tahap A — Context Variable Extraction

Misalnya guru memasukkan soal:

> Seorang petani memiliki 20 kilogram beras. Sebanyak 8 kilogram dijual di sebuah pasar. Berapa kilogram beras yang tersisa?

Gemini menganalisis soal dan mengidentifikasi variabel:

JSON

```
{
  "variables": [
    {
      "id": "var_01",
      "original_text": "petani",
      "category": "occupation",
      "replaceable": true
    },
    {
      "id": "var_02",
      "original_text": "beras",
      "category": "commodity",
      "replaceable": true
    },
    {
      "id": "var_03",
      "original_text": "sebuah pasar",
      "category": "location",
      "replaceable": true
    },
    {
      "id": "var_04",
      "original_text": "20 kilogram",
      "category": "quantity",
      "replaceable": false
    }
  ]
}
```

Untuk prototype, saya menyarankan menggunakan Gemini dengan structured output untuk analisis awal.

Kalian belum membutuhkan model NLP buatan sendiri karena proses yang paling sulit bukan sekadar mendeteksi kata benda, tetapi memahami apakah perubahan sebuah frasa akan mengubah makna pembelajaran.

Namun, hasil deteksi Gemini harus tetap dapat diperbaiki oleh guru.

## Tahap B — Context Retrieval

Misalnya guru memilih wilayah Ponorogo.

Sistem kemudian mencari kandidat entitas berdasarkan metadata:

```
Wilayah: Ponorogo

Kategori:
- occupation
- commodity
- location

Kebutuhan:
- Cocok untuk materi operasi hitung
- Sesuai untuk siswa kelas 5
- Entitas memiliki sumber yang dapat ditelusuri
```

Penting: jangan mencari seluruh Indonesia terlebih dahulu lalu hanya memilih hasil yang paling mirip secara semantik.

Lakukan penyaringan wilayah dan kategori sebagai batasan utama. Setelah itu, gunakan pencarian semantik untuk menentukan kandidat yang relevan.

Jika tidak ditemukan data kecamatan, sistem dapat menggunakan konteks kabupaten atau provinsi yang benar-benar sesuai, dengan penanda bahwa konteks berasal dari wilayah yang lebih luas.

## Tahap C — Context Mapping

Hasil retrieval menghasilkan kandidat pengganti.

```
[OCCUPATION] → petani

[COMMODITY] → jagung

[LOCATION] → pasar setempat
```

Namun, pencocokan ini tidak boleh berdasarkan kemiripan vektor saja.

Sistem harus memeriksa kategori dan hubungan antarkonteks. Misalnya, apabila konteks profesinya adalah nelayan, komoditas yang dipilih harus masuk akal untuk aktivitas profesi tersebut.

## Tahap D — Contextual Rewriting

Hasil akhirnya:

Soal asli

Seorang petani memiliki 20 kilogram beras. Sebanyak 8 kilogram dijual di sebuah pasar. Berapa kilogram beras yang tersisa?

Soal kontekstual

Seorang petani di Ponorogo memiliki 20 kilogram jagung. Sebanyak 8 kilogram dijual di pasar setempat. Berapa kilogram jagung yang tersisa?

Jawaban tetap: 12 kilogram.

Angka, operasi hitung, dan tujuan pembelajaran dipertahankan.

Untuk penggantian sederhana seperti contoh tersebut, gunakan algoritma TypeScript.

Untuk materi dengan paragraf panjang, soal Bahasa Indonesia, atau kasus yang membutuhkan penyesuaian struktur kalimat, Gemini dapat membantu proses penulisan ulang.

Jadi, Gemini tidak perlu dipanggil setiap kali satu kata akan diganti.

# 7. Gunakan struktur variabel yang lebih aman daripada sekadar tanda kurung siku

Saya menyarankan menggunakan placeholder yang mempunyai ID unik dan metadata, bukan hanya `[LOKASI]` atau `[PEKERJAAN]`.

Contohnya:

```
Seorang {{occupation_01}} memiliki
20 kilogram {{commodity_01}}.

Sebanyak 8 kilogram dijual di
{{market_01}}.

Berapa kilogram {{commodity_01}}
yang tersisa?
```

Placeholder `commodity_01` digunakan dua kali karena keduanya harus diganti dengan komoditas yang sama.

Jika keduanya diganti secara independen, sistem bisa menghasilkan kalimat yang tidak konsisten.

Di database, setiap placeholder memiliki kategori, teks asal, konteks yang diperbolehkan, dan aturan validasi.

Pada tampilan editor, guru tidak perlu melihat kode placeholder mentah. Sistem dapat menyorot frasa yang bisa diubah, kemudian menampilkan pilihan alternatif konteks ketika frasa tersebut diklik.

Untuk Matematika, angka dan hubungan matematis dapat dikunci. Untuk Bahasa Indonesia, perubahan bacaan harus diikuti pemeriksaan ulang pertanyaan dan jawaban yang bergantung pada bacaan tersebut.

# 8. Rekomendasi AI: Gemini, model lokal, atau model sendiri?

Saya menyarankan menggunakan kombinasi tiga pendekatan berikut.

|
Kebutuhan

|

Rekomendasi

|
| --- | --- |
|

Generate materi dan soal

|

Gemini API

|
|

Membaca foto soal dan materi

|

Gemini multimodal

|
|

Identifikasi frasa kontekstual

|

Gemini structured output

|
|

Menghasilkan embedding konteks

|

Model embedding multibahasa

|
|

Mengambil data konteks

|

PostgreSQL + pgvector

|
|

Penggantian placeholder sederhana

|

TypeScript

|
|

Penulisan ulang paragraf kompleks

|

Gemini API

|
|

Validasi operasi hitung dasar

|

Algoritma deterministik

|
|

Koreksi pilihan ganda

|

Algoritma deterministik

|
|

Koreksi esai

|

Guru, dengan bantuan transkripsi apabila diperlukan

|

Untuk embedding, kalian dapat menguji model multibahasa seperti multilingual-e5 atau model embedding lain yang sesuai dengan teks bahasa Indonesia.

Embedding model tidak harus sama dengan model generatif. Data yang sudah diindeks menggunakan satu embedding model harus dicari dengan model dan konfigurasi embedding yang kompatibel.

Saya tidak menyarankan melatih model bahasa dari nol untuk prototype. Jika nantinya data lokal dan contoh kontekstualisasi telah terkumpul dalam jumlah memadai, kalian bisa mengevaluasi model khusus atau fine-tuning.

# 9. Alur baru untuk materi dan soal

Saya menyarankan membuat satu workspace utama bernama Studio Pembelajaran.

Di dalamnya, guru dapat memilih membuat materi atau soal.

## Studio Pembelajaran

Guru memilih materi atau soal

Materi

Tulis, upload, foto, atau generate AI.

Soal

Tulis, upload, foto, atau generate AI.

Analisis Variabel Kontekstual

Pencarian dan Pemetaan Konteks Wilayah

Editor & Preview

Bandingkan hasil, edit, dan setujui.

Simpan & Bagikan

Cetak

Kalian juga menyebutkan bahwa sistem harus bisa menghasilkan soal dari materi.

Fitur ini menurut saya perlu menjadi salah satu alur utama.

Guru cukup membuka materi yang sudah dibuat, lalu memilih tombol Buat Soal dari Materi.

Sistem menghasilkan soal berdasarkan isi materi tersebut, bukan berdasarkan topik umum yang mungkin tidak sesuai dengan apa yang sudah dipelajari siswa.

Soal yang dihasilkan dapat berupa pilihan ganda atau esai dan harus melalui peninjauan guru sebelum diterbitkan.

# 10. Mekanisme berbagi materi dan ujian

Saya setuju untuk menghilangkan kebutuhan login siswa pada tahap prototype.

Namun, saya menyarankan membedakan mekanisme berbagi materi dan akses ujian.

## Materi pembelajaran

Guru dapat membagikan materi melalui tautan khusus.

Contoh:

`pahami.app/materi/abc123`

Siswa membuka tautan tersebut dan langsung membaca materi tanpa membuat akun.

Materi yang dapat dibagikan harus berstatus terbit dan hanya berisi konten yang memang disetujui guru untuk dibagikan.

## Ujian daring

Siswa mengakses:

`pahami.app/ujian`

Kemudian sistem menampilkan:

# Masuk Ujian

Masukkan kode ujian yang diberikan guru.

Kode ujian

## A7K9P2

Gabung Ujian

Kode tersebut merupakan kode akses ujian, bukan OTP autentikasi pengguna.

Setelah memasukkan kode, siswa dapat mengisi nama dan nomor peserta yang diberikan guru, kemudian mengerjakan ujian.

Namun, karena tidak menggunakan akun, nomor peserta dan kode ujian saja tidak memberikan jaminan identitas yang kuat. Untuk prototype, guru dapat membagikan token peserta unik agar hasil ujian dapat dipetakan ke siswa yang benar dan mencegah pengiriman ganda secara sederhana.

Sistem harus tetap membatasi percobaan kode, mengamankan kunci jawaban, menyimpan progres pengerjaan, serta mengontrol jadwal dan durasi ujian di server.

# 11. Mekanisme print dan koreksi scan

Saya menyarankan menggunakan lembar jawaban standar agar proses koreksi lebih dapat diandalkan.

Jangan membiarkan guru memotret sembarang lembar jawaban dengan tata letak yang tidak konsisten, lalu mengharapkan AI selalu mampu mendeteksi semua jawaban secara akurat.

Untuk pilihan ganda, gunakan format lembar jawaban yang memiliki kotak atau lingkaran jawaban dengan posisi tetap.

## Alur ujian cetak

Guru membuat dan menyetujui soal

Cetak soal dan lembar jawaban standar

Siswa mengerjakan ujian di kertas

Guru memotret lembar jawaban

Optical Mark Recognition (OMR)

Review hasil → Koreksi → Simpan nilai

Untuk pilihan ganda, saya menyarankan menggunakan OpenCV dan algoritma OMR apabila format lembar jawaban sudah ditentukan.

Dengan demikian, sistem tidak perlu menggunakan Gemini untuk membaca setiap jawaban pilihan ganda.

Untuk esai, Gemini dapat digunakan sebagai alat bantu transkripsi tulisan tangan menjadi teks. Namun, hasil ekstraksi perlu ditinjau guru, terutama apabila tulisan tangan tidak terbaca dengan jelas.

Penilaian akhir esai tetap dilakukan guru.

Pastikan sistem menyimpan versi soal dan kunci jawaban saat ujian diterbitkan. Jangan menghitung ulang jawaban berdasarkan versi soal yang sudah diedit setelah ujian dilaksanakan.

# 12. Arsitektur teknis yang saya sarankan

Untuk revisi ini, saya menyarankan mempertahankan sebagian besar teknologi yang sudah digunakan agar kalian tidak perlu membangun ulang seluruh proyek.

Pahami Web

Next.js + TypeScript + Tailwind CSS

## Application Backend

Material & Question Studio

Assessment Engine

Contextualization Engine

Local Knowledge Retrieval

Supabase

PostgreSQL, pgvector, Storage, soal, materi, fakta dan embedding konteks

Gemini API

Generasi, analisis bahasa, ekstraksi foto, dan penulisan ulang

Image Processing Service (opsional)

Python + OpenCV untuk koreksi lembar jawaban cetak.

Saya menyarankan memisahkan proses pengumpulan data wilayah dari aplikasi utama.

Gunakan script atau pipeline ingestion untuk mengambil data sumber, melakukan pembersihan, ekstraksi fakta, pengelompokan wilayah, pembuatan embedding, dan pengindeksan.

Proses tersebut dapat dilakukan sebelum demonstrasi, sehingga aplikasi tidak harus mengumpulkan ulang data wilayah saat guru sedang membuat materi.

# 13. Struktur halaman Pahami yang baru

Untuk prototype ini, saya menyarankan menghapus sebagian besar menu yang tidak berkaitan dengan inovasi inti.

Navigasi cukup memiliki lima kelompok utama.

Beranda

Ringkasan karya guru dan akses cepat ke pembuatan materi atau soal.

Studio Pembelajaran

Buat materi, buat soal, generate dari AI, foto soal, generate soal dari materi, dan kontekstualisasi.

Konteks Wilayah

Pilih wilayah, lihat karakteristik lokal, dan kelola data yang digunakan sistem.

Ujian

Buat ujian, bagikan kode, cetak soal, koreksi jawaban, dan lihat hasil.

Pengaturan

Konfigurasi prototype dan layanan AI. Tidak memerlukan dashboard admin terpisah.

Ketika guru sedang mengedit materi, halaman sebaiknya memusatkan tampilan pada editor, hasil analisis, dan preview kontekstualisasi.

Jangan memenuhi halaman dengan kartu statistik, menu tambahan, atau penjelasan panjang yang tidak membantu proses tersebut.

# 14. Bagaimana dengan fitur login yang ingin dihapus?

Saya setuju untuk menghapus alur registrasi dan manajemen sekolah yang kompleks dari prototype.

Tetapi saya tidak menyarankan membuat aplikasi yang benar-benar terbuka tanpa perlindungan.

Setidaknya, sistem harus mempunyai mekanisme akses terbatas untuk workspace guru.

Untuk demonstrasi, kalian dapat menggunakan satu akun guru demo atau akses guru yang dikonfigurasi sebelumnya tanpa menyediakan halaman registrasi publik.

Akses materi dan ujian siswa tetap menggunakan tautan atau kode yang disediakan guru.

Endpoint untuk mengubah materi, membuat soal, menjalankan Gemini, melihat kunci jawaban, dan mengoreksi ujian harus tetap terlindungi.

Ini memungkinkan kalian menyederhanakan pengalaman pengguna tanpa membuat API key, bank soal, dan data hasil ujian terbuka untuk siapa saja.

# 15. Strategi backup proyek sebelum revisi

Untuk perubahan sebesar ini, saya sangat menyarankan mempertahankan versi proyek yang sekarang pada branch terpisah.

Gunakan:

`backup/pre-context-engine-refactor`

Namun, jangan langsung menjalankan perintah Git yang mengubah branch tanpa memeriksa status repository.

Alur yang aman adalah:

1. Audit repository

Periksa branch aktif, perubahan yang belum disimpan, status Git, dan hubungan dengan remote.

2. Simpan snapshot proyek saat ini

Buat commit untuk perubahan yang memang ingin dipertahankan, kemudian buat branch backup yang menunjuk ke snapshot tersebut.

3. Push branch backup

Pastikan seluruh riwayat proyek lama tersedia di GitHub.

4. Lakukan revisi di main

Mulai refactor tanpa menghapus branch backup atau melakukan force-push.

Repository tujuan tetap:

ContextLearningApp — GitHub 

Pastikan perubahan yang belum di-commit tidak tertinggal ketika membuat backup. Selain itu, jangan memasukkan `.env.local`, API key, password, atau berkas rahasia lainnya ke commit.

# 16. Tahapan implementasi yang saya sarankan

Jangan meminta AI Agent mengerjakan seluruh fitur sekaligus tanpa tahapan dan pengujian. Untuk prototype ini, saya menyarankan urutan pengembangan berikut.

1. Tahap 1 — Backup dan penyederhanaan proyek

   Simpan proyek saat ini pada branch backup, sederhanakan routing dan navigasi, serta pertahankan komponen yang masih relevan.

2. Tahap 2 — Indonesian Local Knowledge Base

   Siapkan skema data wilayah, dataset awal, metadata sumber, proses ingestion, embedding, dan retrieval menggunakan PostgreSQL + pgvector.

3. Tahap 3 — Contextualization Engine

   Bangun ekstraksi variabel, pencocokan entitas lokal, penggantian placeholder, validasi, dan editor perbandingan hasil.

4. Tahap 4 — Studio Materi dan Soal

   Implementasikan input manual, foto, generate AI, dan generate soal berdasarkan materi yang sudah dibuat.

5. Tahap 5 — Distribusi dan Ujian

   Implementasikan berbagi materi melalui URL, ujian daring menggunakan kode akses, pencetakan soal, dan penyimpanan jawaban siswa.

6. Tahap 6 — Koreksi Lembar Jawaban

   Implementasikan format lembar jawaban standar, scan pilihan ganda, transkripsi esai, dan review hasil oleh guru.

7. Tahap 7 — Pengujian dan Penyempurnaan

   Uji hasil kontekstualisasi pada beberapa wilayah, akurasi jawaban, sumber konteks, keamanan akses, penggunaan token, serta alur demonstrasi lengkap.

# 17. Bagaimana menunjukkan bahwa inovasi ini benar-benar bekerja?

Saya menyarankan membuat skenario evaluasi yang sederhana tetapi terukur.

Gunakan satu template soal dan dua atau tiga wilayah yang memiliki karakteristik berbeda.

Misalnya:

Template pembelajaran

Seorang \(PROFESI\) membawa 20 kg \(KOMODITAS\) menuju \(LOKASI\). Sebanyak 8 kg dijual. Berapa kilogram sisanya?

Konteks wilayah A

Sistem mengambil profesi, komoditas, dan tempat yang sesuai dengan wilayah A.

Konteks wilayah B

Sistem menggunakan sumber pengetahuan wilayah B dan menghasilkan contoh yang berbeda.

Validasi hasil

Kedua soal mempertahankan operasi pengurangan, angka, satuan, dan jawaban yang sama.

Ukurlah keberhasilan sistem berdasarkan ketepatan wilayah, relevansi entitas, keterlacakan sumber, kesesuaian kompetensi, ketepatan jawaban, serta jumlah intervensi guru yang diperlukan.

Jangan hanya mengukur kemiripan vektor atau keberhasilan Gemini menghasilkan teks.

Sebuah soal bisa terdengar sangat natural tetapi menggunakan fakta lokal yang salah atau mengubah jawaban yang seharusnya dipertahankan.

## Kesimpulan rancangan

Saya menyarankan kalian menjadikan Pahami sebagai platform pembuatan dan kontekstualisasi bahan ajar berbasis Hybrid RAG, bukan LMS lengkap dengan AI sebagai fitur tambahan.

Pusat inovasinya adalah tiga komponen yang saling terhubung:

Context Understanding

Memahami materi dan soal, menentukan frasa yang dapat disesuaikan, serta melindungi tujuan pembelajaran.

Indonesian Local Knowledge Base

Menyimpan dan mengambil pengetahuan lokal berdasarkan wilayah, kategori, hubungan entitas, dan sumber yang dapat ditelusuri.

Controlled Contextualization

Mengadaptasi materi dan soal menggunakan konteks hasil retrieval, dengan validasi dan persetujuan guru.

Dengan rancangan ini, kalian tetap dapat menunjukkan seluruh alur penggunaan yang dibutuhkan dalam lomba: guru membuat bahan ajar, AI menganalisisnya, sistem mengambil pengetahuan lokal, materi dan soal dikontekstualisasikan, lalu hasilnya dibagikan, dicetak, atau digunakan dalam ujian.

Untuk revisi proyek, saya akan memilih Next.js + Supabase PostgreSQL + pgvector + Gemini API + Context Engine berbasis TypeScript, dengan layanan Python/OpenCV tambahan hanya jika benar-benar diperlukan untuk koreksi lembar jawaban cetak.

Arsitektur tersebut menjaga prototype tetap realistis untuk diselesaikan, sambil memberi ruang untuk pengembangan dataset pengetahuan lokal ke wilayah Indonesia yang lebih luas di masa mendatang.

Tahap selanjutnya adalah menyusun master prompt refactor berdasarkan keputusan arsitektur ini, termasuk instruksi backup branch, penyederhanaan proyek yang sudah ada, skema database pengetahuan lokal, pipeline RAG, seluruh alur Studio Pembelajaran, dan pengujian fitur inti sebelum revisi di-push ke branch `main`.
