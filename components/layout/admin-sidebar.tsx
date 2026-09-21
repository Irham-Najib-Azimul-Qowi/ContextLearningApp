"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  School,
  UsersRound,
  KeyRound,
  ShieldCheck,
  ChartNoAxesCombined,
  ChevronsUpDown,
  Sparkles,
  LogOut,
} from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Ringkasan Platform",
      href: "/admin",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "Manajemen Sekolah",
      href: "/admin/schools",
      icon: School,
    },
    {
      label: "Pengguna & Akun",
      href: "/admin/users",
      icon: UsersRound,
    },
    {
      label: "Manajemen AI Gemini",
      href: "/admin/ai",
      icon: KeyRound,
    },
    {
      label: "Log Audit Sistem",
      href: "/admin/audit",
      icon: ShieldCheck,
    },
  ];

  return (
    <aside className="w-64 bg-[#1E2330] text-slate-200 flex flex-col shrink-0 h-screen select-none border-r border-slate-800 z-20">
      {/* Admin Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#5865D8] flex items-center justify-center text-white font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-xs text-white leading-tight">ContextLearning</h2>
            <span className="text-[10px] text-slate-400 font-mono">Platform Admin</span>
          </div>
        </div>
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
          PROD OPS
        </span>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? "bg-[#5865D8] text-white font-semibold"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Footer Switch to School Workspace */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/60 space-y-2">
        <Link
          href="/teacher/dashboard"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <span className="flex items-center gap-2">
            <ChevronsUpDown className="w-3.5 h-3.5 text-[#5865D8]" />
            <span>Ke Ruang Guru</span>
          </span>
          <span className="text-[10px] text-slate-400">Exit</span>
        </Link>

        <Link
          href="/auth/login"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-950/30 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar Admin</span>
        </Link>
      </div>
    </aside>
  );
}
