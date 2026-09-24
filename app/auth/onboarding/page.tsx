"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  School,
  User,
  MapPin,
  Compass,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Building2,
  UserCheck,
} from "lucide-react";
import { repository } from "@/lib/db/repository";

interface RegionOption {
  code: string;
  name: string;
  province: "Jawa Timur" | "Jawa Tengah";
  centerCoords: [number, number];
}

const SUPPORTED_REGIONS: RegionOption[] = [
  { code: "35.77", name: "Kota Madiun", province: "Jawa Timur", centerCoords: [-7.6298, 111.5239] },
  { code: "35.19", name: "Kabupaten Madiun", province: "Jawa Timur", centerCoords: [-7.5583, 111.6577] },
  { code: "35.21", name: "Kabupaten Ngawi", province: "Jawa Timur", centerCoords: [-7.4039, 111.4452] },
  { code: "35.20", name: "Kabupaten Magetan", province: "Jawa Timur", centerCoords: [-7.6528, 111.3283] },
  { code: "35.02", name: "Kabupaten Ponorogo", province: "Jawa Timur", centerCoords: [-7.8692, 111.4622] },
  { code: "35.01", name: "Kabupaten Pacitan", province: "Jawa Timur", centerCoords: [-8.2044, 111.0924] },
  { code: "33.74", name: "Kota Semarang", province: "Jawa Tengah", centerCoords: [-6.9667, 110.4167] },
];

