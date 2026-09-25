"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileQuestion,
  BookOpen,
  Sparkles,
  ArrowRight,
  DoorOpen,
  ChevronRight,
} from "lucide-react";
import { TeacherWorkspaceShell } from "@/components/layout/teacher-workspace-shell";
import { repository } from "@/lib/db/repository";
import {
  School,
  UserProfile,
  Question,
  LearningMaterial,
  LearningRoom,
} from "@/lib/db/types";

export default function TeacherDashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [rooms, setRooms] = useState<LearningRoom[]>([]);

  useEffect(() => {
    const activeSchool = repository.getActiveSchool();
    const currentUser = repository.getCurrentUser();

    setUser(currentUser);
    setQuestions(repository.getQuestions({ schoolId: activeSchool.id }));
    setMaterials(repository.getMaterials(activeSchool.id));
    setRooms(repository.getRooms(currentUser?.id));

    // Sinkronisasi otomatis dari sesi Google Supabase jika nama belum terisi
    import("@/lib/supabase/client").then(({ createClient }) => {
      try {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user: authUser } }) => {
          if (authUser) {
            const meta = authUser.user_metadata || {};
            if (typeof window !== "undefined") {
              localStorage.setItem("pahami_v2_onboarding_completed", "true");
            }
            const googleName =
              meta.full_name ||
              meta.name ||
              meta.display_name ||
              (authUser.email ? authUser.email.split("@")[0] : null);
            if (googleName && (!currentUser.full_name || currentUser.full_name.includes("Siti Aminah"))) {
              const updated = repository.updateUserProfile({
                full_name: googleName.trim(),
                email: authUser.email || currentUser.email,
                avatar_url: meta.avatar_url || meta.picture || currentUser.avatar_url,
                schoolName: meta.school_name,
                usageMode: meta.usage_mode,
                regionId: meta.region_id,
                regionName: meta.region_name,
              });
              setUser(updated);
            }
          }
        });
      } catch {
        // Fallback
      }
    });

    const handleProfileChange = (e: any) => {
      if (e.detail) {
        setUser(e.detail);
      }
    };
    window.addEventListener("userProfileChange", handleProfileChange);
    return () => window.removeEventListener("userProfileChange", handleProfileChange);
  }, []);

  return (
    <TeacherWorkspaceShell activeGroupId="dashboard">
      <div className="h-full flex flex-col justify-between gap-4 sm:gap-5 lg:gap-6 max-w-7xl mx-auto overflow-hidden">
        {/* ====================================================================
            1. HEADER: SAMBUTAN SELAMAT DATANG (DI SAMPING KIRI)
            ==================================================================== */}
        <div className="shrink-0 flex items-center justify-between pt-1">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#23212A] tracking-tight">
              Selamat Datang, {user?.full_name || "Guru"}!
            </h1>
          </div>
        </div>

        {/* ====================================================================
            2. DUA HERO CARD KANAN KIRI (3/4 TINGGI, COMPACT & SLEEK)
            - Kiri: Soal (Warm Yellow #FFD36D, border #51465B, teks #23212A)
            - Kanan: Materi (Dark Mauve #51465B, border #FFD36D, teks putih)
            - Teks deskripsi dan badge jumlah butir/modul dihapus
            - Keduanya dilengkapi tombol Buka dan Generate AI
            ==================================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 flex-1 min-h-0 items-stretch">
          {/* ===================================================================
              CARD KIRI: SOAL (QUENTEXT)
              =================================================================== */}
          <div className="relative flex flex-col justify-between p-5 sm:p-6 lg:p-7 rounded-[28px] sm:rounded-[32px] bg-[#FFD36D] text-[#23212A] shadow-md hover:shadow-xl transition-all duration-300 border-2 border-[#51465B] overflow-hidden group">
            {/* Ambient Glow */}
            <div className="absolute -top-14 -right-14 w-40 h-40 rounded-full bg-white/40 blur-2xl pointer-events-none" />

            {/* Bagian Konten: Ikon Besar + Judul, CTA & Deskripsi dipaskan di tengah secara vertikal */}
            <div className="my-auto flex items-center gap-4 sm:gap-5 py-2">
              <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-2xl sm:rounded-3xl bg-[#51465B] text-[#FFD36D] flex items-center justify-center shadow-md group-hover:scale-105 group-hover:-rotate-1 transition-transform duration-300 shrink-0">
                <FileQuestion className="w-7 h-7 sm:w-9 sm:h-9 text-[#FFD36D] stroke-[2.4]" />
              </div>
              <div className="min-w-0 flex flex-col justify-center">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#23212A] tracking-tight leading-tight">
                  Soal
                </h2>
                <div className="text-sm sm:text-base lg:text-lg font-black text-[#51465B] mt-0.5">
                  Bikin Soal Lebih Nyata
                </div>
                <p className="text-xs sm:text-sm text-[#23212A]/85 font-medium leading-relaxed mt-1 line-clamp-2">
                  Rancang dan kelola butir soal asesmen kontekstual berbasis data BPS dan kearifan lokal sekitar murid.
                </p>
              </div>
            </div>

            {/* Tombol Aksi: Buka Bank Soal & Generate AI */}
            <div className="pt-4 border-t border-[#51465B]/20 flex items-center gap-3">
              <Link
                href="/teacher/questions"
                className="flex-1 py-3 px-5 rounded-2xl bg-[#51465B] hover:bg-[#3D3445] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all group/btn"
              >
                <span>Buka Bank Soal</span>
                <ArrowRight className="w-4 h-4 text-[#FFD36D] stroke-[2.5] group-hover/btn:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/teacher/questions/generator"
                className="py-3 px-4 sm:px-5 rounded-2xl bg-white/90 hover:bg-white text-[#23212A] border border-[#51465B]/25 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-2xs hover:shadow-xs transition-all"
                title="Generate Soal AI"
              >
                <Sparkles className="w-4 h-4 text-[#51465B]" />
                <span>Generate AI</span>
              </Link>
            </div>
          </div>

          {/* ===================================================================
              CARD KANAN: MATERI (MATTEXT)
              =================================================================== */}
          <div className="relative flex flex-col justify-between p-5 sm:p-6 lg:p-7 rounded-[28px] sm:rounded-[32px] bg-[#51465B] text-white shadow-md hover:shadow-xl transition-all duration-300 border-2 border-[#FFD36D] overflow-hidden group">
            {/* Ambient Glow */}
            <div className="absolute -top-14 -left-14 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />

            {/* Bagian Konten: Ikon Besar + Judul, CTA & Deskripsi dipaskan di tengah secara vertikal */}
            <div className="my-auto flex items-center gap-4 sm:gap-5 py-2">
              <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-2xl sm:rounded-3xl bg-[#FFD36D] text-[#51465B] flex items-center justify-center shadow-md group-hover:scale-105 group-hover:rotate-1 transition-transform duration-300 shrink-0">
                <BookOpen className="w-7 h-7 sm:w-9 sm:h-9 text-[#51465B] stroke-[2.4]" />
              </div>
              <div className="min-w-0 flex flex-col justify-center">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                  Materi
                </h2>
                <div className="text-sm sm:text-base lg:text-lg font-black text-[#FFD36D] mt-0.5">
                  Kemas Materi Lebih Dekat
                </div>
                <p className="text-xs sm:text-sm text-white/90 font-medium leading-relaxed mt-1 line-clamp-2">
                  Susun modul ajar tematik Kurikulum Merdeka yang relevan dan siap dibagikan ke ruang belajar siswa.
                </p>
              </div>
            </div>

            {/* Tombol Aksi: Buka Modul Ajar & Generate AI */}
            <div className="pt-4 border-t border-white/20 flex items-center gap-3">
              <Link
                href="/teacher/materials"
                className="flex-1 py-3 px-5 rounded-2xl bg-[#FFD36D] hover:bg-[#F5C75A] text-[#23212A] font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all group/btn"
              >
                <span>Buka Modul Ajar</span>
                <ArrowRight className="w-4 h-4 text-[#51465B] stroke-[2.5] group-hover/btn:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/teacher/materials/create?tab=ai"
                className="py-3 px-4 sm:px-5 rounded-2xl bg-white/15 hover:bg-white/25 text-white border border-white/25 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all"
                title="Generate Materi AI"
              >
                <Sparkles className="w-4 h-4 text-[#FFD36D]" />
                <span>Generate AI</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ====================================================================
            3. TIGA CARD BERSAMPINGAN DI BAWAH KEDUA CARD UTAMA
            - Card 1: Room Ujian (Ikon, Nama Fitur, Jumlah Room Ujian)
            - Card 2: Bank Soal (Ikon, Nama Fitur, Jumlah Soal)
            - Card 3: Modul Materi (Ikon, Nama Fitur, Jumlah Materi)
            ==================================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 shrink-0 pb-1">
          {/* Card 1: Room Ujian (Warna Soft Coral / Rose) */}
          <Link
            href="/teacher/rooms"
            className="p-4 sm:p-5 rounded-[24px] sm:rounded-[28px] bg-[#FEEAEB] border-2 border-[#F47D83]/40 hover:border-[#F47D83] shadow-xs hover:shadow-md transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#F47D83] text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                <DoorOpen className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#F47D83] block">
                  Akses Siswa
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-[#756F7A] truncate">
                  Room Ujian
                </h3>
                <div className="text-lg sm:text-xl lg:text-2xl font-black text-[#23212A] tracking-tight">
                  {rooms.length} <span className="text-xs font-bold text-[#756F7A]">Room Dibuat</span>
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#F47D83] group-hover:translate-x-1 transition-transform shrink-0" />
          </Link>

          {/* Card 2: Jumlah Soal (Warna Warm Yellow) */}
          <Link
            href="/teacher/questions"
            className="p-4 sm:p-5 rounded-[24px] sm:rounded-[28px] bg-[#FFF9E6] border-2 border-[#FFD36D] hover:border-[#F5C75A] shadow-xs hover:shadow-md transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#FFD36D] text-[#51465B] flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                <FileQuestion className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#B88700] block">
                  Bank Soal
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-[#756F7A] truncate">
                  Jumlah Soal
                </h3>
                <div className="text-lg sm:text-xl lg:text-2xl font-black text-[#23212A] tracking-tight">
                  {questions.length} <span className="text-xs font-bold text-[#756F7A]">Butir Soal</span>
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#51465B] group-hover:translate-x-1 transition-transform shrink-0" />
          </Link>

          {/* Card 3: Jumlah Materi (Warna Soft Dark Mauve) */}
          <Link
            href="/teacher/materials"
            className="p-4 sm:p-5 rounded-[24px] sm:rounded-[28px] bg-[#F3EFF4] border-2 border-[#51465B]/30 hover:border-[#51465B] shadow-xs hover:shadow-md transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#51465B] text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#51465B] block">
                  Modul Ajar
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-[#756F7A] truncate">
                  Jumlah Materi
                </h3>
                <div className="text-lg sm:text-xl lg:text-2xl font-black text-[#23212A] tracking-tight">
                  {materials.length} <span className="text-xs font-bold text-[#756F7A]">Modul Ajar</span>
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#51465B] group-hover:translate-x-1 transition-transform shrink-0" />
          </Link>
        </div>
      </div>
    </TeacherWorkspaceShell>
  );
}
