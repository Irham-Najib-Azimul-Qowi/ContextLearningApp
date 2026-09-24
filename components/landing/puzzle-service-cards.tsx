"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, FileQuestion, ArrowRight, Sparkles } from "lucide-react";

interface PuzzleServiceCardsProps {
  isLoggedIn?: boolean;
  userRole?: string | null;
}

/**
 * PuzzleServiceCards
 * The two primary interlocking hero puzzle cards of PAHAMI V2:
 * 1. KARTU KIRI: KONTEKSKAN MATERI (Dark Mauve #51465B, Tab on right)
 * 2. KARTU KANAN: KONTEKSKAN SOAL (Warm Yellow #FFD36D, Socket on left)
 */
export function PuzzleServiceCards({ isLoggedIn = false, userRole = "TEACHER" }: PuzzleServiceCardsProps) {
  // Determine appropriate routing destination
  const materialHref = isLoggedIn
    ? userRole === "STUDENT"
      ? "/student/dashboard"
      : "/teacher/materials/new"
    : "/login?intent=material";

  const questionHref = isLoggedIn
    ? userRole === "STUDENT"
      ? "/student/dashboard"
      : "/teacher/questions/new"
    : "/login?intent=question";

  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch pt-2 pb-6">
      {/* ===================================================================== */}
      {/* KARTU KIRI: KONTEKSKAN MATERI (#51465B Dark Mauve)                    */}
      {/* ===================================================================== */}
      <Link
        href={materialHref}
        className="group relative flex flex-col justify-between p-7 sm:p-9 rounded-[32px] sm:rounded-[38px] bg-[#51465B] text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 overflow-hidden border-2 border-[#51465B] active:scale-[0.99] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#FFD36D]"
        aria-label="Pilih layanan Kontekskan Materi"
      >
        {/* Ambient subtle decorative glow */}
        <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-56 h-56 rounded-full bg-[#FFD36D]/15 blur-3xl pointer-events-none" />

        {/* Puzzle Interlocking Tab Indicator (Desktop Right Edge) */}
        <div className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-8 h-16 rounded-r-2xl bg-[#51465B] border-r-2 border-y-2 border-[#51465B] shadow-md z-10 items-center justify-center pointer-events-none">
          <div className="w-2.5 h-7 rounded-full bg-[#FFD36D]/30" />
        </div>

        <div>
          {/* Top Row: Service Badge & Mini Puzzle Icon */}
          <div className="flex items-center justify-between gap-3 mb-6">
            {/* Custom Puzzle Icon with Book Symbol */}
            <div className="relative w-14 h-14 rounded-2xl bg-[#FFD36D] text-[#51465B] flex items-center justify-center shadow-md group-hover:scale-105 group-hover:rotate-1 transition-all duration-300">
              {/* Decorative mini puzzle knob on icon */}
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-2.5 rounded-t-full bg-[#FFD36D] border-t-2 border-x-2 border-[#FFD36D]" />
              <BookOpen className="w-7 h-7 text-[#51465B] stroke-[2.2]" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/15 text-white font-extrabold text-[11px] tracking-wider uppercase border border-white/20">
              <Sparkles className="w-3 h-3 text-[#FFD36D]" />
              <span>Layanan 1 &bull; Modul Ajar</span>
            </div>
          </div>

          {/* Heading and Description */}
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-3">
            Kontekskan Materi
          </h2>
          <p className="text-sm sm:text-base text-white/85 leading-relaxed font-normal mb-8 max-w-md">
            Ubah materi pembelajaran menjadi lebih dekat dengan lingkungan siswa. Diperkaya fakta sentra industri, kearifan lokal, dan potensi geografi daerah.
          </p>
        </div>

        {/* Card Action Footer */}
        <div className="pt-5 border-t border-white/15 flex items-center justify-between text-xs sm:text-sm font-black">
          <span className="text-[#FFD36D] tracking-wide flex items-center gap-1.5 group-hover:underline">
            Buat Materi
          </span>
          <div className="w-10 h-10 rounded-2xl bg-[#FFD36D] text-[#51465B] flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-white transition-all">
            <ArrowRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </Link>

      {/* ===================================================================== */}
      {/* KARTU KANAN: KONTEKSKAN SOAL (#FFD36D Warm Yellow)                    */}
      {/* ===================================================================== */}
      <Link
        href={questionHref}
        className="group relative flex flex-col justify-between p-7 sm:p-9 rounded-[32px] sm:rounded-[38px] bg-[#FFD36D] text-[#23212A] shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 overflow-hidden border-2 border-[#51465B]/20 active:scale-[0.99] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#51465B]"
        aria-label="Pilih layanan Kontekskan Soal"
      >
        {/* Ambient subtle decorative glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/30 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full bg-[#F47D83]/20 blur-3xl pointer-events-none" />

        {/* Puzzle Interlocking Socket Indicator (Desktop Left Edge) */}
        <div className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-16 rounded-r-2xl bg-[#FAF7F3] border-l-2 border-y-2 border-[#51465B]/15 shadow-inner z-10 items-center justify-center pointer-events-none">
          <div className="w-2.5 h-7 rounded-full bg-[#51465B]/15" />
        </div>

        <div>
          {/* Top Row: Service Badge & Mini Puzzle Icon */}
          <div className="flex items-center justify-between gap-3 mb-6">
            {/* Custom Puzzle Icon with FileQuestion Symbol */}
            <div className="relative w-14 h-14 rounded-2xl bg-[#51465B] text-[#FFD36D] flex items-center justify-center shadow-md group-hover:scale-105 group-hover:-rotate-1 transition-all duration-300">
              {/* Decorative mini puzzle knob on icon */}
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-2.5 rounded-t-full bg-[#51465B] border-t-2 border-x-2 border-[#51465B]" />
              <FileQuestion className="w-7 h-7 text-[#FFD36D] stroke-[2.2]" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#51465B]/10 text-[#51465B] font-extrabold text-[11px] tracking-wider uppercase border border-[#51465B]/20">
              <Sparkles className="w-3 h-3 text-[#51465B]" />
              <span>Layanan 2 &bull; Bank Soal & Ujian</span>
            </div>
          </div>

          {/* Heading and Description */}
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#23212A] mb-3">
            Kontekskan Soal
          </h2>
          <p className="text-sm sm:text-base text-[#51465B] leading-relaxed font-medium mb-8 max-w-md">
            Buat soal yang relevan dengan kehidupan sehari-hari siswa. Dilengkapi gambar visual autentik, stimulus narasi kearifan lokal, dan lembar cetak A4 siap pakai.
          </p>
        </div>

        {/* Card Action Footer */}
        <div className="pt-5 border-t border-[#51465B]/15 flex items-center justify-between text-xs sm:text-sm font-black">
          <span className="text-[#51465B] tracking-wide flex items-center gap-1.5 group-hover:underline">
            Buat Soal
          </span>
          <div className="w-10 h-10 rounded-2xl bg-[#51465B] text-white flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-[#3D3445] transition-all">
            <ArrowRight className="w-4 h-4 text-[#FFD36D] stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </Link>
    </div>
  );
}
