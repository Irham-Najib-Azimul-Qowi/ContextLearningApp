"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Printer,
  FileText,
  BookOpen,
  ArrowRight,
  Sparkles,
  School as SchoolIcon,
  CheckCircle2,
  Clock,
  MapPin,
  Eye,
  Key,
} from "lucide-react";
import { TeacherWorkspaceShell } from "@/components/layout/teacher-workspace-shell";
import { repository } from "@/lib/db/repository";
import { Exam, LearningMaterial, School } from "@/lib/db/types";

export default function TeacherPrintHubPage() {
  const [activeSchool, setActiveSchool] = useState<School | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);

  useEffect(() => {
    const school = repository.getActiveSchool();
    setActiveSchool(school);
    setExams(repository.getExams(school.id));
    setMaterials(repository.getMaterials(school.id));
  }, []);

  return (
    <TeacherWorkspaceShell activeGroupId="print">
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div className="bg-white rounded-[28px] sm:rounded-[36px] border border-[#E9E5E8] p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#51465B] text-[#FFD36D] flex items-center justify-center shadow-xs">
                <Printer className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-[#23212A] tracking-tight">
                  Pusat Cetak Dokumen A4 Terkontekstualisasi
                </h1>
                <p className="text-xs text-[#756F7A]">
                  Ekspor dan cetak lembar kerja siswa, butir soal asesmen, kunci jawaban terpisah, serta naskah materi ajar siap cetak.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1.5 rounded-full bg-[#FAF7F3] border border-[#E9E5E8] text-xs font-bold text-[#51465B] flex items-center gap-1.5 shadow-2xs">
                <MapPin className="w-3.5 h-3.5 text-[#F47D83]" />
                <span>Format Standar Sekolah: {activeSchool?.region_name}</span>
              </span>
            </div>
          </div>
        </div>

        {/* 2 Primary Print Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Section 1: Lembar Soal & Asesmen Ujian */}
          <div className="bg-white rounded-[28px] sm:rounded-[36px] border border-[#E9E5E8] p-6 sm:p-8 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FFD36D] text-[#23212A] flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-[#23212A]">
                    Lembar Soal & Asesmen Ujian
                  </h2>
                  <span className="text-[11px] text-[#756F7A]">
                    Format A4 resmi dengan pemisahan kunci jawaban & rubrik penilaian
                  </span>
                </div>
              </div>

              <div className="space-y-3 mt-4">
                {exams.slice(0, 3).map((exam) => (
                  <div
                    key={exam.id}
                    className="p-3.5 rounded-[18px] bg-[#FAF7F3] border border-[#E9E5E8] flex items-center justify-between gap-3"
                  >
                    <div>
                      <span className="font-extrabold text-xs text-[#23212A] block line-clamp-1">
                        {exam.title}
                      </span>
                      <span className="text-[11px] text-[#756F7A]">
                        {exam.subject} &bull; {exam.class_name} &bull; {exam.duration_minutes} Menit
                      </span>
                    </div>

                    <Link
                      href={`/teacher/print/exam/${exam.id}`}
                      className="px-3.5 py-1.5 rounded-xl bg-[#51465B] hover:bg-[#3E3547] text-white text-xs font-bold shrink-0 shadow-2xs flex items-center gap-1 transition-transform active:scale-95"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#FFD36D]" />
                      <span>Cetak A4</span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E9E5E8]">
              <Link
                href="/teacher/examinations"
                className="text-xs font-bold text-[#51465B] hover:underline flex items-center gap-1"
              >
                <span>Lihat semua paket ujian di Manajemen Ujian</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Section 2: Modul Bahan Ajar Kontekstual */}
          <div className="bg-white rounded-[28px] sm:rounded-[36px] border border-[#E9E5E8] p-6 sm:p-8 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-[#51465B] text-[#FFD36D] flex items-center justify-center font-bold">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-[#23212A]">
                    Modul Bahan Ajar Kontekstual
                  </h2>
                  <span className="text-[11px] text-[#756F7A]">
                    Format bacaan terstruktur dengan narasi kearifan lokal & gambar pendukung
                  </span>
                </div>
              </div>

              <div className="space-y-3 mt-4">
                {materials.slice(0, 3).map((mat) => (
                  <div
                    key={mat.id}
                    className="p-3.5 rounded-[18px] bg-[#FAF7F3] border border-[#E9E5E8] flex items-center justify-between gap-3"
                  >
                    <div>
                      <span className="font-extrabold text-xs text-[#23212A] block line-clamp-1">
                        {mat.title}
                      </span>
                      <span className="text-[11px] text-[#756F7A]">
                        {mat.subject} &bull; Kelas {mat.grade} SD
                      </span>
                    </div>

                    <Link
                      href={`/teacher/print/material/${mat.id}`}
                      className="px-3.5 py-1.5 rounded-xl bg-[#51465B] hover:bg-[#3E3547] text-white text-xs font-bold shrink-0 shadow-2xs flex items-center gap-1 transition-transform active:scale-95"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#FFD36D]" />
                      <span>Cetak A4</span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E9E5E8]">
              <Link
                href="/teacher/materials"
                className="text-xs font-bold text-[#51465B] hover:underline flex items-center gap-1"
              >
                <span>Lihat semua daftar modul di Manajemen Materi</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </TeacherWorkspaceShell>
  );
}
