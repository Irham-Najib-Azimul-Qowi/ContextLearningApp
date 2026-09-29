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
  subject: string;
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

export type ResourceCategory = "room" | "material" | "question" | "unknown";

export function detectResourceCategory(cleanStr: string): {
  category: ResourceCategory;
  stem: string;
} {
  if (!cleanStr) return { category: "unknown", stem: "" };
  if (/^(room|rom|rm)/.test(cleanStr)) {
    return { category: "room", stem: cleanStr.replace(/^(room|rom|rm)/, "") };
  }
  if (/^(materi|mat|mtr)/.test(cleanStr)) {
    return { category: "material", stem: cleanStr.replace(/^(materi|mat|mtr)/, "") };
  }
  if (/^(soal|sol|que)/.test(cleanStr)) {
    return { category: "question", stem: cleanStr.replace(/^(soal|sol|que)/, "") };
  }
  if (/^q[0-9]/.test(cleanStr)) {
    return { category: "question", stem: cleanStr.substring(1) };
  }
  return { category: "unknown", stem: cleanStr };
}

export function isIdOrCodeMatch(
  a: string | undefined | null,
  b: string | undefined | null,
  expectedCategory?: ResourceCategory
): boolean {
  if (!a || !b) return false;
  if (a === b) return true;

  const rawA = String(a).trim();
  const rawB = String(b).trim();
  if (rawA.toLowerCase() === rawB.toLowerCase()) return true;

  const cleanA = rawA.toLowerCase().replace(/[^a-z0-9]/g, "");
  const cleanB = rawB.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!cleanA || !cleanB) return false;
  if (cleanA === cleanB) return true;

  const detA = detectResourceCategory(cleanA);
  const detB = detectResourceCategory(cleanB);

  // If both have explicit different categories, they cannot match (e.g. material vs question)
  if (
    detA.category !== "unknown" &&
    detB.category !== "unknown" &&
    detA.category !== detB.category
  ) {
    return false;
  }

  // If expected category is specified and either candidate is an opposing category, reject
  if (
    expectedCategory &&
    expectedCategory !== "unknown" &&
    ((detA.category !== "unknown" && detA.category !== expectedCategory) ||
      (detB.category !== "unknown" && detB.category !== expectedCategory))
  ) {
    return false;
  }

  // Compare stems (e.g. "1001" and "rom1001" or "soal1001" and "sol1001")
  if (detA.stem && detB.stem && detA.stem === detB.stem) {
    return true;
  }

  return false;
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
    .map((s) => s.trim())
    .filter(Boolean);

  const matchedQuestions: Question[] = [];
  const seenIds = new Set<string>();

  for (const token of idTokens) {
    const found = availableQuestions.find((q) => isIdOrCodeMatch(q.id, token, "question"));
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
    .map((s) => s.trim())
    .filter(Boolean);

  const matchedMaterials: LearningMaterial[] = [];
  const seenIds = new Set<string>();

  for (const token of idTokens) {
    const found = availableMaterials.find((m) => isIdOrCodeMatch(m.id, token, "material"));
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

/**
 * Normalizes and matches subject names across filters, seed data, and user input.
 * Handles abbreviations and variants (e.g. IPAS, IPS, IPA, Seni Budaya, PPKn, etc.)
 */
export function isSubjectMatch(itemSubject?: string, filterSubject?: string): boolean {
  if (!filterSubject || filterSubject === "Semua Mapel" || filterSubject === "Semua" || filterSubject === "all") {
    return true;
  }
  if (!itemSubject) return false;

  const s1 = itemSubject.trim().toLowerCase();
  const s2 = filterSubject.trim().toLowerCase();

  if (s1 === s2) return true;

  // IPAS / IPA / IPS / Ilmu Pengetahuan Alam & Sosial
  const isIpas1 = s1.includes("ipas") || s1.includes("ips") || s1.includes("ipa") || s1.includes("alam") || s1.includes("sosial");
  const isIpas2 = s2.includes("ipas") || s2.includes("ips") || s2.includes("ipa") || s2.includes("alam") || s2.includes("sosial");
  if (isIpas1 && isIpas2) return true;

  // Seni Budaya & Prakarya / SBdP / Seni
  const isSeni1 = s1.includes("seni") || s1.includes("sbdp") || s1.includes("prakarya");
  const isSeni2 = s2.includes("seni") || s2.includes("sbdp") || s2.includes("prakarya");
  if (isSeni1 && isSeni2) return true;

  // Pancasila / PPKn / Pendidikan Pancasila
  const isPancasila1 = s1.includes("pancasila") || s1.includes("ppkn") || s1.includes("kewarganegaraan");
  const isPancasila2 = s2.includes("pancasila") || s2.includes("ppkn") || s2.includes("kewarganegaraan");
  if (isPancasila1 && isPancasila2) return true;

  // Bahasa Indonesia
  const isBIndo1 = s1.includes("indonesia") || s1.includes("bahasa");
  const isBIndo2 = s2.includes("indonesia") || s2.includes("bahasa");
  if (isBIndo1 && isBIndo2) return true;

  // Matematika
  const isMath1 = s1.includes("matematika") || s1.includes("mtk") || s1.includes("math");
  const isMath2 = s2.includes("matematika") || s2.includes("mtk") || s2.includes("math");
  if (isMath1 && isMath2) return true;

  return s1.includes(s2) || s2.includes(s1);
}
