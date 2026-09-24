"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sparkles,
  BookOpen,
  ClipboardList,
  GraduationCap,
  LogOut,
  Bell,
  School as SchoolIcon,
  ArrowRight,
} from "lucide-react";
import { repository } from "@/lib/db/repository";
import { School, AppNotification } from "@/lib/db/types";

interface StudentWorkspaceShellProps {
  children: React.ReactNode;
}

export function StudentWorkspaceShell({ children }: StudentWorkspaceShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [activeSchool, setActiveSchool] = useState<School | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    setActiveSchool(repository.getActiveSchool());
    const user = repository.getCurrentUser();
    setNotifications(repository.getNotifications(user.id));
  }, []);

  const handleSwitchToTeacher = () => {
    repository.setCurrentRole("TEACHER");
    router.push("/teacher/dashboard");
  };

  const navLinks = [
    { href: "/student/dashboard", label: "Beranda Siswa", icon: GraduationCap },
    { href: "/student/materials", label: "Materi Belajar", icon: BookOpen },
    { href: "/student/examinations", label: "Ujian & Latihan", icon: ClipboardList },
    { href: "/student/classes", label: "Kelas Saya", icon: SchoolIcon },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F3] text-[#23212A] flex flex-col font-sans relative overflow-x-hidden selection:bg-[#FFD36D] selection:text-[#23212A]">
      {/* Ambient background glows */}
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-[#DFAEB3]/25 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed -bottom-40 -right-40 w-96 h-96 bg-[#FFD36D]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Outer Layer: Container with giant rounded corners */}
      <div className="flex-1 w-full max-w-[1380px] mx-auto p-2 sm:p-5 md:p-8 flex flex-col">
        <div className="flex-1 bg-white rounded-[28px] sm:rounded-[36px] shadow-2xl border border-[#E9E5E8] flex flex-col overflow-hidden">
          {/* Layered Top Bar for Elementary Student */}
          <header className="bg-white border-b border-[#E9E5E8] px-4 sm:px-8 py-4 flex items-center justify-between gap-4">
            {/* Brand Logo & Grade Badge */}
            <div className="flex items-center gap-3">
              <Link
                href="/student/dashboard"
                className="w-11 h-11 rounded-2xl bg-[#51465B] text-[#FFD36D] flex items-center justify-center shadow-xs hover:scale-105 transition-transform"
              >
                <Sparkles className="w-6 h-6" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-[#23212A] text-lg leading-tight tracking-tight">
                    PAHAMI Siswa
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-[#FFD36D] text-[#23212A] px-2 py-0.5 rounded-full">
                    Kelas 5 SD
                  </span>
                </div>
                <span className="text-xs font-semibold text-[#756F7A] block leading-tight mt-0.5">
                  {activeSchool?.name || "SD Negeri 1 Ponorogo"} &bull; {activeSchool?.region_name || "Ponorogo"}
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5 bg-[#FAF7F3] p-1.5 rounded-2xl border border-[#E9E5E8]">
              {navLinks.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-[#51465B] text-white shadow-xs"
                        : "text-[#756F7A] hover:text-[#23212A] hover:bg-white"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-[#FFD36D]" : ""}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Actions: Notifications & Switch Mode */}
            <div className="flex items-center gap-2.5">
              {/* Notifications */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowNotifs(!showNotifs)}
                  className="w-10 h-10 rounded-2xl bg-[#FAF7F3] border border-[#E9E5E8] flex items-center justify-center text-[#51465B] hover:bg-slate-100 transition-colors relative"
                  aria-label="Notifikasi Siswa"
                >
                  <Bell className="w-4 h-4" />
                  {notifications.some((n) => !n.read) && (
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#F47D83]" />
                  )}
                </button>

                {showNotifs && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#E9E5E8] p-4 z-50 animate-in fade-in">
                    <div className="font-extrabold text-xs text-[#23212A] mb-2 pb-2 border-b border-[#E9E5E8]">
                      Pemberitahuan Kelas
                    </div>
                    <div className="space-y-2 max-h-56 overflow-y-auto text-xs">
                      {notifications.map((n) => (
                        <div key={n.id} className="p-2.5 bg-[#FAF7F3] rounded-xl text-[#23212A]">
                          <div className="font-bold text-[#51465B]">{n.title}</div>
                          <div className="text-[11px] text-[#756F7A] mt-0.5 leading-snug">{n.message}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Switch to Teacher Mode */}
              <button
                type="button"
                onClick={handleSwitchToTeacher}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FAF7F3] border border-[#E9E5E8] hover:bg-slate-100 text-[#51465B] text-xs font-bold transition-colors"
                title="Beralih ke Tampilan Guru"
              >
                <span>Mode Guru</span>
              </button>

              {/* Student Avatar */}
              <div className="w-10 h-10 rounded-2xl bg-[#51465B] text-[#FFD36D] font-black text-xs flex items-center justify-center shadow-xs border border-[#51465B]">
                BS
              </div>
            </div>
          </header>

          {/* Mobile Navigation Row */}
          <div className="flex md:hidden border-b border-[#E9E5E8] px-3 py-2 justify-around bg-[#FAF7F3]">
            {navLinks.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl text-[10px] font-bold ${
                    isActive ? "bg-[#51465B] text-white" : "text-[#756F7A]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label.split(" ")[0]}</span>
                </Link>
              );
            })}
          </div>

          {/* Main Student Workspace Content */}
          <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto bg-white">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
