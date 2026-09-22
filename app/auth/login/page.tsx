"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  GraduationCap,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { repository } from "@/lib/db/repository";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [schoolSlug, setSchoolSlug] = useState("");
  const [studentLookupError, setStudentLookupError] = useState("");

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      try {
        localStorage.setItem("contextlearning_role", "teacher");
        localStorage.setItem("contextlearning_name", "Ibu Nurhaliza, S.Pd.");
        localStorage.setItem("cl_active_school_id", "school-sd001-samarinda");
        localStorage.setItem(
          "contextlearning_user",
          JSON.stringify({
            id: "teacher-demo-01",
            role: "teacher",
            name: "Ibu Nurhaliza, S.Pd.",
            email: "nurhaliza.guru@gmail.com",
            auth_provider: "google",
          })
        );
      } catch {
        // ignore
      }
      setIsLoading(false);
      router.push("/teacher/dashboard");
    }, 600);
  };

  const handleStudentPortalRedirect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolSlug.trim()) {
      setStudentLookupError("Masukkan kode atau tautan sekolah");
      return;
    }

    const cleanSlug = schoolSlug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-");
    const school =
      repository.getSchoolBySlug(cleanSlug) ||
      repository.getSchoolByCode(schoolSlug.trim().toUpperCase()) ||
      repository.getSchools().find((s) => s.slug.includes(cleanSlug));

    if (school) {
      router.push(`/login/${school.slug}`);
    } else {
      setStudentLookupError("Sekolah tidak ditemukan. Pastikan slug atau kode sekolah benar.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      {/* Header */}
      <header className="h-16 px-6 border-b border-border bg-surface flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-base text-foreground">ContextLearning</span>
        </Link>

        <Link
          href="/admin/login"
          className="text-xs font-semibold text-secondary hover:text-foreground flex items-center gap-1.5 transition-colors"
        >
          <ShieldCheck className="w-4 h-4 text-muted" /> Login Admin
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md space-y-6">
          {/* Main Card */}
          <div className="bg-surface rounded-xl border border-border p-6 sm:p-8 shadow-2xs">
            <div className="text-center mb-6">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                Masuk ke ContextLearning
              </h1>
              <p className="text-xs text-secondary mt-1.5">
                Platform Pembelajaran Kontekstual Multi-Sekolah
              </p>
            </div>

            {/* Teacher Google Authentication Section */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-surface-subtle border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-primary" /> Akses Guru &amp; Pengajar
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-success-subtle text-success border border-emerald-200">
                    Google OAuth
                  </span>
                </div>
                <p className="text-xs text-secondary leading-relaxed">
                  Pendidik menggunakan akun Google terverifikasi untuk mengelola ruang kerja dan bank soal sekolah.
                </p>

                {/* Google Sign In Button */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full mt-2 flex items-center justify-center gap-3 py-2.5 px-4 rounded-lg border border-border-strong bg-surface hover:bg-surface-subtle text-foreground font-semibold text-xs transition-colors shadow-2xs disabled:opacity-60"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                  <span>{isLoading ? "Memproses Autentikasi..." : "Lanjutkan dengan Google"}</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-4">
                <div className="w-full border-t border-border" />
                <span className="bg-surface px-2 text-[10px] uppercase font-bold text-muted absolute">
                  Portal Siswa
                </span>
              </div>

              {/* Student Portal Lookup */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground block">
                  Cari Portal Sekolah Anda:
                </label>
                <form onSubmit={handleStudentPortalRedirect} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Contoh: sd-001-samarinda atau SCH-SD001"
                      value={schoolSlug}
                      onChange={(e) => {
                        setSchoolSlug(e.target.value);
                        setStudentLookupError("");
                      }}
                      className="flex-1 text-xs px-3 py-2 rounded-lg border border-border bg-surface text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
                    />
                    <Button type="submit" variant="primary" size="sm" className="text-xs">
                      Buka
                    </Button>
                  </div>
                  {studentLookupError && (
                    <p className="text-xs text-error font-medium">{studentLookupError}</p>
                  )}
                </form>

                {/* Quick School Links */}
                <div className="pt-2">
                  <span className="text-[11px] text-muted block mb-1">Sekolah Percontohan Cepat:</span>
                  <div className="flex flex-wrap gap-1.5">
                    <Link
                      href="/login/sd-001-samarinda"
                      className="text-xs font-medium px-2.5 py-1 rounded-md bg-surface-subtle hover:bg-workspace text-foreground border border-border transition-colors"
                    >
                      SDN 001 Samarinda
                    </Link>
                    <Link
                      href="/login/smp-01-samarinda"
                      className="text-xs font-medium px-2.5 py-1 rounded-md bg-surface-subtle hover:bg-workspace text-foreground border border-border transition-colors"
                    >
                      SMPN 1 Samarinda
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security & Multi-tenancy note */}
          <div className="text-center text-xs text-secondary space-y-1">
            <p className="flex items-center justify-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-success" />
              Multi-tenant terisolasi • Akun siswa diprovisi oleh guru sekolah
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
