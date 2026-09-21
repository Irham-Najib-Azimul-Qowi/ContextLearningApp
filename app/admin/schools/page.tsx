"use client";

import React, { useState, useEffect } from "react";
import {
  School as SchoolIcon,
  Search,
  CheckCircle2,
  AlertTriangle,
  Ban,
  RefreshCw,
  MapPin,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { repository } from "@/lib/db/repository";
import { School, EducationLevel, SchoolStatus } from "@/lib/db/types";

export default function AdminSchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    refresh();
  }, []);

  const refresh = () => {
    setSchools([...repository.getSchools()]);
  };

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
      <div className="bg-white p-5 rounded-xl border border-[#DCE0EA] shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#252B3A] tracking-tight flex items-center gap-2">
            <SchoolIcon className="w-5 h-5 text-[#5865D8]" />
            Manajemen Sekolah & Tenant Instansi
          </h1>
          <p className="text-xs text-[#697386] mt-0.5">
            Daftar seluruh instansi pendidikan terdaftar (SD, SMP, SMA) beserta status verifikasi dan isolasi data.
          </p>
        </div>

        <button
          type="button"
          onClick={refresh}
          className="text-xs text-[#697386] hover:text-[#252B3A] flex items-center gap-1 self-start sm:self-center"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Segarkan Data
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#DCE0EA] flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#697386] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama sekolah, kabupaten, atau kode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-[#DCE0EA] bg-[#F7F8FC] focus:bg-white focus:outline-none"
          />
        </div>

        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="text-xs px-3 py-2 rounded-lg border border-[#DCE0EA] bg-[#F7F8FC] text-[#252B3A]"
        >
          <option value="ALL">Semua Jenjang</option>
          <option value="SD">SD</option>
          <option value="SMP">SMP</option>
          <option value="SMA">SMA</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs px-3 py-2 rounded-lg border border-[#DCE0EA] bg-[#F7F8FC] text-[#252B3A]"
        >
          <option value="ALL">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="suspended">Ditangguhkan</option>
        </select>
      </div>

      {/* Schools Table */}
      <div className="bg-white rounded-xl border border-[#DCE0EA] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F8FC] border-b border-[#DCE0EA] text-[#697386] font-semibold">
              <tr>
                <th className="py-3 px-4">Nama Sekolah & Kode</th>
                <th className="py-3 px-4">Jenjang</th>
                <th className="py-3 px-4">Wilayah Administratif</th>
                <th className="py-3 px-4">Verifikasi</th>
                <th className="py-3 px-4">Status Tenant</th>
                <th className="py-3 px-4 text-right">Tindakan Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDEFF5]">
              {filtered.map((sch) => (
                <tr key={sch.id} className="hover:bg-[#F7F8FC] transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-bold text-[#252B3A] block">{sch.name}</span>
                    <span className="font-mono text-[10px] text-[#5865D8] font-semibold">{sch.code}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold px-2 py-0.5 rounded bg-blue-100 text-[#5865D8] text-[10px]">
                      {sch.educational_level}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#697386]">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#697386]" />
                      <span>{sch.district}, {sch.regency}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {sch.verification_status === "verified" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#238B68]">
                        <CheckCircle2 className="w-3 h-3" /> Terverifikasi
                      </span>
                    ) : sch.verification_status === "pending_verification" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-[#C68A28]">
                        <AlertTriangle className="w-3 h-3" /> Menunggu
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-[#C94F58]">
                        Ditolak
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-semibold capitalize ${
                        sch.status === "active" ? "text-[#238B68]" : "text-[#C94F58]"
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
                        className="h-6 text-[10px] bg-[#238B68] hover:bg-[#1E7758] px-2"
                      >
                        Setujui
                      </Button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(sch)}
                      className={`text-xs hover:underline font-medium ${
                        sch.status === "active" ? "text-red-600" : "text-[#238B68]"
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
