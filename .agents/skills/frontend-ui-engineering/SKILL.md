---
name: frontend-ui-engineering
description: >-
  Use this skill when designing, building, critiquing, or modifying user interfaces, components,
  layouts, forms, or animations in Depaskan to ensure accessible, distinctive, responsive,
  high-performance, and production-ready UX.
---

# Frontend UI Engineering Skill

Panduan rekayasa antarmuka pengguna (UI/UX) untuk Depaskan, menggabungkan standar dari **Addy Osmani's Frontend UI Engineering**, **Better Web UI** (*aladicf*), dan **PyModel React Frontend Skills**.

## 1. Identitas Visual Depaskan (Educational EdTech Identity)

- **Bukan Dashboard AI Generik**: Hindari tampilan klise bertema serba ungu gelap (dark purple gradients) atau komponen SaaS template yang seragam.
- **Karakter Desain**:
  - Hangat, ramah anak, dan profesional untuk institusi pendidikan dasar (SD).
  - Warna kontras tinggi yang jelas dan mudah dibaca oleh guru dan siswa di berbagai perangkat.
  - Tipografi hierarkis yang tegas: Judul jelas, teks materi nyaman dibaca dalam paragraf panjang, dan angka matematika ditampilkan presisi dengan KaTeX.

## 2. Standar Aksesibilitas (WCAG 2.1 AA)

1. **HTML Semantik**:
   - Gunakan elemen asli HTML5: `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, `<footer>`.
   - Gunakan `<button>` untuk aksi interaktif, bukan `<div onClick=...>` atau `<a>` tanpa `href`.
2. **Navigasi Keyboard & Indikator Fokus**:
   - Seluruh elemen interaktif harus dapat diakses melalui tombol `Tab` dan diaktifkan dengan `Enter` / `Space`.
   - Sediakan indikator fokus visual yang kentara (`focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-hidden`).
3. **Form & Label Asosiatif**:
   - Setiap `<input>`, `<select>`, `<textarea>` wajib memiliki `<label>` yang terhubung via atribut `htmlFor` / `id` atau pembungkus eksplisit.
   - Sediakan pesan error yang terhubung dengan `aria-describedby` atau `aria-errormessage`.
4. **Preferensi Pengurangan Gerak (Reduced Motion)**:
   - Hormati pengaturan pengguna: `motion-reduce:transition-none motion-reduce:transform-none`.
   - Hindari animasi berulang yang mengganggu konsentrasi belajar siswa.

## 3. Cakupan Lima Status Komponen (Five Essential States)

Setiap komponen halaman atau data-fetching view wajib mengimplementasikan 5 status secara eksplisit:
1. **Ideal / Populated State**: Menampilkan data kontekstual secara rapi, berjarak konsisten, dan mudah dipindai.
2. **Empty State**: Ketika data belum ada (misal materi atau soal baru), tampilkan pesan ramah dan panduan aksi awal (Call-to-Action).
3. **Loading / Skeleton State**: Tampilkan skeleton loader yang mempertahankan layout shift (CLS rendah), bukan spinner kosong yang memblokir layar.
4. **Error State**: Tampilkan pesan error yang ramah pengguna dalam bahasa Indonesia, jelaskan apa yang terjadi, dan sediakan tombol coba lagi (Retry).
5. **Partial / Offline State**: Sediakan indikator jelas jika aplikasi sedang bekerja menggunakan data lokal cache/browser karena koneksi internet putus.

## 4. Pola React 19 & Next.js 16 (App Router)

- **Server Components Pertama**: Jadikan komponen sebagai Server Component secara default. Tambahkan `'use client'` hanya jika komponen membutuhkan state lokal (`useState`), efek samping browser (`useEffect`), interaksi event langsung, atau Web API.
- **Komponen Render Murni**: Jangan panggil `Date.now()`, `Math.random()`, atau mutasi variabel eksternal di dalam siklus render komponen React 19 (menyebabkan mismatch hidrasi dan pelanggaran aturan rendering murni React 19).
- **Optimasi Gambar**: Gunakan komponen `<Image />` dari `next/image` dengan atribut `width`, `height`, dan `alt` deskriptif untuk aset media lokal atau ilustrasi budaya LKB. Hindari tag `<img>` mentah.
- **Tailwind CSS v4 Utility**: Gunakan token warna dan spacing konsisten; hindari nilai arbitrary seperti `p-[17px]` kecuali untuk visualisasi khusus.
