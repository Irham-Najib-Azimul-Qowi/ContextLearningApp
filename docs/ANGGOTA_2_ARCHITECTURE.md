# PAHAMI V2 — ARSITEKTUR APLIKASI WEB & CONTEXTUAL AI ENGINE
**Peran:** Anggota 2 (Full-Stack Web Development, Contextual AI Engine & System Integration)  
**Kompetisi:** Hackathon IT Comp 2026 — Smart Education  
**Fokus Wilayah:** Karesidenan Madiun (Kabupaten Ponorogo & Kota Madiun)  

---

## 1. RINGKASAN EKSEKUTIF ARSITEKTUR

PAHAMI V2 dibangun dengan arsitektur modern berorientasi modularitas, pemisahan tanggung jawab (*Separation of Concerns*), dan ketahanan tinggi (*high resilience*). Sistem dirancang agar dapat mendemonstrasikan kemampuan penyesuaian materi dan butir soal pembelajaran sekolah dasar (SD) berbasis kearifan lokal wilayah Karesidenan Madiun tanpa mengubah tujuan pembelajaran, kompetensi dasar, maupun integritas perhitungan matematis.

```
                      +---------------------------------------+
                      |       Peramban Guru & Murid           |
                      |  (Desktop / Tablet / Smartphone)      |
                      +---------------------------------------+
                                          |
                                          v
                      +---------------------------------------+
                      |         Next.js App Router            |
                      |  (Tailwind CSS, Turbopack, React 19)  |
                      +---------------------------------------+
                                          |
                      +-------------------+-------------------+
                      |                                       |
                      v                                       v
         +--------------------------+           +--------------------------+
         |     Portal Guru          |           |      Portal Murid        |
         | - Icon Rail Navigation   |           | - Kid-Friendly UI (SD)   |
         | - Flyout Submenus        |           | - Ruang Baca Kontekstual |
         | - Studio Bank Soal       |           | - Sesi Pengerjaan Ujian  |
         | - Generator & Studio AI  |           | - Real-time Autosave     |
         | - Review Kontekstual     |           | - Hasil & Pembahasan     |
         | - Manajemen Kelas        |           +--------------------------+
         | - Evaluasi & Ujian       |
         +--------------------------+
                      |
                      v
         +----------------------------------------------------+
         |           Application & Context Engine Layer        |
         |  - Contextual AI Engine (9-Stage Modular Pipeline)  |
         |  - Mathematical Invariant Verifier                 |
         |  - Deterministic Scoring Engine                    |
         |  - Local Context Retrieval Adapter                 |
         +----------------------------------------------------+
                      |                                       |
         +------------v-------------+            +------------v-------------+
         |   Google Gemini API      |            | Member 1 Retrieval Modul |
         | - Structured Output      |            | - Local Knowledge Base   |
         | - Multimodal Vision OCR  |            | - Ponorogo & Madiun Data |
         | - Fallback Resilience    |            | - Adapter Abstraction    |
         +--------------------------+            +--------------------------+
                      |
                      v
         +----------------------------------------------------+
         |              Persistence & Security Layer          |
         | - Multi-School Scoping (School ID & Membership)    |
         | - LocalStorage / MemoryCache Repository Fallback   |
         | - Supabase PostgreSQL + RLS Ready Data Schema      |
         +----------------------------------------------------+
```

---

## 2. MODUL SISTEM UTAMA

### 2.1 UI/UX Shell & Navigasi Inovatif
- **Left Icon Navigation Rail:** Navigasi vertikal ringkas dengan kartu ikon squircle di sisi kiri, menggantikan sidebar konvensional berukuran besar.
- **Accessible Submenu Popover:** Menampilkan submenu dari 4 kelompok kerja:
  1. *Dashboard*: Beranda aktivitas dan metrik utama.
  2. *Kelas*: Manajemen kelas, kode undangan (`PNR-5A`), dan keanggotaan siswa.
  3. *Bank Soal & AI*: Katalog soal, AI Generator, Input Manual, Scan OCR, dan Pratinjau Kontekstual.
  4. *Evaluasi & Hasil*: Manajemen ujian, rekap nilai kelas, dan koreksi esai.
