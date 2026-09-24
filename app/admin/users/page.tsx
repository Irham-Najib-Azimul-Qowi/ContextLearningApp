"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  School,
  Lock,
  RefreshCw,
  ArrowRight,
  MoreVertical,
  UserCheck,
} from "lucide-react";
import { AdminWorkspaceShell } from "@/components/layout/admin-workspace-shell";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [actionReason, setActionReason] = useState("");
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchUsers = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (roleFilter !== "ALL") params.set("role", roleFilter);
    if (searchQuery) params.set("q", searchQuery);

    fetch(`/api/admin/users?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.users) {
          setUsers(data.users);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleToggleStatus = async (user: any) => {
    const newAction = user.is_active ? "DEACTIVATE" : "ACTIVATE";
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        action: newAction,
        reason: actionReason || "Administrative action by Developer Admin",
      }),
    });

    if (res.ok) {
      setActionMessage(`Pengguna '${user.full_name}' berhasil diperbarui statusnya.`);
      setSelectedUser(null);
      setActionReason("");
      fetchUsers();
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  return (
    <AdminWorkspaceShell activeGroupId="users">
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="bg-white rounded-[28px] sm:rounded-[36px] border border-[#E9E5E8] p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#51465B] text-[#FFD36D] flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-[#23212A] tracking-tight">
                  Manajemen Pengguna Aplikasi (Guru & Murid)
                </h1>
                <p className="text-xs text-[#756F7A]">
                  Pantau akun terdaftar, keanggotaan satuan pendidikan, dan kelola status akses pengguna.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#51465B] bg-[#FAF7F3] border border-[#E9E5E8] px-3.5 py-1.5 rounded-full">
                Total Akun Terkelola: {users.length}
              </span>
            </div>
          </div>
        </div>

        {/* Action message */}
        {actionMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-[24px] border border-[#E9E5E8] p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756F7A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
              placeholder="Cari nama, email, atau sekolah..."
              className="w-full pl-10 pr-4 py-2 bg-[#FAF7F3] border border-[#E9E5E8] rounded-xl text-xs text-[#23212A] font-medium focus:outline-none focus:ring-2 focus:ring-[#51465B]/20"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {["ALL", "TEACHER", "STUDENT"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(r)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  roleFilter === r
                    ? "bg-[#51465B] text-white shadow-xs"
                    : "bg-[#FAF7F3] text-[#756F7A] border border-[#E9E5E8] hover:bg-slate-100"
                }`}
              >
                {r === "ALL" ? "Semua Peran" : r === "TEACHER" ? "Pendidik / Guru" : "Siswa SD"}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-[28px] sm:rounded-[36px] border border-[#E9E5E8] p-6 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E9E5E8] text-[#756F7A] uppercase text-[10px] tracking-wider">
                  <th className="pb-3 font-bold">Identitas Pengguna</th>
                  <th className="pb-3 font-bold">Peran (Role)</th>
                  <th className="pb-3 font-bold">Sekolah Terafiliasi</th>
                  <th className="pb-3 font-bold">Wilayah</th>
                  <th className="pb-3 font-bold">Status</th>
                  <th className="pb-3 font-bold text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9E5E8]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#756F7A]">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#51465B]" />
                      Memuat daftar pengguna...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#756F7A]">
                      Tidak ada pengguna yang cocok dengan kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-[#FAF7F3]/60 transition-colors">
                      <td className="py-3.5">
                        <div className="font-extrabold text-[#23212A]">{u.full_name}</div>
                        <div className="text-[11px] text-[#756F7A] font-mono">{u.email}</div>
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                            u.role === "TEACHER"
                              ? "bg-[#51465B] text-white"
                              : "bg-[#FFD36D] text-[#23212A]"
                          }`}
                        >
                          {u.role === "TEACHER" ? "Pendidik (Guru)" : "Murid Kelas 5 SD"}
                        </span>
                      </td>
                      <td className="py-3.5 font-medium text-[#23212A]">{u.school_name}</td>
                      <td className="py-3.5 text-[#756F7A]">{u.region_name}</td>
                      <td className="py-3.5">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Aktif</span>
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedUser(u)}
                          className="px-3 py-1.5 rounded-xl border border-[#E9E5E8] text-xs font-bold text-[#51465B] hover:bg-[#FAF7F3] transition-colors"
                        >
                          Kelola Akses
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Deactivate / Action Dialog */}
        {selectedUser && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-[32px] max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#E9E5E8] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E9E5E8]">
                <h3 className="font-black text-base text-[#23212A]">Kelola Akses Akun</h3>
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="text-xs font-bold text-[#756F7A] hover:text-[#23212A]"
                >
                  Tutup
                </button>
              </div>

              <div>
                <span className="text-xs font-extrabold text-[#23212A] block">{selectedUser.full_name}</span>
                <span className="text-[11px] text-[#756F7A] font-mono block">{selectedUser.email}</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#23212A] mb-1.5">
                  Alasan Penonaktifan / Penyesuaian Akses:
                </label>
                <textarea
                  rows={3}
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Contoh: Permintaan rotasi akun oleh sekolah atau pelanggaran penggunaan..."
                  className="w-full p-3 bg-[#FAF7F3] border border-[#E9E5E8] rounded-xl text-xs text-[#23212A] font-medium focus:outline-none focus:ring-2 focus:ring-[#51465B]/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 rounded-xl border border-[#E9E5E8] text-xs font-bold text-[#756F7A]"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleStatus(selectedUser)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs"
                >
                  Simpan Status Akses
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminWorkspaceShell>
  );
}
