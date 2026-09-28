Iya. Setelah saya cek **bagian khusus Hackathon** di guidebook, video itu memang bukan sekadar video promosi. Panitia meminta **Video Dokumentasi Karya berupa link YouTube dengan durasi 3–10 menit yang menjelaskan ide, cara kerja, dan demo singkat aplikasi**. Video dan Concept Paper dikumpulkan sebagai dua dokumen utama saat pendaftaran. :chatgpt-content-reference{index="0"}

Dan menurut saya, untuk **DEPASKAN**, video ini justru bisa menjadi bagian penting untuk menunjukkan bahwa idenya benar-benar bekerja.

### Format video yang saya sarankan

Jangan membuatnya seperti video cinematic yang banyak intro/logo. Buat seperti **“pitch + product demo”** supaya juri langsung menangkap masalah, inovasi, dan cara kerja.

Target durasi: **±6–8 menit**.

#### 0:00–0:30 — Hook masalah

Mulai langsung dengan masalah.

Contoh visual:

> **“Soal yang sama belum tentu terasa dekat bagi setiap siswa.”**

Tampilkan soal generik:

> “Pak Budi membeli 5 kg beras di pasar…”

Lalu tunjukkan bahwa guru harus mengubah konteksnya sendiri agar relevan dengan lingkungan siswa.

Kemudian:

> **“Bagaimana jika AI dapat menyesuaikan konteks soal dengan lingkungan siswa, tanpa mengubah kompetensi yang harus dicapai?”**

Masuk logo:

**DEPASKAN**  
*Konteks berubah, kompetensi tetap.*

---

### 0:30–1:15 — Kenalkan DEPASKAN

Jelaskan sangat sederhana:

> DEPASKAN adalah platform AI untuk membantu guru mengontekstualisasikan materi dan soal berdasarkan lingkungan lokal siswa.

Kemudian tampilkan 3 poin visual:

**Materi/Soal asli**  
↓  
**Local Knowledge + AI**  
↓  
**Konten kontekstual**

Yang penting ditonjolkan adalah:

**AI tidak sekadar membuat soal baru.**

DEPASKAN mempertahankan:
- kompetensi,
- substansi,
- struktur soal,
- logika,
- pilihan jawaban,
- kunci jawaban,

sementara **konteks lokalnya yang disesuaikan**.

Ini sangat cocok dengan subtema **Smart Education** yang di guidebook dijelaskan sebagai inovasi digital untuk meningkatkan kualitas pembelajaran dan manajemen pendidikan. :chatgpt-content-reference{index="1"}

---

# 1:15–2:00 — Cara kerja sistem

Di sini jangan terlalu banyak teks.

Buat animasi/diagram sederhana:

```text
Guru
  ↓
Pilih Materi / Soal
  ↓
Input
Manual / PDF / Scan / AI
  ↓
Local Knowledge Base
  ↓
Context Engine
  ↓
Gemini AI
  ↓
Validator
  ↓
Guru Review
  ↓
Approve
  ↓
Publish / Print / Online Room
```

Kemudian narator menjelaskan:

> “DEPASKAN menggunakan Local RAG untuk mengambil pengetahuan lokal yang relevan, kemudian Context Engine mengarahkan AI untuk melakukan substitusi konteks secara aman. Setelah itu validator memeriksa hasil agar kompetensi dan struktur soal tetap terjaga. Guru tetap menjadi pengambil keputusan akhir.”

**Bagian guru sebagai final reviewer ini penting banget.**

Jangan membuat kesan:

> AI → langsung jadi soal → diberikan ke siswa.

Lebih baik:

> AI membantu → sistem memvalidasi → **guru menyetujui**.

---

# 2:00–5:00 — DEMO UTAMA

Ini harus menjadi bagian terbesar.

Saya justru menyarankan **jangan mendemokan semua fitur**.

Pilih **satu skenario yang sangat kuat** dan selesaikan sampai akhir.

Misalnya:

### Skenario

Guru kelas 5 SD di Ponorogo ingin mengontekstualisasikan soal matematika.

Soal awal:

> “Sebuah toko memiliki 120 kg beras…”

