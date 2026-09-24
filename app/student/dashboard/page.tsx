"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  ClipboardList,
  CheckCircle2,
  Clock,
  ArrowRight,
  School as SchoolIcon,
  Sparkles,
} from "lucide-react";
import { StudentWorkspaceShell } from "@/components/layout/student-workspace-shell";
import { repository } from "@/lib/db/repository";
import { ClassRoom, LearningMaterial, Exam, ExamAttempt } from "@/lib/db/types";

export default function StudentDashboardPage() {
  const [studentClasses, setStudentClasses] = useState<ClassRoom[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);

  useEffect(() => {
    const user = repository.getCurrentUser();
    const enrolled = repository.getStudentClasses(user.id);
    setStudentClasses(enrolled);

    const schoolId = repository.getActiveSchoolId();
    setExams(repository.getExams(schoolId));
    setMaterials(repository.getMaterials(schoolId));
    setAttempts(repository.getAttempts());
  }, []);

  const completedAttempt = attempts.find((a) => a.student_id === "usr-student-01" && a.status === "graded");

  return (
    <StudentWorkspaceShell>
      {/* 1. Welcome Card for Elementary Student */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-md mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3 backdrop-blur-xs">
              Siswa Kelas 5 SD &bull; Ponorogo
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Halo, Budi Santoso! 👋
            </h1>
            <p className="text-indigo-100 text-sm mt-1 max-w-xl leading-relaxed">
              Selamat datang di Pahami! Belajar materi dan kerjakan latihan soal seru yang dekat dengan lingkungan sekitarmu di Ponorogo.
            </p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-3xl shrink-0">
            📚
          </div>
        </div>
      </div>

      {/* 2. Available Exams to Take */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ClipboardList className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Ujian & Latihan Soal</h2>
          </div>
          <Link
            href="/student/examinations"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>Lihat Semua</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
                    {exam.subject}
                  </span>
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {exam.duration_minutes} Menit
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1">{exam.title}</h3>
                <p className="text-xs text-slate-600 mb-4">{exam.class_name}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">3 Butir Soal</span>
                <Link
                  href={`/student/examinations/${exam.id}/session`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-transform active:scale-95"
                >
                  <span>Kerjakan Sekarang</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Published Score / Exam Result */}
      {completedAttempt && (
        <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-5 mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-lg shadow-xs shrink-0">
              {completedAttempt.score}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Nilai Ujian Terbaru Telah Dirilis</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm mt-0.5">
                Penilaian Harian Matematika & IPAS Kontekstual Ponorogo
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Catatan Guru: &ldquo;{completedAttempt.teacher_feedback}&rdquo;
              </p>
            </div>
          </div>
          <Link
            href={`/student/examinations/${completedAttempt.exam_id}/results`}
            className="px-4 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 font-bold text-xs shrink-0 shadow-2xs"
          >
            Lihat Pembahasan Lengkap
          </Link>
        </div>
      )}

      {/* 4. Latest Contextual Learning Materials */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Materi Pembelajaran Ponorogo</h2>
          </div>
          <Link
            href="/student/materials"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>Semua Materi</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {materials.map((mat) => (
            <div
              key={mat.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md mb-2 inline-block">
                  {mat.subject} Kelas {mat.grade}
                </span>
                <h3 className="font-bold text-slate-900 text-base mb-2">{mat.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                  {mat.content}
                </p>
              </div>
              <Link
                href="/student/materials"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 self-start"
              >
                <span>Baca Selengkapnya</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </StudentWorkspaceShell>
  );
}
