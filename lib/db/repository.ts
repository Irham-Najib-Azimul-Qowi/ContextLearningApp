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
  Profile,
  SchoolMembership,
  SchoolInvitation,
  MembershipRole,
  MembershipStatus,
  SchoolVerificationStatus,
  SchoolStatus,
  AICredential,
  AIUsageLog,
  AuditLog,
  ScannedAnswerSheet,
  UserRole,
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
  INITIAL_MEMBERSHIPS,
  INITIAL_STUDENTS,
  INITIAL_AI_CREDENTIALS,
  INITIAL_AI_USAGE_LOGS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SCANNED_SHEETS,
  DEMO_TEACHER,
  DEMO_STUDENT,
  DEMO_ADMIN,
} from "./mock-data";

class DataStore {
  private regions: Region[] = [...INITIAL_REGIONS];
  private schools: School[] = [...INITIAL_SCHOOLS];
  private memberships: SchoolMembership[] = [...INITIAL_MEMBERSHIPS];
  private invitations: SchoolInvitation[] = [];
  private users: Profile[] = [DEMO_ADMIN, DEMO_TEACHER, ...INITIAL_STUDENTS];
  private knowledge: LocalKnowledgeItem[] = [...INITIAL_LOCAL_KNOWLEDGE];
  private classes: ClassRoom[] = [...INITIAL_CLASSES];
  private classMemberships: ClassMembership[] = [
    {
      id: "mem-01",
      class_id: "class-5a-samarinda",
      student_id: "student-demo-01",
      student_name: "Budi Pratama",
      joined_at: "2026-01-11T00:00:00Z",
      status: "active",
    },
    {
      id: "mem-02",
      class_id: "class-5a-samarinda",
      student_id: "student-demo-02",
      student_name: "Siti Rahmawati",
      joined_at: "2026-01-11T00:00:00Z",
      status: "active",
    },
    {
      id: "mem-03",
      class_id: "class-5a-samarinda",
      student_id: "student-demo-03",
      student_name: "Ahmad Fauzi",
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
  private scannedSheets: ScannedAnswerSheet[] = [...INITIAL_SCANNED_SHEETS];
  private aiCredentials: AICredential[] = [...INITIAL_AI_CREDENTIALS];
  private aiUsageLogs: AIUsageLog[] = [...INITIAL_AI_USAGE_LOGS];
  private auditLogs: AuditLog[] = [...INITIAL_AUDIT_LOGS];
  private notifications: Notification[] = [...INITIAL_NOTIFICATIONS];

  // USERS & PROFILES
  getUserById(id: string): Profile | undefined {
    return this.users.find((u) => u.id === id);
  }

  getUserByEmail(email: string): Profile | undefined {
    return this.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  }

  getUserByStudentCode(code: string): Profile | undefined {
    return this.users.find((u) => u.student_code?.toUpperCase() === code.toUpperCase());
  }

  upsertUser(user: Profile): Profile {
    const idx = this.users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      this.users[idx] = { ...this.users[idx], ...user, updated_at: new Date().toISOString() };
      return this.users[idx];
    }
    this.users.push(user);
    return user;
  }

  // REGIONS
  getRegions(): Region[] {
    return this.regions;
  }

  getRegionById(id: string): Region | undefined {
    return this.regions.find((r) => r.id === id);
  }

  // SCHOOLS (Multi-Tenant Core)
  getSchools(): School[] {
    return this.schools;
  }

  getSchoolById(id: string): School | undefined {
    return this.schools.find((s) => s.id === id);
  }

  getSchoolBySlug(slug: string): School | undefined {
    return this.schools.find((s) => s.slug.toLowerCase() === slug.toLowerCase());
  }

  getSchoolByCode(code: string): School | undefined {
    return this.schools.find((s) => s.code.toUpperCase() === code.toUpperCase());
  }

  checkDuplicateSchool(name: string, regency: string): School | undefined {
    const cleanName = name.trim().toLowerCase();
    const cleanRegency = regency.trim().toLowerCase();
    return this.schools.find(
      (s) => s.name.toLowerCase().includes(cleanName) && s.regency.toLowerCase().includes(cleanRegency)
    );
  }

  createSchool(data: {
    name: string;
    educational_level: "SD" | "SMP" | "SMA";
    province: string;
    regency: string;
    district: string;
    village?: string;
    address?: string;
    description?: string;
    npsn?: string;
    latitude?: number;
    longitude?: number;
    createdBy: string;
  }): { school: School; membership: SchoolMembership } {
    const existing = this.checkDuplicateSchool(data.name, data.regency);
    if (existing) {
      throw new Error(`Sekolah dengan nama mirip sudah terdaftar: ${existing.name} (${existing.code})`);
    }

    const schoolId = `school-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const code = `SCH-${data.educational_level}${randomNum}`;
    const slug = `${data.educational_level.toLowerCase()}-${data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .substring(0, 30)}`;

    const newSchool: School = {
      id: schoolId,
      code,
      slug,
      name: data.name,
      educational_level: data.educational_level,
      npsn: data.npsn,
      address: data.address,
      province: data.province,
      regency: data.regency,
      district: data.district,
      village: data.village,
      latitude: data.latitude,
      longitude: data.longitude,
      description: data.description,
      verification_status: "pending_verification",
      status: "active",
      created_by: data.createdBy,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.schools.push(newSchool);

    // Initial creator becomes school coordinator
    const membership: SchoolMembership = {
      id: `mship-${Date.now()}`,
      school_id: schoolId,
      user_id: data.createdBy,
      role: "school_coordinator",
      status: "active",
      school_name: newSchool.name,
      school_slug: newSchool.slug,
      school_code: newSchool.code,
      educational_level: newSchool.educational_level,
      joined_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    this.memberships.push(membership);

    this.logAudit({
      actor_id: data.createdBy,
      actor_name: "Guru Penggagas",
      actor_role: "teacher",
      action: "SCHOOL_REGISTERED",
      resource_type: "school",
      resource_id: schoolId,
      school_id: schoolId,
      details: { name: newSchool.name, code: newSchool.code, level: newSchool.educational_level },
    });

    return { school: newSchool, membership };
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

  updateSchoolVerification(schoolId: string, status: SchoolVerificationStatus, adminId: string): School {
    const school = this.getSchoolById(schoolId);
    if (!school) throw new Error("School not found");
    school.verification_status = status;
    school.updated_at = new Date().toISOString();

    this.logAudit({
      actor_id: adminId,
      actor_name: "Platform Admin",
      actor_role: "platform_admin",
      action: `SCHOOL_VERIFICATION_${status.toUpperCase()}`,
      resource_type: "school",
      resource_id: schoolId,
      school_id: schoolId,
      details: { new_status: status },
    });

    return school;
  }

  updateSchoolStatus(schoolId: string, status: SchoolStatus, adminId: string): School {
    const school = this.getSchoolById(schoolId);
    if (!school) throw new Error("School not found");
    school.status = status;
    school.updated_at = new Date().toISOString();

    this.logAudit({
      actor_id: adminId,
      actor_name: "Platform Admin",
      actor_role: "platform_admin",
      action: `SCHOOL_${status.toUpperCase()}`,
      resource_type: "school",
      resource_id: schoolId,
      school_id: schoolId,
      details: { new_status: status },
    });

    return school;
  }

  // SCHOOL MEMBERSHIPS & WORKSPACES
  getUserMemberships(userId: string): SchoolMembership[] {
    return this.memberships.filter((m) => m.user_id === userId && m.status === "active");
  }

  getSchoolMembers(schoolId: string): SchoolMembership[] {
    return this.memberships.filter((m) => m.school_id === schoolId);
  }

  verifyTeacherMembership(userId: string, schoolId: string): boolean {
    return this.memberships.some(
      (m) => m.user_id === userId && m.school_id === schoolId && m.status === "active"
    );
  }

  requestJoinSchool(userId: string, schoolId: string): SchoolMembership {
    const school = this.getSchoolById(schoolId);
    if (!school) throw new Error("Sekolah tidak ditemukan");

    const existing = this.memberships.find((m) => m.user_id === userId && m.school_id === schoolId);
    if (existing) {
      if (existing.status === "active") throw new Error("Anda sudah terdaftar di sekolah ini.");
      if (existing.status === "pending") throw new Error("Permintaan bergabung masih menunggu persetujuan.");
    }

    const membership: SchoolMembership = {
      id: `mship-${Date.now()}`,
      school_id: schoolId,
      user_id: userId,
      role: "teacher",
      status: "pending",
      school_name: school.name,
      school_slug: school.slug,
      school_code: school.code,
      educational_level: school.educational_level,
      joined_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    this.memberships.push(membership);

    // Notify school coordinators
    const coordinators = this.memberships.filter((m) => m.school_id === schoolId && m.role === "school_coordinator");
    coordinators.forEach((coord) => {
      this.addNotification({
        user_id: coord.user_id,
        title: "Permintaan Bergabung Baru",
        message: "Seorang guru telah mengajukan permohonan bergabung ke sekolah Anda.",
        link: "/teacher/school/members",
        type: "system",
        is_read: false,
      });
    });

    return membership;
  }

  approveMembership(membershipId: string, approverId: string): SchoolMembership {
    const mem = this.memberships.find((m) => m.id === membershipId);
    if (!mem) throw new Error("Keanggotaan tidak ditemukan");
    mem.status = "active";

    this.logAudit({
      actor_id: approverId,
      actor_name: "Koordinator Sekolah",
      actor_role: "teacher",
      action: "MEMBERSHIP_APPROVED",
      resource_type: "school_membership",
      resource_id: membershipId,
      school_id: mem.school_id,
      details: { user_id: mem.user_id, school_id: mem.school_id },
    });

    this.addNotification({
      user_id: mem.user_id,
      title: "Permintaan Bergabung Disetujui",
      message: `Selamat, permohonan Anda untuk bergabung di ${mem.school_name} telah disetujui.`,
      link: "/teacher/dashboard",
      type: "system",
      is_read: false,
    });

    return mem;
  }

  createInvitationCode(schoolId: string, createdBy: string, role: MembershipRole = "teacher"): SchoolInvitation {
    const code = `INV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);

    const invitation: SchoolInvitation = {
      id: `inv-${Date.now()}`,
      school_id: schoolId,
      invitation_code: code,
      role,
      created_by: createdBy,
      expires_at: expires.toISOString(),
      is_used: false,
      created_at: new Date().toISOString(),
    };
    this.invitations.push(invitation);
    return invitation;
  }

