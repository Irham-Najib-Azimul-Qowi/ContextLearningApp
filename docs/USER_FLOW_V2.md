# ALUR PENGGUNA DAN PANDUAN INTERAKSI (USER FLOW V2)
**PAHAMI V2 — Platform Pembelajaran Kontekstual Berbasis AI (SD Kelas 5)**
*Proyek Prototype Kompetisi Hackathon IT Comp 2026*

Dokumen ini menjelaskan secara terperinci seluruh perjalanan pengguna (*user journeys*) untuk peran **Guru (Pendidik)** dan **Siswa (Peserta Didik SD Kelas 5)**, mencakup alur digital online, integrasi Google OAuth, onboarding cerdas, pembuatan soal & materi berbasis visual RAG, serta ekspor cetak fisik A4.

---

## 1. Diagram Alur Utama (System Overview Map)

```mermaid
flowchart TD
    Start([Landing Page: /]) --> ChooseAction{Pilih Jalur Utama}
    ChooseAction -->|Konteks Soal| Login[Login / Auth: /login]
    ChooseAction -->|Konteks Materi| Login
    ChooseAction -->|Akses Cepat Pengujian Juri| DashboardDirect[Akses Instan Dashboard]

    Login --> GoogleAuth[Google OAuth / Supabase Auth]
    GoogleAuth --> Callback[/auth/callback]
    Callback --> OnboardingCheck{Sudah Onboarding?}

    OnboardingCheck -->|Belum| Onboarding[/auth/onboarding]
    OnboardingCheck -->|Sudah & Guru| TeacherDash[/teacher/dashboard]
    OnboardingCheck -->|Sudah & Siswa| StudentDash[/student/dashboard]

    subgraph OnboardingFlow [3-Tahap Smart Onboarding]
        Onboarding --> Step1[Langkah 1: Identitas & Jenjang Kelas 5 SD]
        Step1 --> Step2[Langkah 2: Mode Penggunaan]
        Step2 -->|Perorangan / Guru Mandiri| DirectAccess[Bypass Passcode]
        Step2 -->|Sekolah Terdaftar| VerifyCode[Input Passcode: GURU-PAHAMI-2026]
        DirectAccess --> Step3[Langkah 3: Lokasi & Wilayah Lokal]
        VerifyCode --> Step3
        Step3 --> GeoLoc[Bantuan GPS Browser / Deteksi Geolocation]
        GeoLoc --> ConfirmRegion[Pilih Daerah: Madiun / Semarang]
    end

    ConfirmRegion --> SaveProfile[Simpan Profil & Wilayah Aktif]
    SaveProfile --> RouteIntent{Intent Awal?}
    RouteIntent -->|Konteks Soal| QuestionHub[/teacher/questions/new]
    RouteIntent -->|Konteks Materi| MaterialHub[/teacher/materials/new]
    RouteIntent -->|Default Guru| TeacherDash

    subgraph TeacherActivities [Aktivitas Guru]
        TeacherDash --> QuestionHub
        QuestionHub -->|Generate AI| ContextGen[AI Context Engine + Visual RAG]
        QuestionHub -->|Input Manual| ManualInput[Form Input Mandiri]
        QuestionHub -->|Scan Fisik| ScanLKS[OCR & Ekstraksi Lembar Kerja]
        
        ContextGen --> ContextPreview[/teacher/questions/context-preview]
        ContextPreview --> ToggleMedia{Sertakan Foto?}
        ToggleMedia -->|Ya| AttachMedia[Lampirkan Foto & Atribusi CC]
        ToggleMedia -->|Tidak| SkipMedia[Hanya Teks Kontekstual]
        AttachMedia --> SaveQuestion[(Simpan ke Bank Soal)]
        SkipMedia --> SaveQuestion

        TeacherDash --> CreateExam[/teacher/examinations/new]
        SaveQuestion --> CreateExam
        CreateExam --> PublishExam[(Terbitkan Ujian Kelas)]

        TeacherDash --> PrintModule[/teacher/print/exam/:id]
        PrintModule --> TogglePrintMode{Mode Lembar Cetak}
        TogglePrintMode -->|Lembar Ujian Siswa| PrintStudent[Cetak A4 Bersih Tanpa Kunci]
        TogglePrintMode -->|Kunci & Rubrik Guru| PrintTeacher[Cetak A4 Lengkap Kunci & Rubrik]
    end

    subgraph StudentActivities [Aktivitas Siswa]
        StudentDash --> JoinClass[/student/classes]
        JoinClass -->|Input Kode: PNR-5A| Enrolled[Terdaftar di Kelas]
        Enrolled --> ReadMaterials[/student/materials]
        ReadMaterials --> OpenReader[Pop-up Reader Cerita Lokal + Foto Daerah]

        Enrolled --> ExamList[/student/examinations]
        ExamList --> StartExam[/student/examinations/:id/session]
        StartExam --> AnswerQuestions[Jawab Soal + Lihat Foto Kontekstual]
        AnswerQuestions --> SubmitExam[Kumpulkan Jawaban Ujian]
        SubmitExam --> ExamResult[/student/examinations/:id/results]
        ExamResult --> ViewScore[Lihat Skor Otomatis & Pembahasan Kearifan Lokal]
    end
```

