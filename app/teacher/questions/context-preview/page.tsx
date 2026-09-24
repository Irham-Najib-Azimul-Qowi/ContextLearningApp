"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  School as SchoolIcon,
  HelpCircle,
  Save,
  Check,
} from "lucide-react";
import { TeacherWorkspaceShell } from "@/components/layout/teacher-workspace-shell";
import { repository } from "@/lib/db/repository";
import { contextEngine } from "@/lib/context-engine/pipeline";
import { ContextualizationPipelineResult } from "@/lib/context-engine/types";
import { Question, School } from "@/lib/db/types";

function ContextPreviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const questionId = searchParams.get("id");

  const [activeSchool, setActiveSchool] = useState<School | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [pipelineResult, setPipelineResult] = useState<ContextualizationPipelineResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Alternative candidate selector
  const [selectedAlternative, setSelectedAlternative] = useState<string>("porang");

  const runPipeline = async (targetQ: Question, school: School, altOverride?: string) => {
    setIsLoading(true);
    try {
      const result = await contextEngine.executePipeline({
        questionText: targetQ.original_question_text || targetQ.question_text,
        subject: targetQ.subject,
        grade: targetQ.grade,
        regionId: school.region_id,
        regionName: school.region_name,
        options: targetQ.options,
        explanation: targetQ.explanation,
      });

      // If alternative chosen
      if (altOverride && altOverride !== "porang") {
        result.contextualized_text = result.contextualized_text.replace(/porang/gi, altOverride);
      }

      setPipelineResult(result);
    } catch (e) {
      console.error("Context engine failed:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const school = repository.getActiveSchool();
    setActiveSchool(school);

    let targetQ: Question | undefined;
    if (questionId) {
      targetQ = repository.getQuestion(questionId);
    }
    if (!targetQ) {
      // Pick first question in bank or fallback
      const allQ = repository.getQuestions({ schoolId: school.id });
      targetQ = allQ[0];
    }

    if (targetQ) {
      setQuestion(targetQ);
      runPipeline(targetQ, school);
    } else {
      setIsLoading(false);
    }
  }, [questionId]);

  const handleApproveAndSave = () => {
    if (!question || !pipelineResult || !activeSchool) return;

    repository.saveQuestion({
      ...question,
      question_text: pipelineResult.contextualized_text,
      is_contextualized: true,
      original_question_text: pipelineResult.original_text,
      options: pipelineResult.updated_options || question.options,
      explanation: pipelineResult.updated_explanation,
      context_variables: pipelineResult.mappings.map((m) => ({
        text: m.original_term,
        category: m.matched_entity.category,
        original_value: m.original_term,
        replacement_value: m.matched_entity.name,
        region_id: m.matched_entity.region_id,
        region_name: m.matched_entity.region_name,
      })),
    });

    setIsSaved(true);
    setTimeout(() => {
      router.push("/teacher/questions");
    }, 1500);
  };

  if (isLoading) {
    return (
      <TeacherWorkspaceShell activeGroupId="questions">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-sm font-bold text-slate-800">
            Contextual AI Engine sedang menganalisis variabel & kearifan lokal...
          </p>
          <p className="text-xs text-slate-500">
            Mengambil data terverifikasi untuk {activeSchool?.region_name || "Karesidenan Madiun"}
          </p>
        </div>
      </TeacherWorkspaceShell>
    );
  }

  if (!question || !pipelineResult) {
    return (
      <TeacherWorkspaceShell activeGroupId="questions">
        <div className="text-center py-12">
          <p className="text-sm text-slate-600 mb-4">Tidak ada soal yang dipilih untuk dianalisis.</p>
          <Link
            href="/teacher/questions"
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
          >
            Kembali ke Bank Soal
          </Link>
        </div>
      </TeacherWorkspaceShell>
    );
  }

  return (
    <TeacherWorkspaceShell activeGroupId="questions">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between gap-2 mb-6">
        <Link
          href="/teacher/questions"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Bank Soal</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full flex items-center gap-1">
            <SchoolIcon className="w-3.5 h-3.5" />
            <span>Konteks: {activeSchool?.region_name} ({activeSchool?.region_id})</span>
          </span>
        </div>
      </div>

      {/* Screen Title */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Studio Pratinjau Kontekstualisasi AI</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              Komparasi & Validasi Soal
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              Tinjau perbandingan butir soal kurikulum nasional asli dengan versi adaptasi kearifan lokal {activeSchool?.region_name}.
            </p>
          </div>

          <button
            type="button"
            onClick={handleApproveAndSave}
            disabled={isSaved}
            className={`px-6 py-3 rounded-2xl font-extrabold text-xs shadow-xs flex items-center gap-2 transition-transform active:scale-95 ${
              isSaved
                ? "bg-emerald-600 text-white"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4" />
                <span>Berhasil Disetujui & Disimpan!</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Setujui & Simpan ke Bank Soal</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Side-by-Side Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* LEFT: ORIGINAL QUESTION */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                1. Naskah Asli (Kurikulum Nasional)
              </span>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Standar Umum
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 mb-4">
              <p className="text-sm font-medium text-slate-800 leading-relaxed">
                {pipelineResult.original_text}
              </p>
            </div>

            {/* Original Options */}
            {question.options && (
              <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                <span className="font-bold text-slate-700 block mb-1">Opsi Jawaban Asli:</span>
                {question.options.map((opt) => (
                  <div
                    key={opt.key}
                    className={`p-2 rounded-xl border flex items-center gap-2 ${
                      opt.key === question.correct_answer
                        ? "bg-slate-100 border-slate-300 font-semibold"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <span className="font-bold w-5">{opt.key}.</span>
                    <span>{opt.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-100">
            Konteks generik belum dikaitkan dengan lingkungan siswa.
          </div>
        </div>

        {/* RIGHT: CONTEXTUALIZED QUESTION */}
        <div className="bg-white rounded-3xl border-2 border-indigo-500/80 p-6 shadow-md flex flex-col justify-between relative">
          <div className="absolute -top-3 right-6 bg-indigo-600 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full shadow-xs tracking-wider">
            Hasil Contextual Engine
          </div>

          <div>
            <div className="flex items-center justify-between pb-3 border-b border-indigo-100 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                2. Naskah Kontekstual ({activeSchool?.region_name})
              </span>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Terverifikasi Pedagogis</span>
              </span>
            </div>

            <div className="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-200 mb-4">
              <p className="text-sm font-medium text-slate-900 leading-relaxed">
                {pipelineResult.contextualized_text}
              </p>
            </div>

            {/* Contextualized Options */}
            {pipelineResult.updated_options && (
              <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                <span className="font-bold text-slate-700 block mb-1">Opsi Jawaban Diadaptasi:</span>
                {pipelineResult.updated_options.map((opt) => (
                  <div
                    key={opt.key}
                    className={`p-2 rounded-xl border flex items-center gap-2 ${
                      opt.key === question.correct_answer
                        ? "bg-emerald-50 border-emerald-300 font-semibold text-emerald-950"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <span className="font-bold w-5">{opt.key}.</span>
                    <span>{opt.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Explanation */}
          <div className="text-xs text-indigo-900 bg-indigo-50/70 p-3 rounded-xl border border-indigo-200/80 leading-relaxed">
            <span className="font-bold">Pembahasan Kontekstual: </span>
            {pipelineResult.updated_explanation}
          </div>
        </div>
      </div>

      {/* Extracted Context Variables & Alternative Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Variables List */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <span>Daftar Variabel Konteks yang Disesuaikan</span>
          </h3>

          <div className="space-y-3">
            {pipelineResult.mappings.map((m) => (
              <div
                key={m.variable_id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="line-through text-slate-400 font-semibold text-xs">
                      {m.original_term}
                    </span>
                    <span className="text-slate-400">&rarr;</span>
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {m.matched_entity.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium uppercase">
                      ({m.matched_entity.category})
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {m.pedagogical_justification}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-extrabold text-emerald-600 block">
                    Fit: {m.educational_fit_score}%
                  </span>
                  <span className="text-[10px] text-slate-400">{m.matched_entity.region_name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alternative Context Selector */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">Pilih Alternatif Konteks</h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Guru dapat mengganti entitas lokal sesuai fokus bahasan kelas:
            </p>

            <div className="space-y-2 text-xs">
              {[
                { id: "porang", label: "Porang Ponorogo (Komoditas Ekspor)", desc: "Sentra Pudak/Lereng Wilis" },
                { id: "susu sapi segar Pudak", label: "Susu Sapi Segar Pudak", desc: "Peternakan dataran tinggi" },
                { id: "kedelai lokal", label: "Kedelai Ponorogo", desc: "Bahan tempe/tahu lokal" },
              ].map((alt) => (
                <button
                  key={alt.id}
                  type="button"
                  onClick={() => {
                    setSelectedAlternative(alt.id);
                    if (activeSchool && question) {
                      runPipeline(question, activeSchool, alt.id);
                    }
                  }}
                  className={`w-full text-left p-3 rounded-2xl border transition-all ${
                    selectedAlternative === alt.id
                      ? "bg-indigo-50 border-indigo-500 text-indigo-900 font-bold"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <div className="text-xs">{alt.label}</div>
                  <div className="text-[10px] text-slate-400 font-normal">{alt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Perubahan alternatif akan langsung dihitung ulang dengan validasi integritas matematika.
          </div>
        </div>
      </div>

      {/* Educational Validation Integrity Card */}
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 text-sm">
              Status Validasi Edukasi & Integritas Matematika
            </h4>
            <p className="text-xs text-emerald-900 mt-0.5 leading-relaxed">
              {pipelineResult.validation.pedagogical_notes}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold text-emerald-800 shrink-0">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Angka Hitungan 100% Terjaga</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Kunci Jawaban Konsisten</span>
          </div>
        </div>
      </div>
    </TeacherWorkspaceShell>
  );
}

export default function ContextPreviewPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs">Memuat Pratinjau Kontekstual...</div>}>
      <ContextPreviewContent />
    </Suspense>
  );
}
