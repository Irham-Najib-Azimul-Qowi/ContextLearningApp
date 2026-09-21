"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/navbar";
import Container from "@/components/ui/container";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import {
  Users,
  PlusCircle,
  Copy,
  CheckCircle2,
  BookOpen,
  GraduationCap,
  Calendar,
} from "lucide-react";
import { repository } from "@/lib/db/repository";
import { ClassRoom, QuestionSubject } from "@/lib/db/types";

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassRoom | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // New Class form
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("5");
  const [subjects, setSubjects] = useState<QuestionSubject[]>([
    "Matematika",
    "Bahasa Indonesia",
    "IPS",
  ]);

  useEffect(() => {
    setClasses(repository.getClasses());
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Generate clean join code e.g. SD01-5C
    const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();
    const joinCode = `SD01-${grade}${randomSuffix}`;

    const newCls = repository.createClass({
      teacher_id: "teacher-demo-01",
      name,
      grade: Number(grade),
      subjects,
      join_code: joinCode,
      academic_year: "2026/2027",
      is_active: true,
    });

    setClasses(repository.getClasses());
    setShowCreateModal(false);
    setName("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <Container className="py-8 sm:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="primary">Manajemen Kelas</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Kelas & Rombongan Belajar
            </h1>
            <p className="text-sm text-muted mt-1">
              Kelola kelas, bagikan kode gabung untuk siswa, dan distribusikan materi serta ujian.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowCreateModal(true)}
            className="shadow-xs"
          >
            <PlusCircle className="h-4 w-4" /> Buat Kelas Baru
          </Button>
        </div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => {
            const members = repository.getClassMembers(cls.id);
            return (
              <Card key={cls.id} className="hover:border-primary/30 transition-all flex flex-col">
                <CardHeader className="p-5 pb-3 border-b border-border/60">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">Kelas {cls.grade} SD</Badge>
                    <Badge variant={cls.is_active ? "success" : "neutral"}>
                      {cls.is_active ? "Aktif" : "Non-aktif"}
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-bold text-foreground mt-2">
                    {cls.name}
                  </CardTitle>
                  <p className="text-xs text-muted flex items-center gap-1 mt-1">
                    <Calendar className="h-3.5 w-3.5" /> Tahun Ajaran {cls.academic_year}
                  </p>
                </CardHeader>

                <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block mb-1.5">
                      Mata Pelajaran:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cls.subjects.map((sub) => (
                        <span
                          key={sub}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-medium text-foreground"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Join Code Box */}
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
                          Kode Gabung Siswa:
                        </span>
                        <span className="font-mono text-base font-bold text-foreground tracking-wider">
                          {cls.join_code}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopyCode(cls.join_code)}
                        className="flex items-center gap-1 rounded-lg border border-indigo-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-indigo-50 transition-colors shadow-2xs"
                      >
                        {copiedCode === cls.join_code ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 text-success" /> Tersalin!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" /> Salin
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-muted">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Users className="h-3.5 w-3.5 text-primary" /> {members.length} Siswa Terdaftar
                    </span>
                    <button
                      onClick={() => setSelectedClass(cls)}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Daftar Siswa
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Create Class Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Buat Rombongan Belajar / Kelas Baru"
          description="Masukkan informasi kelas untuk jenjang Sekolah Dasar."
        >
          <form onSubmit={handleCreateClass} className="space-y-4">
            <Input
              label="Nama Kelas"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Kelas 5-B Mahakam"
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                Tingkat Jenjang Kelas
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {[1, 2, 3, 4, 5, 6].map((g) => (
                  <option key={g} value={g}>
                    Kelas {g} SD
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                Mata Pelajaran yang Didukung
              </label>
              <div className="flex gap-4 text-xs font-medium pt-1">
                {(["Matematika", "Bahasa Indonesia", "IPS"] as QuestionSubject[]).map((sub) => (
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
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    {sub}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCreateModal(false)}
              >
                Batal
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Simpan & Terbitkan Kode
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
            description={`Daftar siswa yang telah bergabung menggunakan kode ${selectedClass.join_code}`}
          >
            <div className="divide-y divide-border/60">
              {repository.getClassMembers(selectedClass.id).length === 0 ? (
                <p className="py-6 text-center text-xs text-muted">
                  Belum ada siswa yang bergabung. Bagikan kode <strong>{selectedClass.join_code}</strong> kepada siswa.
                </p>
              ) : (
                repository.getClassMembers(selectedClass.id).map((m, i) => (
                  <div key={m.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-muted">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-foreground">{m.student_name || "Siswa"}</p>
                        <p className="text-[10px] text-muted">Bergabung: {new Date(m.joined_at).toLocaleDateString("id-ID")}</p>
                      </div>
                    </div>
                    <Badge variant="success">Aktif</Badge>
                  </div>
                ))
              )}
            </div>
            <div className="pt-4 border-t border-border/60 text-right">
              <Button variant="outline" size="sm" onClick={() => setSelectedClass(null)}>
                Tutup
              </Button>
            </div>
          </Modal>
        )}
      </Container>
    </div>
  );
}
