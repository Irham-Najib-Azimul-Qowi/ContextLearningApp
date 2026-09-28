import {
  School,
  UserProfile,
  ClassRoom,
  ClassMembership,
  Question,
  QuestionItem,
  getQuestionItems,
  LearningMaterial,
  Exam,
  ExamAttempt,
  AppNotification,
  UserRole,
  LearningRoom,
} from "./types";

// ==============================================================================
// INITIAL SEED DATA (Madiun Residency & Ponorogo Focus)
// ==============================================================================

const SEED_SCHOOLS: School[] = [
  {
    id: "sch-ponorogo-01",
    name: "SD Negeri 1 Ponorogo",
    slug: "sdn-1-ponorogo",
    region_id: "35.02",
    region_name: "Kabupaten Ponorogo",
    address: "Jl. Diponegoro No. 12, Mangkujayan, Ponorogo",
    created_at: "2026-09-01T08:00:00Z",
  },
  {
    id: "sch-madiun-01",
    name: "SD Negeri 001 Madiun",
    slug: "sdn-001-madiun",
    region_id: "35.77",
    region_name: "Kota Madiun",
    address: "Jl. Pahlawan No. 45, Kartoharjo, Madiun",
    created_at: "2026-09-01T08:00:00Z",
  },
  {
    id: "sch-semarang-01",
    name: "SD Negeri 1 Semarang Tengah",
    slug: "sdn-1-semarang-tengah",
    region_id: "33.74",
    region_name: "Kota Semarang",
    address: "Jl. Pemuda No. 12, Semarang Tengah, Kota Semarang",
    created_at: "2026-09-01T08:00:00Z",
  },
  {
    id: "school-individual",
    name: "Workspace Pembelajaran Mandiri",
    slug: "workspace-mandiri",
    region_id: "33.74",
    region_name: "Kota Semarang",
    address: "Penggunaan Mandiri / Perorangan",
    created_at: "2026-09-01T08:00:00Z",
  },
];

const SEED_USERS: UserProfile[] = [
  {
    id: "usr-teacher-01",
    email: "siti.aminah@sdn1ponorogo.sch.id",
    full_name: "Ibu Siti Aminah, S.Pd.",
    role: "TEACHER",
    avatar_url: "",
    school_id: "sch-ponorogo-01",
  },
  {
    id: "usr-student-01",
    email: "budi.santoso@siswa.pahami.id",
    full_name: "Budi Santoso",
    role: "STUDENT",
    avatar_url: "",
    school_id: "sch-ponorogo-01",
  },
];

const SEED_CLASSES: ClassRoom[] = [
  {
    id: "cls-pnr-5a",
    name: "Kelas 5A (Matematika & IPAS)",
    grade: 5,
    school_id: "sch-ponorogo-01",
    teacher_id: "usr-teacher-01",
    teacher_name: "Ibu Siti Aminah, S.Pd.",
    subject: "Matematika & IPAS",
    code: "PNR-5A",
    student_count: 24,
    academic_year: "2025/2026",
    created_at: "2026-09-02T08:00:00Z",
  },
  {
    id: "cls-pnr-5b",
    name: "Kelas 5B (Bahasa Indonesia)",
    grade: 5,
    school_id: "sch-ponorogo-01",
    teacher_id: "usr-teacher-01",
    teacher_name: "Ibu Siti Aminah, S.Pd.",
    subject: "Bahasa Indonesia",
    code: "PNR-5B",
    student_count: 22,
    academic_year: "2025/2026",
    created_at: "2026-09-02T08:00:00Z",
  },
];

const SEED_MEMBERSHIPS: ClassMembership[] = [
  {
    id: "mem-01",
    class_id: "cls-pnr-5a",
    student_id: "usr-student-01",
    student_name: "Budi Santoso",
    joined_at: "2026-09-03T09:00:00Z",
  },
];

