"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  RefreshCw,
  MoreVertical,
  Plus,
  ShieldCheck,
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
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New user form state
  const [newFullName, setNewFullName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("TEACHER");
  const [newSchoolName, setNewSchoolName] = useState("");
  const [submittingAdd, setSubmittingAdd] = useState(false);

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
        reason: actionReason || "Administrative update by Developer Admin",
      }),
    });

    if (res.ok) {
      setActionMessage(`Status pengguna '${user.full_name}' berhasil diperbarui.`);
      setSelectedUser(null);
      setActionReason("");
      fetchUsers();
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim() || !newEmail.trim()) return;

    setSubmittingAdd(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: newFullName.trim(),
          email: newEmail.trim().toLowerCase(),
          role: newRole,
          schoolName: newSchoolName.trim() || "Workspace Mandiri",
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setNewFullName("");
        setNewEmail("");
        setNewSchoolName("");
        setActionMessage(`Pengguna '${newFullName}' berhasil ditambahkan.`);
        fetchUsers();
        setTimeout(() => setActionMessage(null), 3000);
      }
    } finally {
      setSubmittingAdd(false);
    }
  };

  return (
    <AdminWorkspaceShell activeGroupId="users">
      <div className="space-y-5 max-w-7xl mx-auto pb-12 font-sans">
        {/* ===================================================================
            HEADER: Users, [+ Tambah], [🔍 Cari user...] [Role ▾] (Sesuai Aturan 16)
            =================================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#E9E5E8]">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-[#23212A] tracking-tight">
              Users
            </h1>
            <span className="text-xs font-bold text-[#51465B] bg-white border border-[#E9E5E8] px-3 py-1 rounded-full shadow-2xs">
              {users.length} Akun
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-2xl bg-[#51465B] hover:bg-[#3D3445] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all active:scale-95 whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#FFD36D]" />
              <span>Tambah User</span>
            </button>
          </div>
        </div>

        {/* Search & Role Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756F7A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
              placeholder="Cari nama atau email..."
              className="w-full pl-9 pr-4 py-2 rounded-full bg-white border border-[#E9E5E8] text-xs font-medium text-[#23212A] focus:outline-none focus:border-[#51465B] shadow-2xs transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 rounded-full bg-white border border-[#E9E5E8] text-xs font-bold text-[#51465B] focus:outline-none focus:border-[#51465B] cursor-pointer shadow-2xs"
            >
              <option value="ALL">Semua Role</option>
              <option value="TEACHER">Guru / Pendidik</option>
              <option value="STUDENT">Data Historis</option>
            </select>
          </div>
        </div>

        {/* Feedback Message */}
        {actionMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Users Table / List */}
        <div className="bg-white rounded-3xl border border-[#E9E5E8] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[550px]">
              <thead>
                <tr className="border-b border-[#E9E5E8] text-[#756F7A] uppercase text-[10px] tracking-wider font-bold bg-[#FAF7F3]/50">
                  <th className="py-3 px-4">Nama</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9E5E8]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#756F7A]">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#51465B]" />
                      Memuat daftar user...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#756F7A]">
                      Tidak ada user yang cocok.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-[#FAF7F3]/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#23212A]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#51465B] text-[#FFD36D] font-black text-[10px] flex items-center justify-center shrink-0">
                            {u.full_name?.substring(0, 2).toUpperCase() || "US"}
                          </div>
                          <span>{u.full_name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[#756F7A]">
                        {u.email}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                            u.role === "TEACHER"
                              ? "bg-[#51465B] text-white"
                              : "bg-[#FFD36D]/30 text-[#51465B] border border-[#FFD36D]"
                          }`}
                        >
                          {u.role === "TEACHER" ? "Guru" : "Mandiri"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>{u.is_active ? "Aktif" : "Nonaktif"}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedUser(u)}
                          className="px-3 py-1.5 rounded-xl border border-[#E9E5E8] hover:border-[#51465B] text-[11px] font-bold text-[#51465B] hover:bg-[#FAF7F3] transition-colors whitespace-nowrap cursor-pointer"
                        >
                          Kelola
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Kelola Akses User */}
        {selectedUser && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#E9E5E8] space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-[#E9E5E8]">
                <h3 className="font-black text-sm text-[#23212A]">Kelola Akses User</h3>
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="text-xs font-bold text-[#756F7A] hover:text-[#23212A] cursor-pointer"
                >
                  Tutup
                </button>
              </div>

              <div>
                <span className="text-xs font-black text-[#23212A] block">{selectedUser.full_name}</span>
                <span className="text-[11px] text-[#756F7A] font-mono block">{selectedUser.email}</span>
                <span className="text-[10px] text-[#51465B] font-bold mt-1 block">
                  Status Saat Ini: {selectedUser.is_active ? "Aktif" : "Nonaktif"}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E9E5E8]">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 rounded-xl border border-[#E9E5E8] text-xs font-bold text-[#756F7A] hover:bg-slate-50 transition-colors whitespace-nowrap cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleStatus(selectedUser)}
                  className={`px-4 py-2 rounded-xl text-xs font-black shadow-xs active:scale-95 transition-all whitespace-nowrap cursor-pointer ${
                    selectedUser.is_active
                      ? "bg-rose-600 hover:bg-rose-700 text-white"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
                >
                  {selectedUser.is_active ? "Nonaktifkan" : "Aktifkan"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Tambah User */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E9E5E8] space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-[#E9E5E8]">
                <h3 className="font-black text-sm text-[#23212A]">Tambah User Baru</h3>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="text-xs font-bold text-[#756F7A] hover:text-[#23212A] cursor-pointer"
                >
                  Tutup
                </button>
              </div>

              <form onSubmit={handleAddUser} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#23212A] mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    placeholder="Contoh: Budi Santoso, S.Pd."
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E9E5E8] text-xs font-semibold text-[#23212A] focus:outline-none focus:border-[#51465B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#23212A] mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="budi@sekolah.id"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E9E5E8] text-xs font-semibold text-[#23212A] focus:outline-none focus:border-[#51465B]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#23212A] mb-1">Role</label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E9E5E8] text-xs font-bold text-[#23212A] focus:outline-none focus:border-[#51465B]"
                    >
                      <option value="TEACHER">Guru / Pendidik</option>
                      <option value="STUDENT">Data Historis</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#23212A] mb-1">Sekolah / Afiliasi</label>
                    <input
                      type="text"
                      value={newSchoolName}
                      onChange={(e) => setNewSchoolName(e.target.value)}
                      placeholder="SD Negeri 1..."
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E9E5E8] text-xs font-semibold text-[#23212A] focus:outline-none focus:border-[#51465B]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E9E5E8]">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl border border-[#E9E5E8] text-xs font-bold text-[#756F7A] hover:bg-slate-50 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAdd}
                    className="px-5 py-2 rounded-xl bg-[#51465B] hover:bg-[#3D3445] text-white text-xs font-bold shadow-xs active:scale-95 transition-all whitespace-nowrap cursor-pointer"
                  >
                    {submittingAdd ? "Menyimpan..." : "Simpan User"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminWorkspaceShell>
  );
}
