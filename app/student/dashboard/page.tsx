"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  ClipboardList,
  BookOpen,
  UsersRound,
  Clock,
  ArrowRight,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { repository } from "@/lib/db/repository";
import { ClassRoom, Examination, LearningMaterial, ExaminationAttempt } from "@/lib/db/types";

export default function StudentDashboard() {
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [exams, setExams] = useState<Examination[]>([]);
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [, setAttempts] = useState<ExaminationAttempt[]>([]);

  useEffect(() => {
    const studentId = "student-demo-01";
    setClasses(repository.getStudentClasses(studentId));
    setExams(repository.getExaminations());
    setMaterials(repository.getMaterials());
    const att = repository.getAttempt("exam-01-samarinda", studentId);
    if (att) setAttempts([att]);
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface p-5 rounded-xl border border-border shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="primary">Ruang Belajar Siswa</Badge>
            <span className="text-xs text-foreground-secondary">Kelas 5-A Mahakam</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Semangat Belajar, Budi Pratama!
          </h1>
          <p className="text-xs text-foreground-secondary mt-0.5">
            Pelajari materi dan kerjakan tugas yang disesuaikan dengan lingkungan tempat tinggalmu.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/student/classes">
            <Button variant="outline" size="sm" className="text-xs border-border">
              <UsersRound className="w-3.5 h-3.5 mr-1 text-primary" /> Gabung Kelas Lain
            </Button>
          </Link>
          <Link href="/student/examinations">
            <Button variant="primary" size="sm" className="bg-primary hover:bg-primary-hover text-xs">
              <ClipboardList className="w-3.5 h-3.5 mr-1" /> Lembar Ujian
            </Button>
          </Link>
        </div>
      </div>

      {/* 2-Column Student Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column: Active Examinations & Learning Materials */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Examination Card */}
          <div className="bg-surface rounded-xl border border-border p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-primary" /> Ujian yang Harus Dikerjakan
              </h3>
              <Badge variant="warning">Batas Waktu: Hari Ini</Badge>
            </div>

            {exams.slice(0, 1).map((ex) => (
              <div key={ex.id} className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-foreground">{ex.title}</h4>
                  <Badge variant="secondary">{ex.subject}</Badge>
                </div>

                <p className="text-foreground-secondary leading-relaxed">
                  {ex.description || "Ujian evaluasi kompetensi kontekstual berbasis wilayah sekitar."}
                </p>

                <div className="flex items-center gap-4 text-foreground-secondary">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-primary" /> Durasi: {ex.duration_minutes} Menit
                  </span>
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-success" /> Kelas {ex.grade}
                  </span>
                </div>

                <div className="pt-2 flex justify-end">
                  <Link href={`/student/examinations/${ex.id}/session`}>
                    <Button variant="primary" size="sm" className="bg-primary hover:bg-primary-hover text-xs font-semibold">
                      Mulai Kerjakan Ujian <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Published Learning Materials */}
          <div className="bg-surface rounded-xl border border-border p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-success" /> Materi Belajar Kontekstual
              </h3>
              <Link href="/student/materials" className="text-xs font-semibold text-primary hover:underline">
                Lihat Semua
              </Link>
            </div>

            <div className="divide-y divide-border">
              {materials.map((m) => (
                <div key={m.id} className="py-3 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{m.subject}</Badge>
                    <span className="text-[11px] text-foreground-secondary">Kelas {m.grade}</span>
                  </div>
                  <h4 className="font-bold text-foreground text-sm">{m.topic}</h4>
                  <p className="text-foreground-secondary line-clamp-2 leading-relaxed">
                    {m.contextualized_content || m.original_content}
                  </p>
                  <div className="pt-1">
                    <Link href="/student/materials" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                      Baca Materi Lengkap <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Score Card & Active Classes */}
        <div className="space-y-6">
          {/* Latest Grade Card */}
          <div className="bg-surface rounded-xl border border-success/30 p-5 shadow-xs bg-gradient-to-br from-emerald-50/40 to-surface space-y-3 text-xs">
            <div className="flex items-center gap-2 text-success font-bold text-sm">
              <Award className="w-4 h-4 text-success" /> Nilai Ujian Terakhir
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-foreground-secondary">Matematika Kontekstual:</span>
              <span className="text-2xl font-black text-success font-mono">85 / 100</span>
            </div>
            <p className="text-foreground-secondary leading-relaxed">
              Nilai telah dirilis oleh Ibu Nurhaliza, S.Pd. Pembahasan soal sudah dapat kamu pelajari.
            </p>
            <div className="pt-1">
              <Link href="/student/examinations/exam-01-samarinda/results">
                <Button variant="outline" size="sm" className="w-full text-xs border-border bg-surface hover:bg-surface-secondary text-foreground">
                  Lihat Pembahasan Jawaban
                </Button>
              </Link>
            </div>
          </div>

          {/* Classes Enrolled */}
          <div className="bg-surface rounded-xl border border-border p-5 shadow-xs space-y-3 text-xs">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <UsersRound className="w-4 h-4 text-primary" /> Kelas yang Diikuti
            </h3>
            {classes.map((c) => (
              <div key={c.id} className="p-3 rounded-lg bg-surface-secondary border border-border">
                <h5 className="font-bold text-foreground">{c.name}</h5>
                <p className="text-[11px] text-foreground-secondary mt-0.5">Wali Kelas: Ibu Nurhaliza, S.Pd.</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
