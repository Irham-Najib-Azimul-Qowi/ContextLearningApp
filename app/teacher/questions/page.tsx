"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Brain,
  Plus,
  Sparkles,
  Camera,
  Search,
  Filter,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  FileQuestion,
  School as SchoolIcon,
} from "lucide-react";
import { TeacherWorkspaceShell } from "@/components/layout/teacher-workspace-shell";
import { repository } from "@/lib/db/repository";
import { Question, School } from "@/lib/db/types";

export default function TeacherQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeSchool, setActiveSchool] = useState<School | null>(null);

  // Filters
  const [selectedSubject, setSelectedSubject] = useState<string>("Semua");
  const [selectedGrade, setSelectedGrade] = useState<string>("Semua");
  const [selectedType, setSelectedType] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const school = repository.getActiveSchool();
    setActiveSchool(school);
    setQuestions(repository.getQuestions({ schoolId: school.id }));
  }, []);

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus butir soal ini?")) {
      repository.deleteQuestion(id);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    }
  };

  const filteredQuestions = questions.filter((q) => {
    if (selectedSubject !== "Semua" && q.subject !== selectedSubject) return false;
    if (selectedGrade !== "Semua" && q.grade !== Number(selectedGrade)) return false;
    if (selectedType !== "Semua" && q.type !== selectedType) return false;
    if (
      searchQuery &&
      !q.question_text.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !q.topic.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <TeacherWorkspaceShell activeGroupId="questions">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full w-fit mb-2">
            <SchoolIcon className="w-3.5 h-3.5" />
            <span>{activeSchool?.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
            Bank Soal Kontekstual
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Katalog butir soal kurikulum yang telah diadaptasi dengan karakteristik lokal {activeSchool?.region_name}.
          </p>
        </div>

        {/* 3 Creation Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Link
            href="/teacher/questions/generator"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate AI</span>
          </Link>
          <Link
            href="/teacher/questions/manual"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Input Manual</span>
          </Link>
          <Link
            href="/teacher/questions/scan"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-all active:scale-95"
          >
            <Camera className="w-4 h-4" />
            <span>Scan Foto</span>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs mb-6 flex flex-col md:flex-row gap-3 items-center">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari kata kunci soal atau topik..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Semua">Semua Mapel</option>
            <option value="Matematika">Matematika</option>
            <option value="Bahasa Indonesia">Bahasa Indonesia</option>
            <option value="IPS">IPS</option>
          </select>

          {/* Grade Filter */}
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Semua">Semua Kelas</option>
            {[1, 2, 3, 4, 5, 6].map((g) => (
              <option key={g} value={g}>
                Kelas {g} SD
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Semua">Semua Jenis</option>
            <option value="multiple_choice">Pilihan Ganda</option>
            <option value="essay">Uraian / Esai</option>
          </select>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
            <FileQuestion className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-sm">Tidak Ada Butir Soal yang Cocok</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Cobalah ubah filter pencarian atau buat butir soal baru menggunakan AI maupun input manual.
            </p>
          </div>
        ) : (
          filteredQuestions.map((q, idx) => (
            <div
              key={q.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-colors"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-400">#{idx + 1}</span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                    {q.subject} Kelas {q.grade}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    {q.type === "multiple_choice" ? "Pilihan Ganda" : "Esai"}
                  </span>
                  {q.is_contextualized && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Terkontekstualisasi {activeSchool?.region_name}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <Link
                    href={`/teacher/questions/context-preview?id=${q.id}`}
                    className="p-2 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
                    title="Pratinjau Kontekstualisasi"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(q.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Hapus Soal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Topic */}
              <div className="text-xs font-semibold text-slate-500 mb-2">
                Topik: <span className="text-slate-800">{q.topic}</span>
              </div>

              {/* Question Text */}
              <p className="text-sm font-medium text-slate-900 leading-relaxed mb-4">
                {q.question_text}
              </p>

              {/* Multiple Choice Options Preview */}
              {q.options && q.options.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {q.options.map((opt) => (
                    <div
                      key={opt.key}
                      className={`text-xs p-2 rounded-lg border flex items-center gap-2 ${
                        opt.key === q.correct_answer
                          ? "bg-emerald-50/80 border-emerald-300 font-semibold text-emerald-950"
                          : "bg-white border-slate-200 text-slate-700"
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                        {opt.key}
                      </span>
                      <span>{opt.text}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Explanation / Rubric */}
              <div className="text-xs bg-slate-50/70 p-3 rounded-xl border border-slate-100 text-slate-600 leading-relaxed">
                <span className="font-semibold text-slate-800">
                  {q.type === "multiple_choice" ? "Pembahasan: " : "Rubrik Penilaian: "}
                </span>
                {q.type === "multiple_choice" ? q.explanation : q.rubric || q.explanation}
              </div>
            </div>
          ))
        )}
      </div>
    </TeacherWorkspaceShell>
  );
}
