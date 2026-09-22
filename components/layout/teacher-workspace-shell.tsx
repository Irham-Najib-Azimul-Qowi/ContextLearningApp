"use client";

import React, { useState } from "react";
import { MainSidebar } from "./main-sidebar";
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
        <MainSidebar
          currentSchoolId={selectedSchoolId}
          onSchoolChange={(id) => setSelectedSchoolId(id)}
        />
      </div>

      {/* Mobile Drawer Backdrop & Navigation */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-[#202638]/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileNavOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 flex flex-col h-full bg-sidebar shadow-2xl">
            <div className="p-2 flex justify-end border-b border-border">
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="p-1 rounded-md text-secondary-text hover:text-foreground cursor-pointer"
                aria-label="Tutup navigasi"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <MainSidebar
              currentSchoolId={selectedSchoolId}
              onSchoolChange={(id) => {
                setSelectedSchoolId(id);
                setMobileNavOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Main Content Workspace Surface */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-workspace">
        {/* Mobile Navigation Trigger (Only on small screens without desktop sidebar) */}
        <div className="md:hidden h-12 border-b border-border bg-surface px-4 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="p-1.5 rounded-lg border border-border text-secondary-text hover:text-foreground hover:bg-[#F2F4F8] cursor-pointer"
            aria-label="Buka navigasi"
          >
            <Menu className="w-4 h-4" />
          </button>
          <span className="font-bold text-xs text-foreground">Pahami</span>
          <div className="w-7" />
        </div>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
