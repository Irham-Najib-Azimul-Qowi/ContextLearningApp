# Pahami V2 — AI-Powered Contextual Learning Platform

> **Platform Pembelajaran Kontekstual Berbasis AI & Karakteristik Wilayah Lokal untuk Sekolah Dasar (SD)**  
> *Fokus Prototipe: Wilayah Karesidenan Madiun (Kota Madiun, Kab. Madiun, Kab. Ngawi, Kab. Magetan, Kab. Ponorogo, Kab. Pacitan)*

---

## 1. Tentang Pahami V2
**Pahami** membantu guru membuat dan menyesuaikan materi serta soal pembelajaran dengan konteks lokal wilayah Keresidenan Madiun. Sistem ini mentransformasi soal teks standar kurikulum nasional menjadi soal yang dekat dengan kehidupan sehari-hari siswa (bentang alam, komoditas, kebudayaan, sejarah, dan profesi lokal) dengan tetap menjaga integritas matematika dan capaian pedagogis.

### Status Repositori: Fondasi Bersih (Clean Baseline)
- Repositori ini telah melalui proses pembersihan modul LMS lama (guru, murid, admin, multi-tenant) untuk memfokuskan pengembangan pada **rekayasa kontekstualisasi materi dan soal**.
- Proyek lama terdokumentasi dan tersimpan secara utuh di branch: [`backup/pre-context-engine-refactor`](./docs/LEGACY_BACKUP.md).
- Status fitur baru: **Direncanakan (Planned)** — Implementasi fitur baru akan dikerjakan pada feature branch masing-masing anggota tim.

---

## 2. Struktur Repositori Bersama

```
ContextLearningApp/
├── app/                  # Next.js App Router (Halaman Bersih Pahami V2)
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/           # Komponen UI bersama (Member 2)
├── features/             # Modul fitur Context Engine & Studio (Member 2)
├── lib/                  # Utilitas bersama (lib/env.ts)
├── public/               # Aset statis & logo Pahami
│
├── data-pipeline/        # Ruang kerja Member 1 (Data & RAG Engineer)
│   ├── README.md
│   ├── config/           # Konfigurasi pipeline & konektor database
│   ├── datasets/         # raw/, processed/, validated/, samples/
│   ├── ingestion/        # Skrip pengumpul data lokal
│   ├── processing/       # Pembersihan, normalisasi & chunking
│   ├── embeddings/       # Ekstraksi vektor embedding
│   ├── retrieval/        # Pengujian & evaluasi pencarian hybrid
│   ├── scripts/          # CLI helper scripts
│   └── tests/            # Pengujian modul Python
│
├── contracts/            # Kontrak integrasi bersama (DRAFT)
│   ├── README.md
│   ├── region-contract.md
│   ├── context-entity-contract.md
│   └── retrieval-contract.md
│
├── docs/                 # Dokumentasi arsitektur & tim
│   ├── LEGACY_BACKUP.md
│   ├── REPOSITORY_ARCHITECTURE.md
│   ├── TEAM_WORKFLOW.md
│   └── DEVELOPMENT_HANDOFF.md
│
├── supabase/
│   └── migrations/       # Migrasi database Pahami V2 (Additive)
│
├── .env.example          # Template variabel lingkungan
├── .gitignore            # Proteksi secret, virtualenv & dataset
├── package.json
└── README.md
```

---

## 3. Pembagian Tugas & Kolaborasi Dua Anggota

| Anggota Tim | Peran | Branch Git | Area Kerja & Tanggung Jawab |
| :--- | :--- | :--- | :--- |
| **Member 1** | Data & RAG Engineer | `feature/local-knowledge-rag` | Pengumpulan dataset lokal Karesidenan Madiun, normalisasi data entitas, chunking teks, embedding multibahasa, penyimpanan PostgreSQL + pgvector, dan fungsi SQL hybrid retrieval. |
| **Member 2** | Full-Stack & AI Engineer | `feature/pahami-core-web` | Antarmuka Next.js Studio pembuatan materi & soal, integrasi Google Gemini API, ekstraksi variabel konteks, Contextualization Engine, dan ekspor/cetak soal. |

Keduanya berkoordinasi melalui folder `contracts/`, `docs/`, dan `supabase/migrations/`.

---

## 4. Cakupan Wilayah Awal (Karesidenan Madiun)

1. `35.77` — **Kota Madiun** (Pusat industri kereta api PT INKA, kuliner pecel, kearifan lokal)
2. `35.19` — **Kabupaten Madiun** (Komoditas pertanian, tanaman porang, sentra Caruban)
3. `35.21` — **Kabupaten Ngawi** (Bentang alam Sungai Bengawan Solo/Madiun, situs purbakala Trinil, kayu jati)
4. `35.20` — **Kabupaten Magetan** (Kaki Gunung Lawu, Telaga Sarangan, sentra kerajinan kulit)
5. `35.02` — **Kabupaten Ponorogo** (Seni budaya Reog, kearifan lokal, tradisi budaya)
6. `35.01` — **Kabupaten Pacitan** (Bentang alam pesisir selatan, gua karst, geodiversitas)

---

## 5. Menjalankan Aplikasi Fondasi Minimal

### A. Prasyarat
- Node.js versi 20 atau lebih baru
- npm / pnpm

### B. Langkah Instalasi & Menjalankan Lokal
```bash
# 1. Kloning repositori
git clone https://github.com/Irham-Najib-Azimul-Qowi/ContextLearningApp.git
cd ContextLearningApp

# 2. Beralih ke cabang fitur Anda
git checkout feature/pahami-core-web
# atau
git checkout feature/local-knowledge-rag

# 3. Instal dependensi
npm install

# 4. Buat file .env.local (opsional untuk fondasi minimal)
cp .env.example .env.local

# 5. Jalankan server pengembangan
npm run dev
```
Buka browser pada alamat `http://localhost:3000`. Halaman beranda Pahami V2 dapat diakses tanpa login, tanpa database, dan tanpa API key.

### C. Menjalankan Pengujian & Build
```bash
# Pemeriksaan tipe TypeScript
npx tsc --noEmit

# Linting ESLint
npm run lint

# Menjalankan unit test fondasi
npm run test

# Membangun bundle produksi
npm run build
```

---

## 6. Tautan Dokumen Pendukung
- 📋 [Panduan Pencadangan Kode Lama](./docs/LEGACY_BACKUP.md)
- 🏗️ [Arsitektur Repositori & Boundary Modul](./docs/REPOSITORY_ARCHITECTURE.md)
- 🤝 [Alur Kerja Git & Aturan Kolaborasi Tim](./docs/TEAM_WORKFLOW.md)
- 🚀 [Panduan Kesiapan Serah Terima (Handoff)](./docs/DEVELOPMENT_HANDOFF.md)
- 📑 [Kontrak Wilayah Administratif](./contracts/region-contract.md)
- 📑 [Kontrak Entitas Pengetahuan Lokal](./contracts/context-entity-contract.md)
- 📑 [Kontrak Antarmuka Retrieval Hybrid](./contracts/retrieval-contract.md)
