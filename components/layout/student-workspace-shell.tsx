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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Friendly Student Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo & Student Badge */}
          <div className="flex items-center gap-3">
            <Link
              href="/student/dashboard"
              className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs"
            >
              <Sparkles className="w-5 h-5" />
            </Link>
            <div>
              <span className="font-extrabold text-slate-950 text-base leading-tight block">
                Pahami Siswa
              </span>
              <span className="text-[11px] font-medium text-slate-500 block leading-tight">
                {activeSchool?.name || "SD Negeri 1 Ponorogo"}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action: Notifs & Profile */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifs(!showNotifs)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 relative"
                aria-label="Notifikasi Siswa"
              >
                <Bell className="w-4 h-4" />
                {notifications.some((n) => !n.read) && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500" />
                )}
              </button>

              {showNotifs && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-200 p-3 z-50">
                  <div className="font-bold text-xs text-slate-900 mb-2 pb-1 border-b border-slate-100">
                    Pemberitahuan
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto text-xs">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-2 bg-slate-50 rounded-lg text-slate-700">
                        <div className="font-semibold">{n.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{n.message}</div>
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
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              title="Beralih ke Tampilan Guru"
            >
              <span>Mode Guru</span>
            </button>

            {/* Student Avatar */}
            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
              BS
            </div>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden border-t border-slate-100 px-4 py-1.5 justify-around bg-slate-50/70">
          {navLinks.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[10px] font-medium ${
                  isActive ? "text-indigo-600 font-bold" : "text-slate-500"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label.split(" ")[0]}</span>
              </Link>
            );
          })}
        </div>
      </header>

      {/* Main Student Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
