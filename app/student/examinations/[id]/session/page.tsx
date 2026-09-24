"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { repository } from "@/lib/db/repository";
import { Exam, ExamAttempt, Question } from "@/lib/db/types";
import {
  Clock,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Sparkles,
  HelpCircle,
  Send,
  MapPin,
} from "lucide-react";

export default function StudentExamSessionPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params?.id as string;

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(30 * 60);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!examId) return;
    const ex = repository.getExam(examId);
    if (!ex) return;

    setExam(ex);
    const allQ = repository.getQuestions();
    const examQuestions = allQ.filter((q) => ex.question_ids.includes(q.id));
    setQuestions(examQuestions);

    // Get or start attempt for student "usr-student-01"
    const currentAtt = repository.startAttempt(ex.id, "usr-student-01", "Budi Santoso");
    setAttempt(currentAtt);
    setAnswers(currentAtt.answers || {});

    // Duration timer setup
    const durationSec = ex.duration_minutes * 60;
    setTimeLeftSeconds(durationSec);
  }, [examId]);

  const handleSubmitExam = () => {
    if (!attempt) return;
    setIsSubmitting(true);
    repository.submitAttempt(attempt.id);
    setTimeout(() => {
      router.push(`/student/examinations/${examId}/results`);
    }, 800);
  };

  // Countdown timer
  useEffect(() => {
    if (timeLeftSeconds <= 0) return;
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeftSeconds]);

  const handleSelectAnswer = (qId: string, answerKey: string) => {
    const updated = { ...answers, [qId]: answerKey };
    setAnswers(updated);
    if (attempt) {
      repository.saveAnswer(attempt.id, qId, answerKey);
    }
  };

  const handleEssayChange = (qId: string, text: string) => {
    const updated = { ...answers, [qId]: text };
    setAnswers(updated);
    if (attempt) {
      repository.saveAnswer(attempt.id, qId, text);
    }
  };

  if (!exam || questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center text-slate-500 text-sm">
          Menyiapkan ruang ujian...
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const answeredCount = Object.keys(answers).filter((k) => !!answers[k]?.trim()).length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between">
      {/* Top Header Bar */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 sticky top-0 z-30 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-xl bg-sky-50 text-sky-600 font-bold text-xs">
            {exam.subject}
          </span>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
              {exam.title}
            </h1>
            <p className="text-[11px] text-slate-400">
              Siswa: <strong>Budi Santoso</strong> &bull; {exam.class_name}
            </p>
          </div>
        </div>

        {/* Sync Timer */}
        <div
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono font-bold text-xs sm:text-sm ${
            timeLeftSeconds < 300
              ? "bg-rose-50 border-rose-200 text-rose-600 animate-pulse"
              : "bg-slate-50 border-slate-200 text-slate-700"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
        </div>
      </header>

      {/* Main Examination Center Area */}
      <main className="max-w-4xl mx-auto w-full p-4 sm:p-6 flex-1 flex flex-col gap-6">
        {/* Question Content Box */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex-1 flex flex-col justify-between">
          <div>
            {/* Top Indicator */}
            <div className="flex items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-sky-500 text-white text-xs font-extrabold">
                  Soal Nomor {currentIndex + 1}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  dari {questions.length} Soal
                </span>
              </div>

              {currentQ.is_contextualized && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                  <MapPin className="w-3 h-3 text-rose-500" />
                  Konteks {currentQ.context_variables?.[0]?.region_name || "Lokal"}
                </span>
              )}
            </div>

            {/* Supporting Contextual Media Image (if available) */}
            {(currentQ.image_url || currentQ.media_asset?.image_url) && (
              <div className="mb-5 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                <div className="relative max-h-72 w-full bg-slate-900/5 flex items-center justify-center overflow-hidden">
                  <img
                    src={currentQ.image_url || currentQ.media_asset?.image_url}
                    alt={currentQ.image_alt || currentQ.media_asset?.alt_text || "Gambar Kontekstual"}
                    className="w-full max-h-72 object-contain"
                  />
                </div>
                {(currentQ.image_caption || currentQ.media_asset?.caption || currentQ.image_attribution || currentQ.media_asset?.attribution_text) && (
                  <div className="px-3.5 py-2 bg-slate-100/80 border-t border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-1.5">
                    <span className="font-medium text-slate-700">
                      📷 {currentQ.image_caption || currentQ.media_asset?.caption || "Foto Konteks Pembelajaran"}
                    </span>
                    {(currentQ.image_attribution || currentQ.media_asset?.attribution_text) && (
                      <span className="text-[10px] text-slate-400">
                        Sumber: {currentQ.image_attribution || currentQ.media_asset?.attribution_text}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Question Text */}
            <div className="text-base sm:text-lg text-slate-900 font-medium leading-relaxed mb-6 whitespace-pre-line">
              {currentQ.question_text}
            </div>

            {/* Answer Options (Multiple Choice or Essay) */}
            {currentQ.type === "multiple_choice" && currentQ.options ? (
              <div className="space-y-3">
                {currentQ.options.map((opt) => {
                  const isSelected = answers[currentQ.id] === opt.key;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => handleSelectAnswer(currentQ.id, opt.key)}
                      className={`w-full p-4 rounded-2xl border-2 text-left flex items-center gap-3.5 transition-all cursor-pointer ${
                        isSelected
                          ? "bg-sky-50 border-sky-500 text-sky-950 font-bold shadow-xs ring-2 ring-sky-200"
                          : "bg-white border-slate-200 hover:border-slate-300 text-slate-800"
                      }`}
                    >
                      <span
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                          isSelected
                            ? "bg-sky-500 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {opt.key}
                      </span>
                      <span className="text-sm sm:text-base leading-snug">{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Tuliskan Jawaban Uraianmu:
                </label>
                <textarea
                  rows={6}
                  value={answers[currentQ.id] || ""}
                  onChange={(e) => handleEssayChange(currentQ.id, e.target.value)}
                  placeholder="Ketikkan penjelasanmu dengan kalimat yang lengkap dan jelas..."
                  className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm sm:text-base text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white transition-all"
                />
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors"
              >
                <span>Selanjutnya</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setIsSubmitModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-extrabold shadow-sm transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Kumpulkan Ujian</span>
              </button>
            )}
          </div>
        </div>

        {/* Question Palette (Numbers) */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Daftar Nomor Soal:</span>
            <span className="font-bold text-slate-900">
              ({answeredCount} dari {questions.length} Dijawab)
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {questions.map((q, idx) => {
              const isAnswered = !!answers[q.id]?.trim();
              const isCurrent = currentIndex === idx;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center transition-all ${
                    isCurrent
                      ? "ring-2 ring-sky-500 ring-offset-2 bg-sky-500 text-white"
                      : isAnswered
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </main>

      {/* Confirmation Modal Submit */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 text-center">
            <div className="w-14 h-14 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4 text-sky-600">
              <CheckCircle className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 mb-2">
              Kumpulkan Lembar Jawaban?
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
              Kamu telah menjawab <strong>{answeredCount}</strong> dari{" "}
              <strong>{questions.length}</strong> butir soal. Pastikan semua jawaban sudah kamu periksa kembali dengan teliti.
            </p>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Periksa Lagi
              </button>
              <button
                onClick={handleSubmitExam}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Menyimpan Jawaban..." : "Ya, Kumpulkan Sekarang"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
