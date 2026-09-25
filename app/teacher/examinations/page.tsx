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
    <TeacherWorkspaceShell activeGroupId="examinations">
      <div className="space-y-6 sm:space-y-8">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 sm:p-7 rounded-3xl border border-[#E9E5E8] shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-xl bg-[#51465B]/10 text-[#51465B]">
                <ClipboardCheck className="w-5 h-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#23212A]">
                Modul Evaluasi & Ujian
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#756F7A] font-semibold">
              Buat room ujian terkontekstualisasi, pantau submission murid, dan evaluasi hasil belajar.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/teacher/examinations/review-essay"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-[#E9E5E8] hover:bg-slate-50 text-[#51465B] text-xs font-bold transition-colors cursor-pointer"
            >
              <FileQuestion className="w-4 h-4 text-amber-600" />
              <span>Pemeriksaan Esai</span>
            </Link>
            <Link
              href="/teacher/examinations/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#51465B] hover:bg-[#3D3445] text-white text-xs sm:text-sm font-black shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Buat Room Ujian</span>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl border border-[#E9E5E8] shadow-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756F7A]" />
            <input
              type="text"
              placeholder="Cari judul ujian atau kelas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#FAF7F3] border border-[#E9E5E8] rounded-xl text-xs font-medium text-[#23212A] placeholder-[#756F7A]/60 focus:outline-none focus:ring-2 focus:ring-[#51465B]"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {["ALL", "published", "draft", "completed"].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedStatus === st
                    ? "bg-[#51465B] text-white shadow-xs"
                    : "bg-[#FAF7F3] hover:bg-slate-100 text-[#756F7A]"
                }`}
              >
                {st === "ALL"
                  ? "Semua Status"
                  : st === "published"
                  ? "Aktif Berjalan"
                  : st === "draft"
                  ? "Draft"
                  : "Selesai"}
              </button>
            ))}
          </div>
        </div>

        {/* Exams Grid */}
        {filteredExams.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#E9E5E8] p-12 text-center space-y-3">
            <ClipboardCheck className="w-12 h-12 text-[#756F7A]/40 mx-auto" />
            <h3 className="text-base font-black text-[#23212A]">
              Belum ada room ujian
            </h3>
            <p className="text-xs text-[#756F7A] max-w-sm mx-auto">
              Susun ujian kelas dengan mengambil butir soal kontekstual yang telah Anda buat di Bank Soal.
            </p>
            <div className="pt-2">
              <Link
                href="/teacher/examinations/create"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#51465B] text-white text-xs font-black shadow-md hover:bg-[#3D3445]"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                Buat Ujian Baru
              </Link>
            </div>
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
                  className="bg-white rounded-3xl border border-[#E9E5E8] p-6 shadow-xs hover:border-[#51465B]/30 hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#51465B]/10 text-[#51465B] text-xs font-black">
                          {ex.subject}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#FAF7F3] border border-[#E9E5E8] text-[#756F7A] text-xs font-bold">
                          {ex.class_name}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                            ex.status === "published"
                              ? "bg-emerald-50 text-emerald-800"
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

                      <div className="flex items-center gap-1 text-xs text-[#756F7A] font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{ex.duration_minutes} Menit</span>
                      </div>
                    </div>

                    <h3 className="text-base font-black text-[#23212A] group-hover:text-[#51465B] transition-colors mb-3 leading-snug">
                      {ex.title}
                    </h3>

                    {/* Meta stats */}
                    <div className="grid grid-cols-3 gap-2 bg-[#FAF7F3] p-3.5 rounded-2xl border border-[#E9E5E8] mb-4 text-center">
                      <div>
                        <div className="text-[11px] text-[#756F7A] font-bold">Jumlah Soal</div>
                        <div className="text-sm font-black text-[#23212A]">
                          {ex.question_ids.length} Soal
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-[#756F7A] font-bold">Submission</div>
                        <div className="text-sm font-black text-[#23212A]">
                          {submittedCount} Murid
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-[#756F7A] font-bold">Rata-rata</div>
                        <div className="text-sm font-black text-[#51465B]">
                          {avgScore !== null ? `${avgScore}/100` : "-"}
                        </div>
                      </div>
                    </div>

                    {pendingEssayCount > 0 && (
                      <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-900">
                        <div className="flex items-center gap-1.5 font-bold">
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                          <span>{pendingEssayCount} jawaban esai memerlukan koreksi</span>
                        </div>
                        <Link
                          href="/teacher/examinations/review-essay"
                          className="font-black underline text-amber-950 hover:text-amber-800"
                        >
                          Koreksi
                        </Link>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#E9E5E8] flex items-center justify-between">
                    <span className="text-xs text-[#756F7A] font-semibold">
                      ID: <span className="font-mono">{ex.id}</span>
                    </span>

                    <Link
                      href={`/teacher/examinations/${ex.id}/results`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#51465B]/10 hover:bg-[#51465B]/20 text-[#51465B] text-xs font-black transition-colors"
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
