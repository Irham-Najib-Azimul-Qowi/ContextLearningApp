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

export default function NewMaterialHubPage() {
  const [activeSchool, setActiveSchool] = useState<School | null>(null);

  useEffect(() => {
    setActiveSchool(repository.getActiveSchool());
  }, []);

  return (
    <TeacherWorkspaceShell activeGroupId="classes">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#51465B]/10 text-[#51465B] text-xs font-bold mb-3">
          <MapPin className="w-3.5 h-3.5 text-[#F47D83]" />
          <span>Konteks Wilayah Aktif: {activeSchool?.region_name || "Kota Semarang"}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#23212A] tracking-tight">
          Buat Materi Ajar Kontekstual Baru
        </h1>
        <p className="text-sm text-[#756F7A] mt-1 max-w-2xl leading-relaxed">
          Pilih salah satu dari 4 metode input untuk menyusun modul ajar yang diperkaya dengan potensi alam, ekonomi, dan budaya daerah sekitar siswa Kelas 5 SD.
        </p>
      </div>

      {/* 4 Input Methods Cards (Section 9.1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {/* Method 1: Upload PDF */}
        <Link
          href="/teacher/materials/create?tab=pdf"
          className="group p-6 rounded-[28px] bg-white border-2 border-[#E9E5E8] hover:border-[#51465B] shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#51465B] text-white flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-xs">
              <FileText className="w-6 h-6 text-[#FFD36D]" />
            </div>
            <div className="text-[10px] font-black uppercase tracking-wider text-[#F47D83] mb-1">
              Metode 1
            </div>
            <h2 className="text-lg font-black text-[#23212A] mb-2 group-hover:text-[#51465B] transition-colors">
              Upload PDF
            </h2>
            <p className="text-xs text-[#756F7A] leading-relaxed mb-6">
              Unggah modul ajar kurikulum nasional atau naskah materi berformat PDF untuk diekstraksi konsep dan disisipi contoh lokal.
            </p>
          </div>

          <div className="pt-3 border-t border-[#E9E5E8] flex items-center justify-between text-xs font-bold text-[#51465B] group-hover:text-[#F47D83]">
            <span>Unggah Dokumen PDF</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* Method 2: Ambil Foto */}
        <Link
          href="/teacher/materials/create?tab=photo"
          className="group p-6 rounded-[28px] bg-white border-2 border-[#E9E5E8] hover:border-[#51465B] shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#51465B] text-white flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-xs">
              <Camera className="w-6 h-6 text-[#FFD36D]" />
            </div>
            <div className="text-[10px] font-black uppercase tracking-wider text-[#51465B] mb-1">
              Metode 2
            </div>
            <h2 className="text-lg font-black text-[#23212A] mb-2 group-hover:text-[#51465B] transition-colors">
              Ambil Foto
            </h2>
            <p className="text-xs text-[#756F7A] leading-relaxed mb-6">
              Foto halaman buku materi cetak atau dokumen bacaan fisik menggunakan kamera ponsel untuk diekstraksi ke editor teks.
            </p>
          </div>

          <div className="pt-3 border-t border-[#E9E5E8] flex items-center justify-between text-xs font-bold text-[#51465B] group-hover:text-[#F47D83]">
            <span>Ambil / Upload Foto</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* Method 3: Ketik Manual */}
        <Link
          href="/teacher/materials/create?tab=manual"
          className="group p-6 rounded-[28px] bg-white border-2 border-[#E9E5E8] hover:border-[#51465B] shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#51465B] text-white flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-xs">
              <PenTool className="w-6 h-6 text-[#F47D83]" />
            </div>
            <div className="text-[10px] font-black uppercase tracking-wider text-[#51465B] mb-1">
              Metode 3
            </div>
            <h2 className="text-lg font-black text-[#23212A] mb-2 group-hover:text-[#51465B] transition-colors">
              Ketik Manual
            </h2>
            <p className="text-xs text-[#756F7A] leading-relaxed mb-6">
              Tulis penjelasan materi, tujuan pembelajaran, dan latihan secara bebas, lalu lakukan kontekstualisasi kearifan lokal.
            </p>
          </div>

          <div className="pt-3 border-t border-[#E9E5E8] flex items-center justify-between text-xs font-bold text-[#51465B] group-hover:text-[#F47D83]">
            <span>Tulis Mandiri</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* Method 4: Generate dengan AI */}
        <Link
          href="/teacher/materials/create?tab=ai"
          className="group p-6 rounded-[28px] bg-white border-2 border-[#E9E5E8] hover:border-[#51465B] shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#51465B] text-white flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-xs">
              <Sparkles className="w-6 h-6 text-[#FFD36D]" />
            </div>
            <div className="text-[10px] font-black uppercase tracking-wider text-[#F47D83] mb-1">
              Metode 4
            </div>
            <h2 className="text-lg font-black text-[#23212A] mb-2 group-hover:text-[#51465B] transition-colors">
              Generate dengan AI
            </h2>
            <p className="text-xs text-[#756F7A] leading-relaxed mb-6">
              Masukkan topik dan capaian pembelajaran. AI Gemini akan menyusun cerita dan bahan bacaan kontekstual ramah anak SD.
            </p>
          </div>

          <div className="pt-3 border-t border-[#E9E5E8] flex items-center justify-between text-xs font-bold text-[#51465B] group-hover:text-[#F47D83]">
            <span>Generate Otomatis</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
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
              Dukungan Publikasi Kelas & Ekspor Cetak A4
            </div>
            <div className="text-[11px] text-[#756F7A]">
              Materi yang Anda susun dapat langsung dibagikan ke portal murid daring atau dicetak menjadi lembar modul ajar fisik A4.
            </div>
          </div>
        </div>
        <Link
          href="/teacher/materials"
          className="text-xs font-bold px-4 py-2 rounded-xl bg-white border border-[#E9E5E8] text-[#51465B] hover:border-[#51465B] transition-colors shrink-0 text-center"
        >
          Koleksi Materi Saya
        </Link>
      </div>
    </TeacherWorkspaceShell>
  );
}
