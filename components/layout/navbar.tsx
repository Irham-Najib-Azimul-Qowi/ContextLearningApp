"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Container from "@/components/ui/container";
import { NotificationBell } from "@/components/layout/notification-bell";
import {
  Sparkles,
  BookOpen,
  Users,
  ClipboardList,
  FileQuestion,
  School,
  LogIn,
  LogOut,
  UserRound,
  Menu,
  X,
  LayoutDashboard,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<"teacher" | "student" | null>(null);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    try {
      const storedRole = localStorage.getItem("contextlearning_role") as "teacher" | "student" | null;
      const storedName = localStorage.getItem("contextlearning_name");
      if (storedRole) {
        setUserRole(storedRole);
        setUserName(storedName || (storedRole === "teacher" ? "Bapak/Ibu Guru" : "Siswa"));
      } else {
        if (pathname?.startsWith("/teacher")) {
          setUserRole("teacher");
          setUserName("Ibu Nurhaliza, S.Pd.");
        } else if (pathname?.startsWith("/student")) {
          setUserRole("student");
          setUserName("Budi Pratama");
        } else {
          setUserRole(null);
        }
      }
    } catch {
      // ignore
    }
  }, [pathname]);

  const handleLogout = () => {
    try {
      localStorage.removeItem("contextlearning_role");
      localStorage.removeItem("contextlearning_name");
      localStorage.removeItem("contextlearning_user");
    } catch {
      // ignore
    }
    setUserRole(null);
    router.push("/");
  };

  const isTeacher = userRole === "teacher" || pathname?.startsWith("/teacher");
  const isStudent = userRole === "student" || pathname?.startsWith("/student");

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur-md">
      <Container>
        <nav className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href={isTeacher ? "/teacher/dashboard" : isStudent ? "/student/dashboard" : "/"}
            className="flex items-center gap-2.5 group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white shadow-2xs group-hover:bg-primary-hover transition-colors">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-foreground leading-none">
                Context<span className="text-primary">Learning</span>
              </span>
              <span className="text-[10px] font-medium text-secondary-text mt-0.5 tracking-wide">
                Pembelajaran Kontekstual
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-6 lg:flex">
            {!isTeacher && !isStudent ? (
              <>
                <Link
                  href="/"
                  className={`text-sm font-medium transition-colors ${
                    pathname === "/" ? "text-primary font-semibold" : "text-secondary-text hover:text-foreground"
                  }`}
                >
                  Beranda
                </Link>
                <Link
                  href="/#fitur"
                  className="text-sm font-medium text-secondary-text hover:text-foreground transition-colors"
                >
                  Fitur Utama
                </Link>
                <Link
                  href="/#kontekstual"
                  className="text-sm font-medium text-secondary-text hover:text-foreground transition-colors"
                >
                  Mesin Konteks
                </Link>
                <Link
                  href="/#kurikulum"
                  className="text-sm font-medium text-secondary-text hover:text-foreground transition-colors"
                >
                  Kurikulum & Wilayah
                </Link>
              </>
            ) : isTeacher ? (
              <>
                <Link
                  href="/teacher/dashboard"
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                    pathname === "/teacher/dashboard" ? "text-primary font-semibold" : "text-secondary-text hover:text-foreground"
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  href="/teacher/questions"
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                    pathname.startsWith("/teacher/questions") ? "text-primary font-semibold" : "text-secondary-text hover:text-foreground"
                  }`}
                >
                  <FileQuestion className="h-4 w-4" />
                  Bank Soal
                </Link>
                <Link
                  href="/teacher/materials"
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                    pathname.startsWith("/teacher/materials") ? "text-primary font-semibold" : "text-secondary-text hover:text-foreground"
                  }`}
                >
                  <BookOpen className="h-4 w-4" />
                  Materi
                </Link>
                <Link
                  href="/teacher/classes"
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                    pathname.startsWith("/teacher/classes") ? "text-primary font-semibold" : "text-secondary-text hover:text-foreground"
                  }`}
                >
                  <Users className="h-4 w-4" />
                  Kelas
                </Link>
                <Link
                  href="/teacher/examinations"
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                    pathname.startsWith("/teacher/examinations") ? "text-primary font-semibold" : "text-secondary-text hover:text-foreground"
                  }`}
                >
                  <ClipboardList className="h-4 w-4" />
                  Ujian
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/student/dashboard"
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                    pathname === "/student/dashboard" ? "text-primary font-semibold" : "text-secondary-text hover:text-foreground"
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard Siswa
                </Link>
                <Link
                  href="/student/classes"
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                    pathname.startsWith("/student/classes") ? "text-primary font-semibold" : "text-secondary-text hover:text-foreground"
                  }`}
                >
                  <Users className="h-4 w-4" />
                  Kelas Saya
                </Link>
                <Link
                  href="/student/materials"
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                    pathname.startsWith("/student/materials") ? "text-primary font-semibold" : "text-secondary-text hover:text-foreground"
                  }`}
                >
                  <BookOpen className="h-4 w-4" />
                  Materi Belajar
                </Link>
                <Link
                  href="/student/examinations"
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                    pathname.startsWith("/student/examinations") ? "text-primary font-semibold" : "text-secondary-text hover:text-foreground"
                  }`}
                >
                  <ClipboardList className="h-4 w-4" />
                  Ujian & Hasil
                </Link>
              </>
            )}
          </div>

          {/* Actions & User State */}
          <div className="hidden items-center gap-3 lg:flex">
            {isTeacher || isStudent ? (
              <>
                <NotificationBell />
                <div className="flex items-center gap-2 pl-2 border-l border-border">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-subtle text-primary font-semibold text-xs">
                    <UserRound className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-foreground truncate max-w-[140px]">
                      {userName || (isTeacher ? "Guru" : "Siswa")}
                    </span>
                    <span className="text-[10px] text-secondary-text capitalize">
                      {isTeacher ? "Pengajar" : "Siswa"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  title="Keluar"
                  className="rounded-lg border border-border bg-surface p-2 text-secondary-text hover:text-error hover:border-error hover:bg-error-subtle transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/auth/login"
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-[#F2F4F8] hover:border-border-strong transition-colors"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  Masuk
                </Link>
                <Link
                  href="/auth/register"
                  className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-primary-hover shadow-2xs transition-colors"
                >
                  Daftar Guru
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            {(isTeacher || isStudent) && <NotificationBell />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg border border-border p-2 text-secondary-text hover:bg-[#F2F4F8] hover:text-foreground"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
      </Container>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-border bg-surface p-4 lg:hidden animate-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col gap-1.5">
            {!isTeacher && !isStudent ? (
              <>
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-[#F2F4F8]"
                >
                  Beranda
                </Link>
                <Link
                  href="/#fitur"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-[#F2F4F8]"
                >
                  Fitur Utama
                </Link>
                <Link
                  href="/#kontekstual"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-[#F2F4F8]"
                >
                  Mesin Konteks
                </Link>
                <div className="mt-2 flex flex-col gap-2 pt-2 border-t border-border">
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-lg border border-border py-2 text-xs font-semibold text-foreground"
                  >
                    <LogIn className="h-4 w-4" /> Masuk
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-lg bg-primary py-2 text-xs font-semibold text-white"
                  >
                    Daftar Guru
                  </Link>
                </div>
              </>
            ) : isTeacher ? (
              <>
                <Link
                  href="/teacher/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-[#F2F4F8]"
                >
                  <LayoutDashboard className="h-4 w-4 text-primary" /> Dashboard
                </Link>
                <Link
                  href="/teacher/questions"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-[#F2F4F8]"
                >
                  <FileQuestion className="h-4 w-4 text-primary" /> Bank Soal
                </Link>
                <Link
                  href="/teacher/materials"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-[#F2F4F8]"
                >
                  <BookOpen className="h-4 w-4 text-primary" /> Materi
                </Link>
                <Link
                  href="/teacher/classes"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-[#F2F4F8]"
                >
                  <Users className="h-4 w-4 text-primary" /> Kelas
                </Link>
                <Link
                  href="/teacher/examinations"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-[#F2F4F8]"
                >
                  <ClipboardList className="h-4 w-4 text-primary" /> Ujian
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="mt-2 flex items-center justify-center gap-2 rounded-lg border border-error/30 py-2 text-xs font-semibold text-error hover:bg-error-subtle"
                >
                  <LogOut className="h-4 w-4" /> Keluar
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/student/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-[#F2F4F8]"
                >
                  <LayoutDashboard className="h-4 w-4 text-primary" /> Dashboard
                </Link>
                <Link
                  href="/student/classes"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-[#F2F4F8]"
                >
                  <Users className="h-4 w-4 text-primary" /> Kelas Saya
                </Link>
                <Link
                  href="/student/materials"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-[#F2F4F8]"
                >
                  <BookOpen className="h-4 w-4 text-primary" /> Materi Belajar
                </Link>
                <Link
                  href="/student/examinations"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-[#F2F4F8]"
                >
                  <ClipboardList className="h-4 w-4 text-primary" /> Ujian & Hasil
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="mt-2 flex items-center justify-center gap-2 rounded-lg border border-error/30 py-2 text-xs font-semibold text-error hover:bg-error-subtle"
                >
                  <LogOut className="h-4 w-4" /> Keluar
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}