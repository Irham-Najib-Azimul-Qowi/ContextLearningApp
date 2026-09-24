"use client";

import React from "react";
import { IconNavigationRail } from "./icon-navigation-rail";
import { GlobalControls } from "./global-controls";

interface TeacherWorkspaceShellProps {
  children: React.ReactNode;
  activeGroupId?: string;
}

export function TeacherWorkspaceShell({
  children,
  activeGroupId = "dashboard",
}: TeacherWorkspaceShellProps) {
  return (
    <div className="min-h-screen w-full bg-[#3E3547] flex flex-row relative overflow-x-hidden text-[#23212A] antialiased">
      {/* 1. Left Vertical Navigation Sidebar (Dark Gray #3E3547, Inline Accordion) */}
      <IconNavigationRail activeGroupId={activeGroupId} />

      {/* 2. Floating Top-Right Controls (Profile, Settings, Notifikasi - no SD location switcher) */}
      <GlobalControls />

      {/* 3. Main Content Section (Layered Stacking Card with rounded top-left & bottom-left corners) */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#3E3547]">
        <main className="flex-1 bg-[#FAF7F3] rounded-tl-[32px] sm:rounded-tl-[42px] rounded-bl-[32px] sm:rounded-bl-[42px] shadow-2xl p-5 sm:p-7 lg:p-9 min-h-screen relative overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
