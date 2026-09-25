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
  const [type, setType] = useState<"multiple_choice" | "essay">("multiple_choice");
  const [useLocalContext, setUseLocalContext] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  useEffect(() => {
    setActiveSchool(repository.getActiveSchool());
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSchool) return;

    setIsGenerating(true);

    try {
      // 1. Generate base question via Gemini Provider (or structured fallback)
      const generated = await geminiProvider.generateQuestion({
        subject,
        grade,
        topic,
        type,
        localContextRegion: useLocalContext ? activeSchool.region_name : undefined,
      });

      // 2. Save into repository as draft question
      const teacher = repository.getCurrentUser();
      const savedQuestion = repository.saveQuestion({
        school_id: activeSchool.id,
        teacher_id: teacher.id,
        subject: generated.subject,
        grade: generated.grade,
        topic: generated.topic,
        type: generated.type,
        question_text: generated.question_text,
        options: generated.options,
        correct_answer: generated.correct_answer,
        explanation: generated.explanation,
        is_contextualized: false,
      });

      // 3. Navigate to Contextual Preview Screen for review & variable mapping
      router.push(`/teacher/questions/context-preview?id=${savedQuestion.id}`);
    } catch (err) {
      console.error("Failed to generate question:", err);
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
              <label className="font-bold text-[#23212A] block mb-1.5">Bentuk Soal</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "multiple_choice" | "essay")}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-[#E9E5E8] bg-[#FAF7F3] font-bold text-[#23212A] focus:outline-none focus:ring-2 focus:ring-[#51465B]/20 cursor-pointer"
              >
                <option value="multiple_choice">Pilihan Ganda (4 Opsi)</option>
                <option value="essay">Uraian / Esai Terbuka</option>
              </select>
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
              placeholder="Contoh: Aritmetika Sosial, Paragraf Deskripsi, Seni Budaya Tradisional"
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

          {/* Submit Action */}
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
                <span>Generate Soal & Lanjut ke Pratinjau Konteks</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </TeacherWorkspaceShell>
  );
}