- **Top-Right Floating Control Bar:** Pengalih sekolah aktif (*Multi-School Switcher*), notifikasi belum dibaca, panel pengaturan fungsional, dan pengalih peran demo Guru/Murid.
- **Student Workspace:** Antarmuka khusus siswa SD dengan tipografi ramah anak, kontras tinggi (WCAG AA), dan target sentuh luas.

### 2.2 Contextual AI Engine (Prioritas Utama)
Pipeline 9 tahap mandiri yang mengekstrak variabel tanpa memicu halusinasi perhitungan:
1. **Question Understanding:** Memetakan tipe soal, topik, dan mengekstrak besaran numerik ($20 \text{ kg}$, $\text{Rp}12.000$).
2. **Entity Extraction:** Mendeteksi entitas kandidat (*commodity*, *location*, *tradition*, *geography*, *occupation*).
3. **Context Variable Classification:** Menilai kelayakan substitusi (*replaceable*, *reason*, *locked*).
4. **Local Context Retrieval:** Menghubungi adapter retrieval wilayah sekolah aktif (e.g. `35.02` Ponorogo).
5. **Context Mapping:** Mencocokkan entitas secara semantik dengan skor kelayakan pedagogis (0–100).
6. **Contextual Rewriting:** Menghasilkan naskah soal kontekstual dengan mempertahankan konstanta matematika dan opsi jawaban.
7. **Educational Validation:** Memvalidasi bahwa angka-angka kunci tidak berubah dan relasi aritmetika tetap benar.
8. **Teacher Review:** Halaman komparasi *side-by-side*, pemilih konteks alternatif, dan persetujuan guru sebelum rilis.
9. **Save & Distribution:** Penyimpanan berantai ke bank soal sekolah aktif.

### 2.3 Studio Materi Kontekstual
- Penyusunan materi bacaan kontekstual melalui 3 mode: Generate AI, Tulis Manual, dan Upload Dokumen.
- Penyesuaian naskah bacaan dengan kondisi alam lokal (sentra sapi perah Pudak, budidaya porang, perputaran Pasar Legi).
- Kontrol distribusi ke kelas-kelas binaan.

### 2.4 Modul Evaluasi & Ujian Terintegrasi
- **Manajemen Sesi Ujian:** Pengaturan jadwal, durasi pengerjaan, dan pemilihan soal terkontekstualisasi dari Bank Soal.
- **Ruang Pengerjaan Siswa:** Timer mundur tersinkronisasi, navigasi butir soal, autosave berkala per jawaban, dan konfirmasi pengumpulan.
- **Deterministic Auto-Grading:** Penilaian otomatis pilihan ganda di sisi server/repository tanpa membocorkan kunci jawaban ke peramban siswa.
- **Review Jawaban Esai:** Antarmuka guru untuk membaca uraian siswa, membandingkan dengan rubrik, rekomendasi skor dari AI, dan pemberian umpan balik konstruktif.

---

## 3. MULTI-SCHOOL DATA MODEL & ISOLASI DATA

Sistem mengimplementasikan isolasi data berbasis *Tenant/School Scoping*:
- Setiap entitas (Kelas, Soal, Materi, Ujian) memiliki atribut `school_id`.
- Siswa hanya dapat mengakses materi dan ujian dari kelas di mana mereka terdaftar melalui kode unik.
- Kunci jawaban soal pilihan ganda diisolasi dan hanya dihitung saat proses penilaian submission.

---

## 4. KETAHANAN TANPA DEPENDENSI EKSTERNAL (*OFFLINE RESILIENCE*)
Aplikasi PAHAMI V2 dirancang agar tetap 100% berfungsi baik saat:
1. Terhubung dengan Supabase dan Gemini API langsung.
2. Berjalan secara lokal (*standalone*) tanpa kredensial API aktif melalui simulasi `MockLocalContextRetriever` berbasis fakta terverifikasi dan `PahamiRepository` in-memory/localStorage.
