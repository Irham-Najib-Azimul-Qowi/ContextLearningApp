# DOKUMEN KONTRAK INTEGRASI ANGGOTA 1 & ANGGOTA 2
**Proyek:** PAHAMI V2 (AI-Powered Contextual Learning)  
**Kompetisi:** Hackathon IT Comp 2026 — Smart Education  
**Fokus Wilayah:** Karesidenan Madiun (Ponorogo, Kota Madiun, Magetan, Ngawi, Pacitan)  

---

## 1. PEMBAGIAN TANGGUNG JAWAB

| Area Kerja | Anggota 1 (Data & Retrieval Engineer) | Anggota 2 (Web & Contextual AI Engineer) |
|---|---|---|
| **Fokus Utama** | Pengumpulan dataset wilayah, embedding, pembersihan data lokal Karesidenan Madiun, vector search/hybrid search. | Aplikasi web lengkap (Next.js), UI/UX Teacher & Student, Contextual AI Engine, validasi pedagogis, bank soal, dan evaluasi. |
| **Wilayah Kerja Kode** | `data-pipeline/`, modul embedding, skrip ETL dataset. | `app/`, `components/`, `lib/context-engine/`, `lib/db/`, `tests/`. |
| **Branch Git** | `feature/data-pipeline-rag` (atau branch terpisah Anggota 1). | `feature/pahami-core-web`. |
| **Titik Temu Integrasi** | Menyediakan implementasi service atau endpoint retrieval data wilayah. | Menyediakan `LocalContextRetriever` adapter yang memanggil service Anggota 1. |

---

## 2. KONTRAK INTERFACE RETRIEVAL

Anggota 2 telah mendefinisikan interface modular di [`lib/context-engine/retrieval-adapter.ts`](file:///x:/folder_website/contextlearning/lib/context-engine/retrieval-adapter.ts):

```typescript
export interface RetrievalRequest {
  region_id: string;        // Kode wilayah Kemendagri, e.g. "35.02" untuk Ponorogo, "35.77" untuk Kota Madiun
  category?: string | null; // e.g. "commodity", "geography", "tradition", "occupation", "location"
  query: string;            // Kata kunci atau teks variabel soal asli
  subject?: string | null;  // "Matematika", "Bahasa Indonesia", "IPS"
  grade?: number | null;    // 1 - 6 SD
  limit?: number;           // Default: 5
}

export interface ContextCandidateEntity {
  entity_id: string;
  region_id: string;
  region_name: string;
  name: string;
  category: string;
  description: string;
  source_url?: string;
  verification_status: "verified" | "draft";
}

export interface RetrievalResponse {
  results: ContextCandidateEntity[];
}

export interface LocalContextRetriever {
  retrieve(request: RetrievalRequest): Promise<RetrievalResponse>;
}
```

---

## 3. MEKANISME RETRIEVAL MOCK VS REAL

1. **Fase Pra-Integrasi (Saat Ini):**  
   Anggota 2 menggunakan `MockLocalContextRetriever` yang berisi basis data terverifikasi nyata untuk:
   - Kabupaten Ponorogo (`35.02`): Porang, Susu Sapi Pudak, Kesenian Reog, Telaga Ngebel, Pasar Legi.
   - Kota Madiun (`35.77`): Pecel Madiun, Industri Kereta PT INKA, Brem Madiun.
   - Kabupaten Magetan (`35.20`), Ngawi (`35.21`), dan Pacitan (`35.01`).

2. **Fase Pasca-Integrasi (Ketika Modul Anggota 1 Siap):**  
   Cukup mengimplementasikan class baru:
   ```typescript
   export class RealMember1ContextRetriever implements LocalContextRetriever {
     async retrieve(request: RetrievalRequest): Promise<RetrievalResponse> {
       const response = await fetch("http://localhost:8000/api/v1/context/search", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(request),
       });
       return response.json();
     }
   }
   ```
   Dan memasangkannya ke Context Engine:
   ```typescript
   export const contextEngine = new ContextualAIEngine(new RealMember1ContextRetriever());
   ```
   Tidak ada kode frontend atau halaman bank soal yang perlu diubah.

---

## 4. PENANGANAN KASUS KHUSUS (EDGE CASES)

- **Data Wilayah Tidak Ditemukan:**  
  Jika pencarian di tingkat kecamatan kosong, adapter secara hierarkis memperluas pencarian ke tingkat kabupaten (`region_id: 35.02`). Jika tetap tidak ada entitas yang valid, sistem menandai variabel sebagai `locked` dan mempertahankan kata asli agar AI tidak melakukan halusinasi nama tempat/fakta.
- **Timeout & Resilience:**  
  Timeout pemanggilan disetel maksimal 3.000 ms. Jika service eksternal tidak merespons, sistem beralih ke cache lokal terverifikasi dengan memberikan catatan peringatan pada hasil validasi guru.
