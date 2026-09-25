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
  FileText,
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
  HelpCircle,
  Brain,
  Link2,
} from "lucide-react";
import { TeacherWorkspaceShell } from "@/components/layout/teacher-workspace-shell";
import { repository } from "@/lib/db/repository";
import { Question, LearningMaterial, School, UserProfile, LearningRoom } from "@/lib/db/types";

const REGION_OPTIONS = [
  "Kota Madiun",
  "Kabupaten Madiun",
  "Kabupaten Ponorogo",
  "Kabupaten Ngawi",
  "Kabupaten Magetan",
  "Kabupaten Pacitan",
  "Kota Semarang",
];

const SUBJECT_OPTIONS = [
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
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Quick generation from material state
  const [inputMaterialCode, setInputMaterialCode] = useState("");

  // Creation Wizard Modal States
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedMethod, setSelectedMethod] = useState<"manual" | "camera" | "pdf" | "ai" | "from_material">("manual");

  // Step 1: Metadata
  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState("Matematika");
  const [grade, setGrade] = useState(5);
  const [region, setRegion] = useState("Kota Madiun");
  const [questionType, setQuestionType] = useState<"multiple_choice" | "essay">("multiple_choice");

  // Step 2: Content Inputs
  const [promptText, setPromptText] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("A");
  const [explanation, setExplanation] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [capturedPhotoName, setCapturedPhotoName] = useState<string | null>(null);

  // Step 3: Editable Preview
  const [previewPrompt, setPreviewPrompt] = useState("");
  const [previewOptionA, setPreviewOptionA] = useState("");
  const [previewOptionB, setPreviewOptionB] = useState("");
  const [previewOptionC, setPreviewOptionC] = useState("");
  const [previewOptionD, setPreviewOptionD] = useState("");
  const [previewCorrect, setPreviewCorrect] = useState("A");
  const [previewExplanation, setPreviewExplanation] = useState("");

  // Step 4: Result
  const [createdQuestionId, setCreatedQuestionId] = useState<string | null>(null);

  // Room Publish Modal
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [questionToPublish, setQuestionToPublish] = useState<Question | null>(null);
  const [generatedRoomCode, setGeneratedRoomCode] = useState("");
  const [roomCreatedSuccess, setRoomCreatedSuccess] = useState(false);

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

  // Open Wizard with specific method
  const handleOpenWizard = (method: "manual" | "camera" | "pdf" | "ai" | "from_material", linkedMaterial?: LearningMaterial) => {
    setSelectedMethod(method);
    setWizardStep(1);

    if (linkedMaterial) {
      setTopic(linkedMaterial.title);
      setSubject(linkedMaterial.subject);
      setGrade(linkedMaterial.grade);
    } else {
      setTopic(
        method === "ai"
          ? "Penghitungan Transaksi Pasar Tradisional"
          : method === "camera"
          ? "Soal Evaluasi Pindai OCR"
          : method === "pdf"
          ? "Soal Asesmen Standar Dokumen PDF"
          : "Kalkulasi Belanja Oleh-Oleh Khas Daerah"
      );
    }

    setPromptText("Di pasar lokal, Pak Joko membeli komoditas khas seharga Rp25.000 sebanyak 3 porsi...");
    setOptionA("Rp75.000");
    setOptionB("Rp65.000");
    setOptionC("Rp80.000");
    setOptionD("Rp50.000");
    setCorrectAnswer("A");
    setExplanation("Total = 3 × Rp25.000 = Rp75.000.");
    setIsWizardOpen(true);
  };

  // Quick Action: Create Question from existing Material using Code or Dropdown
  const handleCreateFromMaterialCode = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputMaterialCode.trim().toLowerCase();
    const target = materials.find(
      (m) => m.id.toLowerCase() === clean || m.title.toLowerCase().includes(clean)
    );

    if (!target) {
      alert("Kode atau judul materi tidak ditemukan. Silakan periksa kembali daftar berkas materi.");
      return;
    }

    handleOpenWizard("from_material", target);
  };

  // Proceed Step 1 -> Step 2
  const handleNextToContent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setWizardStep(2);
  };

  // Simulate AI Question Generation in Step 2
  const handleSimulateAi = () => {
    setIsAiGenerating(true);
    setTimeout(() => {
      setPreviewPrompt(
        `Di kawasan sentra ${region}, Bu Rahayu menjual 4 kotak produk olahan lokal seharga Rp18.000 per kotak dan 2 botol sirup seharga Rp12.500 per botol. Jika pembeli membayar dengan 2 lembar uang Rp50.000, berapa uang kembalian yang harus diberikan Bu Rahayu?`
      );
      setPreviewOptionA("Rp3.000");
      setPreviewOptionB("Rp4.500");
      setPreviewOptionC("Rp5.000");
      setPreviewOptionD("Rp2.500");
      setPreviewCorrect("A");
      setPreviewExplanation(
        `Total belanja = (4 × Rp18.000) + (2 × Rp12.500) = Rp72.000 + Rp25.000 = Rp97.000. Uang bayar = 2 × Rp50.000 = Rp100.000. Kembalian = Rp100.000 - Rp97.000 = Rp3.000.`
      );
      setIsAiGenerating(false);
      setWizardStep(3);
    }, 1200);
  };

  // Proceed Step 2 -> Step 3 (Review & Preview)
  const handleNextToPreview = () => {
    if (selectedMethod === "ai" || selectedMethod === "from_material") {
      handleSimulateAi();
      return;
    }

    setPreviewPrompt(promptText);
    setPreviewOptionA(optionA || "Pilihan A");
    setPreviewOptionB(optionB || "Pilihan B");
    setPreviewOptionC(optionC || "Pilihan C");
    setPreviewOptionD(optionD || "Pilihan D");
    setPreviewCorrect(correctAnswer);
    setPreviewExplanation(explanation || "Pembahasan terverifikasi.");
    setWizardStep(3);
  };

  // Final Save in Step 3
  const handleFinalSave = () => {
    if (!activeSchool) return;

    const options =
      questionType === "multiple_choice"
        ? [
            { key: "A", text: previewOptionA },
            { key: "B", text: previewOptionB },
            { key: "C", text: previewOptionC },
            { key: "D", text: previewOptionD },
          ]
        : [];

    const newQuestion = repository.saveQuestion({
      school_id: activeSchool.id,
      subject: subject as "Matematika" | "Bahasa Indonesia" | "IPS",
      grade,
      topic,
      type: questionType,
      question_text: previewPrompt,
      options,
      correct_answer: previewCorrect,
      explanation: previewExplanation,
      teacher_id: currentUser?.id || "usr-teacher-01",
      is_contextualized: true,
    });

    setCreatedQuestionId(newQuestion.id);
    loadData();
    setWizardStep(4);
  };

  // Delete Question
  const handleDeleteQuestion = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus butir soal ini dari bank soal?")) {
      repository.deleteQuestion(id);
      loadData();
    }
  };

  // Publish Question to Room
  const handleOpenPublishRoom = (q: Question) => {
    setQuestionToPublish(q);
    const randomCode = `SOL-${Math.floor(1000 + Math.random() * 9000)}`;
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
    return (
      q.question_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <TeacherWorkspaceShell activeGroupId="questions">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-12">
        {/* ===================================================================
            1. HEADER BANNER
            =================================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 sm:p-7 rounded-[28px] sm:rounded-[32px] border border-[#E9E5E8] shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#FFD36D] text-[#51465B] flex items-center justify-center shadow-xs shrink-0">
              <FileQuestion className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#23212A] tracking-tight">
                Bank Soal Kontekstual
              </h1>
              <p className="text-xs text-[#756F7A] mt-0.5">
                Katalog butir asesmen Kurikulum Merdeka yang diselaraskan dengan data statistik BPS {activeSchool?.region_name}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari butir soal..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E9E5E8] bg-[#FAF7F3] text-xs font-semibold text-[#23212A] focus:outline-none focus:ring-2 focus:ring-[#51465B]/20"
              />
            </div>
          </div>
        </div>

        {/* ===================================================================
            2. OPSI 4 METODE INPUT SOAL + FITUR BUAT DARI MATERI YANG ADA
            =================================================================== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-black text-[#23212A] tracking-tight">
              Pilih Metode Pembuatan Soal
            </h2>
            <span className="text-xs font-bold text-[#756F7A]">
              Form Terpandu Step-by-Step
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Opsi 1: Ketik Manual */}
            <button
              type="button"
              onClick={() => handleOpenWizard("manual")}
              className="p-5 rounded-[24px] bg-white border border-[#E9E5E8] hover:border-[#51465B] hover:shadow-md transition-all text-left group flex flex-col justify-between cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#51465B]/10 text-[#51465B] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <PenTool className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#23212A] group-hover:text-[#51465B] transition-colors">
                  Ketik Manual
                </h3>
                <p className="text-[11px] text-[#756F7A] mt-0.5 leading-relaxed">
                  Tulis pertanyaan, opsi jawaban A-D, dan kunci jawaban sendiri.
                </p>
              </div>
            </button>

            {/* Opsi 2: Motret Langsung */}
            <button
              type="button"
              onClick={() => handleOpenWizard("camera")}
              className="p-5 rounded-[24px] bg-white border border-[#E9E5E8] hover:border-[#51465B] hover:shadow-md transition-all text-left group flex flex-col justify-between cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Camera className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#23212A] group-hover:text-blue-700 transition-colors">
                  Motret Langsung
                </h3>
                <p className="text-[11px] text-[#756F7A] mt-0.5 leading-relaxed">
                  Pindai naskah lembar soal fisik menjadi format digital via OCR.
                </p>
              </div>
            </button>

            {/* Opsi 3: Upload PDF */}
            <button
              type="button"
              onClick={() => handleOpenWizard("pdf")}
              className="p-5 rounded-[24px] bg-white border border-[#E9E5E8] hover:border-[#51465B] hover:shadow-md transition-all text-left group flex flex-col justify-between cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Upload className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#23212A] group-hover:text-amber-800 transition-colors">
                  Upload PDF
                </h3>
                <p className="text-[11px] text-[#756F7A] mt-0.5 leading-relaxed">
                  Ekstraksi butir soal dari berkas naskah PDF yang sudah ada.
                </p>
              </div>
            </button>

            {/* Opsi 4: Generate AI */}
            <button
              type="button"
              onClick={() => handleOpenWizard("ai")}
              className="p-5 rounded-[24px] bg-[#FFD36D]/30 border-2 border-[#FFD36D] hover:border-[#51465B] hover:shadow-md transition-all text-left group flex flex-col justify-between cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#51465B] text-[#FFD36D] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Sparkles className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#23212A] group-hover:text-[#51465B] transition-colors">
                  Generate AI
                </h3>
                <p className="text-[11px] text-[#756F7A] mt-0.5 leading-relaxed">
                  Generate butir soal kontekstual otomatis berbasis data BPS.
                </p>
              </div>
            </button>
          </div>

          {/* ===================================================================
              FITUR SPESIAL: BUAT SOAL DARI MATERI YANG TELAH DIBUAT (KODE UNIK)
              =================================================================== */}
          <div className="p-5 sm:p-6 rounded-[24px] sm:rounded-[28px] bg-[#51465B] text-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-[#FFD36D]" />
                <h3 className="text-sm sm:text-base font-black text-white">
                  Buat Soal Berdasarkan Materi yang Telah Dibuat
                </h3>
              </div>
              <p className="text-xs text-white/80 max-w-xl leading-relaxed">
                Tinggal masukkan kode unik materi yang sudah Anda buat, AI akan otomatis mengambil narasi materi tersebut dan menyusun butir asesmen yang selaras.
              </p>
            </div>

            <form onSubmit={handleCreateFromMaterialCode} className="flex items-center gap-2 w-full md:w-auto shrink-0">
              <input
                type="text"
                required
                placeholder="Masukkan Kode Materi (cth: mat-xxxx)"
                value={inputMaterialCode}
                onChange={(e) => setInputMaterialCode(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-white text-[#23212A] text-xs font-semibold placeholder:text-slate-400 focus:outline-none w-full md:w-60"
              />
              <button
                type="submit"
                className="py-2.5 px-4 rounded-xl bg-[#FFD36D] hover:bg-[#F5C75A] text-[#23212A] font-black text-xs shrink-0 transition-transform active:scale-95 cursor-pointer shadow-xs"
              >
                Buat Soal
              </button>
            </form>
          </div>
        </div>

        {/* ===================================================================
            3. DAFTAR BERKAS BANK SOAL
            Format berkas kartu yang rapi dengan relasi Room
            =================================================================== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#23212A] tracking-tight">
                Daftar Berkas Butir Soal ({filteredQuestions.length})
              </h2>
              <p className="text-xs text-[#756F7A]">
                Koleksi butir soal tersimpan dan siap dipublikasikan ke Room ujian siswa
              </p>
            </div>
          </div>

          {filteredQuestions.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-[28px] border border-[#E9E5E8] space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#FAF7F3] text-slate-400 mx-auto flex items-center justify-center">
                <FileQuestion className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Belum ada butir soal</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Mulai buat soal kontekstual baru menggunakan salah satu metode di atas atau dari materi Anda.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
              {filteredQuestions.map((q) => {
                // Find if this question is already in a room
                const activeRoom = rooms.find(
                  (r) => r.type === "question" && r.resource_id === q.id
                );

                return (
                  <div
                    key={q.id}
                    className="p-5 sm:p-6 rounded-[24px] sm:rounded-[28px] bg-white border border-[#E9E5E8] hover:border-[#51465B]/30 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      {/* Top Bar: Subject, Grade & Type Badge */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className="px-3 py-1 rounded-full bg-[#FAF7F3] border border-[#E9E5E8] text-[#51465B] font-extrabold text-[11px]">
                          {q.subject} • Kelas {q.grade} SD
                        </span>

                        <span className="px-2.5 py-0.5 rounded-md bg-[#FFD36D]/40 text-[#51465B] font-black text-[10px] uppercase">
                          {q.type === "multiple_choice" ? "Pilihan Ganda" : "Uraian / Essay"}
                        </span>
                      </div>

                      {/* Topic Title */}
                      <h4 className="text-xs font-black text-[#51465B] uppercase tracking-wide">
                        {q.topic}
                      </h4>

                      {/* Question Text */}
                      <p className="text-xs sm:text-sm font-semibold text-[#23212A] leading-relaxed mt-1.5">
                        {q.question_text}
                      </p>

                      {/* Options Preview (if Multiple Choice) */}
                      {q.options && q.options.length > 0 && (
                        <div className="grid grid-cols-2 gap-1.5 pt-2.5">
                          {q.options.map((opt) => (
                            <div
                              key={opt.key}
                              className={`p-1.5 px-2.5 rounded-lg text-xs font-medium border ${
                                opt.key === q.correct_answer
                                  ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-bold"
                                  : "bg-[#FAF7F3] border-slate-200 text-slate-700"
                              }`}
                            >
                              <strong className="mr-1">{opt.key}.</strong> {opt.text}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom Status & Actions */}
                    <div className="pt-3 border-t border-[#E9E5E8] flex flex-wrap items-center justify-between gap-2.5">
                      {activeRoom ? (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Aktif di Room: <strong>{activeRoom.code}</strong></span>
                        </div>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-400">
                          Kunci: <strong>{q.correct_answer}</strong>
                        </span>
                      )}

                      <div className="flex items-center gap-2">
                        {/* Publish via Room Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenPublishRoom(q)}
                          className="py-2 px-3.5 rounded-xl bg-[#51465B] hover:bg-[#3D3445] text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                        >
                          <DoorOpen className="w-3.5 h-3.5 text-[#FFD36D]" />
                          <span>{activeRoom ? "Kelola Room" : "Publikasikan ke Room"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Hapus butir soal ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* =====================================================================
          4. MODAL WIZARD STEP-BY-STEP INPUT SOAL
          Step 1: Identitas & Konteks Soal
          Step 2: Input Soal Sesuai Metode
          Step 3: Preview, Review & Edit
          Step 4: Berhasil Disimpan
          ===================================================================== */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-[28px] sm:rounded-[36px] border border-slate-200 shadow-2xl max-w-2xl w-full p-6 sm:p-8 relative my-auto max-h-[92vh] overflow-y-auto">
            {/* Header Wizard & Step Indicator */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#51465B] block">
                  Langkah {wizardStep} dari 4 •{" "}
                  {selectedMethod === "manual"
                    ? "Ketik Manual"
                    : selectedMethod === "camera"
                    ? "Motret Langsung (OCR)"
                    : selectedMethod === "pdf"
                    ? "Upload PDF"
                    : selectedMethod === "from_material"
                    ? "Berdasarkan Materi"
                    : "Generate AI"}
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  {wizardStep === 1
                    ? "Form Identitas & Konteks Soal"
                    : wizardStep === 2
                    ? "Input Pertanyaan & Jawaban"
                    : wizardStep === 3
                    ? "Tinjau & Edit Pratinjau Soal"
                    : "Butir Soal Berhasil Disimpan!"}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsWizardOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* STEP 1: FORM IDENTITAS & KONTEKS */}
            {wizardStep === 1 && (
              <form onSubmit={handleNextToContent} className="space-y-4 pt-5">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Topik / Judul Soal
                  </label>
                  <input
                    type="text"
                    required
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Contoh: Operasi Hitung Campuran dalam Jual Beli Komoditas Pasar"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#FAF7F3] text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#51465B]/20"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Mata Pelajaran
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#FAF7F3] text-xs font-semibold text-slate-900"
                    >
                      {SUBJECT_OPTIONS.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Tipe Butir Soal
                    </label>
                    <select
                      value={questionType}
                      onChange={(e) => setQuestionType(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#FAF7F3] text-xs font-semibold text-slate-900"
                    >
                      <option value="multiple_choice">Pilihan Ganda (A, B, C, D)</option>
                      <option value="essay">Uraian / Essay Terbimbing</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Tingkat Kelas
                    </label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#FAF7F3] text-xs font-semibold text-slate-900"
                    >
                      <option value={5}>Fase C • Kelas 5 SD</option>
                      <option value={4}>Fase B • Kelas 4 SD</option>
                      <option value={6}>Fase C • Kelas 6 SD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Wilayah Konteks Lokal BPS
                    </label>
                    <select
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#FAF7F3] text-xs font-semibold text-slate-900"
                    >
                      {REGION_OPTIONS.map((reg) => (
                        <option key={reg} value={reg}>
                          {reg}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsWizardOpen(false)}
                    className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 px-6 rounded-xl bg-[#51465B] hover:bg-[#3D3445] text-white font-black text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Lanjut ke Input Soal</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#FFD36D]" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: INPUT SOAL SESUAI METODE */}
            {wizardStep === 2 && (
              <div className="space-y-4 pt-5">
                {selectedMethod === "manual" && (
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Teks Narasi & Pertanyaan Soal
                      </label>
                      <textarea
                        rows={3}
                        value={promptText}
                        onChange={(e) => setPromptText(e.target.value)}
                        placeholder="Tuliskan butir soal cerita kontekstual..."
                        className="w-full p-3 rounded-xl border border-slate-200 bg-[#FAF7F3] text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#51465B]/20"
                      />
                    </div>

                    {questionType === "multiple_choice" && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Opsi A</label>
                          <input
                            type="text"
                            value={optionA}
                            onChange={(e) => setOptionA(e.target.value)}
                            className="w-full p-2 rounded-xl border border-slate-200 bg-[#FAF7F3] text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Opsi B</label>
                          <input
                            type="text"
                            value={optionB}
                            onChange={(e) => setOptionB(e.target.value)}
                            className="w-full p-2 rounded-xl border border-slate-200 bg-[#FAF7F3] text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Opsi C</label>
                          <input
                            type="text"
                            value={optionC}
                            onChange={(e) => setOptionC(e.target.value)}
                            className="w-full p-2 rounded-xl border border-slate-200 bg-[#FAF7F3] text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Opsi D</label>
                          <input
                            type="text"
                            value={optionD}
                            onChange={(e) => setOptionD(e.target.value)}
                            className="w-full p-2 rounded-xl border border-slate-200 bg-[#FAF7F3] text-xs"
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          Kunci Jawaban Benar
                        </label>
                        <select
                          value={correctAnswer}
                          onChange={(e) => setCorrectAnswer(e.target.value)}
                          className="w-full p-2 rounded-xl border border-slate-200 bg-[#FAF7F3] text-xs font-bold text-[#51465B]"
                        >
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          Pembahasan Guru (Opsional)
                        </label>
                        <input
                          type="text"
                          value={explanation}
                          onChange={(e) => setExplanation(e.target.value)}
                          placeholder="Langkah penyelesaian ringkas..."
                          className="w-full p-2 rounded-xl border border-slate-200 bg-[#FAF7F3] text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {selectedMethod === "camera" && (
                  <div className="p-6 rounded-2xl bg-[#FAF7F3] border-2 border-dashed border-slate-300 text-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto">
                      <Camera className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Pindai Soal dari Naskah Kertas</h4>
                      <p className="text-xs text-slate-500">Ambil foto dokumen naskah soal ujian fisik</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCapturedPhotoName("foto_lembar_soal_sd.jpg")}
                      className="py-2.5 px-5 rounded-xl bg-blue-700 text-white font-bold text-xs shadow-xs hover:bg-blue-800 transition-colors cursor-pointer"
                    >
                      {capturedPhotoName ? "Foto Terpilih: " + capturedPhotoName : "Pindai Kamera Sekarang"}
                    </button>
                  </div>
                )}

                {selectedMethod === "pdf" && (
                  <div className="p-6 rounded-2xl bg-[#FAF7F3] border-2 border-dashed border-slate-300 text-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                      <Upload className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Upload Berkas PDF Soal</h4>
                      <p className="text-xs text-slate-500">Unggah berkas soal kurikulum merdeka (.pdf)</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUploadedFileName("naskah_soal_matematika_fase_c.pdf")}
                      className="py-2.5 px-5 rounded-xl bg-amber-800 text-white font-bold text-xs shadow-xs hover:bg-amber-900 transition-colors cursor-pointer"
                    >
                      {uploadedFileName ? "Berkas: " + uploadedFileName : "Pilih Berkas PDF"}
                    </button>
                  </div>
                )}

                {(selectedMethod === "ai" || selectedMethod === "from_material") && (
                  <div className="space-y-3">
                    <div className="p-4 rounded-2xl bg-[#FFD36D]/20 border border-[#FFD36D] space-y-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#51465B]" />
                        <h4 className="text-xs font-bold text-slate-900">
                          {selectedMethod === "from_material" ? "Generator Soal Berbasis Materi" : "Contextual AI Generator"}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        {selectedMethod === "from_material"
                          ? `Soal akan dibuat otomatis mengacu pada narasi materi "${topic}" dan data statistik riil daerah ${region}.`
                          : `AI akan menyusun butir soal cerita numerasi/sains terintegrasi data komoditas wilayah ${region}.`}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Kembali</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextToPreview}
                    disabled={isAiGenerating}
                    className="py-2.5 px-6 rounded-xl bg-[#51465B] hover:bg-[#3D3445] text-white font-black text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  >
                    {isAiGenerating ? (
                      <span>Mengontekstualisasikan Soal...</span>
                    ) : (
                      <>
                        <span>Tinjau & Edit Pratinjau</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#FFD36D]" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: PREVIEW & REVIEW / EDITABLE FIELDS */}
            {wizardStep === 3 && (
              <div className="space-y-4 pt-5">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Pratinjau Soal: Anda dapat mengoreksi dan mengedit butir soal di bawah sebelum menyimpan.</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Pertanyaan Soal (Bisa diedit)
                    </label>
                    <textarea
                      rows={3}
                      value={previewPrompt}
                      onChange={(e) => setPreviewPrompt(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-[#FAF7F3] text-xs font-semibold text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Opsi A</label>
                      <input
                        type="text"
                        value={previewOptionA}
                        onChange={(e) => setPreviewOptionA(e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-200 bg-[#FAF7F3] text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Opsi B</label>
                      <input
                        type="text"
                        value={previewOptionB}
                        onChange={(e) => setPreviewOptionB(e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-200 bg-[#FAF7F3] text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Opsi C</label>
                      <input
                        type="text"
                        value={previewOptionC}
                        onChange={(e) => setPreviewOptionC(e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-200 bg-[#FAF7F3] text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Opsi D</label>
                      <input
                        type="text"
                        value={previewOptionD}
                        onChange={(e) => setPreviewOptionD(e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-200 bg-[#FAF7F3] text-xs font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Kunci Jawaban
                      </label>
                      <select
                        value={previewCorrect}
                        onChange={(e) => setPreviewCorrect(e.target.value)}
                        className="w-full p-2 rounded-xl border border-slate-200 bg-[#FAF7F3] text-xs font-bold text-[#51465B]"
                      >
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Pembahasan Guru
                      </label>
                      <input
                        type="text"
                        value={previewExplanation}
                        onChange={(e) => setPreviewExplanation(e.target.value)}
                        className="w-full p-2 rounded-xl border border-slate-200 bg-[#FAF7F3] text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setWizardStep(2)}
                    className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Kembali Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleFinalSave}
                    className="py-2.5 px-6 rounded-xl bg-[#51465B] hover:bg-[#3D3445] text-white font-black text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Simpan ke Bank Soal</span>
                    <Check className="w-4 h-4 text-[#FFD36D]" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: RESULT / FINISH */}
            {wizardStep === 4 && (
              <div className="py-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Butir Soal Berhasil Disimpan!
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                    Soal telah ditambahkan ke bank soal dan siap digunakan untuk paket ujian atau publikasi via Room.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsWizardOpen(false)}
                    className="py-2.5 px-5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs cursor-pointer"
                  >
                    Tutup & Lihat Berkas
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsWizardOpen(false);
                      const saved = questions.find((q) => q.id === createdQuestionId);
                      if (saved) handleOpenPublishRoom(saved);
                    }}
                    className="py-2.5 px-5 rounded-xl bg-[#51465B] hover:bg-[#3D3445] text-white font-black text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <DoorOpen className="w-4 h-4 text-[#FFD36D]" />
                    <span>Publikasikan via Room</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          5. MODAL PUBLIKASIKAN SOAL KE ROOM (AKSES SISWA TANPA LOGIN)
          ===================================================================== */}
      {isRoomModalOpen && questionToPublish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-[28px] sm:rounded-[36px] border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-7 relative animate-in fade-in zoom-in-95">
            <button
              type="button"
              onClick={() => setIsRoomModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#FFD36D] text-[#51465B] flex items-center justify-center shadow-xs">
                <DoorOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Publikasikan Soal via Room
                </h3>
                <p className="text-xs text-slate-500">Siswa dapat langsung mengerjakan latihan tanpa login</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-[#FAF7F3] border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Butir Soal Terpilih:</span>
                <span className="font-bold text-slate-900 line-clamp-2">{questionToPublish.question_text}</span>
              </div>

              {!roomCreatedSuccess ? (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Kode Akses Room
                    </label>
                    <input
                      type="text"
                      value={generatedRoomCode}
                      onChange={(e) => setGeneratedRoomCode(e.target.value.toUpperCase())}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#FAF7F3] font-mono font-bold text-sm text-[#51465B]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleCreateRoomForQuestion}
                    className="w-full py-3 rounded-xl bg-[#51465B] hover:bg-[#3D3445] text-white font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Terbitkan Room Ujian</span>
                    <ArrowRight className="w-4 h-4 text-[#FFD36D]" />
                  </button>
                </>
              ) : (
                <div className="text-center space-y-3 pt-2">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                    <p className="text-xs font-bold">Room Ujian Berhasil Dibuka!</p>
                    <div className="text-2xl font-mono font-black text-[#51465B] tracking-wider my-2">
                      {generatedRoomCode}
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Tautan siswa: <code>{typeof window !== "undefined" ? window.location.origin : ""}/room/{generatedRoomCode}</code>
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(`${typeof window !== "undefined" ? window.location.origin : ""}/room/${generatedRoomCode}`)}
                      className="flex-1 py-2.5 rounded-xl bg-[#FAF7F3] border border-slate-200 hover:bg-slate-100 text-slate-800 font-bold text-xs"
                    >
                      {copiedCode ? "Tautan Tersalin!" : "Salin Tautan"}
                    </button>
                    <Link
                      href={`/room/${generatedRoomCode}`}
                      target="_blank"
                      className="py-2.5 px-4 rounded-xl bg-[#51465B] text-white font-bold text-xs flex items-center gap-1.5"
                    >
                      <span>Buka Room</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </TeacherWorkspaceShell>
  );
}
