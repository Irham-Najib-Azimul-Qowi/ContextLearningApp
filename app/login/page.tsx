"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { PahamiPuzzleLogo } from "@/components/landing/puzzle-logo";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorMsg = searchParams.get("error");
  const intent = searchParams.get("intent");
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(errorMsg);

  useEffect(() => {
    // Preserve service intent if provided from hero cards (material / question)
    if (intent) {
      try {
        localStorage.setItem("pahami_user_intent", intent);
      } catch {
        // Fallback silently
      }
    }

    // Auto-redirect if existing valid session exists or user has already completed onboarding
    const checkExistingSession = async () => {
      try {
        if (typeof window !== "undefined") {
          const completed = localStorage.getItem("pahami_v2_onboarding_completed");
          if (completed === "true") {
            if (intent === "material") {
              router.replace("/teacher/materials/new");
            } else if (intent === "question") {
              router.replace("/teacher/questions/new");
            } else {
              router.replace("/teacher/dashboard");
            }
            return;
          }
        }

        const supabase = createClient();
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user) {
          if (intent === "material") {
            router.replace("/teacher/materials/new");
          } else if (intent === "question") {
            router.replace("/teacher/questions/new");
          } else {
            router.replace("/teacher/dashboard");
          }
        }
      } catch {
        // Continue to show login form
      }
    };
    checkExistingSession();
  }, [intent, router]);

  const handleGoogleLogin = async () => {
    if (loading) return;
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

  return (
    <div className="w-full max-w-[480px] bg-gradient-to-b from-[#3E3547] via-[#332A3B] to-[#251E2B] rounded-[32px] sm:rounded-[36px] border border-[#5A4F65] shadow-2xl p-8 sm:p-10 relative overflow-hidden flex flex-col items-center text-center text-white z-10">

      {/* 1. PALING ATAS: DEPASKAN LOGO */}
      <div className="transform hover:scale-105 transition-transform duration-200 pt-1">
        <PahamiPuzzleLogo size="md" theme="dark" />
      </div>

      {/* 2. BAWAHNYA: CTA KETERANGAN */}
      <div className="mt-6 mb-7 text-center">
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Lanjutkan Perjalanan Belajarmu
        </h1>
        <p className="text-xs sm:text-sm text-gray-300 mt-2 leading-relaxed max-w-sm">
          Masuk ke platform pembelajaran kontekstual berbasis kearifan lokal untuk sekolah dasar.
        </p>
      </div>

      {/* Error Alert Display */}
      {authError && (
        <div className="w-full mb-6 p-3.5 rounded-2xl bg-rose-950/70 border border-rose-700/60 text-rose-200 text-xs flex items-start gap-2.5 text-left">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Autentikasi Gagal: </span>
            {authError}
          </div>
        </div>
      )}

      {/* 3. BUTTON: TOMBOL DENGAN IKON GOOGLE (DI-KLIK UNTUK MASUK) */}
      <div className="w-full space-y-3">
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-4 px-5 rounded-2xl bg-white hover:bg-gray-50 text-gray-900 font-extrabold text-sm sm:text-base shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0.5 flex items-center justify-center gap-3 border border-gray-200 disabled:opacity-60 disabled:pointer-events-none group cursor-pointer"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2.5">
              <div className="w-4 h-4 border-2 border-[#3E3547] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-bold text-gray-900">Menghubungkan ke Google...</span>
            </div>
          ) : (
            <>
              {/* Official Google G Logo SVG */}
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
              <span>Masuk dengan Google</span>
            </>
          )}
        </button>
      </div>

      {/* 4. BAWAHNYA: KEMBALI KE BERANDA */}
      <div className="mt-7 pt-5 border-t border-white/15 w-full text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#FAF7F3] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Subtle atmospheric ambient glow */}
      <div className="fixed -top-40 -left-40 w-96 h-96 rounded-full bg-[#3E3547]/15 blur-3xl pointer-events-none" />
      <div className="fixed top-1/2 -right-40 w-80 h-80 rounded-full bg-[#FFD36D]/15 blur-3xl pointer-events-none" />
      <div className="fixed -bottom-40 left-1/3 w-96 h-96 rounded-full bg-[#3E3547]/10 blur-3xl pointer-events-none" />

      {/* Floating Card */}
      <Suspense
        fallback={
          <div className="w-full max-w-[480px] bg-[#3E3547] rounded-[36px] border border-[#5A4F65] p-10 text-center text-xs font-bold text-gray-300 shadow-xl animate-pulse">
            Memuat formulir masuk...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
