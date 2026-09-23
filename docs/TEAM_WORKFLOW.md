# Pahami V2 — Git Collaboration & Team Workflow

Panduan alur kerja Git praktis untuk kolaborasi paralel antara dua pengembang pada repositori **ContextLearningApp (Pahami V2)**.

---

## 1. Struktur Cabang Repositori (*Branch Structure*)

| Nama Cabang | Tipe | Tujuan & Aturan |
| :--- | :--- | :--- |
| `main` | Production / Integration | Cabang integrasi utama. Seluruh perubahan fitur digabungkan ke sini hanya melalui Pull Request (PR) yang ditinjau. Dilarang push langsung. |
| `backup/pre-context-engine-refactor` | Permanent Snapshot | Mengabadikan kondisi aplikasi eksisting sebelum refaktor V2. Tidak boleh dimodifikasi. |
| `feature/local-knowledge-rag` | Feature Branch | Ruang kerja aktif **Member 1** (Data & RAG Engineer). Berisi pipeline data, dataset, embedding, dan skrip retrieval. |
| `feature/pahami-core-web` | Feature Branch | Ruang kerja aktif **Member 2** (Full-Stack & AI Engineer). Berisi aplikasi Next.js, UI/UX, Gemini AI integration, dan Contextualization Engine. |

---

## 2. Panduan Langkah Praktis Pengembang

### A. Kloning Repositori & Persiapan Awal
```bash
# 1. Kloning repositori
git clone https://github.com/Irham-Najib-Azimul-Qowi/ContextLearningApp.git
cd ContextLearningApp

# 2. Fetch seluruh cabang remote
git fetch origin

# 3. Verifikasi cabang yang tersedia
git branch -a
```

### B. Berpindah ke Cabang Fitur Masing-Masing

**Untuk Member 1 (Data & RAG Engineer):**
```bash
# Beralih dan melacak cabang feature/local-knowledge-rag
git checkout feature/local-knowledge-rag
git pull origin feature/local-knowledge-rag
```

**Untuk Member 2 (Full-Stack & AI Engineer):**
```bash
# Beralih dan melacak cabang feature/pahami-core-web
git checkout feature/pahami-core-web
git pull origin feature/pahami-core-web
```

### C. Membuat Commit Berkualitas
Gunakan konvensi pesan commit konvensional (*Conventional Commits*):
- `feat(rag): ...` atau `feat(ui): ...` untuk penambahan fitur.
- `fix(pipeline): ...` atau `fix(exam): ...` untuk perbaikan bug.
- `docs(contracts): ...` untuk pembaruan dokumentasi.
- `test(...): ...` untuk penambahan unit test.

```bash
# 1. Periksa status berkas yang diubah
git status

# 2. Tambahkan hanya file yang relevan (hindari `git add .` membabi buta)
git add data-pipeline/scripts/ingest_madiun.py

# 3. Buat commit dengan pesan jelas
git commit -m "feat(rag): implement BPS administrative data ingest for Madiun Residency"
```

### D. Melakukan Push Cabang Fitur
```bash
# Push ke remote repository
git push origin feature/local-knowledge-rag
# atau
git push origin feature/pahami-core-web
```

---

## 3. Menjaga Cabang Fitur Tetap Mutakhir (*Synchronizing with main*)
Ketika ada perubahan baru yang telah di-merge ke `main`, perbarui cabang fitur Anda secara aman tanpa menggunakan `--force`:

```bash
# 1. Simpan pekerjaan aktif Anda jika ada uncommitted changes
git stash

# 2. Pindah ke main dan ambil update terbaru
git checkout main
git pull origin main

# 3. Kembali ke cabang fitur Anda
git checkout feature/local-knowledge-rag

# 4. Gabungkan perubahan main ke cabang fitur (rebase atau merge)
git merge main

# 5. Pulihkan uncommitted changes jika sebelumnya di-stash
git stash pop
```

---

## 4. Alur Integrasi Melalui Pull Request (PR)

1. **Buka Pull Request di GitHub:**
   - Base branch: `main`
   - Compare branch: `feature/local-knowledge-rag` atau `feature/pahami-core-web`
2. **Review oleh Rekan Tim:**
   - Anggota tim lainnya memeriksa diff kode, kepatuhan terhadap file contracts, dan keamanan data (tidak ada kredensial yang bocor).
3. **Verifikasi Otomatis:**
   - Jalankan `npm run lint`, `npx tsc --noEmit`, dan `npm run test` sebelum menyetujui penggabungan.
4. **Merge Aman:**
   - Gunakan fitur "Squash and merge" atau "Create a merge commit" di antarmuka GitHub PR.

---

## 5. Penyelesaian Konflik Git (*Conflict Resolution*)
Jika terjadi konflik saat merge:
1. Jalankan `git status` untuk melihat daftar file yang bentrok (*both modified*).
2. Buka file tersebut di editor, cari penanda konflik (`<<<<<<<`, `=======`, `>>>>>>>`).
3. Diskusikan dengan rekan tim untuk memilih logika yang benar.
4. Simpan file, lalu tandai konflik selesai:
   ```bash
   git add <nama-file-yang-dibereskan>
   git commit -m "chore: resolve merge conflicts between main and feature branch"
   ```
5. Push kembali ke remote branch Anda:
   ```bash
   git push origin <nama-cabang-fitur>
   ```

> [!CAUTION]
> **Larangan Keras:**
> Dilarang menggunakan `git push --force` atau `git push --force-with-lease` sebagai cara instan menyelesaikan konflik, karena dapat menghapus riwayat komit rekan tim secara permanen.
