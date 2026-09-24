"use client";

import React, { useState, useEffect } from "react";
import { AdminWorkspaceShell } from "@/components/layout/admin-workspace-shell";
import {
  Sliders,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  Gauge,
  Layers,
  ArrowRightLeft,
  Cpu,
  RefreshCw,
} from "lucide-react";

interface AIModelConfig {
  id: string;
  feature_key: string;
  provider: string;
  primary_model: string;
  fallback_model: string;
  required_capabilities: string[];
  timeout_ms: number;
  temperature: number;
  max_output_tokens: number;
  is_active: boolean;
  updated_at: string;
}

const FEATURE_TITLES: Record<string, { label: string; desc: string; icon: string }> = {
  question_generation: {
    label: "Pembuatan Soal Kontekstual",
    desc: "Menghasilkan soal pilihan ganda & esai relevan konteks Madiun Raya & Semarang",
    icon: "🎯",
  },
  question_scan: {
    label: "Pemindaian Soal (OCR & Vision)",
    desc: "Mengekstrak teks soal matematika, diagram, dan bacaan dari foto lembar kerja",
    icon: "📷",
  },
  material_generation: {
    label: "Penyusunan Materi Pembelajaran",
    desc: "Menyusun rangkuman adaptif IPA, IPS, & Matematika berbasis kearifan lokal",
    icon: "📚",
  },
  contextual_rewriting: {
    label: "Adaptasi & Penulisan Kontekstual",
    desc: "Mengubah narasi soal abstrak menjadi berbasis sentra industri & budaya lokal",
    icon: "✍️",
  },
  pedagogical_validation: {
    label: "Validasi Pedagogis & Fase C",
    desc: "Pengecekan kualitas taksonomi Bloom, kesopanan anak, dan standar kurikulum",
    icon: "🛡️",
  },
};

const AVAILABLE_MODELS = [
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash (Tercepat & Default)" },
  { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash (Stabil & Ringan)" },
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro (Penalaran Kompleks)" },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro (Konteks Panjang)" },
];