const SEED_QUESTIONS: Question[] = [
  {
    id: "q-pnr-01",
    school_id: "sch-ponorogo-01",
    teacher_id: "usr-teacher-01",
    subject: "Matematika",
    grade: 5,
    topic: "Aritmetika Sosial & Perkalian Bilangan Bulat",
    type: "multiple_choice",
    question_text:
      "Seorang pedagang hasil bumi di Pasar Legi Ponorogo membeli 20 kg porang dengan harga Rp12.000 per kilogram dari petani di Kecamatan Pudak. Berapakah total uang yang harus dibayarkan pedagang tersebut?",
    options: [
      { key: "A", text: "Rp220.000" },
      { key: "B", text: "Rp240.000" },
      { key: "C", text: "Rp260.000" },
      { key: "D", text: "Rp280.000" },
    ],
    correct_answer: "B",
    explanation:
      "Perhitungan total pembelian: 20 kg × Rp12.000/kg = Rp240.000. Konteks lokal: porang dan sentra pertanian Pudak Ponorogo.",
    is_contextualized: true,
    original_question_text:
      "Seorang pedagang membeli 20 kg beras dengan harga Rp12.000 per kilogram. Berapa total uang yang harus dibayarkan?",
    context_variables: [
      {
        text: "beras",
        category: "commodity",
        original_value: "beras",
        replacement_value: "porang",
        region_id: "35.02",
        region_name: "Kabupaten Ponorogo",
      },
      {
        text: "pasar",
        category: "location",
        original_value: "pasar kota",
        replacement_value: "Pasar Legi Ponorogo",
        region_id: "35.02",
        region_name: "Kabupaten Ponorogo",
      },
    ],
    created_at: "2026-09-05T10:00:00Z",
    items: [
      {
        id: "q-pnr-01-item-1",
        type: "multiple_choice",
        question_text:
          "Seorang pedagang hasil bumi di Pasar Legi Ponorogo membeli 20 kg porang dengan harga Rp12.000 per kilogram dari petani di Kecamatan Pudak. Berapakah total uang yang harus dibayarkan pedagang tersebut?",
        options: [
          { key: "A", text: "Rp220.000" },
          { key: "B", text: "Rp240.000" },
          { key: "C", text: "Rp260.000" },
          { key: "D", text: "Rp280.000" },
        ],
        correct_answer: "B",
        explanation:
          "Perhitungan total pembelian: 20 kg × Rp12.000/kg = Rp240.000. Konteks lokal: porang dan sentra pertanian Pudak Ponorogo.",
      },
    ],
  },
  {
    id: "q-pnr-02",
    school_id: "sch-ponorogo-01",
    teacher_id: "usr-teacher-01",
    subject: "IPS",
    grade: 5,
    topic: "Kekayaan Budaya & Kesenian Daerah",
    type: "multiple_choice",
    question_text:
      "Kesenian tradisional khas Ponorogo yang terkenal hingga mancanegara menampilkan tokoh Singo Barong dengan topeng bulu merak berbobot puluhan kilogram dinamakan kesenian...",
    options: [
      { key: "A", text: "Tari Gandrung" },
      { key: "B", text: "Reog Ponorogo" },
      { key: "C", text: "Kuda Lumping" },
      { key: "D", text: "Wayang Orang" },
    ],
    correct_answer: "B",
    explanation:
      "Reog Ponorogo adalah kesenian adiluhung asli Ponorogo yang memadukan keperkasaan Singo Barong, penari Jathil, dan Warok.",
    is_contextualized: true,
    original_question_text:
      "Kesenian tradisional yang menggunakan topeng singa dan bulu merak adalah...",
    context_variables: [
      {
        text: "kesenian daerah",
        category: "tradition",
        original_value: "kesenian daerah",
        replacement_value: "Reog Ponorogo",
        region_id: "35.02",
        region_name: "Kabupaten Ponorogo",
      },
    ],
    created_at: "2026-09-05T10:30:00Z",
    items: [
      {
        id: "q-pnr-02-item-1",
        type: "multiple_choice",
        question_text:
          "Kesenian tradisional khas Ponorogo yang terkenal hingga mancanegara menampilkan tokoh Singo Barong dengan topeng bulu merak berbobot puluhan kilogram dinamakan kesenian...",
        options: [
          { key: "A", text: "Tari Gandrung" },
          { key: "B", text: "Reog Ponorogo" },
          { key: "C", text: "Kuda Lumping" },
          { key: "D", text: "Wayang Orang" },
        ],
        correct_answer: "B",
        explanation:
          "Reog Ponorogo adalah kesenian adiluhung asli Ponorogo yang memadukan keperkasaan Singo Barong, penari Jathil, dan Warok.",
      },
    ],
  },
  {
    id: "q-pnr-03",
    school_id: "sch-ponorogo-01",
    teacher_id: "usr-teacher-01",
    subject: "Bahasa Indonesia",
    grade: 5,
    topic: "Paragraf Deskripsi & Kearifan Lingkungan",
    type: "essay",
    question_text:
      "Jelaskan daya tarik alam dan tradisi Larung Sesaji yang dilakukan masyarakat di sekitar Telaga Ngebel Ponorogo setiap tanggal satu Suro!",
    correct_answer: "",
    explanation:
      "Siswa diharapkan mampu mendeskripsikan Telaga Ngebel sebagai danau alami di kaki Gunung Wilis Ponorogo dan tradisi syukuran Larung Sesaji.",
    rubric:
      "Skor 100: Menyebutkan letak Telaga Ngebel dan makna tradisi Larung Sesaji dengan runtut. Skor 75: Menyebutkan salah satu aspek dengan jelas. Skor 50: Menyebutkan deskripsi umum.",
    is_contextualized: true,
    original_question_text:
      "Jelaskan daya tarik wisata dan tradisi syukuran di daerah danau wisata!",
    created_at: "2026-09-05T11:00:00Z",
    items: [
      {
        id: "q-pnr-03-item-1",
        type: "essay",
        question_text:
          "Jelaskan daya tarik alam dan tradisi Larung Sesaji yang dilakukan masyarakat di sekitar Telaga Ngebel Ponorogo setiap tanggal satu Suro!",
        correct_answer: "",
        explanation:
          "Siswa diharapkan mampu mendeskripsikan Telaga Ngebel sebagai danau alami di kaki Gunung Wilis Ponorogo dan tradisi syukuran Larung Sesaji.",
        rubric:
          "Skor 100: Menyebutkan letak Telaga Ngebel dan makna tradisi Larung Sesaji dengan runtut. Skor 75: Menyebutkan salah satu aspek dengan jelas. Skor 50: Menyebutkan deskripsi umum.",
      },
    ],
  },
  {
    id: "q-pnr-04",
    school_id: "sch-ponorogo-01",
    teacher_id: "usr-teacher-01",
    subject: "IPS",
    grade: 5,
    topic: "Kearifan Budaya & Ekonomi Kerakyatan Ponorogo",
    type: "mixed",
    question_text:
      "Paket Evaluasi Tematik: Kebudayaan Reog dan Potensi Komoditas Peternakan Ponorogo",
    options: [
      { key: "A", text: "Kecamatan Pudak" },
      { key: "B", text: "Kecamatan Babadan" },
      { key: "C", text: "Kecamatan Kauman" },
      { key: "D", text: "Kecamatan Sukorejo" },
    ],
    correct_answer: "A",
    explanation:
      "Kecamatan Pudak di dataran tinggi lereng Wilis terkenal sebagai sentra penghasil susu sapi perah terbesar di Ponorogo.",
    is_contextualized: true,
    created_at: "2026-09-06T08:00:00Z",
    items: [
      {
        id: "q-pnr-04-item-1",
        type: "multiple_choice",
        question_text:
          "Kecamatan di Kabupaten Ponorogo yang terletak di dataran tinggi lereng Gunung Wilis dan terkenal sebagai sentra peternakan sapi perah penghasil susu segar adalah...",
        options: [
          { key: "A", text: "Kecamatan Pudak" },
          { key: "B", text: "Kecamatan Babadan" },
          { key: "C", text: "Kecamatan Kauman" },
          { key: "D", text: "Kecamatan Sukorejo" },
        ],
        correct_answer: "A",
        explanation:
          "Kecamatan Pudak berada di dataran tinggi dengan iklim sejuk, sangat cocok untuk peternakan sapi perah.",
      },
      {
        id: "q-pnr-04-item-2",
        type: "multiple_choice",
        question_text:
          "Tokoh dalam kesenian Reog Ponorogo yang melambangkan sosok berilmu, bijaksana, dan berbudi luhur serta mengenakan pakaian serba hitam adalah...",
        options: [
          { key: "A", text: "Warok" },
          { key: "B", text: "Jathil" },
          { key: "C", text: "Bujang Ganong" },
          { key: "D", text: "Klono Sewandono" },
        ],
        correct_answer: "A",
        explanation:
          "Warok adalah figur sentral berwibawa dalam Reog Ponorogo yang memiliki olah kebatinan dan keteguhan budi pekerti.",
      },
      {
        id: "q-pnr-04-item-3",
        type: "essay",
        question_text:
          "Jelaskan bagaimana festival kebudayaan Reog Ponorogo yang diadakan secara rutin dapat mendorong perputaran ekonomi bagi UMKM kuliner dan pedagang oleh-oleh khas daerah!",
        rubric:
          "Skor 100 jika menguraikan kedatangan wisatawan, peningkatan omzet pedagang makanan/kuliner lokal (seperti sate Ponorogo dan dawet Jabung), serta cenderamata. Skor 50 jika menyebutkan secara ringkas.",
        explanation:
          "Pagelaran Reog berskala nasional/internasional mendatangkan ribuan penonton yang membelanjakan uangnya pada sektor transportasi, penginapan, kuliner khas, dan kerajinan tangan lokal.",
      },
    ],
  },
];

