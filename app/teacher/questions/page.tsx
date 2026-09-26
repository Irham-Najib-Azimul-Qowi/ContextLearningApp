"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileQuestion,
  BookOpen,
  Sparkles,
  MapPin,
  Camera,
  Upload,
  PenTool,
  Search,
  Copy,
  Check,
  DoorOpen,
  Trash2,
  Edit,
  Eye,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  ExternalLink,
  Layers,
  Brain,
  Link2,
  FileText,
  Plus,
} from "lucide-react";
import { TeacherWorkspaceShell } from "@/components/layout/teacher-workspace-shell";
import { repository } from "@/lib/db/repository";
import { Question, LearningMaterial, School, UserProfile, LearningRoom } from "@/lib/db/types";

const SUBJECT_OPTIONS = [
  "Semua Mapel",
  "Matematika",
  "IPAS (Ilmu Pengetahuan Alam & Sosial)",
  "Bahasa Indonesia",
  "Pendidikan Pancasila",
  "Seni Budaya & Prakarya",
];

export default function TeacherQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [activeSchool, setActiveSchool] = useState<School | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [rooms, setRooms] = useState<LearningRoom[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "multiple_choice" | "essay">("all");
  const [filterSubject, setFilterSubject] = useState("Semua Mapel");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Overlay "Tambah Soal dari Materi" State
  const [isFromMaterialOverlayOpen, setIsFromMaterialOverlayOpen] = useState(false);
  const [inputMaterialCode, setInputMaterialCode] = useState("");
  const [materialFilterSearch, setMaterialFilterSearch] = useState("");

  // Creation Wizard Modal States
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedMethod, setSelectedMethod] = useState<"manual" | "camera" | "pdf" | "ai" | "from_material">("manual");

  // Step 1: Metadata (Judul/Topik, Mata Pelajaran, Jenjang, Bentuk Soal)
  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState("Matematika");
  const [grade, setGrade] = useState(5);
  const [region, setRegion] = useState("Kota Madiun");
  const [questionType, setQuestionType] = useState<"multiple_choice" | "essay">("multiple_choice");

  // Step 2: Content Inputs
  const [manualQuestionDraft, setManualQuestionDraft] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [capturedPhotoName, setCapturedPhotoName] = useState<string | null>(null);

  // Step 3: Editable AI Review / Preview
  const [previewPrompt, setPreviewPrompt] = useState("");
  const [previewOptionA, setPreviewOptionA] = useState("");
  const [previewOptionB, setPreviewOptionB] = useState("");
  const [previewOptionC, setPreviewOptionC] = useState("");
  const [previewOptionD, setPreviewOptionD] = useState("");
  const [previewCorrect, setPreviewCorrect] = useState("A");
  const [previewExplanation, setPreviewExplanation] = useState("");
  const [previewRubric, setPreviewRubric] = useState("");

  // Step 4: Result
  const [createdQuestionId, setCreatedQuestionId] = useState<string | null>(null);
  const [patentQuestionId, setPatentQuestionId] = useState("");

  // Room Publish Modal
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [questionToPublish, setQuestionToPublish] = useState<Question | null>(null);
  const [generatedRoomCode, setGeneratedRoomCode] = useState("");
  const [roomCreatedSuccess, setRoomCreatedSuccess] = useState(false);

  // Question Preview Modal State
  const [selectedQuestionForPreview, setSelectedQuestionForPreview] = useState<Question | null>(null);

  const loadData = () => {
    const school = repository.getActiveSchool();
    const user = repository.getCurrentUser();
    setActiveSchool(school);
    setCurrentUser(user);
    setRegion(school.region_name || "Kota Madiun");
    setQuestions(repository.getQuestions({ schoolId: school.id }));
    setMaterials(repository.getMaterials(school.id));
    setRooms(repository.getRooms(user.id));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Open Wizard (Step 1: Pilih Metode)
  const handleOpenWizard = (method?: "manual" | "camera" | "pdf" | "ai" | "from_material", linkedMaterial?: LearningMaterial) => {
    setPatentQuestionId(repository.getNextQuestionId());
    setUploadedFileName(null);
    setCapturedPhotoName(null);
    setPreviewPrompt("");
    setPreviewOptionA("Rp3.000");
    setPreviewOptionB("Rp4.500");
    setPreviewOptionC("Rp5.000");
    setPreviewOptionD("Rp2.500");
    setPreviewCorrect("A");
    setPreviewExplanation("Perhitungan harga total dan pengembalian belanja kontekstual.");
    setPreviewRubric("Skor 100: Langkah perhitungan runut dan jawaban benar sesuai konteks.");

    if (linkedMaterial) {
      setSelectedMethod("from_material");
      setTopic(linkedMaterial.title);
      setSubject(linkedMaterial.subject);
      setGrade(linkedMaterial.grade);
      setManualQuestionDraft(`Berdasarkan materi "${linkedMaterial.title}", tentukan penyelesaian masalah kontekstual berikut:`);
      setWizardStep(2);
    } else if (method) {
      setSelectedMethod(method);
      setWizardStep(2);
    } else {
      setSelectedMethod("manual");
      setTopic("Kalkulasi Belanja Oleh-Oleh Khas Daerah");
      setManualQuestionDraft("Seorang pedagang membeli 4 kotak kue khas seharga Rp18.000 per kotak dan membayar dengan Rp100.000. Berapa uang kembaliannya?");
      setWizardStep(1);
    }

    setIsWizardOpen(true);
  };

  const handleSelectMethod = (method: "manual" | "camera" | "pdf" | "ai" | "from_material") => {
    setSelectedMethod(method);
    if (method === "ai") {
      setTopic("Penghitungan Transaksi Pasar Tradisional");
      setManualQuestionDraft("Kalkulasi jual beli di pasar tradisional daerah setempat");
    } else if (method === "camera") {
      setTopic("Soal Evaluasi Pindai OCR");
    } else if (method === "pdf") {
      setTopic("Soal Asesmen Standar Dokumen PDF");
    } else if (method === "from_material" && materials.length > 0) {
      setTopic(materials[0].title);
      setSubject(materials[0].subject);
      setGrade(materials[0].grade);
      setManualQuestionDraft(`Berdasarkan materi "${materials[0].title}", buatkan butir pertanyaan kontekstual untuk siswa.`);
    } else {
      setTopic("Kalkulasi Belanja Oleh-Oleh Khas Daerah");
      setManualQuestionDraft("Seorang pedagang membeli 4 kotak kue khas seharga Rp18.000 per kotak dan membayar dengan Rp100.000. Berapa uang kembaliannya?");
    }
    setWizardStep(2);
  };

  // Handle Pick Material from Overlay
  const handleSelectMaterialFromOverlay = (mat: LearningMaterial) => {
    setIsFromMaterialOverlayOpen(false);
    handleOpenWizard("from_material", mat);
  };

  // Handle Submit Material Code from Overlay
  const handleSubmitMaterialCodeFromOverlay = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputMaterialCode.trim().toLowerCase();
    const target = materials.find(
      (m) => m.id.toLowerCase() === clean || m.title.toLowerCase().includes(clean)
    );

    if (!target) {
      alert("Kode atau judul materi tidak ditemukan. Silakan periksa kembali daftar materi yang tersedia.");
      return;
    }

    setIsFromMaterialOverlayOpen(false);
    handleOpenWizard("from_material", target);
  };

  // Step 2 -> Step 3: Validasi Identitas & Masuk Form Konten Soal
  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    if (!previewPrompt) {
      setPreviewPrompt(manualQuestionDraft || `Berdasarkan topik ${topic}, jawablah pertanyaan kontekstual berikut:`);
    }
    setWizardStep(3);
  };

  // Process AI Context Transformation (Perubahan konteks otomatis oleh sistem AI kita!)
  const handleTriggerAiContextTransformation = () => {
    setIsAiGenerating(true);
    setTimeout(() => {
      if (questionType === "multiple_choice") {
        setPreviewPrompt(
          `Di sentra oleh-oleh khas ${region}, Bu Rahayu menjual 4 kotak produk olahan lokal seharga Rp18.000 per kotak dan 2 botol sirup khas seharga Rp12.500 per botol. Jika seorang pengunjung membayar dengan 2 lembar uang Rp50.000, berapa uang kembalian yang harus diberikan Bu Rahayu?`
        );
        setPreviewOptionA("Rp3.000");
        setPreviewOptionB("Rp4.500");
        setPreviewOptionC("Rp5.000");
        setPreviewOptionD("Rp2.500");
        setPreviewCorrect("A");
        setPreviewExplanation(
          `Total belanja = (4 × Rp18.000) + (2 × Rp12.500) = Rp72.000 + Rp25.000 = Rp97.000. Uang bayar = 2 × Rp50.000 = Rp100.000. Kembalian = Rp100.000 - Rp97.000 = Rp3.000.`
        );
      } else {
        // Essay Question
        setPreviewPrompt(
          `Berdasarkan data perdagangan pasar lokal di wilayah ${region}, seorang pedagang sayur membeli pasokan wortel seharga Rp150.000 dan menjualnya kembali dengan keuntungan 20%. Uraikan langkah-langkah perhitungan yang dilakukan untuk menentukan total pendapatan dan jumlah keuntungan yang diperoleh pedagang tersebut!`
        );
        setPreviewRubric(
          `Rubrik Penilaian Esai:\n1. Siswa mampu menghitung nominal keuntungan 20% × Rp150.000 = Rp30.000 (Skor 50)\n2. Siswa mampu menghitung total pendapatan = Rp150.000 + Rp30.000 = Rp180.000 (Skor 30)\n3. Penjelasan runtut dan mencantumkan satuan rupiah secara tepat (Skor 20).`
        );
        setPreviewExplanation(
          `Keuntungan = 20% × Rp150.000 = Rp30.000. Total pendapatan = Rp150.000 + Rp30.000 = Rp180.000.`
        );
      }
      setIsAiGenerating(false);
    }, 1000);
  };

  // Step 3 Save: Simpan Butir Soal dari Form Konten
  const handleStep3Save = () => {
    if (!activeSchool || !topic.trim()) return;

    const options =
      questionType === "multiple_choice"
        ? [
            { key: "A", text: previewOptionA || "Opsi A" },
            { key: "B", text: previewOptionB || "Opsi B" },
            { key: "C", text: previewOptionC || "Opsi C" },
            { key: "D", text: previewOptionD || "Opsi D" },
          ]
        : [];

    const newQuestion = repository.saveQuestion({
      id: patentQuestionId || undefined,
      school_id: activeSchool.id,
      subject: subject as "Matematika" | "Bahasa Indonesia" | "IPS",
      grade,
      topic: topic.trim(),
      type: questionType,
      question_text: previewPrompt || manualQuestionDraft || "Butir pertanyaan kontekstual.",
      options,
      correct_answer: questionType === "multiple_choice" ? previewCorrect : "",
      explanation: previewExplanation || "Pembahasan butir evaluasi kontekstual.",
      rubric: questionType === "essay" ? previewRubric : undefined,
      teacher_id: currentUser?.id || "usr-teacher-01",
      is_contextualized: true,
    });

    setCreatedQuestionId(newQuestion.id);
    loadData();
    setWizardStep(4);
  };

  const handleDeleteQuestion = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus butir soal ini?")) {
      repository.deleteQuestion(id);
      loadData();
    }
  };

  const handleOpenPublishRoom = (q: Question) => {
    setQuestionToPublish(q);
    const randomCode = `sol${Math.floor(1000 + Math.random() * 9000)}`;
    setGeneratedRoomCode(randomCode);
    setRoomCreatedSuccess(false);
    setIsRoomModalOpen(true);
  };

  const handleCreateRoomForQuestion = () => {
    if (!questionToPublish || !currentUser) return;

    repository.createRoom({
      code: generatedRoomCode,
      title: `Latihan: ${questionToPublish.topic}`,
      type: "question",
      resource_id: questionToPublish.id,
      subject: questionToPublish.subject,
      grade: questionToPublish.grade,
      region_name: activeSchool?.region_name || "Kota Madiun",
      teacher_id: currentUser.id,
      teacher_name: currentUser.full_name,
    });

    setRoomCreatedSuccess(true);
    loadData();
  };

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      q.question_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || q.type === filterType;
    const matchesSubject = filterSubject === "Semua Mapel" || q.subject.toLowerCase() === filterSubject.toLowerCase();
    return matchesSearch && matchesType && matchesSubject;
  });

  const filteredMaterialsForOverlay = materials.filter(
    (m) =>
      m.title.toLowerCase().includes(materialFilterSearch.toLowerCase()) ||
      m.id.toLowerCase().includes(materialFilterSearch.toLowerCase()) ||
      m.subject.toLowerCase().includes(materialFilterSearch.toLowerCase())
  );

  return (
    <TeacherWorkspaceShell activeGroupId="questions">
      <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6 pb-12 font-sans">
        {/* ===================================================================
            1. HEADER: BUTTON TAMBAH DI SEBELAH KIRI JUDUL & DESKRIPSI
            Warnanya menyesuaikan dengan navigasi bar kiri (#FFD36D Warm Yellow)
            =================================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center items-start gap-4 sm:gap-5">
          <button
            type="button"
            onClick={() => handleOpenWizard()}
            className="px-4 py-2.5 rounded-full bg-[#FFD36D] hover:bg-[#F5C754] text-[#51465B] border border-[#E5BE60] text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all cursor-pointer flex items-center gap-2 active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tambah Soal</span>
          </button>

          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#23212A] tracking-tight">
              Bank Soal Kontekstual
            </h1>
            <p className="text-xs sm:text-sm text-[#756F7A] mt-0.5">
              Katalog butir asesmen pilihan ganda dan esai Kurikulum Merdeka yang diselaraskan dengan kearifan lokal {activeSchool?.region_name || "wilayah"}.
            </p>
          </div>
        </div>

        {/* ===================================================================
            2. SEARCH BAR & FILTER: LANGSUNG TANPA DIBUNGKUS CARD
            =================================================================== */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756F7A]" />
            <input
              type="text"
              placeholder="Cari butir soal, topik, atau ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-full bg-white border border-[#E9E5E8] text-xs font-medium text-[#23212A] placeholder:text-[#756F7A]/70 focus:outline-none focus:border-[#51465B] shadow-xs transition-colors"
            />
          </div>

          {/* Instant Filter Pills & Dropdown */}
          <div className="flex items-center gap-1.5 overflow-x-auto shrink-0">
            <button
              type="button"
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                filterType === "all"
                  ? "bg-[#51465B] text-white shadow-xs"
                  : "bg-white text-[#756F7A] hover:bg-slate-100 border border-[#E9E5E8]"
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setFilterType("multiple_choice")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                filterType === "multiple_choice"
                  ? "bg-[#51465B] text-white shadow-xs"
                  : "bg-white text-[#756F7A] hover:bg-slate-100 border border-[#E9E5E8]"
              }`}
            >
              Pilihan Ganda
            </button>
            <button
              type="button"
              onClick={() => setFilterType("essay")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                filterType === "essay"
                  ? "bg-[#51465B] text-white shadow-xs"
                  : "bg-white text-[#756F7A] hover:bg-slate-100 border border-[#E9E5E8]"
              }`}
            >
              Esai
            </button>

            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="px-3.5 py-1.5 rounded-full bg-white border border-[#E9E5E8] text-xs font-semibold text-[#51465B] focus:outline-none focus:border-[#51465B] cursor-pointer shadow-xs transition-colors"
            >
              {SUBJECT_OPTIONS.map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ===================================================================
            3. DAFTAR SOAL: CARD PUTIH DENGAN STROKE, PROPORSIONAL & BERSIH
            =================================================================== */}
        <div>
          {filteredQuestions.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-[#E9E5E8] space-y-3">
              <div className="w-14 h-14 rounded-full bg-[#FAF7F3] text-slate-400 mx-auto flex items-center justify-center">
                <FileQuestion className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Belum ada butir soal</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Mulai buat butir soal baru menggunakan tombol Tambah Soal di atas.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredQuestions.map((q) => {
                const isEssay = q.type === "essay";

                return (
                  <div
                    key={q.id}
                    className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-[#E9E5E8] shadow-[0_2px_8px_rgba(81,70,91,0.03)] hover:shadow-md hover:border-[#51465B]/30 transition-all duration-200 flex flex-col justify-between group relative overflow-hidden min-h-[190px]"
                  >
                    {/* Top: Judul & ID di samping kanan, Kategori di bawahnya */}
                    <div>
                      <div className="flex items-start justify-between gap-2.5">
                        <h3 className="text-sm sm:text-base font-bold text-[#23212A] leading-snug line-clamp-2">
                          {q.topic || q.question_text}
                        </h3>

                        {/* ID di samping kanan judul: proporsional, kecil */}
                        <button
                          type="button"
                          onClick={() => handleCopy(q.id)}
                          className="shrink-0 py-0.5 px-2 rounded-md bg-[#FAF7F3] hover:bg-slate-100 border border-[#E9E5E8] font-mono text-[10px] font-medium text-[#756F7A] flex items-center gap-1 cursor-pointer transition-colors"
                          title="Klik untuk menyalin ID soal"
                        >
                          {copiedCode === q.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700 font-sans text-[9px]">Tersalin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-[#756F7A]" />
                              <span>{q.id}</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Di bawah judul: Kategori kecil tidak bold dibungkus kapsul */}
                      <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200/60">
                          {isEssay ? "Esai" : "Pilihan Ganda"} &bull; {q.subject} &bull; Kelas {q.grade} SD
                        </span>
                      </div>
                    </div>

                    {/* Di antara di tengah secara vertikal: sedikit deskripsi */}
                    <div className="my-auto py-2.5">
                      <p className="text-xs text-[#756F7A] font-normal leading-relaxed line-clamp-2">
                        {q.question_text ? q.question_text.replace(/\n+/g, " ") : "Butir soal asesmen kontekstual Kurikulum Merdeka."}
                      </p>
                    </div>

                    {/* Bottom: Button Lihat Soal + Button Hapus di samping kanannya */}
                    <div className="pt-3 border-t border-[#E9E5E8] flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedQuestionForPreview(q)}
                        className="flex-1 py-2 px-3.5 rounded-xl bg-[#FAF7F3] hover:bg-[#51465B] text-[#51465B] hover:text-white border border-[#E9E5E8] hover:border-[#51465B] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Lihat Soal</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-[#E9E5E8] hover:border-rose-200 transition-all cursor-pointer shrink-0"
                        title="Hapus Soal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* =====================================================================
          OVERLAY KHUSUS: TAMBAH SOAL DARI MATERI
          ===================================================================== */}
      {isFromMaterialOverlayOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-gradient-to-b from-[#3E3547] via-[#332A3B] to-[#251E2B] rounded-[32px] sm:rounded-[36px] border border-[#5A4F65] shadow-2xl p-6 sm:p-8 relative my-auto max-h-[90vh] flex flex-col text-white">
            {/* Header Overlay */}
            <div className="flex items-center justify-between pb-4 border-b border-white/15">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 text-[#FFD36D] flex items-center justify-center shadow-xs">
                  <Link2 className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                    Tambah Soal dari Materi
                  </h3>
                  <p className="text-xs text-gray-300">
                    Pilih materi yang tersedia untuk diubah menjadi butir soal
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsFromMaterialOverlayOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Masukkan Kode Materi */}
            <div className="py-4 space-y-4">
              <form onSubmit={handleSubmitMaterialCodeFromOverlay} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ketik kode materi (contoh: mat-xxxx)..."
                  value={inputMaterialCode}
                  onChange={(e) => setInputMaterialCode(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-2xl border-2 border-white/20 bg-[#251E2B]/80 text-xs sm:text-sm font-bold text-white placeholder:text-gray-400 focus:outline-none focus:border-[#FFD36D]"
                />
                <button
                  type="submit"
                  disabled={!inputMaterialCode.trim()}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#FFD36D] to-[#FDB040] text-[#251E2B] font-extrabold text-xs shadow-md disabled:opacity-40 cursor-pointer"
                >
                  Pilih
                </button>
              </form>

              {/* Divider ATAU */}
              <div className="flex items-center gap-3 py-1">
                <div className="h-px bg-white/15 flex-1" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Atau Pilih Materi di Bawah
                </span>
                <div className="h-px bg-white/15 flex-1" />
              </div>

              {/* Search Inside Overlay */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari materi dari daftar..."
                  value={materialFilterSearch}
                  onChange={(e) => setMaterialFilterSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-2xl border-2 border-white/15 bg-[#251E2B]/60 text-xs font-medium text-white placeholder:text-gray-400 focus:outline-none focus:border-[#FFD36D]"
                />
              </div>

              {/* Daftar Materi yang Muncul di Overlay */}
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {filteredMaterialsForOverlay.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-400">
                    Tidak ada materi yang sesuai.
                  </div>
                ) : (
                  filteredMaterialsForOverlay.map((mat) => (
                    <div
                      key={mat.id}
                      onClick={() => handleSelectMaterialFromOverlay(mat)}
                      className="p-3.5 rounded-2xl border border-white/15 hover:border-[#FFD36D] bg-[#251E2B]/80 hover:bg-[#251E2B] transition-all cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-gray-400 bg-white/10 px-2 py-0.5 rounded-md">
                            {mat.id}
                          </span>
                          <span className="text-[10px] font-bold text-[#FFD36D]">
                            {mat.subject} &bull; Kelas {mat.grade} SD
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#FFD36D] truncate">
                          {mat.title}
                        </h4>
                      </div>

                      <button
                        type="button"
                        className="px-3.5 py-1.5 rounded-xl bg-white/10 group-hover:bg-[#FFD36D] text-white group-hover:text-[#251E2B] text-xs font-bold transition-all shrink-0 cursor-pointer"
                      >
                        Pilih
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Footer Overlay */}
            <div className="pt-3 border-t border-white/15 flex justify-end">
              <button
                type="button"
                onClick={() => setIsFromMaterialOverlayOpen(false)}
                className="py-2 px-5 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/20 cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          CREATION WIZARD MODAL (LOGIN & ROOM ENTRY INSPIRED CLEAN STEP FORM)
          Step 1: Pilih Metode (Ketik Manual, Motret, Upload, AI, Dari Materi)
          Step 2: Lengkapi Data (Judul, Mapel, Kelas, Bentuk Soal, Konten/Opsi)
          Step 3: Review / Kunci Jawaban & Rubrik
          Step 4: Berhasil / Selesai
          ===================================================================== */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div
            className={`w-full ${
              wizardStep === 3 ? "max-w-4xl lg:max-w-5xl" : "max-w-[560px]"
            } bg-gradient-to-b from-[#3E3547] via-[#332A3B] to-[#251E2B] rounded-[32px] sm:rounded-[36px] border border-[#5A4F65] shadow-2xl p-6 sm:p-8 relative my-auto max-h-[92vh] overflow-y-auto text-white flex flex-col text-left transition-all duration-300`}
          >
            {/* ===================================================================
                MODAL HEADER: JUDUL DI KIRI ATAS, PROGRES STEP DI BAWAHNYA, X DI KANAN ATAS
                =================================================================== */}
            <div className="w-full flex items-start justify-between pb-4 border-b border-white/10 mb-5">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  {wizardStep === 4 ? "Butir Soal Berhasil Disimpan" : "Tambah Butir Soal"}
                </h3>
                {/* Progress Step langsung di bawah judul (tanpa teks deskripsi) */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1.5">
                    <div className={`h-1.5 rounded-full transition-all duration-300 ${wizardStep === 1 ? "w-6 bg-[#FFD36D]" : "w-2 bg-[#FFD36D]/60"}`} />
                    <div className={`h-1.5 rounded-full transition-all duration-300 ${wizardStep === 2 ? "w-6 bg-[#FFD36D]" : wizardStep > 2 ? "w-2 bg-[#FFD36D]/60" : "w-2 bg-white/20"}`} />
                    <div className={`h-1.5 rounded-full transition-all duration-300 ${wizardStep === 3 ? "w-6 bg-[#FFD36D]" : wizardStep > 3 ? "w-2 bg-[#FFD36D]/60" : "w-2 bg-white/20"}`} />
                    <div className={`h-1.5 rounded-full transition-all duration-300 ${wizardStep === 4 ? "w-6 bg-[#FFD36D]" : "w-2 bg-white/20"}`} />
                  </div>
                  <span className="text-[11px] font-semibold text-[#FFD36D]">
                    Langkah {wizardStep} dari 4: {wizardStep === 1 ? "Cara Input" : wizardStep === 2 ? "Identitas" : wizardStep === 3 ? "Konten Soal" : "Selesai"}
                  </span>
                </div>
              </div>

              {/* Close / Batal Button di pojok kanan atas */}
              <button
                type="button"
                onClick={() => setIsWizardOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-3"
                title="Batal / Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ===================================================================
                STEP 1: PILIH CARA INPUT (BENTUK CARD KOTAK BERISI IKON & NAMA FITUR)
                =================================================================== */}
            {wizardStep === 1 && (
              <div className="w-full space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
                  {/* Card Kotak 1: Ketik Manual */}
                  <button
                    type="button"
                    onClick={() => handleSelectMethod("manual")}
                    className="p-4 sm:p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 hover:border-[#FFD36D] flex flex-col items-center justify-center text-center gap-2.5 transition-all cursor-pointer group active:scale-95 aspect-square"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-white/10 group-hover:bg-[#FFD36D] text-[#FFD36D] group-hover:text-[#251E2B] flex items-center justify-center transition-all shadow-xs">
                      <PenTool className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <span className="font-bold text-xs text-white group-hover:text-[#FFD36D] transition-colors leading-tight">
                      Ketik Manual
                    </span>
                  </button>

                  {/* Card Kotak 2: Motret Naskah */}
                  <button
                    type="button"
                    onClick={() => handleSelectMethod("camera")}
                    className="p-4 sm:p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 hover:border-[#FFD36D] flex flex-col items-center justify-center text-center gap-2.5 transition-all cursor-pointer group active:scale-95 aspect-square"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-white/10 group-hover:bg-[#FFD36D] text-[#FFD36D] group-hover:text-[#251E2B] flex items-center justify-center transition-all shadow-xs">
                      <Camera className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <span className="font-bold text-xs text-white group-hover:text-[#FFD36D] transition-colors leading-tight">
                      Motret Naskah
                    </span>
                  </button>

                  {/* Card Kotak 3: Upload PDF */}
                  <button
                    type="button"
                    onClick={() => handleSelectMethod("pdf")}
                    className="p-4 sm:p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 hover:border-[#FFD36D] flex flex-col items-center justify-center text-center gap-2.5 transition-all cursor-pointer group active:scale-95 aspect-square"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-white/10 group-hover:bg-[#FFD36D] text-[#FFD36D] group-hover:text-[#251E2B] flex items-center justify-center transition-all shadow-xs">
                      <Upload className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <span className="font-bold text-xs text-white group-hover:text-[#FFD36D] transition-colors leading-tight">
                      Upload PDF
                    </span>
                  </button>

                  {/* Card Kotak 4: Generate AI */}
                  <button
                    type="button"
                    onClick={() => handleSelectMethod("ai")}
                    className="p-4 sm:p-3 rounded-2xl bg-gradient-to-br from-[#FFD36D]/20 to-[#FDB040]/10 hover:from-[#FFD36D]/30 hover:to-[#FDB040]/20 border border-[#FFD36D]/40 hover:border-[#FFD36D] flex flex-col items-center justify-center text-center gap-2.5 transition-all cursor-pointer group active:scale-95 aspect-square"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-[#FFD36D] text-[#251E2B] flex items-center justify-center transition-all shadow-xs group-hover:scale-105">
                      <Sparkles className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <span className="font-bold text-xs text-[#FFD36D] transition-colors leading-tight">
                      Generate AI
                    </span>
                  </button>

                  {/* Card Kotak 5: Dari Materi */}
                  <button
                    type="button"
                    onClick={() => handleSelectMethod("from_material")}
                    className="p-4 sm:p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 hover:border-[#FFD36D] flex flex-col items-center justify-center text-center gap-2.5 transition-all cursor-pointer group active:scale-95 aspect-square col-span-2 sm:col-span-1"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-white/10 group-hover:bg-[#FFD36D] text-[#FFD36D] group-hover:text-[#251E2B] flex items-center justify-center transition-all shadow-xs">
                      <Link2 className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <span className="font-bold text-xs text-white group-hover:text-[#FFD36D] transition-colors leading-tight">
                      Dari Materi
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* ===================================================================
                STEP 2: IDENTITAS SOAL & ID PATEN DARI SISTEM
                =================================================================== */}
            {wizardStep === 2 && (
              <form onSubmit={handleStep2Submit} className="w-full space-y-4 animate-in fade-in zoom-in-95 duration-200">
                {/* ID Paten Sistem (Non-editable, tidak bisa diacak atau dibuat manual) */}
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold text-gray-300 block">ID Butir Soal (Paten Sistem)</span>
                    <span className="text-[10px] text-gray-400">Ditetapkan permanen oleh sistem, tidak dapat diacak</span>
                  </div>
                  <span className="font-mono text-xs font-black text-[#FFD36D] bg-[#251E2B] px-3.5 py-1.5 rounded-xl border border-[#FFD36D]/30 select-none">
                    {patentQuestionId}
                  </span>
                </div>

                {/* Judul / Topik Soal */}
                <div>
                  <label className="block text-xs font-bold text-gray-200 mb-1">
                    Topik / Judul Soal
                  </label>
                  <input
                    type="text"
                    required
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Contoh: Operasi Hitung Belanja Pasar Tradisional"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-white/20 bg-[#251E2B]/80 focus:border-[#FFD36D] text-xs sm:text-sm font-bold text-white placeholder:text-gray-400 focus:outline-none transition-all shadow-inner"
                  />
                </div>

                {/* Mapel & Kelas */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-200 mb-1">
                      Mata Pelajaran
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3 py-3 rounded-2xl border-2 border-white/20 bg-[#251E2B] focus:border-[#FFD36D] text-xs font-bold text-white focus:outline-none"
                    >
                      <option value="Matematika">Matematika</option>
                      <option value="IPAS (Ilmu Pengetahuan Alam & Sosial)">IPAS</option>
                      <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                      <option value="Pendidikan Pancasila">Pendidikan Pancasila</option>
                      <option value="Seni Budaya & Prakarya">Seni Budaya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-200 mb-1">
                      Jenjang Kelas
                    </label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(Number(e.target.value))}
                      className="w-full px-3 py-3 rounded-2xl border-2 border-white/20 bg-[#251E2B] focus:border-[#FFD36D] text-xs font-bold text-white focus:outline-none"
                    >
                      {[1, 2, 3, 4, 5, 6].map((g) => (
                        <option key={g} value={g}>
                          Kelas {g} SD
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Bentuk Soal */}
                <div>
                  <label className="block text-xs font-bold text-gray-200 mb-1">
                    Bentuk Soal
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setQuestionType("multiple_choice")}
                      className={`py-2.5 px-3 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        questionType === "multiple_choice"
                          ? "border-[#FFD36D] bg-[#FFD36D] text-[#251E2B] shadow-xs font-black"
                          : "border-white/20 bg-white/10 text-white hover:bg-white/15"
                      }`}
                    >
                      <Brain className="w-4 h-4" />
                      <span>Pilihan Ganda</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuestionType("essay")}
                      className={`py-2.5 px-3 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        questionType === "essay"
                          ? "border-[#FFD36D] bg-[#FFD36D] text-[#251E2B] shadow-xs font-black"
                          : "border-white/20 bg-white/10 text-white hover:bg-white/15"
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      <span>Soal Esai</span>
                    </button>
                  </div>
                </div>

                {/* Footer Navigasi Identitas */}
                <div className="pt-3 flex items-center justify-between border-t border-white/10 gap-3">
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    className="py-2.5 px-5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
                  >
                    Kembali
                  </button>
                  <button
                    type="submit"
                    disabled={!topic.trim()}
                    className="py-2.5 px-6 rounded-2xl bg-[#FFD36D] hover:bg-[#F5C754] text-[#251E2B] font-extrabold text-xs shadow-md transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
                  >
                    <span>Lanjut ke Input Soal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            {/* ===================================================================
                STEP 3: FORM INPUT KONTEN SOAL (OVERLAY LEBAR & BESAR AGAR NYAMAN)
                =================================================================== */}
            {wizardStep === 3 && (
              <div className="w-full space-y-4 animate-in fade-in zoom-in-95 duration-200">
                {/* Ringkasan Konteks Singkat */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-white/5 border border-white/10 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-[#FFD36D] bg-[#251E2B] px-2.5 py-0.5 rounded-lg border border-[#FFD36D]/30">
                      {patentQuestionId}
                    </span>
                    <span className="font-bold text-white">{topic}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-gray-300">
                    <span>{subject} &bull; Kelas {grade} SD</span>
                    <span className="px-2 py-0.5 rounded-md bg-white/10 text-[#FFD36D] font-bold text-[10px]">
                      {questionType === "multiple_choice" ? "Pilihan Ganda" : "Soal Esai"}
                    </span>
                  </div>
                </div>

                {/* Pemilihan Modul Rujukan jika dari materi */}
                {selectedMethod === "from_material" && (
                  <div>
                    <label className="block text-xs font-bold text-gray-200 mb-1">
                      Pilih Modul Materi Rujukan
                    </label>
                    <select
                      value={topic}
                      onChange={(e) => {
                        const selectedMat = materials.find((m) => m.title === e.target.value);
                        if (selectedMat) {
                          setTopic(selectedMat.title);
                          setSubject(selectedMat.subject);
                          setGrade(selectedMat.grade);
                          setPreviewPrompt(`Berdasarkan modul materi "${selectedMat.title}", tentukan penyelesaian masalah kontekstual berikut:`);
                        }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-white/20 bg-[#251E2B] focus:border-[#FFD36D] text-xs font-bold text-white focus:outline-none"
                    >
                      {materials.map((m) => (
                        <option key={m.id} value={m.title}>
                          [{m.id}] {m.title} ({m.subject} - Kelas {m.grade} SD)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* AI Generator Helper Bar di Step 3 jika metode AI */}
                {selectedMethod === "ai" && (
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="text-xs">
                      <span className="font-bold text-[#FFD36D] block">Kearifan Lokal: {region}</span>
                      <span className="text-[11px] text-gray-300">
                        AI merumuskan butir asesmen otomatis dengan data rill {region}.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleTriggerAiContextTransformation}
                      disabled={isAiGenerating}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FFD36D] to-[#FDB040] text-[#251E2B] text-xs font-bold shadow-md cursor-pointer shrink-0 disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isAiGenerating ? "Merumuskan Soal..." : previewPrompt ? "Generate Ulang Soal" : "Mulai Generate AI"}</span>
                    </button>
                  </div>
                )}

                {/* Teks Pertanyaan Kontekstual yang Lapang */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-200">
                    Teks Pertanyaan / Stimulus Kontekstual
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={previewPrompt}
                    onChange={(e) => setPreviewPrompt(e.target.value)}
                    placeholder="Tuliskan teks pertanyaan atau stimulus asesmen kontekstual secara lengkap di sini..."
                    className="w-full p-4 rounded-2xl border-2 border-white/20 bg-[#251E2B]/90 focus:border-[#FFD36D] text-xs sm:text-sm text-white placeholder:text-gray-400 focus:outline-none transition-all shadow-inner leading-relaxed min-h-[110px]"
                  />
                </div>

                {/* Opsi Pilihan Ganda (Grid 2 Kolom Luas) / Rubrik Esai */}
                {questionType === "multiple_choice" ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-200">
                        Opsi Pilihan Jawaban
                      </label>
                      <span className="text-[11px] text-gray-400">
                        Tentukan teks tiap opsi dan tandai kunci jawaban yang benar
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Opsi A */}
                      <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-[#251E2B]/80 border-2 border-white/15 focus-within:border-[#FFD36D]">
                        <span className="w-7 h-7 rounded-xl bg-white/10 text-[#FFD36D] text-xs font-black flex items-center justify-center shrink-0">
                          A
                        </span>
                        <input
                          type="text"
                          required
                          value={previewOptionA}
                          onChange={(e) => setPreviewOptionA(e.target.value)}
                          placeholder="Pilihan jawaban A"
                          className="flex-1 bg-transparent text-xs sm:text-sm text-white focus:outline-none font-medium"
                        />
                      </div>

                      {/* Opsi B */}
                      <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-[#251E2B]/80 border-2 border-white/15 focus-within:border-[#FFD36D]">
                        <span className="w-7 h-7 rounded-xl bg-white/10 text-[#FFD36D] text-xs font-black flex items-center justify-center shrink-0">
                          B
                        </span>
                        <input
                          type="text"
                          required
                          value={previewOptionB}
                          onChange={(e) => setPreviewOptionB(e.target.value)}
                          placeholder="Pilihan jawaban B"
                          className="flex-1 bg-transparent text-xs sm:text-sm text-white focus:outline-none font-medium"
                        />
                      </div>

                      {/* Opsi C */}
                      <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-[#251E2B]/80 border-2 border-white/15 focus-within:border-[#FFD36D]">
                        <span className="w-7 h-7 rounded-xl bg-white/10 text-[#FFD36D] text-xs font-black flex items-center justify-center shrink-0">
                          C
                        </span>
                        <input
                          type="text"
                          required
                          value={previewOptionC}
                          onChange={(e) => setPreviewOptionC(e.target.value)}
                          placeholder="Pilihan jawaban C"
                          className="flex-1 bg-transparent text-xs sm:text-sm text-white focus:outline-none font-medium"
                        />
                      </div>

                      {/* Opsi D */}
                      <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-[#251E2B]/80 border-2 border-white/15 focus-within:border-[#FFD36D]">
                        <span className="w-7 h-7 rounded-xl bg-white/10 text-[#FFD36D] text-xs font-black flex items-center justify-center shrink-0">
                          D
                        </span>
                        <input
                          type="text"
                          required
                          value={previewOptionD}
                          onChange={(e) => setPreviewOptionD(e.target.value)}
                          placeholder="Pilihan jawaban D"
                          className="flex-1 bg-transparent text-xs sm:text-sm text-white focus:outline-none font-medium"
                        />
                      </div>
                    </div>

                    {/* Kunci Jawaban Selector */}
                    <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                      <span className="text-xs font-bold text-gray-200">
                        Kunci Jawaban Benar:
                      </span>
                      <div className="flex items-center gap-2">
                        {["A", "B", "C", "D"].map((key) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setPreviewCorrect(key)}
                            className={`w-9 h-9 rounded-xl font-black text-xs transition-all cursor-pointer ${
                              previewCorrect === key
                                ? "bg-[#FFD36D] text-[#251E2B] shadow-md scale-105"
                                : "bg-white/10 text-white hover:bg-white/20"
                            }`}
                          >
                            {key}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Rubrik Penilaian Soal Esai */
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-200">
                      Rubrik Penilaian & Panduan Penskoran Esai
                    </label>
                    <textarea
                      rows={5}
                      value={previewRubric}
                      onChange={(e) => setPreviewRubric(e.target.value)}
                      placeholder="Contoh: Skor 100 bila siswa menuliskan tahapan operasi hitung dan nilai kembalian dengan tepat..."
                      className="w-full p-4 rounded-2xl border-2 border-white/20 bg-[#251E2B]/90 focus:border-[#FFD36D] text-xs sm:text-sm text-white focus:outline-none transition-all shadow-inner leading-relaxed min-h-[120px]"
                    />
                  </div>
                )}

                {/* Pembahasan Kontekstual */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-200">
                    Pembahasan & Penjelasan Asesmen
                  </label>
                  <textarea
                    rows={3}
                    value={previewExplanation}
                    onChange={(e) => setPreviewExplanation(e.target.value)}
                    placeholder="Uraikan langkah penyelesaian masalah kontekstual agar siswa memahami konsepnya..."
                    className="w-full p-3.5 rounded-2xl border-2 border-white/20 bg-[#251E2B]/90 focus:border-[#FFD36D] text-xs sm:text-sm text-white focus:outline-none transition-all shadow-inner leading-relaxed"
                  />
                </div>

                {/* Footer Buttons Step 3 */}
                <div className="pt-3 flex items-center justify-between border-t border-white/10 gap-3">
                  <button
                    type="button"
                    onClick={() => setWizardStep(2)}
                    className="py-2.5 px-5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
                  >
                    Kembali ke Identitas
                  </button>

                  <button
                    type="button"
                    onClick={handleStep3Save}
                    disabled={!previewPrompt.trim() && !manualQuestionDraft.trim()}
                    className="py-2.5 px-7 rounded-2xl bg-gradient-to-r from-[#FFD36D] to-[#FDB040] hover:from-[#FFE085] hover:to-[#FFBD59] text-[#251E2B] font-extrabold text-xs shadow-md transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
                  >
                    <span>Simpan Butir Soal</span>
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            )}

            {/* ===================================================================
                STEP 4: SUKSES / BERHASIL DISIMPAN DENGAN ID PATEN
                =================================================================== */}
            {wizardStep === 4 && (
              <div className="w-full text-center py-4 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-lg sm:text-xl font-black text-white">
                    Butir Soal Berhasil Disimpan!
                  </h4>
                  <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-xl bg-white/10 border border-white/15">
                    <span className="text-[11px] text-gray-300">ID Paten:</span>
                    <span className="font-mono text-xs font-bold text-[#FFD36D]">
                      {createdQuestionId || patentQuestionId}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsWizardOpen(false);
                      const q = questions.find((item) => item.id === createdQuestionId) || questions[0];
                      if (q) handleOpenPublishRoom(q);
                    }}
                    className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-[#51465B] hover:bg-[#3E3547] text-[#FFD36D] text-xs font-bold border border-[#645770]/40 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <DoorOpen className="w-4 h-4" />
                    <span>Terbitkan Room Soal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsWizardOpen(false)}
                    className="w-full sm:w-auto py-3 px-7 rounded-2xl bg-gradient-to-r from-[#FFD36D] to-[#FDB040] text-[#251E2B] text-xs font-extrabold shadow-md cursor-pointer"
                  >
                    Selesai & Lihat Soal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Publish Room Modal */}
      {isRoomModalOpen && questionToPublish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-gradient-to-b from-[#3E3547] via-[#332A3B] to-[#251E2B] rounded-[32px] sm:rounded-[36px] border border-[#5A4F65] shadow-2xl p-6 sm:p-8 text-center space-y-4 animate-in fade-in zoom-in-95 text-white">
            <div className="w-12 h-12 rounded-2xl bg-white/10 text-[#FFD36D] flex items-center justify-center mx-auto shadow-sm">
              <DoorOpen className="w-6 h-6 stroke-[2.2]" />
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Buka Room Soal
              </h3>
              <p className="text-xs text-gray-300 mt-1">
                Siswa dapat langsung berlatih tanpa akun dengan kode:
              </p>
            </div>

            <div className="p-3 bg-[#251E2B]/80 border-2 border-white/20 rounded-2xl">
              <span className="font-mono text-xl font-black tracking-widest text-[#FFD36D] lowercase">
                {generatedRoomCode}
              </span>
            </div>

            {roomCreatedSuccess ? (
              <div className="p-3 bg-emerald-950/70 border border-emerald-700/60 text-emerald-200 text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Room berhasil diaktifkan!</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleCreateRoomForQuestion}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FFD36D] to-[#FDB040] hover:from-[#FFE085] hover:to-[#FFBD59] text-[#251E2B] font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                Aktifkan Room Sekarang
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsRoomModalOpen(false)}
              className="text-xs font-bold text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          PREVIEW MODAL SOAL (OVERLAY LIHAT SOAL)
          ===================================================================== */}
      {selectedQuestionForPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-gradient-to-b from-[#3E3547] via-[#332A3B] to-[#251E2B] rounded-[32px] sm:rounded-[36px] border border-[#5A4F65] shadow-2xl p-6 sm:p-8 relative my-auto max-h-[90vh] flex flex-col text-white">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-white/15">
              <div className="space-y-1 pr-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-white/15 text-[#FFD36D] font-black text-[10px] uppercase tracking-wider">
                    {selectedQuestionForPreview.subject} &bull; Kelas {selectedQuestionForPreview.grade} SD
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-gray-300 font-mono text-[10px] font-bold">
                    {selectedQuestionForPreview.type === "essay" ? "Soal Esai" : "Pilihan Ganda"}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-gray-300 font-mono text-[10px] font-bold">
                    {selectedQuestionForPreview.id}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-2">
                  {selectedQuestionForPreview.topic}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedQuestionForPreview(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="my-5 overflow-y-auto pr-2 space-y-4 max-h-[50vh]">
              {/* Question Text */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#251E2B]/80 border border-white/10 text-gray-200 text-sm leading-relaxed font-semibold">
                {selectedQuestionForPreview.question_text}
              </div>

              {/* Options if Multiple Choice */}
              {selectedQuestionForPreview.type === "multiple_choice" && selectedQuestionForPreview.options && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-gray-400">Pilihan Jawaban:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedQuestionForPreview.options.map((opt, idx) => {
                      const optLabel = opt.key || String.fromCharCode(65 + idx);
                      const optText = opt.text || "";
                      const isCorrect =
                        selectedQuestionForPreview.correct_answer === optLabel ||
                        selectedQuestionForPreview.correct_answer === optText;

                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                            isCorrect
                              ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-200 font-bold"
                              : "bg-white/5 border-white/10 text-gray-300"
                          }`}
                        >
                          <span>
                            <strong className="mr-1.5 text-white">{optLabel}.</strong> {optText}
                          </span>
                          {isCorrect && (
                            <span className="text-[10px] bg-emerald-500 text-[#251E2B] font-black px-2 py-0.5 rounded-full">
                              Kunci
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Explanation */}
              {selectedQuestionForPreview.explanation && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300 space-y-1">
                  <span className="font-bold text-[#FFD36D] block">Penjelasan / Pembahasan:</span>
                  <p className="leading-relaxed">{selectedQuestionForPreview.explanation}</p>
                </div>
              )}

              {/* Rubric if Essay */}
              {selectedQuestionForPreview.type === "essay" && selectedQuestionForPreview.rubric && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300 space-y-1">
                  <span className="font-bold text-[#FFD36D] block">Rubrik Penilaian:</span>
                  <p className="leading-relaxed">{selectedQuestionForPreview.rubric}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-white/15 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  const targetQ = selectedQuestionForPreview;
                  setSelectedQuestionForPreview(null);
                  handleOpenPublishRoom(targetQ);
                }}
                className="py-2.5 px-5 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all cursor-pointer border border-white/20 flex items-center gap-1.5"
              >
                <DoorOpen className="w-3.5 h-3.5 text-[#FFD36D]" />
                <span>Buka Room Siswa</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedQuestionForPreview(null)}
                className="py-2.5 px-6 rounded-2xl bg-gradient-to-r from-[#FFD36D] to-[#FDB040] hover:from-[#FFE085] hover:to-[#FFBD59] text-[#251E2B] text-xs font-black shadow-md transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </TeacherWorkspaceShell>
  );
}