---

## 2. Rincian Alur Pengguna (Step-by-Step Journeys)

### 2.1 Alur 1: Landing Page & Penentuan Jalur Awal
1. Pengguna membuka URL root (`/`).
2. Menemukan tampilan interaktif dengan dua kartu utama yang seimbang:
   - **Konteks Soal**: Mengontekstualisasikan soal ujian standar menjadi soal berbasis fakta daerah. Tombol klik langsung mengarahkan ke alur pembuatan soal.
   - **Konteks Materi**: Mengubah topik pembelajaran teori kurikulum menjadi cerita kontekstual ramah anak SD Kelas 5.
3. Menampilkan status cakupan wilayah aktif secara transparan:
   - **Karesidenan Madiun** (Kota Madiun, Kab. Madiun, Magetan, Ngawi, Ponorogo, Pacitan).
   - **Kota Semarang** (`33.74`) dengan isolasi administratif dari Kab. Semarang (`33.22`).
4. Disediakan tombol jalan pintas juri (*Quick Demo Evaluator*) yang mengizinkan penguji langsung masuk sebagai Guru SD atau Siswa SD tanpa perlu mengisi form pendaftaran.

### 2.2 Alur 2: Autentikasi Google & 3-Step Smart Onboarding
1. **Login**: Pengguna menekan tombol "Masuk dengan Google".
2. **Supabase Auth Callback**: Sistem memeriksa apakah akun Google tersebut sudah memiliki record profil di database.
3. Jika belum, diarahkan ke `/auth/onboarding` dengan 3 tahapan terpandu:
   - **Langkah 1 (Identitas Diri)**:
     - Nama lengkap pengguna.
     - Pilihan peran utama: Guru atau Siswa.
     - Pilihan jenjang kelas (Default: Kelas 5 SD Fase C).
   - **Langkah 2 (Mode Penggunaan & Fleksibilitas Akses)**:
     - *Mode Perorangan / Guru Mandiri*: Mengizinkan guru bimbel, mahasiswa magang, atau guru privat mengakses seluruh fitur AI tanpa membutuhkan passcode sekolah.
     - *Mode Sekolah Resmi*: Memerlukan kode akses guru (`GURU-PAHAMI-2026`) untuk mengikat profil ke sekolah formal (misal: SDN 1 Ponorogo, SDN Pleburan 01 Semarang).
     - *Siswa*: Memasukkan kode undangan kelas yang diberikan oleh guru (misal: `PNR-5A`).
   - **Langkah 3 (Penetapan Wilayah Kontekstual)**:
     - Pengguna dapat menekan tombol **"Gunakan Lokasi Saat Ini (GPS)"** untuk mendeteksi koordinat perangkat secara otomatis.
     - Pengguna mengonfirmasi atau memilih daerah operasional melalui menu dropdown terkurasi (menjamin tidak ada salah pilih ke wilayah di luar cakupan).
4. **Smart Redirection**: Berdasarkan pilihan di landing page (*intent query* `?intent=question` atau `?intent=material`), setelah onboarding selesai guru langsung diantarkan ke halaman kerja yang relevan.

---

### 2.3 Alur 3: Ruang Kerja Guru & Pembuatan Konten Kontekstual
1. **Teacher Dashboard (`/teacher/dashboard`)**:
   - Menerapkan desain palet referensi: sidebar gelap elegan (`#51465B`), aksen koral (`#F47D83`), dan kartu aksi cepat kuning kenari (`#FFD36D`).
   - Switcher wilayah cepat di sudut kanan atas memungkinkan guru mengganti fokus daerah hanya dengan 1 klik.
2. **Pembuatan Soal (`/teacher/questions/new`)**:
   - Memilih 1 dari 3 opsi kartu modern:
     1. **Generate dengan AI**: Memasukkan topik atau Capaian Pembelajaran (CP). AI Engine memanggil Supabase LKB RPC untuk mengambil fakta terverifikasi dan menyusun soal baru.
     2. **Input Manual**: Guru menempelkan soal lama yang sudah dimiliki.
     3. **Scan Fisik LKS**: Guru mengunggah foto soal dari buku fisik untuk diekstraksi.
3. **Pratinjau Kontekstualisasi (`/teacher/questions/context-preview`)**:
   - Tampilan komparasi berdampingan (*Side-by-side Diff*): Soal Asli vs Soal Terkontekstualisasi.
   - **Visual Supporting Media**:
     - Sistem secara otomatis mencocokkan entitas soal dengan repositori media `lkb_media_assets`.
     - Terdapat tombol sakelar (*toggle*) interaktif: **"Sertakan Gambar Pendukung"**.
     - Menampilkan foto asli cagar budaya/komoditas, judul keterangan (*caption*), dan atribusi legal hak cipta (Wikimedia Commons CC-BY-SA).
   - Guru dapat mengedit teks soal, kunci jawaban, dan rubrik sebelum menekan tombol **"Simpan ke Bank Soal"**.

---

