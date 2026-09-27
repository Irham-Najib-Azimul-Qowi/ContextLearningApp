"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  PenTool,
  Camera,
  FileText,
  ArrowRight,
  MapPin,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import { TeacherWorkspaceShell } from "@/components/layout/teacher-workspace-shell";
import { repository } from "@/lib/db/repository";
import { School } from "@/lib/db/types";

export default function NewQuestionHubPage() {
  const [activeSchool, setActiveSchool] = useState<School | null>(null);

  useEffect(() => {
    setActiveSchool(repository.getActiveSchool());
  }, []);

  return (
    <TeacherWorkspaceShell activeGroupId="questions">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#51465B]/10 text-[#51465B] text-xs font-bold mb-3">
          <MapPin className="w-3.5 h-3.5 text-[#F47D83]" />
          <span>Konteks Wilayah Aktif: {activeSchool?.region_name || "Kota Semarang"}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#23212A] tracking-tight">
          Buat Soal Kontekstual Baru
        </h1>
        <p className="text-sm text-[#756F7A] mt-1 max-w-2xl leading-relaxed">
          Pilih salah satu dari 4 metode input untuk merancang butir soal yang disesuaikan dengan lingkungan siswa Kelas 5 SD di {activeSchool?.region_name || "wilayah Anda"}.
        </p>
      </div>

      {/* 4 Input Methods Cards (Card Horizontal Disusun Vertikal, Generate AI Paling Atas) */}
      <div className="flex flex-col gap-4 mb-10 max-w-4xl">
        {/* Method 1: Generate dengan AI (Paling Atas) */}
        <Link
          href="/teacher/questions/generator"
          className="group p-5 sm:p-6 rounded-[28px] bg-gradient-to-r from-white via-white to-[#FFD36D]/15 border-2 border-[#FFD36D] hover:border-[#51465B] shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-start sm:items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-[#51465B] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
              <Sparkles className="w-6 h-6 text-[#FFD36D]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#F47D83]">
                  Metode 1
                </span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#FFD36D]/30 text-[#51465B]">
                  Rekomendasi AI
                </span>
              </div>
              <h2 className="text-lg font-black text-[#23212A] group-hover:text-[#51465B] transition-colors">
                Generate dengan AI
              </h2>
              <p className="text-xs text-[#756F7A] leading-relaxed mt-1 max-w-2xl">
                Tentukan topik, tujuan pembelajaran, dan jumlah soal. AI Gemini akan menyusun butir soal kontekstual ramah anak SD secara otomatis.
              </p>
            </div>
          </div>

          <div className="sm:pl-4 flex items-center justify-between sm:justify-end sm:border-l border-[#E9E5E8] shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#E9E5E8]">
            <span className="text-xs font-bold text-[#51465B] group-hover:text-[#F47D83] flex items-center gap-2">
              <span>Generate Otomatis</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </Link>

        {/* Method 2: Ketik Manual */}
        <Link
          href="/teacher/questions?method=manual"
          className="group p-5 sm:p-6 rounded-[28px] bg-white border-2 border-[#E9E5E8] hover:border-[#51465B] shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-start sm:items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-[#51465B] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
              <PenTool className="w-6 h-6 text-[#F47D83]" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-black uppercase tracking-wider text-[#51465B] mb-1">
                Metode 2
              </div>
              <h2 className="text-lg font-black text-[#23212A] group-hover:text-[#51465B] transition-colors">
                Ketik Manual
              </h2>
              <p className="text-xs text-[#756F7A] leading-relaxed mt-1 max-w-2xl">
                Tulis soal pilihan ganda atau esai secara langsung, tentukan kunci jawaban, lalu kontekstualisasikan dengan data daerah.
              </p>
            </div>
          </div>

          <div className="sm:pl-4 flex items-center justify-between sm:justify-end sm:border-l border-[#E9E5E8] shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#E9E5E8]">
            <span className="text-xs font-bold text-[#51465B] group-hover:text-[#F47D83] flex items-center gap-2">
              <span>Ketik Soal Sendiri</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </Link>

        {/* Method 3: Ambil Foto */}
        <Link
          href="/teacher/questions/scan?mode=photo"
          className="group p-5 sm:p-6 rounded-[28px] bg-white border-2 border-[#E9E5E8] hover:border-[#51465B] shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-start sm:items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-[#51465B] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
              <Camera className="w-6 h-6 text-[#FFD36D]" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-black uppercase tracking-wider text-[#51465B] mb-1">
                Metode 3
              </div>
              <h2 className="text-lg font-black text-[#23212A] group-hover:text-[#51465B] transition-colors">
                Ambil Foto
              </h2>
              <p className="text-xs text-[#756F7A] leading-relaxed mt-1 max-w-2xl">
                Foto lembar kerja siswa (LKS) fisik menggunakan kamera ponsel atau unggah foto untuk diekstraksi teksnya secara otomatis.
              </p>
            </div>
          </div>

          <div className="sm:pl-4 flex items-center justify-between sm:justify-end sm:border-l border-[#E9E5E8] shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#E9E5E8]">
            <span className="text-xs font-bold text-[#51465B] group-hover:text-[#F47D83] flex items-center gap-2">
              <span>Ambil / Upload Foto</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </Link>

        {/* Method 4: Upload PDF */}
        <Link
          href="/teacher/questions/scan?mode=pdf"
          className="group p-5 sm:p-6 rounded-[28px] bg-white border-2 border-[#E9E5E8] hover:border-[#51465B] shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-start sm:items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-[#51465B] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
              <FileText className="w-6 h-6 text-[#FFD36D]" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-black uppercase tracking-wider text-[#F47D83] mb-1">
                Metode 4
              </div>
              <h2 className="text-lg font-black text-[#23212A] group-hover:text-[#51465B] transition-colors">
                Upload PDF
              </h2>
              <p className="text-xs text-[#756F7A] leading-relaxed mt-1 max-w-2xl">
                Unggah dokumen naskah soal PDF untuk diekstraksi nomor butir, pertanyaan, pilihan jawaban, dan kunci jawaban.
              </p>
            </div>
          </div>

          <div className="sm:pl-4 flex items-center justify-between sm:justify-end sm:border-l border-[#E9E5E8] shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#E9E5E8]">
            <span className="text-xs font-bold text-[#51465B] group-hover:text-[#F47D83] flex items-center gap-2">
              <span>Unggah PDF</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </Link>
      </div>

      {/* Info Callout */}
      <div className="p-6 rounded-[24px] bg-[#FAF7F3] border border-[#E9E5E8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white border border-[#E9E5E8] flex items-center justify-center text-[#51465B] shrink-0 font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="text-xs font-extrabold text-[#23212A]">
              Prinsip Invarian Matematika & Fakta Terverifikasi
            </div>
            <div className="text-[11px] text-[#756F7A]">
              Seluruh metode input melalui validasi kesetaraan matematis dan peninjauan langsung oleh guru sebelum disimpan.
            </div>
          </div>
        </div>
        <Link
          href="/teacher/questions"
          className="text-xs font-bold px-4 py-2 rounded-xl bg-white border border-[#E9E5E8] text-[#51465B] hover:border-[#51465B] transition-colors shrink-0 text-center"
        >
          Buka Bank Soal
        </Link>
      </div>
    </TeacherWorkspaceShell>
  );
}
