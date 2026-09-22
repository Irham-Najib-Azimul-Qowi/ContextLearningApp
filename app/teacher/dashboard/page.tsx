"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  FileQuestion,
  BookOpen,
  UsersRound,
  ClipboardList,
  MapPin,
  ArrowRight,
  Clock,
  CheckCircle2,
  Printer,
  ScanLine,
  GraduationCap,
  Building2,
} from "lucide-react";
import { repository } from "@/lib/db/repository";
import { ClassRoom, Examination, Question, LearningMaterial, School as SchoolType } from "@/lib/db/types";

export default function TeacherDashboard() {
  const [school, setSchool] = useState<SchoolType | null>(null);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [exams, setExams] = useState<Examination[]>([]);

  useEffect(() => {
    const schoolId = localStorage.getItem("cl_active_school_id") || "school-sd001-samarinda";
    const foundSchool = repository.getSchoolById(schoolId) || repository.getSchools()[0];
    if (foundSchool) setSchool(foundSchool);

    setClasses(repository.getClasses(schoolId));
    setQuestions(repository.getQuestions(schoolId));
    setMaterials(repository.getMaterials(schoolId));
    setExams(repository.getExaminations(schoolId));
  }, []);

  const getLevelLabel = (lvl?: string) => {
    switch (lvl) {
      case "SD":
        return "Sekolah Dasar";
      case "SMP":
        return "Sekolah Menengah Pertama";
      case "SMA":
        return "Sekolah Menengah Atas";
      default:
        return "Sekolah Dasar";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface p-5 rounded-xl border border-border shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-primary-subtle text-primary border border-primary/20">
              {school?.name || "SD Negeri 001 Samarinda"} · {getLevelLabel(school?.educational_level)}
            </span>
            <span className="text-xs text-secondary-text">Tahun Ajaran 2026/2027</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Selamat Datang, Ibu Nurhaliza, S.Pd.
          </h1>
          <p className="text-xs text-secondary-text mt-1 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <span>{school ? `${school.district}, ${school.regency}, ${school.province}` : "Samarinda, Kalimantan Timur"}</span>
            <span className="text-border">·</span>
            <span className="font-mono text-[11px]">{school?.code || "SCH-SD001"}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Link href="/teacher/questions/generator">
            <Button variant="primary" size="sm" className="text-xs">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Buat Soal AI
            </Button>
          </Link>
          <Link href="/teacher/students">
            <Button variant="outline" size="sm" className="text-xs">
              <GraduationCap className="h-3.5 w-3.5 mr-1.5 text-primary" /> Kelola Siswa
            </Button>
          </Link>
          <Link href="/teacher/print">
            <Button variant="outline" size="sm" className="text-xs">
              <Printer className="h-3.5 w-3.5 mr-1.5" /> Cetak Lembar Ujian
            </Button>
          </Link>
          <Link href="/teacher/examinations/scan-correction">
            <Button variant="outline" size="sm" className="text-xs">
              <ScanLine className="h-3.5 w-3.5 mr-1.5 text-success" /> Koreksi Scan
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface p-4 rounded-xl border border-border shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-secondary-text">Bank Soal</span>
            <div className="w-8 h-8 rounded-lg bg-primary-subtle text-primary flex items-center justify-center">
              <FileQuestion className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{questions.length}</p>
          <span className="text-[11px] text-success font-semibold flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3 h-3" /> {questions.filter((q) => q.is_approved).length} Terkontekstualisasi
          </span>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-border shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-secondary-text">Kelas Aktif</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-secondary flex items-center justify-center">
              <UsersRound className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{classes.length}</p>
          <span className="text-[11px] text-secondary-text mt-1 block">Rombongan Belajar Aktif</span>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-border shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-secondary-text">Materi Ajar</span>
            <div className="w-8 h-8 rounded-lg bg-success-subtle text-success flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{materials.length}</p>
          <span className="text-[11px] text-success font-semibold mt-1 block">Tersedia untuk Siswa</span>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-border shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-secondary-text">Ruang Ujian</span>
            <div className="w-8 h-8 rounded-lg bg-warning-subtle text-warning flex items-center justify-center">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{exams.length}</p>
          <span className="text-[11px] text-warning font-semibold mt-1 block">Ujian Kontekstual Aktif</span>
        </div>
      </div>

      {/* Main 2-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Classes & Questions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Classes Card */}
          <div className="bg-surface rounded-xl border border-border p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <UsersRound className="w-4 h-4 text-primary" /> Kelas yang Diampu
              </h3>
              <Link href="/teacher/classes" className="text-xs font-semibold text-link hover:underline flex items-center gap-1">
                Kelola Kelas <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {classes.map((cls) => (
                <div key={cls.id} className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{cls.name}</h4>
                    <p className="text-[11px] text-secondary-text mt-0.5">
                      Tingkat {cls.grade} • {cls.subjects.join(", ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[#F2F4F8] text-foreground border border-border">
                      {cls.join_code}
                    </span>
                    <Link href="/teacher/classes">
                      <Button variant="outline" size="sm" className="h-7 text-xs px-2.5">
                        Buka
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Contextualized Questions */}
          <div className="bg-surface rounded-xl border border-border p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <FileQuestion className="w-4 h-4 text-primary" /> Soal Kontekstual Terbaru
              </h3>
              <Link href="/teacher/questions" className="text-xs font-semibold text-link hover:underline flex items-center gap-1">
                Semua Soal <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {questions.slice(0, 3).map((q) => (
                <div key={q.id} className="py-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-primary-subtle text-primary border border-primary/20">
                        {q.subject}
                      </span>
                      <span className="text-[11px] font-medium text-secondary-text">Kelas {q.grade}</span>
                      <span className="text-border">·</span>
                      <span className="text-[11px] text-secondary-text truncate max-w-xs">{q.topic}</span>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-success-subtle text-success border border-emerald-200">
                      Tervalidasi
                    </span>
                  </div>
                  <p className="text-xs text-foreground line-clamp-2 leading-relaxed font-normal">
                    {q.original_text}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-secondary-text font-mono">
                      Variabel: {q.context_variables.map((v) => `[${v.key}]`).join(" ")}
                    </span>
                    <Link href={`/teacher/questions/context-preview?question_id=${q.id}`}>
                      <span className="text-xs text-link hover:underline font-semibold">
                        Lihat Perbandingan
                      </span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Active Region Context & Scheduled Exam */}
        <div className="space-y-6">
          {/* Active Context Card */}
          <div className="bg-surface rounded-xl border border-border p-5 shadow-2xs">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-primary" /> Profil Wilayah Kontekstual
            </h3>
            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-secondary-text block">Wilayah Terpilih:</span>
                <p className="font-semibold text-foreground mt-0.5">
                  {school ? `${school.regency}, ${school.province}` : "Kota Samarinda"}
                </p>
              </div>
              <div>
                <span className="text-secondary-text block">Karakteristik Lingkungan Lokal:</span>
                <p className="text-secondary-text mt-0.5 leading-relaxed">
                  {school?.local_characteristics ||
                    "DAS Sungai Mahakam, transportasi Kapal Klotok, Pasar Pagi, Ikan Haruan, dan Kain Tenun Samarinda."}
                </p>
              </div>
              <div className="pt-2">
                <Link href="/teacher/school/settings">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    Sinkronkan Lokasi & GPS
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Active Examination Card */}
          <div className="bg-surface rounded-xl border border-border p-5 shadow-2xs">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
              <ClipboardList className="w-4 h-4 text-warning" /> Ujian Berlangsung
            </h3>
            {exams.slice(0, 1).map((ex) => (
              <div key={ex.id} className="space-y-2 text-xs">
                <h4 className="font-semibold text-foreground">{ex.title}</h4>
                <p className="text-secondary-text line-clamp-2 leading-relaxed">{ex.description}</p>
                <div className="flex items-center gap-2 text-secondary-text">
                  <Clock className="w-3.5 h-3.5 text-primary" /> Durasi: {ex.duration_minutes} Menit
                </div>
                <div className="pt-2">
                  <Link href="/teacher/examinations">
                    <Button variant="primary" size="sm" className="w-full text-xs">
                      Buka Ruang Ujian & Nilai
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
