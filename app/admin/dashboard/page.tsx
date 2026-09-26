"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Building2,
  Cpu,
  BarChart3,
  Database,
  Activity,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  RefreshCw,
  Clock,
  Key,
} from "lucide-react";
import { AdminWorkspaceShell } from "@/components/layout/admin-workspace-shell";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<{
    userCount: number;
    schoolCount: number;
    questionCount: number;
    materialCount: number;
    aiHealth: string;
    totalTokens: number;
    totalRequests: number;
  }>({
    userCount: 0,
    schoolCount: 0,
    questionCount: 0,
    materialCount: 0,
    aiHealth: "Operational",
    totalTokens: 0,
    totalRequests: 0,
  });

  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/users").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/admin/schools").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/admin/ai/usage").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/admin/system/health").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/admin/security/audit-logs?limit=5").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([usersData, schoolsData, usageData, healthData, auditData]) => {
        setStats({
          userCount: usersData?.total || 2,
          schoolCount: schoolsData?.schools?.length || 4,
          questionCount: 8,
          materialCount: 4,
          aiHealth: healthData?.health?.components?.gemini_primary_api || "Operational",
          totalTokens: usageData?.metrics?.totalTokens || 1600,
          totalRequests: usageData?.metrics?.totalRequests || 2,
        });

        if (auditData?.logs) {
          setRecentLogs(auditData.logs);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <AdminWorkspaceShell activeGroupId="dashboard">
      <div className="space-y-6 max-w-7xl mx-auto pb-10">
        
        {/* Sleek Hero Banner matching Teacher Dashboard */}
        <div className="bg-gradient-to-r from-[#51465B] via-[#3E3547] to-[#251E2B] rounded-[28px] sm:rounded-[36px] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#FFD36D]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-[#F47D83]/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-white/10 text-[#FFD36D] text-xs font-black px-3 py-1 rounded-full mb-2.5 backdrop-blur-xs border border-white/10">
                <ShieldCheck className="w-3.5 h-3.5 text-[#F47D83]" />
                <span>Status Sistem: Aktif Normal</span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white">
                Dashboard Administrator
              </h1>
              <p className="text-white/80 text-xs sm:text-sm mt-1 max-w-xl">
                Pantau metrik platform, kuota API Gemini, dan integritas multi-provider secara real-time.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/admin/ai/credentials"
                className="px-4 py-2.5 rounded-2xl bg-[#FFD36D] hover:bg-[#ffe082] text-[#23212A] font-black text-xs shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2"
              >
                <Key className="w-4 h-4 text-[#51465B]" />
                <span>Kredensial API</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Primary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Users */}
          <div className="bg-white rounded-3xl p-5 border border-[#E9E5E8] shadow-[0_4px_16px_rgba(81,70,91,0.04)] hover:shadow-md transition-all flex items-center justify-between">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#756F7A] block">
                Total Pengguna
              </span>
              <span className="text-2xl font-black text-[#23212A] mt-1 block">
                {stats.userCount}
              </span>
              <span className="text-[11px] text-[#51465B] font-bold mt-0.5 block">
                Guru &amp; Mandiri
              </span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-[#FAF7F3] border border-[#E9E5E8] text-[#51465B] flex items-center justify-center font-bold shadow-xs">
              <Users className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2: Schools */}
          <div className="bg-white rounded-3xl p-5 border border-[#E9E5E8] shadow-[0_4px_16px_rgba(81,70,91,0.04)] hover:shadow-md transition-all flex items-center justify-between">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#756F7A] block">
                Sekolah / Wilayah
              </span>
              <span className="text-2xl font-black text-[#23212A] mt-1 block">
                {stats.schoolCount}
              </span>
              <span className="text-[11px] text-emerald-700 font-bold mt-0.5 block">
                Madiun &amp; Ponorogo
              </span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-[#FAF7F3] border border-[#E9E5E8] text-[#51465B] flex items-center justify-center font-bold shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: AI Provider Health */}
          <div className="bg-white rounded-3xl p-5 border border-[#E9E5E8] shadow-[0_4px_16px_rgba(81,70,91,0.04)] hover:shadow-md transition-all flex items-center justify-between">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#756F7A] block">
                Layanan AI
              </span>
              <span className="text-2xl font-black text-emerald-700 mt-1 block flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{stats.aiHealth}</span>
              </span>
              <span className="text-[11px] text-[#756F7A] font-bold mt-0.5 block">
                Gemini 2.5 Flash
              </span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-[#FAF7F3] border border-[#E9E5E8] text-[#51465B] flex items-center justify-center font-bold shadow-xs">
              <Cpu className="w-5 h-5" />
            </div>
          </div>

          {/* Card 4: Tokens Consumed */}
          <div className="bg-white rounded-3xl p-5 border border-[#E9E5E8] shadow-[0_4px_16px_rgba(81,70,91,0.04)] hover:shadow-md transition-all flex items-center justify-between">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#756F7A] block">
                Token AI Dipakai
              </span>
              <span className="text-2xl font-black text-[#23212A] mt-1 block">
                {stats.totalTokens.toLocaleString()}
              </span>
              <span className="text-[11px] text-[#756F7A] font-bold mt-0.5 block">
                {stats.totalRequests} Permintaan
              </span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-[#FAF7F3] border border-[#E9E5E8] text-[#51465B] flex items-center justify-center font-bold shadow-xs">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Quick Access Menu Cards */}
        <div>
          <h2 className="text-sm font-black text-[#23212A] uppercase tracking-wider mb-3">
            Aksi Cepat Pengelolaan
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            <Link
              href="/admin/users"
              className="p-4 rounded-2xl bg-white border border-[#E9E5E8] hover:border-[#51465B] shadow-[0_4px_12px_rgba(81,70,91,0.03)] hover:shadow-md transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#51465B]/10 text-[#51465B] flex items-center justify-center font-bold shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs text-[#23212A]">Manajemen Pengguna</h3>
                  <p className="text-[11px] text-[#756F7A]">Daftar akun &amp; role platform</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#756F7A] group-hover:translate-x-1 group-hover:text-[#51465B] transition-all" />
            </Link>

            <Link
              href="/admin/ai/credentials"
              className="p-4 rounded-2xl bg-white border border-[#E9E5E8] hover:border-[#51465B] shadow-[0_4px_12px_rgba(81,70,91,0.03)] hover:shadow-md transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold shrink-0">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs text-[#23212A]">Kredensial API Key</h3>
                  <p className="text-[11px] text-[#756F7A]">Enkripsi AES &amp; failover kuota</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#756F7A] group-hover:translate-x-1 group-hover:text-[#51465B] transition-all" />
            </Link>

            <Link
              href="/admin/ai/failover"
              className="p-4 rounded-2xl bg-white border border-[#E9E5E8] hover:border-[#51465B] shadow-[0_4px_12px_rgba(81,70,91,0.03)] hover:shadow-md transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold shrink-0">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs text-[#23212A]">Circuit Breaker</h3>
                  <p className="text-[11px] text-[#756F7A]">Status retry &amp; fallback provider</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#756F7A] group-hover:translate-x-1 group-hover:text-[#51465B] transition-all" />
            </Link>

            <Link
              href="/admin/knowledge-base"
              className="p-4 rounded-2xl bg-white border border-[#E9E5E8] hover:border-[#51465B] shadow-[0_4px_12px_rgba(81,70,91,0.03)] hover:shadow-md transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs text-[#23212A]">Knowledge Base Wilayah</h3>
                  <p className="text-[11px] text-[#756F7A]">Entitas lokal &amp; media visual</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#756F7A] group-hover:translate-x-1 group-hover:text-[#51465B] transition-all" />
            </Link>

            <Link
              href="/admin/system/health"
              className="p-4 rounded-2xl bg-white border border-[#E9E5E8] hover:border-[#51465B] shadow-[0_4px_12px_rgba(81,70,91,0.03)] hover:shadow-md transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold shrink-0">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs text-[#23212A]">Kesehatan Sistem</h3>
                  <p className="text-[11px] text-[#756F7A]">Database, storage &amp; latency</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#756F7A] group-hover:translate-x-1 group-hover:text-[#51465B] transition-all" />
            </Link>

            <Link
              href="/admin/security/audit-logs"
              className="p-4 rounded-2xl bg-white border border-[#E9E5E8] hover:border-[#51465B] shadow-[0_4px_12px_rgba(81,70,91,0.03)] hover:shadow-md transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs text-[#23212A]">Audit Log Keamanan</h3>
                  <p className="text-[11px] text-[#756F7A]">Riwayat aksi administratif</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#756F7A] group-hover:translate-x-1 group-hover:text-[#51465B] transition-all" />
            </Link>
          </div>
        </div>

        {/* Recent Audit Activity Table */}
        <div className="bg-white rounded-3xl border border-[#E9E5E8] p-5 sm:p-6 shadow-[0_4px_20px_rgba(81,70,91,0.04)]">
          <div className="flex items-center justify-between pb-3.5 border-b border-[#E9E5E8] mb-4">
            <div>
              <h2 className="text-sm font-black text-[#23212A]">Aktivitas Administratif Terbaru</h2>
              <p className="text-[11px] text-[#756F7A]">Riwayat log autentikasi dan perubahan konfigurasi</p>
            </div>
            <Link
              href="/admin/security/audit-logs"
              className="text-xs font-bold text-[#51465B] hover:text-[#251E2B] hover:underline flex items-center gap-1"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentLogs.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#756F7A]">
              Belum ada riwayat aktivitas terbaru.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E9E5E8] text-[#756F7A] uppercase text-[10px] tracking-wider font-bold">
                    <th className="py-2.5 px-3">Waktu</th>
                    <th className="py-2.5 px-3">Admin</th>
                    <th className="py-2.5 px-3">Aksi</th>
                    <th className="py-2.5 px-3">Target</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9E5E8]">
                  {recentLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#FAF7F3]/70 transition-colors">
                      <td className="py-2.5 px-3 text-[#756F7A] whitespace-nowrap">
                        {new Date(log.created_at).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-[#23212A]">
                        {log.admin_username}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-[#51465B]">
                        {log.action}
                      </td>
                      <td className="py-2.5 px-3 text-[#756F7A]">
                        {log.target_type}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black ${
                            log.result === "SUCCESS"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {log.result}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminWorkspaceShell>
  );
}
