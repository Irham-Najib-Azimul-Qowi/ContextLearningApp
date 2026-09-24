# PANDUAN INTEGRASI RETRIEVAL KE NEXT.JS & VERCEL — PAHAMI V2

Panduan ini ditujukan bagi pengembang PAHAMI V2 untuk menghubungkan antarmuka aplikasi Next.js (Contextual AI Engine, Gemini Generator, Bank Soal) dengan *Local Knowledge Base* (LKB) di Supabase PostgreSQL.

---

## 1. IKHTISAR TEKNIS INTEGRASI

Integrasi antara modul data Anggota 1 dan aplikasi web Anggota 2 kini sepenuhnya menggunakan Stored Procedure (RPC) PostgreSQL:
- **Nama Fungsi RPC:** `lkb_retrieve_context`
- **Adapter TypeScript:** `SupabaseLocalContextRetriever` di [`lib/context-engine/retrieval-adapter.ts`](file:///x:/folder_website/contextlearning/lib/context-engine/retrieval-adapter.ts)
- **Klien Universal:** [`lib/supabase/lkb-client.ts`](file:///x:/folder_website/contextlearning/lib/supabase/lkb-client.ts) (mendukung Server Component, Route Handler, dan Client Component).
- **Mekanisme Ketahanan (Resilience):** Jika kredensial Supabase belum terkonfigurasi pada lingkungan lokal pengembang, sistem secara otomatis beralih ke cache data terverifikasi (`MockLocalContextRetriever`) tanpa membuat aplikasi berhenti berfungsi (*graceful fallback*).

---

## 2. KONTRAK INTERFACE DAN TIPE DATA TYPESCRIPT

Tipe data berikut sudah didefinisikan secara kompatibel di [`lib/context-engine/retrieval-adapter.ts`](file:///x:/folder_website/contextlearning/lib/context-engine/retrieval-adapter.ts) dan [`lib/context-engine/types.ts`](file:///x:/folder_website/contextlearning/lib/context-engine/types.ts):

```typescript
export interface RetrievalRequest {
  region_id: string; // Kode Kemendagri, e.g. "35.02" untuk Ponorogo, "35.77" untuk Kota Madiun
  category?: string | null; // e.g. "commodity", "tradition", "geography", "location", "livelihood"
  query: string; // Kata kunci atau teks variabel soal asli
  subject?: string | null; // "Matematika", "Bahasa Indonesia", "IPS"
  grade?: number | null; // Jenjang SD 1 - 6
  limit?: number; // Default: 5, Max: 20
  mode?: "structured_lexical" | "semantic" | "hybrid"; // Default: "structured_lexical"
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
  requested_region_id?: string;
  matched_region_id?: string;
  region_fallback_level?: "exact" | "district_to_regency" | "regency_to_residency" | "none";
  retrieval_mode_used?: "structured_lexical" | "semantic" | "hybrid";
  warnings?: string[];
}
```

---

## 3. CONTOH PEMANGGILAN DALAM KODE NEXT.JS

### 3.1 Pemanggilan Otomatis Melalui ContextualAIEngine (Default)
Contextual AI Engine secara default sudah dipasangi `defaultRetriever` yang terhubung ke Supabase:

```typescript
import { contextEngine } from "@/lib/context-engine/pipeline";

// Eksekusi kontekstualisasi otomatis untuk soal
const result = await contextEngine.executePipeline({
  questionText: "Pak Budi memanen 20 kg beras di sawah. Berapa kilogram hasil panen jika ada 5 karung?",
  subject: "Matematika",
  grade: 5,
  regionId: "35.02", // Kabupaten Ponorogo
  regionName: "Kabupaten Ponorogo",
  explanation: "Operasi perkalian berat komoditas lokal."
});

console.log("Soal Kontekstual:", result.contextualized_text);
// Hasil: "Pak Budi memanen 20 kg porang di lereng perbukitan Ponorogo..."
```

### 3.2 Pemanggilan Manual Langsung ke Retriever
Jika ingin mengambil daftar entitas lokal langsung (misalnya untuk autokomplet input guru):

```typescript
import { defaultRetriever } from "@/lib/context-engine/retrieval-adapter";

export async function fetchLocalCommodities(regionId: string) {
  const response = await defaultRetriever.retrieve({
    region_id: regionId,
    category: "commodity",
    query: "hasil panen perkebunan",
    limit: 5,
  });

  return response.results;
}
```

### 3.3 Pemanggilan Langsung ke Supabase RPC di Route Handler
Jika membuat API endpoint kustom di `app/api/context/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { getLkbSupabaseClient } from "@/lib/supabase/lkb-client";

export async function POST(req: Request) {
  const body = await req.json();
  const supabase = getLkbSupabaseClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const { data, error } = await supabase.rpc("lkb_retrieve_context", {
    p_region_id: body.region_id,
    p_category: body.category || null,
    p_query: body.query || "",
    p_grade: body.grade || null,
    p_subject: body.subject || null,
    p_limit: body.limit || 5,
    p_mode: "structured_lexical"
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}
```

---

## 4. PENANGANAN STATE DAN FALLBACK WILAYAH

1. **Kode Kecamatan (`35.xx.xx`):**
   - Jika pengguna memilih kecamatan (misalnya `35.77.01` Kartoharjo), sistem mencari entitas spesifik kecamatan tersebut terlebih dahulu.
   - Jika belum ada entitas di tingkat kecamatan, sistem secara otomatis melakukan fallback ke tingkat kota/kabupaten (`35.77` Kota Madiun) dengan status:  
     `region_fallback_level: "district_to_regency"`.
2. **Kecamatan Fiktif atau Wilayah di Luar Cakupan:**
   - Jika kode kecamatan tidak terdaftar di basis data (misal `35.77.99`), sistem **tidak akan membocorkan data wilayah lain**.
   - Sistem mengembalikan `results: []` dengan `region_fallback_level: "none"` dan pesan peringatan pada array `warnings`.
3. **Hasil Kosong (*Zero Results*):**
   - Jika tidak ada entitas terverifikasi yang cocok dengan filter, Contextual AI Engine **tidak mengarang entitas fiktif**, melainkan mempertahankan kata asli dalam soal dan menandai variabel sebagai `locked`.

---

## 5. CARA MENGUJI INTEGRASI

Jalankan pengujian terpadu melalui terminal:

```bash
# 1. Menjalankan seluruh test suite unit & integrasi
npm run test

# 2. Menjalankan production build Vercel
npm run build
```

Semua 21 kasus uji teruji secara otomatis, termasuk validasi isolasi wilayah, fallback kecamatan, dan ketahanan terhadap state database unconfigured.
