import {
  Region,
  School,
  LocalKnowledgeItem,
  ClassRoom,
  ClassMembership,
  Question,
  QuestionContextualization,
  LearningMaterial,
  Examination,
  ExaminationAttempt,
  StudentAnswer,
  Notification,
} from "./types";
import {
  INITIAL_REGIONS,
  INITIAL_SCHOOLS,
  INITIAL_LOCAL_KNOWLEDGE,
  INITIAL_CLASSES,
  INITIAL_QUESTIONS,
  INITIAL_CONTEXTUALIZATIONS,
  INITIAL_MATERIALS,
  INITIAL_EXAMINATIONS,
  INITIAL_ATTEMPTS,
  INITIAL_NOTIFICATIONS,
} from "./mock-data";


// In-memory runtime cache that persists within the session
class DataStore {
  private regions: Region[] = [...INITIAL_REGIONS];
  private schools: School[] = [...INITIAL_SCHOOLS];
  private knowledge: LocalKnowledgeItem[] = [...INITIAL_LOCAL_KNOWLEDGE];
  private classes: ClassRoom[] = [...INITIAL_CLASSES];
  private memberships: ClassMembership[] = [
    {
      id: "mem-01",
      class_id: "class-5a-samarinda",
      student_id: "student-demo-01",
      student_name: "Budi Pratama",
      joined_at: "2026-01-11T00:00:00Z",
      status: "active",
    },
  ];
  private questions: Question[] = [...INITIAL_QUESTIONS];
  private contextualizations: QuestionContextualization[] = [...INITIAL_CONTEXTUALIZATIONS];
  private materials: LearningMaterial[] = [...INITIAL_MATERIALS];
  private examinations: Examination[] = [...INITIAL_EXAMINATIONS];
  private attempts: ExaminationAttempt[] = [...INITIAL_ATTEMPTS];
  private answers: StudentAnswer[] = [
    {
      id: "ans-01",
      attempt_id: "att-demo-01",
      question_id: "q-math-01",
      selected_option: "B",
      is_correct: true,
      score: 10,
      evaluated_by_ai: false,
      reviewed_by_teacher: true,
      updated_at: "2026-01-21T09:15:00Z",
    },
  ];
  private notifications: Notification[] = [...INITIAL_NOTIFICATIONS];

  // REGIONS
  getRegions(): Region[] {
    return this.regions;
  }

  getRegionById(id: string): Region | undefined {
    return this.regions.find((r) => r.id === id);
  }

  // SCHOOLS
  getSchools(): School[] {
    return this.schools;
  }

  getSchoolById(id: string): School | undefined {
    return this.schools.find((s) => s.id === id);
  }

  updateSchool(school: School): School {
    const idx = this.schools.findIndex((s) => s.id === school.id);
    if (idx >= 0) {
      this.schools[idx] = { ...school, updated_at: new Date().toISOString() };
      return this.schools[idx];
    }
    this.schools.push(school);
    return school;
  }

  // LOCAL KNOWLEDGE BASE
  getLocalKnowledge(regionId?: string, category?: string): LocalKnowledgeItem[] {
    let result = this.knowledge;
    if (regionId) {
      result = result.filter((k) => k.region_id === regionId);
    }
    if (category) {
      result = result.filter((k) => k.entity_category === category);
    }
    return result;
  }

