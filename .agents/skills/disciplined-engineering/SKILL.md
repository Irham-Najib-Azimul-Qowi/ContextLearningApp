---
name: disciplined-engineering
description: >-
  Use this skill to enforce minimal, disciplined software engineering practices, adhere to YAGNI,
  avoid over-engineering, trace data flow before editing, inspect existing patterns, and provide
  honest, transparent reporting of skipped checks and residual risks.
---

# Disciplined Engineering Skill

Panduan disiplin rekayasa minimalis yang diadaptasi dari filosofi **Ponytail** (*Dietrich Gebert*) dan **Source/Doubt-Driven Development** (*Addy Osmani*).

> *"The best code is the code you never wrote."* — Filosofi Senior Engineer Minimalis.

## 1. Prinsip Utama (Core Tenets)

1. **Periksa Sebelum Mengubah (Inspect Before Editing)**:
   - Dilarang membuat asumsi tentang struktur file, tipe data, atau API.
   - Buka dan baca implementasi aktif sebelum mengajukan solusi atau diff.
   - Gunakan grep atau file viewer untuk memastikan tidak ada fungsi duplikat yang sudah ada di repositori.
2. **YAGNI (You Aren't Gonna Need It)**:
   - Jangan membangun abstraksi spekulatif, generic wrapper yang hanya dipakai sekali, atau konfigurasi kompleks untuk kebutuhan masa depan yang belum nyata.
   - Pilih solusi paling sederhana yang menyelesaikan masalah secara benar dan aman.
3. **Telusuri Aliran Data (Trace Data Flow)**:
   - Sebelum menyentuh kode, petakan alur data secara lengkap:
     `Input Pengguna / Event` ➔ `Handler / Hook` ➔ `State / Store` ➔ `API / Repository` ➔ `Database / Storage`.
   - Pastikan setiap titik batas divalidasi dan aman dari efek samping (*side effects*).
4. **Perubahan Bedah & Minimalis (Surgical Diffs)**:
   - Buat perubahan sekecil mungkin yang dapat direviu dengan mudah.
   - Jangan memformat ulang seluruh file atau memodifikasi baris kode yang tidak berhubungan dengan tugas saat ini.
   - Pertahankan komentar dan lisensi yang sudah ada.

## 2. Praktik Skeptisisme Rekayasa (Doubt-Driven Engineering)

- **Verifikasi Versi Pustaka**: Jangan mengimpor API baru dari dokumentasi daring terbaru jika versi di `package.json` belum mendukungnya (misal: fitur Next.js eksperimental atau React canary).
- **Pertanyakan Kebutuhan Dependensi**: Jika sebuah fungsi dapat diselesaikan dengan 10–20 baris kode murni TypeScript tanpa dependensi eksternal, jangan pasang paket npm baru.
- **Validasi Nilai Ekstrem (Edge Cases)**: Selalu uji string kosong, null, undefined, array kosong, dan beban data besar.

## 3. Format Pelaporan Wajib (Mandatory Honest Reporting)

Di akhir setiap sesi rekayasa atau respons yang memodifikasi kode, agen WAJIB menyertakan ringkasan transparansi:

```markdown
### 📋 Ringkasan Transparansi Rekayasa
1. **Hal yang telah diverifikasi secara aktual**: (sebutkan tes, build, lint, atau inspeksi nyata yang dijalankan)
2. **Hal yang sengaja dilewati**: (sebutkan pengujian atau audit yang tidak dijalankan beserta alasannya)
3. **Fakta terverifikasi vs Asumsi**: (pisahkan fakta dari spekulasi)
4. **Risiko yang tersisa**: (sebutkan potensi regresi, batasan jaringan, atau dependensi tertunda)
```
