"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, UserCheck, ShieldCheck, Sparkles, MapPin, School, GraduationCap } from "lucide-react";
import { PahamiPuzzleLogo } from "@/components/landing/puzzle-logo";
import { PuzzleServiceCards } from "@/components/landing/puzzle-service-cards";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { ContextComparisonSection } from "@/components/landing/context-comparison-section";
import { OutputModesSection } from "@/components/landing/output-modes-section";
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

  const regions = [
    { code: "35.77", name: "Kota Madiun", desc: "Industri perkeretaapian PT INKA & kuliner pecel" },
    { code: "35.19", name: "Kabupaten Madiun", desc: "Sentra porang Caruban & Waduk Bening Widas" },
    { code: "35.21", name: "Kabupaten Ngawi", desc: "Benteng Pendem Van den Bosch & Trinil Paleolitikum" },
    { code: "35.20", name: "Kabupaten Magetan", desc: "Telaga Sarangan, Sentra Kulit & Lereng Lawu" },
    { code: "35.02", name: "Kabupaten Ponorogo", desc: "Seni Reog Ponorogo & Sapi Perah Pudak" },
    { code: "35.01", name: "Kabupaten Pacitan", desc: "Gua Gong, Pantai Klayar & Perikanan Tamperan" },
    { code: "33.74", name: "Kota Semarang", desc: "Kota Lama, Pelabuhan Tanjung Emas & Lawang Sewu" },
  ];

  const handleQuickDemo = (role: "TEACHER" | "STUDENT") => {
    repository.setCurrentRole(role);
  };

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
        {/* FLOATING HEADER (Section 6)                                         */}
        {/* Top-Left: Logo PAHAMI (Letter D Puzzle)                             */}
        {/* Top-Right: CTA Button ("Masuk" / "Dashboard")                       */}
        {/* Center: COMPLETELY EMPTY (Zero conventional nav items)              */}
        {/* =================================================================== */}
        <header className="pt-6 sm:pt-8 pb-4 flex items-center justify-between gap-4 relative z-30">
          {/* KIRI ATAS: Logo PAHAMI */}
          <div className="flex items-center">
            <PahamiPuzzleLogo size="md" />
          </div>

          {/* TENGAH: Kosong sesuai instruksi spesifikasi Section 6 */}
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
        {/* HERO SECTION: DUA KARTU PUZZLE MELAYANG (Section 7, 8, 9, 10)       */}
        {/* =================================================================== */}
        <main className="flex-1 flex flex-col justify-center py-6 sm:py-10">
          {/* Introductory Heading */}
          <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-5xl font-black text-[#23212A] tracking-tight leading-tight">
              Belajar lebih dekat.
            </h1>
            <p className="text-sm sm:text-base text-[#756F7A] mt-2 font-medium">
              Mulai dari materi atau soal yang sesuai dengan lingkungan sekitar.
            </p>
          </div>

          {/* The Two Interlocking Hero Puzzle Cards */}
          <PuzzleServiceCards isLoggedIn={isLoggedIn} userRole={userRole} />

          {/* Quick Evaluator / Judge Demo Bar */}
          <div className="w-full max-w-5xl mx-auto mt-4 mb-2 p-3 sm:p-3.5 rounded-2xl bg-white/70 backdrop-blur-xs border border-[#E9E5E8] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#51465B]">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#51465B] shrink-0" />
              <span className="font-extrabold">Akses Pengujian Cepat Juri:</span>
              <span className="text-[#756F7A] hidden sm:inline">
                Evaluasi langsung fitur tanpa akun Google eksternal
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/teacher/dashboard"
                onClick={() => handleQuickDemo("TEACHER")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#51465B] text-white font-bold hover:bg-[#3D3445] transition-colors shadow-2xs"
              >
                <School className="w-3.5 h-3.5 text-[#FFD36D]" />
                <span>Demo Guru</span>
              </Link>
              <Link
                href="/student/dashboard"
                onClick={() => handleQuickDemo("STUDENT")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E9E5E8] text-[#51465B] font-bold hover:border-[#51465B] transition-colors shadow-2xs"
              >
                <GraduationCap className="w-3.5 h-3.5 text-[#F47D83]" />
                <span>Demo Murid</span>
              </Link>
            </div>
          </div>
        </main>

        {/* =================================================================== */}
        {/* SECTION 1: BAGAIMANA PAHAMI BEKERJA? (Section 12.1)                 */}
        {/* =================================================================== */}
        <HowItWorksSection />

        {/* =================================================================== */}
        {/* SECTION 2: KONTEKS YANG DEKAT DENGAN SISWA (Section 12.2)           */}
        {/* =================================================================== */}
        <ContextComparisonSection />

        {/* =================================================================== */}
        {/* SECTION 3: DUA CARA MENGGUNAKAN HASIL (Section 12.3)                */}
        {/* =================================================================== */}
        <OutputModesSection isLoggedIn={isLoggedIn} />

        {/* =================================================================== */}
        {/* SECTION 4: REGIONAL KNOWLEDGE BASE FOCUS SHOWCASE                   */}
        {/* =================================================================== */}
        <section className="w-full max-w-5xl mx-auto py-10 sm:py-14 border-t border-[#E9E5E8]/80">
          <div className="p-7 sm:p-9 rounded-[32px] bg-white border border-[#E9E5E8] shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#51465B] mb-1">
                  <MapPin className="w-4 h-4 text-[#F47D83]" />
                  <span className="uppercase tracking-wider">Cakupan Wilayah Terverifikasi</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-[#23212A]">
                  Karesidenan Madiun & Kota Semarang
                </h3>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shrink-0">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>22 Entitas Faktual Terverifikasi BPS</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {regions.map((reg) => (
                <div
                  key={reg.code}
                  className="p-3.5 rounded-2xl bg-[#FAF7F3] border border-[#E9E5E8] hover:border-[#51465B]/30 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-xs sm:text-sm text-[#23212A]">{reg.name}</span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white text-[#756F7A] border border-[#E9E5E8]">
                      {reg.code}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#756F7A] line-clamp-2 leading-relaxed">{reg.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ===================================================================== */}
      {/* FOOTER (Section 13)                                                  */}
      {/* ===================================================================== */}
      <LandingFooter />
    </div>
  );
}