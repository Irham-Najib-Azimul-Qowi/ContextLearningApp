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
  contextMode?: "material" | "question";
}

export function IconNavigationRail({
  activeGroupId = "dashboard",
  contextMode = "material",
}: IconNavigationRailProps) {
  const router = useRouter();
  const pathname = usePathname();

  const isQuestion = contextMode === "question";
  const railBg = isQuestion ? "bg-[#FFD36D]" : "bg-[#51465B]";
  const railBorder = isQuestion ? "border-r border-[#E5BE60]" : "border-r border-[#645770]/40";

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
      className={`w-64 sm:w-72 ${railBg} ${railBorder} flex flex-col justify-start py-6 px-4 shrink-0 z-30 select-none h-screen max-h-screen overflow-hidden transition-colors duration-300`}
      aria-label="Navigasi Menu Guru DEPASKAN"
    >
      <div className="flex-1 flex flex-col min-h-0 space-y-6">
        {/* 1. BRAND LOGO & NAME "DEPASKAN" (Matching Landing Page) */}
        <div className="px-1 shrink-0">
          <PahamiPuzzleLogo
            size="md"
            theme={isQuestion ? "light" : "dark"}
            href="/teacher/dashboard"
          />
          <span
            className={`text-[10px] font-extrabold tracking-wider uppercase block mt-1 ml-1 ${
              isQuestion ? "text-[#51465B]/80" : "text-white/60"
            }`}
          >
            Ruang Kerja Guru
          </span>
        </div>

        {/* 2. INLINE ACCORDION NAVIGATION (Fits desktop screen, scrollable internally if small display) */}
        <nav
          className="flex-1 overflow-y-auto pr-1 space-y-1.5 scrollbar-thin"
          aria-label="Menu Utama"
        >
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
                    isQuestion
                      ? isGroupActive
                        ? "bg-[#251E2B]/15 text-[#251E2B] font-black shadow-xs"
                        : "text-[#3E3547]/85 hover:text-[#251E2B] hover:bg-[#251E2B]/10 font-bold"
                      : isGroupActive
                      ? "bg-white/15 text-[#FFD36D] font-extrabold shadow-xs"
                      : "text-white/80 hover:text-white hover:bg-white/10 font-semibold"
                  }`}
                  aria-expanded={group.hasSubmenu ? isExpanded : undefined}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-6 h-6 flex items-center justify-center shrink-0 ${
                        isQuestion
                          ? isGroupActive
                            ? "text-[#251E2B]"
                            : "text-[#3E3547]/70"
                          : isGroupActive
                          ? "text-[#FFD36D]"
                          : "text-white/70"
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
                      className={`w-4 h-4 transition-transform duration-200 shrink-0 ${
                        isQuestion
                          ? isExpanded
                            ? "rotate-180 text-[#251E2B]"
                            : "text-[#3E3547]/60"
                          : isExpanded
                          ? "rotate-180 text-[#FFD36D]"
                          : "text-white/50"
                      }`}
                    />
                  )}
                </button>

                {/* Submenu: Indented inside the navigation bar ("menjorok indentasinya") */}
                {group.hasSubmenu && isExpanded && group.subitems && (
                  <div
                    className={`ml-5 pl-4 border-l-2 space-y-1 py-1 transition-all ${
                      isQuestion ? "border-[#251E2B]/20" : "border-white/15"
                    }`}
                  >
                    {group.subitems.map((sub) => {
                      const isSubActive = pathname === sub.href;
                      return (
                        <Link
                          key={sub.id}
                          href={sub.href}
                          className={`flex items-center gap-2 py-1.5 px-2.5 rounded-xl text-xs transition-colors ${
                            isQuestion
                              ? isSubActive
                                ? "bg-[#251E2B]/20 text-[#251E2B] font-black"
                                : "text-[#3E3547]/80 hover:text-[#251E2B] hover:bg-[#251E2B]/10 font-semibold"
                              : isSubActive
                              ? "bg-white/20 text-[#FFD36D] font-bold"
                              : "text-white/70 hover:text-white hover:bg-white/10 font-medium"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              isQuestion
                                ? isSubActive
                                  ? "bg-[#251E2B]"
                                  : "bg-[#3E3547]/40"
                                : isSubActive
                                ? "bg-[#FFD36D]"
                                : "bg-white/30"
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
    </aside>
  );
}
