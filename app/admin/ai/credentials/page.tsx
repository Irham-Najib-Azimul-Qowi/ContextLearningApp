"use client";

import React, { useState, useEffect } from "react";
import {
  Key,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Play,
  Trash2,
  Lock,
  Sparkles,
  Check,
  X,
} from "lucide-react";
import { AdminWorkspaceShell } from "@/components/layout/admin-workspace-shell";

export default function AdminAICredentialsPage() {
  const [credentials, setCredentials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [quotaGroup, setQuotaGroup] = useState("project_pahami_prod");
  const [priority, setPriority] = useState(1);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Testing states
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<any | null>(null);

  const fetchCredentials = () => {
    setLoading(true);
    fetch("/api/admin/ai/credentials")
      .then((r) => r.json())
      .then((data) => {
        if (data?.credentials) setCredentials(data.credentials);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchCredentials();
  }, []);

  const handleAddCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/ai/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, apiKey, quotaGroup, priority, notes }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setName("");
        setApiKey("");
        setNotes("");
        fetchCredentials();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleEnabled = async (cred: any) => {
    await fetch("/api/admin/ai/credentials", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: cred.id, is_enabled: !cred.is_enabled }),
    });
    fetchCredentials();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus konfigurasi kredensial ini?")) {
      await fetch(`/api/admin/ai/credentials?id=${id}`, { method: "DELETE" });
      fetchCredentials();
    }
  };

  const handleTestConnection = async (id: string) => {
    setTestingId(id);
    setTestResult(null);

    try {
      const res = await fetch("/api/admin/ai/credentials/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credentialId: id }),
      });
      const data = await res.json();
      setTestResult({ id, ...data });
      fetchCredentials();
    } catch (err: any) {
      setTestResult({ id, success: false, error: err?.message || "Koneksi gagal" });
    } finally {
      setTestingId(null);
    }
  };

  return (
    <AdminWorkspaceShell activeGroupId="ai">
      <div className="space-y-5 max-w-7xl mx-auto pb-12 font-sans">
        {/* ===================================================================
            HEADER: AI API, [+ Tambah API] (Sesuai Aturan 17)
            =================================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#E9E5E8]">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-[#23212A] tracking-tight">
              AI API
            </h1>
            <span className="text-xs font-bold text-[#51465B] bg-white border border-[#E9E5E8] px-3 py-1 rounded-full shadow-2xs">
              {credentials.length} Endpoint
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-2xl bg-[#51465B] hover:bg-[#3D3445] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all active:scale-95 whitespace-nowrap cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-[#FFD36D]" />
            <span>Tambah API</span>
          </button>
        </div>

        {/* Test Result Notice */}
        {testResult && (
          <div
            className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-3 shadow-2xs ${
              testResult.success
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            <div className="flex items-center gap-2">
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span className="font-semibold">
                {testResult.success
                  ? `Uji koneksi berhasil (${testResult.latencyMs} ms)`
                  : `Uji koneksi gagal: ${testResult.error}`}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setTestResult(null)}
              className="font-bold underline text-[11px] cursor-pointer"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Credentials List (Sederhana & Bersih) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {credentials.map((cred) => (
            <div
              key={cred.id}
              className={`bg-white rounded-3xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
                cred.is_enabled ? "border-[#E9E5E8]" : "border-slate-200 opacity-60 bg-slate-50/50"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase text-[#51465B]">{cred.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF7F3] border border-[#E9E5E8] text-[#756F7A]">
                        P#{cred.priority}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#756F7A] mt-0.5 block">
                      Kuota: {cred.quota_group} • Harian: {cred.daily_request_limit} req
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border shadow-2xs ${
                      cred.health_status === "healthy"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : cred.health_status === "rate_limited"
                        ? "bg-amber-50 text-amber-800 border-amber-200"
                        : "bg-rose-50 text-rose-800 border-rose-200"
                    }`}
                  >
                    {cred.health_status === "healthy" ? "Active" : cred.health_status}
                  </span>
                </div>

                {/* Masked Key Display (Sesuai Aturan 17) */}
                <div className="my-3 p-2.5 px-3.5 rounded-2xl bg-[#FAF7F3] border border-[#E9E5E8] flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#23212A]">
                    <Lock className="w-3.5 h-3.5 text-[#51465B]" />
                    <span>{cred.masked_key || "••••••••••••••••"}</span>
                  </div>
                  <span className="text-[9px] text-[#51465B] bg-[#FFD36D]/30 border border-[#FFD36D] font-black px-2 py-0.5 rounded-full">
                    AES-256
                  </span>
                </div>
              </div>

              {/* Action Buttons: Uji, Aktif/Nonaktif, Hapus */}
              <div className="pt-3 border-t border-[#E9E5E8] flex items-center justify-between gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => handleTestConnection(cred.id)}
                  disabled={testingId === cred.id}
                  className="px-3 py-1.5 rounded-xl bg-[#FAF7F3] border border-[#E9E5E8] hover:bg-slate-100 text-xs font-bold text-[#51465B] flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
                >
                  {testingId === cred.id ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5 text-[#F47D83]" />
                  )}
                  <span>Test</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleEnabled(cred)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer shadow-2xs ${
                      cred.is_enabled
                        ? "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
                        : "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                    }`}
                  >
                    {cred.is_enabled ? "Nonaktifkan" : "Aktifkan"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(cred.id)}
                    className="p-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors shadow-2xs cursor-pointer"
                    title="Hapus API"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal: Tambah API */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E9E5E8] space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-[#E9E5E8]">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-[#51465B]" />
                  <h3 className="font-black text-sm text-[#23212A]">Tambah Kredensial Gemini API</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="text-xs font-bold text-[#756F7A] hover:text-[#23212A] cursor-pointer"
                >
                  Tutup
                </button>
              </div>

              <form onSubmit={handleAddCredential} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#23212A] mb-1">
                    Nama Konfigurasi
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Gemini Primary Prod"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E9E5E8] text-xs font-semibold text-[#23212A] focus:outline-none focus:border-[#51465B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#23212A] mb-1">
                    API Key Google Gemini
                  </label>
                  <input
                    type="password"
                    required
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E9E5E8] text-xs font-mono text-[#23212A] focus:outline-none focus:border-[#51465B]"
                  />
                  <span className="text-[10px] text-[#756F7A] mt-1 block">
                    Disimpan terenkripsi dengan AES-256-GCM.
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#23212A] mb-1">
                      Kelompok Kuota
                    </label>
                    <input
                      type="text"
                      required
                      value={quotaGroup}
                      onChange={(e) => setQuotaGroup(e.target.value)}
                      placeholder="default_project"
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E9E5E8] text-xs font-mono text-[#23212A] focus:outline-none focus:border-[#51465B]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#23212A] mb-1">
                      Prioritas
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E9E5E8] text-xs font-bold text-[#23212A] focus:outline-none focus:border-[#51465B]"
                    >
                      <option value={1}>1 (Utama)</option>
                      <option value={2}>2 (Cadangan)</option>
                      <option value={3}>3 (Standby)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-[#E9E5E8]">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl border border-[#E9E5E8] text-xs font-bold text-[#756F7A] hover:bg-slate-50 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-[#51465B] hover:bg-[#3D3445] text-white text-xs font-bold shadow-xs active:scale-95 transition-all whitespace-nowrap cursor-pointer"
                  >
                    {submitting ? "Menyimpan..." : "Simpan API"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminWorkspaceShell>
  );
}
