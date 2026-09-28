"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Brain,
  CheckCircle2,
  MapPin,
  ArrowLeft,
  Sparkles,
  Share2,
  Check,
  User,
  AlertCircle,
  HelpCircle,
  Award,
  FileText,
  Send,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { PahamiPuzzleLogo } from "@/components/landing/puzzle-logo";
import { repository } from "@/lib/db/repository";
import { LearningRoom, LearningMaterial, Question, getQuestionItems, resolveRoomQuestions, isIdOrCodeMatch } from "@/lib/db/types";

export default function RoomViewerPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = typeof params.code === "string" ? params.code.toLowerCase().replace(/[^a-z0-9]/g, "") : "";

  const [room, setRoom] = useState<LearningRoom | null>(null);
  const [material, setMaterial] = useState<LearningMaterial | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [isLoadingRoom, setIsLoadingRoom] = useState<boolean>(true);

  // Student name state (no login required, just student name)
  const [studentName, setStudentName] = useState<string>("");
  const [isNamePromptOpen, setIsNamePromptOpen] = useState(false);
  const [inputName, setInputName] = useState("");

  // Tab State: "material" | "questions"
  const [activeTab, setActiveTab] = useState<"material" | "questions">("material");

  // Interactive Answers:
  // Multiple Choice answers: itemId -> selectedKey (e.g. "A", "B", ...)
  const [selectedMcAnswers, setSelectedMcAnswers] = useState<Record<string, string>>({});
  // Essay answers: itemId -> student text
  const [essayAnswers, setEssayAnswers] = useState<Record<string, string>>({});
  
  // Unified submission state
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Material Finished State
  const [isMaterialCompleted, setIsMaterialCompleted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!roomCode) {
      setIsLoadingRoom(false);
      return;
    }

    let isMounted = true;

    async function resolveRoomData() {
      setIsLoadingRoom(true);

      // 1. Fast local resolution
      const localRoom = repository.getRoomByCode(roomCode);
      if (localRoom) {
        setRoom(localRoom);
        const allMats = repository.getMaterials();
        const allQs = repository.getQuestions();

        if (localRoom.type === "material" || localRoom.type === "both") {
          const m = localRoom.material_snapshot || repository.getMaterialById(localRoom.resource_id, true) || null;
          setMaterial(m);
        }

        if (localRoom.type === "question" || localRoom.type === "both") {
          const qId = localRoom.type === "both" ? localRoom.secondary_resource_id : localRoom.resource_id;
          const { combinedQuestion } = resolveRoomQuestions(qId, repository.getQuestions({ includeArchived: true }));
          setQuestion(localRoom.question_snapshot || combinedQuestion || null);
        }
      }

      // 2. Authoritative Cloud Fetch (Supabase via API) for anonymous students on mobile/other devices
      try {
        const res = await fetch(`/api/room/${encodeURIComponent(roomCode)}`);
        const json = await res.json();

        if (isMounted && json.success && json.room) {
          const cloudRoom: LearningRoom = json.room;
          setRoom(cloudRoom);

          if (json.material) {
            setMaterial(json.material);
            try {
              repository.saveMaterial(json.material);
            } catch {
              // ignore
            }
          }

          if (json.question) {
            setQuestion(json.question);
            try {
              repository.saveQuestion(json.question);
            } catch {
              // ignore
            }
          }

          try {
            repository.createRoom(cloudRoom);
          } catch {
            // ignore
          }

          // Check existing stored name
          let storedName = "";
          try {
            storedName =
              localStorage.getItem(`depaskan_reader_name_${roomCode}`) ||
              localStorage.getItem("depaskan_last_reader_name") ||
              "";
          } catch {
            // ignore
          }

          if (storedName) {
            setStudentName(storedName);
            repository.recordRoomVisit(roomCode, storedName);
          } else {
            setIsNamePromptOpen(true);
          }

          // Initial Tab setup
          if (cloudRoom.type === "material") {
            setActiveTab("material");
          } else if (cloudRoom.type === "question") {
            setActiveTab("questions");
          } else {
            setActiveTab("material");
          }
        } else if (!localRoom && isMounted) {
          setRoom(null);
        }
      } catch (err) {
        console.warn("Could not fetch room from API:", err);
        if (!localRoom && isMounted) {
          setRoom(null);
        }
      } finally {
        if (isMounted) setIsLoadingRoom(false);
      }
    }

    resolveRoomData();

    return () => {
      isMounted = false;
    };
  }, [roomCode]);

  const postRoomSubmission = async (payload: {
    action: "visit" | "submit_mc" | "submit_essay" | "submit_material" | "submit_all";
    mc_answer?: string;
    is_mc_correct?: boolean;
    mc_score?: number;
    essay_answer?: string;
  }) => {
    try {
      await fetch("/api/room/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room_code: roomCode,
          student_name: studentName,
          source: "Online",
          ...payload,
        }),
      });
    } catch (e) {
      console.warn("Failed to sync room submission to backend:", e);
    }
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim()) return;

    const cleanName = inputName.trim();
    setStudentName(cleanName);
    setIsNamePromptOpen(false);

    try {
      localStorage.setItem(`depaskan_reader_name_${roomCode}`, cleanName);
      localStorage.setItem("depaskan_last_reader_name", cleanName);
    } catch {
      // Ignore
    }

    repository.recordRoomVisit(roomCode, cleanName);
    postRoomSubmission({ action: "visit" });
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const questionItems = question ? getQuestionItems(question) : [];
  const mcItems = questionItems.filter((it) => it.type === "multiple_choice");
  const essayItems = questionItems.filter((it) => it.type === "essay");

  const hasMaterial = (room?.type === "material" || room?.type === "both") && !!material;
  const hasQuestions = (room?.type === "question" || room?.type === "both") && questionItems.length > 0;

  // Single unified submission for all questions on one page
  const handleSubmitAll = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (questionItems.length === 0) return;

    // Check if at least some answers were provided
    const mcAnsweredCount = mcItems.filter((it) => !!selectedMcAnswers[it.id]).length;
    const essayAnsweredCount = essayItems.filter((it) => !!essayAnswers[it.id]?.trim()).length;

    if (mcAnsweredCount === 0 && essayAnsweredCount === 0) {
      return;
    }

    setIsSubmitted(true);

    const correctMcCount = mcItems.filter((it) => selectedMcAnswers[it.id] === it.correct_answer).length;
    const mcScore = mcItems.length > 0 ? Math.round((correctMcCount / mcItems.length) * 100) : undefined;
    const isAllMcCorrect = mcItems.length > 0 ? correctMcCount === mcItems.length : undefined;

    if (studentName) {
      // If there are essays, teacher must grade them so overall score is awaiting review
      repository.recordRoomVisit(roomCode, studentName, essayItems.length > 0 ? undefined : mcScore);
      postRoomSubmission({
        action: "submit_all",
        mc_answer: mcItems.length > 0 ? JSON.stringify(selectedMcAnswers) : undefined,
        is_mc_correct: isAllMcCorrect,
        mc_score: mcScore,
        essay_answer: essayItems.length > 0 ? JSON.stringify(essayAnswers) : undefined,
      });
    }
  };

  const handleFinishReading = () => {
    setIsMaterialCompleted(true);
    if (studentName) {
      repository.recordRoomVisit(roomCode, studentName, 100);
      postRoomSubmission({
        action: "submit_material",
      });
    }
    // Auto-advance to questions tab if available
    if (hasQuestions) {
      setActiveTab("questions");
    }
  };

  // Loading Room State
  if (isLoadingRoom) {
    return (
      <div className="min-h-screen bg-[#FAF7F3] flex flex-col justify-center items-center p-4 font-sans text-center">
        <div className="max-w-md mx-auto bg-white rounded-3xl border border-[#E9E5E8] p-8 shadow-xl space-y-4">
          <Loader2 className="w-10 h-10 text-[#51465B] animate-spin mx-auto" />
          <h2 className="text-lg font-black text-[#23212A]">Memuat Ruang Belajar...</h2>
          <p className="text-xs text-[#756F7A]">
            Menghubungkan ke ruang <strong>&quot;{roomCode}&quot;</strong>...
          </p>
        </div>
      </div>
    );
  }

  // 404 Room Not Found State
  if (!room) {
    return (
      <div className="min-h-screen bg-[#FAF7F3] flex flex-col justify-between p-4 font-sans text-center">
        <header className="py-6">
          <PahamiPuzzleLogo size="md" />
        </header>
        <div className="max-w-md mx-auto bg-white rounded-3xl border border-[#E9E5E8] p-8 shadow-xl space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-black text-[#23212A]">Room Tidak Ditemukan</h2>
          <p className="text-xs text-[#756F7A] leading-relaxed">
            Kode room <strong>&quot;{roomCode}&quot;</strong> tidak terdaftar atau sudah dinonaktifkan oleh pengajar.
          </p>
          <Link
            href="/room"
            className="inline-block px-6 py-3 rounded-full bg-[#51465B] text-white text-xs font-bold shadow-md hover:bg-[#3D3445] transition-colors"
          >
            Masukkan Kode Lain
          </Link>
        </div>
        <footer className="py-4 text-xs text-[#756F7A]">Depaskan</footer>
      </div>
    );
  }

  // Total answers progress calculation
  const totalAnswered =
    mcItems.filter((it) => !!selectedMcAnswers[it.id]).length +
    essayItems.filter((it) => !!essayAnswers[it.id]?.trim()).length;

  return (
    <div className="min-h-screen bg-[#FAF7F3] text-[#23212A] flex flex-col justify-between selection:bg-[#FFD36D] selection:text-[#51465B] relative font-sans">
      {/* Top Floating Navbar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-[#E9E5E8] sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/room"
            className="w-9 h-9 rounded-full bg-[#FAF7F3] border border-[#E9E5E8] flex items-center justify-center text-[#756F7A] hover:text-[#23212A] hover:bg-white transition-all shadow-2xs"
            title="Keluar dari Room"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <PahamiPuzzleLogo size="sm" />
        </div>

        {/* Room Code Badge & Student Avatar */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF7F3] border border-[#E9E5E8] text-xs shadow-2xs">
            <span className="text-[#756F7A] text-[10px] font-bold uppercase tracking-wider">
              Kode Room:
            </span>
            <span className="font-mono font-black text-[#23212A] tracking-wider">
              {roomCode}
            </span>
          </div>

          {studentName && (
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#51465B] text-white text-xs font-bold shadow-xs">
              <User className="w-3.5 h-3.5 text-[#FFD36D]" />
              <span className="truncate max-w-[120px]">{studentName}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleCopyLink}
            className="p-2 rounded-full bg-white border border-[#E9E5E8] hover:bg-slate-50 text-[#51465B] transition-colors cursor-pointer shadow-2xs"
            title="Salin Tautan Room"
          >
            {copiedLink ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* ================================================================== */}
        {/* ROOM BANNER: JUDUL, MATA PELAJARAN, JENJANG, KELAS                  */}
        {/* ================================================================== */}
        <div className="bg-white rounded-3xl border border-[#E9E5E8] p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#51465B] text-white text-xs font-black uppercase tracking-wider">
              <span>{room.subject}</span>
            </span>

            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FAF7F3] border border-[#E9E5E8] text-xs font-bold text-[#756F7A]">
              <span>Jenjang: Sekolah Dasar (SD)</span>
            </span>

            <span className="px-3 py-1 rounded-full bg-[#FFD36D]/30 border border-[#FFD36D]/60 text-xs font-black text-[#51465B]">
              Kelas {room.grade} SD
            </span>

            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FAF7F3] border border-[#E9E5E8] text-xs font-bold text-[#756F7A]">
              <MapPin className="w-3.5 h-3.5 text-[#51465B]" />
              <span>{room.region_name}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#23212A] tracking-tight leading-tight">
            {room.title}
          </h1>

          <div className="text-xs text-[#756F7A] font-semibold flex items-center gap-2 pt-2 border-t border-[#E9E5E8]">
            <span>Pengajar: <strong>{room.teacher_name}</strong></span>
          </div>
        </div>

        {/* ================================================================== */}
        {/* TAB NAVIGATION: JIKA ADA MATERI DAN SOAL                           */}
        {/* ================================================================== */}
        {hasMaterial && hasQuestions && (
          <div className="flex items-center gap-2 p-1.5 rounded-full bg-white border border-[#E9E5E8] shadow-xs overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("material")}
              className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-full text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "material"
                  ? "bg-[#51465B] text-white shadow-md"
                  : "text-[#756F7A] hover:text-[#23212A] hover:bg-[#FAF7F3]"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>1. Modul Materi</span>
              {isMaterialCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-[#FFD36D]" />}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("questions")}
              className={`flex-1 min-w-[150px] py-2.5 px-4 rounded-full text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "questions"
                  ? "bg-[#51465B] text-white shadow-md"
                  : "text-[#756F7A] hover:text-[#23212A] hover:bg-[#FAF7F3]"
              }`}
            >
              <Brain className="w-4 h-4" />
              <span>2. Latihan Soal ({questionItems.length} Butir)</span>
              {isSubmitted && <CheckCircle2 className="w-3.5 h-3.5 text-[#FFD36D]" />}
            </button>
          </div>
        )}

        {/* ================================================================== */}
        {/* BAGIAN 1: KONTEN MATERI (BILA TAB MATERI AKTIF)                    */}
        {/* ================================================================== */}
        {((activeTab === "material" && hasMaterial) || (!hasQuestions && hasMaterial)) && material && (
          <div className="bg-white rounded-3xl border border-[#E9E5E8] p-6 sm:p-9 shadow-xs space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-[#E9E5E8] pb-4">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#51465B] block mb-1">
                Bahan Bacaan Kontekstual
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#23212A]">
                {material.title}
              </h2>
            </div>

            {/* Reading Content */}
            <div className="text-sm sm:text-base space-y-4 font-normal text-slate-800 leading-relaxed sm:leading-loose">
              {material.content.split("\n\n").map((para, idx) => (
                <p key={idx} className="text-justify sm:text-left">
                  {para}
                </p>
              ))}
            </div>

            {/* Context Notice */}
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-black">
                <Sparkles className="w-4 h-4 text-amber-700" />
                <span>Konteks Lingkungan Nyata Wilayah {room.region_name}</span>
              </div>
              <p className="text-amber-800 leading-relaxed">
                Materi ini dikembangkan khusus sesuai karakteristik kearifan lokal daerah {room.region_name} agar kamu dapat belajar lebih dekat dengan lingkungan sekitarmu.
              </p>
            </div>

            {/* Completion Button */}
            <div className="pt-6 border-t border-[#E9E5E8] flex flex-col sm:flex-row items-center justify-between gap-4">
              {isMaterialCompleted ? (
                <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-5 py-2.5 rounded-full border border-emerald-200 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Selesai dibaca! Kamu bisa lanjut mengerjakan latihan soal di tab atas.</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleFinishReading}
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#51465B] hover:bg-[#3D3445] text-white text-xs sm:text-sm font-black shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#FFD36D] stroke-[2.5]" />
                  <span>
                    {hasQuestions
                      ? "Selesai Membaca & Lanjut ke Latihan Soal"
                      : "Saya Sudah Selesai Membaca"}
                  </span>
                </button>
              )}

              {hasQuestions && (
                <button
                  type="button"
                  onClick={() => setActiveTab("questions")}
                  className="text-xs font-bold text-[#51465B] hover:underline"
                >
                  Langsung ke Soal ({questionItems.length} Butir) &rarr;
                </button>
              )}
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* BAGIAN 2: SATU HALAMAN SOAL (PILGAN & ESAI SESUAI URUTAN SOAL)      */}
        {/* ================================================================== */}
        {((activeTab === "questions" && hasQuestions) || (!hasMaterial && hasQuestions)) && (
          <form
            onSubmit={handleSubmitAll}
            className="bg-white rounded-3xl border border-[#E9E5E8] p-6 sm:p-9 shadow-xs space-y-8 animate-in fade-in duration-200"
          >
            {/* Header Soal Terpadu */}
            <div className="border-b border-[#E9E5E8] pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#51465B] block">
                  Topik: {question?.topic || "Latihan Mandiri"}
                </span>
                <h2 className="text-base sm:text-lg font-black text-[#23212A]">
                  Lembar Pengerjaan Soal Terpadu ({questionItems.length} Butir Soal)
                </h2>
                <p className="text-xs text-[#756F7A]">
                  Kerjakan seluruh butir soal pilihan ganda dan esai di bawah ini secara berurutan.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-[#51465B] text-[#FFD36D] text-xs font-black">
                  Total {questionItems.length} Butir
                </span>
                {mcItems.length > 0 && (
                  <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold">
                    {mcItems.length} PG
                  </span>
                )}
                {essayItems.length > 0 && (
                  <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-900 text-[11px] font-bold">
                    {essayItems.length} Esai
                  </span>
                )}
              </div>
            </div>

            {/* Stimulus Wacana Umum jika ada pengantar soal */}
            {question?.question_text &&
              questionItems.length > 1 &&
              question.question_text !== questionItems[0]?.question_text && (
                <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F3] border border-[#E9E5E8] text-xs sm:text-sm font-medium text-[#23212A] leading-relaxed">
                  <span className="text-[11px] font-black uppercase text-[#51465B] block mb-1">
                    Wacana / Stimulus Kontekstual:
                  </span>
                  {question.question_text}
                </div>
              )}

            {/* DAFTAR SELURUH BUTIR SOAL SECARA BERURUTAN DALAM SATU HALAMAN */}
            <div className="space-y-8">
              {questionItems.map((item, idx) => {
                const isMc = item.type === "multiple_choice";
                const isEs = item.type === "essay";

                // Multiple Choice states
                const selectedOpt = selectedMcAnswers[item.id];
                const isItemCorrect = isSubmitted && isMc && selectedOpt === item.correct_answer;
                const isItemWrong = isSubmitted && isMc && !!selectedOpt && !isItemCorrect;

                return (
                  <div
                    key={item.id || idx}
                    className="p-5 sm:p-6 rounded-2xl border-2 border-[#E9E5E8] bg-white shadow-2xs space-y-4 transition-all"
                  >
                    {/* Header Butir Soal: Nomor Urut & Tipe Soal */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-full bg-[#51465B] text-[#FFD36D] text-xs font-black flex items-center justify-center shrink-0 shadow-2xs">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-black text-[#23212A]">
                          Soal Nomor {idx + 1}
                        </span>
                      </div>

                      <span
                        className={`text-[11px] px-3 py-1 rounded-full font-black ${
                          isEs
                            ? "bg-purple-100 text-purple-900 border border-purple-200"
                            : "bg-amber-100 text-amber-900 border border-amber-200"
                        }`}
                      >
                        {isEs ? "Soal Uraian / Esai" : "Pilihan Ganda"}
                      </span>
                    </div>

                    {/* Pertanyaan Stem */}
                    <p className="text-sm sm:text-base font-bold text-[#23212A] leading-relaxed">
                      {item.question_text}
                    </p>

                    {/* ============================================================== */}
                    {/* JIKA SOAL PILIHAN GANDA: OPSI JAWABAN INTERAKTIF (A, B, C, D)  */}
                    {/* ============================================================== */}
                    {isMc && item.options && item.options.length > 0 && (
                      <div className="space-y-2.5 pt-1">
                        {item.options.map((opt, optIdx) => {
                          const optKey = opt.key || String.fromCharCode(65 + optIdx);
                          const isSelected = selectedOpt === optKey;
                          const isOptionCorrect = isSubmitted && optKey === item.correct_answer;
                          const isOptionWrong = isSubmitted && isSelected && !isOptionCorrect;

                          return (
                            <button
                              key={optKey}
                              type="button"
                              disabled={isSubmitted}
                              onClick={() =>
                                setSelectedMcAnswers((prev) => ({
                                  ...prev,
                                  [item.id]: optKey,
                                }))
                              }
                              className={`w-full p-3.5 sm:p-4 rounded-2xl border-2 flex items-center gap-3.5 text-left transition-all cursor-pointer ${
                                isOptionCorrect
                                  ? "border-emerald-500 bg-emerald-50 text-emerald-950 font-bold"
                                  : isOptionWrong
                                  ? "border-rose-500 bg-rose-50 text-rose-950 font-bold"
                                  : isSelected
                                  ? "border-[#51465B] bg-[#51465B]/5 font-bold shadow-xs"
                                  : "border-[#E9E5E8] hover:border-[#51465B]/40 bg-white"
                              } ${isSubmitted ? "cursor-default" : ""}`}
                            >
                              <span
                                className={`w-8 h-8 rounded-full font-black text-xs flex items-center justify-center shrink-0 transition-colors ${
                                  isOptionCorrect
                                    ? "bg-emerald-600 text-white"
                                    : isOptionWrong
                                    ? "bg-rose-600 text-white"
                                    : isSelected
                                    ? "bg-[#51465B] text-[#FFD36D]"
                                    : "bg-slate-100 text-slate-700"
                                }`}
                              >
                                {optKey}
                              </span>
                              <span className="text-xs sm:text-sm flex-1 leading-normal">
                                {opt.text}
                              </span>
                            </button>
                          );
                        })}

                        {/* Umpan Balik untuk Soal Pilihan Ganda Setelah Dikumpulkan */}
                        {isSubmitted && (
                          <div
                            className={`mt-3 p-4 rounded-2xl border text-xs sm:text-sm space-y-1.5 animate-in fade-in ${
                              isItemCorrect
                                ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                                : "bg-rose-50 border-rose-200 text-rose-950"
                            }`}
                          >
                            <div className="flex items-center gap-2 font-black text-xs sm:text-sm">
                              {isItemCorrect ? (
                                <>
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                  <span>Jawaban No. {idx + 1} Tepat!</span>
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                                  <span>
                                    Jawaban No. {idx + 1} Belum Tepat. Kunci Jawaban: {item.correct_answer}
                                  </span>
                                </>
                              )}
                            </div>
                            {item.explanation && (
                              <p className="leading-relaxed text-slate-800 text-xs">
                                <strong>Pembahasan:</strong> {item.explanation}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* ============================================================== */}
                    {/* JIKA SOAL ESAI: FORM MENGETIKKAN JAWABAN & ALASAN SISWA       */}
                    {/* ============================================================== */}
                    {isEs && (
                      <div className="space-y-3 pt-1">
                        <div>
                          <label className="text-xs font-bold text-slate-800 block mb-1.5">
                            Tuliskan Jawaban &amp; Penjelasan Uraianmu:
                          </label>
                          <textarea
                            rows={4}
                            disabled={isSubmitted}
                            placeholder="Ketik jawaban lengkap dan uraian penjelasanmu di sini..."
                            value={essayAnswers[item.id] || ""}
                            onChange={(e) =>
                              setEssayAnswers((prev) => ({
                                ...prev,
                                [item.id]: e.target.value,
                              }))
                            }
                            className="w-full p-4 rounded-2xl border-2 border-[#E9E5E8] focus:border-[#51465B] text-xs sm:text-sm leading-relaxed text-[#23212A] placeholder:text-slate-400 focus:outline-none focus:ring-0 disabled:bg-slate-50 disabled:text-slate-700 disabled:cursor-not-allowed"
                          />
                        </div>

                        {/* Umpan Balik untuk Soal Esai Setelah Dikumpulkan */}
                        {isSubmitted && (
                          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-950 text-xs space-y-1 animate-in fade-in">
                            <div className="flex items-center gap-2 font-black">
                              <CheckCircle2 className="w-4 h-4 text-purple-700 shrink-0" />
                              <span>Jawaban Esai No. {idx + 1} Berhasil Tersimpan!</span>
                            </div>
                            <p className="leading-relaxed text-slate-700 text-[11px]">
                              Status: <strong>Menunggu Penilaian Guru</strong>. Pengajar akan memeriksa uraian dan memberikan catatan pembelajaran.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ============================================================== */}
            {/* FOOTER AKSI: TOMBOL KUMPULKAN / HASIL REKAPITULASI             */}
            {/* ============================================================== */}
            {!isSubmitted ? (
              <div className="pt-6 border-t border-[#E9E5E8] flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs font-semibold text-slate-500">
                  {totalAnswered} dari {questionItems.length} butir soal telah diisi
                </span>

                <button
                  type="submit"
                  disabled={totalAnswered === 0}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#51465B] hover:bg-[#3D3445] text-white text-xs sm:text-sm font-black shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4 text-[#FFD36D]" />
                  <span>Kumpulkan Seluruh Jawaban</span>
                </button>
              </div>
            ) : (
              /* Rekapitulasi Nilai & Pembelajaran */
              <div className="pt-6 space-y-5 border-t border-[#E9E5E8] animate-in fade-in">
                <div className="p-6 rounded-3xl bg-[#51465B]/5 border-2 border-[#51465B]/20 text-[#23212A] space-y-4">
                  <div className="flex items-center gap-2 font-black text-sm sm:text-base text-[#51465B]">
                    <Award className="w-5 h-5 text-[#FFD36D]" />
                    <span>Latihan Soal Telah Berhasil Diselesaikan!</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    {/* Skor Pilihan Ganda */}
                    {mcItems.length > 0 && (
                      <div className="p-4 rounded-2xl bg-white border border-[#E9E5E8] space-y-1">
                        <span className="text-xs text-slate-500 font-bold block">
                          Skor Pilihan Ganda ({mcItems.length} Soal):
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-[#51465B]">
                            {Math.round(
                              (mcItems.filter((it) => selectedMcAnswers[it.id] === it.correct_answer).length /
                                mcItems.length) *
                                100
                            )}
                          </span>
                          <span className="text-xs text-slate-500 font-bold">/ 100</span>
                          <span className="text-xs font-semibold text-emerald-700 ml-auto">
                            {mcItems.filter((it) => selectedMcAnswers[it.id] === it.correct_answer).length} dari {mcItems.length} Benar
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Status Soal Esai */}
                    {essayItems.length > 0 && (
                      <div className="p-4 rounded-2xl bg-white border border-[#E9E5E8] space-y-1">
                        <span className="text-xs text-slate-500 font-bold block">
                          Status Soal Esai ({essayItems.length} Soal):
                        </span>
                        <span className="inline-block px-2.5 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-bold">
                          Menunggu Penilaian Guru
                        </span>
                        <p className="text-[11px] text-slate-600 pt-0.5">
                          Jawaban uraianmu tersimpan dan akan diperiksa langsung oleh pengajar.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSubmitted(false);
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full border border-[#E9E5E8] text-xs font-bold text-[#51465B] hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Coba Jawab Lagi / Ubah Jawaban</span>
                  </button>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {hasMaterial && (
                      <button
                        type="button"
                        onClick={() => setActiveTab("material")}
                        className="flex-1 sm:flex-initial px-5 py-2.5 rounded-full border border-[#E9E5E8] text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        Baca Ulang Materi
                      </button>
                    )}

                    <Link
                      href="/room"
                      className="flex-1 sm:flex-initial text-center px-6 py-2.5 rounded-full bg-[#51465B] text-white text-xs font-bold shadow-xs hover:bg-[#3D3445]"
                    >
                      Selesai &amp; Buka Room Lain &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </form>
        )}
      </main>

      {/* Name Input Prompt Modal if Name Not Set */}
      {isNamePromptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-gradient-to-b from-[#3E3547] via-[#332A3B] to-[#251E2B] rounded-[32px] sm:rounded-[36px] border border-[#5A4F65] shadow-2xl max-w-sm w-full p-8 text-center space-y-4 animate-in fade-in zoom-in-95 text-white">
            <div className="w-12 h-12 rounded-full bg-white/10 text-[#FFD36D] flex items-center justify-center mx-auto shadow-sm">
              <User className="w-6 h-6 stroke-[2.2]" />
            </div>

            <div>
              <h3 className="text-xl font-black text-white">
                Selamat Datang!
              </h3>
              <p className="text-xs text-gray-300 mt-1">
                Masukkan namamu untuk belajar di room <strong>{roomCode}</strong>.
              </p>
            </div>

            <form onSubmit={handleSaveName} className="space-y-3 pt-2">
              <input
                type="text"
                required
                autoFocus
                placeholder="Tulis nama lengkapmu..."
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                className="w-full px-4 py-3 rounded-full bg-white/10 border-2 border-white/20 text-sm font-bold text-white placeholder:text-gray-400 focus:outline-none focus:border-[#FFD36D] text-center"
              />

              <button
                type="submit"
                className="w-full py-3.5 px-5 rounded-full bg-[#FFD36D] hover:bg-[#F5C75A] text-[#251E2B] text-xs font-black shadow-md transition-all cursor-pointer"
              >
                Mulai Belajar Sekarang
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-[#756F7A] border-t border-[#E9E5E8] bg-white">
        Depaskan &bull; Pembelajaran Kontekstual Berbasis Kearifan Lokal
      </footer>
    </div>
  );
}
