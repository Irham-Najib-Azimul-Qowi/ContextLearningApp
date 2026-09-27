# AUDIT SISTEM AI DEPASKAN (AI_SYSTEM_AUDIT.md)

**Tanggal:** 27 September 2026  
**Auditor:** Senior Full-Stack Engineer + AI Engineer + Software Architect + QA Engineer  
**Repositori:** DEPASKAN (ContextLearningApp)  
**Tujuan:** Audit menyeluruh implementasi arsitektur AI, integrasi Gemini API, Local RAG, normalisasi skema, validasi edukasi, sinkronisasi Supabase lintas perangkat, dan alur human-in-the-loop (Generate AI, Manual, Scan/PDF).

---

## A. KONDISI SEKARANG

### 1. Fitur yang Sudah Benar-benar Bekerja
- **Autentikasi Supabase & OAuth Callback**: Alur login Google dengan cookie sesi SSR, proteksi route middleware, dan redirect terpadu (`app/auth/callback/route.ts`).
- **Antarmuka & Design System Claymorphism / Soft UI**: Komponen workspace guru (`TeacherWorkspaceShell`, `IconNavigationRail`, `#51465B`, `#FFD36D`, `#251E2B`) stabil dan responsif.
- **Koneksi Supabase Cloud PostgreSQL**: Tabel `user_synced_data` (3 pengguna aktif), `lkb_entities` (20 entitas terverifikasi Ponorogo, Madiun, Magetan, Ngawi, Semarang), dan `lkb_regions` (50 wilayah) terhubung aktif.
- **Google GenAI SDK**: Panggilan ke model terbaru `gemini-3.8-flash` dan `gemini-flash-latest` melalui `@google/genai` berhasil diverifikasi dengan API key yang valid.
- **Unit Tests**: 40/40 test unit lulus (crypto AES-256-GCM, circuit breaker, failover, hashing).
- **Build Next.js**: Turbopack App Router 74/74 route berhasil dikompilasi tanpa kegagalan impor.

### 2. Fitur yang Hanya UI / Menggunakan Mock Data
- **AI Context Fallback Template**: Di `app/api/ai/contextualize/route.ts`, terdapat `fallbackMaterial` dan `fallbackQuestions` statis ("Seorang pedagang membeli 3 paket komoditas lokal seharga Rp15.000..."). Ketika pemanggilan AI gagal atau format tidak sesuai, sistem mengembalikan template ini secara diam-diam.
- **GeminiProvider Mock Fallback**: Di `lib/ai/gemini-provider.ts`, method `getFallbackQuestion()` mengembalikan soal hardcoded matematika ("Seorang pedagang membeli 20 kg beras...").
- **AI Extract OCR Fallback**: Di `app/api/ai/extract/route.ts`, jika ekstraksi teks gagal, sistem mengembalikan placeholder `[Ekstraksi Dokumen: ...]`.
- **Scan Verification Fallback**: Di `app/api/scan/process/route.ts`, jika ID dokumen tidak terbaca pada foto lembar soal, sistem secara sembarangan mengambil `latestIssuance` terakhir dari database dan menyatakannya terverifikasi (`verified: true`).

### 3. Fitur yang Backend-nya Belum Terhubung Sesuai Arsitektur
- **Bypass Pipeline Context Engine**: `app/api/ai/contextualize/route.ts` tidak memanfaatkan `contextEngine.executePipeline` yang ada di `lib/context-engine/pipeline.ts`. RAG hanya dipanggil untuk mengambil 2 entitas teks, lalu prompt mentah dilempar ke Gemini tanpa Safe Substitution Plan dan tanpa validasi kesetaraan angka matematis.
- **Validasi Edukasi (Invarian Kompetensi)**: Hasil contextualization di API belum memvalidasi apakah kuantitas matematika, tipe soal, dan kunci jawaban konsisten antara versi asli dan versi lokal.
- **Review Komparasi Guru (Human-in-the-Loop)**: Halaman `context-preview` ada di `/teacher/questions/context-preview`, namun alur wizard di `/teacher/questions` melompati komparasi ini dan langsung menyimpan ke repositori lokal.