Kemudian guru memasukkan soal tersebut.

Tampilkan:

**Soal Asli**

↓ klik

**Kontekskan Soal**

Kemudian sistem memperlihatkan proses:

```text
Mencari konteks lokal...
✓ Ponorogo
✓ Pasar lokal
✓ Aktivitas perdagangan
✓ Konteks relevan
```

Kemudian hasil:

**Soal versi kontekstual**

Misalnya konteksnya menggunakan lingkungan pasar/pertanian yang memang relevan dengan wilayah tersebut.

Yang paling penting:

### Tampilkan perbandingan BEFORE vs AFTER

Kiri:

**Soal Asli**

Kanan:

**Soal DEPASKAN**

Kemudian highlight:

```text
Kompetensi     ✓ Tetap
Struktur       ✓ Tetap
Logika         ✓ Tetap
Kunci Jawaban  ✓ Tetap
Konteks        → Disesuaikan
```

Ini menurut saya akan jauh lebih kuat daripada hanya menunjukkan UI bagus.

---

# 5:00–5:45 — Tunjukkan validasi

Ini bagian yang menurut saya **wajib ditampilkan**, karena membedakan DEPASKAN dari chatbot biasa.

Misalnya:

```text
VALIDASI KONTEN

Kompetensi       ✓
Struktur soal    ✓
Pilihan jawaban  ✓
Kunci jawaban    ✓
Konteks lokal    ✓
```

Lalu:

**[ Edit ] [ Setujui ]**

Guru klik **Setujui**.

Narator:

> “Hasil AI tidak langsung diterbitkan. Guru tetap dapat melihat soal asli, hasil kontekstualisasi, melakukan perubahan, kemudian menyetujui konten sebelum digunakan.”

Ini menunjukkan kontrol guru.

---

# 5:45–6:30 — Output

Setelah approve, jangan berhenti.

Tunjukkan:

```text
Konten berhasil diterbitkan

[ Cetak PDF ]
[ Buat Room Online ]
```

Kemudian secara cepat tunjukkan:

**Room**

→ siswa masuk menggunakan kode/link  
→ mengerjakan  
→ hasil masuk dashboard guru.

Atau kalau waktunya terlalu panjang, cukup tunjukkan halaman Room dan dashboard hasil.

Ini membantu menunjukkan bahwa DEPASKAN bukan cuma **AI generator**, tetapi sebuah **learning workflow**.

---

# 6:30–7:15 — Teknologi

Baru di sini masuk teknis.

Buat diagram sederhana:

```text
                 DEPASKAN
                     │
        ┌────────────┼────────────┐
        ↓            ↓            ↓
    Next.js       Supabase     Gemini AI
                     │
              PostgreSQL
                     │
                pgvector
                     │
             Local Knowledge
                     │
                   RAG
```

Kemudian jelaskan singkat:

- Next.js → aplikasi web
- Supabase → authentication, database, storage
- pgvector → vector search
- Local RAG → pengetahuan lokal
- Gemini → contextualization
- Context Engine → menjaga aturan transformasi
- Validator → memeriksa hasil sebelum diterbitkan

**Jangan 2 menit menjelaskan teknologi.**

Juri hackathon lebih membutuhkan bukti bahwa teknologinya menghasilkan solusi.

---

# 7:15–7:45 — Dampak + sustainability

Ini sengaja dibuat singkat tetapi penting karena guidebook memberikan bobot **20% untuk Kemanfaatan dan Dampak** dan **15% untuk Keberlanjutan**. Penilaian juga mencakup inovasi/relevansi 30%, kualitas kode 15%, UI/UX 10%, dan kemampuan menjabarkan ide 10%. :chatgpt-content-reference{index="2"}

Tampilkan:

```text
DEPASKAN

Guru
↓
Lebih cepat membuat konteks pembelajaran

Siswa
↓
Contoh lebih dekat dengan lingkungan mereka

Sekolah
↓
Konten dapat digunakan kembali
```

Kemudian roadmap kecil:

```text
Prototype
SD Kelas V
Ponorogo

       ↓

Perluasan wilayah
       ↓
Lebih banyak mata pelajaran
       ↓
SD / SMP / SMA / SMK
```

