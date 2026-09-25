"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  School as SchoolIcon,
  ChevronDown,
  Bell,
  Settings,
  User,
  LogOut,
  Sparkles,
  Check,
  X,
  GraduationCap,
} from "lucide-react";
import { repository } from "@/lib/db/repository";
import { School, AppNotification } from "@/lib/db/types";
import { createClient } from "@/lib/supabase/client";
import { PahamiPuzzleLogo } from "@/components/landing/puzzle-logo";

interface GlobalControlsProps {
  contextMode?: "material" | "question";
}

export function GlobalControls({ contextMode: propContextMode }: GlobalControlsProps) {
  const router = useRouter();
  const [schools, setSchools] = useState<School[]>([]);
  const [activeSchool, setActiveSchool] = useState<School | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Active theme context mode ("material" = #51465B, "question" = #FFD36D)
  const [activeMode, setActiveMode] = useState<"material" | "question">("material");

  // Floating controls expansion state: collapsed (circle only) vs expanded (pill wrapper)
  const [isExpanded, setIsExpanded] = useState(false);

  // Dropdown states
  const [isNotifMenuOpen, setIsNotifMenuOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Settings form states
  const [savedMessage, setSavedMessage] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const allSchools = repository.getSchools();
    setSchools(allSchools);
    const active = repository.getActiveSchool();
    setActiveSchool(active);

    const user = repository.getCurrentUser();
    setCurrentUser(user);

    const notifs = repository.getNotifications(user.id);
    setNotifications(notifs);
    setUnreadCount(notifs.filter((n) => !n.read).length);

    // Initial context mode
    const initialMode = propContextMode || repository.getLastContextMode();
    setActiveMode(initialMode);

    // Listen for context mode updates from preview tabs or route changes
    const handleContextChange = (e: any) => {
      if (e.detail) {
        setActiveMode(e.detail);
      }
    };
    window.addEventListener("contextModeChange", handleContextChange);
    return () => window.removeEventListener("contextModeChange", handleContextChange);
  }, [propContextMode]);

  // Keep in sync if prop changes
  useEffect(() => {
    if (propContextMode) {
      setActiveMode(propContextMode);
    }
  }, [propContextMode]);

  // Close dropdowns and collapse on outside click
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

  const handleSwitchToStudent = () => {
    repository.setCurrentRole("STUDENT");
    router.push("/student/dashboard");
  };

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Sign out exception:", e);
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

  const isQuestion = activeMode === "question";

  // Pill wrapper styles based on active feature
  const pillWrapperClass = isQuestion
    ? "bg-[#FFD36D] text-[#251E2B] border-2 border-[#ECC159] shadow-2xl"
    : "bg-[#51465B] text-white border-2 border-[#6A5D75] shadow-2xl";

  const iconButtonHoverClass = isQuestion
    ? "hover:bg-black/10 active:bg-black/15 text-[#251E2B]"
    : "hover:bg-white/20 active:bg-white/30 text-white";

  // Initials for avatar fallback
  const userInitials =
    currentUser?.full_name
      ?.split(" ")
      .slice(0, 2)
      .map((w: string) => w[0])
      .join("")
      .toUpperCase() || "DG";

  return (
    <>
      <div
        ref={containerRef}
        className="fixed top-4 right-4 sm:right-6 z-50 select-none flex items-center justify-end"
        aria-label="Kontrol Utama Ruang Kerja"
      >
        {/* ====================================================================
            1. COLLAPSED STATE: ONLY FLOATING CIRCULAR PROFILE AVATAR
            Badge is placed outside overflow-hidden container so it is NEVER clipped.
            ==================================================================== */}
        {!isExpanded ? (
          <div className="relative inline-flex items-center justify-center">
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="w-12 h-12 sm:w-13 sm:h-13 rounded-full border-2 border-white/90 shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 relative flex items-center justify-center cursor-pointer bg-gradient-to-tr from-[#3E3547] to-[#51465B] p-0"
              title="Buka Menu Guru (Notifikasi & Pengaturan)"
              aria-label="Buka Kontrol Profil dan Notifikasi"
            >
              <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                <img
                  src="/images/dashboard/teacher-avatar.jpg"
                  alt={currentUser?.full_name || "Profil Guru"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
                <span className="text-white font-extrabold text-xs">
                  {userInitials}
                </span>
              </div>
            </button>

            {/* Notification Badge on Profile Circle - OUTSIDE button & overflow-hidden (NEVER clipped) */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 z-30 min-w-5 h-5 px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white shadow-md pointer-events-none animate-bounce">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
        ) : (
          /* ====================================================================
             2. EXPANDED STATE: EXPANDS TO THE LEFT INTO A ROUNDED-FULL PILL
             Contains Notifikasi, Settings, and non-dropdown Profile Avatar.
             ==================================================================== */
          <div
            className={`flex items-center gap-3 py-2 px-3 rounded-full ${pillWrapperClass} backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-right-4`}
          >
            {/* 1. NOTIFIKASI BUTTON (Badge placed with ample space, NEVER clipped) */}
            <div className="relative inline-flex items-center justify-center">
              <button
                type="button"
                onClick={() => {
                  setIsNotifMenuOpen(!isNotifMenuOpen);
                }}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer relative ${iconButtonHoverClass}`}
                title="Notifikasi"
                aria-label="Buka Notifikasi"
              >
                <Bell className="w-5 h-5 stroke-[2.2]" />
              </button>

              {/* Notification Badge on Bell - NEVER clipped */}
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 z-30 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white shadow-xs pointer-events-none">
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
                setIsSettingsModalOpen(true);
                setIsNotifMenuOpen(false);
              }}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${iconButtonHoverClass}`}
              title="Pengaturan Workspace"
              aria-label="Buka Pengaturan"
            >
              <Settings className="w-5 h-5 stroke-[2.2]" />
            </button>

            {/* 3. PROFILE DISPLAY (NO DROPDOWN AS REQUESTED) */}
            <div
              className={`w-11 h-11 rounded-full border-2 relative flex items-center justify-center select-none ${
                isQuestion ? "border-[#251E2B]/50" : "border-white/80"
              }`}
              title={`Akun: ${currentUser?.full_name || "Ibu Guru"}`}
            >
              <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                <img
                  src="/images/dashboard/teacher-avatar.jpg"
                  alt={currentUser?.full_name || "Profil Guru"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
                <span className="text-white font-extrabold text-xs">
                  {userInitials}
                </span>
              </div>
            </div>

            {/* 4. CLOSE / COLLAPSE BUTTON */}
            <button
              type="button"
              onClick={() => {
                setIsExpanded(false);
                setIsNotifMenuOpen(false);
              }}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                isQuestion ? "hover:bg-black/10 text-[#251E2B]/70" : "hover:bg-white/20 text-white/70"
              }`}
              title="Ciutkan Menu"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        )}
      </div>

      {/* SETTINGS MODAL */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 relative animate-in fade-in zoom-in-95">
            <button
              type="button"
              onClick={() => setIsSettingsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 w-8 h-8 rounded-lg flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Pengaturan Workspace Guru</h3>
                <p className="text-xs text-slate-500">Konfigurasi konteks lokal dan integrasi AI</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Sekolah Aktif</label>
                <input
                  type="text"
                  readOnly
                  value={activeSchool?.name || ""}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Wilayah Kontekstualisasi</label>
                <input
                  type="text"
                  readOnly
                  value={`${activeSchool?.region_name} (ID: ${activeSchool?.region_id})`}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Model AI Aktif</label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Google Gemini 2.5 Flash (Contextual Engine V2)</span>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 text-[11px] leading-relaxed">
                Seluruh data kontekstual materi dan soal yang dibuat akan mengacu pada basis data terverifikasi untuk wilayah sekolah aktif di Karesidenan Madiun.
              </div>

              {/* Account Quick Actions */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <label className="font-semibold text-slate-700 block text-xs">Aksi Akun Guru</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleSwitchToStudent}
                    className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    <GraduationCap className="w-4 h-4 text-[#51465B]" />
                    <span>Beralih ke Siswa</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Keluar (Log out)</span>
                  </button>
                </div>
              </div>

              {savedMessage && (
                <div className="text-xs text-emerald-600 font-semibold">{savedMessage}</div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSavedMessage("Pengaturan berhasil disimpan.");
                    setTimeout(() => setSavedMessage(""), 3000);
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-xs"
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
