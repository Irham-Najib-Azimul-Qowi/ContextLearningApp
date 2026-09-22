"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  School as SchoolIcon,
  Search,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { repository } from "@/lib/db/repository";
import { School, SchoolStatus } from "@/lib/db/types";

export default function AdminSchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const refresh = useCallback(() => {
    setSchools([...repository.getSchools()]);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleVerify = (schoolId: string, status: "verified" | "rejected") => {
    repository.updateSchoolVerification(schoolId, status, "admin-platform-01");
    refresh();
  };

  const handleToggleStatus = (school: School) => {
    const nextStatus: SchoolStatus = school.status === "active" ? "suspended" : "active";
    repository.updateSchoolStatus(school.id, nextStatus, "admin-platform-01");
    refresh();
  };

  const filtered = schools.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.regency.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === "ALL" || s.educational_level === levelFilter;
    const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;
    return matchesSearch && matchesLevel && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface p-5 rounded-xl border border-border shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <SchoolIcon className="w-5 h-5 text-primary" />
            Manajemen Sekolah &amp; Tenant Instansi
          </h1>
          <p className="text-xs text-foreground-secondary mt-0.5">
            Daftar seluruh instansi pendidikan terdaftar beserta status verifikasi dan isolasi data.
          </p>
        </div>

        <button
          type="button"
          onClick={refresh}
          className="text-xs text-foreground-secondary hover:text-foreground flex items-center gap-1.5 self-start sm:self-center px-3 py-1.5 rounded-lg border border-border bg-surface-secondary"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Segarkan Data
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface p-4 rounded-xl border border-border shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-foreground-secondary absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama sekolah, kabupaten, atau kode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-border bg-surface-secondary text-foreground focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="text-xs px-3 py-2 rounded-lg border border-border bg-surface-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="ALL">Semua Jenjang</option>
          <option value="SD">SD</option>
          <option value="SMP">SMP</option>
          <option value="SMA">SMA</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs px-3 py-2 rounded-lg border border-border bg-surface-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="ALL">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="suspended">Ditangguhkan</option>
        </select>
      </div>

      {/* Schools Table */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-secondary border-b border-border text-foreground-secondary font-semibold">
              <tr>
                <th className="py-3 px-4">Nama Sekolah &amp; Kode</th>
                <th className="py-3 px-4">Jenjang</th>
                <th className="py-3 px-4">Wilayah Administratif</th>
                <th className="py-3 px-4">Verifikasi</th>
                <th className="py-3 px-4">Status Tenant</th>
                <th className="py-3 px-4 text-right">Tindakan Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((sch) => (
                <tr key={sch.id} className="hover:bg-surface-secondary transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-bold text-foreground block">{sch.name}</span>
                    <span className="font-mono text-[10px] text-primary font-semibold">{sch.code}</span>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="secondary">
                      {sch.educational_level}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-foreground-secondary">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-foreground-secondary" />
                      <span>{sch.district}, {sch.regency}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {sch.verification_status === "verified" ? (
                      <Badge variant="success">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Terverifikasi
                      </Badge>
                    ) : sch.verification_status === "pending_verification" ? (
                      <Badge variant="warning">
                        <AlertTriangle className="w-3 h-3 mr-1" /> Menunggu
                      </Badge>
                    ) : (
                      <Badge variant="error">
                        Ditolak
                      </Badge>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[11px] font-semibold capitalize ${
                        sch.status === "active" ? "text-success" : "text-error"
                      }`}
                    >
                      {sch.status === "active" ? "Aktif" : "Ditangguhkan"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    {sch.verification_status === "pending_verification" && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleVerify(sch.id, "verified")}
                        className="h-6 text-[10px] bg-success hover:bg-success/90 px-2 font-semibold"
                      >
                        Setujui
                      </Button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(sch)}
                      className={`text-xs hover:underline font-medium ${
                        sch.status === "active" ? "text-error" : "text-success"
                      }`}
                    >
                      {sch.status === "active" ? "Tangguhkan" : "Aktifkan"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
