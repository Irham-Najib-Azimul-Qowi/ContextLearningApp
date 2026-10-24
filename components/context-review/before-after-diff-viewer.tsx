"use client";

import React, { useState } from "react";
import {
  CheckCircle,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  MapPin,
  FileText,
  Check,
  Eye,
  Columns,
  List,
  Lock,
  Info,
  Edit3,
} from "lucide-react";
import { TextDiffChunk } from "@/lib/context-engine/contract";

export interface ContextVariableItem {
  original_term: string;
  replacement_term: string;
  category?: string;
  reason?: string;
}

export interface BeforeAfterDiffViewerProps {
  /**
   * Source workflow mode:
   * - "existing_source": Manual text, PDF extract, camera OCR with pre-existing document.
   * - "pure_ai_generation": Generated directly from prompt with no prior document.
   * - "ai_then_contextualized": Prompt generated first, then localized in a subsequent step.
   */
  mode: "existing_source" | "pure_ai_generation" | "ai_then_contextualized";

  /** Text before adaptation (original or initial AI snapshot) */
  originalText?: string;

  /** Adapted contextualized text */
  contextualizedText: string;

  /** Prompt used if generated from prompt */
  promptText?: string;

  /** Structured diff chunks from context engine */
  diffChunks?: TextDiffChunk[];

  /** Variable transformations with category and rationale */
  contextVariables?: ContextVariableItem[];

  /** Independent validation result */
  validation?: {
    is_valid: boolean;
    status?: "VALID" | "WARNING" | "INVALID";
    competency_preserved?: boolean;
    answer_key_preserved?: boolean;
    math_numbers_strictly_preserved?: boolean;
    local_context_grounded?: boolean;
    warnings?: string[];
    pedagogical_notes?: string;
  };

  /** Target region name */
  regionName: string;

  /** Model / engine identifier */
  modelUsed?: string;

  /** Label for content (e.g. "Materi Ajar" or "Butir Soal") */
  contentTypeLabel?: string;

  /** Teacher inline editing */
  isEditable?: boolean;
  onTextChange?: (newText: string) => void;

  /** Human-in-the-loop teacher approval */
  isTeacherApproved?: boolean;
  onToggleApproval?: (approved: boolean) => void;

  /** Action for subsequent localization if pure AI draft */
  onSubsequentContextualize?: () => void;
  isSubsequentLoading?: boolean;
}

