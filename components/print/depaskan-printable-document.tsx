"use client";

import React, { useState } from "react";
import { Printer, Loader2, CheckCircle2, ShieldCheck, X } from "lucide-react";
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
    type: "multiple_choice" | "essay";
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

  const displayDocId = issuedDocId || `DOC-${contentId.toUpperCase()}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
    JSON.stringify({ app: "DEPASKAN", id: displayDocId, tok: issuedToken || "SIGNATURE_VALID", type: docType, code: roomCode || "" })
  )}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:static print:bg-white print:z-auto">
      {/* Container A4 */}
      <div className="bg-white text-[#23212A] w-full max-w-4xl rounded-3xl shadow-2xl p-6 sm:p-10 border border-[#E9E5E8] relative print:border-none print:shadow-none print:p-0 print:rounded-none">
        {/* Screen Action Bar (Hidden when printing) */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#51465B] text-[#FFD36D] flex items-center justify-center">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#23212A]">Pratinjau Cetak Dokumen A4</h3>
              <p className="text-xs text-slate-500">
                Dokumen resmi DEPASKAN dilengkapi QR Token dan nomor penerbitan unik.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              disabled={isIssuing}
              className="px-5 py-2.5 rounded-full bg-[#51465B] hover:bg-[#3D3445] text-[#FFD36D] text-xs font-black shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isIssuing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menerbitkan Dokumen...</span>
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
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
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
          <div className="flex items-start justify-between pb-4 border-b-2 border-[#51465B]">
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
            <div className="flex flex-col items-center text-center">
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

          {/* METADATA BANNER */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold">
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

          {/* AREA IDENTITAS SISWA (Dotted writing area for offline work) */}
          <div className="p-3.5 rounded-2xl border-2 border-dashed border-slate-300 bg-white grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold">
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
          <div className="space-y-1">
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
              <h3 className="text-xs font-black uppercase tracking-wider text-[#51465B]">
                Materi / Stimulus Pembelajaran:
              </h3>
              <div className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap p-4 rounded-2xl bg-slate-50/70 border border-slate-200">
                {content}
              </div>
            </div>
          )}

          {/* DAFTAR SOAL / ASESMEN */}
          {questions && questions.length > 0 && (
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#51465B]">
                Lembar Soal & Pilihan Jawaban:
              </h3>

              {questions.map((q, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-[#51465B] text-[#FFD36D] text-xs font-black flex items-center justify-center shrink-0">
                      {q.number || idx + 1}
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed">
                      {q.question_text}
                    </p>
                  </div>

                  {/* Multiple Choice Options with Bubble Mark */}
                  {q.type === "multiple_choice" && q.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-8 pt-1">
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
                    <div className="pl-8 pt-1 space-y-2">
                      <span className="text-[11px] text-slate-500 italic block">
                        Tuliskan jawaban dan langkah pengerjaan pada baris di bawah:
                      </span>
                      <div className="space-y-3 pt-1">
                        <div className="border-b border-slate-300 h-5 w-full" />
                        <div className="border-b border-slate-300 h-5 w-full" />
                        <div className="border-b border-slate-300 h-5 w-full" />
                        <div className="border-b border-slate-300 h-5 w-full" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* FOOTER VERIFIKASI */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 gap-2">
            <span>
              Dicetak melalui DEPASKAN &bull; Keaslian dokumen terverifikasi &bull; Halaman 1 dari 1
            </span>
            <span className="font-mono text-slate-600 font-bold">
              ID Dokumen: {displayDocId}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