  addLocalKnowledge(item: Omit<LocalKnowledgeItem, "id" | "created_at" | "updated_at">): LocalKnowledgeItem {
    const newItem: LocalKnowledgeItem = {
      ...item,
      id: `kb-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.knowledge.push(newItem);
    return newItem;
  }

  // CLASSES
  getClasses(teacherId?: string): ClassRoom[] {
    if (teacherId) {
      return this.classes.filter((c) => c.teacher_id === teacherId);
    }
    return this.classes;
  }

  getClassById(id: string): ClassRoom | undefined {
    return this.classes.find((c) => c.id === id);
  }

  getClassByJoinCode(code: string): ClassRoom | undefined {
    return this.classes.find((c) => c.join_code.toUpperCase() === code.trim().toUpperCase());
  }

  createClass(cls: Omit<ClassRoom, "id" | "created_at" | "updated_at" | "member_count">): ClassRoom {
    const newClass: ClassRoom = {
      ...cls,
      id: `class-${Date.now()}`,
      member_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.classes.push(newClass);
    return newClass;
  }

  // CLASS MEMBERSHIPS
  getStudentClasses(studentId: string): ClassRoom[] {
    const classIds = this.memberships
      .filter((m) => m.student_id === studentId && m.status === "active")
      .map((m) => m.class_id);
    return this.classes.filter((c) => classIds.includes(c.id));
  }

  getClassMembers(classId: string): ClassMembership[] {
    return this.memberships.filter((m) => m.class_id === classId && m.status === "active");
  }

  joinClass(studentId: string, studentName: string, joinCode: string): { success: boolean; message: string; class?: ClassRoom } {
    const targetClass = this.getClassByJoinCode(joinCode);
    if (!targetClass) {
      return { success: false, message: "Kode kelas tidak ditemukan." };
    }

    const existing = this.memberships.find(
      (m) => m.class_id === targetClass.id && m.student_id === studentId
    );
    if (existing && existing.status === "active") {
      return { success: false, message: "Kamu sudah terdaftar di kelas ini.", class: targetClass };
    }

    const newMembership: ClassMembership = {
      id: `mem-${Date.now()}`,
      class_id: targetClass.id,
      student_id: studentId,
      student_name: studentName,
      joined_at: new Date().toISOString(),
      status: "active",
    };
    this.memberships.push(newMembership);
    if (targetClass.member_count !== undefined) {
      targetClass.member_count += 1;
    }

    // Trigger notification for teacher
    this.addNotification({
      user_id: targetClass.teacher_id,
      title: "Siswa Baru Bergabung",
      message: `${studentName} telah bergabung ke kelas ${targetClass.name}.`,
      link: `/teacher/classes/${targetClass.id}`,
      type: "class",
      is_read: false,
    });

    return { success: true, message: `Berhasil bergabung ke ${targetClass.name}!`, class: targetClass };
  }

  // QUESTIONS
  getQuestions(teacherId?: string, subject?: string, grade?: number): Question[] {
    let result = this.questions;
    if (teacherId) {
      result = result.filter((q) => q.teacher_id === teacherId);
    }
    if (subject) {
      result = result.filter((q) => q.subject === subject);
    }
    if (grade) {
      result = result.filter((q) => q.grade === grade);
    }
    return result;
  }

  getQuestionById(id: string): Question | undefined {
    return this.questions.find((q) => q.id === id);
  }

  createQuestion(q: Omit<Question, "id" | "created_at" | "updated_at">): Question {
    const newQuestion: Question = {
      ...q,
      id: `q-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.questions.push(newQuestion);
    return newQuestion;
  }

  updateQuestion(id: string, updates: Partial<Question>): Question | undefined {
    const idx = this.questions.findIndex((q) => q.id === id);
    if (idx >= 0) {
      this.questions[idx] = {
        ...this.questions[idx],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      return this.questions[idx];
    }
    return undefined;
  }

  deleteQuestion(id: string): boolean {
    const initialLen = this.questions.length;
    this.questions = this.questions.filter((q) => q.id !== id);
    return this.questions.length < initialLen;
  }

  // QUESTION CONTEXTUALIZATIONS
  getContextualizations(questionId?: string, regionId?: string): QuestionContextualization[] {
    let res = this.contextualizations;
    if (questionId) res = res.filter((c) => c.question_id === questionId);
    if (regionId) res = res.filter((c) => c.region_id === regionId);
    return res;
  }

  saveContextualization(
    c: Omit<QuestionContextualization, "id" | "created_at" | "updated_at">
  ): QuestionContextualization {
    const existingIdx = this.contextualizations.findIndex(
      (item) => item.question_id === c.question_id && item.region_id === c.region_id
    );

    if (existingIdx >= 0) {
      this.contextualizations[existingIdx] = {
        ...this.contextualizations[existingIdx],
        ...c,
        updated_at: new Date().toISOString(),
      };
      return this.contextualizations[existingIdx];
    }

    const newC: QuestionContextualization = {
      ...c,
      id: `qc-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.contextualizations.push(newC);
    return newC;
  }

  // LEARNING MATERIALS
  getMaterials(classId?: string, teacherId?: string): LearningMaterial[] {
    let res = this.materials;
    if (classId) res = res.filter((m) => m.class_id === classId || !m.class_id);
    if (teacherId) res = res.filter((m) => m.teacher_id === teacherId);
    return res;
  }

  getMaterialById(id: string): LearningMaterial | undefined {
    return this.materials.find((m) => m.id === id);
  }

  createMaterial(m: Omit<LearningMaterial, "id" | "created_at" | "updated_at">): LearningMaterial {
    const newM: LearningMaterial = {
      ...m,
      id: `mat-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.materials.push(newM);
    return newM;
  }

  updateMaterial(id: string, updates: Partial<LearningMaterial>): LearningMaterial | undefined {
    const idx = this.materials.findIndex((m) => m.id === id);
    if (idx >= 0) {
      this.materials[idx] = {
        ...this.materials[idx],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      return this.materials[idx];
    }
    return undefined;
  }

  // EXAMINATIONS
  getExaminations(classId?: string, teacherId?: string): Examination[] {
    let res = this.examinations;
    if (classId) res = res.filter((e) => e.class_id === classId);
    if (teacherId) res = res.filter((e) => e.teacher_id === teacherId);
    return res;
  }

  getExaminationById(id: string): Examination | undefined {
    const exam = this.examinations.find((e) => e.id === id);
    if (!exam) return undefined;

    // Attach questions if not attached
    if (!exam.questions || exam.questions.length === 0) {
      exam.questions = this.questions;
    }
    return exam;
  }

  /**
   * Safe question projection for students taking active examinations.
   * STRIPS correct_answer, explanation, rubric, and internal teacher notes!
   */
  getStudentExamPayload(id: string, studentId: string): Omit<Examination, "questions"> & {
    questions: Array<Omit<Question, "correct_answer" | "explanation" | "rubric">>;
    attempt?: ExaminationAttempt;
  } | null {
    const exam = this.getExaminationById(id);
    if (!exam) return null;

    // Verify student is in the class
    const membership = this.memberships.find(
      (m) => m.class_id === exam.class_id && m.student_id === studentId && m.status === "active"
    );
    if (!membership) {
      return null;
    }

    const safeQuestions = (exam.questions || []).map((q) => {
      const { correct_answer: _ca, explanation: _exp, rubric: _rub, ...safeQ } = q;
      return safeQ;
    });


    const attempt = this.attempts.find(
      (a) => a.examination_id === id && a.student_id === studentId
    );

    return {
      ...exam,
      questions: safeQuestions,
      attempt,
    };
  }

  createExamination(
    e: Omit<Examination, "id" | "created_at" | "updated_at">,
    questionIds: string[]
  ): Examination {
    const selectedQuestions = this.questions.filter((q) => questionIds.includes(q.id));
    const newExam: Examination = {
      ...e,
      id: `exam-${Date.now()}`,
      question_count: selectedQuestions.length,
      questions: selectedQuestions,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.examinations.push(newExam);

    // Notify students of the target class
    const studentsInClass = this.memberships.filter((m) => m.class_id === e.class_id);
    studentsInClass.forEach((st) => {
      this.addNotification({
        user_id: st.student_id,
        title: "Ujian Baru Diterbitkan",
        message: `Guru telah menjadwalkan: ${e.title}`,
        link: `/student/examinations/${newExam.id}`,
        type: "exam",
        is_read: false,
      });
    });

    return newExam;
  }

  // ATTEMPTS & GRADING
  getAttempt(examId: string, studentId: string): ExaminationAttempt | undefined {
    return this.attempts.find((a) => a.examination_id === examId && a.student_id === studentId);
  }

  startAttempt(examId: string, studentId: string, studentName: string): ExaminationAttempt {
    const existing = this.getAttempt(examId, studentId);
    if (existing) return existing;

    const newAttempt: ExaminationAttempt = {
      id: `att-${Date.now()}`,
      examination_id: examId,
      student_id: studentId,
      student_name: studentName,
      start_time: new Date().toISOString(),
      status: "in_progress",
    };
    this.attempts.push(newAttempt);
    return newAttempt;
  }

  saveStudentAnswer(attemptId: string, questionId: string, selectedOption?: string, essayAnswer?: string) {
    const existingIdx = this.answers.findIndex(
      (a) => a.attempt_id === attemptId && a.question_id === questionId
    );
    if (existingIdx >= 0) {
      this.answers[existingIdx] = {
        ...this.answers[existingIdx],
        selected_option: selectedOption ?? this.answers[existingIdx].selected_option,
        essay_answer: essayAnswer ?? this.answers[existingIdx].essay_answer,
        updated_at: new Date().toISOString(),
      };
      return this.answers[existingIdx];
    }

    const newAns: StudentAnswer = {
      id: `ans-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      attempt_id: attemptId,
      question_id: questionId,
      selected_option: selectedOption,
      essay_answer: essayAnswer,
      evaluated_by_ai: false,
      reviewed_by_teacher: false,
      updated_at: new Date().toISOString(),
    };
    this.answers.push(newAns);
    return newAns;
  }

  getStudentAnswers(attemptId: string): StudentAnswer[] {
    return this.answers.filter((a) => a.attempt_id === attemptId);
  }

  /**
   * Deterministic Server-Side Grading (NO Gemini dependency for multiple-choice!)
   */
  submitAttempt(
    attemptId: string
  ): {
    attempt: ExaminationAttempt;
    multipleChoiceScore: number;
    totalPossible: number;
    pendingEssayReview: boolean;
  } {
    const attempt = this.attempts.find((a) => a.id === attemptId);
    if (!attempt) throw new Error("Attempt not found");

    const exam = this.getExaminationById(attempt.examination_id);
    if (!exam || !exam.questions) throw new Error("Exam not found");

    const answers = this.getStudentAnswers(attemptId);
    let correctCount = 0;
    let totalMCQ = 0;
    let hasEssay = false;

    exam.questions.forEach((q) => {
      if (q.question_type === "multiple_choice") {
        totalMCQ += 1;
        const ans = answers.find((a) => a.question_id === q.id);
        const isCorrect = ans && ans.selected_option === q.correct_answer;
        if (ans) {
          ans.is_correct = Boolean(isCorrect);
          ans.score = isCorrect ? 10 : 0;
        }
        if (isCorrect) correctCount += 1;
      } else {
        hasEssay = true;
      }
    });

    const mcqPercentage = totalMCQ > 0 ? Math.round((correctCount / totalMCQ) * 100) : 100;
    attempt.submit_time = new Date().toISOString();
    attempt.score = mcqPercentage;
    attempt.status = hasEssay ? "submitted" : "graded";

    // Notify teacher
    this.addNotification({
      user_id: exam.teacher_id,
      title: "Ujian Telah Dikumpulkan",
      message: `${attempt.student_name || "Siswa"} mengumpulkan ${exam.title}. Skor Pilihan Ganda: ${mcqPercentage}.`,
      link: `/teacher/examinations/${exam.id}`,
      type: "grade",
      is_read: false,
    });

    return {
      attempt,
      multipleChoiceScore: mcqPercentage,
      totalPossible: 100,
      pendingEssayReview: hasEssay,
    };
  }

  gradeEssay(answerId: string, score: number, feedback: string): StudentAnswer | undefined {
    const ans = this.answers.find((a) => a.id === answerId);
    if (ans) {
      ans.score = score;
      ans.feedback = feedback;
      ans.reviewed_by_teacher = true;
      ans.updated_at = new Date().toISOString();
      return ans;
    }
    return undefined;
  }

  // NOTIFICATIONS
  getNotifications(userId: string): Notification[] {
    return this.notifications.filter((n) => n.user_id === userId);
  }

  addNotification(n: Omit<Notification, "id" | "created_at">): Notification {
    const newNotif: Notification = {
      ...n,
      id: `notif-${Date.now()}`,
      created_at: "Baru saja",
    };
    this.notifications.unshift(newNotif);
    return newNotif;
  }

  markNotificationAsRead(id: string): void {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) notif.is_read = true;
  }
}

// Global Singleton for runtime persistence
export const repository = new DataStore();
