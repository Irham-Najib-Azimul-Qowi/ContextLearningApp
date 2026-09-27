"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Camera,
  Upload,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileCheck,
  DoorOpen,
  ArrowRight,
  Pencil,
  RefreshCw,
} from "lucide-react";
import { TeacherWorkspaceShell } from "@/components/layout/teacher-workspace-shell";
import { repository } from "@/lib/db/repository";

import { CameraCaptureModal } from "@/components/media/camera-capture-modal";

export default function ScanResultsPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

  // Scan Result State
  const [scanResult, setScanResult] = useState<{
    verified: boolean;
    document_id: string;
    doc_type: string;
    content_title: string;
    room_code: string;
    student_name: string;
    mc_answers: Array<{
      number: number;
      student_answer: string;
      correct_answer: string;
      is_correct: boolean;
    }>;
    essay_answer: string;
    calculated_score: number;
  } | null>(null);

  // Editable Teacher Overrides
  const [studentName, setStudentName] = useState("");
  const [studentMcAnswer, setStudentMcAnswer] = useState("A");
  const [studentEssayAnswer, setStudentEssayAnswer] = useState("");
  const [essayScore, setEssayScore] = useState<number>(85);
  const [teacherNotes, setTeacherNotes] = useState("");
  const [isSubmittingToDashboard, setIsSubmittingToDashboard] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setScanResult(null);
      setErrorNotice(null);
      setSavedSuccess(false);
    }
  };

  const handleCameraCapture = (file: File, url: string) => {
    setSelectedFile(file);
    setPreviewUrl(url);
    setScanResult(null);
    setErrorNotice(null);
    setSavedSuccess(false);
  };

  const handleProcessScan = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setErrorNotice(null);
    setScanResult(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/scan/process", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || "Gagal memproses pindaian berkas.");
      }

      if (!json.verified) {
        setErrorNotice(
          "DITOLAK: Lembar cetak tidak terverifikasi atau bukan diterbitkan oleh sistem DEPASKAN."
        );
        return;
      }

      setScanResult(json);
      setStudentName(json.student_name || "Siswa Cetak (Luring)");
      setStudentMcAnswer(json.mc_answers?.[0]?.student_answer || "A");
      setStudentEssayAnswer(json.essay_answer || "");
      setEssayScore(85);
    } catch (err: any) {
      console.error("[Scan Error]", err);
      setErrorNotice(err.message || "Terjadi kesalahan saat memindai lembar kerja.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmAndSave = async () => {
    if (!scanResult) return;

    setIsSubmittingToDashboard(true);
    try {
      const isMcCorrect =
        studentMcAnswer.toUpperCase() ===
        (scanResult.mc_answers?.[0]?.correct_answer || "A").toUpperCase();
      const mcScore = isMcCorrect ? 100 : 0;
      const finalScore = studentEssayAnswer.trim()
        ? Math.round((mcScore + essayScore) / 2)
        : mcScore;

      const res = await fetch("/api/room/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room_code: scanResult.room_code || "OFFLINE",
          student_name: studentName.trim(),
          source: "Print + Scan",
          action: studentEssayAnswer.trim() ? "submit_essay" : "submit_mc",
          mc_answer: studentMcAnswer,
          is_mc_correct: isMcCorrect,
          mc_score: mcScore,
          essay_answer: studentEssayAnswer.trim(),
          document_id: scanResult.document_id,
        }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || "Gagal menyimpan ke dashboard.");
      }

      // If essay exists, also submit teacher grade
      if (studentEssayAnswer.trim()) {
        await fetch("/api/room/grade-essay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            room_code: scanResult.room_code || "OFFLINE",
            student_name: studentName.trim(),
            essay_score: essayScore,
            teacher_feedback: teacherNotes.trim(),
          }),
        });
      }

      setSavedSuccess(true);
    } catch (err: any) {
      alert("Gagal menyimpan hasil scan: " + err.message);
    } finally {
      setIsSubmittingToDashboard(false);
    }
  };

  return (
    <TeacherWorkspaceShell activeGroupId="scan-results">
      <div className="max-w-4xl mx-auto space-y-7 pb-16 text-left font-sans">
        {/* 1. Header Pojok Kiri Atas TANPA DIBUNGKUS KOTAK */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-[#23212A] tracking-tight">
            Pindai Hasil Cetak Lembar Asesmen
          </h1>
          <p className="text-xs sm:text-sm text-[#756F7A] font-medium max-w-3xl">
            Pindai atau potret lembar ujian fisik siswa. Sistem memverifikasi QR token DEPASKAN dan membaca jawaban pilihan ganda &amp; esai secara otomatis.
          </p>
        </div>

        {/* 2. Fitur Center di Tengah: Pilihan Kamera & Unggah Berkas */}
        <div className="max-w-2xl mx-auto w-full bg-white rounded-[28px] sm:rounded-[36px] border-2 border-[#51465B]/20 p-6 sm:p-8 shadow-xs space-y-5 text-center">
          <div className="space-y-1">
            <span className="text-xs font-black uppercase tracking-wider text-[#51465B] block">
              Pilih Cara Pemindaian Lembar
            </span>
            <p className="text-xs text-[#756F7A]">
              Dukungan kamera langsung (kamera laptop &amp; HP) serta upload file foto.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {/* Tombol Kamera Langsung */}
            <button
              type="button"
              onClick={() => setIsCameraModalOpen(true)}
              className="p-5 rounded-2xl bg-[#51465B] hover:bg-[#3D3445] text-white flex flex-col items-center justify-center gap-2.5 shadow-sm hover:shadow transition-all cursor-pointer group active:scale-95 border border-[#51465B]"
            >
              <div className="w-13 h-13 rounded-2xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                <Camera className="w-6 h-6 text-[#FFD36D]" />
              </div>
              <div>
                <span className="text-sm font-extrabold text-[#FFD36D] block">
                  Buka Kamera Langsung
                </span>
                <span className="text-[11px] text-gray-300">
                  Support Laptop Webcam &amp; Kamera HP
                </span>
              </div>
            </button>

            {/* Tombol Unggah File */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-5 rounded-2xl border-2 border-dashed border-[#51465B]/30 hover:border-[#51465B] bg-[#FAF7F3] hover:bg-[#FAF7F3]/80 text-[#23212A] flex flex-col items-center justify-center gap-2.5 shadow-xs transition-all cursor-pointer group active:scale-95"
            >
              <div className="w-13 h-13 rounded-2xl bg-white border border-[#E9E5E8] flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
                <Upload className="w-6 h-6 text-[#51465B]" />
              </div>
              <div>
                <span className="text-sm font-extrabold text-[#23212A] block">
                  Unggah Berkas Foto
                </span>
                <span className="text-[11px] text-[#756F7A]">
                  Pilih file JPG, PNG, atau WebP
                </span>
              </div>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/70 text-[11px] text-amber-900 font-medium text-left flex items-start gap-2">
            <span className="font-bold shrink-0">Petunjuk:</span>
            <span>Pastikan pojok kanan atas lembar kerja (area QR Code Token dan ID Dokumen) tampak jelas dan terang untuk keberhasilan verifikasi keaslian dokumen.</span>
          </div>
        </div>

        {/* 3. Pratinjau Foto Lembar Terpilih & Tombol Analisis */}
        {previewUrl && (
          <div className="max-w-2xl mx-auto w-full bg-white rounded-[28px] sm:rounded-[36px] border border-[#E9E5E8] p-6 shadow-xs space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9E5E8]">
              <span className="text-xs font-black uppercase tracking-wider text-[#51465B]">
                Foto Lembar Fisik Siap Dipindai
              </span>
              <span className="text-xs font-mono text-slate-500 truncate max-w-[200px]">
                {selectedFile?.name || "Foto Kamera"}
              </span>
            </div>

            <div className="relative w-full max-h-[380px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-black/5 flex items-center justify-center">
              <img
                src={previewUrl}
                alt="Pratinjau Lembar Asesmen"
                className="w-full h-auto max-h-[380px] object-contain"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  setScanResult(null);
                  setErrorNotice(null);
                  setSavedSuccess(false);
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Ganti / Hapus Foto
              </button>

              <button
                type="button"
                onClick={handleProcessScan}
                disabled={isProcessing}
                className="w-full sm:w-auto py-3 px-7 rounded-full bg-[#51465B] hover:bg-[#3D3445] text-[#FFD36D] text-xs sm:text-sm font-black shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-transform active:scale-95"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menganalisis &amp; Memverifikasi...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Pindai &amp; Verifikasi Keaslian Dokumen</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Rejection / Error Alert */}
        {errorNotice && (
          <div className="max-w-2xl mx-auto w-full p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-black">Verifikasi Dokumen Gagal</strong>
              <p className="leading-relaxed mt-0.5">{errorNotice}</p>
            </div>
          </div>
        )}

        {/* Live Camera Modal */}
        <CameraCaptureModal
          isOpen={isCameraModalOpen}
          onClose={() => setIsCameraModalOpen(false)}
          onCapture={handleCameraCapture}
          title="Potret Lembar Hasil Cetak"
          description="Arahkan kamera ke lembar ujian fisik siswa. Pastikan area QR token terlihat jelas."
        />

        {/* ============================================================== */}
        {/* STEP 2: PREVIEW & VERIFIKASI SEBELUM SUBMIT (WAJIB ADA PREVIEW) */}
        {/* ============================================================== */}
        {scanResult && (
          <div className="bg-white rounded-[28px] sm:rounded-[36px] border-2 border-[#51465B] p-6 sm:p-8 shadow-md space-y-6 animate-in fade-in duration-200">
            {/* Verification Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-emerald-800 uppercase tracking-wider">
                      Dokumen Terverifikasi Asli DEPASKAN
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-600">
                    ID Dokumen: {scanResult.document_id}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#51465B] bg-purple-50 px-3 py-1 rounded-full border border-purple-200 flex items-center gap-1.5">
                  <DoorOpen className="w-3.5 h-3.5" />
                  <span>Room: {scanResult.room_code.toUpperCase()}</span>
                </span>
              </div>
            </div>

            {/* Form Koreksi & Preview Teks Hasil Bacaan */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Nama Siswa (Dapat diedit jika terjadi koreksi OCR):
                </label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-[#51465B] text-sm font-bold text-[#23212A] focus:outline-none"
                />
              </div>

              {/* Multiple Choice Detection Review */}
              {scanResult.mc_answers && scanResult.mc_answers.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#51465B] block">
                    Hasil Pembacaan Pilihan Ganda:
                  </span>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-600">Jawaban Terdeteksi:</span>
                      <select
                        value={studentMcAnswer}
                        onChange={(e) => setStudentMcAnswer(e.target.value)}
                        className="px-3 py-1 rounded-lg border-2 border-[#51465B] font-black text-sm bg-white text-[#51465B]"
                      >
                        {["A", "B", "C", "D"].map((k) => (
                          <option key={k} value={k}>
                            Opsi {k}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="text-xs text-slate-500">
                      Kunci Jawaban:{" "}
                      <strong>{scanResult.mc_answers[0]?.correct_answer || "A"}</strong>
                    </div>
                    <div className="ml-auto">
                      {studentMcAnswer.toUpperCase() ===
                      (scanResult.mc_answers[0]?.correct_answer || "A").toUpperCase() ? (
                        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                          Benar (Skor 100)
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-black">
                          Salah (Skor 0)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Essay Handwriting OCR & Teacher Grading */}
              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#51465B] block">
                  Hasil Bacaan Tulisan Tangan Jawaban Esai:
                </span>
                <textarea
                  rows={4}
                  value={studentEssayAnswer}
                  onChange={(e) => setStudentEssayAnswer(e.target.value)}
                  placeholder="Jika naskah memiliki jawaban esai, teks hasil OCR akan tampil di sini..."
                  className="w-full p-3 rounded-xl border border-purple-200 bg-white text-xs sm:text-sm leading-relaxed text-[#23212A] focus:outline-none"
                />

                {studentEssayAnswer.trim() && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">
                        Beri Nilai Esai (0 - 100):
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={essayScore}
                        onChange={(e) => setEssayScore(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-purple-300 font-black text-sm text-[#51465B] bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">
                        Catatan Guru:
                      </label>
                      <input
                        type="text"
                        value={teacherNotes}
                        onChange={(e) => setTeacherNotes(e.target.value)}
                        placeholder="Uraian pengerjaan rapi..."
                        className="w-full px-3 py-2 rounded-xl border border-purple-300 text-xs font-medium text-[#23212A] bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submission Actions / Persetujuan */}
            <div className="pt-4 border-t border-slate-200">
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-left">
                  <span className="text-xs font-black uppercase tracking-wider text-[#51465B] block">
                    Persetujuan &amp; Sinkronisasi Nilai Siswa
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">
                    Sumber pengerjaan akan diverifikasi dan dicatat sebagai <strong>Print + Scan</strong> pada Dashboard Room.
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleConfirmAndSave}
                    disabled={isSubmittingToDashboard || savedSuccess}
                    className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#51465B] hover:bg-[#3D3445] text-[#FFD36D] text-xs sm:text-sm font-black shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all active:scale-95 whitespace-nowrap"
                  >
                    {isSubmittingToDashboard ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Menyimpan ke Dashboard...</span>
                      </>
                    ) : savedSuccess ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Nilai Berhasil Masuk ke Room!</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Setujui &amp; Simpan ke Nilai Room</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {savedSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex items-center justify-between gap-3">
                <span className="font-bold">
                  Data nilai siswa &ldquo;{studentName}&rdquo; berhasil masuk ke Room {scanResult.room_code.toUpperCase()}!
                </span>
                <Link
                  href="/teacher/rooms"
                  className="px-4 py-1.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-black text-[11px] flex items-center gap-1 shadow-xs"
                >
                  <span>Buka Room Dashboard</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </TeacherWorkspaceShell>
  );
}
