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
  Shield,
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
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="clay-card p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#51465B] text-[#FFD36D] flex items-center justify-center font-bold shadow-[0_4px_12px_rgba(81,70,91,0.2)]">
                <Key className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-[#23212A] tracking-tight">
                  Kredensial API Key Multi-Provider AI
                </h1>
                <p className="text-xs text-[#756F7A] mt-0.5">
                  Seluruh API key disimpan terenkripsi menggunakan AES-256-GCM. Plaintext secret tidak pernah dikirim ke browser.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-5 py-3 rounded-2xl bg-[#51465B] hover:bg-[#3E3547] text-white text-xs font-black shadow-[0_4px_16px_rgba(81,70,91,0.25)] flex items-center gap-2 transition-transform active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4 text-[#FFD36D]" />
              <span>Tambah Kredensial Baru</span>
            </button>
          </div>
        </div>

        {/* Test Result Toast/Notice */}
        {testResult && (
          <div
            className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 shadow-xs ${
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
                  ? `Uji koneksi berhasil! Latensi respons: ${testResult.latencyMs} ms`
                  : `Uji koneksi gagal: ${testResult.error}`}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setTestResult(null)}
              className="font-bold underline text-[11px]"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Credentials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {credentials.map((cred) => (
            <div
              key={cred.id}
              className={`bg-white rounded-[28px] border p-6 shadow-[0_8px_24px_rgba(81,70,91,0.04)] flex flex-col justify-between transition-all ${
                cred.is_enabled ? "border-[#E9E5E8]" : "border-slate-200 opacity-60 bg-slate-50/50"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase text-[#51465B]">{cred.name}</span>
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F3] border border-[#E9E5E8] text-[#756F7A]">
                        Prioritas #{cred.priority}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-[#756F7A] mt-1 block">
                      Grup Kuota: {cred.quota_group}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border shadow-xs ${
                      cred.health_status === "healthy"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : cred.health_status === "rate_limited"
                        ? "bg-amber-50 text-amber-800 border-amber-200"
                        : "bg-rose-50 text-rose-800 border-rose-200"
                    }`}
                  >
                    {cred.health_status}
                  </span>
                </div>

                {/* Masked Key Display */}
                <div className="my-3.5 p-3 rounded-2xl bg-[#FAF7F3] border border-[#E9E5E8] flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-[#51465B]" />
                    <span className="font-mono text-xs font-bold text-[#23212A]">{cred.masked_key}</span>
                  </div>
                  <span className="text-[10px] text-[#51465B] bg-[#FFD36D]/30 border border-[#FFD36D] font-black px-2.5 py-0.5 rounded-full">
                    AES-GCM
                  </span>
                </div>

                {cred.notes && (
                  <p className="text-[11px] text-[#756F7A] mb-3 leading-snug">{cred.notes}</p>
                )}

                <div className="grid grid-cols-2 gap-2 text-[11px] text-[#756F7A] mb-2 font-medium">
                  <div>
                    Circuit: <span className="font-bold text-[#23212A]">{cred.circuit_state}</span>
                  </div>
                  <div>
                    Batas Harian: <span className="font-bold text-[#23212A]">{cred.daily_request_limit} req</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#E9E5E8] flex items-center justify-between gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => handleTestConnection(cred.id)}
                  disabled={testingId === cred.id}
                  className="px-3.5 py-2 rounded-xl bg-[#FAF7F3] border border-[#E9E5E8] hover:bg-slate-100 text-xs font-bold text-[#51465B] flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  {testingId === cred.id ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5 text-[#F47D83]" />
                  )}
                  <span>Uji Koneksi</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleEnabled(cred)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shadow-xs ${
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
                    className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors shadow-xs"
                    title="Hapus Kredensial"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal: Add Credential */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-[32px] sm:rounded-[36px] max-w-lg w-full p-6 sm:p-8 shadow-[0_20px_60px_rgba(81,70,91,0.25)] border border-[#E9E5E8] space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-[#E9E5E8]">
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-[#51465B]" />
                  <h3 className="font-black text-base text-[#23212A]">Tambah Kredensial Gemini API</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="text-xs font-bold text-[#756F7A] hover:text-[#23212A]"
                >
                  Tutup
                </button>
              </div>

              <form onSubmit={handleAddCredential} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#23212A] mb-1">
                    Nama Konfigurasi
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Gemini Primary Project Ponorogo"
                    className="clay-input text-xs text-[#23212A] font-semibold"
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
                    className="clay-input text-xs text-[#23212A] font-mono"
                  />
                  <span className="text-[10px] text-[#756F7A] mt-1 block">
                    Kunci akan dienkripsi dengan AES-256-GCM sebelum disimpan ke database.
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#23212A] mb-1">
                      Kelompok Kuota (Project Quota)
                    </label>
                    <input
                      type="text"
                      required
                      value={quotaGroup}
                      onChange={(e) => setQuotaGroup(e.target.value)}
                      placeholder="default_project"
                      className="clay-input text-xs text-[#23212A] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#23212A] mb-1">
                      Prioritas Pemanggilan
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(Number(e.target.value))}
                      className="clay-input text-xs text-[#23212A] font-bold"
                    >
                      <option value={1}>1 (Utama / Primer)</option>
                      <option value={2}>2 (Cadangan / Secondary)</option>
                      <option value={3}>3 (Tersier / Standby)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#23212A] mb-1">
                    Catatan Konfigurasi
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Opsional: Proyek AI Studio akun dev..."
                    className="clay-input text-xs text-[#23212A]"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl border border-[#E9E5E8] text-xs font-bold text-[#756F7A] hover:bg-slate-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="clay-btn-primary px-5 py-2 text-xs font-bold"
                  >
                    {submitting ? "Mengenkripsi..." : "Simpan Kredensial"}
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
