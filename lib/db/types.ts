export type UserRole = "teacher" | "student";

export type QuestionSubject = "Matematika" | "Bahasa Indonesia" | "IPS";
export type QuestionType = "multiple_choice" | "essay";
export type QuestionDifficulty = "easy" | "medium" | "hard";
export type QuestionSource = "manual" | "ai_generated" | "scanned_image";

export type EntityCategory =
  | "geography"
  | "infrastructure"
  | "economy"
  | "transportation"
  | "social"
  | "culture";

export type VerificationStatus = "verified" | "teacher_provided" | "illustrative_demo";
export type ValidationStatus = "verified" | "needs_review" | "unvalidated";
export type ExamStatus = "draft" | "scheduled" | "ongoing" | "completed" | "results_published";
export type AttemptStatus = "in_progress" | "submitted" | "graded";

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  avatar_url?: string;
  phone_number?: string;
  school_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Region {
  id: string;
  province: string;
  regency: string;
  district: string;
  village?: string;
  geographical_summary?: string;
  economic_summary?: string;
  cultural_summary?: string;
  created_at: string;
}

export interface School {
  id: string;
  name: string;
  address?: string;
  province: string;
  regency: string;
  district: string;
  village?: string;
  region_id?: string;
  description?: string;
  local_characteristics?: string;
  created_at: string;
  updated_at: string;
}

export interface LocalKnowledgeItem {
  id: string;
  region_id: string;
  entity_category: EntityCategory;
  entity_name: string;
  description: string;
  source?: string;
  suitability_notes?: string;
  verification_status: VerificationStatus;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ClassRoom {
  id: string;
  teacher_id: string;
  school_id?: string;
  name: string;
  grade: number;
  subjects: QuestionSubject[];
  join_code: string;
  academic_year: string;
  is_active: boolean;
  member_count?: number;
  created_at: string;
  updated_at: string;
}

export interface ClassMembership {
  id: string;
  class_id: string;
  student_id: string;
  joined_at: string;
  status: "active" | "inactive";
  student_name?: string;
}

export interface ContextVariable {
  key: string;
  category: EntityCategory;
  original_value?: string;
  replaceable: boolean;
}

export interface MultipleChoiceOption {
  id: "A" | "B" | "C" | "D";
  text: string;
}

export interface Question {
  id: string;
  teacher_id: string;
  subject: QuestionSubject;
  grade: number;
  topic: string;
  learning_objective: string;
  question_type: QuestionType;
  difficulty: QuestionDifficulty;
  original_text: string;
  question_template?: string;
  context_variables: ContextVariable[];
  options?: MultipleChoiceOption[];
  correct_answer: string;
  explanation?: string;
  rubric?: string;
  is_approved: boolean;
  source: QuestionSource;
  created_at: string;
  updated_at: string;
}

export interface QuestionContextualization {
  id: string;
  question_id: string;
  region_id: string;
  contextualized_text: string;
  contextualized_options?: MultipleChoiceOption[];
  variable_replacements: Record<string, string>;
  validation_status: ValidationStatus;
  validation_notes?: string;
  teacher_edited: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface LearningMaterial {
  id: string;
  teacher_id: string;
  class_id?: string;
  region_id?: string;
  subject: QuestionSubject;
  grade: number;
  topic: string;
  learning_objectives: string;
  original_content: string;
  contextualized_content?: string;
  status: "draft" | "published";
  created_at: string;
  updated_at: string;
}

export interface Examination {
  id: string;
  teacher_id: string;
  class_id: string;
  class_name?: string;
  title: string;
  description?: string;
  subject: QuestionSubject;
  grade: number;
  duration_minutes: number;
  start_time: string;
  end_time: string;
  status: ExamStatus;
  show_results_immediately: boolean;
  allow_review: boolean;
  question_count?: number;
  questions?: Question[];
  created_at: string;
  updated_at: string;
}

export interface ExaminationAttempt {
  id: string;
  examination_id: string;
  student_id: string;
  student_name?: string;
  start_time: string;
  submit_time?: string;
  score?: number;
  status: AttemptStatus;
}

export interface StudentAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_option?: string;
  essay_answer?: string;
  is_correct?: boolean;
  score?: number;
  feedback?: string;
  evaluated_by_ai: boolean;
  reviewed_by_teacher: boolean;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  link?: string;
  type: "class" | "exam" | "material" | "grade" | "system";
  is_read: boolean;
  created_at: string;
}
