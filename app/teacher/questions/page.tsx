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
      setManualQuestionDraft(`Berdasarkan materi "${linkedMaterial.title}", buatkan butir pertanyaan kontekstual untuk siswa.`);
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
      setManualQuestionDraft("Seorang pedagang membeli 4 kotak kue khas seharga Rp18.000 per kotak dan membayar dengan Rp100.000. Berapa uang kembaliannya?");
    }

    setIsWizardOpen(true);
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

  // Proceed Step 1 -> Step 2
  const handleNextToContent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setWizardStep(2);
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
      setWizardStep(3);
    }, 1200);
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
      correct_answer: questionType === "multiple_choice" ? previewCorrect : "",
      explanation: previewExplanation,
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
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-12 font-sans">
        {/* ===================================================================
            1. JUDUL SAJA (HAPUS CARD PALING ATAS BERISI JUDUL)
            =================================================================== */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#23212A] tracking-tight">
            Bank Soal Kontekstual
          </h1>
          <p className="text-xs sm:text-sm text-[#756F7A] font-semibold mt-1">
            Katalog butir asesmen pilihan ganda dan esai Kurikulum Merdeka yang diselaraskan dengan kearifan lokal {activeSchool?.region_name}.
          </p>
        </div>

        {/* ===================================================================
            2. INPUT-INPUT SOAL: CARD BERWARNA, IKON AGAK BESAR & NAMA SAJA
            Termasuk tombol "Tambah Soal dari Materi" yang memunculkan overlay
            =================================================================== */}
        <div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {/* Opsi 1: Ketik Manual - Lavender / Purple */}
            <button
              type="button"
              onClick={() => handleOpenWizard("manual")}
              className="p-5 sm:p-6 rounded-[28px] bg-gradient-to-br from-[#F5F0FA] to-[#ECE3F5] border-2 border-[#51465B]/25 hover:border-[#51465B] shadow-xs hover:shadow-md transition-all text-center flex flex-col items-center justify-center gap-3 cursor-pointer group transform hover:-translate-y-0.5 active:scale-95"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#51465B] text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                <PenTool className="w-7 h-7 stroke-[2.2]" />
              </div>
              <span className="text-sm sm:text-base font-black text-[#51465B] tracking-tight">
                Ketik Manual
              </span>
            </button>

            {/* Opsi 2: Motret Langsung - Sky / Blue */}
            <button
              type="button"
              onClick={() => handleOpenWizard("camera")}
              className="p-5 sm:p-6 rounded-[28px] bg-gradient-to-br from-[#EBF5FB] to-[#D6EAF8] border-2 border-[#2980B9]/30 hover:border-[#2980B9] shadow-xs hover:shadow-md transition-all text-center flex flex-col items-center justify-center gap-3 cursor-pointer group transform hover:-translate-y-0.5 active:scale-95"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#2980B9] text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                <Camera className="w-7 h-7 stroke-[2.2]" />
              </div>
              <span className="text-sm sm:text-base font-black text-[#1F618D] tracking-tight">
                Motret Langsung
              </span>
            </button>

            {/* Opsi 3: Upload PDF - Coral / Orange */}
            <button
              type="button"
              onClick={() => handleOpenWizard("pdf")}
              className="p-5 sm:p-6 rounded-[28px] bg-gradient-to-br from-[#FEF5E7] to-[#FDEBD0] border-2 border-[#D35400]/30 hover:border-[#D35400] shadow-xs hover:shadow-md transition-all text-center flex flex-col items-center justify-center gap-3 cursor-pointer group transform hover:-translate-y-0.5 active:scale-95"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#D35400] text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                <Upload className="w-7 h-7 stroke-[2.2]" />
              </div>
              <span className="text-sm sm:text-base font-black text-[#A04000] tracking-tight">
                Upload PDF
              </span>
            </button>

            {/* Opsi 4: Generate AI - Gold / Amber */}
            <button
              type="button"
              onClick={() => handleOpenWizard("ai")}
              className="p-5 sm:p-6 rounded-[28px] bg-gradient-to-br from-[#FFFBF0] to-[#FFF3CD] border-2 border-[#FFD36D] hover:border-[#B7950B] shadow-xs hover:shadow-md transition-all text-center flex flex-col items-center justify-center gap-3 cursor-pointer group transform hover:-translate-y-0.5 active:scale-95"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#FFD36D] text-[#251E2B] flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                <Sparkles className="w-7 h-7 stroke-[2.2]" />
              </div>
              <span className="text-sm sm:text-base font-black text-[#251E2B] tracking-tight">
                Generate AI
              </span>
            </button>

            {/* Opsi 5: Tambah Soal dari Materi - Mint / Emerald */}
            <button
              type="button"
              onClick={() => setIsFromMaterialOverlayOpen(true)}
              className="p-5 sm:p-6 rounded-[28px] bg-gradient-to-br from-[#EAFAF1] to-[#D5F5E3] border-2 border-[#27AE60]/30 hover:border-[#27AE60] shadow-xs hover:shadow-md transition-all text-center flex flex-col items-center justify-center gap-3 cursor-pointer group transform hover:-translate-y-0.5 active:scale-95 col-span-2 md:col-span-1"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#27AE60] text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                <Link2 className="w-7 h-7 stroke-[2.2]" />
              </div>
              <span className="text-sm sm:text-base font-black text-[#196F3D] tracking-tight">
                Tambah Soal dari Materi
              </span>
            </button>
          </div>
        </div>

        {/* ===================================================================
            3. DAFTAR BUTIR SOAL: JUDUL DAFTAR + SEARCH BAR & FILTER DI BAWAHNYA
            =================================================================== */}
        <div className="space-y-4 pt-2">
          {/* Judul Daftar */}
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[#23212A] tracking-tight">
              Daftar Butir Soal ({filteredQuestions.length})
            </h2>
            <p className="text-xs text-[#756F7A] mt-0.5 font-medium">
              Katalog butir soal asesmen kontekstual pilihan ganda dan esai yang telah dibuat.
            </p>
          </div>

          {/* Search Bar & Instant Filter Langsung di Bawah Judul Daftar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-3xl border border-[#E9E5E8] shadow-xs">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756F7A]" />
              <input
                type="text"
                placeholder="Cari butir soal, topik, atau kode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-full bg-[#FAF7F3] border border-[#E9E5E8] text-xs font-semibold text-[#23212A] placeholder:text-[#756F7A]/60 focus:outline-none focus:ring-2 focus:ring-[#51465B]/20"
              />
            </div>

            {/* Instant Filter Pills (Langsung Aktif Tanpa Tombol Konfirmasi) */}
            <div className="flex items-center gap-1.5 overflow-x-auto shrink-0">
              <button
                type="button"
                onClick={() => setFilterType("all")}
                className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  filterType === "all"
                    ? "bg-[#51465B] text-white shadow-xs"
                    : "bg-[#FAF7F3] text-[#756F7A] hover:text-[#23212A]"
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setFilterType("multiple_choice")}
                className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  filterType === "multiple_choice"
                    ? "bg-[#51465B] text-white shadow-xs"
                    : "bg-[#FAF7F3] text-[#756F7A] hover:text-[#23212A]"
                }`}
              >
                Pilihan Ganda
              </button>
              <button
                type="button"
                onClick={() => setFilterType("essay")}
                className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  filterType === "essay"
                    ? "bg-[#51465B] text-white shadow-xs"
                    : "bg-[#FAF7F3] text-[#756F7A] hover:text-[#23212A]"
                }`}
              >
                Esai
              </button>

              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="px-3.5 py-2 rounded-full bg-[#FAF7F3] border border-[#E9E5E8] text-xs font-bold text-[#51465B] focus:outline-none cursor-pointer"
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
              CARD HORIZONTAL DAFTAR SOAL DENGAN IKON & WARNA KHAS SOAL (#FFD36D)
              =================================================================== */}
          {filteredQuestions.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-[#E9E5E8] space-y-3">
              <div className="w-14 h-14 rounded-full bg-[#FAF7F3] text-slate-400 mx-auto flex items-center justify-center">
                <FileQuestion className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Belum ada butir soal</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Mulai buat butir soal baru menggunakan salah satu metode input di atas.
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredQuestions.map((q) => {
                const activeRoom = rooms.find(
                  (r) => r.type === "question" && r.resource_id === q.id
                );
                const isEssay = q.type === "essay";

                return (
                  <div
                    key={q.id}
                    className="p-5 sm:p-6 rounded-[28px] bg-gradient-to-r from-[#FFFDF5] to-white border-2 border-[#FFD36D] hover:border-[#D4AC0D] hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                  >
                    {/* Left: Characteristic Question Icon + Info */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-[#FFD36D] text-[#251E2B] flex items-center justify-center shrink-0 shadow-xs">
                        {isEssay ? (
                          <FileText className="w-6 h-6 stroke-[2.2]" />
                        ) : (
                          <Brain className="w-6 h-6 stroke-[2.2]" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-3 py-1 rounded-full bg-[#51465B] text-white font-black text-[10px] uppercase tracking-wider">
                            {q.subject} &bull; Kelas {q.grade} SD
                          </span>

                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isEssay ? "bg-purple-100 text-purple-900" : "bg-amber-100 text-amber-900"
                          }`}>
                            {isEssay ? "Soal Esai" : "Pilihan Ganda"}
                          </span>

                          {/* Kode Unik Soal with Copy Button */}
                          <button
                            type="button"
                            onClick={() => handleCopy(q.id)}
                            className="py-1 px-3 rounded-full bg-slate-100 hover:bg-slate-200 text-[10px] font-mono font-bold text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
                            title="Klik untuk menyalin kode unik soal"
                          >
                            {copiedCode === q.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-700 font-sans">Tersalin</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-slate-500" />
                                <span>{q.id}</span>
                              </>
                            )}
                          </button>
                        </div>

                        <h3 className="text-base sm:text-lg font-black text-[#23212A] tracking-tight group-hover:text-[#51465B] transition-colors">
                          {q.topic}
                        </h3>

                        <p className="text-xs text-[#756F7A] line-clamp-2 leading-relaxed">
                          {q.question_text}
                        </p>
                      </div>
                    </div>

                    {/* Right: Actions Row */}
                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      {activeRoom ? (
                        <Link
                          href={`/room/${activeRoom.code}`}
                          target="_blank"
                          className="px-4 py-2 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-100 transition-colors"
                        >
                          <DoorOpen className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Room: {activeRoom.code}</span>
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenPublishRoom(q)}
                          className="px-4 py-2 rounded-full bg-[#51465B] hover:bg-[#3D3445] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                        >
                          <DoorOpen className="w-3.5 h-3.5 text-[#FFD36D]" />
                          <span>Buka Room</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-2 rounded-full border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Hapus Soal"
                      >
                        <Trash2 className="w-4 h-4" />
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
          OVERLAY KHUSUS: TAMBAH SOAL DARI MATERI YANG TELAH DIBUAT
          Menampilkan form masukkan kode ATAU langsung milih dari daftar materi!
          ===================================================================== */}
      {isFromMaterialOverlayOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-2xl max-w-xl w-full p-6 sm:p-8 relative my-auto max-h-[90vh] flex flex-col">
            {/* Header Overlay */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#27AE60] text-white flex items-center justify-center shadow-xs">
                  <Link2 className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#23212A]">
                    Tambah Soal dari Materi
                  </h3>
                  <p className="text-xs text-[#756F7A]">
                    Masukkan kode materi atau pilih langsung dari daftar materi di bawah
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsFromMaterialOverlayOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold"
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
                  className="flex-1 px-4 py-2.5 rounded-full border border-slate-200 bg-[#FAF7F3] text-xs font-semibold text-[#23212A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#27AE60]/20"
                />
                <button
                  type="submit"
                  disabled={!inputMaterialCode.trim()}
                  className="px-5 py-2.5 rounded-full bg-[#27AE60] hover:bg-[#219653] text-white font-bold text-xs shadow-xs disabled:opacity-40 cursor-pointer"
                >
                  Pilih Kode
                </button>
              </form>

              {/* Divider ATAU */}
              <div className="flex items-center gap-3 py-1">
                <div className="h-px bg-slate-200 flex-1" />
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Atau Langsung Pilih Materi
                </span>
                <div className="h-px bg-slate-200 flex-1" />
              </div>

              {/* Search Inside Overlay */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari materi dari daftar..."
                  value={materialFilterSearch}
                  onChange={(e) => setMaterialFilterSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-full border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none"
                />
              </div>

              {/* Daftar Materi yang Muncul di Overlay */}
              <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1 divide-y divide-slate-100">
                {filteredMaterialsForOverlay.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500">
                    Tidak ada materi yang sesuai.
                  </div>
                ) : (
                  filteredMaterialsForOverlay.map((mat) => (
                    <div
                      key={mat.id}
                      onClick={() => handleSelectMaterialFromOverlay(mat)}
                      className="p-3.5 rounded-2xl border border-slate-200 hover:border-[#27AE60] bg-white hover:bg-[#EAFAF1]/30 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {mat.id}
                          </span>
                          <span className="text-[10px] font-bold text-[#51465B]">
                            {mat.subject} &bull; Kelas {mat.grade} SD
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-[#23212A] group-hover:text-[#196F3D] truncate">
                          {mat.title}
                        </h4>
                      </div>

                      <button
                        type="button"
                        className="px-3.5 py-1.5 rounded-full bg-[#27AE60] text-white text-xs font-bold opacity-90 group-hover:opacity-100 shrink-0"
                      >
                        Pilih Materi
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Footer Overlay */}
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsFromMaterialOverlayOpen(false)}
                className="px-5 py-2 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          CREATION WIZARD MODAL (STEP 1: JUDUL, MAPEL, JENJANG, BENTUK ->
          STEP 2: INPUT SOAL -> STEP 3: AI UBAH KONTEKS & REVIEW EDITABLE -> STEP 4)
          ===================================================================== */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-2xl max-w-xl w-full p-6 sm:p-8 relative my-auto max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#51465B] bg-[#51465B]/10 px-2.5 py-0.5 rounded-full">
                  Langkah {wizardStep} dari 3
                </span>
                <h3 className="text-lg font-black text-[#23212A] mt-1">
                  {wizardStep === 1
                    ? "Form Identitas & Bentuk Soal"
                    : wizardStep === 2
                    ? "Input Naskah Soal"
                    : wizardStep === 3
                    ? "Review & Tinjau Hasil Konteks AI"
                    : "Butir Soal Berhasil Dibuat!"}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsWizardOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* STEP 1: IDENTITAS (JUDUL/TOPIK, MAPEL, JENJANG, BENTUK SOAL) */}
            {wizardStep === 1 && (
              <form onSubmit={handleNextToContent} className="space-y-4 pt-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Judul / Topik Soal
                  </label>
                  <input
                    type="text"
                    required
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Contoh: Perhitungan Belanja di Pasar Tradisional"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-[#23212A] focus:outline-none focus:ring-2 focus:ring-[#51465B]/20"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Mata Pelajaran
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-[#23212A]"
                    >
                      <option value="Matematika">Matematika</option>
                      <option value="IPAS (Ilmu Pengetahuan Alam & Sosial)">IPAS</option>
                      <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                      <option value="Pendidikan Pancasila">Pendidikan Pancasila</option>
                      <option value="Seni Budaya & Prakarya">Seni Budaya & Prakarya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Jenjang / Tingkat Kelas
                    </label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-[#23212A]"
                    >
                      {[1, 2, 3, 4, 5, 6].map((g) => (
                        <option key={g} value={g}>
                          Kelas {g} Sekolah Dasar (SD)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Pilihan Bentuk Soal: Pilihan Ganda atau Esai */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Bentuk Soal
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setQuestionType("multiple_choice")}
                      className={`py-3 px-4 rounded-2xl border-2 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        questionType === "multiple_choice"
                          ? "border-[#51465B] bg-[#51465B] text-white shadow-xs"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <Brain className="w-4 h-4" />
                      <span>Pilihan Ganda</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setQuestionType("essay")}
                      className={`py-3 px-4 rounded-2xl border-2 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        questionType === "essay"
                          ? "border-[#51465B] bg-[#51465B] text-white shadow-xs"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      <span>Soal Esai</span>
                    </button>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-[#51465B] hover:bg-[#3D3445] text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Lanjut ke Input Naskah</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: INPUT NASKAH SOAL + TOMBOL AI PROSES */}
            {wizardStep === 2 && (
              <div className="space-y-4 pt-4">
                {(selectedMethod === "manual" || selectedMethod === "from_material") && (
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Tulis Naskah Soal Asli / Konsep:
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={manualQuestionDraft}
                      onChange={(e) => setManualQuestionDraft(e.target.value)}
                      placeholder="Tulis naskah soal standar yang ingin dikontekstualisasikan oleh sistem AI..."
                      className="w-full p-3.5 rounded-2xl border border-slate-200 text-xs leading-relaxed text-[#23212A] focus:outline-none focus:ring-2 focus:ring-[#51465B]/20"
                    />
                  </div>
                )}

                {selectedMethod === "camera" && (
                  <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-2">
                    <Camera className="w-8 h-8 text-[#2980B9] mx-auto" />
                    <p className="text-xs font-bold text-slate-700">Foto lembar naskah soal fisik via kamera</p>
                    <button
                      type="button"
                      onClick={() => setCapturedPhotoName("foto_lembar_soal.jpg")}
                      className="px-4 py-2 rounded-full bg-[#2980B9] text-white text-xs font-bold"
                    >
                      {capturedPhotoName ? "Foto Terpindai: foto_lembar_soal.jpg" : "Ambil Foto Sekarang"}
                    </button>
                  </div>
                )}

                {selectedMethod === "pdf" && (
                  <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-2">
                    <Upload className="w-8 h-8 text-[#D35400] mx-auto" />
                    <p className="text-xs font-bold text-slate-700">Unggah naskah soal berformat PDF</p>
                    <button
                      type="button"
                      onClick={() => setUploadedFileName("naskah_soal_ujian.pdf")}
                      className="px-4 py-2 rounded-full bg-[#D35400] text-white text-xs font-bold"
                    >
                      {uploadedFileName ? "Berkas Terunggah: naskah_soal_ujian.pdf" : "Pilih Berkas PDF"}
                    </button>
                  </div>
                )}

                {selectedMethod === "ai" && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                    <span className="font-bold block">Integrasi Data Kontekstual {region}:</span>
                    <p>
                      Sistem AI akan otomatis merumuskan butir asesmen {questionType === "multiple_choice" ? "pilihan ganda" : "esai"} dengan mengaitkan data lingkungan nyata daerah {region}.
                    </p>
                  </div>
                )}

                <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    className="px-4 py-2 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Kembali
                  </button>

                  <button
                    type="button"
                    disabled={isAiGenerating}
                    onClick={handleTriggerAiContextTransformation}
                    className="px-6 py-2.5 rounded-full bg-[#51465B] hover:bg-[#3D3445] text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#FFD36D]" />
                    <span>{isAiGenerating ? "AI Sedang Menyesuaikan Konteks..." : "Sesuaikan Konteks dengan AI"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: REVIEW & TINJAU (DAPAT DIEDIT SEBELUM SIMPAN) */}
            {wizardStep === 3 && (
              <div className="space-y-4 pt-4">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Konteks soal disesuaikan oleh sistem AI! Anda dapat meninjau dan mengedit sebelum disimpan:</span>
                </div>

                {/* Question Prompt */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Teks Pertanyaan Kontekstual (Dapat Diedit)
                  </label>
                  <textarea
                    rows={4}
                    value={previewPrompt}
                    onChange={(e) => setPreviewPrompt(e.target.value)}
                    className="w-full p-3.5 rounded-2xl border border-slate-200 text-xs leading-relaxed text-[#23212A] focus:outline-none"
                  />
                </div>

                {/* Multiple Choice Options or Essay Rubric */}
                {questionType === "multiple_choice" ? (
                  <div className="space-y-2.5">
                    <label className="block text-xs font-bold text-slate-800">
                      Opsi Jawaban & Kunci Jawaban:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                          A
                        </span>
                        <input
                          type="text"
                          value={previewOptionA}
                          onChange={(e) => setPreviewOptionA(e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                          B
                        </span>
                        <input
                          type="text"
                          value={previewOptionB}
                          onChange={(e) => setPreviewOptionB(e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                          C
                        </span>
                        <input
                          type="text"
                          value={previewOptionC}
                          onChange={(e) => setPreviewOptionC(e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                          D
                        </span>
                        <input
                          type="text"
                          value={previewOptionD}
                          onChange={(e) => setPreviewOptionD(e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                        />
                      </div>
                    </div>

                    <div className="pt-1 flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700">Kunci Jawaban Benar:</span>
                      <select
                        value={previewCorrect}
                        onChange={(e) => setPreviewCorrect(e.target.value)}
                        className="px-3 py-1 rounded-lg border border-slate-200 text-xs font-bold text-[#51465B]"
                      >
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Rubrik Pedoman Penilaian Esai (Dapat Diedit)
                    </label>
                    <textarea
                      rows={3}
                      value={previewRubric}
                      onChange={(e) => setPreviewRubric(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs leading-relaxed text-[#23212A]"
                    />
                  </div>
                )}

                {/* Explanation */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Pembahasan Soal
                  </label>
                  <textarea
                    rows={2}
                    value={previewExplanation}
                    onChange={(e) => setPreviewExplanation(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs leading-relaxed text-[#23212A]"
                  />
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setWizardStep(2)}
                    className="px-4 py-2 rounded-full border border-slate-200 text-xs font-bold text-slate-600"
                  >
                    Ubah Draf
                  </button>

                  <button
                    type="button"
                    onClick={handleFinalSave}
                    className="px-6 py-2.5 rounded-full bg-[#51465B] hover:bg-[#3D3445] text-white text-xs font-bold shadow-md"
                  >
                    Simpan ke Bank Soal
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: SUKSES */}
            {wizardStep === 4 && (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-lg font-black text-[#23212A]">
                  Butir Soal Berhasil Disimpan!
                </h4>
                <p className="text-xs text-[#756F7A] max-w-sm mx-auto">
                  Butir asesmen telah tersimpan di katalog bank soal dan siap dibagikan ke siswa via Room Akses.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsWizardOpen(false)}
                    className="px-6 py-2.5 rounded-full bg-[#51465B] text-white text-xs font-bold"
                  >
                    Selesai & Tutup
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Publish Room Modal */}
      {isRoomModalOpen && questionToPublish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 text-center space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-[#51465B] text-white flex items-center justify-center mx-auto shadow-sm">
              <DoorOpen className="w-6 h-6 stroke-[2.2]" />
            </div>

            <div>
              <h3 className="text-base font-black text-[#23212A]">
                Buka Room untuk Soal Ini
              </h3>
              <p className="text-xs text-[#756F7A] mt-1">
                Siswa dapat langsung mengerjakan latihan tanpa akun dengan kode berikut:
              </p>
            </div>

            <div className="p-3 bg-[#FAF7F3] border border-[#E9E5E8] rounded-2xl">
              <span className="font-mono text-xl font-black tracking-widest text-[#23212A]">
                {generatedRoomCode}
              </span>
            </div>

            {roomCreatedSuccess ? (
              <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>Room berhasil diaktifkan!</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleCreateRoomForQuestion}
                className="w-full py-3 rounded-full bg-[#51465B] text-white font-bold text-xs shadow-md"
              >
                Aktifkan Room Sekarang
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsRoomModalOpen(false)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </TeacherWorkspaceShell>
  );
}
