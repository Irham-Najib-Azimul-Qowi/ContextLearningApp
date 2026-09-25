"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Settings,
  LogOut,
  X,
  Compass,
  MapPin,
  Camera,
  Check,
  User,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { repository } from "@/lib/db/repository";
import { School, AppNotification, UserProfile } from "@/lib/db/types";
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

interface GlobalControlsProps {
  contextMode?: "material" | "question";
}

export function GlobalControls({ contextMode: propContextMode }: GlobalControlsProps) {
  const router = useRouter();
  const [activeSchool, setActiveSchool] = useState<School | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Theme mode ("material" = #51465B, "question" = #FFD36D)
  const [activeMode, setActiveMode] = useState<"material" | "question">("material");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isNotifMenuOpen, setIsNotifMenuOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Settings form states
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formAvatar, setFormAvatar] = useState("");
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [usageMode, setUsageMode] = useState<"school" | "individual">("school");
  const [formSchoolName, setFormSchoolName] = useState("");
  const [formProvince, setFormProvince] = useState<string>("Jawa Timur");
  const [formRegionId, setFormRegionId] = useState<string>("35.77");
  const [formDistrict, setFormDistrict] = useState<string>("");
  const [isLocating, setIsLocating] = useState(false);
  const [gpsNotice, setGpsNotice] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const loadUserData = () => {
    const active = repository.getActiveSchool();
    setActiveSchool(active);

    const user = repository.getCurrentUser();
    setCurrentUser(user);

    setFormName(user.full_name || "");
    setFormEmail(user.email || "");
    setFormAvatar(user.avatar_url || "/images/dashboard/teacher-avatar.jpg");

    // Check stored profile for school details
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("pahami_v2_teacher_profile");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.schoolName) setFormSchoolName(parsed.schoolName);
          else setFormSchoolName(active.name);
          if (parsed.usageMode) setUsageMode(parsed.usageMode);
          if (parsed.regionId) setFormRegionId(parsed.regionId);
          if (parsed.province) setFormProvince(parsed.province);
        } else {
          setFormSchoolName(active.name);
          setFormRegionId(active.region_id);
        }
      } catch {
        setFormSchoolName(active.name);
      }
    }

    const notifs = repository.getNotifications(user.id);
    setNotifications(notifs);
    setUnreadCount(notifs.filter((n) => !n.read).length);
  };

  useEffect(() => {
    loadUserData();

    // Initial context mode
    const initialMode = propContextMode || repository.getLastContextMode();
    setActiveMode(initialMode);

    const handleContextChange = (e: any) => {
      if (e.detail) setActiveMode(e.detail);
    };
    const handleProfileChange = () => {
      loadUserData();
    };

    window.addEventListener("contextModeChange", handleContextChange);
    window.addEventListener("userProfileChange", handleProfileChange);
    return () => {
      window.removeEventListener("contextModeChange", handleContextChange);
      window.removeEventListener("userProfileChange", handleProfileChange);
    };
  }, [propContextMode]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsNotifMenuOpen(false);
        setIsExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleMarkNotifRead = (id: string) => {
    repository.markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  // GPS Geolocation Detection
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
        setGpsNotice("Izin lokasi GPS tidak diberikan. Anda dapat memilih wilayah manual di bawah.");
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

    // Update profile & active school via repository
    repository.updateUserProfile({
      full_name: formName.trim(),
      avatar_url: formAvatar,
      schoolName: cleanSchoolName,
      usageMode,
      regionId: formRegionId,
      regionName,
      province: formProvince,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setIsSettingsModalOpen(false);
    }, 1200);
  };

  const isQuestion = activeMode === "question";
  const pillWrapperClass = isQuestion
    ? "bg-[#FFD36D] text-[#251E2B] border-2 border-[#ECC159] shadow-2xl"
    : "bg-[#51465B] text-white border-2 border-[#6A5D75] shadow-2xl";

  const iconButtonHoverClass = isQuestion
    ? "hover:bg-black/10 active:bg-black/15 text-[#251E2B]"
    : "hover:bg-white/20 active:bg-white/30 text-white";

  const availableRegions = SUPPORTED_REGIONS.filter((r) => r.province === formProvince);

  return (
    <>
      <div
        ref={containerRef}
        className="fixed top-4 right-4 sm:right-6 z-50 select-none flex items-center gap-2 justify-end"
        aria-label="Kontrol Utama Pengguna"
      >
        {/* Menu Notifikasi & Setting di sampingnya (muncul saat avatar diklik) */}
        {isExpanded && (
          <div
            className={`flex items-center gap-1.5 p-1 rounded-full ${pillWrapperClass} backdrop-blur-md shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-right-3`}
          >
            {/* 1. NOTIFIKASI BUTTON */}
            <div className="relative inline-flex items-center justify-center">
              <button
                type="button"
                onClick={() => setIsNotifMenuOpen(!isNotifMenuOpen)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer relative ${iconButtonHoverClass} ${
                  isNotifMenuOpen ? (isQuestion ? "bg-black/15" : "bg-white/25") : ""
                }`}
                title="Notifikasi"
                aria-label="Buka Notifikasi"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
              </button>

              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 z-30 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white shadow-xs pointer-events-none">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}

              {/* Notifications Dropdown Panel */}
              {isNotifMenuOpen && (
                <div className="absolute right-0 top-full mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 text-left text-slate-800">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-900">Notifikasi</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-bold bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full">
                        {unreadCount} baru
                      </span>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 mt-1">
                    {notifications.length === 0 ? (
                      <div className="py-5 text-center text-xs text-slate-500">
                        Tidak ada notifikasi saat ini.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => handleMarkNotifRead(notif.id)}
                          className={`p-2.5 rounded-xl text-xs cursor-pointer transition-colors ${
                            notif.read ? "opacity-70 hover:bg-slate-50" : "bg-amber-50/60 hover:bg-amber-50"
                          }`}
                        >
                          <div className="font-bold text-slate-900">{notif.title}</div>
                          <div className="text-[11px] text-slate-600 mt-0.5">{notif.message}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 2. SETTINGS BUTTON */}
            <button
              type="button"
              onClick={() => {
                loadUserData();
                setIsSettingsModalOpen(true);
                setIsNotifMenuOpen(false);
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${iconButtonHoverClass}`}
              title="Pengaturan"
              aria-label="Buka Pengaturan"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
            </button>
          </div>
        )}

        {/* LINGKARAN PROFIL UTAMA (GAMBAR PROFIL AKTIF) */}
        <div className="relative inline-flex items-center justify-center shrink-0">
          <button
            type="button"
            onClick={() => {
              setIsExpanded(!isExpanded);
              if (isExpanded) setIsNotifMenuOpen(false);
            }}
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer p-0 bg-[#3E3547] ${
              isExpanded
                ? isQuestion
                  ? "border-[#251E2B] ring-2 ring-[#251E2B]/40 scale-105"
                  : "border-white ring-2 ring-[#FFD36D] scale-105"
                : isQuestion
                ? "border-[#251E2B]/40 hover:border-[#251E2B]"
                : "border-white/90 hover:border-white"
            }`}
            title={isExpanded ? "Tutup menu samping" : "Klik untuk membuka notifikasi dan pengaturan"}
            aria-label="Profil Pengguna"
          >
            <img
              src={currentUser?.avatar_url || "/images/dashboard/teacher-avatar.jpg"}
              alt="Foto Profil"
              className="w-full h-full object-cover rounded-full pointer-events-none select-none block"
            />
          </button>

          {!isExpanded && unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 z-30 min-w-5 h-5 px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white shadow-md pointer-events-none animate-bounce">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>
      </div>

      {/* =====================================================================
          OVERLAY SCREEN SETTINGS (SESUAI PERMINTAAN USER & UI/UX RULES)
          - Atur Nama User
          - Atur Gambar Profil
          - Tombol Logout di bawah nama user
          - Atur Nama Sekolah (jika mode sekolah)
          - Atur Lokasi (Input manual / Sync GPS Device)
          - HAPUS Model AI aktif, data kontekstual, konfigurasi konteks
          - Tombol Batal & Simpan Perubahan yang jelas
          ===================================================================== */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-[28px] sm:rounded-[36px] border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-7 relative animate-in fade-in zoom-in-95 my-auto max-h-[92vh] overflow-y-auto">
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#51465B] text-[#FFD36D] flex items-center justify-center shadow-xs">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    Pengaturan Profil & Workspace
                  </h3>
                  <p className="text-xs text-slate-500">Sesuaikan identitas, sekolah, dan wilayah pengajaran</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                title="Tutup Pengaturan"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-5 pt-4">
              {/* =============================================================
                  1. SEKSI PROFIL USER & GAMBAR PROFIL
                  ============================================================= */}
              <div className="p-4 rounded-2xl bg-[#FAF7F3] border border-[#E9E5E8] space-y-3.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#51465B] block">
                  Identitas Pengguna
                </span>

                {/* Avatar Row */}
                <div className="flex items-center gap-3.5">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#51465B] shadow-xs shrink-0 bg-slate-100">
                    <img
                      src={formAvatar || "/images/dashboard/teacher-avatar.jpg"}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <button
                      type="button"
                      onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                      className="py-1.5 px-3 rounded-xl bg-white border border-slate-200 hover:border-[#51465B] text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Camera className="w-3.5 h-3.5 text-[#51465B]" />
                      <span>{showAvatarPicker ? "Tutup Pilihan Foto" : "Ganti Gambar Profil"}</span>
                    </button>
                    <p className="text-[11px] text-slate-500">Pilih salah satu avatar yang tersedia</p>
                  </div>
                </div>

                {/* Avatar Picker Presets */}
                {showAvatarPicker && (
                  <div className="pt-2 pb-1 border-t border-slate-200/60 flex items-center gap-3 flex-wrap">
                    {AVATAR_OPTIONS.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setFormAvatar(url);
                          setShowAvatarPicker(false);
                        }}
                        className={`w-11 h-11 rounded-full overflow-hidden border-2 cursor-pointer transition-all ${
                          formAvatar === url ? "border-[#51465B] ring-2 ring-[#FFD36D]" : "border-slate-300 hover:scale-105"
                        }`}
                      >
                        <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Input Nama User */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Nama Lengkap & Gelar
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Contoh: Ibu Siti Aminah, S.Pd."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#51465B]/20"
                  />
                </div>

                {/* Input Email (Readonly) */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    Alamat Email (Google)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={formEmail || "guru@depaskan.id"}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-100 text-xs font-medium text-slate-500 cursor-not-allowed"
                  />
                </div>

                {/* ===========================================================
                    TOMBOL LOGOUT (TEPAT DI BAWAH NAMA USER SESUAI PERMINTAAN)
                    =========================================================== */}
                <div className="pt-1">
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

              {/* =============================================================
                  2. SEKSI SEKOLAH & PENGGUNAAN
                  ============================================================= */}
              <div className="p-4 rounded-2xl bg-[#FAF7F3] border border-[#E9E5E8] space-y-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#51465B] block">
                  Jenis Penggunaan
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setUsageMode("school")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      usageMode === "school"
                        ? "bg-[#51465B] text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Sekolah (SD)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUsageMode("individual")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      usageMode === "individual"
                        ? "bg-[#51465B] text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Mandiri / Privat</span>
                  </button>
                </div>

                {usageMode === "school" && (
                  <div className="pt-1">
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Nama Sekolah
                    </label>
                    <input
                      type="text"
                      required
                      value={formSchoolName}
                      onChange={(e) => setFormSchoolName(e.target.value)}
                      placeholder="Contoh: SD Negeri 1 Madiun"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#51465B]/20"
                    />
                  </div>
                )}
              </div>

              {/* =============================================================
                  3. SEKSI LOKASI & SINKRONISASI GPS DEVICE
                  ============================================================= */}
              <div className="p-4 rounded-2xl bg-[#FAF7F3] border border-[#E9E5E8] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#51465B] block">
                    Wilayah Konteks Pembelajaran
                  </span>
                  <MapPin className="w-4 h-4 text-[#F47D83]" />
                </div>

                {/* Tombol Sync GPS Device */}
                <button
                  type="button"
                  onClick={handleDetectGps}
                  disabled={isLocating}
                  className="w-full py-2.5 px-3.5 rounded-2xl border border-[#51465B]/20 bg-[#51465B]/5 hover:bg-[#51465B]/10 text-[#51465B] font-black text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
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
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                    >
                      <option value="Jawa Timur">Jawa Timur</option>
                      <option value="Jawa Tengah">Jawa Tengah</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Kabupaten / Kota
                    </label>
                    <select
                      value={formRegionId}
                      onChange={(e) => setFormRegionId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
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

              {savedSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Pengaturan profil dan lokasi berhasil disimpan!</span>
                </div>
              )}

              {/* =============================================================
                  TOMBOL AKSI SESUAI KAIDAH UI/UX (BATAL VS SIMPAN)
                  ============================================================= */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="py-2.5 px-5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-xl bg-[#51465B] hover:bg-[#3D3445] text-white font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
