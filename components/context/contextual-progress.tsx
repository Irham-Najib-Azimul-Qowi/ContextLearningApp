"use client";

import React from "react";
import {
  FileText,
  Brain,
  Database,
  Sparkles,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  MapPin,
} from "lucide-react";

export interface PipelineStep {
  id: string;
  label: string;
  detail: string;
  status: "pending" | "processing" | "completed" | "error";
  icon: React.ElementType;
}

interface ContextualProgressProps {
  currentStepIndex: number;
  regionName: string;
  regionId?: string;
  title?: string;
  error?: string | null;
  onRetry?: () => void;
}

export const DEFAULT_PIPELINE_STEPS: Omit<PipelineStep, "status">[] = [
  {
    id: "read",
    label: "1. Membaca & Memahami Konten",
    detail: "Mengekstraksi entitas materi, struktur teks, dan kata kunci pembelajaran.",
    icon: FileText,
  },
  {
    id: "analyze",
    label: "2. Klasifikasi Kurikulum SD",
    detail: "Memastikan keselarasan tingkat kesulitan untuk siswa Kelas 5 SD.",
    icon: Brain,
  },
  {
    id: "lkb",
    label: "3. Temu Balik Local Knowledge Base",
    detail: "Mencari fakta geografis, komoditas, dan kearifan lokal terverifikasi via pgvector.",
    icon: Database,
  },
  {
    id: "rewrite",
    label: "4. Penyesuaian Narasi Kontekstual",
    detail: "Mengganti variabel umum menjadi konteks nyata di lingkungan siswa.",
    icon: Sparkles,
  },
  {
    id: "validate",
    label: "5. Validasi Edukatif & Pedagogis",
    detail: "Memverifikasi integritas kunci jawaban, rubrik, dan keterbacaan anak.",
    icon: CheckCircle2,
  },
  {
    id: "media",
    label: "6. Pemilihan Aset Visual Terverifikasi",
    detail: "Menyematkan foto atau ilustrasi pendukung berlisensi untuk wilayah terpilih.",
    icon: ImageIcon,
  },
];

export function ContextualProgress({
  currentStepIndex,
  regionName,
  regionId,
  title = "Contextual AI Engine sedang bekerja...",
  error,
  onRetry,
}: ContextualProgressProps) {
  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-[28px] sm:rounded-[32px] border border-[#E9E5E8] shadow-xl p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 pb-5 border-b border-[#E9E5E8]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F3] border border-[#E9E5E8] text-xs font-semibold text-[#51465B] mb-2">
            <MapPin className="w-3.5 h-3.5 text-[#F47D83]" />
            <span>Target Wilayah: {regionName} {regionId ? `(${regionId})` : ""}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#23212A] tracking-tight">
            {title}
          </h2>
          <p className="text-xs text-[#756F7A] mt-1">
            Proses otomatis berbasis data faktual Local Knowledge Base & Gemini AI.
          </p>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-[#51465B] text-[#FFD36D] flex items-center justify-center shrink-0 shadow-md">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      </div>

      {/* Stepped Progress List */}
      <div className="mt-6 space-y-3">
        {DEFAULT_PIPELINE_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          const isPending = idx > currentStepIndex;

          return (
            <div
              key={step.id}
              className={`flex items-start gap-3.5 p-3.5 rounded-[18px] transition-all duration-300 border ${
                isCurrent
                  ? "bg-[#FAF7F3] border-[#51465B]/30 shadow-xs"
                  : isCompleted
                  ? "bg-emerald-50/50 border-emerald-200/60"
                  : "bg-white border-transparent opacity-60"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                  isCurrent
                    ? "bg-[#51465B] text-[#FFD36D] shadow-sm animate-pulse"
                    : isCompleted
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3
                    className={`text-xs font-bold leading-tight ${
                      isCurrent
                        ? "text-[#51465B]"
                        : isCompleted
                        ? "text-emerald-900"
                        : "text-slate-500"
                    }`}
                  >
                    {step.label}
                  </h3>
                  {isCurrent && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#F47D83] bg-rose-50 px-2 py-0.5 rounded-full">
                      Diproses
                    </span>
                  )}
                  {isCompleted && (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                      Selesai
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#756F7A] mt-0.5 leading-snug">
                  {step.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Error / Recovery State */}
      {error && (
        <div className="mt-6 p-4 rounded-[20px] bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between gap-3">
          <div>
            <span className="font-bold block">Gagal memproses kontekstualisasi:</span>
            <span className="text-[11px] text-rose-700">{error}</span>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700"
            >
              Coba Lagi
            </button>
          )}
        </div>
      )}
    </div>
  );
}
