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
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function IconNavigationRail({
  activeGroupId = "dashboard",
  contextMode = "material",
  isCollapsed: controlledCollapsed,
  onToggleCollapse: controlledToggle,
}: IconNavigationRailProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;
  const toggleCollapse = controlledToggle || (() => setInternalCollapsed((prev) => !prev));

  const isQuestion = contextMode === "question";
  const railBg = isQuestion ? "bg-[#FFD36D]" : "bg-[#51465B]";
  const railBorder = isQuestion ? "border-r border-[#E5BE60]" : "border-r border-[#645770]/40";

  // Accordion state: keep track of which menu groups are expanded in full view
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
      if (typeof window !== "undefined" && window.innerWidth < 768) {
        toggleCollapse();
      }
    }
  };

  const handleMobileNavClick = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      toggleCollapse();
    }
  };

  return (
    <>
      {/* 1. Mobile Backdrop when sidebar is expanded as overlay drawer */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-30 md:hidden transition-opacity"
          onClick={toggleCollapse}
          aria-label="Tutup navigasi"
        />
      )}

      {/* 2. Aside Navigation Rail */}
      <aside
        className={`${
          isCollapsed
            ? `w-14 sm:w-20 ${railBg} ${railBorder} flex flex-col justify-start py-5 px-1 sm:px-2 shrink-0 z-30 select-none h-screen max-h-screen overflow-hidden transition-all duration-300`
            : `w-72 ${railBg} ${railBorder} flex flex-col justify-start py-6 px-4 shrink-0 z-40 select-none h-screen max-h-screen overflow-hidden transition-all duration-300 max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:shadow-2xl md:relative md:w-64 lg:md:w-72`
        }`}
        aria-label="Navigasi Menu Guru DEPASKAN"
      >
        {/* ====================================================================
            A. COLLAPSED VIEW: ONLY LOGO 'D' & ICON-ONLY MENU
            ==================================================================== */}
        {isCollapsed ? (
          <div className="flex-1 flex flex-col items-center min-h-0 space-y-6">
            {/* 1. Logo "D" only */}
            <div className="shrink-0 flex items-center justify-center">
              <button
                type="button"
                onClick={toggleCollapse}
                className="p-1 rounded-2xl hover:bg-black/10 active:scale-95 transition-all cursor-pointer flex items-center justify-center group"
                title="Klik untuk memperluas navigasi (Depaskan)"
                aria-label="Perluas Navigasi Depaskan"
              >
                <PahamiPuzzleLogo
                  size="sm"
                  theme={isQuestion ? "light" : "dark"}
                  showText={false}
                  asButton
                />
              </button>
            </div>

            {/* 2. Icon-Only Nav Items */}
            <nav
              className="flex-1 overflow-y-auto space-y-2.5 py-1 flex flex-col items-center w-full scrollbar-none"
              aria-label="Menu Ikon"
            >
              {TEACHER_NAV_GROUPS.map((group) => {
                const isGroupActive =
                  group.id === activeGroupId ||
                  (pathname && group.href && pathname.startsWith(group.href));
                const Icon = group.icon;

                return (
                  <div key={group.id} className="relative group/tooltip flex items-center justify-center">
                    <Link
                      href={group.href}
                      onClick={handleMobileNavClick}
                      className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                        isQuestion
                          ? isGroupActive
                            ? "bg-[#251E2B]/15 text-[#251E2B] font-black shadow-xs ring-2 ring-[#251E2B]/20"
                            : "text-[#3E3547]/80 hover:text-[#251E2B] hover:bg-[#251E2B]/10"
                          : isGroupActive
                          ? "bg-white/20 text-[#FFD36D] font-extrabold shadow-xs ring-2 ring-[#FFD36D]/30"
                          : "text-white/75 hover:text-white hover:bg-white/10"
                      }`}
                      title={group.label}
                      aria-label={group.label}
                    >
                      <Icon className="w-5 h-5 stroke-[2.2]" />
                    </Link>

                    {/* Desktop Tooltip on Hover */}
                    <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-[#23212A] text-white text-xs font-bold rounded-xl shadow-xl opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap z-50 hidden sm:block border border-white/10">
                      {group.label}
                    </div>
                  </div>
                );
              })}
            </nav>
          </div>
        ) : (
          /* ====================================================================
             B. EXPANDED VIEW: FULL LOGO 'DEPASKAN' & ACCORDION MENU
             ==================================================================== */
          <div className="flex-1 flex flex-col min-h-0 space-y-6">
            {/* 1. BRAND LOGO & NAME "DEPASKAN" (Clicking toggles collapse) */}
            <div className="px-1 shrink-0">
              <button
                type="button"
                onClick={toggleCollapse}
                className="w-full flex items-center justify-between p-1 -m-1 rounded-2xl hover:bg-black/10 active:scale-98 transition-all cursor-pointer text-left group"
                title="Klik untuk mengecilkan navigasi"
                aria-label="Kecilkan navigasi Depaskan"
              >
                <PahamiPuzzleLogo
                  size="md"
                  theme={isQuestion ? "light" : "dark"}
                  showText={true}
                  asButton
                />
              </button>
              <span
                className={`text-[10px] font-extrabold tracking-wider uppercase block mt-1 ml-1 ${
                  isQuestion ? "text-[#51465B]/80" : "text-white/60"
                }`}
              >
                Ruang Kerja Pengajar
              </span>
            </div>

            {/* 2. INLINE ACCORDION NAVIGATION */}
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

                    {/* Submenu */}
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
                              onClick={handleMobileNavClick}
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
        )}
      </aside>
    </>
  );
}
