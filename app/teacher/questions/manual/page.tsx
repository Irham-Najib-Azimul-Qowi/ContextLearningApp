"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Sparkles, Save, Brain, School as SchoolIcon } from "lucide-react";
import { TeacherWorkspaceShell } from "@/components/layout/teacher-workspace-shell";
import { repository } from "@/lib/db/repository";
import { School } from "@/lib/db/types";

export default function ManualQuestionPage() {
  const router = useRouter();
  const [activeSchool, setActiveSchool] = useState<School | null>(null);

  // Form states
  const [subject, setSubject] = useState<"Matematika" | "Bahasa Indonesia" | "IPS">("Matematika");
  const [grade, setGrade] = useState<number>(5);
  const [topic, setTopic] = useState<string>("Aritmetika Sosial");
  const [type, setType] = useState<"multiple_choice" | "essay">("multiple_choice");
  const [questionText, setQuestionText] = useState<string>(
    "Seorang pedagang membeli 20 kg beras dengan harga Rp12.000 per kilogram. Berapa total uang yang harus dibayarkan?"
  );

  // Options for Multiple Choice
  const [options, setOptions] = useState([
    { key: "A", text: "Rp220.000" },
    { key: "B", text: "Rp240.000" },
    { key: "C", text: "Rp260.000" },
    { key: "D", text: "Rp280.000" },
  ]);
  const [correctAnswer, setCorrectAnswer] = useState<string>("B");
  const [explanation, setExplanation] = useState<string>(
    "20 kg × Rp12.000/kg = Rp240.000."
  );
  const [rubric, setRubric] = useState<string>("");

  useEffect(() => {
    setActiveSchool(repository.getActiveSchool());
  }, []);

  const handleSaveDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSchool || !questionText) return;

    const teacher = repository.getCurrentUser();
    repository.saveQuestion({
      school_id: activeSchool.id,
      teacher_id: teacher.id,
      subject,
      grade,
      topic,
      type,
      question_text: questionText,
      options: type === "multiple_choice" ? options : undefined,
      correct_answer: type === "multiple_choice" ? correctAnswer : "",
      explanation,
      rubric: type === "essay" ? rubric : undefined,
      is_contextualized: false,
    });

    router.push("/teacher/questions");
  };

  const handleAnalyzeContext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSchool || !questionText) return;

    const teacher = repository.getCurrentUser();
    const saved = repository.saveQuestion({
      school_id: activeSchool.id,
      teacher_id: teacher.id,
      subject,
      grade,
      topic,
      type,
      question_text: questionText,
      options: type === "multiple_choice" ? options : undefined,
      correct_answer: type === "multiple_choice" ? correctAnswer : "",
      explanation,
      rubric: type === "essay" ? rubric : undefined,
      is_contextualized: false,
    });

    // Directly open Contextual AI Preview
    router.push(`/teacher/questions/context-preview?id=${saved.id}`);
  };

  return (
    <TeacherWorkspaceShell activeGroupId="questions">
      {/* Back button */}
      <div className="flex items-center gap-2 mb-6">
        <Link
          href="/teacher/questions"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Bank Soal</span>
        </Link>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              ✍️
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950">
                Input Butir Soal Manual
              </h1>
              <p className="text-xs text-slate-500">
                Tulis naskah soal standar dan gunakan fitur analisis konteks lokal {activeSchool?.region_name}
              </p>
            </div>
          </div>
        </div>

        {/* Editor Form */}
        <form className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5 text-xs">
          {/* Metadata Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-900 block mb-1">Mata Pelajaran</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Matematika">Matematika</option>
                <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                <option value="IPS">IPS</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-900 block mb-1">Tingkat Kelas SD</label>
              <select
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-indigo-500"
              >
                {[1, 2, 3, 4, 5, 6].map((g) => (
                  <option key={g} value={g}>
                    Kelas {g} SD
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-900 block mb-1">Bentuk Soal</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-indigo-500"
              >
                <option value="multiple_choice">Pilihan Ganda</option>
                <option value="essay">Uraian / Esai</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-900 block mb-1">Topik / Materi</label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Question Text */}
          <div>
            <label className="font-bold text-slate-900 block mb-1">
              Pertanyaan / Naskah Soal Asli
            </label>
            <textarea
              rows={4}
              required
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Ketik soal asli di sini..."
              className="w-full p-3.5 rounded-xl border border-slate-200 font-medium text-slate-900 leading-relaxed focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          {/* Options for Multiple Choice */}
          {type === "multiple_choice" && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="font-bold text-slate-900 block">Pilihan Jawaban & Kunci</label>
              <div className="space-y-2">
                {options.map((opt, idx) => (
                  <div key={opt.key} className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setCorrectAnswer(opt.key)}
                      className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center border transition-all ${
                        correctAnswer === opt.key
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "bg-white border-slate-300 text-slate-600 hover:border-slate-400"
                      }`}
                      title="Tandai sebagai kunci jawaban"
                    >
                      {opt.key}
                    </button>
                    <input
                      type="text"
                      required
                      value={opt.text}
                      onChange={(e) => {
                        const newOpts = [...options];
                        newOpts[idx].text = e.target.value;
                        setOptions(newOpts);
                      }}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Explanation */}
          <div>
            <label className="font-bold text-slate-900 block mb-1">
              {type === "multiple_choice" ? "Pembahasan Soal" : "Rubrik & Kriteria Penilaian"}
            </label>
            <textarea
              rows={2}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs"
            >
              Simpan Sebagai Draf
            </button>
            <button
              type="button"
              onClick={handleAnalyzeContext}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-xs flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Analisis Konteks Lokal ({activeSchool?.region_name})</span>
            </button>
          </div>
        </form>
      </div>
    </TeacherWorkspaceShell>
  );
}
