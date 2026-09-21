"use client";

import React, { useState } from "react";
import { WorkspaceRail } from "./workspace-rail";
import { MainSidebar } from "./main-sidebar";
import { NotificationBell } from "./notification-bell";
import { repository } from "@/lib/db/repository";

interface TeacherWorkspaceShellProps {
  children: React.ReactNode;
}

export function TeacherWorkspaceShell({ children }: TeacherWorkspaceShellProps) {
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("school-sd001-samarinda");

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#EDEFF5] text-[#252B3A]">
      {/* 1. Left School Rail (72px) */}
      <WorkspaceRail
        currentSchoolId={selectedSchoolId}
        onSchoolChange={(id) => setSelectedSchoolId(id)}
      />

      {/* 2. Main Contextual Sidebar (240px) */}
      <MainSidebar currentSchoolId={selectedSchoolId} />

      {/* 3. Main Content Surface (#F7F8FC) */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-[#F7F8FC]">
        {/* Top Header Bar */}
        <header className="h-13 border-b border-[#DCE0EA] bg-white px-6 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[#697386] uppercase tracking-wider">
              Ruang Kerja Guru
            </span>
            <span className="text-[#CBD5E1]">/</span>
            <span className="text-xs font-medium text-[#252B3A]">
              ContextLearning V2
            </span>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell userId="teacher-demo-01" />
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
