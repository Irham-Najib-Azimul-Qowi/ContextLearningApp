"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  CheckCircle2,
  Clock,
  Award,
  Globe,
  Printer,
  Pencil,
  RotateCcw,
  Search,
  Sparkles,
  X,
  Send,
  Loader2,
  FileText,
  AlertCircle,
  FileQuestion,
} from "lucide-react";
import { LearningRoom, Question, LearningMaterial, RoomVisitor, getQuestionItems } from "@/lib/db/types";

export interface RoomDashboardViewProps {
  room: LearningRoom;
  material?: LearningMaterial | null;
  question?: Question | null;
  onRefresh?: () => void;
}

interface SubmissionRecord {
  id: string;
  room_code: string;
  student_name: string;
  source: "Online" | "Print + Scan";
  status: string;
  score: number;
  mc_score?: number;
  essay_score?: number;
  answers?: {
    mc?: string;
    essay?: string;
    is_mc_correct?: boolean;
  };
  teacher_feedback?: string;
  created_at: string;
}

export function RoomDashboardView({
  room,
  material,
  question,
  onRefresh,
}: RoomDashboardViewProps) {
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSource, setFilterSource] = useState<"all" | "Online" | "Print + Scan">("all");

  // Essay Grading Modal State
  const [gradingSubmission, setGradingSubmission] = useState<SubmissionRecord | null>(null);
  const [inputEssayScore, setInputEssayScore] = useState<number>(85);
  const [inputFeedback, setInputFeedback] = useState<string>("");
  const [isSubmittingGrade, setIsSubmittingGrade] = useState(false);
  const [gradeSuccessNotice, setGradeSuccessNotice] = useState<string | null>(null);

  const fetchSubmissions = async () => {
    try {
      const res = await fetch(`/api/room/submissions?room_code=${encodeURIComponent(room.code)}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.submissions)) {
        // Merge with local room.visitors if not already present
        const dbSubs: SubmissionRecord[] = json.submissions;
        const localVisitors = room.visitors || [];

        localVisitors.forEach((v, idx) => {
          const exists = dbSubs.some(
            (s) => s.student_name.toLowerCase() === v.name.toLowerCase()
          );
          if (!exists) {
            dbSubs.push({
              id: `local-${idx}`,
              room_code: room.code,
              student_name: v.name,
              source: (v as any).source || "Online",
              status: v.score !== undefined ? "Selesai" : "Sedang mengerjakan",
              score: v.score || 0,
              mc_score: (v as any).mc_score,
              essay_score: (v as any).essay_score,
              answers: {
                essay: (v as any).essay_answer,
              },
              teacher_feedback: (v as any).teacher_feedback,
              created_at: v.accessed_at,
            });
          }
        });

        setSubmissions(dbSubs);
      }
    } catch (e) {
      console.warn("Failed to fetch room submissions:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
    const interval = setInterval(fetchSubmissions, 10000);
    return () => clearInterval(interval);
  }, [room.code]);

  // Aggregate Metrics
  const totalStudents = submissions.length;
  const completedCount = submissions.filter(
    (s) => s.status === "Selesai" || s.status === "Dinilai"
  ).length;
  const inProgressCount = submissions.filter(
    (s) => s.status === "Sedang mengerjakan" || s.status === "Belum mulai"
  ).length;
  const awaitingGradingCount = submissions.filter(
    (s) => s.status === "Belum dinilai"
  ).length;

  const onlineCount = submissions.filter((s) => s.source === "Online").length;
  const printScanCount = submissions.filter((s) => s.source === "Print + Scan").length;

  const scoredSubmissions = submissions.filter((s) => s.score !== undefined && s.score !== null && s.score > 0);
  const averageScore =
    scoredSubmissions.length > 0
      ? Math.round(
          scoredSubmissions.reduce((acc, curr) => acc + Number(curr.score), 0) /
            scoredSubmissions.length
        )
      : 0;

  // Filtered List
  const filteredSubmissions = submissions.filter((s) => {
    const matchesSearch = s.student_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSource = filterSource === "all" || s.source === filterSource;
    return matchesSearch && matchesSource;
  });

  const handleOpenGradeModal = (sub: SubmissionRecord) => {
    setGradingSubmission(sub);
    setInputEssayScore(sub.essay_score !== undefined ? sub.essay_score : 80);
    setInputFeedback(sub.teacher_feedback || "");
    setGradeSuccessNotice(null);
  };

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission) return;

    setIsSubmittingGrade(true);
    try {
      const res = await fetch("/api/room/grade-essay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room_code: room.code,
          student_name: gradingSubmission.student_name,
          essay_score: inputEssayScore,
          teacher_feedback: inputFeedback,
          submission_id: gradingSubmission.id.startsWith("local-") ? undefined : gradingSubmission.id,
        }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || "Gagal menyimpan penilaian.");
      }

      setGradeSuccessNotice("Nilai esai berhasil disimpan dan diperbarui!");
      setTimeout(() => {
        setGradingSubmission(null);
        setGradeSuccessNotice(null);
        fetchSubmissions();
        onRefresh?.();
      }, 1200);
    } catch (err: any) {
      alert("Gagal menyimpan nilai: " + err.message);
    } finally {
      setIsSubmittingGrade(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* ============================================================== */}
      {/* 1. METRICS CARDS (Claymorphism & Soft UI Palette)             */}
      {/* ============================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Siswa */}
        <div className="p-4 sm:p-5 rounded-[26px] bg-white border-2 border-[#51465B]/20 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#756F7A] block">
              Total Siswa
            </span>
            <span className="text-2xl sm:text-3xl font-black text-[#23212A] mt-1 block">
              {totalStudents}
            </span>
            <span className="text-[10px] text-[#756F7A] font-medium">Terdaftar di room</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#51465B]/10 text-[#51465B] flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Selesai & Berhasil */}
        <div className="p-4 sm:p-5 rounded-[26px] bg-white border-2 border-[#51465B]/20 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 block">
              Selesai Dinilai
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1 block">
              {completedCount}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              {awaitingGradingCount > 0 ? `${awaitingGradingCount} butuh koreksi` : "Tuntas dinilai"}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Rata-Rata Nilai */}
        <div className="p-4 sm:p-5 rounded-[26px] bg-white border-2 border-[#51465B]/20 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#756F7A] block">
              Rata-rata Nilai
            </span>
            <span className="text-2xl sm:text-3xl font-black text-[#51465B] mt-1 block">
              {averageScore > 0 ? averageScore : "-"}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">Skala 0 - 100</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#FFD36D]/30 text-[#8C6D23] flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Sumber Pengerjaan (Online vs Cetak) */}
        <div className="p-4 sm:p-5 rounded-[26px] bg-white border-2 border-[#51465B]/20 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#756F7A] block">
              Sumber Akses
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200 flex items-center gap-1">
                <Globe className="w-3 h-3" />
                {onlineCount} Web
              </span>
              <span className="text-xs font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-200 flex items-center gap-1">
                <Printer className="w-3 h-3" />
                {printScanCount} Cetak
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium mt-1 block">
              Pengerjaan luring & daring
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
            <Globe className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. PRATINJAU KONTEN & BUTIR SOAL DI ROOM INI                    */}
      {/* ============================================================== */}
      {question && (() => {
        const qItems = getQuestionItems(question);
        const mcCount = qItems.filter((i) => i.type === "multiple_choice").length;
        const essayCount = qItems.filter((i) => i.type === "essay").length;

        return (
          <div className="bg-white rounded-3xl border-2 border-[#51465B]/20 p-5 sm:p-7 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#51465B] flex items-center gap-1.5">
                  <FileQuestion className="w-3.5 h-3.5 text-[#51465B]" />
                  Paket Soal Terhubung di Room Ini
                </span>
                <h3 className="text-base font-black text-[#23212A] tracking-tight">
                  {question.topic || "Latihan Mandiri"}
                </h3>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-[#51465B] text-[#FFD36D]">
                  Total {qItems.length} Butir Soal
                </span>
                {mcCount > 0 && (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                    {mcCount} Pilihan Ganda
                  </span>
                )}
                {essayCount > 0 && (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-900 border border-purple-200">
                    {essayCount} Esai
                  </span>
                )}
              </div>
            </div>

            {/* Stimulus wacana if present */}
            {question.question_text &&
              qItems.length > 1 &&
              question.question_text !== qItems[0]?.question_text && (
                <div className="p-3.5 rounded-2xl bg-[#FAF7F3] border border-[#E9E5E8] text-xs font-medium text-[#23212A] leading-relaxed">
                  <span className="text-[10px] font-black uppercase text-[#51465B] block mb-1">
                    Wacana / Stimulus Kontekstual:
                  </span>
                  {question.question_text}
                </div>
              )}

            {/* List of items */}
            <div className="space-y-4 pt-1">
              {qItems.map((item, idx) => {
                const isMc = item.type === "multiple_choice";
                const isEs = item.type === "essay";

                return (
                  <div
                    key={item.id || idx}
                    className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#51465B] text-[#FFD36D] text-xs font-black flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-black text-[#23212A]">
                          Soal Nomor {idx + 1}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-black ${
                          isEs
                            ? "bg-purple-100 text-purple-900 border border-purple-200"
                            : "bg-amber-100 text-amber-900 border border-amber-200"
                        }`}
                      >
                        {isEs ? "Soal Uraian / Esai" : "Pilihan Ganda"}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm font-bold text-[#23212A] leading-relaxed">
                      {item.question_text}
                    </p>

                    {/* Options if Multiple Choice */}
                    {isMc && item.options && item.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {item.options.map((opt) => {
                          const isCorrect =
                            item.correct_answer === opt.key || item.correct_answer === opt.text;
                          return (
                            <div
                              key={opt.key}
                              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between gap-2 ${
                                isCorrect
                                  ? "bg-emerald-50 border-emerald-400 text-emerald-950 font-bold shadow-2xs"
                                  : "bg-white border-slate-200 text-[#23212A]"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                                    isCorrect ? "bg-emerald-600 text-white" : "bg-slate-100 text-[#23212A]"
                                  }`}
                                >
                                  {opt.key}
                                </span>
                                <span>{opt.text}</span>
                              </div>
                              {isCorrect && (
                                <span className="text-[9px] bg-emerald-600 text-white font-black px-1.5 py-0.5 rounded-full">
                                  Kunci Jawaban
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Rubrik if Essay */}
                    {isEs && item.rubric && (
                      <div className="p-3 rounded-xl bg-purple-50/80 border border-purple-200 text-xs text-purple-950 font-medium space-y-1">
                        <span className="font-bold block text-purple-900">Rubrik Penilaian:</span>
                        <p className="leading-relaxed">{item.rubric}</p>
                      </div>
                    )}

                    {/* Explanation if available */}
                    {item.explanation && (
                      <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 font-medium space-y-1">
                        <span className="font-bold flex items-center gap-1.5 text-amber-900">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          Pembahasan Guru:
                        </span>
                        <p className="leading-relaxed text-slate-800">{item.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* ============================================================== */}
      {/* 3. REKAP PESERTA & FILTER PENCARIAN                            */}
      {/* ============================================================== */}
      <div className="bg-white rounded-3xl border-2 border-[#51465B]/20 p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-[#23212A] tracking-tight">
              Daftar Siswa & Hasil Asesmen
            </h3>
            <p className="text-xs text-[#756F7A]">
              Pemantauan waktu nyata siswa yang masuk melalui web room maupun hasil pindaian naskah cetak.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchSubmissions}
              className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-[#51465B] transition-colors cursor-pointer"
              title="Perbarui Data"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search & Filter pills */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-1">
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama siswa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#23212A] focus:outline-none focus:border-[#51465B]"
            />
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setFilterSource("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterSource === "all"
                  ? "bg-[#51465B] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Semua ({totalStudents})
            </button>
            <button
              type="button"
              onClick={() => setFilterSource("Online")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                filterSource === "Online"
                  ? "bg-blue-600 text-white"
                  : "bg-blue-50 text-blue-800 hover:bg-blue-100"
              }`}
            >
              <Globe className="w-3 h-3" />
              <span>Online ({onlineCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterSource("Print + Scan")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                filterSource === "Print + Scan"
                  ? "bg-purple-700 text-white"
                  : "bg-purple-50 text-purple-800 hover:bg-purple-100"
              }`}
            >
              <Printer className="w-3 h-3" />
              <span>Print + Scan ({printScanCount})</span>
            </button>
          </div>
        </div>

        {/* Tabel Data Siswa */}
        {filteredSubmissions.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <Users className="w-10 h-10 mx-auto opacity-30" />
            <p className="text-xs font-semibold">
              Belum ada data pengerjaan yang tercatat untuk kriteria ini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="py-3 px-3">Nama Siswa</th>
                  <th className="py-3 px-3">Sumber</th>
                  <th className="py-3 px-3">Waktu Akses</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Nilai Akhir</th>
                  <th className="py-3 px-3 text-center">Aksi / Koreksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredSubmissions.map((sub, idx) => {
                  const isAwaitingGrading = sub.status === "Belum dinilai";

                  return (
                    <tr key={sub.id || idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-3">
                        <span className="font-bold text-[#23212A] block text-xs sm:text-sm">
                          {sub.student_name}
                        </span>
                        {sub.answers?.essay && (
                          <span className="text-[10px] text-purple-700 font-semibold line-clamp-1">
                            Esai: &ldquo;{sub.answers.essay}&rdquo;
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        {sub.source === "Online" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <Globe className="w-2.5 h-2.5" />
                            Online
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                            <Printer className="w-2.5 h-2.5" />
                            Print + Scan
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-slate-500 text-[11px]">
                        {new Date(sub.created_at).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        &bull;{" "}
                        {new Date(sub.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                        })}
                      </td>
                      <td className="py-3.5 px-3">
                        {isAwaitingGrading ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-300 animate-pulse">
                            Belum Dinilai
                          </span>
                        ) : sub.status === "Dinilai" || sub.status === "Selesai" ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {sub.status === "Dinilai" ? "Sudah Dinilai" : "Selesai"}
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                            {sub.status}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <span className="text-sm font-black text-[#51465B]">
                          {sub.score !== undefined ? sub.score : "-"}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        {sub.answers?.essay ? (
                          <button
                            type="button"
                            onClick={() => handleOpenGradeModal(sub)}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#51465B] hover:bg-[#3D3445] text-[#FFD36D] text-[11px] font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                          >
                            <Pencil className="w-3 h-3" />
                            <span>{isAwaitingGrading ? "Beri Nilai" : "Ubah Nilai"}</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">Otomatis</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 3. MODAL PENILAIAN ESAI OLEH GURU                              */}
      {/* ============================================================== */}
      {gradingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-[32px] sm:rounded-[36px] border border-slate-200 shadow-2xl p-6 sm:p-8 relative my-auto text-[#23212A] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#51465B] text-[#FFD36D] flex items-center justify-center">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#23212A]">Penilaian Jawaban Esai</h3>
                  <p className="text-xs text-slate-500">
                    Siswa: <strong>{gradingSubmission.student_name}</strong>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setGradingSubmission(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Pertanyaan Soal */}
            {question && (() => {
              const allItems = getQuestionItems(question);
              const essayItems = allItems.filter((it) => it.type === "essay");
              const mcItems = allItems.filter((it) => it.type === "multiple_choice");

              return (
                <div className="space-y-2">
                  {essayItems.length > 0 ? (
                    essayItems.map((esItem, esIdx) => (
                      <div key={esItem.id || esIdx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                          <span className="text-[10px] text-purple-900 font-bold uppercase tracking-wider">
                            Pertanyaan Esai {essayItems.length > 1 ? `#${esIdx + 1}` : ""}:
                          </span>
                        </div>
                        <p className="font-bold text-[#23212A] pt-0.5">{esItem.question_text}</p>
                        {esItem.rubric && (
                          <p className="text-[11px] text-slate-600 pt-1 border-t border-slate-200">
                            <strong>Rubrik Penilaian:</strong> {esItem.rubric}
                          </p>
                        )}
                        {esItem.explanation && (
                          <p className="text-[11px] text-slate-600">
                            <strong>Pembahasan:</strong> {esItem.explanation}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                        Pertanyaan Soal:
                      </span>
                      <p className="font-bold text-[#23212A]">{question.question_text}</p>
                    </div>
                  )}

                  {mcItems.length > 0 && (
                    <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 font-medium">
                      Paket ini juga mencakup {mcItems.length} butir Soal Pilihan Ganda (Skor PG Siswa: {gradingSubmission.mc_score !== undefined ? `${gradingSubmission.mc_score}/100` : "Tersinkron"}).
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Jawaban Siswa */}
            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 text-xs space-y-1">
              <span className="text-[10px] text-purple-900 font-bold uppercase tracking-wider block">
                Jawaban Siswa:
              </span>
              <p className="font-semibold text-slate-900 leading-relaxed whitespace-pre-wrap">
                {gradingSubmission.answers?.essay || "Tidak ada rekaman teks esai."}
              </p>
            </div>

            {/* Form Input Skor & Umpan Balik */}
            <form onSubmit={handleSaveGrade} className="space-y-3 pt-1">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Skor Esai (Skala 0 - 100):
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  required
                  value={inputEssayScore}
                  onChange={(e) => setInputEssayScore(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-[#51465B] text-sm font-black text-[#51465B] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Catatan Guru / Umpan Balik Pedagogis:
                </label>
                <textarea
                  rows={3}
                  value={inputFeedback}
                  onChange={(e) => setInputFeedback(e.target.value)}
                  placeholder="Bagus! Analisis langkah perhitungan sudah tepat, pertahankan ketelitianmu..."
                  className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-[#51465B] text-xs font-medium text-slate-800 focus:outline-none"
                />
              </div>

              {gradeSuccessNotice && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-900 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{gradeSuccessNotice}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setGradingSubmission(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingGrade}
                  className="px-5 py-2 rounded-xl bg-[#51465B] hover:bg-[#3D3445] text-[#FFD36D] text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingGrade ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Simpan & Beri Nilai</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
