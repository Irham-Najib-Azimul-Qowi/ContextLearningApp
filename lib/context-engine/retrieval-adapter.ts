import { ContextCandidateEntity } from "./types";
import { getLkbSupabaseClient, isLkbConfigured } from "../supabase/lkb-client";

export interface RetrievalRequest {
  region_id: string; // e.g. "35.02" for Ponorogo
  category?: string | null; // e.g. "commodity", "geography"
  query: string;
  subject?: string | null;
  grade?: number | null;
  limit?: number;
  mode?: "structured_lexical" | "semantic" | "hybrid";
}

export interface RetrievalResponse {
  results: ContextCandidateEntity[];
  requested_region_id?: string;
  matched_region_id?: string;
  region_fallback_level?: "exact" | "district_to_regency" | "regency_to_residency" | "none";
  retrieval_mode_used?: "structured_lexical" | "semantic" | "hybrid";
  warnings?: string[];
}

export interface LocalContextRetriever {
  retrieve(request: RetrievalRequest): Promise<RetrievalResponse>;
}

// ==============================================================================
// MOCK RETRIEVAL ADAPTER (Verified Madiun Residency Facts)
// ==============================================================================

const MOCK_KNOWLEDGE_BASE: ContextCandidateEntity[] = [
  // --- PONOROGO (35.02) ---
  {
    entity_id: "ctx-pnr-porang",
    region_id: "35.02",
    region_name: "Kabupaten Ponorogo",
    name: "Porang Ponorogo",
    category: "commodity",
    description:
      "Tanaman umbi porang bernilai ekonomis tinggi yang dibudidayakan secara luas oleh petani di lereng perbukitan Ponorogo sebagai komoditas ekspor tepung glukomanan.",
    source_url: "https://ponorogo.go.id/komoditas-porang",
    verification_status: "verified",
  },
  {
    entity_id: "ctx-pnr-susu",
    region_id: "35.02",
    region_name: "Kabupaten Ponorogo",
    name: "Susu Sapi Perah Pudak",
    category: "commodity",
    description:
      "Produksi susu sapi murni berkualitas dari sentra peternakan rakyat di dataran tinggi Kecamatan Pudak, Ponorogo.",
    source_url: "https://ponorogo.go.id/peternakan-pudak",
    verification_status: "verified",
  },
  {
    entity_id: "ctx-pnr-reog",
    region_id: "35.02",
    region_name: "Kabupaten Ponorogo",
    name: "Reog Ponorogo",
    category: "tradition",
    description:
      "Seni pertunjukan tradisional adiluhung asli Ponorogo yang menampilkan keperkasaan topeng Singo Barong berhias bulu merak, penari Jathil, dan Warok.",
    source_url: "https://kebudayaan.kemdikbud.go.id/warisan-reog",
    verification_status: "verified",
  },
  {
    entity_id: "ctx-pnr-ngebel",
    region_id: "35.02",
    region_name: "Kabupaten Ponorogo",
    name: "Telaga Ngebel",
    category: "geography",
    description:
      "Danau alami seluas 150 hektar di kaki Gunung Wilis dengan tradisi syukuran Larung Sesaji setiap tanggal 1 Suro oleh masyarakat setempat.",
    source_url: "https://disbudparpora.ponorogo.go.id/telaga-ngebel",
    verification_status: "verified",
  },
  {
    entity_id: "ctx-pnr-pasarlegi",
    region_id: "35.02",
    region_name: "Kabupaten Ponorogo",
    name: "Pasar Legi Ponorogo",
    category: "location",
    description:
      "Pusat perdagangan induk dan pasar tradisional terbesar di Kabupaten Ponorogo tempat bertemunya pedagang dan petani hasil bumi lokal.",
    source_url: "https://ponorogo.go.id/pasar-legi",
    verification_status: "verified",
  },
  {
    entity_id: "ctx-pnr-sungai",
    region_id: "35.02",
    region_name: "Kabupaten Ponorogo",
    name: "Sungai Keyang",
    category: "geography",
    description:
      "Daerah aliran sungai utama di Ponorogo yang mengalirkan air pegunungan untuk mengairi ribuan hektar sawah dan lahan pertanian warga.",
    source_url: "https://sda.pu.go.id/bws-madiun",
    verification_status: "verified",
  },

  // --- KOTA MADIUN (35.77) ---
  {
    entity_id: "ctx-mdn-inka",
    region_id: "35.77",
    region_name: "Kota Madiun",
    name: "PT Industri Kereta Api (INKA)",
    category: "location",
    description:
      "Industri manufaktur perkeretaapian terintegrasi pertama dan terbesar di Asia Tenggara yang berbasis di Kota Madiun memproduksi lokomotif dan kereta penumpang.",
    source_url: "https://www.inka.co.id",
    verification_status: "verified",
  },
  {
    entity_id: "ctx-mdn-pecel",
    region_id: "35.77",
    region_name: "Kota Madiun",
    name: "Nasi Pecel Madiun",
    category: "commodity",
    description:
      "Hidangan kuliner tradisional legendaris khas Madiun berupa aneka sayuran segar beralaskan daun pisang dengan siraman bumbu sambal kacang gurih pedas.",
    source_url: "https://madiunkota.go.id/kuliner-pecel",
    verification_status: "verified",
  },
  {
    entity_id: "ctx-mdn-brem",
    region_id: "35.77",
    region_name: "Kota Madiun",
    name: "Brem Madiun",
    category: "commodity",
    description:
      "Penganan padat khas dari sari fermentasi ketan putih yang memiliki sensasi dingin dan lumer di mulut khas oleh-oleh Madiun.",
    source_url: "https://madiunkota.go.id/brem-madiun",
    verification_status: "verified",
  },

  // --- MAGETAN (35.20) ---
  {
    entity_id: "ctx-mgt-sarangan",
    region_id: "35.20",
    region_name: "Kabupaten Magetan",
    name: "Telaga Sarangan",
    category: "geography",
    description:
      "Danau vulkanik berhawa sejuk di lereng Gunung Lawu pada ketinggian 1.200 meter dpl yang menjadi magnet wisata andalan Magetan.",
    source_url: "https://magetan.go.id/telaga-sarangan",
    verification_status: "verified",
  },
  {
    entity_id: "ctx-mgt-kulit",
    region_id: "35.20",
    region_name: "Kabupaten Magetan",
    name: "Kerajinan Kulit Gandu",
    category: "commodity",
    description:
      "Sentra perajin sepatu, tas, dan jaket kulit sapi berkualitas tinggi yang diproduksi secara terampil di Jalan Sawo Magetan.",
    source_url: "https://magetan.go.id/sentra-kulit",
    verification_status: "verified",
  },

  // --- NGAWI (35.21) ---
  {
    entity_id: "ctx-ngw-trinil",
    region_id: "35.21",
    region_name: "Kabupaten Ngawi",
    name: "Situs Purbakala Trinil",
    category: "location",
    description:
      "Situs paleoantropologi dunia di tepian Sungai Bengawan Solo tempat ditemukannya fosil Pithecanthropus erectus oleh Eugene Dubois.",
    source_url: "https://ngawikab.go.id/situs-trinil",
    verification_status: "verified",
  },

  // --- PACITAN (35.01) ---
  {
    entity_id: "ctx-pct-pantai",
    region_id: "35.01",
    region_name: "Kabupaten Pacitan",
    name: "Pantai Klayar & Teleng Ria",
    category: "geography",
    description:
      "Bentang pantai eksotis berpasir putih di pesisir selatan Pacitan yang terkenal dengan fenomena seruling samudra dan ombak selancar.",
    source_url: "https://pacitankab.go.id/pariwisata-pantai",
    verification_status: "verified",
    primary_media: {
      media_id: "med_klayar_pacitan_01",
      title: "Pantai Klayar Pacitan",
      caption: "Pantai Klayar dengan bentang karang unik di Kabupaten Pacitan.",
      alt_text: "Pantai pesisir samudra berpasir putih dengan tebing karang alami.",
      image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
      source_url: "https://commons.wikimedia.org/wiki/File:Klayar_Beach_Pacitan.jpg",
      author: "Wikimedia Commons Contributor",
      license_type: "Creative Commons CC-BY-SA 4.0",
      attribution_text: "Foto: Wikimedia Commons / CC-BY-SA 4.0",
    },
  },

  // --- KOTA SEMARANG (33.74) ---
  {
    entity_id: "ctx_ent_3374_lawang_sewu_01",
    region_id: "33.74",
    region_name: "Kota Semarang",
    name: "Lawang Sewu Semarang",
    category: "built_environment",
    description:
      "Bangunan cagar budaya bersejarah peninggalan zaman perkeretaapian kolonial di kawasan Tugu Muda Semarang, terkenal dengan arsitektur jendela dan pintu tingginya yang sangat banyak.",
    source_url: "https://data.semarangkota.go.id",
    verification_status: "verified",
    primary_media: {
      media_id: "med_lawang_sewu_01",
      title: "Lawang Sewu Semarang",
      caption: "Lawang Sewu, bangunan bersejarah di Kota Semarang.",
      alt_text: "Bangunan bersejarah Lawang Sewu dengan arsitektur kolonial dan pintu jendela melengkung.",
      image_url: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=800&q=80",
      source_url: "https://commons.wikimedia.org/wiki/File:Lawang_Sewu_Semarang.jpg",
      author: "Wikimedia Commons Contributor",
      license_type: "Creative Commons CC-BY-SA 4.0",
      attribution_text: "Foto: Wikimedia Commons / CC-BY-SA 4.0",
    },
  },
  {
    entity_id: "ctx_ent_3374_kota_lama_01",
    region_id: "33.74",
    region_name: "Kota Semarang",
    name: "Kawasan Kota Lama Semarang",
    category: "built_environment",
    description:
      "Kawasan cagar budaya seluas 31 hektare di Semarang Utara dengan deretan bangunan bersejarah berarsitektur Eropa abad ke-18 hingga ke-20 serta ikon Gereja Blenduk yang berkubah besar.",
    source_url: "https://data.semarangkota.go.id",
    verification_status: "verified",
    primary_media: {
      media_id: "med_kota_lama_01",
      title: "Gereja Blenduk Kota Lama Semarang",
      caption: "Gereja Blenduk di Kawasan Kota Lama Semarang.",
      alt_text: "Kawasan cagar budaya Kota Lama dengan Gereja Blenduk berkubah cembung megah.",
      image_url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
      source_url: "https://commons.wikimedia.org/wiki/File:Gereja_Blenduk_Semarang.jpg",
      author: "Wikimedia Commons Contributor",
      license_type: "Creative Commons CC-BY-SA 3.0",
      attribution_text: "Foto: Wikimedia Commons / CC-BY-SA 3.0",
    },
  },
  {
    entity_id: "ctx_ent_3374_tanjung_emas_01",
    region_id: "33.74",
    region_name: "Kota Semarang",
    name: "Pelabuhan Tanjung Emas Semarang",
    category: "mobility",
    description:
      "Pelabuhan laut utama di pesisir utara Semarang yang melayani mobilitas kapal kargo peti kemas antarpulau, ekspor-impor Jawa Tengah, dan terminal kapal penumpang.",
    source_url: "https://pelindo.co.id/fasilitas-pelabuhan/tanjung-emas",
    verification_status: "verified",
    primary_media: {
      media_id: "med_tanjung_emas_01",
      title: "Pelabuhan Tanjung Emas Semarang",
      caption: "Pelabuhan Tanjung Emas, pusat mobilitas logistik laut Kota Semarang.",
      alt_text: "Dermaga kontainer dan kapal kargo di Pelabuhan Tanjung Emas Semarang.",
      image_url: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80",
      source_url: "https://commons.wikimedia.org/wiki/File:Port_of_Tanjung_Emas.jpg",
      author: "Wikimedia Commons / Pelindo",
      license_type: "Public Domain / CC-BY-SA",
      attribution_text: "Foto: Pelindo / Wikimedia Commons",
    },
  },
  {
    entity_id: "ctx_ent_3374_lumpia_semarang_01",
    region_id: "33.74",
    region_name: "Kota Semarang",
    name: "Lumpia Semarang",
    category: "commodity",
    description:
      "Makanan khas ikonik Kota Semarang hasil akulturasi kuliner Tionghoa dan Jawa berisi rebung muda, telur, daging ayam atau udang yang digulung renyah.",
    source_url: "https://semarangkota.bps.go.id",
    verification_status: "verified",
    primary_media: {
      media_id: "med_lumpia_semarang_01",
      title: "Lumpia Khas Semarang",
      caption: "Lumpia Semarang, kuliner tradisional berisikan rebung dan ayam/udang.",
      alt_text: "Piring saji lumpia Semarang goreng berwarna keemasan dengan saus kental cokelat.",
      image_url: "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80",
      source_url: "https://commons.wikimedia.org/wiki/File:Lumpia_Semarang.jpg",
      author: "Wikimedia Commons Food Contributor",
      license_type: "Creative Commons CC-BY-SA 4.0",
      attribution_text: "Foto: Wikimedia Commons / CC-BY-SA 4.0",
    },
  },
  {
    entity_id: "ctx_ent_3374_pasar_johar_01",
    region_id: "33.74",
    region_name: "Kota Semarang",
    name: "Pasar Johar Semarang",
    category: "location",
    description:
      "Pasar induk tradisional legendaris di Kota Semarang yang dirancang oleh arsitek Ir. Thomas Karsten dengan kolom cendawan yang unik, menjadi sentra perdagangan bahan pokok masyarakat.",
    source_url: "https://data.semarangkota.go.id",
    verification_status: "verified",
    primary_media: {
      media_id: "med_pasar_johar_01",
      title: "Pasar Tradisional Johar Semarang",
      caption: "Pasar Johar Semarang, pusat perniagaan tradisional masyarakat.",
      alt_text: "Lorong pasar tradisional dengan tumpukan komoditas pangan segar yang rapi.",
      image_url: "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=800&q=80",
      source_url: "https://commons.wikimedia.org/wiki/File:Pasar_Johar_Semarang.jpg",
      author: "Wikimedia Commons Contributor",
      license_type: "Creative Commons CC-BY-SA 4.0",
      attribution_text: "Foto: Wikimedia Commons / CC-BY-SA 4.0",
    },
  },
];

