# PAHAMI V2 — UI/UX Redesign Documentation (V3)
*Layered Rounded Dashboard, Contextual Learning Workflow & Unified Design System*

---

## 1. Ikhtisar Redesain
Redesain antarmuka **PAHAMI V2** mengadaptasi konsep **Layered Rounded Dashboard** yang terinspirasi dari referensi visual modern, disesuaikan khusus untuk platform pendidikan pembelajaran kontekstual berbasis AI (fokus SD Kelas 5 di Karesidenan Madiun & Kota Semarang).

Tujuan redesain:
1. **Estetika Berlapis & Modern**: Menghilangkan kesan kaku seperti dashboard e-commerce/template admin generik, menggantikannya dengan kanvas aplikasi berlapis (*layered workspace*) dengan sudut membulat (*giant squircle rounded corners*).
2. **Hierarki Fungsional Jelas**: Memfokuskan alur kerja guru pada dua pilar utama di Beranda: **Buat Materi** (Kiri, Dark Mauve `#51465B`) dan **Buat Soal** (Kanan, Warm Yellow `#FFD36D`).
3. **Dukungan 4 Metode Input Lengkap**: Upload PDF, Ambil Foto/Vision OCR, Ketik Manual, dan Generate AI pada kedua modul layanan.
4. **Indikator Progres Kontekstual Berkelanjutan**: Visualisasi 6 tahapan nyata Contextual AI Engine (ekstraksi, kurikulum SD, temu balik pgvector LKB, penyesuaian narasi, validasi pedagogis, dan pemilihan media berlisensi).
5. **Keterpisahan Alur Murid vs Guru**: Siswa SD Kelas 5 memiliki portal belajar yang ceria, bebas dari input GPS rumit atau pemilihan alur pembuatan modul guru.

---

## 2. Design System & Tokens

### 2.1 Palet Warna Fungsional
| Token | Nilai Hex | Peran dalam Antarmuka |
|---|---|---|
| `--color-dark-mauve` | `#51465B` | Sidebar kiri, panel Buat Materi, tombol aksi utama, header kartu. |
| `--color-soft-rose` | `#DFAEB3` | Aksen ambient glow latar, badge status, highlight sekunder. |
| `--color-coral` | `#F47D83` | Aksen interaktif, badge kategori, indikator langkah aktif. |
| `--color-warm-yellow` | `#FFD36D` | Panel Buat Soal, ikon aksen emas, kontras tinggi di atas Dark Mauve. |
| `--color-off-white` | `#FAF7F3` | Latar belakang kanvas luar, input background, kartu pratinjau. |
| `--color-white` | `#FFFFFF` | Area membaca utama, editor teks, kartu soal, modal dialog. |
| `--color-dark-text` | `#23212A` | Warna tipografi teks utama (kontras tinggi di permukaan terang). |
| `--color-secondary-text` | `#756F7A` | Teks keterangan, deskripsi sekunder, placeholder. |
| `--color-soft-border` | `#E9E5E8` | Garis batas tipis lembut (*subtle border*) pemisah panel. |

> **Aturan Kontras**: Teks di atas `#FFD36D` (Warm Yellow) menggunakan teks gelap (`#23212A`). Teks di atas `#51465B` (Dark Mauve) menggunakan teks putih atau `#FFD36D`.

### 2.2 Skala Border Radius
| Elemen | Token / Kelas | Ukuran Radius |
|---|---|---|
| Kontainer Aplikasi Utama | `--radius-outer` | `36px` (`rounded-[28px] sm:rounded-[36px]`) |
| Panel Utama (Materi & Soal) | `--radius-panel` | `28px` (`rounded-[28px]`) |
| Kartu Fitur & Hub Pilihan | `--radius-card` | `20px` - `24px` (`rounded-[20px] sm:rounded-[24px]`) |
| Kartu Kecil & Badges | `--radius-card-sm` | `16px` - `18px` (`rounded-[16px] sm:rounded-[18px]`) |
| Input Fields & Dropdowns | `--radius-input` | `12px` - `14px` (`rounded-xl` / `rounded-[14px]`) |
| Tombol Aksi Utama | `--radius-button` | `14px` - `16px` (`rounded-2xl` / `rounded-[16px]`) |
| Dialog & Modal Popups | `--radius-dialog` | `28px` - `32px` (`rounded-[28px] sm:rounded-[32px]`) |

