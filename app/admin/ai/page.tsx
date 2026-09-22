"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  KeyRound,
  Plus,
  ShieldCheck,
  Activity,
  Cpu,
  RefreshCw,
  Trash2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { repository } from "@/lib/db/repository";
import { AICredential, AIUsageLog } from "@/lib/db/types";

export default function AdminAIManagementPage() {
  const [credentials, setCredentials] = useState<AICredential[]>([]);
  const [usageLogs, setUsageLogs] = useState<AIUsageLog[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [label, setLabel] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [projectId, setProjectId] = useState("contextlearning-prod-ai");
  const [selectedModels] = useState<string[]>(["gemini-2.5-flash"]);
  const [priority, setPriority] = useState(1);
  const [weight, setWeight] = useState(80);
  const [formError, setFormError] = useState("");

  const refresh = useCallback(() => {
    setCredentials([...repository.getAICredentials()]);
    setUsageLogs([...repository.getAIUsageLogs()]);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleCreateCredential = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !apiKey.trim()) {
      setFormError("Label kredensial dan API Key wajib diisi.");
      return;
    }

    try {
      repository.createAICredential({
        label: label.trim(),
        rawApiKey: apiKey.trim(),
        projectId: projectId.trim() || undefined,
        supportedModels: selectedModels,
        priority: Number(priority),
        weight: Number(weight),
        adminId: "admin-platform-01",
      });

      setLabel("");
      setApiKey("");
      setFormError("");
      setShowAddModal(false);
      refresh();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Gagal mendaftarkan kredensial.");
    }
  };

  const handleToggleStatus = (cred: AICredential) => {
    const nextStatus = cred.status === "active" ? "disabled" : "active";
    repository.updateAICredentialStatus(cred.id, nextStatus, "admin-platform-01");
    refresh();
  };

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus kredensial ini?")) {
      repository.deleteAICredential(id, "admin-platform-01");
      refresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface p-5 rounded-xl border border-border shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" />
            Manajemen Kredensial AI Gemini Terpusat
          </h1>
          <p className="text-xs text-foreground-secondary mt-0.5">
            Pusat konfigurasi Google GenAI API server-side. Pendidik dan siswa tidak perlu menyediakan API Key sendiri.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowAddModal(true)}
          className="bg-primary hover:bg-primary-hover text-xs font-semibold"
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> Tambah Kredensial Gemini
        </Button>
      </div>

      {/* Security Architecture Alert */}
      <div className="p-4 rounded-xl bg-emerald-50/70 border border-success/30 text-xs text-emerald-950 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-success shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block text-success">Keamanan Secret Server-Side Terjamin:</span>
          <p className="text-[11px] text-foreground-secondary mt-0.5 leading-relaxed">
            Kunci API Gemini tidak pernah dikirimkan ke peramban klien atau disimpan dalam variabel publik. Semua operasi AI ditangani oleh AI Provider Manager di server dengan masking otomatis, routing kuota independen, dan failover bertingkat.
          </p>
        </div>
      </div>

      {/* Credentials Table */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-xs">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Cpu className="w-4 h-4 text-primary" /> Daftar Kluster Kredensial AI Aktif
          </h2>
          <button
            type="button"
            onClick={refresh}
            className="text-xs text-foreground-secondary hover:text-foreground flex items-center gap-1 px-2.5 py-1 rounded-md border border-border bg-surface-secondary"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Segarkan
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-secondary border-b border-border text-foreground-secondary font-semibold">
              <tr>
                <th className="py-3 px-4">Label &amp; GCP Project</th>
                <th className="py-3 px-4">Masked Secret</th>
                <th className="py-3 px-4">Model Didukung</th>
                <th className="py-3 px-4">Prioritas / Bobot</th>
                <th className="py-3 px-4">Status &amp; Kesehatan</th>
                <th className="py-3 px-4">Penggunaan Token</th>
                <th className="py-3 px-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {credentials.map((c) => (
                <tr key={c.id} className="hover:bg-surface-secondary transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-bold text-foreground block">{c.label}</span>
                    <span className="text-[10px] text-foreground-secondary font-mono">{c.project_id || "GCP-Default"}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-primary">
                    <span className="inline-flex items-center gap-1">
                      <Lock className="w-3 h-3 text-foreground-secondary" />
                      {c.api_key_masked}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {c.supported_models.map((m) => (
                        <span key={m} className="px-1.5 py-0.5 rounded bg-surface-secondary border border-border text-[10px] font-mono text-foreground">
                          {m}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-foreground">P{c.priority}</span>
                    <span className="text-[10px] text-foreground-secondary ml-1">({c.weight}%)</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          c.status === "active" ? "bg-success" : "bg-border-strong"
                        }`}
                      />
                      <span className="font-semibold capitalize text-foreground">{c.status}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px]">
                    <span className="text-foreground font-bold">{c.total_tokens_used.toLocaleString()}</span> tokens
                    <span className="text-[10px] text-foreground-secondary block">{c.daily_request_count} req</span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(c)}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      {c.status === "active" ? "Nonaktifkan" : "Aktifkan"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id)}
                      className="text-xs text-error hover:underline"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Usage Activity Logs */}
      <div className="bg-surface rounded-xl border border-border p-5 shadow-xs">
        <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" /> Log Pemanggilan AI Realtime
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-secondary border-b border-border text-foreground-secondary">
              <tr>
                <th className="py-2.5 px-3">Request ID</th>
                <th className="py-2.5 px-3">Operasi</th>
                <th className="py-2.5 px-3">Model</th>
                <th className="py-2.5 px-3">Tokens (In / Out)</th>
                <th className="py-2.5 px-3">Durasi</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {usageLogs.slice(0, 8).map((log) => (
                <tr key={log.id}>
                  <td className="py-2 px-3 font-mono text-[11px] text-foreground-secondary">{log.request_id}</td>
                  <td className="py-2 px-3 font-medium text-foreground">{log.operation_type}</td>
                  <td className="py-2 px-3 font-mono text-[11px] text-foreground">{log.model}</td>
                  <td className="py-2 px-3 font-mono text-[11px] text-foreground">
                    {log.input_tokens} / {log.output_tokens}
                  </td>
                  <td className="py-2 px-3 text-foreground-secondary">{log.duration_ms} ms</td>
                  <td className="py-2 px-3">
                    {log.success ? (
                      <Badge variant="success">
                        SUCCESS
                      </Badge>
                    ) : (
                      <Badge variant="error">
                        FALLBACK
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Credential Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-xl max-w-md w-full p-6 shadow-xl border border-border space-y-4">
            <h2 className="text-base font-bold text-foreground">Daftarkan Kredensial Gemini Baru</h2>
            <form onSubmit={handleCreateCredential} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Label Kluster Internal:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Production Kluster East (GCP-01)"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-surface-secondary text-foreground focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Gemini API Key:
                </label>
                <input
                  type="password"
                  required
                  placeholder="AIzaSy..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-surface-secondary text-foreground font-mono focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <span className="text-[10px] text-foreground-secondary mt-0.5 block">
                  Kunci akan langsung dimasking setelah pendaftaran demi keamanan.
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Google Cloud Project ID:
                </label>
                <input
                  type="text"
                  placeholder="Contoh: contextlearning-prod-ai"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-surface-secondary text-foreground focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Prioritas:</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-surface-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value={1}>1 (Utama)</option>
                    <option value={2}>2 (Cadangan / Fallback)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Bobot Routing (%):</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-surface-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {formError && <p className="text-xs text-error font-medium">{formError}</p>}

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)} className="text-xs border-border">
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="sm" className="bg-primary hover:bg-primary-hover text-xs font-semibold">
                  Simpan Kredensial
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
