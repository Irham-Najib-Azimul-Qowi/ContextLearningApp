---
name: depaskan-engineering
description: >-
  Use this skill for any engineering work on Depaskan, including modifying core architecture,
  contextualization pipelines, Kurikulum Merdeka elementary school materials, question bank,
  room lifecycle, Local Knowledge Base (LKB), or dual-storage synchronization.
---

# Depaskan Engineering Skill

Panduan operasional dan standar arsitektur khusus untuk platform pembelajaran kontekstual **Depaskan** (SD Kelas 1–6).

## 1. Identitas & Arsitektur Terverifikasi

- **Nama Proyek**: Depaskan (sebelumnya Pahami)
- **Tujuan**: Platform adaptasi materi dan soal ajar berbasis konteks lokalitas Indonesia untuk jenjang Sekolah Dasar (SD).
- **Target Deployment**: Vercel (Edge / Serverless).
- **Frontend Stack**: Next.js 16.3.5 (App Router, Turbopack), React 19.2.8, Tailwind CSS v4, Lucide Icons, KaTeX (render rumus matematika).
- **Penyimpanan Ganda (Dual-Storage Architecture)**:
  - **In-Browser Local Repository** (`lib/db/repository.ts`): Memastikan guru dan siswa tetap dapat mengakses dan mengerjakan modul secara offline/lokal di ruang kelas.
  - **Cloud Synchronization** (`app/api/sync/user-data/route.ts`): Sinkronisasi dua arah ke PostgreSQL Supabase menggunakan sistem **tombstone** untuk mencegah *resurrection* data terhapus.
- **AI Integration**:
  - `AIProviderManager` (`lib/ai/ai-provider-manager.ts`): Mengelola multi-slot Gemini API key pool (5 slots), circuit breaker, dan failover otomatis.
  - Zero Python di runtime Vercel; pemrosesan data offline ada di `data-pipeline/`.

## 2. Batasan Pedagogis & Domain Pendidikan (Kurikulum Merdeka SD)

1. **Kesesuaian Jenjang (Grade Appropriateness)**:
   - **Fase A (Kelas 1–2 SD)**: Kosakata konkret, kalimat pendek (6–10 kata), operasi bilangan cacah sederhana sampai 100, contoh benda di lingkungan rumah dan sekolah.
   - **Fase B (Kelas 3–4 SD)**: Konsep perkalian, pembagian, pecahan dasar, pengukuran lingkungan, konteks geografis kecamatan/kabupaten.
   - **Fase C (Kelas 5–6 SD)**: Rasio, persentase, KPK/FPB, analisis teks informasional dan budaya lokal Madiun Raya.
2. **Preservasi Invarian Matematika**:
   - Dilarang keras mengubah angka kuantitas, rasio matematika, atau kunci jawaban saat melakukan adaptasi konteks.
   - Contoh terverifikasi pada tes: `$20 * 12.000 = 240.000$` harus tetap mempertahankan nilai total Rp240.000 meskipun latar diubah ke pasar tradisional lokal.
3. **Pembersihan Judul & Header Dokumen (Anti-Pollution)**:
   - Parser dokumen (`lib/context-engine/document-parser.ts`) wajib membersihkan preamble seperti "A. Pilihan Ganda", "PENILAIAN AKHIR SEMESTER", dsb., agar tidak tercemar masuk ke teks pertanyaan.
4. **Imutabilitas Ruang Kelas (Room Snapshot)**:
   - Saat room dibuat, materi dan soal di-snapshot secara imutabel. Perubahan pada bank materi guru tidak boleh merusak riwayat ujian siswa yang sedang aktif atau telah selesai.
5. **Hak Pengawasan Guru (Teacher Oversight)**:
   - Hasil generasi AI berstatus draf sampai guru mengonfirmasi/menyetujui.

## 3. Batasan Deterministik vs Probabilistik

1. **LKB-First (Local Knowledge Base)**:
   - Gunakan fakta terverifikasi dari repositori lokal (`lib/context-engine/retrieval-adapter.ts` dan `data-pipeline/storage/regional/madiun_residency.json`).
   - Prioritaskan Kota Madiun, Kab. Madiun, Ponorogo, Magetan, Ngawi, Pacitan, dan Semarang.
   - Isolasi regional ketat: Pencarian entitas di Kota Madiun tidak boleh membocorkan entitas Ponorogo (zero region leakage).
2. **Generasi AI Hanya Sebagai Pelengkap**:
   - Gemini hanya digunakan jika aturan deterministik / pencarian lokal membutuhkan sintesis linguistik.
   - Output model dianggap data tidak terpercaya (*untrusted input*) dan wajib divalidasi dengan skema Zod sebelum disimpan.

## 4. Alur Kerja Rekayasa (Workflow Checklist)

Sebelum membuat perubahan kode:
1. Periksa file terkait dan pastikan memahami data flow dari UI -> Repository -> Sync -> Database.
2. Jangan menambahkan pustaka/dependensi baru tanpa izin dan justifikasi kuat.
3. Jalankan suite pengujian: `npm test` (seluruh 97 tes wajib lulus).
4. Jalankan linter: `npm run lint` (0 error).
5. Laporkan secara jujur: apa yang dicek, apa yang dilewati, dan risiko yang tersisa.
