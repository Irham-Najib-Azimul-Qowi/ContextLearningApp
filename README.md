# Pahami V2 (ContextLearning) — AI-Powered Local Contextual Learning Platform

> **Platform Pembelajaran Kontekstual Berbasis AI & Karakteristik Wilayah Lokal untuk Sekolah Dasar (SD)**  
> *Fokus Prototipe V2: Wilayah Karesidenan Madiun (Kota Madiun, Kab. Madiun, Kab. Ngawi, Kab. Magetan, Kab. Ponorogo, Kab. Pacitan)*

---

## 🚀 Pahami V2: Kolaborasi & Arsitektur Paralel
Repositori ini telah disiapkan untuk pengembangan kolaboratif paralel antara 2 pengembang:
- **Member 1 (Data & RAG Engineer):** Bertanggung jawab atas pengumpulan dataset konteks lokal Karesidenan Madiun, normalisasi entitas, chunking, embedding, serta pencarian hybrid di `data-pipeline/` dan pgvector.
  - Cabang aktif: `feature/local-knowledge-rag`
- **Member 2 (Full-Stack & AI Engineer):** Bertanggung jawab atas antarmuka web guru/siswa Next.js, integrasi Google Gemini API, Contextualization Engine, dan sistem ujian interaktif.
  - Cabang aktif: `feature/pahami-core-web`

### Tautan Dokumentasi & Kontrak Integrasi
- 📐 **Kontrak Integrasi:**
  - [Region Contract (Standar Kode Wilayah BPS)](./contracts/region-contract.md)
  - [Context Entity Contract (Struktur Data Entitas Konteks)](./contracts/context-entity-contract.md)
  - [Retrieval Contract (Antarmuka Permintaan & Tanggapan RAG)](./contracts/retrieval-contract.md)
- 📚 **Panduan & Arsitektur:**
  - [Repository Architecture & Boundaries](./docs/REPOSITORY_ARCHITECTURE.md)
  - [Git Team Workflow & Collaboration Rules](./docs/TEAM_WORKFLOW.md)
  - [Development Handoff & Readiness Guide](./docs/DEVELOPMENT_HANDOFF.md)
  - [Developer Setup Guide (Setup Lokal)](./docs/DEVELOPER_SETUP_GUIDE.md)

---

## 1. Ikhtisar Produk (Product Overview)

**Pahami (ContextLearning)** adalah platform Learning Management System (LMS) inovatif yang dirancang khusus untuk membantu guru Sekolah Dasar (SD Kelas 1–6) di Indonesia menciptakan soal latihan, naskah ujian, dan materi pembelajaran yang diadaptasi secara langsung dengan karakteristik geografis, ekonomi, sosial, mata pencaharian, dan budaya di lingkungan sekitar sekolah siswa.

### Nilai Utama Produk (Value Proposition)
> *"Pahami membantu guru menciptakan soal dan materi pembelajaran yang sesuai dengan karakteristik lingkungan lokal siswa melalui kecerdasan buatan dan pemrosesan konteks wilayah."*

---

## 2. Inovasi Teknis Utama (Core Technical Innovation)

ContextLearning **bukan sekadar wrapper generative AI biasa** yang hanya meneruskan prompt bebas ke LLM. Sistem ini menerapkan arsitektur *Contextual AI Engine* hibrida yang terstruktur:

```
Naskah Soal Kurikulum Nasional / Foto Lembar Soal
                       ↓
           [Question Understanding]
                       ↓
     [Context Variable Extraction (RegEx/AI)]
  Memisahkan: [OCCUPATION], [COMMODITY], [MARKET]
  Melindungi: Angka matematika, operator hitung, kunci jawaban
                       ↓
     [Local Knowledge Base Retrieval (PostgreSQL)]
  Hierarki: Kecamatan → Kabupaten/Kota → Provinsi → Fallback
                       ↓
      [Context Mapping & Template Substitution]
  Injeksi entitas lokal terdekat secara deterministik
                       ↓
          [Subject Educational Validation]
  Matematika: Verifikasi kuantitas & relasi hitung (24 - 9 = 15 kg)
  Bahasa Indonesia: Verifikasi keterpaduan bacaan & kompetensi
  IPS: Verifikasi faktual wilayah & bebas stereotip
                       ↓
           [Teacher Review & Approval]
  Komparasi side-by-side (Asli vs Lokal) + Pemilihan alternatif
                       ↓
             Bank Soal & Ruang Ujian
```

