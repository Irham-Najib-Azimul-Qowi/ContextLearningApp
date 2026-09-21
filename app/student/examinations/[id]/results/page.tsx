"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/navbar";
import Container from "@/components/ui/container";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormattedTextWithMath } from "@/components/ui/math-view";
import {
  Award,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  BookOpen,
  ClipboardList,
  Sparkles,
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
      <div className="min-h-screen bg-background">
        <Navbar />
        <Container className="py-20 text-center">
          <p className="text-sm text-muted">Memuat hasil evaluasi...</p>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <Container className="py-8 sm:py-10">
        <div className="mb-6">
          <Link href="/student/examinations" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 mb-2">
            <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Daftar Ujian
          </Link>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="success">Hasil Penilaian Terbit</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Hasil Penilaian &amp; Pembahasan Ujian
          </h1>
          <p className="text-sm text-muted mt-1">
            {exam.title} • Peserta: <strong>Budi Pratama</strong> (Kelas 5-A Mahakam)
          </p>
        </div>

        {/* Score Summary Banner */}
        <div className="mb-8 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-indigo-50/40 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <Award className="h-4 w-4 text-success" /> Capaian Nilai Akhir Siswa
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black text-emerald-700">
                {attempt?.score ?? 85}
              </span>
              <span className="text-lg text-muted font-bold">/ 100 Poin</span>
            </div>
            <p className="text-xs text-muted max-w-md mt-1 leading-relaxed">
              Selamat! Kamu telah menyelesaikan ujian berbasis karakteristik lingkungan lokal dengan hasil yang memuaskan.
            </p>
          </div>

          <div className="rounded-xl bg-white border border-border p-4 space-y-2 text-xs shadow-2xs min-w-[240px]">
            <div className="flex items-center justify-between">
              <span className="text-muted">Pilihan Ganda:</span>
              <strong className="text-success font-bold">Benar 2 / 2 Soal</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Soal Uraian / Essay:</span>
              <strong className="text-primary font-bold">Dinilai Guru (9/10 Poin)</strong>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-border/60">
              <span className="text-muted">Status Kelulusan:</span>
              <Badge variant="success">Tuntas</Badge>
            </div>
          </div>
        </div>

        {/* Question by Question Review */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" /> Pembahasan Butir Soal &amp; Kunci Jawaban
          </h2>

          <div className="space-y-4">
            {questions.map((q, idx) => (
              <Card key={q.id} className="border-border">
                <CardHeader className="p-5 pb-3 border-b border-border/60 flex flex-row items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-primary">
                      {idx + 1}
                    </span>
                    <Badge variant="secondary">{q.subject}</Badge>
                    <span className="text-xs font-medium text-muted">• {q.topic}</span>
                  </div>

                  <Badge variant={idx === 0 ? "success" : idx === 1 ? "success" : "primary"}>
                    {idx < 2 ? "Benar (+10 Poin)" : "Dinilai Guru (+9 Poin)"}
                  </Badge>
                </CardHeader>

                <CardContent className="p-5 space-y-4">
                  {/* Question Text */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-1">
                      Naskah Soal:
                    </span>
                    <p className="text-sm font-medium text-foreground leading-relaxed">
                      <FormattedTextWithMath text={q.original_text} />
                    </p>
                  </div>

                  {/* Options Review for MCQ */}
                  {q.question_type === "multiple_choice" && q.options && (
                    <div className="space-y-2 pt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted block">
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
                                  ? "border-emerald-300 bg-emerald-50/70 text-emerald-900"
                                  : "border-border bg-slate-50/40 text-muted"
                              }`}
                            >
                              <span
                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md font-bold text-[11px] ${
                                  isCorrect
                                    ? "bg-success text-white"
                                    : "bg-white border border-border text-muted"
                                }`}
                              >
                                {opt.id}
                              </span>
                              <span>{opt.text}</span>
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
                      <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
                          Jawaban yang Kamu Kirimkan:
                        </span>
                        <p className="text-xs text-foreground leading-relaxed">
                          &quot;Karena kami tinggal di dekat Sungai Mahakam, warga banyak yang menjadi nelayan ikan haruan dan pengemudi perahu klotok untuk mengantar orang ke Pasar Pagi.&quot;
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted block">
                          Catatan Umpan Balik Guru (Ibu Nurhaliza, S.Pd.):
                        </span>
                        <p className="text-xs text-muted leading-relaxed">
                          &quot;Jawaban sangat baik dan tepat menyebutkan contoh nyata aktivitas masyarakat di Sungai Mahakam. Pertahankan kecermatanmu!&quot;
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Explanation */}
                  {q.explanation && (
                    <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 text-xs text-muted space-y-1">
                      <strong className="text-foreground">Pembahasan:</strong>
                      <p className="leading-relaxed">{q.explanation}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