Jangan mengklaim sudah melakukan sesuatu yang sebenarnya baru roadmap.

---

# 7:45–8:00 — Closing

Layar bersih.

Logo DEPASKAN.

> **DEPASKAN**  
> *Konteks berubah, kompetensi tetap.*

Lalu:

> “Karena pembelajaran yang baik bukan hanya tentang apa yang dipelajari, tetapi juga seberapa dekat pembelajaran tersebut dengan dunia siswa.”

**Selesai.**

---

## Yang menurut saya paling penting

Karena kriteria mereka adalah:

| Aspek | Bobot |
|---|---:|
| Inovasi & Relevansi Solusi | **30%** |
| Kemanfaatan & Dampak | **20%** |
| Keberlanjutan | **15%** |
| Kualitas Kode | **15%** |
| UI/UX | **10%** |
| Kemampuan Menjabarkan Ide | **10%** |

maka video jangan didesain sebagai **“lihat betapa keren UI kami”**.

Lebih bagus kalau juri setelah menonton bisa menjawab 6 hal:

**1. Masalahnya apa?**  
Guru kesulitan membuat pembelajaran yang kontekstual.

**2. Solusinya apa?**  
DEPASKAN.

**3. Apa yang membedakan dari AI biasa?**  
Local context + RAG + controlled contextualization.

**4. Apakah benar-benar bekerja?**  
Tunjukkan demo real.

**5. Apakah AI bebas mengubah soal?**  
Tidak. Ada preservation + validator + teacher approval.

**6. Bisa dikembangkan?**  
Tunjukkan roadmap yang realistis.

---

### Bahkan saya akan membuat satu adegan yang sangat kuat

Sebelum dan sesudah:

```text
┌─────────────────────┐       ┌─────────────────────┐
│     SOAL ASLI       │       │   SOAL DEPASKAN     │
│                     │       │                     │
│ Konteks umum        │  →    │ Konteks Ponorogo    │
│                     │       │                     │
│ Kompetensi ✓        │       │ Kompetensi ✓        │
│ Struktur ✓          │       │ Struktur ✓          │
│ Kunci ✓             │       │ Kunci ✓             │
└─────────────────────┘       └─────────────────────┘
```

Lalu narator:

> **“Yang berubah adalah konteksnya. Yang tetap adalah kompetensinya.”**

Itu menurut saya bisa menjadi **core visual identity video DEPASKAN**.

Dan karena guidebook menyatakan video harus **3–10 menit**, saya akan menargetkan **sekitar 7 menit**, bukan mendekati 10 menit. Terlalu panjang justru berisiko membuat bagian inti demo tenggelam. :chatgpt-content-reference{index="3"}

Kalau kamu mau, langkah berikutnya yang paling berguna adalah :chatgpt-content-reference{index="4"} — lengkap **narasi yang dibacakan, apa yang harus direkam di layar pada detik tersebut, teks overlay, transisi, dan urutan demo**, jadi kalian tinggal rekam.


Bisa. Saya sarankan videonya dibuat **seperti product demo/pitch**, bukan video presentasi PowerPoint. Guidebook menjelaskan Hackathon sebagai kompetisi untuk merancang dan membangun prototipe yang relevan, solutif, dan berdampak terhadap persoalan nyata di bidang pendidikan/organisasi. :chatgpt-content-reference{index="0"}

Untuk DEPASKAN, target **±7 menit** sangat pas. Di bawah ini saya buat **script siap rekam**, termasuk narasi, apa yang tampil di layar, dan kapan melakukan screen recording.

---

# SCRIPT VIDEO DEPASKAN — ±7 MENIT

## Konsep video

**Judul:**

> **DEPASKAN — Konteks Berubah, Kompetensi Tetap**

Gaya:
- modern
- clean
- tidak terlalu banyak animasi
- dominan screen recording prototype
- narasi voice-over
- musik background tipis
- fokus pada **masalah → solusi → demo nyata → teknologi → dampak**

Jangan terlalu banyak menampilkan slide. **Prototype harus menjadi pemeran utama.**

---

