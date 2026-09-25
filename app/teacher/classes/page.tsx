"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Users,
  Key,
  Copy,
  Check,
  School as SchoolIcon,
  X,
  Search,
} from "lucide-react";
import { TeacherWorkspaceShell } from "@/components/layout/teacher-workspace-shell";
import { repository } from "@/lib/db/repository";
import { ClassRoom, School } from "@/lib/db/types";

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [activeSchool, setActiveSchool] = useState<School | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [grade, setGrade] = useState(5);
  const [subject, setSubject] = useState("Matematika & IPAS");
  const [academicYear, setAcademicYear] = useState("2025/2026");

  useEffect(() => {
    const school = repository.getActiveSchool();
    setActiveSchool(school);
    setClasses(repository.getClasses(school.id));
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !activeSchool) return;

    const teacher = repository.getCurrentUser();
    const newCls = repository.createClass({
      name,
      grade,
      school_id: activeSchool.id,
      teacher_id: teacher.id,
      teacher_name: teacher.full_name,
      subject,
      academic_year: academicYear,
    });

    setClasses([newCls, ...classes]);
    setIsCreateModalOpen(false);
    setName("");
  };

  return (
    <TeacherWorkspaceShell activeGroupId="classes">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#51465B] bg-[#51465B]/10 px-3 py-1 rounded-full w-fit mb-2">
            <SchoolIcon className="w-3.5 h-3.5" />
            <span>{activeSchool?.name || "Kelas Mandiri Pengajar"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#23212A] tracking-tight">
            Pengelolaan Kelas
          </h1>
          <p className="text-xs sm:text-sm text-[#756F7A] font-semibold mt-1">
            Kelola rombel kelas siswa, bagikan kode unik kelas, dan distribusikan materi pembelajaran kontekstual.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#51465B] hover:bg-[#3D3445] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Buat Kelas Baru</span>
        </button>
      </div>

      {/* Class Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {classes.map((cls) => (
          <div
            key={cls.id}
            className="bg-white rounded-3xl border border-[#E9E5E8] p-6 shadow-xs flex flex-col justify-between hover:border-[#51465B]/30 hover:shadow-md transition-all group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-black px-2.5 py-1 rounded-full bg-[#51465B]/10 text-[#51465B]">
                  Kelas {cls.grade} SD
                </span>
                <span className="text-[11px] font-bold text-[#756F7A]">
                  Th. {cls.academic_year}
                </span>
              </div>

              <h3 className="font-black text-[#23212A] text-base group-hover:text-[#51465B] transition-colors mb-1">
                {cls.name}
              </h3>
              <p className="text-xs font-medium text-[#756F7A] mb-4">{cls.subject}</p>

              {/* Unique Join Code Badge */}
              <div className="bg-[#FAF7F3] border border-[#E9E5E8] rounded-2xl p-3.5 mb-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#756F7A] uppercase tracking-wider block">
                    Kode Gabung Siswa
                  </span>
                  <span className="font-mono font-black text-[#23212A] text-base tracking-wider">
                    {cls.code}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyCode(cls.code)}
                  className="p-2 rounded-xl bg-white border border-[#E9E5E8] hover:bg-slate-50 text-[#51465B] transition-colors cursor-pointer"
                  title="Salin Kode Kelas"
                >
                  {copiedCode === cls.code ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E9E5E8] flex items-center justify-between text-xs text-[#756F7A]">
              <span className="flex items-center gap-1.5 font-bold">
                <Users className="w-3.5 h-3.5 text-[#51465B]" />
                {cls.student_count} Siswa Terdaftar
              </span>
              <span className="text-[#51465B] font-black cursor-pointer hover:underline">
                Lihat Anggota
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE CLASS MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-[#E9E5E8] shadow-2xl max-w-md w-full p-6 sm:p-7 relative animate-in fade-in zoom-in-95">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-5 right-5 text-[#756F7A] hover:text-[#23212A] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-[#23212A] mb-1">Tambah Kelas Baru</h3>
            <p className="text-xs text-[#756F7A] mb-5">
              Kode gabung unik akan dibuatkan otomatis oleh sistem untuk dibagikan ke siswa.
            </p>

            <form onSubmit={handleCreateClass} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#23212A] block mb-1.5">Nama Rombel / Kelas</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kelas 5C Matematika Kontekstual"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E5E8] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#51465B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#23212A] block mb-1.5">Tingkat Kelas SD</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E5E8] bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#51465B] cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6].map((g) => (
                      <option key={g} value={g}>
                        Kelas {g} SD
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#23212A] block mb-1.5">Tahun Ajaran</label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E5E8] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#51465B]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#23212A] block mb-1.5">Fokus Mata Pelajaran</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E5E8] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#51465B]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#E9E5E8]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#E9E5E8] text-[#756F7A] hover:bg-slate-50 font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#51465B] hover:bg-[#3D3445] text-white font-black shadow-md transition-all cursor-pointer"
                >
                  Simpan & Buat Kode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </TeacherWorkspaceShell>
  );
}
