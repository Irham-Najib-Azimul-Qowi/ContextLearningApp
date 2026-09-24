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
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full w-fit mb-2">
            <SchoolIcon className="w-3.5 h-3.5" />
            <span>{activeSchool?.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
            Pengelolaan Kelas
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Kelola rombel kelas siswa, bagikan kode unik kelas, dan distribusikan materi pembelajaran.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Kelas Baru</span>
        </button>
      </div>

      {/* Class Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {classes.map((cls) => (
          <div
            key={cls.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                  Kelas {cls.grade} SD
                </span>
                <span className="text-[11px] font-medium text-slate-400">
                  Th. {cls.academic_year}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-base mb-1">{cls.name}</h3>
              <p className="text-xs text-slate-500 mb-4">{cls.subject}</p>

              {/* Unique Join Code Badge */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3 mb-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Kode Gabung Siswa
                  </span>
                  <span className="font-mono font-extrabold text-slate-900 text-base tracking-wider">
                    {cls.code}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyCode(cls.code)}
                  className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
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

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5 font-medium">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                {cls.student_count} Siswa Terdaftar
              </span>
              <span className="text-indigo-600 font-semibold cursor-pointer hover:underline">
                Lihat Anggota
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE CLASS MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 relative">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-1">Tambah Kelas Baru</h3>
            <p className="text-xs text-slate-500 mb-4">
              Kode gabung unik akan dibuatkan otomatis oleh sistem.
            </p>

            <form onSubmit={handleCreateClass} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Rombel / Kelas</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kelas 5C Matematika Kontekstual"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tingkat Kelas SD</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {[1, 2, 3, 4, 5, 6].map((g) => (
                      <option key={g} value={g}>
                        Kelas {g} SD
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tahun Ajaran</label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Fokus Mata Pelajaran</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-xs"
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
