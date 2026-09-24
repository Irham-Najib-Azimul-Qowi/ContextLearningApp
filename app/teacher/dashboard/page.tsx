"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  BookOpen,
  Brain,
  ClipboardCheck,
  Plus,
  ArrowRight,
  School as SchoolIcon,
  CheckCircle2,
  Clock,
  FileText,
  Printer,
  MapPin,
  Eye,
  Layers,
  Image as ImageIcon,
} from "lucide-react";
import { TeacherWorkspaceShell } from "@/components/layout/teacher-workspace-shell";
import { repository } from "@/lib/db/repository";
import { School, UserProfile, ClassRoom, Question, LearningMaterial, Exam, ExamAttempt } from "@/lib/db/types";

export default function TeacherDashboardPage() {
  const [school, setSchool] = useState<School | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [allSchools, setAllSchools] = useState<School[]>([]);

  useEffect(() => {
    const activeSchool = repository.getActiveSchool();
    setSchool(activeSchool);
    setUser(repository.getCurrentUser());
    setClasses(repository.getClasses(activeSchool.id));
    setQuestions(repository.getQuestions({ schoolId: activeSchool.id }));
    setMaterials(repository.getMaterials(activeSchool.id));
    setExams(repository.getExams(activeSchool.id));
    setAttempts(repository.getAttempts());
    setAllSchools(repository.getSchools());
  }, []);

  const handleSwitchSchool = (newSchoolId: string) => {
    repository.setActiveSchoolId(newSchoolId);
    const newSchool = repository.getActiveSchool();
    setSchool(newSchool);
    setClasses(repository.getClasses(newSchool.id));
    setQuestions(repository.getQuestions({ schoolId: newSchool.id }));
    setMaterials(repository.getMaterials(newSchool.id));
    setExams(repository.getExams(newSchool.id));
  };

  const pendingEssayCount = attempts.filter((a) => a.status === "submitted").length;
  const contextualizedQuestionsCount = questions.filter((q) => q.is_contextualized).length;

  const todayDateFormatted = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <TeacherWorkspaceShell activeGroupId="dashboard">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ====================================================================
            MAIN CENTER COLUMN (8 COLS ON DESKTOP)
            ==================================================================== */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header Greeting with Date */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#23212A] tracking-tight">
                Selamat Datang, {user?.full_name?.split(",")[0] || "Bapak/Ibu Guru"}!
              </h1>
              <p className="text-xs text-[#756F7A] font-semibold mt-1">
                {todayDateFormatted} &bull; Semester Ganjil TA 2026/2027
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-white border border-[#E9E5E8] flex items-center justify-center text-[#51465B] shadow-2xs">
              <Sparkles className="w-5 h-5 text-[#F47D83]" />
            </div>
          </div>

          {/* Reference Coral Accent Banner: Status Pembelajaran */}
          <div className="p-6 sm:p-7 rounded-3xl bg-[#F47D83] text-white shadow-md relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative z-10 max-w-md">
              <span className="text-[11px] font-black uppercase tracking-wider text-white/80 block mb-1">
                Local Knowledge Base Terhubung
              </span>
              <h2 className="text-xl sm:text-2xl font-black mb-2">
                Konteks {school?.region_name || "Kota Semarang"} Aktif!
              </h2>
              <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-medium">
                Sistem telah memverifikasi data komoditas pertanian, perkeretaapian, cagar budaya, dan gambar pendukung untuk Kelas 5 SD.
              </p>
            </div>
            <div className="relative z-10 shrink-0">
              <Link
                href="/teacher/questions/new"
                className="px-5 py-3 rounded-2xl bg-white text-[#23212A] hover:bg-slate-50 font-extrabold text-xs shadow-md transition-all flex items-center gap-2"
              >
                <span>Mulai Buat Soal</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#F47D83]" />
              </Link>
            </div>
            {/* Background decorative glow */}
            <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-white/10 blur-xl pointer-events-none" />
          </div>

          {/* Reference 3-Stat Pill Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-white border border-[#E9E5E8] shadow-2xs text-center sm:text-left">
              <div className="text-2xl sm:text-3xl font-black text-[#23212A]">
                +{questions.length}
              </div>
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#756F7A] mt-1">
                Bank Soal
              </div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-0.5 hidden sm:block">
                {contextualizedQuestionsCount} berkonteks lokal
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-[#E9E5E8] shadow-2xs text-center sm:text-left">
              <div className="text-2xl sm:text-3xl font-black text-[#23212A]">
                +20
              </div>
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#756F7A] mt-1">
                Entitas Lokal
              </div>
              <div className="text-[10px] text-[#51465B] font-semibold mt-0.5 hidden sm:block">
                BPS & Cagar Budaya
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-[#E9E5E8] shadow-2xs text-center sm:text-left">
              <div className="text-2xl sm:text-3xl font-black text-[#23212A]">
                +{classes.length}
              </div>
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#756F7A] mt-1">
                Kelas Aktif
              </div>
              <div className="text-[10px] text-[#F47D83] font-semibold mt-0.5 hidden sm:block">
                Fase C Kelas 5 SD
              </div>
            </div>
          </div>

          {/* Quick Action Navigation Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/teacher/questions/new"
              className="p-5 rounded-3xl bg-white border border-[#E9E5E8] hover:border-[#51465B] shadow-2xs hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-2xl bg-[#51465B] text-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Brain className="w-5 h-5 text-[#FFD36D]" />
                </div>
                <h3 className="font-extrabold text-sm text-[#23212A] mb-1">Konteks Soal</h3>
                <p className="text-xs text-[#756F7A]">Generate butir soal AI / input manual dengan konteks wilayah.</p>
              </div>
              <div className="pt-3 border-t border-[#E9E5E8] flex items-center justify-between text-xs font-bold text-[#51465B] group-hover:text-[#F47D83]">
                <span>Buat Soal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            <Link
              href="/teacher/materials/new"
              className="p-5 rounded-3xl bg-white border border-[#E9E5E8] hover:border-[#51465B] shadow-2xs hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-2xl bg-[#51465B] text-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <BookOpen className="w-5 h-5 text-[#F47D83]" />
                </div>
                <h3 className="font-extrabold text-sm text-[#23212A] mb-1">Konteks Materi</h3>
                <p className="text-xs text-[#756F7A]">Rancang bahan ajar modul bacaan berbasis potensi lokal.</p>
              </div>
              <div className="pt-3 border-t border-[#E9E5E8] flex items-center justify-between text-xs font-bold text-[#51465B] group-hover:text-[#F47D83]">
                <span>Buat Materi</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            <Link
              href={exams.length > 0 ? `/teacher/print/exam/${exams[0].id}` : "/teacher/examinations"}
              className="p-5 rounded-3xl bg-white border border-[#E9E5E8] hover:border-[#51465B] shadow-2xs hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-2xl bg-[#51465B] text-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Printer className="w-5 h-5 text-[#FFD36D]" />
                </div>
                <h3 className="font-extrabold text-sm text-[#23212A] mb-1">Cetak PDF A4</h3>
                <p className="text-xs text-[#756F7A]">Ekspor lembar soal murid dan kunci jawaban guru terpisah.</p>
              </div>
              <div className="pt-3 border-t border-[#E9E5E8] flex items-center justify-between text-xs font-bold text-[#51465B] group-hover:text-[#F47D83]">
                <span>Cetak Lembar Soal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          </div>

          {/* Recent Contextual Items Showcase */}
          <div className="p-6 rounded-3xl bg-white border border-[#E9E5E8] shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-[#23212A]">Soal Kontekstual Terkini</h3>
              <Link
                href="/teacher/questions"
                className="text-xs font-bold text-[#51465B] hover:text-[#F47D83] flex items-center gap-1"
              >
                <span>Lihat Semua Soal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {questions.slice(0, 3).map((q) => (
                <div
                  key={q.id}
                  className="p-4 rounded-2xl bg-[#FAF7F3] border border-[#E9E5E8] flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#E9E5E8] flex items-center justify-center text-[#51465B] shrink-0 font-bold text-xs">
                    {q.subject === "Matematika" ? "MTK" : q.subject === "IPS" ? "IPS" : "BIN"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase text-[#F47D83] px-2 py-0.5 rounded-full bg-white border border-[#E9E5E8]">
                        Kelas {q.grade} SD
                      </span>
                      <span className="text-xs font-extrabold text-[#23212A] truncate">
                        {q.topic}
                      </span>
                    </div>
                    <p className="text-xs text-[#756F7A] line-clamp-2 leading-relaxed">
                      {q.question_text}
                    </p>
                  </div>
                  {(q.image_url || q.media_asset?.image_url) && (
                    <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-[#E9E5E8]">
                      <img
                        src={q.image_url || q.media_asset?.image_url}
                        alt="Thumbnail"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ====================================================================
            RIGHT CONTEXTUAL PANEL (4 COLS ON DESKTOP, MATCHING REFERENCE YELLOW RAIL)
            ==================================================================== */}
        <div className="lg:col-span-4 rounded-3xl bg-[#FFD36D] p-6 sm:p-8 text-[#23212A] shadow-md space-y-6">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#51465B] block mb-1">
              Pilihan Konteks
            </span>
            <h2 className="text-xl font-black tracking-tight text-[#23212A]">
              Konteks Wilayah Aktif
            </h2>
            <p className="text-xs text-[#51465B] font-semibold mt-1">
              Ganti wilayah untuk menyesuaikan fokus belajar kelas:
            </p>
          </div>

          {/* Region Switcher Select */}
          <div className="space-y-2">
            <label className="text-[11px] font-extrabold uppercase text-[#51465B] block">
              Sekolah & Daerah:
            </label>
            <select
              value={school?.id}
              onChange={(e) => handleSwitchSchool(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-[#51465B]/20 text-xs font-extrabold text-[#23212A] focus:outline-hidden focus:border-[#51465B]"
            >
              {allSchools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.region_name})
                </option>
              ))}
            </select>
          </div>

          {/* Local Status Indicators Card */}
          <div className="p-4 rounded-2xl bg-white/90 border border-[#51465B]/10 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-[#756F7A] font-semibold">Identifikasi Wilayah:</span>
              <span className="font-extrabold text-[#23212A]">{school?.region_name}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-[#756F7A] font-semibold">Kode Administratif:</span>
              <span className="font-mono font-bold text-[#51465B]">{school?.region_id}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-[#756F7A] font-semibold">Validasi Faktual:</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Terverifikasi BPS</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#756F7A] font-semibold">Aset Visual Wikimedia:</span>
              <span className="font-bold text-[#51465B]">Tersedia Lisensi CC</span>
            </div>
          </div>

          {/* Fast Print Actions */}
          <div className="pt-2">
            <Link
              href={exams.length > 0 ? `/teacher/print/exam/${exams[0].id}` : "/teacher/examinations"}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#51465B] hover:bg-[#3E3547] text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4 text-[#FFD36D]" />
              <span>Cetak Lembar Soal Siswa</span>
            </Link>
          </div>

          {/* Support Notes */}
          <div className="p-4 rounded-2xl bg-white/40 border border-[#51465B]/10 text-[11px] text-[#51465B] leading-relaxed">
            <span className="font-bold block mb-1">Catatan Evaluasi Kelas 5 SD:</span>
            Penyusunan naskah soal memastikan materi sesuai usia kognitif anak usia 10-11 tahun serta tidak membebani murid dengan data di luar kurikulum.
          </div>
        </div>
      </div>
    </TeacherWorkspaceShell>
  );
}
