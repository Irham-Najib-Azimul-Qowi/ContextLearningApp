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
  AlertCircle,
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

  useEffect(() => {
    const activeSchool = repository.getActiveSchool();
    setSchool(activeSchool);
    setUser(repository.getCurrentUser());
    setClasses(repository.getClasses(activeSchool.id));
    setQuestions(repository.getQuestions({ schoolId: activeSchool.id }));
    setMaterials(repository.getMaterials(activeSchool.id));
    setExams(repository.getExams(activeSchool.id));
    setAttempts(repository.getAttempts());
  }, []);

  const pendingEssayCount = attempts.filter((a) => a.status === "submitted").length;
  const contextualizedQuestionsCount = questions.filter((q) => q.is_contextualized).length;

  return (
    <TeacherWorkspaceShell activeGroupId="dashboard">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold mb-2">
              <SchoolIcon className="w-3.5 h-3.5" />
              <span>{school?.name || "SD Negeri 1 Ponorogo"}</span>
              <span className="text-slate-400">&bull;</span>
              <span>{school?.region_name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              Selamat Datang, {user?.full_name || "Ibu Siti Aminah, S.Pd."}
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Ruang kerja terpadu untuk merancang materi ajar dan butir soal kontekstual berbasis potensi lokal {school?.region_name || "Kabupaten Ponorogo"}.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Link
              href="/teacher/questions/generator"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Soal AI</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Kelas Dikelola</span>
            <BookOpen className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-950">{classes.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Kelas aktif semester ini</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Bank Soal</span>
            <Brain className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-950">{questions.length}</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            {contextualizedQuestionsCount} soal berkonteks lokal
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Materi Ajar</span>
            <FileText className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-950">{materials.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Tersedia untuk siswa SD</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Ujian Terjadwal</span>
            <ClipboardCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-950">{exams.length}</div>
          <p className="text-[11px] text-amber-600 font-medium mt-1">
            {pendingEssayCount} esai butuh pemeriksaan
          </p>
        </div>
      </div>

      {/* 3. Quick Actions Bar */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
          Aksi Cepat Guru
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/teacher/questions/generator"
            className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-xs transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Buat Soal AI</span>
              <span className="text-[10px] text-slate-500">Kontekstualisasi instan</span>
            </div>
          </Link>

          <Link
            href="/teacher/questions/manual"
            className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-xs transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Input Manual</span>
              <span className="text-[10px] text-slate-500">Tulis soal sendiri</span>
            </div>
          </Link>

          <Link
            href="/teacher/materials/create"
            className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-xs transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Buat Materi</span>
              <span className="text-[10px] text-slate-500">Bahan bacaan lokal</span>
            </div>
          </Link>

          <Link
            href="/teacher/examinations/create"
            className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-xs transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <ClipboardCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Buat Ujian</span>
              <span className="text-[10px] text-slate-500">Terbitkan ke kelas</span>
            </div>
          </Link>
        </div>
      </div>

      {/* 4. Two Columns: Active Classes & Recent Questions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Classes List */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">Daftar Kelas Aktif</h3>
            <Link
              href="/teacher/classes"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>Kelola Kelas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {classes.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                Belum ada kelas terdaftar. Klik tombol Tambah Kelas untuk memulai.
              </div>
            ) : (
              classes.map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{c.name}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Jenjang Kelas {c.grade} SD &bull; Kode Gabung:{" "}
                      <span className="font-mono font-bold text-indigo-600">{c.code}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-700 block">
                      {c.student_count} Siswa
                    </span>
                    <span className="text-[10px] text-slate-400">Tahun {c.academic_year}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Contextual Questions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">Soal Berkonteks Lokal Terkini</h3>
            <Link
              href="/teacher/questions"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>Semua Soal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {questions.slice(0, 3).map((q) => (
              <div
                key={q.id}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 text-xs"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[10px]">
                    {q.subject} Kelas {q.grade}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {q.type === "multiple_choice" ? "Pilihan Ganda" : "Esai"}
                  </span>
                </div>
                <p className="text-slate-800 line-clamp-2 leading-relaxed">
                  {q.question_text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </TeacherWorkspaceShell>
  );
}
