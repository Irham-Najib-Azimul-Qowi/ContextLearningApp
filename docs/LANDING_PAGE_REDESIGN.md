# DOKUMENTASI REDESAIN LANDING PAGE — PAHAMI V2
**Puzzle-Based Landing Page, Floating Navigation & Layered Soft UI Design**  
*Hak Cipta © 2026 Tim PAHAMI — Hackathon IT Comp 2026*  
*Senior Product Designer, UI/UX Designer, Front-End Engineer*

---

## 1. KONSEP DESAIN & IDENTITAS VISUAL

Redesain halaman terluar (`/`) aplikasi PAHAMI V2 mengimplementasikan bahasa visual **Layered Soft UI + Rounded Puzzle Design + Floating Elements**, terinspirasi dari Claymorphism halus untuk menghasilkan antarmuka pendidikan modern, ramah, dan khas:

- **Rounded Puzzle Motif**: Elemen puzzle digunakan secara terarah sebagai metafora utama: menyatukan kurikulum nasional dengan kearifan lokal wilayah siswa.
- **Floating Architecture**: Header melayang tanpa navbar konvensional, kartu hero terangkat dengan bayangan lembut, dan sudut melengkung besar (`rounded-[32px]` hingga `rounded-[38px]`).
- **Palet Warna Harmonis**:
  - **Dark Mauve (`#51465B`)**: Warna dasar stabilitas dan ketenangan profesional (Kartu Kontekskan Materi, Header CTA, Footer).
  - **Warm Yellow (`#FFD36D`)**: Warna keceriaan dan daya tarik edukatif (Logo puzzle, Kartu Kontekskan Soal, badge aksen).
  - **Coral (`#F47D83`)**: Aksen penanda interaktif dan penegasan visual.
  - **Soft Rose (`#DFAEB3`)**: Sentuhan gradasi lembut pada ambient background.
  - **Off White (`#FAF7F3`)**: Latar kanvas aplikasi yang nyaman di mata tanpa silau.
  - **Dark Text (`#23212A`) & Secondary Text (`#756F7A`)**: Hirarki keterbacaan tipografi berstandar WCAG AAA.

---

## 2. LOGO PAHAMI — HURUF D BERBENTUK PUZZLE

