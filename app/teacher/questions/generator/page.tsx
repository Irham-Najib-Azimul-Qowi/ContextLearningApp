"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/navbar";
import Container from "@/components/ui/container";
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
  HelpCircle,
} from "lucide-react";
import { repository } from "@/lib/db/repository";
import { QuestionSubject, QuestionType, QuestionDifficulty, Question } from "@/lib/db/types";

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
    <div className="min-h-screen bg-background">
      <Navbar />

      <Container className="py-8 sm:py-10">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary">AI Question Generator</Badge>
            <span className="text-xs text-muted">Didukung Google Gemini & Template Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Generator Soal Kontekstual Berbasis AI
          </h1>
          <p className="text-sm text-muted mt-1">
            Hasilkan draf soal yang secara otomatis memisahkan variabel lingkungan lokal dari konsep inti pembelajaran.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Parameters */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" /> Parameter Soal
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <form onSubmit={handleGenerate} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                      Mata Pelajaran
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value as QuestionSubject)}
                      className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="Matematika">Matematika</option>
                      <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                      <option value="IPS">IPS (Ilmu Pengetahuan Sosial)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                        Jenjang Kelas
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
                        Tingkat Kesulitan
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
                    label="Topik / Materi"
                    type="text"
                    required
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />

                  <Input
                    label="Tujuan Pembelajaran / Kompetensi"
                    type="text"
                    required
                    value={learningObjective}
                    onChange={(e) => setLearningObjective(e.target.value)}
                  />

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                      Bentuk Soal
                    </label>
                    <select
                      value={questionType}
                      onChange={(e) => setQuestionType(e.target.value as QuestionType)}
                      className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="multiple_choice">Pilihan Ganda (4 Pilihan A-D)</option>
                      <option value="essay">Uraian / Essay</option>
                    </select>
                  </div>

                  <Input
                    label="Konteks Wilayah Sekolah"
                    type="text"
                    value={regionContext}
                    onChange={(e) => setRegionContext(e.target.value)}
                  />

                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-red-50 text-xs text-error font-medium flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {errorMsg}
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="w-full shadow-xs"
                    isLoading={isLoading}
                  >
                    <Sparkles className="h-4 w-4" /> Generate Draf Soal
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Result Column */}
          <div className="lg:col-span-2 space-y-6">
            {saveSuccess && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm font-medium text-success flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                Soal berhasil disimpan ke Bank Soal! Mengalihkan ke Pratinjau Kontekstualisasi...
              </div>
            )}

            {generatedQuestions.length === 0 && !isLoading && (
              <Card className="border-dashed border-2">
                <CardContent className="py-16 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-primary mx-auto mb-3">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">
                    Siap Menghasilkan Soal
                  </h3>
                  <p className="text-xs text-muted max-w-sm mx-auto mt-1 leading-relaxed">
                    Pilih parameter di sebelah kiri lalu klik <strong>Generate Draf Soal</strong> untuk menghasilkan soal berstruktur variabel kontekstual.
                  </p>
                </CardContent>
              </Card>
            )}

            {generatedQuestions.map((q, idx) => (
              <Card key={idx} className="border-indigo-100 shadow-sm animate-in fade-in duration-200">
                <CardHeader className="p-5 pb-3 border-b border-border/60 flex flex-row items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <Badge variant="primary">{q.subject}</Badge>
                    <Badge variant="neutral">Kelas {q.grade} SD</Badge>
                    <span className="text-xs font-medium text-muted">• {q.topic}</span>
                  </div>
                  <Badge variant="secondary">Hasil Generasi AI</Badge>
                </CardHeader>

                <CardContent className="p-5 space-y-4">
                  {/* Template View */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-1">
                      Draf Soal Awal:
                    </span>
                    <p className="text-sm font-medium text-foreground leading-relaxed whitespace-pre-line">
                      <FormattedTextWithMath text={q.original_text} />
                    </p>
                  </div>

                  {/* Context Variables */}
                  <div className="rounded-xl bg-indigo-50/50 border border-indigo-100 p-3.5 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-primary block">
                      Variabel Kontekstual Teridentifikasi (Dapat Diadaptasi ke Wilayah Lain):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {q.context_variables.map((v: any) => (
                        <div
                          key={v.key}
                          className="flex items-center gap-1.5 rounded-lg bg-white border border-indigo-200 px-2.5 py-1 text-xs shadow-2xs"
                        >
                          <span className="font-mono font-bold text-primary">[{v.key}]</span>
                          <span className="text-[10px] text-muted capitalize">({v.category})</span>
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
                          className={`flex items-center gap-2 rounded-xl border p-2.5 text-xs font-medium ${
                            opt.id === q.correct_answer
                              ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                              : "border-border bg-slate-50 text-foreground"
                          }`}
                        >
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md font-bold text-[11px] ${
                              opt.id === q.correct_answer
                                ? "bg-success text-white"
                                : "bg-white border border-border text-muted"
                            }`}
                          >
                            {opt.id}
                          </span>
                          <span>{opt.text}</span>
                          {opt.id === q.correct_answer && (
                            <span className="ml-auto text-[10px] font-bold text-success uppercase">
                              Kunci
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {q.explanation && (
                    <div className="text-xs text-muted bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <strong>Penjelasan / Pembahasan:</strong> {q.explanation}
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                    <span className="text-xs text-muted flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-primary" /> Perlu persetujuan guru sebelum masuk ujian
                    </span>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleApproveAndSave(q)}
                      className="shadow-xs"
                    >
                      <Layers className="h-3.5 w-3.5 mr-1" /> Setujui & Kontekstualisasikan <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
