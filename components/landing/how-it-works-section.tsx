"use client";

import React from "react";
import { FileUp, MapPin, Sparkles, Printer } from "lucide-react";

/**
 * HowItWorksSection
 * 4 concise structured steps with icons and brief texts, without numbers or "Alur Terstruktur" badge.
 */
export function HowItWorksSection() {
  const steps = [
    {
      title: "Unggah Bahan",
      desc: "Unggah dokumen PDF atau ketik materi Anda.",
      icon: FileUp,
      color: "bg-[#51465B] text-[#FFD36D]",
    },
    {
      title: "Pilih Daerah",
      desc: "Tentukan kabupaten atau kota sekolah Anda.",
      icon: MapPin,
      color: "bg-[#F47D83] text-white",
    },
    {
      title: "Selaraskan AI",
      desc: "AI menyematkan data dan fakta lokal terverifikasi.",
      icon: Sparkles,
      color: "bg-[#FFD36D] text-[#51465B]",
    },
    {
      title: "Cetak & Uji",
      desc: "Cetak dokumen fisik A4 atau rilis ujian daring.",
      icon: Printer,
      color: "bg-[#51465B] text-white",
    },
  ];

  return (
    <section className="w-full max-w-5xl mx-auto py-12 sm:py-16 border-t border-[#E9E5E8]/80">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
        <h2 className="text-2xl sm:text-4xl font-black text-[#23212A] tracking-tight">
          Langkah Terstruktur
        </h2>
        <p className="text-xs sm:text-sm text-[#756F7A] mt-2 font-medium">
          Cara cepat mengubah bahan ajar standar menjadi pengalaman belajar nyata.
        </p>
      </div>

      {/* 4 Cards Grid with Icons and Short Texts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {steps.map((st) => {
          const Icon = st.icon;
          return (
            <div
              key={st.title}
              className="group bg-white rounded-3xl p-6 border-2 border-[#E9E5E8] hover:border-[#51465B] shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="mb-4">
                  <div className={`w-12 h-12 rounded-2xl ${st.color} flex items-center justify-center font-black shadow-xs group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 stroke-[2.2]" />
                  </div>
                </div>

                <h3 className="font-extrabold text-base text-[#23212A] mb-1.5 leading-snug">
                  {st.title}
                </h3>
                <p className="text-xs text-[#756F7A] leading-relaxed font-medium">
                  {st.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
