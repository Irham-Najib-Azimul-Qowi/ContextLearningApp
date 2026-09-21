"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import {
  UsersRound,
  PlusCircle,
  Copy,
  CheckCircle2,
  Calendar,
  GraduationCap,
} from "lucide-react";
import { repository } from "@/lib/db/repository";
import { ClassRoom, QuestionSubject, EducationLevel } from "@/lib/db/types";

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassRoom | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // New Class form
  const [name, setName] = useState("");
  const [level, setLevel] = useState<EducationLevel>("SD");
  const [grade, setGrade] = useState("5");
  const [subjects, setSubjects] = useState<QuestionSubject[]>([
    "Matematika",
    "Bahasa Indonesia",
    "IPS",
  ]);

  useEffect(() => {
    const schoolId = localStorage.getItem("cl_active_school_id") || "school-sd001-samarinda";
    setClasses(repository.getClasses(schoolId));
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const schoolId = localStorage.getItem("cl_active_school_id") || "school-sd001-samarinda";
    const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();
    const joinCode = `${level}${grade}-${randomSuffix}`;

    repository.createClass({
      teacher_id: "teacher-demo-01",
      school_id: schoolId,
      name,
      grade: Number(grade),
      educational_level: level,
      subjects,
      join_code: joinCode,
      academic_year: "2026/2027",
      is_active: true,
    });

    setClasses(repository.getClasses(schoolId));
    setShowCreateModal(false);
    setName("");
  };

  const getAvailableGrades = (lvl: EducationLevel) => {
    switch (lvl) {
      case "SD":
        return [1, 2, 3, 4, 5, 6];
      case "SMP":
        return [7, 8, 9];
      case "SMA":
        return [10, 11, 12];
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-[#DCE0EA] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#252B3A] tracking-tight flex items-center gap-2">
            <UsersRound className="w-5 h-5 text-[#5865D8]" />
            Kelas & Rombongan Belajar
          </h1>
          <p className="text-xs text-[#697386] mt-0.5">
            Kelola kelas untuk jenjang SD (1-6), SMP (7-9), dan SMA (10-12) di ruang kerja sekolah Anda.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowCreateModal(true)}
          className="bg-[#5865D8] hover:bg-[#4753C4] text-xs font-semibold"
        >
          <PlusCircle className="w-4 h-4 mr-1.5" /> Buat Kelas Baru
        </Button>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {classes.map((cls) => {
          const members = repository.getClassMembers(cls.id);
          return (
            <div key={cls.id} className="bg-white rounded-xl border border-[#DCE0EA] p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-[#5865D8]">
                    Kelas {cls.grade} {cls.educational_level || "SD"}
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-[#238B68]">
                    Aktif
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#252B3A] mt-2">{cls.name}</h3>
                <p className="text-xs text-[#697386] flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5" /> Tahun Ajaran {cls.academic_year}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-[#697386] uppercase tracking-wider block mb-1">
                  Mata Pelajaran:
                </span>
                <div className="flex flex-wrap gap-1">
                  {cls.subjects.map((sub) => (
                    <span key={sub} className="px-2 py-0.5 rounded bg-[#F1F3F9] text-[11px] font-medium text-[#252B3A]">
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

              {/* Join Code Box */}
              <div className="rounded-xl border border-indigo-100 bg-[#5865D8]/5 p-3 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#5865D8] block">
                    Kode Masuk Siswa:
                  </span>
                  <span className="font-mono text-sm font-bold text-[#252B3A]">{cls.join_code}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyCode(cls.join_code)}
                  className="flex items-center gap-1 rounded-lg border border-[#CBD5E1] bg-white px-2.5 py-1 text-xs font-semibold text-[#5865D8] hover:bg-[#F8FAFC]"
                >
                  {copiedCode === cls.join_code ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#238B68]" /> Tersalin!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Salin
                    </>
                  )}
                </button>
              </div>

              <div className="pt-2 border-t border-[#EDEFF5] flex items-center justify-between text-xs text-[#697386]">
                <span className="flex items-center gap-1 font-medium">
                  <UsersRound className="w-3.5 h-3.5 text-[#5865D8]" /> {members.length} Siswa Terdaftar
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedClass(cls)}
                  className="text-xs font-semibold text-[#5865D8] hover:underline"
                >
                  Lihat Anggota
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Class Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Buat Rombongan Belajar / Kelas Baru"
        description="Pilih jenjang SD, SMP, atau SMA dan tentukan mata pelajaran yang diampu."
      >
        <form onSubmit={handleCreateClass} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-[#252B3A] block mb-1">Nama Kelas:</label>
            <Input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Kelas 5-A Mahakam / Kelas 8-B Sains"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#252B3A] block mb-1">Jenjang Pendidikan:</label>
              <select
                value={level}
                onChange={(e) => {
                  const newLvl = e.target.value as EducationLevel;
                  setLevel(newLvl);
                  const firstGrade = getAvailableGrades(newLvl)[0];
                  setGrade(String(firstGrade));
                }}
                className="w-full rounded-xl border border-[#DCE0EA] bg-white px-3 py-2 text-xs"
              >
                <option value="SD">SD (Sekolah Dasar)</option>
                <option value="SMP">SMP (Sekolah Menengah Pertama)</option>
                <option value="SMA">SMA (Sekolah Menengah Atas)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-[#252B3A] block mb-1">Tingkat Kelas:</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full rounded-xl border border-[#DCE0EA] bg-white px-3 py-2 text-xs"
              >
                {getAvailableGrades(level).map((g) => (
                  <option key={g} value={g}>
                    Kelas {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-[#252B3A] block mb-1.5">Mata Pelajaran:</label>
            <div className="flex flex-wrap gap-3 text-xs font-medium">
              {(["Matematika", "Bahasa Indonesia", "IPS", "IPA", "Bahasa Inggris"] as QuestionSubject[]).map((sub) => (
                <label key={sub} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={subjects.includes(sub)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSubjects([...subjects, sub]);
                      } else {
                        setSubjects(subjects.filter((s) => s !== sub));
                      }
                    }}
                    className="rounded text-[#5865D8]"
                  />
                  {sub}
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DCE0EA]">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowCreateModal(false)} className="text-xs">
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" className="bg-[#5865D8] text-xs">
              Simpan & Terbitkan Kelas
            </Button>
          </div>
        </form>
      </Modal>

      {/* Member Roster Modal */}
      {selectedClass && (
        <Modal
          isOpen={Boolean(selectedClass)}
          onClose={() => setSelectedClass(null)}
          title={`Anggota ${selectedClass.name}`}
          description={`Siswa yang terdaftar di kelas dengan kode ${selectedClass.join_code}`}
        >
          <div className="divide-y divide-[#EDEFF5] text-xs">
            {repository.getClassMembers(selectedClass.id).length === 0 ? (
              <p className="py-6 text-center text-[#697386]">
                Belum ada siswa di kelas ini. Tambahkan siswa di menu Kelola Siswa atau bagikan kode kelas.
              </p>
            ) : (
              repository.getClassMembers(selectedClass.id).map((m, i) => (
                <div key={m.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#F1F3F9] text-[11px] font-bold text-[#697386] flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="font-semibold text-[#252B3A]">{m.student_name || "Siswa"}</span>
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-[#238B68]">
                    Aktif
                  </span>
                </div>
              ))
            )}
          </div>
          <div className="pt-3 border-t border-[#DCE0EA] text-right">
            <Button variant="outline" size="sm" onClick={() => setSelectedClass(null)} className="text-xs">
              Tutup
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
