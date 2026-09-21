export type UserRole = "platform_admin" | "teacher" | "student";

export type EducationLevel = "SD" | "SMP" | "SMA";
export type SchoolVerificationStatus = "pending_verification" | "verified" | "rejected";
export type SchoolStatus = "active" | "suspended";

export type MembershipRole = "teacher" | "school_coordinator";
export type MembershipStatus = "active" | "pending" | "rejected";

export type QuestionSubject = "Matematika" | "Bahasa Indonesia" | "IPS" | "IPA" | "Bahasa Inggris";
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
  email?: string;
  student_code?: string;
  teacher_code?: string;
  avatar_url?: string;
  phone_number?: string;
  school_id?: string;
  active_school_id?: string;
  grade?: number;
  class_id?: string;
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
  code: string; // Human-readable e.g. SCH-001
  slug: string; // URL-safe identifier e.g. sd-001-samarinda
  name: string;
  educational_level: EducationLevel;
  npsn?: string;
  address?: string;
  province: string;
  regency: string;
  district: string;
  village?: string;
  latitude?: number;
  longitude?: number;
  region_id?: string;
  description?: string;
  local_characteristics?: string;
  verification_status: SchoolVerificationStatus;
  status: SchoolStatus;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface SchoolMembership {
  id: string;
  school_id: string;
  user_id: string;
  role: MembershipRole;
  status: MembershipStatus;
  joined_at: string;
  created_at: string;
  school_name?: string;
  school_slug?: string;
  school_code?: string;
  educational_level?: EducationLevel;
}

export interface SchoolInvitation {
  id: string;
  school_id: string;
  invitation_code: string;
  email?: string;
  role: MembershipRole;
  created_by: string;
  expires_at: string;
  is_used: boolean;
  created_at: string;
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
  school_id: string;
  name: string;
  grade: number;
  educational_level?: EducationLevel;
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
  school_id?: string;
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
  school_id?: string;
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
  school_id?: string;
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
  submission_source?: "online" | "scanned";
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

export interface ScannedAnswerSheet {
  id: string;
  school_id: string;
  examination_id: string;
  student_id: string;
  student_name?: string;
  student_code?: string;
  image_url: string;
  detected_answers: Record<string, string>;
  uncertain_answers: string[];
  status: "scanned" | "confirmed" | "graded";
  score?: number;
  submission_source: "scanned";
  created_at: string;
}

export type AICredentialStatus = "active" | "disabled" | "rate_limited" | "quota_exhausted";
export type AICredentialHealth = "healthy" | "degraded" | "failing";

export interface AICredential {
  id: string;
  label: string;
  api_key_masked: string;
  encrypted_key?: string;
  project_id?: string;
  supported_models: string[];
  status: AICredentialStatus;
  priority: number;
  weight: number;
  daily_request_count: number;
  total_tokens_used: number;
  last_used_at?: string;
  health_status: AICredentialHealth;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface AIUsageLog {
  id: string;
  request_id: string;
  school_id?: string;
  user_id: string;
  operation_type: "question_generation" | "contextualization" | "multimodal_extraction" | "material_generation";
  model: string;
  credential_id: string;
  project_id?: string;
  input_tokens: number;
  output_tokens: number;
  duration_ms: number;
  success: boolean;
  error_category?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  actor_name: string;
  actor_role: UserRole;
  action: string;
  resource_type: string;
  resource_id?: string;
  school_id?: string;
  details: Record<string, any>;
  created_at: string;
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
