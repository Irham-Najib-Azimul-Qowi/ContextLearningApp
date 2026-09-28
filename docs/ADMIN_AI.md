# ADMIN AI — Arsitektur Provider Manager DEPASKAN

> Dokumentasi teknis sistem Multi-Provider AI Gateway untuk DEPASKAN Control Center.

---

## 1. Overview

DEPASKAN menggunakan arsitektur **AIProviderManager** terpusat yang mengelola semua interaksi dengan Google Gemini API melalui mekanisme:
- **Multi-Credential Pool** — Menyimpan banyak API key terenkripsi dengan prioritas
- **Model Cascade** — Fallback otomatis ke model alternatif jika model primer gagal
- **Circuit Breaker** — Proteksi otomatis saat kredensial mengalami error berturut-turut
- **Quota Group Isolation** — Menghindari rotasi ke kredensial dengan kuota grup yang sama

---

## 2. File Kunci

| File | Fungsi |
|------|--------|
| `lib/ai/ai-provider-manager.ts` | Kelas `AIProviderManager` dengan `execute()` dan `testConnection()` |
| `lib/admin/admin-repository.ts` | Penyimpanan in-memory untuk kredensial, model config, usage events |
| `lib/admin/crypto.ts` | Enkripsi AES-256-GCM dan masking API key |
| `lib/admin/types.ts` | TypeScript interface untuk semua entitas admin |

---

## 3. Alur Eksekusi AI

```
Teacher Request (Generate Soal / Kontekstualisasi / Validasi)
    │
    ▼
AIProviderManager.execute(featureKey, prompt, imagePart?)
    │
    ├─ 1. Ambil konfigurasi model untuk featureKey
    │     (primary_model, fallback_model, timeout, temperature)
    │
    ├─ 2. Susun cascade model kandidat:
    │     [primary] → [fallback] → [gemini-flash-lite-latest] → [gemini-3.1-flash-lite] → ...
    │
    ├─ 3. Pilih kredensial terbaik (selectCredential):
    │     - Filter: is_enabled = true
    │     - Skip: quota group yang sudah exhausted
    │     - Skip: circuit_state = OPEN (kecuali cooldown habis)
    │     - Skip: health_status = invalid/disabled (kecuali primary + env key)
    │     - Return kredensial dengan prioritas tertinggi
    │
    ├─ 4. Dekripsi API key (AES-256-GCM) → plaintextKey
    │     - Fallback ke process.env.GEMINI_API_KEY jika dekripsi gagal
    │
    ├─ 5. Coba setiap model dalam cascade:
    │     - Sukses → Reset circuit breaker, catat usage, return hasil
    │     - Error auth → Buka circuit breaker, coba kredensial berikutnya
    │     - Error quota/model → Coba model berikutnya dalam cascade
    │
    └─ 6. Semua gagal → Return error dengan pesan formatif
```

---

## 4. Feature Keys

| Feature Key | Fungsi | Primary Model | Fallback Model |
|-------------|--------|---------------|----------------|
| `question_generation` | Generate soal dari topik | `gemini-flash-lite-latest` | `gemini-3.1-flash-lite` |
| `question_scan` | Ekstraksi soal dari gambar/PDF | `gemini-flash-lite-latest` | `gemini-3.1-flash-lite` |
| `material_generation` | Generate materi pembelajaran | `gemini-flash-lite-latest` | `gemini-3.1-flash-lite` |
| `contextual_rewriting` | Kontekstualisasi konten lokal | `gemini-flash-lite-latest` | `gemini-3.1-flash-lite` |
| `educational_validation` | Validasi kualitas soal | `gemini-flash-lite-latest` | `gemini-3.1-flash-lite` |

---

## 5. Keamanan API Key

### Enkripsi At-Rest (AES-256-GCM)
```
Plaintext API Key
    │
    ├─ crypto.randomBytes(12) → IV (initialization vector)
    ├─ AES-256-GCM encrypt dengan master key (SHA-256 dari ADMIN_ENCRYPTION_KEY)
    ├─ cipher.getAuthTag() → 16-byte authentication tag
    │
    └─ Simpan: { encrypted_api_key, iv, auth_tag }
        (plaintext TIDAK PERNAH disimpan)
```

### Masking untuk Display
```
AIzaSyDpA1234567890abcdefX9Q  →  AIzaSy••••••••fX9Q
```

### Zero Exposure Guarantee
- API key plaintext hanya ada di memori saat eksekusi AI call
- Frontend TIDAK PERNAH menerima plaintext key
- Response API selalu menampilkan `masked_key`

---

## 6. Circuit Breaker

| State | Kondisi | Aksi |
|-------|---------|------|
| **CLOSED** | Normal, tidak ada error | Terima request |
| **OPEN** | Auth error / 5+ consecutive errors | Tolak request, tunggu cooldown |
| **HALF_OPEN** | Cooldown selesai | Izinkan 1 request canary test |

Cooldown default: **60 detik**

---

## 7. Admin UI Endpoints

| Endpoint | Method | Fungsi |
|----------|--------|--------|
| `/api/admin/ai/credentials` | GET | List semua kredensial (masked) |
| `/api/admin/ai/credentials` | POST | Tambah kredensial baru |
| `/api/admin/ai/credentials` | PATCH | Update (enable/disable/priority) |
| `/api/admin/ai/credentials` | DELETE | Hapus kredensial |
| `/api/admin/ai/credentials/test` | POST | Test koneksi kredensial |
| `/api/admin/ai/models` | GET | List konfigurasi model |
| `/api/admin/ai/models` | POST | Update konfigurasi model |
| `/api/admin/ai/usage` | GET | List usage events |
| `/api/admin/ai/failover` | GET | List failover events |
