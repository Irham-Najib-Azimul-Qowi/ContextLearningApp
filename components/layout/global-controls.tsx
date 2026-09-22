"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Settings, ChevronRight } from "lucide-react";
import { SchoolWorkspaceSwitcher } from "./school-workspace-switcher";
import { NotificationBell } from "./notification-bell";
import { UserProfileMenu } from "./user-profile-menu";
import { Profile } from "@/lib/db/types";
import { DEMO_TEACHER } from "@/lib/db/mock-data";

interface GlobalControlsProps {
  currentSchoolId: string;
  onSchoolChange: (schoolId: string) => void;
  userId?: string;
}

export function GlobalControls({
  currentSchoolId,
  onSchoolChange,
  userId = "teacher-demo-01",
}: GlobalControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [profile, setProfile] = useState<Profile>(DEMO_TEACHER);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load teacher profile / initials
  useEffect(() => {
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

  // Click outside listener to automatically collapse back to the profile circle
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };
    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded]);

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "NS";

  // 1. COLLAPSED STATE: Only show the profile circle
  if (!isExpanded) {
    return (
      <div className="relative inline-flex items-center" ref={containerRef}>
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="group flex items-center justify-center w-11 h-11 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-300 hover:scale-105 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/30 p-1"
          title="Buka menu kontrol (Sekolah, Notifikasi, Pengaturan, Profil)"
          aria-label="Buka menu kontrol pengguna"
          aria-expanded="false"
        >
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name}
              className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs group-hover:bg-indigo-700 transition-colors">
              {initials}
            </div>
          )}
        </button>
      </div>
    );
  }

  // 2. EXPANDED STATE: Expands outwards to the left, showing School, Notifications, Settings, Profile, and close button
  return (
    <div
      ref={containerRef}
      className="inline-flex items-center h-12 sm:h-[52px] pl-3.5 sm:pl-4 pr-2 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-lg gap-1.5 sm:gap-2 animate-in fade-in slide-in-from-right-4 duration-200"
      role="region"
      aria-label="Kontrol Pengguna Global"
    >
      {/* 1. Current School Control */}
      <SchoolWorkspaceSwitcher
        currentSchoolId={currentSchoolId}
        onSchoolChange={onSchoolChange}
        userId={userId}
      />

      {/* Subtle Vertical Divider */}
      <div className="w-[1px] h-6 bg-slate-200/90 shrink-0 mx-0.5" aria-hidden="true" />

      {/* 2. Notifications Control */}
      <div className="flex items-center justify-center shrink-0">
        <NotificationBell
          userId={userId}
          className="relative w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100/90 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
        />
      </div>

      {/* Subtle Vertical Divider */}
      <div className="w-[1px] h-6 bg-slate-200/90 shrink-0 mx-0.5" aria-hidden="true" />

      {/* 3. Settings Control */}
      <Link
        href="/teacher/school/settings"
        className="w-9 h-9 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100/90 flex items-center justify-center transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        title="Pengaturan Wilayah & Instansi"
        aria-label="Buka Pengaturan"
      >
        <Settings className="w-4.5 h-4.5" />
      </Link>

      {/* Subtle Vertical Divider */}
      <div className="w-[1px] h-6 bg-slate-200/90 shrink-0 mx-0.5" aria-hidden="true" />

      {/* 4. User Profile Control */}
      <UserProfileMenu userId={userId} />

      {/* 5. Collapse Button */}
      <button
        type="button"
        onClick={() => setIsExpanded(false)}
        className="w-7 h-7 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
        title="Tutup menu kontrol"
        aria-label="Tutup menu kontrol"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
