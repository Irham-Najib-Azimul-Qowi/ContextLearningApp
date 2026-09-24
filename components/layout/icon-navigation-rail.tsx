"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  LogOut,
  Sparkles,
} from "lucide-react";
import { TEACHER_NAV_GROUPS, NavGroup } from "./teacher-nav-config";
import { PahamiPuzzleLogo } from "@/components/landing/puzzle-logo";

interface IconNavigationRailProps {
  activeGroupId?: string | null;
  openGroupId?: string | null;
  onSelectGroup?: (groupId: string) => void;
}

export function IconNavigationRail({
  activeGroupId = "dashboard",
}: IconNavigationRailProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Accordion state: keep track of which menu groups are expanded
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    dashboard: true,
    questions: true,
    materials: true,
    classes: false,
    evaluation: false,
  });

  const toggleGroup = (groupId: string, href: string, hasSubmenu: boolean) => {
    if (hasSubmenu) {
      setExpandedGroups((prev) => ({
        ...prev,
        [groupId]: !prev[groupId],
      }));
    } else {
      router.push(href);
    }
  };

  return (
    <aside
      className="w-64 sm:w-72 bg-[#3E3547] flex flex-col justify-between py-6 px-4 shrink-0 z-30 select-none min-h-screen text-white border-r border-[#4E4358]/40 overflow-y-auto"
      aria-label="Navigasi Menu Guru DEPASKAN"
    >
      <div className="space-y-6">
        {/* 1. BRAND LOGO & NAME "DEPASKAN" (Matching Landing Page) */}
        <div className="px-1">
          <PahamiPuzzleLogo size="md" theme="dark" href="/teacher/dashboard" />
          <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase block mt-1 ml-1">
            Ruang Kerja Guru
          </span>
        </div>

        {/* 2. INLINE ACCORDION NAVIGATION (No more floating flyout) */}
        <nav className="space-y-1.5" aria-label="Menu Utama">
          {TEACHER_NAV_GROUPS.map((group) => {
            const isGroupActive =
              group.id === activeGroupId ||
              (pathname && group.href && pathname.startsWith(group.href));
            const isExpanded = !!expandedGroups[group.id];
            const Icon = group.icon;

            return (
              <div key={group.id} className="space-y-1">
                {/* Parent Group Button */}
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id, group.href, group.hasSubmenu)}
                  className={`w-full py-2.5 px-3.5 rounded-2xl flex items-center justify-between transition-all duration-200 cursor-pointer text-left ${
                    isGroupActive
                      ? "bg-white/15 text-[#FFD36D] font-extrabold shadow-xs"
                      : "text-white/80 hover:text-white hover:bg-white/10 font-semibold"
                  }`}
                  aria-expanded={group.hasSubmenu ? isExpanded : undefined}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-6 h-6 flex items-center justify-center shrink-0 ${
                        isGroupActive ? "text-[#FFD36D]" : "text-white/70"
                      }`}
                    >
                      <Icon className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <span className="text-xs sm:text-[13px] tracking-tight truncate">
                      {group.label}
                    </span>
                  </div>

                  {/* Accordion Chevron Indicator */}
                  {group.hasSubmenu && (
                    <ChevronDown
                      className={`w-4 h-4 text-white/50 transition-transform duration-200 shrink-0 ${
                        isExpanded ? "rotate-180 text-[#FFD36D]" : ""
                      }`}
                    />
                  )}
                </button>

                {/* Submenu: Indented inside the navigation bar ("menjorok indentasinya") */}
                {group.hasSubmenu && isExpanded && group.subitems && (
                  <div className="ml-5 pl-4 border-l-2 border-white/15 space-y-1 py-1 transition-all">
                    {group.subitems.map((sub) => {
                      const isSubActive = pathname === sub.href;
                      return (
                        <Link
                          key={sub.id}
                          href={sub.href}
                          className={`flex items-center gap-2 py-1.5 px-2.5 rounded-xl text-xs transition-colors ${
                            isSubActive
                              ? "bg-white/20 text-[#FFD36D] font-bold"
                              : "text-white/70 hover:text-white hover:bg-white/10 font-medium"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              isSubActive ? "bg-[#FFD36D]" : "bg-white/30"
                            }`}
                          />
                          <span className="truncate">{sub.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* 3. BOTTOM: TEACHER PROFILE CARD & LOGOUT */}
      <div className="pt-6 border-t border-white/15 space-y-3">
        {/* Teacher Profile Info */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#F47D83] shadow-xs shrink-0">
            <img
              src="/images/dashboard/teacher-avatar.jpg"
              alt="Profil Guru"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-white truncate">
              Bu Siti Aminah, S.Pd.
            </span>
            <span className="text-[10px] text-gray-400 font-medium truncate">
              Guru SD Kelas 5
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <Link
          href="/login"
          className="w-full py-2.5 px-3 rounded-2xl flex items-center gap-3 text-white/70 hover:text-rose-300 hover:bg-rose-500/15 transition-colors group cursor-pointer"
          title="Keluar dari akun"
        >
          <div className="w-6 h-6 flex items-center justify-center shrink-0">
            <LogOut className="w-4 h-4 text-white/70 group-hover:text-rose-300 transition-colors stroke-[2]" />
          </div>
          <span className="text-xs font-semibold truncate">
            Keluar (Log out)
          </span>
        </Link>
      </div>
    </aside>
  );
}
