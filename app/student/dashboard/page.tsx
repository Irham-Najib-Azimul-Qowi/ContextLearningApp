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
  MapPin,
  Trophy,
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
      <div className="bg-[#51465B] rounded-[28px] sm:rounded-[36px] p-6 sm:p-8 text-white shadow-lg mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FFD36D]/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-[#F47D83]/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-[#FAF7F3]/15 text-[#FFD36D] text-xs font-bold px-3 py-1 rounded-full mb-3 backdrop-blur-xs border border-white/10">
              <MapPin className="w-3.5 h-3.5 text-[#F47D83]" />
              <span>Siswa Kelas 5 SD &bull; Karesidenan Madiun</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Halo, Budi Santoso! 👋
            </h1>
            <p className="text-white/80 text-xs sm:text-sm mt-1.5 max-w-xl leading-relaxed">
              Selamat datang di PAHAMI! Belajar materi dan kerjakan latihan soal seru yang dekat dengan lingkungan nyata sekitarmu di Ponorogo & Karesidenan Madiun.
            </p>
          </div>

          <div className="w-20 h-20 rounded-[24px] bg-[#FFD36D] text-[#51465B] flex items-center justify-center text-4xl shrink-0 shadow-md transform rotate-2">
            🎒
          </div>
        </div>
      </div>

      {/* 2. Available Exams to Take */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F3] text-[#51465B] border border-[#E9E5E8] flex items-center justify-center font-bold">
              <ClipboardList className="w-4 h-4 text-[#F47D83]" />
            </div>
            <h2 className="text-lg font-black text-[#23212A]">Ujian & Latihan Soal Aktif</h2>
          </div>
          <Link
            href="/student/examinations"
            className="text-xs font-bold text-[#51465B] hover:text-[#23212A] flex items-center gap-1"
          >
            <span>Lihat Semua</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-[#FAF7F3] rounded-[24px] border border-[#E9E5E8] p-5 shadow-xs hover:border-[#51465B]/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#51465B] bg-white border border-[#E9E5E8] px-2.5 py-1 rounded-full">
                    {exam.subject}
                  </span>
                  <span className="text-xs text-[#756F7A] font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#F47D83]" />
                    {exam.duration_minutes} Menit
                  </span>
                </div>
                <h3 className="font-extrabold text-[#23212A] text-base mb-1">{exam.title}</h3>
                <p className="text-xs text-[#756F7A] mb-4">{exam.class_name}</p>
              </div>

              <div className="pt-3 border-t border-[#E9E5E8] flex items-center justify-between">
                <span className="text-xs text-[#756F7A] font-medium">Butir Soal Terkontekstualisasi</span>
                <Link
                  href={`/student/examinations/${exam.id}/session`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#51465B] hover:bg-[#3E3547] text-white font-bold text-xs shadow-xs transition-transform active:scale-95"
                >
                  <span>Kerjakan Sekarang</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#FFD36D]" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Published Score / Exam Result */}
      {completedAttempt && (
        <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-[28px] p-6 mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
              {completedAttempt.score}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-800 uppercase tracking-wider">
                <Trophy className="w-4 h-4 text-emerald-600" />
                <span>Nilai Ujian Terbaru Telah Dirilis</span>
              </div>
              <h4 className="font-extrabold text-[#23212A] text-base mt-0.5">
                Penilaian Harian Matematika & IPAS Kontekstual Ponorogo
              </h4>
              <p className="text-xs text-[#756F7A] mt-0.5">
                Catatan Guru: &ldquo;{completedAttempt.teacher_feedback}&rdquo;
              </p>
            </div>
          </div>
          <Link
            href={`/student/examinations/${completedAttempt.exam_id}/results`}
            className="px-5 py-2.5 rounded-xl bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 font-bold text-xs shrink-0 shadow-2xs transition-colors"
          >
            Lihat Pembahasan Lengkap
          </Link>
        </div>
      )}

      {/* 4. Latest Contextual Learning Materials */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F3] text-[#51465B] border border-[#E9E5E8] flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4 text-[#51465B]" />
            </div>
            <h2 className="text-lg font-black text-[#23212A]">Materi Pembelajaran Kontekstual</h2>
          </div>
          <Link
            href="/student/materials"
            className="text-xs font-bold text-[#51465B] hover:text-[#23212A] flex items-center gap-1"
          >
            <span>Semua Materi</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {materials.map((mat) => (
            <div
              key={mat.id}
              className="bg-white rounded-[24px] border border-[#E9E5E8] p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#51465B] bg-[#FAF7F3] border border-[#E9E5E8] px-2.5 py-1 rounded-full mb-2.5 inline-block">
                  {mat.subject} &bull; Kelas {mat.grade} SD
                </span>
                <h3 className="font-extrabold text-[#23212A] text-base mb-2">{mat.title}</h3>
                <p className="text-xs text-[#756F7A] line-clamp-3 leading-relaxed mb-4">
                  {mat.content}
                </p>
              </div>
              <Link
                href="/student/materials"
                className="text-xs font-bold text-[#51465B] hover:text-[#23212A] flex items-center gap-1 self-start"
              >
                <span>Baca Selengkapnya</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#F47D83]" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </StudentWorkspaceShell>
  );
}