# 00:00–00:30 — OPENING / HOOK

### Visual

Layar hitam/warm white.

Munculkan tulisan:

> **SATU KOMPETENSI.**  
> **BANYAK LINGKUNGAN BELAJAR.**

Kemudian tampilkan contoh soal generik.

Misalnya:

> *“Pak Budi membeli 5 kg beras di pasar...”*

Lalu layar terbagi dua.

**Konteks umum**

vs.

**Konteks lingkungan siswa**

Kemudian muncul:

> **Bagaimana jika AI dapat menyesuaikan konteks pembelajaran dengan lingkungan siswa, tanpa mengubah kompetensinya?**

Logo DEPASKAN muncul.

### Narasi

> “Setiap siswa belajar dari lingkungan yang berbeda. Namun, materi dan soal yang digunakan sering kali masih menggunakan konteks yang jauh dari kehidupan mereka.
>
> Guru sebenarnya dapat menyesuaikannya, tetapi proses tersebut membutuhkan waktu dan harus dilakukan berulang kali.
>
> DEPASKAN hadir untuk membantu guru melakukan hal tersebut dengan AI.”

---

# 00:30–01:05 — MASALAH

### Visual

Tampilkan ilustrasi sederhana:

```text
Guru
 ↓
Materi/Soal Umum
 ↓
Harus disesuaikan manual
 ↓
Memerlukan waktu
```

Kemudian tampilkan 3 poin:

> **Konteks kurang dekat**  
> **Adaptasi manual**  
> **Waktu guru terbatas**

Jangan membuat klaim angka seperti “guru membutuhkan 3 jam” kalau kalian tidak punya data penelitian untuk mendukungnya.

### Narasi

> “Masalah yang kami angkat bukan sekadar bagaimana membuat soal menggunakan AI.
>
> Masalahnya adalah bagaimana membuat materi dan soal menjadi lebih dekat dengan lingkungan siswa.
>
> Ketika guru ingin menggunakan konteks lokal, mereka harus mencari referensi, memilih contoh yang sesuai, kemudian menyesuaikan kembali materi atau soal secara manual.
>
> Karena itu, kami merancang DEPASKAN sebagai platform AI yang membantu proses kontekstualisasi tersebut.”

---

# 01:05–01:40 — SOLUSI DEPASKAN

### Visual

Landing page DEPASKAN.

Zoom perlahan ke logo.

Munculkan tagline:

> **DEPASKAN**  
> **Konteks berubah, kompetensi tetap.**

Kemudian tampilkan:

```text
Materi / Soal
       ↓
Local Knowledge
       ↓
Context Engine
       ↓
AI
       ↓
Validation
       ↓
Guru Review
       ↓
Konten Siap Digunakan
```

### Narasi

> “DEPASKAN adalah platform pembelajaran berbasis AI yang membantu guru mengontekstualisasikan materi dan soal berdasarkan lingkungan lokal siswa.
>
> Prinsip utama kami sederhana:
>
> **konteks berubah, kompetensi tetap.**
>
> DEPASKAN tidak dirancang untuk sekadar membuat soal secara acak.
>
> Sistem mempertahankan substansi dan kompetensi dari konten asli, kemudian menyesuaikan konteksnya menggunakan pengetahuan lokal yang relevan.
>
> Dan yang paling penting, hasil AI tetap berada di bawah kendali guru.”

---

# 01:40–02:15 — CARA KERJA SISTEM

### Visual

Buat animasi flow.

```text
Guru
 │
 ▼
Input Konten
 │
 ├── Manual
 ├── PDF
 ├── Scan
 └── Generate AI
 │
 ▼
Context Engine
 │
 ▼
Local Knowledge Base / RAG
 │
 ▼
AI
 │
 ▼
Validator
 │
 ▼
Review Guru
 │
 ▼
Publish
```

Animasi satu per satu, jangan semuanya langsung muncul.

### Narasi

