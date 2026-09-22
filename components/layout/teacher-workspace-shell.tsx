"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AppHeader } from "./app-header";
import { IconNavigationRail } from "./icon-navigation-rail";
import { NavigationSubmenu } from "./navigation-submenu";
import {
  TEACHER_NAV_GROUPS,
  getActiveNavGroup,
  NavGroup,
  isSubmenuItemActive,
} from "./teacher-nav-config";
import { X, Sparkles } from "lucide-react";
import Link from "next/link";

interface TeacherWorkspaceShellProps {
  children: React.ReactNode;
}

export function TeacherWorkspaceShell({ children }: TeacherWorkspaceShellProps) {
  const pathname = usePathname();
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("school-sd001-samarinda");
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Determine active group based on current route
  const activeGroup = getActiveNavGroup(pathname);

  // Sync open group on initial render and route changes
  useEffect(() => {
    const saved = localStorage.getItem("cl_active_school_id");
    if (saved) {
      setSelectedSchoolId(saved);
    }
  }, []);

  useEffect(() => {
    if (activeGroup.hasSubmenu) {
      setOpenGroupId(activeGroup.id);
    } else {
      setOpenGroupId(null);
    }
  }, [pathname, activeGroup.id, activeGroup.hasSubmenu]);

  // Handle icon click on rail
  const handleSelectGroup = (groupId: string) => {
    const targetGroup = TEACHER_NAV_GROUPS.find((g) => g.id === groupId);
    if (!targetGroup) return;

    if (!targetGroup.hasSubmenu) {
      // Direct navigation (Beranda)
      setOpenGroupId(null);
    } else if (openGroupId === groupId) {
      // Toggle / collapse if clicked again
      setOpenGroupId(null);
    } else {
      // Open / switch submenu
      setOpenGroupId(groupId);
    }
  };

  const currentlyOpenGroup = TEACHER_NAV_GROUPS.find((g) => g.id === openGroupId);

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-background text-foreground">
      {/* 1. TOP HEADER (64px) */}
      <AppHeader
        currentSchoolId={selectedSchoolId}
        onSchoolChange={(id) => setSelectedSchoolId(id)}
        onOpenMobileNav={() => setMobileNavOpen(true)}
      />

      {/* 2. BODY AREA: ICON RAIL + OPTIONAL SUBMENU PANEL + MAIN CONTENT */}
      <div className="flex-1 flex min-w-0 overflow-hidden relative">
        {/* Desktop Icon Rail (68px) */}
        <div className="hidden md:flex shrink-0">
          <IconNavigationRail
            activeGroupId={activeGroup.id}
            openGroupId={openGroupId}
            onSelectGroup={handleSelectGroup}
          />
        </div>

        {/* Optional Contextual Submenu Panel (230px) */}
        {currentlyOpenGroup && currentlyOpenGroup.hasSubmenu && (
          <div className="hidden md:flex shrink-0">
            <NavigationSubmenu
              group={currentlyOpenGroup}
              onClose={() => setOpenGroupId(null)}
            />
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden" role="dialog" aria-label="Menu Navigasi Ponsel">
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileNavOpen(false)}
              aria-hidden="true"
            />
            <div className="relative z-10 flex flex-col w-72 max-w-[85vw] h-full bg-white shadow-2xl border-r border-slate-200">
              {/* Drawer Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-extrabold text-sm text-slate-900">Pahami</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                  aria-label="Tutup navigasi"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Groups & Destinations */}
              <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
                {TEACHER_NAV_GROUPS.map((group) => {
                  const GroupIcon = group.icon;
                  return (
                    <div key={group.id} className="space-y-1">
                      <div className="flex items-center gap-2 px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <GroupIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span>{group.label}</span>
                      </div>

                      {group.hasSubmenu && group.items ? (
                        <div className="space-y-0.5 pl-2">
                          {group.items.map((item) => {
                            const isActive = isSubmenuItemActive(item, pathname);
                            const ItemIcon = item.icon;
                            return (
                              <Link
                                key={item.id}
                                href={item.href}
                                onClick={() => setMobileNavOpen(false)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                                  isActive
                                    ? "bg-indigo-50 text-indigo-700 font-semibold"
                                    : "text-slate-700 hover:bg-slate-50"
                                }`}
                              >
                                <ItemIcon className="w-3.5 h-3.5 text-slate-400" />
                                <span>{item.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      ) : (
                        <Link
                          href={group.href}
                          onClick={() => setMobileNavOpen(false)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                            pathname === group.href
                              ? "bg-indigo-50 text-indigo-700 font-semibold"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <GroupIcon className="w-3.5 h-3.5 text-slate-400" />
                          <span>Buka {group.label}</span>
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Main Content Workspace Surface (Adapts width automatically) */}
        <main
          className="flex-1 flex flex-col min-w-0 h-[calc(100vh-64px)] overflow-y-auto bg-slate-50/50 p-4 sm:p-6 lg:p-8"
          role="main"
        >
          <div className="max-w-7xl w-full mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
