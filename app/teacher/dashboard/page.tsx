"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/navbar";
import Container from "@/components/ui/container";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  FileQuestion,
  BookOpen,
  Users,
  ClipboardList,
  School,
  MapPin,
  ArrowRight,
  PlusCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { repository } from "@/lib/db/repository";
import { ClassRoom, Examination, Question, LearningMaterial, School as SchoolType } from "@/lib/db/types";

export default function TeacherDashboard() {
  const [school, setSchool] = useState<SchoolType | null>(null);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [exams, setExams] = useState<Examination[]>([]);

  useEffect(() => {
    // Load from repository
    const schools = repository.getSchools();
    if (schools.length > 0) setSchool(schools[0]);
    setClasses(repository.getClasses());
    setQuestions(repository.getQuestions());
    setMaterials(repository.getMaterials());
    setExams(repository.getExaminations());
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <Container className="py-8 sm:py-10">
        {/* Welcome Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="primary">Portal Pendidik</Badge>
              <span className="text-xs text-muted">Tahun Ajaran 2026/2027</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Selamat Datang, Ibu Nurhaliza, S.Pd.
            </h1>
            <p className="text-sm text-muted mt-1 flex items-center gap-1.5">
              <School className="h-4 w-4 text-primary" />
              {school ? school.name : "SD Negeri 001 Samarinda Kota"}
              <span className="text-slate-300">•</span>
              <MapPin className="h-3.5 w-3.5 text-muted" />
              {school ? `${school.district}, ${school.regency}` : "Samarinda Kota, Kota Samarinda"}
            </p>
          </div>

          {/* Primary Quick Actions */}
          <div className="flex flex-wrap gap-2.5">
            <Link href="/teacher/questions/generator">
              <Button variant="primary" size="sm" className="shadow-xs">
                <Sparkles className="h-4 w-4" /> Buat Soal AI
              </Button>
            </Link>
            <Link href="/teacher/materials">
              <Button variant="outline" size="sm">
                <BookOpen className="h-4 w-4" /> Buat Materi
              </Button>
            </Link>
            <Link href="/teacher/classes">
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4" /> Buat Kelas
              </Button>
            </Link>
            <Link href="/teacher/examinations">
              <Button variant="outline" size="sm">
                <ClipboardList className="h-4 w-4" /> Buat Ujian
              </Button>
            </Link>
          </div>
        </div>

        {/* Core Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="hover:border-primary/30 transition-all">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-muted">Bank Soal</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-primary">
                  <FileQuestion className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-foreground">{questions.length}</p>
              <span className="text-xs text-success font-medium flex items-center gap-1 mt-1">
                <CheckCircle2 className="h-3 w-3" /> {questions.filter((q) => q.is_approved).length} Terkontekstualisasi
              </span>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/30 transition-all">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-muted">Kelas Aktif</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-secondary">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-foreground">{classes.length}</p>
              <span className="text-xs text-muted mt-1 block">
                Total 46 Siswa Terdaftar
              </span>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/30 transition-all">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-muted">Materi Ajar</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-success">
                  <BookOpen className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-foreground">{materials.length}</p>
              <span className="text-xs text-success font-medium mt-1 block">
                Tersedia untuk Siswa
              </span>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/30 transition-all">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-muted">Ruang Ujian</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-warning">
                  <ClipboardList className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-foreground">{exams.length}</p>
              <span className="text-xs text-warning font-medium mt-1 block">
                1 Sedang Berlangsung
              </span>
            </CardContent>
          </Card>
        </div>

        {/* 2-Column Section: Active Classes & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Classes Column */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between py-4">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" /> Kelas yang Diampu
                </CardTitle>
                <Link href="/teacher/classes" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                  Kelola Kelas <ArrowRight className="h-3 w-3" />
                </Link>
              </CardHeader>
              <CardContent className="p-4 divide-y divide-border/60">
                {classes.map((cls) => (
                  <div key={cls.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">{cls.name}</h4>
                      <p className="text-xs text-muted mt-0.5">
                        Jenjang Kelas {cls.grade} SD • {cls.subjects.join(", ")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-foreground border border-slate-200">
                        Kode: {cls.join_code}
                      </span>
                      <Link href={`/teacher/classes`}>
                        <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
                          Buka
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Questions Bank Overview */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between py-4">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <FileQuestion className="h-4 w-4 text-primary" /> Soal Terkontekstualisasi Terbaru
                </CardTitle>
                <Link href="/teacher/questions" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                  Lihat Semua Soal <ArrowRight className="h-3 w-3" />
                </Link>
              </CardHeader>
              <CardContent className="p-4 divide-y divide-border/60">
                {questions.map((q) => (
                  <div key={q.id} className="py-3.5 first:pt-0 last:pb-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{q.subject}</Badge>
                        <span className="text-xs text-muted font-medium">Kelas {q.grade}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-muted">{q.topic}</span>
                      </div>
                      <Badge variant="success">Telah Disetujui</Badge>
                    </div>
                    <p className="text-xs text-foreground font-medium line-clamp-2 leading-relaxed">
                      {q.original_text}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-muted">
                        Variabel: {q.context_variables.map((v) => `[${v.key}]`).join(" ")}
                      </span>
                      <Link href="/teacher/questions/context-preview">
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-primary">
                          Preview Konteks
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Column: Context Highlight & Active Exam */}
          <div className="space-y-6">
            {/* Context Profile Preview Card */}
            <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50/40 to-white">
              <CardHeader className="py-4">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-primary">
                  <Sparkles className="h-4 w-4" /> Konteks Wilayah Aktif
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                <div>
                  <span className="text-xs text-muted font-medium">Wilayah Terpilih:</span>
                  <p className="text-sm font-bold text-foreground">
                    {school ? `${school.regency}, ${school.province}` : "Kota Samarinda, Kalimantan Timur"}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted font-medium">Ciri Geografis & Budaya:</span>
                  <p className="text-xs text-muted leading-relaxed mt-0.5">
                    DAS Sungai Mahakam, transportasi Kapal Klotok, Pasar Pagi, komoditas Ikan Haruan, serta kerajinan Kain Tenun Belang Hatta.
                  </p>
                </div>
                <div className="pt-2">
                  <Link href="/teacher/school">
                    <Button variant="outline" size="sm" className="w-full text-xs bg-white">
                      Ubah / Sesuaikan Wilayah
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Active Exam Card */}
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-warning" /> Ujian Berlangsung
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                {exams.slice(0, 1).map((ex) => (
                  <div key={ex.id} className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground">{ex.title}</h4>
                    <p className="text-xs text-muted line-clamp-2">{ex.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <Clock className="h-3.5 w-3.5" /> Durasi: {ex.duration_minutes} Menit
                    </div>
                    <div className="pt-2">
                      <Link href={`/teacher/examinations`}>
                        <Button variant="primary" size="sm" className="w-full text-xs">
                          Pantau & Nilai Peserta
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}
