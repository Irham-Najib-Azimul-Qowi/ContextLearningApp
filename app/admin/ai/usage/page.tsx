"use client";

import React, { useState, useEffect } from "react";
import { AdminWorkspaceShell } from "@/components/layout/admin-workspace-shell";
import {
  BarChart3,
  Cpu,
  Zap,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Filter,
  ArrowUpRight,
  Database,
} from "lucide-react";

interface UsageMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  avgLatencyMs: number;
}

interface UsageEvent {
  id: string;
  credential_id: string;
  quota_group: string;
  feature_key: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  latency_ms: number;
  status: "SUCCESS" | "FAILED_OVER" | "RATE_LIMITED" | "QUOTA_EXCEEDED" | "ERROR";
  error_message: string | null;
  caller_user_id: string | null;
  created_at: string;
}

export default function AdminAIUsagePage() {
  const [metrics, setMetrics] = useState<UsageMetrics | null>(null);
  const [featureBreakdown, setFeatureBreakdown] = useState<Record<string, { requests: number; tokens: number }>>({});
  const [events, setEvents] = useState<UsageEvent[]>([]);
  const [selectedFeature, setSelectedFeature] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  const fetchUsage = async () => {
    try {
      setLoading(true);
      const url =
        selectedFeature === "ALL"
          ? "/api/admin/ai/usage?limit=50"
          : `/api/admin/ai/usage?limit=50&feature=${encodeURIComponent(selectedFeature)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data?.success) {
        setMetrics(data.metrics);
        setFeatureBreakdown(data.featureBreakdown || {});
        setEvents(data.events || []);
      }
    } catch {
      // Handled silently with placeholder state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();
  }, [selectedFeature]);

  const successRate = metrics?.totalRequests
    ? Math.round((metrics.successfulRequests / metrics.totalRequests) * 100)
    : 100;

  return (
    <AdminWorkspaceShell activeGroupId="ai">
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="clay-card p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#51465B] text-[#FFD36D] flex items-center justify-center font-bold shadow-[0_4px_12px_rgba(81,70,91,0.2)]">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-[#23212A] tracking-tight">
                  Penggunaan Token &amp; Telemetri AI
                </h1>
                <p className="text-xs text-[#756F7A] mt-0.5 max-w-2xl">
                  Pantau volume token, distribusi fitur kuis &amp; materi kontekstual, performa latensi rata-rata, dan histori request AI secara mendalam.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchUsage}
                disabled={loading}
                className="px-4 py-2.5 rounded-2xl bg-white border border-[#E9E5E8] hover:bg-neutral-50 text-xs font-bold text-[#51465B] flex items-center gap-2 shadow-xs transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                Segarkan Data
              </button>
            </div>
          </div>
        </div>

        {/* Top Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Total Requests */}
          <div className="clay-card p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#756F7A]">Total Request</span>
              <div className="w-9 h-9 rounded-2xl bg-[#FAF7F3] border border-[#E9E5E8] text-[#51465B] flex items-center justify-center font-black shadow-xs">
                <Cpu className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl sm:text-3xl font-black text-[#23212A]">{metrics?.totalRequests ?? 0}</div>
              <div className="text-[11px] text-[#756F7A] font-medium mt-1 flex items-center gap-1.5">
                <span className="font-bold text-emerald-600">{successRate}% Berhasil</span>
                <span>• {metrics?.failedRequests ?? 0} error</span>
              </div>
            </div>
          </div>

          {/* Total Tokens */}
          <div className="clay-card p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#756F7A]">Total Token</span>
              <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-black shadow-xs">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl sm:text-3xl font-black text-[#23212A]">
                {((metrics?.totalTokens ?? 0) / 1000).toFixed(1)}k
              </div>
              <div className="text-[11px] text-[#756F7A] font-medium mt-1">
                In: {metrics?.totalInputTokens ?? 0} • Out: {metrics?.totalOutputTokens ?? 0}
              </div>
            </div>
          </div>

          {/* Average Latency */}
          <div className="bg-white rounded-3xl p-5 border border-[#E9E5E8] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-400">Latensi Rata-Rata</span>
              <div className="w-8 h-8 rounded-xl bg-[#51465B]/10 text-[#51465B] flex items-center justify-center font-black">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black text-[#51465B]">{metrics?.avgLatencyMs ?? 0} ms</div>
              <div className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                <Zap className="w-3 h-3 text-emerald-500" />
                Responsif Gemini 2.5 Flash
              </div>
            </div>
          </div>

          {/* Est. Cost */}
          <div className="bg-white rounded-3xl p-5 border border-[#E9E5E8] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-400">Estimasi Biaya API</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black text-[#51465B]">
                ${(((metrics?.totalTokens ?? 0) * 0.0000003)).toFixed(4)}
              </div>
              <div className="text-[11px] text-neutral-400 font-medium mt-1">
                Free Tier / Gemini Pay-as-you-go
              </div>
            </div>
          </div>
        </div>

        {/* Feature Breakdown Panels */}
        <div className="bg-white rounded-3xl p-5 border border-[#E9E5E8] shadow-xs">
          <h2 className="text-sm font-extrabold text-[#51465B] mb-3 flex items-center gap-2">
            <Database className="w-4 h-4 text-[#51465B]" />
            Distribusi Penggunaan Berdasarkan Fitur
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {Object.entries(featureBreakdown).map(([feat, data]) => (
              <div key={feat} className="p-3.5 rounded-2xl bg-[#FAF7F3] border border-[#E9E5E8]">
                <span className="font-extrabold text-[#51465B] block truncate capitalize">
                  {feat.replace(/_/g, " ")}
                </span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-lg font-black text-[#51465B]">{data.requests} req</span>
                  <span className="text-[11px] font-mono text-neutral-500 font-bold">{data.tokens} tkn</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filter and Table Container */}
        <div className="bg-white rounded-3xl border border-[#E9E5E8] shadow-xs overflow-hidden">
          {/* Table Toolbar */}
          <div className="p-5 border-b border-[#E9E5E8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-[#51465B] uppercase tracking-wider">Histori Request Telemetri</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 font-bold font-mono">
                {events.length} Terakhir
              </span>
            </div>

            {/* Filter Feature */}
            <div className="flex items-center gap-2 text-xs">
              <Filter className="w-3.5 h-3.5 text-neutral-400" />
              <select
                value={selectedFeature}
                onChange={(e) => setSelectedFeature(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-[#E9E5E8] bg-[#FAF7F3] text-xs font-bold text-[#51465B] focus:outline-none"
              >
                <option value="ALL">Semua Fitur</option>
                <option value="question_generation">Pembuatan Soal</option>
                <option value="question_scan">Pemindaian OCR</option>
                <option value="material_generation">Penyusunan Materi</option>
                <option value="contextual_rewriting">Adaptasi Kontekstual</option>
                <option value="pedagogical_validation">Validasi Pedagogis</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F3] border-b border-[#E9E5E8] text-[#51465B] font-extrabold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Fitur</th>
                  <th className="py-3 px-4">Model & Kuota Group</th>
                  <th className="py-3 px-4">Tokens (In / Out)</th>
                  <th className="py-3 px-4">Latensi</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9E5E8] font-medium text-neutral-700">
                {loading && events.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-neutral-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#51465B]" />
                      Memuat histori telemetri AI...
                    </td>
                  </tr>
                ) : events.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-neutral-400">
                      Belum ada catatan request AI untuk filter ini.
                    </td>
                  </tr>
                ) : (
                  events.map((ev) => (
                    <tr key={ev.id} className="hover:bg-[#FAF7F3]/50 transition-colors">
                      <td className="py-3 px-4 text-[11px] text-neutral-500 font-mono">
                        {new Date(ev.created_at).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>
                      <td className="py-3 px-4 font-bold text-[#51465B] capitalize">
                        {ev.feature_key.replace(/_/g, " ")}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-[#51465B] block">{ev.model}</span>
                        <span className="text-[10px] text-neutral-400 font-mono block">
                          {ev.quota_group}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px]">
                        <span className="font-bold text-[#51465B]">{ev.total_tokens}</span>{" "}
                        <span className="text-neutral-400">({ev.input_tokens} / {ev.output_tokens})</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] font-bold text-[#51465B]">
                        {ev.latency_ms} ms
                      </td>
                      <td className="py-3 px-4">
                        {ev.status === "SUCCESS" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            Success
                          </span>
                        )}
                        {ev.status === "FAILED_OVER" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            <AlertTriangle className="w-3 h-3" />
                            Failed Over
                          </span>
                        )}
                        {(ev.status === "ERROR" ||
                          ev.status === "RATE_LIMITED" ||
                          ev.status === "QUOTA_EXCEEDED") && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            <AlertTriangle className="w-3 h-3" />
                            {ev.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminWorkspaceShell>
  );
}
