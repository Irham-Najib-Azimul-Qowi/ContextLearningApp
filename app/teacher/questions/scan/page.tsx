"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/navbar";
import Container from "@/components/ui/container";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Camera,
  Upload,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileImage,
} from "lucide-react";
import { repository } from "@/lib/db/repository";
import { QuestionSubject, QuestionType } from "@/lib/db/types";

export default function ScanQuestionPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Editable fields after extraction
  const [subject, setSubject] = useState<QuestionSubject>("Matematika");
  const [grade, setGrade] = useState("5");
  const [topic, setTopic] = useState("Aritmetika Kontekstual");
  const [extractedText, setExtractedText] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Harap unggah file gambar (JPG, PNG, atau WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Ukuran gambar maksimal adalah 5 MB.");
      return;
    }

    setErrorMsg("");
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      const base64Data = result.split(",")[1];
      setImageBase64(base64Data);
    };
    reader.readAsDataURL(file);
  };

  const handleProcessImage = async () => {
    if (!imageBase64) return;
    setIsProcessing(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/questions/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64,
          mimeType: "image/jpeg",
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Gagal memproses gambar.");
      }

      const extracted = data.data;
      setExtractedData(extracted);
      setExtractedText(extracted.extracted_text);
      if (extracted.subject_guess) setSubject(extracted.subject_guess);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Gagal mengekstrak teks dari gambar.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveQuestion = () => {
    if (!extractedText.trim()) return;

    const newQ = repository.createQuestion({
      teacher_id: "teacher-demo-01",
      subject,
      grade: Number(grade),
      topic: topic || "Soal Hasil Scan Gambar",
      learning_objective: "Memahami soal pembelajaran dari bahan ajar cetak",
      question_type: extractedData?.question_type || "multiple_choice",
      difficulty: "medium",
      original_text: extractedText,
      context_variables: extractedData?.detected_variables || [],
      options: extractedData?.options || [
        { id: "A", text: "20 kg" },
        { id: "B", text: "25 kg" },
        { id: "C", text: "30 kg" },
        { id: "D", text: "35 kg" },
      ],
      correct_answer: extractedData?.suggested_answer || "B",
      explanation: "Diekstrak secara otomatis melalui pemindaian multimodal lembar cetak.",
      is_approved: true,
      source: "scanned_image",
    });

    router.push(`/teacher/questions/context-preview?question_id=${newQ.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <Container className="py-8 sm:py-10">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary">Multimodal OCR & Vision</Badge>
            <span className="text-xs text-muted">Pemindaian Lembar Soal Cetak / Buku Guru</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Pindai Soal dari Foto Lembar Kerja
          </h1>
          <p className="text-sm text-muted mt-1">
            Unggah foto lembar soal fisik atau materi cetak untuk didigitalkan dan diekstraksi variabel kontekstualnya.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload and Preview Column */}
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Camera className="h-4 w-4 text-primary" /> Unggah Foto Lembar Soal
              </CardTitle>
            </CardHeader>

            <CardContent className="p-4 pt-0 space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {!imagePreview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-slate-50/50 transition-all min-h-[260px]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-primary mb-3">
                    <Upload className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">
                    Klik untuk Memilih Foto Soal
                  </h3>
                  <p className="text-xs text-muted mt-1 max-w-xs">
                    Format yang didukung: JPG, PNG, WebP (Maksimal 5 MB).
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-2xl overflow-hidden border border-border bg-slate-950/5 max-h-[360px] flex items-center justify-center">
                    <img
                      src={imagePreview}
                      alt="Pratinjau Lembar Soal"
                      className="max-h-[360px] w-auto object-contain"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Ganti Foto
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleProcessImage}
                      isLoading={isProcessing}
                      className="shadow-xs"
                    >
                      <Sparkles className="h-4 w-4 mr-1" /> Ekstrak Teks & Variabel
                    </Button>
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 text-xs text-error font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {errorMsg}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Extraction Result Column */}
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" /> Hasil Ekstraksi & Konfirmasi Guru
              </CardTitle>
            </CardHeader>

            <CardContent className="p-4 pt-0 space-y-4">
              {!extractedData ? (
                <div className="py-16 text-center text-xs text-muted">
                  Unggah gambar dan klik &quot;Ekstrak Teks &amp; Variabel&quot; untuk melihat hasil digitalisasi.
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                        Mata Pelajaran
                      </label>
                      <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value as QuestionSubject)}
                        className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="Matematika">Matematika</option>
                        <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                        <option value="IPS">IPS</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                        Kelas
                      </label>
                      <select
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        {[1, 2, 3, 4, 5, 6].map((g) => (
                          <option key={g} value={g}>
                            Kelas {g} SD
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <Input
                    label="Topik Soal"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                      Teks Hasil Ekstraksi (Dapat Diedit)
                    </label>
                    <textarea
                      rows={4}
                      value={extractedText}
                      onChange={(e) => setExtractedText(e.target.value)}
                      className="w-full rounded-xl border border-border bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {extractedData.detected_variables && (
                    <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 space-y-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-primary block">
                        Variabel Kontekstual Ditemukan dari Lembar Cetak:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {extractedData.detected_variables.map((v: any) => (
                          <span
                            key={v.key}
                            className="px-2 py-0.5 rounded-md bg-white border border-indigo-200 text-xs font-mono font-bold text-primary"
                          >
                            [{v.key}]
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-border/60 flex items-center justify-end">
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleSaveQuestion}
                      className="shadow-xs"
                    >
                      Simpan &amp; Uji Kontekstualisasi <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  );
}