### 4. Masalah Sinkronisasi Lintas Perangkat (Laptop vs HP)
- **Desinkronisasi Active School & Profil**: Saat guru login di perangkat baru (HP), `activeSchool` diinisialisasi dengan seed default (`sch-ponorogo-01`), padahal di laptop guru menggunakan workspace mandiri (`school-individual`). Akibatnya filter `getQuestions({ schoolId })` menyembunyikan soal yang tersimpan di cloud.
- **ID Pengguna Berbeda**: Di `lib/db/repository.ts`, `getCurrentUser()` terkadang mengembalikan `"usr-teacher-active"` atau timestamp lokal, sedangkan Supabase Auth menghasilkan UUID asli. Ini menyebabkan ketidakcocokan `teacher_id` pada item soal/materi.

---

## B. DIAGNOSIS MASALAH

### Masalah 1: Output AI Selalu Berupa Template Statis
- **Penyebab**: Model lama (`gemini-2.5-flash`, `gemini-1.5-flash`, `gemini-2.0-flash`) mengembalikan HTTP 404 dari Google AI Studio, dan model `gemini-3.7-flash` mengalami 503 overload. `ai-provider-manager.ts` dan route API menangkap error tersebut lalu secara diam-diam mengembalikan hardcoded fallback templates.
- **File Terkait**: `app/api/ai/contextualize/route.ts`, `lib/ai/gemini-provider.ts`, `lib/admin/admin-repository.ts`.
- **Dampak**: Guru selalu menerima template soal dan materi yang sama persis berulang kali tanpa ada pemrosesan AI nyata.
- **Solusi yang Dipilih**:
  1. Tetapkan model primer ke `gemini-3.8-flash` dengan fallback canary `gemini-flash-latest`.
  2. Hapus seluruh fallback mock template dari API dan service. Jika terjadi kegagalan jaringan atau kuota, tampilkan pesan error yang ramah dengan opsi retry.
- **Risiko Perubahan**: Rendah. Panggilan AI diverifikasi langsung menghasilkan response hidup.

### Masalah 2: Local RAG Tidak Digunakan Secara Terstruktur (Bypass Context Engine)
- **Penyebab**: `contextEngine.executePipeline()` di `lib/context-engine/pipeline.ts` tidak dipanggil oleh endpoint `/api/ai/contextualize`.
- **File Terkait**: `app/api/ai/contextualize/route.ts`, `lib/context-engine/pipeline.ts`.
- **Dampak**: Fakta lokal tidak melalui analisis entitas variabel (commodity, location, tradition, geography, occupation) dan tidak ada safe substitution plan.
- **Solusi yang Dipilih**: Hubungkan alur normalisasi konten ke `ContextualAIEngine`, lakukan retrieval via `defaultRetriever` ke basis pengetahuan Ponorogo/Madiun, terapkan penggantian variabel aman, dan panggil Gemini Context Engine untuk penyusunan narasi tanpa mengubah angka hitungan.
- **Risiko Perubahan**: Sedang. Membutuhkan normalisasi input teks dari Generate AI, Manual, maupun Scan/PDF.

### Masalah 3: Ketiadaan Validator Struktural & Invarian Kompetensi
- **Penyebab**: API hanya memeriksa keberadaan string tanpa memeriksa preservasi kompetensi, konsistensi kunci jawaban, dan kesetaraan kuantitas matematika.
- **File Terkait**: `app/api/ai/contextualize/route.ts`, `lib/context-engine/pipeline.ts`.
- **Dampak**: Berpotensi mengubah kunci jawaban atau merusak esensi soal matematika/IPAS.
- **Solusi yang Dipilih**: Implementasikan deterministic validator (perbandingan angka hitungan asli vs lokal, validasi tipe soal, opsi A-D, dan kunci jawaban) yang menghasilkan status `VALID`, `WARNING`, atau `INVALID`.
- **Risiko Perubahan**: Rendah. Melindungi integritas konten evaluasi siswa.

### Masalah 4: Review Guru Asli vs Lokal Terputus pada Alur Wizard
- **Penyebab**: Wizard di `app/teacher/questions/page.tsx` dari Step 2 langsung menuju Step 3 form edit tanpa menampilkan komparasi Naskah Asli vs Versi Lokal beserta variabel konteks yang digunakan.
- **File Terkait**: `app/teacher/questions/page.tsx`, `app/teacher/questions/context-preview/page.tsx`.
- **Dampak**: Prinsip human-in-the-loop terabaikan; guru tidak dapat melihat komparasi dan alasan pedagogis penggantian konteks lokal.
- **Solusi yang Dipilih**: Integrasikan komponen pratinjau komparasi (Naskah Asli, Versi Lokal, Variabel Konteks, Checklist Validasi) secara elegan ke dalam alur input soal dan materi sebelum disetujui dan disimpan.
- **Risiko Perubahan**: Rendah. Menggunakan komponen UI soft UI existing tanpa merusak tata letak desktop.