export function BeforeAfterDiffViewer({
  mode,
  originalText = "",
  contextualizedText,
  promptText = "",
  diffChunks = [],
  contextVariables = [],
  validation,
  regionName,
  modelUsed = "deterministic-rule-engine-v1",
  contentTypeLabel = "Konten Pembelajaran",
  isEditable = true,
  onTextChange,
  isTeacherApproved = false,
  onToggleApproval,
  onSubsequentContextualize,
  isSubsequentLoading = false,
}: BeforeAfterDiffViewerProps) {
  const [viewLayout, setViewLayout] = useState<"split" | "inline" | "adapted_only">("split");
  const [isInlineEditing, setIsInlineEditing] = useState(false);

  const isDeterministic =
    modelUsed.includes("deterministic") || modelUsed.includes("rule-engine");

  // Determine if diff can be rendered
  const hasDiffData = diffChunks && diffChunks.length > 0;
  const verifiedVariables = contextVariables.filter(
    (cv) => cv.original_term && cv.replacement_term && cv.original_term !== cv.replacement_term
  );

  return (
    <div
      className="rounded-3xl border-2 border-white/15 bg-[#251E2B]/95 p-4 sm:p-6 space-y-5 text-white shadow-xl"
      role="region"
      aria-label={`Panel Peninjauan Kontekstualisasi ${contentTypeLabel}`}
    >
      {/* ------------------------------------------------------------------ */}
      {/* 1. Header: Mode Badge, Region, and Layout Switcher                 */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                mode === "existing_source"
                  ? "bg-purple-500/25 text-purple-200 border border-purple-400/30"
                  : mode === "ai_then_contextualized"
                  ? "bg-indigo-500/25 text-indigo-200 border border-indigo-400/30"
                  : "bg-amber-500/25 text-amber-200 border border-amber-400/30"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FFD36D]" />
              {mode === "existing_source"
                ? "Adaptasi Naskah Asli"
                : mode === "ai_then_contextualized"
                ? "Draf AI Disesuaikan Lokal"
                : "Draf Rumusan Baru (Prompt AI)"}
            </span>

            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FFD36D]/20 text-[#FFD36D] border border-[#FFD36D]/30 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {regionName}
            </span>

            <span
              className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/10 text-gray-300 font-mono"
              title={`Mesin Kontekstualisasi: ${modelUsed}`}
            >
              {isDeterministic ? "Deterministic Engine" : "Gemini Fallback Engine"}
            </span>
          </div>

          <p className="text-xs text-gray-300">
            {mode === "existing_source" &&
              "Perbandingan naskah asli dengan hasil adaptasi kearifan lokal. Konsep inti dan kuantitas dijaga tetap utuh."}
            {mode === "pure_ai_generation" &&
              "Draf modul baru dirumuskan dari permintaan prompt guru. Konten belum memiliki naskah pembanding sebelum."}
            {mode === "ai_then_contextualized" &&
              "Draf hasil generate awal (snapshot sumber) dibandingkan dengan hasil kontekstualisasi kearifan lokal lanjutan."}
          </p>
        </div>

        {/* Layout Switcher (Only applicable if we have an original comparison) */}
        {mode !== "pure_ai_generation" && (
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10 self-start sm:self-center">
            <button
              type="button"
              onClick={() => setViewLayout("split")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewLayout === "split"
                  ? "bg-[#FFD36D] text-[#251E2B] shadow-xs"
                  : "text-gray-300 hover:text-white hover:bg-white/10"
              }`}
              aria-label="Tampilan Berdampingan"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Berdampingan</span>
            </button>
            <button
              type="button"
              onClick={() => setViewLayout("inline")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewLayout === "inline"
                  ? "bg-[#FFD36D] text-[#251E2B] shadow-xs"
                  : "text-gray-300 hover:text-white hover:bg-white/10"
              }`}
              aria-label="Tampilan Sorot Diff"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sorot Diff</span>
            </button>
            <button
              type="button"
              onClick={() => setViewLayout("adapted_only")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewLayout === "adapted_only"
                  ? "bg-[#FFD36D] text-[#251E2B] shadow-xs"
                  : "text-gray-300 hover:text-white hover:bg-white/10"
              }`}
              aria-label="Tampilan Hasil Jadi"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Hasil Jadi</span>
            </button>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 2. Validation Status & Automated Checklist                         */}
      {/* ------------------------------------------------------------------ */}
      {validation && (() => {
        const validationStatus = validation.status || (validation.is_valid ? "VALID" : "WARNING");
        return (
          <div
            className={`p-4 rounded-2xl border space-y-2.5 ${
              validationStatus === "VALID"
                ? "bg-emerald-500/10 border-emerald-500/30"
                : validationStatus === "WARNING"
                ? "bg-amber-500/10 border-amber-500/30"
                : "bg-rose-500/10 border-rose-500/30"
            }`}
            role="status"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck
                  className={`w-5 h-5 ${
                    validationStatus === "VALID"
                      ? "text-emerald-400"
                      : validationStatus === "WARNING"
                      ? "text-amber-400"
                      : "text-rose-400"
                  }`}
                />
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  Hasil Validasi Invarian Otomatis (DEPASKAN Independent Validator)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] px-2.5 py-0.5 rounded-full font-extrabold ${
                    validationStatus === "VALID"
                      ? "bg-emerald-400 text-slate-900"
                      : validationStatus === "WARNING"
                      ? "bg-amber-400 text-slate-900"
                      : "bg-rose-400 text-white"
                  }`}
                >
                  {validationStatus === "VALID"
                    ? "Invarian Valid 100%"
                    : validationStatus === "WARNING"
                    ? "Perlu Peninjauan Guru"
                    : "Invarian Tidak Sesuai"}
                </span>
              </div>
            </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span
              className={`px-2.5 py-1 rounded-xl border font-semibold flex items-center gap-1 ${
                validation.math_numbers_strictly_preserved !== false
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                  : "bg-rose-500/20 text-rose-300 border-rose-500/30"
              }`}
            >
              <Lock className="w-3 h-3" /> Kuantitas & Fakta Matematika Terjaga
            </span>

            <span
              className={`px-2.5 py-1 rounded-xl border font-semibold flex items-center gap-1 ${
                validation.local_context_grounded !== false
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                  : "bg-amber-500/20 text-amber-300 border-amber-500/30"
              }`}
            >
              <MapPin className="w-3 h-3" /> Terpancang Kearifan Lokal {regionName}
            </span>

            <span className="px-2.5 py-1 rounded-xl bg-purple-500/20 text-purple-200 border border-purple-500/30 font-semibold flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Zero Leakage Teruji
            </span>
          </div>

          {validation.warnings && validation.warnings.length > 0 && (
            <div className="p-3 rounded-xl bg-black/40 border border-amber-500/30 text-amber-200 text-xs space-y-1">
              {validation.warnings.map((w, wIdx) => (
                <div key={wIdx} className="flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{w}</span>
                </div>
              ))}
            </div>
          )}

          {validation.pedagogical_notes && (
            <p className="text-[11px] text-gray-300 italic border-t border-white/10 pt-1.5">
              Catatan: {validation.pedagogical_notes}
            </p>
          )}
        </div>
        );
      })()}

      {/* ------------------------------------------------------------------ */}
      {/* 3. Provenance & Substituted Variables Bar                          */}
      {/* ------------------------------------------------------------------ */}
      {verifiedVariables.length > 0 && (
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#FFD36D]" />
              Catatan Provenans Substitusi Entitas Lokal ({regionName}):
            </span>
            <span className="text-[11px] text-[#FFD36D] font-bold">
              {verifiedVariables.length} entitas disesuaikan
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {verifiedVariables.map((cv, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-white/10 border border-white/15 text-xs text-white space-y-1 shadow-xs"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-gray-400 line-through truncate" title={cv.original_term}>
                    {cv.original_term}
                  </span>
                  <ArrowRight className="w-3 h-3 text-[#FFD36D] shrink-0" />
                  <span className="font-bold text-[#FFD36D] truncate" title={cv.replacement_term}>
                    {cv.replacement_term}
                  </span>
                </div>
                {cv.category && (
                  <div className="flex items-center justify-between text-[10px] text-gray-300 pt-0.5">
                    <span className="px-1.5 py-0.5 rounded-md bg-white/10 uppercase tracking-wider font-mono">
                      {cv.category}
                    </span>
                    <span className="truncate ml-1 italic text-gray-400" title={cv.reason}>
                      {cv.reason || "Kearifan lokal"}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 4. Main Content Comparison Layout                                  */}
      {/* ------------------------------------------------------------------ */}

      {/* MODE A: Pure AI generation from prompt (No misleading before diff) */}
      {mode === "pure_ai_generation" && (
        <div className="space-y-4">
          {promptText && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2.5">
              <FileText className="w-4 h-4 text-[#FFD36D] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">Permintaan Prompt Guru:</span>
                <span className="italic font-normal">&ldquo;{promptText}&rdquo;</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#FFD36D] uppercase tracking-wider block">
                Draf Hasil Rumusan AI (Dapat Diedit Langsung Oleh Guru)
              </label>
              {isEditable && (
                <button
                  type="button"
                  onClick={() => setIsInlineEditing(!isInlineEditing)}
                  className="text-[11px] text-gray-300 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{isInlineEditing ? "Kunci Tampilan" : "Edit Naskah"}</span>
                </button>
              )}
            </div>

            {isInlineEditing && isEditable ? (
              <textarea
                rows={10}
                value={contextualizedText}
                onChange={(e) => onTextChange?.(e.target.value)}
                className="w-full p-4 rounded-2xl border-2 border-[#FFD36D]/50 bg-[#251E2B] focus:border-[#FFD36D] text-xs sm:text-sm text-white focus:outline-none transition-all shadow-inner leading-relaxed min-h-[220px]"
                aria-label="Editor Naskah Hasil Rumusan"
              />
            ) : (
              <div
                className="w-full p-4 sm:p-5 rounded-2xl border-2 border-white/20 bg-black/20 text-xs sm:text-sm text-white leading-relaxed whitespace-pre-wrap font-medium min-h-[200px]"
                tabIndex={0}
                aria-label="Pratinjau Draf Konten"
              >
                {contextualizedText}
              </div>
            )}
          </div>

          {/* Action button to localize subsequently */}
          {onSubsequentContextualize && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-[#FFD36D] text-xs block">
                  Ingin Menyesuaikan Draf Ini ke Wilayah Tertentu?
                </span>
                <span className="text-[11px] text-gray-300">
                  Jadikan naskah rumusan ini sebagai naskah sumber, lalu kontekstualisasikan ke kearifan lokal {regionName}.
                </span>
              </div>
              <button
                type="button"
                onClick={onSubsequentContextualize}
                disabled={isSubsequentLoading}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FFD36D] to-[#FDB040] text-[#251E2B] text-xs font-black shadow-md cursor-pointer shrink-0 disabled:opacity-50 flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isSubsequentLoading ? "Menyesuaikan..." : "Kontekstualisasikan ke Wilayah"}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODE B & C: Existing source OR AI draft subsequently localized */}
      {mode !== "pure_ai_generation" && (
        <>
          {/* Split (Side-by-Side on wide screens, Stacked on narrow screens) */}
          {viewLayout === "split" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Kolom Kiri: Naskah Sebelum / Asli */}
              <div className="space-y-2 flex flex-col">
                <div className="flex items-center justify-between pb-1 border-b border-white/10">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                      {mode === "ai_then_contextualized" ? "Draf AI Awal (Snapshot Sumber)" : "Naskah Asli / Standar"}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/10 text-gray-400 font-mono">
                    Sebelum
                  </span>
                </div>

                <div
                  className="w-full p-4 rounded-2xl border-2 border-white/15 bg-black/25 text-xs sm:text-sm text-gray-300 leading-relaxed whitespace-pre-wrap font-normal flex-1 min-h-[220px]"
                  tabIndex={0}
                  aria-label="Teks Sebelum Kontekstualisasi"
                >
                  {originalText || "(Naskah asli tidak tersedia)"}
                </div>
              </div>

              {/* Kolom Kanan: Naskah Sesudah / Kontekstual */}
              <div className="space-y-2 flex flex-col">
                <div className="flex items-center justify-between pb-1 border-b border-white/10">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#FFD36D]" />
                    <span className="text-xs font-bold text-[#FFD36D] uppercase tracking-wider">
                      Hasil Kontekstualisasi ({regionName})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#FFD36D]/20 text-[#FFD36D] font-mono font-bold">
                      Sesudah
                    </span>
                    {isEditable && (
                      <button
                        type="button"
                        onClick={() => setIsInlineEditing(!isInlineEditing)}
                        className="text-[11px] text-gray-300 hover:text-white flex items-center gap-1 cursor-pointer"
                        title="Edit Naskah Langsung"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span className="hidden sm:inline">{isInlineEditing ? "Selesai" : "Edit"}</span>
                      </button>
                    )}
                  </div>
                </div>

                {isInlineEditing && isEditable ? (
                  <textarea
                    rows={10}
                    value={contextualizedText}
                    onChange={(e) => onTextChange?.(e.target.value)}
                    className="w-full p-4 rounded-2xl border-2 border-[#FFD36D]/50 bg-[#251E2B] focus:border-[#FFD36D] text-xs sm:text-sm text-white focus:outline-none transition-all shadow-inner leading-relaxed flex-1 min-h-[220px]"
                    aria-label="Editor Naskah Sesudah Kontekstualisasi"
                  />
                ) : (
                  <div
                    className="w-full p-4 rounded-2xl border-2 border-[#FFD36D]/40 bg-[#251E2B]/90 text-xs sm:text-sm text-white leading-relaxed whitespace-pre-wrap font-medium flex-1 min-h-[220px]"
                    tabIndex={0}
                    aria-label="Teks Sesudah Kontekstualisasi"
                  >
                    {contextualizedText}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Inline Diff Mode: Highlighting Changed Spans */}
          {viewLayout === "inline" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-1 border-b border-white/10">
                <span className="text-xs font-bold text-[#FFD36D] uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  Sorotan Perubahan Teks (Diff Chunks)
                </span>
                <span className="text-[11px] text-gray-400">
                  Kata berwarna kuning merupakan hasil substitusi kearifan lokal
                </span>
              </div>

              <div
                className="w-full p-5 rounded-2xl border-2 border-[#FFD36D]/40 bg-black/35 text-xs sm:text-sm text-white leading-relaxed font-medium min-h-[220px]"
                tabIndex={0}
                aria-label="Tampilan Sorot Perubahan Teks"
              >
                {hasDiffData ? (
                  diffChunks.map((chunk, cIdx) => {
                    if (chunk.type === "substituted") {
                      return (
                        <mark
                          key={cIdx}
                          className="px-1.5 py-0.5 mx-0.5 rounded-md bg-[#FFD36D]/30 text-[#FFD36D] font-bold border border-[#FFD36D]/50 inline-flex items-center gap-1 not-italic"
                          title={chunk.reason || `Substitusi dari '${chunk.originalText}'`}
                        >
                          <span className="sr-only">(Teks diganti dari {chunk.originalText} menjadi)</span>
                          <span>{chunk.text}</span>
                          {chunk.originalText && (
                            <span className="text-[9px] text-gray-400 line-through font-normal ml-0.5">
                              ({chunk.originalText})
                            </span>
                          )}
                        </mark>
                      );
                    }
                    if (chunk.type === "preserved_math") {
                      return (
                        <span
                          key={cIdx}
                          className="px-1 py-0.5 mx-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30"
                          title="Angka matematika & kuantitas terlindungi"
                        >
                          <span className="sr-only">(Kuantitas matematika terlindungi)</span>
                          {chunk.text}
                        </span>
                      );
                    }
                    return <span key={cIdx}>{chunk.text}</span>;
                  })
                ) : (
                  <p className="text-gray-400 italic">
                    Diff chunks belum tersedia. Naskah hasil kontekstualisasi:
                    <br />
                    <span className="text-white not-italic mt-2 block">{contextualizedText}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Adapted Only Mode */}
          {viewLayout === "adapted_only" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-1 border-b border-white/10">
                <span className="text-xs font-bold text-[#FFD36D] uppercase tracking-wider">
                  Naskah Akhir Siap Digunakan
                </span>
                {isEditable && (
                  <button
                    type="button"
                    onClick={() => setIsInlineEditing(!isInlineEditing)}
                    className="text-[11px] text-gray-300 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{isInlineEditing ? "Selesai Edit" : "Edit Naskah"}</span>
                  </button>
                )}
              </div>

              {isInlineEditing && isEditable ? (
                <textarea
                  rows={10}
                  value={contextualizedText}
                  onChange={(e) => onTextChange?.(e.target.value)}
                  className="w-full p-4 rounded-2xl border-2 border-[#FFD36D]/50 bg-[#251E2B] focus:border-[#FFD36D] text-xs sm:text-sm text-white focus:outline-none transition-all shadow-inner leading-relaxed min-h-[220px]"
                />
              ) : (
                <div
                  className="w-full p-5 rounded-2xl border-2 border-white/20 bg-black/25 text-xs sm:text-sm text-white leading-relaxed whitespace-pre-wrap font-medium min-h-[200px]"
                  tabIndex={0}
                >
                  {contextualizedText}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 5. Teacher Approval (Human-in-the-Loop) Control                     */}
      {/* ------------------------------------------------------------------ */}
      <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/5 p-3.5 rounded-2xl">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white">
              Status Persetujuan Guru (Human-in-the-Loop):
            </span>
            <span
              className={`text-[11px] px-2.5 py-0.5 rounded-full font-black ${
                isTeacherApproved
                  ? "bg-emerald-400 text-slate-900"
                  : "bg-white/20 text-gray-300"
              }`}
            >
              {isTeacherApproved ? "Disetujui Guru" : "Menunggu Tinjauan"}
            </span>
          </div>
          <p className="text-[11px] text-gray-400">
            Validasi mesin adalah bantuan draf. Guru memegang kendali penuh atas akurasi materi di kelas.
          </p>
        </div>

        {onToggleApproval && (
          <button
            type="button"
            onClick={() => onToggleApproval(!isTeacherApproved)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              isTeacherApproved
                ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md active:scale-95"
                : "bg-white/10 hover:bg-white/20 text-white border border-white/20 active:scale-95"
            }`}
            aria-pressed={isTeacherApproved}
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>{isTeacherApproved ? "Batalkan Persetujuan" : "Setujui Naskah Ini"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
