# Dokumentasi Pencadangan Kode Lama (Legacy Project Backup)

Dokumen ini mencatat titik pencadangan permanen seluruh kode aplikasi LMS ContextLearning / Pahami lawas sebelum dilakukannya reset fondasi bersih untuk pengembangan prototipe **Pahami V2**.

---

## 1. Identitas Cabang Pencadangan (*Backup Branch*)

| Parameter | Nilai / Keterangan |
| :--- | :--- |
| **Nama Cabang** | `backup/pre-context-engine-refactor` |
| **Commit Hash** | `18ec9942f49436d866ca3de14639a05b2cfd89ab` |
| **Repositori Remote** | `https://github.com/Irham-Najib-Azimul-Qowi/ContextLearningApp.git` |
| **Status Verifikasi** | **Terverifikasi di GitHub** (dapat diakses kapan saja) |

---

## 2. Cakupan Kode yang Tersimpan di Cabang Backup

Cabang `backup/pre-context-engine-refactor` menyimpan **100% utuh** implementasi sistem lama:
- **Alur Guru (`app/teacher/`):** 13 subhalaman (Dashboard, Bank Soal, Pembuat Soal AI, Scan Soal OCR, Pratinjau Kontekstualisasi, Profil Sekolah/Wilayah, Manajemen Kelas, Ujian, Koreksi Lembar Jawaban, Siswa, Pengaturan, Cetak Soal, Onboarding).
- **Alur Siswa (`app/student/`):** 7 subhalaman (Dashboard, Kelas, Materi Kontekstual, Ujian Online, Sesi Pengerjaan, Hasil & Pembahasan Nilai).
- **Alur Admin (`app/admin/`):** 7 subhalaman (Dashboard Admin Platform, Manajemen Sekolah, Verifikasi Dossier, Audit Log, Konfigurasi AI Provider, Manajemen Pengguna, Login Admin).
- **Otentikasi & Keamanan:** Rute registrasi, login umum, dan login berbasis subdomain/slug sekolah (`app/auth/`, `app/login/[school-slug]/`).
- **Komponen UI/UX Lama:** Sidebar admin, sidebar guru/siswa, rail workspace switcher, kontrol navigasi, modal berkas sekolah, kartu metrik, dan notifikasi.
- **Lapisan Data & Migrasi Database Lama:**
  - `supabase/migrations/001_initial_schema.sql`
  - `supabase/migrations/002_multi_tenant_v2.sql`
  - `supabase/seed.sql`
  - `lib/db/repository.ts`, `lib/db/mock-data.ts`, `lib/db/types.ts`
- **Unit & Security Tests:** Seluruh 16 pengujian otomatis LMS lama di `tests/`.

---

## 3. Cara Memeriksa & Mengakses Kembali Proyek Lama

Pengembang dapat memeriksa atau mengunduh kode lama kapan saja tanpa memengaruhi branch `main`:

```bash
# 1. Pastikan seluruh perubahan aktif tersimpan
git status

# 2. Ambil update dari remote
git fetch origin

# 3. Checkout ke cabang backup lama
git checkout backup/pre-context-engine-refactor

# 4. Untuk kembali ke cabang kerja Pahami V2
git checkout main
# atau
git checkout feature/local-knowledge-rag
# atau
git checkout feature/pahami-core-web
```

---

## 4. Status Database Live, Storage, & Secret Lokal

> [!IMPORTANT]
> **Pemisahan Git dan Data Produksi:**
> - **Git Backup Hanya Menyimpan Kode Sumber:** Git tidak menyimpan isi record database Supabase, file gambar di Supabase Storage, ataupun variabel `.env.local` di mesin pengembang.
> - **Database Supabase Live Tidak Dihapus / Tidak Dimodifikasi:** Reset repositori pada branch `main` tidak menjalankan migrasi destruktif (`DROP TABLE`) pada database live. Seluruh tabel lama di database Supabase tetap ada.
> - **Skema Pahami V2 Dimulai dari Migrasi Baru:** Kedua anggota tim akan merancang skema database prototipe V2 secara terpisah melalui file migrasi baru di `supabase/migrations/` tanpa merusak tabel lama.
