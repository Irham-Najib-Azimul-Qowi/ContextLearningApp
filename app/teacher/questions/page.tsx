"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Question } from "@/lib/db/types";

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [gradeFilter, setGradeFilter] = useState<string>("all");

  useEffect(() => {
    const schoolId = localStorage.getItem("cl_active_school_id") || "school-sd001-samarinda";
    setQuestions(repository.getQuestions(schoolId));
  }, []);

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus soal ini dari Bank Soal?")) {
      const schoolId = localStorage.getItem("cl_active_school_id") || "school-sd001-samarinda";
      repository.deleteQuestion(id);
      setQuestions(repository.getQuestions(schoolId));
    }
  };

  const filteredQuestions = questions.filter((q) => {
    if (subjectFilter !== "all" && q.subject !== subjectFilter) return false;
    if (gradeFilter !== "all" && q.grade.toString() !== gradeFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface p-5 rounded-xl border border-border shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <FileQuestion className="w-5 h-5 text-primary" />
            Bank Soal Kontekstual
          </h1>
          <p className="text-xs text-secondary-text mt-1">
            Kelola draf kurikulum, buat soal AI terstruktur, atau adaptasikan variabel ke lingkungan sekitar sekolah.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Link href="/teacher/questions/generator">
            <Button variant="primary" size="sm" className="text-xs">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Buat Soal AI
            </Button>
          </Link>
          <Link href="/teacher/questions/manual">
            <Button variant="outline" size="sm" className="text-xs">
              <PlusCircle className="w-3.5 h-3.5 mr-1.5 text-primary" /> Input Manual
            </Button>
          </Link>
          <Link href="/teacher/questions/scan">
            <Button variant="outline" size="sm" className="text-xs">
              <Camera className="w-3.5 h-3.5 mr-1.5 text-primary" /> Scan Foto Soal
            </Button>
          </Link>
          <Link href="/teacher/questions/context-preview">
            <Button variant="outline" size="sm" className="text-xs border-primary text-primary hover:bg-primary-subtle">
              <Layers className="w-3.5 h-3.5 mr-1.5" /> Uji Kontekstualisasi
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface p-3.5 shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <Filter className="w-4 h-4 text-primary" /> Filter:
        </div>

        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="rounded-lg border border-border bg-[#F2F4F8] px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
        >
          <option value="all">Semua Mata Pelajaran</option>
          <option value="Matematika">Matematika</option>
          <option value="Bahasa Indonesia">Bahasa Indonesia</option>
          <option value="IPS">IPS</option>
        </select>

        <select
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value)}
          className="rounded-lg border border-border bg-[#F2F4F8] px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
        >
          <option value="all">Semua Tingkat Kelas</option>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
            <option key={g} value={g}>
              Kelas {g}
            </option>
          ))}
        </select>

        <span className="ml-auto text-xs text-secondary-text font-medium">
          Menampilkan {filteredQuestions.length} butir soal
        </span>
      </div>

      {/* Questions Listing */}
      <div className="space-y-3.5">
        {filteredQuestions.length === 0 ? (
          <div className="bg-surface rounded-xl border border-border p-12 text-center shadow-2xs">
            <FileQuestion className="w-10 h-10 text-secondary-text mx-auto mb-2 opacity-50" />
            <h3 className="text-sm font-semibold text-foreground">Tidak ada soal yang cocok</h3>
            <p className="text-xs text-secondary-text mt-0.5">
              Coba ubah filter atau buat soal baru menggunakan tombol aksi di atas.
            </p>
          </div>
        ) : (
          filteredQuestions.map((q, idx) => (
            <div key={q.id} className="bg-surface rounded-xl border border-border p-4 sm:p-5 shadow-2xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-primary-subtle text-xs font-bold text-primary flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <Badge variant="primary">{q.subject}</Badge>
                  <span className="text-xs text-secondary-text font-medium">Kelas {q.grade}</span>
                  <span className="text-border">·</span>
                  <span className="text-xs text-secondary-text font-medium">{q.topic}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={q.is_approved ? "success" : "warning"}>
                    {q.is_approved ? "Disetujui Guru" : "Menunggu Review"}
                  </Badge>
                  <button
                    type="button"
                    onClick={() => handleDelete(q.id)}
                    title="Hapus Soal"
                    className="p-1 text-secondary-text hover:text-error transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <div className="text-xs sm:text-sm text-foreground font-normal leading-relaxed whitespace-pre-line">
                <FormattedTextWithMath text={q.original_text} />
              </div>

              {/* Options */}
              {q.question_type === "multiple_choice" && q.options && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {q.options.map((opt) => (
                    <div
                      key={opt.id}
                      className={`flex items-center gap-2 rounded-lg border p-2 text-xs font-medium ${
                        opt.id === q.correct_answer
                          ? "border-emerald-300 bg-success-subtle text-foreground font-semibold"
                          : "border-border bg-[#F7F8FB] text-foreground"
                      }`}
                    >
                      <span
                        className={`w-5 h-5 shrink-0 rounded flex items-center justify-center text-[10px] font-bold ${
                          opt.id === q.correct_answer
                            ? "bg-success text-white"
                            : "bg-surface border border-border text-secondary-text"
                        }`}
                      >
                        {opt.id}
                      </span>
                      <span>{opt.text}</span>
                      {opt.id === q.correct_answer && (
                        <span className="ml-auto text-[9px] font-bold text-success uppercase">
                          Kunci Benar
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Variables & Actions */}
              <div className="pt-2 border-t border-border flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-secondary-text">
                  <span className="font-semibold text-foreground">Variabel:</span>
                  {q.context_variables.length > 0 ? (
                    q.context_variables.map((v) => (
                      <span
                        key={v.key}
                        className="rounded-md bg-primary-subtle px-1.5 py-0.5 text-[10px] font-mono text-primary font-bold border border-primary/20"
                      >
                        [{v.key}]
                      </span>
                    ))
                  ) : (
                    <span className="italic text-disabled">Belum dipetakan</span>
                  )}
                </div>

                <Link href={`/teacher/questions/context-preview?question_id=${q.id}`}>
                  <Button variant="outline" size="sm" className="h-7 text-xs border-primary text-primary hover:bg-primary-subtle">
                    <Layers className="w-3 h-3 mr-1" /> Uji Kontekstualisasi
                  </Button>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