export default function AdminAIModelsPage() {
  const [models, setModels] = useState<AIModelConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchModels = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/ai/models");
      const data = await res.json();
      if (data?.success) {
        setModels(data.models || []);
      }
    } catch {
      setMessage({ type: "error", text: "Gagal memuat konfigurasi model AI." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handleChange = (featureKey: string, field: keyof AIModelConfig, value: any) => {
    setModels((prev) =>
      prev.map((item) => (item.feature_key === featureKey ? { ...item, [field]: value } : item))
    );
  };

  const handleSave = async (cfg: AIModelConfig) => {
    try {
      setSavingKey(cfg.feature_key);
      setMessage(null);

      const res = await fetch("/api/admin/ai/models", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          featureKey: cfg.feature_key,
          primaryModel: cfg.primary_model,
          fallbackModel: cfg.fallback_model,
          temperature: cfg.temperature,
          timeoutMs: cfg.timeout_ms,
          maxOutputTokens: cfg.max_output_tokens,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal memperbarui konfigurasi.");
      }

      setMessage({
        type: "success",
        text: `Konfigurasi fitur ${FEATURE_TITLES[cfg.feature_key]?.label || cfg.feature_key} berhasil disimpan!`,
      });
      fetchModels();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Terjadi kesalahan." });
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <AdminWorkspaceShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E9E5E8]">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#51465B]/60 uppercase tracking-wider mb-1">
              <span>Multi-Provider AI</span>
              <span>•</span>
              <span>Model Routing Engine</span>
            </div>
            <h1 className="text-2xl font-black text-[#51465B] flex items-center gap-2.5">
              <Sliders className="w-6 h-6 text-[#FFD36D]" />
              Model Mapping & Feature Routing
            </h1>
            <p className="text-xs text-neutral-500 mt-1 max-w-2xl">
              Atur model Gemini primer dan sekunder untuk masing-masing kapabilitas sistem PAHAMI V2. Sistem akan mengalihkan request secara otomatis jika kuota atau latency melebihi ambang batas.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchModels}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#E9E5E8] hover:bg-neutral-50 text-xs font-bold text-[#51465B] flex items-center gap-2 shadow-xs transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Muat Ulang
            </button>
          </div>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition-all ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Architecture Notice */}
        <div className="bg-[#FAF7F3] border border-[#E9E5E8] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#51465B] text-[#FFD36D] flex items-center justify-center font-black shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-[#51465B] block">Pedagogical Safe Fallback Active</span>
              <span className="text-neutral-500 text-[11px]">
                Jika semua model AI Gemini offline, sistem fallback ke simulasi kurikuler terkurasi (Madiun Raya + Semarang).
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold shrink-0">
            CIRCUIT: ZERO CRASH
          </span>
        </div>

        {/* Feature Cards Grid */}
        {loading && models.length === 0 ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 text-[#51465B] animate-spin mx-auto mb-3" />
            <p className="text-xs text-neutral-400 font-medium">Memuat konfigurasi model fitur...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {models.map((cfg) => {
              const meta = FEATURE_TITLES[cfg.feature_key] || {
                label: cfg.feature_key,
                desc: "Fitur AI PAHAMI",
                icon: "⚙️",
              };
              const isSaving = savingKey === cfg.feature_key;

              return (
                <div
                  key={cfg.id}
                  className="bg-white rounded-3xl border border-[#E9E5E8] p-5 shadow-xs hover:border-[#51465B]/30 transition-all flex flex-col"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-[#E9E5E8] gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl p-2 bg-[#FAF7F3] rounded-2xl border border-[#E9E5E8]">
                        {meta.icon}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-sm text-[#51465B]">{meta.label}</h3>
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600 font-bold">
                            {cfg.feature_key}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500 mt-0.5">{meta.desc}</p>
                      </div>
                    </div>

                    {/* Capabilities Tags */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {cfg.required_capabilities.map((cap) => (
                        <span
                          key={cap}
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF7F3] text-[#51465B] border border-[#E9E5E8]"
                        >
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Form Settings Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-4 text-xs">
                    {/* Primary Model */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-extrabold text-[#51465B] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        Model Utama (Primary)
                      </label>
                      <select
                        value={cfg.primary_model}
                        onChange={(e) => handleChange(cfg.feature_key, "primary_model", e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#E9E5E8] bg-[#FAF7F3] focus:bg-white text-xs font-bold text-[#51465B] focus:outline-none focus:ring-2 focus:ring-[#51465B]"
                      >
                        {AVAILABLE_MODELS.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Fallback Model */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-extrabold text-[#51465B] flex items-center gap-1.5">
                        <ArrowRightLeft className="w-3.5 h-3.5 text-blue-500" />
                        Model Cadangan (Fallback)
                      </label>
                      <select
                        value={cfg.fallback_model}
                        onChange={(e) => handleChange(cfg.feature_key, "fallback_model", e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#E9E5E8] bg-[#FAF7F3] focus:bg-white text-xs font-bold text-[#51465B] focus:outline-none focus:ring-2 focus:ring-[#51465B]"
                      >
                        {AVAILABLE_MODELS.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Temperature */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-extrabold text-[#51465B] flex items-center gap-1.5">
                          <Gauge className="w-3.5 h-3.5 text-indigo-500" />
                          Temperatur Kreativitas
                        </label>
                        <span className="font-mono text-[10px] font-bold text-[#51465B]">
                          {cfg.temperature.toFixed(2)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={cfg.temperature}
                        onChange={(e) =>
                          handleChange(cfg.feature_key, "temperature", parseFloat(e.target.value))
                        }
                        className="w-full accent-[#51465B] cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-neutral-400 font-medium">
                        <span>Deterministik (0.0)</span>
                        <span>Kreatif (1.0)</span>
                      </div>
                    </div>

                    {/* Max Output Tokens & Timeout */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-extrabold text-[#51465B] flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-rose-500" />
                        Batas Waktu (Timeout ms)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="1000"
                          min="5000"
                          max="60000"
                          value={cfg.timeout_ms}
                          onChange={(e) =>
                            handleChange(cfg.feature_key, "timeout_ms", parseInt(e.target.value) || 20000)
                          }
                          className="w-full px-3 py-2 rounded-xl border border-[#E9E5E8] bg-[#FAF7F3] focus:bg-white text-xs font-mono font-bold text-[#51465B]"
                        />
                        <span className="text-[10px] font-bold text-neutral-400">ms</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Token Max & Save */}
                  <div className="pt-3 border-t border-[#E9E5E8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-neutral-500 font-medium flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-neutral-400" />
                        Max Output Tokens:
                        <input
                          type="number"
                          step="256"
                          min="512"
                          max="8192"
                          value={cfg.max_output_tokens}
                          onChange={(e) =>
                            handleChange(
                              cfg.feature_key,
                              "max_output_tokens",
                              parseInt(e.target.value) || 2048
                            )
                          }
                          className="w-20 px-2 py-0.5 ml-1 rounded-md border border-[#E9E5E8] bg-[#FAF7F3] font-mono text-[11px] font-bold"
                        />
                      </span>
                    </div>

                    <button
                      onClick={() => handleSave(cfg)}
                      disabled={isSaving}
                      className="px-4 py-2 rounded-xl bg-[#51465B] hover:bg-[#3D3445] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
                    >
                      {isSaving ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5 text-[#FFD36D]" />
                      )}
                      <span>{isSaving ? "Menyimpan..." : "Simpan Konfigurasi"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminWorkspaceShell>
  );
}
