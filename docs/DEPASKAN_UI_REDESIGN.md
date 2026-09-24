# DEPASKAN UI/UX REDESIGN SPECIFICATION & IMPLEMENTATION REPORT
**Design System: Claymorphism, Soft UI, Pastel Dashboard, Teacher Login & Admin Control Center**

---

## 1. Ringkasan Eksekutif

Dokumen ini mencatat pembaruan antarmuka (UI) dan pengalaman pengguna (UX) platform **DEPASKAN**. Platform ini dirancang untuk mendukung Guru dan pengguna mandiri dalam mengontekstualisasikan materi pembelajaran dan butir soal Kurikulum Merdeka Fase C (berbasis wilayah uji coba Ponorogo, Karesidenan Madiun, dan Kota Semarang).

Pembaruan utama mencakup:
1. **Redesain Halaman Login Guru / Pengguna Utama (`/login`)**:
   - Single floating card minimalis dengan estetika Claymorphism & Soft UI.
   - Tanpa form email/password konvensional dan tanpa pilihan peran murid.
   - Judul resmi *"Masuk ke DEPASKAN"* dengan wordmark konsisten.
   - Satu CTA unik (*"Lanjutkan perjalanan belajarmu" / "Masuk dengan Google"*) yang menginisiasi Google OAuth via Supabase Auth.
   - Logo Google resmi dalam circular badge putih dengan soft shadow.
2. **Redesain Halaman Login Admin (`/admin/login` dan `/admin`)**:
   - Single floating card bernuansa tenang dan profesional.
   - Form kredensial Admin (Username & Password) dengan show/hide toggle.
   - Proteksi sesi scrypt + HttpOnly cookie `pahami_admin_session`.
   - Tanpa tombol Google OAuth (khusus developer internal).
3. **Redesain Admin Control Center**:
   - Arsitektur visual **Layered Soft UI** dengan 4 lapisan kedalaman.
   - Sidebar Dark Mauve (`#51465B`) dengan active pill highlights dan drawer responsif di mobile.
   - Floating header horizontal beraksen Glassmorphism.
   - Dashboard Overview, AI Management, User Management, Knowledge Base, System Health, dan Security Logs yang seragam menggunakan design tokens Claymorphism.
4. **Pembersihan Konsep Akun Murid**:
   - DEPASKAN berfokus pada pendidik dan pengguna mandiri; filter murid pada manajemen pengguna dipisahkan menjadi data historis legacy, tanpa registrasi atau dashboard murid aktif.

---

## 2. Design System DEPASKAN

### 2.1 Konsep Visual Utama
* **Claymorphism**: Permukaan komponen terasa lembut, membal (*tactile/pillowy*), memiliki border tipis halus (`#E9E5E8`), dan elevated shadow berlapis yang memberi kesan sedikit melayang di atas background.
* **Soft UI**: Kedalaman visual dihadirkan melalui gradasi intensitas shadow dan perbedaan tone warna antara background ambient, container, panel, dan card.
* **Glassmorphism (Aksen Ringan)**: Digunakan secara terukur pada floating topbar, modal overlay, container login card, dan badge status (`backdrop-blur-md` dengan background semi-transparan `bg-white/85` atau `bg-white/15`). Teks panjang tetap menggunakan background solid demi menjaga kontras dan keterbacaan (WCAG AAA).

### 2.2 Palet Warna Resmi
| Nama Token | Kode HEX | Peruntukan / Kegunaan |
| :--- | :--- | :--- |
| **Dark Mauve** | `#51465B` | Identitas brand utama, background sidebar admin, judul utama, primary CTA buttons |
| **Soft Rose** | `#DFAEB3` | Aksen ambient glow, border interaktif sekunder, dekorasi pastel lembut |
| **Coral** | `#F47D83` | Aksen tombol tindakan khusus, badge highlight, hover state interaktif |
| **Warm Yellow** | `#FFD36D` | Aksen logo "D" DEPASKAN, teks aktif sidebar, indikator sorotan penting |
| **Off White** | `#FAF7F3` | Background kanvas utama aplikasi, inner input surface, tag netral |
| **White** | `#FFFFFF` | Permukaan kartu Claymorphism, container elevated |
| **Dark Text** | `#23212A` | Teks judul, angka metrik utama, label bernilai tinggi |
| **Secondary Text** | `#756F7A` | Deskripsi pendukung, metadata, subjudul, ikon pasif |
| **Soft Border** | `#E9E5E8` | Border tipis Claymorphic container, card divider |

### 2.3 Border Radius System
* **Outer Application Container**: `32px – 40px` (`rounded-[32px] sm:rounded-[40px]`)
* **Main Panel / Hero Banners**: `28px – 36px` (`rounded-[28px] sm:rounded-[36px]`)
* **Card & Content Blocks**: `20px – 28px` (`rounded-[24px] sm:rounded-[28px]`)
* **Interactive Buttons / CTA**: `14px – 20px` atau pill (`rounded-2xl` / `rounded-full`)
* **Form Inputs & Search Bars**: `12px – 16px` (`rounded-xl` / `rounded-2xl`)
* **Modals & Dialogs**: `28px – 36px` (`rounded-[32px] sm:rounded-[36px]`)

### 2.4 Shadows & Elevation Tokens
* **Clay Card Shadow**:
  `box-shadow: 0 10px 25px -5px rgba(81, 70, 91, 0.08), 0 8px 10px -6px rgba(81, 70, 91, 0.04), inset 0 -2px 4px rgba(81, 70, 91, 0.02);`
