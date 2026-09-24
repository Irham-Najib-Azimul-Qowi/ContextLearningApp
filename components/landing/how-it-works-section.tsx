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
      icon: FileUp,
      color: "bg-[#51465B] text-[#FFD36D]",
    },
    {
      title: "Pilih Daerah",
      icon: MapPin,
      color: "bg-[#F47D83] text-white",
    },
    {
      title: "Selaraskan AI",
      icon: Sparkles,
      color: "bg-[#FFD36D] text-[#51465B]",
    },
    {
      title: "Cetak & Uji",
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

      {/* 4 Cards Grid with Centered Icons and Direct Text (No Description) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {steps.map((st) => {
          const Icon = st.icon;
          return (
            <div
              key={st.title}
              className="group bg-white rounded-3xl p-7 border-2 border-[#E9E5E8] hover:border-[#51465B] shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center text-center"
            >
              {/* Centered Icon */}
              <div className={`w-14 h-14 rounded-2xl ${st.color} flex items-center justify-center font-black shadow-xs group-hover:scale-110 group-hover:-translate-y-0.5 transition-all mb-4`}>
                <Icon className="w-7 h-7 stroke-[2.2]" />
              </div>

              {/* Direct Title Text (No Description Underneath) */}
              <h3 className="font-black text-base sm:text-lg text-[#23212A] leading-snug">
                {st.title}
              </h3>
            </div>
          );
        })}
      </div>
    </section>
  );
}
