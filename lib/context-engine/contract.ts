/**
 * CONTEXTUALIZATION INVARIANT CONTRACT (Depaskan Context Engine)
 *
 * Defines explicit rules, slot categories, protected invariants, and
 * validation boundaries for elementary-school (SD) contextual adaptation.
 */

import { ContextCategory } from "./types";

/**
 * Explicitly supported contextual slots.
 * Only entities belonging to these categories with verified facts in LKB
 * may be substituted deterministically.
 */
export const SUPPORTED_CONTEXT_SLOTS: Record<
  ContextCategory,
  {
    label: string;
    description: string;
    patterns: string[];
  }
> = {
  commodity: {
    label: "Komoditas & Hasil Bumi",
    description: "Produk pertanian, perkebunan, dan peternakan lokal",
    patterns: [
      "beras",
      "padi",
      "jagung",
      "kedelai",
      "ubi",
      "singkong",
      "kopi",
      "teh",
      "susu",
      "susu sapi",
      "daging sapi",
      "ikan",
      "sayuran",
      "buah",
      "apel",
      "jeruk",
      "telur",
    ],
  },
  location: {
    label: "Lokasi & Tempat Perdagangan",
    description: "Pasar tradisional, sentra niaga, dan pusat kerajinan lokal",
    patterns: [
      "pasar kota",
      "pasar tradisional",
      "pasar induk",
      "pasar",
      "supermarket",
      "minimarket",
      "toko buah",
      "toko kelontong",
      "gudang pusat",
    ],
  },
  tradition: {
    label: "Kesenian & Tradisi Budaya",
    description: "Kesenian daerah, tarian tradisional, dan upacara adat lokal",
    patterns: [
      "kesenian tradisional",
      "kesenian daerah",
      "tari daerah",
      "tarian tradisional",
      "tari tradisional",
      "upacara adat",
      "festival budaya",
      "seni pertunjukan",
    ],
  },
  geography: {
    label: "Geografi & Bentang Alam",
    description: "Danau, sungai, pegunungan, dan bentang alam lokal",
    patterns: [
      "danau wisata",
      "danau alami",
      "danau",
      "pegunungan",
      "gunung",
      "sungai besar",
      "sungai",
      "pantai wisata",
      "pantai",
      "bukit",
      "waduk",
    ],
  },
  occupation: {
    label: "Profesi & Mata Pencaharian",
    description: "Pekerjaan masyarakat lokal yang relevan dengan lingkungan siswa SD",
    patterns: [
      "petani",
      "pedagang",
      "nelayan",
      "pengrajin",
      "peternak sapi",
      "peternak",
    ],
  },
  notable_figure: {
    label: "Tokoh & Pahlawan Daerah",
    description: "Tokoh perintis dan pahlawan daerah yang relevan dengan materi IPS SD",
    patterns: [
      "tokoh daerah",
      "pahlawan daerah",
      "pejuang lokal",
    ],
  },
};

/**
 * PROTECTED INVARIANTS
 * These tokens, units, operations, and linguistic structures must NEVER
 * be altered or replaced during contextualization.
 */
export const PROTECTED_INVARIANTS = {
  // Units of measurement in Indonesian SD Curriculum
  units: [
    "kg",
    "kilogram",
    "gram",
    "ons",
    "ton",
    "kuintal",
    "meter",
    "m",
    "cm",
    "centimeter",
    "km",
    "kilometer",
    "liter",
    "ml",
    "detik",
    "menit",
    "jam",
    "hari",
    "minggu",
    "bulan",
    "tahun",
    "rupiah",
    "rp",
    "butir",
    "lembar",
    "buah",
    "ekor",
    "batang",
    "kodi",
    "lusin",
    "rim",
  ],

  // Question interrogatives (Kata Tanya Pokok)
  interrogatives: [
    "berapa",
    "berapakah",
    "apakah",
    "apa",
    "siapakah",
    "siapa",
    "di manakah",
    "di mana",
    "ke mana",
    "bagaimanakah",
    "bagaimana",
    "mengapa",
    "kapan",
    "manakah",
  ],

  // Core mathematical operators and relations
  mathRelations: [
    "+",
    "-",
    "*",
    "×",
    "/",
    ":",
    "=",
    "%",
    "total",
    "jumlah",
    "selisih",
    "sisa",
    "kali",
    "dibagi",
    "ditambah",
    "dikurangi",
  ],
};

/**
 * Transformation provenance record representing a single, auditable change.
 */
export interface AuditedTransformation {
  slot_id: string;
  category: ContextCategory;
  original_term: string;
  replacement_term: string;
  start_index: number;
  end_index: number;
  reason: string;
  rule_applied: string;
  status: "VERIFIED" | "AMBIGUOUS_REJECTED" | "ESCALATED_TO_TEACHER";
  confidence_score: number; // 0 - 100
}

/**
 * Text Diff Chunk for clear visual change highlights in the teacher UI.
 */
export interface TextDiffChunk {
  type: "unchanged" | "substituted" | "preserved_math";
  text: string;
  originalText?: string;
  category?: string;
  reason?: string;
}

/**
 * Result of comprehensive independent validation.
 */
export interface InvariantValidationReport {
  is_valid: boolean;
  status: "VALID" | "WARNING" | "INVALID";
  math_invariant: {
    passed: boolean;
    original_numbers: number[];
    adapted_numbers: number[];
    missing_numbers: number[];
    arithmetic_valid: boolean;
    arithmetic_notes?: string;
  };
  answer_key_invariant: {
    passed: boolean;
    correct_key: string;
    key_exists_in_options: boolean;
    correct_option_text: string;
    options_distinct: boolean;
    notes?: string;
  };
  pedagogical_invariant: {
    passed: boolean;
    interrogative_preserved: boolean;
    length_ratio: number;
    grade_appropriate: boolean;
  };
  regional_invariant: {
    passed: boolean;
    target_region_id: string;
    target_region_name: string;
    grounded_entity_count: number;
    zero_leakage_passed: boolean;
  };
  warnings: string[];
  diagnostics: string[];
}
