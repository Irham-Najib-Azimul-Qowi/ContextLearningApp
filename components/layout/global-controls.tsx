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

export function GlobalControls() {
  const router = useRouter();
  const [schools, setSchools] = useState<School[]>([]);
  const [activeSchool, setActiveSchool] = useState<School | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Dropdown states
  const [isSchoolMenuOpen, setIsSchoolMenuOpen] = useState(false);
  const [isNotifMenuOpen, setIsNotifMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
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
    const notifs = repository.getNotifications(user.id);
    setNotifications(notifs);
    setUnreadCount(notifs.filter((n) => !n.read).length);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsSchoolMenuOpen(false);
        setIsNotifMenuOpen(false);
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSchool = (schoolId: string) => {
    repository.setActiveSchoolId(schoolId);
    const selected = repository.getSchool(schoolId);
    if (selected) {
      setActiveSchool(selected);
    }
    setIsSchoolMenuOpen(false);
    // Reload active page to refresh school context
    window.location.reload();
  };

  const handleSwitchToStudent = () => {
    repository.setCurrentRole("STUDENT");
    router.push("/student/dashboard");
  };

  const handleLogout = () => {
    router.push("/");
  };

  const handleMarkNotifRead = (id: string) => {
    repository.markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  return (
    <>
      <div
        ref={containerRef}
        className="fixed top-3 sm:top-4 right-4 sm:right-6 z-30 flex items-center bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-sm px-2.5 py-1.5 gap-2 select-none"
        aria-label="Kontrol Utama Ruang Kerja"
      >
        {/* 1. ACTIVE SCHOOL CONTROL */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsSchoolMenuOpen(!isSchoolMenuOpen);
              setIsNotifMenuOpen(false);
              setIsProfileMenuOpen(false);
            }}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-100/80 transition-colors text-left"
            title="Ganti Sekolah Aktif"
            aria-expanded={isSchoolMenuOpen}
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <SchoolIcon className="w-3.5 h-3.5" />
            </div>
            <div className="hidden sm:block">
              <span className="text-xs font-bold text-slate-900 block leading-tight max-w-[140px] truncate">
                {activeSchool ? activeSchool.name : "Pilih Sekolah"}
              </span>
              <span className="text-[10px] text-slate-500 font-medium block leading-none mt-0.5">
                {activeSchool ? activeSchool.region_name : ""}
              </span>
            </div>
            {schools.length > 1 && (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-0.5" />
            )}
          </button>

          {/* School Dropdown */}
          {isSchoolMenuOpen && schools.length > 1 && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 p-2 z-50">
              <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Pilih Sekolah Aktif
              </div>
              <div className="space-y-1 mt-1">
                {schools.map((school) => {
                  const isSelected = activeSchool?.id === school.id;
                  return (
                    <button
                      key={school.id}
                      type="button"
                      onClick={() => handleSelectSchool(school.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors ${
                        isSelected
                          ? "bg-indigo-50 text-indigo-700 font-semibold"
                          : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div>
                        <div className="font-medium text-slate-900">{school.name}</div>
                        <div className="text-[11px] text-slate-500">{school.region_name}</div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-[1px] h-5 bg-slate-200" aria-hidden="true" />

        {/* 2. NOTIFICATIONS */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsNotifMenuOpen(!isNotifMenuOpen);
              setIsSchoolMenuOpen(false);
              setIsProfileMenuOpen(false);
            }}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-colors relative"
            title="Notifikasi"
            aria-label="Buka Notifikasi"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotifMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900">Notifikasi</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-semibold bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded">
                    {unreadCount} baru
                  </span>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 mt-1">
                {notifications.length === 0 ? (
                  <div className="py-4 text-center text-xs text-slate-500">
                    Tidak ada notifikasi saat ini.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleMarkNotifRead(notif.id)}
                      className={`p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                        notif.read ? "opacity-70 hover:bg-slate-50" : "bg-indigo-50/50 hover:bg-indigo-50"
                      }`}
                    >
                      <div className="font-semibold text-slate-900">{notif.title}</div>
                      <div className="text-[11px] text-slate-600 mt-0.5">{notif.message}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* 3. SETTINGS */}
        <button
          type="button"
          onClick={() => setIsSettingsModalOpen(true)}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-colors"
          title="Pengaturan"
          aria-label="Pengaturan"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* 4. USER PROFILE */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsProfileMenuOpen(!isProfileMenuOpen);
              setIsSchoolMenuOpen(false);
              setIsNotifMenuOpen(false);
            }}
            className="flex items-center gap-1.5 pl-1 pr-1.5 py-1 rounded-xl hover:bg-slate-100/80 transition-colors"
            title="Menu Akun"
            aria-label="Menu Akun Pengguna"
          >
            <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
              SA
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* Profile Dropdown */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 p-2 z-50">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <div className="font-bold text-xs text-slate-900">Ibu Siti Aminah, S.Pd.</div>
                <div className="text-[11px] text-slate-500">Guru Kelas 5</div>
                <span className="inline-block mt-1 text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">
                  Role: GURU
                </span>
              </div>
              <button
                type="button"
                onClick={handleSwitchToStudent}
                className="w-full flex items-center gap-2 p-2 rounded-lg text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-left"
              >
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span>Beralih ke Tampilan Murid</span>
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2 p-2 rounded-lg text-xs text-rose-600 hover:bg-rose-50 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar Aplikasi</span>
              </button>
            </div>
          )}
        </div>
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