### 2.4 Alur 4: Pelaksanaan Ujian Siswa (Online Kid-Friendly Exam)
1. Siswa masuk ke `/student/dashboard` menggunakan akun siswa atau mode demonstrasi.
2. Membuka menu **Ujian Online** (`/student/examinations`) dan memilih ujian yang aktif.
3. **Halaman Sesi Ujian (`/student/examinations/[id]/session`)**:
   - Desain ramah anak dengan font jelas, nomor soal kontras tinggi, dan indikator sisa waktu ujian.
   - **Penyajian Soal Bergambar**: Jika soal memiliki media pendukung, foto ditampilkan dengan rapi beserta takarir dan sumbernya.
   - Pilihan ganda dengan tombol berukuran besar yang nyaman ditekan pada tablet atau layar sentuh.
   - Kolom esai interaktif untuk mengasah kemampuan bernalar kritis siswa.
   - Palet nomor soal di bagian bawah untuk memudahkan navigasi antar nomor.
4. **Pengumpulan Ujian & Hasil Penilaian (`/student/examinations/[id]/results`)**:
   - Konfirmasi pengumpulan otomatis mencegah siswa mengumpulkan secara tidak sengaja.
   - Skor pilihan ganda dinilai seketika (*instant deterministic grading*).
   - Menampilkan pembahasan soal berbasis kearifan lokal (*Mengapa contoh ini digunakan di sekolah kita?*) agar siswa memahami nilai edukatif di balik soal.

---

### 2.5 Alur 5: Ekspor Fisik & Cetak Kertas A4 (Print to PDF Module)
Menjawab kebutuhan sekolah di daerah yang memiliki keterbatasan perangkat digital atau saat ujian semester berbasis kertas:

1. Guru membuka menu **Cetak Soal** pada daftar ujian (`/teacher/print/exam/[id]`).
2. Tampilan otomatis disesuaikan dengan format standar kertas **A4**:
   - **Kop Surat Resmi Sekolah**: Memuat nama dinas pendidikan, nama sekolah, mata pelajaran, alokasi waktu, dan kelas.
   - **Kotak Identitas Siswa**: Tempat pengisian nama, nomor absen, dan kelas dengan garis titik-titik rapi.
   - **Petunjuk Pengerjaan Soal**: Petunjuk umum standar ujian nasional/daerah.
   - **Tata Letak Dua Kolom / Satu Kolom Proporsional**: Pertanyaan, opsi A-B-C-D, dan gambar kontekstual dioptimalkan agar tidak terpotong antar halaman (`break-inside: avoid;`).
3. **Sakelar Mode Cetak Cerdas**:
   - **Mode Lembar Siswa**: Membersihkan seluruh kunci jawaban, rubrik, dan penjelasan sehingga siap difotokopi dan dibagikan ke siswa di kelas.
   - **Mode Kunci Guru**: Menampilkan tanda centang hijau pada jawaban yang benar, poin rubrik esai, dan penjelasan pedagogis untuk arsip pendidik.
4. Menekan tombol **"Cetak / Unduh PDF"** memicu dialog cetak bawaan browser (*Ctrl+P / native print*) tanpa perlu bergantung pada pustaka PDF eksternal yang lambat.

---

## 3. Matriks Hak Akses & Isolasi Peran (Role Security Matrix)

| Rute URL | Pengunjung / Tamu | Siswa SD | Guru Mandiri | Guru Sekolah Resmi |
| :--- | :---: | :---: | :---: | :---: |
| `/` (Landing Page) | ✅ Akses | ✅ Akses | ✅ Akses | ✅ Akses |
| `/login` | ✅ Akses | ✅ Akses | ✅ Akses | ✅ Akses |
| `/auth/onboarding` | ❌ Harus Login | ✅ Akses | ✅ Akses | ✅ Akses |
| `/teacher/dashboard` | ❌ Dialihkan | ❌ Dialihkan | ✅ Akses | ✅ Akses |
| `/teacher/questions/*` | ❌ Dialihkan | ❌ Dialihkan | ✅ Akses | ✅ Akses |
| `/teacher/print/*` | ❌ Dialihkan | ❌ Dialihkan | ✅ Akses | ✅ Akses |
| `/student/dashboard` | ❌ Dialihkan | ✅ Akses | ❌ Dialihkan | ❌ Dialihkan |
| `/student/examinations/*` | ❌ Dialihkan | ✅ Akses | ❌ Dialihkan | ❌ Dialihkan |

---

## 4. Kesimpulan Keunggulan Alur V2
- **Tanpa Hambatan Masuk (*Zero Friction Onboarding*)**: Uji coba oleh juri dan pengguna baru dapat dilakukan dalam 5 detik melalui fitur *Akses Cepat Pengujian Juri* dan *Mode Guru Mandiri*.
- **Kontinuitas Pembelajaran Holistik**: Menghubungkan proses perancangan guru (digital/AI) hingga pelaksanaan siswa (baik online di layar maupun offline di atas kertas A4).
- **Pengalaman Visual Konkret**: Foto cagar budaya dan ikon daerah hadir di seluruh sentuhan antarmuka (editor guru, lembar cetak, modul bacaan, dan ruang ujian siswa).