### Mengapa Pendekatan Hibrida?
1. **Mengurangi Ketergantungan Eksternal**: Operasi inti seperti pembuatan soal manual, adaptasi berbasis template, pengelolaan kelas, pelaksanaan ujian, dan penilaian pilihan ganda tetap **100% berjalan normal saat Gemini AI offline atau kuota habis**.
2. **Efisiensi Biaya Token**: Pemetaan variabel lokal dan penilaian pilihan ganda dilakukan deterministik di sisi server tanpa memanggil Gemini API secara boros.
3. **Presisi Edukasi**: AI generatif murni rawan mengubah angka hitungan matematika atau halusinasi kunci jawaban. Dengan arsitektur terisolasi, angka dan relasi kuantitas dijamin tidak berubah.

---

## 3. Peran Pengguna (User Roles)

Sistem memiliki 2 peran terverifikasi dengan otorisasi ketat di sisi server dan database:

| Peran | Hak Akses & Fitur Utama |
|---|---|
| **Guru (TEACHER)** | Mengatur profil wilayah sekolah, mengelola bank soal, generate soal AI, scan foto lembar soal fisik, komparasi kontekstualisasi, manajemen kelas & kode gabung, penerbitan materi ajar, penjadwalan ujian, pemantauan pengerjaan, dan penilaian essay siswa. |
| **Siswa (STUDENT)** | Bergabung ke kelas menggunakan kode unik, membaca materi ajar kontekstual, mengerjakan sesi ujian aman (*anti-bocor tanpa kunci jawaban*), autosave jawaban, serta melihat nilai dan pembahasan setelah dirilis guru. |

---

## 4. Mata Pelajaran & Wilayah Demonstrasi

### Mata Pelajaran Prototype (SD Kelas 1–6):
1. **Matematika**: Penjumlahan, pengurangan, pecahan, satuan berat (kg), waktu tempuh, dan aritmetika sosial.
2. **Bahasa Indonesia**: Paragraf narasi deskriptif, ide pokok, kosakata kontekstual, dan pemahaman bacaan.
3. **IPS (Ilmu Pengetahuan Sosial / IPAS)**: Bentang alam, keterkaitan kenampakan alam dengan mata pencaharian, aktivitas pasar, dan pelestarian budaya.

### 2 Basis Wilayah Demonstrasi:
1. **Samarinda & Wilayah Mahakam, Kalimantan Timur**:
   - *Geografi*: Sungai Mahakam, Danau Melintang.
   - *Infrastruktur*: Jembatan Mahakam, Pasar Pagi Samarinda, Pasar Segiri.
   - *Ekonomi & Komoditas*: Nelayan Air Tawar, Ikan Haruan (Gabus), Amplang, Kain Tenun Belang Hatta.
   - *Transportasi*: Kapal Klotok penyeberangan sungai.
   - *Sosial & Budaya*: Gotong royong bebaras, Festival Mahakam.
2. **Sleman & Yogyakarta, DI Yogyakarta**:
   - *Geografi*: Gunung Merapi, Kali Code.
   - *Infrastruktur*: Pasar Beringharjo, Candi Prambanan.
   - *Ekonomi & Komoditas*: Petani Salak Pondoh, Peternak Sapi Perah Kaliurang, Batik Tulis.
   - *Transportasi*: Andong tradisional, Trans Jogja.
   - *Sosial & Budaya*: Sambatan pedesaan, Tradisi Sekaten & Gunungan.

---

## 5. Tumpukan Teknologi (Technology Stack)

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4.
- **Ikonografi**: Lucide React (*Strict Requirement: Bebas Emoji pada antarmuka*).
- **Notasi Matematika**: KaTeX (`katex`) untuk rendering rumus dan hitungan SD.
- **Validasi Data**: Zod.
- **Backend**: Next.js Route Handlers & Server Components.
- **Database & Auth**: Supabase PostgreSQL dengan Row Level Security (RLS) & Supabase SSR Auth.
- **Kecerdasan Buatan**: Google Gemini API via official `@google/genai` SDK.
- **Pengujian (Testing)**: Node.js Test Runner dengan `tsx` untuk unit, integrasi, dan uji keamanan data.

---

## 6. Struktur Direktori Proyek

