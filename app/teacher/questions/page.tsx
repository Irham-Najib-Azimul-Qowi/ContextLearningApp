"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/navbar";
import Container from "@/components/ui/container";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormattedTextWithMath } from "@/components/ui/math-view";
import {
  FileQuestion,
  Sparkles,
  PlusCircle,
  Camera,
  Layers,
  CheckCircle2,
  Filter,
  Trash2,
} from "lucide-react";
import { repository } from "@/lib/db/repository";
import { Question, QuestionSubject } from "@/lib/db/types";

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [gradeFilter, setGradeFilter] = useState<string>("all");

  useEffect(() => {
    setQuestions(repository.getQuestions());
  }, []);

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus soal ini dari Bank Soal?")) {
      repository.deleteQuestion(id);
      setQuestions(repository.getQuestions());
    }
  };

  const filteredQuestions = questions.filter((q) => {
    if (subjectFilter !== "all" && q.subject !== subjectFilter) return false;
    if (gradeFilter !== "all" && q.grade.toString() !== gradeFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <Container className="py-8 sm:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="primary">Bank Soal Guru</Badge>
              <span className="text-xs text-muted">SD Kelas 1–6</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Koleksi Soal & Pembelajaran Kontekstual
            </h1>
            <p className="text-sm text-muted mt-1">
              Kelola, generate, atau adaptasi soal ke konteks wilayah sekitar sekolah Anda.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2.5">
            <Link href="/teacher/questions/generator">
              <Button variant="primary" size="sm" className="shadow-xs">
                <Sparkles className="h-4 w-4" /> Generate Soal AI
              </Button>
            </Link>
            <Link href="/teacher/questions/manual">
              <Button variant="outline" size="sm">
                <PlusCircle className="h-4 w-4" /> Input Manual
              </Button>
            </Link>
            <Link href="/teacher/questions/scan">
              <Button variant="outline" size="sm">
                <Camera className="h-4 w-4" /> Scan Foto Soal
              </Button>
            </Link>
            <Link href="/teacher/questions/context-preview">
              <Button variant="secondary" size="sm" className="shadow-xs">
                <Layers className="h-4 w-4" /> Uji Kontekstualisasi
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-white p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted">
            <Filter className="h-4 w-4" /> Filter Soal:
          </div>

          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="rounded-xl border border-border bg-white px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">Semua Mata Pelajaran</option>
            <option value="Matematika">Matematika</option>
            <option value="Bahasa Indonesia">Bahasa Indonesia</option>
            <option value="IPS">IPS</option>
          </select>

          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="rounded-xl border border-border bg-white px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">Semua Tingkat Kelas</option>
            {[1, 2, 3, 4, 5, 6].map((g) => (
              <option key={g} value={g}>
                Kelas {g} SD
              </option>
            ))}
          </select>

          <span className="ml-auto text-xs text-muted font-medium">
            Menampilkan {filteredQuestions.length} soal
          </span>
        </div>

        {/* Questions Listing */}
        <div className="space-y-4">
          {filteredQuestions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileQuestion className="h-10 w-10 text-muted mx-auto mb-3" />
                <h3 className="text-sm font-bold text-foreground">Tidak ada soal yang cocok</h3>
                <p className="text-xs text-muted mt-1">
                  Coba ubah filter atau buat soal baru menggunakan tombol di atas.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredQuestions.map((q, idx) => (
              <Card key={q.id} className="hover:border-primary/30 transition-all">
                <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between border-b border-border/60">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-primary">
                      {idx + 1}
                    </span>
                    <Badge variant="secondary">{q.subject}</Badge>
                    <Badge variant="neutral">Kelas {q.grade} SD</Badge>
                    <span className="text-xs font-medium text-muted">• {q.topic}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={q.is_approved ? "success" : "warning"}>
                      {q.is_approved ? "Disetujui Guru" : "Menunggu Review"}
                    </Badge>
                    <button
                      onClick={() => handleDelete(q.id)}
                      title="Hapus Soal"
                      className="p-1 text-muted hover:text-error transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </CardHeader>

                <CardContent className="p-5 space-y-4">
                  {/* Question Text with KaTeX formatting */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-1">
                      Teks Soal:
                    </span>
                    <p className="text-sm text-foreground font-medium leading-relaxed whitespace-pre-line">
                      <FormattedTextWithMath text={q.original_text} />
                    </p>
                  </div>

                  {/* Multiple choice options if applicable */}
                  {q.question_type === "multiple_choice" && q.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options.map((opt) => (
                        <div
                          key={opt.id}
                          className={`flex items-center gap-2 rounded-xl border p-2.5 text-xs font-medium ${
                            opt.id === q.correct_answer
                              ? "border-emerald-300 bg-emerald-50/50 text-emerald-900"
                              : "border-border bg-slate-50/50 text-foreground"
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
                              Kunci Jawaban
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Context Variables & Actions */}
                  <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
                      <span className="font-semibold text-foreground">Variabel Konteks Terdeteksi:</span>
                      {q.context_variables.length > 0 ? (
                        q.context_variables.map((v) => (
                          <span
                            key={v.key}
                            className="rounded-md bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[11px] font-mono text-primary font-semibold"
                          >
                            [{v.key}]
                          </span>
                        ))
                      ) : (
                        <span className="italic text-slate-400">Belum dipetakan</span>
                      )}
                    </div>

                    <Link href={`/teacher/questions/context-preview?question_id=${q.id}`}>
                      <Button variant="primary" size="sm" className="h-8 text-xs">
                        <Layers className="h-3.5 w-3.5 mr-1" /> Kontekstualisasikan Soal Ini
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </Container>
    </div>
  );
}
