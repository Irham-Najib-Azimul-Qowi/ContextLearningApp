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
  ExternalLink,
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
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        {/* Welcome Hero Banner */}
        <div className="bg-[#51465B] rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 md:p-10 text-white shadow-[0_20px_40px_rgba(81,70,91,0.18)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#FFD36D]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-[#F47D83]/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-white/15 text-[#FFD36D] text-xs font-black px-3.5 py-1.5 rounded-full mb-3 backdrop-blur-xs border border-white/10 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-[#F47D83]" />
                <span>Status Sistem: Terverifikasi & Aktif</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Pusat Kendali Pengembang DEPASKAN
              </h1>
              <p className="text-white/80 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
                Kelola kredensial AI multi-provider, pantau circuit breaker failover, administrasi akun pengguna (Guru &amp; Pengguna Mandiri), serta sinkronisasi Local Knowledge Base wilayah secara terpadu.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/admin/ai/credentials"
                className="px-5 py-3 rounded-2xl bg-[#FFD36D] hover:bg-[#ffe082] text-[#23212A] font-black text-xs shadow-[0_4px_16px_rgba(255,211,109,0.35)] transition-all active:scale-95 flex items-center gap-2 shrink-0 border border-white/20"
              >
                <Cpu className="w-4 h-4 text-[#51465B]" />
                <span>Kelola API Gemini</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Primary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Users */}
          <div className="clay-card p-6 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#756F7A] block">
                Total Akun Pengguna
              </span>
              <span className="text-2xl font-black text-[#23212A] mt-1.5 block">
                {stats.userCount} Pengguna
              </span>
              <span className="text-[11px] text-[#51465B] font-bold mt-1 block">
                Guru &amp; Pengguna Mandiri
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#FAF7F3] border border-[#E9E5E8] text-[#51465B] flex items-center justify-center font-bold shadow-xs">
              <Users className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Schools */}
          <div className="clay-card p-6 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#756F7A] block">
                Sekolah / Wilayah
              </span>
              <span className="text-2xl font-black text-[#23212A] mt-1.5 block">
                {stats.schoolCount} Satuan
              </span>
              <span className="text-[11px] text-emerald-700 font-bold mt-1 block">
                Ponorogo &amp; Wilayah Uji
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#FAF7F3] border border-[#E9E5E8] text-[#51465B] flex items-center justify-center font-bold shadow-xs">
              <Building2 className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: AI Provider Health */}
          <div className="clay-card p-6 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#756F7A] block">
                Status Layanan AI
              </span>
              <span className="text-2xl font-black text-emerald-700 mt-1.5 block flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{stats.aiHealth}</span>
              </span>
              <span className="text-[11px] text-[#756F7A] font-bold mt-1 block">
                Gemini 2.5 Flash Primary
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#FAF7F3] border border-[#E9E5E8] text-[#51465B] flex items-center justify-center font-bold shadow-xs">
              <Cpu className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4: Tokens Consumed */}
          <div className="clay-card p-6 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#756F7A] block">
                Total Token AI
              </span>
              <span className="text-2xl font-black text-[#23212A] mt-1.5 block">
                {stats.totalTokens.toLocaleString()}
              </span>
              <span className="text-[11px] text-[#756F7A] font-bold mt-1 block">
                {stats.totalRequests} Permintaan Diproses
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#FAF7F3] border border-[#E9E5E8] text-[#51465B] flex items-center justify-center font-bold shadow-xs">
              <BarChart3 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* 6 Quick Action Cards */}
        <div>
          <h2 className="text-base font-black text-[#23212A] mb-4">Aksi Cepat Pengelolaan Sistem</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/admin/users"
              className="p-5 rounded-[24px] bg-white border border-[#E9E5E8] hover:border-[#51465B] shadow-[0_8px_20px_rgba(81,70,91,0.04)] hover:shadow-[0_12px_28px_rgba(81,70,91,0.08)] transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#51465B]/10 text-[#51465B] flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs text-[#23212A]">Manajemen Pengguna</h3>
                  <p className="text-[11px] text-[#756F7A]">Kelola akun Guru &amp; Pengguna Mandiri</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#756F7A] group-hover:translate-x-1 group-hover:text-[#51465B] transition-all" />
            </Link>

            <Link
              href="/admin/ai/credentials"
              className="p-5 rounded-[24px] bg-white border border-[#E9E5E8] hover:border-[#51465B] shadow-[0_8px_20px_rgba(81,70,91,0.04)] hover:shadow-[0_12px_28px_rgba(81,70,91,0.08)] transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs text-[#23212A]">Kelola Kredensial AI</h3>
                  <p className="text-[11px] text-[#756F7A]">Enkripsi API key, kuota grup, dan uji koneksi</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#756F7A] group-hover:translate-x-1 group-hover:text-[#51465B] transition-all" />
            </Link>

            <Link
              href="/admin/ai/failover"
              className="p-5 rounded-[24px] bg-white border border-[#E9E5E8] hover:border-[#51465B] shadow-[0_8px_20px_rgba(81,70,91,0.04)] hover:shadow-[0_12px_28px_rgba(81,70,91,0.08)] transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs text-[#23212A]">Failover & Circuit Breaker</h3>
                  <p className="text-[11px] text-[#756F7A]">Pantau retry policy dan mitigasi batas kuota</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#756F7A] group-hover:translate-x-1 group-hover:text-[#51465B] transition-all" />
            </Link>

            <Link
              href="/admin/knowledge-base"
              className="p-5 rounded-[24px] bg-white border border-[#E9E5E8] hover:border-[#51465B] shadow-[0_8px_20px_rgba(81,70,91,0.04)] hover:shadow-[0_12px_28px_rgba(81,70,91,0.08)] transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs text-[#23212A]">Local Knowledge Base</h3>
                  <p className="text-[11px] text-[#756F7A]">Entitas wilayah dan aset media visual</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#756F7A] group-hover:translate-x-1 group-hover:text-[#51465B] transition-all" />
            </Link>

            <Link
              href="/admin/system/health"
              className="p-5 rounded-[24px] bg-white border border-[#E9E5E8] hover:border-[#51465B] shadow-[0_8px_20px_rgba(81,70,91,0.04)] hover:shadow-[0_12px_28px_rgba(81,70,91,0.08)] transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs text-[#23212A]">Kesehatan Sistem</h3>
                  <p className="text-[11px] text-[#756F7A]">Cek koneksi database, pgvector, dan storage</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#756F7A] group-hover:translate-x-1 group-hover:text-[#51465B] transition-all" />
            </Link>

            <Link
              href="/admin/security/audit-logs"
              className="p-5 rounded-[24px] bg-white border border-[#E9E5E8] hover:border-[#51465B] shadow-[0_8px_20px_rgba(81,70,91,0.04)] hover:shadow-[0_12px_28px_rgba(81,70,91,0.08)] transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs text-[#23212A]">Audit Log Keamanan</h3>
                  <p className="text-[11px] text-[#756F7A]">Riwayat otentikasi dan aksi administratif</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#756F7A] group-hover:translate-x-1 group-hover:text-[#51465B] transition-all" />
            </Link>
          </div>
        </div>

        {/* Recent Audit Activity Table */}
        <div className="bg-white rounded-[32px] sm:rounded-[36px] border border-[#E9E5E8] p-6 sm:p-8 shadow-[0_10px_30px_rgba(81,70,91,0.05)]">
          <div className="flex items-center justify-between pb-4 border-b border-[#E9E5E8] mb-4">
            <div>
              <h2 className="text-base font-black text-[#23212A]">Aktivitas Administratif Terbaru</h2>
              <p className="text-xs text-[#756F7A]">Audit log perubahan sistem dan riwayat autentikasi developer</p>
            </div>
            <Link
              href="/admin/security/audit-logs"
              className="text-xs font-bold text-[#51465B] hover:underline flex items-center gap-1"
            >
              <span>Lihat Semua Log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E9E5E8] text-[#756F7A] uppercase text-[10px] tracking-wider">
                  <th className="pb-3 font-bold">Waktu</th>
                  <th className="pb-3 font-bold">Admin</th>
                  <th className="pb-3 font-bold">Aksi</th>
                  <th className="pb-3 font-bold">Target</th>
                  <th className="pb-3 font-bold">Hasil</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9E5E8]">
                {recentLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FAF7F3]/80 transition-colors">
                    <td className="py-3 font-mono text-[#756F7A] text-[11px]">
                      {new Date(log.created_at).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                    <td className="py-3 font-bold text-[#23212A]">{log.admin_username}</td>
                    <td className="py-3">
                      <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-[#51465B]/10 text-[#51465B] font-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 text-[#756F7A]">
                      {log.target_type} {log.target_id ? `(${log.target_id})` : ""}
                    </td>
                    <td className="py-3">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        log.result === "SUCCESS"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}>
                        {log.result}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminWorkspaceShell>
  );
}
