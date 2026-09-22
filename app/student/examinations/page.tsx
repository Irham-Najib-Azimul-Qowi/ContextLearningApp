"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Clock,
  ArrowRight,
  Award,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { repository } from "@/lib/db/repository";
import { Examination } from "@/lib/db/types";

export default function StudentExaminationsListPage() {
  const [exams, setExams] = useState<Examination[]>([]);
  const studentId = "student-demo-01";

  useEffect(() => {
    setExams(repository.getExaminations());
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-surface p-5 rounded-xl border border-border shadow-xs">
        <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-primary" />
          Daftar Ujian & Evaluasi Siswa
        </h1>
        <p className="text-xs text-foreground-secondary mt-0.5">
          Kerjakan penilaian kontekstual yang dijadwalkan oleh bapak/ibu guru dan tinjau hasil nilai Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {exams.map((exam) => {
          const attempt = repository.getAttempt(exam.id, studentId);
          const isFinished = attempt && attempt.status !== "in_progress";

          return (
            <div key={exam.id} className="bg-surface rounded-xl border border-border p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">
                    {exam.subject}
                  </Badge>
                  <Badge variant={isFinished ? "success" : "warning"}>
                    {isFinished ? "Selesai Dikerjakan" : "Tersedia"}
                  </Badge>
                </div>
                <h3 className="text-base font-bold text-foreground mt-2">{exam.title}</h3>
                <p className="text-xs text-foreground-secondary flex items-center gap-1.5 mt-0.5">
                  <UsersRound className="w-3.5 h-3.5 text-primary" /> {exam.class_name ? exam.class_name.replace(" SD", "") : "Kelas 5"}
                  <span className="text-border-strong">•</span>
                  <Clock className="w-3.5 h-3.5 text-foreground-secondary" /> {exam.duration_minutes} Menit
                </p>
              </div>

              <p className="text-xs text-foreground-secondary leading-relaxed line-clamp-2">
                {exam.description || "Ujian evaluasi kompetensi kontekstual Sekolah Dasar."}
              </p>

              {isFinished && attempt ? (
                <div className="rounded-lg border border-success/30 bg-emerald-50/50 p-3 flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">Skor Anda:</span>
                  <span className="text-base font-black text-success font-mono">{attempt.score ?? 85} / 100</span>
                </div>
              ) : (
                <div className="rounded-lg border border-border bg-surface-secondary p-3 text-xs text-foreground-secondary">
                  Jumlah Butir Soal: <strong className="text-foreground">{exam.question_count || exam.questions?.length || 3} Soal</strong>
                </div>
              )}

              <div className="pt-2.5 border-t border-border flex justify-end">
                {isFinished ? (
                  <Link href={`/student/examinations/${exam.id}/results`}>
                    <Button variant="outline" size="sm" className="text-xs border-border hover:bg-surface-secondary text-foreground">
                      <Award className="w-3.5 h-3.5 mr-1 text-success" /> Hasil &amp; Pembahasan
                    </Button>
                  </Link>
                ) : (
                  <Link href={`/student/examinations/${exam.id}/session`}>
                    <Button variant="primary" size="sm" className="bg-primary hover:bg-primary-hover text-xs font-semibold">
                      Mulai Kerjakan <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