### 2.3 Tipografi
- **Font Utama**: *Inter* / *Plus Jakarta Sans* dengan bobot terukur (`font-medium`, `font-semibold`, `font-bold`, `font-black`).
- **Skala Ukuran**:
  - Judul Layar Utama: `28px - 32px` (`text-2xl sm:text-3xl font-black`)
  - Judul Panel & Seksi: `20px - 24px` (`text-xl font-extrabold`)
  - Judul Butir Soal & Kartu: `16px - 18px` (`text-base font-bold`)
  - Teks Isi / Body Text: `14px` (`text-sm font-medium leading-relaxed`)
  - Teks Penjelas / Caption: `11px - 12px` (`text-xs font-semibold text-[#756F7A]`)

---

## 3. Komposisi Berlapis (*Layered Architecture*)

Struktur kanvas terdiri dari 4 lapisan visual harmonis:
```
+------------------------------------------------------------------------+
| LAPISAN 1: Background Luar Pastel (#FAF7F3) + Ambient Corner Glows    |
|   +----------------------------------------------------------------+   |
|   | LAPISAN 2: Main Application Squircle Container (radius: 36px)   |   |
|   |   +-------------------+  +-----------------------------------+  |   |
|   |   | LAPISAN 3A:       |  | LAPISAN 3B: Top Bar & Central     |  |   |
|   |   | Dark Mauve        |  | Workspace Canvas                  |  |   |
|   |   | Sidebar           |  |                                   |  |   |
|   |   | (radius: 28px)    |  |  +---------------+ +------------+ |  |   |
|   |   |                   |  |  | LAPISAN 4:    | | LAPISAN 4: | |  |   |
|   |   | - Beranda         |  |  | Panel Materi  | | Panel Soal | |  |   |
|   |   | - Materi          |  |  | (Mauve/White) | | (Warm Ylw) | |  |   |
|   |   | - Soal            |  |  +---------------+ +------------+ |  |   |
|   |   | - Kelas           |  |                                   |  |   |
|   |   | - Ujian           |  |  +------------------------------+ |  |   |
|   |   | - Cetak A4        |  |  | Aktivitas Terakhir Dikerjakan| |  |   |
|   |   | - Pengaturan      |  |  +------------------------------+ |  |   |
|   |   +-------------------+  +-----------------------------------+  |   |
|   +----------------------------------------------------------------+   |
+------------------------------------------------------------------------+
```

---

## 4. Rincian Implementasi Halaman Utama

### 4.1 Landing Page (`app/page.tsx`)
- Aksesibel publik tanpa mengharuskan login terlebih dahulu.
- **Hero Headline**: *"Belajar lebih dekat dengan lingkungan sekitar."*
- **Dua Card Layanan Utama Berdampingan**:
  - **KIRI**: `KONTEKSKAN SOAL` (Arahkan ke Google OAuth -> Onboarding -> `/teacher/questions/new`).
  - **KANAN**: `KONTEKSKAN MATERI` (Arahkan ke Google OAuth -> Onboarding -> `/teacher/materials/new`).
- **Indikator Wilayah Terlayani**: 6 daerah Karesidenan Madiun + Kota Semarang (`33.74`).

### 4.2 Login Google (`app/login/page.tsx`)
- Container membulat besar (`rounded-[36px]`) dengan header Dark Mauve.
- Tombol tunggal: *"Lanjutkan dengan Google"* (Supabase OAuth).
- Tidak memuat form password manual yang rentan.
- Akses cepat pratinjau evaluator juri (Demo Guru & Demo Siswa).

### 4.3 Wizard Onboarding 4 Langkah (`app/auth/onboarding/page.tsx`)
1. **Langkah 1 (Identitas)**: Sinkronisasi nama tampilan dan avatar Google.
2. **Langkah 2 (Jenis Penggunaan)**: Dua kartu eksklusif: **Perorangan** (pembuatan mandiri) vs **Sekolah** (terintegrasi satuan pendidikan).
3. **Langkah 3 (Data Wilayah & GPS)**:
   - Form pemilihan Provinsi, Kabupaten/Kota, Kecamatan.
   - Tombol *"Gunakan lokasi perangkat (GPS)"* dengan konfirmasi deteksi sebelum disimpan.
   - Jika izin GPS ditolak, form manual tetap dapat digunakan secara fleksibel.
