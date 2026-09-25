"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DoorOpen, ArrowRight, ArrowLeft, Sparkles, BookOpen, Brain, CheckCircle2, AlertCircle } from "lucide-react";
import { PahamiPuzzleLogo } from "@/components/landing/puzzle-logo";
import { repository } from "@/lib/db/repository";

export default function RoomAccessPortalPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [studentName, setStudentName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const cleanCode = code.trim().toUpperCase();
    const cleanName = studentName.trim();

    if (!cleanCode) {
      setErrorMsg("Mohon masukkan kode room.");
      return;
    }

    if (!cleanName) {
      setErrorMsg("Mohon isi nama lengkap Anda.");
      return;
    }

    setIsLoading(true);
    const room = repository.getRoomByCode(cleanCode);

    if (!room) {
      setErrorMsg(`Kode room "${cleanCode}" tidak ditemukan. Pastikan kode yang dimasukkan sesuai.`);
      setIsLoading(false);
      return;
    }

    // Save name locally for session
    try {
      localStorage.setItem(`depaskan_reader_name_${cleanCode}`, cleanName);
      localStorage.setItem("depaskan_last_reader_name", cleanName);
    } catch {
      // Ignore storage errors
    }

    // Record visit
    repository.recordRoomVisit(cleanCode, cleanName);

    // Redirect to direct room viewer
    router.push(`/room/${cleanCode}`);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F3] text-[#23212A] flex flex-col justify-between selection:bg-[#FFD36D] selection:text-[#51465B] relative overflow-hidden font-sans">
      {/* Decorative Blobs */}
      <div className="fixed -top-32 -left-32 w-80 h-80 rounded-full bg-[#51465B]/10 blur-3xl pointer-events-none" />
      <div className="fixed -bottom-32 -right-32 w-80 h-80 rounded-full bg-[#FFD36D]/20 blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="w-full max-w-5xl mx-auto px-4 sm:px-8 pt-6 pb-4 flex items-center justify-between z-10">
        <PahamiPuzzleLogo size="md" />

        <Link
          href="/"
          className="text-xs font-bold text-[#756F7A] hover:text-[#23212A] flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>
      </header>

      {/* Main Form Center */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 z-10">
        <div className="w-full max-w-md bg-white rounded-3xl sm:rounded-[36px] border border-[#E9E5E8] shadow-2xl p-6 sm:p-9 space-y-6">
          {/* Icon and Title */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#51465B] text-white flex items-center justify-center mx-auto shadow-sm">
              <DoorOpen className="w-7 h-7 stroke-[2.2]" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[#23212A] tracking-tight">
              Akses Materi & Soal
            </h1>
            <p className="text-xs sm:text-sm text-[#756F7A] font-medium leading-relaxed max-w-xs mx-auto">
              Cukup masukkan kode dari pengajar dan namamu untuk mulai belajar kontekstual tanpa perlu login.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input 1: Kode Room */}
            <div>
              <label className="text-xs font-bold text-[#23212A] block mb-1.5">
                Kode Akses Room
              </label>
              <input
                type="text"
                required
                placeholder="CONTOH: MTR-3502"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 rounded-2xl border-2 border-[#E9E5E8] text-sm font-mono font-black uppercase tracking-widest text-[#23212A] placeholder:text-[#756F7A]/40 focus:outline-none focus:border-[#51465B] text-center"
              />
            </div>

            {/* Input 2: Nama Siswa */}
            <div>
              <label className="text-xs font-bold text-[#23212A] block mb-1.5">
                Nama Lengkap Anda
              </label>
              <input
                type="text"
                required
                placeholder="Masukkan nama lengkap siswa..."
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border-2 border-[#E9E5E8] text-sm font-semibold text-[#23212A] placeholder:text-[#756F7A]/40 focus:outline-none focus:border-[#51465B]"
              />
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-5 rounded-2xl bg-[#51465B] hover:bg-[#3D3445] text-white text-sm font-black shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              <span>{isLoading ? "Memeriksa Room..." : "Masuk ke Room"}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

          {/* Quick Demo Hints */}
          <div className="pt-4 border-t border-[#E9E5E8] text-center space-y-2">
            <span className="text-[11px] font-bold text-[#756F7A] block">
              Contoh Kode Tersedia untuk Coba:
            </span>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setCode("MTR-3502");
                  setStudentName("Budi Santoso");
                }}
                className="px-2.5 py-1 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-bold hover:bg-indigo-100 transition-colors cursor-pointer"
              >
                MTR-3502 (Materi)
              </button>
              <button
                type="button"
                onClick={() => {
                  setCode("SOL-5021");
                  setStudentName("Budi Santoso");
                }}
                className="px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold hover:bg-amber-100 transition-colors cursor-pointer"
              >
                SOL-5021 (Soal)
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-[#756F7A] z-10">
        Depaskan &bull; Platform Pembelajaran Kontekstual Tanpa Hambatan Akses
      </footer>
    </div>
  );
}
