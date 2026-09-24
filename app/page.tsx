"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PahamiPuzzleLogo } from "@/components/landing/puzzle-logo";
import { PuzzleServiceCards } from "@/components/landing/puzzle-service-cards";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { ContextComparisonSection } from "@/components/landing/context-comparison-section";
import { LandingFooter } from "@/components/landing/landing-footer";
import { createClient } from "@/lib/supabase/client";
import { repository } from "@/lib/db/repository";

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Check client-side authentication session
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user) {
          setIsLoggedIn(true);
          const currentRole = repository.getCurrentRole();
          setUserRole(currentRole || "TEACHER");
        }
      } catch {
        // Fallback silently
      }
    };
    checkAuth();
  }, []);

  const dashboardHref = userRole === "STUDENT" ? "/student/dashboard" : "/teacher/dashboard";

  return (
    <div className="min-h-screen bg-[#FAF7F3] text-[#23212A] flex flex-col justify-between selection:bg-[#FFD36D] selection:text-[#51465B] relative overflow-x-hidden font-sans">
      {/* ===================================================================== */}
      {/* AMBIENT CLAYMORPHISM DECORATIVE PASTEL BLOBS                         */}
      {/* ===================================================================== */}
      <div className="fixed -top-40 -left-40 w-96 h-96 rounded-full bg-[#51465B]/10 blur-3xl pointer-events-none" />
      <div className="fixed top-1/3 -right-40 w-96 h-96 rounded-full bg-[#FFD36D]/20 blur-3xl pointer-events-none" />
      <div className="fixed -bottom-40 left-1/3 w-96 h-96 rounded-full bg-[#F47D83]/10 blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 md:px-12 flex-1 flex flex-col">
        {/* =================================================================== */}
        {/* FLOATING HEADER                                                     */}
        {/* Top-Left: Logo Depaskan (Puzzle D + epaskan in exact vertical center)*/}
        {/* Top-Right: Floating CTA Button ("Masuk" / "Dashboard")              */}
        {/* =================================================================== */}
        <header className="pt-6 sm:pt-8 pb-4 flex items-center justify-between gap-4 relative z-30">
          {/* KIRI ATAS: Logo Depaskan */}
          <div className="flex items-center">
            <PahamiPuzzleLogo size="md" />
          </div>

          {/* TENGAH: Clean whitespace */}
          <div className="flex-1" />

          {/* KANAN ATAS: Floating CTA Button ("Masuk" / "Dashboard") */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link
                href={dashboardHref}
                className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#51465B] hover:bg-[#3D3445] text-white text-xs sm:text-sm font-extrabold shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD36D]"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-4 h-4 text-[#FFD36D] stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#51465B] hover:bg-[#3D3445] text-white text-xs sm:text-sm font-extrabold shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD36D]"
              >
                <span>Masuk</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#FFD36D] stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
              </Link>
            )}
          </div>
        </header>

        {/* =================================================================== */}
        {/* SECTION 1: HERO DUA KARTU PUZZLE (Kiri: Soal, Kanan: Materi)        */}
        {/* =================================================================== */}
        <main className="flex-1 flex flex-col justify-center py-6 sm:py-12">
          {/* Introductory Heading */}
          <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-5xl font-black text-[#23212A] tracking-tight leading-tight">
              Belajar lebih dekat.
            </h1>
            <p className="text-sm sm:text-base text-[#756F7A] mt-2 font-medium">
              Mulai dari materi atau soal yang sesuai dengan lingkungan sekitar.
            </p>
          </div>

          {/* The Two Interlocking Jigsaw Hero Puzzle Cards */}
          <PuzzleServiceCards isLoggedIn={isLoggedIn} userRole={userRole} />
        </main>

        {/* =================================================================== */}
        {/* SECTION 2: 4 LANGKAH TERSTRUKTUR (4 Ikon & 4 Teks Singkat)          */}
        {/* =================================================================== */}
        <HowItWorksSection />

        {/* =================================================================== */}
        {/* SECTION 3: CONTOH NYATA PEMBELAJARAN (2 Kartu Perbandingan Simpel)  */}
        {/* =================================================================== */}
        <ContextComparisonSection />
      </div>

      {/* ===================================================================== */}
      {/* FOOTER                                                               */}
      {/* ===================================================================== */}
      <LandingFooter />
    </div>
  );
}