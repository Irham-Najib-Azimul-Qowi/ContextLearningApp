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
  Shield,
  ArrowLeft,
} from "lucide-react";
import { PahamiPuzzleLogo } from "@/components/landing/puzzle-logo";

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
        setErrorMessage(data.error || "Autentikasi Admin gagal. Periksa kembali username dan password.");
        setLoading(false);
        return;
      }

      router.push("/admin/dashboard");
    } catch (err: any) {
      setErrorMessage(err?.message || "Terjadi kendala jaringan saat menghubungi server.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF7F3] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background with calm, subtle pastel geometric forms */}
      <div className="fixed -top-40 -left-40 w-96 h-96 rounded-full bg-[#51465B]/10 blur-3xl pointer-events-none" />
      <div className="fixed top-1/2 -right-40 w-80 h-80 rounded-full bg-[#FFD36D]/20 blur-3xl pointer-events-none" />
      <div className="fixed -bottom-40 left-1/3 w-96 h-96 rounded-full bg-[#DFAEB3]/20 blur-3xl pointer-events-none" />

      {/* Floating Admin Login Card */}
      <div className="w-full max-w-[440px] bg-white/95 backdrop-blur-md rounded-[36px] sm:rounded-[40px] border border-[#E9E5E8] shadow-2xl p-8 sm:p-11 relative overflow-hidden flex flex-col z-10">
        {/* Subtle top accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#51465B] via-[#DFAEB3] to-[#FFD36D]" />

        {/* =================================================================== */}
        {/* 1. PERTAMA: JUDUL DENGAN WORDMARK DEPASKAN & SUBJUDUL               */}
        {/* =================================================================== */}
        <div className="flex flex-col items-center text-center mb-7 pt-2">
          <div className="mb-4 transform hover:scale-105 transition-transform duration-200">
            <PahamiPuzzleLogo size="md" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#23212A] tracking-tight">
            Masuk ke DEPASKAN
          </h1>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#51465B]/10 text-[#51465B] text-xs font-black uppercase tracking-wider mt-2.5">
            <Shield className="w-3.5 h-3.5 text-[#51465B]" />
            <span>Admin Control Center</span>
          </span>
        </div>

        {/* Error Alert Display */}
        {errorMessage && (
          <div className="w-full mb-5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold">Akses Ditolak: </span>
              {errorMessage}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* 2. KEDUA: FORM USERNAME, PASSWORD, & CTA MASUK                      */}
        {/* =================================================================== */}
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
                className="w-full pl-10 pr-4 py-3.5 bg-[#FAF7F3] border border-[#E9E5E8] rounded-2xl text-xs font-semibold text-[#23212A] placeholder:text-[#756F7A]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#51465B]/20 focus:border-[#51465B] transition-all shadow-2xs"
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
                className="w-full pl-10 pr-10 py-3.5 bg-[#FAF7F3] border border-[#E9E5E8] rounded-2xl text-xs font-semibold text-[#23212A] placeholder:text-[#756F7A]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#51465B]/20 focus:border-[#51465B] transition-all shadow-2xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#756F7A] hover:text-[#23212A] p-1"
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
            className="w-full mt-2 py-4 px-6 rounded-2xl bg-[#51465B] hover:bg-[#3E3547] text-white font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none group"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-[#FFD36D] border-t-transparent rounded-full animate-spin" />
                <span>Memverifikasi Sesi...</span>
              </div>
            ) : (
              <>
                <span>Masuk ke Control Center</span>
                <ArrowRight className="w-4 h-4 text-[#FFD36D] group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* =================================================================== */}
        {/* 3. KETIGA: TEKS KETERANGAN AKSES KHUSUS                             */}
        {/* =================================================================== */}
        <div className="text-center pt-5">
          <p className="text-[11px] font-medium text-[#756F7A]">
            Akses khusus pengelola DEPASKAN.
          </p>
        </div>

        {/* Return to home link */}
        <div className="mt-6 pt-5 border-t border-[#E9E5E8] text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#756F7A] hover:text-[#51465B] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
