# Audit Awal Repositori & Kesiapan Arsitektur — Anggota 2 (Pahami V2)

**Tanggal Audit:** 23 September 2026  
**Peran Auditor:** Anggota 2 — Full-Stack & AI Engineer (Hackathon IT Comp 2026, Smart Education)  
**Branch Aktif:** `feature/pahami-core-web`  
**Basis Snapshot:** Commit `b44a480` (Clean Baseline V2)  
**Referensi Proyek Lama:** `backup/pre-context-engine-refactor` (Commit `18ec994`)  

---

## 1. Kondisi Awal Repositori

1. **Status Git & Percabangan:**
   - Repositori telah dibersihkan dari kode monolitik LMS lama (guru, murid, admin, multi-tenant) dan dicadangkan secara permanen ke `backup/pre-context-engine-refactor` pada commit `18ec9942f49436d866ca3de14639a05b2cfd89ab`.
   - Branch `main`, `feature/local-knowledge-rag` (Anggota 1), dan `feature/pahami-core-web` (Anggota 2) berada pada baseline bersih yang sama (`b44a480`).
   - Seluruh pekerjaan Anggota 2 akan dilakukan di branch `feature/pahami-core-web`.

2. **Framework & Tumpukan Teknologi:**
   - **Framework:** Next.js 16.3.5 (App Router, Turbopack).
   - **UI Library:** React 19.2.8.
   - **Styling:** Tailwind CSS v4 (`@tailwindcss/postcss`).
   - **Bahasa:** TypeScript 5.
   - **SDK AI:** `@google/genai` (v2.23.0) untuk integrasi Google Gemini API.
   - **Database Client:** `@supabase/supabase-js` (v2.116.0) dan `@supabase/ssr` (v0.12.7).
   - **Ikonografi:** `lucide-react` (v1.47.0).
   - **Notasi Matematika:** `katex` (v0.18.7) dan `@types/katex`.
   - **Validasi Data:** `zod` (v4.6.5).
   - **Testing:** Node.js native test runner via `tsx --test`.

3. **Status Kode & File Saat Ini:**
   - `app/page.tsx`: Beranda Pahami V2 informatif, fokus Karesidenan Madiun, tanpa dependensi login atau API eksternal.
   - `app/layout.tsx`: RootLayout minimalis dengan font Inter.
   - `app/globals.css`: Pengaturan warna dan reset CSS dasar.
   - `lib/env.ts`: Parser Zod variabel lingkungan opsional.
   - `contracts/`: Kontrak integrasi awal (`region-contract.md`, `context-entity-contract.md`, `retrieval-contract.md`).
   - `data-pipeline/`: Boundary terpisah milik Anggota 1 dengan `.gitkeep`.
   - `tests/foundation.test.ts`: Uji unit fondasi yang 100% lulus.

---

## 2. Fitur yang Sudah Tersedia vs Belum Tersedia

| Modul / Fitur | Status Saat Ini | Rencana Anggota 2 |
| :--- | :--- | :--- |
| **Fondasi Halaman Utama (Homepage)** | **Tersedia** (Clean) | Ditingkatkan agar terhubung ke alur Masuk Guru & Murid demo |
| **Design System & Palette Pahami V2** | **Sebagian** (CSS Dasar) | Standardisasi palet: `#4F46E5`, `#0EA5E9`, `#F8FAFC`, `#FFFFFF` |
| **Navigasi Ikon Vertikal Kiri & Submenu** | **Belum Tersedia** | Dibangun ulang dengan sistem rail kartu ikon + flyout submenu |
| **Navigasi Kanan Atas (Floating Controls)** | **Belum Tersedia** | Dibangun: Switcher Sekolah Aktif, Notifikasi, Pengaturan, Profil |
| **Manajemen Multi-Sekolah & Role** | **Belum Tersedia** | Dibangun: Context sekolah aktif, role Guru & Murid dengan isolasi data |
| **Dashboard Guru & Quick Actions** | **Belum Tersedia** | Dibangun: Ringkasan kelas, soal, materi, ujian, dan tombol aksi cepat |
| **Dashboard Murid SD** | **Belum Tersedia** | Dibangun: Antarmuka ramah anak SD (kelas, ujian aktif, materi) |
| **Modul Pengelolaan Kelas & Kode Gabung** | **Belum Tersedia** | Dibangun: Pembuatan kelas, kode unik gabung siswa, manajemen murid |
| **Modul Bank Soal (PG & Esai)** | **Belum Tersedia** | Dibangun: CRUD soal, filter mapel/kelas/topik, penyimpanan terstruktur |
| **Generate Soal AI (Gemini Structured)** | **Belum Tersedia** | Dibangun: Gemini provider dengan schema JSON & prompt pedagogis |
| **Input Soal Manual** | **Belum Tersedia** | Dibangun: Editor soal PG/Esai + pemicu analisis konteks |
| **Scan / Upload Foto Soal (Multimodal)** | **Belum Tersedia** | Dibangun: Ekstraksi teks soal berbasis Gemini Vision |
| **Contextual AI Engine (Pipeline Inti)** | **Belum Tersedia** | Dibangun: Understanding → Entity Extraction → Context Classification → Retrieval → Mapping → Rewriting → Validation → Teacher Review |
| **Local Context Retrieval Adapter** | **Belum Tersedia** | Dibangun: Interface adapter modular + simulasi Mock untuk Ponorogo/Madiun |
| **Modul Materi Pembelajaran** | **Belum Tersedia** | Dibangun: Tulis/Upload/Generate materi + kontekstualisasi wilayah |
| **Modul Ujian & Ruang Ujian Online** | **Belum Tersedia** | Dibangun: Room ujian, autosave sesi, validasi timer di server |
| **Modul Penilaian & Rekap Nilai** | **Belum Tersedia** | Dibangun: Grading deterministik PG + review esai oleh guru |
| **Sistem Notifikasi Dalam Aplikasi** | **Belum Tersedia** | Dibangun: Event notifikasi guru (murid gabung, ujian selesai, esai masuk) & murid |

