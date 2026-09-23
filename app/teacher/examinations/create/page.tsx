"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TeacherWorkspaceShell } from "@/components/layout/teacher-workspace-shell";
import { repository } from "@/lib/db/repository";
import { Question, ClassRoom } from "@/lib/db/types";
import {
  ClipboardCheck,
  ArrowLeft,
  CheckCircle,
  Clock,
  Sparkles,
  Search,
  Check,
  FileQuestion,
  Layers,
  Calendar,
} from "lucide-react";

export default function CreateExamPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

  // Form Fields
  const [title, setTitle] = useState<string>("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [subject, setSubject] = useState<string>("Matematika");
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [status, setStatus] = useState<"published" | "draft">("published");

  // Filters for question picker
  const [questionFilterSubject, setQuestionFilterSubject] = useState<string>("ALL");
  const [questionSearch, setQuestionSearch] = useState<string>("");

  useEffect(() => {
    const now = new Date();
    setStartTime(now.toISOString().slice(0, 16));
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    setEndTime(nextWeek.toISOString().slice(0, 16));

    const school = repository.getActiveSchool();
    const clss = repository.getClasses(school.id);
    const qs = repository.getQuestions({ schoolId: school.id });

    setClasses(clss);
    setQuestions(qs);

    if (clss.length > 0) {
      setSelectedClassId(clss[0].id);
      setTitle(`Penilaian Harian Kontekstual - ${clss[0].name}`);
    }

    // Auto-select initial 2 contextual questions if available
    const contextualIds = qs.filter((q) => q.is_contextualized).slice(0, 3).map((q) => q.id);
    setSelectedQuestions(contextualIds);
  }, []);

  const toggleQuestionSelect = (qId: string) => {
    if (selectedQuestions.includes(qId)) {
      setSelectedQuestions(selectedQuestions.filter((id) => id !== qId));
    } else {
      setSelectedQuestions([...selectedQuestions, qId]);
    }
  };

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    const school = repository.getActiveSchool();
    const targetClass = classes.find((c) => c.id === selectedClassId);

    if (!title.trim() || !selectedClassId || selectedQuestions.length === 0) {
      alert("Harap lengkapi judul, kelas, dan minimal pilih 1 soal untuk ujian.");
      return;
    }

    repository.createExam({
      title: title.trim(),
      school_id: school.id,
      class_id: selectedClassId,
      class_name: targetClass ? targetClass.name : "Kelas",
      subject: subject,
      teacher_id: "usr-teacher-01",
      duration_minutes: durationMinutes,
      start_time: new Date(startTime).toISOString(),
      end_time: new Date(endTime).toISOString(),
      status: status,
      question_ids: selectedQuestions,
    });

    router.push("/teacher/examinations");
  };

  const filteredQuestions = questions.filter((q) => {
    const matchSubj =
      questionFilterSubject === "ALL" ||
      q.subject.toLowerCase() === questionFilterSubject.toLowerCase();
    const matchSearch =
      q.question_text.toLowerCase().includes(questionSearch.toLowerCase()) ||
      q.topic.toLowerCase().includes(questionSearch.toLowerCase());
    return matchSubj && matchSearch;
  });

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
            Penyusunan Room Ujian Baru
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Konfigurasi sesi asesmen, pilih kelas, dan cantumkan soal-soal terkontekstualisasi dari Bank Soal.
          </p>
        </div>

        <form onSubmit={handleCreateExam} className="space-y-6">
          {/* Main Info Box */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-indigo-600" />
              Informasi Umum Sesi Ujian
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Judul Room Ujian
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Penilaian Harian Matematika Kontekstual Ponorogo"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Target Kelas Murid
                </label>
                <select
                  required
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} (Kode: {cls.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mata Pelajaran
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="Matematika">Matematika</option>
                  <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                  <option value="IPS">IPS (Ilmu Pengetahuan Sosial)</option>
                  <option value="Matematika & IPAS">Matematika & IPAS Terpadu</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Alokasi Waktu Pengerjaan
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <span className="text-xs text-slate-500">Menit</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Status Publikasi
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "published" | "draft")}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="published">Langsung Publikasikan (Tersedia bagi Murid)</option>
                  <option value="draft">Simpan sebagai Draft Guru</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Jadwal Dibuka
                </label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Batas Akhir Penyerahan
                </label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
          </div>

          {/* Question Picker Box */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <FileQuestion className="w-4 h-4 text-indigo-600" />
                  Pilih Butir Soal dari Bank Soal ({selectedQuestions.length} Terpilih)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Centang soal kontekstual yang akan diujikan pada sesi ini.
                </p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Cari kata kunci soal..."
                  value={questionSearch}
                  onChange={(e) => setQuestionSearch(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            {/* Questions Selection List */}
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {filteredQuestions.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  Tidak ada soal yang sesuai dengan filter.
                </div>
              ) : (
                filteredQuestions.map((q, idx) => {
                  const isChecked = selectedQuestions.includes(q.id);
                  return (
                    <div
                      key={q.id}
                      onClick={() => toggleQuestionSelect(q.id)}
                      className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        isChecked
                          ? "bg-indigo-50/50 border-indigo-300 ring-1 ring-indigo-500/20"
                          : "bg-white border-slate-200 hover:bg-slate-50/80"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div className="flex-1 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-bold text-slate-700">#{idx + 1}</span>
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                              {q.subject} Kelas {q.grade}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                              {q.type === "multiple_choice" ? "Pilihan Ganda" : "Esai"}
                            </span>
                            {q.is_contextualized && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold">
                                <Sparkles className="w-3 h-3 text-emerald-600" />
                                Kontekstual Ponorogo
                              </span>
                            )}
                          </div>

                          <p className="text-slate-800 leading-relaxed font-medium">
                            {q.question_text}
                          </p>

                          {q.type === "multiple_choice" && q.options && (
                            <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px] text-slate-600">
                              {q.options.map((opt) => (
                                <div
                                  key={opt.key}
                                  className={`px-2 py-1 rounded border ${
                                    opt.key === q.correct_answer
                                      ? "bg-emerald-50/60 border-emerald-200 text-emerald-900 font-bold"
                                      : "bg-slate-50 border-slate-100"
                                  }`}
                                >
                                  <strong>{opt.key}.</strong> {opt.text}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <Link
              href="/teacher/examinations"
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100"
            >
              Batalkan
            </Link>

            <button
              type="submit"
              disabled={selectedQuestions.length === 0}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs hover:shadow transition-all disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Simpan & Rilis Sesi Ujian</span>
            </button>
          </div>
        </form>
      </div>
    </TeacherWorkspaceShell>
  );
}
