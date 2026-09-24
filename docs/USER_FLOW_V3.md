# PAHAMI V2 — User Flow & Workflow Documentation (V3)
*Complete End-to-End Walkthrough: Landing Page, Service Hub, Contextualization, Editor, Print & Online Delivery*

---

## 1. Diagram Alur Utama (Master Flow)

```
[ LANDING PAGE (/) ]
  │
  ├─► PILIH LAYANAN: "KONTEKSKAN SOAL"    ──┐
  │                                         │
  └─► PILIH LAYANAN: "KONTEKSKAN MATERI"  ──┼─► [ SIMPAN PREFERENSI LAYANAN ]
                                            │
                                            ▼
                               [ LOGIN GOOGLE OAUTH (/login) ]
                                            │
                                            ▼
                          [ ONBOARDING WIZARD (/auth/onboarding) ]
                                ├─ Step 1: Konfirmasi Identitas
                                ├─ Step 2: Jenis Penggunaan (Perorangan / Sekolah)
                                ├─ Step 3: Pemilihan Wilayah (Manual / Sensor GPS)
                                └─ Step 4: Konfirmasi Ringkasan Data
                                            │
                                            ▼
                            [ BERANDA PAHAMI (/teacher/dashboard) ]
                              ├─ KIRI: Panel Buat Materi (Dark Mauve)
                              └─ KANAN: Panel Buat Soal (Warm Yellow)
                                            │
               ┌────────────────────────────┴───────────────────────────┐
               ▼                                                        ▼
      [ HUB BUAT SOAL ]                                        [ HUB BUAT MATERI ]
(/teacher/questions/new)                                     (/teacher/materials/new)
  ├─ 1. Upload PDF                                             ├─ 1. Upload PDF
  ├─ 2. Ambil Foto / OCR                                       ├─ 2. Ambil Foto / OCR
  ├─ 3. Ketik Manual                                           ├─ 3. Ketik Manual
  └─ 4. Generate AI                                            └─ 4. Generate AI
               │                                                        │
               ▼                                                        ▼
   [ INPUT / EKSTRAKSI KONTEN ]                               [ INPUT / EKSTRAKSI KONTEN ]
               │                                                        │
               └────────────────────────────┬───────────────────────────┘
                                            ▼
                       [ PROSES KONTEKSTUALISASI AI (LKB) ]
                     - 1. Membaca & Memahami Konten
                     - 2. Klasifikasi Kurikulum SD Kelas 5
                     - 3. Temu Balik Local Knowledge Base (pgvector)
                     - 4. Penyesuaian Narasi Kontekstual Lokal
                     - 5. Validasi Edukatif & Pedagogis
                     - 6. Pemilihan Aset Visual Berlisensi
                                            │
                                            ▼
                           [ STUDIO EDITOR HASIL KONTEKS ]
                             ├─ Komparasi Side-by-Side Naskah Asli vs Kontekstual
                             ├─ Penyesuaian Variabel & Entitas Budaya
                             ├─ Pilihan Gambar Pendukung Faktual
                             └─ Penyuntingan Langsung Teks
                                            │
               ┌────────────────────────────┴───────────────────────────┐
               ▼                                                        ▼
      [ MODE CETAK A4 ]                                        [ MODE PUBLIKASI ONLINE ]
  - Lembar Soal Ujian Siswa                                - Distribusi ke Kelas Terdaftar
  - Lembar Kunci Jawaban & Rubrik Terpisah                 - Kode Akses Ruang Ujian Siswa
  - Modul Bacaan Bahan Ajar Siap Cetak                     - Pengerjaan Interaktif Siswa SD
```

---

## 2. Rincian Langkah Penggunaan

### 2.1 Tahap 1: Landing Page & Pemilihan Layanan Awal
- **URL**: `/`
- Pengguna yang belum login dapat membaca headline ramah guru: *"Belajar lebih dekat dengan lingkungan sekitar."*
- Tersedia dua kartu pahlawan utama berukuran besar:
  - **Kontekskan Soal**: Mempersiapkan asesmen kontekstual.
  - **Kontekskan Materi**: Menyusun naskah bahan ajar lokal.
- Ketika salah satu kartu diklik:
  - Status pilihan disimpan di memori sesi (`intended_service`).
  - Jika belum login: diarahkan ke Google OAuth.
  - Jika sudah login & profil lengkap: langsung menuju hub pembuatan konten.

---

### 2.2 Tahap 2: Google OAuth & Autentikasi Supabase
- **URL**: `/login`
- Menampilkan kanvas membulat berlapis (`rounded-[36px]`).
- Guru menekan *"Lanjutkan dengan Google"*.
- Sistem melakukan otentikasi via Supabase Auth.
- Bagi penguji/evaluator kompetisi, tersedia tombol simulasi cepat (*One-Click Demo Mode*).

---

### 2.3 Tahap 3: Wizard Onboarding 4 Langkah
- **URL**: `/auth/onboarding`
- **Langkah 1 (Identitas)**: Menampilkan nama dan avatar akun Google. Guru dapat menyunting nama dan gelar jika diperlukan.
- **Langkah 2 (Jenis Penggunaan)**:
  - **Perorangan**: Guru mandiri, bimbel, atau orang tua (tanpa kewajiban data institusi formal).
  - **Sekolah**: Guru sekolah dasar yang mengelola kelas siswa dan ujian resmi.
- **Langkah 3 (Wilayah Pembelajaran)**:
  - Memilih Provinsi (Jawa Timur / Jawa Tengah).
  - Memilih Kabupaten/Kota prioritas (Kota Madiun, Kab. Madiun, Ngawi, Magetan, Ponorogo, Pacitan, atau Kota Semarang `33.74`).
  - Fitur *"Gunakan Lokasi Perangkat (GPS)"* meminta izin sensor peramban untuk rekomendasi cepat. Jika izin ditolak, form manual tetap dapat digunakan tanpa hambatan.
