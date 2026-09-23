# PANDUAN SETUP & PENGOPERASIAN PAHAMI V2
**Modul:** Aplikasi Web, Contextual AI Engine & Evaluasi  
**Penyusun:** Anggota 2 (Full-Stack & AI Engineer)  

---

## 1. PRASYARAT LINGKUNGAN (PREREQUISITES)

- **Node.js:** Versi 20.x atau lebih baru (Rekomendasi: Node.js 22 LTS).
- **Package Manager:** `npm` (atau `pnpm` / `yarn`).
- **Git:** Versi 2.40+.
- **Peramban Web:** Google Chrome, Microsoft Edge, atau Mozilla Firefox versi terbaru.

---

## 2. VARIABEL LINGKUNGAN (ENVIRONMENT VARIABLES)

Buat file `.env.local` pada akar proyek (disalin dari template berikut). Semua kunci rahasia dapat menggunakan nilai simulasi untuk evaluasi lokal:

```env
# --- SUPABASE CONFIGURATION (Opsional untuk evaluasi lokal) ---
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# --- GOOGLE GEMINI API (Opsional untuk evaluasi lokal) ---
GEMINI_API_KEY=your_gemini_api_key_here
```

> **Catatan Ketahanan:**  
> Aplikasi PAHAMI V2 dilengkapi dengan *Offline Intelligent Fallbacks*. Jika `GEMINI_API_KEY` atau Supabase tidak diisi, sistem tetap berjalan 100% menggunakan engine simulasi konteks lokal terverifikasi di Ponorogo dan repository lokal.

---

## 3. LANGKAH INSTALASI DAN MENJALANKAN SECARA LOKAL

### Langkah 1: Kloning & Pindah ke Branch Pengembangan
```bash
git checkout feature/pahami-core-web
```

### Langkah 2: Instalasi Dependensi
```bash
npm install
```

### Langkah 3: Menjalankan Server Pengembangan (Dev Server)
```bash
npm run dev
```
Buka peramban pada alamat: [http://localhost:3000](http://localhost:3000)

### Langkah 4: Menjalankan Pengujian Otomatis (Automated Tests)
```bash
npm run test
```
*Memverifikasi 15 unit test untuk Context Engine, kalkulasi matematika, auto-grading, dan isolasi multi-sekolah.*

### Langkah 5: Memeriksa Kompilasi Produksi (Production Build)
```bash
npm run build
```

---

## 4. PANDUAN DEMO HACKATHON LANGKAH-DEMI-LANGKAH

Untuk mendemonstrasikan inovasi pembelajaran kontekstual berbasis kearifan lokal Ponorogo kepada juri:

1. **Buka Beranda:** Kunjungi `http://localhost:3000` dan klik kartu **"Portal Workspace Guru"**.
2. **Periksa Sekolah Aktif:** Di pojok kanan atas, pastikan sekolah aktif adalah **"SD Negeri 1 Ponorogo"** (Wilayah: Kabupaten Ponorogo, Kode `35.02`).
3. **Buka Studio Bank Soal:** Klik menu **"Bank Soal & AI"** pada rel navigasi kiri, lalu pilih **"Katalog Bank Soal"** atau **"Input Soal Manual"**.
4. **Analisis Konteks Lokal:**
   - Masukkan soal Matematika kelas 5:  
     *"Seorang pedagang membeli 20 kg beras dengan harga Rp12.000 per kilogram. Berapa total uang yang harus dibayarkan?"*
   - Klik tombol **"Analisis Konteks Lokal"**.
5. **Halaman Pratinjau Kontekstual (Innovation Highlight):**
   - Perhatikan bagaimana variabel `beras` dipetakan ke `porang` (komoditas ekspor unggulan Ponorogo di lereng pegunungan).
   - Perhatikan bahwa konstanta hitungan $20 \text{ kg} \times \text{Rp}12.000 = \text{Rp}240.000$ dipertahankan secara deterministik.
   - Guru dapat memilih komoditas alternatif (misal: *Susu Sapi Perah Pudak*).
   - Klik **"Setujui & Simpan ke Bank Soal"**.
6. **Pembuatan Room Ujian:**
   - Buka menu **"Evaluasi & Hasil"** -> **"Daftar Ujian"** -> **"Buat Room Ujian"**.
   - Pilih kelas **"Kelas 5A"**, centang soal kontekstual yang baru dibuat, lalu klik **"Simpan & Rilis Sesi Ujian"**.
7. **Simulasi Pengerjaan oleh Murid:**
   - Klik avatar profil di kanan atas, pilih **"Beralih ke Portal Siswa (Demo)"**.
   - Buka menu **"Ujian Siswa"**, pilih ujian aktif, dan klik **"Mulai Mengerjakan"**.
   - Jawab soal pilihan ganda dan ketikkan uraian tentang tradisi lokal Ponorogo.
   - Klik **"Kumpulkan Ujian"**.
8. **Penilaian & Pembahasan:**
   - Sistem langsung melakukan *deterministic auto-grading* untuk pilihan ganda.
   - Masuk kembali ke Guru untuk memeriksa soal esai via menu **"Pemeriksaan Esai"** (tersedia rekomendasi AI).
   - Siswa dapat melihat nilai akhir dan pembahasan yang menjelaskan alasan penggunaan konteks kearifan lokal daerahnya.
