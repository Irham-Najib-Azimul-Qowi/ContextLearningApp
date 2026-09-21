import { extractContextVariables } from "./variable-extractor";
import { mapContextToTemplate } from "./context-mapper";
import { validateContextualization } from "./educational-validator";
import { ContextualizationRequest, ContextualizationResult } from "./types";
import { repository } from "../db/repository";

export * from "./types";
export * from "./variable-extractor";
export * from "./knowledge-retriever";
export * from "./context-mapper";
export * from "./educational-validator";

/**
 * Executes the complete Contextual Engine pipeline for a question.
 */
export function executeContextualization(
  req: ContextualizationRequest,
  manualOverrides?: Record<string, string>
): ContextualizationResult {
  const region = repository.getRegionById(req.region_id);
  const regionName = region
    ? `${region.regency}, ${region.province}`
    : "Wilayah Belum Dipilih";

  // 1. Variable extraction if not already present
  let variables = req.context_variables;
  let template = req.question_template || req.original_text;

  if (!variables || variables.length === 0) {
    const extracted = extractContextVariables(req.original_text);
    variables = extracted.detected;
    template = extracted.template;
  }

  // 2. Mapping to regional entities
  const mapped = mapContextToTemplate(
    template,
    variables,
    req.region_id,
    manualOverrides,
    req.options
  );

  // 3. Educational validation
  const validation = validateContextualization(
    req.subject,
    req.original_text,
    mapped.contextualizedText,
    mapped.contextualizedOptions,
    req.correct_answer
  );

  return {
    original_text: req.original_text,
    contextualized_text: mapped.contextualizedText,
    options: mapped.contextualizedOptions,
    variable_replacements: mapped.replacements,
    validation,
    region_name: regionName,
  };
}
