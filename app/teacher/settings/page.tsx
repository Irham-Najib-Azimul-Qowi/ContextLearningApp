"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Settings,
  User,
  School as SchoolIcon,
  MapPin,
  LogOut,
  CheckCircle2,
  Camera,
  Compass,
  Building2,
} from "lucide-react";
import { TeacherWorkspaceShell } from "@/components/layout/teacher-workspace-shell";
import { repository } from "@/lib/db/repository";
import { School, UserProfile } from "@/lib/db/types";
import { createClient } from "@/lib/supabase/client";

const SUPPORTED_REGIONS = [
  { code: "35.77", name: "Kota Madiun", province: "Jawa Timur", centerCoords: [-7.6298, 111.5239] },
  { code: "35.19", name: "Kabupaten Madiun", province: "Jawa Timur", centerCoords: [-7.5583, 111.6577] },
  { code: "35.21", name: "Kabupaten Ngawi", province: "Jawa Timur", centerCoords: [-7.4039, 111.4452] },
  { code: "35.20", name: "Kabupaten Magetan", province: "Jawa Timur", centerCoords: [-7.6528, 111.3283] },
  { code: "35.02", name: "Kabupaten Ponorogo", province: "Jawa Timur", centerCoords: [-7.8692, 111.4622] },
  { code: "35.01", name: "Kabupaten Pacitan", province: "Jawa Timur", centerCoords: [-8.2044, 111.0924] },
  { code: "33.74", name: "Kota Semarang", province: "Jawa Tengah", centerCoords: [-6.9667, 110.4167] },
];

const AVATAR_OPTIONS = [
  "/images/dashboard/teacher-avatar.jpg",
  "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
];

