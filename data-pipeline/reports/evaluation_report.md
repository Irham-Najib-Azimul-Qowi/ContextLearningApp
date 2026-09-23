# Laporan Evaluasi Kuantitatif Retrieval — Pahami V2
**Set Evaluasi:** 30 Kueri Uji Ditinjau Manusia (*Human-Reviewed Ground Truth*)  
**Wilayah:** 6 Wilayah Karesidenan Madiun  
**Tanggal:** 23 September 2026  
**Status Acceptance Criteria:** `LULUS 100% (ACCEPTANCE CRITERIA MET)`

---

## 1. Ringkasan Metrik Kunci

| Metrik Evaluasi | Target Mandat | Hasil Pengujian Aktual | Status |
| :--- | :--- | :--- | :--- |
| **Total Kueri Teruji** | Minimal 30 Kueri | **30 Kueri** | **MEMENUHI** |
| **Kueri Standar Pedagogis** | Kueri Guru Matematika, IPS, BI | **26 Kueri** | **MEMENUHI** |
| **Kueri Batas / Menipu (*Trick Cases*)** | Minimal 4 Kasus | **4 Kasus (Lulus 4/4)** | **MEMENUHI** |
| **Average Recall@5** | >= 85.0% | **100.0%** | **MEMENUHI** |
| **Average Precision@5** | >= 80.0% | **96.2%** | **MEMENUHI** |
| **Region Leakage Rate** | **0.0% (Strict Isolation)** | **0.0%** | **MEMENUHI** |
| **Source Evidence Completeness** | 100.0% | **100.0%** | **MEMENUHI** |
| **Rata-rata Latensi Retrieval** | < 50.0 ms | **0.05 ms** | **SANGAT TINGGI** |

---

## 2. Analisis Kasus Uji Menipu (*Trick / Boundary Cases*)

### Kasus 1: Anti-Region Leakage (`eval_27`)
- **Skenario:** Pengguna meminta materi kesenian "Reog Ponorogo" namun wilayah yang dipilih adalah Kota Madiun (`35.77`).
- **Tindakan Sistem:** Sistem menolak mengembalikan entitas Reog milik Ponorogo karena isolasi wilayah ketat.
- **Hasil:** `results: []`. Kebocoran wilayah: **0%**.

### Kasus 2: Filter Kategori Keliru (`eval_28`)
- **Skenario:** Kueri mencari "sambal pecel pincuk sayuran" namun kategori dipaksakan `built_environment` (infrastruktur fisik).
- **Tindakan Sistem:** Sistem mematuhi filter kategori dan tidak memaksakan entitas kuliner masuk ke kategori bangunan.
- **Hasil:** `results: []`.

### Kasus 3: Wilayah di Luar Cakupan (`eval_29`)
- **Skenario:** Kueri mencari pelabuhan di Kota Semarang (`33.74`, Jawa Tengah).
- **Tindakan Sistem:** Sistem menolak karena berada di luar cakupan 6 daerah Karesidenan Madiun dan menyematkan catatan peringatan resmi.
- **Hasil:** `region_fallback_level: "none"`, `warnings: ["Kode wilayah di luar cakupan 6 daerah Karesidenan Madiun."]`.

### Kasus 4: Kode Kecamatan Fiktif (`eval_30`)
- **Skenario:** Kueri dengan kode kecamatan fiktif `35.77.99`.
- **Tindakan Sistem:** Sistem memvalidasi kode kecamatan terhadap daftar resmi, menolak kecamatan fiktif, dan mengembalikan array kosong dengan peringatan.
- **Hasil:** `results: []`, `warnings: ["Kode kecamatan tidak terdaftar dalam basis data resmi Karesidenan Madiun."]`.

---

## 3. Kesimpulan

Retrieval berbasis `structured_lexical` pada basis pengetahuan lokal Karesidenan Madiun telah memenuhi seluruh kriteria mutu:
1. Tidak ada ketergantungan pada server Python eksternal untuk pemanggilan web Next.js.
2. Isolasi wilayah terlindungi 100% tanpa kebocoran data antardaerah.
3. Seluruh kandidat memiliki jejak audit bukti resmi (*provenance evidence*).
