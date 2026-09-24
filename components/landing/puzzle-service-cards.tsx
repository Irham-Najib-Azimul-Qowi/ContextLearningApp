"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, FileQuestion, ArrowRight, Sparkles, HelpCircle, Layers } from "lucide-react";

interface PuzzleServiceCardsProps {
  isLoggedIn?: boolean;
  userRole?: string | null;
}

/**
 * PuzzleServiceCards
 * Two interlocking authentic jigsaw puzzle cards:
 * 1. KIRI: KONTEKSKAN SOAL (Warm Yellow #FFD36D with prominent Soal puzzle icon)
 * 2. KANAN: KONTEKSKAN MATERI (Dark Mauve #51465B with prominent Materi puzzle icon)
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
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 items-stretch pt-4 pb-8 relative">
      {/* ===================================================================== */}
      {/* KARTU KIRI: KONTEKSKAN SOAL (#FFD36D Warm Yellow Jigsaw Piece)        */}
      {/* ===================================================================== */}
      <Link
        href={questionHref}
        className="group relative flex flex-col justify-between p-8 sm:p-10 rounded-[40px] sm:rounded-[48px] bg-[#FFD36D] text-[#23212A] shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-3 border-[#51465B] active:scale-[0.99] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#51465B]"
        aria-label="Pilih layanan Kontekskan Soal"
      >
        {/* JIGSAW PUZZLE TABS & SOCKETS (Bentuk Fisik Puzzle Nyata) */}
        {/* Top puzzle knob tab */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-8 rounded-t-2xl bg-[#FFD36D] border-t-3 border-x-3 border-[#51465B] z-20" />

        {/* Right interlocking puzzle tab (sticks out to dock into the right card) */}
        <div className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-20 rounded-r-3xl bg-[#FFD36D] border-r-3 border-y-3 border-[#51465B] shadow-md z-30 items-center justify-center pointer-events-none">
          <div className="w-2 h-8 rounded-full bg-[#51465B]/20" />
        </div>

        {/* Left puzzle socket indent */}
        <div className="hidden md:block absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-18 rounded-r-2xl bg-[#FAF7F3] border-r-3 border-y-3 border-[#51465B]/30 shadow-inner z-10 pointer-events-none" />

        {/* Ambient subtle decorative glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/40 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full bg-[#F47D83]/20 blur-3xl pointer-events-none" />

        <div>
          {/* Header Row: Big Prominent Soal Puzzle Icon + Badge */}
          <div className="flex items-center justify-between gap-4 mb-6">
            {/* Custom Large Puzzle Emblem for Soal */}
            <div className="relative w-16 h-16 rounded-[22px] bg-[#51465B] text-[#FFD36D] flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300">
              {/* Decorative mini puzzle knob on icon */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-3 rounded-t-full bg-[#51465B] border-t-2 border-x-2 border-[#51465B]" />
              <FileQuestion className="w-8 h-8 text-[#FFD36D] stroke-[2.4]" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#51465B]/10 text-[#51465B] font-black text-xs tracking-wider uppercase border border-[#51465B]/20">
              <Sparkles className="w-3.5 h-3.5 text-[#51465B]" />
              <span>Konteks Soal</span>
            </div>
          </div>

          {/* Heading and Description */}
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-[#23212A] mb-3">
            Kontekskan Soal
          </h2>
          <p className="text-sm sm:text-base text-[#51465B] leading-relaxed font-semibold mb-8 max-w-md">
            Ubah teks soal kurikulum standar menjadi soal cerita kaya konteks kearifan lokal, budaya, dan potensi daerah siswa.
          </p>
        </div>

        {/* Card Action Footer */}
        <div className="pt-6 border-t border-[#51465B]/20 flex items-center justify-between text-sm sm:text-base font-black">
          <span className="text-[#51465B] tracking-wide flex items-center gap-2 group-hover:underline">
            Mulai Buat Soal
          </span>
          <div className="w-12 h-12 rounded-2xl bg-[#51465B] text-white flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-[#3D3445] transition-all">
            <ArrowRight className="w-5 h-5 text-[#FFD36D] stroke-[2.5] group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>

      {/* ===================================================================== */}
      {/* KARTU KANAN: KONTEKSKAN MATERI (#51465B Dark Mauve Jigsaw Piece)     */}
      {/* ===================================================================== */}
      <Link
        href={materialHref}
        className="group relative flex flex-col justify-between p-8 sm:p-10 rounded-[40px] sm:rounded-[48px] bg-[#51465B] text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-3 border-[#51465B] active:scale-[0.99] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#FFD36D]"
        aria-label="Pilih layanan Kontekskan Materi"
      >
        {/* JIGSAW PUZZLE TABS & SOCKETS (Bentuk Fisik Puzzle Nyata) */}
        {/* Top puzzle knob tab */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-8 rounded-t-2xl bg-[#51465B] border-t-3 border-x-3 border-[#51465B] z-20" />

        {/* Left interlocking puzzle socket (where the left card's tab docks) */}
        <div className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 w-10 h-20 rounded-r-3xl bg-[#FAF7F3] border-r-3 border-y-3 border-[#51465B] shadow-inner z-20 items-center justify-center pointer-events-none">
          <div className="w-2 h-8 rounded-full bg-[#51465B]/20" />
        </div>

        {/* Right puzzle tab */}
        <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-18 rounded-r-2xl bg-[#51465B] border-r-3 border-y-3 border-[#51465B] shadow-md z-30 pointer-events-none" />

        {/* Ambient subtle decorative glow */}
        <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-56 h-56 rounded-full bg-[#FFD36D]/15 blur-3xl pointer-events-none" />

        <div>
          {/* Header Row: Big Prominent Materi Puzzle Icon + Badge */}
          <div className="flex items-center justify-between gap-4 mb-6">
            {/* Custom Large Puzzle Emblem for Materi */}
            <div className="relative w-16 h-16 rounded-[22px] bg-[#FFD36D] text-[#51465B] flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              {/* Decorative mini puzzle knob on icon */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-3 rounded-t-full bg-[#FFD36D] border-t-2 border-x-2 border-[#FFD36D]" />
              <BookOpen className="w-8 h-8 text-[#51465B] stroke-[2.4]" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/15 text-white font-black text-xs tracking-wider uppercase border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-[#FFD36D]" />
              <span>Konteks Materi</span>
            </div>
          </div>

          {/* Heading and Description */}
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-3">
            Kontekskan Materi
          </h2>
          <p className="text-sm sm:text-base text-white/90 leading-relaxed font-normal mb-8 max-w-md">
            Sematkan komoditas unggulan, sentra industri, dan fakta geografi terverifikasi ke dalam bahan ajar kurikulum sekolah dasar.
          </p>
        </div>

        {/* Card Action Footer */}
        <div className="pt-6 border-t border-white/15 flex items-center justify-between text-sm sm:text-base font-black">
          <span className="text-[#FFD36D] tracking-wide flex items-center gap-2 group-hover:underline">
            Mulai Buat Materi
          </span>
          <div className="w-12 h-12 rounded-2xl bg-[#FFD36D] text-[#51465B] flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-white transition-all">
            <ArrowRight className="w-5 h-5 stroke-[2.5] group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </div>
  );
}