---

## 3. Masalah atau Potensi Kendala yang Ditemukan

1. **Dependensi Eksternal pada Demo Hackathon:**
   - Kredensial live Supabase dan Gemini API mungkin tidak selalu tersedia di semua lingkungan juri/pengembang.
   - **Solusi Arsitektur:** Membangun *Repository & Retrieval Adapter Layer* yang beroperasi secara hibrida: menggunakan Supabase & Gemini asli saat API key tersedia, dan otomatis menyediakan fallback simulasi (mock terverifikasi Karesidenan Madiun/Ponorogo) yang kaya data ketika offline.
2. **Kerapuhan AI Generatif Murni:**
   - Penggunaan satu prompt bebas berisiko mengubah angka matematika atau memalsukan kunci jawaban.
   - **Solusi Arsitektur:** Contextual AI Engine menggunakan pemisahan pipeline berlapis (*modular pipeline*) dengan validasi deterministik untuk angka hitungan matematika.

---

## 4. Batas Integrasi dengan Anggota 1 (Data & RAG)

- **Milik Anggota 1:**
  - Direktori `data-pipeline/` (scraping, cleaning, dataset BPS, chunking, pgvector embedding).
  - Skrip pengujian retrieval dan embedding model di Python.
- **Milik Anggota 2:**
  - Seluruh aplikasi web Next.js (`app/`, `components/`, `features/`, `lib/`).
  - Contextual AI Engine dan UI Studio Guru / Murid.
  - Abstraksi `LocalContextRetriever` yang memanggil SQL RPC pgvector dari Anggota 1 saat siap, atau `MockLocalContextRetriever` saat pipeline sedang dikembangkan.
- **Titik Temu Bersama:**
  - `contracts/region-contract.md` (Kode BPS 6 Kab/Kota Karesidenan Madiun).
  - `contracts/retrieval-contract.md` (Schema JSON request/response pencarian hybrid).
  - `supabase/migrations/` (Migrasi tabel database yang additive).

---

## 5. Rencana Implementasi Bertahap (Milestone Roadmap)

1. **Milestone 1:** Audit repositori, fondasi `lib/env.ts`, konektor database & adapter storage (Selesai).
2. **Milestone 2:** Design System, Navigasi Ikon Vertikal Kiri, Submenu Flyout, Top-Right Floating Card, Dashboard Guru & Murid.
3. **Milestone 3:** Multi-School Context, Role Management, Manajemen Kelas, Kode Gabung Murid, Bank Soal & Materi.
4. **Milestone 4:** Contextual AI Engine (Pipeline 9 langkah), Provider Gemini API (Generate, Manual, Scan OCR), Retrieval Adapter & Mock Madiun/Ponorogo, Teacher Review side-by-side.
5. **Milestone 5:** Pembuatan & Kontekstualisasi Materi Pembelajaran, Publikasi ke Kelas.
6. **Milestone 6:** Sistem Ujian Online, Sesi Siswa dengan Autosave, Server-side Deterministic Grading, Umpan Balik Esai.
7. **Milestone 7:** Notifikasi, Dokumentasi Lengkap (`ANGGOTA_2_ARCHITECTURE.md`, `ANGGOTA_1_2_INTEGRATION.md`, `ANGGOTA_2_SETUP_MANUAL.md`, `ANGGOTA_2_TEST_REPORT.md`), Validasi Lint, Test, & Production Build.
