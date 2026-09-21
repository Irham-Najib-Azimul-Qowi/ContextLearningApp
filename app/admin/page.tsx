"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  School,
  UsersRound,
  FileQuestion,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Activity,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { repository } from "@/lib/db/repository";
import { School as SchoolType, AuditLog } from "@/lib/db/types";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState(repository.getPlatformStats());
  const [pendingSchools, setPendingSchools] = useState<SchoolType[]>([]);
  const [recentAudits, setRecentAudits] = useState<AuditLog[]>([]);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setStats(repository.getPlatformStats());
    const schools = repository.getSchools();
    setPendingSchools(schools.filter((s) => s.verification_status === "pending_verification"));
    setRecentAudits(repository.getAuditLogs().slice(0, 5));
  };

  const handleApproveSchool = (schoolId: string) => {
    repository.updateSchoolVerification(schoolId, "verified", "admin-platform-01");
    refreshData();
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-[#252B3A] tracking-tight">Ringkasan Operasional Platform</h1>
        <p className="text-xs text-[#697386] mt-0.5">
          Status kesehatan instansi, volume permintaan AI Gemini, dan aktivitas multi-tenant ContextLearning.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#DCE0EA] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#697386]">Total Sekolah</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#5865D8] flex items-center justify-center">
              <School className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-[#252B3A]">{stats.totalSchools}</p>
          <span className="text-[11px] text-[#238B68] font-medium flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3 h-3" /> {stats.activeSchools} Aktif Beroperasi
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#DCE0EA] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#697386]">Guru Terdaftar</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <UsersRound className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-[#252B3A]">{stats.totalTeachers}</p>
          <span className="text-[11px] text-[#697386] mt-1 block">
            {stats.totalStudents} Siswa Terdaftar
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#DCE0EA] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#697386]">Kredensial AI Aktif</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#238B68] flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-[#252B3A]">{stats.activeAICredentials}</p>
          <span className="text-[11px] text-[#238B68] font-medium mt-1 block">
            Terkelola Terpusat (Server-Side)
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#DCE0EA] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#697386]">Ketersediaan AI</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-[#252B3A]">{stats.aiSuccessRate}%</p>
          <span className="text-[11px] text-[#697386] mt-1 block">
            {stats.totalAIRequests} Total Panggilan AI
          </span>
        </div>
      </div>

      {/* Pending School Verifications Section */}
      <div className="bg-white rounded-xl border border-[#DCE0EA] p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#C68A28]" />
            <h3 className="text-sm font-bold text-[#252B3A]">
              Permohonan Verifikasi Sekolah ({pendingSchools.length})
            </h3>
          </div>
          <Link href="/admin/schools" className="text-xs font-semibold text-[#5865D8] hover:underline flex items-center gap-1">
            Lihat Semua Sekolah <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {pendingSchools.length === 0 ? (
          <p className="text-xs text-[#697386] py-3 text-center">
            Tidak ada permohonan verifikasi sekolah yang tertunda. Semua instansi telah diverifikasi.
          </p>
        ) : (
          <div className="divide-y divide-[#EDEFF5]">
            {pendingSchools.map((sch) => (
              <div key={sch.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[#252B3A]">{sch.name}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-[#5865D8]">
                      {sch.educational_level}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#697386] mt-0.5">
                    {sch.district}, {sch.regency}, {sch.province} • Kode: {sch.code}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleApproveSchool(sch.id)}
                    className="h-7 text-xs bg-[#238B68] hover:bg-[#1E7758]"
                  >
                    Verifikasi Instansi
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2-Column: Recent Audit Activity & Quick System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Audit Activity */}
        <div className="bg-white rounded-xl border border-[#DCE0EA] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#252B3A] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#5865D8]" /> Log Audit Terkini
            </h3>
            <Link href="/admin/audit" className="text-xs font-semibold text-[#5865D8] hover:underline">
              Semua Log
            </Link>
          </div>
          <div className="divide-y divide-[#EDEFF5]">
            {recentAudits.map((log) => (
              <div key={log.id} className="py-2.5 text-xs space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#252B3A]">{log.action}</span>
                  <span className="text-[10px] text-[#697386]">
                    {new Date(log.created_at).toLocaleTimeString("id-ID")}
                  </span>
                </div>
                <p className="text-[11px] text-[#697386]">
                  Aktor: <span className="font-medium text-[#252B3A]">{log.actor_name}</span> ({log.actor_role})
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Gemini Central Management Quick Info */}
        <div className="bg-white rounded-xl border border-[#DCE0EA] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#252B3A] flex items-center gap-2 mb-3">
              <KeyRound className="w-4 h-4 text-[#5865D8]" /> Manajemen AI Gemini Terpusat
            </h3>
            <p className="text-xs text-[#697386] leading-relaxed mb-3">
              Kredensial API Gemini dikelola penuh oleh tim platform. Pendidik dan siswa tidak perlu menginput API key pribadi.
            </p>
            <div className="p-3 rounded-lg bg-[#F7F8FC] border border-[#DCE0EA] text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#697386]">Model Utama:</span>
                <span className="font-mono font-semibold text-[#252B3A]">gemini-2.5-flash</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#697386]">Model Cadangan:</span>
                <span className="font-mono text-[#697386]">gemini-2.5-pro</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#697386]">Mekanisme Fallback:</span>
                <span className="text-[#238B68] font-semibold">Kurikulum Lokal Deterministik</span>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Link href="/admin/ai">
              <Button variant="outline" size="sm" className="w-full text-xs border-[#CBD5E1]">
                Kelola Kredensial AI & Batas Kuota <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
