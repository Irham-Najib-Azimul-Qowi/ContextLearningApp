"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { TeacherWorkspaceShell } from "@/components/layout/teacher-workspace-shell";
import { repository } from "@/lib/db/repository";
import { Exam, ExamAttempt, Question } from "@/lib/db/types";
import {
  BarChart3,
  ArrowLeft,
  CheckCircle,
  Clock,
  Users,
  Award,
  FileQuestion,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function TeacherExamResultsDetailPage() {
  const params = useParams();
  const examId = params?.id as string;

  const [exam, setExam] = useState<Exam | null>(null);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [expandedAttemptId, setExpandedAttemptId] = useState<string | null>(null);

  useEffect(() => {
    if (!examId) return;
    const ex = repository.getExam(examId);
    if (ex) {
      setExam(ex);
      const atts = repository.getAttempts(examId);
      setAttempts(atts);
      if (ex.questions) {
        setQuestions(ex.questions);
      } else {
        const allQ = repository.getQuestions();
        setQuestions(allQ.filter((q) => ex.question_ids.includes(q.id)));
      }
    }
  }, [examId]);

  if (!exam) {
    return (
      <TeacherWorkspaceShell>
        <div className="p-8 text-center text-slate-500">
          Ujian tidak ditemukan.{" "}
          <Link href="/teacher/examinations" className="text-indigo-600 underline">
            Kembali
          </Link>
        </div>
      </TeacherWorkspaceShell>
    );
  }

  const gradedAttempts = attempts.filter((a) => a.status === "graded");
  const scores = gradedAttempts.map((a) => a.score || 0);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
  const minScore = scores.length > 0 ? Math.min(...scores) : 0;

  return (
    <TeacherWorkspaceShell>
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Back Link */}
        <div>
          <Link
            href="/teacher/examinations"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Daftar Ujian
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Rekap Hasil: {exam.title}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Kelas: <strong>{exam.class_name}</strong> &bull; Mata Pelajaran:{" "}
                <strong>{exam.subject}</strong> &bull; Total Soal:{" "}
                <strong>{questions.length} Butir</strong>
              </p>
            </div>

            <Link
              href="/teacher/examinations/review-essay"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-xs"
            >
              <FileQuestion className="w-4 h-4" />
              <span>Koreksi Jawaban Esai</span>
            </Link>
          </div>
        </div>

        {/* Analytics Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium">Peserta Masuk</span>
              <Users className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{attempts.length}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Siswa terdaftar</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium">Rata-Rata Kelas</span>
              <BarChart3 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-600">
              {scores.length > 0 ? `${avgScore}` : "-"}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Skala 100</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium">Nilai Tertinggi</span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-extrabold text-amber-600">
              {scores.length > 0 ? `${maxScore}` : "-"}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Capaian maksimal</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium">Nilai Terendah</span>
              <FileQuestion className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-extrabold text-slate-700">
              {scores.length > 0 ? `${minScore}` : "-"}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Perlu bimbingan</div>
          </div>
        </div>

        {/* Participant Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Daftar Penyerahan Siswa ({attempts.length})
            </h3>
            <span className="text-xs text-slate-400">
              Auto-grading Pilihan Ganda & Koreksi Esai
            </span>
          </div>

          {attempts.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Belum ada siswa yang mengerjakan atau menyerahkan ujian ini.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {attempts.map((att) => {
                const isExpanded = expandedAttemptId === att.id;
                return (
                  <div key={att.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{att.student_name}</div>
                        <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>
                            Mulai:{" "}
                            {new Date(att.started_at).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {att.submitted_at && (
                            <span>
                              &bull; Selesai:{" "}
                              {new Date(att.submitted_at).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm font-extrabold text-indigo-600">
                            {att.score !== undefined ? `${att.score}/100` : "Dalam Pengerjaan"}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            PG: {att.mc_score ?? "-"} | Esai: {att.essay_score ?? "-"}
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            att.status === "graded"
                              ? "bg-emerald-50 text-emerald-700"
                              : att.status === "submitted"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {att.status === "graded"
                            ? "Dinilai"
                            : att.status === "submitted"
                            ? "Perlu Koreksi Esai"
                            : "Mengerjakan"}
                        </span>

                        <button
                          onClick={() => setExpandedAttemptId(isExpanded ? null : att.id)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Detail Answers */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 bg-slate-50/60 p-4 rounded-xl">
                        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                          Rincian Jawaban Siswa
                        </div>

                        {questions.map((q, idx) => {
                          const studentAns = att.answers[q.id];
                          const isCorrect =
                            q.type === "multiple_choice" &&
                            studentAns?.trim().toUpperCase() ===
                              q.correct_answer.trim().toUpperCase();

                          return (
                            <div
                              key={q.id}
                              className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-1.5"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-slate-800">
                                  Soal #{idx + 1} ({q.type === "multiple_choice" ? "PG" : "Esai"})
                                </span>
                                {q.type === "multiple_choice" ? (
                                  <span
                                    className={`px-2 py-0.5 rounded font-bold ${
                                      isCorrect
                                        ? "bg-emerald-50 text-emerald-700"
                                        : "bg-rose-50 text-rose-700"
                                    }`}
                                  >
                                    {isCorrect ? "Benar (+30)" : "Salah (0)"}
                                  </span>
                                ) : (
                                  <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded">
                                    Skor Esai: {att.essay_score ?? "Belum dinilai"}
                                  </span>
                                )}
                              </div>

                              <div className="text-slate-700 leading-snug">{q.question_text}</div>

                              <div className="pt-1.5 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] gap-1 bg-slate-50 p-2 rounded">
                                <div>
                                  <span className="text-slate-500">Jawaban Murid: </span>
                                  <strong className="text-indigo-900">
                                    {studentAns || "(Kosong)"}
                                  </strong>
                                </div>
                                {q.type === "multiple_choice" && (
                                  <div>
                                    <span className="text-slate-500">Kunci Jawaban: </span>
                                    <strong className="text-emerald-700">
                                      {q.correct_answer}
                                    </strong>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {att.teacher_feedback && (
                          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs text-emerald-950">
                            <strong>Catatan Guru:</strong> {att.teacher_feedback}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </TeacherWorkspaceShell>
  );
}