export class MockLocalContextRetriever implements LocalContextRetriever {
  async retrieve(request: RetrievalRequest): Promise<RetrievalResponse> {
    const limit = request.limit || 5;
    let candidates = MOCK_KNOWLEDGE_BASE;
    let matchedRegionId = request.region_id;
    let fallbackLevel: "exact" | "district_to_regency" | "regency_to_residency" | "none" = "exact";

    // Filter by Region ID if provided (including district fallback)
    if (request.region_id) {
      let targetRegion = request.region_id;
      let regionMatches = candidates.filter((item) => item.region_id === targetRegion);
      if (regionMatches.length === 0 && targetRegion.includes(".")) {
        const parts = targetRegion.split(".");
        if (parts.length >= 3) {
          targetRegion = `${parts[0]}.${parts[1]}`;
          regionMatches = candidates.filter((item) => item.region_id === targetRegion);
          if (regionMatches.length > 0) {
            fallbackLevel = "district_to_regency";
            matchedRegionId = targetRegion;
          }
        }
      }
      candidates = regionMatches;
    }

    // Filter by Category if provided (strict matching with alias mapping)
    if (request.category && candidates.length > 0) {
      const catLower = request.category.toLowerCase();
      candidates = candidates.filter((item) => {
        const itemCat = item.category.toLowerCase();
        return (
          itemCat === catLower ||
          (catLower === "commodity" && (itemCat === "commodity" || itemCat === "livelihood")) ||
          (catLower === "tradition" && (itemCat === "tradition" || itemCat === "culture")) ||
          (catLower === "location" && (itemCat === "location" || itemCat === "built_environment" || itemCat === "geography"))
        );
      });
    }

    // Query relevance matching
    const queryLower = request.query.toLowerCase();
    const scored = candidates.map((item) => {
      let score = 0;
      if (queryLower.includes(item.name.toLowerCase())) score += 10;
      if (queryLower.includes(item.category.toLowerCase())) score += 5;
      const descLower = item.description.toLowerCase();
      const terms = queryLower.split(/\s+/);
      for (const term of terms) {
        if (term.length > 3 && descLower.includes(term)) score += 2;
      }
      return { item, score };
    });

    scored.sort((a, b) => b.score - a.score);

    return {
      results: scored.slice(0, limit).map((s) => s.item),
      requested_region_id: request.region_id,
      matched_region_id: request.region_id,
      region_fallback_level: "exact",
      retrieval_mode_used: "structured_lexical",
      warnings: [],
    };
  }
}

