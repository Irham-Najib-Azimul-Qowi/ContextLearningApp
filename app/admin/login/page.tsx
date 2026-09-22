"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, AlertCircle, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const ADMIN_ALLOWLIST = ["admin@contextlearning.id", "operations@contextlearning.id"];

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    setTimeout(() => {
      // Validate strictly against allowlist
      if (!ADMIN_ALLOWLIST.includes(email.trim().toLowerCase())) {
        setErrorMsg("Akses ditolak: Akun tidak terdaftar dalam allowlist Platform Admin.");
        setIsLoading(false);
        return;
      }

      if (adminKey.trim() !== "AdminMaster2026#" && adminKey.trim() !== "demo") {
        setErrorMsg("Kunci keamanan operasi administratif tidak valid.");
        setIsLoading(false);
        return;
      }

      localStorage.setItem("contextlearning_role", "platform_admin");
      localStorage.setItem("contextlearning_name", "Platform Administrator");
      localStorage.setItem(
        "contextlearning_user",
        JSON.stringify({
          id: "admin-platform-01",
          role: "platform_admin",
          name: "Platform Administrator",
          email: email.trim(),
        })
      );

      setIsLoading(false);
      router.push("/admin");
    }, 600);
  };

  const handleFastDemoLogin = () => {
    setEmail("admin@contextlearning.id");
    setAdminKey("demo");
    localStorage.setItem("contextlearning_role", "platform_admin");
    localStorage.setItem("contextlearning_name", "Platform Administrator");
    localStorage.setItem(
      "contextlearning_user",
      JSON.stringify({
        id: "admin-platform-01",
        role: "platform_admin",
        name: "Platform Administrator",
        email: "admin@contextlearning.id",
      })
    );
    router.push("/admin");
  };

  return (
    <div className="min-h-screen bg-[#1A1F2C] text-slate-100 flex flex-col justify-between">
      <header className="h-16 px-6 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm text-white">Pahami</span>
        </div>

        <Link href="/auth/login" className="text-xs text-slate-400 hover:text-white transition-colors">
          ← Kembali ke Portal Guru
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md space-y-6">
          <div className="bg-[#222838] rounded-xl border border-slate-700 p-6 sm:p-8 shadow-xl">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center mb-3 border border-amber-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h1 className="text-lg font-bold text-white">Akses Platform Administrator</h1>
              <p className="text-xs text-slate-400 mt-1">
                Area operasi terbatas untuk pengelolaan instansi SaaS dan kredensial AI.
              </p>
            </div>

            {/* Demo Instant Button */}
            <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs flex items-center justify-between">
              <span className="text-amber-200">Akses Cepat Pengujian:</span>
              <button
                type="button"
                onClick={handleFastDemoLogin}
                className="text-xs font-semibold text-amber-300 hover:underline"
              >
                Masuk Allowlist Admin →
              </button>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Email Administrator:
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@contextlearning.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Kunci Operasi Administratif:
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary"
                />
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-800 text-xs text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                className="w-full py-2.5 text-xs font-semibold"
              >
                {isLoading ? "Memverifikasi..." : "Autentikasi Administrator"}
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
