"use client";

import React from "react";
import { FileUp, MapPin, Cpu, Printer } from "lucide-react";

/**
 * HowItWorksSection
 * 4-step pedagogical workflow explaining how PAHAMI V2 contextualizes learning materials and questions.
 */
export function HowItWorksSection() {
  const steps = [
    {
      num: "01",
      title: "Masukkan Soal atau Materi",
      desc: "Unggah file PDF lembar kerja, foto soal via OCR, ketik langsung, atau buat baru menggunakan panduan AI.",
      icon: FileUp,
      color: "bg-[#51465B] text-[#FFD36D]",
    },
    {
      num: "02",
      title: "Pilih Wilayah Pembelajaran",
      desc: "Tentukan kabupaten atau kota sekolah Anda (Karesidenan Madiun & Kota Semarang) sebagai jangkar kearifan lokal.",
      icon: MapPin,
      color: "bg-[#F47D83] text-white",
    },
    {
      num: "03",
      title: "AI Menyesuaikan Konteks Lokal",
      desc: "Sistem RAG memadukan kurikulum Merdeka Fase C dengan fakta geografi, ekonomi, dan budaya daerah terverifikasi.",
      icon: Cpu,
      color: "bg-[#FFD36D] text-[#51465B]",
    },
    {
      num: "04",
      title: "Tinjau, Cetak, atau Bagikan",
      desc: "Koreksi hasil di editor interaktif, ekspor dokumen A4 siap cetak untuk kelas, atau rilis ujian daring siswa.",
      icon: Printer,
      color: "bg-[#51465B] text-white",
    },
  ];

  return (
    <section className="w-full max-w-5xl mx-auto py-12 sm:py-16 border-t border-[#E9E5E8]/80">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#51465B]/10 text-[#51465B] text-xs font-bold mb-3">
          <span>Alur Kontekstualisasi AI</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-[#23212A] tracking-tight">
          Dari materi biasa menjadi pembelajaran yang dekat.
        </h2>
        <p className="text-xs sm:text-sm text-[#756F7A] mt-2 font-medium">
          Empat langkah terstruktur menjembatani materi abstrak menjadi pengalaman belajar nyata bagi siswa sekolah dasar.
        </p>
      </div>

      {/* 4 Step Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {steps.map((st) => {
          const Icon = st.icon;
          return (
            <div
              key={st.num}
              className="group bg-white rounded-3xl p-6 border border-[#E9E5E8] shadow-xs hover:shadow-md hover:border-[#51465B]/30 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                {/* Step Number & Icon */}
                <div className="flex items-center justify-between mb-5">
                  <div className={`w-11 h-11 rounded-2xl ${st.color} flex items-center justify-center font-black shadow-xs group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <span className="font-mono font-black text-sm text-[#756F7A]/60 group-hover:text-[#51465B] transition-colors">
                    {st.num}
                  </span>
                </div>

                <h3 className="font-extrabold text-sm sm:text-base text-[#23212A] mb-2 leading-snug">
                  {st.title}
                </h3>
                <p className="text-xs text-[#756F7A] leading-relaxed font-normal">
                  {st.desc}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-[#E9E5E8]/60 flex items-center gap-1.5 text-[10px] font-bold text-[#51465B]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FFD36D]" />
                <span>Terverifikasi Kurikulum</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
