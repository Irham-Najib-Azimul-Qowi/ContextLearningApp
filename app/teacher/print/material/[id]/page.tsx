"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { Printer, ArrowLeft, Image as ImageIcon, BookOpen, MapPin, Sparkles } from "lucide-react";
import { repository } from "@/lib/db/repository";
import { LearningMaterial, School } from "@/lib/db/types";

interface PrintMaterialPageProps {
  params: Promise<{ id: string }>;
}

export default function PrintMaterialPage({ params }: PrintMaterialPageProps) {
  const resolvedParams = use(params);
  const materialId = resolvedParams.id;

  const [material, setMaterial] = useState<LearningMaterial | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [includeImages, setIncludeImages] = useState<boolean>(true);

  useEffect(() => {
    const activeSchool = repository.getActiveSchool();
    setSchool(activeSchool);

    const materials = repository.getMaterials(activeSchool.id);
    const found = materials.find((m) => m.id === materialId) || materials[0];
    if (found) {
      setMaterial(found);
    }
  }, [materialId]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (!material) {
    return (
      <div className="min-h-screen bg-[#FAF7F3] p-8 text-center text-[#23212A]">
        <p className="text-sm font-bold mb-4">Materi pembelajaran tidak ditemukan.</p>
        <Link
          href="/teacher/materials"
          className="px-4 py-2 bg-[#51465B] text-white rounded-xl text-xs font-bold"
        >
          Kembali ke Daftar Materi
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 print:bg-white print:p-0">
      {/* 1. NON-PRINTABLE TOP CONTROLS TOOLBAR */}
      <header className="no-print sticky top-0 z-40 bg-white border-b border-[#E9E5E8] shadow-sm px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/teacher/materials"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Kembali"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-sm font-black text-[#23212A]">Cetak Modul Materi Ajar A4</h1>
              <p className="text-xs text-slate-500">{material.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer bg-slate-100 px-3 py-2 rounded-xl border border-slate-200">
              <input
                type="checkbox"
                checked={includeImages}
                onChange={(e) => setIncludeImages(e.target.checked)}
                className="rounded accent-[#51465B]"
              />
              <ImageIcon className="w-3.5 h-3.5 text-[#F47D83]" />
              <span>Gambar</span>
            </label>

            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2 rounded-xl bg-[#51465B] hover:bg-[#3E3547] text-white text-xs font-extrabold flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Printer className="w-4 h-4 text-[#FFD36D]" />
              <span>Cetak Modul A4</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. PRINTABLE A4 CONTAINER */}
      <main className="max-w-[210mm] mx-auto my-6 print:my-0 bg-white shadow-xl print:shadow-none print:w-full p-[15mm] sm:p-[20mm] rounded-2xl print:rounded-none border border-slate-200 print:border-none">
        {/* KOP MODUL AJAR */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Modul Pembelajaran Kontekstual &bull; {school?.region_name || "Karesidenan Madiun"}
              </div>
              <h2 className="text-lg font-black uppercase text-slate-950">
                {school?.name || "SD Negeri 1 Pembelajaran"}
              </h2>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold px-3 py-1 bg-slate-100 border border-slate-300 rounded">
                KELAS 5 SD
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-300">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-1">
              {material.title}
            </h1>
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
              <span>Mata Pelajaran: <strong>{material.subject}</strong></span>
              <span>&bull;</span>
              <span>Fase C Kurikulum Merdeka</span>
              <span>&bull;</span>
              <span>Wilayah: <strong>{school?.region_name}</strong></span>
            </div>
          </div>
        </div>

        {/* TUJUAN PEMBELAJARAN */}
        <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-300 print:bg-transparent">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-1">
            Tujuan Pembelajaran:
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed">
            Siswa mampu memahami konsep inti {material.subject} dan mengaitkannya dengan fenomena geografis, kegiatan ekonomi, serta kearifan lokal di wilayah {school?.region_name || "setempat"}.
          </p>
        </div>

        {/* VISUAL IMAGE (IF PRESENT) */}
        {includeImages && (material.image_url || material.media_asset?.image_url) && (
          <div className="mb-6 rounded-2xl overflow-hidden border border-slate-300 p-2 bg-slate-50 print:bg-transparent break-inside-avoid">
            <img
              src={material.image_url || material.media_asset?.image_url}
              alt={material.image_alt || material.media_asset?.alt_text || "Gambar pendukung materi"}
              className="w-full h-56 object-cover rounded-xl"
            />
            {(material.image_caption || material.media_asset?.caption) && (
              <div className="text-xs text-slate-700 mt-2 font-semibold">
                {material.image_caption || material.media_asset?.caption}
              </div>
            )}
            {(material.image_attribution || material.media_asset?.attribution_text) && (
              <div className="text-[10px] text-slate-500 mt-0.5 italic">
                {material.image_attribution || material.media_asset?.attribution_text}
              </div>
            )}
          </div>
        )}

        {/* ISI MATERI AJAR */}
        <article className="prose prose-slate max-w-none text-sm leading-relaxed mb-8">
          <div className="whitespace-pre-line text-slate-800">
            {material.content}
          </div>
        </article>

        {/* LATIHAN & REFLEKSI MANDIRI */}
        <div className="p-4 rounded-xl border border-slate-300 bg-slate-50 print:bg-transparent break-inside-avoid mb-6">
          <h4 className="text-xs font-extrabold uppercase text-slate-900 mb-2">
            Latihan Pemahaman Lingkungan Sekitar:
          </h4>
          <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-700">
            <li>Sebutkan 2 contoh nyata di daerahmu yang berkaitan erat dengan materi di atas!</li>
            <li>Bagaimana kegiatan tersebut memberikan manfaat ekonomi atau budaya bagi masyarakat sekitar?</li>
            <li>Diskusikan bersama teman sebangkumu mengenai upaya menjaga kearifan lingkungan tersebut!</li>
          </ol>
        </div>

        {/* FOOTER ATRIBUSI HUKUM */}
        <footer className="mt-8 pt-4 border-t border-slate-300 flex items-center justify-between text-[10px] text-slate-500">
          <span>Depaskan — Platform Pembelajaran Kontekstual Berbasis AI</span>
          <span>Dokumen Modul Resmi A4</span>
        </footer>
      </main>

      {/* PRINT-SPECIFIC CSS RULES */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background-color: white !important;
            color: black !important;
            font-size: 12pt;
          }
          .break-inside-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
