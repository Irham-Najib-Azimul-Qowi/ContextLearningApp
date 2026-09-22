"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  School,
  UsersRound,
  CheckCircle2,
  AlertTriangle,
  Search,
  Check,
  X,
  FileText,
  Clock,
  Building2,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { repository } from "@/lib/db/repository";
import { School as SchoolType, SchoolVerificationStatus } from "@/lib/db/types";

// Coordinator contact persona lookup for realistic administrative review
const COORDINATOR_LOOKUP: Record<
  string,
  { name: string; email: string; phone: string; role: string; submitted_at: string }
> = {
  "teacher-demo-01": {
    name: "Ibu Nurhaliza, S.Pd.",
    email: "nurhaliza.guru@gmail.com",
    phone: "0812-3456-7890",
    role: "Koordinator Kurikulum & Guru Kelas VI",
    submitted_at: "01 Jan 2026",
  },
  "teacher-demo-02": {
    name: "Drs. H. Bambang Irawan, M.Pd.",
    email: "bambang.irawan@sman1samarinda.sch.id",
    phone: "0813-8877-6655",
    role: "Kepala Sekolah / Pengusul Utama",
    submitted_at: "01 Feb 2026",
  },
  "teacher-demo-03": {
    name: "Ibu Sri Wahyuni, S.Pd., M.Si.",
    email: "sri.wahyuni@smpn4bpp.sch.id",
    phone: "0821-4455-6677",
    role: "Wakil Kepala Sekolah Bidang Kurikulum",
    submitted_at: "10 Feb 2026",
  },
  "teacher-demo-04": {
    name: "Bpk. Agus Setiawan, S.Pd.",
    email: "agus.setiawan@sdmino1.sch.id",
    phone: "0857-9988-1122",
    role: "Guru Penggerak & Operator Dapodik",
    submitted_at: "14 Feb 2026",
  },
  "teacher-demo-05": {
    name: "Ibu Rina Maulida, S.Pd.",
    email: "rina.maulida@sman2tgr.sch.id",
    phone: "0812-7788-9900",
    role: "Koordinator Tim Pembelajaran Kontekstual",
    submitted_at: "18 Feb 2026",
  },
  "teacher-demo-06": {
    name: "Bpk. Muhammad Ilham, S.Pd.",
    email: "m.ilham@sdn006smr.sch.id",
    phone: "0852-1133-5577",
    role: "Guru Kelas VI & Pengusul Ruang Kerja",
    submitted_at: "22 Feb 2026",
  },
};

