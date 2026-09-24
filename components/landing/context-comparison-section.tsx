"use client";

import React from "react";
import { Sparkles, CheckCircle2, AlertCircle } from "lucide-react";

/**
 * ContextComparisonSection
 * High-contrast comparison between standard abstract question and contextualized question.
 */
export function ContextComparisonSection() {
  return (
    <section className="w-full max-w-5xl mx-auto py-12 sm:py-16 border-t border-[#E9E5E8]/80">
      {/* Section Header (Teks "Contoh Nyata" telah dihapus) */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-2xl sm:text-4xl font-black text-[#23212A] tracking-tight">
          Perbandingan Pembelajaran
        </h2>
        <p className="text-xs sm:text-sm text-[#756F7A] mt-2 font-medium">
          Bandingkan soal kurikulum standar dengan soal yang telah diperkaya konteks lokal.
        </p>
      </div>

      {/* Two Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Card 1: Sebelum (Standar) — Diperbaiki agar memiliki kontras tinggi & tegas */}
        <div className="p-7 sm:p-8 rounded-[32px] bg-white border-2 border-[#51465B] shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-900 border border-rose-300 text-xs font-black uppercase tracking-wider">
                <AlertCircle className="w-3.5 h-3.5 text-rose-700" />
                <span>Sebelum &bull; Standar</span>
              </span>
              <span className="text-xs font-black text-[#51465B]">Matematika Fase C</span>
            </div>

            <h3 className="text-lg font-black text-[#23212A] mb-3">
              Soal Teks Abstrak
            </h3>

            <div className="p-4 rounded-2xl bg-slate-100 border border-slate-300 text-sm text-[#23212A] leading-relaxed font-semibold mb-4 shadow-2xs">
              &ldquo;Sebuah pabrik memproduksi 1.200 unit barang setiap bulan. Jika pabrik beroperasi selama 5 bulan berturut-turut, berapakah total barang yang dihasilkan?&rdquo;
            </div>
          </div>

          <div className="pt-4 border-t border-slate-300 text-xs font-bold text-slate-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
            <span>Konteks generik & abstrak, objek barang tidak dialami nyata oleh siswa.</span>
          </div>
        </div>

        {/* Card 2: Sesudah (Depaskan) */}
        <div className="p-7 sm:p-8 rounded-[32px] bg-[#51465B] text-white border-2 border-[#FFD36D] shadow-xl flex flex-col justify-between relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-[#FFD36D]/15 blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFD36D] text-[#51465B] text-xs font-black uppercase tracking-wider shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#51465B]" />
                <span>Sesudah &bull; Depaskan</span>
              </span>
              <span className="text-xs font-bold text-white/80">Kota Madiun &bull; 35.77</span>
            </div>

            <h3 className="text-lg font-black text-white mb-3">
              Soal Terkontekstualisasi
            </h3>

            <div className="p-4 rounded-2xl bg-white/10 border border-white/20 text-sm text-white/95 leading-relaxed font-medium mb-4 shadow-2xs">
              &ldquo;PT Industri Kereta Api (INKA) di Kota Madiun memproduksi 1.200 komponen bogie gerbong kereta setiap bulan. Jika beroperasi selama 5 bulan berturut-turut, berapakah total komponen yang dihasilkan?&rdquo;
            </div>
          </div>

          <div className="pt-4 border-t border-white/20 text-xs font-bold text-[#FFD36D] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#FFD36D] shrink-0" />
            <span>Mengintegrasikan industri nyata daerah tanpa mengubah rumus hitung.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
