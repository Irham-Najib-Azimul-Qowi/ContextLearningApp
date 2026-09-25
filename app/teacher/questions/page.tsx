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
            {/* Opsi 1: Ketik Manual - Deep Mauve */}
            <button
              type="button"
              onClick={() => handleOpenWizard("manual")}
              className="p-5 sm:p-6 rounded-[28px] bg-[#51465B] hover:bg-[#43394C] border-2 border-[#51465B] shadow-md hover:shadow-xl transition-all text-center flex flex-col items-center justify-center gap-3 cursor-pointer group transform hover:-translate-y-0.5 active:scale-95"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/20 text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                <PenTool className="w-7 h-7 stroke-[2.2]" />
              </div>
              <span className="text-sm sm:text-base font-black text-white tracking-tight">
                Ketik Manual
              </span>
            </button>

            {/* Opsi 2: Motret Langsung - Rich Ocean Blue */}
            <button
              type="button"
              onClick={() => handleOpenWizard("camera")}
              className="p-5 sm:p-6 rounded-[28px] bg-[#2471A3] hover:bg-[#1F618D] border-2 border-[#2471A3] shadow-md hover:shadow-xl transition-all text-center flex flex-col items-center justify-center gap-3 cursor-pointer group transform hover:-translate-y-0.5 active:scale-95"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/20 text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                <Camera className="w-7 h-7 stroke-[2.2]" />
              </div>
              <span className="text-sm sm:text-base font-black text-white tracking-tight">
                Motret Langsung
              </span>
            </button>

            {/* Opsi 3: Upload PDF - Warm Terracotta */}
            <button
              type="button"
              onClick={() => handleOpenWizard("pdf")}
              className="p-5 sm:p-6 rounded-[28px] bg-[#D35400] hover:bg-[#BA4A00] border-2 border-[#D35400] shadow-md hover:shadow-xl transition-all text-center flex flex-col items-center justify-center gap-3 cursor-pointer group transform hover:-translate-y-0.5 active:scale-95"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/20 text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                <Upload className="w-7 h-7 stroke-[2.2]" />
              </div>
              <span className="text-sm sm:text-base font-black text-white tracking-tight">
                Upload PDF
              </span>
            </button>

            {/* Opsi 4: Generate AI - Warm Vibrant Gold */}
            <button
              type="button"
              onClick={() => handleOpenWizard("ai")}
              className="p-5 sm:p-6 rounded-[28px] bg-[#FFD36D] hover:bg-[#F5C75A] border-2 border-[#51465B] shadow-md hover:shadow-xl transition-all text-center flex flex-col items-center justify-center gap-3 cursor-pointer group transform hover:-translate-y-0.5 active:scale-95"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#251E2B] text-[#FFD36D] flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                <Sparkles className="w-7 h-7 stroke-[2.2]" />
              </div>
              <span className="text-sm sm:text-base font-black text-[#251E2B] tracking-tight">
                Generate AI
              </span>
            </button>

            {/* Opsi 5: Tambah Soal dari Materi - Forest Emerald */}
            <button
              type="button"
              onClick={() => setIsFromMaterialOverlayOpen(true)}
              className="p-5 sm:p-6 rounded-[28px] bg-[#1E8449] hover:bg-[#196F3D] border-2 border-[#1E8449] shadow-md hover:shadow-xl transition-all text-center flex flex-col items-center justify-center gap-3 cursor-pointer group transform hover:-translate-y-0.5 active:scale-95 col-span-2 md:col-span-1"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/20 text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                <Link2 className="w-7 h-7 stroke-[2.2]" />
              </div>
              <span className="text-sm sm:text-base font-black text-white tracking-tight">
                Tambah dari Materi
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
          CREATION WIZARD MODAL (STEP 1: JUDUL, MAPEL, JENJANG, BENTUK ->
          STEP 2: INPUT SOAL -> STEP 3: AI UBAH KONTEKS & REVIEW EDITABLE -> STEP 4)
          ===================================================================== */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-gradient-to-b from-[#3E3547] via-[#332A3B] to-[#251E2B] rounded-[32px] sm:rounded-[36px] border border-[#5A4F65] shadow-2xl p-6 sm:p-8 relative my-auto max-h-[90vh] overflow-y-auto text-white">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/15">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFD36D] bg-white/10 px-2.5 py-0.5 rounded-full">
                  Langkah {wizardStep} dari 3
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white mt-1.5 tracking-tight">
                  {wizardStep === 1
                    ? "Identitas & Bentuk Soal"
                    : wizardStep === 2
                    ? "Input Naskah Soal"
                    : wizardStep === 3
                    ? "Review Hasil Konteks AI"
                    : "Butir Soal Berhasil Dibuat!"}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsWizardOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* STEP 1: IDENTITAS */}
            {wizardStep === 1 && (
              <form onSubmit={handleNextToContent} className="space-y-4 pt-4">
                <div>
                  <label className="block text-xs font-bold text-gray-200 mb-1.5">
                    Judul / Topik Soal
                  </label>
                  <input
                    type="text"
                    required
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Contoh: Perhitungan Belanja di Pasar Tradisional"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-white/20 bg-[#251E2B]/80 focus:border-[#FFD36D] text-xs sm:text-sm font-bold text-white placeholder:text-gray-400 focus:outline-none transition-all shadow-inner"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-200 mb-1.5">
                      Mata Pelajaran
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3.5 py-3 rounded-2xl border-2 border-white/20 bg-[#251E2B] focus:border-[#FFD36D] text-xs font-bold text-white focus:outline-none"
                    >
                      <option value="Matematika">Matematika</option>
                      <option value="IPAS (Ilmu Pengetahuan Alam & Sosial)">IPAS</option>
                      <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                      <option value="Pendidikan Pancasila">Pendidikan Pancasila</option>
                      <option value="Seni Budaya & Prakarya">Seni Budaya & Prakarya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-200 mb-1.5">
                      Jenjang Kelas
                    </label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(Number(e.target.value))}
                      className="w-full px-3.5 py-3 rounded-2xl border-2 border-white/20 bg-[#251E2B] focus:border-[#FFD36D] text-xs font-bold text-white focus:outline-none"
                    >
                      {[1, 2, 3, 4, 5, 6].map((g) => (
                        <option key={g} value={g}>
                          Kelas {g} SD
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Pilih Bentuk Soal: Pilihan Ganda / Esai */}
                <div>
                  <label className="block text-xs font-bold text-gray-200 mb-1.5">
                    Tipe Soal
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setQuestionType("multiple_choice")}
                      className={`py-3 px-4 rounded-2xl border-2 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        questionType === "multiple_choice"
                          ? "border-[#FFD36D] bg-[#FFD36D] text-[#251E2B] shadow-xs"
                          : "border-white/20 bg-white/10 text-white hover:bg-white/15"
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
                          ? "border-[#FFD36D] bg-[#FFD36D] text-[#251E2B] shadow-xs"
                          : "border-white/20 bg-white/10 text-white hover:bg-white/15"
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      <span>Soal Esai</span>
                    </button>
                  </div>
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    type="submit"
                    className="py-3 px-6 rounded-2xl bg-gradient-to-r from-[#FFD36D] to-[#FDB040] hover:from-[#FFE085] hover:to-[#FFBD59] text-[#251E2B] font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-98"
                  >
                    <span>Lanjut ke Input Naskah</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: INPUT NASKAH */}
            {wizardStep === 2 && (
              <div className="space-y-4 pt-4">
                {(selectedMethod === "manual" || selectedMethod === "from_material") && (
                  <div>
                    <label className="block text-xs font-bold text-gray-200 mb-1.5">
                      Tulis Naskah Soal / Konsep:
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={manualQuestionDraft}
                      onChange={(e) => setManualQuestionDraft(e.target.value)}
                      placeholder="Tulis naskah soal standar yang ingin dikontekstualisasikan..."
                      className="w-full p-4 rounded-2xl border-2 border-white/20 bg-[#251E2B]/80 focus:border-[#FFD36D] focus:bg-[#1E1724] text-xs sm:text-sm text-white placeholder:text-gray-400 focus:outline-none transition-all shadow-inner leading-relaxed"
                    />
                  </div>
                )}

                {selectedMethod === "camera" && (
                  <div className="p-6 border-2 border-dashed border-white/25 rounded-2xl text-center space-y-3 bg-[#251E2B]/50">
                    <Camera className="w-8 h-8 text-[#FFD36D] mx-auto" />
                    <p className="text-xs font-bold text-gray-200">Foto lembar naskah soal fisik</p>
                    <button
                      type="button"
                      onClick={() => setCapturedPhotoName("foto_lembar_soal.jpg")}
                      className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      {capturedPhotoName ? "Foto Terpindai: foto_lembar_soal.jpg" : "Ambil Foto Sekarang"}
                    </button>
                  </div>
                )}

                {selectedMethod === "pdf" && (
                  <div className="p-6 border-2 border-dashed border-white/25 rounded-2xl text-center space-y-3 bg-[#251E2B]/50">
                    <Upload className="w-8 h-8 text-[#FFD36D] mx-auto" />
                    <p className="text-xs font-bold text-gray-200">Unggah naskah soal berformat PDF</p>
                    <button
                      type="button"
                      onClick={() => setUploadedFileName("naskah_soal_ujian.pdf")}
                      className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      {uploadedFileName ? "Berkas Terunggah: naskah_soal_ujian.pdf" : "Pilih Berkas PDF"}
                    </button>
                  </div>
                )}

                {selectedMethod === "ai" && (
                  <div className="p-4 rounded-2xl bg-white/10 border border-white/20 text-xs text-gray-200 space-y-1">
                    <span className="font-bold text-[#FFD36D] block">Konteks Wilayah: {region}</span>
                    <p className="text-gray-300">
                      Sistem AI akan otomatis merumuskan butir asesmen {questionType === "multiple_choice" ? "pilihan ganda" : "esai"} dengan kearifan lokal daerah {region}.
                    </p>
                  </div>
                )}

                <div className="pt-3 flex items-center justify-between border-t border-white/15">
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    className="py-2.5 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
                  >
                    Kembali
                  </button>

                  <button
                    type="button"
                    disabled={isAiGenerating}
                    onClick={handleTriggerAiContextTransformation}
                    className="py-3 px-6 rounded-2xl bg-gradient-to-r from-[#FFD36D] to-[#FDB040] hover:from-[#FFE085] hover:to-[#FFBD59] text-[#251E2B] font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isAiGenerating ? "Memproses..." : "Sesuaikan dengan AI"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: REVIEW */}
            {wizardStep === 3 && (
              <div className="space-y-4 pt-4">
                <div className="p-3 rounded-2xl bg-emerald-950/70 border border-emerald-700/60 text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Konteks soal berhasil disesuaikan! Periksa draf di bawah sebelum disimpan:</span>
                </div>

                {/* Question Prompt */}
                <div>
                  <label className="block text-xs font-bold text-gray-200 mb-1.5">
                    Teks Pertanyaan Kontekstual
                  </label>
                  <textarea
                    rows={4}
                    value={previewPrompt}
                    onChange={(e) => setPreviewPrompt(e.target.value)}
                    className="w-full p-4 rounded-2xl border-2 border-white/20 bg-[#251E2B]/80 focus:border-[#FFD36D] text-xs text-white focus:outline-none leading-relaxed"
                  />
                </div>

                {/* Multiple Choice Options or Essay Rubric */}
                {questionType === "multiple_choice" ? (
                  <div className="space-y-2.5">
                    <label className="block text-xs font-bold text-gray-200">
                      Opsi Jawaban & Kunci:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-xl bg-white/10 text-[#FFD36D] text-xs font-black flex items-center justify-center shrink-0">
                          A
                        </span>
                        <input
                          type="text"
                          value={previewOptionA}
                          onChange={(e) => setPreviewOptionA(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl border border-white/20 bg-[#251E2B] text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-xl bg-white/10 text-[#FFD36D] text-xs font-black flex items-center justify-center shrink-0">
                          B
                        </span>
                        <input
                          type="text"
                          value={previewOptionB}
                          onChange={(e) => setPreviewOptionB(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl border border-white/20 bg-[#251E2B] text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-xl bg-white/10 text-[#FFD36D] text-xs font-black flex items-center justify-center shrink-0">
                          C
                        </span>
                        <input
                          type="text"
                          value={previewOptionC}
                          onChange={(e) => setPreviewOptionC(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl border border-white/20 bg-[#251E2B] text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-xl bg-white/10 text-[#FFD36D] text-xs font-black flex items-center justify-center shrink-0">
                          D
                        </span>
                        <input
                          type="text"
                          value={previewOptionD}
                          onChange={(e) => setPreviewOptionD(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl border border-white/20 bg-[#251E2B] text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-200">Kunci Benar:</span>
                      <select
                        value={previewCorrect}
                        onChange={(e) => setPreviewCorrect(e.target.value)}
                        className="px-3 py-1.5 rounded-xl border border-white/20 bg-[#251E2B] text-xs font-black text-[#FFD36D] focus:outline-none"
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
                    <label className="block text-xs font-bold text-gray-200 mb-1.5">
                      Rubrik Pedoman Penilaian
                    </label>
                    <textarea
                      rows={3}
                      value={previewRubric}
                      onChange={(e) => setPreviewRubric(e.target.value)}
                      className="w-full p-4 rounded-2xl border-2 border-white/20 bg-[#251E2B]/80 text-xs text-white focus:outline-none leading-relaxed"
                    />
                  </div>
                )}

                {/* Explanation */}
                <div>
                  <label className="block text-xs font-bold text-gray-200 mb-1.5">
                    Pembahasan Soal
                  </label>
                  <textarea
                    rows={2}
                    value={previewExplanation}
                    onChange={(e) => setPreviewExplanation(e.target.value)}
                    className="w-full p-4 rounded-2xl border-2 border-white/20 bg-[#251E2B]/80 text-xs text-white focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="pt-3 flex items-center justify-between border-t border-white/15">
                  <button
                    type="button"
                    onClick={() => setWizardStep(2)}
                    className="py-2.5 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
                  >
                    Ubah Draf
                  </button>

                  <button
                    type="button"
                    onClick={handleFinalSave}
                    className="py-3 px-6 rounded-2xl bg-gradient-to-r from-[#FFD36D] to-[#FDB040] hover:from-[#FFE085] hover:to-[#FFBD59] text-[#251E2B] font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                  >
                    Simpan Soal
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: SUKSES */}
            {wizardStep === 4 && (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg sm:text-xl font-black text-white">
                  Butir Soal Berhasil Disimpan!
                </h4>
                <p className="text-xs text-gray-300 max-w-sm mx-auto">
                  Butir soal telah tersimpan di katalog dan siap dibagikan melalui room akses.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsWizardOpen(false)}
                    className="py-3 px-7 rounded-2xl bg-gradient-to-r from-[#FFD36D] to-[#FDB040] text-[#251E2B] text-xs sm:text-sm font-extrabold shadow-md cursor-pointer"
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
    </TeacherWorkspaceShell>
  );
}
