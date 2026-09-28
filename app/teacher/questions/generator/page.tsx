"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Brain,
  CheckCircle2,
  RefreshCw,
  School as SchoolIcon,
} from "lucide-react";
import { TeacherWorkspaceShell } from "@/components/layout/teacher-workspace-shell";
import { repository } from "@/lib/db/repository";
import { geminiProvider } from "@/lib/ai/gemini-provider";
import { School } from "@/lib/db/types";

export default function QuestionGeneratorPage() {
  const router = useRouter();
  const [activeSchool, setActiveSchool] = useState<School | null>(null);

  // Form states
  const [subject, setSubject] = useState<"Matematika" | "Bahasa Indonesia" | "IPS">("Matematika");
  const [grade, setGrade] = useState<number>(5);
  const [topic, setTopic] = useState<string>("Aritmetika Sosial & Perkalian Bilangan Bulat");
  const [type, setType] = useState<"multiple_choice" | "essay" | "mixed">("multiple_choice");
  const [questionCount, setQuestionCount] = useState<number>(3);
  const [useLocalContext, setUseLocalContext] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setActiveSchool(repository.getActiveSchool());
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSchool) return;

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      // 1. Generate multi-question package via contextualize API
      const res = await fetch("/api/ai/contextualize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "question",
          inputMode: "ai",
          prompt: topic,
          topic,
          subject,
          grade,
          regionId: activeSchool.region_id || "35.02",
          regionName: useLocalContext ? activeSchool.region_name : "Karesidenan Madiun",
          questionCount,
          questionType: type,
        }),
      });

      const responseText = await res.text();
      let json: any = null;
      try {
        json = JSON.parse(responseText);
      } catch {
        json = null;
      }

      if (!res.ok || !json || !json.success || !json.data || !Array.isArray(json.data.questions)) {
        const errObj = json?.error;
        const msg =
          typeof errObj === "object"
            ? errObj.message
            : errObj ||
              (res.status === 504 || responseText.includes("An error occurred")
                ? "Proses AI memerlukan waktu lebih lama di server. Silakan klik 'Generate Sekarang' kembali."
                : `Layanan AI mengalami kendala (${res.status}). Silakan coba lagi.`);
        throw new Error(msg);
      }

      // 2. Save into repository with all generated items
      const teacher = repository.getCurrentUser();
      const savedQuestion = repository.saveQuestion({
        school_id: activeSchool.id,
        teacher_id: teacher.id,
        subject,
        grade,
        topic: json.data.topic || topic,
        type: type,
        items: json.data.questions,
        is_contextualized: true,
      });

      // 3. Navigate to Contextual Preview Screen for review
      router.push(`/teacher/questions/context-preview?id=${savedQuestion.id}`);
    } catch (err: any) {
      console.error("Failed to generate question:", err);
      setErrorMessage(
        "AI belum dapat memproses permintaan butir soal: " +
          (err.message || "Silakan periksa koneksi dan coba beberapa saat lagi.")
      );
      setIsGenerating(false);
    }
  };

  return (
    <TeacherWorkspaceShell activeGroupId="questions">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <Link
          href="/teacher/questions"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#756F7A] hover:text-[#23212A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Bank Soal</span>
        </Link>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-[28px] sm:rounded-[36px] border border-[#E9E5E8] p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-3.5 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-[#51465B] text-[#FFD36D] flex items-center justify-center shadow-xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#23212A] tracking-tight">
                Generate Butir Soal AI
              </h1>
              <p className="text-xs text-[#756F7A] font-semibold">
                Ditenagai Google Gemini AI & Contextual Engine ({activeSchool?.region_name})
              </p>
            </div>
          </div>
          <p className="text-xs text-[#756F7A] leading-relaxed">
            Pilih parameter kurikulum nasional di bawah ini. Sistem akan menghasilkan draf soal bermutu tinggi dan otomatis menghubungkannya ke modul kontekstualisasi wilayah sekolah.
          </p>
        </div>

        {/* Generator Form */}
        <form onSubmit={handleGenerate} className="bg-white rounded-[28px] sm:rounded-[36px] border border-[#E9E5E8] p-6 sm:p-8 shadow-xs space-y-5 text-xs">
          {/* Subject */}
          <div>
            <label className="font-black text-[#23212A] block mb-2">Mata Pelajaran (Fokus SD)</label>
            <div className="grid grid-cols-3 gap-2.5">
              {(["Matematika", "Bahasa Indonesia", "IPS"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSubject(s)}
                  className={`py-3 px-2 rounded-2xl border text-center font-black text-xs transition-all cursor-pointer ${
                    subject === s
                      ? "bg-[#51465B] text-white border-[#51465B] shadow-xs"
                      : "bg-[#FAF7F3] border-[#E9E5E8] text-[#756F7A] hover:bg-slate-100"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Grade & Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-[#23212A] block mb-1.5">Tingkat Kelas</label>
              <select
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-[#E9E5E8] bg-[#FAF7F3] font-bold text-[#23212A] focus:outline-none focus:ring-2 focus:ring-[#51465B]/20 cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6].map((g) => (
                  <option key={g} value={g}>
                    Kelas {g} SD
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-[#23212A] block mb-1.5">Variasi Soal</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "multiple_choice" | "essay" | "mixed")}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-[#E9E5E8] bg-[#FAF7F3] font-bold text-[#23212A] focus:outline-none focus:ring-2 focus:ring-[#51465B]/20 cursor-pointer"
              >
                <option value="multiple_choice">Pilihan Ganda (4 Opsi)</option>
                <option value="essay">Uraian / Esai Terbuka</option>
                <option value="mixed">Campuran / Variasi (Pilgan & Esai)</option>
              </select>
            </div>
          </div>

          {/* Question Count Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-[#23212A] block">Target Jumlah Soal</label>
              <span className="text-xs font-black text-[#51465B] bg-[#51465B]/10 px-2.5 py-0.5 rounded-full">
                {questionCount} Butir Soal
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 3, 5, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setQuestionCount(num)}
                  className={`py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                    questionCount === num
                      ? "bg-[#51465B] text-[#FFD36D] border-[#51465B] shadow-xs"
                      : "bg-[#FAF7F3] text-[#756F7A] border-[#E9E5E8] hover:bg-slate-100"
                  }`}
                >
                  {num} Soal
                </button>
              ))}
            </div>
          </div>

          {/* Topic */}
          <div>
            <label className="font-bold text-[#23212A] block mb-1.5">Materi / Topik Pembelajaran</label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Aritmetika Sosial, Paragraf Deskripsi, Seni Budaya Tradisional"
              className="w-full px-4 py-2.5 rounded-2xl border border-[#E9E5E8] bg-[#FAF7F3] font-semibold text-[#23212A] focus:outline-none focus:ring-2 focus:ring-[#51465B]/20"
            />
          </div>

          {/* Local Context Toggle */}
          <div className="bg-[#FFD36D]/20 border border-[#FFD36D] rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="font-black text-[#51465B] block text-xs">
                Hubungkan Langsung ke Konteks {activeSchool?.region_name}
              </span>
              <span className="text-[11px] text-[#756F7A] font-semibold leading-relaxed block mt-0.5">
                Sistem akan memprioritaskan entitas komoditas dan budaya terverifikasi di {activeSchool?.region_name}.
              </span>
            </div>
            <input
              type="checkbox"
              checked={useLocalContext}
              onChange={(e) => setUseLocalContext(e.target.checked)}
              className="w-5 h-5 accent-[#51465B] rounded cursor-pointer shrink-0 ml-3"
            />
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold leading-relaxed">
              {errorMessage}
            </div>
          )}

          {/* Submit Action: Button 'Generate' */}
          <button
            type="submit"
            disabled={isGenerating}
            className="w-full py-3.5 rounded-2xl bg-[#51465B] hover:bg-[#3D3445] text-white font-black text-sm shadow-md hover:shadow-lg transition-transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-[#FFD36D]" />
                <span>Sedang Menganalisis & Meng-generate Soal...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#FFD36D]" />
                <span>Generate</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </TeacherWorkspaceShell>
  );
}