> “Alurnya dimulai ketika guru memilih ruang kerja dan memasukkan konten.
>
> Konten dapat dimasukkan secara manual, melalui dokumen, hasil scan, atau dibuat dengan bantuan AI.
>
> Selanjutnya, Context Engine menganalisis konten untuk mengetahui bagian mana yang dapat dikontekstualisasikan.
>
> Sistem kemudian mengambil pengetahuan lokal yang relevan dari Local Knowledge Base menggunakan pendekatan Retrieval-Augmented Generation atau RAG.
>
> AI menyusun versi kontekstual berdasarkan informasi tersebut.
>
> Setelah itu, hasil diperiksa oleh validator sebelum akhirnya ditinjau dan disetujui oleh guru.”

---

# 02:15–02:30 — MASUK KE DEMO

### Visual

Flow berubah menjadi:

> **“Sekarang, mari kita lihat bagaimana DEPASKAN bekerja.”**

Kemudian masuk ke screen recording.

### Narasi

> “Berikut adalah demonstrasi prototype DEPASKAN menggunakan skenario pembelajaran untuk siswa kelas lima sekolah dasar.”

---

# 02:30–03:00 — LOGIN & WORKSPACE

### Visual

Rekam:

**Landing page**

→ klik **Masuk**

→ Google Login

→ onboarding/workspace

→ masuk dashboard guru.

Kalau bagian login terlalu lama, percepat video.

### Narasi

> “Guru terlebih dahulu masuk ke DEPASKAN dan memilih ruang kerja yang digunakan.
>
> Sistem mendukung penggunaan dalam konteks sekolah maupun perorangan.
>
> Setelah masuk, guru dapat mengakses dua kebutuhan utama: mengontekstualisasikan materi dan mengontekstualisasikan soal.”

Tampilkan dashboard.

---

# 03:00–03:35 — MEMASUKKAN SOAL

### Visual

Masuk:

**Kontekskan Soal**

Pilih:

> **Manual**

Masukkan soal yang **benar-benar sudah berhasil kalian uji di prototype**.

Contoh jika menggunakan soal matematika:

> “Pak Budi membeli 5 kg beras dengan harga Rp15.000 per kilogram. Berapa uang yang harus dibayarkan Pak Budi?”

Kemudian tampilkan target:

> **Wilayah konteks: Ponorogo**

Klik:

> **Kontekskan**

### Narasi

> “Sebagai contoh, guru memiliki sebuah soal yang masih menggunakan konteks umum.
>
> Guru kemudian memilih fitur Kontekskan Soal dan memasukkan soal tersebut.
>
> Pada prototype ini, guru dapat menentukan konteks wilayah yang ingin digunakan.
>
> Untuk demonstrasi ini, kami menggunakan konteks wilayah Ponorogo.”

---

# 03:35–04:10 — LOCAL RAG + CONTEXT ENGINE

### Visual

Jangan biarkan loading screen kosong.

Tampilkan visual proses:

```text
Menganalisis soal
✓

Mengidentifikasi elemen yang dapat dikontekstualisasikan
✓

Mencari pengetahuan lokal
✓

Menyusun konteks
✓

Memvalidasi hasil
...
```

Kemudian hasil muncul.

### Narasi

> “Di belakang layar, DEPASKAN tidak langsung meminta AI untuk menulis ulang soal.
>
> Sistem terlebih dahulu menganalisis elemen yang terdapat pada soal.
>
> Kemudian Local Knowledge Base digunakan untuk mendapatkan konteks lokal yang relevan.
>
> Context Engine memberikan batasan agar proses transformasi tetap berada pada tujuan pembelajaran yang sama.
>
> Dengan pendekatan ini, AI diarahkan untuk melakukan kontekstualisasi, bukan sekadar menghasilkan soal baru.”

---

# 04:10–04:50 — BEFORE vs AFTER

**Ini bagian TERPENTING dalam video.**

### Visual

Buat tampilan split-screen:

### KIRI

**SOAL ASLI**

> Pak Budi membeli 5 kg beras...

### KANAN

**SOAL TERKONTEKSTUALISASI**

> [hasil nyata dari prototype kalian]

Kemudian highlight:

```text
Kompetensi       ✓
Struktur         ✓
Logika           ✓
Kunci Jawaban    ✓
Konteks          → Berubah
```

### Narasi

