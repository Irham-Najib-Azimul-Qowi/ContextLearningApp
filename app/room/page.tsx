"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DoorOpen, ArrowRight, ArrowLeft, User, AlertCircle, CheckCircle2 } from "lucide-react";
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
    <div className="min-h-screen bg-[#FAF7F3] text-[#23212A] flex flex-col justify-between selection:bg-[#FFD36D] selection:text-[#51465B] relative overflow-hidden font-sans">
      {/* Decorative Pastel Blobs */}
      <div className="fixed -top-40 -left-40 w-96 h-96 rounded-full bg-[#51465B]/10 blur-3xl pointer-events-none" />
      <div className="fixed -bottom-40 -right-40 w-96 h-96 rounded-full bg-[#FFD36D]/20 blur-3xl pointer-events-none" />

      {/* Top Floating Header */}
      <header className="w-full max-w-5xl mx-auto px-4 sm:px-8 pt-6 pb-4 flex items-center justify-between z-20">
        <PahamiPuzzleLogo size="md" />

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#51465B]/20 bg-white/80 hover:bg-white text-[#51465B] text-xs font-extrabold transition-all shadow-2xs hover:shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>
      </header>

      {/* Main Center: Exact Dark Claymorphic Card from Login Style */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 z-10">
        <div className="w-full max-w-[480px] bg-gradient-to-b from-[#3E3547] via-[#332A3B] to-[#251E2B] rounded-[32px] sm:rounded-[36px] border border-[#5A4F65] shadow-2xl p-8 sm:p-10 relative overflow-hidden flex flex-col items-center text-center text-white z-10 transition-all">
          
          {/* Logo on Top */}
          <div className="transform hover:scale-105 transition-transform duration-200 pt-1">
            <PahamiPuzzleLogo size="md" theme="dark" />
          </div>

          {/* STEP 1: MASUKKAN KODE ROOM */}
          {step === 1 ? (
            <div className="w-full space-y-6 animate-in fade-in zoom-in-95 duration-200 mt-6">
              {/* Heading */}
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Akses Room Pembelajaran
                </h1>
                <p className="text-xs sm:text-sm text-gray-300 mt-2 leading-relaxed max-w-sm mx-auto">
                  Masukkan kode room yang diberikan oleh pengajarmu untuk mulai belajar tanpa perlu login.
                </p>
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
                <div className="text-left">
                  <label className="text-xs font-bold text-gray-300 block mb-1.5 text-center">
                    Kode Akses Room
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      autoFocus
                      placeholder="CONTOH: MTR-3502"
                      value={code}
                      onChange={(e) => {
                        setCode(e.target.value.toUpperCase());
                        setErrorMsg("");
                      }}
                      className="w-full px-5 py-4 rounded-2xl bg-white/10 border-2 border-white/20 text-white placeholder:text-gray-400 text-base font-mono font-black uppercase tracking-widest text-center focus:outline-none focus:border-[#FFD36D] focus:bg-white/15 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 px-5 rounded-full bg-[#FFD36D] hover:bg-[#F5C75A] text-[#251E2B] font-black text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{isLoading ? "Memeriksa Room..." : "Lanjutkan"}</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              </form>

              {/* Quick Demo Hints */}
              <div className="pt-4 border-t border-white/15 text-center space-y-2">
                <span className="text-[11px] font-bold text-gray-400 block">
                  Coba kode room contoh:
                </span>
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCode("MTR-3502");
                      setErrorMsg("");
                    }}
                    className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-[#FFD36D] text-xs font-mono font-bold transition-all cursor-pointer"
                  >
                    MTR-3502 (Materi)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCode("SOL-5021");
                      setErrorMsg("");
                    }}
                    className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-[#FFD36D] text-xs font-mono font-bold transition-all cursor-pointer"
                  >
                    SOL-5021 (Soal)
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* STEP 2: MASUKKAN NAMA SISWA */
            <div className="w-full space-y-6 animate-in fade-in zoom-in-95 duration-200 mt-6">
              {/* Heading */}
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Room Ditemukan: {code}</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Masukkan Namamu
                </h1>
                <p className="text-xs sm:text-sm text-gray-300 mt-1 leading-relaxed max-w-sm mx-auto">
                  {matchedRoomTitle ? `"${matchedRoomTitle}"` : "Kamu siap belajar di room ini!"}
                </p>
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
                <div className="text-left">
                  <label className="text-xs font-bold text-gray-300 block mb-1.5 text-center">
                    Nama Lengkap Siswa
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="Contoh: Budi Pratama"
                    value={studentName}
                    onChange={(e) => {
                      setStudentName(e.target.value);
                      setErrorMsg("");
                    }}
                    className="w-full px-5 py-4 rounded-2xl bg-white/10 border-2 border-white/20 text-white placeholder:text-gray-400 text-sm sm:text-base font-bold text-center focus:outline-none focus:border-[#FFD36D] focus:bg-white/15 transition-all"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setErrorMsg("");
                    }}
                    className="w-1/3 py-4 px-4 rounded-full border border-white/25 hover:bg-white/10 text-gray-300 font-bold text-xs sm:text-sm transition-all cursor-pointer"
                  >
                    Ganti Kode
                  </button>

                  <button
                    type="submit"
                    className="w-2/3 py-4 px-5 rounded-full bg-[#FFD36D] hover:bg-[#F5C75A] text-[#251E2B] font-black text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Masuk ke Room</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Back link at bottom */}
          <div className="mt-8 pt-5 border-t border-white/15 w-full text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
            >
              <span>Belajar lebih dekat bersama Depaskan</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-[#756F7A] z-10">
        Depaskan &bull; Platform Pembelajaran Kontekstual Berbasis Kearifan Lokal
      </footer>
    </div>
  );
}
