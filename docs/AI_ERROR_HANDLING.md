# STANDAR ERROR HANDLING SISTEM AI (AI_ERROR_HANDLING.md)

**Repositori:** DEPASKAN (ContextLearningApp)  
**Versi:** 2.0 (Strict Error Contract & Zero Mock Fallback)  

---

## 1. PRINSIP UTAMA: ZERO FAKE SUCCESS & NO TEMPLATES

Sistem DEPASKAN secara tegas memberlakukan aturan:
1. **Tidak Ada Fake Success:** Endpoint API dilarang mengembalikan HTTP 200 dengan data dummy/template jika proses inferensi atau ekstraksi gagal.
2. **Tidak Ada Error Swallowing:** `try/catch` tidak boleh menyembunyikan kegagalan AI menjadi objek sukses kosong atau fallback statis.
3. **Pesan UI Bahasa Indonesia yang Jelas:** Klien menerima pesan yang mudah dipahami guru tanpa jargon teknis, namun tetap disertai kode error terstruktur untuk penanganan UI.
4. **Keamanan Kredensial:** Pesan error, log klien, dan response JSON dilarang keras membocorkan API key, bearer token, atau stack trace internal.

---

## 2. KONTRAK ERROR STANDAR (`lib/ai/error-contract.ts`)

Setiap kegagalan mengembalikan struktur JSON konsisten:

```json
{
  "success": false,
  "error": {
    "code": "AI_QUOTA_EXHAUSTED",
    "message": "Kuota layanan AI sedang habis. Sistem sedang mencoba layanan cadangan.",
    "retryable": true
  },
  "requestId": "DEP-20260928-87ABC3"
}
```

### Kamus Kode & Pesan Error:

| Kode Error | Pesan Antarmuka (Bahasa Indonesia) | Retryable |
|---|---|:---:|
| `INPUT_INVALID` | "Teks belum dapat diproses. Pastikan materi atau soal sudah diisi." | Tidak |
| `PDF_EXTRACTION_FAILED` | "PDF berhasil diunggah, tetapi teks belum berhasil dibaca." | Ya |
| `OCR_FAILED` | "Teks pada gambar belum berhasil dibaca. Coba gunakan gambar yang lebih jelas." | Ya |
| `AI_RATE_LIMITED` | "Layanan AI sedang terlalu banyak menerima permintaan. Sistem sedang mencoba layanan cadangan." | Ya |
| `AI_QUOTA_EXHAUSTED` | "Kuota layanan AI sedang habis. Sistem sedang mencoba layanan cadangan." | Ya |
| `AI_MODEL_UNAVAILABLE` | "Model AI yang digunakan sedang tidak tersedia." | Tidak |
| `AI_PROVIDER_UNAVAILABLE` | "Layanan AI sedang mengalami gangguan. Silakan coba lagi." | Ya |
| `AI_AUTH_FAILED` | "Otentikasi layanan AI gagal. Periksa konfigurasi API key." | Tidak |
| `AI_TIMEOUT` | "Proses AI membutuhkan waktu terlalu lama. Silakan coba lagi." | Ya |
| `AI_INVALID_RESPONSE` | "AI menghasilkan respons yang tidak sesuai format. Tidak ada hasil yang disimpan." | Ya |
| `RAG_FAILED` | "Basis pengetahuan lokal tidak dapat diakses saat ini." | Ya |
| `RAG_NO_CONTEXT` | "Konteks lokal yang sesuai belum ditemukan." | Tidak |
| `VALIDATION_FAILED` | "Hasil belum dapat digunakan karena pemeriksaan isi belum berhasil." | Ya |
| `ALL_AI_CREDENTIALS_FAILED` | "Semua layanan AI yang tersedia sedang tidak dapat digunakan. Silakan coba lagi beberapa saat." | Ya |
| `UNKNOWN_ERROR` | "Terjadi kesalahan yang tidak terduga. Silakan coba lagi." | Ya |

---

## 3. PANDUAN IMPLEMENTASI UI ERROR STATE

Antarmuka guru (`/teacher/materials/create` dan `/teacher/questions/scan`) menerapkan Soft UI Claymorphism:
- **Card Error Lembut:** Menggunakan background warna mawar lembut (`bg-rose-50 border border-rose-200 rounded-[28px] p-6 text-rose-900`).
- **Badge Kode:** Kode error ditampilkan dalam badge kecil monospaced (`bg-rose-200 text-rose-800 text-[10px] font-mono font-bold`).
- **Aksi Cepat:**
  - Tombol **"Coba Lagi"** (`RefreshCw` icon): mengulang eksekusi secara langsung.
  - Tombol **"Ubah Input"**: mengembalikan kontrol ke form teks awal tanpa kehilangan naskah yang sudah diketik atau diekstrak.
