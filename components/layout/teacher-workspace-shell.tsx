"use client";

import React, { useState } from "react";
import { IconNavigationRail } from "./icon-navigation-rail";
import { NavigationSubmenu } from "./navigation-submenu";
import { GlobalControls } from "./global-controls";

interface TeacherWorkspaceShellProps {
  children: React.ReactNode;
  activeGroupId?: string;
}

export function TeacherWorkspaceShell({
  children,
  activeGroupId = "dashboard",
}: TeacherWorkspaceShellProps) {
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);

  const handleSelectGroup = (groupId: string) => {
    if (openGroupId === groupId) {
      setOpenGroupId(null);
    } else {
      setOpenGroupId(groupId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EED9DA] via-[#F7EFEF] to-[#E8CCD0] p-2 sm:p-5 lg:p-8 flex items-center justify-center text-[#23212A] antialiased relative overflow-x-hidden">
      {/* Decorative ambient background tints */}
      <div className="fixed -top-40 -left-40 w-96 h-96 rounded-full bg-[#DFAEB3]/30 blur-3xl pointer-events-none" />
      <div className="fixed -bottom-40 -right-40 w-96 h-96 rounded-full bg-[#FFD36D]/30 blur-3xl pointer-events-none" />

      {/* Main Layered Application Container (Rounded Tablet Frame matching Reference) */}
      <div className="w-full max-w-[1580px] bg-white rounded-[32px] sm:rounded-[40px] shadow-2xl border-[5px] sm:border-[6px] border-[#D9C8DB]/60 overflow-hidden flex flex-row min-h-[880px] lg:min-h-[920px] relative z-10">
        {/* 1. Left Vertical Navigation Rail (Dark Mauve #51465B) */}
        <IconNavigationRail
          activeGroupId={activeGroupId}
          openGroupId={openGroupId}
          onSelectGroup={handleSelectGroup}
        />

        {/* 2. Flyout Submenu Panel */}
        <NavigationSubmenu
          openGroupId={openGroupId}
          onClose={() => setOpenGroupId(null)}
        />

        {/* 3. Floating Top-Right Controls */}
        <GlobalControls />

        {/* 4. Main Scrollable Workspace Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          <main className="flex-1 p-3 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