4. **Langkah 4 (Konfirmasi Ringkasan)**: Ringkasan profil & wilayah sebelum diarahkan ke layanan tujuan.

### 4.4 Beranda Guru (`app/teacher/dashboard/page.tsx`)
- **Dua Panel Pahlawan (*Hero Service Panels*)**:
  - **Panel Materi (Kiri)**: Background Dark Mauve `#51465B`, kontras kartu putih di dalamnya, tombol *"Mulai Buat Materi"* (`/teacher/materials/new`).
  - **Panel Soal (Kanan)**: Background Warm Yellow `#FFD36D`, teks gelap kontras, tombol *"Mulai Buat Soal"* (`/teacher/questions/new`).
- **Bagian Terakhir Dikerjakan**: Menampilkan butir soal dan modul materi yang baru saja diedit beserta pintasan langsung ke editor atau cetak.
- **Top Bar**: Salam personal pengajar, nama sekolah aktif, switcher wilayah cepat, notifikasi, dan profil.

### 4.5 Hub Pembuatan Soal (`app/teacher/questions/new/page.tsx`)
Menampilkan 4 kartu metode input terstruktur:
1. `Upload PDF` -> `/teacher/questions/scan?mode=pdf`
2. `Ambil Foto / Vision OCR` -> `/teacher/questions/scan?mode=photo`
3. `Ketik Manual` -> `/teacher/questions/manual`
4. `Generate AI` -> `/teacher/questions/generator`

### 4.6 Hub Pembuatan Materi (`app/teacher/materials/new/page.tsx`)
Menampilkan 4 kartu metode input terstruktur:
1. `Upload PDF` -> `/teacher/materials/create?tab=pdf`
2. `Ambil Foto / Vision OCR` -> `/teacher/materials/create?tab=photo`
3. `Ketik Manual` -> `/teacher/materials/create?tab=manual`
4. `Generate AI` -> `/teacher/materials/create?tab=ai`

### 4.7 Studio Editor & Kontekstualisasi
- **Soal**: `app/teacher/questions/context-preview/page.tsx`
  - Stepped progress indicator via `ContextualProgress`.
  - Komparasi side-by-side naskah asli vs kontekstual.
  - Pemilih kandidat entitas lokal (variabel pengganti).
  - Pilihan gambar pendukung berlisensi Wikimedia/CC.
  - Aksi: Simpan Draft, Setujui & Simpan ke Bank Soal, Gunakan di Ujian, Cetak A4.
- **Materi**: `app/teacher/materials/create/page.tsx`
  - Stepped progress indicator via `ContextualProgress`.
  - Segmented tab 4 metode input.
  - Target wilayah mencakup 7 daerah lengkap (termasuk Kota Semarang `33.74`).
  - Editor perbandingan dua kolom.
  - Aksi: Simpan Draft, Setujui & Publikasikan ke Kelas, Cetak A4, Pratinjau Tampilan Siswa.

### 4.8 Pusat Cetak Dokumen A4 (`app/teacher/print/page.tsx`)
- Hub terpadu ekspor cetak lembar soal siswa (A4) dan modul ajar.
- Pemisahan lembar soal siswa dengan lembar kunci jawaban & rubrik penilaian guru (sesuai spesifikasi Bagian 13.1).

### 4.9 Pengaturan & Profil Guru (`app/teacher/settings/page.tsx`)
- Manajemen akun, peralihan sekolah, preferensi kedalaman dialek lokal, dan tombol logout aman.

### 4.10 Portal Siswa SD Kelas 5 (`components/layout/student-workspace-shell.tsx`)
- Antarmuka berlapis ramah anak dengan kartu squircle `rounded-[36px]`.
- Tanpa menu pembuatan konten guru; fokus pada materi siap baca, latihan soal kontekstual, dan pengumuman nilai hasil belajar.

---

## 5. Komponen Reusable yang Dibangun
- `TeacherWorkspaceShell`: Kerangka kerja berlapis guru dengan sidebar squircle Mauve, top bar kontekstual, dan kanvas putih.
- `StudentWorkspaceShell`: Kerangka kerja berlapis siswa SD dengan palet ceria dan navigasi sederhana.
- `ContextualProgress`: Indikator 6 tahapan nyata eksekusi Contextual AI Engine.
- `REGION_OPTIONS`: Konstanta terpadu 7 wilayah prioritas terverifikasi (Karesidenan Madiun + Kota Semarang).