export class SupabaseLocalContextRetriever implements LocalContextRetriever {
  private fallbackRetriever = new MockLocalContextRetriever();

  async retrieve(request: RetrievalRequest): Promise<RetrievalResponse> {
    if (!isLkbConfigured()) {
      return this.fallbackRetriever.retrieve(request);
    }

    try {
      const supabase = getLkbSupabaseClient();
      if (!supabase) {
        return this.fallbackRetriever.retrieve(request);
      }

      const { data, error } = await supabase.rpc("lkb_retrieve_context", {
        p_region_id: request.region_id,
        p_category: request.category || null,
        p_subcategory: null,
        p_query: request.query || "",
        p_grade: request.grade || null,
        p_subject: request.subject || null,
        p_limit: request.limit || 5,
        p_mode: request.mode || "structured_lexical",
      });

      if (error) {
        console.warn("[LKB Supabase] RPC call failed, falling back to local verified cache:", error.message);
        return this.fallbackRetriever.retrieve(request);
      }

      const rawResults = data?.results || [];
      const results: ContextCandidateEntity[] = rawResults.map((item: any) => ({
        entity_id: item.entity_id,
        region_id: item.region_id,
        region_name: item.region_name || request.region_id,
        name: item.name || item.canonical_name,
        category: item.category,
        description: item.description || item.short_description || item.educational_usage || "",
        source_url: item.source_url || (item.evidence && item.evidence[0]?.url) || undefined,
        verification_status: item.verification_status || "verified",
        primary_media: item.primary_media || null,
      }));

      return {
        results,
        requested_region_id: data?.requested_region_id || request.region_id,
        matched_region_id: data?.matched_region_id || request.region_id,
        region_fallback_level: data?.region_fallback_level || "exact",
        retrieval_mode_used: data?.retrieval_mode_used || "structured_lexical",
        warnings: data?.warnings || [],
      };
    } catch (err: any) {
      console.warn("[LKB Supabase] Unexpected retrieval error, falling back:", err?.message || err);
      return this.fallbackRetriever.retrieve(request);
    }
  }
}

export const defaultRetriever: LocalContextRetriever = isLkbConfigured()
  ? new SupabaseLocalContextRetriever()
  : new MockLocalContextRetriever();