const SEED_MATERIALS: LearningMaterial[] = [
  {
    id: "mat-pnr-01",
    school_id: "sch-ponorogo-01",
    teacher_id: "usr-teacher-01",
    title: "Potensi Geografis & Komoditas Unggulan Ponorogo",
    subject: "IPS",
    grade: 5,
    content:
      "Kabupaten Ponorogo memiliki kondisi geografis yang subur dan beragam. Di dataran tinggi seperti Kecamatan Pudak, udaranya yang sejuk sangat mendukung peternakan sapi perah penghasil susu segar berkualitas dan perkebunan sayuran. Sementara di daerah lereng perbukitan, petani Ponorogo membudidayakan tanaman porang yang kini menjadi komoditas ekspor berharga tinggi. Kehidupan ekonomi masyarakat Ponorogo sangat erat kaitannya dengan pengelolaan sumber daya alam lokal.",
    is_contextualized: true,
    original_content:
      "Setiap daerah memiliki kondisi geografis yang berbeda. Ada daerah pegunungan penghasil sayuran dan peternakan, serta dataran rendah penghasil padi.",
    published_to_classes: ["cls-pnr-5a"],
    created_at: "2026-09-04T09:00:00Z",
  },
];

const SEED_EXAMS: Exam[] = [
  {
    id: "exam-pnr-01",
    title: "Penilaian Harian Matematika & IPAS Kontekstual Ponorogo",
    school_id: "sch-ponorogo-01",
    class_id: "cls-pnr-5a",
    class_name: "Kelas 5A (Matematika & IPAS)",
    subject: "Matematika & IPAS",
    teacher_id: "usr-teacher-01",
    duration_minutes: 30,
    start_time: "2026-09-20T08:00:00Z",
    end_time: "2026-10-30T23:59:59Z",
    status: "published",
    question_ids: ["q-pnr-01", "q-pnr-02", "q-pnr-03"],
    created_at: "2026-09-06T14:00:00Z",
  },
];

const SEED_ATTEMPTS: ExamAttempt[] = [
  {
    id: "att-budi-01",
    exam_id: "exam-pnr-01",
    student_id: "usr-student-01",
    student_name: "Budi Santoso",
    answers: {
      "q-pnr-01": "B",
      "q-pnr-02": "B",
      "q-pnr-03":
        "Telaga Ngebel adalah danau alami yang indah di kaki Gunung Wilis Ponorogo. Setiap tanggal satu Suro, masyarakat mengadakan Larung Sesaji sebagai wujud rasa syukur atas rezeki dan hasil panen.",
    },
    score: 95,
    max_score: 100,
    mc_score: 60,
    essay_score: 35,
    status: "graded",
    started_at: "2026-09-21T08:10:00Z",
    submitted_at: "2026-09-21T08:35:00Z",
    teacher_feedback: "Sangat baik, Budi! Jawaban esai sangat runut dan mencerminkan pemahaman budaya lokal.",
  },
];

const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-01",
    user_id: "usr-teacher-01",
    title: "Ujian Selesai Dikerjakan",
    message: "Budi Santoso telah menyelesaikan Penilaian Harian Matematika & IPAS.",
    read: false,
    link: "/teacher/examinations",
    created_at: "2026-09-21T08:36:00Z",
  },
  {
    id: "notif-02",
    user_id: "usr-student-01",
    title: "Nilai Ujian Tersedia",
    message: "Ibu Siti Aminah telah merilis nilai dan pembahasan ujian Anda (Skor: 95/100).",
    read: false,
    link: "/student/examinations/exam-pnr-01/results",
    created_at: "2026-09-21T10:00:00Z",
  },
];

const SEED_ROOMS: LearningRoom[] = [
  {
    id: "room01",
    code: "mtr3502",
    title: "Potensi Geografis & Komoditas Unggulan Ponorogo",
    type: "material",
    resource_id: "mat-pnr-01",
    subject: "IPS",
    grade: 5,
    region_name: "Kabupaten Ponorogo",
    teacher_id: "usr-teacher-01",
    teacher_name: "Ibu Siti Aminah, S.Pd.",
    access_count: 14,
    created_at: "2026-09-20T08:00:00Z",
    visitors: [
      { name: "Budi Santoso", accessed_at: "2026-09-21T09:15:00Z", completed: true },
      { name: "Anisa Rahma", accessed_at: "2026-09-21T10:30:00Z", completed: true },
      { name: "Dimas Anggara", accessed_at: "2026-09-22T08:00:00Z", completed: true },
    ],
  },
  {
    id: "room02",
    code: "sol5021",
    title: "Latihan Soal Matematika Pasar & Budaya Ponorogo",
    type: "question",
    resource_id: "q-pnr-01",
    subject: "Matematika",
    grade: 5,
    region_name: "Kabupaten Ponorogo",
    teacher_id: "usr-teacher-01",
    teacher_name: "Ibu Siti Aminah, S.Pd.",
    access_count: 19,
    created_at: "2026-09-20T09:00:00Z",
    visitors: [
      { name: "Budi Santoso", accessed_at: "2026-09-21T09:20:00Z", score: 95, completed: true },
      { name: "Citra Lestari", accessed_at: "2026-09-21T11:05:00Z", score: 90, completed: true },
    ],
  },
];

// ==============================================================================
// REPOSITORY CLASS (Persistent Storage & Fallback)
// ==============================================================================

class PahamiRepository {
  private memoryCache: Map<string, any> = new Map();

  private isBrowser(): boolean {
    return typeof window !== "undefined" && typeof localStorage !== "undefined";
  }

  private getItem<T>(key: string, defaultValue: T): T {
    if (!this.isBrowser()) {
      if (this.memoryCache.has(key)) {
        return this.memoryCache.get(key) as T;
      }
      return defaultValue;
    }
    try {
      const data = localStorage.getItem(`pahami_v2_${key}`);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    this.memoryCache.set(key, value);
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(`pahami_v2_${key}`, JSON.stringify(value));
    } catch (e) {
      console.warn("localStorage quota or access error", e);
    }
  }

  // --- DELETED IDS TOMBSTONES ---
  getDeletedIds(): { materials: string[]; questions: string[]; rooms: string[] } {
    return this.getItem("deleted_ids", { materials: [], questions: [], rooms: [] });
  }

  addDeletedId(type: "material" | "question" | "room", id: string): void {
    const current = this.getDeletedIds();
    if (type === "material") {
      current.materials = Array.from(new Set([...(current.materials || []), id]));
    } else if (type === "question") {
      current.questions = Array.from(new Set([...(current.questions || []), id]));
    } else if (type === "room") {
      current.rooms = Array.from(new Set([...(current.rooms || []), id.toLowerCase()]));
    }
    this.setItem("deleted_ids", current);
  }

  removeDeletedId(type: "material" | "question" | "room", id: string): void {
    const current = this.getDeletedIds();
    if (type === "material") {
      current.materials = (current.materials || []).filter((x) => x !== id);
    } else if (type === "question") {
      current.questions = (current.questions || []).filter((x) => x !== id);
    } else if (type === "room") {
      current.rooms = (current.rooms || []).filter((x) => x !== id.toLowerCase());
    }
    this.setItem("deleted_ids", current);
  }

  // --- CLOUD SYNCHRONIZATION (Cross-Device 2-Way Sync via Supabase & Route Handler) ---
  private syncDebounceTimer: any = null;
  private isSyncing: boolean = false;

