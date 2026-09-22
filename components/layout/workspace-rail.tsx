"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  ShieldCheck,
  Sparkles,
  LogOut,
} from "lucide-react";
import { repository } from "@/lib/db/repository";
import { School as SchoolType } from "@/lib/db/types";

interface WorkspaceRailProps {
  currentSchoolId?: string;
  onSchoolChange?: (schoolId: string) => void;
}

export function WorkspaceRail({ currentSchoolId, onSchoolChange }: WorkspaceRailProps) {
  const router = useRouter();
  const [schools, setSchools] = useState<SchoolType[]>(() => repository.getSchools());
  const [activeId, setActiveId] = useState<string>(
    currentSchoolId || "school-sd001-samarinda"
  );

  useEffect(() => {
    const allSchools = repository.getSchools();
    setSchools(allSchools);

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

  return (
    <aside
      className="workspace-rail w-16 bg-[#DCE0EA] flex flex-col items-center py-3 gap-2 border-r border-[#CAD1DE] shrink-0 select-none z-30 min-h-screen"
      aria-label="Daftar Ruang Sekolah"
    >
      {/* Brand Icon / Home */}
      <Link
        href="/teacher/dashboard"
        className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center text-white shadow-xs hover:bg-primary-hover transition-all duration-150 group relative"
        title="ContextLearning Dashboard"
      >
        <Sparkles className="w-5 h-5 group-hover:scale-105 transition-transform" />
        <span className="sr-only">ContextLearning</span>
      </Link>

      {/* Divider */}
      <div className="w-7 h-[1px] bg-[#CAD1DE] my-1" />

      {/* School Workspaces List */}
      <div className="flex-1 flex flex-col items-center gap-2 overflow-y-auto w-full px-2">
        {schools.map((school) => {
          const isActive = school.id === activeId;
          const words = school.name
            .replace(/^(SD|SMP|SMA|SMK)\s+/i, "")
            .split(" ")
            .filter((w) => w.length > 1 && !["Negeri", "Kota", "Kabupaten"].includes(w));
          const initials =
            words.length >= 2
              ? (words[0][0] + words[1][0]).toUpperCase()
              : school.name.slice(0, 2).toUpperCase();

          return (
            <div key={school.id} className="relative flex items-center group w-full justify-center">
              {/* Active Indicator Bar */}
              <div
                className={`absolute -left-2 w-1 bg-primary rounded-r-full transition-all duration-150 ${
                  isActive ? "h-8 opacity-100" : "h-2 opacity-0 group-hover:opacity-100 group-hover:h-4"
                }`}
              />

              <button
                type="button"
                onClick={() => handleSelectSchool(school.id)}
                className={`w-11 h-11 flex flex-col items-center justify-center transition-all duration-150 relative rounded-xl font-semibold cursor-pointer ${
                  isActive
                    ? "bg-primary text-white shadow-xs ring-2 ring-primary/30"
                    : "bg-surface text-foreground hover:bg-[#F2F4F8] border border-border"
                }`}
                title={`${school.name} (${school.educational_level})`}
                aria-label={school.name}
              >
                <span className="text-xs font-bold leading-none tracking-tight">{initials}</span>

                {/* Verified Dot */}
                {school.verification_status === "verified" && (
                  <span
                    className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-success rounded-full ring-2 ring-white flex items-center justify-center text-[8px] text-white font-bold"
                    title="Sekolah Terverifikasi"
                  >
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
          className="w-11 h-11 rounded-xl bg-surface hover:bg-[#F2F4F8] text-secondary-text hover:text-foreground border border-dashed border-border flex items-center justify-center transition-all duration-150 shadow-2xs group cursor-pointer"
          title="Daftarkan / Gabung Sekolah Baru"
        >
          <Plus className="w-4 h-4 group-hover:scale-110 transition-transform duration-150 text-secondary-text" />
        </Link>
      </div>

      {/* Admin Quick Switch (Platform Ops) */}
      <div className="w-7 h-[1px] bg-[#CAD1DE] my-1" />

      <Link
        href="/admin"
        className="w-11 h-11 rounded-xl bg-foreground hover:bg-[#1E2330] text-white flex items-center justify-center transition-all duration-150 shadow-2xs"
        title="Konsol Admin Platform"
      >
        <ShieldCheck className="w-4 h-4" />
      </Link>

      {/* Logout / Exit */}
      <Link
        href="/auth/login"
        className="w-11 h-11 rounded-xl bg-surface hover:bg-error-subtle text-secondary-text hover:text-error border border-border flex items-center justify-center transition-all duration-150 shadow-2xs"
        title="Keluar Akun"
      >
        <LogOut className="w-4 h-4" />
      </Link>
    </aside>
  );
}
