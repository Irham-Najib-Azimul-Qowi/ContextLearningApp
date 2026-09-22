"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  LayoutDashboard,
  UsersRound,
  BookOpen,
  ClipboardList,
  LogOut,
  Building2,
  Menu,
  X,
} from "lucide-react";
import { repository } from "@/lib/db/repository";
import { School as SchoolType } from "@/lib/db/types";

interface StudentWorkspaceShellProps {
  children: React.ReactNode;
}

export function StudentWorkspaceShell({ children }: StudentWorkspaceShellProps) {
  const pathname = usePathname();
  const [studentName, setStudentName] = useState("Budi Pratama");
  const [studentCode, setStudentCode] = useState("STU-SD01-001");
  const [school, setSchool] = useState<SchoolType | null>(() => repository.getSchools()[0]);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("contextlearning_user");
      if (storedUser) {
        const u = JSON.parse(storedUser);
        if (u.name) setStudentName(u.name);
        if (u.student_code) setStudentCode(u.student_code);
        if (u.school_id) {
          const s = repository.getSchoolById(u.school_id);
          if (s) setSchool(s);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const navLinks = [
    { label: "Ruang Belajar", href: "/student/dashboard", icon: LayoutDashboard },
    { label: "Kelas Saya", href: "/student/classes", icon: UsersRound },
    { label: "Materi Ajar", href: "/student/materials", icon: BookOpen },
    { label: "Ujian & Hasil", href: "/student/examinations", icon: ClipboardList },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col text-foreground">
      {/* Student Navigation Header */}
      <header className="h-15 px-4 sm:px-6 bg-surface border-b border-border flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="md:hidden p-1.5 rounded-lg border border-border text-secondary-text hover:text-foreground"
            aria-label="Toggle navigation"
          >
            {mobileNavOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          <Link href="/student/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm text-foreground tracking-tight">ContextLearning</span>
          </Link>

          {/* School Information (Textual representation, no circular SD badge) */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F2F4F8] border border-border text-xs">
            <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="font-medium text-foreground">
              {school?.name || "SD Negeri 001 Samarinda"}
            </span>
            <span className="text-border">·</span>
            <span className="text-secondary-text">
              {school?.educational_level === "SD"
                ? "Sekolah Dasar"
                : school?.educational_level === "SMP"
                ? "Sekolah Menengah Pertama"
                : "Sekolah Menengah Atas"}
            </span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-white font-semibold shadow-2xs"
                      : "text-secondary-text hover:bg-[#F2F4F8] hover:text-foreground"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="font-semibold text-xs text-foreground block">{studentName}</span>
            <span className="font-mono text-[10px] text-primary">{studentCode}</span>
          </div>

          <Link
            href="/auth/login"
            className="p-2 rounded-lg text-secondary-text hover:bg-error-subtle hover:text-error transition-colors"
            title="Keluar"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Mobile Nav Drawer */}
      {mobileNavOpen && (
        <div className="md:hidden bg-surface border-b border-border p-3 space-y-1">
          <div className="p-2 mb-2 bg-[#F2F4F8] rounded-lg border border-border text-xs">
            <p className="font-semibold text-foreground">{school?.name || "SD Negeri 001 Samarinda"}</p>
            <p className="text-[11px] text-secondary-text">{studentName} ({studentCode})</p>
          </div>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileNavOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${
                  isActive ? "bg-primary text-white font-semibold" : "text-foreground hover:bg-[#F2F4F8]"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 bg-workspace">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
