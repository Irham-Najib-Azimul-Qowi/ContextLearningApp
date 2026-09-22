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
  Eye,
  GraduationCap,
  Building2,
  MapPin,
  Compass,
  Mail,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { repository } from "@/lib/db/repository";
import { School as SchoolType, SchoolVerificationStatus } from "@/lib/db/types";

// Educator coordinator contact persona lookup
const COORDINATOR_LOOKUP: Record<
  string,
  { name: string; email: string; phone: string; role: string; submitted_at: string }
> = {
  "teacher-demo-01": {
    name: "Ibu Nurhaliza, S.Pd.",
    email: "nurhaliza.guru@gmail.com",
    phone: "0812-3456-7890",
    role: "Koordinator Kurikulum",
    submitted_at: "01 Jan 2026",
  },
  "teacher-demo-02": {
    name: "Drs. H. Bambang Irawan, M.Pd.",
    email: "bambang.irawan@sman1samarinda.sch.id",
    phone: "0813-8877-6655",
    role: "Kepala Sekolah / Pengusul",
    submitted_at: "01 Feb 2026",
  },
  "teacher-demo-03": {
    name: "Ibu Sri Wahyuni, S.Pd., M.Si.",
    email: "sri.wahyuni@smpn4bpp.sch.id",
    phone: "0821-4455-6677",
    role: "Wakil Kepala Sekolah Kurikulum",
    submitted_at: "10 Feb 2026",
  },
  "teacher-demo-04": {
    name: "Bpk. Agus Setiawan, S.Pd.",
    email: "agus.setiawan@sdmino1.sch.id",
    phone: "0857-9988-1122",
    role: "Guru Penggerak & Operator",
    submitted_at: "14 Feb 2026",
  },
  "teacher-demo-05": {
    name: "Ibu Rina Maulida, S.Pd.",
    email: "rina.maulida@sman2tgr.sch.id",
    phone: "0812-7788-9900",
    role: "Koordinator Pembelajaran",
    submitted_at: "18 Feb 2026",
  },
  "teacher-demo-06": {
    name: "Bpk. Muhammad Ilham, S.Pd.",
    email: "m.ilham@sdn006smr.sch.id",
    phone: "0852-1133-5577",
    role: "Guru Kelas VI",
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
    const statusText =
      newStatus === "verified"
        ? "berhasil disetujui & diverifikasi"
        : "ditolak / diminta revisi";
    setActionSuccessMsg(`${schoolName} ${statusText}.`);
    setTimeout(() => setActionSuccessMsg(""), 3500);
  };

  const filteredSchools = useMemo(() => {
    return schools
      .filter((s) => {
        const matchesStatus = statusTab === "ALL" || s.verification_status === statusTab;
        const matchesLevel = levelFilter === "ALL" || s.educational_level === levelFilter;
        const coordinator = s.created_by ? COORDINATOR_LOOKUP[s.created_by] : null;
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          !q ||
          s.name.toLowerCase().includes(q) ||
          (s.npsn && s.npsn.includes(q)) ||
          s.regency.toLowerCase().includes(q) ||
          s.district.toLowerCase().includes(q) ||
          (coordinator && coordinator.name.toLowerCase().includes(q));

        return matchesStatus && matchesLevel && matchesSearch;
      })
      .sort((a, b) => {
        // Pending verification auto di paling atas
        const aPending = a.verification_status === "pending_verification";
        const bPending = b.verification_status === "pending_verification";
        if (aPending && !bPending) return -1;
        if (!aPending && bPending) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [schools, statusTab, levelFilter, searchQuery]);

  const pendingCount = useMemo(
    () => schools.filter((s) => s.verification_status === "pending_verification").length,
    [schools]
  );
  const verifiedCount = useMemo(
    () => schools.filter((s) => s.verification_status === "verified").length,
    [schools]
  );
  const rejectedCount = useMemo(
    () => schools.filter((s) => s.verification_status === "rejected").length,
    [schools]
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Ringkasan Operasional
          </h1>
          <p className="text-xs text-secondary mt-0.5">
            Kelola verifikasi instansi sekolah dan pemantauan platform Pahami.
          </p>
        </div>

        <Link href="/admin/schools">
          <Button variant="outline" size="sm" className="text-xs h-8">
            <Building2 className="w-3.5 h-3.5 mr-1.5 text-primary" /> Kelola Semua Sekolah
          </Button>
        </Link>
      </div>

      {actionSuccessMsg && (
        <div className="p-3 rounded-lg bg-success-subtle border border-emerald-200 text-xs text-success font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* KPI Cards - Themed & Colorful with High-Contrast Text & Prominent Icons */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Sekolah - Indigo Theme */}
        <div className="bg-gradient-to-br from-indigo-50/95 via-indigo-50/60 to-indigo-100/50 p-4 sm:p-5 rounded-xl border border-indigo-200/80 shadow-2xs transition-all hover:border-indigo-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-950 tracking-tight">Total Sekolah</span>
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white shadow-xs flex items-center justify-center shrink-0">
              <School className="w-6 h-6" />
            </div>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-indigo-950 font-mono tracking-tight">
            {stats.totalSchools}
          </p>
          <span className="text-xs text-indigo-700 font-semibold flex items-center gap-1.5 mt-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" /> {verifiedCount} Terverifikasi
          </span>
        </div>

        {/* Permohonan Baru - Amber Theme */}
        <div className="bg-gradient-to-br from-amber-50/95 via-amber-50/60 to-amber-100/60 p-4 sm:p-5 rounded-xl border border-amber-300/80 shadow-2xs transition-all hover:border-amber-400">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-950 tracking-tight">Permohonan Baru</span>
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-white shadow-xs flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-amber-950 font-mono tracking-tight">
            {pendingCount}
          </p>
          <span className="text-xs text-amber-900 font-semibold block mt-1">
            Menunggu Verifikasi Admin
          </span>
        </div>

        {/* Pendidik Terdaftar - Sky Blue Theme */}
        <div className="bg-gradient-to-br from-sky-50/95 via-sky-50/60 to-sky-100/50 p-4 sm:p-5 rounded-xl border border-sky-200/80 shadow-2xs transition-all hover:border-sky-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-950 tracking-tight">Pendidik Terdaftar</span>
            <div className="w-12 h-12 rounded-xl bg-sky-600 text-white shadow-xs flex items-center justify-center shrink-0">
              <UsersRound className="w-6 h-6" />
            </div>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-sky-950 font-mono tracking-tight">
            {stats.totalTeachers}
          </p>
          <span className="text-xs text-sky-800 font-semibold block mt-1">
            Koordinator Ruang Kerja
          </span>
        </div>

        {/* Siswa Terdaftar - Emerald Theme */}
        <div className="bg-gradient-to-br from-emerald-50/95 via-emerald-50/60 to-emerald-100/50 p-4 sm:p-5 rounded-xl border border-emerald-200/80 shadow-2xs transition-all hover:border-emerald-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-950 tracking-tight">Siswa Terdaftar</span>
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white shadow-xs flex items-center justify-center shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-emerald-950 font-mono tracking-tight">
            {stats.totalStudents}
          </p>
          <span className="text-xs text-emerald-800 font-semibold block mt-1">
            Akun Siswa Multi-Tenant
          </span>
        </div>
      </div>

      {/* Main School Applications Panel */}
      <div className="bg-surface rounded-xl border border-border shadow-2xs overflow-hidden">
        {/* Panel Header */}
        <div className="p-4 sm:p-5 border-b border-border flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-surface">
          <div>
            <h2 className="text-base font-bold text-foreground">Permohonan Verifikasi Sekolah</h2>
            <p className="text-xs text-secondary mt-0.5">
              Tinjau kelayakan administratif dan verifikasi instansi sekolah baru.
            </p>
          </div>

          {/* Status Tabs Segmented Control */}
          <div className="inline-flex items-center p-1 bg-workspace rounded-lg border border-border text-xs self-start md:self-auto">
            <button
              type="button"
              onClick={() => setStatusTab("pending_verification")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                statusTab === "pending_verification"
                  ? "bg-surface text-warning font-semibold shadow-2xs"
                  : "text-secondary hover:text-foreground"
              }`}
            >
              Menunggu ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusTab("verified")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                statusTab === "verified"
                  ? "bg-surface text-success font-semibold shadow-2xs"
                  : "text-secondary hover:text-foreground"
              }`}
            >
              Terverifikasi ({verifiedCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusTab("rejected")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                statusTab === "rejected"
                  ? "bg-surface text-error font-semibold shadow-2xs"
                  : "text-secondary hover:text-foreground"
              }`}
            >
              Ditolak ({rejectedCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusTab("ALL")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                statusTab === "ALL"
                  ? "bg-surface text-foreground font-semibold shadow-2xs"
                  : "text-secondary hover:text-foreground"
              }`}
            >
              Semua ({schools.length})
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="p-3.5 border-b border-border bg-surface-subtle/50 flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama sekolah, NPSN, atau kota..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-1.5 rounded-lg border border-border bg-surface text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
            />
          </div>

          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-lg border border-border bg-surface text-foreground focus:border-primary focus:outline-none shrink-0"
          >
            <option value="ALL">Semua Jenjang</option>
            <option value="SD">SD</option>
            <option value="SMP">SMP</option>
            <option value="SMA">SMA</option>
          </select>
        </div>

        {/* List / Table */}
        {filteredSchools.length === 0 ? (
          <div className="py-12 text-center space-y-1.5">
            <CheckCircle2 className="w-8 h-8 text-success mx-auto opacity-80" />
            <p className="text-xs font-semibold text-foreground">
              Tidak ada permohonan sekolah pada daftar ini
            </p>
            <p className="text-xs text-secondary">
              Semua permohonan telah selesai ditinjau atau tidak cocok dengan filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle border-b border-border text-secondary font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Instansi Sekolah</th>
                  <th className="py-2.5 px-4">Pengusul</th>
                  <th className="py-2.5 px-4">Tanggal</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredSchools.map((sch) => {
                  const coordinator = sch.created_by ? COORDINATOR_LOOKUP[sch.created_by] : null;

                  return (
                    <tr
                      key={sch.id}
                      className="hover:bg-surface-subtle/50 transition-colors group"
                    >
                      {/* School & Region Column */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground text-xs">
                            {sch.name}
                          </span>
                          <Badge variant="primary" className="text-[10px] px-1.5 py-0.5">
                            {sch.educational_level}
                          </Badge>
                        </div>
                        <div className="text-[11px] text-secondary mt-0.5 flex items-center gap-1.5">
                          <span>{sch.regency}, {sch.province}</span>
                          <span className="text-muted">•</span>
                          <span className="font-mono text-muted">NPSN {sch.npsn || "-"}</span>
                        </div>
                      </td>

                      {/* Coordinator Column */}
                      <td className="py-3 px-4">
                        <span className="font-medium text-foreground block">
                          {coordinator ? coordinator.name : "Guru Terdaftar"}
                        </span>
                        <span className="text-[11px] text-muted font-mono block">
                          {coordinator ? coordinator.email : "-"}
                        </span>
                      </td>

                      {/* Date Column */}
                      <td className="py-3 px-4 whitespace-nowrap text-secondary">
                        {coordinator?.submitted_at ||
                          new Date(sch.created_at).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                      </td>

                      {/* Status Column */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <Badge
                          variant={
                            sch.verification_status === "verified"
                              ? "success"
                              : sch.verification_status === "rejected"
                              ? "error"
                              : "warning"
                          }
                          className="text-[10px]"
                        >
                          {sch.verification_status === "verified"
                            ? "Terverifikasi"
                            : sch.verification_status === "rejected"
                            ? "Ditolak"
                            : "Menunggu"}
                        </Badge>
                      </td>

                      {/* Actions Column */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedSchool(sch)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border text-secondary hover:text-foreground hover:bg-workspace text-xs transition-colors"
                            title="Lihat Detail Berkas"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Detail</span>
                          </button>

                          {sch.verification_status !== "verified" && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(sch.id, "verified")}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#18764F] hover:bg-[#135E3E] text-white text-xs font-semibold transition-colors shadow-2xs"
                              title="Setujui Permohonan"
                            >
                              <Check className="w-4 h-4" />
                              <span>Setujui</span>
                            </button>
                          )}

                          {sch.verification_status === "pending_verification" && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(sch.id, "rejected")}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-red-200 text-[#B42336] hover:bg-red-50 text-xs transition-colors font-medium"
                              title="Tolak / Minta Revisi"
                            >
                              <X className="w-4 h-4" />
                              <span>Tolak</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAIL DOSSIER MODAL */}
      {selectedSchool && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                  <School className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                      {selectedSchool.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {selectedSchool.educational_level}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Berkas Permohonan Registrasi Instansi &amp; Ruang Kerja Guru
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSchool(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 text-xs">
              {/* Executive Metadata Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                <div>
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">NPSN</span>
                  <span className="font-mono font-bold text-slate-900 text-xs mt-1 block">
                    {selectedSchool.npsn || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Kode Instansi</span>
                  <span className="font-mono font-bold text-indigo-600 text-xs mt-1 block">
                    {selectedSchool.code}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Tanggal Masuk</span>
                  <span className="font-semibold text-slate-800 text-xs mt-1 block">
                    {new Date(selectedSchool.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Status</span>
                  <div className="mt-1">
                    <Badge
                      variant={
                        selectedSchool.verification_status === "verified"
                          ? "success"
                          : selectedSchool.verification_status === "rejected"
                          ? "error"
                          : "warning"
                      }
                      className="text-[10px]"
                    >
                      {selectedSchool.verification_status === "verified"
                        ? "Terverifikasi"
                        : selectedSchool.verification_status === "rejected"
                        ? "Ditolak"
                        : "Menunggu Verifikasi"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Alamat Geografis Sekolah */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>Alamat Geografis Sekolah</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50/60 border border-slate-200/80 text-xs space-y-1">
                  <p className="font-semibold text-slate-900 text-xs leading-snug">
                    {selectedSchool.address || "Alamat jalan belum diatur"}
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Kecamatan {selectedSchool.district} • {selectedSchool.regency} • {selectedSchool.province}
                  </p>
                </div>
              </div>

              {/* Karakteristik & Kearifan Lokal */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900">
                  <Compass className="w-3.5 h-3.5 text-amber-600" />
                  <span>Karakteristik &amp; Kearifan Lokal Wilayah</span>
                </div>
                <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 text-xs">
                  <p className="text-amber-950 leading-relaxed font-normal">
                    {selectedSchool.local_characteristics || selectedSchool.description || "Belum ada catatan konteks lingkungan lokal yang didaftarkan."}
                  </p>
                </div>
              </div>

              {/* Koordinator Pengusul */}
              {selectedSchool.created_by && COORDINATOR_LOOKUP[selectedSchool.created_by] && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <UsersRound className="w-3.5 h-3.5 text-slate-500" />
                    <span>Koordinator / Pendidik Pengusul</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50/60 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {COORDINATOR_LOOKUP[selectedSchool.created_by].name
                          .split(" ")
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <p className="font-bold text-xs text-slate-900">
                          {COORDINATOR_LOOKUP[selectedSchool.created_by].name}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {COORDINATOR_LOOKUP[selectedSchool.created_by].role}
                        </p>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-600 font-mono space-y-1 sm:text-right">
                      <div className="flex items-center gap-1.5 sm:justify-end">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{COORDINATOR_LOOKUP[selectedSchool.created_by].email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:justify-end">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{COORDINATOR_LOOKUP[selectedSchool.created_by].phone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3.5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedSchool(null)}
                className="h-9 px-4 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Tutup
              </button>

              <div className="flex items-center gap-2.5">
                {selectedSchool.verification_status !== "rejected" && (
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateStatus(selectedSchool.id, "rejected");
                      setSelectedSchool(null);
                    }}
                    className="h-9 px-3.5 rounded-lg border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 text-xs font-medium transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Tolak Permohonan</span>
                  </button>
                )}

                {selectedSchool.verification_status !== "verified" && (
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateStatus(selectedSchool.id, "verified");
                      setSelectedSchool(null);
                    }}
                    className="h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Setujui &amp; Verifikasi</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
