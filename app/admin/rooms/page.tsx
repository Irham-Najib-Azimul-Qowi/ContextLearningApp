"use client";

import React, { useState, useEffect } from "react";
import {
  DoorOpen,
  Search,
  Filter,
  Users,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { AdminWorkspaceShell } from "@/components/layout/admin-workspace-shell";

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalRooms: 0,
    activeRooms: 0,
    totalVisitors: 0,
    totalAccess: 0,
  });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null);

  const fetchRooms = (q?: string, status?: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status && status !== "ALL") params.set("status", status);

    fetch(`/api/admin/rooms?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.success) {
          setRooms(data.rooms || []);
          setStats(data.stats || { totalRooms: 0, activeRooms: 0, totalVisitors: 0, totalAccess: 0 });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleSearch = () => {
    fetchRooms(search, statusFilter);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleStatusChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    fetchRooms(search, newStatus);
  };

  return (
    <AdminWorkspaceShell activeGroupId="rooms">
      <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E9E5E8]">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#23212A] tracking-tight">
              Monitoring Room
            </h1>
            <p className="text-xs text-[#756F7A] mt-0.5">
              Pantau seluruh learning room yang dibuat guru dan diakses siswa.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-white border border-[#E9E5E8] shadow-xs">
            <div className="text-[10px] uppercase tracking-wider font-black text-[#756F7A]">Total Room</div>
            <div className="text-2xl font-black text-[#23212A] mt-1">{stats.totalRooms}</div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-[#E9E5E8] shadow-xs">
            <div className="text-[10px] uppercase tracking-wider font-black text-[#756F7A]">Aktif</div>
            <div className="text-2xl font-black text-emerald-700 mt-1">{stats.activeRooms}</div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-[#E9E5E8] shadow-xs">
            <div className="text-[10px] uppercase tracking-wider font-black text-[#756F7A]">Total Pengunjung</div>
            <div className="text-2xl font-black text-[#51465B] mt-1">{stats.totalVisitors}</div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-[#E9E5E8] shadow-xs">
            <div className="text-[10px] uppercase tracking-wider font-black text-[#756F7A]">Total Akses</div>
            <div className="text-2xl font-black text-amber-700 mt-1">{stats.totalAccess}</div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-[#FAF7F3] border border-[#E9E5E8] rounded-2xl p-1">
            {["ALL", "ACTIVE", "INACTIVE"].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleStatusChange(s)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === s
                    ? "bg-[#51465B] text-white shadow-md"
                    : "text-[#756F7A] hover:text-[#23212A]"
                }`}
              >
                {s === "ALL" ? "Semua" : s === "ACTIVE" ? "Aktif" : "Nonaktif"}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#756F7A]" />
              <input
                type="text"
                placeholder="Cari kode room, judul, sekolah..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-[#E9E5E8] text-xs font-medium text-[#23212A] placeholder:text-[#B8B2BD] focus:outline-none focus:border-[#51465B] transition-colors"
              />
            </div>
            <button
              type="button"
              onClick={handleSearch}
              className="px-3.5 py-2.5 rounded-xl bg-[#51465B] text-white text-xs font-bold hover:bg-[#3E3547] transition-colors"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Rooms Table */}
        <div className="bg-white rounded-3xl border border-[#E9E5E8] shadow-xs overflow-hidden">
          {loading ? (
            <div className="text-center py-16 text-xs text-[#756F7A] animate-pulse font-bold">
              Memuat data room dari seluruh sekolah...
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-16">
              <DoorOpen className="w-10 h-10 text-[#E9E5E8] mx-auto mb-3" />
              <p className="text-xs text-[#756F7A] font-bold">
                Belum ada learning room yang dibuat.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[800px]">
                <thead>
                  <tr className="border-b border-[#E9E5E8] bg-[#FAF7F3] text-[10px] uppercase tracking-wider font-black text-[#756F7A]">
                    <th className="py-3 px-4">Kode</th>
                    <th className="py-3 px-4">Judul Room</th>
                    <th className="py-3 px-4">Tipe</th>
                    <th className="py-3 px-4">Sekolah</th>
                    <th className="py-3 px-4">Guru</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Pengunjung</th>
                    <th className="py-3 px-4">Akses</th>
                    <th className="py-3 px-4">Dibuat</th>
                    <th className="py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9E5E8]">
                  {rooms.map((r) => (
                    <React.Fragment key={r.id}>
                      <tr className="hover:bg-[#FAF7F3]/70 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-mono text-[11px] font-black text-[#51465B] bg-[#51465B]/10 px-2 py-0.5 rounded-lg">
                            {r.code}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#23212A] max-w-[180px] truncate">
                            {r.title}
                          </div>
                          {r.description && (
                            <div className="text-[10px] text-[#B8B2BD] mt-0.5 max-w-[180px] truncate">
                              {r.description}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold">
                            {r.resource_type === "material" ? (
                              <>
                                <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Materi</span>
                              </>
                            ) : (
                              <>
                                <FileText className="w-3.5 h-3.5 text-amber-600" />
                                <span>Soal</span>
                              </>
                            )}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-[#23212A] text-[11px]">{r.school_name}</div>
                          <div className="text-[10px] text-[#B8B2BD]">{r.region_name}</div>
                        </td>
                        <td className="py-3 px-4 text-[#756F7A] text-[11px]">{r.teacher_name}</td>
                        <td className="py-3 px-4">
                          {r.is_active ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3" />
                              Aktif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-gray-100 text-gray-600">
                              <XCircle className="w-3 h-3" />
                              Nonaktif
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 font-bold text-[#51465B]">
                            <Users className="w-3.5 h-3.5" />
                            {r.visitor_count}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 font-bold text-amber-700">
                            <Eye className="w-3.5 h-3.5" />
                            {r.access_count}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#756F7A] font-mono text-[10px] whitespace-nowrap">
                          {r.created_at
                            ? new Date(r.created_at).toLocaleDateString("id-ID", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "-"}
                        </td>
                        <td className="py-3 px-4">
                          {r.visitor_count > 0 && (
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedRoom(expandedRoom === r.id ? null : r.id)
                              }
                              className="p-1.5 rounded-lg bg-[#FAF7F3] hover:bg-[#E9E5E8] transition-colors"
                            >
                              {expandedRoom === r.id ? (
                                <ChevronUp className="w-3.5 h-3.5 text-[#51465B]" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-[#51465B]" />
                              )}
                            </button>
                          )}
                        </td>
                      </tr>

                      {/* Expanded Visitor Details */}
                      {expandedRoom === r.id && r.visitors && r.visitors.length > 0 && (
                        <tr>
                          <td colSpan={10} className="bg-[#FAF7F3] px-6 py-4">
                            <div className="text-[10px] uppercase tracking-wider font-black text-[#756F7A] mb-2">
                              Daftar Pengunjung ({r.visitors.length})
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              {r.visitors.map((v: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-[#E9E5E8]"
                                >
                                  <div>
                                    <div className="text-xs font-bold text-[#23212A]">
                                      {v.name}
                                    </div>
                                    <div className="text-[10px] text-[#756F7A]">
                                      {v.accessed_at
                                        ? new Date(v.accessed_at).toLocaleString("id-ID", {
                                            day: "2-digit",
                                            month: "short",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })
                                        : "-"}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    {v.score !== undefined && v.score !== null ? (
                                      <span className="text-xs font-black text-[#51465B]">
                                        {v.score}
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-[#B8B2BD]">—</span>
                                    )}
                                    {v.completed && (
                                      <CheckCircle2 className="w-3 h-3 text-emerald-500 inline ml-1" />
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
