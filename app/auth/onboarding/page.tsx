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
import { createClient } from "@/lib/supabase/client";

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

type OnboardingStep = "name" | "usage" | "school_name" | "region" | "confirm";

export default function OnboardingPage() {
  const router = useRouter();

  // Multi-step flow: name -> usage -> (school_name if school) -> region -> confirm
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("name");
  const [roleMode, setRoleMode] = useState<"TEACHER" | "STUDENT">("TEACHER");
  const [usageMode, setUsageMode] = useState<"individual" | "school">("individual");

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [selectedProvince, setSelectedProvince] = useState<string>("Jawa Timur");
  const [selectedRegionId, setSelectedRegionId] = useState<string>("35.77");
  const [districtName, setDistrictName] = useState("");
  const [schoolName, setSchoolName] = useState("");
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
      const isCompleted = localStorage.getItem("pahami_v2_onboarding_completed");
      if (isCompleted === "true") {
        router.replace("/teacher/dashboard");
        return;
      }
      const intent = localStorage.getItem("pahami_user_intent") || "general";
      setUserIntent(intent);
    }

    // Auto-fill user name from Google account if logged in
    const fetchGoogleUserName = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const meta = user.user_metadata || {};
          const googleName =
            meta.full_name ||
            meta.name ||
            meta.display_name ||
            meta.user_name;
          if (googleName && typeof googleName === "string" && googleName.trim()) {
            setFullName(googleName.trim());
          }
        }
      } catch {
        // Fallback silently if offline or mock
      }
    };

    fetchGoogleUserName();
  }, [router]);

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

  const stepsList: OnboardingStep[] =
    usageMode === "school"
      ? ["name", "usage", "school_name", "region", "confirm"]
      : ["name", "usage", "region", "confirm"];

  const currentStepIndex = stepsList.indexOf(currentStep);

  const handleNextStep = () => {
    setErrorMessage(null);

    if (currentStep === "name") {
      if (!fullName.trim()) {
        setErrorMessage("Silakan masukkan nama lengkap Anda.");
        return;
      }
      setCurrentStep("usage");
    } else if (currentStep === "usage") {
      if (usageMode === "school") {
        setCurrentStep("school_name");
      } else {
        setCurrentStep("region");
      }
    } else if (currentStep === "school_name") {
      if (!schoolName.trim()) {
        setErrorMessage("Silakan masukkan nama sekolah SD Anda.");
        return;
      }
      setCurrentStep("region");
    } else if (currentStep === "region") {
      setCurrentStep("confirm");
    }
  };

  const handlePrevStep = () => {
    setErrorMessage(null);

    if (currentStep === "usage") {
      setCurrentStep("name");
    } else if (currentStep === "school_name") {
      setCurrentStep("usage");
    } else if (currentStep === "region") {
      if (usageMode === "school") {
        setCurrentStep("school_name");
      } else {
        setCurrentStep("usage");
      }
    } else if (currentStep === "confirm") {
      setCurrentStep("region");
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const matchedRegion = SUPPORTED_REGIONS.find((r) => r.code === selectedRegionId);
      const regionName = matchedRegion ? matchedRegion.name : "Kota Madiun";
      const cleanName = fullName.trim();
      const cleanSchoolName = usageMode === "school" ? schoolName.trim() : `Workspace Mandiri (${cleanName})`;
      const generatedSchoolId = usageMode === "school" ? `sch-${Date.now()}` : "school-individual";

      const res = await fetch("/api/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: roleMode,
          fullName: cleanName,
          usageMode,
          regionId: selectedRegionId,
          regionName,
          schoolId: generatedSchoolId,
          schoolName: cleanSchoolName,
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

      // Synchronize client-side repository and localStorage
      if (roleMode === "TEACHER") {
        const newSchool = {
          id: generatedSchoolId,
          name: cleanSchoolName,
          slug: cleanSchoolName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
          region_id: selectedRegionId,
          region_name: regionName,
          address: `${regionName}, ${selectedProvince}`,
          created_at: new Date().toISOString(),
        };
        repository.addSchool(newSchool);
        repository.setActiveSchoolId(generatedSchoolId);

        const newProfile = {
          id: `usr-${Date.now()}`,
          email: "guru@depaskan.id",
          full_name: cleanName,
          role: "TEACHER" as const,
          avatar_url: "/images/dashboard/teacher-avatar.jpg",
          school_id: generatedSchoolId,
        };
        repository.setCurrentUser(newProfile);

        if (typeof window !== "undefined") {
          localStorage.setItem("pahami_v2_onboarding_completed", "true");
          localStorage.setItem(
            "pahami_v2_teacher_profile",
            JSON.stringify({
              id: newProfile.id,
              fullName: cleanName,
              usageMode,
              schoolId: generatedSchoolId,
              schoolName: cleanSchoolName,
              regionId: selectedRegionId,
              regionName,
              province: selectedProvince,
            })
          );
        }
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
    <main className="min-h-screen bg-[#FAF7F3] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Subtle atmospheric ambient glow */}
      <div className="fixed -top-40 -left-40 w-96 h-96 rounded-full bg-[#3E3547]/15 blur-3xl pointer-events-none" />
      <div className="fixed top-1/2 -right-40 w-80 h-80 rounded-full bg-[#FFD36D]/15 blur-3xl pointer-events-none" />
      <div className="fixed -bottom-40 left-1/3 w-96 h-96 rounded-full bg-[#3E3547]/10 blur-3xl pointer-events-none" />

      {/* Consistent Card (Same 480px max-width & #3E3547 theme as Login) */}
      <div className="w-full max-w-[480px] bg-gradient-to-b from-[#3E3547] via-[#332A3B] to-[#251E2B] rounded-[32px] sm:rounded-[36px] border border-[#5A4F65] shadow-2xl p-7 sm:p-9 relative overflow-hidden text-white z-10">

        {/* Header: Pertanyaan Form & Progress Bar */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/15">
          <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
            {currentStep === "name" && "Siapa Nama Anda?"}
            {currentStep === "usage" && "Pilih Jenis Penggunaan"}
            {currentStep === "school_name" && "Masukkan Nama Sekolah"}
            {currentStep === "region" && "Pilih Wilayah Pembelajaran"}
            {currentStep === "confirm" && "Konfirmasi Ringkasan"}
          </h2>
          <div className="flex items-center gap-1.5 shrink-0">
            {stepsList.map((s, idx) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStepIndex
                    ? "w-6 bg-[#FFD36D]"
                    : idx < currentStepIndex
                      ? "w-2 bg-[#FFD36D]/50"
                      : "w-2 bg-white/20"
                  }`}
              />
            ))}
          </div>
        </div>

        {/* Error Alert Display */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-950/70 border border-rose-700/60 text-rose-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold">Perhatian: </span>
              {errorMessage}
            </div>
          </div>
        )}

        {/* ====================================================================
            LANGKAH 1: IDENTITAS PENGGUNA
            ==================================================================== */}
        {currentStep === "name" && (
          <div className="space-y-6 pt-2">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/10 text-white flex items-center justify-center border border-white/15 shadow-sm">
                <User className="w-8 h-8 text-[#FFD36D]" />
              </div>
            </div>

            <div>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleNextStep();
                }}
                placeholder="Masukkan nama Anda..."
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-white/20 bg-[#251E2B]/80 focus:border-[#FFD36D] focus:bg-[#1E1724] text-sm sm:text-base font-semibold text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFD36D]/20 transition-all shadow-inner"
                autoFocus
              />
            </div>

            {/* Bottom Navigation Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleNextStep}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#FFD36D] to-[#FDB040] hover:from-[#FFE085] hover:to-[#FFBD59] text-[#251E2B] font-extrabold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Lanjut</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ====================================================================
            LANGKAH 2: JENIS PENGGUNAAN (HORIZONTAL 2 CARDS)
            ==================================================================== */}
        {currentStep === "usage" && (
          <div className="space-y-5 pt-2">
            {/* 2 Opsi Horizontal: Ikon di atas, teks di bawah */}
            <div className="grid grid-cols-2 gap-3.5">
              {/* Option 1: Perorangan */}
              <button
                type="button"
                onClick={() => setUsageMode("individual")}
                className={`py-6 px-4 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-center relative cursor-pointer group ${usageMode === "individual"
                    ? "border-[#FFD36D] bg-white/15 ring-2 ring-[#FFD36D]/30 shadow-lg"
                    : "border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30"
                  }`}
              >
                {usageMode === "individual" && (
                  <CheckCircle2 className="w-4 h-4 text-[#FFD36D] absolute top-3 right-3" />
                )}
                {/* Ikon di atas */}
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-colors ${usageMode === "individual"
                      ? "bg-[#FFD36D] text-[#251E2B]"
                      : "bg-white/10 text-gray-300 group-hover:text-white"
                    }`}
                >
                  <UserCheck className="w-6 h-6" />
                </div>
                {/* Teks di bawahnya */}
                <div className="font-extrabold text-base text-white">
                  Perorangan
                </div>
              </button>

              {/* Option 2: Sekolah */}
              <button
                type="button"
                onClick={() => setUsageMode("school")}
                className={`py-6 px-4 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-center relative cursor-pointer group ${usageMode === "school"
                    ? "border-[#FFD36D] bg-white/15 ring-2 ring-[#FFD36D]/30 shadow-lg"
                    : "border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30"
                  }`}
              >
                {usageMode === "school" && (
                  <CheckCircle2 className="w-4 h-4 text-[#FFD36D] absolute top-3 right-3" />
                )}
                {/* Ikon di atas */}
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-colors ${usageMode === "school"
                      ? "bg-[#FFD36D] text-[#251E2B]"
                      : "bg-white/10 text-gray-300 group-hover:text-white"
                    }`}
                >
                  <Building2 className="w-6 h-6" />
                </div>
                {/* Teks di bawahnya */}
                <div className="font-extrabold text-base text-white">
                  Sekolah
                </div>
              </button>
            </div>

            {/* Bottom Navigation Buttons (Equal 50/50: Kembali & Lanjut) */}
            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={handlePrevStep}
                className="w-1/2 py-3.5 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm border border-white/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="w-1/2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#FFD36D] to-[#FDB040] hover:from-[#FFE085] hover:to-[#FFBD59] text-[#251E2B] font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Lanjut</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ====================================================================
            LANGKAH 3 (KHUSUS SEKOLAH): NAMA SEKOLAH SAJA (TANPA ID GURU)
            ==================================================================== */}
        {currentStep === "school_name" && (
          <div className="space-y-6 pt-2">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/10 text-white flex items-center justify-center border border-white/15 shadow-sm">
                <Building2 className="w-8 h-8 text-[#FFD36D]" />
              </div>
            </div>

            <div>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleNextStep();
                }}
                placeholder="Masukkan nama sekolah SD Anda..."
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-white/20 bg-[#251E2B]/80 focus:border-[#FFD36D] focus:bg-[#1E1724] text-sm sm:text-base font-semibold text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFD36D]/20 transition-all shadow-inner"
                autoFocus
              />
            </div>

            {/* Bottom Navigation Buttons (Equal 50/50: Kembali & Lanjut) */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handlePrevStep}
                className="w-1/2 py-3.5 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm border border-white/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="w-1/2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#FFD36D] to-[#FDB040] hover:from-[#FFE085] hover:to-[#FFBD59] text-[#251E2B] font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Lanjut</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ====================================================================
            LANGKAH: LOKASI & KONTEKS WILAYAH
            ==================================================================== */}
        {currentStep === "region" && (
          <div className="space-y-4 pt-1">
            {/* Clean compact GPS CTA button */}
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={isLocating}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-bold text-[#FFD36D] hover:text-white transition-all cursor-pointer disabled:opacity-50"
                title="Gunakan sensor GPS perangkat untuk rekomendasi wilayah"
              >
                <MapPin className="w-3.5 h-3.5 text-[#FFD36D]" />
                <span>{isLocating ? "Mencari lokasi..." : "Gunakan GPS"}</span>
              </button>
            </div>

            {gpsNotice && (
              <div className="p-3 rounded-xl bg-blue-950/70 border border-blue-700/60 text-blue-200 text-xs leading-relaxed">
                {gpsNotice}
              </div>
            )}

            {/* Location Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
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
                  className="w-full px-3.5 py-3 rounded-2xl border-2 border-white/20 focus:border-[#FFD36D] text-xs sm:text-sm font-bold text-white bg-[#251E2B] focus:outline-none transition-colors"
                >
                  <option value="Jawa Timur" className="bg-[#251E2B] text-white">Jawa Timur</option>
                  <option value="Jawa Tengah" className="bg-[#251E2B] text-white">Jawa Tengah</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                  Kabupaten / Kota
                </label>
                <select
                  value={selectedRegionId}
                  onChange={(e) => setSelectedRegionId(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-2xl border-2 border-white/20 focus:border-[#FFD36D] text-xs sm:text-sm font-bold text-white bg-[#251E2B] focus:outline-none transition-colors"
                >
                  {availableRegions.map((r) => (
                    <option key={r.code} value={r.code} className="bg-[#251E2B] text-white">
                      {r.name} ({r.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bottom Navigation Buttons (Equal 50/50: Kembali & Lanjut) */}
            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={handlePrevStep}
                className="w-1/2 py-3.5 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm border border-white/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="w-1/2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#FFD36D] to-[#FDB040] hover:from-[#FFE085] hover:to-[#FFBD59] text-[#251E2B] font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Lanjut</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ====================================================================
            LANGKAH: KONFIRMASI RINGKASAN DATA
            ==================================================================== */}
        {currentStep === "confirm" && (
          <div className="space-y-5 pt-1">
            {/* Summary Cards */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/15 space-y-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                <span className="text-xs font-medium text-gray-300">Nama Lengkap</span>
                <span className="text-xs sm:text-sm font-bold text-white">{fullName}</span>
              </div>

              <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                <span className="text-xs font-medium text-gray-300">Jenis Penggunaan</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FFD36D]/20 text-[#FFD36D] border border-[#FFD36D]/30">
                  {usageMode === "school" ? "Sekolah (Formal SD)" : "Perorangan (Mandiri)"}
                </span>
              </div>

              {usageMode === "school" && (
                <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                  <span className="text-xs font-medium text-gray-300">Nama Sekolah</span>
                  <span className="text-xs sm:text-sm font-semibold text-white">{schoolName}</span>
                </div>
              )}

              <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                <span className="text-xs font-medium text-gray-300">Wilayah Pembelajaran</span>
                <span className="text-xs sm:text-sm font-bold text-[#FFD36D] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#F47D83]" />
                  <span>{regionName} ({selectedProvince})</span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-300">Jenjang Pendidikan</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-white/10 text-white">
                  SD Kelas 5 (Fase C)
                </span>
              </div>
            </div>

            {/* Bottom Navigation Buttons (Equal 50/50: Kembali & Lanjut) */}
            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={handlePrevStep}
                className="w-1/2 py-3.5 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm border border-white/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={loading}
                className="w-1/2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#FFD36D] to-[#FDB040] hover:from-[#FFE085] hover:to-[#FFBD59] text-[#251E2B] font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-[#251E2B] border-t-transparent rounded-full animate-spin" />
                    <span>Menyimpan...</span>
                  </div>
                ) : (
                  <>
                    <span>Lanjut</span>
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
