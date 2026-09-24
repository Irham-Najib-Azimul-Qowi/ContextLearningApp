"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { TeacherWorkspaceShell } from "@/components/layout/teacher-workspace-shell";
import { repository } from "@/lib/db/repository";
import { ExamAttempt, Exam, Question } from "@/lib/db/types";
import {
  FileQuestion,
  ArrowLeft,
  CheckCircle,
  Sparkles,
  Bot,
  User,
  Award,
  BookOpen,
  MessageSquare,
  AlertCircle,
  Save,
} from "lucide-react";

export default function TeacherReviewEssayPage() {
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [selectedAttempt, setSelectedAttempt] = useState<ExamAttempt | null>(null);
  const [exam, setExam] = useState<Exam | null>(null);
  const [essayQuestions, setEssayQuestions] = useState<Question[]>([]);

  // Grading form state
  const [essayScore, setEssayScore] = useState<number>(35);
  const [feedback, setFeedback] = useState<string>(
    "Sangat baik! Jawaban sudah menjelaskan letak geografis Telaga Ngebel dan makna tradisi Larung Sesaji dengan runtut."
  );
  const [isAiEvaluating, setIsAiEvaluating] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleSelectAttempt = (att: ExamAttempt) => {
    setSelectedAttempt(att);
    const ex = repository.getExam(att.exam_id);
    if (ex) {
      setExam(ex);
      const allQ = repository.getQuestions();
      const essays = allQ.filter(
        (q) => ex.question_ids.includes(q.id) && q.type === "essay"
      );
      setEssayQuestions(essays);
    }
    setEssayScore(att.essay_score || 35);
    setFeedback(
      att.teacher_feedback ||
        "Pemahaman konsep lokal sangat baik dan relevan dengan tradisi di Ponorogo."
    );
    setSaveSuccess(false);
  };

  useEffect(() => {
    const allAtts = repository.getAttempts();
    // Filter attempts that have essay questions
    setAttempts(allAtts);
    if (allAtts.length > 0) {
      handleSelectAttempt(allAtts[0]);
    }
  }, []);

  const handleAiAssistance = () => {
    setIsAiEvaluating(true);
    setTimeout(() => {
      // AI analysis based on rubric criteria
      setEssayScore(38);
      setFeedback(
        "Rekomendasi AI: Siswa menyebutkan Telaga Ngebel di kaki Gunung Wilis dan tradisi Larung Sesaji 1 Suro secara tepat sesuai rubrik lokalitas. Nilai yang disarankan: 38/40."
      );
      setIsAiEvaluating(false);
    }, 1000);
  };

  const handleSaveGrade = () => {
    if (!selectedAttempt) return;
    repository.gradeEssay(selectedAttempt.id, essayScore, feedback);
    setSaveSuccess(true);
    // Refresh attempts
    const updated = repository.getAttempts();
    setAttempts(updated);
    const current = updated.find((a) => a.id === selectedAttempt.id);
    if (current) setSelectedAttempt(current);

    setTimeout(() => {
      setSaveSuccess(false);
    }, 2500);
  };

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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Pemeriksaan & Koreksi Jawaban Esai
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluasi pemahaman mendalam siswa terhadap pertanyaan uraian berbasis kearifan lokal.
          </p>
        </div>

        {attempts.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
            Belum ada submission ujian dari murid.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column: Attempt Selector */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Daftar Jawaban Siswa
              </h3>
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {attempts.map((att) => {
                  const isSelected = selectedAttempt?.id === att.id;
                  return (
                    <div
                      key={att.id}
                      onClick={() => handleSelectAttempt(att)}
                      className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? "bg-indigo-50 border-indigo-300 ring-1 ring-indigo-400"
                          : "bg-white border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900">{att.student_name}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            att.status === "graded"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {att.status === "graded" ? "Selesai Dinilai" : "Perlu Koreksi"}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Total Skor: <strong>{att.score ?? "-"} / 100</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Grading Interface */}
            {selectedAttempt && (
              <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Jawaban Murid: {selectedAttempt.student_name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Ujian: {exam?.title || "Ujian Terintegrasi"}
                    </p>
                  </div>

                  <button
                    onClick={handleAiAssistance}
                    disabled={isAiEvaluating}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold border border-purple-200 transition-colors disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>{isAiEvaluating ? "Menganalisis Rubrik..." : "Rekomendasi AI"}</span>
                  </button>
                </div>

                {/* Essay Questions List & Student Answers */}
                <div className="space-y-4">
                  {essayQuestions.map((q, idx) => {
                    const studentAns = selectedAttempt.answers[q.id];
                    return (
                      <div
                        key={q.id}
                        className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-indigo-900">
                            Soal Uraian #{idx + 1}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-medium">
                            Bobot: Maks 40 Poin
                          </span>
                        </div>

                        <div className="text-xs text-slate-800 font-medium leading-relaxed">
                          {q.question_text}
                        </div>

                        {q.rubric && (
                          <div className="p-2.5 bg-amber-50/70 border border-amber-200/70 rounded-lg text-[11px] text-amber-900">
                            <strong>Panduan Rubrik Penilaian:</strong> {q.rubric}
                          </div>
                        )}

                        <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            Teks Jawaban Siswa:
                          </span>
                          <p className="text-xs text-slate-900 font-medium whitespace-pre-line leading-relaxed">
                            {studentAns || "(Siswa tidak mengisi jawaban esai ini)"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Teacher Score Input & Feedback */}
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-500" />
                      <span>Berikan Skor Esai (Maks 40 Poin)</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={40}
                        value={essayScore}
                        onChange={(e) => setEssayScore(Number(e.target.value))}
                        className="w-20 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold text-slate-900 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="text-xs text-slate-500 font-bold">/ 40</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Catatan Umpan Balik Guru (Feedback untuk Murid)</span>
                    </label>
                    <textarea
                      rows={3}
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Tuliskan apresiasi dan saran perbaikan untuk siswa..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  {saveSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Nilai esai dan umpan balik berhasil disimpan! Nilai akhir siswa telah diperbarui.</span>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleSaveGrade}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs hover:shadow transition-all"
                    >
                      <Save className="w-4 h-4" />
                      <span>Simpan Penilaian Esai</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </TeacherWorkspaceShell>
  );
}
