# DOKUMEN ARSITEKTUR TEKNIS ADMIN CONTROL CENTER — PAHAMI V2
**Hak Cipta © 2026 Tim PAHAMI — Hackathon IT Comp 2026**  
*Principal Software Architect, AI Infrastructure Engineer, Database Architect*

---

## 1. RINGKASAN EKSEKUTIF

PAHAMI V2 Admin Control Center dirancang untuk memenuhi standar infrastruktur enterprise modern pada platform edutech berbasis AI kontekstual:
- **Tingkat Ketersediaan Tinggi (High Availability)**: Mencegah error kegagalan sistem saat kuota API AI eksternal habis melalui Automatic Failover, Circuit Breaker, dan Safe Pedagogical Fallback.
- **Isolasi Keamanan Total (Zero Trust & Separation of Concerns)**: Kredensial developer disimpan terpisah dari database pengguna biasa dengan enkripsi standar industri (AES-256-GCM dan scrypt memory-hard hashing).
- **Arsitektur Tanpa Server Tetap (Zero VPS / Zero Cloud Run)**: Beroperasi 100% di atas Vercel Serverless dan Supabase PostgreSQL (Seoul AWS cluster), mengeliminasi biaya server Python yang menyala terus menerus.

---

## 2. DIAGRAM ARSITEKTUR SISTEM GLOBAL

```mermaid
graph TD
    subgraph Klien["Klien Pengguna & Developer"]
        BrowserDev["Developer Browser (Admin Control Center)"]
        BrowserUser["Guru & Siswa (Aplikasi PAHAMI)"]
    end

    subgraph VercelNext["Next.js 16 Serverless / Edge Runtime (Vercel)"]
        AdminAuth["Admin Auth Guard (/api/admin/*)<br/>• HttpOnly Cookie 'pahami_admin_session'<br/>• Scrypt Verification & Rate Limiting"]
        UserAuth["User Auth Guard<br/>• Google OAuth (Supabase Auth)"]
        
        AIManager["AI Provider Manager (lib/ai/ai-provider-manager.ts)<br/>• Quota-Group Awareness<br/>• Circuit Breaker State Machine<br/>• Latency & Token Telemetry<br/>• Pedagogical Safe Fallback"]
        
        AdminRepo["Admin Repository (lib/admin/admin-repository.ts)<br/>• Cryptographic AES-256-GCM Engine<br/>• Audit Logging Service"]
        
        LKB["Local Knowledge Base Retriever<br/>• Cosine Similarity Filtering (>= 0.70)<br/>• Karesidenan Madiun + Semarang Scope"]
    end

    subgraph SupabaseDB["Remote Supabase Cloud (Seoul ap-northeast-2)"]
        PgRelational["PostgreSQL Relational Tables<br/>• admin_accounts, admin_sessions<br/>• ai_credentials, ai_models<br/>• ai_usage_events, ai_failover_events<br/>• admin_audit_logs, system_settings"]
        PgVector["pgvector Extension (v0.8.2)<br/>• local_context_entities (1536 dim)<br/>• text-embedding-3-small vectors"]
        Storage["Supabase Storage<br/>• Lembar Kerja OCR, Media Wikimedia CC"]
    end

    subgraph AIProviders["Multi-Provider AI Clouds"]
        GeminiPrimary["Google AI Studio - Primary Key (Project Prod)"]
        GeminiStandby["Google AI Studio - Standby Key (Project Backup)"]
    end

    BrowserDev -->|HTTPS /admin| AdminAuth
    BrowserUser -->|HTTPS /guru, /siswa| UserAuth
    
    AdminAuth --> AdminRepo
    AdminRepo --> PgRelational
    
    UserAuth --> AIManager
    AIManager -->|1. Coba Kredensial Prioritas 1| GeminiPrimary
    AIManager -.->|2. Kuota Habis (429) -> Auto Failover| GeminiStandby
    AIManager -.->|3. Semua Provider Down -> Safe Fallback| LKB
    
    LKB --> PgVector
```

---

## 3. MEKANISME MULTI-PROVIDER AI & AUTOMATIC FAILOVER

### A. State Machine Circuit Breaker
Setiap kredensial API key memiliki finite-state machine mandiri untuk mencegah cascading failure:

```
      +-------------+   3 Kali Gagal Beruntun (429/503/Timeout)
      |             | -----------------------------------------> +-----------+
      |   CLOSED    |                                            |           |
      |   (Normal)  | <----------------------------------------- |   OPEN    |
      +-------------+           Reset Manual oleh Admin          | (Tripped) |
             ^                                                   +-----------+
             |                                                         |
             | Sukses Uji Request                                      | Cooldown 60 Detik
             |                                                         v
      +-------------+                                            +-----------+
      |  HALF_OPEN  | <----------------------------------------- |           |
      |  (Testing)  |                                            +-----------+
      +-------------+
```

