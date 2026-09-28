export type UserRole = "TEACHER" | "STUDENT";

export interface School {
  id: string;
  name: string;
  slug: string;
  region_id: string; // e.g. "35.02" for Ponorogo, "35.77" for Kota Madiun
  region_name: string;
  address: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  school_id: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  grade: number; // 1-6 SD
  school_id: string;
  teacher_id: string;
  teacher_name: string;
  subject: string;
  code: string; // Invite code, e.g. "PNR-5A"
  student_count: number;
  academic_year: string;
  created_at: string;
}

export interface ClassMembership {
  id: string;
  class_id: string;
  student_id: string;
  student_name: string;
  joined_at: string;
}

export interface QuestionOption {
  key: string; // "A", "B", "C", "D"
  text: string;
}

export interface QuestionContextVariable {
  text: string;
  category: string; // "commodity", "geography", "tradition", "location"
  original_value: string;
  replacement_value: string;
  region_id: string;
  region_name: string;
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

export interface QuestionItem {
  id: string;
  type: "multiple_choice" | "essay";
  question_text: string;
  options?: QuestionOption[];
  correct_answer?: string;
  explanation?: string;
  rubric?: string; // For essay questions
  image_url?: string;
  image_caption?: string;
  image_attribution?: string;
  image_alt?: string;
  media_asset?: MediaAsset;
}

export interface Question {
  id: string;
  school_id: string;
  teacher_id: string;
  subject: "Matematika" | "Bahasa Indonesia" | "IPS";
  grade: number; // 1-6 SD
  topic: string;
  type: "multiple_choice" | "essay" | "mixed";
  question_text: string;
  options?: QuestionOption[];
  correct_answer: string;
  explanation: string;
  rubric?: string; // For essay questions
  items?: QuestionItem[]; // Multiple sub-questions (pilgan, essay, or combination)
  is_contextualized: boolean;
  original_question_text?: string;
  context_variables?: QuestionContextVariable[];
  image_url?: string;
  image_caption?: string;
  image_attribution?: string;
  image_alt?: string;
  media_asset?: MediaAsset;
  version?: number;
  is_archived?: boolean;
  archived_at?: string;
  created_at: string;
}

export function getQuestionItems(q: Question): QuestionItem[] {
  if (Array.isArray(q.items) && q.items.length > 0) {
    return q.items.map((it, idx) => ({
      ...it,
      id: it.id || `${q.id}-item-${idx + 1}`,
    }));
  }
  return [
    {
      id: `${q.id}-item-1`,
      type: q.type === "essay" ? "essay" : "multiple_choice",
      question_text: q.question_text || "",
      options: q.options || [],
      correct_answer: q.correct_answer || "",
      explanation: q.explanation || "",
      rubric: q.rubric || "",
      image_url: q.image_url,
      image_caption: q.image_caption,
      image_attribution: q.image_attribution,
      image_alt: q.image_alt,
      media_asset: q.media_asset,
    },
  ];
}

export function resolveRoomQuestions(
  resourceIdString?: string,
  availableQuestions: Question[] = []
): {
  questions: Question[];
  combinedQuestion: Question | null;
  allItems: QuestionItem[];
} {
  if (!resourceIdString || !resourceIdString.trim()) {
    return { questions: [], combinedQuestion: null, allItems: [] };
  }

  const idTokens = resourceIdString
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const matchedQuestions: Question[] = [];
  const seenIds = new Set<string>();

  for (const token of idTokens) {
    const cleanToken = token.replace(/[^a-z0-9]/g, "");
    const found = availableQuestions.find((q) => {
      const qLower = (q.id || "").toLowerCase();
      if (qLower === token) return true;
      return cleanToken.length > 0 && qLower.replace(/[^a-z0-9]/g, "") === cleanToken;
    });
    if (found && !seenIds.has(found.id.toLowerCase())) {
      seenIds.add(found.id.toLowerCase());
      matchedQuestions.push(found);
    }
  }

  if (matchedQuestions.length === 0) {
    return { questions: [], combinedQuestion: null, allItems: [] };
  }

  const allItems: QuestionItem[] = matchedQuestions.flatMap((q, qIdx) => {
    const items = getQuestionItems(q);
    return items.map((it, itIdx) => ({
      ...it,
      id: it.id || `${q.id}-item-${qIdx + 1}-${itIdx + 1}`,
    }));
  });

  const firstQ = matchedQuestions[0];
  const hasMc = allItems.some((it) => it.type === "multiple_choice");
  const hasEssay = allItems.some((it) => it.type === "essay");
  const combinedType: "multiple_choice" | "essay" | "mixed" =
    hasMc && hasEssay ? "mixed" : hasEssay ? "essay" : "multiple_choice";

  const combinedQuestion: Question = {
    ...firstQ,
    id: matchedQuestions.map((q) => q.id).join(","),
    topic:
      matchedQuestions.length > 1
        ? matchedQuestions.map((q) => q.topic).filter(Boolean).join(" • ")
        : firstQ.topic,
    type: combinedType,
    items: allItems,
  };

  return {
    questions: matchedQuestions,
    combinedQuestion,
    allItems,
  };
}

export function resolveRoomMaterials(
  resourceIdString?: string,
  availableMaterials: LearningMaterial[] = []
): {
  materials: LearningMaterial[];
  primaryMaterial: LearningMaterial | null;
} {
  if (!resourceIdString || !resourceIdString.trim()) {
    return { materials: [], primaryMaterial: null };
  }

  const idTokens = resourceIdString
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const matchedMaterials: LearningMaterial[] = [];
  const seenIds = new Set<string>();

  for (const token of idTokens) {
    const found = availableMaterials.find(
      (m) => (m.id || "").toLowerCase() === token
    );
    if (found && !seenIds.has(found.id.toLowerCase())) {
      seenIds.add(found.id.toLowerCase());
      matchedMaterials.push(found);
    }
  }

  return {
    materials: matchedMaterials,
    primaryMaterial: matchedMaterials[0] || null,
  };
}

export interface LearningMaterial {
  id: string;
  school_id: string;
  teacher_id: string;
  title: string;
  subject: string;
  grade: number;
  content: string;
  is_contextualized: boolean;
  original_content?: string;
  context_variables?: any[];
  validation?: any;
  published_to_classes?: string[]; // Class IDs
  image_url?: string;
  image_caption?: string;
  image_attribution?: string;
  image_alt?: string;
  media_asset?: MediaAsset;
  version?: number;
  is_archived?: boolean;
  archived_at?: string;
  created_at: string;
}

export interface Exam {
  id: string;
  title: string;
  school_id: string;
  class_id: string;
  class_name: string;
  subject: string;
  teacher_id: string;
  duration_minutes: number;
  start_time: string;
  end_time: string;
  status: "draft" | "published" | "completed";
  question_ids: string[];
  questions?: Question[];
  created_at: string;
}

export interface ExamAttempt {
  id: string;
  exam_id: string;
  student_id: string;
  student_name: string;
  answers: Record<string, string>; // questionId -> answer
  score?: number;
  max_score: number;
  mc_score?: number;
  essay_score?: number;
  status: "in_progress" | "submitted" | "graded";
  started_at: string;
  submitted_at?: string;
  teacher_feedback?: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  created_at: string;
}

export interface RoomVisitor {
  name: string;
  accessed_at: string;
  score?: number;
  completed?: boolean;
}

export interface LearningRoom {
  id: string;
  code: string; // e.g. "MTR-3502" or "SOL-5A" or "ROM-5A"
  title: string;
  type: "material" | "question" | "both";
  resource_id: string; // ID of LearningMaterial or Question
  secondary_resource_id?: string; // Optional ID for paired material or question
  subject: string;
  grade: number;
  region_name?: string;
  school_id?: string;
  teacher_id: string;
  teacher_name?: string;
  access_count: number;
  material_snapshot?: LearningMaterial;
  question_snapshot?: Question;
  status?: "active" | "archived" | "closed";
  created_at: string;
  visitors?: RoomVisitor[];
}

