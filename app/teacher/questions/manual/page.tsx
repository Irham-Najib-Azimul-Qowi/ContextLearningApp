"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Save,
  Sparkles,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { repository } from "@/lib/db/repository";
import { extractContextVariables } from "@/lib/context-engine/variable-extractor";
import { QuestionSubject, QuestionType, QuestionDifficulty, ContextVariable } from "@/lib/db/types";

export default function ManualQuestionPage() {
  const router = useRouter();
  const [subject, setSubject] = useState<QuestionSubject>("Matematika");
  const [grade, setGrade] = useState("5");
  const [topic, setTopic] = useState("");
  const [learningObjective, setLearningObjective] = useState("");
  const [questionType, setQuestionType] = useState<QuestionType>("multiple_choice");
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>("medium");
  const [questionText, setQuestionText] = useState("");
  const [optA, setOptA] = useState("");
  const [optB, setOptB] = useState("");
  const [optC, setOptC] = useState("");
  const [optD, setOptD] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState<"A" | "B" | "C" | "D">("A");
  const [explanation, setExplanation] = useState("");
  const [rubric, setRubric] = useState("");

  const [extractedVariables, setExtractedVariables] = useState<ContextVariable[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyzeVariables = () => {
    if (!questionText.trim()) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      const res = extractContextVariables(questionText);
      setExtractedVariables(res.detected);
      setIsAnalyzing(false);
    }, 300);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim() || !topic.trim()) return;

    const options =
      questionType === "multiple_choice"
        ? [
            { id: "A" as const, text: optA || "Pilihan A" },
            { id: "B" as const, text: optB || "Pilihan B" },
            { id: "C" as const, text: optC || "Pilihan C" },
            { id: "D" as const, text: optD || "Pilihan D" },
          ]
        : undefined;

    // Automatically analyze variables if not already done
    const variables =
      extractedVariables.length > 0
        ? extractedVariables
        : extractContextVariables(questionText).detected;

    const newQ = repository.createQuestion({
      teacher_id: "teacher-demo-01",
      subject,
      grade: Number(grade),
      topic,
      learning_objective: learningObjective || "Memahami materi pembelajaran",
      question_type: questionType,
      difficulty,
      original_text: questionText,
      context_variables: variables,
      options,
      correct_answer: questionType === "multiple_choice" ? correctAnswer : "Kunci Jawaban Uraian",
      explanation,
      rubric: questionType === "essay" ? rubric : undefined,
      is_approved: true,
      source: "manual",
    });

    router.push(`/teacher/questions/context-preview?question_id=${newQ.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-surface p-5 rounded-xl border border-border shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/teacher/questions"
              className="text-xs font-semibold text-secondary-text hover:text-foreground flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Bank Soal
            </Link>
            <span className="text-border">/</span>
            <span className="text-xs font-semibold text-primary">Input Manual</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Input Soal Mandiri &amp; Ekstraksi Variabel
          </h1>
          <p className="text-xs text-secondary-text mt-1">
            Tulis soal kurikulum standar, tandai variabel yang dapat dikontekstualisasikan, dan adaptasikan ke lingkungan siswa.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Metadata Card */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-base font-bold">Metadata Kurikulum</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                      Mata Pelajaran
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value as QuestionSubject)}
                      className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="Matematika">Matematika</option>
                      <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                      <option value="IPS">IPS (Ilmu Pengetahuan Sosial)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                        Kelas
                      </label>
                      <select
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        {[1, 2, 3, 4, 5, 6].map((g) => (
                          <option key={g} value={g}>
                            Kelas {g} SD
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                        Tingkat
                      </label>
                      <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value as QuestionDifficulty)}
                        className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="easy">Mudah</option>
                        <option value="medium">Sedang</option>
                        <option value="hard">Tantangan</option>
                      </select>
                    </div>
                  </div>

                  <Input
                    label="Topik / Materi Pokok"
                    type="text"
                    required
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Contoh: Operasi Penjumlahan & Pengurangan"
                  />

                  <Input
                    label="Tujuan Pembelajaran"
                    type="text"
                    value={learningObjective}
                    onChange={(e) => setLearningObjective(e.target.value)}
                    placeholder="Contoh: Memecahkan masalah berat benda"
                  />

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                      Bentuk Soal
                    </label>
                    <select
                      value={questionType}
                      onChange={(e) => setQuestionType(e.target.value as QuestionType)}
                      className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="multiple_choice">Pilihan Ganda (A, B, C, D)</option>
                      <option value="essay">Uraian / Essay</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Content & Options Card */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="py-4 flex flex-row items-center justify-between">
                  <CardTitle className="text-base font-bold">Naskah Soal & Variabel</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAnalyzeVariables}
                    isLoading={isAnalyzing}
                    className="text-xs"
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-1 text-primary" /> Analisis Variabel
                  </Button>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                      Teks Soal
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      placeholder="Tulis soal di sini. Anda juga dapat menggunakan penanda kurung siku langsung seperti [OCCUPATION], [COMMODITY], atau [MARKET]..."
                      className="w-full rounded-xl border border-border bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* Variables Preview if detected */}
                  {extractedVariables.length > 0 && (
                    <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-primary block mb-2">
                        Variabel Kontekstual yang Berhasil Diidentifikasi:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {extractedVariables.map((v) => (
                          <div
                            key={v.key}
                            className="flex items-center gap-1.5 rounded-lg bg-white border border-indigo-200 px-2.5 py-1 text-xs"
                          >
                            <span className="font-mono font-bold text-primary">[{v.key}]</span>
                            <span className="text-[10px] text-muted capitalize">({v.category})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Multiple Choice Options Fields */}
                  {questionType === "multiple_choice" ? (
                    <div className="space-y-3 pt-2">
                      <span className="block text-xs font-semibold uppercase tracking-wider text-muted">
                        Pilihan Jawaban (A, B, C, D) & Kunci
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="correct_ans"
                            checked={correctAnswer === "A"}
                            onChange={() => setCorrectAnswer("A")}
                            className="text-primary focus:ring-primary"
                          />
                          <Input
                            placeholder="Opsi A"
                            value={optA}
                            onChange={(e) => setOptA(e.target.value)}
                            required
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="correct_ans"
                            checked={correctAnswer === "B"}
                            onChange={() => setCorrectAnswer("B")}
                            className="text-primary focus:ring-primary"
                          />
                          <Input
                            placeholder="Opsi B"
                            value={optB}
                            onChange={(e) => setOptB(e.target.value)}
                            required
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="correct_ans"
                            checked={correctAnswer === "C"}
                            onChange={() => setCorrectAnswer("C")}
                            className="text-primary focus:ring-primary"
                          />
                          <Input
                            placeholder="Opsi C"
                            value={optC}
                            onChange={(e) => setOptC(e.target.value)}
                            required
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="correct_ans"
                            checked={correctAnswer === "D"}
                            onChange={() => setCorrectAnswer("D")}
                            className="text-primary focus:ring-primary"
                          />
                          <Input
                            placeholder="Opsi D"
                            value={optD}
                            onChange={(e) => setOptD(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <p className="text-[11px] text-muted italic">
                        * Pilih tombol radio di samping kiri opsi untuk menetapkan kunci jawaban yang benar.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-2">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                          Rubrik Penilaian & Ekspektasi Jawaban Siswa
                        </label>
                        <textarea
                          rows={3}
                          value={rubric}
                          onChange={(e) => setRubric(e.target.value)}
                          placeholder="Jelaskan kriteria penilaian skor maksimal untuk essay ini..."
                          className="w-full rounded-xl border border-border bg-white p-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                  )}

                  <Input
                    label="Penjelasan / Pembahasan Soal"
                    type="text"
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    placeholder="Langkah penyelesaian untuk dipelajari siswa saat pembahasan ujian"
                  />

                  <div className="pt-4 border-t border-border/60 flex items-center justify-between">
                    <Link href="/teacher/questions">
                      <Button type="button" variant="outline" size="sm">
                        Batal
                      </Button>
                    </Link>
                    <Button type="submit" variant="primary" size="md">
                      <Save className="h-4 w-4" /> Simpan & Uji Kontekstualisasi <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
    </div>
  );
}
