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

export interface MediaAsset {
  media_id: string;
  title: string;
  caption: string;
  alt_text: string;
  image_url: string;
  source_url: string;
  author: string;
  license_type: string;
  attribution_text: string;
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
  primary_media?: MediaAsset | null;
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
  primary_media?: MediaAsset | null;
}

export type ContentType = "material" | "question";
export type SourceInputType = "manual" | "pdf" | "image" | "camera" | "generate" | "ai" | "from_material";

export interface ContentInput {
  contentType: ContentType;
  sourceType: SourceInputType;
  rawText?: string;
  prompt?: string;
  title?: string;
  topic?: string;
  subject: string;
  grade: number;
  regionId: string;
  regionName: string;
  questionCount?: number;
  questionType?: "multiple_choice" | "essay" | "mixed";
  options?: { key: string; text: string }[];
  correctAnswer?: string;
  explanation?: string;
  structuredData?: Record<string, unknown> | any;
  metadata?: Record<string, unknown>;
}

export interface NormalizedContent {
  contentType: ContentType;
  sourceType: SourceInputType;
  effectiveText: string;
  title: string;
  topic: string;
  subject: string;
  grade: number;
  regionId: string;
  regionName: string;
  questionCount: number;
  questionType: "multiple_choice" | "essay" | "mixed";
  options?: { key: string; text: string }[];
  correctAnswer?: string;
  explanation?: string;
}

export interface QuestionDraftItem {
  id: string;
  original_question_text?: string;
  question_text: string;
  type: "multiple_choice" | "essay";
  options?: { key: string; text: string }[];
  correct_answer: string;
  explanation: string;
  rubric?: string;
  points: number;
  context_variables?: {
    original_term: string;
    replacement_term: string;
    category?: string;
    reason?: string;
  }[];
  validation: {
    is_valid: boolean;
    status: "VALID" | "WARNING" | "INVALID";
    competency_preserved: boolean;
    answer_key_preserved: boolean;
    math_numbers_strictly_preserved: boolean;
    local_context_grounded: boolean;
    warnings: string[];
    pedagogical_notes: string;
  };
}

export interface MaterialContextualizedResult {
  original_title: string;
  original_content: string;
  title: string;
  content: string;
  contextual_content?: string;
  summary: string;
  local_connection: string;
  context_variables: {
    original_term: string;
    replacement_term: string;
    category?: string;
    reason?: string;
  }[];
  local_entities?: any[];
  validation: {
    is_valid: boolean;
    competency_preserved: boolean;
    local_context_grounded: boolean;
    math_numbers_strictly_preserved: boolean;
    warnings: string[];
    pedagogical_notes: string;
  };
}

export interface UnifiedContextualizeResult {
  type: ContentType;
  material?: MaterialContextualizedResult;
  questions?: {
    topic: string;
    questions: QuestionDraftItem[];
    validation: {
      is_valid: boolean;
      status: "VALID" | "WARNING" | "INVALID";
      competency_preserved: boolean;
      answer_key_preserved: boolean;
      local_context_grounded: boolean;
      math_numbers_strictly_preserved: boolean;
      warnings: string[];
      pedagogical_notes: string;
    };
  };
  retrievedEntities: ContextCandidateEntity[];
  modelUsed?: string;
  requestId?: string;
}

