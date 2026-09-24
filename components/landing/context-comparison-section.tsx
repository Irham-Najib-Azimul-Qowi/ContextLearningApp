"use client";

import React, { useState } from "react";
import {
  MapPin,
  CheckCircle2,
  Train,
  ArrowRight,
  ShieldCheck,
  Building,
  TreePine,
  Sparkles,
  Layers,
} from "lucide-react";

/**
 * ContextComparisonSection
 * Concrete Sebelum vs Sesudah showcase displaying real-world verified contextualization
 * from Karesidenan Madiun (PT INKA) & Kota Semarang (Kota Lama / Pelabuhan Tanjung Emas).
 */
export function ContextComparisonSection() {
  const [activeTab, setActiveTab] = useState<"madiun" | "ponorogo">("madiun");

  const examples = {
    madiun: {
      tag: "Kota Madiun &bull; Wilayah 35.77",
      subject: "Matematika &bull; Operasi Perkalian Bilangan Bulat (Fase C)",
      entity: "PT Industri Kereta Api (INKA) Madiun",
      dimension: "Transportasi & Industri Manufaktur",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Gereja_Blenduk%2C_Semarang%2C_2014-07-07_01.jpg/1280px-Gereja_Blenduk%2C_Semarang%2C_2014-07-07_01.jpg",
      before: {
        title: "Soal Standar Buku Teks (Abstrak)",
        text: "Sebuah pabrik memproduksi 1.200 unit barang setiap bulan. Jika pabrik tersebut beroperasi aktif selama 5 bulan berturut-turut, berapa total unit barang yang berhasil diproduksi?",
        critique: "Konteks abstrak, siswa tidak memiliki gambaran nyata tentang apa barang yang dibuat dan di mana pabrik berada.",
      },
      after: {
        title: "Soal Terkontekstualisasi PAHAMI (Nyata)",
        text: "PT Industri Kereta Api (INKA) di Kota Madiun memproduksi 1.200 komponen bogie gerbong kereta api setiap bulan untuk jalur kereta api Pulau Jawa. Jika pabrik beroperasi aktif selama 5 bulan berturut-turut, berapa total komponen bogie kereta api yang dihasilkan?",
        highlights: [
          "PT Industri Kereta Api (INKA) di Kota Madiun",
          "komponen bogie gerbong kereta api",
          "jalur kereta api Pulau Jawa",
        ],
        benefit: "Siswa mengenal industri manufaktur kebanggaan kotanya sekaligus melatih kompetensi perkalian matematika.",
      },
    },
    ponorogo: {
      tag: "Kabupaten Ponorogo &bull; Wilayah 35.02",
      subject: "IPAS &bull; Ekosistem & Kegiatan Ekonomi Daerah",
      entity: "Peternakan Sapi Perah Pudak & Lereng Wilis",
      dimension: "Agrikultur & Ekosistem Dataran Tinggi",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Dairy_cattle_milking.jpg/1280px-Dairy_cattle_milking.jpg",
      before: {
        title: "Materi Standar (Generik)",
        text: "Di daerah pegunungan yang berhawa dingin, masyarakat banyak memanfaatkan lahan untuk peternakan sapi perah guna menghasilkan susu segar bagi konsumsi penduduk perkotaan.",
        critique: "Penjelasan umum tanpa rujukan geografi lokal yang nyata bagi anak Ponorogo.",
      },
      after: {
        title: "Materi Terkontekstualisasi PAHAMI (Nyata)",
        text: "Di lereng Gunung Wilis, tepatnya Kecamatan Pudak Kabupaten Ponorogo, udara sejuk pegunungan dimanfaatkan warga menjadi sentra peternakan sapi perah penghasil ribuan liter susu segar setiap hari untuk koperasi desa dan pabrik pengolahan susu.",
        highlights: [
          "lereng Gunung Wilis",
          "Kecamatan Pudak Kabupaten Ponorogo",
          "sentra peternakan sapi perah",
          "koperasi desa",
        ],
        benefit: "Siswa memahami interaksi antara ketinggian tempat, suhu dingin, dan mata pencaharian peternak di daerahnya sendiri.",
      },
    },
  };

  const current = examples[activeTab];

  return (
    <section className="w-full max-w-5xl mx-auto py-12 sm:py-16 border-t border-[#E9E5E8]/80">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFD36D]/30 text-[#51465B] text-xs font-bold mb-3 border border-[#FFD36D]/60">
          <Sparkles className="w-3.5 h-3.5 text-[#51465B]" />
          <span>Contoh Nyata Pembelajaran Kontekstual</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-[#23212A] tracking-tight">
          Belajar dari lingkungan sekitar.
        </h2>
        <p className="text-xs sm:text-sm text-[#756F7A] mt-2 font-medium">
          Materi dan soal disematkan dengan konteks tempat, transportasi, kegiatan ekonomi, budaya, dan lingkungan alam yang dialami siswa setiap hari.
        </p>
      </div>

      {/* Region Example Switcher */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <button
          type="button"
          onClick={() => setActiveTab("madiun")}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition-all ${
            activeTab === "madiun"
              ? "bg-[#51465B] text-white shadow-sm"
              : "bg-white text-[#756F7A] hover:bg-[#FAF7F3] border border-[#E9E5E8]"
          }`}
        >
          Contoh Soal: PT INKA Madiun
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("ponorogo")}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition-all ${
            activeTab === "ponorogo"
              ? "bg-[#51465B] text-white shadow-sm"
              : "bg-white text-[#756F7A] hover:bg-[#FAF7F3] border border-[#E9E5E8]"
          }`}
        >
          Contoh Materi: Sapi Perah Pudak Ponorogo
        </button>
      </div>

      {/* Comparison Grid: Sebelum vs Sesudah */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Card 1: Sebelum (Standar Abstrak) */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E9E5E8] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full bg-neutral-100 text-neutral-600 font-extrabold text-[10px] uppercase tracking-wider">
                Sebelum
              </span>
              <span className="text-[11px] text-[#756F7A] font-semibold">{current.subject}</span>
            </div>

            <h3 className="font-extrabold text-base text-[#23212A] mb-3">
              {current.before.title}
            </h3>

            <div className="p-4 rounded-2xl bg-[#FAF7F3] border border-[#E9E5E8] text-xs sm:text-sm text-neutral-700 leading-relaxed font-normal italic mb-4">
              &ldquo;{current.before.text}&rdquo;
            </div>
          </div>

          <div className="pt-4 border-t border-[#E9E5E8] text-[11px] text-neutral-500 font-medium flex items-start gap-2">
            <span className="font-bold text-rose-500 shrink-0">&times; Masalah:</span>
            <span>{current.before.critique}</span>
          </div>
        </div>

        {/* Card 2: Sesudah (Kontekstual Nyata PAHAMI) */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-[#51465B] shadow-md flex flex-col justify-between relative overflow-hidden">
          {/* Top subtle accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#FFD36D]" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#51465B] text-[#FFD36D] font-extrabold text-[10px] uppercase tracking-wider">
                <CheckCircle2 className="w-3 h-3 text-[#FFD36D]" />
                <span>Sesudah &bull; PAHAMI</span>
              </div>
              <span className="text-[11px] text-[#51465B] font-bold font-mono">
                {current.entity}
              </span>
            </div>

            <h3 className="font-black text-base text-[#51465B] mb-3">
              {current.after.title}
            </h3>

            <div className="p-4 rounded-2xl bg-[#FAF7F3] border border-[#FFD36D]/60 text-xs sm:text-sm text-[#23212A] leading-relaxed font-medium mb-4">
              &ldquo;{current.after.text}&rdquo;
            </div>

            {/* Highlights Breakdown */}
            <div className="space-y-1.5 mb-4">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#756F7A] block">
                Penyematan Fakta Lokal Nyata:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {current.after.highlights.map((h, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 rounded-lg bg-[#FFD36D]/30 border border-[#FFD36D] text-[11px] font-bold text-[#51465B]"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E9E5E8] text-[11px] text-[#51465B] font-semibold flex items-start gap-2 bg-[#51465B]/5 p-3 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{current.after.benefit}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
