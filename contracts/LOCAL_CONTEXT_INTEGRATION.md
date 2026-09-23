# Panduan Integrasi Local Knowledge Base (LKB) — Pahami V2

> **Untuk Anggota 2 (Full-Stack & AI Engineer)**  
> **Dari:** Anggota 1 (Data & RAG Engineer)  
> **Status Kontrak:** `STABIL & TERVALIDASI`

Dokumen ini adalah acuan integrasi untuk menghubungkan antarmuka backend Next.js (Contextualization Engine / Gemini Question Generator) ke basis data pengetahuan lokal (*Local Knowledge Base* / LKB) Karesidenan Madiun di Supabase PostgreSQL.

---

## 1. Arsitektur Retrieval: Zero-Python-Server di Produksi

Untuk memastikan keandalan, kesederhanaan deployment, dan latensi rendah (< 50ms):
- **Tidak ada server Python yang perlu terus berjalan di produksi.**
- Retrieval berjalan melalui Stored Procedure PostgreSQL Supabase: `lkb_retrieve_context`.
- Mode default adalah **`structured_lexical`** (pencarian terstruktur berdasarkan kode wilayah resmi + kategori + pencarian kata kunci leksikal berbobot).
- Hanya data dengan `verification_status = 'verified'` yang dikembalikan ke Contextualization Engine.

---

## 2. Definisi Tipe TypeScript (Client / Server Action)

Salin interface berikut ke dalam codebase Next.js (misal di `lib/types/lkb.ts` atau `contracts/types.ts`):

```typescript
export type LkbCategory =
  | 'geography'
  | 'built_environment'
  | 'livelihood'
  | 'mobility'
  | 'community'
  | 'culture'
  | 'nature_environment'
  | 'administratif';

export type LkbSubject = 'matematika' | 'bahasa_indonesia' | 'ips';

export interface LkbEvidence {
  source_id: string;
  url: string;
  claim: string;
  license_note?: string;
}

export interface LkbQuantitativeConstraints {
  typical_units?: string;
  min_val?: number;
  max_val?: number;
}

export interface LkbEntity {
  entity_id: string;
  name: string;
  category: LkbCategory;
  subcategory: string;
  region_id: string;
  educational_usage: string;
  quantitative_constraints?: LkbQuantitativeConstraints;
  evidence: LkbEvidence[];
  verification_status: 'verified' | 'in_review' | 'draft';
}

export interface LkbRetrievalRequest {
  region_id: string; // e.g. "35.77"
  category?: LkbCategory | null;
  subcategory?: string | null;
  query: string;
  grade?: number | null; // 1 - 6
  subject?: LkbSubject | null;
  limit?: number; // default: 5, max: 20
  mode?: 'structured_lexical' | 'semantic' | 'hybrid'; // default: 'structured_lexical'
}

export interface LkbRetrievalResponse {
  requested_region_id: string;
  matched_region_id: string;
  region_fallback_level: 'exact' | 'district_to_regency' | 'regency_to_residency' | 'none';
  retrieval_mode_used: 'structured_lexical' | 'semantic' | 'hybrid';
  results: LkbEntity[];
  warnings: string[];
}
```

---

## 3. Contoh Pemanggilan via Supabase Client di Next.js

Gunakan RPC `lkb_retrieve_context` langsung dari Server Action atau Route Handler:

```typescript
import { createClient } from '@/lib/supabase/server'; // atau client supabase yang sudah ada
import { LkbRetrievalRequest, LkbRetrievalResponse } from '@/contracts/types';

export async function retrieveLocalContext(params: LkbRetrievalRequest): Promise<LkbRetrievalResponse> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('lkb_retrieve_context', {
    p_region_id: params.region_id,
    p_category: params.category ?? null,
    p_subcategory: params.subcategory ?? null,
    p_query: params.query,
    p_grade: params.grade ?? null,
    p_subject: params.subject ?? null,
    p_limit: params.limit ?? 5,
    p_mode: params.mode ?? 'structured_lexical'
  });

  if (error) {
    console.error('LKB Retrieval Error:', error);
    // Kembalikan empty state yang aman tanpa membuat crash pipeline pembuatan soal
    return {
      requested_region_id: params.region_id,
      matched_region_id: params.region_id,
      region_fallback_level: 'none',
      retrieval_mode_used: 'structured_lexical',
      results: [],
      warnings: [`LKB RPC Error: ${error.message}`]
    };
  }

  return data as LkbRetrievalResponse;
}
```

---

## 4. Format Prompt Injeksi ke Gemini LLM

Ketika entitas ditemukan, sertakan fakta terverifikasi dan batasan angka ke dalam prompt sistem:

```text
Gunakan konteks lokal terverifikasi berikut untuk mengontekstualisasikan soal:
- Nama Tempat/Komoditas: {entity.name} ({entity.category})
- Wilayah: {entity.region_id} (Karesidenan Madiun)
- Keterangan Pedagogis: {entity.educational_usage}
- Batasan Kuantitatif Realistis: {entity.quantitative_constraints}
- Fakta Terverifikasi: {entity.evidence[0].claim}

Instruksi Pedagogis:
1. Pastikan angka matematika tetap deterministik dan masuk akal sesuai batasan kuantitatif.
2. Jangan mengarang fakta geografis yang bertentangan dengan bukti di atas.
3. Sebutkan nama tempat atau komoditas lokal secara natural dalam narasi soal.
```

---

## 5. Penanganan State Kosong & Fallback Wilayah

1. **Jika `results` kosong (`[]`):**
   - RPC sudah menangani fallback internal jika diminta kode kecamatan (misal `35.77.01` akan fallback ke `35.77` Kota Madiun dengan `region_fallback_level: "district_to_regency"`).
   - Jika tetap kosong, Contextualization Engine **dilarang memaksakan konteks fiktif**. Cukup gunakan soal standar kurikulum nasional tanpa substitusi lokal yang salah.
2. **Peringatan Semantik:**
   - Jika mengirimkan `mode: "semantic"`, bila query embedding runtime belum diaktifkan di server Next.js, RPC secara otomatis memproses via `structured_lexical` dan menyematkan catatan pada array `warnings`.
