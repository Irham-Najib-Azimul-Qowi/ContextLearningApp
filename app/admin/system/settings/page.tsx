"use client";

import React, { useState, useEffect } from "react";
import { AdminWorkspaceShell } from "@/components/layout/admin-workspace-shell";
import {
  Settings,
  ShieldAlert,
  Cpu,
  MapPin,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Power,
  Sliders,
} from "lucide-react";

interface SystemSettingsMap {
  maintenance_mode?: {
    key: string;
    value: { enabled: boolean; message: string; allow_admin: boolean };
    description: string;
  };
  ai_global_switch?: {
    key: string;
    value: { enabled: boolean; fallback_to_simulation: boolean; max_daily_budget_usd: number };
    description: string;
  };
  supported_regions?: {
    key: string;
    value: { regions: string[] };
    description: string;
  };
}

export default function AdminSystemSettingsPage() {
  const [settings, setSettings] = useState<SystemSettingsMap>({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form local state
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);
  const [maintenanceMsg, setMaintenanceMsg] = useState("");
  const [allowAdminLogin, setAllowAdminLogin] = useState(true);

  const [aiEnabled, setAiEnabled] = useState(true);
  const [aiFallbackSimulation, setAiFallbackSimulation] = useState(true);
  const [dailyBudget, setDailyBudget] = useState(10.0);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/system/settings");
      const data = await res.json();
      if (data?.success && data.settings) {
        const s = data.settings as SystemSettingsMap;
        setSettings(s);

        if (s.maintenance_mode) {
          setMaintenanceEnabled(s.maintenance_mode.value.enabled);
          setMaintenanceMsg(s.maintenance_mode.value.message || "");
          setAllowAdminLogin(s.maintenance_mode.value.allow_admin ?? true);
        }

        if (s.ai_global_switch) {
          setAiEnabled(s.ai_global_switch.value.enabled);
          setAiFallbackSimulation(s.ai_global_switch.value.fallback_to_simulation ?? true);
          setDailyBudget(s.ai_global_switch.value.max_daily_budget_usd ?? 10.0);
        }
      }
    } catch {
      setMessage({ type: "error", text: "Gagal memuat pengaturan sistem." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveMaintenance = async () => {
    try {
      setSavingKey("maintenance_mode");
      setMessage(null);

      const res = await fetch("/api/admin/system/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "maintenance_mode",
          value: {
            enabled: maintenanceEnabled,
            message: maintenanceMsg,
            allow_admin: allowAdminLogin,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Gagal menyimpan pengaturan.");

      setMessage({ type: "success", text: "Pengaturan Maintenance Mode berhasil diperbarui!" });
      fetchSettings();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Gagal menyimpan pengaturan." });
    } finally {
      setSavingKey(null);
    }
  };

  const handleSaveAI = async () => {
    try {
      setSavingKey("ai_global_switch");
      setMessage(null);

      const res = await fetch("/api/admin/system/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "ai_global_switch",
          value: {
            enabled: aiEnabled,
            fallback_to_simulation: aiFallbackSimulation,
            max_daily_budget_usd: dailyBudget,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Gagal menyimpan pengaturan.");

      setMessage({ type: "success", text: "Pengaturan AI Global Switch berhasil diperbarui!" });
      fetchSettings();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Gagal menyimpan pengaturan." });
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <AdminWorkspaceShell activeGroupId="sys">
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="clay-card p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#51465B] text-[#FFD36D] flex items-center justify-center font-bold shadow-[0_4px_12px_rgba(81,70,91,0.2)]">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-[#23212A] tracking-tight">
                  Pengaturan Sistem &amp; Feature Flags
                </h1>
                <p className="text-xs text-[#756F7A] mt-0.5 max-w-2xl">
                  Kontrol status pemeliharaan aplikasi (Maintenance Mode), sakelar global panggilan AI Gemini, dan pembatas anggaran pengeluaran kuota.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchSettings}
                disabled={loading}
                className="px-4 py-2.5 rounded-2xl bg-white border border-[#E9E5E8] hover:bg-neutral-50 text-xs font-bold text-[#51465B] flex items-center gap-2 shadow-xs transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                Muat Ulang
              </button>
            </div>
          </div>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition-all shadow-xs ${
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Maintenance Mode */}
          <div className="clay-card p-6 sm:p-8 flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#E9E5E8]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-black shadow-xs">
                    <ShieldAlert className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-[#51465B]">Mode Pemeliharaan (Maintenance)</h3>
                    <span className="text-[11px] text-neutral-400 font-medium">
                      Kunci akses publik untuk siswa & guru saat upgrade sistem
                    </span>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                    maintenanceEnabled ? "bg-amber-100 text-amber-800" : "bg-neutral-100 text-neutral-600"
                  }`}
                >
                  {maintenanceEnabled ? "AKTIF" : "NONAKTIF"}
                </span>
              </div>

              <div className="mt-4 space-y-4 text-xs">
                {/* Toggle switch */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF7F3] border border-[#E9E5E8]">
                  <div>
                    <span className="font-extrabold text-[#51465B] block">Aktifkan Maintenance Mode</span>
                    <span className="text-[11px] text-neutral-500">
                      Siswa dan guru diarahkan ke laman jeda perawatan
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={maintenanceEnabled}
                    onChange={(e) => setMaintenanceEnabled(e.target.checked)}
                    className="w-5 h-5 accent-[#51465B] cursor-pointer"
                  />
                </div>

                {/* Message input */}
                <div className="space-y-1.5">
                  <label className="font-bold text-[#51465B] block">Pesan Siaran untuk Pengguna:</label>
                  <textarea
                    rows={3}
                    value={maintenanceMsg}
                    onChange={(e) => setMaintenanceMsg(e.target.value)}
                    placeholder="Tulis pesan alasan pemeliharaan untuk siswa dan guru..."
                    className="w-full p-3 rounded-2xl border border-[#E9E5E8] bg-[#FAF7F3] focus:bg-white text-xs font-medium text-[#51465B] focus:outline-none focus:ring-2 focus:ring-[#51465B]"
                  />
                </div>

                {/* Allow admin */}
                <label className="flex items-center gap-2 cursor-pointer font-medium text-neutral-700">
                  <input
                    type="checkbox"
                    checked={allowAdminLogin}
                    onChange={(e) => setAllowAdminLogin(e.target.checked)}
                    className="w-4 h-4 accent-[#51465B]"
                  />
                  <span>Tetap izinkan developer mengakses Admin Control Center</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E9E5E8] flex justify-end">
              <button
                onClick={handleSaveMaintenance}
                disabled={savingKey === "maintenance_mode"}
                className="px-4 py-2 rounded-xl bg-[#51465B] hover:bg-[#3D3445] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all disabled:opacity-50"
              >
                {savingKey === "maintenance_mode" ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5 text-[#FFD36D]" />
                )}
                <span>Simpan Mode Pemeliharaan</span>
              </button>
            </div>
          </div>

          {/* Card 2: AI Global Switch */}
          <div className="bg-white rounded-3xl p-6 border border-[#E9E5E8] shadow-xs flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#E9E5E8]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-black">
                    <Cpu className="w-5 h-5 text-indigo-700" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-[#51465B]">Global AI Killswitch & Guard</h3>
                    <span className="text-[11px] text-neutral-400 font-medium">
                      Kontrol sentral seluruh pemanggilan API Google Gemini
                    </span>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                    aiEnabled ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {aiEnabled ? "AI ON" : "AI OFF"}
                </span>
              </div>

              <div className="mt-4 space-y-4 text-xs">
                {/* AI Toggle */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF7F3] border border-[#E9E5E8]">
                  <div>
                    <span className="font-extrabold text-[#51465B] block">Aktifkan Panggilan AI Eksternal</span>
                    <span className="text-[11px] text-neutral-500">
                      Jika dimatikan, sistem akan memblokir request ke API Gemini
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={aiEnabled}
                    onChange={(e) => setAiEnabled(e.target.checked)}
                    className="w-5 h-5 accent-[#51465B] cursor-pointer"
                  />
                </div>

                {/* Fallback Simulation */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF7F3] border border-[#E9E5E8]">
                  <div>
                    <span className="font-extrabold text-[#51465B] block">Pedagogical Safe Fallback</span>
                    <span className="text-[11px] text-neutral-500">
                      Gunakan cache soal lokal jika AI dinonaktifkan atau kuota habis
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={aiFallbackSimulation}
                    onChange={(e) => setAiFallbackSimulation(e.target.checked)}
                    className="w-5 h-5 accent-[#51465B] cursor-pointer"
                  />
                </div>

                {/* Daily Budget Guard */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-[#51465B]">Batas Anggaran Harian (Max USD):</label>
                    <span className="font-mono font-bold text-emerald-700">${dailyBudget.toFixed(2)} USD</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="50.0"
                    step="1.0"
                    value={dailyBudget}
                    onChange={(e) => setDailyBudget(parseFloat(e.target.value))}
                    className="w-full accent-[#51465B] cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E9E5E8] flex justify-end">
              <button
                onClick={handleSaveAI}
                disabled={savingKey === "ai_global_switch"}
                className="px-4 py-2 rounded-xl bg-[#51465B] hover:bg-[#3D3445] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all disabled:opacity-50"
              >
                {savingKey === "ai_global_switch" ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5 text-[#FFD36D]" />
                )}
                <span>Simpan Pengaturan AI</span>
              </button>
            </div>
          </div>
        </div>

        {/* Priority Regions Indicator */}
        <div className="bg-white rounded-3xl p-6 border border-[#E9E5E8] shadow-xs">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-xl bg-[#51465B] text-[#FFD36D] flex items-center justify-center font-black">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#51465B]">Wilayah Prioritas Terdaftar</h3>
              <p className="text-[11px] text-neutral-400">
                Karesidenan Madiun & Kota Semarang (Total 7 Wilayah BPS)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {["35.77 Kota Madiun", "35.19 Kab. Madiun", "35.21 Kab. Ngawi", "35.20 Kab. Magetan", "35.02 Kab. Ponorogo", "35.01 Kab. Pacitan", "33.74 Kota Semarang"].map((reg) => (
              <span
                key={reg}
                className="px-3 py-1.5 rounded-xl bg-[#FAF7F3] border border-[#E9E5E8] font-bold text-[#51465B] flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{reg}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </AdminWorkspaceShell>
  );
}
