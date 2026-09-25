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
} from "lucide-react";
import { PahamiPuzzleLogo } from "@/components/landing/puzzle-logo";
import { repository } from "@/lib/db/repository";
import { LearningRoom, LearningMaterial, Question } from "@/lib/db/types";

export default function RoomViewerPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = typeof params.code === "string" ? params.code.toLowerCase().replace(/[^a-z0-9]/g, "") : "";

  const [room, setRoom] = useState<LearningRoom | null>(null);
  const [material, setMaterial] = useState<LearningMaterial | null>(null);
  const [mcQuestion, setMcQuestion] = useState<Question | null>(null);
  const [essayQuestion, setEssayQuestion] = useState<Question | null>(null);

  // Student name state (no login, just name)
  const [studentName, setStudentName] = useState<string>("");
  const [isNamePromptOpen, setIsNamePromptOpen] = useState(false);
  const [inputName, setInputName] = useState("");

  // Tab State: "material" | "multiple_choice" | "essay"
  const [activeTab, setActiveTab] = useState<"material" | "multiple_choice" | "essay">("material");

  // Multiple Choice Interactive State
  const [selectedMcAnswer, setSelectedMcAnswer] = useState<string | null>(null);
  const [isMcSubmitted, setIsMcSubmitted] = useState(false);

  // Essay Interactive State
  const [essayAnswer, setEssayAnswer] = useState("");
  const [isEssaySubmitted, setIsEssaySubmitted] = useState(false);

  // Material Finished State
  const [isMaterialCompleted, setIsMaterialCompleted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!roomCode) return;

    const foundRoom = repository.getRoomByCode(roomCode);
    if (!foundRoom) {
      setRoom(null);
      return;
    }
    setRoom(foundRoom);

    // Check existing stored name
    let storedName = "";
    try {
      storedName =
        localStorage.getItem(`depaskan_reader_name_${roomCode}`) ||
        localStorage.getItem("depaskan_last_reader_name") ||
        "";
    } catch {
      // Ignore
    }

    if (storedName) {
      setStudentName(storedName);
      repository.recordRoomVisit(roomCode, storedName);
    } else {
      setIsNamePromptOpen(true);
    }

    // Load related resources
    const allMats = repository.getMaterials();
    const allQs = repository.getQuestions();

    let resolvedMat: LearningMaterial | null = null;
    let resolvedMc: Question | null = null;
    let resolvedEssay: Question | null = null;

    if (foundRoom.type === "material" || foundRoom.type === "both") {
      resolvedMat = allMats.find((m) => m.id === foundRoom.resource_id) || allMats[0] || null;
      setMaterial(resolvedMat);
    }

    if (foundRoom.type === "question" || foundRoom.type === "both") {
      const qPrimary = allQs.find(
        (item) => item.id === (foundRoom.type === "both" ? foundRoom.secondary_resource_id : foundRoom.resource_id)
      );

      if (qPrimary) {
        if (qPrimary.type === "essay") {
          resolvedEssay = qPrimary;
        } else {
          resolvedMc = qPrimary;
        }
      }

      // Check if there is an alternative question type for this subject/grade
      if (!resolvedMc) {
        resolvedMc = allQs.find((q) => q.type === "multiple_choice" && q.grade === foundRoom.grade) || allQs.find((q) => q.type === "multiple_choice") || null;
      }
      if (!resolvedEssay) {
        resolvedEssay = allQs.find((q) => q.type === "essay" && q.grade === foundRoom.grade) || allQs.find((q) => q.type === "essay") || null;
      }

      setMcQuestion(resolvedMc);
      setEssayQuestion(resolvedEssay);
    }

    // Set initial active tab
    if (foundRoom.type === "material") {
      setActiveTab("material");
    } else if (foundRoom.type === "question") {
      if (resolvedMc) setActiveTab("multiple_choice");
      else if (resolvedEssay) setActiveTab("essay");
    } else {
      // both: start with material
      setActiveTab("material");
    }
  }, [roomCode]);

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
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleMcSubmit = () => {
    if (!selectedMcAnswer) return;
    setIsMcSubmitted(true);

    const isCorrect = selectedMcAnswer === mcQuestion?.correct_answer;
    const score = isCorrect ? 100 : 0;
    if (studentName) {
      repository.recordRoomVisit(roomCode, studentName, score);
    }
  };

  const handleEssaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!essayAnswer.trim()) return;
    setIsEssaySubmitted(true);

    if (studentName) {
      repository.recordRoomVisit(roomCode, studentName, 95);
    }
  };

  const handleFinishReading = () => {
    setIsMaterialCompleted(true);
    if (studentName) {
      repository.recordRoomVisit(roomCode, studentName, 100);
    }
    // Auto-advance to questions if available
    if (mcQuestion) {
      setActiveTab("multiple_choice");
    } else if (essayQuestion) {
      setActiveTab("essay");
    }
  };

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

  const hasMaterial = (room.type === "material" || room.type === "both") && !!material;
  const hasMultipleChoice = (room.type === "question" || room.type === "both") && !!mcQuestion;
  const hasEssay = (room.type === "question" || room.type === "both") && !!essayQuestion;

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
        {activeTab === "multiple_choice" && mcQuestion && (
          <div className="bg-white rounded-3xl border border-[#E9E5E8] p-6 sm:p-9 shadow-xs space-y-6 animate-in fade-in duration-200">
            {/* Header Question */}
            <div className="border-b border-[#E9E5E8] pb-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-[#51465B] block mb-1">
                  Topik: {mcQuestion.topic}
                </span>
                <h2 className="text-sm font-bold text-slate-500">
                  Pilihlah salah satu jawaban yang paling tepat
                </h2>
              </div>

              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black">
                Pilihan Ganda
              </span>
            </div>

            {/* Question Text */}
            <div className="p-4 rounded-2xl bg-[#FAF7F3] border border-[#E9E5E8]">
              <p className="text-base sm:text-lg font-bold text-[#23212A] leading-relaxed">
                {mcQuestion.question_text}
              </p>
            </div>

            {/* Interactive Multiple Choice Options (A, B, C, D) */}
            <div className="space-y-3 pt-2">
              {mcQuestion.options && mcQuestion.options.map((opt) => {
                const isSelected = selectedMcAnswer === opt.key;
                const isCorrect = isMcSubmitted && opt.key === mcQuestion.correct_answer;
                const isWrong = isMcSubmitted && isSelected && !isCorrect;

                return (
                  <button
                    key={opt.key}
                    type="button"
                    disabled={isMcSubmitted}
                    onClick={() => setSelectedMcAnswer(opt.key)}
                    className={`w-full p-4 rounded-2xl border-2 flex items-center gap-3.5 text-left transition-all cursor-pointer ${
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

            {/* Action Submit */}
            {!isMcSubmitted ? (
              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  disabled={!selectedMcAnswer}
                  onClick={handleMcSubmit}
                  className="px-7 py-3 rounded-full bg-[#51465B] hover:bg-[#3D3445] text-white text-xs sm:text-sm font-black shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-40"
                >
                  Kumpulkan Jawaban
                </button>
              </div>
            ) : (
              /* Feedback and Explanation */
              <div className="pt-4 space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <div
                  className={`p-5 rounded-2xl border text-xs sm:text-sm space-y-2 ${
                    selectedMcAnswer === mcQuestion.correct_answer
                      ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                      : "bg-rose-50 border-rose-200 text-rose-950"
                  }`}
                >
                  <div className="flex items-center gap-2 font-black text-sm sm:text-base">
                    {selectedMcAnswer === mcQuestion.correct_answer ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span>Jawaban Kamu Tepat Sekali! (+100 Poin)</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 text-rose-600" />
                        <span>Jawaban Belum Tepat. Kunci Jawaban: {mcQuestion.correct_answer}</span>
                      </>
                    )}
                  </div>
                  <p className="leading-relaxed pt-1 text-slate-800">
                    <strong>Pembahasan:</strong> {mcQuestion.explanation}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMcSubmitted(false);
                      setSelectedMcAnswer(null);
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
        {activeTab === "essay" && essayQuestion && (
          <div className="bg-white rounded-3xl border border-[#E9E5E8] p-6 sm:p-9 shadow-xs space-y-6 animate-in fade-in duration-200">
            {/* Header Question */}
            <div className="border-b border-[#E9E5E8] pb-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-[#51465B] block mb-1">
                  Topik: {essayQuestion.topic}
                </span>
                <h2 className="text-sm font-bold text-slate-500">
                  Jawablah pertanyaan esai berikut dengan penalaranmu sendiri
                </h2>
              </div>

              <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-black">
                Soal Esai
              </span>
            </div>

            {/* Question Text */}
            <div className="p-4 rounded-2xl bg-[#FAF7F3] border border-[#E9E5E8]">
              <p className="text-base sm:text-lg font-bold text-[#23212A] leading-relaxed">
                {essayQuestion.question_text}
              </p>
            </div>

            {/* Essay Form */}
            <form onSubmit={handleEssaySubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1.5">
                  Tuliskan Jawaban & Alasanmu:
                </label>
                <textarea
                  rows={5}
                  required
                  disabled={isEssaySubmitted}
                  placeholder="Ketik jawaban lengkap dan uraian penjelasanmu di sini..."
                  value={essayAnswer}
                  onChange={(e) => setEssayAnswer(e.target.value)}
                  className="w-full p-4 rounded-2xl border-2 border-[#E9E5E8] focus:border-[#51465B] text-sm leading-relaxed text-[#23212A] placeholder:text-slate-400 focus:outline-none focus:ring-0 disabled:bg-slate-50 disabled:cursor-not-allowed"
                />
              </div>

              {!isEssaySubmitted ? (
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!essayAnswer.trim()}
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
                      <strong>Kunci/Pedoman Jawaban:</strong> {essayQuestion.explanation || essayQuestion.rubric || "Pengajar akan meninjau jawaban dan memberikan umpan balik kontekstual."}
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
                      Selesai & Buka Room Lain &rarr;
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
