"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/navbar";
import Container from "@/components/ui/container";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  ClipboardList,
  BookOpen,
  Users,
  Clock,
  ArrowRight,
  Award,
  CheckCircle2,
} from "lucide-react";
import { repository } from "@/lib/db/repository";
import { ClassRoom, Examination, LearningMaterial, ExaminationAttempt } from "@/lib/db/types";

export default function StudentDashboard() {
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [exams, setExams] = useState<Examination[]>([]);
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [attempts, setAttempts] = useState<ExaminationAttempt[]>([]);

  useEffect(() => {
    const studentId = "student-demo-01";
    setClasses(repository.getStudentClasses(studentId));
    setExams(repository.getExaminations());
    setMaterials(repository.getMaterials());
    const att = repository.getAttempt("exam-01-samarinda", studentId);
    if (att) setAttempts([att]);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <Container className="py-8 sm:py-10">
        {/* Welcome Banner */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="primary">Ruang Siswa</Badge>
              <span className="text-xs text-muted">SD Negeri 001 Samarinda Kota</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Semangat Belajar, Budi Pratama!
            </h1>
            <p className="text-sm text-muted mt-1">
              Kelas 5-A Mahakam • Pembelajaran yang dekat dengan lingkungan sehari-hari.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/student/classes">
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 mr-1" /> Gabung Kelas
              </Button>
            </Link>
            <Link href="/student/examinations">
              <Button variant="primary" size="sm" className="shadow-xs">
                <ClipboardList className="h-4 w-4 mr-1" /> Lihat Semua Ujian
              </Button>
            </Link>
          </div>
        </div>

        {/* 2-Column Student Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column: Active Examinations & Learning Materials */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Examination Card */}
            <Card className="border-indigo-100 ring-1 ring-indigo-50 shadow-sm">
              <CardHeader className="p-5 pb-3 border-b border-border/60 flex flex-row items-center justify-between bg-indigo-50/20">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-primary" />
                  <CardTitle className="text-base font-bold text-foreground">
                    Ujian yang Tersedia
                  </CardTitle>
                </div>
                <Badge variant="warning">Harap Dikerjakan</Badge>
              </CardHeader>

              <CardContent className="p-5 space-y-4">
                {exams.slice(0, 1).map((ex) => (
                  <div key={ex.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-foreground">{ex.title}</h4>
                      <Badge variant="secondary">{ex.subject}</Badge>
                    </div>

                    <p className="text-xs text-muted leading-relaxed">
                      {ex.description || "Ujian evaluasi materi kontekstual lingkungan sekitar sekolah."}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-primary" /> Durasi: {ex.duration_minutes} Menit
                      </span>
                      <span className="flex items-center gap-1">
                        <GraduationCap className="h-3.5 w-3.5 text-secondary" /> Kelas {ex.grade} SD
                      </span>
                    </div>

                    <div className="pt-2 flex items-center justify-end">
                      <Link href={`/student/examinations/${ex.id}/session`}>
                        <Button variant="primary" size="md" className="shadow-xs">
                          Mulai Kerjakan Ujian <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Published Learning Materials */}
            <Card>
              <CardHeader className="p-5 pb-3 border-b border-border/60 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-secondary" />
                  <CardTitle className="text-base font-bold text-foreground">
                    Materi Belajar Terbaru
                  </CardTitle>
                </div>
                <Link href="/student/materials" className="text-xs font-semibold text-primary hover:underline">
                  Lihat Semua
                </Link>
              </CardHeader>

              <CardContent className="p-5 divide-y divide-border/60">
                {materials.map((m) => (
                  <div key={m.id} className="py-3.5 first:pt-0 last:pb-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{m.subject}</Badge>
                      <span className="text-xs text-muted">Kelas {m.grade} SD</span>
                    </div>
                    <h4 className="text-sm font-semibold text-foreground">{m.topic}</h4>
                    <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                      {m.contextualized_content || m.original_content}
                    </p>
                    <div>
                      <Link href="/student/materials">
                        <span className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                          Baca Materi <ArrowRight className="h-3 w-3" />
                        </span>
                      </Link>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Column: Score Card & Active Classes */}
          <div className="space-y-6">
            {/* Published Score Card */}
            <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50/30 to-white">
              <CardHeader className="py-4">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-emerald-800">
                  <Award className="h-4 w-4 text-success" /> Nilai Ujian Terakhir
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted font-medium">Penilaian Harian Matematika:</span>
                  <span className="text-2xl font-black text-emerald-700">85 / 100</span>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  Status: <strong>Nilai Telah Dirilis Guru</strong>. Anda dapat meninjau pembahasan jawaban yang benar.
                </p>
                <div className="pt-2">
                  <Link href="/student/examinations/exam-01-samarinda/results">
                    <Button variant="outline" size="sm" className="w-full text-xs bg-white">
                      Lihat Pembahasan Jawaban
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* My Classes Card */}
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" /> Kelas yang Diikuti
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                {classes.map((c) => (
                  <div key={c.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <h5 className="text-xs font-bold text-foreground">{c.name}</h5>
                    <p className="text-[11px] text-muted mt-0.5">Wali Kelas: Ibu Nurhaliza, S.Pd.</p>
                  </div>
                ))}
                <Link href="/student/classes" className="block pt-1">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    + Masukkan Kode Kelas Lain
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}