  acceptInvitation(code: string, userId: string): SchoolMembership {
    const inv = this.invitations.find(
      (i) => i.invitation_code.toUpperCase() === code.trim().toUpperCase() && !i.is_used
    );
    if (!inv) throw new Error("Kode undangan tidak valid atau sudah digunakan.");

    const school = this.getSchoolById(inv.school_id);
    if (!school) throw new Error("Sekolah tidak ditemukan.");

    const membership: SchoolMembership = {
      id: `mship-${Date.now()}`,
      school_id: inv.school_id,
      user_id: userId,
      role: inv.role,
      status: "active",
      school_name: school.name,
      school_slug: school.slug,
      school_code: school.code,
      educational_level: school.educational_level,
      joined_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    this.memberships.push(membership);
    inv.is_used = true;

    return membership;
  }

  // STUDENTS PROVISIONING
  getStudentsBySchool(schoolId: string, classId?: string): Profile[] {
    return this.users.filter(
      (u) => u.role === "student" && u.school_id === schoolId && (!classId || u.class_id === classId)
    );
  }

  createStudentAccount(data: {
    school_id: string;
    full_name: string;
    grade: number;
    class_id: string;
    student_code?: string;
    teacher_id: string;
  }): { student: Profile; temporaryPassword: string } {
    const school = this.getSchoolById(data.school_id);
    if (!school) throw new Error("Sekolah tidak ditemukan");

    const studentCode =
      data.student_code ||
      `STU-${school.educational_level}${Math.floor(1000 + Math.random() * 9000)}`;

    const existingCode = this.users.find((u) => u.student_code === studentCode);
    if (existingCode) {
      throw new Error(`Nomor induk siswa ${studentCode} sudah digunakan.`);
    }

    const tempPassword = `CL-${Math.random().toString(36).substring(2, 8).toUpperCase()}#`;
    const studentId = `student-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const newStudent: Profile = {
      id: studentId,
      role: "student",
      full_name: data.full_name,
      student_code: studentCode,
      school_id: data.school_id,
      active_school_id: data.school_id,
      grade: data.grade,
      class_id: data.class_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.users.push(newStudent);

    // Enroll into class
    this.classMemberships.push({
      id: `mem-${Date.now()}`,
      class_id: data.class_id,
      student_id: studentId,
      student_name: data.full_name,
      joined_at: new Date().toISOString(),
      status: "active",
    });

    const targetClass = this.getClassById(data.class_id);
    if (targetClass && targetClass.member_count !== undefined) {
      targetClass.member_count += 1;
    }

    this.logAudit({
      actor_id: data.teacher_id,
      actor_name: "Guru",
      actor_role: "teacher",
      action: "STUDENT_ACCOUNT_CREATED",
      resource_type: "student",
      resource_id: studentId,
      school_id: data.school_id,
      details: { student_name: data.full_name, student_code: studentCode, class_id: data.class_id },
    });

    return { student: newStudent, temporaryPassword: tempPassword };
  }

  batchImportStudents(
    schoolId: string,
    teacherId: string,
    classId: string,
    records: Array<{ full_name: string; student_code?: string; grade?: number }>
  ): {
    createdCount: number;
    failedRows: Array<{ row: number; name: string; error: string }>;
    createdStudents: Array<{ name: string; student_code: string; tempPass: string }>;
  } {
    const createdStudents: Array<{ name: string; student_code: string; tempPass: string }> = [];
    const failedRows: Array<{ row: number; name: string; error: string }> = [];

    const targetClass = this.getClassById(classId);
    const defaultGrade = targetClass?.grade || 5;

    records.forEach((row, index) => {
      const rowNum = index + 1;
      if (!row.full_name || row.full_name.trim().length === 0) {
        failedRows.push({ row: rowNum, name: "(Kosong)", error: "Nama siswa wajib diisi." });
        return;
      }

      try {
        const { student, temporaryPassword } = this.createStudentAccount({
          school_id: schoolId,
          full_name: row.full_name.trim(),
          grade: row.grade || defaultGrade,
          class_id: classId,
          student_code: row.student_code?.trim(),
          teacher_id: teacherId,
        });
        createdStudents.push({
          name: student.full_name,
          student_code: student.student_code!,
          tempPass: temporaryPassword,
        });
      } catch (err: any) {
        failedRows.push({ row: rowNum, name: row.full_name, error: err.message || "Gagal membuat akun" });
      }
    });

    this.logAudit({
      actor_id: teacherId,
      actor_name: "Guru",
      actor_role: "teacher",
      action: "STUDENT_BATCH_IMPORT",
      resource_type: "student",
      resource_id: classId,
      school_id: schoolId,
      details: { successful: createdStudents.length, failed: failedRows.length },
    });

    return { createdCount: createdStudents.length, failedRows, createdStudents };
  }

  // LOCAL KNOWLEDGE
  getLocalKnowledge(regionId?: string, category?: string): LocalKnowledgeItem[] {
    let result = this.knowledge;
    if (regionId) result = result.filter((k) => k.region_id === regionId);
    if (category) result = result.filter((k) => k.entity_category === category);
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

  // CLASSES (Tenant Scoped)
  getClasses(schoolId?: string, teacherId?: string): ClassRoom[] {
    let result = this.classes;
    if (schoolId) result = result.filter((c) => c.school_id === schoolId);
    if (teacherId) result = result.filter((c) => c.teacher_id === teacherId);
    return result;
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
    const classIds = this.classMemberships
      .filter((m) => m.student_id === studentId && m.status === "active")
      .map((m) => m.class_id);
    return this.classes.filter((c) => classIds.includes(c.id));
  }

  getClassMembers(classId: string): ClassMembership[] {
    return this.classMemberships.filter((m) => m.class_id === classId && m.status === "active");
  }

  joinClass(studentId: string, studentName: string, joinCode: string): { success: boolean; message: string; class?: ClassRoom } {
    const targetClass = this.getClassByJoinCode(joinCode);
    if (!targetClass) {
      return { success: false, message: "Kode kelas tidak ditemukan." };
    }

    const existing = this.classMemberships.find(
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
    this.classMemberships.push(newMembership);
    if (targetClass.member_count !== undefined) {
      targetClass.member_count += 1;
    }

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

  // QUESTIONS (Tenant Scoped)
  getQuestions(schoolId?: string, teacherId?: string, subject?: string, grade?: number): Question[] {
    let result = this.questions;
    if (schoolId) result = result.filter((q) => q.school_id === schoolId || !q.school_id);
    if (teacherId) result = result.filter((q) => q.teacher_id === teacherId);
    if (subject) result = result.filter((q) => q.subject === subject);
    if (grade) result = result.filter((q) => q.grade === grade);
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

  // LEARNING MATERIALS (Tenant Scoped)
  getMaterials(schoolId?: string, classId?: string, teacherId?: string): LearningMaterial[] {
    let res = this.materials;
    if (schoolId) res = res.filter((m) => m.school_id === schoolId || !m.school_id);
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

  // EXAMINATIONS (Tenant Scoped)
  getExaminations(schoolId?: string, classId?: string, teacherId?: string): Examination[] {
    let res = this.examinations;
    if (schoolId) res = res.filter((e) => e.school_id === schoolId || !e.school_id);
    if (classId) res = res.filter((e) => e.class_id === classId);
    if (teacherId) res = res.filter((e) => e.teacher_id === teacherId);
    return res;
  }

  getExaminationById(id: string): Examination | undefined {
    const exam = this.examinations.find((e) => e.id === id);
    if (!exam) return undefined;

    if (!exam.questions || exam.questions.length === 0) {
      exam.questions = this.questions;
    }
    return exam;
  }

  getStudentExamPayload(id: string, studentId: string): (Omit<Examination, "questions"> & {
    questions: Array<Omit<Question, "correct_answer" | "explanation" | "rubric">>;
    attempt?: ExaminationAttempt;
  }) | null {
    const exam = this.getExaminationById(id);
    if (!exam) return null;

    const membership = this.classMemberships.find(
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

    const studentsInClass = this.classMemberships.filter((m) => m.class_id === e.class_id);
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
      submission_source: "online",
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

  submitAttempt(attemptId: string): {
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

  // SCAN-BASED ANSWER SHEETS
  getScannedSheets(examId?: string): ScannedAnswerSheet[] {
    if (examId) return this.scannedSheets.filter((s) => s.examination_id === examId);
    return this.scannedSheets;
  }

  saveScannedSheet(sheet: Omit<ScannedAnswerSheet, "id" | "created_at">): ScannedAnswerSheet {
    const newSheet: ScannedAnswerSheet = {
      ...sheet,
      id: `scan-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.scannedSheets.push(newSheet);
    return newSheet;
  }

  confirmScannedGrading(
    sheetId: string,
    verifiedAnswers: Record<string, string>,
    teacherId: string
  ): ScannedAnswerSheet {
    const sheet = this.scannedSheets.find((s) => s.id === sheetId);
    if (!sheet) throw new Error("Scanned sheet not found");

    const exam = this.getExaminationById(sheet.examination_id);
    if (!exam || !exam.questions) throw new Error("Exam not found");

    // Grade multiple-choice deterministically
    let correct = 0;
    let total = 0;
    exam.questions.forEach((q) => {
      if (q.question_type === "multiple_choice") {
        total++;
        if (verifiedAnswers[q.id] === q.correct_answer) {
          correct++;
        }
      }
    });

    const score = total > 0 ? Math.round((correct / total) * 100) : 100;
    sheet.detected_answers = verifiedAnswers;
    sheet.uncertain_answers = [];
    sheet.status = "graded";
    sheet.score = score;

    // Record attempt for student
    const existingAttempt = this.getAttempt(sheet.examination_id, sheet.student_id);
    if (existingAttempt) {
      existingAttempt.score = score;
      existingAttempt.status = "graded";
      existingAttempt.submission_source = "scanned";
    } else {
      this.attempts.push({
        id: `att-scan-${Date.now()}`,
        examination_id: sheet.examination_id,
        student_id: sheet.student_id,
        student_name: sheet.student_name,
        start_time: sheet.created_at,
        submit_time: new Date().toISOString(),
        score,
        status: "graded",
        submission_source: "scanned",
      });
    }

    this.logAudit({
      actor_id: teacherId,
      actor_name: "Guru Pemeriksa",
      actor_role: "teacher",
      action: "SCAN_ANSWER_SHEET_GRADED",
      resource_type: "scanned_answer_sheet",
      resource_id: sheetId,
      school_id: sheet.school_id,
      details: { student_name: sheet.student_name, score, examination_id: sheet.examination_id },
    });

    return sheet;
  }

  // CENTRALIZED GEMINI AI MANAGEMENT
  getAICredentials(): AICredential[] {
    return this.aiCredentials;
  }

  getAICredentialById(id: string): AICredential | undefined {
    return this.aiCredentials.find((c) => c.id === id);
  }

  createAICredential(data: {
    label: string;
    rawApiKey: string;
    projectId?: string;
    supportedModels: string[];
    priority: number;
    weight: number;
    adminId: string;
  }): AICredential {
    // Mask key immediately: keep prefix and last 4 chars
    const masked =
      data.rawApiKey.length > 8
        ? `${data.rawApiKey.substring(0, 8)}...${data.rawApiKey.slice(-4)}`
        : "AIzaSy...****";

    const newCred: AICredential = {
      id: `cred-${Date.now()}`,
      label: data.label,
      api_key_masked: masked,
      project_id: data.projectId,
      supported_models: data.supportedModels,
      status: "active",
      priority: data.priority,
      weight: data.weight,
      daily_request_count: 0,
      total_tokens_used: 0,
      health_status: "healthy",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.aiCredentials.push(newCred);

    this.logAudit({
      actor_id: data.adminId,
      actor_name: "Platform Admin",
      actor_role: "platform_admin",
      action: "AI_CREDENTIAL_CREATED",
      resource_type: "ai_credential",
      resource_id: newCred.id,
      details: { label: newCred.label, models: newCred.supported_models, priority: newCred.priority },
    });

    return newCred;
  }

  updateAICredentialStatus(id: string, status: AICredential["status"], adminId: string): AICredential {
    const cred = this.getAICredentialById(id);
    if (!cred) throw new Error("Credential not found");
    cred.status = status;
    cred.updated_at = new Date().toISOString();

    this.logAudit({
      actor_id: adminId,
      actor_name: "Platform Admin",
      actor_role: "platform_admin",
      action: `AI_CREDENTIAL_${status.toUpperCase()}`,
      resource_type: "ai_credential",
      resource_id: id,
      details: { status },
    });

    return cred;
  }

  deleteAICredential(id: string, adminId: string): boolean {
    const initial = this.aiCredentials.length;
    this.aiCredentials = this.aiCredentials.filter((c) => c.id !== id);
    if (this.aiCredentials.length < initial) {
      this.logAudit({
        actor_id: adminId,
        actor_name: "Platform Admin",
        actor_role: "platform_admin",
        action: "AI_CREDENTIAL_DELETED",
        resource_type: "ai_credential",
        resource_id: id,
        details: {},
      });
      return true;
    }
    return false;
  }

  logAIUsage(log: Omit<AIUsageLog, "id" | "created_at">): AIUsageLog {
    const newLog: AIUsageLog = {
      ...log,
      id: `ailog-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
    };
    this.aiUsageLogs.unshift(newLog);

    // Update credential token counts
    const cred = this.getAICredentialById(log.credential_id);
    if (cred) {
      cred.daily_request_count += 1;
      cred.total_tokens_used += (log.input_tokens || 0) + (log.output_tokens || 0);
      cred.last_used_at = newLog.created_at;
    }

    return newLog;
  }

  getAIUsageLogs(schoolId?: string): AIUsageLog[] {
    if (schoolId) return this.aiUsageLogs.filter((l) => l.school_id === schoolId);
    return this.aiUsageLogs;
  }

  // AUDIT LOGS
  logAudit(log: Omit<AuditLog, "id" | "created_at">): AuditLog {
    const newLog: AuditLog = {
      ...log,
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
    };
    this.auditLogs.unshift(newLog);
    return newLog;
  }

  getAuditLogs(schoolId?: string): AuditLog[] {
    if (schoolId) return this.auditLogs.filter((a) => a.school_id === schoolId);
    return this.auditLogs;
  }

  // PLATFORM METRICS
  getPlatformStats() {
    return {
      totalSchools: this.schools.length,
      activeSchools: this.schools.filter((s) => s.status === "active").length,
      pendingVerificationSchools: this.schools.filter((s) => s.verification_status === "pending_verification").length,
      totalTeachers: this.users.filter((u) => u.role === "teacher").length,
      totalStudents: this.users.filter((u) => u.role === "student").length,
      totalClasses: this.classes.length,
      totalExaminations: this.examinations.length,
      totalQuestions: this.questions.length,
      totalAIRequests: this.aiUsageLogs.length,
      aiSuccessRate:
        this.aiUsageLogs.length > 0
          ? Math.round(
              (this.aiUsageLogs.filter((l) => l.success).length / this.aiUsageLogs.length) * 100
            )
          : 100,
      activeAICredentials: this.aiCredentials.filter((c) => c.status === "active").length,
    };
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

export const repository = new DataStore();
