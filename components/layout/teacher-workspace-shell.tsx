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
    <div className="min-h-screen bg-slate-50 flex text-slate-900 antialiased">
      {/* 1. Left Vertical Icon Rail */}
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
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 sm:p-8 md:p-10 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
