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
      className="inline-flex items-center h-10 sm:h-11 px-2.5 py-1 rounded-xl bg-white/95 backdrop-blur-xs border border-slate-200/90 shadow-xs gap-1 sm:gap-1.5"
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
      <div className="w-[1px] h-5 bg-slate-200 shrink-0 mx-0.5" aria-hidden="true" />

      {/* 2. Notifications Control */}
      <div className="flex items-center justify-center shrink-0">
        <NotificationBell userId={userId} />
      </div>

      {/* Subtle Vertical Divider */}
      <div className="w-[1px] h-5 bg-slate-200 shrink-0 mx-0.5" aria-hidden="true" />

      {/* 3. Settings Control */}
      <Link
        href="/teacher/school/settings"
        className="w-8 h-8 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100/90 flex items-center justify-center transition-colors cursor-pointer"
        title="Pengaturan Wilayah & Instansi"
        aria-label="Buka Pengaturan"
      >
        <Settings className="w-4 h-4" />
      </Link>

      {/* Subtle Vertical Divider */}
      <div className="w-[1px] h-5 bg-slate-200 shrink-0 mx-0.5" aria-hidden="true" />

      {/* 4. User Profile Control */}
      <UserProfileMenu userId={userId} />
    </div>
  );
}
