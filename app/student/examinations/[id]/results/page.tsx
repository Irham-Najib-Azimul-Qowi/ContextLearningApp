"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FormattedTextWithMath } from "@/components/ui/math-view";
import {
  Award,
  ArrowLeft,
  BookOpen,
} from "lucide-react";
import { repository } from "@/lib/db/repository";
import { Examination, Question } from "@/lib/db/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ExamResultsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const examId = resolvedParams.id;
  const studentId = "student-demo-01";

  const [exam, setExam] = useState<Examination | null>(null);
  const [attempt, setAttempt] = useState<any | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    const ex = repository.getExaminationById(examId) || repository.getExaminations()[0];
    if (ex) {
      setExam(ex);
      setQuestions(ex.questions || repository.getQuestions());
      const att = repository.getAttempt(ex.id, studentId) || {
        score: 85,
        status: "graded",
        submit_time: new Date().toISOString(),
      };
      setAttempt(att);
    }
  }, [examId]);

  if (!exam) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-foreground-muted">Memuat hasil evaluasi...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-surface p-5 rounded-xl border border-border shadow-xs">
        <Link href="/student/examinations" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 mb-2">
          <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Daftar Ujian
        </Link>
        <div className="flex items-center gap-2 mb-1.5">
          <Badge variant="success">Hasil Penilaian Terbit</Badge>
          <span className="text-xs text-foreground-secondary">{exam.subject} • Kelas {exam.grade}</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Hasil Penilaian &amp; Pembahasan Ujian
        </h1>
        <p className="text-xs text-foreground-secondary mt-0.5">
          {exam.title} • Peserta: <strong className="text-foreground">Budi Pratama</strong> (Kelas 5-A Mahakam)
        </p>
      </div>

      {/* Score Summary Banner */}
      <div className="rounded-xl border border-success/30 bg-gradient-to-r from-emerald-50/70 to-surface p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-success flex items-center gap-1.5">
            <Award className="h-4 w-4 text-success" /> Capaian Nilai Akhir Siswa
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black text-success font-mono">
              {attempt?.score ?? 85}
            </span>
            <span className="text-lg text-foreground-secondary font-bold">/ 100 Poin</span>
          </div>
          <p className="text-xs text-foreground-secondary max-w-md mt-1 leading-relaxed">
            Selamat! Kamu telah menyelesaikan ujian berbasis karakteristik lingkungan lokal dengan hasil yang memuaskan.
          </p>
        </div>

        <div className="rounded-xl bg-surface border border-border p-4 space-y-2 text-xs shadow-2xs min-w-[240px]">
          <div className="flex items-center justify-between">
            <span className="text-foreground-secondary">Pilihan Ganda:</span>
            <strong className="text-success font-bold">Benar 2 / 2 Soal</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-foreground-secondary">Soal Uraian / Essay:</span>
            <strong className="text-primary font-bold">Dinilai Guru (9/10 Poin)</strong>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-foreground-secondary">Status Kelulusan:</span>
            <Badge variant="success">Tuntas</Badge>
          </div>
        </div>
      </div>
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" /> Pembahasan Butir Soal &amp; Kunci Jawaban
          </h2>

          <div className="space-y-4">
            {questions.map((q, idx) => (
              <Card key={q.id} className="border-border bg-surface shadow-xs">
                <CardHeader className="p-5 pb-3 border-b border-border flex flex-row items-center justify-between bg-surface-secondary">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                      {idx + 1}
                    </span>
                    <Badge variant="secondary">{q.subject}</Badge>
                    <span className="text-xs font-medium text-foreground-secondary">• {q.topic}</span>
                  </div>

                  <Badge variant={idx < 2 ? "success" : "primary"}>
                    {idx < 2 ? "Benar (+10 Poin)" : "Dinilai Guru (+9 Poin)"}
                  </Badge>
                </CardHeader>

                <CardContent className="p-5 space-y-4">
                  {/* Question Text */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-foreground-secondary block mb-1">
                      Naskah Soal:
                    </span>
                    <div className="text-sm sm:text-base font-medium text-foreground leading-relaxed">
                      <FormattedTextWithMath text={q.original_text} />
                    </div>
                  </div>

                  {/* Options Review for MCQ */}
                  {q.question_type === "multiple_choice" && q.options && (
                    <div className="space-y-2 pt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-foreground-secondary block">
                        Pilihan Jawaban:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt) => {
                          const isCorrect = opt.id === q.correct_answer;
                          return (
                            <div
                              key={opt.id}
                              className={`flex items-center gap-2 rounded-xl border p-2.5 text-xs font-medium ${
                                isCorrect
                                  ? "border-success/40 bg-emerald-50/70 text-emerald-900"
                                  : "border-border bg-surface-secondary text-foreground-secondary"
                              }`}
                            >
                              <span
                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md font-bold text-[11px] ${
                                  isCorrect
                                    ? "bg-success text-white"
                                    : "bg-surface border border-border text-foreground-secondary"
                                }`}
                              >
                                {opt.id}
                              </span>
                              <span className="text-foreground">{opt.text}</span>
                              {isCorrect && (
                                <span className="ml-auto text-[10px] font-bold text-success uppercase">
                                  Kunci Jawaban Benar
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Essay Answer & Feedback */}
                  {q.question_type === "essay" && (
                    <div className="space-y-3 pt-2">
                      <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
                          Jawaban yang Kamu Kirimkan:
                        </span>
                        <p className="text-xs text-foreground leading-relaxed">
                          &quot;Karena kami tinggal di dekat Sungai Mahakam, warga banyak yang menjadi nelayan ikan haruan dan pengemudi perahu klotok untuk mengantar orang ke Pasar Pagi.&quot;
                        </p>
                      </div>

                      <div className="rounded-xl border border-border bg-surface-secondary p-3 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-foreground-secondary block">
                          Catatan Umpan Balik Guru (Ibu Nurhaliza, S.Pd.):
                        </span>
                        <p className="text-xs text-foreground-secondary leading-relaxed">
                          &quot;Jawaban sangat baik dan tepat menyebutkan contoh nyata aktivitas masyarakat di Sungai Mahakam. Pertahankan kecermatanmu!&quot;
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Explanation */}
                  {q.explanation && (
                    <div className="rounded-xl bg-surface-secondary p-3.5 border border-border text-xs text-foreground-secondary space-y-1">
                      <strong className="text-foreground">Pembahasan:</strong>
                      <p className="leading-relaxed">{q.explanation}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
    </div>
  );
}
