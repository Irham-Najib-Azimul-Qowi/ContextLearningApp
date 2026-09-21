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
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-[#DCE0EA] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#5865D8]/10 text-[#5865D8]">
              Ruang Belajar Siswa
            </span>
            <span className="text-xs text-[#697386]">Kelas 5-A Mahakam</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#252B3A] tracking-tight">
            Semangat Belajar, Budi Pratama!
          </h1>
          <p className="text-xs text-[#697386] mt-0.5">
            Pelajari materi dan kerjakan tugas yang disesuaikan dengan lingkungan tempat tinggalmu.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/student/classes">
            <Button variant="outline" size="sm" className="text-xs border-[#DCE0EA]">
              <UsersRound className="w-3.5 h-3.5 mr-1 text-[#5865D8]" /> Gabung Kelas Lain
            </Button>
          </Link>
          <Link href="/student/examinations">
            <Button variant="primary" size="sm" className="bg-[#5865D8] hover:bg-[#4753C4] text-xs">
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
          <div className="bg-white rounded-xl border border-[#DCE0EA] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#EDEFF5] pb-3">
              <h3 className="text-sm font-bold text-[#252B3A] flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-[#5865D8]" /> Ujian yang Harus Dikerjakan
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-[#C68A28]">
                Batas Waktu: Hari Ini
              </span>
            </div>

            {exams.slice(0, 1).map((ex) => (
              <div key={ex.id} className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#252B3A]">{ex.title}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-[#5865D8]">
                    {ex.subject}
                  </span>
                </div>

                <p className="text-[#697386] leading-relaxed">
                  {ex.description || "Ujian evaluasi kompetensi kontekstual berbasis wilayah sekitar."}
                </p>

                <div className="flex items-center gap-4 text-[#697386]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#5865D8]" /> Durasi: {ex.duration_minutes} Menit
                  </span>
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-[#238B68]" /> Kelas {ex.grade} SD
                  </span>
                </div>

                <div className="pt-2 flex justify-end">
                  <Link href={`/student/examinations/${ex.id}/session`}>
                    <Button variant="primary" size="sm" className="bg-[#5865D8] hover:bg-[#4753C4] text-xs">
                      Mulai Kerjakan Ujian <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Published Learning Materials */}
          <div className="bg-white rounded-xl border border-[#DCE0EA] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#EDEFF5] pb-3">
              <h3 className="text-sm font-bold text-[#252B3A] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#238B68]" /> Materi Belajar Kontekstual
              </h3>
              <Link href="/student/materials" className="text-xs font-semibold text-[#5865D8] hover:underline">
                Lihat Semua
              </Link>
            </div>

            <div className="divide-y divide-[#EDEFF5]">
              {materials.map((m) => (
                <div key={m.id} className="py-3 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-[#5865D8]">
                      {m.subject}
                    </span>
                    <span className="text-[11px] text-[#697386]">Kelas {m.grade} SD</span>
                  </div>
                  <h4 className="font-bold text-[#252B3A] text-sm mt-1">{m.topic}</h4>
                  <p className="text-[#697386] line-clamp-2 leading-relaxed">
                    {m.contextualized_content || m.original_content}
                  </p>
                  <div className="pt-1">
                    <Link href="/student/materials" className="text-xs font-semibold text-[#5865D8] hover:underline flex items-center gap-1">
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
          <div className="bg-white rounded-xl border border-emerald-200 p-5 shadow-xs bg-gradient-to-br from-emerald-50/20 to-white space-y-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <Award className="w-4 h-4 text-[#238B68]" /> Nilai Ujian Terakhir
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[#697386]">Matematika Kontekstual:</span>
              <span className="text-2xl font-black text-[#238B68] font-mono">85 / 100</span>
            </div>
            <p className="text-[#697386] leading-relaxed">
              Nilai telah dirilis oleh Ibu Nurhaliza, S.Pd. Pembahasan soal sudah dapat kamu pelajari.
            </p>
            <div className="pt-1">
              <Link href="/student/examinations/exam-01-samarinda/results">
                <Button variant="outline" size="sm" className="w-full text-xs border-[#DCE0EA] bg-white">
                  Lihat Pembahasan Jawaban
                </Button>
              </Link>
            </div>
          </div>

          {/* Classes Enrolled */}
          <div className="bg-white rounded-xl border border-[#DCE0EA] p-5 shadow-xs space-y-3 text-xs">
            <h3 className="text-sm font-bold text-[#252B3A] flex items-center gap-2">
              <UsersRound className="w-4 h-4 text-[#5865D8]" /> Kelas yang Diikuti
            </h3>
            {classes.map((c) => (
              <div key={c.id} className="p-3 rounded-lg bg-[#F7F8FC] border border-[#EDEFF5]">
                <h5 className="font-bold text-[#252B3A]">{c.name}</h5>
                <p className="text-[11px] text-[#697386] mt-0.5">Wali Kelas: Ibu Nurhaliza, S.Pd.</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