> “Inilah hasil kontekstualisasi DEPASKAN.
>
> Di sebelah kiri adalah soal asli, sedangkan di sebelah kanan adalah hasil setelah diberikan konteks lokal.
>
> Perubahan difokuskan pada konteks yang digunakan dalam soal, sementara kompetensi, struktur, dan logika pembelajaran tetap dijaga.
>
> Inilah prinsip utama DEPASKAN:
>
> **konteks berubah, kompetensi tetap.**”

### Penting

Kalau hasil prototype kalian **belum benar-benar melakukan pengecekan kompetensi secara otomatis**, jangan tampilkan centang sebagai fitur yang sudah bekerja.

Bisa diganti:

> **“Elemen yang dipertahankan”**

atau hanya tampilkan hasil before/after.

Jangan sampai video mengklaim fitur yang belum selesai.

---

# 04:50–05:30 — VALIDASI & GURU REVIEW

### Visual

Masuk halaman preview/editor.

Tampilkan:

**Soal Asli**

↓

**Hasil Kontekstual**

↓

**Edit**

↓

**Setujui**

Klik salah satu bagian teks dan lakukan edit kecil.

Kemudian klik:

> **Setujui**

### Narasi

> “DEPASKAN juga tidak menempatkan AI sebagai pengambil keputusan akhir.
>
> Guru dapat membandingkan konten asli dengan hasil kontekstualisasi, melakukan perubahan jika diperlukan, kemudian memberikan persetujuan.
>
> Tahapan ini memastikan guru tetap memiliki kontrol terhadap konten yang akan digunakan dalam pembelajaran.
>
> Setelah disetujui, konten dapat disimpan dan digunakan kembali.”

---

# 05:30–06:00 — PUBLISH / ROOM

### Visual

Klik:

> **Buat Room**

Tampilkan:

```text
Nama Room
Matematika Kelas V

Kode
MAT5-PNR

Soal
10

Durasi
30 menit
```

Kemudian masuk ke halaman siswa.

Tampilkan:

> **Masukkan kode room**

Masukkan kode.

Masuk soal.

Jawab satu soal.

Submit.

### Narasi

> “Konten yang telah disetujui juga dapat digunakan dalam Room pembelajaran.
>
> Guru dapat membagikan room melalui kode atau tautan.
>
> Siswa kemudian dapat mengakses konten tersebut dan mengerjakan soal secara online.
>
> Hasil pengerjaan selanjutnya dapat dipantau melalui dashboard guru.”

---

# 06:00–06:25 — HASIL & DASHBOARD

### Visual

Kembali ke dashboard guru.

Tampilkan hasil:

```text
Peserta
28

Selesai
25

Belum selesai
3

Rata-rata
...
```

**Gunakan data asli prototype.**

Kalau belum ada data nyata, jangan tampilkan angka palsu. Gunakan satu contoh hasil yang memang dibuat saat demo.

Klik salah satu hasil.

### Narasi

> “Guru kemudian dapat melihat aktivitas dan hasil pengerjaan melalui dashboard.
>
> Dengan demikian, DEPASKAN tidak berhenti pada proses menghasilkan konten, tetapi menghubungkan proses kontekstualisasi dengan penggunaan dan evaluasi pembelajaran.”

---

# 06:25–06:50 — TEKNOLOGI

### Visual

Tampilkan arsitektur sistem.

```text
                 DEPASKAN
                     │
        ┌────────────┼────────────┐
        │            │            │
     Next.js      Supabase     AI Engine
                     │            │
                PostgreSQL    Context Engine
                     │            │
                  pgvector     Gemini
                     │
             Local Knowledge
```

Kemudian highlight satu per satu.

### Narasi

> “Secara teknis, DEPASKAN dibangun sebagai aplikasi web menggunakan Next.js dan Supabase.
>
> Supabase digunakan untuk autentikasi, database, dan penyimpanan data.
>
> Local Knowledge Base menggunakan pencarian berbasis vector untuk menyediakan konteks lokal bagi proses RAG.
>
> Sementara Gemini digunakan sebagai model AI dalam proses generasi dan kontekstualisasi.
>
> Komponen Context Engine dan validator menjadi penghubung untuk mengontrol bagaimana konten ditransformasikan.”