  async syncToCloudImmediate(options?: {
    forceOverwrite?: boolean;
    deletedItem?: { type: "material" | "question" | "room"; id: string };
  }): Promise<void> {
    if (!this.isBrowser()) return;
    if (this.syncDebounceTimer) {
      clearTimeout(this.syncDebounceTimer);
      this.syncDebounceTimer = null;
    }

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) return;

      const profileRaw = localStorage.getItem("pahami_v2_teacher_profile");
      const profile = profileRaw ? JSON.parse(profileRaw) : null;
      const materials = this.getMaterials();
      const questions = this.getQuestions();
      const rooms = this.getRooms();
      const schools = this.getSchools();
      const activeSchoolId = this.getActiveSchoolId();
      const deletedIds = this.getDeletedIds();

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const res = await fetch("/api/sync/user-data", {
        method: "POST",
        headers,
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          materials,
          questions,
          rooms,
          schools,
          activeSchool: activeSchoolId,
          profile,
          onboardingCompleted: true,
          forceOverwrite: options?.forceOverwrite,
          deletedItem: options?.deletedItem,
          deletedIds,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          this.applyAuthoritativeCloudData(json.data);
        }
      } else {
        const errText = await res.text();
        console.warn("[Cloud Sync Immediate Failed]", res.status, errText);
      }
    } catch (err) {
      console.warn("Immediate sync to cloud error:", err);
    }
  }

  async syncToCloud(options?: {
    forceOverwrite?: boolean;
    deletedItem?: { type: "material" | "question" | "room"; id: string };
  }): Promise<void> {
    if (!this.isBrowser()) return;
    if (this.syncDebounceTimer) {
      clearTimeout(this.syncDebounceTimer);
    }

    return new Promise((resolve) => {
      this.syncDebounceTimer = setTimeout(async () => {
        try {
          await this.syncToCloudImmediate(options);
        } finally {
          resolve();
        }
      }, 300);
    });
  }

  async syncWithCloud(): Promise<boolean> {
    if (!this.isBrowser() || this.isSyncing) return false;
    this.isSyncing = true;
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) {
        this.isSyncing = false;
        return false;
      }

      const profileRaw = localStorage.getItem("pahami_v2_teacher_profile");
      const profile = profileRaw ? JSON.parse(profileRaw) : null;
      const materials = this.getMaterials();
      const questions = this.getQuestions();
      const rooms = this.getRooms();
      const schools = this.getSchools();
      const activeSchoolId = this.getActiveSchoolId();
      const deletedIds = this.getDeletedIds();

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      // Safe two-way sync: sends local state and tombstones, server reconciles conflict-free union
      const res = await fetch("/api/sync/user-data", {
        method: "POST",
        headers,
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          materials,
          questions,
          rooms,
          schools,
          activeSchool: activeSchoolId,
          profile,
          onboardingCompleted: true,
          deletedIds,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          this.applyAuthoritativeCloudData(json.data);
          return true;
        }
      } else {
        const errText = await res.text();
        console.warn("[Cross-device syncWithCloud Failed]", res.status, errText);
      }
      return false;
    } catch (err) {
      console.warn("Cross-device syncWithCloud error:", err);
      return false;
    } finally {
      this.isSyncing = false;
    }
  }

  async syncFromCloud(): Promise<boolean> {
    return this.syncWithCloud();
  }

  private applyAuthoritativeCloudData(cloudData: any): void {
    if (!this.isBrowser() || !cloudData) return;
    const { materials, questions, rooms, schools, activeSchool, profile, onboardingCompleted, deletedIds } = cloudData;
    let hasChanges = false;

    if (deletedIds && typeof deletedIds === "object") {
      const currentDeleted = this.getDeletedIds();
      const mergedDeleted = {
        materials: Array.from(new Set([...(currentDeleted.materials || []), ...(deletedIds.materials || [])])),
        questions: Array.from(new Set([...(currentDeleted.questions || []), ...(deletedIds.questions || [])])),
        rooms: Array.from(new Set([...(currentDeleted.rooms || []), ...(deletedIds.rooms || [])])),
      };
      this.setItem("deleted_ids", mergedDeleted);
    }

    const currentTombstones = this.getDeletedIds();

    if (onboardingCompleted) {
      localStorage.setItem("pahami_v2_onboarding_completed", "true");
    }

    if (profile && typeof profile === "object") {
      const existingRaw = localStorage.getItem("pahami_v2_teacher_profile");
      const existing = existingRaw ? JSON.parse(existingRaw) : {};
      const mergedProfile = { ...existing, ...profile };
      localStorage.setItem("pahami_v2_teacher_profile", JSON.stringify(mergedProfile));
      hasChanges = true;
    }

    if (Array.isArray(schools) && schools.length > 0) {
      this.setItem<School[]>("schools", schools);
      hasChanges = true;
    }

    if (activeSchool) {
      this.setActiveSchoolId(activeSchool);
      hasChanges = true;
    }

    if (Array.isArray(materials)) {
      const cleanMats = materials.filter((m) => !currentTombstones.materials.includes(m.id));
      this.setItem<LearningMaterial[]>("materials", cleanMats);
      hasChanges = true;
    }

    if (Array.isArray(questions)) {
      const cleanQs = questions.filter((q) => !currentTombstones.questions.includes(q.id));
      this.setItem<Question[]>("questions", cleanQs);
      hasChanges = true;
    }

    if (Array.isArray(rooms)) {
      const cleanRooms = rooms.filter(
        (r) =>
          !currentTombstones.rooms.includes((r.id || "").toLowerCase()) &&
          !currentTombstones.rooms.includes((r.code || "").toLowerCase())
      );
      this.setItem<LearningRoom[]>("rooms", cleanRooms);
      hasChanges = true;
    }

    if (hasChanges) {
      window.dispatchEvent(new CustomEvent("repositorySyncCompleted"));
    }
  }

  // --- SCHOOLS ---
  getSchools(): School[] {
    return this.getItem<School[]>("schools", SEED_SCHOOLS);
  }

  getSchool(id: string): School | undefined {
    return this.getSchools().find((s) => s.id === id);
  }

  getActiveSchoolId(): string {
    return this.getItem<string>("active_school_id", SEED_SCHOOLS[0].id);
  }

  setActiveSchoolId(id: string): void {
    this.setItem<string>("active_school_id", id);
  }

  addSchool(school: School): void {
    const schools = this.getSchools();
    const existingIndex = schools.findIndex((s) => s.id === school.id);
    if (existingIndex >= 0) {
      schools[existingIndex] = school;
    } else {
      schools.unshift(school);
    }
    this.setItem<School[]>("schools", schools);
    this.setActiveSchoolId(school.id);
    this.syncToCloud();
  }

  getActiveSchool(): School {
    if (this.isBrowser()) {
      try {
        const storedProfile = localStorage.getItem("pahami_v2_teacher_profile");
        if (storedProfile) {
          const parsed = JSON.parse(storedProfile);
          if (parsed && parsed.schoolName) {
            return {
              id: parsed.schoolId || "school-active",
              name: parsed.schoolName,
              slug: parsed.schoolName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
              region_id: parsed.regionId || "35.77",
              region_name: parsed.regionName || "Kota Madiun",
              address: `${parsed.regionName || "Kota Madiun"}, ${parsed.province || "Jawa Timur"}`,
              created_at: new Date().toISOString(),
            };
          }
        }
      } catch {
        // Fallback
      }
    }
    const id = this.getActiveSchoolId();
    return this.getSchool(id) || SEED_SCHOOLS[0];
  }

  // --- USERS & ROLES ---
  getProfiles(): UserProfile[] {
    return this.getItem<UserProfile[]>("profiles", SEED_USERS);
  }

  getUsers(): UserProfile[] {
    return this.getProfiles();
  }

  getCurrentRole(): UserRole {
    return this.getItem<UserRole>("current_role", "TEACHER");
  }

  setCurrentRole(role: UserRole): void {
    this.setItem<UserRole>("current_role", role);
  }

  setCurrentUser(profile: UserProfile): void {
    const profiles = this.getProfiles();
    const existingIndex = profiles.findIndex((p) => p.role === profile.role);
    if (existingIndex >= 0) {
      profiles[existingIndex] = { ...profiles[existingIndex], ...profile };
    } else {
      profiles.unshift(profile);
    }
    this.setItem<UserProfile[]>("profiles", profiles);
    this.setCurrentRole(profile.role);

    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem("pahami_v2_teacher_profile");
        const existingData = stored ? JSON.parse(stored) : {};
        localStorage.setItem(
          "pahami_v2_teacher_profile",
          JSON.stringify({
            ...existingData,
            fullName: profile.full_name,
            full_name: profile.full_name,
            email: profile.email,
            avatarUrl: profile.avatar_url,
            avatar_url: profile.avatar_url,
            schoolId: profile.school_id,
          })
        );
        window.dispatchEvent(new CustomEvent("userProfileChange", { detail: profile }));
      } catch {
        // Fallback
      }
    }
  }

  updateUserProfile(
    data: Partial<UserProfile> & {
      fullName?: string;
      avatarUrl?: string;
      schoolName?: string;
      usageMode?: "individual" | "school";
      regionId?: string;
      regionName?: string;
      province?: string;
    }
  ): UserProfile {
    const current = this.getCurrentUser();
    const updated: UserProfile = {
      ...current,
      ...data,
      full_name: data.full_name || data.fullName || current.full_name,
      avatar_url: data.avatar_url !== undefined ? data.avatar_url : current.avatar_url,
      email: data.email || current.email,
    };

    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem("pahami_v2_teacher_profile");
        const existingData = stored ? JSON.parse(stored) : {};
        const merged = {
          ...existingData,
          fullName: updated.full_name,
          full_name: updated.full_name,
          email: updated.email,
          avatarUrl: updated.avatar_url,
          avatar_url: updated.avatar_url,
          schoolId: updated.school_id,
          schoolName: data.schoolName !== undefined ? data.schoolName : existingData.schoolName,
          usageMode: data.usageMode !== undefined ? data.usageMode : existingData.usageMode,
          regionId: data.regionId !== undefined ? data.regionId : existingData.regionId,
          regionName: data.regionName !== undefined ? data.regionName : existingData.regionName,
          province: data.province !== undefined ? data.province : existingData.province,
        };
        localStorage.setItem("pahami_v2_teacher_profile", JSON.stringify(merged));
        window.dispatchEvent(new CustomEvent("userProfileChange", { detail: updated }));
      } catch {
        // Fallback
      }
    }

    this.setCurrentUser(updated);
    this.syncToCloud();
    return updated;
  }

  getCurrentUser(): UserProfile {
    const role = this.getCurrentRole();
    if (role === "TEACHER" && this.isBrowser()) {
      try {
        // 1. Cek apakah ada sesi Supabase aktif dari Google OAuth di localStorage
        let authUser: any = null;
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("sb-") && key.endsWith("-auth-token")) {
            const raw = localStorage.getItem(key);
            if (raw) {
              try {
                const sessionData = JSON.parse(raw);
                if (sessionData?.user) {
                  authUser = sessionData.user;
                  break;
                }
              } catch {
                // Ignore parse error
              }
            }
          }
        }

        const storedProfileRaw = localStorage.getItem("pahami_v2_teacher_profile");
        const parsed = storedProfileRaw ? JSON.parse(storedProfileRaw) : null;

        if (authUser) {
          const meta = authUser.user_metadata || {};
          const displayName =
            parsed?.fullName ||
            parsed?.full_name ||
            meta.full_name ||
            meta.name ||
            meta.display_name ||
            (authUser.email ? authUser.email.split("@")[0] : "Guru");
          const avatar =
            parsed?.avatarUrl ||
            parsed?.avatar_url ||
            meta.avatar_url ||
            meta.picture ||
            "/images/dashboard/teacher-avatar.jpg";

          return {
            id: authUser.id,
            email: authUser.email || parsed?.email || "guru@depaskan.id",
            full_name: typeof displayName === "string" ? displayName.trim() : "Guru",
            role: "TEACHER",
            avatar_url: avatar,
            school_id: parsed?.schoolId || "school-active",
          };
        }

        // 2. Fallback ke profil guru lokal jika belum ada sesi OAuth
        if (parsed) {
          const name = parsed.fullName || parsed.full_name;
          if (name && name.trim()) {
            return {
              id: parsed.id || "usr-teacher-active",
              email: parsed.email || "guru@depaskan.id",
              full_name: name.trim(),
              role: "TEACHER",
              avatar_url: parsed.avatarUrl || parsed.avatar_url || "/images/dashboard/teacher-avatar.jpg",
              school_id: parsed.schoolId || "school-active",
            };
          }
        }
      } catch {
        // Fallback
      }
    }
    const profiles = this.getProfiles();
    const active = profiles.find((p) => p.role === role);
    return active || (role === "TEACHER" ? SEED_USERS[0] : SEED_USERS[1]);
  }

  // --- LAST CONTEXT MODE (Material vs Question) ---
  getLastContextMode(): "material" | "question" {
    return this.getItem<"material" | "question">("last_context_mode", "material");
  }

  setLastContextMode(mode: "material" | "question"): void {
    this.setItem<"material" | "question">("last_context_mode", mode);
    if (this.isBrowser()) {
      try {
        window.dispatchEvent(new CustomEvent("contextModeChange", { detail: mode }));
      } catch {
        // Fallback
      }
    }
  }

  // --- CLASSES ---
  getClasses(schoolId?: string): ClassRoom[] {
    const classes = this.getItem<ClassRoom[]>("classes", SEED_CLASSES);
    if (!schoolId) return classes;
    return classes.filter((c) => c.school_id === schoolId);
  }

  getClass(id: string): ClassRoom | undefined {
    return this.getClasses().find((c) => c.id === id);
  }

  createClass(data: Omit<ClassRoom, "id" | "code" | "student_count" | "created_at">): ClassRoom {
    const classes = this.getClasses();
    const randomCode = `PNR-${data.grade}${String.fromCharCode(65 + Math.floor(Math.random() * 4))}`;
    const newClass: ClassRoom = {
      ...data,
      id: `cls-${Date.now()}`,
      code: randomCode,
      student_count: 0,
      created_at: new Date().toISOString(),
    };
    this.setItem<ClassRoom[]>("classes", [newClass, ...classes]);
    return newClass;
  }

  joinClassByCode(studentId: string, studentName: string, code: string): { success: boolean; message: string; classRoom?: ClassRoom } {
    const classes = this.getClasses();
    const target = classes.find((c) => c.code.trim().toUpperCase() === code.trim().toUpperCase());
    if (!target) {
      return { success: false, message: `Kode kelas '${code}' tidak ditemukan.` };
    }

    const memberships = this.getItem<ClassMembership[]>("memberships", SEED_MEMBERSHIPS);
    const already = memberships.some((m) => m.class_id === target.id && m.student_id === studentId);
    if (already) {
      return { success: true, message: "Anda sudah terdaftar di kelas ini.", classRoom: target };
    }

    const newMem: ClassMembership = {
      id: `mem-${Date.now()}`,
      class_id: target.id,
      student_id: studentId,
      student_name: studentName,
      joined_at: new Date().toISOString(),
    };
    this.setItem<ClassMembership[]>("memberships", [newMem, ...memberships]);

    // Update count
    target.student_count += 1;
    this.setItem<ClassRoom[]>("classes", classes);

    return { success: true, message: `Berhasil bergabung ke ${target.name}!`, classRoom: target };
  }

  getStudentClasses(studentId: string): ClassRoom[] {
    const memberships = this.getItem<ClassMembership[]>("memberships", SEED_MEMBERSHIPS);
    const enrolledIds = memberships.filter((m) => m.student_id === studentId).map((m) => m.class_id);
    return this.getClasses().filter((c) => enrolledIds.includes(c.id));
  }

  // --- QUESTIONS ---
  getQuestions(filter?: { schoolId?: string; subject?: string; grade?: number; topic?: string }): Question[] {
    const deleted = this.getDeletedIds().questions || [];
    let questions = this.getItem<Question[]>("questions", SEED_QUESTIONS).filter(
      (q) => !deleted.includes(q.id)
    );
    const currentUser = this.getCurrentUser();
    if (filter) {
      if (filter.schoolId) {
        questions = questions.filter((q) => {
          if (q.school_id === filter.schoolId) return true;
          if (currentUser?.id && currentUser.id !== "usr-teacher-01" && q.teacher_id === currentUser.id) {
            return true;
          }
          return false;
        });
      }
      if (filter.subject) questions = questions.filter((q) => q.subject.toLowerCase() === filter.subject?.toLowerCase());
      if (filter.grade) questions = questions.filter((q) => q.grade === filter.grade);
      if (filter.topic) questions = questions.filter((q) => q.topic.toLowerCase().includes(filter.topic!.toLowerCase()));
    }
    return questions;
  }

  getQuestion(id: string): Question | undefined {
    return this.getQuestions().find((q) => q.id === id);
  }

  getNextQuestionId(): string {
    const questions = this.getQuestions();
    let maxNum = 1000;
    questions.forEach((q) => {
      const match = q.id.match(/(?:sol|q|soal)-?(\d+)/i);
      if (match) {
        const val = parseInt(match[1], 10);
        if (val > maxNum && val < 99999) maxNum = val;
      }
    });
    const nextNum = Math.max(maxNum + 1, 1001);
    return `sol${nextNum}`;
  }

  saveQuestion(
    data: Partial<Question> & {
      school_id: string;
      subject: "Matematika" | "Bahasa Indonesia" | "IPS";
      grade: number;
      topic: string;
      type?: "multiple_choice" | "essay" | "mixed";
      question_text?: string;
      correct_answer?: string;
      explanation?: string;
      items?: QuestionItem[];
    }
  ): Question {
    const questions = this.getQuestions();

    // Normalize items if present
    let items = data.items;
    if (items && items.length > 0) {
      items = items.map((it, idx) => ({
        ...it,
        id: it.id || `item-${Date.now()}-${idx + 1}`,
      }));
    }

    // Determine derived type if items exist
    let resolvedType: "multiple_choice" | "essay" | "mixed" = data.type || "multiple_choice";
    if (items && items.length > 0) {
      const hasMc = items.some((it) => it.type === "multiple_choice");
      const hasEssay = items.some((it) => it.type === "essay");
      if (hasMc && hasEssay) {
        resolvedType = "mixed";
      } else if (hasEssay) {
        resolvedType = "essay";
      } else {
        resolvedType = "multiple_choice";
      }
    }

    const firstItem = items && items.length > 0 ? items[0] : null;
    const resolvedText = data.question_text || (firstItem ? firstItem.question_text : "");
    const resolvedOptions = data.options || (firstItem && firstItem.type === "multiple_choice" ? firstItem.options : []) || [];
    const resolvedAnswer = data.correct_answer !== undefined ? data.correct_answer : (firstItem && firstItem.type === "multiple_choice" ? (firstItem.correct_answer || "A") : "");
    const resolvedExplanation = data.explanation !== undefined ? data.explanation : (firstItem ? (firstItem.explanation || "") : "");
    const resolvedRubric = data.rubric !== undefined ? data.rubric : (firstItem && firstItem.type === "essay" ? firstItem.rubric : undefined);

    if (data.id) {
      const index = questions.findIndex((q) => q.id === data.id);
      if (index !== -1) {
        const updated: Question = {
          ...questions[index],
          ...data,
          type: resolvedType,
          question_text: resolvedText,
          options: resolvedOptions,
          correct_answer: resolvedAnswer,
          explanation: resolvedExplanation,
          rubric: resolvedRubric,
          items: items !== undefined ? items : questions[index].items,
        };
        questions[index] = updated;
        this.setItem<Question[]>("questions", questions);
        this.removeDeletedId("question", data.id);
        this.syncToCloud();
        return updated;
      }
    }
    const current = this.getCurrentUser();
    const cleanQuestionId = (data.id || this.getNextQuestionId())
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    this.removeDeletedId("question", cleanQuestionId);

    const newQuestion: Question = {
      id: cleanQuestionId,
      school_id: data.school_id,
      teacher_id: data.teacher_id || current?.id || "usr-teacher-01",
      subject: data.subject,
      grade: data.grade,
      topic: data.topic,
      type: resolvedType,
      question_text: resolvedText,
      options: resolvedOptions,
      correct_answer: resolvedAnswer,
      explanation: resolvedExplanation,
      rubric: resolvedRubric,
      items: items,
      is_contextualized: data.is_contextualized ?? true,
      image_url: data.image_url,
      image_caption: data.image_caption,
      image_attribution: data.image_attribution,
      image_alt: data.image_alt,
      media_asset: data.media_asset,
      created_at: new Date().toISOString(),
    };
    this.setItem<Question[]>("questions", [newQuestion, ...questions]);
    this.syncToCloud();
    return newQuestion;
  }

  deleteQuestion(id: string): boolean {
    this.addDeletedId("question", id);
    const rawQuestions = this.getItem<Question[]>("questions", SEED_QUESTIONS);
    const filtered = rawQuestions.filter((q) => q.id !== id);
    this.setItem<Question[]>("questions", filtered);
    if (this.isBrowser()) {
      window.dispatchEvent(new CustomEvent("repositorySyncCompleted"));
    }
    this.syncToCloudImmediate({ deletedItem: { type: "question", id } });
    return true;
  }

  async deleteQuestionAsync(id: string): Promise<boolean> {
    const ok = this.deleteQuestion(id);
    await this.syncToCloudImmediate({ deletedItem: { type: "question", id } });
    return ok;
  }

  // --- MATERIALS ---
  getMaterials(schoolId?: string): LearningMaterial[] {
    const deleted = this.getDeletedIds().materials || [];
    let materials = this.getItem<LearningMaterial[]>("materials", SEED_MATERIALS).filter(
      (m) => !deleted.includes(m.id)
    );
    if (!schoolId) return materials;
    const currentUser = this.getCurrentUser();
    return materials.filter((m) => {
      if (m.school_id === schoolId) return true;
      if (currentUser?.id && currentUser.id !== "usr-teacher-01" && m.teacher_id === currentUser.id) {
        return true;
      }
      return false;
    });
  }

  getMaterial(id: string): LearningMaterial | undefined {
    return this.getMaterials().find((m) => m.id === id);
  }

  getNextMaterialId(): string {
    const materials = this.getMaterials();
    let maxNum = 1000;
    materials.forEach((m) => {
      const match = m.id.match(/(?:mat|m)-?(\d+)/i);
      if (match) {
        const val = parseInt(match[1], 10);
        if (val > maxNum && val < 99999) maxNum = val;
      }
    });
    const nextNum = Math.max(maxNum + 1, 1001);
    return `mat${nextNum}`;
  }

  saveMaterial(
    data: Partial<LearningMaterial> & {
      title: string;
      subject: string;
      grade: number;
      school_id: string;
      content: string;
    }
  ): LearningMaterial {
    const materials = this.getMaterials();
    if (data.id) {
      const index = materials.findIndex((m) => m.id === data.id);
      if (index !== -1) {
        const updated = { ...materials[index], ...data };
        materials[index] = updated;
        this.setItem<LearningMaterial[]>("materials", materials);
        this.removeDeletedId("material", data.id);
        this.syncToCloud();
        return updated;
      }
    }
    const current = this.getCurrentUser();
    const cleanMaterialId = (data.id || this.getNextMaterialId())
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    this.removeDeletedId("material", cleanMaterialId);

    const newMat: LearningMaterial = {
      id: cleanMaterialId,
      title: data.title,
      subject: data.subject,
      grade: data.grade,
      school_id: data.school_id,
      teacher_id: data.teacher_id || current?.id || "teacher-1",
      content: data.content,
      is_contextualized: data.is_contextualized ?? true,
      original_content: data.original_content,
      context_variables: data.context_variables,
      validation: data.validation,
      published_to_classes: data.published_to_classes || [],
      created_at: new Date().toISOString(),
    };
    this.setItem<LearningMaterial[]>("materials", [newMat, ...materials]);
    this.syncToCloud();
    return newMat;
  }

  publishMaterial(id: string, classIds: string[]): LearningMaterial | undefined {
    const materials = this.getMaterials();
    const item = materials.find((m) => m.id === id);
    if (item) {
      item.published_to_classes = classIds;
      this.setItem<LearningMaterial[]>("materials", materials);
      this.syncToCloud();
      return item;
    }
    return undefined;
  }

  deleteMaterial(id: string): boolean {
    this.addDeletedId("material", id);
    const rawMaterials = this.getItem<LearningMaterial[]>("materials", SEED_MATERIALS);
    const filtered = rawMaterials.filter((m) => m.id !== id);
    this.setItem<LearningMaterial[]>("materials", filtered);
    if (this.isBrowser()) {
      window.dispatchEvent(new CustomEvent("repositorySyncCompleted"));
    }
    this.syncToCloudImmediate({ deletedItem: { type: "material", id } });
    return true;
  }

  async deleteMaterialAsync(id: string): Promise<boolean> {
    const ok = this.deleteMaterial(id);
    await this.syncToCloudImmediate({ deletedItem: { type: "material", id } });
    return ok;
  }

  // --- EXAMS ---
  getExams(schoolId?: string): Exam[] {
    const exams = this.getItem<Exam[]>("exams", SEED_EXAMS);
    const questions = this.getQuestions();
    // Hydrate questions
    const hydrated = exams.map((e) => ({
      ...e,
      questions: questions.filter((q) => e.question_ids.includes(q.id)),
    }));
    if (!schoolId) return hydrated;
    return hydrated.filter((e) => e.school_id === schoolId);
  }

  getExam(id: string): Exam | undefined {
    return this.getExams().find((e) => e.id === id);
  }

  createExam(data: Omit<Exam, "id" | "created_at">): Exam {
    const exams = this.getItem<Exam[]>("exams", SEED_EXAMS);
    const newExam: Exam = {
      ...data,
      id: `exam-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.setItem<Exam[]>("exams", [newExam, ...exams]);
    return newExam;
  }

  // --- ATTEMPTS & GRADING ---
  getAttempts(examId?: string): ExamAttempt[] {
    const attempts = this.getItem<ExamAttempt[]>("attempts", SEED_ATTEMPTS);
    if (!examId) return attempts;
    return attempts.filter((a) => a.exam_id === examId);
  }

  getAttempt(id: string): ExamAttempt | undefined {
    return this.getAttempts().find((a) => a.id === id);
  }

  getStudentAttempt(examId: string, studentId: string): ExamAttempt | undefined {
    return this.getAttempts().find((a) => a.exam_id === examId && a.student_id === studentId);
  }

  startAttempt(examId: string, studentId: string, studentName: string): ExamAttempt {
    const existing = this.getStudentAttempt(examId, studentId);
    if (existing) return existing;

    const attempts = this.getAttempts();
    const newAttempt: ExamAttempt = {
      id: `att-${Date.now()}`,
      exam_id: examId,
      student_id: studentId,
      student_name: studentName,
      answers: {},
      max_score: 100,
      status: "in_progress",
      started_at: new Date().toISOString(),
    };
    this.setItem<ExamAttempt[]>("attempts", [newAttempt, ...attempts]);
    return newAttempt;
  }

  saveAnswer(attemptId: string, questionId: string, answer: string): void {
    const attempts = this.getAttempts();
    const target = attempts.find((a) => a.id === attemptId);
    if (target && target.status === "in_progress") {
      target.answers[questionId] = answer;
      this.setItem<ExamAttempt[]>("attempts", attempts);
    }
  }

  submitAttempt(attemptId: string): ExamAttempt | undefined {
    const attempts = this.getAttempts();
    const target = attempts.find((a) => a.id === attemptId);
    if (!target) return undefined;

    const exam = this.getExam(target.exam_id);
    if (!exam || !exam.questions) return target;

    // Deterministic Server-Side Grading for Multiple Choice
    const mcQuestions = exam.questions.filter((q) => q.type === "multiple_choice");
    const essayQuestions = exam.questions.filter((q) => q.type === "essay");

    let mcCorrect = 0;
    mcQuestions.forEach((q) => {
      const studentAns = target.answers[q.id];
      if (studentAns && studentAns.trim().toUpperCase() === q.correct_answer.trim().toUpperCase()) {
        mcCorrect++;
      }
    });

    const mcWeight = essayQuestions.length > 0 ? 60 : 100;
    const mcScore = mcQuestions.length > 0 ? Math.round((mcCorrect / mcQuestions.length) * mcWeight) : 0;

    target.mc_score = mcScore;
    target.status = essayQuestions.length === 0 ? "graded" : "submitted";
    target.score = essayQuestions.length === 0 ? mcScore : mcScore; // Essay score added later
    target.submitted_at = new Date().toISOString();

    this.setItem<ExamAttempt[]>("attempts", attempts);
    return target;
  }

  gradeEssay(attemptId: string, essayScore: number, teacherFeedback: string): ExamAttempt | undefined {
    const attempts = this.getAttempts();
    const target = attempts.find((a) => a.id === attemptId);
    if (!target) return undefined;

    target.essay_score = essayScore;
    target.score = (target.mc_score || 0) + essayScore;
    target.status = "graded";
    target.teacher_feedback = teacherFeedback;

    this.setItem<ExamAttempt[]>("attempts", attempts);
    return target;
  }

  // --- NOTIFICATIONS ---
  getNotifications(userId: string): AppNotification[] {
    const notifs = this.getItem<AppNotification[]>("notifications", SEED_NOTIFICATIONS);
    return notifs.filter((n) => n.user_id === userId);
  }

  markNotificationRead(id: string): void {
    const notifs = this.getItem<AppNotification[]>("notifications", SEED_NOTIFICATIONS);
    const target = notifs.find((n) => n.id === id);
    if (target) {
      target.read = true;
      this.setItem<AppNotification[]>("notifications", notifs);
    }
  }

  // --- LEARNING ROOMS (URL / KODE AKSES SISWA TANPA LOGIN) ---
  getRooms(teacherId?: string): LearningRoom[] {
    const deleted = this.getDeletedIds().rooms || [];
    let rooms = this.getItem<LearningRoom[]>("rooms", SEED_ROOMS).filter(
      (r) =>
        !deleted.includes((r.id || "").toLowerCase()) &&
        !deleted.includes((r.code || "").toLowerCase())
    );
    if (teacherId) {
      return rooms.filter(
        (r) =>
          r.teacher_id === teacherId ||
          r.teacher_id === "usr-teacher-01" ||
          !r.teacher_id
      );
    }
    return rooms;
  }

  getNextRoomCode(): string {
    const rooms = this.getRooms();
    let maxNum = 1000;
    rooms.forEach((r) => {
      const match = (r.code || r.id).match(/(?:rom|room|mtr|sol)-?(\d+)/i);
      if (match) {
        const val = parseInt(match[1], 10);
        if (val > maxNum && val < 99999) maxNum = val;
      }
    });
    const nextNum = Math.max(maxNum + 1, 1001);
    return `rom${nextNum}`;
  }

  getRoomByCode(code: string): LearningRoom | undefined {
    const rooms = this.getRooms();
    const cleanCode = code.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    return rooms.find((r) => r.code.toLowerCase().replace(/[^a-z0-9]/g, "") === cleanCode);
  }

  createRoom(
    data: Omit<LearningRoom, "id" | "created_at" | "access_count" | "visitors">
  ): LearningRoom {
    const rooms = this.getRooms();
    const cleanCode = (data.code || this.getNextRoomCode())
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    const cleanRoomId = cleanCode.startsWith("rom") ? cleanCode : `rom${cleanCode}`;

    this.removeDeletedId("room", cleanRoomId);
    this.removeDeletedId("room", cleanCode);

    const newRoom: LearningRoom = {
      ...data,
      id: cleanRoomId,
      code: cleanCode,
      access_count: 0,
      created_at: new Date().toISOString(),
      visitors: [],
    };
    rooms.unshift(newRoom);
    this.setItem<LearningRoom[]>("rooms", rooms);
    this.syncToCloud();
    return newRoom;
  }

  updateRoom(id: string, data: Partial<LearningRoom>): LearningRoom | undefined {
    const rooms = this.getRooms();
    const index = rooms.findIndex((r) => r.id === id || r.code === id);
    if (index !== -1) {
      const updated = { ...rooms[index], ...data };
      rooms[index] = updated;
      this.setItem<LearningRoom[]>("rooms", rooms);
      this.syncToCloud();
      return updated;
    }
    return undefined;
  }

  recordRoomVisit(code: string, visitorName: string, score?: number): boolean {
    const rooms = this.getRooms();
    const cleanCode = code.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    const target = rooms.find((r) => r.code.toLowerCase().replace(/[^a-z0-9_-]/g, "") === cleanCode);
    if (!target) return false;

    target.access_count = (target.access_count || 0) + 1;
    if (!target.visitors) target.visitors = [];

    const existingVisitor = target.visitors.find(
      (v) => v.name.toLowerCase() === visitorName.trim().toLowerCase()
    );

    if (existingVisitor) {
      existingVisitor.accessed_at = new Date().toISOString();
      if (score !== undefined) existingVisitor.score = score;
      existingVisitor.completed = true;
    } else {
      target.visitors.push({
        name: visitorName.trim(),
        accessed_at: new Date().toISOString(),
        score,
        completed: true,
      });
    }

    this.setItem<LearningRoom[]>("rooms", rooms);
    return true;
  }

  deleteRoom(id: string): boolean {
    const rawRooms = this.getItem<LearningRoom[]>("rooms", SEED_ROOMS);
    const target = rawRooms.find((r) => r.id === id || r.code === id);
    if (target) {
      this.addDeletedId("room", target.id);
      if (target.code) this.addDeletedId("room", target.code);
    } else {
      this.addDeletedId("room", id);
    }
    const filtered = rawRooms.filter((r) => r.id !== id && r.code !== id);
    this.setItem<LearningRoom[]>("rooms", filtered);
    if (this.isBrowser()) {
      window.dispatchEvent(new CustomEvent("repositorySyncCompleted"));
    }
    this.syncToCloudImmediate({ deletedItem: { type: "room", id } });
    return true;
  }

  async deleteRoomAsync(id: string): Promise<boolean> {
    const ok = this.deleteRoom(id);
    await this.syncToCloudImmediate({ deletedItem: { type: "room", id } });
    return ok;
  }
}

export const repository = new PahamiRepository();
