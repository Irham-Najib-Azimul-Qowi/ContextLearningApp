"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Settings, LogOut, X, Shield, Mail, Phone, Hash } from "lucide-react";
import { Profile } from "@/lib/db/types";
import { DEMO_TEACHER } from "@/lib/db/mock-data";

interface UserProfileMenuProps {
  userId?: string;
}

export function UserProfileMenu({ userId = "teacher-demo-01" }: UserProfileMenuProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>(DEMO_TEACHER);
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Read authenticated profile from localStorage or fallback to DEMO_TEACHER
    try {
      const stored = localStorage.getItem("contextlearning_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.full_name) {
          setProfile(parsed);
          return;
        }
      }
    } catch {
      // ignore
    }
    setProfile(DEMO_TEACHER);
  }, [userId]);

  // Click outside and Escape handling
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setShowProfileModal(false);
      }
    };
    if (isOpen || showProfileModal) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, showProfileModal]);

  const initials = profile?.full_name
    ? profile.full_name
        .replace(/^(Ibu|Bapak|Pak|Dr\.|Drs\.|H\.)\s+/i, "")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "NH"
    : "NH";

  const handleLogout = () => {
    try {
      localStorage.removeItem("contextlearning_user");
      localStorage.removeItem("cl_active_school_id");
    } catch {
      // ignore
    }
    router.push("/auth/login");
  };

  return (
    <>
      <div className="relative inline-flex items-center" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100/90 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          aria-haspopup="true"
          aria-expanded={isOpen}
          aria-label={`Menu profil ${profile?.full_name || "Guru"}`}
          title={profile?.full_name || "Profil Guru"}
        >
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name}
              className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {initials}
            </div>
          )}
        </button>

        {/* Profile Dropdown */}
        {isOpen && (
          <div
            className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in duration-100"
            role="menu"
          >
            {/* Header info */}
            <div className="px-3.5 py-2 border-b border-slate-100">
              <p className="font-bold text-xs text-slate-900 truncate">
                {profile?.full_name || "Ibu Nurhaliza, S.Pd."}
              </p>
              <p className="text-[11px] text-slate-500 truncate font-mono mt-0.5">
                {profile?.teacher_code || "TCH-SAM-001"}
              </p>
            </div>

            {/* Dropdown Options */}
            <div className="py-1">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setShowProfileModal(true);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors text-left cursor-pointer"
                role="menuitem"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>Profil Saya</span>
              </button>

              <Link
                href="/teacher/school/settings"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors text-left"
                role="menuitem"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Pengaturan Akun</span>
              </Link>
            </div>

            <div className="border-t border-slate-100 pt-1">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                role="menuitem"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Profil Saya Modal Dialog */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                  {initials}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    {profile?.full_name || "Ibu Nurhaliza, S.Pd."}
                  </h3>
                  <p className="text-xs text-slate-500">Pendidik Terverifikasi</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Email</span>
                  <span className="font-medium text-slate-800">{profile?.email || "nurhaliza.guru@gmail.com"}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <Hash className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Kode Guru / NIP</span>
                  <span className="font-medium font-mono text-slate-800">{profile?.teacher_code || "TCH-SAM-001"}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Nomor Kontak</span>
                  <span className="font-medium text-slate-800">{profile?.phone_number || "0812-3456-7890"}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
