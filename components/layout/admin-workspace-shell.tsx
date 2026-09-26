"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
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
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { PahamiPuzzleLogo } from "@/components/landing/puzzle-logo";

interface AdminWorkspaceShellProps {
  children: React.ReactNode;
  activeGroupId?: string;
}

export function AdminWorkspaceShell({ children, activeGroupId }: AdminWorkspaceShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [adminUser, setAdminUser] = useState<{
    id: string;
    username: string;
    full_name: string;
    role: string;
    permissions: string[];
  } | null>(null);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aiMenuOpen, setAiMenuOpen] = useState(() => pathname.startsWith("/admin/ai"));
  const [kbMenuOpen, setKbMenuOpen] = useState(() => pathname.startsWith("/admin/knowledge-base"));
  const [sysMenuOpen, setSysMenuOpen] = useState(() =>
    pathname.startsWith("/admin/system") || pathname.startsWith("/admin/security")
  );

  useEffect(() => {
    let isMounted = true;

    fetch("/api/admin/auth/me")
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401 && isMounted) {
            router.push("/admin/login");
          }
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.authenticated && isMounted) {
          setAdminUser(data.admin);
        }
      })
      .catch((err) => {
        // Log softly without kicking user on transient network aborts
        console.warn("Session check notice:", err?.message || err);
      });

    return () => {
      isMounted = false;
    };
  }, [router]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } catch {
      // Fallback
    }
    router.push("/admin/login");
  };

  const navContent = (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFD36D] text-[#51465B] flex items-center justify-center font-black text-xl shadow-[0_4px_12px_rgba(255,211,109,0.35)] shrink-0">
              D
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base tracking-tight text-white">DEPASKAN</span>
                <span className="text-[9px] font-black uppercase tracking-wider bg-[#FFD36D] text-[#3E3547] px-2 py-0.5 rounded-full shadow-xs">
                  Admin
                </span>
              </div>
              <span className="text-[11px] text-[#DFAEB3] block font-medium">
                Pusat Kendali Pengembang
              </span>
            </div>
          </div>
          {mobileMenuOpen && (
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="mt-5 space-y-1 text-xs font-bold overflow-y-auto max-h-[calc(100vh-230px)] pr-1">
          {/* 1. Dashboard */}
          <Link
            href="/admin/dashboard"
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl transition-all ${
              pathname === "/admin/dashboard"
                ? "bg-[#FFD36D] text-[#3E3547] font-black shadow-md"
                : "text-white/80 hover:bg-white/10 hover:text-white"
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>Dashboard</span>
          </Link>

          {/* 2. Pengguna & Sekolah */}
          <Link
            href="/admin/users"
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl transition-all ${
              pathname.startsWith("/admin/users")
                ? "bg-[#FFD36D] text-[#3E3547] font-black shadow-md"
                : "text-white/80 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span>Pengguna</span>
          </Link>

          <Link
            href="/admin/schools"
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl transition-all ${
              pathname.startsWith("/admin/schools")
                ? "bg-[#FFD36D] text-[#3E3547] font-black shadow-md"
                : "text-white/80 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Building2 className="w-4 h-4 shrink-0" />
            <span>Sekolah</span>
          </Link>

          {/* 3. AI Provider Group */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setAiMenuOpen(!aiMenuOpen)}
              className="w-full flex items-center justify-between px-3.5 py-2 text-[11px] uppercase tracking-wider text-[#DFAEB3] font-black hover:text-white transition-colors"
            >
              <span>Multi-Provider AI</span>
              {aiMenuOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {aiMenuOpen && (
              <div className="pl-2 space-y-1 mt-1 border-l-2 border-white/15 ml-3">
                <Link
                  href="/admin/ai"
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                    pathname === "/admin/ai" ? "bg-[#FFD36D] text-[#3E3547] font-black" : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5 shrink-0" />
                  <span>Overview</span>
                </Link>

                <Link
                  href="/admin/ai/credentials"
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                    pathname.startsWith("/admin/ai/credentials") ? "bg-[#FFD36D] text-[#3E3547] font-black" : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Key className="w-3.5 h-3.5 shrink-0" />
                  <span>Kredensial API</span>
                </Link>

                <Link
                  href="/admin/ai/models"
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                    pathname.startsWith("/admin/ai/models") ? "bg-[#FFD36D] text-[#3E3547] font-black" : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5 shrink-0" />
                  <span>Model & Routing</span>
                </Link>

                <Link
                  href="/admin/ai/usage"
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                    pathname.startsWith("/admin/ai/usage") ? "bg-[#FFD36D] text-[#3E3547] font-black" : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5 shrink-0" />
                  <span>Penggunaan Token</span>
                </Link>

                <Link
                  href="/admin/ai/failover"
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                    pathname.startsWith("/admin/ai/failover") ? "bg-[#FFD36D] text-[#3E3547] font-black" : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                  <span>Failover Circuit</span>
                </Link>
              </div>
            )}
          </div>

          {/* 4. Local Knowledge Base Group */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setKbMenuOpen(!kbMenuOpen)}
              className="w-full flex items-center justify-between px-3.5 py-2 text-[11px] uppercase tracking-wider text-[#DFAEB3] font-black hover:text-white transition-colors"
            >
              <span>Knowledge Base</span>
              {kbMenuOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {kbMenuOpen && (
              <div className="pl-2 space-y-1 mt-1 border-l-2 border-white/15 ml-3">
                <Link
                  href="/admin/knowledge-base"
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                    pathname === "/admin/knowledge-base" ? "bg-[#FFD36D] text-[#3E3547] font-black" : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Database className="w-3.5 h-3.5 shrink-0" />
                  <span>Entitas Wilayah</span>
                </Link>

                <Link
                  href="/admin/knowledge-base/media"
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                    pathname.startsWith("/admin/knowledge-base/media") ? "bg-[#FFD36D] text-[#3E3547] font-black" : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5 shrink-0" />
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
              className="w-full flex items-center justify-between px-3.5 py-2 text-[11px] uppercase tracking-wider text-[#DFAEB3] font-black hover:text-white transition-colors"
            >
              <span>Sistem & Log</span>
              {sysMenuOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {sysMenuOpen && (
              <div className="pl-2 space-y-1 mt-1 border-l-2 border-white/15 ml-3">
                <Link
                  href="/admin/system/health"
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                    pathname.startsWith("/admin/system/health") ? "bg-[#FFD36D] text-[#3E3547] font-black" : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Activity className="w-3.5 h-3.5 shrink-0" />
                  <span>Kesehatan Sistem</span>
                </Link>

                <Link
                  href="/admin/system/settings"
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                    pathname.startsWith("/admin/system/settings") ? "bg-[#FFD36D] text-[#3E3547] font-black" : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Settings className="w-3.5 h-3.5 shrink-0" />
                  <span>Pengaturan</span>
                </Link>

                <Link
                  href="/admin/security/audit-logs"
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                    pathname.startsWith("/admin/security") ? "bg-[#FFD36D] text-[#3E3547] font-black" : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  <span>Audit Log</span>
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Bottom Admin User Box */}
      <div className="pt-4 border-t border-white/10 mt-4">
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
                {adminUser?.full_name || "Administrator"}
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
            title="Keluar dari Admin"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen max-h-screen w-full bg-[#51465B] flex flex-row relative overflow-hidden text-[#23212A] antialiased">
      {/* 1. Left Vertical Navigation Sidebar (Desktop) */}
      <aside className="hidden lg:flex w-64 bg-[#51465B] text-white p-5 flex-col justify-between shrink-0 h-screen max-h-screen overflow-hidden border-r border-white/5">
        {navContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex animate-in fade-in duration-150">
          <div className="w-72 bg-[#51465B] text-white p-5 flex flex-col justify-between h-full shadow-2xl animate-in slide-in-from-left duration-200">
            {navContent}
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* 2. Floating Top-Right Controls Pill matching Teacher Workspace Shell */}
      <div className="fixed top-4 right-4 sm:right-6 z-40 select-none flex items-center gap-2 justify-end">
        <div className="flex items-center gap-2 p-1.5 pl-3 rounded-full bg-[#51465B]/90 backdrop-blur-md text-white border border-white/15 shadow-xl">
          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10"
            aria-label="Buka Menu"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Status Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Aktif</span>
          </div>

          {/* Link to App Utama */}
          <Link
            href="/teacher/dashboard"
            target="_blank"
            className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <span>App Guru</span>
            <ExternalLink className="w-3 h-3 text-[#FFD36D]" />
          </Link>

          {/* Admin Avatar & Role */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/15 pr-1">
            <div className="w-7 h-7 rounded-full bg-[#FFD36D] text-[#51465B] font-black text-xs flex items-center justify-center shadow-xs">
              {adminUser?.username?.substring(0, 2).toUpperCase() || "AD"}
            </div>
            <span className="text-xs font-bold text-white hidden sm:inline">
              {adminUser?.username || "Admin"}
            </span>
          </div>

          {/* Quick Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-[#F47D83] transition-colors"
            title="Keluar Sesi"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Main Content Section (Layered Stacking Card with rounded corners matching TeacherWorkspaceShell) */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#51465B] h-screen max-h-screen overflow-hidden">
        <main className="flex-1 bg-[#FAF7F3] rounded-tl-[24px] sm:rounded-tl-[42px] rounded-bl-[24px] sm:rounded-bl-[42px] shadow-2xl p-4 sm:p-7 lg:p-9 h-screen max-h-screen overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
