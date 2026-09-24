"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { StudentWorkspaceShell } from "@/components/layout/student-workspace-shell";
import { repository } from "@/lib/db/repository";
import { Exam, ExamAttempt, ClassRoom } from "@/lib/db/types";
import {
  ClipboardCheck,
  Clock,
  CheckCircle,
  Play,
  Award,
  AlertCircle,
  FileQuestion,
  Calendar,
  Sparkles,
} from "lucide-react";

export default function StudentExaminationsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);

  useEffect(() => {
    // Current student: usr-student-01
    const studentClasses = repository.getStudentClasses("usr-student-01");
    setClasses(studentClasses);
    const classIds = studentClasses.map((c) => c.id);

    const allExams = repository.getExams();
    const studentExams = allExams.filter(
      (e) => classIds.includes(e.class_id) && e.status === "published"
    );
    setExams(studentExams);

    const atts = repository.getAttempts().filter((a) => a.student_id === "usr-student-01");
    setAttempts(atts);
  }, []);

  return (
    <StudentWorkspaceShell>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-500 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-semibold mb-3">
              <ClipboardCheck className="w-3.5 h-3.5" />
              Sesi Ujian & Latihan
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
              Daftar Ujian Kelas
            </h1>
            <p className="text-white/90 text-xs sm:text-sm leading-relaxed">
              Kerjakan soal-soal latihan dan ujian dari Ibu Guru dengan teliti dan percaya diri!
            </p>
          </div>
          <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-white/10 rounded-full blur-xl" />
        </div>

        {/* Exams List */}
        {exams.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
            <ClipboardCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-1">
              Tidak Ada Ujian yang Sedang Berjalan
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Saat ini belum ada tugas atau ujian aktif dari gurumu. Kamu bisa belajar materi terlebih dahulu!
            </p>
            <div className="mt-6">
              <Link
                href="/student/materials"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-xs transition-colors"
              >
                Buka Cerita Materi Belajar
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {exams.map((ex) => {
              const attempt = attempts.find((a) => a.exam_id === ex.id);
              const isSubmitted = attempt?.status === "submitted" || attempt?.status === "graded";
              const isGraded = attempt?.status === "graded";

              return (
                <div
                  key={ex.id}
                  className="bg-white rounded-2xl border-2 border-slate-100 hover:border-sky-200 p-6 shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-sky-100 text-sky-800 text-xs font-bold">
                        {ex.subject}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                        {ex.class_name}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        Soal Kontekstual Ponorogo
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 leading-snug">
                      {ex.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Durasi: {ex.duration_minutes} Menit</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FileQuestion className="w-3.5 h-3.5 text-slate-400" />
                        <span>Jumlah: {ex.question_ids.length} Butir Soal</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 flex items-center justify-end">
                    {isGraded ? (
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[11px] text-slate-400 block font-medium">
                            Nilai Akhir
                          </span>
                          <span className="text-xl font-extrabold text-indigo-600">
                            {attempt?.score} / 100
                          </span>
                        </div>
                        <Link
                          href={`/student/examinations/${ex.id}/results`}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors"
                        >
                          <Award className="w-4 h-4 text-indigo-600" />
                          <span>Lihat Nilai & Pembahasan</span>
                        </Link>
                      </div>
                    ) : isSubmitted ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-amber-600 font-bold bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-amber-600" />
                          Jawaban Terkirim (Menunggu Guru)
                        </span>
                        <Link
                          href={`/student/examinations/${ex.id}/results`}
                          className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 underline"
                        >
                          Rincian
                        </Link>
                      </div>
                    ) : (
                      <Link
                        href={`/student/examinations/${ex.id}/session`}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-xs hover:shadow transition-all"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>Mulai Mengerjakan</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </StudentWorkspaceShell>
  );
}