export default function OnboardingPage() {
  const router = useRouter();

  // Multi-step flow: 1 (Identitas), 2 (Jenis Penggunaan), 3 (Lokasi & Wilayah), 4 (Konfirmasi)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [roleMode, setRoleMode] = useState<"TEACHER" | "STUDENT">("TEACHER");
  const [usageMode, setUsageMode] = useState<"individual" | "school">("individual");

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [selectedProvince, setSelectedProvince] = useState<string>("Jawa Timur");
  const [selectedRegionId, setSelectedRegionId] = useState<string>("35.77");
  const [districtName, setDistrictName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [teacherPasscode, setTeacherPasscode] = useState("GURU-PAHAMI-2026");
  const [classCode, setClassCode] = useState("");

  // Geolocation states
  const [isLocating, setIsLocating] = useState(false);
  const [gpsNotice, setGpsNotice] = useState<string | null>(null);

  // Submission states
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userIntent, setUserIntent] = useState<string>("general");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const intent = localStorage.getItem("pahami_user_intent") || "general";
      setUserIntent(intent);
    }
    // Default user name proposal if empty
    if (!fullName) {
      setFullName("Bapak / Ibu Guru");
    }
  }, []);

  // Filter regions by selected province
  const availableRegions = SUPPORTED_REGIONS.filter(
    (r) => r.province === selectedProvince
  );

  // Geolocation detection helper
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGpsNotice("Peramban Anda tidak mendukung sensor Geolocation.");
      return;
    }

    setIsLocating(true);
    setGpsNotice(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;

        // Calculate nearest region center distance
        let closest = SUPPORTED_REGIONS[0];
        let minDistance = Number.MAX_VALUE;

        SUPPORTED_REGIONS.forEach((r) => {
          const dLat = latitude - r.centerCoords[0];
          const dLon = longitude - r.centerCoords[1];
          const dist = Math.sqrt(dLat * dLat + dLon * dLon);
          if (dist < minDistance) {
            minDistance = dist;
            closest = r;
          }
        });

        setSelectedProvince(closest.province);
        setSelectedRegionId(closest.code);
        setIsLocating(false);
        setGpsNotice(`Lokasi terdeteksi: ${closest.name} (${closest.province}). Silakan konfirmasi pilihan wilayah Anda.`);
      },
      (err) => {
        setIsLocating(false);
        setGpsNotice("Izin lokasi tidak diberikan. Anda tetap dapat memilih wilayah secara manual di bawah.");
      },
      { timeout: 8000 }
    );
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!fullName.trim()) {
        setErrorMessage("Silakan masukkan nama lengkap Anda.");
        return;
      }
      setErrorMessage(null);
      setStep(2);
    } else if (step === 2) {
      setErrorMessage(null);
      setStep(3);
    } else if (step === 3) {
      if (usageMode === "school" && !schoolName.trim()) {
        setErrorMessage("Silakan masukkan nama sekolah SD Anda.");
        return;
      }
      setErrorMessage(null);
      setStep(4);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const matchedRegion = SUPPORTED_REGIONS.find((r) => r.code === selectedRegionId);
      const regionName = matchedRegion ? matchedRegion.name : "Kota Madiun";

      const res = await fetch("/api/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: roleMode,
          fullName: fullName.trim(),
          usageMode,
          regionId: selectedRegionId,
          regionName,
          schoolId: usageMode === "school" ? "school-madiun-1" : "school-individual",
          schoolName: usageMode === "school" ? schoolName : `Workspace Mandiri (${fullName})`,
          teacherPasscode: usageMode === "school" ? teacherPasscode : "GURU-PAHAMI-2026",
          classCode: roleMode === "STUDENT" ? classCode : undefined,
          intent: userIntent,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Gagal menyimpan data onboarding.");
        setLoading(false);
        return;
      }

      // Determine redirect destination based on initial intent
      let targetUrl = data.redirectUrl || "/teacher/dashboard";
      if (roleMode === "TEACHER") {
        if (userIntent === "question") {
          targetUrl = "/teacher/questions/new";
        } else if (userIntent === "material") {
          targetUrl = "/teacher/materials/new";
        }
      }

      router.push(targetUrl);
    } catch (err: any) {
      setErrorMessage(err?.message || "Terjadi kendala jaringan.");
      setLoading(false);
    }
  };

  const matchedRegion = SUPPORTED_REGIONS.find((r) => r.code === selectedRegionId);
  const regionName = matchedRegion ? matchedRegion.name : "Kota Madiun";

  return (
    <main className="min-h-screen bg-[#FAF7F3] flex items-center justify-center p-4 text-[#23212A] relative overflow-hidden">
      {/* Ambient background tints */}
      <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-[#DFAEB3]/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-[#FFD36D]/20 blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl bg-white rounded-[32px] sm:rounded-[36px] border border-[#E9E5E8] shadow-xl p-8 sm:p-10 relative overflow-hidden">
        {/* Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#51465B] via-[#F47D83] to-[#FFD36D]" />

        {/* Stepper Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#E9E5E8]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-[#51465B] bg-[#51465B]/10 px-3 py-1 rounded-full">
              Langkah {step} dari 4
            </span>
            <span className="text-xs text-[#756F7A] font-semibold">
              {step === 1 && "Identitas"}
              {step === 2 && "Penggunaan"}
              {step === 3 && "Lokasi & Wilayah"}
              {step === 4 && "Konfirmasi"}
            </span>
          </div>
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as any)}
              className="text-xs font-bold text-[#756F7A] hover:text-[#23212A] flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali</span>
            </button>
          )}
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ====================================================================
            LANGKAH 1: IDENTITAS PENGGUNA
            ==================================================================== */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-[#51465B] text-white flex items-center justify-center mb-4 shadow-sm">
                <User className="w-6 h-6 text-[#FFD36D]" />
              </div>
              <h2 className="text-2xl font-black text-[#23212A]">Siapa nama Anda?</h2>
              <p className="text-sm text-[#756F7A] mt-1">
                Nama ini akan dicantumkan pada naskah soal dan materi pembelajaran yang Anda susun.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#756F7A] mb-2">
                Nama Lengkap / Nama Tampilan
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Contoh: Budi Santoso, S.Pd."
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-[#E9E5E8] focus:border-[#51465B] focus:outline-hidden text-base font-semibold text-[#23212A] transition-colors"
                autoFocus
              />
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={handleNextStep}
                className="w-full py-4 rounded-2xl bg-[#51465B] hover:bg-[#3E3547] text-white font-extrabold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Lanjutkan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Switch to Student Flow */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setRoleMode("STUDENT");
                  router.push("/student/dashboard");
                }}
                className="text-xs text-[#756F7A] hover:text-[#51465B] font-semibold underline underline-offset-4"
              >
                Saya adalah Murid SD yang ingin mengerjakan ujian &rarr;
              </button>
            </div>
          </div>
        )}

        {/* ====================================================================
            LANGKAH 2: JENIS PENGGUNAAN (PERORANGAN VS SEKOLAH)
            ==================================================================== */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-[#23212A]">Pilih Jenis Penggunaan</h2>
              <p className="text-sm text-[#756F7A] mt-1">
                Sesuaikan kebutuhan pembuatan materi pembelajaran Anda.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Option 1: Perorangan */}
              <button
                type="button"
                onClick={() => setUsageMode("individual")}
                className={`p-5 rounded-2xl border-2 text-left transition-all flex items-start gap-4 ${
                  usageMode === "individual"
                    ? "border-[#51465B] bg-[#51465B]/5 shadow-xs"
                    : "border-[#E9E5E8] hover:border-slate-300 bg-white"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    usageMode === "individual" ? "bg-[#51465B] text-white" : "bg-[#FAF7F3] text-[#756F7A]"
                  }`}
                >
                  <UserCheck className="w-6 h-6 text-[#FFD36D]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-base text-[#23212A]">Perorangan</span>
                    {usageMode === "individual" && <CheckCircle2 className="w-5 h-5 text-[#51465B]" />}
                  </div>
                  <p className="text-xs sm:text-sm text-[#756F7A] mt-1 leading-relaxed">
                    Untuk guru mandiri, tutor les, orang tua, atau pengajar bimbel yang ingin membuat soal dan materi pembelajaran kontekstual secara cepat.
                  </p>
                </div>
              </button>

              {/* Option 2: Sekolah */}
              <button
                type="button"
                onClick={() => setUsageMode("school")}
                className={`p-5 rounded-2xl border-2 text-left transition-all flex items-start gap-4 ${
                  usageMode === "school"
                    ? "border-[#51465B] bg-[#51465B]/5 shadow-xs"
                    : "border-[#E9E5E8] hover:border-slate-300 bg-white"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    usageMode === "school" ? "bg-[#51465B] text-white" : "bg-[#FAF7F3] text-[#756F7A]"
                  }`}
                >
                  <Building2 className="w-6 h-6 text-[#F47D83]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-base text-[#23212A]">Sekolah / Institusi</span>
                    {usageMode === "school" && <CheckCircle2 className="w-5 h-5 text-[#51465B]" />}
                  </div>
                  <p className="text-xs sm:text-sm text-[#756F7A] mt-1 leading-relaxed">
                    Untuk guru sekolah yang mengelola kelas formal, bank soal instansi, membagikan ujian daring, dan merekap penilaian kelas 5 SD.
                  </p>
                </div>
              </button>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={handleNextStep}
                className="w-full py-4 rounded-2xl bg-[#51465B] hover:bg-[#3E3547] text-white font-extrabold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Lanjutkan ke Penentuan Lokasi</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ====================================================================
            LANGKAH 3: LOKASI & KONTEKS WILAYAH
            ==================================================================== */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-[#23212A]">Wilayah Pembelajaran Siswa</h2>
              <p className="text-sm text-[#756F7A] mt-1">
                AI akan merujuk data komoditas, lingkungan alam, dan cagar budaya dari wilayah yang Anda pilih.
              </p>
            </div>

            {/* Geolocation Button Assistance */}
            <div className="p-4 rounded-2xl bg-[#FAF7F3] border border-[#E9E5E8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Compass className="w-5 h-5 text-[#F47D83]" />
                <div>
                  <div className="text-xs font-bold text-[#23212A]">Bantuan Deteksi Lokasi</div>
                  <div className="text-[11px] text-[#756F7A]">Gunakan sensor perangkat untuk rekomendasi wilayah</div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={isLocating}
                className="px-3.5 py-2 rounded-xl bg-white border border-[#E9E5E8] text-xs font-bold text-[#51465B] hover:border-[#51465B] transition-colors shrink-0"
              >
                {isLocating ? "Mendeteksi..." : "Gunakan Lokasi Perangkat"}
              </button>
            </div>

            {gpsNotice && (
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs">
                {gpsNotice}
              </div>
            )}

            {/* Location Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#756F7A] mb-2">
                  Provinsi
                </label>
                <select
                  value={selectedProvince}
                  onChange={(e) => {
                    const prov = e.target.value as "Jawa Timur" | "Jawa Tengah";
                    setSelectedProvince(prov);
                    const firstRegion = SUPPORTED_REGIONS.find((r) => r.province === prov);
                    if (firstRegion) setSelectedRegionId(firstRegion.code);
                  }}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-[#E9E5E8] focus:border-[#51465B] focus:outline-hidden text-sm font-bold text-[#23212A] bg-white"
                >
                  <option value="Jawa Timur">Jawa Timur</option>
                  <option value="Jawa Tengah">Jawa Tengah</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#756F7A] mb-2">
                  Kabupaten / Kota
                </label>
                <select
                  value={selectedRegionId}
                  onChange={(e) => setSelectedRegionId(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-[#E9E5E8] focus:border-[#51465B] focus:outline-hidden text-sm font-bold text-[#23212A] bg-white"
                >
                  {availableRegions.map((r) => (
                    <option key={r.code} value={r.code}>
                      {r.name} ({r.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* School Name & Verification (only if School mode) */}
            {usageMode === "school" && (
              <div className="space-y-4 pt-2 border-t border-[#E9E5E8]">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#756F7A] mb-2">
                    Nama Sekolah SD
                  </label>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="Contoh: SD Negeri 1 Kartoharjo"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-[#E9E5E8] focus:border-[#51465B] focus:outline-hidden text-sm font-medium text-[#23212A]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#756F7A] mb-2">
                    Kode Sandi Guru (Verifikasi Tim Pengajar)
                  </label>
                  <input
                    type="text"
                    value={teacherPasscode}
                    onChange={(e) => setTeacherPasscode(e.target.value)}
                    placeholder="GURU-PAHAMI-2026"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-[#E9E5E8] focus:border-[#51465B] focus:outline-hidden text-sm font-mono text-[#23212A]"
                    required
                  />
                  <p className="text-[11px] text-[#756F7A] mt-1">
                    Gunakan kode bawaan pengujian prototipe: <code className="bg-[#FAF7F3] px-1 py-0.5 rounded font-bold">GURU-PAHAMI-2026</code>
                  </p>
                </div>
              </div>
            )}

            <div className="pt-4">
              <button
                type="button"
                onClick={handleNextStep}
                className="w-full py-4 rounded-2xl bg-[#51465B] hover:bg-[#3E3547] text-white font-extrabold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Lanjutkan ke Konfirmasi Ringkasan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ====================================================================
            LANGKAH 4: KONFIRMASI RINGKASAN DATA
            ==================================================================== */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#51465B] text-white flex items-center justify-center mb-4 shadow-sm">
                <CheckCircle2 className="w-6 h-6 text-[#FFD36D]" />
              </div>
              <h2 className="text-2xl font-black text-[#23212A]">Konfirmasi Ringkasan Akun</h2>
              <p className="text-sm text-[#756F7A] mt-1">
                Periksa kembali data Anda sebelum mulai menggunakan workspace pembelajaran kontekstual PAHAMI.
              </p>
            </div>

            {/* Summary Cards */}
            <div className="p-5 rounded-2xl bg-[#FAF7F3] border border-[#E9E5E8] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E9E5E8]">
                <span className="text-xs font-bold text-[#756F7A]">Nama Lengkap</span>
                <span className="text-sm font-extrabold text-[#23212A]">{fullName}</span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-[#E9E5E8]">
                <span className="text-xs font-bold text-[#756F7A]">Jenis Penggunaan</span>
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-[#51465B]/10 text-[#51465B]">
                  {usageMode === "school" ? "Sekolah / Institusi Formal" : "Perorangan (Guru Mandiri)"}
                </span>
              </div>

              {usageMode === "school" && (
                <div className="flex items-center justify-between pb-3 border-b border-[#E9E5E8]">
                  <span className="text-xs font-bold text-[#756F7A]">Nama Sekolah</span>
                  <span className="text-sm font-bold text-[#23212A]">{schoolName}</span>
                </div>
              )}

              <div className="flex items-center justify-between pb-3 border-b border-[#E9E5E8]">
                <span className="text-xs font-bold text-[#756F7A]">Wilayah Pembelajaran</span>
                <span className="text-sm font-extrabold text-[#51465B] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#F47D83]" />
                  <span>{regionName} ({selectedProvince})</span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#756F7A]">Jenjang Pendidikan</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-[#FFD36D]/30 text-[#51465B]">
                  SD Kelas 5 (Fase C)
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-[#51465B] hover:bg-[#3E3547] text-white font-extrabold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Menyiapkan Workspace Pembelajaran...</span>
                ) : (
                  <>
                    <span>Mulai Menggunakan PAHAMI</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
