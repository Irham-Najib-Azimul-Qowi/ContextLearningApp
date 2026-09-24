"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, AlertCircle, School, GraduationCap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { repository } from "@/lib/db/repository";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorMsg = searchParams.get("error");
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(errorMsg);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setAuthError(null);

    const supabase = createClient();
    const redirectUrl = `${window.location.origin}/auth/callback`;

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        setAuthError(error.message);
        setLoading(false);
      }
    } catch (err: any) {
      setAuthError(err?.message || "Gagal menghubungi layanan autentikasi Google.");
      setLoading(false);
    }
  };

  const handleQuickDemo = (role: "TEACHER" | "STUDENT") => {
    repository.setCurrentRole(role);
    if (role === "TEACHER") {
      router.push("/teacher/dashboard");
    } else {
      router.push("/student/dashboard");
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl p-8 relative overflow-hidden">
      {/* Decorative top accent */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400" />

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>PAHAMI V2 &bull; Autentikasi Tunggal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Selamat Datang
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          Masuk untuk mengakses materi dan bank soal kontekstual Karesidenan Madiun
        </p>
      </div>

      {/* Error Alert */}
      {authError && (
        <div className="mb-6 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold">Autentikasi Gagal: </span>
            {authError}
          </div>
        </div>
      )}

      {/* Google OAuth Button — Primary Method */}
      <div className="space-y-4">
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3.5 px-6 py-4 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-800 font-bold text-sm shadow-xs hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>{loading ? "Menghubungkan ke Google..." : "Masuk dengan Google"}</span>
        </button>

        <p className="text-[11px] text-center text-slate-400">
          Satu akun Google untuk peran Guru maupun Murid SD
        </p>
      </div>

      {/* Security notice */}
      <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-500 text-xs">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Terproteksi Supabase Auth & RLS Terisolasi</span>
      </div>

      {/* Fast Demo Evaluator Access */}
      <div className="mt-6 pt-5 border-t border-dashed border-slate-200">
        <div className="text-center mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Akses Cepat Pengujian Juri / Evaluator
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => handleQuickDemo("TEACHER")}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
          >
            <School className="w-3.5 h-3.5" />
            <span>Guru Demo</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemo("STUDENT")}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold transition-colors"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Murid Demo</span>
          </button>
        </div>
      </div>

      {/* Return home link */}
      <div className="text-center mt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <span>Kembali ke Beranda</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-400">
            Memuat formulir masuk...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
