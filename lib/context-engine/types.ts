export type ContextCategory =
  | "commodity"
  | "occupation"
  | "location"
  | "tradition"
  | "geography"
  | "notable_figure";

export interface ContextVariable {
  id: string;
  text: string;
  category: ContextCategory;
  replaceable: boolean;
  reason: string;
  original_value: string;
  candidate_replacement?: string;
  validation_status: "verified" | "needs_review" | "locked";
  region_id?: string;
  region_name?: string;
}

export interface QuestionUnderstanding {
  subject: "Matematika" | "Bahasa Indonesia" | "IPS";
  grade: number; // 1-6 SD
  topic: string;
  math_quantities: number[];
  math_operators: string[];
  key_concepts: string[];
  original_answer: string;
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

export interface ContextMapping {
  variable_id: string;
  original_term: string;
  matched_entity: ContextCandidateEntity;
  educational_fit_score: number; // 0-100
  pedagogical_justification: string;
}

export interface EducationalValidationResult {
  is_valid: boolean;
  math_numbers_strictly_preserved: boolean;
  math_subtraction_addition_correct: boolean;
  correct_answer_preserved: boolean;
  warnings: string[];
  pedagogical_notes: string;
}

export interface ContextualizationPipelineResult {
  original_text: string;
  contextualized_text: string;
  subject: string;
  grade: number;
  region_id: string;
  region_name: string;
  variables: ContextVariable[];
  mappings: ContextMapping[];
  validation: EducationalValidationResult;
  updated_options?: { key: string; text: string }[];
  updated_explanation: string;
}
