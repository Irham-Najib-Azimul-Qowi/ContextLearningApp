"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Shield,
  LayoutDashboard,
  Users,
  Building2,
  Cpu,
  Key,
  Sliders,
  BarChart3,
  RotateCcw,
  Database,
  Image as ImageIcon,
  Activity,
  Settings,
  ShieldAlert,
  LogOut,
  ChevronDown,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Lock,
} from "lucide-react";

interface AdminWorkspaceShellProps {
  children: React.ReactNode;
  activeGroupId?: string;
}

export function AdminWorkspaceShell({ children }: AdminWorkspaceShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<{
    id: string;
    username: string;
    full_name: string;
    role: string;
    permissions: string[];
  } | null>(null);

  const [aiMenuOpen, setAiMenuOpen] = useState(true);
  const [kbMenuOpen, setKbMenuOpen] = useState(true);
  const [sysMenuOpen, setSysMenuOpen] = useState(true);

  useEffect(() => {
    // Check authenticated admin session
    fetch("/api/admin/auth/me")
      .then((res) => {
        if (!res.ok) {
          router.push("/admin/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.authenticated) {
          setAdminUser(data.admin);
        }
      })
      .catch(() => {
        router.push("/admin/login");
      });
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[#FAF7F3] text-[#23212A] flex flex-col font-sans relative overflow-x-hidden selection:bg-[#FFD36D] selection:text-[#23212A]">
      {/* Ambient background glows */}
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-[#51465B]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed -bottom-40 -right-40 w-96 h-96 bg-[#FFD36D]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Outer Application Container */}
      <div className="flex-1 w-full max-w-[1600px] mx-auto p-2 sm:p-5 md:p-8 flex flex-col">
        <div className="flex-1 bg-white rounded-[28px] sm:rounded-[36px] shadow-2xl border border-[#E9E5E8] flex flex-col lg:flex-row overflow-hidden">
          {/* ================================================================= */}
          {/* SIDEBAR: Dark Mauve Layer (#51465B)                               */}
          {/* ================================================================= */}
          <aside className="w-full lg:w-72 bg-[#51465B] text-white p-6 flex flex-col justify-between shrink-0">
            <div>
              {/* Brand Header */}
              <div className="flex items-center gap-3 pb-6 border-b border-white/10">
                <div className="w-11 h-11 rounded-2xl bg-[#FFD36D] text-[#51465B] flex items-center justify-center font-black shadow-md">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-lg tracking-tight text-white">Depaskan</span>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white px-2 py-0.5 rounded-full">
                      Control Center
                    </span>
                  </div>
                  <span className="text-[11px] text-white/70 block mt-0.5 font-medium">
                    Developer & AI Admin Hub
                  </span>
                </div>
              </div>

              {/* Navigation Menu */}
              <nav className="mt-6 space-y-1.5 text-xs font-bold">
                {/* 1. Dashboard */}
                <Link
                  href="/admin/dashboard"
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all ${
                    pathname === "/admin/dashboard"
                      ? "bg-white/15 text-[#FFD36D] shadow-xs"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard Ringkasan</span>
                </Link>

                {/* 2. Pengguna & Sekolah */}
                <Link
                  href="/admin/users"
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all ${
                    pathname.startsWith("/admin/users")
                      ? "bg-white/15 text-[#FFD36D] shadow-xs"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Manajemen Pengguna</span>
                </Link>

                <Link
                  href="/admin/schools"
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all ${
                    pathname.startsWith("/admin/schools")
                      ? "bg-white/15 text-[#FFD36D] shadow-xs"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Manajemen Sekolah</span>
                </Link>

                {/* 3. AI Management Group */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setAiMenuOpen(!aiMenuOpen)}
                    className="w-full flex items-center justify-between px-3.5 py-2 text-[11px] uppercase tracking-wider text-white/50 font-black hover:text-white"
                  >
                    <span>Multi-Provider AI</span>
                    {aiMenuOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>

                  {aiMenuOpen && (
                    <div className="pl-2 space-y-1 mt-1 border-l-2 border-white/10 ml-3">
                      <Link
                        href="/admin/ai"
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                          pathname === "/admin/ai" ? "bg-white/15 text-[#FFD36D]" : "text-white/70 hover:text-white"
                        }`}
                      >
                        <Cpu className="w-3.5 h-3.5" />
                        <span>Overview Provider</span>
                      </Link>

                      <Link
                        href="/admin/ai/credentials"
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                          pathname.startsWith("/admin/ai/credentials") ? "bg-white/15 text-[#FFD36D]" : "text-white/70 hover:text-white"
                        }`}
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>Kredensial API Key</span>
                      </Link>

                      <Link
                        href="/admin/ai/models"
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                          pathname.startsWith("/admin/ai/models") ? "bg-white/15 text-[#FFD36D]" : "text-white/70 hover:text-white"
                        }`}
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Model & Routing</span>
                      </Link>

                      <Link
                        href="/admin/ai/usage"
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                          pathname.startsWith("/admin/ai/usage") ? "bg-white/15 text-[#FFD36D]" : "text-white/70 hover:text-white"
                        }`}
                      >
                        <BarChart3 className="w-3.5 h-3.5" />
                        <span>Penggunaan & Token</span>
                      </Link>

                      <Link
                        href="/admin/ai/failover"
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                          pathname.startsWith("/admin/ai/failover") ? "bg-white/15 text-[#FFD36D]" : "text-white/70 hover:text-white"
                        }`}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Failover & Circuit</span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* 4. Local Knowledge Base Group */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setKbMenuOpen(!kbMenuOpen)}
                    className="w-full flex items-center justify-between px-3.5 py-2 text-[11px] uppercase tracking-wider text-white/50 font-black hover:text-white"
                  >
                    <span>Knowledge Base</span>
                    {kbMenuOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>

                  {kbMenuOpen && (
                    <div className="pl-2 space-y-1 mt-1 border-l-2 border-white/10 ml-3">
                      <Link
                        href="/admin/knowledge-base"
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                          pathname === "/admin/knowledge-base" ? "bg-white/15 text-[#FFD36D]" : "text-white/70 hover:text-white"
                        }`}
                      >
                        <Database className="w-3.5 h-3.5" />
                        <span>Dataset & Entitas</span>
                      </Link>

                      <Link
                        href="/admin/knowledge-base/media"
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                          pathname.startsWith("/admin/knowledge-base/media") ? "bg-white/15 text-[#FFD36D]" : "text-white/70 hover:text-white"
                        }`}
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Media Aset CC</span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* 5. System & Health */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setSysMenuOpen(!sysMenuOpen)}
                    className="w-full flex items-center justify-between px-3.5 py-2 text-[11px] uppercase tracking-wider text-white/50 font-black hover:text-white"
                  >
                    <span>Sistem & Keamanan</span>
                    {sysMenuOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>

                  {sysMenuOpen && (
                    <div className="pl-2 space-y-1 mt-1 border-l-2 border-white/10 ml-3">
                      <Link
                        href="/admin/system/health"
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                          pathname.startsWith("/admin/system/health") ? "bg-white/15 text-[#FFD36D]" : "text-white/70 hover:text-white"
                        }`}
                      >
                        <Activity className="w-3.5 h-3.5" />
                        <span>Kesehatan Sistem</span>
                      </Link>

                      <Link
                        href="/admin/system/settings"
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                          pathname.startsWith("/admin/system/settings") ? "bg-white/15 text-[#FFD36D]" : "text-white/70 hover:text-white"
                        }`}
                      >
                        <Settings className="w-3.5 h-3.5" />
                        <span>Pengaturan & Mode</span>
                      </Link>

                      <Link
                        href="/admin/security/audit-logs"
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                          pathname.startsWith("/admin/security") ? "bg-white/15 text-[#FFD36D]" : "text-white/70 hover:text-white"
                        }`}
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Audit Log Keamanan</span>
                      </Link>
                    </div>
                  )}
                </div>
              </nav>
            </div>

            {/* Bottom Admin User Box */}
            <div className="pt-6 border-t border-white/10">
              <div className="flex items-center justify-between">
                <Link
                  href="/admin/profile"
                  className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
                  title="Lihat Profil Admin"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#FFD36D] text-[#51465B] font-black text-xs flex items-center justify-center shadow-xs">
                    {adminUser?.username?.substring(0, 2).toUpperCase() || "AD"}
                  </div>
                  <div>
                    <span className="font-extrabold text-xs text-white block line-clamp-1">
                      {adminUser?.full_name || "Admin"}
                    </span>
                    <span className="text-[10px] text-[#FFD36D] font-mono block">
                      {adminUser?.role || "SUPER_ADMIN"}
                    </span>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 rounded-xl bg-white/10 hover:bg-rose-500 hover:text-white text-white/80 transition-colors"
                  title="Logout Sesi Admin"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </aside>

          {/* ================================================================= */}
          {/* MAIN CONTENT AREA: Off-White / White Layer                        */}
          {/* ================================================================= */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#FAF7F3]">
            {/* Top Bar */}
            <header className="bg-white border-b border-[#E9E5E8] px-6 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-[#756F7A] uppercase tracking-wider">
                  Depaskan &bull; Developer Administration
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/teacher/dashboard"
                  target="_blank"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E9E5E8] text-xs font-bold text-[#51465B] hover:bg-slate-50 transition-colors"
                >
                  <span>Buka App Utama</span>
                  <ExternalLink className="w-3 h-3 text-[#F47D83]" />
                </Link>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span>Sistem Normal</span>
                </div>
              </div>
            </header>

            {/* Page Content */}
            <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
