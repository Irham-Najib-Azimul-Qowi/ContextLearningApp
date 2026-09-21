"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  School,
  Plus,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  LogOut,
  Building2,
  Check,
} from "lucide-react";
import { repository } from "@/lib/db/repository";
import { School as SchoolType, SchoolMembership } from "@/lib/db/types";

interface WorkspaceRailProps {
  currentSchoolId?: string;
  onSchoolChange?: (schoolId: string) => void;
}

export function WorkspaceRail({ currentSchoolId, onSchoolChange }: WorkspaceRailProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [memberships, setMemberships] = useState<SchoolMembership[]>([]);
  const [activeId, setActiveId] = useState<string>(currentSchoolId || "school-sd001-samarinda");

  useEffect(() => {
    // Load authorized schools for teacher demo
    const allSchools = repository.getSchools();
    const userMships = repository.getUserMemberships("teacher-demo-01");
    setSchools(allSchools);
    setMemberships(userMships);

    const saved = localStorage.getItem("cl_active_school_id");
    if (saved && allSchools.some((s) => s.id === saved)) {
      setActiveId(saved);
      if (onSchoolChange) onSchoolChange(saved);
    }
  }, [onSchoolChange]);

  const handleSelectSchool = (schoolId: string) => {
    setActiveId(schoolId);
    localStorage.setItem("cl_active_school_id", schoolId);
    if (onSchoolChange) {
      onSchoolChange(schoolId);
    } else {
      router.push(`/teacher/dashboard?school=${schoolId}`);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "SD":
        return "bg-amber-500 text-white";
      case "SMP":
        return "bg-blue-600 text-white";
      case "SMA":
        return "bg-emerald-600 text-white";
      default:
        return "bg-indigo-600 text-white";
    }
  };

  return (
    <aside
      className="workspace-rail w-[72px] bg-[#DCE0EA] flex flex-col items-center py-3 gap-2 border-r border-[#CBD5E1] shrink-0 select-none z-30 min-h-screen"
      aria-label="School Workspaces"
    >
      {/* Brand Icon / Home */}
      <Link
        href="/teacher/dashboard"
        className="w-12 h-12 rounded-2xl bg-[#5865D8] flex items-center justify-center text-white shadow-sm hover:rounded-xl transition-all duration-200 group relative"
        title="ContextLearning Dashboard"
      >
        <Sparkles className="w-6 h-6 group-hover:scale-110 transition-transform" />
        <span className="sr-only">ContextLearning</span>
      </Link>

      {/* Divider */}
      <div className="w-8 h-[2px] bg-[#CBD5E1] rounded my-1" />

      {/* School Workspaces List */}
      <div className="flex-1 flex flex-col items-center gap-2 overflow-y-auto w-full px-2">
        {schools.map((school) => {
          const isActive = school.id === activeId;
          const initials = school.name
            .split(" ")
            .filter((w) => w.length > 1 && !["Negeri", "Kota", "Kabupaten"].includes(w))
            .slice(0, 2)
            .map((w) => w[0])
            .join("") || school.educational_level;

          return (
            <div key={school.id} className="relative flex items-center group w-full justify-center">
              {/* Discord-style Active Indicator Pill */}
              <div
                className={`absolute -left-2 w-1 bg-[#5865D8] rounded-r-full transition-all duration-200 ${
                  isActive ? "h-9" : "h-2 scale-0 group-hover:scale-100 group-hover:h-5"
                }`}
              />

              <button
                type="button"
                onClick={() => handleSelectSchool(school.id)}
                className={`w-12 h-12 flex flex-col items-center justify-center transition-all duration-200 relative ${
                  isActive
                    ? "rounded-2xl bg-[#5865D8] text-white shadow-md ring-2 ring-[#5865D8]/30"
                    : "rounded-[24px] hover:rounded-2xl bg-white text-[#252B3A] hover:bg-[#F1F3F9] shadow-xs"
                }`}
                title={`${school.name} (${school.educational_level})`}
              >
                <span className="text-xs font-bold leading-none tracking-tight">{initials}</span>
                <span
                  className={`text-[9px] font-semibold px-1 rounded-sm mt-0.5 leading-tight ${
                    isActive ? "bg-white/20 text-white" : getLevelColor(school.educational_level)
                  }`}
                >
                  {school.educational_level}
                </span>

                {/* Coordinator / Verified Dot */}
                {school.verification_status === "verified" && (
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#238B68] rounded-full ring-2 ring-white flex items-center justify-center text-[7px] text-white">
                    ✓
                  </span>
                )}
              </button>
            </div>
          );
        })}

        {/* Add or Register School Button */}
        <Link
          href="/teacher/onboarding"
          className="w-12 h-12 rounded-[24px] hover:rounded-2xl bg-white hover:bg-[#238B68] text-[#238B68] hover:text-white flex items-center justify-center transition-all duration-200 shadow-xs group"
          title="Daftarkan / Gabung Sekolah Baru"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
        </Link>
      </div>

      {/* Admin Quick Switch (Platform Ops) */}
      <div className="w-8 h-[2px] bg-[#CBD5E1] rounded my-1" />

      <Link
        href="/admin"
        className="w-12 h-12 rounded-[24px] hover:rounded-2xl bg-[#252B3A] hover:bg-[#5865D8] text-white flex items-center justify-center transition-all duration-200 shadow-xs"
        title="Platform Admin Console"
      >
        <ShieldCheck className="w-5 h-5" />
      </Link>

      {/* Logout / Exit */}
      <Link
        href="/auth/login"
        className="w-12 h-12 rounded-[24px] hover:rounded-2xl bg-white hover:bg-[#C94F58] text-[#697386] hover:text-white flex items-center justify-center transition-all duration-200 shadow-xs"
        title="Keluar Akun"
      >
        <LogOut className="w-4 h-4" />
      </Link>
    </aside>
  );
}
