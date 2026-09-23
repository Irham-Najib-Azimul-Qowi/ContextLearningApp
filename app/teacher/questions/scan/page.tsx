"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import { TeacherWorkspaceShell } from "@/components/layout/teacher-workspace-shell";
import { repository } from "@/lib/db/repository";
import { geminiProvider } from "@/lib/ai/gemini-provider";
import { School } from "@/lib/db/types";

export default function ScanQuestionPage() {
  const router = useRouter();
  const [activeSchool, setActiveSchool] = useState<School | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [extractedData, setExtractedData] = useState<{
    question_text: string;
    options: { key: string; text: string }[];
    correct_answer: string;
    explanation: string;
  } | null>(null);

  useEffect(() => {
    setActiveSchool(repository.getActiveSchool());
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setExtractedData(null);
    }
  };

  const handleProcessScan = async () => {
    setIsProcessing(true);

    try {
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
      setIsProcessing(false);
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
      topic: "Aritmetika Sosial (Hasil Scan OCR)",
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
      {/* Back button */}
      <div className="flex items-center gap-2 mb-6">
        <Link
          href="/teacher/questions"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Bank Soal</span>
        </Link>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950">
                Pindai Foto Lembar Soal (Vision OCR)
              </h1>
              <p className="text-xs text-slate-500">
                Ekstrak naskah soal fisik dari gambar kamera dan adaptasi ke konteks {activeSchool?.region_name}
              </p>
            </div>
          </div>
        </div>

        {/* Upload Zone */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs mb-6">
          <label className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-400 hover:bg-slate-50/50 transition-all block">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <span className="font-bold text-slate-900 text-sm block">
              Pilih Foto Lembar Soal atau Ambil dari Kamera
            </span>
            <span className="text-xs text-slate-500 mt-1 block">
              Mendukung format JPG, PNG, atau WebP (Maks. 5 MB)
            </span>
          </label>

          {/* Image Preview & Process Button */}
          {previewUrl && (
            <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-4">
              <img
                src={previewUrl}
                alt="Pratinjau lembar soal"
                className="w-32 h-32 object-cover rounded-xl border border-slate-200 shrink-0"
              />
              <div className="flex-1 text-xs">
                <span className="font-semibold text-slate-800 block">File Terpilih:</span>
                <span className="text-slate-500 font-mono block mb-3">{selectedFile?.name}</span>
                <button
                  type="button"
                  onClick={handleProcessScan}
                  disabled={isProcessing}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs flex items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sedang Membaca Gambar dengan Gemini Vision...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Ekstraksi Teks dengan Gemini Vision</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Quick Demo Simulator if user has no file */}
          {!previewUrl && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setPreviewUrl("/window.svg");
                  handleProcessScan();
                }}
                className="text-xs text-indigo-600 hover:underline font-semibold"
              >
                Gunakan Contoh Foto Soal Latihan Ponorogo untuk Simulasi
              </button>
            </div>
          )}
        </div>

        {/* Extracted Data Card */}
        {extractedData && (
          <div className="bg-white rounded-3xl border border-emerald-200 shadow-xs p-6 sm:p-8 space-y-4 animate-in fade-in">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Naskah Soal Berhasil Diekstraksi!</span>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1 text-xs">Teks Soal Hasil OCR</label>
              <textarea
                rows={3}
                value={extractedData.question_text}
                onChange={(e) =>
                  setExtractedData({ ...extractedData, question_text: e.target.value })
                }
                className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              {extractedData.options.map((opt, i) => (
                <div key={opt.key} className="flex items-center gap-2 text-xs">
                  <span className="font-bold w-6 text-center text-slate-500">{opt.key}</span>
                  <input
                    type="text"
                    value={opt.text}
                    onChange={(e) => {
                      const newOpts = [...extractedData.options];
                      newOpts[i].text = e.target.value;
                      setExtractedData({ ...extractedData, options: newOpts });
                    }}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200"
                  />
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={handleProceedToContext}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-xs flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Simpan & Lanjutkan ke Kontekstualisasi Ponorogo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </TeacherWorkspaceShell>
  );
}
