"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, FileQuestion, ArrowRight } from "lucide-react";

interface PuzzleServiceCardsProps {
  isLoggedIn?: boolean;
  userRole?: string | null;
}

/**
 * PuzzleServiceCards
 * Clean rounded cards with clear stroke definition:
 * 1. KIRI (Soal): Quentext dengan CTA unik menarik "Bikin Soal Lebih Nyata"
 * 2. KANAN (Materi): Mattext dengan stroke jelas (#FFD36D) & CTA unik menarik "Kemas Materi Lebih Dekat"
 */
export function PuzzleServiceCards({ isLoggedIn = false, userRole = "TEACHER" }: PuzzleServiceCardsProps) {
  // Determine appropriate routing destination
  const questionHref = isLoggedIn
    ? userRole === "STUDENT"
      ? "/student/dashboard"
      : "/teacher/questions/new"
    : "/login?intent=question";

  const materialHref = isLoggedIn
    ? userRole === "STUDENT"
      ? "/student/dashboard"
      : "/teacher/materials/new"
    : "/login?intent=material";

  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch pt-4 pb-8">
      {/* ===================================================================== */}
      {/* KARTU KIRI: QUENTEXT (Konteks Soal)                                   */}
      {/* ===================================================================== */}
      <Link
        href={questionHref}
        className="group relative flex flex-col justify-between p-8 sm:p-10 rounded-[32px] sm:rounded-[36px] bg-[#FFD36D] text-[#23212A] shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 border-2 border-[#51465B] active:scale-[0.99] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#51465B] overflow-hidden"
        aria-label="Pilih Quentext untuk Konteks Soal"
      >
        {/* Ambient subtle glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/40 blur-2xl pointer-events-none" />

        <div>
          {/* Ikon Soal yang pas */}
          <div className="w-16 h-16 rounded-2xl bg-[#51465B] text-[#FFD36D] flex items-center justify-center shadow-md mb-6 group-hover:scale-110 group-hover:-rotate-2 transition-transform duration-300">
            <FileQuestion className="w-8 h-8 text-[#FFD36D] stroke-[2.4]" />
          </div>

          {/* Title: Quentext */}
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#23212A] mb-8">
            Quentext
          </h2>
        </div>

        {/* CTA Unik & Menarik di bagian bawah */}
        <div className="pt-6 border-t border-[#51465B]/20 flex items-center justify-between text-base font-black">
          <span className="text-[#51465B] tracking-wide flex items-center gap-2 group-hover:underline">
            Bikin Soal Lebih Nyata
          </span>
          <div className="w-12 h-12 rounded-2xl bg-[#51465B] text-white flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-[#3D3445] transition-all">
            <ArrowRight className="w-5 h-5 text-[#FFD36D] stroke-[2.5] group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>

      {/* ===================================================================== */}
      {/* KARTU KANAN: MATTEXT (Konteks Materi)                                 */}
      {/* ===================================================================== */}
      <Link
        href={materialHref}
        className="group relative flex flex-col justify-between p-8 sm:p-10 rounded-[32px] sm:rounded-[36px] bg-[#51465B] text-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 border-2 border-[#FFD36D] active:scale-[0.99] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#FFD36D] overflow-hidden"
        aria-label="Pilih Mattext untuk Konteks Materi"
      >
        {/* Ambient subtle glow */}
        <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />

        <div>
          {/* Ikon Materi yang pas */}
          <div className="w-16 h-16 rounded-2xl bg-[#FFD36D] text-[#51465B] flex items-center justify-center shadow-md mb-6 group-hover:scale-110 group-hover:rotate-2 transition-transform duration-300">
            <BookOpen className="w-8 h-8 text-[#51465B] stroke-[2.4]" />
          </div>

          {/* Title: Mattext */}
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-8">
            Mattext
          </h2>
        </div>

        {/* CTA Unik & Menarik di bagian bawah */}
        <div className="pt-6 border-t border-white/20 flex items-center justify-between text-base font-black">
          <span className="text-[#FFD36D] tracking-wide flex items-center gap-2 group-hover:underline">
            Kemas Materi Lebih Dekat
          </span>
          <div className="w-12 h-12 rounded-2xl bg-[#FFD36D] text-[#51465B] flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-white transition-all">
            <ArrowRight className="w-5 h-5 text-[#51465B] stroke-[2.5] group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </div>
  );
}
