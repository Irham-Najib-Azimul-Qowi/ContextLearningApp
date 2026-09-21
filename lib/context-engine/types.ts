import { EntityCategory, QuestionSubject, ValidationStatus } from "../db/types";

export interface ContextVariableDetected {
  key: string;
  category: EntityCategory;
  original_value: string;
  suggested_replacement?: string;
  replaceable: boolean;
  confidence?: number;
}

export interface ContextualizationRequest {
  subject: QuestionSubject;
  grade: number;
  original_text: string;
  question_template?: string;
  context_variables: ContextVariableDetected[];
  options?: Array<{ id: "A" | "B" | "C" | "D"; text: string }>;
  correct_answer: string;
  region_id: string;
}

export interface ValidationReport {
  status: ValidationStatus;
  is_valid: boolean;
  subject: QuestionSubject;
  notes: string[];
  recalculated_answer?: string;
}

export interface ContextualizationResult {
  original_text: string;
  contextualized_text: string;
  options?: Array<{ id: "A" | "B" | "C" | "D"; text: string }>;
  variable_replacements: Record<string, string>;
  validation: ValidationReport;
  region_name: string;
}
