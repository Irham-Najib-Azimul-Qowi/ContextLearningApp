"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  MapPin,
  Users,
  CheckCircle2,
  RefreshCw,
  Search,
  School as SchoolIcon,
  ShieldCheck,
} from "lucide-react";
import { AdminWorkspaceShell } from "@/components/layout/admin-workspace-shell";

export default function AdminSchoolsPage() {
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchSchools = () => {
    setLoading(true);
    fetch("/api/admin/schools")
      .then((res) => res.json())
      .then((data) => {
        if (data?.schools) setSchools(data.schools);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const filtered = schools.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.region_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminWorkspaceShell activeGroupId="users">
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="clay-card p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#51465B] text-[#FFD36D] flex items-center justify-center font-bold shadow-[0_4px_12px_rgba(81,70,91,0.2)]">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-[#23212A] tracking-tight">
                  Manajemen Satuan Pendidikan &amp; Sekolah
                </h1>
                <p className="text-xs text-[#756F7A] mt-0.5">
                  Daftar sekolah terdaftar, verifikasi wilayah administratif, serta rekapitulasi kelas dan pendidik.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#51465B] bg-[#FAF7F3] border border-[#E9E5E8] px-4 py-2 rounded-full shadow-xs">
                {schools.length} Satuan Pendidikan Terdaftar
              </span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-[24px] border border-[#E9E5E8] p-4 shadow-[0_4px_16px_rgba(81,70,91,0.03)]">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756F7A]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama sekolah atau kabupaten/kota..."
              className="clay-input pl-10 pr-4 text-xs font-medium text-[#23212A]"
            />
          </div>
        </div>

        {/* Schools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {filtered.map((sch) => (
            <div
              key={sch.id}
              className="clay-card p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="p-1.5 rounded-xl bg-indigo-50 text-indigo-700">
                      <SchoolIcon className="w-4 h-4" />
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {sch.status}
                    </span>
                  </div>
                  <span className="text-xs text-[#756F7A] font-mono">{sch.region_id}</span>
                </div>

                <h3 className="text-base font-black text-[#23212A] mb-1">{sch.name}</h3>
                <div className="flex items-center gap-1.5 text-xs text-[#756F7A] mb-3">
                  <MapPin className="w-3.5 h-3.5 text-[#F47D83]" />
                  <span>{sch.region_name}</span>
                </div>

                <p className="text-[11px] text-[#756F7A] line-clamp-2 bg-[#FAF7F3] p-3 rounded-2xl border border-[#E9E5E8] mb-4">
                  {sch.address}
                </p>
              </div>

              <div className="pt-4 border-t border-[#E9E5E8] flex items-center justify-between text-xs text-[#756F7A]">
                <div>
                  <span className="font-bold text-[#23212A]">{sch.class_count}</span> Ruang Kelas
                </div>
                <div>
                  <span className="font-bold text-[#23212A]">{sch.teacher_count}</span> Pendidik
                </div>
                <div>
                  <span className="font-bold text-[#23212A]">{sch.student_count || 24}</span> Siswa Terlayani
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminWorkspaceShell>
  );
}
