"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/navbar";
import Container from "@/components/ui/container";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ClipboardList,
  Clock,
  ArrowRight,
  CheckCircle2,
  Award,
  Users,
} from "lucide-react";
import { repository } from "@/lib/db/repository";
import { Examination, ExaminationAttempt } from "@/lib/db/types";

export default function StudentExaminationsListPage() {
  const [exams, setExams] = useState<Examination[]>([]);
  const studentId = "student-demo-01";

  useEffect(() => {
    setExams(repository.getExaminations());
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <Container className="py-8 sm:py-10">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary">Penilaian &amp; Evaluasi</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Daftar Ujian Siswa
          </h1>
          <p className="text-sm text-muted mt-1">
            Kerjakan ujian yang dijadwalkan oleh bapak/ibu guru dan tinjau hasil penilaian Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => {
            const attempt = repository.getAttempt(exam.id, studentId);
            const isFinished = attempt && attempt.status !== "in_progress";

            return (
              <Card key={exam.id} className="hover:border-primary/30 transition-all flex flex-col">
                <CardHeader className="p-5 pb-3 border-b border-border/60">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{exam.subject}</Badge>
                    <Badge variant={isFinished ? "success" : "warning"}>
                      {isFinished ? "Selesai Dikerjakan" : "Tersedia"}
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-bold text-foreground mt-2">
                    {exam.title}
                  </CardTitle>
                  <p className="text-xs text-muted flex items-center gap-1.5 mt-1">
                    <Users className="h-3.5 w-3.5 text-primary" /> {exam.class_name || "Kelas 5 SD"}
                    <span className="text-slate-300">•</span>
                    <Clock className="h-3.5 w-3.5 text-muted" /> {exam.duration_minutes} Menit
                  </p>
                </CardHeader>

                <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-xs text-muted leading-relaxed line-clamp-2">
                    {exam.description || "Ujian evaluasi kompetensi kontekstual Sekolah Dasar."}
                  </p>

                  {isFinished && attempt ? (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 flex items-center justify-between">
                      <span className="text-xs font-semibold text-emerald-900">Skor Anda:</span>
                      <span className="text-base font-black text-emerald-700">{attempt.score ?? 85} / 100</span>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-muted">
                      Jumlah Butir Soal: <strong>{exam.question_count || exam.questions?.length || 3} Soal</strong>
                    </div>
                  )}

                  <div className="pt-2 border-t border-border/60 flex items-center justify-end">
                    {isFinished ? (
                      <Link href={`/student/examinations/${exam.id}/results`}>
                        <Button variant="outline" size="sm" className="text-xs">
                          <Award className="h-3.5 w-3.5 mr-1" /> Lihat Hasil &amp; Pembahasan
                        </Button>
                      </Link>
                    ) : (
                      <Link href={`/student/examinations/${exam.id}/session`}>
                        <Button variant="primary" size="sm" className="text-xs shadow-xs">
                          Mulai Kerjakan <ArrowRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </Container>
    </div>
  );
}
