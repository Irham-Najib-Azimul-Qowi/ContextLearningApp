"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { TeacherWorkspaceShell } from "@/components/layout/teacher-workspace-shell";
import { repository } from "@/lib/db/repository";
import { Exam, ExamAttempt, ClassRoom } from "@/lib/db/types";
import {
  ClipboardCheck,
  Plus,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  FileQuestion,
  ChevronRight,
  School,
  Sparkles,
  BarChart3,
  Search,
} from "lucide-react";

export default function TeacherExaminationsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const school = repository.getActiveSchool();
    const exList = repository.getExams(school.id);
    const attList = repository.getAttempts();
    const clss = repository.getClasses(school.id);

    setExams(exList);
    setAttempts(attList);
    setClasses(clss);
  }, []);

  const filteredExams = exams.filter((ex) => {
    const matchStatus = selectedStatus === "ALL" || ex.status === selectedStatus;
    const matchSearch =
      ex.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.class_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <TeacherWorkspaceShell>
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                <ClipboardCheck className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Modul Evaluasi & Ujian
              </h1>
            </div>
            <p className="text-sm text-slate-500">
              Buat room ujian terkontekstualisasi, pantau submission murid, dan evaluasi hasil belajar.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/teacher/examinations/review-essay"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
            >
              <FileQuestion className="w-4 h-4 text-amber-600" />
              <span>Pemeriksaan Esai</span>
            </Link>
            <Link
              href="/teacher/examinations/create"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs hover:shadow transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Room Ujian</span>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari judul ujian atau kelas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex gap-2">
            {["ALL", "published", "draft", "completed"].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedStatus === st
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                {st === "ALL"
                  ? "Semua Status"
                  : st === "published"
                  ? "Aktif / Terbit"
                  : st === "draft"
                  ? "Draft"
                  : "Selesai"}
              </button>
            ))}
          </div>
        </div>

        {/* Exams Grid */}
        {filteredExams.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
            <ClipboardCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800 mb-1">
              Belum ada room ujian
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
              Susun ujian kelas dengan mengambil butir soal kontekstual yang telah Anda setujui di Bank Soal.
            </p>
            <Link
              href="/teacher/examinations/create"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              Buat Ujian Baru
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredExams.map((ex) => {
              const examAttempts = attempts.filter((a) => a.exam_id === ex.id);
              const submittedCount = examAttempts.filter(
                (a) => a.status === "submitted" || a.status === "graded"
              ).length;
              const pendingEssayCount = examAttempts.filter((a) => a.status === "submitted").length;
              const gradedAttempts = examAttempts.filter((a) => a.status === "graded");
              const avgScore =
                gradedAttempts.length > 0
                  ? Math.round(
                      gradedAttempts.reduce((sum, a) => sum + (a.score || 0), 0) /
                        gradedAttempts.length
                    )
                  : null;

              return (
                <div
                  key={ex.id}
                  className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-medium">
                          {ex.subject}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                          {ex.class_name}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                            ex.status === "published"
                              ? "bg-emerald-50 text-emerald-700"
                              : ex.status === "draft"
                              ? "bg-slate-100 text-slate-600"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {ex.status === "published"
                            ? "Aktif Berjalan"
                            : ex.status === "draft"
                            ? "Draft"
                            : "Selesai"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{ex.duration_minutes} Menit</span>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">
                      {ex.title}
                    </h3>

                    {/* Meta stats */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4 text-center">
                      <div>
                        <div className="text-[11px] text-slate-400 font-medium">Jumlah Soal</div>
                        <div className="text-sm font-bold text-slate-800">
                          {ex.question_ids.length} Soal
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-slate-400 font-medium">Submission</div>
                        <div className="text-sm font-bold text-slate-800">
                          {submittedCount} Murid
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-slate-400 font-medium">Rata-rata Nilai</div>
                        <div className="text-sm font-bold text-indigo-600">
                          {avgScore !== null ? `${avgScore}/100` : "-"}
                        </div>
                      </div>
                    </div>

                    {pendingEssayCount > 0 && (
                      <div className="mb-4 p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-xs text-amber-800">
                        <div className="flex items-center gap-1.5 font-medium">
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                          <span>{pendingEssayCount} jawaban esai memerlukan koreksi</span>
                        </div>
                        <Link
                          href="/teacher/examinations/review-essay"
                          className="font-bold underline text-amber-900 hover:text-amber-700"
                        >
                          Koreksi
                        </Link>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      ID: <span className="font-mono">{ex.id}</span>
                    </span>

                    <Link
                      href={`/teacher/examinations/${ex.id}/results`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>Rekap & Detail Hasil</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </TeacherWorkspaceShell>
  );
}
