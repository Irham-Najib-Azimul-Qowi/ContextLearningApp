"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  FileQuestion,
  BookOpen,
  UsersRound,
  ClipboardList,
  School,
  MapPin,
  ArrowRight,
  PlusCircle,
  Clock,
  CheckCircle2,
  Printer,
  ScanLine,
  GraduationCap,
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

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-[#DCE0EA] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#5865D8]/10 text-[#5865D8]">
              {school?.educational_level || "SD"} • {school?.code || "SCH-001"}
            </span>
            <span className="text-xs text-[#697386]">Tahun Ajaran 2026/2027</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#252B3A] tracking-tight">
            Selamat Datang, Ibu Nurhaliza, S.Pd.
          </h1>
          <p className="text-xs text-[#697386] mt-0.5 flex items-center gap-1.5">
            <School className="h-3.5 w-3.5 text-[#5865D8]" />
            <span className="font-medium text-[#252B3A]">{school?.name || "SD Negeri 001 Samarinda"}</span>
            <span className="text-slate-300">•</span>
            <MapPin className="h-3.5 w-3.5 text-[#697386]" />
            <span>{school ? `${school.district}, ${school.regency}` : "Samarinda"}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Link href="/teacher/questions/generator">
            <Button variant="primary" size="sm" className="bg-[#5865D8] hover:bg-[#4753C4] text-xs">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Buat Soal AI
            </Button>
          </Link>
          <Link href="/teacher/students">
            <Button variant="outline" size="sm" className="text-xs border-[#DCE0EA]">
              <GraduationCap className="h-3.5 w-3.5 mr-1.5 text-[#5865D8]" /> Kelola Siswa
            </Button>
          </Link>
          <Link href="/teacher/print">
            <Button variant="outline" size="sm" className="text-xs border-[#DCE0EA]">
              <Printer className="h-3.5 w-3.5 mr-1.5" /> Cetak Lembar Ujian
            </Button>
          </Link>
          <Link href="/teacher/examinations/scan-correction">
            <Button variant="outline" size="sm" className="text-xs border-[#DCE0EA]">
              <ScanLine className="h-3.5 w-3.5 mr-1.5 text-[#238B68]" /> Koreksi Scan
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#DCE0EA] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#697386]">Bank Soal</span>
            <div className="w-8 h-8 rounded-lg bg-[#5865D8]/10 text-[#5865D8] flex items-center justify-center">
              <FileQuestion className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-[#252B3A]">{questions.length}</p>
          <span className="text-[11px] text-[#238B68] font-medium flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3 h-3" /> {questions.filter((q) => q.is_approved).length} Terkontekstualisasi
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#DCE0EA] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#697386]">Kelas Aktif</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <UsersRound className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-[#252B3A]">{classes.length}</p>
          <span className="text-[11px] text-[#697386] mt-1 block">Rombongan Belajar Aktif</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#DCE0EA] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#697386]">Materi Ajar</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#238B68] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-[#252B3A]">{materials.length}</p>
          <span className="text-[11px] text-[#238B68] font-medium mt-1 block">Tersedia untuk Siswa</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#DCE0EA] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#697386]">Ruang Ujian</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#C68A28] flex items-center justify-center">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-[#252B3A]">{exams.length}</p>
          <span className="text-[11px] text-[#C68A28] font-medium mt-1 block">Ujian Kontekstual Aktif</span>
        </div>
      </div>

      {/* Main 2-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Classes & Questions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Classes Card */}
          <div className="bg-white rounded-xl border border-[#DCE0EA] p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#252B3A] flex items-center gap-2">
                <UsersRound className="w-4 h-4 text-[#5865D8]" /> Kelas yang Diampu
              </h3>
              <Link href="/teacher/classes" className="text-xs font-semibold text-[#5865D8] hover:underline flex items-center gap-1">
                Kelola Kelas <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-[#EDEFF5]">
              {classes.map((cls) => (
                <div key={cls.id} className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#252B3A]">{cls.name}</h4>
                    <p className="text-[11px] text-[#697386] mt-0.5">
                      Kelas {cls.grade} • {cls.subjects.join(", ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#F1F3F9] text-[#252B3A] border border-[#DCE0EA]">
                      {cls.join_code}
                    </span>
                    <Link href={`/teacher/classes`}>
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
          <div className="bg-white rounded-xl border border-[#DCE0EA] p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#252B3A] flex items-center gap-2">
                <FileQuestion className="w-4 h-4 text-[#5865D8]" /> Soal Kontekstual Terbaru
              </h3>
              <Link href="/teacher/questions" className="text-xs font-semibold text-[#5865D8] hover:underline flex items-center gap-1">
                Semua Soal <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-[#EDEFF5]">
              {questions.slice(0, 3).map((q) => (
                <div key={q.id} className="py-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                        {q.subject}
                      </span>
                      <span className="text-[11px] text-[#697386]">Kelas {q.grade}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[11px] text-[#697386] truncate max-w-xs">{q.topic}</span>
                    </div>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-50 text-[#238B68]">
                      Tervalidasi
                    </span>
                  </div>
                  <p className="text-xs text-[#252B3A] line-clamp-2 leading-relaxed">
                    {q.original_text}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-[#697386] font-mono">
                      Variabel: {q.context_variables.map((v) => `[${v.key}]`).join(" ")}
                    </span>
                    <Link href="/teacher/questions/context-preview">
                      <span className="text-xs text-[#5865D8] hover:underline font-medium">
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
          <div className="bg-white rounded-xl border border-[#DCE0EA] p-5 shadow-xs">
            <h3 className="text-sm font-bold text-[#252B3A] flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-[#5865D8]" /> Profil Wilayah Kontekstual
            </h3>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[#697386]">Wilayah Terpilih:</span>
                <p className="font-semibold text-[#252B3A]">
                  {school ? `${school.regency}, ${school.province}` : "Kota Samarinda"}
                </p>
              </div>
              <div>
                <span className="text-[#697386]">Karakteristik Lokal:</span>
                <p className="text-[#697386] mt-0.5 leading-relaxed">
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
          <div className="bg-white rounded-xl border border-[#DCE0EA] p-5 shadow-xs">
            <h3 className="text-sm font-bold text-[#252B3A] flex items-center gap-2 mb-3">
              <ClipboardList className="w-4 h-4 text-[#C68A28]" /> Ujian Sedang Berlangsung
            </h3>
            {exams.slice(0, 1).map((ex) => (
              <div key={ex.id} className="space-y-2 text-xs">
                <h4 className="font-semibold text-[#252B3A]">{ex.title}</h4>
                <p className="text-[#697386] line-clamp-2">{ex.description}</p>
                <div className="flex items-center gap-2 text-[#697386]">
                  <Clock className="w-3.5 h-3.5" /> Durasi: {ex.duration_minutes} Menit
                </div>
                <div className="pt-2">
                  <Link href="/teacher/examinations">
                    <Button variant="primary" size="sm" className="w-full text-xs bg-[#5865D8] hover:bg-[#4753C4]">
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
