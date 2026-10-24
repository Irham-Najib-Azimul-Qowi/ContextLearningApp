---
name: ai-evaluation-provenance
description: >-
  Use this skill when modifying, evaluating, or testing AI workflows, LLM prompt templates,
  Gemini integration, retrieval grounding, fallback pipelines, or deterministic-vs-probabilistic boundaries.
---

# AI Evaluation & Provenance Skill

Panduan keandalan rekayasa kecerdasan buatan (*AI Engineering*), evaluasi sintesis, dan pencatatan asal-usul data (*provenance*) untuk Depaskan.

## 1. Batas Deterministik vs Probabilistik

Prinsip dasar rekayasa AI Depaskan:
> **Proses Deterministik SELALU Lebih Diutamakan Dibandingkan Generasi Probabilistik.**

1. **Aturan Deterministik**:
   - Pembersihan teks, parsing format dokumen, validasi skema Zod, preservasi kuantitas matematika, pemetaan relasi ID/kode, dan pencarian fakta lokalitas LKB harus diproses secara deterministik tanpa campur tangan model bahasa.
2. **Generasi Probabilistik**:
   - Model Gemini hanya digunakan untuk tugas sintesis bahasa alami tingkat lanjut (misal: menyusun narasi cerita kontekstual atau memparafrase teks materi).
   - Respon LLM harus diperlakukan sebagai **Input Tak Terpercaya (Untrusted Input)**:
     - Wajib divalidasi dengan parser skema JSON/Zod yang ketat.
     - Respons yang secara sintaksis valid (valid JSON) **BUKAN BUKTI** kebenaran pedagogis atau matematis.

## 2. Preservasi Invarian Matematika & Kunci Jawaban

- **Invarian Angka**:
  - Jika soal asli berisi angka $12.000$ dan jumlah $20$, hasil adaptasi tidak boleh mengubahnya menjadi angka acak yang merusak rasio perhitungan awal tanpa alasan valid.
- **Validasi Kunci Jawaban**:
  - Pada soal pilihan ganda, kunci jawaban hasil kontekstualisasi harus diverifikasi ulang secara matematis/faktual.
  - Opsi jawaban pengecoh (*distractors*) harus tetap masuk akal dan sesuai dengan tingkat pemikiran siswa SD fase terkait.

## 3. Provenance & Transparansi Transformasi Data

Setiap hasil adaptasi yang diproses oleh AI wajib menyimpan metadata asal-usul transformasi (*provenance*):
```typescript
interface TransformationProvenance {
  sourceRegionId: string;        // Contoh: '35.77' (Kota Madiun)
  sourceTopic: string;           // Contoh: 'tradisi_lokal'
  modelUsed: string;             // Contoh: 'gemini-2.5-flash' atau 'deterministic-lkb'
  fallbackTriggered: boolean;    // true jika Gemini gagal dan sistem jatuh ke template
  invariantCheckPassed: boolean; // true jika rumus & angka matematis identik
  generatedAt: string;           // ISO timestamp
  teacherReviewed: boolean;      // false secara default sampai guru menyetujui
}
```

## 4. Ketahanan Kegagalan AI & Manajemen Kredensial

1. **Multi-Slot Credential Pool**:
   - Depaskan memiliki pool 5-slot API Key Gemini (`AIProviderManager`).
   - Jika satu slot terkena rate limit (HTTP 429) atau kuota habis, sistem harus otomatis beralih (*failover*) ke slot berikutnya.
   - Jangan pernah melakukan loop retry tanpa *exponential backoff* dan jeda waktu.
2. **Graceful Fallback**:
   - Jika seluruh API Key tidak tersedia atau koneksi offline, sistem harus mengembalikan adaptasi berbasis template LKB statis tanpa menyebabkan layar error bagi guru.
3. **Pemberitahuan Guru (Teacher-in-the-Loop)**:
   - Hasil generasi AI tidak boleh langsung dipublikasikan ke siswa tanpa pengawasan. Guru memiliki tombol edit, terima, atau tolak pada antarmuka draf.
