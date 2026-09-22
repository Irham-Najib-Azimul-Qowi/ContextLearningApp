"use client";

import React, { useState, useEffect } from "react";
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
    const sch = repository.getSchoolById(schoolId);
    if (sch) setLevel(sch.educational_level);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface p-5 rounded-xl border border-border shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <UsersRound className="w-5 h-5 text-primary" />
            Rombongan Belajar / Kelas
          </h1>
          <p className="text-xs text-secondary-text mt-1">
            Kelola kelas aktif, kode masuk siswa, dan mata pelajaran yang diampu di ruang kerja sekolah.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowCreateModal(true)}
          className="text-xs font-semibold"
        >
          <PlusCircle className="w-4 h-4 mr-1.5" /> Buat Kelas Baru
        </Button>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {classes.map((cls) => {
          const members = repository.getClassMembers(cls.id);
          return (
            <div key={cls.id} className="bg-surface rounded-xl border border-border p-5 shadow-2xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <Badge variant="primary">
                    Tingkat Kelas {cls.grade}
                  </Badge>
                  <Badge variant="success">
                    Aktif
                  </Badge>
                </div>
                <h3 className="text-base font-bold text-foreground mt-2">{cls.name}</h3>
                <p className="text-xs text-secondary-text flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-primary" /> Tahun Ajaran {cls.academic_year}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-secondary-text block mb-1">
                  Mata Pelajaran:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {cls.subjects.map((sub) => (
                    <span key={sub} className="px-2 py-0.5 rounded-md bg-[#F2F4F8] text-[11px] font-medium text-foreground border border-border">
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

              {/* Join Code Box */}
              <div className="rounded-lg border border-primary/20 bg-primary-subtle p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-primary block">
                    Kode Masuk Siswa:
                  </span>
                  <span className="font-mono text-sm font-bold text-foreground">{cls.join_code}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyCode(cls.join_code)}
                  className="flex items-center gap-1 rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-semibold text-primary hover:bg-[#F2F4F8] cursor-pointer"
                >
                  {copiedCode === cls.join_code ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                      <span className="text-success">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Salin
                    </>
                  )}
                </button>
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-secondary-text">
                <span className="flex items-center gap-1 font-medium">
                  <UsersRound className="w-3.5 h-3.5 text-primary" /> {members.length} Siswa Terdaftar
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedClass(cls)}
                  className="text-xs font-semibold text-link hover:underline cursor-pointer"
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
        description="Tentukan nama kelas, tingkat jenjang, dan mata pelajaran yang diampu."
      >
        <form onSubmit={handleCreateClass} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-foreground block mb-1">Nama Kelas:</label>
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
              <label className="font-semibold text-foreground block mb-1">Jenjang Pendidikan:</label>
              <select
                value={level}
                onChange={(e) => {
                  const newLvl = e.target.value as EducationLevel;
                  setLevel(newLvl);
                  const firstGrade = getAvailableGrades(newLvl)[0];
                  setGrade(String(firstGrade));
                }}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
              >
                <option value="SD">SD (Sekolah Dasar)</option>
                <option value="SMP">SMP (Sekolah Menengah Pertama)</option>
                <option value="SMA">SMA (Sekolah Menengah Atas)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-foreground block mb-1">Tingkat Kelas:</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
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
            <label className="font-semibold text-foreground block mb-1.5">Mata Pelajaran:</label>
            <div className="flex flex-wrap gap-3 text-xs font-medium">
              {(["Matematika", "Bahasa Indonesia", "IPS", "IPA", "Bahasa Inggris"] as QuestionSubject[]).map((sub) => (
                <label key={sub} className="flex items-center gap-1.5 cursor-pointer text-foreground">
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
                    className="rounded text-primary focus:ring-primary"
                  />
                  {sub}
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowCreateModal(false)} className="text-xs">
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" className="text-xs">
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
          <div className="divide-y divide-border text-xs">
            {repository.getClassMembers(selectedClass.id).length === 0 ? (
              <p className="py-6 text-center text-secondary-text">
                Belum ada siswa di kelas ini. Tambahkan siswa di menu Kelola Siswa atau bagikan kode kelas.
              </p>
            ) : (
              repository.getClassMembers(selectedClass.id).map((m, i) => (
                <div key={m.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-primary-subtle text-[11px] font-bold text-primary flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="font-semibold text-foreground">{m.student_name || "Siswa"}</span>
                  </div>
                  <Badge variant="success">Aktif</Badge>
                </div>
              ))
            )}
          </div>
          <div className="pt-3 border-t border-border text-right">
            <Button variant="outline" size="sm" onClick={() => setSelectedClass(null)} className="text-xs">
              Tutup
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
