"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
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
      className="w-[72px] sm:w-[76px] bg-[#51465B] border-r border-[#3E3547] flex flex-col items-center py-4 shrink-0 z-30 select-none h-screen sticky top-0 text-white"
      aria-label="Rel Navigasi Ruang Kerja Guru"
    >
      {/* 1. BRAND AVATAR / LOGO AT TOP OF RAIL */}
      <div className="relative flex items-center group/tooltip w-full justify-center mb-3">
        <Link
          href="/teacher/dashboard"
          className="w-12 h-12 rounded-full border-2 border-[#F47D83] bg-[#FAF7F3] text-[#51465B] flex items-center justify-center font-extrabold shadow-sm hover:scale-105 transition-all cursor-pointer overflow-hidden"
          title="Profil Guru Depaskan"
          aria-label="Profil Guru"
        >
          <span className="text-sm font-black text-[#51465B]">SD5</span>
        </Link>

        {/* Accessible Tooltip */}
        <div
          role="tooltip"
          className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-[#23212A] text-white text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100 transition-opacity duration-150 z-50 shadow-lg"
        >
          Workspace Guru SD
          <div
            className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-[#23212A]"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Subtle Divider */}
      <div className="w-8 h-[1px] bg-white/15 shrink-0 mb-4" aria-hidden="true" />

      {/* 2. VERTICAL MENU GROUPS */}
      <div className="flex-1 flex flex-col items-center gap-3 w-full">
        {TEACHER_NAV_GROUPS.map((group) => {
          const isHighlighted = openGroupId
            ? group.id === openGroupId
            : group.id === activeGroupId;
          const isSubmenuOpen = group.id === openGroupId;
          const Icon = group.icon;

          return (
            <div key={group.id} className="relative flex items-center group/tooltip w-full justify-center">
              {/* Left Active Indicator Bar */}
              <div
                className={`absolute left-0.5 w-1 rounded-full transition-all duration-200 ${
                  isHighlighted
                    ? "h-8 bg-[#F47D83] opacity-100"
                    : "h-2 bg-white/30 opacity-0 group-hover/tooltip:opacity-100 group-hover/tooltip:h-4"
                }`}
                aria-hidden="true"
              />

              {/* Icon Button */}
              <button
                type="button"
                onClick={() => handleGroupClick(group)}
                className={`w-11 h-11 flex items-center justify-center transition-all duration-200 ease-in-out relative cursor-pointer focus:outline-hidden ${
                  isHighlighted
                    ? "rounded-2xl bg-[#F47D83] text-white shadow-md font-semibold"
                    : "rounded-2xl bg-white/10 text-white/80 hover:text-white hover:bg-white/20"
                }`}
                aria-label={group.label}
                aria-expanded={group.hasSubmenu ? isSubmenuOpen : undefined}
                title={group.label}
              >
                <Icon className="w-5 h-5" />
              </button>

              {/* Accessible Floating Tooltip on Right */}
              <div
                role="tooltip"
                className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-[#23212A] text-white text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100 transition-opacity duration-150 z-50 shadow-lg"
              >
                {group.label}
                <div
                  className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-[#23212A]"
                  aria-hidden="true"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. LOG OUT BUTTON AT BOTTOM OF RAIL */}
      <div className="w-full flex justify-center pb-2">
        <Link
          href="/login"
          className="w-10 h-10 rounded-xl bg-white/10 hover:bg-red-500/20 hover:text-red-300 text-white/70 flex items-center justify-center transition-colors"
          title="Keluar"
        >
          <span className="text-xs font-bold">&larr;</span>
        </Link>
      </div>
    </aside>
  );
}