- **Langkah 4 (Konfirmasi Ringkasan)**:
  - Menampilkan ringkasan profil, status penggunaan, dan wilayah aktif.
  - Menekan *"Mulai Menggunakan PAHAMI"* mengarahkan pengguna ke layanan yang dipilih sebelumnya.

---

### 2.4 Tahap 4: Halaman Utama PAHAMI (Dashboard)
- **URL**: `/teacher/dashboard`
- Mengusung komposisi *Layered Rounded Dashboard*:
  - **Sidebar Kiri**: Warna Dark Mauve `#51465B`, ikon navigasi jelas.
  - **Top Bar**: Sapaan personal, profil sekolah/wilayah, switcher daerah, notifikasi.
  - **Dua Panel Layanan Berdampingan**:
    - **Panel Materi (Kiri)**: Dark Mauve `#51465B` dengan kartu putih di dalamnya. Tombol *"Mulai Buat Materi"* (`/teacher/materials/new`).
    - **Panel Soal (Kanan)**: Warm Yellow `#FFD36D` dengan teks gelap kontras. Tombol *"Mulai Buat Soal"* (`/teacher/questions/new`).
  - **Seksi Terakhir Dikerjakan**: Menampilkan kartu butir soal dan modul materi terbaru yang dapat langsung dibuka kembali.

---

### 2.5 Tahap 5: Empat Metode Input Pembuatan Konten
Baik pada modul Soal maupun Materi, guru dapat memilih 4 metode input terstruktur:

| Metode Input | Alur Pembuatan Soal | Alur Pembuatan Materi |
|---|---|---|
| **1. Upload PDF** | Mengunggah PDF naskah soal; sistem mengekstrak butir soal, opsi jawaban, dan pembahasan. | Mengunggah modul ajar PDF; sistem mengekstrak topik dan naskah paragraf. |
| **2. Ambil Foto (Vision OCR)** | Memotret buku latihan atau LKS; Gemini Vision mengekstrak pertanyaan fisik. | Memotret halaman buku materi tematik SD; ekstraksi teks otomatis. |
| **3. Ketik Manual** | Menulis soal pilihan ganda atau esai secara langsung di formulir editor. | Mengetik judul, capaian pembelajaran, dan naskah materi bebas. |
| **4. Generate AI** | Menentukan mapel, topik, jumlah butir, dan konteks wilayah; Gemini merumuskan draf terstruktur. | Menentukan topik, capaian pembelajaran, dan preferensi wilayah; Gemini menghasilkan naskah ajar. |

---

### 2.6 Tahap 6: Proses Kontekstualisasi AI (Contextual AI Engine)
Proses kontekstualisasi diwujudkan secara nyata dengan visualisasi 6 tahapan (`ContextualProgress`):
1. **Membaca & Memahami Konten**: Mengekstrak struktur kalimat dan istilah kunci.
2. **Klasifikasi Kurikulum SD**: Memverifikasi kesesuaian materi untuk usia siswa Kelas 5 SD.
3. **Temu Balik Local Knowledge Base (LKB)**: Mengambil fakta geografis, komoditas unggulan, dan kearifan lokal terverifikasi via `pgvector`.
4. **Penyesuaian Narasi Kontekstual**: Mengganti variabel generik menjadi entitas nyata lokal.
5. **Validasi Edukatif & Pedagogis**: Memastikan kuantitas matematis terjaga ($20 \times 12.000 = 240.000$), kunci jawaban konsisten, dan narasi ramah anak.
6. **Pemilihan Aset Visual Terverifikasi**: Menyematkan foto berlisensi CC/Wikimedia yang sesuai dengan konteks daerah.

---

### 2.7 Tahap 7: Studio Review & Editor Hasil Kontekstual
- **URL Soal**: `/teacher/questions/context-preview?id=[id]`
- **URL Materi**: `/teacher/materials/create` (Mode Review)
- Guru dapat:
  - Meninjau komparasi naskah standar vs naskah terkontekstualisasi.
  - Memilih alternatif kandidat entitas lokal (misal: porang vs tebu vs susu sapi Pudak).
  - Menyunting langsung redaksi teks pertanyaan, pilihan opsi, kunci, dan pembahasan.
  - Mengaktifkan atau menonaktifkan gambar pendukung.
  - Melakukan tindakan:
    - **Simpan Draft**
    - **Setujui & Simpan ke Bank Soal / Modul**
    - **Gunakan Langsung pada Ujian Baru**
    - **Cetak Dokumen A4**

---

### 2.8 Tahap 8: Distribusi & Ekspor Hasil

#### A. Mode Cetak Fisik A4 (`/teacher/print`)
- **Lembar Soal Siswa**: Layout formal A4 dengan kop sekolah, identitas siswa, butir soal, dan area jawaban esai tanpa memuat kunci jawaban.
- **Lembar Kunci Jawaban Guru**: Dokumen terpisah berisi kunci jawaban terverifikasi dan panduan rubrik penskoran.
- **Modul Bacaan Materi**: Layout artikel rapi dengan sematan foto ilustrasi kontekstual.

#### B. Mode Pembelajaran Daring Siswa SD
- Materi dipublikasikan langsung ke ruang kelas yang dipilih guru.
- Ujian daring dibuka dengan durasi terukur.
- Siswa mengerjakan di portal khusus (`/student/examinations/[id]/session`).
- Pilihan ganda dinilai otomatis (*deterministic auto-grading*), esai diperiksa guru, dan hasil belajar diterbitkan ke portal siswa (`/student/dashboard`).
