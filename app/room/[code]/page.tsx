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
} from "lucide-react";
import { PahamiPuzzleLogo } from "@/components/landing/puzzle-logo";
import { repository } from "@/lib/db/repository";
import { LearningRoom, LearningMaterial, Question } from "@/lib/db/types";

export default function RoomViewerPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = typeof params.code === "string" ? params.code.toUpperCase() : "";

  const [room, setRoom] = useState<LearningRoom | null>(null);
  const [material, setMaterial] = useState<LearningMaterial | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);

  // Student name state (no login, just name)
  const [studentName, setStudentName] = useState<string>("");
  const [isNamePromptOpen, setIsNamePromptOpen] = useState(false);
  const [inputName, setInputName] = useState("");

  // Question interaction state
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
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

    // Load related resource
    if (foundRoom.type === "material") {
      const allMats = repository.getMaterials();
      const mat = allMats.find((m) => m.id === foundRoom.resource_id) || allMats[0];
      setMaterial(mat);
    } else if (foundRoom.type === "question") {
      const allQs = repository.getQuestions();
      const q = allQs.find((item) => item.id === foundRoom.resource_id) || allQs[0];
      setQuestion(q);
    } else if (foundRoom.type === "both") {
      const allMats = repository.getMaterials();
      const mat = allMats.find((m) => m.id === foundRoom.resource_id) || allMats[0];
      setMaterial(mat);

      const allQs = repository.getQuestions();
      const q = allQs.find((item) => item.id === foundRoom.secondary_resource_id) || allQs[0];
      setQuestion(q);
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

  const handleAnswerSubmit = () => {
    if (!selectedAnswer) return;
    setIsAnswerSubmitted(true);
    setIsCompleted(true);

    const isCorrect = selectedAnswer === question?.correct_answer;
    const score = isCorrect ? 100 : 0;
    if (studentName) {
      repository.recordRoomVisit(roomCode, studentName, score);
    }
  };

  const handleFinishReading = () => {
    setIsCompleted(true);
    if (studentName) {
      repository.recordRoomVisit(roomCode, studentName, 100);
    }
  };

  // 404 Room Not Found State
  if (!room) {
    return (
      <div className="min-h-screen bg-[#FAF7F3] flex flex-col justify-between p-4 font-sans text-center">
        <header className="py-4">
          <PahamiPuzzleLogo size="md" />
        </header>
        <div className="max-w-md mx-auto bg-white rounded-3xl border border-[#E9E5E8] p-8 shadow-xl space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-black text-[#23212A]">Room Tidak Ditemukan</h2>
          <p className="text-xs text-[#756F7A] leading-relaxed">
            Kode room <strong>&quot;{roomCode}&quot;</strong> tidak terdaftar atau sudah ditutup oleh pengajar.
          </p>
          <Link
            href="/room"
            className="inline-block px-5 py-2.5 rounded-2xl bg-[#51465B] text-white text-xs font-bold shadow-md hover:bg-[#3D3445] transition-colors"
          >
            Masukkan Kode Lain
          </Link>
        </div>
        <footer className="py-4 text-xs text-[#756F7A]">Depaskan</footer>
      </div>
    );
  }

  const isMaterial = room?.type === "material" || room?.type === "both";
  const isQuestion = room?.type === "question" || room?.type === "both";
  const isBoth = room?.type === "both";

  return (
    <div className="min-h-screen bg-[#FAF7F3] text-[#23212A] flex flex-col justify-between selection:bg-[#FFD36D] selection:text-[#51465B] relative font-sans">
      {/* Top Navbar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-[#E9E5E8] sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/room"
            className="w-9 h-9 rounded-xl bg-[#FAF7F3] border border-[#E9E5E8] flex items-center justify-center text-[#756F7A] hover:text-[#23212A] transition-colors"
            title="Keluar dari Room"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <PahamiPuzzleLogo size="sm" />
        </div>

        {/* Room Code Badge & Share */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F3] border border-[#E9E5E8] text-xs">
            <span className="text-[#756F7A] text-[10px] font-bold uppercase tracking-wider">
              Room:
            </span>
            <span className="font-mono font-black text-[#23212A] tracking-wider">
              {roomCode}
            </span>
          </div>

          {studentName && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#51465B]/10 text-[#51465B] text-xs font-bold">
              <User className="w-3.5 h-3.5" />
              <span>{studentName}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleCopyLink}
            className="p-2 rounded-xl bg-white border border-[#E9E5E8] hover:bg-slate-50 text-[#51465B] transition-colors cursor-pointer"
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
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
        {/* ================================================================== */}
        {/* 1. KONTEN TIPE MATERI                                             */}
        {/* ================================================================== */}
        {isMaterial && material && (
          <div className="space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-3xl border border-[#E9E5E8] p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#51465B]/10 text-[#51465B] text-xs font-black uppercase tracking-wider">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{isBoth ? "Materi & Latihan Terpadu" : "Modul Ajar Kontekstual"}</span>
                </span>

                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FAF7F3] border border-[#E9E5E8] text-xs font-bold text-[#756F7A]">
                  <MapPin className="w-3.5 h-3.5 text-[#51465B]" />
                  <span>{room.region_name}</span>
                </span>

                <span className="px-3 py-1 rounded-full bg-[#FAF7F3] border border-[#E9E5E8] text-xs font-bold text-[#756F7A]">
                  Kelas {room.grade} SD &bull; {room.subject}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-[#23212A] tracking-tight leading-tight">
                {material.title}
              </h1>

              <div className="text-xs text-[#756F7A] font-semibold flex items-center gap-2 pt-1 border-t border-[#E9E5E8]">
                <span>Diterbitkan oleh: <strong>{room.teacher_name}</strong></span>
              </div>
            </div>

            {/* Reading Content Card */}
            <div className="bg-white rounded-3xl border border-[#E9E5E8] p-6 sm:p-9 shadow-xs space-y-6 text-[#23212A] leading-relaxed">
              <div className="text-sm sm:text-base space-y-4 font-normal text-slate-800 leading-relaxed sm:leading-loose">
                {material.content.split("\n\n").map((para, idx) => (
                  <p key={idx} className="text-justify sm:text-left">
                    {para}
                  </p>
                ))}
              </div>

              {/* Local Context Highlights Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-black">
                  <Sparkles className="w-4 h-4 text-amber-700" />
                  <span>Konteks Lingkungan Nyata Terverifikasi</span>
                </div>
                <p className="text-amber-800 leading-relaxed">
                  Materi ini mengangkat fakta riil dari wilayah <strong>{room.region_name}</strong> agar siswa lebih mudah memahami materi melalui contoh lingkungan hidup sekitar.
                </p>
              </div>

              {/* Completion Action */}
              <div className="pt-6 border-t border-[#E9E5E8] flex flex-col sm:flex-row items-center justify-between gap-4">
                {isCompleted ? (
                  <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-4 py-2.5 rounded-2xl border border-emerald-200 text-xs font-bold w-full sm:w-auto">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Hebat! Kamu telah menyelesaikan modul materi ini.</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinishReading}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#51465B] hover:bg-[#3D3445] text-white text-xs sm:text-sm font-black shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                    <span>{isBoth ? "Tandai Selesai Membaca & Lanjut Latihan" : "Saya Sudah Selesai Membaca"}</span>
                  </button>
                )}

                <Link
                  href="/room"
                  className="text-xs font-bold text-[#756F7A] hover:text-[#23212A] transition-colors"
                >
                  Buka Room Lain &rarr;
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* 2. KONTEN TIPE SOAL                                                */}
        {/* ================================================================== */}
        {isQuestion && question && (
          <div className="space-y-6">
            {isBoth ? (
              <div className="flex items-center gap-3 pt-4">
                <div className="h-px bg-[#E9E5E8] flex-1" />
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#FFD36D]/30 border border-[#FFD36D] text-xs font-black text-[#51465B]">
                  <Brain className="w-4 h-4 text-[#51465B]" />
                  <span>Uji Pemahaman Materi di Atas</span>
                </div>
                <div className="h-px bg-[#E9E5E8] flex-1" />
              </div>
            ) : (
              /* Question Header Card for standalone question rooms */
              <div className="bg-white rounded-3xl border border-[#E9E5E8] p-6 sm:p-8 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider">
                    <Brain className="w-3.5 h-3.5" />
                    <span>Latihan Soal Kontekstual</span>
                  </span>

                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FAF7F3] border border-[#E9E5E8] text-xs font-bold text-[#756F7A]">
                    <MapPin className="w-3.5 h-3.5 text-[#51465B]" />
                    <span>{room.region_name}</span>
                  </span>

                  <span className="px-3 py-1 rounded-full bg-[#FAF7F3] border border-[#E9E5E8] text-xs font-bold text-[#756F7A]">
                    Kelas {room.grade} SD &bull; {room.subject}
                  </span>
                </div>

                <h1 className="text-xl sm:text-3xl font-black text-[#23212A] tracking-tight">
                  {room.title}
                </h1>

                <div className="text-xs text-[#756F7A] font-semibold flex items-center gap-2 pt-1 border-t border-[#E9E5E8]">
                  <span>Pengajar: <strong>{room.teacher_name}</strong></span>
                </div>
              </div>
            )}

            {/* Question Card */}
            <div className="bg-white rounded-3xl border border-[#E9E5E8] p-6 sm:p-9 shadow-xs space-y-6">
              {/* Question Text */}
              <div className="space-y-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#51465B] block">
                  Topik: {question.topic}
                </span>
                <p className="text-base sm:text-lg font-bold text-[#23212A] leading-relaxed">
                  {question.question_text}
                </p>
              </div>

              {/* Multiple Choice Options */}
              {question.options && question.options.length > 0 && (
                <div className="space-y-3 pt-2">
                  {question.options.map((opt) => {
                    const isSelected = selectedAnswer === opt.key;
                    const isCorrect = isAnswerSubmitted && opt.key === question.correct_answer;
                    const isWrong = isAnswerSubmitted && isSelected && !isCorrect;

                    return (
                      <button
                        key={opt.key}
                        type="button"
                        disabled={isAnswerSubmitted}
                        onClick={() => setSelectedAnswer(opt.key)}
                        className={`w-full p-4 rounded-2xl border-2 flex items-center gap-3.5 text-left transition-all cursor-pointer ${
                          isCorrect
                            ? "border-emerald-500 bg-emerald-50 text-emerald-950 font-bold"
                            : isWrong
                            ? "border-rose-500 bg-rose-50 text-rose-950 font-bold"
                            : isSelected
                            ? "border-[#51465B] bg-[#51465B]/5 font-bold"
                            : "border-[#E9E5E8] hover:border-slate-300"
                        }`}
                      >
                        <span
                          className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                            isCorrect
                              ? "bg-emerald-600 text-white"
                              : isWrong
                              ? "bg-rose-600 text-white"
                              : isSelected
                              ? "bg-[#51465B] text-white"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {opt.key}
                        </span>
                        <span className="text-sm flex-1">{opt.text}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Submit Answer Button */}
              {!isAnswerSubmitted && (
                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    disabled={!selectedAnswer}
                    onClick={handleAnswerSubmit}
                    className="px-6 py-3 rounded-2xl bg-[#51465B] hover:bg-[#3D3445] text-white text-xs sm:text-sm font-black shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                  >
                    Kumpulkan Jawaban
                  </button>
                </div>
              )}

              {/* Answer Explanation Box when Submitted */}
              {isAnswerSubmitted && (
                <div className="pt-4 space-y-4 animate-in fade-in slide-in-from-bottom-2">
                  <div
                    className={`p-4 sm:p-5 rounded-2xl border text-xs space-y-2 ${
                      selectedAnswer === question.correct_answer
                        ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                        : "bg-rose-50 border-rose-200 text-rose-950"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-black text-sm">
                      {selectedAnswer === question.correct_answer ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          <span>Jawaban Kamu Benar! (+100 Poin)</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-5 h-5 text-rose-600" />
                          <span>Jawaban Belum Tepat. Kunci Jawaban: {question.correct_answer}</span>
                        </>
                      )}
                    </div>
                    <p className="leading-relaxed pt-1 text-slate-800">
                      <strong>Pembahasan:</strong> {question.explanation}
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <Link
                      href="/room"
                      className="text-xs font-bold text-[#756F7A] hover:text-[#23212A] transition-colors"
                    >
                      &larr; Buka Room Lain
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setIsAnswerSubmitted(false);
                        setSelectedAnswer(null);
                      }}
                      className="px-4 py-2 rounded-xl border border-[#E9E5E8] text-xs font-bold text-[#51465B] hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Coba Jawab Lagi
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Name Input Prompt Modal if Name Not Set */}
      {isNamePromptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 sm:p-7 text-center space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-[#51465B] text-white flex items-center justify-center mx-auto shadow-sm">
              <User className="w-6 h-6 stroke-[2.2]" />
            </div>

            <div>
              <h3 className="text-xl font-black text-[#23212A]">
                Selamat Datang!
              </h3>
              <p className="text-xs text-[#756F7A] mt-1">
                Masukkan namamu untuk mulai belajar di room <strong>{roomCode}</strong>. Tidak perlu login akun.
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
                className="w-full px-4 py-3 rounded-2xl border-2 border-[#E9E5E8] text-sm font-bold text-[#23212A] placeholder:text-[#756F7A]/40 focus:outline-none focus:border-[#51465B] text-center"
              />

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-2xl bg-[#51465B] hover:bg-[#3D3445] text-white text-xs font-black shadow-md transition-all cursor-pointer"
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