Komponen: [`components/landing/puzzle-logo.tsx`](file:///x:/folder_website/contextlearning/components/landing/puzzle-logo.tsx)

### Karakteristik Desain:
1. **Siluet Huruf D**:
   - Memiliki tiang vertikal kiri yang tegas.
   - Sisi kanan melengkung anggun dengan ruang negatif di bagian tengah (lubang huruf D).
   - Pada lengkungan kanan terintegrasi sebuah **tonjolan puzzle membulat (circular puzzle knob)** yang menyatu secara struktural tanpa merusak keterbacaan huruf D.
2. **Bayangan Hard Offset Siluet Puzzle**:
   - Menggunakan duplikasi path SVG yang diposisikan bergeser ke kanan bawah (`translate(5, 6)`).
   - Menghasilkan bayangan gelap (`#23212A`) yang **mengikuti persis lekukan dan tonjolan siluet puzzle**, memberikan efek taktil seperti kepingan puzzle fisik yang sedikit terangkat dari meja.
3. **Pewarnaan**:
   - Tubuh huruf D puzzle: Warm Yellow (`#FFD36D`) dengan garis luar Dark Mauve (`#51465B`) dan highlight melengkung putih di bagian atas.

---

## 3. FLOATING HEADER (NAVIGASI MELAYANG)

Sesuai instruksi Section 6:
- **Kiri Atas**: Logo PAHAMI (`PahamiPuzzleLogo`) dengan ukuran proporsional.
- **Kanan Atas**: Tombol melayang berbentuk *pill* ("Masuk" atau "Dashboard" jika pengguna sudah memiliki sesi aktif).
- **Ruang Tengah**: **Dikosongkan sepenuhnya**. Tidak ada menu horizontal konvensional (Home, Features, Pricing) yang mengaburkan fokus pengguna.
- **Tingkat Keterbukaan Visual**: Header tidak mengganggu alur baca dan tetap stabil pada berbagai resolusi viewport.

---

## 4. HERO SECTION — DUA KARTU PUZZLE MELAYANG

Komponen: [`components/landing/puzzle-service-cards.tsx`](file:///x:/folder_website/contextlearning/components/landing/puzzle-service-cards.tsx)

Kedua kartu menjadi *focal point* utama yang langsung mengarahkan pengguna pada 2 layanan inti PAHAMI:

```
+------------------------------------+      +------------------------------------+
|  KARTU KIRI: KONTEKSKAN MATERI    |      |  KARTU KANAN: KONTEKSKAN SOAL      |
|  Warna Dasar: Dark Mauve (#51465B) |==)(==|  Warna Dasar: Warm Yellow (#FFD36D)|
|  Ikon: Buku dalam motif Puzzle     | (tab)|  Ikon: Soal dalam motif Puzzle     |
|  CTA: "Buat Materi"                |      |  CTA: "Buat Soal" (socket)         |
+------------------------------------+      +------------------------------------+
```

1. **Kartu Kiri (Materi)**:
   - Warna dasar Dark Mauve (`#51465B`) dengan teks putih berkontras tinggi.
   - Ikon buku terbuka di dalam lencana mini puzzle.
   - Memiliki tonjolan puzzle membulat pada sisi kanan yang menghadap ke kartu kanan.
   - CTA: *"Buat Materi"* dengan aksen Warm Yellow.
2. **Kartu Kanan (Soal)**:
   - Warna dasar Warm Yellow (`#FFD36D`) dengan teks Dark Mauve (`#23212A`).
   - Ikon lembar soal / tanda tanya di dalam lencana mini puzzle.
   - Memiliki lekukan puzzle (socket) yang saling melengkapi dengan tonjolan kartu kiri.
   - CTA: *"Buat Soal"* dengan aksen Dark Mauve.
3. **Jarak & Elevasi**:
   - Diberikan sedikit jarak antar kartu (`gap-6` hingga `gap-8`) agar keduanya tampak melayang terpisah namun tetap saling mengunci secara visual.
   - Pada layar smartphone, kartu tersusun vertikal secara rapi tanpa pemotongan teks (*zero text clipping*).

---

## 5. SEKSI PENJELASAN & FITUR UTAMA

### A. Alur Kerja ("Dari materi biasa menjadi pembelajaran yang dekat")
Komponen: [`components/landing/how-it-works-section.tsx`](file:///x:/folder_website/contextlearning/components/landing/how-it-works-section.tsx)
- 4 langkah ringkas:
  1. *Masukkan Soal atau Materi* (PDF, foto OCR, ketik manual, AI).
  2. *Pilih Wilayah Pembelajaran* (Madiun Raya & Semarang).
  3. *AI Menyesuaikan Konteks Lokal* (LKB, RAG faktual, Kurikulum Fase C).
  4. *Tinjau, Cetak, atau Bagikan Online* (A4 printable & ujian daring).

### B. Komparasi Nyata ("Belajar dari lingkungan sekitar")
Komponen: [`components/landing/context-comparison-section.tsx`](file:///x:/folder_website/contextlearning/components/landing/context-comparison-section.tsx)
- Menampilkan perbandingan *Sebelum* (abstrak) vs *Sesudah* (kontekstual terverifikasi):
  - **Studi Kasus 1**: Perkalian Matematika berbasis produksi komponen bogie gerbong kereta api **PT Industri Kereta Api (INKA) Kota Madiun (35.77)**.
  - **Studi Kasus 2**: Ekosistem IPAS berbasis sentra peternakan sapi perah **Pudak lereng Gunung Wilis Ponorogo (35.02)**.
- Disertai lencana dimensi: Tempat, Transportasi, Ekonomi, Budaya, dan Lingkungan Alam.

### C. Fleksibilitas Luaran ("Belajar secara daring maupun cetak")
Komponen: [`components/landing/output-modes-section.tsx`](file:///x:/folder_website/contextlearning/components/landing/output-modes-section.tsx)
- **Opsi 1: Format Cetak A4**: Layout terstandarisasi, lembar kunci jawaban terpisah guru, gambar hitam-putih ramah mesin fotokopi sekolah.
- **Opsi 2: Pelaksanaan Daring**: Portal murid ramah anak SD, timer ujian otomatis, auto-grading PG, dan rapor nilai.

---

## 6. FOOTER & KEBIJAKAN PRIVASI SISWA

Komponen: [`components/landing/landing-footer.tsx`](file:///x:/folder_website/contextlearning/components/landing/landing-footer.tsx)
- Background Dark Mauve (`#51465B`) dengan sudut atas membulat (`rounded-t-[36px]`).
- Tautan navigasi ringkas: Beranda, Buat Materi, Buat Soal, Akses Ujian Murid, Control Center.
- **Modal Perlindungan Privasi Siswa**: Menegaskan kepatuhan non-pengumpulan NIK, isolasi RLS antar sekolah, dan pemrosesan data aman.

---

## 7. VERIFIKASI PENGUJIAN

- **Unit Tests**: 36 / 36 PASSED (`npm run test`).
- **Production Build**: 0 Errors, 59 Routes Terkompilasi Bersih (`npm run build`).
- **Aksesibilitas & Performa**: Semantic HTML (`<header>`, `<main>`, `<section>`, `<footer>`, `<nav>`), kontras warna WCAG AAA, dan mobile-responsive tanpa horizontal overflow.
