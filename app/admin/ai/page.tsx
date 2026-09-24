"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Cpu,
  Key,
  Sliders,
  BarChart3,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { AdminWorkspaceShell } from "@/components/layout/admin-workspace-shell";

export default function AdminAIOverviewPage() {
  const [credentials, setCredentials] = useState<any[]>([]);
  const [usage, setUsage] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/ai/credentials")
      .then((r) => r.json())
      .then((d) => d?.credentials && setCredentials(d.credentials));

    fetch("/api/admin/ai/usage")
      .then((r) => r.json())
      .then((d) => d && setUsage(d));
  }, []);

  const healthyCount = credentials.filter((c) => c.health_status === "healthy" && c.is_enabled).length;

  return (
    <AdminWorkspaceShell activeGroupId="ai">
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="bg-white rounded-[28px] sm:rounded-[36px] border border-[#E9E5E8] p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#51465B] text-[#FFD36D] flex items-center justify-center font-bold">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-[#23212A] tracking-tight">
                  Manajemen Multi-Provider AI & Gateway Terpusat
                </h1>
                <p className="text-xs text-[#756F7A]">
                  Arsitektur penyedia model Gemini dengan enkripsi tingkat simpanan (AES-256-GCM), automatic failover, dan isolasi kelompok kuota.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Pool AI: {healthyCount} Aktif & Sehat</span>
              </span>
            </div>
          </div>
        </div>

        {/* 4 Feature Sub-Hub Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/ai/credentials"
            className="p-6 rounded-[24px] bg-white border border-[#E9E5E8] hover:border-[#51465B] shadow-xs transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold mb-3">
                <Key className="w-5 h-5" />
              </div>
              <h3 className="font-black text-sm text-[#23212A] mb-1">Kredensial API Key</h3>
              <p className="text-[11px] text-[#756F7A] leading-snug">
                Simpan API key terenkripsi AES-256-GCM, uji koneksi, dan atur prioritas pemanggilan.
              </p>
            </div>
            <div className="pt-4 mt-2 border-t border-[#E9E5E8] flex items-center justify-between text-xs font-bold text-[#51465B]">
              <span>{credentials.length} Konfigurasi</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/admin/ai/models"
            className="p-6 rounded-[24px] bg-white border border-[#E9E5E8] hover:border-[#51465B] shadow-xs transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold mb-3">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="font-black text-sm text-[#23212A] mb-1">Model & Routing Fitur</h3>
              <p className="text-[11px] text-[#756F7A] leading-snug">
                Petakan model primer dan sekunder berdasarkan kapabilitas teks, visi, atau struktur output.
              </p>
            </div>
            <div className="pt-4 mt-2 border-t border-[#E9E5E8] flex items-center justify-between text-xs font-bold text-[#51465B]">
              <span>5 Fitur Terkonfigurasi</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/admin/ai/usage"
            className="p-6 rounded-[24px] bg-white border border-[#E9E5E8] hover:border-[#51465B] shadow-xs transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold mb-3">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="font-black text-sm text-[#23212A] mb-1">Penggunaan & Token</h3>
              <p className="text-[11px] text-[#756F7A] leading-snug">
                Audit konsumsi token input/output, rata-rata latensi respons, dan volume pemanggilan.
              </p>
            </div>
            <div className="pt-4 mt-2 border-t border-[#E9E5E8] flex items-center justify-between text-xs font-bold text-[#51465B]">
              <span>{usage?.metrics?.totalTokens?.toLocaleString() || "1.600"} Tokens</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/admin/ai/failover"
            className="p-6 rounded-[24px] bg-white border border-[#E9E5E8] hover:border-[#51465B] shadow-xs transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold mb-3">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h3 className="font-black text-sm text-[#23212A] mb-1">Failover & Circuit Breaker</h3>
              <p className="text-[11px] text-[#756F7A] leading-snug">
                Mekanisme mitigasi batas kuota, exponential backoff, dan status circuit breaker.
              </p>
            </div>
            <div className="pt-4 mt-2 border-t border-[#E9E5E8] flex items-center justify-between text-xs font-bold text-[#51465B]">
              <span>Circuit: CLOSED (Normal)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Architecture Details Card */}
        <div className="bg-[#FAF7F3] rounded-[28px] sm:rounded-[36px] border border-[#E9E5E8] p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-[#F47D83]" />
            <h2 className="text-sm font-black text-[#51465B] uppercase tracking-wider">
              Prinsip Operasional AI Provider Manager PAHAMI V2
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#756F7A] leading-relaxed">
            <div className="p-4 bg-white rounded-[20px] border border-[#E9E5E8]">
              <span className="font-black text-[#23212A] block mb-1">1. Quota Group Awareness</span>
              Jika sebuah API key menerima status 429 karena batas kuota proyek habis, sistem tidak akan merotasi ke key lain yang berada pada proyek yang sama demi mematuhi ketentuan kuota penyedia.
            </div>
            <div className="p-4 bg-white rounded-[20px] border border-[#E9E5E8]">
              <span className="font-black text-[#23212A] block mb-1">2. Enkripsi AES-256-GCM</span>
              Seluruh API key disimpan terenkripsi di server dengan IV unik dan auth tag integritas. Plaintext key tidak pernah dikirim ke browser atau dicetak pada log.
            </div>
            <div className="p-4 bg-white rounded-[20px] border border-[#E9E5E8]">
              <span className="font-black text-[#23212A] block mb-1">3. Mode Pemulihan Terpadu</span>
              Jika seluruh layanan penyedia AI sedang mengalami gangguan global, sistem otomatis mengaktifkan respons pemulihan pedagogis agar aktivitas siswa tidak terhenti.
            </div>
          </div>
        </div>
      </div>
    </AdminWorkspaceShell>
  );
}
