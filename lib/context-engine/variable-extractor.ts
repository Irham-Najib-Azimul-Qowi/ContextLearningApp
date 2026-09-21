import { ContextVariableDetected } from "./types";
import { EntityCategory } from "../db/types";

// Common contextual dictionaries for Indonesian elementary questions
const KNOWN_ENTITIES: Record<EntityCategory, string[]> = {
  economy: [
    "pedagang",
    "petani",
    "nelayan",
    "peternak",
    "penjual",
    "perajin",
    "beras",
    "jagung",
    "gula",
    "ikan",
    "buah",
    "sayur",
    "salak",
    "kain",
  ],
  infrastructure: [
    "pasar",
    "pasar kota",
    "toko",
    "warung",
    "dermaga",
    "stasiun",
    "terminal",
    "pelabuhan",
    "jembatan",
    "sekolah",
    "gedung",
  ],
  geography: [
    "sungai",
    "danau",
    "gunung",
    "laut",
    "pantai",
    "lereng",
    "sawah",
    "lembah",
    "kebun",
    "hutan",
  ],
  transportation: [
    "perahu",
    "kapal",
    "perahu kayu",
    "bus",
    "kereta",
    "sepeda",
    "mobil",
    "andong",
    "angkot",
  ],
  social: [
    "gotong royong",
    "kerja bakti",
    "ronda",
    "musyawarah",
    "sambatan",
    "warga",
    "penduduk",
  ],
  culture: [
    "tari",
    "kain tenun",
    "batik",
    "upacara adat",
    "festival",
    "gamelan",
    "lagu daerah",
  ],
};

/**
 * Extracts contextual variables from a question text.
 * Differentiates replaceable variables from protected educational content.
 */
export function extractContextVariables(text: string): {
  detected: ContextVariableDetected[];
  template: string;
} {
  const detected: ContextVariableDetected[] = [];
  let template = text;

  // 1. Check for explicit bracketed variables like [OCCUPATION], [COMMODITY], etc.
  const bracketRegex = /\[([A-Z_]+)\]/g;
  let match: RegExpExecArray | null;
  const foundKeys = new Set<string>();

  while ((match = bracketRegex.exec(text)) !== null) {
    const key = match[1];
    if (!foundKeys.has(key)) {
      foundKeys.add(key);
      let category: EntityCategory = "economy";
      if (key.includes("MARKET") || key.includes("INFRASTRUCTURE") || key.includes("LANDMARK")) {
        category = "infrastructure";
      } else if (key.includes("GEO") || key.includes("RIVER") || key.includes("MOUNTAIN")) {
        category = "geography";
      } else if (key.includes("TRANSPORT")) {
        category = "transportation";
      } else if (key.includes("CULTURE")) {
        category = "culture";
      } else if (key.includes("SOCIAL") || key.includes("NAME")) {
        category = "social";
      }

      detected.push({
        key,
        category,
        original_value: `[${key}]`,
        replaceable: true,
        confidence: 1.0,
      });
    }
  }

  // If explicit brackets already exist, return them
  if (detected.length > 0) {
    return { detected, template };
  }

  // 2. Rule-based entity extraction from text
  // Match occupations and commodities
  const lower = text.toLowerCase();

  // Pattern: "Seorang [occupation]"
  const occupationMatch = lower.match(/(?:seorang|para|sekelompok)\s+([a-z\s]+?)(?=\s+(?:memiliki|membeli|menjual|pergi|berangkat|memetik|membawa))/i);
  if (occupationMatch) {
    const orig = occupationMatch[1].trim();
    const key = "OCCUPATION";
    detected.push({
      key,
      category: "economy",
      original_value: orig,
      replaceable: true,
      confidence: 0.9,
    });
    template = template.replace(new RegExp(orig, "gi"), `[${key}]`);
  }

  // Pattern: "kg [commodity]" or "[number] kg [commodity]"
  const commodityMatch = lower.match(/\b\d+\s*(?:kg|kilogram|keranjang|kantong|buah)\s+([a-z\s]+?)(?=\.|\,|\s+sebanyak|\s+dijual|\s+dibeli|\s+dibagikan)/i);
  if (commodityMatch) {
    const orig = commodityMatch[1].trim();
    if (orig && !["dari", "yang", "dan", "untuk"].includes(orig)) {
      const key = "COMMODITY";
      detected.push({
        key,
        category: "economy",
        original_value: orig,
        replaceable: true,
        confidence: 0.88,
      });
      template = template.replace(new RegExp(orig, "gi"), `[${key}]`);
    }
  }

  // Pattern: "di [market/place]"
  const placeMatch = lower.match(/(?:di|menuju|ke)\s+(pasar\s+[a-z]+|pelabuhan\s+[a-z]+|sungai\s+[a-z]+|dermaga|toko\s+[a-z]+)/i);
  if (placeMatch) {
    const orig = placeMatch[1].trim();
    const key = orig.includes("sungai") ? "LANDMARK" : "MARKET";
    const category: EntityCategory = orig.includes("sungai") ? "geography" : "infrastructure";
    detected.push({
      key,
      category,
      original_value: orig,
      replaceable: true,
      confidence: 0.85,
    });
    template = template.replace(new RegExp(orig, "gi"), `[${key}]`);
  }

  // Pattern: "menggunakan [transportation]"
  const transportMatch = lower.match(/(?:menggunakan|mengendarai|naik)\s+([a-z\s]+?)(?=\s+menuju|\s+ke|\s+untuk|\.|\,)/i);
  if (transportMatch) {
    const orig = transportMatch[1].trim();
    const key = "TRANSPORTATION";
    detected.push({
      key,
      category: "transportation",
      original_value: orig,
      replaceable: true,
      confidence: 0.87,
    });
    template = template.replace(new RegExp(orig, "gi"), `[${key}]`);
  }

  return { detected, template };
}
