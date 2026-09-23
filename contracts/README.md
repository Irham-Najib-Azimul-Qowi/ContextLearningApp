# Shared Integration Contracts — Pahami V2

Dokumentasi ini menetapkan perjanjian integrasi teknis antara:
- **Member 1 (Data & RAG Engineer)** — Pengelola pipeline data, struktur basis pengetahuan lokal, dan penyimpanan *embedding* vektor.
- **Member 2 (Full-Stack & AI Engineer)** — Pengembang aplikasi web Next.js, mesin kontekstualisasi, dan antarmuka interaktif guru/siswa.

## Status Kontrak
> **Status:** `DRAFT — PROPOSED SPECIFICATION`  
> Seluruh kontrak pada direktori ini merupakan spesifikasi antarmuka yang direncanakan (*planned interfaces*), bukan API yang telah terimplementasi di produksi saat ini. Kedua anggota tim wajib meninjau dan menyetujui kontrak ini sebelum memulai implementasi kode fitur.

## Daftar Kontrak Integrasi
1. [Region Contract](./region-contract.md): Standarisasi hierarki wilayah administratif dan identifikasi stabil wilayah Karesidenan Madiun.
2. [Context Entity Contract](./context-entity-contract.md): Struktur data entitas pengetahuan lokal (budaya, sejarah, geografi, dll).
3. [Retrieval Contract](./retrieval-contract.md): Spesifikasi antarmuka permintaan (*request*) dan respons (*response*) pencarian konteks hybrid antara aplikasi Next.js dan database pgvector.

## Prinsip Integrasi Bersama
1. **Identifier Stabil**: Identitas wilayah dan entitas menggunakan kode deterministik (berbasis BPS/Kemendagri dan UUID/CUID), bukan mengandalkan string nama manusia yang rentan salah ketik (*typo*).
2. **Skema Aditif**: Setiap perubahan skema database atau kontrak harus bersifat aditif (*non-breaking*), mempertahankan kompatibilitas mundur.
3. **Pemisahan Boundary**: Aplikasi web Next.js tidak membaca file mentah dari `data-pipeline/datasets/raw/`. Seluruh konsumsi data dilakukan melalui lapisan data terstruktur di database PostgreSQL + pgvector (Supabase).
