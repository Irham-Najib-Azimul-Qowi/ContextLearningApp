# ADMIN MANUAL SETUP — Panduan Pengaturan Admin DEPASKAN

> Panduan teknis untuk developer dalam menyiapkan dan mengelola Admin Control Center DEPASKAN.

---

## 1. Prasyarat

- **Node.js** v18+ 
- **npm** v9+
- **Environment Variables** tersedia di `.env.local` atau dashboard Vercel

---

## 2. Environment Variables

### Wajib (Minimal)
```env
# Gemini AI API Key (dari Google AI Studio)
GEMINI_API_KEY=AIzaSy_YOUR_ACTUAL_KEY_HERE

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### Opsional (Keamanan Lanjutan)
```env
# Master encryption key untuk AES-256-GCM (jika tidak disetel, fallback hardcoded dipakai)
ADMIN_ENCRYPTION_KEY=your_custom_32byte_encryption_key

# Supabase Service Role (untuk akses admin database)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
```

---

## 3. Akun Admin Default

Sistem sudah menyediakan dua akun admin bawaan:

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | SUPER_ADMIN |
| `superadmin` | `AdminPahami2026!` | SUPER_ADMIN |

> ⚠️ **PENTING**: Ganti password default SEGERA setelah deployment produksi melalui halaman `/admin/profile`.

---

## 4. Akses Admin

### URL
- **Development**: `http://localhost:3000/admin`
- **Production**: `https://your-domain.vercel.app/admin`

### Alur Login
1. Buka `/admin` → Auto-redirect ke `/admin/login` jika belum login
2. Masukkan username dan password
3. Setelah berhasil → Redirect ke `/admin/dashboard`

### Sesi
- Durasi sesi: **8 jam**
- Cookie: `pahami_admin_session` (httpOnly, secure di production)
- Sesi bertahan saat HMR/fast-refresh di development

---

## 5. Struktur Halaman Admin

| Halaman | URL | Fungsi |
|---------|-----|--------|
| Dashboard | `/admin/dashboard` | Overview dengan stat cards dan system status |
| Pengguna | `/admin/users` | Kelola akun guru dan mandiri |
| Sekolah | `/admin/schools` | Kelola workspace sekolah |
| Konten | `/admin/content` | Monitoring materi & bank soal semua sekolah |
| Room | `/admin/rooms` | Monitoring learning room dan pengunjung |
| AI Overview | `/admin/ai` | Hub multi-provider AI |
| Kredensial API | `/admin/ai/credentials` | Kelola API key terenkripsi |
| Model & Routing | `/admin/ai/models` | Konfigurasi model per fitur |
| Penggunaan Token | `/admin/ai/usage` | Analitik konsumsi token |
| Failover | `/admin/ai/failover` | Circuit breaker dan failover events |
| Knowledge Base | `/admin/knowledge-base` | Entitas pengetahuan lokal |
| Kesehatan Sistem | `/admin/system/health` | Status komponen sistem |
| Pengaturan | `/admin/system/settings` | Maintenance mode, AI switch |
| Audit Log | `/admin/security/audit-logs` | Log aktivitas administratif |
| Profil | `/admin/profile` | Ganti password admin |

---

## 6. Role & Permission

### Hierarchy
```
SUPER_ADMIN (16 permissions — akses penuh)
├── SYSTEM_ADMIN (7 permissions — users, schools, system)
└── CONTENT_ADMIN (6 permissions — knowledge, media, read-only AI)
```

### Menambah Admin Baru
Saat ini dilakukan melalui modifikasi `INITIAL_ADMIN_ACCOUNTS` di `lib/admin/admin-repository.ts`. Untuk production, implementasi UI pengelolaan admin dapat ditambahkan di `/admin/profile`.

---

## 7. Menambah API Key Baru

1. Buka `/admin/ai/credentials`
2. Klik **"Tambah Kredensial"**
3. Isi:
   - **Nama**: Label deskriptif (e.g., "Gemini Project Backup")
   - **API Key**: Paste dari Google AI Studio
   - **Quota Group**: Identifikasi project (e.g., `project_backup_01`)
   - **Prioritas**: Angka lebih rendah = prioritas lebih tinggi
4. Klik **"Simpan"** → Key otomatis terenkripsi AES-256-GCM
5. Klik ikon **Play** untuk test koneksi

---

## 8. Maintenance Mode

1. Buka `/admin/system/settings`
2. Toggle **Maintenance Mode** → ON
3. Isi pesan maintenance yang akan ditampilkan ke pengguna
4. Admin tetap bisa mengakses `/admin/*` saat maintenance aktif

---

## 9. Menjalankan Tests

```bash
# Jalankan semua test (termasuk admin control center tests)
npx tsx --test tests/*.test.ts

# Jalankan hanya test admin
npx tsx --test tests/admin_control_center.test.ts

# Build verification
npm run build
```

---

## 10. Deployment ke Vercel

1. Pastikan semua environment variables tersedia di Vercel Dashboard
2. Push ke branch `main`
3. Vercel otomatis build dan deploy
4. Verifikasi admin di `https://your-domain.vercel.app/admin`

### Environment Variables di Vercel
```
GEMINI_API_KEY = (dari Google AI Studio)
NEXT_PUBLIC_SUPABASE_URL = (dari Supabase Dashboard)
NEXT_PUBLIC_SUPABASE_ANON_KEY = (dari Supabase Dashboard)
```
