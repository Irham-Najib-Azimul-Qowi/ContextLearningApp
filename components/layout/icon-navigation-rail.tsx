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
      className="w-[72px] sm:w-[76px] bg-slate-50 border-r border-slate-200 flex flex-col items-center py-3.5 shrink-0 z-30 select-none h-screen sticky top-0"
      aria-label="Rel Navigasi Ruang Kerja Guru"
    >
      {/* 1. BRAND LOGO AT TOP OF RAIL */}
      <div className="relative flex items-center group/tooltip w-full justify-center pl-2 mb-2">
        <Link
          href="/teacher/dashboard"
          className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xs hover:bg-indigo-700 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/30 active:scale-95"
          title="Pahami"
          aria-label="Pahami"
        >
          <Sparkles className="w-5 h-5" />
        </Link>

        {/* Accessible Tooltip */}
        <div
          role="tooltip"
          className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100 transition-opacity duration-150 z-50 shadow-lg"
        >
          Pahami
          <div
            className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-slate-900"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Subtle Divider */}
      <div className="w-8 h-[1px] bg-slate-200 shrink-0 mb-3 ml-2" aria-hidden="true" />

      {/* 2. VERTICAL MENU GROUPS */}
      <div className="flex-1 flex flex-col items-center gap-2.5 w-full">
        {TEACHER_NAV_GROUPS.map((group) => {
          const isHighlighted = openGroupId
            ? group.id === openGroupId
            : group.id === activeGroupId;
          const isSubmenuOpen = group.id === openGroupId;
          const Icon = group.icon;

          return (
            <div key={group.id} className="relative flex items-center group/tooltip w-full justify-center pl-2">
              {/* Left Active Indicator Bar */}
              <div
                className={`absolute left-1 w-1 rounded-full transition-all duration-200 ${
                  isHighlighted
                    ? "h-8 bg-indigo-600 opacity-100"
                    : "h-2 bg-slate-300 opacity-0 group-hover/tooltip:opacity-100 group-hover/tooltip:h-4"
                }`}
                aria-hidden="true"
              />

              {/* Icon Button: Circular when inactive, morphs to squircle (rounded-2xl) when active */}
              <button
                type="button"
                onClick={() => handleGroupClick(group)}
                className={`w-11 h-11 flex items-center justify-center transition-all duration-200 ease-in-out relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                  isHighlighted
                    ? "rounded-2xl bg-indigo-600 text-white shadow-xs font-semibold"
                    : "rounded-full hover:rounded-2xl bg-white text-slate-600 hover:text-slate-950 hover:bg-slate-100 border border-slate-200 shadow-2xs"
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
                className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100 transition-opacity duration-150 z-50 shadow-lg"
              >
                {group.label}
                <div
                  className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-slate-900"
                  aria-hidden="true"
                />
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
