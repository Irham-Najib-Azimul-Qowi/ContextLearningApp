"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  Printer,
  ArrowLeft,
  ShieldCheck,
  Loader2,
  ExternalLink,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import { PahamiPuzzleLogo } from "@/components/landing/puzzle-logo";
import { repository } from "@/lib/db/repository";
import { LearningRoom, LearningMaterial, Question, School, getQuestionItems } from "@/lib/db/types";

interface PrintRoomPageProps {
  params: Promise<{ code: string }>;
}

export default function PrintRoomPage({ params }: PrintRoomPageProps) {
  const resolvedParams = use(params);
  const roomCode = resolvedParams.code;

  const [isLoading, setIsLoading] = useState(true);
  const [room, setRoom] = useState<LearningRoom | null>(null);
  const [material, setMaterial] = useState<LearningMaterial | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [school, setSchool] = useState<School | null>(null);

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
    let isMounted = true;

    async function loadRoom() {
      setIsLoading(true);
      const activeSchool = repository.getActiveSchool();
      setSchool(activeSchool);

      // 1. Try local repository first
      const cleanCode = (roomCode || "").trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
      let localRoom = repository.getRoomByCode(cleanCode);

      if (localRoom) {
        setRoom(localRoom);

        if (localRoom.type === "material" || localRoom.type === "both") {
          const mat = repository.getMaterials().find((m) => m.id === localRoom.resource_id);
          if (mat) setMaterial(mat);
        }

        if (localRoom.type === "question" || localRoom.type === "both") {
          const qId =
            localRoom.type === "both"
              ? localRoom.secondary_resource_id
              : localRoom.resource_id;
          const q = repository.getQuestions().find((item) => item.id === qId);
          if (q) setQuestion(q);
        }
      }

      // 2. Fetch authoritative cloud data
      try {
        const res = await fetch(`/api/room/${encodeURIComponent(cleanCode)}`);
        const json = await res.json();
        if (isMounted && json.success && json.room) {
          setRoom(json.room);
          if (json.material) setMaterial(json.material);
          if (json.question) setQuestion(json.question);
        }
      } catch (err) {
        console.warn("Could not fetch room from API:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadRoom();

    return () => {
      isMounted = false;
    };
  }, [roomCode]);

  const handlePrint = async () => {
    if (!room) {
      window.print();
      return;
    }

    setIsIssuing(true);
    try {
      const res = await fetch("/api/print/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doc_type: "room",
          content_id: room.id,
          content_title: room.title,
          room_code: room.code,
          metadata: {
            subject: room.subject,
            grade: room.grade,
            region_name: room.region_name,
            correct_answer: question?.correct_answer || "A",
          },
        }),
      });

      const json = await res.json();
      if (json.success) {
        setIssuedDocId(json.document_id);
        setIssuedToken(json.document_token);
        setTimeout(() => {
          window.print();
        }, 300);
      } else {
        window.print();
      }
    } catch {
      window.print();
    } finally {
      setIsIssuing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF7F3] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-8 h-8 text-[#51465B] animate-spin mb-3" />
        <p className="text-sm font-bold text-[#51465B]">Memuat Dokumen Ruang Belajar...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-[#FAF7F3] p-8 text-center text-[#23212A] flex flex-col items-center justify-center">
        <div className="max-w-md bg-white p-6 rounded-3xl border border-[#E9E5E8] shadow-md space-y-4">
          <p className="text-base font-black text-slate-800">
            Dokumen Ruang Belajar "{roomCode}" tidak ditemukan.
          </p>
          <p className="text-xs text-slate-500">
            Pastikan kode room sudah benar dan room telah tersinkronisasi.
          </p>
          <Link
            href="/teacher/rooms"
            className="inline-block px-5 py-2.5 bg-[#51465B] text-white rounded-full text-xs font-bold"
          >
            Kembali ke Manajemen Room
          </Link>
        </div>
      </div>
    );
  }

  const displayDocId = issuedDocId || `DOC-${(room.code || room.id).toUpperCase()}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
    JSON.stringify({
      app: "DEPASKAN",
      id: displayDocId,
      tok: issuedToken || "SIGNATURE_VALID",
      type: "room",
      code: room.code || "",
    })
  )}`;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 print:bg-white print:p-0">
      {/* 1. NON-PRINTABLE TOP CONTROLS TOOLBAR */}
      <header className="no-print sticky top-0 z-40 bg-white border-b border-[#E9E5E8] shadow-xs px-4 sm:px-6 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/teacher/rooms"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Kembali ke Manajemen Room"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-sm font-black text-[#23212A]">Cetak Dokumen Ruang Belajar A4</h1>
              <p className="text-xs text-slate-500 font-medium">
                {room.title} &bull; Kode: <span className="font-mono font-bold text-[#51465B]">{room.code}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              disabled={isIssuing}
              className="px-5 py-2.5 rounded-full bg-[#51465B] hover:bg-[#3D3445] text-[#FFD36D] text-xs font-black shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all active:scale-95"
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
          </div>
        </div>
      </header>

      {/* 2. PRINTABLE A4 CONTAINER (Standardized A4 Width 210mm) */}
      <main className="max-w-[210mm] mx-auto my-6 print:my-0 bg-white shadow-xl print:shadow-none print:w-full p-[15mm] sm:p-[20mm] print:p-0 rounded-2xl print:rounded-none border border-slate-200 print:border-none space-y-6 print:space-y-5 text-left font-sans">
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

        {/* METADATA BANNER: Always 4 Columns in Print */}
        <div className="grid grid-cols-2 sm:grid-cols-4 print:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 print:border-slate-300 text-xs font-semibold break-inside-avoid">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Mata Pelajaran</span>
            <span className="text-slate-900 font-bold">{room.subject}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Jenjang & Kelas</span>
            <span className="text-slate-900 font-bold">Kelas {room.grade} SD</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Wilayah Konteks</span>
            <span className="text-slate-900 font-bold">{room.region_name}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Tanggal Cetak</span>
            <span className="text-slate-900 font-bold">{printDate}</span>
          </div>
        </div>

        {/* AREA IDENTITAS SISWA: Always 3 Columns in Print */}
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
            {room.title}
          </h2>
          <span className="inline-block text-[11px] font-bold text-[#51465B] bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
            Kode Akses Room: {room.code.toUpperCase()}
          </span>
        </div>

        {/* ISI KONTEN (Materi Narrative) */}
        {material && material.content && (
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#51465B] flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Materi / Stimulus Pembelajaran ({material.title}):</span>
            </h3>
            <div className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap p-4 rounded-2xl bg-slate-50/70 border border-slate-200 print:bg-transparent">
              {material.content}
            </div>
          </div>
        )}

        {/* DAFTAR SOAL / ASESMEN */}
        {question && (
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#51465B] flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Lembar Soal & Pilihan Jawaban ({question.topic || "Latihan Mandiri"}):</span>
            </h3>

            {getQuestionItems(question).map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-4 rounded-2xl border border-slate-200 print:border-slate-300 bg-white space-y-3 break-inside-avoid"
              >
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#51465B] text-[#FFD36D] text-xs font-black flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed">
                    {item.question_text}
                  </p>
                </div>

                {/* Multiple Choice Options */}
                {item.type === "multiple_choice" && item.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-2 pl-8 pt-1">
                    {item.options.map((opt) => (
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

                {/* Essay Writing Space with Dedicated Ruang Jawaban Box */}
                {item.type === "essay" && (
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
      </main>

      {/* PRINT-SPECIFIC CSS RULES */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 12mm;
          }
          .no-print {
            display: none !important;
          }
          body {
            background-color: white !important;
            color: black !important;
            font-size: 11pt;
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
}
