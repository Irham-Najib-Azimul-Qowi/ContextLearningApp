# DOKUMEN KEAMANAN & KRIPTOGRAFI ADMIN CONTROL CENTER — PAHAMI V2
**Hak Cipta © 2026 Tim PAHAMI — Hackathon IT Comp 2026**  
*Security Architect, Cryptography Specialist, Software Quality Engineer*

---

## 1. PENILAIAN ANCAMAN & PRINSIP DESAIN KEAMANAN

Dalam perancangan Admin Control Center PAHAMI V2, diterapkan prinsip pertahanan berlapis (*Defense-in-Depth*) untuk memitigasi berbagai vektor serangan siber:

1. **Pencegahan Kebocoran API Key (Credential Theft)**: API key Google AI Studio tidak pernah disimpan dalam bentuk plaintext di database, file source code, log, atau payload respons HTTP kien.
2. **Mitigasi Serangan Brute-Force**: Mekanisme lockout otomatis 15 menit setelah 5 kali kegagalan login berturut-turut.
3. **Pencegahan Timing Attack**: Perbandingan password hash dilakukan menggunakan fungsi pembanding waktu konstan `crypto.timingSafeEqual`.
4. **Isolasi Sesi & Proteksi XSS/CSRF**: Sesi admin disimpan dalam cookie `HttpOnly` dengan flag `SameSite=Lax` dan atribut `Secure`, terisolasi total dari autentikasi Google OAuth pengguna umum.
5. **Jejak Audit Forensik yang Tidak Dapat Diubah (Immutable Audit Trail)**: Seluruh tindakan administratif dicatat secara struktural dengan timestamp, IP address, user ID, dan status hasil.

---

## 2. DETAIL IMPLEMENTASI KRIPTOGRAFI

### A. Enkripsi Kredensial AI (AES-256-GCM)
Enkripsi menggunakan algoritma standar militer **AES-256-GCM (Galois/Counter Mode)** yang menyediakan otentikasi data (Authenticated Encryption with Associated Data - AEAD):
- **Panjang Kunci**: 256 bit (32 bytes derived via SHA-256 dari `ADMIN_ENCRYPTION_KEY`).
- **Initialization Vector (IV)**: 12 bytes acak yang dihasilkan secara kriptografis menggunakan `crypto.randomBytes(12)` untuk setiap enkripsi baru.
- **Authentication Tag**: 16 bytes auth tag untuk memvalidasi integritas ciphertext dan mendeteksi upaya modifikasi data tanpa izin.

```typescript
export function encryptSecret(secret: string): { ciphertext: string; iv: string; tag: string } {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getMasterKey(), iv);
  let encrypted = cipher.update(secret, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag().toString("hex");
  return {
    ciphertext: encrypted,
    iv: iv.toString("hex"),
    tag,
  };
}
```

### B. Hashing Kata Sandi Admin (Memory-Hard Scrypt)
Kata sandi developer tidak di-hash menggunakan algoritma cepat seperti MD5, SHA-1, atau plain SHA-256 (yang rentan terhadap serangan kamus berbasis GPU), melainkan menggunakan **`scrypt`** yang membutuhkan alokasi memori besar:
- **Parameter Scrypt**:
  - $N = 16384$ (Cost parameter)
  - $r = 8$ (Block size)
  - $p = 1$ (Parallelization parameter)
  - Output Key Length = 64 bytes (128 hex chars)
- **Garam Kriptografis (Salt)**: 16 bytes acak acak unik per akun pengguna.

### C. Verifikasi Waktu Konstan (Timing-Attack Resistance)
Untuk mencegah penyerang mengukur perbedaan waktu respons saat mencocokkan hash:
```typescript
const keyBuffer = derivedKey;
const storedBuffer = Buffer.from(storedHash, "hex");
if (keyBuffer.length !== storedBuffer.length) {
  return resolve(false);
}
resolve(crypto.timingSafeEqual(keyBuffer, storedBuffer));
```

---

## 3. MODEL OTORISASI & HAK AKSES BERBASIS PERAN (RBAC)

Sistem membedakan 3 tingkatan peran administratif secara ketat:

| Hak Akses / Permission | SUPER_ADMIN | SYSTEM_ADMIN | CONTENT_ADMIN |
| :--- | :---: | :---: | :---: |
| Mengelola Admin Lain (`admins.manage`) | ✅ | ❌ | ❌ |
| Mengelola Kredensial AI (`ai.credentials.manage`) | ✅ | ❌ | ❌ |
| Mengatur Model Routing (`ai.models.manage`) | ✅ | ❌ | ❌ |
| Mengatur Maintenance & Mode Global (`system.settings.manage`) | ✅ | ✅ | ❌ |
| Reset Circuit Breaker (`ai.failover.manage`) | ✅ | ❌ | ❌ |
| Membaca Telemetri AI (`ai.usage.read`) | ✅ | ✅ | ✅ |
| Manajemen Pengguna & Sekolah (`users.manage`, `schools.manage`) | ✅ | ✅ | ❌ |
| Kurasi Knowledge Base & Media CC (`knowledge.manage`, `media.manage`) | ✅ | ❌ | ✅ |
| Audit Log Keamanan (`security.audit.read`) | ✅ | ✅ | ❌ |

---

## 4. KEBIJAKAN PRIVASI SISWA (STUDENT PRIVACY ENFORCEMENT)

Sesuai regulasi perlindungan data anak di bawah umur:
- Pada halaman Manajemen Pengguna (`/admin/users`), profil siswa hanya menampilkan nama depan atau nama lengkap dalam batas kelas sekolah.
- Data alamat rumah, nomor identitas kependudukan anak (NIK), atau informasi sensitif siswa tidak pernah disimpan ataupun diekspos ke panel admin.
- Akun siswa yang dinonaktifkan tidak dihapus permanen untuk menjaga integritas nilai rapor dan ujian yang telah berlangsung.

---

## 5. AUDIT LOGGING & FORENSIK KEAMANAN

Setiap mutasi konfigurasi, upaya login, pergantian status kredensial, dan modifikasi pengguna dicatat dalam tabel `admin_audit_logs` dengan format:
- `id`: Unique identifier audit log.
- `admin_id`: ID unik akun admin pelaksana.
- `admin_username`: Username pelaksana.
- `action`: Tipe tindakan (misal: `CREDENTIAL_CREATED`, `CIRCUIT_BREAKER_RESET`, `USER_STATUS_UPDATED`).
- `target_type`: Objek yang dimodifikasi (`CREDENTIAL`, `USER`, `SETTING`, `MODEL`).
- `target_id`: ID objek sasaran.
- `result`: Hasil operasi (`SUCCESS`, `DENIED`, `FAILED`).
- `metadata`: JSON payload rincian mutasi konfigurasi (tanpa plaintext secret).
- `created_at`: Timestamp standar ISO 8601.
