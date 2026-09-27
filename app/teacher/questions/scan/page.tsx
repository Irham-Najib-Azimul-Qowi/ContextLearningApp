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
} from "lucide-react";
import { TeacherWorkspaceShell } from "@/components/layout/teacher-workspace-shell";
import { repository } from "@/lib/db/repository";
import { geminiProvider } from "@/lib/ai/gemini-provider";
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
  const [isCameraModalOpen, setIsCameraModalOpen] = useState<boolean>(false);
  const [extractedData, setExtractedData] = useState<{
    question_text: string;
    options: { key: string; text: string }[];
    correct_answer: string;
    explanation: string;
  } | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    setActiveSchool(repository.getActiveSchool());
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (file.type.startsWith("image/")) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null);
      }
      setExtractedData(null);
    }
  };

  const handleCameraCapture = (file: File, url: string) => {
    setSelectedFile(file);
    setPreviewUrl(url);
    setExtractedData(null);
  };

  const handleProcessScan = async () => {
    setIsProcessing(true);

    try {
      if (isPdfMode) {
        // PDF parser simulation
        setTimeout(() => {
          setExtractedData({
            question_text:
              "Di sebuah pasar induk, seorang pedagang buah membeli 15 peti jeruk dengan harga Rp180.000 per peti. Setiap peti berisi 20 kg jeruk. Berapa harga beli jeruk per kilogram?",
            options: [
              { key: "A", text: "Rp7.500" },
              { key: "B", text: "Rp9.000" },
              { key: "C", text: "Rp10.500" },
              { key: "D", text: "Rp12.000" },
            ],
            correct_answer: "B",
            explanation:
              "Total berat = 15 peti × 20 kg = 300 kg. Total harga = 15 × Rp180.000 = Rp2.700.000. Harga per kg = Rp2.700.000 ÷ 300 kg = Rp9.000.",
          });
          setIsProcessing(false);
        }, 1200);
        return;
      }

      // Image Vision OCR
      let base64 = "";
      const mimeType = selectedFile ? selectedFile.type : "image/jpeg";

      if (selectedFile) {
        const reader = new FileReader();
        base64 = await new Promise((resolve) => {
          reader.onloadend = () => {
            const result = reader.result as string;
            resolve(result.split(",")[1]);
          };
          reader.readAsDataURL(selectedFile);
        });
      }

      const result = await geminiProvider.scanQuestionImage(base64, mimeType);
      setExtractedData({
        question_text: result.question_text,
        options: result.options || [],
        correct_answer: result.correct_answer,
        explanation: result.explanation,
      });
    } catch (err) {
      console.error("Scan processing error:", err);
    } finally {
      if (!isPdfMode) {
        setIsProcessing(false);
      }
    }
  };

  const handleProceedToContext = () => {
    if (!extractedData || !activeSchool) return;

    const teacher = repository.getCurrentUser();
    const saved = repository.saveQuestion({
      school_id: activeSchool.id,
      teacher_id: teacher.id,
      subject: "Matematika",
      grade: 5,
      topic: isPdfMode ? "Aritmetika Sosial (Ekstraksi Naskah PDF)" : "Aritmetika Sosial (Hasil Vision OCR)",
      type: "multiple_choice",
      question_text: extractedData.question_text,
      options: extractedData.options,
      correct_answer: extractedData.correct_answer,
      explanation: extractedData.explanation,
      is_contextualized: false,
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
                      <span>Ekstraksi Teks dengan {isPdfMode ? "Document Parser" : "Gemini Vision"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Quick Demo Simulator if user has no file */}
          {!selectedFile && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  if (isPdfMode) {
                    setSelectedFile(new File(["dummy"], "Bank_Soal_Aritmetika_Kelas5.pdf", { type: "application/pdf" }));
                  } else {
                    setPreviewUrl("/window.svg");
                    setSelectedFile(new File(["dummy"], "lembar_soal_aritmetika.jpg", { type: "image/jpeg" }));
                  }
                  handleProcessScan();
                }}
                className="text-xs text-[#51465B] underline font-semibold"
              >
                Gunakan Contoh {isPdfMode ? "PDF Soal Latihan" : "Foto Naskah Soal"} untuk Simulasi Cepat
              </button>
            </div>
          )}
        </div>

        {/* Extracted Data Card */}
        {extractedData && (
          <div className="bg-white rounded-[28px] sm:rounded-[36px] border border-emerald-200 shadow-md p-6 sm:p-8 space-y-4 animate-in fade-in">
            <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Naskah Butir Soal Berhasil Diekstraksi!</span>
            </div>

            <div>
              <label className="font-bold text-[#23212A] block mb-1 text-xs">
                Pertanyaan Soal Hasil Ekstraksi
              </label>
              <textarea
                rows={3}
                value={extractedData.question_text}
                onChange={(e) =>
                  setExtractedData({ ...extractedData, question_text: e.target.value })
                }
                className="w-full p-3.5 rounded-xl border border-[#E9E5E8] bg-[#FAF7F3] text-xs font-medium text-[#23212A] focus:outline-none focus:ring-2 focus:ring-[#51465B]/20 leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {extractedData.options.map((opt, i) => (
                <div key={opt.key} className="flex items-center gap-2 text-xs">
                  <span className="font-black w-6 text-center text-[#51465B] bg-[#FAF7F3] py-1.5 rounded-lg border border-[#E9E5E8]">
                    {opt.key}
                  </span>
                  <input
                    type="text"
                    value={opt.text}
                    onChange={(e) => {
                      const newOpts = [...extractedData.options];
                      newOpts[i].text = e.target.value;
                      setExtractedData({ ...extractedData, options: newOpts });
                    }}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-[#E9E5E8] bg-white text-xs font-medium text-[#23212A]"
                  />
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[#E9E5E8] flex justify-end">
              <button
                type="button"
                onClick={handleProceedToContext}
                className="px-6 py-3 rounded-2xl bg-[#51465B] hover:bg-[#3E3547] text-white font-black text-xs shadow-md flex items-center gap-2 transition-transform active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-[#FFD36D]" />
                <span>Simpan & Lanjutkan ke Kontekstualisasi {activeSchool?.region_name}</span>
                <ArrowRight className="w-4 h-4" />
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
