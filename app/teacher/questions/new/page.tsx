"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  PenTool,
  Camera,
  ArrowRight,
  School as SchoolIcon,
  MapPin,
  CheckCircle2,
  FileQuestion,
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#51465B]/10 text-[#51465B] text-xs font-bold mb-3">
          <MapPin className="w-3.5 h-3.5 text-[#F47D83]" />
          <span>Konteks Wilayah Aktif: {activeSchool?.region_name || "Kota Semarang"}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#23212A] tracking-tight">
          Buat Soal Kontekstual Baru
        </h1>
        <p className="text-sm text-[#756F7A] mt-1 max-w-2xl">
          Pilih metode pembuatan butir soal untuk disesuaikan dengan lingkungan siswa Kelas 5 SD di {activeSchool?.region_name || "wilayah Anda"}.
        </p>
      </div>

      {/* 3 Creation Methods Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Method 1: Generate AI */}
        <Link
          href="/teacher/questions/generator"
          className="group p-6 rounded-3xl bg-white border-2 border-[#E9E5E8] hover:border-[#51465B] shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#51465B] text-white flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-xs">
              <Sparkles className="w-6 h-6 text-[#FFD36D]" />
            </div>
            <div className="text-[10px] font-black uppercase tracking-wider text-[#F47D83] mb-1">
              Otomatisasi Cerdas
            </div>
            <h2 className="text-lg font-black text-[#23212A] mb-2 group-hover:text-[#51465B] transition-colors">
              Generate dengan AI Gemini
            </h2>
            <p className="text-xs text-[#756F7A] leading-relaxed mb-6">
              AI secara otomatis merancang butir soal matematika, Bahasa Indonesia, atau IPAS yang terintegrasi dengan data faktual daerah setempat.
            </p>
          </div>

          <div className="pt-3 border-t border-[#E9E5E8] flex items-center justify-between text-xs font-bold text-[#51465B] group-hover:text-[#F47D83]">
            <span>Mulai Generate AI</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* Method 2: Input Manual */}
        <Link
          href="/teacher/questions/manual"
          className="group p-6 rounded-3xl bg-white border-2 border-[#E9E5E8] hover:border-[#51465B] shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#51465B] text-white flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-xs">
              <PenTool className="w-6 h-6 text-[#F47D83]" />
            </div>
            <div className="text-[10px] font-black uppercase tracking-wider text-[#51465B] mb-1">
              Kontrol Penuh Guru
            </div>
            <h2 className="text-lg font-black text-[#23212A] mb-2 group-hover:text-[#51465B] transition-colors">
              Tulis Soal Manual
            </h2>
            <p className="text-xs text-[#756F7A] leading-relaxed mb-6">
              Tulis butir soal standar kurikulum nasional Anda sendiri, lalu biarkan Contextual AI Engine mengontekstualisasikan variabel lokalnya.
            </p>
          </div>

          <div className="pt-3 border-t border-[#E9E5E8] flex items-center justify-between text-xs font-bold text-[#51465B] group-hover:text-[#F47D83]">
            <span>Tulis Soal Manual</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* Method 3: Scan / Upload */}
        <Link
          href="/teacher/questions/scan"
          className="group p-6 rounded-3xl bg-white border-2 border-[#E9E5E8] hover:border-[#51465B] shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#51465B] text-white flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-xs">
              <Camera className="w-6 h-6 text-[#FFD36D]" />
            </div>
            <div className="text-[10px] font-black uppercase tracking-wider text-[#F47D83] mb-1">
              Digitalisasi Cepat
            </div>
            <h2 className="text-lg font-black text-[#23212A] mb-2 group-hover:text-[#51465B] transition-colors">
              Scan / Foto Soal Fisik
            </h2>
            <p className="text-xs text-[#756F7A] leading-relaxed mb-6">
              Unggah foto buku paket atau lembar kerja siswa fisik (LKS) untuk diekstrak teksnya dan disesuaikan menjadi soal kontekstual lokal.
            </p>
          </div>

          <div className="pt-3 border-t border-[#E9E5E8] flex items-center justify-between text-xs font-bold text-[#51465B] group-hover:text-[#F47D83]">
            <span>Upload Foto Soal</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Local Knowledge Quick Facts */}
      <div className="p-6 rounded-3xl bg-[#FAF7F3] border border-[#E9E5E8]">
        <h3 className="text-sm font-extrabold text-[#23212A] mb-2">
          Pedoman Pedagogis Soal Kelas 5 SD:
        </h3>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#756F7A]">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Angka numerik soal matematika tetap 100% konsisten agar kunci jawaban tidak berubah.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Konteks komoditas dan lokasi berasal dari basis data resmi BPS dan Cagar Budaya.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Gambar pendukung menyertakan atribusi legal Wikimedia Commons / CC-BY-SA.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Hasil dapat langsung diekspor sebagai lembar cetak A4 siswa dan kunci jawaban guru.</span>
          </li>
        </ul>
      </div>
    </TeacherWorkspaceShell>
  );
}
