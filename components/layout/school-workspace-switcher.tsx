"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Building2, Check, ChevronDown, Search, PlusCircle, ShieldCheck } from "lucide-react";
import { repository } from "@/lib/db/repository";
import { School, SchoolMembership } from "@/lib/db/types";

interface SchoolWorkspaceSwitcherProps {
  currentSchoolId: string;
  onSchoolChange: (schoolId: string) => void;
  userId?: string;
}

export function SchoolWorkspaceSwitcher({
  currentSchoolId,
  onSchoolChange,
  userId = "teacher-demo-01",
}: SchoolWorkspaceSwitcherProps) {
  const [activeSchool, setActiveSchool] = useState<School | null>(null);
  const [memberships, setMemberships] = useState<SchoolMembership[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load authorized memberships for the teacher
    const userMemberships = repository.getUserMemberships(userId);
    setMemberships(userMemberships);

    // Load active school
    const current = repository.getSchoolById(currentSchoolId);
    if (current) {
      setActiveSchool(current);
    } else if (userMemberships.length > 0) {
      const fallback = repository.getSchoolById(userMemberships[0].school_id);
      if (fallback) {
        setActiveSchool(fallback);
      }
    }
  }, [currentSchoolId, userId]);

  // Handle click outside to close popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const hasMultipleSchools = memberships.length > 1;

  const handleSelectSchool = (schoolId: string) => {
    // Enforce server-side authorization check before updating active school
    const isAuthorized = repository.verifyTeacherMembership(userId, schoolId);
    if (!isAuthorized) {
      console.error("Unauthorized school selection attempt:", schoolId);
      return;
    }

    const school = repository.getSchoolById(schoolId);
    if (school) {
      setActiveSchool(school);
      localStorage.setItem("cl_active_school_id", school.id);
      onSchoolChange(school.id);
    }
    setIsOpen(false);
  };

  const filteredMemberships = memberships.filter((m) => {
    const q = searchQuery.toLowerCase().trim();
    const schoolDetails = repository.getSchoolById(m.school_id);
    const name = m.school_name || schoolDetails?.name || "";
    const code = m.school_code || schoolDetails?.code || "";
    const level = m.educational_level || schoolDetails?.educational_level || "";
    return (
      !q ||
      name.toLowerCase().includes(q) ||
      code.toLowerCase().includes(q) ||
      level.toLowerCase().includes(q)
    );
  });

  return (
    <div className="relative inline-flex items-center" ref={popoverRef}>
      <button
        type="button"
        onClick={() => hasMultipleSchools && setIsOpen(!isOpen)}
        className={`group flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
          hasMultipleSchools
            ? "hover:bg-slate-100/90 cursor-pointer text-slate-800"
            : "cursor-default text-slate-800"
        }`}
        title={activeSchool?.name || "Sekolah Aktif"}
        aria-haspopup={hasMultipleSchools ? "true" : undefined}
        aria-expanded={hasMultipleSchools ? isOpen : undefined}
        aria-label={`Sekolah aktif: ${activeSchool?.name || "Memuat..."}`}
      >
        <div className="w-5 h-5 rounded-md bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
          <Building2 className="w-3 h-3" />
        </div>
        <div className="text-left flex flex-col min-w-0 max-w-[140px] sm:max-w-[200px]">
          <span className="font-semibold text-xs text-slate-900 truncate leading-tight">
            {activeSchool?.name || "Memuat Sekolah..."}
          </span>
          <span className="text-[10px] text-slate-500 truncate leading-none mt-0.5">
            {activeSchool?.educational_level || "SD"} • {activeSchool?.regency || "Indonesia"}
          </span>
        </div>
        {hasMultipleSchools && (
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 shrink-0 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </button>

      {/* Searchable Switcher Popover */}
      {hasMultipleSchools && isOpen && (
        <div
          className="absolute top-full left-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in duration-150"
          role="dialog"
          aria-label="Pilih Ruang Kerja Sekolah"
        >
          <div className="px-2 py-1.5 border-b border-slate-100 mb-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Ganti Ruang Kerja Sekolah
            </span>
            <span className="text-[10px] text-slate-400">
              Pilih dari instansi tempat Anda terdaftar resmi
            </span>
          </div>

          {/* Search Input */}
          <div className="relative mb-2 px-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama atau kode sekolah..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              autoFocus
            />
          </div>

          {/* Memberships List */}
          <div className="max-h-52 overflow-y-auto space-y-1 px-1">
            {filteredMemberships.map((m) => {
              const isActive = m.school_id === activeSchool?.id;
              const schoolDetails = repository.getSchoolById(m.school_id);
              const name = m.school_name || schoolDetails?.name || "Sekolah";
              const code = m.school_code || schoolDetails?.code || "-";
              const level = m.educational_level || schoolDetails?.educational_level || "SD";

              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleSelectSchool(m.school_id)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                    isActive
                      ? "bg-indigo-50/80 text-indigo-950 border border-indigo-200/80 font-semibold"
                      : "text-slate-800 hover:bg-slate-50 border border-transparent"
                  }`}
                >
                  <div className="min-w-0 flex-1 mr-2">
                    <p className="font-semibold text-xs truncate text-slate-900">{name}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                      <span className="font-mono text-indigo-600 font-medium">{code}</span>
                      <span>•</span>
                      <span>{level}</span>
                      <span>•</span>
                      <span className="capitalize">{m.role === "school_coordinator" ? "Koordinator" : "Guru"}</span>
                    </div>
                  </div>
                  {isActive && (
                    <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>
              );
            })}

            {filteredMemberships.length === 0 && (
              <div className="py-4 text-center text-xs text-slate-400">
                Sekolah tidak ditemukan
              </div>
            )}
          </div>

          {/* Footer Action */}
          <div className="border-t border-slate-100 pt-1.5 mt-1.5 px-1">
            <Link
              href="/teacher/onboarding"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5 text-indigo-600" />
              <span>Daftar / Gabung Sekolah Baru</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
