"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Clock,
  ArrowRight,
  CheckCircle2,
  Award,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { repository } from "@/lib/db/repository";
import { Examination, ExaminationAttempt } from "@/lib/db/types";

export default function StudentExaminationsListPage() {
  const [exams, setExams] = useState<Examination[]>([]);
  const studentId = "student-demo-01";

  useEffect(() => {
    setExams(repository.getExaminations());
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-[#DCE0EA] shadow-xs">
        <h1 className="text-xl font-bold text-[#252B3A] tracking-tight flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-[#5865D8]" />
          Daftar Ujian & Evaluasi Siswa
        </h1>
        <p className="text-xs text-[#697386] mt-0.5">
          Kerjakan penilaian kontekstual yang dijadwalkan oleh bapak/ibu guru dan tinjau hasil nilai Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {exams.map((exam) => {
          const attempt = repository.getAttempt(exam.id, studentId);
          const isFinished = attempt && attempt.status !== "in_progress";

          return (
            <div key={exam.id} className="bg-white rounded-xl border border-[#DCE0EA] p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-[#5865D8]">
                    {exam.subject}
                  </span>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      isFinished
                        ? "bg-emerald-50 text-[#238B68]"
                        : "bg-amber-50 text-[#C68A28]"
                    }`}
                  >
                    {isFinished ? "Selesai Dikerjakan" : "Tersedia"}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#252B3A] mt-2">{exam.title}</h3>
                <p className="text-xs text-[#697386] flex items-center gap-1.5 mt-0.5">
                  <UsersRound className="w-3.5 h-3.5 text-[#5865D8]" /> {exam.class_name || "Kelas 5 SD"}
                  <span className="text-slate-300">•</span>
                  <Clock className="w-3.5 h-3.5 text-[#697386]" /> {exam.duration_minutes} Menit
                </p>
              </div>

              <p className="text-xs text-[#697386] leading-relaxed line-clamp-2">
                {exam.description || "Ujian evaluasi kompetensi kontekstual Sekolah Dasar."}
              </p>

              {isFinished && attempt ? (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-900">Skor Anda:</span>
                  <span className="text-base font-black text-[#238B68] font-mono">{attempt.score ?? 85} / 100</span>
                </div>
              ) : (
                <div className="rounded-lg border border-[#EDEFF5] bg-[#F7F8FC] p-3 text-xs text-[#697386]">
                  Jumlah Butir Soal: <strong className="text-[#252B3A]">{exam.question_count || exam.questions?.length || 3} Soal</strong>
                </div>
              )}

              <div className="pt-2 border-t border-[#EDEFF5] flex justify-end">
                {isFinished ? (
                  <Link href={`/student/examinations/${exam.id}/results`}>
                    <Button variant="outline" size="sm" className="text-xs border-[#DCE0EA]">
                      <Award className="w-3.5 h-3.5 mr-1 text-[#238B68]" /> Hasil &amp; Pembahasan
                    </Button>
                  </Link>
                ) : (
                  <Link href={`/student/examinations/${exam.id}/session`}>
                    <Button variant="primary" size="sm" className="bg-[#5865D8] hover:bg-[#4753C4] text-xs">
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
