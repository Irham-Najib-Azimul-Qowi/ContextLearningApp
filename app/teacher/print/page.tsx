"use client";

import React, { useState, useEffect } from "react";
import {
  Printer,
  FileText,
  BookOpen,
  CheckCircle2,
  Settings,
  Eye,
  Layers,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { repository } from "@/lib/db/repository";
import { Examination, Question, LearningMaterial, School } from "@/lib/db/types";

type PrintMode = "student_exam" | "teacher_key" | "learning_material";

export default function TeacherPrintPage() {
  const [school, setSchool] = useState<School | null>(null);
  const [exams, setExams] = useState<Examination[]>([]);
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);

  // Selection
  const [printMode, setPrintMode] = useState<PrintMode>("student_exam");
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("");

  // Print Options
  const [includeSchoolHeader, setIncludeSchoolHeader] = useState(true);
  const [includeStudentField, setIncludeStudentField] = useState(true);
  const [includeAnswerBoxes, setIncludeAnswerBoxes] = useState(true);

  useEffect(() => {
    const schoolId = localStorage.getItem("cl_active_school_id") || "school-sd001-samarinda";
    const s = repository.getSchoolById(schoolId) || repository.getSchools()[0];
    setSchool(s);

    const exList = repository.getExaminations(schoolId);
    setExams(exList);
    if (exList.length > 0) setSelectedExamId(exList[0].id);

    const matList = repository.getMaterials(schoolId);
    setMaterials(matList);
    if (matList.length > 0) setSelectedMaterialId(matList[0].id);
  }, []);

  const currentExam = exams.find((e) => e.id === selectedExamId);
  const currentMaterial = materials.find((m) => m.id === selectedMaterialId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Control Panel — Hidden during Print */}
      <div className="no-print bg-white p-5 rounded-xl border border-[#DCE0EA] shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#252B3A] tracking-tight flex items-center gap-2">
            <Printer className="w-5 h-5 text-[#5865D8]" />
            Pusat Cetak Dokumen Pembelajaran (Format A4)
          </h1>
          <p className="text-xs text-[#697386] mt-0.5">
            Cetak lembar ujian siswa, kunci jawaban guru, atau materi ajar terkontekstualisasi siap pakai.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handlePrint}
          className="bg-[#5865D8] hover:bg-[#4753C4] text-xs font-semibold print-include"
        >
          <Printer className="w-4 h-4 mr-1.5" /> Cetak Sekarang (PDF / Print)
        </Button>
      </div>

      {/* Configuration Options — Hidden during Print */}
      <div className="no-print bg-white p-5 rounded-xl border border-[#DCE0EA] shadow-xs space-y-4 text-xs">
        <h2 className="text-sm font-bold text-[#252B3A] flex items-center gap-2">
          <Settings className="w-4 h-4 text-[#5865D8]" /> Pengaturan Tata Letak Cetak
        </h2>

        {/* Print Mode Selector */}
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setPrintMode("student_exam")}
            className={`p-3 rounded-xl border text-left transition-all ${
              printMode === "student_exam"
                ? "bg-[#5865D8]/10 border-[#5865D8] text-[#5865D8] font-bold"
                : "bg-[#F7F8FC] border-[#DCE0EA] text-[#252B3A]"
            }`}
          >
            <span className="block text-xs">Lembar Ujian Siswa</span>
            <span className="text-[10px] text-[#697386] font-normal">
              Soal + Ruang Jawaban (Tanpa Kunci)
            </span>
          </button>

          <button
            type="button"
            onClick={() => setPrintMode("teacher_key")}
            className={`p-3 rounded-xl border text-left transition-all ${
              printMode === "teacher_key"
                ? "bg-amber-50 border-amber-500 text-amber-800 font-bold"
                : "bg-[#F7F8FC] border-[#DCE0EA] text-[#252B3A]"
            }`}
          >
            <span className="block text-xs">Kunci Jawaban Guru</span>
            <span className="text-[10px] text-[#697386] font-normal">
              Kunci Opsi, Pembahasan, & Rubrik
            </span>
          </button>

          <button
            type="button"
            onClick={() => setPrintMode("learning_material")}
            className={`p-3 rounded-xl border text-left transition-all ${
              printMode === "learning_material"
                ? "bg-emerald-50 border-[#238B68] text-[#238B68] font-bold"
                : "bg-[#F7F8FC] border-[#DCE0EA] text-[#252B3A]"
            }`}
          >
            <span className="block text-xs">Materi Ajar Kontekstual</span>
            <span className="text-[10px] text-[#697386] font-normal">
              Bahan Bacaan & Karakteristik Lokal
            </span>
          </button>
        </div>

        {/* Resource Selection Dropdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {printMode !== "learning_material" ? (
            <div>
              <label className="font-semibold text-[#252B3A] block mb-1">Pilih Dokumen Ujian:</label>
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#DCE0EA] bg-[#F7F8FC]"
              >
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.title} ({ex.subject} - Kelas {ex.grade})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="font-semibold text-[#252B3A] block mb-1">Pilih Dokumen Materi:</label>
              <select
                value={selectedMaterialId}
                onChange={(e) => setSelectedMaterialId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#DCE0EA] bg-[#F7F8FC]"
              >
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.topic} ({m.subject} - Kelas {m.grade})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-4 pt-4">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={includeSchoolHeader}
                onChange={(e) => setIncludeSchoolHeader(e.target.checked)}
                className="rounded text-[#5865D8]"
              />
              <span>Kop Surat Resmi Sekolah</span>
            </label>

            {printMode === "student_exam" && (
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeStudentField}
                  onChange={(e) => setIncludeStudentField(e.target.checked)}
                  className="rounded text-[#5865D8]"
                />
                <span>Kolom Identitas Siswa</span>
              </label>
            )}
          </div>
        </div>
      </div>

      {/* A4 PRINT PREVIEW CONTAINER */}
      <div className="bg-white rounded-xl border border-[#DCE0EA] p-8 sm:p-12 shadow-sm max-w-4xl mx-auto print-page">
        {/* Kop Surat Sekolah */}
        {includeSchoolHeader && (
          <div className="border-b-2 border-black pb-4 mb-6 text-center space-y-0.5">
            <h2 className="text-base font-bold uppercase tracking-wide text-black">
              PEMERINTAH PROVINSI {school?.province.toUpperCase() || "KALIMANTAN TIMUR"}
            </h2>
            <h3 className="text-sm font-semibold uppercase text-black">
              DINAS PENDIDIKAN DAN KEBUDAYAAN • {school?.regency.toUpperCase() || "KOTA SAMARINDA"}
            </h3>
            <h1 className="text-lg font-extrabold uppercase text-black">
              {school?.name || "SD NEGERI 001 SAMARINDA KOTA"}
            </h1>
            <p className="text-[10px] text-gray-700">
              {school?.address || "Jl. Jenderal Sudirman No. 12"}, {school?.district} • NPSN: {school?.npsn || "30401234"}
            </p>
          </div>
        )}

        {/* Document Title */}
        <div className="text-center mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider underline">
            {printMode === "student_exam"
              ? "LEMBAR SOAL PENILAIAN HASIL BELAJAR"
              : printMode === "teacher_key"
              ? "KUNCI JAWABAN & PEDOMAN PENSKORAN GURU (RAHASIA)"
              : "MODUL MATERI PEMBELAJARAN KONTEKSTUAL"}
          </h2>
          <p className="text-xs font-semibold mt-1">
            Mata Pelajaran: {currentExam?.subject || currentMaterial?.subject || "Matematika"} • Kelas:{" "}
            {currentExam?.grade || currentMaterial?.grade || 5} • Tahun Ajaran 2026/2027
          </p>
        </div>

        {/* Student Identity Boxes */}
        {printMode === "student_exam" && includeStudentField && (
          <div className="border border-black p-3 rounded-none mb-6 text-xs grid grid-cols-2 gap-2">
            <div>
              <span className="inline-block w-28">Nama Lengkap Siswa</span>: ....................................................
            </div>
            <div>
              <span className="inline-block w-28">Nomor Induk / NISN</span>: ....................................................
            </div>
            <div>
              <span className="inline-block w-28">Rombongan Belajar</span>: {currentExam?.class_name || "Kelas 5-A"}
            </div>
            <div>
              <span className="inline-block w-28">Hari / Tanggal</span>: ....................................................
            </div>
          </div>
        )}

        {/* CONTENT RENDERING */}
        {printMode === "student_exam" && currentExam && (
          <div className="space-y-6 text-xs text-black">
            <p className="italic font-medium border-b border-gray-300 pb-1">
              Petunjuk Umum: Bacalah dengan seksama setiap butir soal berikut dan pilih atau tuliskan jawaban yang paling tepat!
            </p>

            {(currentExam.questions || []).map((q, idx) => (
              <div key={q.id} className="avoid-break space-y-2 pt-2">
                <div className="flex gap-2">
                  <span className="font-bold">{idx + 1}.</span>
                  <div className="flex-1 space-y-2">
                    <p className="leading-relaxed whitespace-pre-line">{q.original_text}</p>

                    {/* Options if MCQ */}
                    {q.question_type === "multiple_choice" && q.options && (
                      <div className="grid grid-cols-2 gap-2 pl-2">
                        {q.options.map((opt) => (
                          <div key={opt.id} className="flex items-start gap-1.5">
                            <span className="font-bold">{opt.id}.</span>
                            <span>{opt.text}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Essay Writing Space */}
                    {q.question_type === "essay" && includeAnswerBoxes && (
                      <div className="mt-3 border border-gray-400 p-2 h-24 rounded-xs text-[10px] text-gray-400">
                        Ruang Jawaban Uraian Siswa:
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TEACHER ANSWER KEY MODE */}
        {printMode === "teacher_key" && currentExam && (
          <div className="space-y-4 text-xs text-black">
            <div className="p-2 bg-amber-50 border border-amber-300 text-amber-900 font-semibold mb-3">
              DOKUMEN PEGANGAN GURU — Jangan dibagikan kepada peserta didik.
            </div>

            {(currentExam.questions || []).map((q, idx) => (
              <div key={q.id} className="avoid-break p-3 border border-gray-300 space-y-1.5">
                <div className="flex justify-between font-bold">
                  <span>Nomor {idx + 1} ({q.question_type === "multiple_choice" ? "Pilihan Ganda" : "Uraian"})</span>
                  <span className="text-[#5865D8]">Kunci Benar: {q.correct_answer}</span>
                </div>
                <p className="text-gray-700">{q.original_text}</p>
                {q.explanation && (
                  <p className="text-[#238B68] font-medium pt-1">
                    <strong>Penjelasan Pedagogis:</strong> {q.explanation}
                  </p>
                )}
                {q.rubric && (
                  <p className="text-purple-800 font-medium">
                    <strong>Pedoman Penskoran:</strong> {q.rubric}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* LEARNING MATERIAL MODE */}
        {printMode === "learning_material" && currentMaterial && (
          <div className="space-y-4 text-xs text-black leading-relaxed">
            <h3 className="text-sm font-bold text-center border-b pb-2">{currentMaterial.topic}</h3>
            <div>
              <h4 className="font-bold mb-1">Tujuan Pembelajaran:</h4>
              <p className="text-gray-800">{currentMaterial.learning_objectives}</p>
            </div>
            <div>
              <h4 className="font-bold mb-1">Uraian Materi Kontekstual:</h4>
              <p className="whitespace-pre-line text-justify leading-loose">
                {currentMaterial.contextualized_content || currentMaterial.original_content}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
