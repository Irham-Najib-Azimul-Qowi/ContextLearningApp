"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { TEACHER_NAV_GROUPS, NavGroup } from "./teacher-nav-config";

interface IconNavigationRailProps {
  activeGroupId: string | null;
  openGroupId: string | null;
  onSelectGroup: (groupId: string) => void;
}

export function IconNavigationRail({
  activeGroupId,
  openGroupId,
  onSelectGroup,
}: IconNavigationRailProps) {
  const router = useRouter();

  const handleGroupClick = (group: NavGroup) => {
    if (!group.hasSubmenu) {
      onSelectGroup(group.id);
      router.push(group.href);
    } else {
      onSelectGroup(group.id);
    }
  };

  return (
    <aside
      className="w-[72px] sm:w-[80px] md:w-52 lg:w-56 bg-[#51465B] border-r border-[#3E3547]/60 flex flex-col justify-between py-6 shrink-0 z-30 select-none min-h-screen text-white transition-all"
      aria-label="Rel Navigasi Ruang Kerja Guru"
    >
      <div className="w-full flex flex-col items-center">
        {/* 1. TEACHER AVATAR AT TOP OF RAIL (Matching Reference Image) */}
        <div className="relative flex flex-col items-center mb-6 pt-1">
          <Link
            href="/teacher/dashboard"
            className="relative group cursor-pointer block"
            title="Profil Guru DEPASKAN"
            aria-label="Profil Guru"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-[#F47D83] shadow-md group-hover:scale-105 transition-all bg-[#F47D83]/20 flex items-center justify-center">
              <img
                src="/images/dashboard/teacher-avatar.jpg"
                alt="Guru DEPASKAN"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#51465B]" />
          </Link>
        </div>

        {/* 2. MENU GROUPS (Matching Reference Image) */}
        <nav className="flex flex-col items-center md:items-stretch gap-2 w-full px-2 sm:px-3">
          {TEACHER_NAV_GROUPS.map((group) => {
            const isHighlighted = openGroupId
              ? group.id === openGroupId
              : group.id === activeGroupId;
            const isDashboard = group.id === "dashboard";
            const Icon = group.icon;

            return (
              <button
                key={group.id}
                type="button"
                onClick={() => handleGroupClick(group)}
                className={`w-full py-2.5 px-3 rounded-2xl flex items-center justify-center md:justify-start gap-3 transition-all duration-200 cursor-pointer ${
                  isHighlighted && isDashboard
                    ? "bg-white/10 text-[#FFD36D] font-black shadow-xs ring-1 ring-white/10"
                    : isHighlighted
                    ? "bg-white/10 text-[#FFD36D] font-extrabold shadow-xs ring-1 ring-white/10"
                    : "text-white/75 hover:text-white hover:bg-white/5 font-semibold"
                }`}
                aria-label={group.label}
                title={group.label}
              >
                <div
                  className={`w-6 h-6 flex items-center justify-center shrink-0 transition-colors ${
                    isHighlighted && isDashboard
                      ? "text-[#FFD36D]"
                      : isHighlighted
                      ? "text-[#FFD36D]"
                      : "text-white/75"
                  }`}
                >
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span
                  className={`text-xs tracking-tight truncate hidden md:inline ${
                    isHighlighted && isDashboard
                      ? "text-[#FFD36D] font-black"
                      : isHighlighted
                      ? "text-white font-bold"
                      : "text-white/80"
                  }`}
                >
                  {group.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* 3. LOG OUT BUTTON AT BOTTOM (Matching Reference Image) */}
      <div className="w-full px-2 sm:px-3 pt-4 border-t border-white/10">
        <Link
          href="/login"
          className="w-full py-2.5 px-3 rounded-2xl flex items-center justify-center md:justify-start gap-3 text-white/70 hover:text-rose-300 hover:bg-rose-500/10 transition-colors group cursor-pointer"
          title="Log out"
        >
          <div className="w-6 h-6 flex items-center justify-center shrink-0">
            <LogOut className="w-5 h-5 text-white/70 group-hover:text-rose-300 transition-colors stroke-[2]" />
          </div>
          <span className="text-xs font-semibold truncate hidden md:inline">
            Log out
          </span>
        </Link>
      </div>
    </aside>
  );
}
