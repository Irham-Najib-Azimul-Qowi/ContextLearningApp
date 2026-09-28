"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Camera,
  Upload,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  FileText,
  CheckCircle2,
  RefreshCw,
  School as SchoolIcon,
  FileCheck,
  MapPin,
  AlertCircle,
} from "lucide-react";
import { TeacherWorkspaceShell } from "@/components/layout/teacher-workspace-shell";
import { repository } from "@/lib/db/repository";
import { School } from "@/lib/db/types";

import { CameraCaptureModal } from "@/components/media/camera-capture-modal";

function ScanQuestionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode"); // "pdf" or "photo"
  const isPdfMode = modeParam === "pdf";

  const [activeSchool, setActiveSchool] = useState<School | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isContextualizing, setIsContextualizing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<{ code?: string; message: string } | null>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState<boolean>(false);
  const [extractedRawText, setExtractedRawText] = useState<string>("");
  const [questionsList, setQuestionsList] = useState<
    {
      id: string;
      type: "multiple_choice" | "essay";
      question_text: string;
      options: { key: string; text: string }[];
      correct_answer: string;
      explanation: string;
      validation?: any;
    }[]
  >([]);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    setActiveSchool(repository.getActiveSchool());
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setErrorMessage(null);
      if (file.type.startsWith("image/")) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null);
      }
      setExtractedRawText("");
      setQuestionsList([]);
    }
  };

  const handleCameraCapture = (file: File, url: string) => {
    setSelectedFile(file);
    setPreviewUrl(url);
    setErrorMessage(null);
    setExtractedRawText("");
    setQuestionsList([]);
  };

  const handleProcessScan = async () => {
    if (!selectedFile) {
      setErrorMessage({
        code: "INPUT_INVALID",
        message: "Silakan pilih berkas atau ambil foto naskah terlebih dahulu.",
      });
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setExtractedRawText("");
    setQuestionsList([]);

    try {
      // 1. Send file to server-side extraction API (PDF Parse / Gemini Vision OCR)
      const formData = new FormData();
      formData.append("file", selectedFile);

      const extractRes = await fetch("/api/ai/extract", {
        method: "POST",
        body: formData,
      });

      const extractJson = await extractRes.json();
      if (!extractJson.success || !extractJson.extractedText) {
        const errObj = extractJson.error;
        const msg = typeof errObj === "object" ? errObj.message : errObj || (isPdfMode ? "PDF berhasil diunggah, tetapi teks belum berhasil dibaca." : "Teks pada gambar belum berhasil dibaca.");
        const code = typeof errObj === "object" ? errObj.code : (isPdfMode ? "PDF_EXTRACTION_FAILED" : "OCR_FAILED");
        setErrorMessage({ code, message: msg });
        return;
      }

      setExtractedRawText(extractJson.extractedText);
    } catch (err: any) {
      console.error("Scan processing error:", err);
      setErrorMessage({
        code: "NETWORK_ERROR",
        message: err.message || "Gagal memproses berkas. Pastikan foto atau dokumen terbaca dengan jelas.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContextualize = async () => {
    if (!extractedRawText.trim() || !activeSchool) return;

    setIsContextualizing(true);
    setErrorMessage(null);

    try {
      const ctxRes = await fetch("/api/ai/contextualize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "question",
          inputMode: isPdfMode ? "pdf" : "camera",
          rawText: extractedRawText,
          subject: "Matematika",
          grade: 5,
          regionId: activeSchool?.region_id || "35.02",
          regionName: activeSchool?.region_name || "Kabupaten Ponorogo",
        }),
      });

      const responseText = await ctxRes.text();
      let ctxJson: any = null;
      try {
        ctxJson = JSON.parse(responseText);
      } catch {
        ctxJson = null;
      }

      if (!ctxRes.ok || !ctxJson || !ctxJson.success || !ctxJson.data?.questions || ctxJson.data.questions.length === 0) {
        const errObj = ctxJson?.error;
        const msg =
          typeof errObj === "object"
            ? errObj.message
            : errObj ||
              (ctxRes.status === 504 || responseText.includes("An error occurred")
                ? "Proses AI membutuhkan waktu lebih lama di server. Silakan klik 'Kontekstualkan' kembali."
                : `Layanan AI mengalami kendala (${ctxRes.status}). Silakan coba lagi.`);
        const code = typeof errObj === "object" ? errObj.code : "CONTEXTUALIZATION_FAILED";
        setErrorMessage({ code, message: msg });
        return;
      }

      const mapped = ctxJson.data.questions.map((q: any, idx: number) => ({
        id: q.id || `scan-q-${Date.now()}-${idx + 1}`,
        type: q.type === "essay" ? "essay" : "multiple_choice",
        question_text: q.question_text || q.question || "",
        options: q.options && Array.isArray(q.options)
          ? q.options.map((o: any, oIdx: number) => ({
              key: o.key || String.fromCharCode(65 + oIdx),
              text: o.text || String(o),
            }))
          : [],
        correct_answer: q.correct_answer || q.correctAnswer || "A",
        explanation: q.explanation || "",
        validation: q.validation || ctxJson.data.validation || undefined,
      }));

      setQuestionsList(mapped);
    } catch (err: any) {
      console.error("Contextualization error:", err);
      setErrorMessage({
        code: "NETWORK_ERROR",
        message: err.message || "Gagal memproses kontekstualisasi soal.",
      });
    } finally {
      setIsContextualizing(false);
    }
  };

  const handleProceedToSave = () => {
    if (questionsList.length === 0 || !activeSchool) return;

    const teacher = repository.getCurrentUser();
    const firstQ = questionsList[0];
    const saved = repository.saveQuestion({
      school_id: activeSchool.id,
      teacher_id: teacher.id,
      subject: "Matematika",
      grade: 5,
      topic: isPdfMode ? "Ekstraksi & Kontekstualisasi Dokumen PDF" : "Ekstraksi & Kontekstualisasi Vision OCR",
      type: questionsList.length > 1 ? "mixed" : firstQ.type,
      question_text: firstQ.question_text,
      options: firstQ.options,
      correct_answer: firstQ.correct_answer,
      explanation: firstQ.explanation,
      items: questionsList,
      is_contextualized: true,
      original_question_text: extractedRawText,
    });

    router.push(`/teacher/questions/context-preview?id=${saved.id}`);
  };

  return (
    <TeacherWorkspaceShell activeGroupId="questions">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between gap-2 mb-6">
        <Link
          href="/teacher/questions/new"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#756F7A] hover:text-[#23212A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Pilihan Metode Input</span>
        </Link>
        <span className="text-xs font-bold text-[#51465B] bg-[#FAF7F3] border border-[#E9E5E8] px-3 py-1 rounded-full flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#F47D83]" />
          <span>Target Wilayah: {activeSchool?.region_name || "Karesidenan Madiun"}</span>
        </span>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header Card */}
        <div className="bg-white rounded-[28px] sm:rounded-[36px] border border-[#E9E5E8] p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-[#51465B] text-[#FFD36D] flex items-center justify-center shadow-xs">
              {isPdfMode ? <FileText className="w-6 h-6" /> : <Camera className="w-6 h-6" />}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#23212A] tracking-tight">
                {isPdfMode ? "Unggah Dokumen Soal (PDF / Naskah Ujian)" : "Pindai Lembar Soal (Vision OCR)"}
              </h1>
              <p className="text-xs text-[#756F7A]">
                {isPdfMode
                  ? "Unggah file PDF soal ujian standar untuk diekstraksi butir soal, opsi jawaban, dan kunci pembahasannya."
                  : "Foto lembar soal dari buku atau lembar kerja untuk diekstraksi menggunakan multimodal Gemini Vision."}
              </p>
            </div>
          </div>
        </div>

        {/* Upload & Camera Input Zone */}
        <div className="bg-white rounded-[28px] sm:rounded-[36px] border border-[#E9E5E8] p-6 sm:p-8 shadow-xs">
          {isPdfMode ? (
            <label className="border-2 border-dashed border-[#E9E5E8] hover:border-[#51465B] rounded-[24px] p-8 flex flex-col items-center justify-center text-center cursor-pointer bg-[#FAF7F3]/60 hover:bg-[#FAF7F3] transition-all block">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-2xl bg-[#51465B] text-[#FFD36D] flex items-center justify-center mb-3 shadow-xs">
                <Upload className="w-6 h-6" />
              </div>
              <span className="font-extrabold text-[#23212A] text-sm block">
                Klik atau Seret Berkas PDF Soal ke Sini
              </span>
              <span className="text-xs text-[#756F7A] mt-1 block">
                Format .pdf, .txt, .docx (Maks. 10 MB)
              </span>
            </label>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <button
                  type="button"
                  onClick={() => setIsCameraModalOpen(true)}
                  className="p-5 rounded-2xl bg-[#51465B] hover:bg-[#3D3445] text-white flex flex-col items-center justify-center gap-2.5 shadow-sm hover:shadow transition-all cursor-pointer group active:scale-95 border border-[#51465B]"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                    <Camera className="w-6 h-6 text-[#FFD36D]" />
                  </div>
                  <div>
                    <span className="text-sm font-extrabold text-[#FFD36D] block">
                      Buka Kamera Langsung
                    </span>
                    <span className="text-[11px] text-gray-300">
                      Mendukung Laptop Webcam &amp; Kamera HP
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-5 rounded-2xl border-2 border-dashed border-[#51465B]/30 hover:border-[#51465B] bg-[#FAF7F3] hover:bg-[#FAF7F3]/80 text-[#23212A] flex flex-col items-center justify-center gap-2.5 shadow-xs transition-all cursor-pointer group active:scale-95"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white border border-[#E9E5E8] flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
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
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}

          {/* Image / File Preview */}
          {selectedFile && (
            <div className="mt-6 pt-6 border-t border-[#E9E5E8] flex flex-col sm:flex-row items-center gap-4">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Pratinjau Foto"
                  className="w-28 h-28 object-cover rounded-2xl border border-slate-200 shrink-0 shadow-xs"
                />
              ) : (
                <div className="w-28 h-28 rounded-2xl bg-[#FAF7F3] border border-[#E9E5E8] flex flex-col items-center justify-center text-[#51465B] shrink-0">
                  <FileText className="w-8 h-8 text-[#51465B] mb-1" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">PDF Dokumen</span>
                </div>
              )}

              <div className="flex-1 text-xs">
                <span className="font-bold text-[#23212A] block">File Terpilih:</span>
                <span className="text-[#756F7A] font-mono block mb-3">{selectedFile.name}</span>
                <button
                  type="button"
                  onClick={handleProcessScan}
                  disabled={isProcessing}
                  className="px-5 py-2.5 rounded-xl bg-[#51465B] hover:bg-[#3E3547] text-white font-extrabold shadow-sm flex items-center gap-2 transition-transform active:scale-95"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#FFD36D]" />
                      <span>Sedang Mengekstraksi Butir Soal...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#FFD36D]" />
                      <span>Ekstraksi Teks dengan {isPdfMode ? "PDF Parser" : "Gemini Vision OCR"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mt-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start justify-between gap-3">
              <div>
                <div className="font-bold flex items-center gap-1.5 text-rose-900 mb-0.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Proses Belum Berhasil</span>
                  {errorMessage.code && (
                    <span className="px-1.5 py-0.2 bg-rose-200 text-rose-800 text-[10px] font-mono rounded">
                      {errorMessage.code}
                    </span>
                  )}
                </div>
                <p className="text-[11px] leading-relaxed text-rose-700">{errorMessage.message}</p>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="px-2.5 py-1 rounded-lg bg-white border border-rose-200 text-rose-700 hover:bg-rose-100 text-[11px] font-bold shrink-0"
              >
                Tutup
              </button>
            </div>
          )}
        </div>

        {/* Step 2: Show Extracted Raw Text & Allow Teacher Edit */}
        {extractedRawText && questionsList.length === 0 && (
          <div className="bg-white rounded-[28px] sm:rounded-[36px] border border-emerald-200 shadow-md p-6 sm:p-8 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Naskah Berhasil Diekstraksi</span>
              </div>
              <span className="text-[11px] text-[#756F7A]">
                Guru dapat meninjau & menyunting naskah sebelum dikontekstualisasikan
              </span>
            </div>

            <div>
              <label className="font-bold text-[#23212A] block mb-1.5 text-xs">
                Naskah Hasil Ekstraksi (Dapat Diedit):
              </label>
              <textarea
                rows={6}
                value={extractedRawText}
                onChange={(e) => setExtractedRawText(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-[#E9E5E8] bg-[#FAF7F3] text-xs font-medium text-[#23212A] focus:outline-none focus:ring-2 focus:ring-[#51465B]/20 leading-relaxed font-mono"
              />
            </div>

            <div className="pt-3 border-t border-[#E9E5E8] flex justify-end">
              <button
                type="button"
                onClick={handleContextualize}
                disabled={isContextualizing}
                className="px-6 py-3 rounded-2xl bg-[#51465B] hover:bg-[#3E3547] text-white font-black text-xs shadow-md flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
              >
                {isContextualizing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#FFD36D]" />
                    <span>Contextual AI Engine Menyelaraskan Soal...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#FFD36D]" />
                    <span>Kontekstualisasikan Soal ke {activeSchool?.region_name || "Wilayah"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Contextualized Questions Review */}
        {questionsList.length > 0 && (
          <div className="bg-white rounded-[28px] sm:rounded-[36px] border border-[#51465B]/20 shadow-md p-6 sm:p-8 space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-[#E9E5E8]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#23212A]">
                    {questionsList.length} Butir Soal Terkontekstualisasi
                  </h3>
                  <p className="text-[11px] text-[#756F7A]">
                    Kompetensi inti dipertahankan dengan adaptasi kearifan lokal {activeSchool?.region_name}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {questionsList.map((q, idx) => (
                <div key={q.id || idx} className="p-4 rounded-2xl border border-[#E9E5E8] bg-[#FAF7F3] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#51465B]">Butir Soal #{idx + 1}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold uppercase">
                      {q.type === "essay" ? "Esai" : "Pilihan Ganda"}
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#23212A] mb-1">Pertanyaan:</label>
                    <textarea
                      rows={2}
                      value={q.question_text}
                      onChange={(e) => {
                        const next = [...questionsList];
                        next[idx].question_text = e.target.value;
                        setQuestionsList(next);
                      }}
                      className="w-full p-2.5 rounded-xl border border-[#E9E5E8] bg-white text-xs font-medium text-[#23212A]"
                    />
                  </div>

                  {q.type === "multiple_choice" && q.options && q.options.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, oIdx) => (
                        <div key={opt.key} className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[#51465B] w-5 text-center">{opt.key}.</span>
                          <input
                            type="text"
                            value={opt.text}
                            onChange={(e) => {
                              const next = [...questionsList];
                              next[idx].options[oIdx].text = e.target.value;
                              setQuestionsList(next);
                            }}
                            className="flex-1 p-2 rounded-xl border border-[#E9E5E8] bg-white text-xs text-[#23212A]"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {q.explanation && (
                    <p className="text-[11px] text-[#756F7A] bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="font-bold text-[#51465B]">Pembahasan: </span>
                      {q.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[#E9E5E8] flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setQuestionsList([])}
                className="px-4 py-2.5 rounded-xl border border-[#E9E5E8] text-xs font-bold text-[#756F7A] hover:bg-slate-50"
              >
                Sunting Ulang Naskah
              </button>
              <button
                type="button"
                onClick={handleProceedToSave}
                className="px-6 py-2.5 rounded-xl bg-[#51465B] hover:bg-[#3E3547] text-white font-black text-xs shadow-md flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#FFD36D]" />
                <span>Setujui & Simpan ke Bank Soal</span>
              </button>
            </div>
          </div>
        )}

        {/* Live Camera Modal */}
        <CameraCaptureModal
          isOpen={isCameraModalOpen}
          onClose={() => setIsCameraModalOpen(false)}
          onCapture={handleCameraCapture}
          title="Potret Lembar Naskah Soal"
          description="Arahkan kamera ke lembar soal dari buku atau lembar kerja untuk diekstraksi."
        />
      </div>
    </TeacherWorkspaceShell>
  );
}

export default function ScanQuestionPage() {
  return (
    <Suspense
      fallback={
        <TeacherWorkspaceShell activeGroupId="questions">
          <div className="flex items-center justify-center min-h-[50vh]">
            <RefreshCw className="w-8 h-8 text-[#51465B] animate-spin" />
          </div>
        </TeacherWorkspaceShell>
      }
    >
      <ScanQuestionContent />
    </Suspense>
  );
}
