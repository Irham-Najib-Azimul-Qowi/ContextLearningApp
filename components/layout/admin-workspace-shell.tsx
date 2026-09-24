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
  ExternalLink,
  Menu,
  X,
  Sparkles,
  CheckCircle2,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const navContent = (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFD36D] text-[#51465B] flex items-center justify-center font-black text-xl shadow-[0_4px_12px_rgba(255,211,109,0.35)] shrink-0">
              D
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg tracking-tight text-white">DEPASKAN</span>
                <span className="text-[9px] font-black uppercase tracking-wider bg-[#F47D83] text-white px-2 py-0.5 rounded-full shadow-xs">
                  Control
                </span>
              </div>
              <span className="text-[11px] text-[#DFAEB3] block font-medium">
                Admin & AI Control Center
              </span>
            </div>
          </div>
          {mobileMenuOpen && (
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-2 rounded-xl bg-white/10 text-white/80 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="mt-6 space-y-1.5 text-xs font-bold">
          {/* 1. Dashboard */}
          <Link
            href="/admin/dashboard"
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl transition-all ${
              pathname === "/admin/dashboard"
                ? "bg-white/20 text-[#FFD36D] shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)]"
                : "text-white/80 hover:bg-white/10 hover:text-white"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard Ringkasan</span>
          </Link>

          {/* 2. Pengguna & Sekolah */}
          <Link
            href="/admin/users"
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl transition-all ${
              pathname.startsWith("/admin/users")
                ? "bg-white/20 text-[#FFD36D] shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)]"
                : "text-white/80 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Manajemen Pengguna</span>
          </Link>

          <Link
            href="/admin/schools"
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl transition-all ${
              pathname.startsWith("/admin/schools")
                ? "bg-white/20 text-[#FFD36D] shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)]"
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
              className="w-full flex items-center justify-between px-3.5 py-2 text-[10px] uppercase tracking-wider text-[#DFAEB3] font-black hover:text-white transition-colors"
            >
              <span>Multi-Provider AI</span>
              {aiMenuOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {aiMenuOpen && (
              <div className="pl-2 space-y-1 mt-1 border-l-2 border-white/15 ml-3">
                <Link
                  href="/admin/ai"
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                    pathname === "/admin/ai" ? "bg-white/20 text-[#FFD36D]" : "text-white/70 hover:text-white"
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Overview Provider</span>
                </Link>

                <Link
                  href="/admin/ai/credentials"
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                    pathname.startsWith("/admin/ai/credentials") ? "bg-white/20 text-[#FFD36D]" : "text-white/70 hover:text-white"
                  }`}
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Kredensial API Key</span>
                </Link>

                <Link
                  href="/admin/ai/models"
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                    pathname.startsWith("/admin/ai/models") ? "bg-white/20 text-[#FFD36D]" : "text-white/70 hover:text-white"
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Model & Routing</span>
                </Link>

                <Link
                  href="/admin/ai/usage"
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                    pathname.startsWith("/admin/ai/usage") ? "bg-white/20 text-[#FFD36D]" : "text-white/70 hover:text-white"
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Penggunaan & Token</span>
                </Link>

                <Link
                  href="/admin/ai/failover"
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                    pathname.startsWith("/admin/ai/failover") ? "bg-white/20 text-[#FFD36D]" : "text-white/70 hover:text-white"
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
              className="w-full flex items-center justify-between px-3.5 py-2 text-[10px] uppercase tracking-wider text-[#DFAEB3] font-black hover:text-white transition-colors"
            >
              <span>Knowledge Base</span>
              {kbMenuOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {kbMenuOpen && (
              <div className="pl-2 space-y-1 mt-1 border-l-2 border-white/15 ml-3">
                <Link
                  href="/admin/knowledge-base"
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                    pathname === "/admin/knowledge-base" ? "bg-white/20 text-[#FFD36D]" : "text-white/70 hover:text-white"
                  }`}
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Dataset & Entitas</span>
                </Link>

                <Link
                  href="/admin/knowledge-base/media"
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                    pathname.startsWith("/admin/knowledge-base/media") ? "bg-white/20 text-[#FFD36D]" : "text-white/70 hover:text-white"
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
              className="w-full flex items-center justify-between px-3.5 py-2 text-[10px] uppercase tracking-wider text-[#DFAEB3] font-black hover:text-white transition-colors"
            >
              <span>Sistem & Keamanan</span>
              {sysMenuOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {sysMenuOpen && (
              <div className="pl-2 space-y-1 mt-1 border-l-2 border-white/15 ml-3">
                <Link
                  href="/admin/system/health"
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                    pathname.startsWith("/admin/system/health") ? "bg-white/20 text-[#FFD36D]" : "text-white/70 hover:text-white"
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Kesehatan Sistem</span>
                </Link>

                <Link
                  href="/admin/system/settings"
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                    pathname.startsWith("/admin/system/settings") ? "bg-white/20 text-[#FFD36D]" : "text-white/70 hover:text-white"
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Pengaturan & Mode</span>
                </Link>

                <Link
                  href="/admin/security/audit-logs"
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                    pathname.startsWith("/admin/security") ? "bg-white/20 text-[#FFD36D]" : "text-white/70 hover:text-white"
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
      <div className="pt-6 border-t border-white/10 mt-6">
        <div className="flex items-center justify-between">
          <Link
            href="/admin/profile"
            className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
            title="Lihat Profil Admin"
          >
            <div className="w-9 h-9 rounded-2xl bg-[#FFD36D] text-[#51465B] font-black text-xs flex items-center justify-center shadow-[0_2px_8px_rgba(255,211,109,0.3)] shrink-0">
              {adminUser?.username?.substring(0, 2).toUpperCase() || "AD"}
            </div>
            <div>
              <span className="font-extrabold text-xs text-white block line-clamp-1">
                {adminUser?.full_name || "Admin Developer"}
              </span>
              <span className="text-[10px] text-[#FFD36D] font-mono block">
                {adminUser?.role || "SUPER_ADMIN"}
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="p-2 rounded-xl bg-white/10 hover:bg-[#F47D83] hover:text-white text-white/80 transition-colors shadow-xs"
            title="Logout Sesi Admin"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF7F3] text-[#23212A] flex flex-col font-sans relative overflow-x-hidden selection:bg-[#FFD36D] selection:text-[#23212A]">
      {/* Ambient background glows */}
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-[#51465B]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed top-1/3 -right-40 w-96 h-96 bg-[#F47D83]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed -bottom-40 -right-40 w-96 h-96 bg-[#FFD36D]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Outer Application Container with Layered Soft UI */}
      <div className="flex-1 w-full max-w-[1600px] mx-auto p-2 sm:p-4 md:p-6 lg:p-8 flex flex-col">
        <div className="flex-1 bg-white rounded-[32px] sm:rounded-[40px] shadow-[0_20px_50px_rgba(81,70,91,0.08)] border border-[#E9E5E8] flex flex-col lg:flex-row overflow-hidden relative">
          
          {/* ================================================================= */}
          {/* SIDEBAR: Desktop Dark Mauve Layer (#51465B)                       */}
          {/* ================================================================= */}
          <aside className="hidden lg:flex w-72 bg-[#51465B] text-white p-6 flex-col justify-between shrink-0 rounded-l-[32px] sm:rounded-l-[40px]">
            {navContent}
          </aside>

          {/* ================================================================= */}
          {/* MOBILE SIDEBAR DRAWER OVERLAY                                     */}
          {/* ================================================================= */}
          {mobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex">
              <div className="w-72 bg-[#51465B] text-white p-6 flex flex-col justify-between h-full shadow-2xl animate-in slide-in-from-left duration-200">
                {navContent}
              </div>
              <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
            </div>
          )}

          {/* ================================================================= */}
          {/* MAIN CONTENT AREA: Off-White / White Layer                        */}
          {/* ================================================================= */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#FAF7F3]">
            {/* Floating Top Bar with Glassmorphic Accent */}
            <header className="mx-4 sm:mx-6 md:mx-8 mt-4 sm:mt-6 bg-white/85 backdrop-blur-md border border-[#E9E5E8] rounded-2xl sm:rounded-3xl px-5 py-3.5 shadow-[0_4px_16px_rgba(81,70,91,0.04)] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden p-2 rounded-xl bg-[#FAF7F3] border border-[#E9E5E8] text-[#51465B] hover:bg-slate-100"
                  aria-label="Buka Menu Admin"
                >
                  <Menu className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#51465B]" />
                  <span className="text-xs font-black text-[#51465B] tracking-tight uppercase">
                    DEPASKAN Control Center
                  </span>
                  <span className="hidden sm:inline text-xs text-[#756F7A] font-semibold">
                    &bull; Developer Management
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span className="text-[11px]">Sistem Normal</span>
                </div>

                <Link
                  href="/teacher/dashboard"
                  target="_blank"
                  className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#E9E5E8] bg-white text-xs font-bold text-[#51465B] hover:bg-[#FAF7F3] hover:border-[#51465B]/30 transition-all shadow-xs"
                >
                  <span>App Utama</span>
                  <ExternalLink className="w-3 h-3 text-[#F47D83]" />
                </Link>

                <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[#E9E5E8]">
                  <div className="w-7 h-7 rounded-xl bg-[#51465B] text-[#FFD36D] font-black text-[10px] flex items-center justify-center shadow-xs">
                    {adminUser?.username?.substring(0, 2).toUpperCase() || "AD"}
                  </div>
                  <span className="text-xs font-bold text-[#23212A]">
                    {adminUser?.username || "admin"}
                  </span>
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

