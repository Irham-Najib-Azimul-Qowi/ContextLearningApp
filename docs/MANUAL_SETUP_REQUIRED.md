# Panduan Setup Manual & Konfigurasi Deployment (Vercel & Supabase)

Dokumen ini memuat daftar tindakan manual atau pengaturan lingkungan (*environment variables*) yang diperlukan agar sistem **DEPASKAN** dapat beroperasi secara optimal di lingkungan Production (Vercel) dan Local Development.

---

## 1. Konfigurasi Environment Variables di Vercel

Pastikan variabel-variabel berikut telah ditambahkan di **Vercel Dashboard** ➔ **Settings** ➔ **Environment Variables** (aktifkan untuk: *Production*, *Preview*, dan *Development*):

| Variabel | Wajib / Opsional | Keterangan & Nilai Rujukan |
| :--- | :---: | :--- |
| `GEMINI_API_KEY` | **WAJIB** | Kunci API Google AI Studio aktif dengan akses model `gemini-flash-latest` dan `gemini-3.7-flash`. |
| `NEXT_PUBLIC_SUPABASE_URL` | **WAJIB** | URL project Supabase aktif (contoh: `https://xxxx.supabase.co`). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **WAJIB** | Kunci anon/public Supabase untuk autentikasi client. |
| `SUPABASE_SERVICE_ROLE_KEY` | **WAJIB** | Kunci service-role Supabase untuk operasi sinkronisasi data cloud & seeding LKB di backend. |

> [!IMPORTANT]
> **Catatan Pemilihan Model Gemini:**  
> Sistem DEPASKAN telah dikonfigurasi menggunakan:
> 1. **Primary Model:** `gemini-flash-latest` (Aktif & Direkomendasikan)
> 2. **Fallback Model:** `gemini-3.7-flash` (Aktif)
> 3. **Backup Model:** `gemini-3.8-flash` (Aktif dengan exponential backoff)  
> *Hindari menggunakan model usang seperti `gemini-1.5-flash` atau `gemini-2.0-flash` yang telah didepresiasi oleh Google API dan menghasilkan error 404.*

---

## 2. Status Tabel Database Supabase

Jika menggunakan project Supabase yang sedang berjalan, seluruh tabel berikut **telah aktif dan siap pakai**:
1. `user_synced_data`: Menyimpan seluruh data soal, materi, dan room kelas guru secara tersinkronisasi lintas perangkat (Laptop & HP).
2. `lkb_entities`: Menyimpan 20 entitas kearifan lokal Jawa Timur (Ponorogo, Madiun, Magetan, Ngawi, dsb) untuk sistem RAG.
3. `lkb_regions`: Menyimpan 50 data referensi wilayah administrasi daerah.

Jika membuat project Supabase baru dari nol, jalankan skrip migrasi berikut secara berurutan di Supabase SQL Editor:
- `supabase/migrations/20260322_user_synced_data.sql`
- `supabase/migrations/20260325_init_rag_lkb.sql`
- `supabase/migrations/20260326_seed_ponorogo_madiun.sql`

---

## 3. Sinkronisasi Akun Lintas Perangkat (Laptop & HP)

Agar soal dan materi yang dibuat di laptop langsung muncul di HP (dan sebaliknya):
1. Masuk (*login*) menggunakan **alamat email dan akun yang sama** di kedua perangkat.
2. Sistem secara otomatis menggunakan User UUID dari Supabase Auth (`authUser.id`) sebagai ID kepemilikan data (`teacher_id`).
3. Saat koneksi internet aktif, data akan disinkronkan secara real-time ke Supabase `user_synced_data` dan dicadangkan di memori lokal perangkat.

---

## 4. Checklist Verifikasi Operasional

- [x] Endpoint `/api/ai/contextualize` teruji dengan model Gemini aktif.
- [x] LKB Retrieval mengambil data rill kearifan lokal Ponorogo / Madiun (bukan mock template).
- [x] Validator deterministik memastikan angka matematika dan kunci jawaban 100% konsisten.
- [x] Antarmuka Guru di `/teacher/questions` dan `/teacher/materials` memiliki tampilan Human-in-the-Loop lengkap dengan indikator verifikasi dan tombol koreksi.
- [x] Build Next.js clean tanpa error linting atau TypeScript.
