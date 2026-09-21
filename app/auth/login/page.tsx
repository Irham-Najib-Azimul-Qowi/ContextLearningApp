"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/navbar";
import Container from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, UserRound, GraduationCap, ArrowRight, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<"teacher" | "student">("teacher");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    setTimeout(() => {
      try {
        localStorage.setItem("contextlearning_role", role);
        localStorage.setItem(
          "contextlearning_name",
          role === "teacher" ? "Ibu Nurhaliza, S.Pd." : "Budi Pratama"
        );
        localStorage.setItem(
          "contextlearning_user",
          JSON.stringify({
            id: role === "teacher" ? "teacher-demo-01" : "student-demo-01",
            role,
            name: role === "teacher" ? "Ibu Nurhaliza, S.Pd." : "Budi Pratama",
          })
        );
      } catch {
        // ignore
      }

      setIsLoading(false);
      if (role === "teacher") {
        router.push("/teacher/dashboard");
      } else {
        router.push("/student/dashboard");
      }
    }, 600);
  };

  const handleQuickDemo = (demoRole: "teacher" | "student") => {
    setRole(demoRole);
    try {
      localStorage.setItem("contextlearning_role", demoRole);
      localStorage.setItem(
        "contextlearning_name",
        demoRole === "teacher" ? "Ibu Nurhaliza, S.Pd." : "Budi Pratama"
      );
      localStorage.setItem(
        "contextlearning_user",
        JSON.stringify({
          id: demoRole === "teacher" ? "teacher-demo-01" : "student-demo-01",
          role: demoRole,
          name: demoRole === "teacher" ? "Ibu Nurhaliza, S.Pd." : "Budi Pratama",
        })
      );
    } catch {
      // ignore
    }

    if (demoRole === "teacher") {
      router.push("/teacher/dashboard");
    } else {
      router.push("/student/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <Container className="py-12 sm:py-16">
        <div className="mx-auto max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-primary mb-4 shadow-xs">
              <Sparkles className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Masuk ke ContextLearning
            </h1>
            <p className="text-sm text-muted mt-2">
              Platform Pembelajaran Kontekstual Berbasis Karakteristik Wilayah
            </p>
          </div>

          {/* Quick Demo Access Box */}
          <div className="mb-6 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-primary block mb-2">
              Akses Cepat Demo Juri & Penguji:
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickDemo("teacher")}
                className="flex items-center justify-center gap-2 rounded-xl bg-white border border-indigo-200 py-2.5 px-3 text-xs font-semibold text-primary shadow-2xs hover:bg-indigo-50 transition-colors"
              >
                <GraduationCap className="h-4 w-4" /> Masuk Guru Demo
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo("student")}
                className="flex items-center justify-center gap-2 rounded-xl bg-white border border-indigo-200 py-2.5 px-3 text-xs font-semibold text-primary shadow-2xs hover:bg-indigo-50 transition-colors"
              >
                <UserRound className="h-4 w-4" /> Masuk Siswa Demo
              </button>
            </div>
          </div>

          {/* Main Form Card */}
          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-sm">
            {/* Role Tabs */}
            <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setRole("teacher")}
                className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all ${
                  role === "teacher"
                    ? "bg-white text-primary shadow-xs"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <GraduationCap className="h-4 w-4" /> Guru
              </button>
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all ${
                  role === "student"
                    ? "bg-white text-primary shadow-xs"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <UserRound className="h-4 w-4" /> Siswa
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label={role === "teacher" ? "Email Guru / NIP" : "NISN / Nama Pengguna"}
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  role === "teacher"
                    ? "guru@sd001samarinda.sch.id"
                    : "budi.pratama"
                }
              />

              <Input
                label="Kata Sandi"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />

              {errorMsg && (
                <p className="text-xs text-error font-medium">{errorMsg}</p>
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-2"
                isLoading={isLoading}
              >
                Masuk Sekarang <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </form>

            <div className="mt-6 text-center text-xs text-muted border-t border-border/60 pt-4">
              Belum punya akun guru?{" "}
              <Link href="/auth/register" className="font-semibold text-primary hover:underline">
                Daftar Akun Guru
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
