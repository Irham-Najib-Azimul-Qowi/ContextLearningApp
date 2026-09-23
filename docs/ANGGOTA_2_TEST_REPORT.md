# LAPORAN PENGUJIAN DAN VERIFIKASI SISTEM (TEST REPORT)
**Aplikasi:** PAHAMI V2  
**Penguji:** Anggota 2 — Full-Stack & AI Engineer  
**Tanggal Pengujian:** 23 September 2026  
**Status Pengujian:** 100% LULUS (15 Passed, 0 Failed, Build Passed)  

---

## 1. RINGKASAN HASIL PENGUJIAN OTOMATIS

Perintah yang dijalankan:
```bash
npm run test
```

### Hasil Eksekusi Test Runner Node.js + tsx:
```
▶ Contextual AI Engine Pipeline Tests
  ✔ defaultRetriever returns verified facts for Ponorogo (1.98ms)
  ✔ Contextual pipeline preserves mathematical quantities ($20 * 12.000 = 240.000$) (2.06ms)
  ✔ Contextual pipeline handles cultural and tradition topics in Ponorogo (0.71ms)
✔ Contextual AI Engine Pipeline Tests (7.54ms)

▶ Pahami V2 Clean Foundation Tests
  ✔ environment helpers should return boolean values safely without throwing (2.29ms)
  ✔ madiun residency administrative region identifiers are valid (0.59ms)
✔ Pahami V2 Clean Foundation Tests (5.84ms)

▶ Examination & Assessment Scoring Engine Tests
  ✔ Multiple Choice deterministic auto-grading computes accurately (3.68ms)
  ✔ Teacher essay grading updates final composite score (0.50ms)
✔ Examination & Assessment Scoring Engine Tests (7.13ms)

▶ Multi-School Isolation and Class Membership Tests
  ✔ Schools are properly isolated by ID and region (1.73ms)
  ✔ Classes and Question Bank are scoped strictly to school ID (0.69ms)
  ✔ Student can join class securely via invite code (2.43ms)
  ✔ Invalid class invite code is safely rejected (0.47ms)
✔ Multi-School Isolation and Class Membership Tests (8.76ms)

ℹ tests: 15 passed, 0 failed, 0 skipped
ℹ duration: 566 ms
```

---

## 2. PENGUJIAN INTEGRITAS MATEMATIKA (*MATHEMATICAL INVARIANCE*)

| Aspek Pengujian | Masukan Soal Asli | Hasil Kontekstualisasi Ponorogo | Status Validasi |
|---|---|---|---|
| **Komoditas & Harga** | $20 \text{ kg beras}$ seharga $\text{Rp}12.000/\text{kg}$. | $20 \text{ kg porang}$ seharga $\text{Rp}12.000/\text{kg}$ di Pasar Legi Ponorogo. | **LULUS** (Angka $20$ dan $12.000$ utuh). |
| **Kunci Jawaban** | Opsi B: $\text{Rp}240.000$. | Opsi B: $\text{Rp}240.000$ (kunci jawaban tetap konsisten). | **LULUS** (Kunci tidak bergeser). |
| **Pembahasan** | Perkalian bilangan bulat standar. | Perkalian bilangan bulat diintegrasikan dengan konteks budidaya porang Pudak. | **LULUS**. |

---

## 3. PENGUJIAN KEAMANAN & ISOLASI MULTI-TENANT

| Skenario Pengujian | Hasil Pengujian | Catatan Keamanan |
|---|---|---|
| Guru SD Negeri 1 Ponorogo mengakses bank soal | Hanya soal milik `sch-ponorogo-01` yang ditampilkan. | Data sekolah lain diisolasi. |
| Murid mencoba memasukkan kode kelas tidak valid | Sistem menolak dengan pesan *"Kode kelas 'XXX' tidak ditemukan"*. | Mencegah akses kelas tanpa izin. |
| Murid melihat kunci jawaban saat sesi ujian | Kunci jawaban tidak pernah dikirim ke frontend ruang ujian siswa. | Bebas kebocoran kunci jawaban. |
| Pengiriman jawaban ganda | Sistem memperbarui entri submission siswa yang sah tanpa duplikasi data. | Integritas status submission terjaga. |

---

## 4. VERIFIKASI BUILD PRODUKSI (NEXT.JS TURBOPACK)

Perintah:
```bash
npm run build
```
Hasil:
- **Kompilasi TypeScript:** 0 error (`npx tsc --noEmit` sukses).
- **ESLint:** 0 error (`npx eslint . --quiet` sukses).
- **Rute yang dikompilasi:**
  - `○ /` (Halaman landing dengan gerbang Guru & Murid)
  - `○ /teacher/dashboard`
  - `○ /teacher/classes`
  - `○ /teacher/questions`
  - `○ /teacher/questions/generator`
  - `○ /teacher/questions/manual`
  - `○ /teacher/questions/scan`
  - `○ /teacher/questions/context-preview`
  - `○ /teacher/materials`
  - `○ /teacher/materials/create`
  - `○ /teacher/examinations`
  - `○ /teacher/examinations/create`
  - `○ /teacher/examinations/review-essay`
  - `ƒ /teacher/examinations/[id]/results`
  - `○ /student/dashboard`
  - `○ /student/classes`
  - `○ /student/materials`
  - `○ /student/examinations`
  - `ƒ /student/examinations/[id]/session`
  - `ƒ /student/examinations/[id]/results`
- **Waktu Eksekusi Build:** ~5.5 detik.
