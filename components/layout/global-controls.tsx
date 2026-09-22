"use client";

import React from "react";
import Link from "next/link";
import { Settings } from "lucide-react";
import { SchoolWorkspaceSwitcher } from "./school-workspace-switcher";
import { NotificationBell } from "./notification-bell";
import { UserProfileMenu } from "./user-profile-menu";

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
  return (
    <div
      className="inline-flex items-center h-12 sm:h-[52px] px-3.5 sm:px-4 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm gap-1.5 sm:gap-2"
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
    </div>
  );
}
