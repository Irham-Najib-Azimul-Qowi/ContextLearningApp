"use client";

import React from "react";
import Link from "next/link";
import { Printer, MonitorSmartphone, ArrowRight, CheckCircle2, FileCheck, Laptop } from "lucide-react";

/**
 * OutputModesSection
 * Highlights the two delivery formats of PAHAMI V2:
 * 1. Cetak (Printable A4 classroom exam & material sheets)
 * 2. Daring (Interactive online student portal & examination sessions)
 */
export function OutputModesSection({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  return (
    <section className="w-full max-w-5xl mx-auto py-12 sm:py-16 border-t border-[#E9E5E8]/80">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#51465B]/10 text-[#51465B] text-xs font-bold mb-3">
          <span>Fleksibilitas Pelaksanaan</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-[#23212A] tracking-tight">
          Belajar secara daring maupun cetak.
        </h2>
        <p className="text-xs sm:text-sm text-[#756F7A] mt-2 font-medium">
          Disesuaikan dengan fasilitas sekolah Anda—baik menggunakan gawai interaktif maupun lembar kerja fisik A4 siap cetak.
        </p>
      </div>

      {/* Two Delivery Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: CETAK */}
        <div className="bg-white rounded-3xl p-7 sm:p-8 border border-[#E9E5E8] shadow-xs hover:shadow-md hover:border-[#51465B]/30 transition-all flex flex-col justify-between">
          <div>
            <div className="w-13 h-13 rounded-2xl bg-[#51465B] text-[#FFD36D] flex items-center justify-center mb-6 shadow-xs">
              <Printer className="w-6 h-6 stroke-[2.2]" />
            </div>

            <div className="inline-block text-[11px] font-extrabold uppercase tracking-wider text-[#F47D83] mb-1">
              Opsi Fleksibel 1
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[#23212A] mb-3">
              Format Cetak Lembar A4
            </h3>
            <p className="text-xs sm:text-sm text-[#756F7A] leading-relaxed mb-6">
              Siapkan soal dan materi yang dapat dicetak untuk digunakan langsung di kelas. Sangat ideal untuk sekolah dengan keterbatasan gawai atau jaringan internet di ruang kelas.
            </p>

            <ul className="space-y-2 text-xs text-neutral-700 font-semibold mb-6">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Format layout A4 terstandarisasi rapi</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Lembar kunci jawaban & rubrik penilaian terpisah untuk guru</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Disertai gambar ilustrasi hitam-putih ramah printer fotokopi</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-[#E9E5E8]">
            <Link
              href={isLoggedIn ? "/teacher/print" : "/login?intent=print"}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#51465B] hover:text-[#F47D83] transition-colors"
            >
              <span>Lihat Contoh Lembar Cetak</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 2: DARING (ONLINE) */}
        <div className="bg-white rounded-3xl p-7 sm:p-8 border border-[#E9E5E8] shadow-xs hover:shadow-md hover:border-[#51465B]/30 transition-all flex flex-col justify-between">
          <div>
            <div className="w-13 h-13 rounded-2xl bg-[#FFD36D] text-[#51465B] flex items-center justify-center mb-6 shadow-xs">
              <MonitorSmartphone className="w-6 h-6 stroke-[2.2]" />
            </div>

            <div className="inline-block text-[11px] font-extrabold uppercase tracking-wider text-[#51465B] mb-1">
              Opsi Fleksibel 2
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[#23212A] mb-3">
              Pelaksanaan Daring Interaktif
            </h3>
            <p className="text-xs sm:text-sm text-[#756F7A] leading-relaxed mb-6">
              Bagikan materi dan ujian melalui tautan atau kode kelas. Siswa mengerjakan langsung dari gawai dengan antarmuka ramah anak SD, auto-grading instan, dan transparansi rapor.
            </p>

            <ul className="space-y-2 text-xs text-neutral-700 font-semibold mb-6">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Portal siswa khusus kelas 5 SD dengan timer otomatis</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Koreksi otomatis pilihan ganda & formulir penilaian esai guru</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Statistik daya serap kelas & analisis kompetensi per butir soal</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-[#E9E5E8]">
            <Link
              href="/student/exam-access"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#51465B] hover:text-[#F47D83] transition-colors"
            >
              <span>Akses Ujian Murid via Kode</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
