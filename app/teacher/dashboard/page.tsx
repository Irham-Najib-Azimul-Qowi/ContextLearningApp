"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileQuestion,
  BookOpen,
  Sparkles,
  Plus,
  ArrowRight,
  Copy,
  Check,
  DoorOpen,
  Users,
  ClipboardCheck,
  Printer,
  Camera,
  MapPin,
  ExternalLink,
  ChevronRight,
  GraduationCap,
  Sparkle,
} from "lucide-react";
import { TeacherWorkspaceShell } from "@/components/layout/teacher-workspace-shell";
import { repository } from "@/lib/db/repository";
import {
  School,
  UserProfile,
  ClassRoom,
  Question,
  LearningMaterial,
  Exam,
  LearningRoom,
} from "@/lib/db/types";

export default function TeacherDashboardPage() {
  const [school, setSchool] = useState<School | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [rooms, setRooms] = useState<LearningRoom[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const activeSchool = repository.getActiveSchool();
    const currentUser = repository.getCurrentUser();

    setSchool(activeSchool);
    setUser(currentUser);
    setQuestions(repository.getQuestions({ schoolId: activeSchool.id }));
    setMaterials(repository.getMaterials(activeSchool.id));
    setClasses(repository.getClasses(activeSchool.id));
    setExams(repository.getExams(activeSchool.id));
    setRooms(repository.getRooms(currentUser?.id));
  }, []);

  const handleCopyCode = (code: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  const totalStudents = classes.reduce(
    (sum, c) => sum + (c.student_count || 0),
    0
  );

  return (
    <TeacherWorkspaceShell activeGroupId="dashboard">
      <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto pb-12">
        {/* ====================================================================
            1. HEADER: SAMBUTAN SELAMAT DATANG NAMA USER (DI SAMPING KIRI)
            ==================================================================== */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#23212A] tracking-tight">
              Selamat Datang, {user?.full_name || "Guru"}!
            </h1>
          </div>
        </div>

        {/* ====================================================================
            2. DUA HERO CARD KANAN KIRI SESUAI WARNA KESEPAKATAN
            - Kiri: Soal (Warm Yellow #FFD36D, border #51465B, teks #23212A)
            - Kanan: Materi (Dark Mauve #51465B, border #FFD36D, teks putih)
            - Ikon besar, CTA teks jelas, tombol aksi jelas & tegas
            ==================================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          {/* ===================================================================
              CARD KIRI: SOAL (QUENTEXT) - WARM YELLOW #FFD36D
              =================================================================== */}
          <div className="relative flex flex-col justify-between p-6 sm:p-8 lg:p-9 rounded-[32px] sm:rounded-[36px] bg-[#FFD36D] text-[#23212A] shadow-md hover:shadow-xl transition-all duration-300 border-2 border-[#51465B] overflow-hidden group">
            {/* Ambient Glow */}
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/40 blur-2xl pointer-events-none" />

            <div>
              {/* Baris Atas: Ikon Besar & Badge Jumlah Soal */}
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-[#51465B] text-[#FFD36D] flex items-center justify-center shadow-md group-hover:scale-105 group-hover:-rotate-1 transition-transform duration-300 shrink-0">
                  <FileQuestion className="w-8 h-8 sm:w-10 sm:h-10 text-[#FFD36D] stroke-[2.4]" />
                </div>

                <div className="px-3.5 py-1.5 rounded-full bg-[#51465B]/15 border border-[#51465B]/20 text-[#51465B] font-black text-xs shrink-0 tracking-wide">
                  {questions.length} Butir Soal Tersedia
                </div>
              </div>

              {/* Judul & CTA Teks Jelas */}
              <div className="space-y-1.5 mb-4">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#51465B]/80 block">
                  Quentext • Bank Soal
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#23212A] tracking-tight">
                  Soal
                </h2>
                <div className="text-sm sm:text-base font-black text-[#51465B] pt-0.5">
                  Bikin Soal Lebih Nyata
                </div>
                <p className="text-xs sm:text-sm text-[#23212A]/85 font-medium leading-relaxed pt-1">
                  Koleksi butir asesmen pilihan ganda dan uraian yang dikontekstualisasikan langsung dengan data statistik BPS serta kearifan lokal daerah siswa.
                </p>
              </div>
            </div>

            {/* Tombol Aksi Jelas & Proporsional */}
            <div className="pt-5 border-t border-[#51465B]/20 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                href="/teacher/questions"
                className="flex-1 py-3 px-5 rounded-2xl bg-[#51465B] hover:bg-[#3D3445] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all group/btn"
              >
                <span>Buka Bank Soal</span>
                <ArrowRight className="w-4 h-4 text-[#FFD36D] stroke-[2.5] group-hover/btn:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/teacher/questions/generator"
                className="py-3 px-4 rounded-2xl bg-white/90 hover:bg-white text-[#23212A] border border-[#51465B]/25 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-2xs hover:shadow-xs transition-all"
                title="Buat Butir Soal Baru dengan Generator AI"
              >
                <Sparkles className="w-4 h-4 text-[#51465B]" />
                <span>Generator AI</span>
              </Link>
            </div>
          </div>

          {/* ===================================================================
              CARD KANAN: MATERI (MATTEXT) - DARK MAUVE #51465B
              =================================================================== */}
          <div className="relative flex flex-col justify-between p-6 sm:p-8 lg:p-9 rounded-[32px] sm:rounded-[36px] bg-[#51465B] text-white shadow-md hover:shadow-xl transition-all duration-300 border-2 border-[#FFD36D] overflow-hidden group">
            {/* Ambient Glow */}
            <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />

            <div>
              {/* Baris Atas: Ikon Besar & Badge Jumlah Materi */}
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-[#FFD36D] text-[#51465B] flex items-center justify-center shadow-md group-hover:scale-105 group-hover:rotate-1 transition-transform duration-300 shrink-0">
                  <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-[#51465B] stroke-[2.4]" />
                </div>

                <div className="px-3.5 py-1.5 rounded-full bg-white/15 border border-[#FFD36D]/30 text-[#FFD36D] font-black text-xs shrink-0 tracking-wide">
                  {materials.length} Modul Ajar Tersedia
                </div>
              </div>

              {/* Judul & CTA Teks Jelas */}
              <div className="space-y-1.5 mb-4">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#FFD36D] block">
                  Mattext • Modul Ajar
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                  Materi
                </h2>
                <div className="text-sm sm:text-base font-black text-[#FFD36D] pt-0.5">
                  Kemas Materi Lebih Dekat
                </div>
                <p className="text-xs sm:text-sm text-white/90 font-medium leading-relaxed pt-1">
                  Modul pembelajaran tematik Kurikulum Merdeka yang siap didistribusikan langsung ke siswa melalui Ruang Belajar atau diunduh untuk pembelajaran tatap muka.
                </p>
              </div>
            </div>

            {/* Tombol Aksi Jelas & Proporsional */}
            <div className="pt-5 border-t border-white/20 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                href="/teacher/materials"
                className="flex-1 py-3 px-5 rounded-2xl bg-[#FFD36D] hover:bg-[#F5C75A] text-[#23212A] font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all group/btn"
              >
                <span>Buka Modul Ajar</span>
                <ArrowRight className="w-4 h-4 text-[#51465B] stroke-[2.5] group-hover/btn:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/teacher/materials/new"
                className="py-3 px-4 rounded-2xl bg-white/15 hover:bg-white/25 text-white border border-white/25 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
                title="Buat Modul Ajar Baru"
              >
                <Plus className="w-4 h-4 text-[#FFD36D]" />
                <span>Tambah Baru</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ====================================================================
            3. KONTEN DIBAWAHNYA: RINGKASAN METRIK AKTIVITAS KELAS (RAPI & TERATUR)
            ==================================================================== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card Metrik 1: Kelas & Siswa */}
          <Link
            href="/teacher/classes"
            className="p-5 rounded-[24px] bg-white border border-[#E9E5E8] hover:border-[#51465B]/30 hover:shadow-sm transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#756F7A]">
                Rombel Kelas
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#FAF7F3] group-hover:bg-[#51465B]/10 flex items-center justify-center text-[#51465B] transition-colors">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#23212A] tracking-tight">
                {classes.length} <span className="text-sm font-bold text-[#756F7A]">Kelas</span>
              </div>
              <div className="text-xs text-[#756F7A] font-medium mt-1">
                {totalStudents} siswa terdaftar aktif
              </div>
            </div>
          </Link>

          {/* Card Metrik 2: Ruang Belajar */}
          <Link
            href="/teacher/rooms"
            className="p-5 rounded-[24px] bg-white border border-[#E9E5E8] hover:border-[#51465B]/30 hover:shadow-sm transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#756F7A]">
                Ruang Belajar
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#FAF7F3] group-hover:bg-[#51465B]/10 flex items-center justify-center text-[#51465B] transition-colors">
                <DoorOpen className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#23212A] tracking-tight">
                {rooms.length} <span className="text-sm font-bold text-[#756F7A]">Room</span>
              </div>
              <div className="text-xs text-[#756F7A] font-medium mt-1">
                Akses cepat murid tanpa login
              </div>
            </div>
          </Link>

          {/* Card Metrik 3: Paket Ujian */}
          <Link
            href="/teacher/examinations"
            className="p-5 rounded-[24px] bg-white border border-[#E9E5E8] hover:border-[#51465B]/30 hover:shadow-sm transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#756F7A]">
                Paket Ujian
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#FAF7F3] group-hover:bg-[#51465B]/10 flex items-center justify-center text-[#51465B] transition-colors">
                <ClipboardCheck className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#23212A] tracking-tight">
                {exams.length} <span className="text-sm font-bold text-[#756F7A]">Ujian</span>
              </div>
              <div className="text-xs text-[#756F7A] font-medium mt-1">
                Evaluasi & riwayat skor
              </div>
            </div>
          </Link>

          {/* Card Metrik 4: Konteks BPS */}
          <Link
            href="/teacher/settings"
            className="p-5 rounded-[24px] bg-white border border-[#E9E5E8] hover:border-[#51465B]/30 hover:shadow-sm transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#756F7A]">
                Konteks Daerah
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#FAF7F3] group-hover:bg-[#51465B]/10 flex items-center justify-center text-[#51465B] transition-colors">
                <MapPin className="w-4 h-4 text-[#F47D83]" />
              </div>
            </div>
            <div>
              <div className="text-base sm:text-lg font-black text-[#23212A] tracking-tight truncate">
                {school?.region_name || "Kota Madiun"}
              </div>
              <div className="text-xs text-emerald-700 font-bold mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Data BPS Terhubung
              </div>
            </div>
          </Link>
        </div>

        {/* ====================================================================
            4. DUA KOLOM SECTION BAWAH (RAPI & TERORGANISIR, TANPA PREVIEW DOKUMEN)
            - Kiri: Ruang Belajar Siswa Aktif (Kode Room & Tautan Cepat)
            - Kanan: Alat Kerja Pengajar & Info Konteks
            ==================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Kolom Kiri: Ruang Belajar Siswa Aktif (7 Cols) */}
          <div className="lg:col-span-7 rounded-[28px] sm:rounded-[32px] bg-white border border-[#E9E5E8] p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E9E5E8] pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-[#23212A] tracking-tight">
                  Ruang Belajar Siswa Aktif
                </h3>
                <p className="text-xs text-[#756F7A] font-medium mt-0.5">
                  Bagikan tautan atau kode room berikut untuk akses langsung murid
                </p>
              </div>

              <Link
                href="/teacher/rooms"
                className="px-3.5 py-1.5 rounded-xl bg-[#FAF7F3] hover:bg-[#51465B] text-[#51465B] hover:text-white font-bold text-xs transition-colors shrink-0 flex items-center gap-1"
              >
                <span>Lihat Semua</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* List Ruang Belajar */}
            <div className="space-y-3 pt-1">
              {rooms.length === 0 ? (
                <div className="py-10 text-center text-xs text-[#756F7A] font-medium">
                  Belum ada ruang belajar aktif. Buat ruang belajar untuk membagikan modul atau latihan ke siswa.
                </div>
              ) : (
                rooms.slice(0, 4).map((room) => (
                  <div
                    key={room.id}
                    className="p-4 rounded-2xl bg-[#FAF7F3] border border-[#E9E5E8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#51465B]/30 hover:bg-white transition-all"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            room.type === "question"
                              ? "bg-[#FFD36D] text-[#23212A]"
                              : "bg-[#51465B] text-white"
                          }`}
                        >
                          {room.type === "question" ? "Latihan Soal" : "Modul Ajar"}
                        </span>
                        <span className="text-[11px] font-bold text-[#756F7A]">
                          {room.subject} • Kelas {room.grade} SD
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#23212A] truncate">
                        {room.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleCopyCode(room.code)}
                        className="py-1.5 px-3 rounded-xl bg-white border border-[#E9E5E8] hover:bg-[#FAF7F3] text-xs font-mono font-bold text-[#51465B] flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                        title="Klik untuk menyalin kode room"
                      >
                        {copiedCode === room.code ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700 font-sans text-[11px] font-bold">Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-[#756F7A]" />
                            <span>{room.code}</span>
                          </>
                        )}
                      </button>

                      <Link
                        href={`/room/${room.code}`}
                        target="_blank"
                        className="p-2 rounded-xl bg-white border border-[#E9E5E8] hover:bg-[#51465B] text-[#51465B] hover:text-white transition-colors cursor-pointer"
                        title="Buka Ruang Belajar di tab baru"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Kolom Kanan: Alat Kerja & Info Wilayah (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Box Alat Kerja Pengajar */}
            <div className="rounded-[28px] sm:rounded-[32px] bg-white border border-[#E9E5E8] p-6 sm:p-7 shadow-xs space-y-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-[#23212A] tracking-tight">
                  Alat Kerja Pengajar
                </h3>
                <p className="text-xs text-[#756F7A] font-medium mt-0.5">
                  Fasilitas otomasi dan manajemen bahan ajar
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {/* Tool 1: Review Essay AI */}
                <Link
                  href="/teacher/examinations/review-essay"
                  className="p-3.5 rounded-2xl bg-[#FAF7F3] border border-[#E9E5E8] hover:border-[#51465B]/30 hover:bg-white flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-[#23212A] group-hover:text-[#51465B] transition-colors truncate">
                        Koreksi Essay AI
                      </div>
                      <div className="text-[11px] text-[#756F7A] truncate">
                        Asistensi evaluasi jawaban esai otomatis
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#756F7A] group-hover:translate-x-0.5 transition-transform shrink-0" />
                </Link>

                {/* Tool 2: Scan OCR */}
                <Link
                  href="/teacher/questions/scan"
                  className="p-3.5 rounded-2xl bg-[#FAF7F3] border border-[#E9E5E8] hover:border-[#51465B]/30 hover:bg-white flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-[#23212A] group-hover:text-[#51465B] transition-colors truncate">
                        Pindai Dokumen Soal
                      </div>
                      <div className="text-[11px] text-[#756F7A] truncate">
                        Digitalisasi naskah cetak ke bank soal
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#756F7A] group-hover:translate-x-0.5 transition-transform shrink-0" />
                </Link>

                {/* Tool 3: Format Cetak */}
                <Link
                  href="/teacher/print"
                  className="p-3.5 rounded-2xl bg-[#FAF7F3] border border-[#E9E5E8] hover:border-[#51465B]/30 hover:bg-white flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                      <Printer className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-[#23212A] group-hover:text-[#51465B] transition-colors truncate">
                        Cetak Modul & Naskah
                      </div>
                      <div className="text-[11px] text-[#756F7A] truncate">
                        Format siap print A4 & lembar siswa
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#756F7A] group-hover:translate-x-0.5 transition-transform shrink-0" />
                </Link>

                {/* Tool 4: Manajemen Rombel */}
                <Link
                  href="/teacher/classes"
                  className="p-3.5 rounded-2xl bg-[#FAF7F3] border border-[#E9E5E8] hover:border-[#51465B]/30 hover:bg-white flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-[#23212A] group-hover:text-[#51465B] transition-colors truncate">
                        Manajemen Kelas
                      </div>
                      <div className="text-[11px] text-[#756F7A] truncate">
                        Kode kelas & daftar murid binaan
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#756F7A] group-hover:translate-x-0.5 transition-transform shrink-0" />
                </Link>
              </div>
            </div>

            {/* Banner Konteks Wilayah BPS */}
            <div className="p-5 rounded-[26px] bg-[#51465B] text-white shadow-xs space-y-2 border border-[#51465B]/60">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#FFD36D]">
                  Konteks Pembelajaran Aktif
                </span>
                <MapPin className="w-4 h-4 text-[#F47D83]" />
              </div>
              <h4 className="text-sm font-black text-white">
                Wilayah: {school?.region_name || "Kota Madiun"}
              </h4>
              <p className="text-[11px] text-white/80 leading-relaxed font-normal">
                Materi dan butir soal dirancang mengaitkan konsep kurikulum dengan komoditas lokal, industri, dan data statistik riil daerah peserta didik.
              </p>
            </div>
          </div>
        </div>
      </div>
    </TeacherWorkspaceShell>
  );
}
