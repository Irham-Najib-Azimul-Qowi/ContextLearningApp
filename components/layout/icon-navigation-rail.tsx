"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TEACHER_NAV_GROUPS, NavGroup } from "./teacher-nav-config";

interface IconNavigationRailProps {
  activeGroupId: string;
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
      // Direct navigation for Beranda
      onSelectGroup(group.id);
      router.push(group.href);
    } else {
      // Toggle submenu for groups with submenus
      onSelectGroup(group.id);
    }
  };

  return (
    <aside
      className="w-16 sm:w-[68px] bg-slate-50/80 border-r border-slate-200/90 flex flex-col items-center py-4 shrink-0 z-20 select-none min-h-[calc(100vh-64px)]"
      aria-label="Rel Navigasi Ruang Kerja"
    >
      <div className="flex-1 flex flex-col items-center gap-3 w-full px-2.5">
        {TEACHER_NAV_GROUPS.map((group) => {
          const isRouteActive = group.id === activeGroupId;
          const isSubmenuOpen = group.id === openGroupId;
          const isHighlighted = isRouteActive || isSubmenuOpen;
          const Icon = group.icon;

          return (
            <div key={group.id} className="relative flex items-center group/tooltip w-full justify-center">
              {/* Left Active Indicator Bar */}
              <div
                className={`absolute left-0 w-1 rounded-r-full transition-all duration-150 ${
                  isHighlighted
                    ? "h-7 bg-indigo-600 opacity-100"
                    : "h-2 bg-slate-300 opacity-0 group-hover/tooltip:opacity-100 group-hover/tooltip:h-4"
                }`}
                aria-hidden="true"
              />

              {/* Icon Button */}
              <button
                type="button"
                onClick={() => handleGroupClick(group)}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-150 relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                  isHighlighted
                    ? "bg-indigo-600 text-white shadow-xs font-semibold"
                    : "bg-white text-slate-600 hover:text-slate-950 hover:bg-slate-100/90 border border-slate-200/80"
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
