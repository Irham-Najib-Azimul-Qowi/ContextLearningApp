"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UsersRound,
  FileQuestion,
  BookOpen,
  ClipboardList,
  GraduationCap,
  Printer,
  ScanLine,
  MapPin,
  Share2,
  Check,
  ChevronDown,
  ShieldCheck,
  Building,
  UserPlus,
} from "lucide-react";
import { repository } from "@/lib/db/repository";
import { School, Profile } from "@/lib/db/types";

interface MainSidebarProps {
  currentSchoolId?: string;
}

export function MainSidebar({ currentSchoolId }: MainSidebarProps) {
  const pathname = usePathname();
  const [activeSchool, setActiveSchool] = useState<School | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const schoolId =
      currentSchoolId ||
      localStorage.getItem("cl_active_school_id") ||
      "school-sd001-samarinda";
    const school = repository.getSchoolById(schoolId);
    if (school) {
      setActiveSchool(school);
    }
  }, [currentSchoolId]);

  const copyStudentLoginLink = () => {
    if (!activeSchool) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const studentUrl = `${origin}/login/${activeSchool.slug}`;
    navigator.clipboard.writeText(studentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const navItems = [
    {
      label: "Dashboard",
      href: "/teacher/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Kelas",
      href: "/teacher/classes",
      icon: UsersRound,
    },
    {
      label: "Bank Soal",
      href: "/teacher/questions",
      icon: FileQuestion,
    },
    {
      label: "Materi Ajar",
      href: "/teacher/materials",
      icon: BookOpen,
    },
    {
      label: "Ujian",
      href: "/teacher/examinations",
      icon: ClipboardList,
    },
    {
      label: "Kelola Siswa",
      href: "/teacher/students",
      icon: GraduationCap,
    },
    {
      label: "Cetak Dokumen",
      href: "/teacher/print",
      icon: Printer,
    },
    {
      label: "Koreksi Lembar Jawaban",
      href: "/teacher/examinations/scan-correction",
      icon: ScanLine,
    },
    {
      label: "Lokasi & Konteks",
      href: "/teacher/school/settings",
      icon: MapPin,
    },
  ];

  return (
    <nav
      className="main-sidebar w-60 bg-[#E3E6EF] flex flex-col border-r border-[#DCE0EA] shrink-0 h-screen select-none z-20"
      aria-label="Workspace Navigation"
    >
      {/* School Header & Workspace Selector */}
      <div className="p-3 border-b border-[#DCE0EA] bg-[#E3E6EF]">
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-full flex items-center justify-between p-2 rounded-lg bg-white/70 hover:bg-white text-left transition-colors border border-[#CBD5E1]"
          >
            <div className="min-w-0 flex-1 mr-2">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-xs text-[#252B3A] truncate">
                  {activeSchool?.name || "Memuat Sekolah..."}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[10px] font-mono font-medium px-1 py-0.2 bg-[#5865D8]/10 text-[#5865D8] rounded">
                  {activeSchool?.code || "SCH-001"}
                </span>
                <span className="text-[10px] px-1 py-0.2 bg-emerald-100 text-[#238B68] rounded font-medium">
                  {activeSchool?.educational_level || "SD"}
                </span>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-[#697386] shrink-0" />
          </button>

          {/* Quick Menu Dropdown */}
          {menuOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-[#DCE0EA] p-1.5 z-40">
              <button
                type="button"
                onClick={() => {
                  copyStudentLoginLink();
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-[#252B3A] hover:bg-[#F1F3F9] rounded-md transition-colors text-left"
              >
                <Share2 className="w-3.5 h-3.5 text-[#5865D8]" />
                <span>Salin Link Login Siswa</span>
              </button>
              <Link
                href="/teacher/onboarding"
                onClick={() => setMenuOpen(false)}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-[#252B3A] hover:bg-[#F1F3F9] rounded-md transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5 text-[#238B68]" />
                <span>Daftar / Pindah Sekolah</span>
              </Link>
            </div>
          )}
        </div>

        {/* Student Portal Quick Copy Pill */}
        <div className="mt-2">
          <button
            type="button"
            onClick={copyStudentLoginLink}
            className="w-full flex items-center justify-center gap-1.5 py-1 px-2 rounded text-[11px] font-medium bg-[#5865D8]/10 hover:bg-[#5865D8]/15 text-[#5865D8] transition-colors"
          >
            {copiedLink ? (
              <>
                <Check className="w-3 h-3 text-[#238B68]" />
                <span className="text-[#238B68] font-semibold">Tersalin ke Clipboard!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3 h-3" />
                <span>Salin Link Login Siswa</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Navigation Links */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== "/teacher/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? "bg-[#5865D8] text-white shadow-xs"
                  : "text-[#252B3A] hover:bg-white/60 hover:text-[#5865D8]"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-[#697386]"}`} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Teacher Profile Footer Card */}
      <div className="p-2.5 border-t border-[#DCE0EA] bg-[#DCE0EA]/50">
        <div className="flex items-center gap-2 px-1">
          <div className="w-8 h-8 rounded-full bg-[#5865D8] text-white flex items-center justify-center text-xs font-bold shrink-0">
            NH
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-[#252B3A] truncate leading-tight">
              Ibu Nurhaliza, S.Pd.
            </p>
            <p className="text-[10px] text-[#697386] font-mono truncate">TCH-SAM-001</p>
          </div>
        </div>
      </div>
    </nav>
  );
}
