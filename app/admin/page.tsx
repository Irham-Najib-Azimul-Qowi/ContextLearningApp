"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  School,
  UsersRound,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { repository } from "@/lib/db/repository";
import { School as SchoolType, AuditLog } from "@/lib/db/types";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState(repository.getPlatformStats());
  const [pendingSchools, setPendingSchools] = useState<SchoolType[]>([]);
  const [recentAudits, setRecentAudits] = useState<AuditLog[]>([]);

  const refreshData = useCallback(() => {
    setStats(repository.getPlatformStats());
    const schools = repository.getSchools();
    setPendingSchools(schools.filter((s) => s.verification_status === "pending_verification"));
    setRecentAudits(repository.getAuditLogs().slice(0, 5));
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleApproveSchool = (schoolId: string) => {
    repository.updateSchoolVerification(schoolId, "verified", "admin-platform-01");
    refreshData();
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Ringkasan Operasional Platform</h1>
        <p className="text-xs text-foreground-secondary mt-0.5">
          Status kesehatan instansi, volume permintaan AI Gemini, dan aktivitas multi-tenant ContextLearning.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface p-4 rounded-xl border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground-secondary">Total Sekolah</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <School className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground font-mono">{stats.totalSchools}</p>
          <span className="text-[11px] text-success font-medium flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3 h-3" /> {stats.activeSchools} Aktif Beroperasi
          </span>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground-secondary">Guru Terdaftar</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <UsersRound className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground font-mono">{stats.totalTeachers}</p>
          <span className="text-[11px] text-foreground-secondary mt-1 block">
            {stats.totalStudents} Siswa Terdaftar
          </span>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground-secondary">Kredensial AI Aktif</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-success flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground font-mono">{stats.activeAICredentials}</p>
          <span className="text-[11px] text-success font-medium mt-1 block">
            Terkelola Terpusat (Server-Side)
          </span>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground-secondary">Ketersediaan AI</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground font-mono">{stats.aiSuccessRate}%</p>
          <span className="text-[11px] text-foreground-secondary mt-1 block">
            {stats.totalAIRequests} Total Panggilan AI
          </span>
        </div>
      </div>

      {/* Pending School Verifications Section */}
      <div className="bg-surface rounded-xl border border-border p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <h3 className="text-sm font-bold text-foreground">
              Permohonan Verifikasi Sekolah ({pendingSchools.length})
            </h3>
          </div>
          <Link href="/admin/schools" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
            Lihat Semua Sekolah <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {pendingSchools.length === 0 ? (
          <p className="text-xs text-foreground-secondary py-3 text-center">
            Tidak ada permohonan verifikasi sekolah yang tertunda. Semua instansi telah diverifikasi.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {pendingSchools.map((sch) => (
              <div key={sch.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{sch.name}</span>
                    <Badge variant="secondary">
                      {sch.educational_level}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-foreground-secondary mt-0.5">
                    {sch.district}, {sch.regency}, {sch.province} • Kode: {sch.code}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleApproveSchool(sch.id)}
                    className="h-7 text-xs bg-success hover:bg-success/90 font-semibold"
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
        <div className="bg-surface rounded-xl border border-border p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" /> Log Audit Terkini
            </h3>
            <Link href="/admin/audit" className="text-xs font-semibold text-primary hover:underline">
              Semua Log
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentAudits.map((log) => (
              <div key={log.id} className="py-2.5 text-xs space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">{log.action}</span>
                  <span className="text-[10px] text-foreground-secondary font-mono">
                    {new Date(log.created_at).toLocaleTimeString("id-ID")}
                  </span>
                </div>
                <p className="text-[11px] text-foreground-secondary">
                  Aktor: <span className="font-medium text-foreground">{log.actor_name}</span> ({log.actor_role})
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Gemini Central Management Quick Info */}
        <div className="bg-surface rounded-xl border border-border p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
              <KeyRound className="w-4 h-4 text-primary" /> Manajemen AI Gemini Terpusat
            </h3>
            <p className="text-xs text-foreground-secondary leading-relaxed mb-3">
              Kredensial API Gemini dikelola penuh oleh tim platform. Pendidik dan siswa tidak perlu menginput API key pribadi.
            </p>
            <div className="p-3.5 rounded-lg bg-surface-secondary border border-border text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-foreground-secondary">Model Utama:</span>
                <span className="font-mono font-semibold text-foreground">gemini-2.5-flash</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-secondary">Model Cadangan:</span>
                <span className="font-mono text-foreground-secondary">gemini-2.5-pro</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-secondary">Mekanisme Fallback:</span>
                <span className="text-success font-semibold">Kurikulum Lokal Deterministik</span>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Link href="/admin/ai">
              <Button variant="outline" size="sm" className="w-full text-xs border-border hover:bg-surface-secondary text-foreground">
                Kelola Kredensial AI & Batas Kuota <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
