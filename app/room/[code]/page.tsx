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
import { LearningRoom, LearningMaterial, Question, getQuestionItems } from "@/lib/db/types";

export default function RoomViewerPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = typeof params.code === "string" ? params.code.toLowerCase().replace(/[^a-z0-9]/g, "") : "";

  const [room, setRoom] = useState<LearningRoom | null>(null);
  const [material, setMaterial] = useState<LearningMaterial | null>(null);
  const [mcQuestion, setMcQuestion] = useState<Question | null>(null);
  const [essayQuestion, setEssayQuestion] = useState<Question | null>(null);
  const [isLoadingRoom, setIsLoadingRoom] = useState<boolean>(true);

  // Student name state (no login, just name)
  const [studentName, setStudentName] = useState<string>("");
  const [isNamePromptOpen, setIsNamePromptOpen] = useState(false);
  const [inputName, setInputName] = useState("");

  // Tab State: "material" | "multiple_choice" | "essay"
  const [activeTab, setActiveTab] = useState<"material" | "multiple_choice" | "essay">("material");

  // Multiple Choice Interactive State: support multiple MC sub-questions in a single package
  const [selectedMcAnswers, setSelectedMcAnswers] = useState<Record<string, string>>({});
  const [isMcSubmitted, setIsMcSubmitted] = useState(false);

  // Essay Interactive State: support multiple essay sub-questions in a single package
  const [essayAnswers, setEssayAnswers] = useState<Record<string, string>>({});
  const [isEssaySubmitted, setIsEssaySubmitted] = useState(false);

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
          const m = allMats.find((item) => item.id === localRoom.resource_id) || allMats[0] || null;
          setMaterial(m);
        }

        if (localRoom.type === "question" || localRoom.type === "both") {
          const qId = localRoom.type === "both" ? localRoom.secondary_resource_id : localRoom.resource_id;
          const qPrimary = allQs.find((item) => item.id === qId);
          if (qPrimary) {
            const qItems = getQuestionItems(qPrimary);
            const hasMc = qItems.some((it) => it.type === "multiple_choice");
            const hasEs = qItems.some((it) => it.type === "essay");
            if (hasMc) setMcQuestion(qPrimary);
            if (hasEs) setEssayQuestion(qPrimary);
            if (!hasMc && !hasEs) {
              if (qPrimary.type === "essay") setEssayQuestion(qPrimary);
              else setMcQuestion(qPrimary);
            }
          }
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
            const qItems = getQuestionItems(json.question);
            const hasMc = qItems.some((it) => it.type === "multiple_choice");
            const hasEs = qItems.some((it) => it.type === "essay");

            if (hasMc) setMcQuestion(json.question);
            if (hasEs) setEssayQuestion(json.question);
            if (!hasMc && !hasEs) {
              if (json.question.type === "essay") setEssayQuestion(json.question);
              else setMcQuestion(json.question);
            }

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
            setActiveTab(json.question?.type === "essay" ? "essay" : "multiple_choice");
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
    action: "visit" | "submit_mc" | "submit_essay" | "submit_material";
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

  const handleMcSubmit = () => {
    if (mcItems.length === 0) return;
    const answeredCount = mcItems.filter((it) => !!selectedMcAnswers[it.id]).length;
    if (answeredCount === 0) return;

    setIsMcSubmitted(true);

    const correctCount = mcItems.filter((it) => selectedMcAnswers[it.id] === it.correct_answer).length;
    const score = Math.round((correctCount / mcItems.length) * 100);
    const isAllCorrect = correctCount === mcItems.length;

    if (studentName) {
      repository.recordRoomVisit(roomCode, studentName, score);
      postRoomSubmission({
        action: "submit_mc",
        mc_answer: JSON.stringify(selectedMcAnswers),
        is_mc_correct: isAllCorrect,
        mc_score: score,
      });
    }
  };

  const handleEssaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (essayItems.length === 0) return;
    const hasAnyAnswer = essayItems.some((it) => !!essayAnswers[it.id]?.trim());
    if (!hasAnyAnswer) return;

    setIsEssaySubmitted(true);

    if (studentName) {
      // Record visit without fake automatic score; status is awaiting teacher grading
      repository.recordRoomVisit(roomCode, studentName, undefined);
      postRoomSubmission({
        action: "submit_essay",
        essay_answer: JSON.stringify(essayAnswers),
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
    // Auto-advance to questions if available
    if (mcItems.length > 0) {
      setActiveTab("multiple_choice");
    } else if (essayItems.length > 0) {
      setActiveTab("essay");
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

  const mcItems = mcQuestion ? getQuestionItems(mcQuestion).filter((it) => it.type === "multiple_choice") : [];
  const essayItems = essayQuestion ? getQuestionItems(essayQuestion).filter((it) => it.type === "essay") : [];

  const hasMaterial = (room.type === "material" || room.type === "both") && !!material;
  const hasMultipleChoice = (room.type === "question" || room.type === "both") && mcItems.length > 0;
  const hasEssay = (room.type === "question" || room.type === "both") && essayItems.length > 0;

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
        {/* TAB NAVIGATION: HALAMAN BEDA-BEDA (MATERI, PILIHAN GANDA, ESAI)    */}
        {/* ================================================================== */}
        <div className="flex items-center gap-2 p-1.5 rounded-full bg-white border border-[#E9E5E8] shadow-xs overflow-x-auto">
          {hasMaterial && (
            <button
              type="button"
              onClick={() => setActiveTab("material")}
              className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-full text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "material"
                  ? "bg-[#51465B] text-white shadow-md"
                  : "text-[#756F7A] hover:text-[#23212A] hover:bg-[#FAF7F3]"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>1. Modul Materi</span>
              {isMaterialCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-[#FFD36D]" />}
            </button>
          )}

          {hasMultipleChoice && (
            <button
              type="button"
              onClick={() => setActiveTab("multiple_choice")}
              className={`flex-1 min-w-[130px] py-2.5 px-4 rounded-full text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "multiple_choice"
                  ? "bg-[#51465B] text-white shadow-md"
                  : "text-[#756F7A] hover:text-[#23212A] hover:bg-[#FAF7F3]"
              }`}
            >
              <Brain className="w-4 h-4" />
              <span>2. Pilihan Ganda</span>
              {isMcSubmitted && <CheckCircle2 className="w-3.5 h-3.5 text-[#FFD36D]" />}
            </button>
          )}

          {hasEssay && (
            <button
              type="button"
              onClick={() => setActiveTab("essay")}
              className={`flex-1 min-w-[110px] py-2.5 px-4 rounded-full text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "essay"
                  ? "bg-[#51465B] text-white shadow-md"
                  : "text-[#756F7A] hover:text-[#23212A] hover:bg-[#FAF7F3]"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>3. Soal Esai</span>
              {isEssaySubmitted && <CheckCircle2 className="w-3.5 h-3.5 text-[#FFD36D]" />}
            </button>
          )}
        </div>

        {/* ================================================================== */}
        {/* HALAMAN 1: KONTEN MATERI                                           */}
        {/* ================================================================== */}
        {activeTab === "material" && material && (
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
                    {hasMultipleChoice || hasEssay
                      ? "Selesai Membaca & Lanjut ke Latihan Soal"
                      : "Saya Sudah Selesai Membaca"}
                  </span>
                </button>
              )}

              {(hasMultipleChoice || hasEssay) && (
                <button
                  type="button"
                  onClick={() => setActiveTab(hasMultipleChoice ? "multiple_choice" : "essay")}
                  className="text-xs font-bold text-[#51465B] hover:underline"
                >
                  Langsung ke Soal &rarr;
                </button>
              )}
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* HALAMAN 2: PILIHAN GANDA (BENAR-BENAR BISA PILIH OPSI JAWABAN)     */}
        {/* ================================================================== */}
        {activeTab === "multiple_choice" && mcItems.length > 0 && (
          <div className="bg-white rounded-3xl border border-[#E9E5E8] p-6 sm:p-9 shadow-xs space-y-6 animate-in fade-in duration-200">
            {/* Header Question */}
            <div className="border-b border-[#E9E5E8] pb-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-[#51465B] block mb-1">
                  Topik: {mcQuestion?.topic || "Pilihan Ganda"}
                </span>
                <h2 className="text-sm font-bold text-slate-500">
                  {mcItems.length > 1
                    ? `Jawablah ${mcItems.length} butir soal pilihan ganda berikut`
                    : "Pilihlah salah satu jawaban yang paling tepat"}
                </h2>
              </div>

              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black">
                {mcItems.length > 1 ? `${mcItems.length} Butir Soal PG` : "Pilihan Ganda"}
              </span>
            </div>

            {/* List of Multiple Choice Items */}
            <div className="space-y-8">
              {mcItems.map((item, idx) => {
                const selectedOpt = selectedMcAnswers[item.id];
                const isItemCorrect = isMcSubmitted && selectedOpt === item.correct_answer;
                const isItemWrong = isMcSubmitted && !!selectedOpt && !isItemCorrect;

                return (
                  <div key={item.id} className="space-y-4 pt-2 first:pt-0 border-b border-[#E9E5E8]/60 pb-6 last:border-b-0 last:pb-0">
                    {/* Item Number & Question Text */}
                    <div className="p-4 rounded-2xl bg-[#FAF7F3] border border-[#E9E5E8]">
                      <div className="flex items-start gap-3">
                        {mcItems.length > 1 && (
                          <span className="w-7 h-7 rounded-full bg-[#51465B] text-[#FFD36D] text-xs font-black flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                        )}
                        <p className="text-base sm:text-lg font-bold text-[#23212A] leading-relaxed flex-1">
                          {item.question_text}
                        </p>
                      </div>
                    </div>

                    {/* Interactive Multiple Choice Options (A, B, C, D) */}
                    <div className="space-y-2.5 pt-1">
                      {item.options &&
                        item.options.map((opt) => {
                          const isSelected = selectedOpt === opt.key;
                          const isCorrect = isMcSubmitted && opt.key === item.correct_answer;
                          const isWrong = isMcSubmitted && isSelected && !isCorrect;

                          return (
                            <button
                              key={opt.key}
                              type="button"
                              disabled={isMcSubmitted}
                              onClick={() =>
                                setSelectedMcAnswers((prev) => ({
                                  ...prev,
                                  [item.id]: opt.key,
                                }))
                              }
                              className={`w-full p-3.5 sm:p-4 rounded-2xl border-2 flex items-center gap-3.5 text-left transition-all cursor-pointer ${
                                isCorrect
                                  ? "border-emerald-500 bg-emerald-50 text-emerald-950 font-bold"
                                  : isWrong
                                  ? "border-rose-500 bg-rose-50 text-rose-950 font-bold"
                                  : isSelected
                                  ? "border-[#51465B] bg-[#51465B]/5 font-bold shadow-xs"
                                  : "border-[#E9E5E8] hover:border-[#51465B]/40 bg-white"
                              }`}
                            >
                              <span
                                className={`w-9 h-9 rounded-full font-black text-xs flex items-center justify-center shrink-0 transition-colors ${
                                  isCorrect
                                    ? "bg-emerald-600 text-white"
                                    : isWrong
                                    ? "bg-rose-600 text-white"
                                    : isSelected
                                    ? "bg-[#51465B] text-[#FFD36D]"
                                    : "bg-slate-100 text-slate-700"
                                }`}
                              >
                                {opt.key}
                              </span>
                              <span className="text-sm sm:text-base flex-1">{opt.text}</span>
                            </button>
                          );
                        })}
                    </div>

                    {/* Item Feedback if submitted */}
                    {isMcSubmitted && (
                      <div
                        className={`p-4 rounded-2xl border text-xs sm:text-sm space-y-1.5 ${
                          isItemCorrect
                            ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                            : "bg-rose-50 border-rose-200 text-rose-950"
                        }`}
                      >
                        <div className="flex items-center gap-2 font-black text-sm">
                          {isItemCorrect ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Jawaban No. {idx + 1} Tepat!</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-4 h-4 text-rose-600" />
                              <span>Jawaban No. {idx + 1} Belum Tepat. Kunci Jawaban: {item.correct_answer}</span>
                            </>
                          )}
                        </div>
                        {item.explanation && (
                          <p className="leading-relaxed text-slate-800">
                            <strong>Pembahasan:</strong> {item.explanation}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Action Submit */}
            {!isMcSubmitted ? (
              <div className="pt-4 flex items-center justify-between border-t border-[#E9E5E8]">
                <span className="text-xs font-semibold text-slate-500">
                  {Object.keys(selectedMcAnswers).length} dari {mcItems.length} soal terjawab
                </span>
                <button
                  type="button"
                  disabled={mcItems.some((it) => !selectedMcAnswers[it.id])}
                  onClick={handleMcSubmit}
                  className="px-7 py-3 rounded-full bg-[#51465B] hover:bg-[#3D3445] text-white text-xs sm:text-sm font-black shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-40"
                >
                  Kumpulkan Jawaban
                </button>
              </div>
            ) : (
              /* Summary and Next Navigation */
              <div className="pt-4 space-y-4 border-t border-[#E9E5E8]">
                <div className="p-5 rounded-2xl bg-[#51465B]/5 border border-[#51465B]/20 text-[#23212A] flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs text-slate-600 font-bold block">Skor Pilihan Ganda:</span>
                    <span className="text-2xl font-black text-[#51465B]">
                      {Math.round(
                        (mcItems.filter((it) => selectedMcAnswers[it.id] === it.correct_answer).length /
                          mcItems.length) *
                          100
                      )}
                      <span className="text-sm font-bold text-slate-500"> / 100</span>
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-600">
                    {mcItems.filter((it) => selectedMcAnswers[it.id] === it.correct_answer).length} dari {mcItems.length} benar
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMcSubmitted(false);
                      setSelectedMcAnswers({});
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#E9E5E8] text-xs font-bold text-[#51465B] hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Coba Jawab Lagi</span>
                  </button>

                  {hasEssay && (
                    <button
                      type="button"
                      onClick={() => setActiveTab("essay")}
                      className="px-5 py-2.5 rounded-full bg-[#51465B] text-white text-xs font-bold shadow-xs hover:bg-[#3D3445]"
                    >
                      Lanjut ke Soal Esai &rarr;
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================== */}
        {/* HALAMAN 3: SOAL ESAI (SISWA MENGETIKKAN JAWABAN ESAI)              */}
        {/* ================================================================== */}
        {activeTab === "essay" && essayItems.length > 0 && (
          <div className="bg-white rounded-3xl border border-[#E9E5E8] p-6 sm:p-9 shadow-xs space-y-6 animate-in fade-in duration-200">
            {/* Header Question */}
            <div className="border-b border-[#E9E5E8] pb-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-[#51465B] block mb-1">
                  Topik: {essayQuestion?.topic || "Soal Esai"}
                </span>
                <h2 className="text-sm font-bold text-slate-500">
                  {essayItems.length > 1
                    ? `Jawablah ${essayItems.length} butir pertanyaan esai berikut dengan penalaranmu sendiri`
                    : "Jawablah pertanyaan esai berikut dengan penalaranmu sendiri"}
                </h2>
              </div>

              <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-black">
                {essayItems.length > 1 ? `${essayItems.length} Butir Soal Esai` : "Soal Esai"}
              </span>
            </div>

            {/* Essay Form */}
            <form onSubmit={handleEssaySubmit} className="space-y-6">
              <div className="space-y-6">
                {essayItems.map((item, idx) => (
                  <div key={item.id} className="space-y-3 pt-2 first:pt-0 border-b border-[#E9E5E8]/60 pb-6 last:border-b-0 last:pb-0">
                    <div className="p-4 rounded-2xl bg-[#FAF7F3] border border-[#E9E5E8]">
                      <div className="flex items-start gap-3">
                        {essayItems.length > 1 && (
                          <span className="w-7 h-7 rounded-full bg-[#51465B] text-[#FFD36D] text-xs font-black flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                        )}
                        <p className="text-base sm:text-lg font-bold text-[#23212A] leading-relaxed flex-1">
                          {item.question_text}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1.5">
                        Tuliskan Jawaban &amp; Alasanmu {essayItems.length > 1 ? `(Soal #${idx + 1})` : ""}:
                      </label>
                      <textarea
                        rows={4}
                        required
                        disabled={isEssaySubmitted}
                        placeholder="Ketik jawaban lengkap dan uraian penjelasanmu di sini..."
                        value={essayAnswers[item.id] || ""}
                        onChange={(e) =>
                          setEssayAnswers((prev) => ({
                            ...prev,
                            [item.id]: e.target.value,
                          }))
                        }
                        className="w-full p-4 rounded-2xl border-2 border-[#E9E5E8] focus:border-[#51465B] text-sm leading-relaxed text-[#23212A] placeholder:text-slate-400 focus:outline-none focus:ring-0 disabled:bg-slate-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {!isEssaySubmitted ? (
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={essayItems.some((it) => !essayAnswers[it.id]?.trim())}
                    className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#51465B] hover:bg-[#3D3445] text-white text-xs sm:text-sm font-black shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-40"
                  >
                    <Send className="w-4 h-4 text-[#FFD36D]" />
                    <span>Kirim Jawaban Esai</span>
                  </button>
                </div>
              ) : (
                /* Feedback and Rubric */
                <div className="pt-2 space-y-4 animate-in fade-in slide-in-from-bottom-2">
                  <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs sm:text-sm space-y-2">
                    <div className="flex items-center gap-2 font-black text-sm sm:text-base">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>Jawaban Esai Berhasil Terkirim ke Pengajar!</span>
                    </div>
                    <p className="leading-relaxed text-slate-800">
                      <strong>Status:</strong> Menunggu Penilaian Guru. Guru akan membaca uraian jawabanmu dan memberikan skor serta catatan pembelajaran.
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEssaySubmitted(false)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#E9E5E8] text-xs font-bold text-[#51465B] hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Ubah Jawaban</span>
                    </button>

                    <Link
                      href="/room"
                      className="px-5 py-2.5 rounded-full bg-[#51465B] text-white text-xs font-bold shadow-xs hover:bg-[#3D3445]"
                    >
                      Selesai &amp; Buka Room Lain &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </form>
          </div>
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