1. **State CLOSED (Normal)**:
   - Kredensial aktif menerima request dari guru/siswa.
   - Setiap error yang terjadi dihitung dalam `consecutive_errors`. Jika mencapai batas **3 kali beruntun**, circuit berpindah ke `OPEN`.
2. **State OPEN (Tripped)**:
   - Kredensial diskors dan dilewati (*bypassed*) dari routing panggilan AI.
   - Panggilan otomatis dialihkan ke kredensial prioritas berikutnya dengan `quota_group` berbeda.
   - Masa karantina (*cooldown*) berlangsung selama **60 detik**.
3. **State HALF_OPEN (Testing)**:
   - Setelah masa cooldown berakhir, sistem mengirimkan satu uji koneksi ringan. Jika berhasil, state kembali ke `CLOSED` dan error counter direset ke 0.

### B. Quota-Group Awareness (Anti-Waste Rotation)
Banyak developer membuat beberapa API Key di dalam Google Cloud Project yang sama. Jika kuota project habis (HTTP 429 ResourceExhausted), semua key di project tersebut pasti gagal.  
`AIProviderManager` mengelompokkan kredensial berdasarkan `quota_group`. Ketika sebuah key terkena limit kuota 429, **seluruh kredensial dalam quota_group yang sama langsung ditandai exhausted**, sehingga sistem tidak membuang waktu merotasi ke key lain yang berada dalam satu proyek.

### C. Pedagogical Safe Fallback
Jika seluruh kredensial Google Gemini eksternal kehabisan kuota atau jaringan terputus, sistem secara otomatis mengeksekusi **Pedagogical Safe Fallback**:
- Mengambil template butir soal dan rangkuman materi dari cache kurikulum Fase C terverifikasi di wilayah sekolah terkait (Madiun Raya atau Semarang).
- Siswa dan guru tidak pernah mengalami error crash 500 saat ujian berlangsung di hadapan dewan juri IT Comp 2026.

---

## 4. MODEL KEAMANAN & KRIPTOGRAFI

| Aspek Keamanan | Implementasi di PAHAMI V2 | Alasan Desain |
| :--- | :--- | :--- |
| **Enkripsi Kredensial AI** | AES-256-GCM (Authenticated Encryption) dengan random IV 12 bytes & Auth Tag 16 bytes. | Menjamin kerahasiaan dan integritas. Data terenkripsi tidak bisa dimanipulasi di database tanpa merusak tag otentikasi. |
| **Masking API Key** | `AIzaSy...4x9Q` (hanya menampilkan 6 karakter depan & 4 belakang). | Mencegah shoulder surfing dan kebocoran credential di UI atau network response. |
| **Password Storage** | `scrypt` (N=16384, r=8, p=1) dengan cryptographically secure random salt 16 bytes. | Memory-hard key derivation function yang sangat tahan terhadap serangan cracking GPU/ASIC. |
| **Verifikasi Password** | `crypto.timingSafeEqual` pada buffer hash. | Menghilangkan kerentanan *timing attack*. |
| **Proteksi Brute-Force** | Kunci akun selama 15 menit jika 5 kali gagal berturut-turut. | Menangkal serangan password dictionary brute-force. |
| **Manajemen Sesi Admin** | Cookie `HttpOnly`, `SameSite=Lax`, `Secure` bernama `pahami_admin_session`. Hash token SHA-256 disimpan di database dengan auto-revoke 8 jam. | Terisolasi total dari cookie sesi Google OAuth guru/siswa. |

---

## 5. SKEMA DATABASE & ENTITY RELATIONSHIP (ERD)

```
[ admin_accounts ]
- id (UUID / text, PK)
- username (unique)
- password_hash (text)
- salt (text)
- role (SUPER_ADMIN, SYSTEM_ADMIN, CONTENT_ADMIN)
- is_active (boolean)
- failed_login_attempts (int)
- locked_until (timestamptz)

[ admin_sessions ]
- id (text, PK)
- admin_id (FK -> admin_accounts.id)
- session_token_hash (text, indexed)
- expires_at (timestamptz)

[ ai_credentials ]
- id (text, PK)
- name (text)
- provider (gemini, openai)
- quota_group (text)
- encrypted_api_key (text)
- iv (text)
- auth_tag (text)
- masked_key (text)
- priority (int)
- circuit_state (CLOSED, HALF_OPEN, OPEN)
- consecutive_errors (int)
- cooldown_seconds (int)

[ ai_models ]
- id (text, PK)
- feature_key (unique)
- primary_model (text)
- fallback_model (text)
- timeout_ms (int)
- temperature (numeric)

[ ai_usage_events ]
- id (text, PK)
- feature_key (text)
- model (text)
- input_tokens (int)
- output_tokens (int)
- latency_ms (int)
- status (SUCCESS, FAILED_OVER, ERROR)
```
