"use client";

import React, { useState, useEffect } from "react";
import { AdminWorkspaceShell } from "@/components/layout/admin-workspace-shell";
import {
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Power,
  Cpu,
  Layers,
  Flame,
  ArrowRight,
  Info,
} from "lucide-react";

interface CredentialCircuit {
  id: string;
  name: string;
  quota_group: string;
  priority: number;
  health_status: "healthy" | "degraded" | "failing" | "offline";
  circuit_state: "CLOSED" | "HALF_OPEN" | "OPEN";
  consecutive_errors: number;
  cooldown_seconds: number;
  last_error: string | null;
  last_error_at: string | null;
}

interface FailoverEvent {
  id: string;
  timestamp: string;
  feature_key: string;
  from_credential_id: string;
  to_credential_id: string | null;
  error_type: string;
  resolved: boolean;
  notes: string;
}

export default function AdminAIFailoverPage() {
  const [credentials, setCredentials] = useState<CredentialCircuit[]>([]);
  const [failovers, setFailovers] = useState<FailoverEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchFailoverData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/ai/failover");
      const data = await res.json();
      if (data?.success) {
        setCredentials(data.credentials || []);
        setFailovers(data.failovers || []);
      }
    } catch {
      setMessage({ type: "error", text: "Gagal memuat status failover & circuit breaker." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFailoverData();
  }, []);

  const handleResetCircuit = async (credentialId: string) => {
    try {
      setResettingId(credentialId);
      setMessage(null);

      const res = await fetch("/api/admin/ai/failover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credentialId, action: "RESET_CIRCUIT" }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal mereset circuit breaker.");
      }

      setMessage({ type: "success", text: "Circuit breaker kredensial berhasil direset ke status CLOSED (Normal)." });
      fetchFailoverData();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Gagal melakukan reset circuit." });
    } finally {
      setResettingId(null);
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
              <span>Ketahanan & Fault Tolerance</span>
            </div>
            <h1 className="text-2xl font-black text-[#51465B] flex items-center gap-2.5">
              <RotateCcw className="w-6 h-6 text-[#FFD36D]" />
              Automatic Failover & Circuit Breaker
            </h1>
            <p className="text-xs text-neutral-500 mt-1 max-w-2xl">
              Mekanisme proteksi otomatis untuk mencegah kegagalan sistem saat batas kuota API Studio tercapai (429 Quota Exceeded), rotasi kelompok kuota, dan fallback pedagogis kurikulum.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchFailoverData}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#E9E5E8] hover:bg-neutral-50 text-xs font-bold text-[#51465B] flex items-center gap-2 shadow-xs transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Segarkan
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
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Circuit Breaker Status Cards */}
        <div>
          <h2 className="text-sm font-extrabold text-[#51465B] mb-3 flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500" />
            Status Circuit Breaker Per Kredensial
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {credentials.map((c) => {
              const isTripped = c.circuit_state === "OPEN";
              const isHalfOpen = c.circuit_state === "HALF_OPEN";

              return (
                <div
                  key={c.id}
                  className={`bg-white rounded-3xl p-5 border shadow-xs transition-all flex flex-col justify-between ${
                    isTripped
                      ? "border-rose-300 ring-2 ring-rose-100"
                      : isHalfOpen
                      ? "border-amber-300 ring-2 ring-amber-100"
                      : "border-[#E9E5E8]"
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#E9E5E8]">
                      <div>
                        <span className="font-extrabold text-sm text-[#51465B] block">{c.name}</span>
                        <span className="text-[10px] text-neutral-400 font-mono block mt-0.5">
                          Group: {c.quota_group} • Prioritas {c.priority}
                        </span>
                      </div>

                      {/* State Badge */}
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold font-mono uppercase tracking-wider ${
                          isTripped
                            ? "bg-rose-100 text-rose-800"
                            : isHalfOpen
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {c.circuit_state}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="mt-3.5 space-y-2 text-xs">
                      <div className="flex justify-between items-center text-neutral-600">
                        <span className="text-[11px] font-medium">Kegagalan Beruntun:</span>
                        <span className="font-mono font-bold text-[#51465B]">
                          {c.consecutive_errors} / 3 threshold
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-neutral-600">
                        <span className="text-[11px] font-medium">Waktu Cooldown:</span>
                        <span className="font-mono font-bold text-[#51465B]">{c.cooldown_seconds}s</span>
                      </div>

                      <div className="flex justify-between items-center text-neutral-600">
                        <span className="text-[11px] font-medium">Health Status:</span>
                        <span className="font-mono text-[11px] font-bold capitalize text-[#51465B]">
                          {c.health_status}
                        </span>
                      </div>

                      {c.last_error && (
                        <div className="mt-2 p-2 rounded-xl bg-neutral-50 text-[10px] text-rose-700 font-mono border border-neutral-200 line-clamp-2">
                          {c.last_error}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-3 border-t border-[#E9E5E8] flex items-center justify-between">
                    <span className="text-[10px] text-neutral-400 font-medium">
                      {isTripped ? "Kredensial disuspen sementara" : "Siap menerima beban request"}
                    </span>

                    <button
                      onClick={() => handleResetCircuit(c.id)}
                      disabled={resettingId === c.id || (!isTripped && c.consecutive_errors === 0)}
                      className="px-3 py-1.5 rounded-xl bg-[#51465B] hover:bg-[#3D3445] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-40"
                    >
                      {resettingId === c.id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Power className="w-3.5 h-3.5 text-[#FFD36D]" />
                      )}
                      <span>Reset Circuit</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Safe Pedagogical Fallback Info Panel */}
        <div className="bg-[#51465B] text-white rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-bold text-[#FFD36D] uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Pedagogical Safe Fallback Engine</span>
            </div>
            <h3 className="text-lg font-black text-white">Jaminan 0% Crash untuk Dewan Juri IT Comp 2026</h3>
            <p className="text-xs text-white/80 leading-relaxed">
              Jika seluruh API key Google AI Studio kehabisan kuota atau jaringan terputus, engine secara deterministik menyajikan butir soal dan materi berkualitas tinggi dari cache lokal terverifikasi (Kurikulum Merdeka Kelas 5 Fase C: Madiun Raya & Semarang) tanpa memicu pesan error ke siswa atau guru.
            </p>
          </div>
          <span className="px-4 py-2 rounded-2xl bg-white/10 text-[#FFD36D] font-mono text-xs font-bold border border-white/20 shrink-0">
            AUTO HEALING ON
          </span>
        </div>

        {/* Failover History Table */}
        <div className="bg-white rounded-3xl border border-[#E9E5E8] shadow-xs overflow-hidden">
          <div className="p-5 border-b border-[#E9E5E8] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-[#51465B] uppercase tracking-wider">Histori Kejadian Failover</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 font-bold font-mono">
                {failovers.length} Event
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F3] border-b border-[#E9E5E8] text-[#51465B] font-extrabold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Fitur</th>
                  <th className="py-3 px-4">Kredensial Asal</th>
                  <th className="py-3 px-4">Dialihkan Ke</th>
                  <th className="py-3 px-4">Penyebab / Tipe Error</th>
                  <th className="py-3 px-4">Resolusi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9E5E8] font-medium text-neutral-700">
                {failovers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-neutral-400">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                      Sistem berjalan stabil. Belum ada trigger failover yang tercatat.
                    </td>
                  </tr>
                ) : (
                  failovers.map((f) => (
                    <tr key={f.id} className="hover:bg-[#FAF7F3]/50 transition-colors">
                      <td className="py-3 px-4 text-[11px] text-neutral-500 font-mono">
                        {new Date(f.timestamp).toLocaleTimeString("id-ID")}
                      </td>
                      <td className="py-3 px-4 font-bold text-[#51465B] capitalize">
                        {f.feature_key.replace(/_/g, " ")}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-rose-700 font-bold">
                        {f.from_credential_id}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-emerald-700 font-bold">
                        {f.to_credential_id || "Safe Fallback"}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-mono text-[10px] font-bold">
                          {f.error_type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {f.resolved ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            Resolved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            <AlertTriangle className="w-3 h-3" />
                            Pending
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
