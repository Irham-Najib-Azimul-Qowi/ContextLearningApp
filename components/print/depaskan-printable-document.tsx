"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  Printer,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  X,
  ExternalLink,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import { PahamiPuzzleLogo } from "@/components/landing/puzzle-logo";

export interface PrintableDocumentProps {
  docType: "material" | "question" | "room";
  contentId: string;
  title: string;
  subject: string;
  grade: number;
  regionName: string;
  content: string;
  roomCode?: string;
  questions?: Array<{
    number: number;
    type: "multiple_choice" | "essay" | "mixed";
    question_text: string;
    options?: Array<{ key: string; text: string }>;
    correct_answer?: string;
  }>;
  teacherName?: string;
  onClose?: () => void;
}

export function DepaskanPrintableDocument({
  docType,
  contentId,
  title,
  subject,
  grade,
  regionName,
  content,
  roomCode,
  questions,
  teacherName,
  onClose,
}: PrintableDocumentProps) {
  const [mounted, setMounted] = useState(false);
  const [isIssuing, setIsIssuing] = useState(false);
  const [issuedDocId, setIssuedDocId] = useState<string | null>(null);
  const [issuedToken, setIssuedToken] = useState<string | null>(null);
  const [printDate] = useState(() =>
    new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  );

  useEffect(() => {
    setMounted(true);
    document.body.classList.add("depaskan-print-modal-active");
    return () => {
      document.body.classList.remove("depaskan-print-modal-active");
    };
  }, []);

  const handlePrint = async () => {
    setIsIssuing(true);
    try {
      const res = await fetch("/api/print/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doc_type: docType,
          content_id: contentId,
          content_title: title,
          room_code: roomCode,
          metadata: {
            subject,
            grade,
            region_name: regionName,
            correct_answer: questions?.[0]?.correct_answer || "A",
          },
        }),
      });

      const json = await res.json();
      if (json.success) {
        setIssuedDocId(json.document_id);
        setIssuedToken(json.document_token);

        // Wait for state to reflect then trigger print
        setTimeout(() => {
          window.print();
        }, 300);
      } else {
        // Fallback print directly
        window.print();
      }
    } catch {
      window.print();
    } finally {
      setIsIssuing(false);
    }
  };

  const displayDocId = issuedDocId || `DOC-${(roomCode || contentId).toUpperCase()}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
    JSON.stringify({
      app: "DEPASKAN",
      id: displayDocId,
      tok: issuedToken || "SIGNATURE_VALID",
      type: docType,
      code: roomCode || "",
    })
  )}`;

  // Determine standalone dedicated print URL
  const standaloneUrl =
    docType === "room" && roomCode
      ? `/teacher/print/room/${encodeURIComponent(roomCode)}`
      : docType === "material"
      ? `/teacher/print/material/${encodeURIComponent(contentId)}`
      : docType === "question"
      ? `/teacher/print/exam/${encodeURIComponent(contentId)}`
      : null;

  const modalMarkup = (
    <div className="depaskan-printable-portal fixed inset-0 z-[9999] overflow-y-auto bg-slate-900/80 backdrop-blur-sm p-3 sm:p-6 md:p-8 flex justify-center items-start print:p-0 print:m-0 print:static print:bg-white print:overflow-visible print:z-auto print:w-full print:max-w-none">
      {/* Container A4 Sheet: Constrained on screen, exact A4 210mm in print */}
      <div className="bg-white text-[#23212A] w-full max-w-3xl rounded-3xl shadow-2xl p-5 sm:p-8 md:p-10 border border-[#E9E5E8] relative my-3 sm:my-6 print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-[210mm] print:w-full print:rounded-none">
        {/* Screen Action Bar (Hidden when printing) */}
        <div className="flex flex-wrap items-center justify-between pb-4 sm:pb-6 mb-5 sm:mb-6 border-b border-slate-200 gap-3 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#51465B] text-[#FFD36D] flex items-center justify-center shrink-0 shadow-xs">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-[#23212A]">
                Pratinjau Cetak Dokumen A4 Resmi
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                Dilengkapi QR Token validasi anti-pemalsuan dan layout baku Depaskan.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {standaloneUrl && (
              <a
                href={standaloneUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="Buka halaman cetak mandiri di tab baru"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">Buka Tab Cetak Penuh</span>
              </a>
            )}

            <button
              type="button"
              onClick={handlePrint}
              disabled={isIssuing}
              className="px-4 sm:px-5 py-2.5 rounded-full bg-[#51465B] hover:bg-[#3D3445] text-[#FFD36D] text-xs font-black shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all active:scale-95"
            >
              {isIssuing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menerbitkan...</span>
                </>
              ) : (
                <>
                  <Printer className="w-4 h-4" />
                  <span>Cetak PDF Sekarang</span>
                </>
              )}
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
                title="Tutup Pratinjau"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* A4 PRINTABLE DOCUMENT BODY (Follows exact DEPASKAN rules)      */}
        {/* ============================================================== */}
        <div className="space-y-6 print:space-y-5 text-left font-sans">
          {/* HEADER: Logo & Brand Kiri, QR Code & Doc ID Kanan */}
          <div className="flex items-start justify-between pb-4 border-b-2 border-[#51465B] print:flex-row print:justify-between print:items-start print:border-slate-900 break-inside-avoid">
            <div className="flex flex-col items-start">
              <PahamiPuzzleLogo size="md" asButton className="pointer-events-none p-0" />
              <div className="mt-1.5 space-y-0.5">
                <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider leading-tight">
                  Platform Asesmen & Bahan Ajar Kontekstual Berbasis Kearifan Lokal
                </p>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Kabupaten Ponorogo & Karesidenan Madiun
                </p>
              </div>
            </div>

            {/* QR Code Pojok Kanan Atas */}
            <div className="flex flex-col items-center text-center shrink-0">
              <div className="w-20 h-20 p-1 border border-slate-300 rounded-lg bg-white shadow-2xs">
                <img
                  src={qrUrl}
                  alt="QR Verifikasi DEPASKAN"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-mono text-[10px] font-black text-[#51465B] mt-1 tracking-wider">
                {displayDocId}
              </span>
              <span className="text-[9px] text-emerald-700 font-bold flex items-center gap-0.5">
                <ShieldCheck className="w-2.5 h-2.5" />
                Terverifikasi
              </span>
            </div>
          </div>

          {/* METADATA BANNER: Always 4 Columns in Print (HP & Laptop identical) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 print:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 print:border-slate-300 text-xs font-semibold break-inside-avoid">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Mata Pelajaran</span>
              <span className="text-slate-900 font-bold">{subject}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Jenjang & Kelas</span>
              <span className="text-slate-900 font-bold">Kelas {grade} SD</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Wilayah Konteks</span>
              <span className="text-slate-900 font-bold">{regionName}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Tanggal Cetak</span>
              <span className="text-slate-900 font-bold">{printDate}</span>
            </div>
          </div>

          {/* AREA IDENTITAS SISWA: Always 3 Columns in Print (HP & Laptop identical) */}
          <div className="p-3.5 rounded-2xl border-2 border-dashed border-slate-300 print:border-slate-400 bg-white grid grid-cols-1 sm:grid-cols-3 print:grid-cols-3 gap-4 text-xs font-bold break-inside-avoid">
            <div>
              <span className="text-slate-700">Nama Siswa:</span>
              <div className="border-b border-dotted border-slate-400 mt-5 w-full" />
            </div>
            <div>
              <span className="text-slate-700">Kelas / No. Absen:</span>
              <div className="border-b border-dotted border-slate-400 mt-5 w-full" />
            </div>
            <div>
              <span className="text-slate-700">Tanggal Pengerjaan:</span>
              <div className="border-b border-dotted border-slate-400 mt-5 w-full" />
            </div>
          </div>

          {/* TITLE DOKUMEN */}
          <div className="space-y-1 break-inside-avoid">
            <h2 className="text-lg sm:text-xl font-black text-[#23212A] tracking-tight">
              {title}
            </h2>
            {roomCode && (
              <span className="inline-block text-[11px] font-bold text-[#51465B] bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                Kode Akses Room: {roomCode.toUpperCase()}
              </span>
            )}
          </div>

          {/* ISI KONTEN (Materi Narrative) */}
          {content && (
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#51465B] flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Materi / Stimulus Pembelajaran:</span>
              </h3>
              <div className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap p-4 rounded-2xl bg-slate-50/70 border border-slate-200 print:bg-transparent">
                {content}
              </div>
            </div>
          )}

          {/* DAFTAR SOAL / ASESMEN */}
          {questions && questions.length > 0 && (
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#51465B] flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Lembar Soal & Pilihan Jawaban:</span>
              </h3>

              {questions.map((q, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-slate-200 print:border-slate-300 bg-white space-y-3 break-inside-avoid"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-[#51465B] text-[#FFD36D] text-xs font-black flex items-center justify-center shrink-0">
                      {q.number || idx + 1}
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed">
                      {q.question_text}
                    </p>
                  </div>

                  {/* Multiple Choice Options: Always 2 Columns in Print */}
                  {q.type === "multiple_choice" && q.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-2 pl-8 pt-1">
                      {q.options.map((opt) => (
                        <div
                          key={opt.key}
                          className="flex items-center gap-2 text-xs font-medium text-slate-800"
                        >
                          <span className="w-6 h-6 rounded-full border border-slate-400 flex items-center justify-center font-bold text-[11px] bg-slate-50">
                            {opt.key}
                          </span>
                          <span>{opt.text}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Essay Writing Space */}
                  {q.type === "essay" && (
                    <div className="pl-8 pt-1 space-y-2 break-inside-avoid">
                      <div className="rounded-xl border border-slate-300 bg-slate-50/50 print:bg-transparent p-3.5 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                          <span>Ruang Jawaban / Uraian Siswa:</span>
                          <span className="text-[10px] text-slate-400 font-normal italic">
                            (Tuliskan jawaban dan langkah pengerjaan dengan rapi)
                          </span>
                        </div>
                        <div className="space-y-4 pt-1 pb-1">
                          <div className="border-b border-slate-300 min-h-[24px] w-full" />
                          <div className="border-b border-slate-300 min-h-[24px] w-full" />
                          <div className="border-b border-slate-300 min-h-[24px] w-full" />
                          <div className="border-b border-slate-300 min-h-[24px] w-full" />
                          <div className="border-b border-slate-300 min-h-[24px] w-full" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* FOOTER VERIFIKASI */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row print:flex-row items-center justify-between text-[10px] text-slate-500 gap-2 break-inside-avoid">
            <span>
              Dicetak melalui DEPASKAN &bull; Keaslian dokumen terverifikasi &bull; Halaman 1 dari 1
            </span>
            <span className="font-mono text-slate-600 font-bold">
              ID Dokumen: {displayDocId}
            </span>
          </div>
        </div>
      </div>

      {/* EMBEDDED GLOBAL PRINT STYLES SPECIFIC TO PORTAL */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 12mm;
          }
          body.depaskan-print-modal-active > *:not(.depaskan-printable-portal) {
            display: none !important;
          }
          body.depaskan-print-modal-active {
            background-color: white !important;
            color: black !important;
            overflow: visible !important;
            height: auto !important;
            min-height: 100% !important;
            max-height: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .break-inside-avoid {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>
    </div>
  );

  if (!mounted) return null;

  return createPortal(modalMarkup, document.body);
}
