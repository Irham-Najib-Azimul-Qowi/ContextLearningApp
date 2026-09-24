"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Terminal,
} from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Autentikasi Admin gagal.");
        setLoading(false);
        return;
      }

      router.push("/admin/dashboard");
    } catch (err: any) {
      setErrorMessage(err?.message || "Terjadi kesalahan jaringan.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F3] flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-[#51465B]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed -bottom-40 -right-40 w-96 h-96 bg-[#FFD36D]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Split Container */}
      <div className="w-full max-w-4xl bg-white rounded-[32px] sm:rounded-[40px] shadow-2xl border border-[#E9E5E8] overflow-hidden flex flex-col md:flex-row relative z-10">
        {/* Left Panel: Dark Mauve Layer (#51465B) */}
        <div className="w-full md:w-5/12 bg-[#51465B] p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-60 h-60 bg-[#FFD36D]/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="w-14 h-14 rounded-2xl bg-[#FFD36D] text-[#51465B] flex items-center justify-center font-black shadow-lg mb-6">
              <Shield className="w-8 h-8" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#FFD36D] text-[11px] font-black uppercase tracking-wider mb-3">
              <span>Developer Area</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight text-white">
              Depaskan Control Center
            </h1>

            <p className="text-white/80 text-xs sm:text-sm mt-3 leading-relaxed">
              Pengelolaan dan pemeliharaan terpusat untuk platform pembelajaran kontekstual berbasis AI, multi-provider API failover, dan dataset wilayah Karesidenan Madiun & Kota Semarang.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 text-[11px] text-white/60">
            <span>Depaskan Architecture &bull; Hackathon IT Comp 2026</span>
          </div>
        </div>

        {/* Right Panel: White Authentication Form */}
        <div className="w-full md:w-7/12 p-8 sm:p-12 bg-white flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-[#23212A] tracking-tight">
              Masuk sebagai Admin
            </h2>
            <p className="text-xs text-[#756F7A] mt-1">
              Gunakan kredensial pengembang yang terdaftar untuk mengakses panel kontrol internal.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#23212A] mb-1.5">
                Username Administrator
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756F7A]" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="w-full pl-10 pr-4 py-3 bg-[#FAF7F3] border border-[#E9E5E8] rounded-xl text-xs font-semibold text-[#23212A] focus:outline-none focus:ring-2 focus:ring-[#51465B]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#23212A] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756F7A]" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full pl-10 pr-10 py-3 bg-[#FAF7F3] border border-[#E9E5E8] rounded-xl text-xs font-semibold text-[#23212A] focus:outline-none focus:ring-2 focus:ring-[#51465B]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#756F7A] hover:text-[#23212A]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-2xl bg-[#51465B] hover:bg-[#3E3547] text-white font-black text-xs shadow-md hover:shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? "Memverifikasi Kredensial..." : "Masuk ke Control Center"}</span>
              <ArrowRight className="w-4 h-4 text-[#FFD36D]" />
            </button>
          </form>

          {/* Quick Demo Helper Box */}
          <div className="mt-8 p-4 rounded-2xl bg-[#FAF7F3] border border-[#E9E5E8]">
            <div className="flex items-center gap-2 text-xs font-bold text-[#51465B] mb-1.5">
              <Terminal className="w-3.5 h-3.5 text-[#F47D83]" />
              <span>Kredensial Evaluator / Pengujian:</span>
            </div>
            <div className="text-[11px] text-[#756F7A] space-y-1">
              <div>
                Username: <code className="font-bold text-[#23212A] bg-white px-1.5 py-0.5 rounded border border-[#E9E5E8]">superadmin</code> atau <code className="font-bold text-[#23212A] bg-white px-1.5 py-0.5 rounded border border-[#E9E5E8]">irham_admin</code>
              </div>
              <div>
                Password: <code className="font-bold text-[#23212A] bg-white px-1.5 py-0.5 rounded border border-[#E9E5E8]">PahamiMadiun2026!</code>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setUsername("irham_admin");
                setPassword("PahamiMadiun2026!");
              }}
              className="mt-2 text-[11px] font-bold text-[#51465B] hover:underline"
            >
              Isi otomatis kredensial di atas &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
