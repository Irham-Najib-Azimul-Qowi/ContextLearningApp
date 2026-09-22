"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, ArrowRight, School as SchoolIcon, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { repository } from "@/lib/db/repository";
import { School } from "@/lib/db/types";

interface StudentLoginPageProps {
  params: Promise<{ "school-slug": string }>;
}

export default function StudentSchoolLoginPage({ params }: StudentLoginPageProps) {
  const resolvedParams = use(params);
  const schoolSlug = resolvedParams["school-slug"];
  const router = useRouter();

  const [school, setSchool] = useState<School | null>(null);
  const [studentCode, setStudentCode] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const foundSchool = repository.getSchoolBySlug(schoolSlug);
    if (foundSchool) {
      setSchool(foundSchool);
    }
  }, [schoolSlug]);

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentCode.trim() || !password.trim()) {
      setErrorMessage("Nomor Induk Siswa dan Kata Sandi wajib diisi.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    setTimeout(() => {
      // Lookup student by student_code or demo match
      const student = repository.getUserByStudentCode(studentCode.trim());

      if (!student && studentCode.trim() !== "STU-SD01-001" && studentCode.trim().toLowerCase() !== "budi") {
        setErrorMessage("Identitas siswa atau kata sandi tidak cocok.");
        setIsLoading(false);
        return;
      }

      // Verify school isolation: student must belong to this specific school!
      const targetStudent =
        student || repository.getUserByStudentCode("STU-SD01-001") || repository.getUserById("student-demo-01");

      if (targetStudent && school && targetStudent.school_id !== school.id) {
        setErrorMessage(`Akun Anda tidak terdaftar di ${school.name}. Silakan gunakan link portal sekolah Anda.`);
        setIsLoading(false);
        return;
      }

      // Save student session
      localStorage.setItem("contextlearning_role", "student");
      localStorage.setItem("contextlearning_name", targetStudent ? targetStudent.full_name : "Budi Pratama");
      localStorage.setItem(
        "contextlearning_user",
        JSON.stringify({
          id: targetStudent ? targetStudent.id : "student-demo-01",
          role: "student",
          name: targetStudent ? targetStudent.full_name : "Budi Pratama",
          school_id: school?.id || "school-sd001-samarinda",
          student_code: targetStudent?.student_code || "STU-SD01-001",
        })
      );

      setIsLoading(false);
      router.push("/student/dashboard");
    }, 600);
  };

  const getLevelLabel = (level?: string) => {
    switch (level) {
      case "SD":
        return "Sekolah Dasar";
      case "SMP":
        return "Sekolah Menengah Pertama";
      case "SMA":
        return "Sekolah Menengah Atas";
      default:
        return "Sekolah Dasar";
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      {/* Top Header */}
      <header className="h-16 px-6 border-b border-border bg-surface flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-base text-foreground">ContextLearning</span>
        </Link>

        <Link
          href="/auth/login"
          className="text-xs font-semibold text-secondary hover:text-foreground transition-colors"
        >
          Masuk sebagai Guru →
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md space-y-6">
          <div className="bg-surface rounded-xl border border-border p-6 sm:p-8 shadow-2xs">
            {/* School Branding Banner */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary mx-auto flex items-center justify-center mb-3">
                <SchoolIcon className="w-6 h-6" />
              </div>

              <h1 className="text-xl font-bold text-foreground tracking-tight">
                {school?.name || "Portal Siswa Sekolah"}
              </h1>
              <p className="text-xs text-secondary mt-1">
                {school ? `${getLevelLabel(school.educational_level)} · ${school.district}, ${school.regency}` : "Silakan masuk dengan akun yang diberikan guru"}
              </p>
            </div>

            {/* Quick Demo Hint */}
            <div className="mb-4 p-2.5 rounded-lg bg-surface-subtle border border-border flex items-center justify-between text-xs">
              <span className="text-secondary">Akun Siswa Demo:</span>
              <button
                type="button"
                onClick={() => {
                  setStudentCode("STU-SD01-001");
                  setPassword("demo123#");
                }}
                className="font-mono text-[11px] font-semibold text-primary hover:underline"
              >
                Gunakan: STU-SD01-001
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleStudentLogin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Nomor Induk Siswa / Kode Siswa:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: STU-SD01-001"
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-lg border border-border bg-surface text-foreground placeholder:text-muted focus:border-primary focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Kata Sandi:
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-lg border border-border bg-surface text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
                />
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-lg bg-error-subtle border border-red-200 flex items-start gap-2 text-xs text-error">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                className="w-full py-2.5 text-xs font-semibold"
              >
                {isLoading ? "Memverifikasi..." : "Masuk ke Ruang Belajar"}
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </form>

            <div className="mt-6 text-center text-xs text-muted border-t border-border pt-4">
              Belum memiliki akun? Hubungi guru kelas Anda untuk mendapatkan akses. Siswa tidak dapat mendaftar sendiri.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