* **Clay Card Elevated**:
  `box-shadow: 0 20px 35px -8px rgba(81, 70, 91, 0.12), 0 10px 15px -5px rgba(81, 70, 91, 0.06);`
* **Clay Button Primary**:
  `box-shadow: 0 8px 18px -4px rgba(81, 70, 91, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.25);`
* **Clay Button Coral**:
  `box-shadow: 0 8px 18px -4px rgba(244, 125, 131, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.3);`

---

## 3. Desain Halaman Login Guru (`/login`)

### 3.1 Komposisi Vertikal
1. **Background**: Ambient canvas `#FAF7F3` dengan 3 titik blur pastel (Dark Mauve `#51465B`, Soft Rose `#DFAEB3`, dan Warm Yellow `#FFD36D`).
2. **Card Utama**: Floating Claymorphic card berdimensi nyaman (`max-w-[440px]`), padding seimbang (`p-8 sm:p-10`), sudut membulat `rounded-[36px]`.
3. **Wordmark & Identitas**:
   - Ikon logo puzzle / squircle DEPASKAN bersudut `rounded-2xl` dengan inisial "D" warna Dark Mauve & Warm Yellow.
   - Tulisan judul: **"Masuk ke DEPASKAN"** (`text-2xl sm:text-3xl font-black text-[#23212A]`).
   - Subjudul pendek: *"Platform pembelajaran kontekstual berbasis kecerdasan artifisial lokal."*
4. **Primary CTA**:
   - Tombol Claymorphic berwarna Dark Mauve `#51465B` berteks kontras putih.
   - Copywriting:
     - Teks utama: **"Lanjutkan perjalanan belajarmu"**
     - Keterangan alur: **"Masuk dengan Google"**
   - Micro-interaction: Hover sedikit terangkat (`translate-y-[-1px]`), active pressed state, disable state saat loading OAuth berlangsung.
5. **Google Identity Icon**:
   - Lingkaran putih bersih (`w-11 h-11 rounded-full shadow-md border border-[#E9E5E8]`) tepat di bawah CTA yang memuat SVG resmi 4-warna Google.
6. **Kebijakan & Tautan Balik**:
   - Navigasi kembali ke Beranda DEPASKAN.
   - Keterangan privasi dan keamanan akun pendidik.

---

## 4. Desain Halaman Login Admin (`/admin/login`)

### 4.1 Komposisi & Keamanan
1. **Layout**: Floating card berpusat vertikal dan horizontal dengan latar belakang Off-White pastel.
2. **Karakter Visual**: Tenang, profesional, bersih, berorientasi administrasi sistem.
3. **Wordmark & Judul**:
   - Logo inisial DEPASKAN dengan badge **"Admin Control Center"**.
   - Judul: **"Masuk ke DEPASKAN"** + subjudul *"Akses khusus pengelola DEPASKAN."*
4. **Form Input**:
   - Field **Username** pengembang.
   - Field **Password** dengan toggle visibility (Show / Hide Password).
   - Input bergaya Claymorphic (`clay-input`) dengan focus state berwarna Dark Mauve transparan.
5. **CTA Tindakan**:
   - Tombol **"Masuk ke Control Center"** dengan ikon `ArrowRight`.
6. **Integritas Keamanan**:
   - Tidak ada login Google OAuth pada portal Admin.
   - Autentikasi server-side scrypt hashing dengan validasi session HttpOnly.

---

## 5. Desain Admin Control Center

### 5.1 Arsitektur Layered Soft UI
1. **Layer 1 (Ambient Background)**: `#FAF7F3` dengan soft pastel glow circular blobs.
2. **Layer 2 (Outer Shell)**: Squircle wrapper `max-w-[1600px]` dengan radius `rounded-[32px] sm:rounded-[40px]`.
3. **Layer 3 (Navigation & Header)**:
   - **Sidebar**: Dark Mauve solid (`#51465B`) dengan navigasi terstruktur:
     - *Dashboard Ringkasan* (`/admin/dashboard`)
     - *Manajemen Pengguna* (`/admin/users`) & *Manajemen Sekolah* (`/admin/schools`)
     - *Multi-Provider AI* (`/admin/ai`, `/admin/ai/credentials`, `/admin/ai/models`, `/admin/ai/usage`, `/admin/ai/failover`)
     - *Knowledge Base* (`/admin/knowledge-base`, `/admin/knowledge-base/media`)
     - *Sistem & Keamanan* (`/admin/system/health`, `/admin/system/settings`, `/admin/security/audit-logs`)
   - **Floating Topbar**: Card horizontal mengambang beraksen glass (`bg-white/85 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-[#E9E5E8] shadow-xs px-5 py-3.5`).
   - **Mobile Drawer**: Slide-over navigation panel saat diakses pada resolusi smartphone atau tablet.
4. **Layer 4 (Interactive Content)**: Card metrik, tabel audit, sandbox pencarian semantik, dan form kredensial berbasis kelas `.clay-card`.

---

## 6. Audit & Pengujian Kualitas

1. **TypeScript Compilation**:
   - Perintah `npx tsc --noEmit` lolos dengan **0 error**.
2. **Next.js Production Build**:
   - Semua route (59 route dinamis & statis) terkompilasi bersih tanpa kegagalan tipe atau SSR.
3. **Aksesibilitas & Keterbacaan**:
   - Kontras warna Dark Mauve (`#51465B`) terhadap Off-White (`#FAF7F3`) dan Putih (`#FFFFFF`) memenuhi standar rasio kontras WCAG AA/AAA.
   - Seluruh interactive button memiliki aria-label, focus indicator, serta handling mobile touch target minimum 44px.