---

# 06:50–07:00 — CLOSING

### Visual

Semua layar menghilang.

Latar bersih.

Logo:

# DEPASKAN

Kemudian:

> **Konteks berubah, kompetensi tetap.**

Setelah itu:

> **AI untuk pembelajaran yang lebih dekat dengan dunia siswa.**

### Narasi

> “Kami percaya teknologi pendidikan tidak hanya harus membuat pembelajaran lebih cepat, tetapi juga lebih dekat dengan kehidupan siswa.
>
> DEPASKAN.
>
> **Konteks berubah, kompetensi tetap.**”

Fade out.

---

# 🎬 Versi urutan rekaman yang saya sarankan

Jangan merekam video secara langsung dari awal sampai akhir. **Rekam setiap bagian secara terpisah**, kemudian gabungkan saat editing.

Urutannya:

```text
01  Opening motion
02  Problem animation
03  Logo + value proposition
04  System workflow
05  Landing page
06  Login
07  Dashboard
08  Kontekskan Soal
09  Input soal
10  Processing
11  Before vs After
12  Validation
13  Teacher Edit
14  Approve
15  Create Room
16  Student View
17  Teacher Dashboard
18  Architecture
19  Closing
```

Dengan begitu kalau ada satu bagian prototype yang error, kalian **tidak perlu mengulang seluruh video**.

---

# 🎙️ Pembagian peran 2 orang

Karena tim kalian dua orang, saya justru menyarankan **tidak perlu dua orang berbicara sepanjang video**.

### Anggota 1 — Voice Over

Membacakan seluruh narasi.

Suaranya tenang, jelas, dan tidak terlalu cepat.

### Anggota 2 — Product Demonstrator

Melakukan screen recording:

- login
- input
- contextualization
- review
- room
- dashboard

Tidak perlu berbicara.

Di opening atau closing, kalau ingin menunjukkan tim, cukup tampilkan:

> **DEPASKAN**  
> Tim FOMO — Politeknik Negeri Madiun

dengan foto/video singkat tim sekitar 3–5 detik.

---

# ⚠️ Satu hal yang menurut saya sangat penting

**Jangan membuat video yang terlalu “AI banget”.**

Misalnya:

> “DEPASKAN menggunakan Artificial Intelligence, Large Language Model, Retrieval-Augmented Generation, Vector Database, Natural Language Processing, dan sebagainya…”

lalu 2 menit menjelaskan teknologi.

Itu justru bisa membuat juri kehilangan inti.

Video kalian harus membuat juri melihat:

> **Masalah → DEPASKAN → masukkan soal → sistem mencari konteks → hasil berubah → kompetensi tetap → guru memeriksa → siswa menggunakan.**

Teknologinya cukup sebagai **bukti bahwa solusi tersebut memang dibangun**, bukan sebagai pusat cerita.

---

## Bagian yang paling harus kalian poles

Kalau waktu produksi terbatas, prioritaskan **04:10–05:30**, yaitu:

**SOAL ASLI → HASIL DEPASKAN → VALIDASI → GURU APPROVE**

Karena di situlah identitas DEPASKAN benar-benar terlihat.

Bahkan saya akan membuat satu transisi khusus:

```text
SOAL ASLI
      ↓
   DEPASKAN
      ↓
SOAL KONTEKSTUAL
```

Lalu layar berhenti sekitar 2 detik dengan tulisan besar:

> **KONTEKS BERUBAH.**  
> **KOMPETENSI TETAP.**

Itu bisa menjadi **momen utama yang diingat juri**.

Dan satu aturan produksi: **semua hasil yang ditampilkan dalam video harus merupakan hasil prototype yang benar-benar berjalan.** Kalau suatu fitur masih berupa rancangan, jangan direpresentasikan sebagai fitur yang sudah selesai. Ini juga sejalan dengan dokumen kerja kalian yang sebelumnya menekankan agar concept paper/video membedakan prototype yang sudah diimplementasikan dari fitur yang masih menjadi pengembangan. :chatgpt-content-reference{index="1"}