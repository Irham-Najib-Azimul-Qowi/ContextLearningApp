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
  School,
  GraduationCap,
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
  const [school, setSchool] = useState<SchoolType | null>(null);

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
      } else {
        setSchool(repository.getSchools()[0]);
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
    <div className="min-h-screen bg-[#EDEFF5] flex flex-col text-[#252B3A]">
      {/* Student Navigation Header */}
      <header className="h-16 px-6 bg-white border-b border-[#DCE0EA] flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-6">
          <Link href="/student/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#5865D8] flex items-center justify-center text-white font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm text-[#252B3A]">ContextLearning</span>
          </Link>

          {/* School Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F7F8FC] border border-[#DCE0EA] text-xs">
            <School className="w-3.5 h-3.5 text-[#5865D8]" />
            <span className="font-medium text-[#252B3A]">{school?.name || "SD Negeri 001 Samarinda"}</span>
          </div>

          {/* Nav Links */}
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
                      ? "bg-[#5865D8] text-white shadow-2xs"
                      : "text-[#697386] hover:bg-[#F1F3F9] hover:text-[#252B3A]"
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
          <div className="text-right">
            <span className="font-bold text-xs text-[#252B3A] block">{studentName}</span>
            <span className="font-mono text-[10px] text-[#5865D8]">{studentCode}</span>
          </div>

          <Link
            href="/auth/login"
            className="p-2 rounded-lg text-[#697386] hover:bg-red-50 hover:text-[#C94F58] transition-colors"
            title="Keluar"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 bg-[#F7F8FC]">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
