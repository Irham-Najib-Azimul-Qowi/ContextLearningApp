"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import { PahamiPuzzleLogo } from "@/components/landing/puzzle-logo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
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
        setErrorMessage(data.error || "Autentikasi gagal. Periksa username dan password.");
        setLoading(false);
        return;
      }

      router.push("/admin/dashboard");
    } catch (err: any) {
      setErrorMessage(err?.message || "Terjadi kendala koneksi ke server.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF7F3] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Ambient background glows matching main site & teacher dashboard */}
      <div className="fixed -top-40 -left-40 w-96 h-96 rounded-full bg-[#51465B]/15 blur-3xl pointer-events-none" />
      <div className="fixed top-1/2 -right-40 w-96 h-96 rounded-full bg-[#F47D83]/15 blur-3xl pointer-events-none" />
      <div className="fixed -bottom-40 -left-20 w-96 h-96 rounded-full bg-[#FFD36D]/20 blur-3xl pointer-events-none" />

      {/* Floating Card Design matching app/login/page.tsx */}
      <div className="w-full max-w-[440px] bg-gradient-to-b from-[#3E3547] via-[#332A3B] to-[#251E2B] rounded-[32px] sm:rounded-[36px] border border-[#5A4F65] shadow-2xl p-7 sm:p-9 relative overflow-hidden flex flex-col z-10 text-white">
        
        {/* DEPASKAN Logo */}
        <div className="flex flex-col items-center text-center mb-6 pt-1">
          <div className="transform hover:scale-105 transition-transform duration-200">
            <PahamiPuzzleLogo size="md" theme="dark" />
          </div>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[#FFD36D] text-[11px] font-black tracking-wide uppercase shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#F47D83]" />
            <span>Admin Control Center</span>
          </div>
        </div>

        {/* Error Alert Display */}
        {errorMessage && (
          <div className="w-full mb-5 p-3.5 rounded-2xl bg-rose-950/60 border border-rose-700/60 text-rose-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold">Akses Ditolak: </span>
              {errorMessage}
            </div>
          </div>
        )}

        {/* Form Username, Password, & CTA Masuk */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#DFAEB3] mb-1.5">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8D7F9B]" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full pl-10 pr-4 py-3 bg-[#1E1724]/90 border border-[#52465C] rounded-2xl text-xs font-medium text-white placeholder:text-[#8D7F9B] focus:bg-[#19131F] focus:outline-none focus:ring-2 focus:ring-[#FFD36D]/25 focus:border-[#FFD36D] transition-all shadow-inner"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#DFAEB3] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8D7F9B]" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="admin123"
                className="w-full pl-10 pr-10 py-3 bg-[#1E1724]/90 border border-[#52465C] rounded-2xl text-xs font-medium text-white placeholder:text-[#8D7F9B] focus:bg-[#19131F] focus:outline-none focus:ring-2 focus:ring-[#FFD36D]/25 focus:border-[#FFD36D] transition-all shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8D7F9B] hover:text-white p-1 transition-colors"
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* CTA: Masuk ke Control Center */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#FFD36D] to-[#F4B43E] hover:from-[#FFE08B] hover:to-[#F5BE54] text-[#3E3547] font-black text-xs sm:text-sm shadow-[0_4px_16px_rgba(255,211,109,0.35)] transition-all duration-200 transform hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none group"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-[#3E3547] border-t-transparent rounded-full animate-spin" />
                <span>Memverifikasi Sesi...</span>
              </div>
            ) : (
              <>
                <span>Masuk ke Control Center</span>
                <ArrowRight className="w-4 h-4 text-[#3E3547] group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Return to home link */}
        <div className="mt-6 pt-4 border-t border-[#52465C]/60 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#DFAEB3] hover:text-[#FFD36D] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
