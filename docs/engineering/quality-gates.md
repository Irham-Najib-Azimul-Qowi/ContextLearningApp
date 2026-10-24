# Quality Gates & Verification Protocol — Depaskan

Dokumen ini menetapkan standar pengujian dan gerbang kualitas (*quality gates*) yang wajib dipenuhi sebelum setiap perubahan kode diterima di repositori Depaskan.

## 1. Ikhtisar Gerbang Kualitas

```text
[Perubahan Kode] 
       │
       ▼
[Gate 1: TypeScript Check]  ──► npx tsc --noEmit (0 error)
       │
       ▼
[Gate 2: ESLint Check]      ──► npm run lint (0 error)
       │
       ▼
[Gate 3: Automated Tests]   ──► npm test (97/97 tests pass)
       │
       ▼
[Gate 4: Production Build]  ──► npm run build (Sukses bundle Turbopack)
       │
       ▼
[Gate 5: Security Review]   ──► Zero exposed keys, masked secrets
       │
       ▼
[Gate 6: UI / A11y Review]  ──► 5 Essential states, WCAG 2.1 AA keyboard nav
       │
       ▼
[Kode Diterima / Siap Merge]
```

## 2. Rincian dan Perintah Verifikasi

### Gate 1: Type Checking (TypeScript)
- **Perintah**: `npx tsc --noEmit`
- **Tujuan**: Memastikan integritas tipe data di seluruh modul tanpa ada ketidakcocokan tipe antara `lib/db/types.ts`, `lib/context-engine/types.ts`, dan antarmuka React.
- **Kriteria Lulus**: Tidak ada error kompilasi TypeScript (0 errors).

### Gate 2: Static Analysis & Linting (ESLint)
- **Perintah**: `npm run lint`
- **Tujuan**: Memastikan tidak ada pelanggaran aturan Next.js (`@next/next`), React Hook rules, atau sintaks usang.
- **Kriteria Lulus**: 0 error (peringatan non-fatal seperti `any` lama dapat ditoleransi sementara namun tidak boleh ada penambahan error baru).

### Gate 3: Automated Regression Tests (Node.js Test Runner)
- **Perintah**: `npm test`
- **Tujuan**: Memvalidasi integritas 14 suite pengujian yang mencakup:
  1. Google Auth & Onboarding Flow
  2. Contextual AI Engine Pipeline & Preservasi Matematika ($20 * 12.000 = 240.000$)
  3. Tombstone Deletion & Synchronization Integrity
  4. Document & Exam Parser (Anti-Title/Header Pollution)
  5. Pahami Clean Foundation Tests & Identifikasi Wilayah Madiun
  6. From Material Question Pipeline Tests
  7. Full System E2E Acceptance & 8-Workflow Matrix
  8. Examination & Assessment Scoring Engine
  9. ID & Code Normalization Matrix
  10. Local Knowledge Base (LKB) Retrieval & Zero Region Leakage
  11. Multi-School Isolation & Class Membership
  12. Room Lifecycle, Snapshot Immutability & Content Archiving
  13. Unified 10-Workflow Matrix & Pipeline Normalization
- **Kriteria Lulus**: 97 dari 97 pengujian lulus 100% (0 fail, 0 cancelled, 0 skipped).

### Gate 4: Production Build Verification
- **Perintah**: `npm run build`
- **Tujuan**: Memverifikasi bahwa Next.js 16.3.5 dan Turbopack dapat memproduksi bundle rilis Vercel tanpa kegagalan Server Components atau kegagalan SSR.
- **Kapan Diwajibkan**: Sebelum rilis kompetisi atau sebelum penggabungan cabang fitur besar.

### Gate 5: Security & Secret Masking
- **Pemeriksaan**:
  - Tidak ada string rahasia (API key, database password, service role key) yang dicetak di file kode atau log.
  - Tampilan kredensial di antarmuka harus dimaskir (`AIK...9xy`).
- **Kriteria Lulus**: Verifikasi inspeksi visual/grep tidak menemukan kebocoran kredensial.

### Gate 6: UI Responsiveness & Accessibility (A11y)
- **Pemeriksaan**:
  - Implementasi 5 status (ideal, empty, loading, error, offline).
  - Navigasi keyboard penuh (`Tab`, `Enter`, `Escape`).
  - Ring fokus visual terlihat jelas (`focus-visible`).
  - Kontras teks memenuhi standar WCAG 2.1 AA.
- **Kriteria Lulus**: Lulus inspeksi markup semantik dan pengujian visual.
