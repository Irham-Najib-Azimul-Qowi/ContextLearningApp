"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ArrowLeft, AlertCircle } from "lucide-react";
import { PahamiPuzzleLogo } from "@/components/landing/puzzle-logo";
import { repository } from "@/lib/db/repository";

export default function RoomAccessPortalPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1); // 1: Kode Room, 2: Nama Siswa
  const [code, setCode] = useState("");
  const [studentName, setStudentName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [matchedRoomTitle, setMatchedRoomTitle] = useState("");

  // Step 1: Validate Room Code
  const handleValidateCode = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setErrorMsg("Mohon masukkan kode room.");
      return;
    }

    setIsLoading(true);
    const room = repository.getRoomByCode(cleanCode);

    if (!room) {
      setErrorMsg(`Kode room "${cleanCode}" tidak ditemukan. Pastikan kodenya benar.`);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    setMatchedRoomTitle(room.title);
    setStep(2);
  };

  // Step 2: Submit Student Name & Enter Room
  const handleEnterRoom = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const cleanName = studentName.trim();
    if (!cleanName) {
      setErrorMsg("Mohon masukkan namamu untuk memulai.");
      return;
    }

    const cleanCode = code.trim().toUpperCase();

    // Save name locally for session
    try {
      localStorage.setItem(`depaskan_reader_name_${cleanCode}`, cleanName);
      localStorage.setItem("depaskan_last_reader_name", cleanName);
    } catch {
      // Ignore storage errors
    }

    // Record visitor
    repository.recordRoomVisit(cleanCode, cleanName);

    // Navigate to room viewer
    router.push(`/room/${cleanCode}`);
  };

  return (
    <main className="min-h-screen bg-[#FAF7F3] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Subtle atmospheric ambient glow */}
      <div className="fixed -top-40 -left-40 w-96 h-96 rounded-full bg-[#3E3547]/15 blur-3xl pointer-events-none" />
      <div className="fixed top-1/2 -right-40 w-80 h-80 rounded-full bg-[#FFD36D]/15 blur-3xl pointer-events-none" />
      <div className="fixed -bottom-40 left-1/3 w-96 h-96 rounded-full bg-[#3E3547]/10 blur-3xl pointer-events-none" />

      {/* Floating Card */}
      <div className="w-full max-w-[480px] bg-gradient-to-b from-[#3E3547] via-[#332A3B] to-[#251E2B] rounded-[32px] sm:rounded-[36px] border border-[#5A4F65] shadow-2xl p-8 sm:p-10 relative overflow-hidden flex flex-col items-center text-center text-white z-10 transition-all">
        
        {/* Logo on Top */}
        <div className="transform hover:scale-105 transition-transform duration-200 pt-1">
          <PahamiPuzzleLogo size="md" theme="dark" />
        </div>

        {/* Progress Dots Indicator */}
        <div className="flex items-center justify-center gap-2 mt-5">
          <div
            className={`h-1.5 rounded-full transition-all duration-300 ${
              step === 1 ? "w-6 bg-[#FFD36D]" : "w-2 bg-[#FFD36D]/50"
            }`}
          />
          <div
            className={`h-1.5 rounded-full transition-all duration-300 ${
              step === 2 ? "w-6 bg-[#FFD36D]" : "w-2 bg-white/20"
            }`}
          />
        </div>

        {/* STEP 1: MASUKKAN KODE ROOM */}
        {step === 1 ? (
          <div className="w-full space-y-6 animate-in fade-in zoom-in-95 duration-200 mt-5">
            {/* Heading */}
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Masukkan Kode Room
              </h1>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="w-full p-3.5 rounded-2xl bg-rose-950/70 border border-rose-700/60 text-rose-200 text-xs flex items-start gap-2.5 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <div className="leading-relaxed">{errorMsg}</div>
              </div>
            )}

            {/* Form Input Kode */}
            <form onSubmit={handleValidateCode} className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="MTR-3502"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase());
                    setErrorMsg("");
                  }}
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-white/20 bg-[#251E2B]/80 focus:border-[#FFD36D] focus:bg-[#1E1724] text-base font-mono font-black uppercase tracking-widest text-center text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFD36D]/20 transition-all shadow-inner"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#FFD36D] to-[#FDB040] hover:from-[#FFE085] hover:to-[#FFBD59] text-[#251E2B] font-extrabold text-sm sm:text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isLoading ? "Memeriksa..." : "Lanjut"}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </form>
          </div>
        ) : (
          /* STEP 2: MASUKKAN NAMA SISWA */
          <div className="w-full space-y-6 animate-in fade-in zoom-in-95 duration-200 mt-5">
            {/* Heading */}
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Masukkan Nama
              </h1>
              {matchedRoomTitle && (
                <p className="text-xs text-[#FFD36D] mt-1.5 font-semibold truncate max-w-xs mx-auto">
                  {matchedRoomTitle}
                </p>
              )}
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="w-full p-3.5 rounded-2xl bg-rose-950/70 border border-rose-700/60 text-rose-200 text-xs flex items-start gap-2.5 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <div className="leading-relaxed">{errorMsg}</div>
              </div>
            )}

            {/* Form Input Nama */}
            <form onSubmit={handleEnterRoom} className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Budi Pratama"
                  value={studentName}
                  onChange={(e) => {
                    setStudentName(e.target.value);
                    setErrorMsg("");
                  }}
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-white/20 bg-[#251E2B]/80 focus:border-[#FFD36D] focus:bg-[#1E1724] text-sm sm:text-base font-bold text-center text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFD36D]/20 transition-all shadow-inner"
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setErrorMsg("");
                  }}
                  className="w-1/2 py-3.5 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm border border-white/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Kembali</span>
                </button>

                <button
                  type="submit"
                  className="w-1/2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#FFD36D] to-[#FDB040] hover:from-[#FFE085] hover:to-[#FFBD59] text-[#251E2B] font-extrabold text-sm sm:text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Lanjut</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Back link at bottom */}
        <div className="mt-7 pt-5 border-t border-white/15 w-full text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
