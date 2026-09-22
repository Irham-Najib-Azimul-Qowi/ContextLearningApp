"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
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
      <div className="py-20 text-center">
        <p className="text-sm text-foreground-muted">Mempersiapkan lembar ujian kontekstual...</p>
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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Exam Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-border bg-surface p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary">Lembar Ujian Aktif</Badge>
            <span className="text-xs text-foreground-secondary">{exam.subject} • Kelas {exam.grade}</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-foreground mt-0.5">{exam.title}</h1>
          <p className="text-xs text-foreground-secondary mt-0.5">
            Peserta: <strong className="text-foreground">{studentName}</strong> • {answeredCount} dari {questions.length} soal dijawab
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Countdown Clock */}
          <div
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-mono font-bold ${
              secondsRemaining < 300
                ? "bg-red-50 text-error border border-red-200 animate-pulse"
                : "bg-surface-secondary text-foreground border border-border"
            }`}
          >
            <Clock className="h-4 w-4 text-foreground-secondary" />
            <span>{timeFormatted}</span>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowSubmitModal(true)}
            className="bg-primary hover:bg-primary-hover text-xs font-semibold shadow-xs"
          >
            <Send className="h-4 w-4 mr-1.5" /> Kumpulkan Ujian
          </Button>
        </div>
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Question Area (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="shadow-xs border-border bg-surface">
              <CardHeader className="p-5 pb-3 border-b border-border flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white text-xs font-bold shadow-xs">
                    {currentIdx + 1}
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    Butir Soal Nomor {currentIdx + 1} dari {questions.length}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-foreground-secondary">
                  {isSaving ? (
                    <span className="text-primary animate-pulse font-medium">Menyimpan...</span>
                  ) : lastSavedTime ? (
                    <span className="flex items-center gap-1 text-success font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Tersimpan {lastSavedTime}
                    </span>
                  ) : null}
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* Question Prompt (16-18px readable) */}
                <div className="rounded-xl border border-border bg-surface-secondary p-5">
                  <div className="text-base sm:text-lg text-foreground font-medium leading-relaxed whitespace-pre-line">
                    <FormattedTextWithMath text={currentQ.original_text} />
                  </div>
                </div>

                {/* Multiple Choice Answers */}
                {currentQ.question_type === "multiple_choice" && currentQ.options ? (
                  <div className="space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground-secondary block">
                      Pilih Jawaban yang Paling Tepat:
                    </span>

                    <div className="space-y-3">
                      {currentQ.options.map((opt: any) => {
                        const isSelected = answers[currentQ.id]?.option === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleSelectOption(currentQ.id, opt.id)}
                            className={`w-full text-left rounded-xl border-2 p-4 transition-all flex items-center gap-3.5 ${
                              isSelected
                                ? "border-primary bg-primary/5 ring-2 ring-primary/20 text-foreground"
                                : "border-border bg-surface hover:bg-surface-secondary hover:border-border-strong text-foreground"
                            }`}
                          >
                            <span
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                                isSelected
                                  ? "bg-primary text-white shadow-xs"
                                  : "border border-border-strong bg-surface-secondary text-foreground"
                              }`}
                            >
                              {opt.id}
                            </span>
                            <span className="text-sm sm:text-base font-medium text-foreground">{opt.text}</span>
                            {isSelected && (
                              <Check className="h-5 w-5 text-primary ml-auto shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* Essay Input */
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground-secondary block">
                      Lembar Jawaban Uraian / Penjelasan:
                    </span>
                    <textarea
                      rows={7}
                      value={answers[currentQ.id]?.essay || ""}
                      onChange={(e) => handleEssayChange(currentQ.id, e.target.value)}
                      onBlur={() => handleEssayBlur(currentQ.id)}
                      placeholder="Ketikkan jawaban lengkap beserta penjelasan Anda di sini..."
                      className="w-full rounded-xl border border-border bg-surface p-4 text-sm font-normal text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary leading-relaxed"
                    />
                    <p className="text-[11px] text-foreground-secondary italic">
                      * Jawaban otomatis tersimpan saat Anda berpindah nomor soal.
                    </p>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentIdx === 0}
                    onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                    className="border-border text-foreground hover:bg-surface-secondary"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" /> Soal Sebelumnya
                  </Button>

                  {currentIdx < questions.length - 1 ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
                      className="bg-primary hover:bg-primary-hover font-semibold"
                    >
                      Soal Berikutnya <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setShowSubmitModal(true)}
                      className="bg-success hover:bg-success/90 font-semibold"
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
            <Card className="border-border bg-surface shadow-xs">
              <CardHeader className="py-4 border-b border-border">
                <div className="text-sm font-bold text-foreground flex items-center justify-between">
                  <span>Nomor Soal</span>
                  <span className="text-xs text-foreground-secondary font-normal">
                    {answeredCount} / {questions.length} dijawab
                  </span>
                </div>
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
                        className={`h-11 rounded-lg text-xs font-bold transition-all flex items-center justify-center relative ${
                          isCurrent
                            ? "ring-2 ring-primary ring-offset-2 bg-primary text-white shadow-xs"
                            : isAnswered
                            ? "bg-emerald-50 text-success border border-emerald-300 font-semibold"
                            : "bg-surface-secondary text-foreground-secondary hover:bg-border/60 border border-border"
                        }`}
                      >
                        {idx + 1}
                        {isAnswered && !isCurrent && (
                          <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-surface" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-1.5 pt-3 border-t border-border text-[11px] text-foreground-secondary">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded bg-emerald-50 border border-emerald-300" />
                    <span>Sudah dijawab</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded bg-surface-secondary border border-border" />
                    <span>Belum dijawab</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded bg-primary" />
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
            <div className="rounded-xl border border-border bg-surface-secondary p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-foreground-secondary">Total Soal Terjawab:</span>
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

            <p className="text-xs text-foreground-secondary leading-relaxed">
              Setelah dikumpulkan, jawaban Anda akan diperiksa dan dinilai secara otomatis oleh server. Anda tidak dapat mengubah jawaban setelah menekan tombol konfirmasi.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSubmitting}
                onClick={() => setShowSubmitModal(false)}
                className="border-border text-foreground hover:bg-surface-secondary"
              >
                Kembali Periksa
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                isLoading={isSubmitting}
                onClick={handleSubmitFinal}
                className="bg-primary hover:bg-primary-hover font-semibold shadow-xs"
              >
                Ya, Kumpulkan Sekarang
              </Button>
            </div>
          </div>
        </Modal>
    </div>
  );
}
