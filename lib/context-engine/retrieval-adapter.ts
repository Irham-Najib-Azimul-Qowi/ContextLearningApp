import { ContextCandidateEntity } from "./types";

export interface RetrievalRequest {
  region_id: string; // e.g. "35.02" for Ponorogo
  category?: string | null; // e.g. "commodity", "geography"
  query: string;
  subject?: string | null;
  grade?: number | null;
  limit?: number;
}

export interface RetrievalResponse {
  results: ContextCandidateEntity[];
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
  },
];

export class MockLocalContextRetriever implements LocalContextRetriever {
  async retrieve(request: RetrievalRequest): Promise<RetrievalResponse> {
    const limit = request.limit || 5;
    let candidates = MOCK_KNOWLEDGE_BASE;

    // Filter by Region ID if provided
    if (request.region_id) {
      const regionMatches = candidates.filter((item) => item.region_id === request.region_id);
      if (regionMatches.length > 0) {
        candidates = regionMatches;
      }
    }

    // Filter by Category if provided
    if (request.category) {
      const catMatches = candidates.filter(
        (item) => item.category.toLowerCase() === request.category?.toLowerCase()
      );
      if (catMatches.length > 0) {
        candidates = catMatches;
      }
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
    };
  }
}

export const defaultRetriever: LocalContextRetriever = new MockLocalContextRetriever();