### Masalah 5: Sinkronisasi Lintas Perangkat (Laptop vs HP) Tidak Menampilkan Data
- **Penyebab**:
  1. Filter `getQuestions({ schoolId })` dan `getMaterials(schoolId)` menyembunyikan konten jika ID sekolah aktif pada HP berbeda dengan ID workspace laptop (`school-individual` vs `sch-ponorogo-01`).
  2. Saat HP pertama kali login, sesi lokal mengirimkan data default yang meng-overwrite `activeSchoolId`.
- **File Terkait**: `lib/db/repository.ts`, `app/api/sync/user-data/route.ts`.
- **Dampak**: Data soal dan materi yang dibuat di laptop tidak muncul saat guru membuka akun dari ponsel.
- **Solusi yang Dipilih**:
  1. Perbaiki `getQuestions` dan `getMaterials` agar selalu menampilkan seluruh item yang dimiliki oleh akun pengguna (`teacher_id` atau user email yang sama), apapun filter workspace sekolahnya.
  2. Pastikan saat initial sync pada perangkat baru, server mengembalikan data cloud otoritatif tanpa tertimpa oleh state kosong perangkat.
- **Risiko Perubahan**: Rendah. Meningkatkan konsistensi data multi-device.

### Masalah 6: Pindaian Lembar Soal Otomatis Memvalidasi Dokumen Sembarang
- **Penyebab**: `app/api/scan/process/route.ts` mengambil baris penerbitan terakhir (`latestIssuance`) jika ID dokumen tidak terbaca.
- **File Terkait**: `app/api/scan/process/route.ts`.
- **Dampak**: Keamanan verifikasi naskah cetak tidak terjamin; foto apapun dianggap dokumen sah DEPASKAN.
- **Solusi yang Dipilih**: Wajibkan verifikasi ID dokumen atau token QR yang valid terhadap tabel `document_issuances`.
- **Risiko Perubahan**: Rendah.

---

## C. PRIORITAS PENGERJAAN

| Kode | Tingkat | Masalah / Fitur | Solusi |
|---|---|---|---|
| **P0** | Kritis | Output AI berupa template mock fallback | Aktifkan `gemini-3.8-flash` & `gemini-flash-latest`, hapus silent mock fallback, tampilkan real error handling |
| **P0** | Kritis | Local RAG tidak terhubung ke Context Engine di API | Hubungkan `/api/ai/contextualize` ke `ContextualAIEngine` dan LKB Ponorogo/Madiun |
| **P0** | Kritis | Data tidak sinkron antara Laptop dan HP | Perbaiki resolusi akun di `repository.ts` dan rekonsiliasi data cloud di `/api/sync/user-data` |
| **P1** | Tinggi | Wizard soal/materi melompati komparasi Asli vs Lokal | Integrasikan review komparasi guru (Original vs Localized + Validation Checklist) sebelum simpan |
| **P1** | Tinggi | Tombol Generate masih bertuliskan "Lanjut" pada beberapa bagian | Ubah teks tombol menjadi "Generate" pada mode Generate AI |
| **P1** | Tinggi | Ketiadaan validator invarian angka matematika & kunci jawaban | Implementasikan modul validasi struktural, kompetensi, dan kunci jawaban |
| **P2** | Sedang | Verifikasi scan foto lembar soal mengambil dokumen sembarang | Batasi verifikasi hanya pada ID dokumen DEPASKAN yang terdaftar |
| **P2** | Sedang | Alur input Manual dan Scan/PDF belum dinormalisasi ke satu pipeline | Normalisasikan teks manual dan OCR ke skema internal sebelum contextualization |
| **P3** | Rendah | Optimasi responsivitas mobile tanpa mengubah desktop baseline | Penyesuaian padding dan micro-spacing pada tampilan ponsel |

---
*Dokumen ini disusun sebagai acuan kerja implementasi langsung Phase 2 hingga Phase 10.*
