"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-[#DCE0EA] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#252B3A] tracking-tight flex items-center gap-2">
            <FileQuestion className="w-5 h-5 text-[#5865D8]" />
            Koleksi Bank Soal Kontekstual
          </h1>
          <p className="text-xs text-[#697386] mt-0.5">
            Kelola, generate berbasis AI terpusat, atau adaptasi soal ke karakteristik wilayah sekolah.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Link href="/teacher/questions/generator">
            <Button variant="primary" size="sm" className="bg-[#5865D8] hover:bg-[#4753C4] text-xs">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Generate Soal AI
            </Button>
          </Link>
          <Link href="/teacher/questions/manual">
            <Button variant="outline" size="sm" className="text-xs border-[#DCE0EA]">
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Input Manual
            </Button>
          </Link>
          <Link href="/teacher/questions/scan">
            <Button variant="outline" size="sm" className="text-xs border-[#DCE0EA]">
              <Camera className="w-3.5 h-3.5 mr-1.5" /> Scan Foto Soal
            </Button>
          </Link>
          <Link href="/teacher/questions/context-preview">
            <Button variant="outline" size="sm" className="text-xs border-[#5865D8] text-[#5865D8] bg-[#5865D8]/5">
              <Layers className="w-3.5 h-3.5 mr-1.5" /> Uji Kontekstualisasi
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#DCE0EA] bg-white p-4 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#697386]">
          <Filter className="w-4 h-4 text-[#5865D8]" /> Filter:
        </div>

        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="rounded-lg border border-[#DCE0EA] bg-[#F7F8FC] px-3 py-1.5 text-xs text-[#252B3A] focus:outline-none"
        >
          <option value="all">Semua Mata Pelajaran</option>
          <option value="Matematika">Matematika</option>
          <option value="Bahasa Indonesia">Bahasa Indonesia</option>
          <option value="IPS">IPS</option>
        </select>

        <select
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value)}
          className="rounded-lg border border-[#DCE0EA] bg-[#F7F8FC] px-3 py-1.5 text-xs text-[#252B3A] focus:outline-none"
        >
          <option value="all">Semua Tingkat Kelas</option>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
            <option key={g} value={g}>
              Kelas {g}
            </option>
          ))}
        </select>

        <span className="ml-auto text-xs text-[#697386] font-medium">
          Menampilkan {filteredQuestions.length} butir soal
        </span>
      </div>

      {/* Questions Listing */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#DCE0EA] p-12 text-center">
            <FileQuestion className="w-10 h-10 text-[#697386] mx-auto mb-2" />
            <h3 className="text-sm font-bold text-[#252B3A]">Tidak ada soal yang cocok</h3>
            <p className="text-xs text-[#697386] mt-0.5">
              Coba ubah filter atau buat soal baru menggunakan tombol aksi di atas.
            </p>
          </div>
        ) : (
          filteredQuestions.map((q, idx) => (
            <div key={q.id} className="bg-white rounded-xl border border-[#DCE0EA] p-5 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EDEFF5] pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-[#5865D8]/10 text-xs font-bold text-[#5865D8] flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-[#5865D8]">
                    {q.subject}
                  </span>
                  <span className="text-xs text-[#697386]">Kelas {q.grade}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-[#697386] font-medium">{q.topic}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-[#238B68]">
                    {q.is_approved ? "Disetujui Guru" : "Menunggu Review"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(q.id)}
                    title="Hapus Soal"
                    className="p-1 text-[#697386] hover:text-[#C94F58] transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <div className="text-xs text-[#252B3A] font-medium leading-relaxed whitespace-pre-line">
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
                          ? "border-emerald-300 bg-emerald-50/50 text-emerald-900 font-bold"
                          : "border-[#DCE0EA] bg-[#F7F8FC] text-[#252B3A]"
                      }`}
                    >
                      <span
                        className={`w-5 h-5 shrink-0 rounded flex items-center justify-center text-[10px] font-bold ${
                          opt.id === q.correct_answer
                            ? "bg-[#238B68] text-white"
                            : "bg-white border border-[#DCE0EA] text-[#697386]"
                        }`}
                      >
                        {opt.id}
                      </span>
                      <span>{opt.text}</span>
                      {opt.id === q.correct_answer && (
                        <span className="ml-auto text-[9px] font-bold text-[#238B68] uppercase">
                          Kunci Benar
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Variables & Actions */}
              <div className="pt-2 border-t border-[#EDEFF5] flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#697386]">
                  <span className="font-semibold text-[#252B3A]">Variabel:</span>
                  {q.context_variables.length > 0 ? (
                    q.context_variables.map((v) => (
                      <span
                        key={v.key}
                        className="rounded bg-[#5865D8]/10 px-1.5 py-0.5 text-[10px] font-mono text-[#5865D8] font-bold"
                      >
                        [{v.key}]
                      </span>
                    ))
                  ) : (
                    <span className="italic text-slate-400">Belum dipetakan</span>
                  )}
                </div>

                <Link href={`/teacher/questions/context-preview?question_id=${q.id}`}>
                  <Button variant="outline" size="sm" className="h-7 text-xs border-[#5865D8] text-[#5865D8]">
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
