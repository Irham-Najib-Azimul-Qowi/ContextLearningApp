"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { StudentWorkspaceShell } from "@/components/layout/student-workspace-shell";
import { repository } from "@/lib/db/repository";
import { Exam, ExamAttempt, Question } from "@/lib/db/types";
import {
  Award,
  ArrowLeft,
  CheckCircle,
  XCircle,
  HelpCircle,
  Sparkles,
  MapPin,
  Clock,
  BookOpen,
  MessageSquare,
} from "lucide-react";

export default function StudentExamResultsPage() {
  const params = useParams();
  const examId = params?.id as string;

  const [exam, setExam] = useState<Exam | null>(null);
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    if (!examId) return;
    const ex = repository.getExam(examId);
    if (!ex) return;
    setExam(ex);

    const att = repository.getStudentAttempt(examId, "usr-student-01");
    setAttempt(att || null);

    const allQ = repository.getQuestions();
    const examQuestions = allQ.filter((q) => ex.question_ids.includes(q.id));
    setQuestions(examQuestions);
  }, [examId]);

  if (!exam || !attempt) {
    return (
      <StudentWorkspaceShell>
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <p className="text-slate-500 text-sm">
            Data hasil ujian belum ditemukan atau belum diserahkan.
          </p>
          <div className="mt-4">
            <Link
              href="/student/examinations"
              className="text-xs font-bold text-sky-600 underline"
            >
              Kembali ke Daftar Ujian
            </Link>
          </div>
        </div>
      </StudentWorkspaceShell>
    );
  }

  const isGraded = attempt.status === "graded";
  const mcQuestions = questions.filter((q) => q.type === "multiple_choice");
  let mcCorrectCount = 0;
  mcQuestions.forEach((q) => {
    if (
      attempt.answers[q.id]?.trim().toUpperCase() === q.correct_answer.trim().toUpperCase()
    ) {
      mcCorrectCount++;
    }
  });

  return (
    <StudentWorkspaceShell>
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        {/* Back Link */}
        <div>
          <Link
            href="/student/examinations"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Daftar Ujian
          </Link>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Hasil Penilaian & Pembahasan
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ujian: <strong>{exam.title}</strong> &bull; {exam.class_name}
          </p>
        </div>

        {/* Score Banner */}
        <div className="bg-gradient-to-r from-indigo-600 via-sky-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold mb-2">
              <Award className="w-3.5 h-3.5" />
              {isGraded ? "Penilaian Selesai" : "Pilihan Ganda Dinilai (Menunggu Esai)"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold">
              Hebat, Budi Santoso!
            </h2>
            <p className="text-xs sm:text-sm text-white/90 mt-1 max-w-md">
              Kamu telah menyelesaikan sesi evaluasi pembelajaran terkontekstualisasi wilayah Ponorogo.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-center min-w-[150px]">
            <span className="text-[11px] font-bold text-white/80 block uppercase tracking-wider">
              Nilai Diperoleh
            </span>
            <div className="text-4xl sm:text-5xl font-extrabold my-1">
              {attempt.score ?? attempt.mc_score}
            </div>
            <span className="text-xs text-white/80 font-medium">dari 100 Poin</span>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
            <span className="text-xs text-slate-400 font-bold block mb-1">
              Pilihan Ganda Benar
            </span>
            <div className="text-2xl font-extrabold text-emerald-600">
              {mcCorrectCount} / {mcQuestions.length}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Skor PG: {attempt.mc_score ?? 0} Poin
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
            <span className="text-xs text-slate-400 font-bold block mb-1">
              Nilai Soal Uraian (Esai)
            </span>
            <div className="text-2xl font-extrabold text-indigo-600">
              {attempt.essay_score !== undefined ? `${attempt.essay_score} / 40` : "Menunggu"}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              {isGraded ? "Telah dikoreksi Guru" : "Sedang diperiksa Guru"}
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
            <span className="text-xs text-slate-400 font-bold block mb-1">
              Waktu Pengumpulan
            </span>
            <div className="text-base font-extrabold text-slate-800 my-1">
              {attempt.submitted_at
                ? new Date(attempt.submitted_at).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "-"}
            </div>
            <span className="text-[11px] text-emerald-600 font-bold">Tepat Waktu</span>
          </div>
        </div>

        {/* Teacher Feedback Note if available */}
        {attempt.teacher_feedback && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-1">
                Catatan & Saran Ibu Guru Siti Aminah, S.Pd.
              </h4>
              <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed font-medium">
                &ldquo;{attempt.teacher_feedback}&rdquo;
              </p>
            </div>
          </div>
        )}

        {/* Question Discussion (Pembahasan Soal Berbasis Konteks Daerah) */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-sky-600" />
              <span>Pembahasan Soal & Kearifan Lokal</span>
            </h3>
            <span className="text-xs text-slate-400">
              {questions.length} Butir Soal Terkontekstualisasi
            </span>
          </div>

          <div className="space-y-4">
            {questions.map((q, idx) => {
              const studentAns = attempt.answers[q.id];
              const isCorrect =
                q.type === "multiple_choice" &&
                studentAns?.trim().toUpperCase() === q.correct_answer.trim().toUpperCase();

              return (
                <div
                  key={q.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-800 font-extrabold text-xs">
                        Nomor {idx + 1}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {q.subject} &bull; {q.type === "multiple_choice" ? "Pilihan Ganda" : "Esai"}
                      </span>
                    </div>

                    {q.type === "multiple_choice" ? (
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold ${
                          isCorrect
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {isCorrect ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" />
                            Jawabanmu Benar
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            Jawabanmu Kurang Tepat
                          </>
                        )}
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
                        Skor Esai: {attempt.essay_score ?? "Menunggu Review"}
                      </span>
                    )}
                  </div>

                  <p className="text-sm sm:text-base text-slate-900 font-medium leading-relaxed">
                    {q.question_text}
                  </p>

                  {/* Supporting Media (if available) */}
                  {(q.image_url || q.media_asset?.image_url) && (
                    <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                      <div className="max-h-60 w-full bg-slate-900/5 flex items-center justify-center overflow-hidden">
                        <img
                          src={q.image_url || q.media_asset?.image_url}
                          alt={q.image_alt || q.media_asset?.alt_text || "Foto Soal"}
                          className="w-full max-h-60 object-contain"
                        />
                      </div>
                      {(q.image_caption || q.media_asset?.caption) && (
                        <div className="px-3 py-1.5 bg-slate-100/90 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                          <span>📷 {q.image_caption || q.media_asset?.caption}</span>
                          {(q.image_attribution || q.media_asset?.attribution_text) && (
                            <span className="text-[10px] text-slate-400">
                              {q.image_attribution || q.media_asset?.attribution_text}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Student Answer vs Key */}
                  <div className="p-3.5 bg-slate-50 rounded-xl text-xs space-y-2 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Jawabanmu:</span>
                      <span className="font-bold text-slate-900">
                        {studentAns ? (
                          q.type === "multiple_choice" ? (
                            `Pilihan ${studentAns}`
                          ) : (
                            studentAns
                          )
                        ) : (
                          <span className="text-rose-500">(Tidak dijawab)</span>
                        )}
                      </span>
                    </div>

                    {q.type === "multiple_choice" && (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                        <span className="text-slate-500">Kunci Jawaban yang Benar:</span>
                        <span className="font-bold text-emerald-700">
                          Pilihan {q.correct_answer}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Context Explanation */}
                  {q.explanation && (
                    <div className="p-4 bg-sky-50/70 border border-sky-100 rounded-xl text-xs leading-relaxed text-sky-950 flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-bold mb-0.5 text-sky-900">
                          Mengapa contoh ini digunakan di sekolah kita?
                        </strong>
                        <span>{q.explanation}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Back to Home CTA */}
        <div className="pt-4 flex justify-center">
          <Link
            href="/student/dashboard"
            className="px-6 py-3 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-extrabold shadow-xs transition-colors"
          >
            Kembali ke Beranda Belajar
          </Link>
        </div>
      </div>
    </StudentWorkspaceShell>
  );
}