export default function AdminOverviewPage() {
  const [stats, setStats] = useState(repository.getPlatformStats());
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [statusTab, setStatusTab] = useState<string>("pending_verification");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSchool, setSelectedSchool] = useState<SchoolType | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");

  const refreshData = useCallback(() => {
    setStats(repository.getPlatformStats());
    setSchools(repository.getSchools());
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleUpdateStatus = (schoolId: string, newStatus: SchoolVerificationStatus) => {
    repository.updateSchoolVerification(schoolId, newStatus, "admin-platform-01");
    refreshData();
    if (selectedSchool?.id === schoolId) {
      setSelectedSchool((prev) => (prev ? { ...prev, verification_status: newStatus } : null));
    }
    const schoolName = schools.find((s) => s.id === schoolId)?.name || "Sekolah";
    const statusText = newStatus === "verified" ? "berhasil diverifikasi & disetujui" : "berhasil ditolak/diminta revisi";
    setActionSuccessMsg(`${schoolName} ${statusText}.`);
    setTimeout(() => setActionSuccessMsg(""), 4000);
  };

  const filteredSchools = useMemo(() => {
    return schools.filter((s) => {
      const matchesStatus = statusTab === "ALL" || s.verification_status === statusTab;
      const matchesLevel = levelFilter === "ALL" || s.educational_level === levelFilter;
      const coordinator = s.created_by ? COORDINATOR_LOOKUP[s.created_by] : null;
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.npsn && s.npsn.includes(searchQuery)) ||
        s.regency.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (coordinator && coordinator.name.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesStatus && matchesLevel && matchesSearch;
    });
  }, [schools, statusTab, levelFilter, searchQuery]);

  const pendingCount = useMemo(() => {
    return schools.filter((s) => s.verification_status === "pending_verification").length;
  }, [schools]);

  const verifiedCount = useMemo(() => {
    return schools.filter((s) => s.verification_status === "verified").length;
  }, [schools]);

  const rejectedCount = useMemo(() => {
    return schools.filter((s) => s.verification_status === "rejected").length;
  }, [schools]);

  return (
    <div className="space-y-6">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Ringkasan Operasional Platform Pahami
          </h1>
          <p className="text-xs text-secondary mt-1">
            Status kesehatan instansi, permohonan registrasi sekolah baru, dan verifikasi multi-tenant platform Pahami.
          </p>
        </div>

        <Link href="/admin/schools">
          <Button variant="outline" size="sm" className="text-xs">
            <Building2 className="w-3.5 h-3.5 mr-1 text-primary" /> Kelola Semua Sekolah
          </Button>
        </Link>
      </div>

      {actionSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-success-subtle border border-emerald-200 text-xs text-success font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Operational Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface p-4 rounded-xl border border-border shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-secondary">Total Sekolah Terdaftar</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <School className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground font-mono">{stats.totalSchools}</p>
          <span className="text-[11px] text-success font-semibold flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3 h-3" /> {verifiedCount} Terverifikasi
          </span>
        </div>

        <div className={`p-4 rounded-xl border shadow-2xs ${pendingCount > 0 ? "bg-warning-subtle/50 border-amber-300" : "bg-surface border-border"}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-secondary">Permohonan Tertunda</span>
            <div className="w-8 h-8 rounded-lg bg-warning-subtle text-warning flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground font-mono">{pendingCount}</p>
          <span className="text-[11px] text-warning font-semibold flex items-center gap-1 mt-1">
            <Clock className="w-3 h-3" /> Butuh Keputusan Admin
          </span>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-border shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-secondary">Pendidik &amp; Koordinator</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <UsersRound className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground font-mono">{stats.totalTeachers}</p>
          <span className="text-[11px] text-secondary mt-1 block">
            Google OAuth Terverifikasi
          </span>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-border shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-secondary">Siswa Terakreditasi</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground font-mono">{stats.totalStudents}</p>
          <span className="text-[11px] text-secondary mt-1 block">
            Multi-Tenant Terisolasi
          </span>
        </div>
      </div>

      {/* COMPREHENSIVE SCHOOL APPLICATIONS SECTION */}
      <div className="bg-surface rounded-xl border border-border p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                Daftar Permohonan Registrasi &amp; Verifikasi Sekolah
              </h2>
            </div>
            <p className="text-xs text-secondary mt-0.5">
              Evaluasi legalitas NPSN, kelengkapan berkas SK operasional, serta kesesuaian wilayah kearifan lokal sekolah.
            </p>
          </div>

          {/* Status Tab Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-workspace rounded-lg border border-border text-xs">
            <button
              type="button"
              onClick={() => setStatusTab("pending_verification")}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                statusTab === "pending_verification"
                  ? "bg-surface text-warning border border-amber-200 shadow-2xs"
                  : "text-secondary hover:text-foreground"
              }`}
            >
              Menunggu Verifikasi ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusTab("verified")}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                statusTab === "verified"
                  ? "bg-surface text-success border border-emerald-200 shadow-2xs"
                  : "text-secondary hover:text-foreground"
              }`}
            >
              Terverifikasi ({verifiedCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusTab("rejected")}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                statusTab === "rejected"
                  ? "bg-surface text-error border border-red-200 shadow-2xs"
                  : "text-secondary hover:text-foreground"
              }`}
            >
              Ditolak / Revisi ({rejectedCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusTab("ALL")}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                statusTab === "ALL"
                  ? "bg-surface text-foreground border border-border shadow-2xs"
                  : "text-secondary hover:text-foreground"
              }`}
            >
              Semua ({schools.length})
            </button>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama sekolah, NPSN, pengusul, atau kota/kabupaten..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-border bg-surface text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
            />
          </div>

          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-lg border border-border bg-surface text-foreground focus:border-primary focus:outline-none"
          >
            <option value="ALL">Semua Jenjang Pendidikan</option>
            <option value="SD">Sekolah Dasar (SD)</option>
            <option value="SMP">Sekolah Menengah Pertama (SMP)</option>
            <option value="SMA">Sekolah Menengah Atas (SMA)</option>
          </select>
        </div>

        {/* Applications List */}
        {filteredSchools.length === 0 ? (
          <div className="py-10 text-center space-y-2 border border-dashed border-border rounded-xl">
            <CheckCircle2 className="w-8 h-8 text-success mx-auto opacity-70" />
            <p className="text-xs font-semibold text-foreground">
              Tidak ada data permohonan sekolah pada filter ini.
            </p>
            <p className="text-xs text-secondary">
              Seluruh berkas pengajuan telah ditinjau atau tidak ada entri yang cocok dengan kata kunci pencarian.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSchools.map((sch) => {
              const coordinator = sch.created_by ? COORDINATOR_LOOKUP[sch.created_by] : null;

              return (
                <div
                  key={sch.id}
                  className="rounded-xl border border-border bg-surface p-4 hover:border-primary/40 transition-colors shadow-2xs space-y-3"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{sch.name}</span>
                        <Badge variant="primary">{sch.educational_level}</Badge>
                        <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-surface-subtle text-secondary border border-border">
                          NPSN: {sch.npsn || "-"}
                        </span>
                        <Badge
                          variant={
                            sch.verification_status === "verified"
                              ? "success"
                              : sch.verification_status === "rejected"
                              ? "error"
                              : "warning"
                          }
                        >
                          {sch.verification_status === "verified"
                            ? "Terverifikasi"
                            : sch.verification_status === "rejected"
                            ? "Ditolak / Revisi"
                            : "Menunggu Verifikasi"}
                        </Badge>
                      </div>

                      <p className="text-xs text-secondary">
                        {sch.district}, {sch.regency}, {sch.province} • Kode Registrasi: <span className="font-mono font-semibold">{sch.code}</span>
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedSchool(sch)}
                        className="text-xs h-8"
                      >
                        Detail Berkas
                      </Button>

                      {sch.verification_status !== "verified" && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleUpdateStatus(sch.id, "verified")}
                          className="text-xs h-8 bg-success hover:bg-success/90 font-semibold"
                        >
                          <Check className="w-3.5 h-3.5 mr-1" /> Setujui &amp; Verifikasi
                        </Button>
                      )}

                      {sch.verification_status === "pending_verification" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(sch.id, "rejected")}
                          className="text-xs h-8 text-error border-red-200 hover:bg-red-50 font-medium"
                        >
                          <X className="w-3.5 h-3.5 mr-1" /> Tolak Permohonan
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Details strip */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-border/70 text-xs">
                    <div>
                      <span className="text-muted block text-[11px]">Koordinator / Pengusul:</span>
                      <span className="font-semibold text-foreground">
                        {coordinator ? coordinator.name : "Pendidik Terdaftar"}
                      </span>
                      <span className="text-[11px] text-secondary block font-mono">
                        {coordinator?.email || "-"}
                      </span>
                    </div>

                    <div>
                      <span className="text-muted block text-[11px]">Tanggal Pengajuan:</span>
                      <span className="font-semibold text-foreground">
                        {coordinator?.submitted_at || new Date(sch.created_at).toLocaleDateString("id-ID")}
                      </span>
                      <span className="text-[11px] text-secondary block">
                        Status Lampiran: SK Operasional Lengkap
                      </span>
                    </div>

                    <div>
                      <span className="text-muted block text-[11px]">Karakteristik Konteks Wilayah:</span>
                      <p className="text-secondary line-clamp-1 font-normal">
                        {sch.local_characteristics || sch.description || "Belum ada catatan karakteristik."}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* DETAIL DOSSIER MODAL */}
      {selectedSchool && (
        <div className="fixed inset-0 bg-[#202638]/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-xl max-w-2xl w-full p-6 shadow-xl border border-border-strong space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-foreground">{selectedSchool.name}</h3>
                  <Badge variant="primary">{selectedSchool.educational_level}</Badge>
                </div>
                <p className="text-xs text-secondary mt-0.5">
                  Dossier Verifikasi Permohonan Registrasi Ruang Kerja Multi-Tenant
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSchool(null)}
                className="text-secondary hover:text-foreground p-1 rounded-lg hover:bg-workspace"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-surface-subtle border border-border">
                <div>
                  <span className="text-muted block text-[11px]">Nomor Pokok Sekolah Nasional (NPSN):</span>
                  <span className="font-mono font-bold text-foreground text-sm">
                    {selectedSchool.npsn || "Belum dicantumkan"}
                  </span>
                </div>
                <div>
                  <span className="text-muted block text-[11px]">Kode Instansi:</span>
                  <span className="font-mono font-bold text-primary text-sm">{selectedSchool.code}</span>
                </div>
                <div>
                  <span className="text-muted block text-[11px]">Status Verifikasi Saat Ini:</span>
                  <Badge
                    variant={
                      selectedSchool.verification_status === "verified"
                        ? "success"
                        : selectedSchool.verification_status === "rejected"
                        ? "error"
                        : "warning"
                    }
                  >
                    {selectedSchool.verification_status === "verified"
                      ? "Terverifikasi"
                      : selectedSchool.verification_status === "rejected"
                      ? "Ditolak / Revisi"
                      : "Menunggu Verifikasi"}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted block text-[11px]">Tanggal Permohonan:</span>
                  <span className="font-semibold text-foreground">
                    {new Date(selectedSchool.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <div>
                <span className="font-bold text-foreground block mb-1">Alamat Geografis Sekolah:</span>
                <p className="text-secondary p-3 rounded-lg bg-surface-subtle border border-border">
                  {selectedSchool.address || "Alamat belum diatur"} • Kel. {selectedSchool.village || "-"}, Kec. {selectedSchool.district}, {selectedSchool.regency}, {selectedSchool.province}
                </p>
              </div>

              <div>
                <span className="font-bold text-foreground block mb-1">Karakteristik &amp; Kearifan Lokal Wilayah:</span>
                <p className="text-secondary p-3 rounded-lg bg-surface-subtle border border-border leading-relaxed">
                  {selectedSchool.local_characteristics || "Belum ada deskripsi karakteristik lingkungan lokal."}
                </p>
              </div>

              {selectedSchool.created_by && COORDINATOR_LOOKUP[selectedSchool.created_by] && (
                <div>
                  <span className="font-bold text-foreground block mb-1">Pendidik Pengusul / Koordinator:</span>
                  <div className="p-3 rounded-lg bg-surface-subtle border border-border space-y-1">
                    <p className="font-semibold text-foreground">
                      {COORDINATOR_LOOKUP[selectedSchool.created_by].name} (
                      {COORDINATOR_LOOKUP[selectedSchool.created_by].role})
                    </p>
                    <p className="text-secondary font-mono text-[11px]">
                      Email: {COORDINATOR_LOOKUP[selectedSchool.created_by].email} • Kontak:{" "}
                      {COORDINATOR_LOOKUP[selectedSchool.created_by].phone}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedSchool(null)}
                className="text-xs"
              >
                Tutup
              </Button>

              <div className="flex gap-2">
                {selectedSchool.verification_status !== "rejected" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleUpdateStatus(selectedSchool.id, "rejected");
                      setSelectedSchool(null);
                    }}
                    className="text-xs text-error border-red-200 hover:bg-red-50"
                  >
                    Tolak / Minta Revisi
                  </Button>
                )}

                {selectedSchool.verification_status !== "verified" && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      handleUpdateStatus(selectedSchool.id, "verified");
                      setSelectedSchool(null);
                    }}
                    className="text-xs bg-success hover:bg-success/90 font-semibold"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" /> Setujui &amp; Verifikasi Instansi
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