```
contextlearning/
├── app/
│   ├── api/
│   │   ├── classes/join/            # API pendaftaran kelas siswa
│   │   ├── examinations/session/    # API sesi ujian aman (tanpa kunci jawaban)
│   │   ├── examinations/save-answer/# API autosave jawaban siswa
│   │   ├── examinations/submit/     # API grading deterministik server-side
│   │   ├── examinations/review-essay/# API penilaian essay oleh guru
│   │   ├── questions/generate/      # API generator soal AI (Gemini)
│   │   ├── questions/scan/          # API multimodal OCR foto soal
│   │   ├── questions/contextualize/ # API pipeline engine kontekstualisasi
│   │   └── school/                  # API konfigurasi profil sekolah & wilayah
│   ├── auth/
│   │   ├── login/                   # Halaman masuk (dengan tombol demo juri)
│   │   └── register/                # Registrasi guru beserta profil sekolah
│   ├── notifications/               # Pusat notifikasi pengguna
│   ├── student/
│   │   ├── classes/                 # Kelas siswa & input kode gabung
│   │   ├── dashboard/               # Dashboard siswa SD
│   │   ├── examinations/            # Daftar ujian aktif siswa
│   │   │   └── [id]/
│   │   │       ├── session/         # Ruang pengerjaan ujian siswa (KaTeX, timer, autosave)
│   │   │       └── results/         # Lembar nilai & pembahasan rilis guru
│   │   └── materials/               # Bacaan materi belajar kontekstual
│   ├── teacher/
│   │   ├── classes/                 # Manajemen kelas & rilis kode gabung
│   │   ├── dashboard/               # Dashboard utama guru
│   │   ├── examinations/            # Manajemen ruang ujian & review essay
│   │   ├── materials/               # Pembuatan materi kontekstual
│   │   ├── questions/               # Bank soal guru
│   │   │   ├── context-preview/     # FITUR UTAMA: Komparasi Asli vs Kontekstual
│   │   │   ├── generator/           # Generator soal AI berbasis kurikulum
│   │   │   ├── manual/              # Editor soal mandiri & tag variabel
│   │   │   └── scan/                # Scan foto lembar soal fisik (Multimodal)
│   │   └── school/                  # Pengaturan sekolah & Local Knowledge Base
│   ├── globals.css                  # Desain token (Indigo, Slate, Emerald)
│   ├── layout.tsx                   # Root layout
│   └── page.tsx                     # Landing page resmi
├── components/
│   ├── layout/                      # Navbar, NotificationBell
│   └── ui/                          # Button, Input, Card, Modal, Badge, MathView (KaTeX)
├── lib/
│   ├── ai/                          # Provider Gemini API (@google/genai)
│   ├── context-engine/              # Core Innovation: Extractor, Retriever, Mapper, Validator
│   ├── db/                          # Model Types, Repository, Seed Data
│   ├── env.ts                       # Validasi Zod Environment Variables
│   └── supabase/                    # Client & Server Supabase SSR
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql   # Skema PostgreSQL lengkap & RLS Policies
│   └── seed.sql                     # Data wilayah Samarinda & Sleman
└── tests/
    ├── context-engine.test.ts       # Uji ekstraksi variabel & validasi matematika
    ├── grading.test.ts              # Uji penilaian deterministik tanpa LLM
    └── security.test.ts             # Uji isolasi data & pencegahan bocor kunci jawaban
```

---

## 7. Petunjuk Instalasi & Menjalankan Lokal

### Prasyarat
- Node.js versi 20, 22, atau 24 LTS.
- Git.

### 1. Kloning Repositori
```bash
git clone https://github.com/Irham-Najib-Azimul-Qowi/ContextLearningApp.git
cd ContextLearningApp
```

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variables
Salin berkas `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```

Isi konfigurasi pada `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-or-publishable-key
GEMINI_API_KEY=your-gemini-api-key   # Opsional: untuk fitur live AI generasi & scan gambar
```

### 4. Menjalankan Database Migrations (Supabase)
Eksekusi skrip SQL di dashboard Supabase SQL Editor:
1. Salin dan jalankan `supabase/migrations/001_initial_schema.sql`.
2. Salin dan jalankan `supabase/seed.sql` untuk memuat basis pengetahuan wilayah Samarinda dan Sleman.

### 5. Menjalankan Unit & Integration Tests
```bash
npm test
```
*Hasil uji akan memverifikasi 10 pengujian otomatis meliputi Context Engine, Server-Side Grading, dan Keamanan Data.*

### 6. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka browser pada alamat `http://localhost:3000`.

### 7. Membangun Bundle Produksi
```bash
npm run build
npm run start
```

---

## 8. Panduan Skenario Demonstrasi Juri (Hackathon Guide)

Aplikasi telah dilengkapi akun simulasi dan tombol akses cepat untuk memudahkan demonstrasi:

### Skenario Alur Guru:
1. Buka halaman masuk (`/auth/login`), klik tombol **"Masuk Guru Demo"** (Ibu Nurhaliza, S.Pd.).
2. Periksa **Dashboard Guru**: Lihat metrik kelas aktif, bank soal, dan profil sekolah *SD Negeri 001 Samarinda Kota*.
3. Buka menu **Profil Wilayah** (`/teacher/school`): Lihat entitas pengetahuan lokal Sungai Mahakam, Kapal Klotok, Pasar Pagi, dan Ikan Haruan. Ubah wilayah ke *Sleman (DIY)* untuk melihat adaptasi Gunung Merapi dan Salak Pondoh.
4. Buka menu **Bank Soal** (`/teacher/questions`):
   - Klik **Generate Soal AI**: Coba parameter Matematika / IPS, lihat pemisahan variabel `[OCCUPATION]`, `[COMMODITY]`, `[MARKET]`.
   - Atau klik **Scan Foto Soal**: Unggah lembar soal fisik dan lihat ekstraksi teks otomatis.
5. Buka **Pratinjau Kontekstualisasi** (`/teacher/questions/context-preview`):
   - **LAYAR UTAMA INOVASI**: Lihat komparasi berdampingan antara *Soal Asli* (pedagang, beras, pasar kota) dengan *Soal Kontekstual Samarinda* (Nelayan Air Tawar, Ikan Haruan, Pasar Pagi).
   - Ubah wilayah ke *Sleman*: Saksikan bagaimana soal yang sama otomatis berubah menjadi (Petani Salak Pondoh, Salak Pondoh, Pasar Beringharjo) dengan angka $24 - 9 = 15\text{ kg}$ yang **100% terjaga presisi**.
   - Klik entitas alternatif untuk mengganti pilihan pasar atau komoditas, lalu klik **Setujui & Simpan Soal**.
6. Buka menu **Ujian** (`/teacher/examinations`): Lihat ruang ujian yang telah dibuat untuk Kelas 5.

### Skenario Alur Siswa:
1. Buka halaman masuk (`/auth/login`), klik tombol **"Masuk Siswa Demo"** (Budi Pratama).
2. Periksa **Dashboard Siswa**: Muncul ujian yang dijadwalkan dan materi ajar lokal.
3. Klik **Mulai Kerjakan Ujian** (`/student/examinations/exam-01-samarinda/session`):
   - Perhatikan bahwa naskah soal tidak memuat kunci jawaban (aman dari inspeksi browser).
   - Rumus matematika dirender dengan KaTeX yang tajam.
   - Jawab pertanyaan pilihan ganda dan ketik uraian essay.
   - Status jawaban tersimpan otomatis (*Autosave*).
   - Klik **Kumpulkan Ujian**.
4. Sistem langsung melakukan **penilaian deterministik server-side** untuk pilihan ganda tanpa ketergantungan API AI.
5. Buka halaman **Hasil & Pembahasan** (`/student/examinations/exam-01-samarinda/results`):
   - Siswa dapat melihat skor capaian (85/100).
   - Meninjau butir soal yang benar dan pembahasan langkah pengerjaan.
   - Membaca umpan balik catatan guru pada jawaban essay.

---

## 9. Aspek Keamanan & Privasi Anak (Security & Privacy)

1. **Answer Key Protection**: Kunci jawaban (`correct_answer`), penjelasan, dan rubrik di-strip sepenuhnya di sisi server saat mahasiswa/siswa mengakses sesi ujian aktif.
2. **Deterministic Grading**: Penilaian pilihan ganda tidak diproses oleh LLM eksternal melainkan diverifikasi secara matematis di server.
3. **Data Minimization**: Tidak menyimpan koordinat GPS guru atau foto siswa; data siswa menggunakan identitas edukatif sederhana tanpa eksposur data pribadi berlebih.
4. **Row Level Security (RLS)**: PostgreSQL mengisolasi data kelas, lembar jawaban, dan nilai antar-siswa.

---

## 10. Batasan & Roadmap Pengembangan

- **Batasan Saat Ini**:
  - Basis pengetahuan bawaan mencakup 2 wilayah percontohan (Samarinda dan Sleman).
  - Ekstraksi scan lembar cetak mendukung format foto (JPG, PNG, WebP).
- **Rencana Pengembangan Selanjutnya (Roadmap)**:
  - Penambahan basis data pengetahuan lokal untuk 38 provinsi di Indonesia bekerja sama dengan dinas pendidikan daerah.
  - Integrasi audio text-to-speech bahasa daerah untuk kelas rendah (Kelas 1–2 SD).
  - Mode luring (*offline sync*) menggunakan Progressive Web App (PWA) untuk sekolah di daerah 3T.

---

*Dikembangkan dengan dedikasi untuk kemajuan mutu pendidikan kontekstual anak Indonesia.*
