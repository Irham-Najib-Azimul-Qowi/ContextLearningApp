"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Menu } from "lucide-react";
import { GlobalControls } from "./global-controls";

interface AppHeaderProps {
  currentSchoolId: string;
  onSchoolChange: (schoolId: string) => void;
  onOpenMobileNav?: () => void;
  userId?: string;
}

export function AppHeader({
  currentSchoolId,
  onSchoolChange,
  onOpenMobileNav,
  userId = "teacher-demo-01",
}: AppHeaderProps) {
  return (
    <header className="h-16 px-4 sm:px-6 bg-white border-b border-slate-200/80 flex items-center justify-between shrink-0 z-30 select-none">
      {/* LEFT SIDE — BRANDING */}
      <div className="flex items-center gap-3">
        {onOpenMobileNav && (
          <button
            type="button"
            onClick={onOpenMobileNav}
            className="md:hidden p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 cursor-pointer"
            aria-label="Buka navigasi"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        <Link
          href="/teacher/dashboard"
          className="flex items-center gap-2.5 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20 rounded-lg p-1"
          title="Pahami Dashboard"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs group-hover:bg-indigo-700 transition-colors">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-base text-slate-900 tracking-tight leading-none">
            Pahami
          </span>
        </Link>
      </div>

      {/* RIGHT SIDE — GLOBAL USER CONTROLS */}
      <div className="flex items-center">
        <GlobalControls
          currentSchoolId={currentSchoolId}
          onSchoolChange={onSchoolChange}
          userId={userId}
        />
      </div>
    </header>
  );
}
