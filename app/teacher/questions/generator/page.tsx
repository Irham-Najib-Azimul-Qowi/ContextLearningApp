"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormattedTextWithMath } from "@/components/ui/math-view";
import {
  Sparkles,
  ArrowRight,
  Layers,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  ArrowLeft,
} from "lucide-react";
import { repository } from "@/lib/db/repository";
import { QuestionSubject, QuestionType, QuestionDifficulty } from "@/lib/db/types";

export default function QuestionGeneratorPage() {
  const router = useRouter();
  const [subject, setSubject] = useState<QuestionSubject>("Matematika");
  const [grade, setGrade] = useState("5");
  const [topic, setTopic] = useState("Operasi Hitung Pengurangan Bilangan Cacah");
  const [learningObjective, setLearningObjective] = useState(
    "Menyelesaikan masalah pengurangan dalam kehidupan sehari-hari"
  );
  const [questionType, setQuestionType] = useState<QuestionType>("multiple_choice");
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>("medium");
  const [regionContext, setRegionContext] = useState("Kota Samarinda (DAS Sungai Mahakam & Pasar Tradisional)");

  const [isLoading, setIsLoading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/questions/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          grade: Number(grade),
          topic,
          learningObjective,
          questionType,
          difficulty,
          regionContext,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Gagal membuat soal.");
      }

      setGeneratedQuestions(data.questions || []);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Gagal menghubungi generator AI.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveAndSave = (qPayload: any) => {
    const saved = repository.createQuestion({
      teacher_id: "teacher-demo-01",
      subject: qPayload.subject,
      grade: qPayload.grade,
      topic: qPayload.topic,
      learning_objective: qPayload.learning_objective,
      question_type: qPayload.question_type,
      difficulty: qPayload.difficulty,
      original_text: qPayload.original_text,
      question_template: qPayload.question_template,
      context_variables: qPayload.context_variables || [],
      options: qPayload.options,
      correct_answer: qPayload.correct_answer || "A",
      explanation: qPayload.explanation,
      rubric: qPayload.rubric,
      is_approved: true,
      source: "ai_generated",
    });

    setSaveSuccess(true);
    setTimeout(() => {
      router.push(`/teacher/questions/context-preview?question_id=${saved.id}`);
    }, 1000);
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
            <span className="text-xs font-semibold text-primary">Generator AI</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Generator Soal Kontekstual Berbasis AI
          </h1>
          <p className="text-xs text-secondary-text mt-1">
            Hasilkan draf soal yang otomatis mendeteksi variabel lingkungan lokal dan memisahkannya dari konsep kompetensi.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Parameters */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="py-3.5">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Sparkles className="h-4 w-4 text-primary" /> Konfigurasi Soal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleGenerate} className="space-y-3.5 text-xs">
                {/* 1. Subject & Grade */}
                <div className="space-y-1">
                  <label className="font-semibold text-foreground block">Mata Pelajaran:</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value as QuestionSubject)}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="Matematika">Matematika</option>
                    <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                    <option value="IPS">IPS (Ilmu Pengetahuan Sosial)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground block">Tingkat Kelas:</label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                    >
                      {[1, 2, 3, 4, 5, 6].map((g) => (
                        <option key={g} value={g}>
                          Kelas {g}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-foreground block">Tingkat Kesulitan:</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as QuestionDifficulty)}
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                    >
                      <option value="easy">Mudah</option>
                      <option value="medium">Sedang</option>
                      <option value="hard">Tantangan</option>
                    </select>
                  </div>
                </div>

                {/* 2. Topic and Objective */}
                <Input
                  label="Topik / Materi Pokok:"
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />

                <Input
                  label="Tujuan Pembelajaran:"
                  type="text"
                  required
                  value={learningObjective}
                  onChange={(e) => setLearningObjective(e.target.value)}
                />

                {/* 3. Question Type */}
                <div className="space-y-1">
                  <label className="font-semibold text-foreground block">Bentuk Soal:</label>
                  <select
                    value={questionType}
                    onChange={(e) => setQuestionType(e.target.value as QuestionType)}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="multiple_choice">Pilihan Ganda (4 Opsi A-D)</option>
                    <option value="essay">Uraian / Essay</option>
                  </select>
                </div>

                {/* 4. Local Context */}
                <Input
                  label="Konteks Wilayah Sekolah:"
                  type="text"
                  value={regionContext}
                  onChange={(e) => setRegionContext(e.target.value)}
                />

                {errorMsg && (
                  <div className="p-2.5 rounded-lg bg-error-subtle text-xs text-error font-medium flex items-center gap-2 border border-red-200">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {errorMsg}
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full shadow-2xs font-semibold"
                  isLoading={isLoading}
                >
                  <Sparkles className="h-4 w-4 mr-1.5" /> Buat Draf Soal AI
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Result Column */}
        <div className="lg:col-span-2 space-y-4">
          {saveSuccess && (
            <div className="p-3.5 rounded-xl bg-success-subtle border border-emerald-200 text-xs font-semibold text-success flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Soal berhasil disimpan! Membuka halaman pratinjau kontekstualisasi...
            </div>
          )}

          {generatedQuestions.length === 0 && !isLoading && (
            <Card className="border-dashed border-2">
              <CardContent className="py-14 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-subtle text-primary mx-auto mb-3">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  Belum Ada Draf Soal
                </h3>
                <p className="text-xs text-secondary-text max-w-sm mx-auto mt-1 leading-relaxed">
                  Isi parameter konfigurasi di sebelah kiri, lalu klik <strong>Buat Draf Soal AI</strong> untuk menghasilkan draf soal berstruktur variabel kontekstual.
                </p>
              </CardContent>
            </Card>
          )}

          {generatedQuestions.map((q, idx) => (
            <Card key={idx} className="shadow-2xs">
              <CardHeader className="py-3 flex flex-row items-center justify-between border-b border-border">
                <div className="flex items-center gap-2">
                  <Badge variant="primary">{q.subject}</Badge>
                  <Badge variant="neutral">Kelas {q.grade}</Badge>
                  <span className="text-xs font-medium text-secondary-text truncate max-w-xs">• {q.topic}</span>
                </div>
                <Badge variant="secondary">Hasil Generasi AI</Badge>
              </CardHeader>

              <CardContent className="space-y-4 pt-4">
                {/* Question Stem */}
                <div>
                  <span className="text-[11px] font-semibold text-secondary-text block mb-1">
                    Draf Teks Soal:
                  </span>
                  <div className="text-sm font-medium text-foreground leading-relaxed whitespace-pre-line p-3 bg-[#F2F4F8] rounded-lg border border-border">
                    <FormattedTextWithMath text={q.original_text} />
                  </div>
                </div>

                {/* Context Variables */}
                <div className="rounded-lg bg-primary-subtle border border-primary/20 p-3 space-y-2">
                  <span className="text-[11px] font-bold text-primary block">
                    Variabel Kontekstual Teridentifikasi:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {q.context_variables.map((v: any) => (
                      <div
                        key={v.key}
                        className="flex items-center gap-1.5 rounded-md bg-surface border border-border px-2 py-0.5 text-xs shadow-2xs"
                      >
                        <span className="font-mono font-bold text-primary">[{v.key}]</span>
                        <span className="text-[10px] text-secondary-text capitalize">({v.category})</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Options for MCQ */}
                {q.question_type === "multiple_choice" && q.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.options.map((opt: any) => (
                      <div
                        key={opt.id}
                        className={`flex items-center gap-2.5 rounded-lg border p-2.5 text-xs font-medium ${
                          opt.id === q.correct_answer
                            ? "border-emerald-300 bg-success-subtle text-foreground font-semibold"
                            : "border-border bg-surface text-foreground"
                        }`}
                      >
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md font-bold text-[11px] ${
                            opt.id === q.correct_answer
                              ? "bg-success text-white"
                              : "bg-[#F2F4F8] border border-border text-secondary-text"
                          }`}
                        >
                          {opt.id}
                        </span>
                        <span>{opt.text}</span>
                        {opt.id === q.correct_answer && (
                          <span className="ml-auto text-[10px] font-bold text-success uppercase">
                            Kunci Jawaban
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {q.explanation && (
                  <div className="text-xs text-secondary-text bg-[#F2F4F8] p-3 rounded-lg border border-border">
                    <strong className="text-foreground">Pembahasan:</strong> {q.explanation}
                  </div>
                )}

                {/* Action Bar */}
                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-secondary-text flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-primary" /> Perlu persetujuan guru sebelum masuk ujian
                  </span>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleApproveAndSave(q)}
                    className="text-xs"
                  >
                    <Layers className="h-3.5 w-3.5 mr-1" /> Simpan & Uji Konteks <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
