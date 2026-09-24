"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { Printer, ArrowLeft, Image as ImageIcon, Eye, Key, ShieldCheck, CheckCircle2 } from "lucide-react";
import { repository } from "@/lib/db/repository";
import { Exam, Question, School } from "@/lib/db/types";

interface PrintExamPageProps {
  params: Promise<{ id: string }>;
}

export default function PrintExamPage({ params }: PrintExamPageProps) {
  const resolvedParams = use(params);
  const examId = resolvedParams.id;

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [school, setSchool] = useState<School | null>(null);

  // Print Settings Controls
  const [mode, setMode] = useState<"student" | "teacher_key">("student");
  const [includeImages, setIncludeImages] = useState<boolean>(true);
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg">("base");

  useEffect(() => {
    const activeSchool = repository.getActiveSchool();
    setSchool(activeSchool);

    const foundExam = repository.getExam(examId);
    if (foundExam) {
      setExam(foundExam);
      const allQuestions = repository.getQuestions({ schoolId: activeSchool.id });
      const examQuestions = allQuestions.filter((q) => foundExam.question_ids.includes(q.id));
      setQuestions(examQuestions);
    }
  }, [examId]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (!exam) {
    return (
      <div className="min-h-screen bg-[#FAF7F3] p-8 text-center text-[#23212A]">
        <p className="text-sm font-bold mb-4">Ujian tidak ditemukan atau belum memiliki butir soal.</p>
        <Link
          href="/teacher/examinations"
          className="px-4 py-2 bg-[#51465B] text-white rounded-xl text-xs font-bold"
        >
          Kembali ke Daftar Ujian
        </Link>
      </div>
    );
  }

  const textSizeClass =
    fontSize === "sm" ? "text-xs" : fontSize === "lg" ? "text-base" : "text-sm";

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 print:bg-white print:p-0">
      {/* 1. NON-PRINTABLE TOP CONTROLS TOOLBAR */}
      <header className="no-print sticky top-0 z-40 bg-white border-b border-[#E9E5E8] shadow-sm px-6 py-4">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/teacher/examinations"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Kembali"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-sm font-black text-[#23212A]">Ekspor Cetak Dokumen A4</h1>
              <p className="text-xs text-slate-500">{exam.title} &bull; {questions.length} Butir Soal</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200">
              <button
                type="button"
                onClick={() => setMode("student")}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  mode === "student" ? "bg-white text-[#51465B] shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Lembar Siswa</span>
              </button>
              <button
                type="button"
                onClick={() => setMode("teacher_key")}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  mode === "teacher_key" ? "bg-[#51465B] text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>Kunci Jawaban Guru</span>
              </button>
            </div>

            {/* Image Toggle */}
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer bg-slate-100 px-3 py-2 rounded-xl border border-slate-200">
              <input
                type="checkbox"
                checked={includeImages}
                onChange={(e) => setIncludeImages(e.target.checked)}
                className="rounded accent-[#51465B]"
              />
              <ImageIcon className="w-3.5 h-3.5 text-[#F47D83]" />
              <span>Gambar</span>
            </label>

            {/* Print Trigger Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2 rounded-xl bg-[#51465B] hover:bg-[#3E3547] text-white text-xs font-extrabold flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Printer className="w-4 h-4 text-[#FFD36D]" />
              <span>Cetak Sekarang (A4)</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. PRINTABLE A4 CONTAINER */}
      <main className="max-w-[210mm] mx-auto my-6 print:my-0 bg-white shadow-xl print:shadow-none print:w-full p-[15mm] sm:p-[20mm] rounded-2xl print:rounded-none border border-slate-200 print:border-none">
        {/* KOP RESMI SEKOLAH / DOKUMEN ASESMEN */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="text-left flex-1">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Pemerintah Daerah {school?.region_name || "Kabupaten Ponorogo"}
              </div>
              <h2 className="text-lg sm:text-xl font-black uppercase text-slate-950 tracking-tight">
                {school?.name || "SD Negeri 1 Pembelajaran"}
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                {school?.address || "Kawasan Pendidikan Kontekstual"} &bull; Kurikulum Merdeka Fase C (Kelas 5 SD)
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="inline-block px-3 py-1 rounded bg-slate-100 border border-slate-300 text-[11px] font-mono font-bold">
                {mode === "teacher_key" ? "KUNCI GURU" : "LEMBAR SISWA"}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-300 text-center">
            <h3 className="text-base font-extrabold uppercase text-slate-900">
              {exam.title}
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-700 mt-1">
              <span>Mata Pelajaran: <strong>{exam.subject}</strong></span>
              <span>&bull;</span>
              <span>Kelas: <strong>5 (Lima) SD</strong></span>
              <span>&bull;</span>
              <span>Alokasi Waktu: <strong>{exam.duration_minutes} Menit</strong></span>
            </div>
          </div>
        </div>

        {/* STUDENT IDENTIFIER FORM BOX (STUDENT MODE ONLY) */}
        {mode === "student" && (
          <div className="mb-6 p-4 rounded-xl border border-slate-400 bg-slate-50/50 print:bg-transparent grid grid-cols-2 gap-4 text-xs">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-bold w-24">Nama Siswa:</span>
                <span className="flex-1 border-b border-dotted border-slate-500 min-h-[16px]"></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold w-24">Nomor Absen:</span>
                <span className="flex-1 border-b border-dotted border-slate-500 min-h-[16px]"></span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-bold w-24">Kelas:</span>
                <span className="flex-1 border-b border-dotted border-slate-500 min-h-[16px]">{exam.class_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold w-24">Tanggal:</span>
                <span className="flex-1 border-b border-dotted border-slate-500 min-h-[16px]"></span>
              </div>
            </div>
          </div>
        )}

        {/* PETUNJUK PENGERJAAN */}
        <div className="mb-6 text-xs text-slate-700 leading-relaxed bg-slate-50 print:bg-transparent p-3 rounded-lg border border-slate-200 print:border-none">
          <span className="font-bold block mb-1">Petunjuk Umum:</span>
          <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-slate-600">
            <li>Tuliskan identitas Anda secara lengkap dan rapi pada kolom yang telah disediakan.</li>
            <li>Bacalah setiap butir soal kontekstual dengan cermat sebelum menjawab.</li>
            <li>Untuk soal pilihan ganda, berilah tanda silang (X) pada salah satu huruf A, B, C, atau D yang Anda anggap paling benar.</li>
            <li>Periksa kembali seluruh jawaban Anda sebelum diserahkan kepada Bapak/Ibu guru.</li>
          </ol>
        </div>

        {/* DAFTAR BUTIR SOAL */}
        <div className="space-y-6">
          {questions.map((q, idx) => (
            <div
              key={q.id}
              className="break-inside-avoid page-break-inside-avoid pb-4 border-b border-slate-200 last:border-none"
            >
              {/* Question Header & Stem */}
              <div className="flex items-start gap-2.5">
                <span className="font-bold text-sm text-slate-900 shrink-0">{idx + 1}.</span>
                <div className="flex-1">
                  <p className={`${textSizeClass} text-slate-900 leading-relaxed font-medium`}>
                    {q.question_text}
                  </p>

                  {/* Visual Supporting Image (if present & enabled) */}
                  {includeImages && (q.image_url || q.media_asset?.image_url) && (
                    <div className="my-3 max-w-sm rounded-xl overflow-hidden border border-slate-200 bg-slate-50 p-2">
                      <img
                        src={q.image_url || q.media_asset?.image_url}
                        alt={q.image_alt || q.media_asset?.alt_text || "Gambar pendukung soal"}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      {(q.image_caption || q.media_asset?.caption) && (
                        <div className="text-[10px] text-slate-600 mt-1.5 font-medium">
                          {q.image_caption || q.media_asset?.caption}
                        </div>
                      )}
                      {(q.image_attribution || q.media_asset?.attribution_text) && (
                        <div className="text-[9px] text-slate-400 mt-0.5 italic">
                          {q.image_attribution || q.media_asset?.attribution_text}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Options (Multiple Choice) */}
                  {q.type === "multiple_choice" && q.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs">
                      {q.options.map((opt) => {
                        const isCorrect = mode === "teacher_key" && opt.key === q.correct_answer;
                        return (
                          <div
                            key={opt.key}
                            className={`p-2 rounded-lg flex items-start gap-2 border ${
                              isCorrect
                                ? "bg-emerald-50 border-emerald-500 font-bold text-emerald-950 print:border-slate-900 print:bg-slate-100"
                                : "border-slate-200"
                            }`}
                          >
                            <span className="font-bold shrink-0">{opt.key}.</span>
                            <span>{opt.text}</span>
                            {isCorrect && (
                              <span className="ml-auto text-[10px] uppercase font-mono text-emerald-700 print:text-black">
                                [KUNCI]
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Essay Writing Area (Student Mode) */}
                  {q.type === "essay" && mode === "student" && (
                    <div className="mt-3 space-y-3 pt-2">
                      <div className="text-[11px] text-slate-400 italic">Ruang Jawaban:</div>
                      <div className="border-b border-slate-300 min-h-[24px]"></div>
                      <div className="border-b border-slate-300 min-h-[24px]"></div>
                      <div className="border-b border-slate-300 min-h-[24px]"></div>
                    </div>
                  )}

                  {/* Teacher Key & Explanation (Teacher Mode Only) */}
                  {mode === "teacher_key" && (
                    <div className="mt-3 p-3 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-950 print:bg-slate-50 print:border-slate-300">
                      <div className="font-bold flex items-center gap-1.5 text-indigo-900 print:text-black mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 print:text-black" />
                        <span>Kunci Jawaban: {q.correct_answer}</span>
                      </div>
                      <div className="text-[11px] leading-relaxed">
                        <span className="font-semibold">Pembahasan Guru: </span>
                        {q.explanation}
                      </div>
                      {q.rubric && (
                        <div className="text-[10px] text-slate-600 mt-1 italic">
                          Rubrik: {q.rubric}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER ATRIBUSI HUKUM & NOMOR DOKUMEN */}
        <footer className="mt-8 pt-4 border-t border-slate-300 flex items-center justify-between text-[10px] text-slate-500">
          <span>Depaskan — Basis Pengetahuan Lokal Karesidenan Madiun & Semarang</span>
          <span>Lembar Asesmen Resmi Kelas 5 SD</span>
        </footer>
      </main>

      {/* PRINT-SPECIFIC CSS RULES */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background-color: white !important;
            color: black !important;
            font-size: 12pt;
          }
          .break-inside-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
