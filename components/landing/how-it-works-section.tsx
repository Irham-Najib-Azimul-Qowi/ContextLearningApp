"use client";

import React from "react";
import { FileUp, MapPin, Sparkles, Printer } from "lucide-react";

/**
 * HowItWorksSection
 * 4 concise structured step cards: Centered icon with direct title text, no extra description.
 */
export function HowItWorksSection() {
  const steps = [
    {
      title: "Unggah Bahan",
      line1: "Unggah",
      line2: "Bahan",
      icon: FileUp,
      color: "bg-[#51465B] text-[#FFD36D]",
    },
    {
      title: "Pilih Daerah",
      line1: "Pilih",
      line2: "Daerah",
      icon: MapPin,
      color: "bg-[#F47D83] text-white",
    },
    {
      title: "Selaraskan AI",
      line1: "Selaraskan",
      line2: "AI",
      icon: Sparkles,
      color: "bg-[#FFD36D] text-[#51465B]",
    },
    {
      title: "Cetak & Uji",
      line1: "Cetak",
      line2: "& Uji",
      icon: Printer,
      color: "bg-[#51465B] text-white",
    },
  ];

  return (
    <section className="w-full max-w-5xl mx-auto py-8 sm:py-16 border-t border-[#E9E5E8]/80">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-12">
        <h2 className="text-2xl sm:text-4xl font-black text-[#23212A] tracking-tight">
          Langkah Terstruktur
        </h2>
        <p className="text-xs sm:text-sm text-[#756F7A] mt-2 font-medium">
          Cara cepat mengubah bahan ajar standar menjadi pengalaman belajar nyata.
        </p>
      </div>

      {/* 4 Cards Grid - Berjejer Horizontal di Mobile (grid-cols-4), Rapi & Proporsional */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-4 lg:gap-5">
        {steps.map((st) => {
          const Icon = st.icon;
          return (
            <div
              key={st.title}
              className="group bg-white rounded-2xl sm:rounded-3xl p-2 py-3 sm:p-5 lg:p-7 border-2 border-[#E9E5E8] hover:border-[#51465B] shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center text-center h-full"
            >
              {/* Centered Icon */}
              <div
                className={`w-9 h-9 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl sm:rounded-2xl ${st.color} flex items-center justify-center font-black shadow-xs group-hover:scale-110 group-hover:-translate-y-0.5 transition-all mb-2 sm:mb-4 shrink-0`}
              >
                <Icon className="w-4 h-4 sm:w-6 sm:h-6 lg:w-7 lg:h-7 stroke-[2.2]" />
              </div>

              {/* Direct Title Text (Rapi 2 Baris di Mobile, Single Line di Desktop) */}
              <h3 className="font-black text-[10px] xs:text-[11px] sm:text-base lg:text-lg text-[#23212A] leading-tight sm:leading-snug">
                <span className="block sm:inline">{st.line1}</span>{" "}
                <span className="block sm:inline">{st.line2}</span>
              </h3>
            </div>
          );
        })}
      </div>
    </section>
  );
}
