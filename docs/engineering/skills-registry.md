# Skills Registry — Depaskan Engineering AI Toolkit

Dokumen ini mencatat seluruh keahlian agen (*Agent Skills*) yang dikurasi, diadaptasi, dan dipasang di dalam repositori Depaskan (`Irham-Najib-Azimul-Qowi/ContextLearningApp`).

## 1. Ringkasan Repositori & Lisensi Sumber

| Sumber / Koleksi | Repositori Asli | Lisensi | Status Adopsi | Alasan / Nilai Tambah |
| :--- | :--- | :--- | :--- | :--- |
| **Ponytail** | [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) | MIT | Diadaptasi ke `disciplined-engineering` | Mendorong filosofi minimalis, YAGNI, pelaporan transparan atas hal yang dilewati & risiko, serta pencegahan over-engineering. |
| **Agent Skills** | [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) | Apache-2.0 / MIT | Diadaptasi ke `frontend-ui-engineering`, `testing-quality-gates`, `disciplined-engineering` | Standar industri untuk UI engineering, WCAG 2.1 AA, TDD, code review, dan doubt-driven development. |
| **Better Web UI** | [aladicf/better-web-ui](https://github.com/aladicf/better-web-ui) | MIT | Diadaptasi ke `frontend-ui-engineering` | Mencegah tampilan klise "AI dashboard", meningkatkan hierarki visual, micro-interactions, dan konsistensi token desain. |
| **React Frontend Skills** | [PyModel/react-frontend-skills](https://github.com/PyModel/react-frontend-skills) | MIT | Diadaptasi ke `frontend-ui-engineering` | Praktik terbaik React 19, Next.js 16 App Router, kemurnian render, dan pemisahan Server/Client Component. |
| **Supabase Agent Skills** | [supabase/agent-skills](https://github.com/supabase/agent-skills) | Apache-2.0 / MIT | Diadaptasi ke `secure-coding-supabase` | Praktik resmi PostgreSQL RLS, proteksi session server-side dengan `@supabase/ssr`, dan audit least-privilege. |
| **Depaskan Core** | Internal Repository | Hak Cipta Tim Depaskan | Dibuat khusus di `depaskan-engineering` & `ai-evaluation-provenance` | Menjamin kepatuhan Kurikulum Merdeka SD (Fase A-C), isolasi regional LKB Madiun Raya, preservasi matematika, dan ketahanan dual-storage. |

## 2. Matriks Keahlian Terpasang (.agents/skills/)

| Nama Skill | Path Instalasi | Domain Cakupan | Trigger / Kapan Digunakan |
| :--- | :--- | :--- | :--- |
| **`depaskan-engineering`** | `.agents/skills/depaskan-engineering/SKILL.md` | Domain 8 (Pedagogi) & Arsitektur Utama | Mengubah arsitektur dasar, pipeline kontekstualisasi, LKB Madiun Raya, imutabilitas room, atau materi SD. |
| **`disciplined-engineering`** | `.agents/skills/disciplined-engineering/SKILL.md` | Domain 1 (Disiplin Kode) & Domain 9 (Disiplin Pengiriman) | Setiap sesi rekayasa: inspeksi sebelum edit, kepatuhan YAGNI, penelusuran aliran data, diff minimalis, dan pelaporan jujur. |
| **`frontend-ui-engineering`** | `.agents/skills/frontend-ui-engineering/SKILL.md` | Domain 2 (UI/UX) & Domain 6 (Performa) | Merancang, meninjau, atau memodifikasi antarmuka pengguna, komponen, responsivitas, dan aksesibilitas WCAG 2.1 AA. |
| **`secure-coding-supabase`** | `.agents/skills/secure-coding-supabase/SKILL.md` | Domain 3 (Keamanan) & Domain 4 (Supabase/Data) | Implementasi otentikasi, proteksi API, RLS PostgreSQL, sinkronisasi offline tombstone, privasi data siswa, dan audit kredensial. |
| **`testing-quality-gates`** | `.agents/skills/testing-quality-gates/SKILL.md` | Domain 5 (Pengujian) & Domain 9 (Kualitas) | Merancang/menjalankan tes unit & integrasi, regresi 97 tes, verifikasi lint/build, dan bug reproduction. |
| **`ai-evaluation-provenance`** | `.agents/skills/ai-evaluation-provenance/SKILL.md` | Domain 7 (Keandalan AI) | Integrasi model Gemini, pembagian batas deterministik vs probabilistik, preservasi rumus matematika, dan metadata asal-usul transformasi. |

## 3. Kebijakan Supply Chain & Beban Dependensi

- Seluruh keahlian dipasang sebagai instruksi runbook termutakhir yang dapat diverifikasi dalam format markdown standar (`SKILL.md` dengan frontmatter YAML).
- **Nol Pustaka Runtime Tambahan**: Tidak ada paket npm baru yang ditambahkan ke `package.json`, menjaga bundle tetap ramping dan menghilangkan vektor serangan rantai pasok (*supply chain vulnerability*).
