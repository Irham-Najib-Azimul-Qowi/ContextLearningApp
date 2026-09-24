"use client";

import React, { useState, useEffect } from "react";
import { AdminWorkspaceShell } from "@/components/layout/admin-workspace-shell";
import {
  Shield,
  Key,
  Lock,
  User,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Clock,
  Layers,
  Sparkles,
} from "lucide-react";

export default function AdminProfilePage() {
  const [adminUser, setAdminUser] = useState<{
    id: string;
    username: string;
    full_name: string;
    role: string;
    permissions: string[];
    created_at?: string;
    last_login_at?: string;
  } | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.authenticated) {
          setAdminUser(data.admin);
        }
      })
      .catch(() => {});
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword.length < 8) {
      setMessage({ type: "error", text: "Kata sandi baru minimal 8 karakter." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Konfirmasi kata sandi baru tidak cocok." });
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/admin/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal mengubah kata sandi.");
      }

      setMessage({ type: "success", text: "Kata sandi berhasil diperbarui dengan hashing scrypt." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Terjadi kesalahan." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminWorkspaceShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E9E5E8]">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#51465B]/60 uppercase tracking-wider mb-1">
              <span>Keamanan Akun</span>
              <span>•</span>
              <span>Profil Pengembang</span>
            </div>
            <h1 className="text-2xl font-black text-[#51465B] flex items-center gap-2.5">
              <User className="w-6 h-6 text-[#FFD36D]" />
              Profil Admin & Kredensial Akses
            </h1>
            <p className="text-xs text-neutral-500 mt-1 max-w-2xl">
              Kelola informasi kredensial login admin, ganti kata sandi dengan pengamanan scrypt kdf dan review hak akses wewenang sistem.
            </p>
          </div>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition-all ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Profile Summary Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#E9E5E8] shadow-xs space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#51465B] text-[#FFD36D] font-black text-2xl flex items-center justify-center shadow-md">
                {adminUser?.username?.substring(0, 2).toUpperCase() || "AD"}
              </div>
              <div>
                <h2 className="text-base font-black text-[#51465B]">{adminUser?.full_name || "Admin DEPASKAN"}</h2>
                <span className="text-xs text-neutral-400 font-mono block">@{adminUser?.username}</span>
                <span className="mt-1 inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#FFD36D] text-[#51465B]">
                  {adminUser?.role || "SUPER_ADMIN"}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-[#E9E5E8] text-xs">
              <div className="flex justify-between items-center text-neutral-600">
                <span className="font-medium">User ID:</span>
                <span className="font-mono font-bold text-[#51465B]">{adminUser?.id || "adm-irham-01"}</span>
              </div>

              <div className="flex justify-between items-center text-neutral-600">
                <span className="font-medium">Tipe Sesi:</span>
                <span className="font-mono font-bold text-emerald-600">HttpOnly pahami_admin_session</span>
              </div>

              <div className="flex justify-between items-center text-neutral-600">
                <span className="font-medium">Masa Berlaku Sesi:</span>
                <span className="font-mono text-[#51465B]">8 Jam (Auto Revoke)</span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E9E5E8]">
              <span className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider block mb-2">
                Hak Akses & Permissions:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(adminUser?.permissions || ["*"]).map((p) => (
                  <span
                    key={p}
                    className="px-2 py-0.5 rounded-md bg-[#FAF7F3] text-[#51465B] border border-[#E9E5E8] font-mono text-[10px] font-bold"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Change Password Form */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-[#E9E5E8] shadow-xs space-y-5">
            <div className="pb-4 border-b border-[#E9E5E8]">
              <h2 className="text-base font-black text-[#51465B] flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#51465B]" />
                Perbarui Kata Sandi Admin
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Kata sandi disimpan menggunakan memory-hard key derivation <code className="text-[#51465B] font-mono">scrypt</code> (N=16384, r=8, p=1).
              </p>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs">
              {/* Current Password */}
              <div className="space-y-1.5">
                <label className="font-bold text-[#51465B] block">Kata Sandi Saat Ini</label>
                <div className="relative">
                  <input
                    type={showCurrent ? "text" : "password"}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Masukkan kata sandi saat ini..."
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[#E9E5E8] bg-[#FAF7F3] focus:bg-white text-xs font-medium text-[#51465B] focus:outline-none focus:ring-2 focus:ring-[#51465B]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-[#51465B] block">Kata Sandi Baru (Min. 8 Karakter)</label>
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Masukkan kata sandi baru..."
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[#E9E5E8] bg-[#FAF7F3] focus:bg-white text-xs font-medium text-[#51465B] focus:outline-none focus:ring-2 focus:ring-[#51465B]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-[#51465B] block">Konfirmasi Kata Sandi Baru</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi baru..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E5E8] bg-[#FAF7F3] focus:bg-white text-xs font-medium text-[#51465B] focus:outline-none focus:ring-2 focus:ring-[#51465B]"
                  />
                </div>
              </div>

              {/* Security info banner */}
              <div className="p-4 rounded-2xl bg-[#FAF7F3] border border-[#E9E5E8] text-[11px] text-neutral-600 space-y-1">
                <div className="font-bold text-[#51465B] flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#51465B]" />
                  Proteksi Keamanan Berlapis:
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-neutral-500 pl-1">
                  <li>Tahan serangan brute-force dengan proteksi lockout 15 menit setelah 5x gagal.</li>
                  <li>Perbandingan hash konstan <code className="font-mono text-[#51465B]">timingSafeEqual</code> untuk mencegah timing attack.</li>
                  <li>Kredensial disimpan terpisah dari tabel auth siswa/guru.</li>
                </ul>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-[#51465B] hover:bg-[#3D3445] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5 text-[#FFD36D]" />}
                  <span>Perbarui Kata Sandi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminWorkspaceShell>
  );
}
