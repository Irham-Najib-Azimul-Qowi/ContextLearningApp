"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/navbar";
import Container from "@/components/ui/container";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { FormattedTextWithMath } from "@/components/ui/math-view";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Send,
  Save,
  Check,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ExamSessionPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const examId = resolvedParams.id;

  const studentId = "student-demo-01";
  const studentName = "Budi Pratama";

  const [exam, setExam] = useState<any | null>(null);
  const [attempt, setAttempt] = useState<any | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);

  // Answers state: questionId -> { selectedOption, essayAnswer }
  const [answers, setAnswers] = useState<Record<string, { option?: string; essay?: string }>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // Timer state
  const [secondsRemaining, setSecondsRemaining] = useState<number>(45 * 60);

  // Submit confirmation modal
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load exam session
  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch(
          `/api/examinations/session?exam_id=${examId}&student_id=${studentId}&student_name=${encodeURIComponent(
            studentName
          )}`
        );
        const data = await res.json();
        if (data.success && data.exam) {
          setExam(data.exam);
          setAttempt(data.attempt);
          setQuestions(data.exam.questions || []);

          // Preload existing answers if any
          const ansMap: Record<string, { option?: string; essay?: string }> = {};
          if (data.saved_answers) {
            data.saved_answers.forEach((a: any) => {
              ansMap[a.question_id] = {
                option: a.selected_option,
                essay: a.essay_answer,
              };
            });
          }
          setAnswers(ansMap);

          // Calculate remaining timer from duration
          const durationSec = (data.exam.duration_minutes || 45) * 60;
          setSecondsRemaining(durationSec);
        }
      } catch (err) {
        console.error("Failed to load exam session:", err);
      }
    }
    loadSession();
  }, [examId]);

  // Timer countdown interval
  useEffect(() => {
    if (secondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsRemaining]);

  // Autosave handler
  const saveAnswerToServer = async (qId: string, option?: string, essay?: string) => {
    if (!attempt) return;
    setIsSaving(true);
    try {
      await fetch("/api/examinations/save-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attempt_id: attempt.id,
          question_id: qId,
          selected_option: option,
          essay_answer: essay,
        }),
      });
      setLastSavedTime(new Date().toLocaleTimeString("id-ID"));
    } catch (e) {
      console.warn("Failed to autosave answer:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectOption = (qId: string, optId: string) => {
    const updated = {
      ...answers,
      [qId]: { ...answers[qId], option: optId },
    };
    setAnswers(updated);
    saveAnswerToServer(qId, optId, answers[qId]?.essay);
  };

  const handleEssayChange = (qId: string, text: string) => {
    const updated = {
      ...answers,
      [qId]: { ...answers[qId], essay: text },
    };
    setAnswers(updated);
  };

  const handleEssayBlur = (qId: string) => {
    saveAnswerToServer(qId, answers[qId]?.option, answers[qId]?.essay);
  };

  const handleSubmitFinal = async () => {
    if (!attempt) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/examinations/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attempt_id: attempt.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengumpulkan lembar ujian.");

      router.push(`/student/examinations/${examId}/results`);
    } catch (err: any) {
      alert(err.message || "Gagal mengirimkan ujian.");
      setIsSubmitting(false);
    }
  };

  if (!exam || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <Container className="py-20 text-center">
          <p className="text-sm text-muted">Mempersiapkan lembar ujian kontekstual...</p>
        </Container>
      </div>
    );
  }

  const currentQ = questions[currentIdx];
  const answeredCount = Object.keys(answers).filter(
    (k) => answers[k]?.option || answers[k]?.essay?.trim()
  ).length;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <Container className="py-6 sm:py-8">
        {/* Exam Header Bar */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-border bg-white p-4 sm:p-5 shadow-xs">
          <div>
            <span className="text-xs font-semibold text-primary uppercase tracking-wider block">
              Lembar Ujian Aktif
            </span>
            <h1 className="text-lg font-bold text-foreground mt-0.5">{exam.title}</h1>
            <p className="text-xs text-muted">
              {exam.subject} • Kelas {exam.grade} SD • Peserta: <strong>{studentName}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Countdown Clock */}
            <div
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-mono font-bold shadow-2xs ${
                secondsRemaining < 300
                  ? "bg-red-50 text-error border border-red-200 animate-pulse"
                  : "bg-slate-100 text-foreground border border-slate-200"
              }`}
            >
              <Clock className="h-4 w-4 text-muted" />
              <span>Sisa Waktu: {timeFormatted}</span>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowSubmitModal(true)}
              className="shadow-xs"
            >
              <Send className="h-4 w-4 mr-1" /> Kumpulkan Ujian
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Question Area (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="shadow-xs">
              <CardHeader className="p-5 pb-3 border-b border-border/60 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary text-white text-xs font-bold shadow-xs">
                    {currentIdx + 1}
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    Butir Soal Nomor {currentIdx + 1} dari {questions.length}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted">
                  {isSaving ? (
                    <span className="text-primary animate-pulse">Menyimpan jawaban...</span>
                  ) : lastSavedTime ? (
                    <span className="flex items-center gap-1 text-success">
                      <CheckCircle2 className="h-3 w-3" /> Tersimpan {lastSavedTime}
                    </span>
                  ) : null}
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* Question Prompt */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5">
                  <p className="text-base text-foreground font-medium leading-relaxed whitespace-pre-line">
                    <FormattedTextWithMath text={currentQ.original_text} />
                  </p>
                </div>

                {/* Multiple Choice Answers */}
                {currentQ.question_type === "multiple_choice" && currentQ.options ? (
                  <div className="space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted block">
                      Pilih Jawaban yang Paling Tepat:
                    </span>

                    <div className="space-y-2.5">
                      {currentQ.options.map((opt: any) => {
                        const isSelected = answers[currentQ.id]?.option === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleSelectOption(currentQ.id, opt.id)}
                            className={`w-full text-left rounded-2xl border p-4 transition-all flex items-center gap-3 ${
                              isSelected
                                ? "border-primary bg-indigo-50/60 ring-2 ring-primary/20 text-foreground"
                                : "border-border bg-white hover:bg-slate-50 text-muted"
                            }`}
                          >
                            <span
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                                isSelected
                                  ? "bg-primary text-white shadow-xs"
                                  : "border border-slate-300 bg-slate-100 text-foreground"
                              }`}
                            >
                              {opt.id}
                            </span>
                            <span className="text-sm font-medium text-foreground">{opt.text}</span>
                            {isSelected && (
                              <Check className="h-4 w-4 text-primary ml-auto shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* Essay Input */
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted block">
                      Lembar Jawaban Uraian / Penjelasan:
                    </span>
                    <textarea
                      rows={6}
                      value={answers[currentQ.id]?.essay || ""}
                      onChange={(e) => handleEssayChange(currentQ.id, e.target.value)}
                      onBlur={() => handleEssayBlur(currentQ.id)}
                      placeholder="Ketikkan jawaban lengkap beserta penjelasan Anda di sini..."
                      className="w-full rounded-2xl border border-border bg-white p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed"
                    />
                    <p className="text-[11px] text-muted italic">
                      * Jawaban otomatis tersimpan saat Anda berpindah nomor soal.
                    </p>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="pt-4 border-t border-border/60 flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentIdx === 0}
                    onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" /> Soal Sebelumnya
                  </Button>

                  {currentIdx < questions.length - 1 ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
                    >
                      Soal Berikutnya <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setShowSubmitModal(true)}
                    >
                      Selesai &amp; Kumpulkan <Send className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Area: Question Number Roster (1 col) */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader className="py-4 border-b border-border/60">
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  <span>Nomor Soal</span>
                  <span className="text-xs text-muted font-normal">
                    {answeredCount} dari {questions.length} dijawab
                  </span>
                </CardTitle>
              </CardHeader>

              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-4 gap-2">
                  {questions.map((q, idx) => {
                    const isAnswered = Boolean(
                      answers[q.id]?.option || answers[q.id]?.essay?.trim()
                    );
                    const isCurrent = idx === currentIdx;

                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setCurrentIdx(idx)}
                        className={`h-11 rounded-xl text-xs font-bold transition-all flex items-center justify-center relative ${
                          isCurrent
                            ? "ring-2 ring-primary ring-offset-2 bg-primary text-white shadow-xs"
                            : isAnswered
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold"
                            : "bg-slate-100 text-muted hover:bg-slate-200"
                        }`}
                      >
                        {idx + 1}
                        {isAnswered && !isCurrent && (
                          <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-success" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-1.5 pt-2 border-t border-border/60 text-[11px] text-muted">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-md bg-emerald-50 border border-emerald-300" />
                    <span>Sudah dijawab</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-md bg-slate-100" />
                    <span>Belum dijawab</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-md bg-primary" />
                    <span>Nomor saat ini</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Submit Confirmation Modal */}
        <Modal
          isOpen={showSubmitModal}
          onClose={() => setShowSubmitModal(false)}
          title="Konfirmasi Pengumpulan Lembar Ujian"
          description="Apakah Anda yakin ingin mengumpulkan seluruh lembar jawaban?"
        >
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted">Total Soal Terjawab:</span>
                <strong className="text-foreground font-bold">
                  {answeredCount} dari {questions.length} Butir Soal
                </strong>
              </div>
              {answeredCount < questions.length && (
                <div className="flex items-center gap-1.5 text-warning font-semibold pt-1">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  Masih terdapat {questions.length - answeredCount} soal yang belum dijawab.
                </div>
              )}
            </div>

            <p className="text-xs text-muted leading-relaxed">
              Setelah dikumpulkan, jawaban Anda akan diperiksa dan dinilai secara otomatis oleh server. Anda tidak dapat mengubah jawaban setelah menekan tombol konfirmasi.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSubmitting}
                onClick={() => setShowSubmitModal(false)}
              >
                Kembali Periksa
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                isLoading={isSubmitting}
                onClick={handleSubmitFinal}
                className="shadow-xs"
              >
                Ya, Kumpulkan Sekarang
              </Button>
            </div>
          </div>
        </Modal>
      </Container>
    </div>
  );
}
