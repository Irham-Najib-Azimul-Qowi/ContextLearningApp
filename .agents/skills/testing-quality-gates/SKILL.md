---
name: testing-quality-gates
description: >-
  Use this skill to design, implement, and run automated tests, conduct systematic debugging,
  perform thorough code reviews, and enforce quality gates (typecheck, lint, regression, build)
  prior to merging or proposing code changes.
---

# Testing & Quality Gates Skill

Panduan pengujian otomatis, analisis regresi, dan penegakan gerbang kualitas (*quality gates*) untuk Depaskan, diadaptasi dari **Addy Osmani's Code Review & TDD Skills** dan praktik terbaik modern TypeScript/Next.js.

## 1. Fondasi Pengujian Terverifikasi

- **Runner Pengujian**: Menggunakan runner bawaan Node.js dengan runner TypeScript:
  ```bash
  npm test
  # Menjalankan: tsx --test tests/*.test.ts
  ```
- **Kondisi Awal (Baseline)**: 97 pengujian unit/integrasi di 14 suites saat ini lulus 100% (0 gagal).
- **Aturan Non-Destruktif**:
  - DILARANG melemahkan (*weaken*), menghapus (*delete*), atau men-skip pengujian yang sudah ada hanya agar suite terlihat hijau.
  - Setiap perubahan logika bisnis atau struktur data WAJIB mempertahankan kelulusan seluruh 97 pengujian yang sudah ada.

## 2. Standar Penulisan Tes (Behavioral Assertions)

1. **Uji Perilaku Nyata, Bukan Mock Trivial**:
   - Pengujian harus memverifikasi invarian bisnis konkret, seperti:
     - Preservasi nilai kuantitas matematika pada adaptasi soal (`$20 * 12.000 = 240.000$`).
     - Perlindungan tombstone: item terhapus tidak boleh dibangkitkan kembali oleh sinkronisasi cloud.
     - Isolasi regional LKB: entitas Ponorogo tidak boleh muncul pada pencarian Kota Madiun.
     - Isolasi multi-sekolah: sekolah A tidak boleh dapat mengakses room milik sekolah B.
2. **Uji Batas & Kasus Negatif (Boundary & Negative Tests)**:
   - Uji input kosong, karakter tidak valid, format file corrupt, dan kesalahan timeout jaringan.
   - Uji kode invite kelas yang salah atau kedaluwarsa.
3. **Reproduksi Sebelum Perbaikan (Bug Reproduction)**:
   - Jika menemukan bug, tulis tes yang mendemonstrasikan kegagalan (*failing test*) terlebih dahulu sebelum menulis kode perbaikan. Pastikan tes berubah menjadi hijau setelah perbaikan diterapkan.

## 3. Matriks Gerbang Kualitas (Quality Gates Matrix)

Sebelum menyetujui perubahan kode atau fitur baru, jalankan gerbang kualitas bertingkat:

| Gerbang | Perintah | Ambang Kelulusan (Pass Criteria) | Kapan Diwajibkan |
| :--- | :--- | :--- | :--- |
| **Gate 1: Tipe Data** | `npx tsc --noEmit` | 0 error TypeScript | Setiap perubahan file `.ts` atau `.tsx` |
| **Gate 2: Linter** | `npm run lint` | 0 error ESLint | Setiap modifikasi kode sumber |
| **Gate 3: Regresi** | `npm test` | 97/97 lulus (100% pass) | Setiap perubahan logika, API, utilitas, atau UI |
| **Gate 4: Build Produksi**| `npm run build` | Bundle sukses tanpa error Turbopack | Sebelum rilis, deployment, atau perubahan konfigurasi Next.js |
| **Gate 5: Keamanan** | Manual / Script review | Zero exposed secrets, no unmasked API keys | Perubahan pada auth, API sync, atau AI provider |
| **Gate 6: Aksesibilitas**| Inspeksi semantik | WCAG 2.1 AA, keyboard accessible, focus rings | Setiap pembuatan atau modifikasi komponen UI |

## 4. Protokol Code Review

Saat mengevaluasi kode:
- **Kebenaran (Correctness)**: Apakah kode benar-benar menyelesaikan masalah tanpa efek samping?
- **Keamanan (Security)**: Apakah input divalidasi? Apakah otentikasi/otorisasi diperiksa di server?
- **Keterbacaan (Maintainability)**: Apakah fungsi ringkas dan mengikuti arsitektur yang sudah ada?
- **Resiko Regresi**: Apakah ada kode yang bergantung pada perilaku lama yang diubah?
