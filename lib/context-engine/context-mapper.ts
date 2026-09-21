import { ContextVariableDetected } from "./types";
import { getContextCandidates } from "./knowledge-retriever";

export interface ContextMappingResult {
  contextualizedText: string;
  contextualizedOptions?: Array<{ id: "A" | "B" | "C" | "D"; text: string }>;
  replacements: Record<string, string>;
  notes: string[];
}

/**
 * Maps detected variables to local regional knowledge entities.
 * Handles deterministic template substitution and grammatical casing.
 */
export function mapContextToTemplate(
  templateOrText: string,
  variables: ContextVariableDetected[],
  regionId: string,
  manualOverrides?: Record<string, string>,
  options?: Array<{ id: "A" | "B" | "C" | "D"; text: string }>
): ContextMappingResult {
  const replacements: Record<string, string> = { ...manualOverrides };
  const notes: string[] = [];

  // Find candidate for each variable if not explicitly overridden
  for (const v of variables) {
    if (!replacements[v.key]) {
      const { candidates } = getContextCandidates(regionId, v.category);
      if (candidates.length > 0) {
        // Pick best matching entity for this category
        let picked = candidates[0].name;

        // Specific heuristic: if category is economy and key is COMMODITY, prefer commodity entries
        if (v.key.includes("COMMODITY")) {
          const comm = candidates.find((c) =>
            c.name.includes("Ikan") || c.name.includes("Salak") || c.name.includes("Batik") || c.name.includes("Beras")
          );
          if (comm) picked = comm.name;
        } else if (v.key.includes("OCCUPATION")) {
          const occ = candidates.find((c) =>
            c.name.includes("Nelayan") || c.name.includes("Petani") || c.name.includes("Perajin") || c.name.includes("Pedagang")
          );
          if (occ) picked = occ.name;
        }

        replacements[v.key] = picked;
        notes.push(`Variabel [${v.key}] dipetakan ke entitas lokal: "${picked}".`);
      } else {
        replacements[v.key] = v.original_value;
        notes.push(`Konteks lokal untuk [${v.key}] belum tersedia, menggunakan nilai standar.`);
      }
    }
  }

  let contextualizedText = templateOrText;

  // Perform substitutions
  for (const [key, replacement] of Object.entries(replacements)) {
    // Replace bracketed [KEY]
    const bracketRegex = new RegExp(`\\[${key}\\]`, "g");
    contextualizedText = contextualizedText.replace(bracketRegex, replacement);

    // If template didn't have brackets but original_value exists
    const matchingVar = variables.find((v) => v.key === key);
    if (matchingVar && matchingVar.original_value && !matchingVar.original_value.startsWith("[")) {
      const origRegex = new RegExp(`\\b${matchingVar.original_value}\\b`, "gi");
      contextualizedText = contextualizedText.replace(origRegex, replacement);
    }
  }

  // Update options if options reference the original commodity or place
  let contextualizedOptions = options ? [...options] : undefined;
  if (contextualizedOptions) {
    for (const [key, replacement] of Object.entries(replacements)) {
      const matchingVar = variables.find((v) => v.key === key);
      if (matchingVar && matchingVar.original_value) {
        contextualizedOptions = contextualizedOptions.map((opt) => ({
          ...opt,
          text: opt.text.replace(new RegExp(matchingVar.original_value, "gi"), replacement),
        }));
      }
    }
  }

  return {
    contextualizedText,
    contextualizedOptions,
    replacements,
    notes,
  };
}
