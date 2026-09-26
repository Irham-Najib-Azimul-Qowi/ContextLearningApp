"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TEACHER_NAV_GROUPS } from "./teacher-nav-config";
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
  const pathname = usePathname();

  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;
  const toggleCollapse = controlledToggle || (() => setInternalCollapsed((prev) => !prev));

  const isQuestion = contextMode === "question";
  const railBg = isQuestion ? "bg-[#FFD36D]" : "bg-[#51465B]";
  const railBorder = isQuestion ? "border-r border-[#E5BE60]" : "border-r border-[#645770]/40";

  const handleCloseMobileDrawer = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      if (!isCollapsed) {
        toggleCollapse();
      }
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
            ? `w-14 sm:w-20 ${railBg} ${railBorder} flex flex-col justify-start py-5 px-1 sm:px-2 shrink-0 z-30 select-none h-screen max-h-screen overflow-hidden`
            : `w-72 ${railBg} ${railBorder} flex flex-col justify-start py-6 px-4 shrink-0 z-40 select-none h-screen max-h-screen overflow-hidden max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:shadow-2xl md:relative md:w-64 lg:md:w-72`
        }`}
        aria-label="Navigasi Menu DEPASKAN"
      >
        {/* ====================================================================
            A. COLLAPSED VIEW: ONLY LOGO 'D' & ICON-ONLY DIRECT MENU
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

            {/* 2. Icon-Only Direct Nav Items */}
            <nav
              className="flex-1 overflow-y-auto space-y-2.5 py-1 flex flex-col items-center w-full scrollbar-none"
              aria-label="Menu Ikon"
            >
              {TEACHER_NAV_GROUPS.map((group) => {
                const isGroupActive =
                  group.id === activeGroupId ||
                  (pathname && group.href && (pathname === group.href || (group.href !== "/teacher/dashboard" && pathname.startsWith(group.href))));
                const Icon = group.icon;

                return (
                  <div key={group.id} className="relative group/tooltip flex items-center justify-center">
                    <Link
                      href={group.href}
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
             B. EXPANDED VIEW: LOGO 'DEPASKAN' & DIRECT MAIN MENU
             ==================================================================== */
          <div className="flex-1 flex flex-col min-h-0 space-y-6">
            {/* 1. BRAND LOGO & NAME "DEPASKAN" (Clicking toggles collapse, NO subtitle text) */}
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
            </div>

            {/* 2. DIRECT MAIN MENU LIST (Tanpa sub-menu / accordion) */}
            <nav
              className="flex-1 overflow-y-auto pr-1 space-y-2 scrollbar-none"
              aria-label="Menu Utama"
            >
              {TEACHER_NAV_GROUPS.map((group) => {
                const isGroupActive =
                  group.id === activeGroupId ||
                  (pathname && group.href && (pathname === group.href || (group.href !== "/teacher/dashboard" && pathname.startsWith(group.href))));
                const Icon = group.icon;

                return (
                  <Link
                    key={group.id}
                    href={group.href}
                    onClick={handleCloseMobileDrawer}
                    className={`w-full py-3 px-3.5 rounded-2xl flex items-center gap-3 transition-all duration-200 cursor-pointer text-left ${
                      isQuestion
                        ? isGroupActive
                          ? "bg-[#251E2B]/15 text-[#251E2B] font-black shadow-xs ring-1 ring-[#251E2B]/20"
                          : "text-[#3E3547]/85 hover:text-[#251E2B] hover:bg-[#251E2B]/10 font-bold"
                        : isGroupActive
                        ? "bg-white/20 text-[#FFD36D] font-extrabold shadow-xs ring-1 ring-[#FFD36D]/30"
                        : "text-white/80 hover:text-white hover:bg-white/10 font-semibold"
                    }`}
                  >
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
                    <span className="text-sm tracking-tight font-bold">
                      {group.label}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </aside>
    </>
  );
}
