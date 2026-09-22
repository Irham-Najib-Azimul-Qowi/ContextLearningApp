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
  UserPlus,
  Building2,
  ShieldCheck,
  LogOut,
  Sparkles,
} from "lucide-react";
import { repository } from "@/lib/db/repository";
import { School } from "@/lib/db/types";

interface MainSidebarProps {
  currentSchoolId?: string;
  onSchoolChange?: (schoolId: string) => void;
}

export function MainSidebar({ currentSchoolId, onSchoolChange }: MainSidebarProps) {
  const pathname = usePathname();
  const [schools, setSchools] = useState<School[]>([]);
  const [activeSchool, setActiveSchool] = useState<School | null>(() => {
    const defaultId = currentSchoolId || "school-sd001-samarinda";
    return repository.getSchoolById(defaultId) || null;
  });
  const [copiedLink, setCopiedLink] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const all = repository.getSchools();
    setSchools(all);
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
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSelectSchool = (school: School) => {
    setActiveSchool(school);
    localStorage.setItem("cl_active_school_id", school.id);
    if (onSchoolChange) {
      onSchoolChange(school.id);
    }
    setMenuOpen(false);
  };

  const getLevelFullName = (lvl?: string) => {
    switch (lvl) {
      case "SD":
        return "Sekolah Dasar";
      case "SMP":
        return "Sekolah Menengah Pertama";
      case "SMA":
        return "Sekolah Menengah Atas";
      default:
        return "Sekolah Dasar";
    }
  };

  const navItems = [
    {
      label: "Dashboard",
      href: "/teacher/dashboard",
      icon: LayoutDashboard,
      exact: true,
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
      label: "Rombongan Belajar",
      href: "/teacher/classes",
      icon: UsersRound,
    },
    {
      label: "Ujian & Penilaian",
      href: "/teacher/examinations",
      icon: ClipboardList,
    },
    {
      label: "Kelola Siswa",
      href: "/teacher/students",
      icon: GraduationCap,
    },
    {
      label: "Cetak Dokumen & Soal",
      href: "/teacher/print",
      icon: Printer,
    },
    {
      label: "Koreksi Lembar Jawaban",
      href: "/teacher/examinations/scan-correction",
      icon: ScanLine,
    },
    {
      label: "Wilayah & Konteks Lokal",
      href: "/teacher/school/settings",
      icon: MapPin,
    },
  ];

  return (
    <nav
      className="main-sidebar w-64 bg-sidebar flex flex-col border-r border-border shrink-0 h-screen select-none z-20"
      aria-label="Navigasi Guru"
    >
      {/* Brand & App Title */}
      <div className="px-4 py-3 border-b border-border bg-sidebar flex items-center justify-between">
        <Link href="/teacher/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-xs group-hover:bg-primary-hover transition-colors">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-sm text-foreground tracking-tight block leading-tight">
              Pahami
            </span>
            <span className="text-[10px] text-slate-500 font-medium">Ruang Kerja Guru</span>
          </div>
        </Link>
      </div>

      {/* School Header & Workspace Selector Dropdown */}
      <div className="p-3 border-b border-border bg-sidebar">
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-surface hover:bg-surface-secondary text-left transition-colors border border-border cursor-pointer shadow-2xs"
            aria-expanded={menuOpen}
          >
            <div className="min-w-0 flex-1 mr-2">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="font-semibold text-xs text-foreground truncate">
                  {activeSchool?.name || "Memuat Sekolah..."}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                {activeSchool?.educational_level || "SD"} · {getLevelFullName(activeSchool?.educational_level)}
              </p>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
          </button>

          {/* School Switcher & Quick Menu Dropdown */}
          {menuOpen && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-surface rounded-xl shadow-lg border border-border p-1.5 z-40 space-y-1 animate-in fade-in duration-100">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Ganti Ruang Sekolah
              </div>
              <div className="max-h-44 overflow-y-auto space-y-0.5">
                {schools.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelectSchool(s)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                      s.id === activeSchool?.id
                        ? "bg-primary-subtle text-primary font-semibold"
                        : "text-foreground hover:bg-[#F2F4F8]"
                    }`}
                  >
                    <div className="truncate mr-2">
                      <p className="truncate font-medium">{s.name}</p>
                      <p className="text-[10px] text-slate-500">{s.educational_level} • {s.regency}</p>
                    </div>
                    {s.id === activeSchool?.id && (
                      <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              <div className="border-t border-border pt-1 mt-1 space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    copyStudentLoginLink();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-[#F2F4F8] rounded-lg transition-colors text-left cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-primary" />
                  <span>Salin Link Login Siswa</span>
                </button>
                <Link
                  href="/teacher/onboarding"
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-[#F2F4F8] rounded-lg transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5 text-success" />
                  <span>Daftar / Pindah Sekolah Baru</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Quick Link Copy Pill */}
        <div className="mt-2">
          <button
            type="button"
            onClick={copyStudentLoginLink}
            className="w-full flex items-center justify-center gap-1.5 py-1 px-2 rounded-md text-[11px] font-semibold bg-primary-subtle hover:bg-[#E4E8FA] text-primary border border-primary/20 transition-colors cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check className="w-3 h-3 text-success" />
                <span className="text-success">Tersalin ke Clipboard!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3 h-3" />
                <span>Link Login Siswa</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Navigation Links */}
      <div className="flex-1 overflow-y-auto px-2 py-2.5 space-y-0.5">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors ${
                isActive
                  ? "bg-primary text-white font-semibold shadow-2xs"
                  : "text-foreground font-medium hover:bg-surface hover:text-primary"
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? "text-white" : "text-secondary-text"
                }`}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Teacher Profile Footer Card with Quick Exit & Admin console */}
      <div className="p-3 border-t border-border bg-[#D9DEE9]/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0">
            NH
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-foreground truncate leading-tight">
              Ibu Nurhaliza, S.Pd.
            </p>
            <p className="text-[10px] text-slate-500 font-mono truncate">TCH-SAM-001</p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Link
            href="/admin"
            className="p-1.5 rounded-lg text-slate-500 hover:text-foreground hover:bg-surface transition-colors"
            title="Konsol Admin Platform"
          >
            <ShieldCheck className="w-4 h-4" />
          </Link>
          <Link
            href="/auth/login"
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Keluar Akun"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </nav>
  );
}
