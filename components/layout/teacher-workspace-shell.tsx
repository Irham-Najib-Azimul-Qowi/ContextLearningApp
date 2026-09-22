"use client";

import React, { useState } from "react";
import { WorkspaceRail } from "./workspace-rail";
import { MainSidebar } from "./main-sidebar";
import { NotificationBell } from "./notification-bell";
import { Menu, X } from "lucide-react";

interface TeacherWorkspaceShellProps {
  children: React.ReactNode;
}

export function TeacherWorkspaceShell({ children }: TeacherWorkspaceShellProps) {
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("school-sd001-samarinda");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Desktop Navigation */}
      <div className="hidden md:flex shrink-0">
        <WorkspaceRail
          currentSchoolId={selectedSchoolId}
          onSchoolChange={(id) => setSelectedSchoolId(id)}
        />
        <MainSidebar currentSchoolId={selectedSchoolId} />
      </div>

      {/* Mobile Drawer Backdrop & Navigation */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-[#202638]/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileNavOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 flex h-full shadow-2xl">
            <WorkspaceRail
              currentSchoolId={selectedSchoolId}
              onSchoolChange={(id) => {
                setSelectedSchoolId(id);
                setMobileNavOpen(false);
              }}
            />
            <div className="flex flex-col h-full bg-sidebar">
              <div className="p-2 flex justify-end border-b border-border">
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  className="p-1 rounded-md text-secondary-text hover:text-foreground"
                  aria-label="Tutup navigasi"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <MainSidebar currentSchoolId={selectedSchoolId} />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Workspace Surface */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-workspace">
        {/* Top Header Bar */}
        <header className="h-13 border-b border-border bg-surface px-4 sm:px-6 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="md:hidden p-1.5 rounded-lg border border-border text-secondary-text hover:text-foreground hover:bg-[#F2F4F8]"
              aria-label="Buka navigasi"
            >
              <Menu className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-secondary-text uppercase tracking-wider">
              Ruang Kerja Guru
            </span>
            <span className="text-border">/</span>
            <span className="text-xs font-semibold text-foreground">
              ContextLearning
            </span>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell userId="teacher-demo-01" />
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
