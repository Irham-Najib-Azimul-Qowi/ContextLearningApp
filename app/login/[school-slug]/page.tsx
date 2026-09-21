"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, GraduationCap, Lock, ArrowRight, School as SchoolIcon, AlertCircle } from "lucide-react";
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

  const getLevelColor = (level?: string) => {
    switch (level) {
      case "SD":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "SMP":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "SMA":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default:
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
    }
  };

  return (
    <div className="min-h-screen bg-[#EDEFF5] flex flex-col justify-between">
      {/* Top Simple Header */}
      <header className="h-16 px-6 border-b border-[#DCE0EA] bg-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#5865D8] flex items-center justify-center text-white font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-base text-[#252B3A]">ContextLearning</span>
        </div>

        <Link
          href="/auth/login"
          className="text-xs font-semibold text-[#697386] hover:text-[#252B3A]"
        >
          Masuk sebagai Guru →
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md space-y-6">
          <div className="bg-white rounded-2xl border border-[#DCE0EA] p-6 sm:p-8 shadow-sm">
            {/* School Branding Banner */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#5865D8]/10 text-[#5865D8] mx-auto flex items-center justify-center mb-3">
                <SchoolIcon className="w-6 h-6" />
              </div>

              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getLevelColor(
                    school?.educational_level
                  )}`}
                >
                  Jenjang {school?.educational_level || "SD"}
                </span>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-[#F1F3F9] text-[#697386] border border-[#DCE0EA]">
                  {school?.code || "SCH-001"}
                </span>
              </div>

              <h1 className="text-xl font-bold text-[#252B3A] tracking-tight">
                {school?.name || "Portal Siswa Sekolah"}
              </h1>
              <p className="text-xs text-[#697386] mt-1">
                {school ? `${school.district}, ${school.regency}` : "Silakan masuk dengan akun yang diberikan guru"}
              </p>
            </div>

            {/* Quick Demo Hint */}
            <div className="mb-4 p-2.5 rounded-lg bg-[#5865D8]/5 border border-[#5865D8]/20 flex items-center justify-between text-xs">
              <span className="text-[#697386]">Akun Siswa Demo:</span>
              <button
                type="button"
                onClick={() => {
                  setStudentCode("STU-SD01-001");
                  setPassword("demo123#");
                }}
                className="font-mono text-[11px] font-semibold text-[#5865D8] hover:underline"
              >
                Gunakan: STU-SD01-001
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleStudentLogin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#252B3A] block mb-1">
                  Nomor Induk Siswa / Kode Siswa:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: STU-SD01-001"
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#DCE0EA] bg-[#F7F8FC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5865D8]/30 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#252B3A] block mb-1">
                  Kata Sandi:
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#DCE0EA] bg-[#F7F8FC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5865D8]/30"
                />
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-[#C94F58]">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                className="w-full py-2.5 bg-[#5865D8] hover:bg-[#4753C4] text-xs font-semibold"
              >
                {isLoading ? "Memverifikasi..." : "Masuk ke Ruang Belajar"}
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </form>

            <div className="mt-6 text-center text-[11px] text-[#697386] border-t border-[#DCE0EA] pt-4">
              Belum memiliki akun? Hubungi guru kelas Anda untuk mendapatkan akses. Siswa tidak dapat mendaftar sendiri.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
