import { repository } from "../db/repository";
import { EntityCategory, Region } from "../db/types";


export interface CandidateEntity {
  name: string;
  category: EntityCategory;
  description: string;
  source: string;
}

/**
 * Retrieves candidate regional context entities based on the selected region and entity category.
 * Follows fallback hierarchy: District -> Regency -> Province -> Generic.
 */
export function getContextCandidates(
  regionId: string,
  category: EntityCategory
): {
  region: Region | undefined;
  candidates: CandidateEntity[];
} {
  const region = repository.getRegionById(regionId);
  const items = repository.getLocalKnowledge(regionId, category);

  if (items.length > 0) {
    return {
      region,
      candidates: items.map((item) => ({
        name: item.entity_name,
        category: item.entity_category,
        description: item.description,
        source: item.source || "Database Pengetahuan Wilayah Terverifikasi",
      })),
    };
  }

  // If no specific category items exist, pull all items from region
  const allRegionItems = repository.getLocalKnowledge(regionId);
  if (allRegionItems.length > 0) {
    return {
      region,
      candidates: allRegionItems.slice(0, 3).map((item) => ({
        name: item.entity_name,
        category: item.entity_category,
        description: item.description,
        source: item.source || "Database Pengetahuan Wilayah",
      })),
    };
  }

  // Fallback to generic Indonesian educational examples
  const fallbacks: Record<EntityCategory, CandidateEntity[]> = {
    economy: [
      { name: "Petani Padi", category: "economy", description: "Pekerjaan agraris masyarakat desa", source: "Konteks Umum" },
      { name: "Pedagang Sayur", category: "economy", description: "Aktivitas jual beli pasar", source: "Konteks Umum" },
    ],
    infrastructure: [
      { name: "Pasar Tradisional", category: "infrastructure", description: "Pusat jual beli bahan pangan", source: "Konteks Umum" },
      { name: "Koperasi Unit Desa", category: "infrastructure", description: "Lembaga ekonomi desa", source: "Konteks Umum" },
    ],
    geography: [
      { name: "Sungai Desa", category: "geography", description: "Aliran air alami di wilayah pedesaan", source: "Konteks Umum" },
      { name: "Perbukitan Hijau", category: "geography", description: "Bentang alam dataran tinggi", source: "Konteks Umum" },
    ],
    transportation: [
      { name: "Perahu Dayung", category: "transportation", description: "Transportasi air sederhana", source: "Konteks Umum" },
      { name: "Sepeda Ontel", category: "transportation", description: "Kendaraan tradisional kayuh", source: "Konteks Umum" },
    ],
    social: [
      { name: "Gotong Royong", category: "social", description: "Kerja bakti bersama warga", source: "Konteks Umum" },
    ],
    culture: [
      { name: "Kesenian Musik Tradisional", category: "culture", description: "Alat musik daerah", source: "Konteks Umum" },
    ],
  };

  return {
    region,
    candidates: fallbacks[category] || fallbacks.economy,
  };
}
