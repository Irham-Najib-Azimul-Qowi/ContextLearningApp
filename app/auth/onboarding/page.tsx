"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  School,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  User,
} from "lucide-react";
import { repository } from "@/lib/db/repository";
import { School as SchoolType } from "@/lib/db/types";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRole, setSelectedRole] = useState<"TEACHER" | "STUDENT" | null>(null);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [teacherPasscode, setTeacherPasscode] = useState("");
  const [classCode, setClassCode] = useState("");

  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const list = repository.getSchools();
    setSchools(list);
    if (list.length > 0) {
      setSchoolId(list[0].id);
    }
  }, []);

  const handleSelectRole = (role: "TEACHER" | "STUDENT") => {
    setSelectedRole(role);
    setErrorMessage(null);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: selectedRole,
          fullName,
          schoolId: selectedRole === "TEACHER" ? schoolId : undefined,
          teacherPasscode: selectedRole === "TEACHER" ? teacherPasscode : undefined,
          classCode: selectedRole === "STUDENT" ? classCode : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Gagal menyimpan data onboarding.");
        setLoading(false);
        return;
      }

      // Success
      router.push(data.redirectUrl);
    } catch (err: any) {
      setErrorMessage(err?.message || "Terjadi kesalahan jaringan.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-xl p-8 relative overflow-hidden">
        {/* Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400" />

        {/* Stepper info */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
              Langkah {step} dari 2
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {step === 1 ? "Pilih Peran Pengguna" : "Verifikasi Identitas"}
            </span>
          </div>
          {step === 2 && (
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setErrorMessage(null);
              }}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              Ganti Peran
            </button>
          )}
        </div>

        {/* STEP 1: ROLE SELECTION */}
        {step === 1 && (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Pilih Peran Anda di PAHAMI
              </h1>
              <p className="text-sm text-slate-500 mt-2">
                Pilih peran untuk menyesuaikan ruang kerja pembelajaran kontekstual Anda
              </p>
            </div>

            <div className="space-y-4">
              {/* Teacher Card */}
              <button
                type="button"
                onClick={() => handleSelectRole("TEACHER")}
                className="w-full p-5 rounded-2xl border-2 border-slate-200 hover:border-indigo-600 hover:bg-indigo-50/40 text-left transition-all flex items-start gap-4 group"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <School className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-slate-900">Guru / Pendidik SD</h2>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Kelola materi, buat soal dengan Contextual AI Gemini, publikasi ujian, dan nilai hasil belajar siswa.
                  </p>
                  <div className="mt-2 text-[11px] font-semibold text-indigo-600 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Memerlukan kode akses pendidik</span>
                  </div>
                </div>
              </button>

              {/* Student Card */}
              <button
                type="button"
                onClick={() => handleSelectRole("STUDENT")}
                className="w-full p-5 rounded-2xl border-2 border-slate-200 hover:border-sky-500 hover:bg-sky-50/40 text-left transition-all flex items-start gap-4 group"
              >
                <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-slate-900">Murid / Siswa SD</h2>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Baca materi pelajaran lokal Karesidenan Madiun, kerjakan ujian online, dan lihat hasil evaluasi.
                  </p>
                  <div className="mt-2 text-[11px] font-semibold text-sky-600 flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Memerlukan kode kelas dari guru</span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: VERIFICATION & PROFILE SETUP */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {selectedRole === "TEACHER" ? "Verifikasi Profil Guru" : "Pendaftaran Kelas Murid"}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {selectedRole === "TEACHER"
                  ? "Masukkan identitas pendidik dan kode verifikasi sekolah Anda."
                  : "Masukkan nama Anda dan kode kelas yang diberikan oleh bapak/ibu guru."}
              </p>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="leading-relaxed">{errorMessage}</div>
              </div>
            )}

            {/* Nama Lengkap */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Lengkap
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder={
                    selectedRole === "TEACHER"
                      ? "Contoh: Ibu Siti Aminah, S.Pd."
                      : "Contoh: Budi Santoso"
                  }
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* TEACHER SPECIFIC FIELDS */}
            {selectedRole === "TEACHER" && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pilih Sekolah Penugasan
                  </label>
                  <select
                    value={schoolId}
                    onChange={(e) => setSchoolId(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-indigo-600"
                  >
                    {schools.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.region_name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Kode Akses Pendidik
                    </label>
                    <span className="text-[10px] text-slate-400">
                      Prototipe: GURU-PAHAMI-2026
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      placeholder="Masukkan kode otorisasi guru"
                      value={teacherPasscode}
                      onChange={(e) => setTeacherPasscode(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                    />
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Kode ini mencegah akses sembarangan ke bank soal dan ruang kerja guru.
                  </p>
                </div>
              </>
            )}

            {/* STUDENT SPECIFIC FIELDS */}
            {selectedRole === "STUDENT" && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Kode Kelas dari Guru
                  </label>
                  <span className="text-[10px] text-slate-400">
                    Contoh: PNR-5A atau PNR-5B
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Contoh: PNR-5A"
                    value={classCode}
                    onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                    className="w-full pl-9 pr-3 py-2.5 text-xs font-mono font-bold tracking-wider rounded-xl border border-slate-200 focus:outline-hidden focus:border-sky-500 focus:ring-1 focus:ring-sky-500 uppercase"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Tanyakan kode 6 karakter ini kepada guru kelas Anda.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 ${
                selectedRole === "TEACHER"
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-sky-600 hover:bg-sky-700"
              } disabled:opacity-50`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Selesaikan Pendaftaran & Masuk</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
