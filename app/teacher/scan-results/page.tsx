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

export default function ScanResultsPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

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
      <div className="max-w-4xl mx-auto space-y-6 pb-12 text-left font-sans">
        {/* Header Banner */}
        <div className="bg-white rounded-[28px] sm:rounded-[36px] border border-[#E9E5E8] p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#51465B] text-[#FFD36D] flex items-center justify-center shadow-xs">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#23212A] tracking-tight">
                Pindai Hasil Cetak Lembar Asesmen
              </h1>
              <p className="text-xs text-[#756F7A] mt-0.5">
                Pindai lembar ujian fisik siswa. Sistem memverifikasi QR token DEPASKAN dan membaca jawaban pilihan ganda & esai secara otomatis.
              </p>
            </div>
          </div>
        </div>

        {/* Upload & Camera Input Section */}
        <div className="bg-white rounded-[28px] sm:rounded-[36px] border border-[#E9E5E8] p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#E9E5E8]">
            <span className="text-xs font-black uppercase tracking-wider text-[#51465B]">
              Langkah 1: Unggah atau Potret Lembar Jawaban Fisik
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Format: JPG, PNG</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
            {/* Drop / Capture Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#51465B]/30 hover:border-[#51465B] bg-[#FAF7F3]/70 hover:bg-[#FAF7F3] rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[220px]"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-14 h-14 rounded-2xl bg-[#51465B] text-[#FFD36D] flex items-center justify-center mb-3 shadow-xs">
                <Camera className="w-7 h-7" />
              </div>
              <p className="text-xs sm:text-sm font-bold text-[#23212A]">
                {selectedFile ? selectedFile.name : "Ambil Foto atau Pilih Berkas"}
              </p>
              <p className="text-[11px] text-[#756F7A] mt-1 max-w-xs">
                Pastikan pojok kanan atas lembar (area QR Token dan ID Dokumen) tampak jelas dan terang.
              </p>
            </div>

            {/* Preview Area */}
            <div className="rounded-3xl border border-[#E9E5E8] bg-slate-50 p-4 min-h-[220px] flex flex-col items-center justify-center">
              {previewUrl ? (
                <div className="space-y-3 w-full text-center">
                  <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
                    <img
                      src={previewUrl}
                      alt="Foto Lembar Kerja"
                      className="w-full h-full object-contain bg-black/5"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleProcessScan}
                    disabled={isProcessing}
                    className="w-full py-3 px-6 rounded-2xl bg-[#51465B] hover:bg-[#3D3445] text-[#FFD36D] text-xs font-black shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Menganalisis & Memverifikasi...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Pindai & Verifikasi Keaslian Dokumen</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="text-center text-slate-400 space-y-1">
                  <FileCheck className="w-8 h-8 mx-auto opacity-40" />
                  <p className="text-xs font-medium">Pratinjau lembar kerja akan tampil di sini</p>
                </div>
              )}
            </div>
          </div>

          {/* Rejection / Error Alert */}
          {errorNotice && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-black">Verifikasi Dokumen Gagal</strong>
                <p className="leading-relaxed mt-0.5">{errorNotice}</p>
              </div>
            </div>
          )}
        </div>

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

            {/* Submission Actions */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                Sumber pengerjaan akan dicatat sebagai <strong>Print + Scan</strong> pada Dashboard Room.
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleConfirmAndSave}
                  disabled={isSubmittingToDashboard || savedSuccess}
                  className="px-6 py-3 rounded-full bg-[#51465B] hover:bg-[#3D3445] text-[#FFD36D] text-xs sm:text-sm font-black shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingToDashboard ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan ke Dashboard...</span>
                    </>
                  ) : savedSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Tersimpan di Dashboard!</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Konfirmasi & Simpan ke Dashboard</span>
                    </>
                  )}
                </button>
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
