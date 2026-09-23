# Pahami V2 — Development Handoff & Implementation Readiness

Dokumen serah terima teknis (*technical handoff*) ini menandai selesainya fase persiapan repositori (*repository preparation phase*) dan merinci panduan transisi menuju fase implementasi fitur prototipe **Pahami V2**.

> [!IMPORTANT]
> **Status Implementasi:**  
> Implementasi fitur Pahami V2 **BELUM DIMULAI**.  
> Repositori saat ini telah ditata, dibersihkan, dicadangkan, dan dilengkapi kontrak integrasi awal. Kode aplikasi eksisting di root dipertahankan utuh untuk mencegah regresi fungsional.

---

## 1. Pembagian Tanggung Jawab Tim

### Member 1: Data & RAG Engineer
- **Cabang Git:** `feature/local-knowledge-rag`
- **Area Kerja:** Direktori `data-pipeline/`, migrasi pgvector di `supabase/migrations/`.
- **Tanggung Jawab Utama:**
  1. Mengumpulkan dataset konteks lokal untuk 6 wilayah Karesidenan Madiun.
  2. Membangun script normalisasi data sesuai `contracts/context-entity-contract.md`.
  3. Memilih dan mengonfigurasi model embedding teks lokal (misal: multilingual embedding yang ringan dan akurat).
  4. Merancang tabel PostgreSQL dengan ekstensi `vector` di Supabase.
  5. Membuat stored procedure / SQL RPC `match_context_entities` untuk pencarian hybrid.

### Member 2: Full-Stack & AI Engineer
- **Cabang Git:** `feature/pahami-core-web`
- **Area Kerja:** Root web application (`app/`, `components/`, `lib/context-engine/`, `lib/ai/`).
- **Tanggung Jawab Utama:**
  1. Menjaga dan menyempurnakan UI/UX guru dan siswa Next.js.
  2. Menghubungkan client server Supabase ke stored procedure retrieval Member 1.
  3. Mengembangkan Contextualization Engine untuk memetakan variabel kontekstual ke entitas lokal Madiun Raya.
  4. Mengintegrasikan Google Gemini API (model `gemini-2.5-flash` atau varian multimodal) untuk pembentukan soal berkonteks lokal.
  5. Menyelenggarakan fitur cetak ujian (PDF/Print) dan simulasi ujian siswa.

---

## 2. Wilayah Fokus Awal (Karesidenan Madiun)
Pahami V2 berfokus pada 6 wilayah administratif berikut:
1. `35.77` — Kota Madiun
2. `35.19` — Kabupaten Madiun
3. `35.21` — Kabupaten Ngawi
4. `35.20` — Kabupaten Magetan
5. `35.02` — Kabupaten Ponorogo
6. `35.01` — Kabupaten Pacitan

---

## 3. Tanggung Jawab Bersama Proyek Supabase
- **Proyek Supabase yang Sama:** Kedua pengembang menggunakan satu instance Supabase staging/development bersama agar skema relasional dan vektor saling terintegrasi.
- **Koordinasi Migrasi:**
  - File migrasi baru disimpan di `supabase/migrations/` dengan awalan timestamp atau nomor urut unik.
  - Skema database di Supabase live **tidak diubah** selama fase repositori preparation ini.
  - Setiap migrasi baru wajib diuji secara lokal atau pada cabang fitur sebelum diajukan dalam PR.

---

## 4. Rencana Tonggak Capaian (*Integration Milestones*)

```
[Milestone 1]
- Member 1: Review contracts, siapkan skrip ingest & sampel data 6 kab/kota Madiun.
- Member 2: Siapkan antarmuka selektor wilayah Madiun Raya di dashboard guru.

[Milestone 2]
- Member 1: Tulis migrasi SQL pgvector & RPC search di supabase/migrations/.
- Member 2: Hubungkan Next.js server route ke RPC Supabase dengan mock fallback.

[Milestone 3]
- Uji integrasi end-to-end: Pembuatan soal berkonteks lokal Madiun menggunakan Gemini AI + pgvector.

[Milestone 4]
- Pull Request gabungan ke `main` setelah review dan testing lengkap.
```

---

## 5. Keputusan Terbuka yang Memerlukan Kesepakatan Tim (*Outstanding Decisions*)
Sebelum menulis kode implementasi, kedua anggota tim disarankan menyepakati:
1. **Pilihan Model Embedding:** Apakah menggunakan API eksternal (misal: Gemini text-embedding-004) atau model lokal (HuggingFace/sentence-transformers) pada pipeline Python.
2. **Kapasitas Dimensi Vektor:** Mengunci dimensi kolom pgvector (contoh: 768 dimensi untuk Gemini embedding atau 384 dimensi untuk all-MiniLM-L6-v2).
3. **Threshold Relevansi Retrieval:** Nilai ambang batas minimum kemiripan kosinus (*cosine similarity score*) untuk meloloskan kandidat entitas lokal ke prompt LLM.

---

## 6. Tindakan Pengembang Sebelum Memulai Koding (*Required Actions*)
1. Pastikan kedua pengembang telah diundang sebagai kolaborator di GitHub repositori.
2. Setup environment lokal masing-masing dengan menduplikasi `.env.example` ke `.env.local` dan mengisi kredensial Supabase & Gemini API pribadi.
3. Jalankan `git fetch origin` lalu beralih ke cabang fitur masing-masing (`feature/local-knowledge-rag` atau `feature/pahami-core-web`).
