"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Brain,
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
  FileCheck,
  GraduationCap,
  Layers,
  Settings,
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
      <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto pb-10">
        {/* ====================================================================
            1. HEADER: SAMBUTAN SELAMAT DATANG NAMA USER (DI SAMPING KIRI)
            Teks tanggal dan semester telah dihapus sesuai instruksi
            ==================================================================== */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#23212A] tracking-tight">
              Selamat Datang, {user?.full_name || "Guru"}!
            </h1>
          </div>
        </div>

        {/* ====================================================================
            2. DUA CARD KANAN KIRI BERBENTUK AGAK PERSEGI PANJANG
            Sebelah Kiri: Soal | Sebelah Kanan: Materi
            ==================================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {/* Card Kiri: Soal */}
          <div className="rounded-[24px] sm:rounded-[28px] bg-white border border-[#E9E5E8] p-5 sm:p-6 lg:p-7 shadow-xs hover:shadow-md hover:border-[#FFD36D] transition-all flex flex-col justify-between min-h-[180px] relative overflow-hidden group">
            <div>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFD36D] flex items-center justify-center text-[#51465B] shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                    <Brain className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#756F7A] block">
                      Quentext
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-[#23212A] tracking-tight group-hover:text-[#51465B] transition-colors">
                      Soal
                    </h2>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#FAF7F3] border border-[#E9E5E8] text-[#51465B] font-extrabold text-xs shrink-0">
                  {questions.length} Butir Soal
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#756F7A] font-medium leading-relaxed">
                Bank butir asesmen dan latihan soal kontekstual berbasis data BPS serta realitas lingkungan peserta didik.
              </p>
            </div>

            <div className="flex items-center gap-2.5 pt-4 border-t border-[#E9E5E8]/60 mt-4">
              <Link
                href="/teacher/questions"
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#51465B] hover:bg-[#3E3547] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <span>Buka Bank Soal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/teacher/questions/generator"
                className="py-2.5 px-3.5 rounded-xl bg-[#FAF7F3] hover:bg-[#FFD36D]/30 border border-[#E9E5E8] text-[#23212A] font-bold text-xs flex items-center gap-1.5 transition-colors"
                title="Buat Soal Baru dengan Generator AI"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#51465B]" />
                <span>Generator AI</span>
              </Link>
            </div>
          </div>

          {/* Card Kanan: Materi */}
          <div className="rounded-[24px] sm:rounded-[28px] bg-white border border-[#E9E5E8] p-5 sm:p-6 lg:p-7 shadow-xs hover:shadow-md hover:border-[#51465B]/40 transition-all flex flex-col justify-between min-h-[180px] relative overflow-hidden group">
            <div>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#51465B] flex items-center justify-center text-white shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                    <BookOpen className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#756F7A] block">
                      Mattext
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-[#23212A] tracking-tight group-hover:text-[#51465B] transition-colors">
                      Materi
                    </h2>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#FAF7F3] border border-[#E9E5E8] text-[#51465B] font-extrabold text-xs shrink-0">
                  {materials.length} Modul Ajar
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#756F7A] font-medium leading-relaxed">
                Modul ajar tematik Kurikulum Merdeka yang siap diajarkan serta dibagikan langsung ke siswa via Ruang Belajar.
              </p>
            </div>

            <div className="flex items-center gap-2.5 pt-4 border-t border-[#E9E5E8]/60 mt-4">
              <Link
                href="/teacher/materials"
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#51465B] hover:bg-[#3E3547] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <span>Buka Modul Ajar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/teacher/materials/new"
                className="py-2.5 px-3.5 rounded-xl bg-[#FAF7F3] hover:bg-[#E8B2B7]/40 border border-[#E9E5E8] text-[#23212A] font-bold text-xs flex items-center gap-1.5 transition-colors"
                title="Buat Modul Ajar Baru"
              >
                <Plus className="w-3.5 h-3.5 text-[#51465B]" />
                <span>Tambah Baru</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ====================================================================
            3. KONTEN LANJUTAN: RINGKASAN AKTIVITAS & METRIK KELAS
            Rapi, sesuai tema, tanpa preview soal/materi
            ==================================================================== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Metric 1: Rombel & Siswa */}
          <Link
            href="/teacher/classes"
            className="p-4 sm:p-5 rounded-[22px] bg-white border border-[#E9E5E8] hover:border-[#51465B]/30 hover:shadow-xs transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-[#756F7A]">Kelas & Siswa</span>
              <div className="w-8 h-8 rounded-xl bg-[#FAF7F3] group-hover:bg-[#51465B]/10 flex items-center justify-center text-[#51465B] transition-colors">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-[#23212A] tracking-tight">
              {classes.length} <span className="text-xs font-semibold text-[#756F7A]">Kelas</span>
            </div>
            <div className="text-[11px] text-[#756F7A] font-medium mt-1 truncate">
              {totalStudents} siswa terdaftar
            </div>
          </Link>

          {/* Metric 2: Ruang Belajar (Room) */}
          <Link
            href="/teacher/rooms"
            className="p-4 sm:p-5 rounded-[22px] bg-white border border-[#E9E5E8] hover:border-[#51465B]/30 hover:shadow-xs transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-[#756F7A]">Ruang Belajar</span>
              <div className="w-8 h-8 rounded-xl bg-[#FAF7F3] group-hover:bg-[#51465B]/10 flex items-center justify-center text-[#51465B] transition-colors">
                <DoorOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-[#23212A] tracking-tight">
              {rooms.length} <span className="text-xs font-semibold text-[#756F7A]">Room</span>
            </div>
            <div className="text-[11px] text-[#756F7A] font-medium mt-1 truncate">
              Akses cepat tanpa login
            </div>
          </Link>

          {/* Metric 3: Ujian & Evaluasi */}
          <Link
            href="/teacher/examinations"
            className="p-4 sm:p-5 rounded-[22px] bg-white border border-[#E9E5E8] hover:border-[#51465B]/30 hover:shadow-xs transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-[#756F7A]">Paket Asesmen</span>
              <div className="w-8 h-8 rounded-xl bg-[#FAF7F3] group-hover:bg-[#51465B]/10 flex items-center justify-center text-[#51465B] transition-colors">
                <ClipboardCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-[#23212A] tracking-tight">
              {exams.length} <span className="text-xs font-semibold text-[#756F7A]">Ujian</span>
            </div>
            <div className="text-[11px] text-[#756F7A] font-medium mt-1 truncate">
              Penilaian & evaluasi hasil
            </div>
          </Link>

          {/* Metric 4: Konteks BPS Daerah */}
          <Link
            href="/teacher/settings"
            className="p-4 sm:p-5 rounded-[22px] bg-white border border-[#E9E5E8] hover:border-[#51465B]/30 hover:shadow-xs transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-[#756F7A]">Konteks Daerah</span>
              <div className="w-8 h-8 rounded-xl bg-[#FAF7F3] group-hover:bg-[#51465B]/10 flex items-center justify-center text-[#51465B] transition-colors">
                <MapPin className="w-4 h-4 text-[#F47D83]" />
              </div>
            </div>
            <div className="text-base sm:text-lg font-black text-[#23212A] tracking-tight truncate">
              {school?.region_name || "Kota Madiun"}
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-1 truncate flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Data BPS Terhubung
            </div>
          </Link>
        </div>

        {/* ====================================================================
            4. DUA KOLOM SECTION BAWAH:
            Kiri: Ruang Belajar Siswa Terkini (Daftar Akses, Kode & Pengunjung)
            Kanan: Alat Cepat Pengajar & Panduan Pembelajaran Kontekstual
            (TIDAK ADA PREVIEW DOKUMEN / KONTEN SOAL / MATERI DI SINI)
            ==================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Kolom Kiri: Ruang Belajar Siswa Aktif (7 Cols) */}
          <div className="lg:col-span-7 rounded-[26px] sm:rounded-[30px] bg-white border border-[#E9E5E8] p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E9E5E8]/80 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-[#23212A] tracking-tight">
                  Ruang Belajar Siswa Aktif
                </h3>
                <p className="text-xs text-[#756F7A] font-medium mt-0.5">
                  Bagikan tautan atau kode room berikut untuk akses instan murid
                </p>
              </div>

              <Link
                href="/teacher/rooms"
                className="px-3 py-1.5 rounded-xl bg-[#FAF7F3] hover:bg-[#51465B] text-[#51465B] hover:text-white font-bold text-xs transition-colors shrink-0 flex items-center gap-1"
              >
                <span>Kelola Room</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* List Ruang Belajar (Kode, Subjek, Akses) */}
            <div className="space-y-3">
              {rooms.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#756F7A] font-medium">
                  Belum ada ruang belajar aktif. Buat ruang belajar untuk membagikan materi atau latihan ke siswa.
                </div>
              ) : (
                rooms.slice(0, 4).map((room) => (
                  <div
                    key={room.id}
                    className="p-3.5 sm:p-4 rounded-2xl bg-[#FAF7F3] border border-[#E9E5E8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#51465B]/30 transition-colors"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                            room.type === "question"
                              ? "bg-[#FFD36D]/40 text-[#51465B]"
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
                        className="py-1.5 px-3 rounded-xl bg-white border border-[#E9E5E8] hover:bg-[#FAF7F3] text-xs font-mono font-bold text-[#51465B] flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        title="Klik untuk menyalin kode room"
                      >
                        {copiedCode === room.code ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700 font-sans text-[11px]">Tersalin</span>
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

          {/* Kolom Kanan: Akses Pintas Alat Pengajar & Info Konteks (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Box Alat Pengajar Cepat */}
            <div className="rounded-[26px] sm:rounded-[30px] bg-white border border-[#E9E5E8] p-5 sm:p-6 shadow-xs space-y-3.5">
              <div>
                <h3 className="text-base sm:text-lg font-black text-[#23212A] tracking-tight">
                  Alat Kerja Pengajar
                </h3>
                <p className="text-xs text-[#756F7A] font-medium mt-0.5">
                  Akses instan ke fasilitas otomasi dan kurasi bahan ajar
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
                {/* Tool 1: Review Essay AI */}
                <Link
                  href="/teacher/examinations/review-essay"
                  className="p-3 rounded-2xl bg-[#FAF7F3] border border-[#E9E5E8] hover:border-[#51465B]/30 hover:bg-white flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#23212A] group-hover:text-[#51465B] transition-colors truncate">
                        Koreksi Essay AI
                      </div>
                      <div className="text-[11px] text-[#756F7A] truncate">
                        Asistensi penilaian jawaban uraian
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#756F7A] group-hover:translate-x-0.5 transition-transform shrink-0" />
                </Link>

                {/* Tool 2: Scan OCR */}
                <Link
                  href="/teacher/questions/scan"
                  className="p-3 rounded-2xl bg-[#FAF7F3] border border-[#E9E5E8] hover:border-[#51465B]/30 hover:bg-white flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#23212A] group-hover:text-[#51465B] transition-colors truncate">
                        Pindai Dokumen Soal
                      </div>
                      <div className="text-[11px] text-[#756F7A] truncate">
                        Digitalisasi naskah kertas ke bank soal
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#756F7A] group-hover:translate-x-0.5 transition-transform shrink-0" />
                </Link>

                {/* Tool 3: Format Cetak */}
                <Link
                  href="/teacher/print"
                  className="p-3 rounded-2xl bg-[#FAF7F3] border border-[#E9E5E8] hover:border-[#51465B]/30 hover:bg-white flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                      <Printer className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#23212A] group-hover:text-[#51465B] transition-colors truncate">
                        Cetak Modul & Naskah
                      </div>
                      <div className="text-[11px] text-[#756F7A] truncate">
                        Format siap print & lembar jawaban
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#756F7A] group-hover:translate-x-0.5 transition-transform shrink-0" />
                </Link>

                {/* Tool 4: Manajemen Rombel */}
                <Link
                  href="/teacher/classes"
                  className="p-3 rounded-2xl bg-[#FAF7F3] border border-[#E9E5E8] hover:border-[#51465B]/30 hover:bg-white flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#23212A] group-hover:text-[#51465B] transition-colors truncate">
                        Manajemen Kelas
                      </div>
                      <div className="text-[11px] text-[#756F7A] truncate">
                        Kode undangan & daftar murid aktif
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#756F7A] group-hover:translate-x-0.5 transition-transform shrink-0" />
                </Link>
              </div>
            </div>

            {/* Banner Informasi Pembelajaran Kontekstual */}
            <div className="p-4 sm:p-5 rounded-[24px] bg-[#51465B] text-white shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#FFD36D]">
                  Prinsip Kurikulum Merdeka
                </span>
                <MapPin className="w-4 h-4 text-[#F47D83]" />
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-white">
                Fokus Wilayah: {school?.region_name || "Kota Madiun"}
              </h4>
              <p className="text-[11px] text-white/80 leading-relaxed font-normal">
                Materi dan butir soal dirancang mengaitkan konsep pembelajaran dengan komoditas lokal, budaya, dan data statistik riil di daerah siswa.
              </p>
            </div>
          </div>
        </div>
      </div>
    </TeacherWorkspaceShell>
  );
}