export default function TeacherSettingsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formAvatar, setFormAvatar] = useState("");
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [usageMode, setUsageMode] = useState<"school" | "individual">("school");
  const [formSchoolName, setFormSchoolName] = useState("");
  const [formProvince, setFormProvince] = useState<string>("Jawa Timur");
  const [formRegionId, setFormRegionId] = useState<string>("35.77");
  const [isLocating, setIsLocating] = useState(false);
  const [gpsNotice, setGpsNotice] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const user = repository.getCurrentUser();
    setCurrentUser(user);
    setFormName(user.full_name || "");
    setFormEmail(user.email || "");
    setFormAvatar(user.avatar_url || "/images/dashboard/teacher-avatar.jpg");

    const school = repository.getActiveSchool();
    setFormSchoolName(school.name);
    setFormRegionId(school.region_id);

    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("pahami_v2_teacher_profile");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.schoolName) setFormSchoolName(parsed.schoolName);
          if (parsed.usageMode) setUsageMode(parsed.usageMode);
          if (parsed.regionId) setFormRegionId(parsed.regionId);
          if (parsed.province) setFormProvince(parsed.province);
        }
      } catch {
        // Fallback
      }
    }
  }, []);

  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      setGpsNotice("Peramban Anda tidak mendukung sensor GPS Geolocation.");
      return;
    }

    setIsLocating(true);
    setGpsNotice(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
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

        setFormProvince(closest.province);
        setFormRegionId(closest.code);
        setIsLocating(false);
        setGpsNotice(`Lokasi terdeteksi via GPS: ${closest.name} (${closest.province}).`);
      },
      () => {
        setIsLocating(false);
        setGpsNotice("Izin lokasi GPS tidak diberikan. Silakan pilih wilayah manual.");
      },
      { timeout: 8000 }
    );
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const matchedRegion = SUPPORTED_REGIONS.find((r) => r.code === formRegionId);
    const regionName = matchedRegion ? matchedRegion.name : "Kota Madiun";
    const cleanSchoolName = usageMode === "school" ? formSchoolName.trim() : `Workspace Mandiri (${formName.trim()})`;

    repository.updateUserProfile({
      full_name: formName.trim(),
      avatar_url: formAvatar,
      schoolName: cleanSchoolName,
      usageMode,
      regionId: formRegionId,
      regionName,
      province: formProvince,
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Sign out exception:", e);
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("pahami_v2_onboarding_completed");
    }
    router.push("/login");
  };

  const availableRegions = SUPPORTED_REGIONS.filter((r) => r.province === formProvince);

  return (
    <TeacherWorkspaceShell activeGroupId="settings">
      <div className="max-w-3xl mx-auto space-y-6 pb-12">
        {/* Header */}
        <div className="bg-white rounded-[28px] sm:rounded-[36px] border border-[#E9E5E8] p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#51465B] text-[#FFD36D] flex items-center justify-center shadow-xs">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#23212A] tracking-tight">
                Pengaturan Profil & Workspace
              </h1>
              <p className="text-xs text-[#756F7A] mt-0.5">
                Kelola identitas pengajar, nama sekolah, dan wilayah pembelajaran kontekstual.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* Card 1: User Profile & Gambar Profil */}
          <div className="bg-white rounded-[28px] sm:rounded-[36px] border border-[#E9E5E8] p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#E9E5E8]">
              <User className="w-4 h-4 text-[#51465B]" />
              <h2 className="text-sm font-extrabold text-[#23212A] uppercase tracking-wider">
                Profil Pengguna
              </h2>
            </div>

            {/* Avatar Row */}
            <div className="flex items-center gap-4 pt-1">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-[#51465B] shadow-xs shrink-0 bg-slate-100">
                <img
                  src={formAvatar || "/images/dashboard/teacher-avatar.jpg"}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                  className="py-1.5 px-3.5 rounded-xl bg-white border border-slate-200 hover:border-[#51465B] text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <Camera className="w-3.5 h-3.5 text-[#51465B]" />
                  <span>{showAvatarPicker ? "Tutup Pilihan Foto" : "Ganti Gambar Profil"}</span>
                </button>
                <p className="text-[11px] text-[#756F7A]">Pilih avatar yang mewakili Anda</p>
              </div>
            </div>

            {/* Avatar Picker Presets */}
            {showAvatarPicker && (
              <div className="p-3 rounded-2xl bg-[#FAF7F3] border border-[#E9E5E8] flex items-center gap-3 flex-wrap">
                {AVATAR_OPTIONS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setFormAvatar(url);
                      setShowAvatarPicker(false);
                    }}
                    className={`w-12 h-12 rounded-full overflow-hidden border-2 cursor-pointer transition-all ${
                      formAvatar === url ? "border-[#51465B] ring-2 ring-[#FFD36D]" : "border-slate-300 hover:scale-105"
                    }`}
                  >
                    <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Nama & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-[#23212A] mb-1.5">
                  Nama Lengkap & Gelar
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Ibu Siti Aminah, S.Pd."
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F3] border border-[#E9E5E8] rounded-xl text-xs font-semibold text-[#23212A] focus:outline-none focus:ring-2 focus:ring-[#51465B]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#23212A] mb-1.5">
                  Alamat Email (Google)
                </label>
                <input
                  type="email"
                  disabled
                  value={formEmail}
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-[#E9E5E8] rounded-xl text-xs font-mono text-[#756F7A] cursor-not-allowed"
                />
              </div>
            </div>

            {/* ===============================================================
                TOMBOL LOGOUT (TEPAT DI BAWAH NAMA USER SESUAI PERMINTAAN)
                =============================================================== */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-rose-200 bg-rose-50/80 text-rose-700 hover:bg-rose-100 hover:border-rose-300 font-bold text-xs transition-colors cursor-pointer shadow-2xs"
              >
                <LogOut className="w-4 h-4 text-rose-600" />
                <span>Keluar Akun (Logout)</span>
              </button>
            </div>
          </div>

          {/* Card 2: Penggunaan & Nama Sekolah */}
          <div className="bg-white rounded-[28px] sm:rounded-[36px] border border-[#E9E5E8] p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#E9E5E8]">
              <SchoolIcon className="w-4 h-4 text-[#51465B]" />
              <h2 className="text-sm font-extrabold text-[#23212A] uppercase tracking-wider">
                Satuan Pendidikan / Penggunaan
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setUsageMode("school")}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  usageMode === "school"
                    ? "bg-[#51465B] text-white shadow-xs"
                    : "bg-[#FAF7F3] border border-[#E9E5E8] text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Sekolah (SD)</span>
              </button>
              <button
                type="button"
                onClick={() => setUsageMode("individual")}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  usageMode === "individual"
                    ? "bg-[#51465B] text-white shadow-xs"
                    : "bg-[#FAF7F3] border border-[#E9E5E8] text-slate-700 hover:bg-slate-100"
                }`}
              >
                <User className="w-4 h-4" />
                <span>Mandiri / Privat</span>
              </button>
            </div>

            {usageMode === "school" && (
              <div className="pt-2">
                <label className="block text-xs font-bold text-[#23212A] mb-1.5">
                  Nama Sekolah
                </label>
                <input
                  type="text"
                  required
                  value={formSchoolName}
                  onChange={(e) => setFormSchoolName(e.target.value)}
                  placeholder="Contoh: SD Negeri 1 Madiun"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F3] border border-[#E9E5E8] rounded-xl text-xs font-semibold text-[#23212A] focus:outline-none focus:ring-2 focus:ring-[#51465B]/20"
                />
              </div>
            )}
          </div>

          {/* Card 3: Lokasi & Sinkronisasi GPS Device */}
          <div className="bg-white rounded-[28px] sm:rounded-[36px] border border-[#E9E5E8] p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9E5E8]">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#F47D83]" />
                <h2 className="text-sm font-extrabold text-[#23212A] uppercase tracking-wider">
                  Wilayah Konteks Pembelajaran
                </h2>
              </div>
            </div>

            {/* Tombol Sync GPS Device */}
            <button
              type="button"
              onClick={handleDetectGps}
              disabled={isLocating}
              className="w-full py-2.5 px-4 rounded-2xl border border-[#51465B]/20 bg-[#51465B]/5 hover:bg-[#51465B]/10 text-[#51465B] font-black text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
            >
              <Compass className={`w-4 h-4 text-[#51465B] ${isLocating ? "animate-spin" : ""}`} />
              <span>{isLocating ? "Mendeteksi Koordinat GPS..." : "Sinkronkan dengan Lokasi GPS Perangkat"}</span>
            </button>

            {gpsNotice && (
              <div className="p-3 rounded-2xl bg-[#FFD36D]/20 border border-[#FFD36D] text-[#51465B] text-xs font-bold leading-relaxed">
                {gpsNotice}
              </div>
            )}

            {/* Input Manual Lokasi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-[#23212A] mb-1.5">
                  Provinsi
                </label>
                <select
                  value={formProvince}
                  onChange={(e) => {
                    const newProv = e.target.value as "Jawa Timur" | "Jawa Tengah";
                    setFormProvince(newProv);
                    const firstReg = SUPPORTED_REGIONS.find((r) => r.province === newProv);
                    if (firstReg) setFormRegionId(firstReg.code);
                  }}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F3] border border-[#E9E5E8] rounded-xl text-xs font-semibold text-[#23212A]"
                >
                  <option value="Jawa Timur">Jawa Timur</option>
                  <option value="Jawa Tengah">Jawa Tengah</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#23212A] mb-1.5">
                  Kabupaten / Kota
                </label>
                <select
                  value={formRegionId}
                  onChange={(e) => setFormRegionId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F3] border border-[#E9E5E8] rounded-xl text-xs font-semibold text-[#23212A]"
                >
                  {availableRegions.map((reg) => (
                    <option key={reg.code} value={reg.code}>
                      {reg.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {isSaved && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Pengaturan profil dan wilayah berhasil disimpan!</span>
            </div>
          )}

          {/* Tombol Aksi Sesuai Kaidah UI/UX (Batal vs Simpan) */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push("/teacher/dashboard")}
              className="py-3 px-6 rounded-2xl border border-[#E9E5E8] bg-white hover:bg-slate-100 text-[#756F7A] font-bold text-xs transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="py-3 px-7 rounded-2xl bg-[#51465B] hover:bg-[#3D3445] text-white font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </TeacherWorkspaceShell>
  );
}
