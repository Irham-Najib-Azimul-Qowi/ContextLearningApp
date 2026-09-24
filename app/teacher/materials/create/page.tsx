"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TeacherWorkspaceShell } from "@/components/layout/teacher-workspace-shell";
import { repository } from "@/lib/db/repository";
import { ClassRoom } from "@/lib/db/types";
import {
  BookOpen,
  ArrowLeft,
  Sparkles,
  Bot,
  PenTool,
  Upload,
  CheckCircle,
  MapPin,
  RefreshCw,
  Eye,
  Check,
  Building,
} from "lucide-react";

export default function CreateMaterialPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [activeTab, setActiveTab] = useState<"ai" | "manual" | "upload">("ai");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isContextualizing, setIsContextualizing] = useState<boolean>(false);

  // Form Fields
  const [subject, setSubject] = useState<string>("IPS");
  const [grade, setGrade] = useState<number>(5);
  const [title, setTitle] = useState<string>("");
  const [topic, setTopic] = useState<string>("Kegiatan Ekonomi & Pengelolaan Sumber Daya Alam");
  const [learningObjectives, setLearningObjectives] = useState<string>(
    "Siswa mampu mengidentifikasi bentang alam dan mata pencaharian masyarakat di sekitarnya."
  );
  const [targetRegion, setTargetRegion] = useState<string>("Kabupaten Ponorogo");
  const [targetDistrict, setTargetDistrict] = useState<string>("Kecamatan Pudak");

  // Content state
  const [originalContent, setOriginalContent] = useState<string>("");
  const [contextualContent, setContextualContent] = useState<string>("");
  const [localEntitiesAdded, setLocalEntitiesAdded] = useState<
    { entity: string; category: string; description: string }[]
  >([]);

  // Selected classes to publish
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [previewMode, setPreviewMode] = useState<boolean>(false);

  useEffect(() => {
    const school = repository.getActiveSchool();
    const clss = repository.getClasses(school.id);
    setClasses(clss);
    if (clss.length > 0) {
      setSelectedClasses([clss[0].id]);
    }
  }, []);

  const handleGenerateAI = async () => {
    setIsProcessing(true);
    // Simulate generation or call Gemini
    setTimeout(() => {
      const generatedTitle = `Kearifan Pengelolaan Sumber Daya Alam di ${targetRegion}`;
      const rawStandard =
        "Kegiatan ekonomi masyarakat di Indonesia sangat beragam tergantung pada bentang alamnya. Masyarakat di daerah pegunungan biasanya bekerja sebagai petani sayur dan peternak sapi perah. Sementara di daerah perbukitan, masyarakat menanam berbagai komoditas bernilai tinggi. Di pasar tradisional, hasil panen tersebut dijual dan didistribusikan untuk memenuhi kebutuhan masyarakat luas.";

      const localized =
        `Kegiatan ekonomi masyarakat di ${targetRegion} sangat dipengaruhi oleh kondisi alamnya. Di dataran tinggi seperti ${targetDistrict}, udara sejuk mendukung peternakan sapi perah penghasil susu segar berkualitas tinggi serta sayuran segar. Selain itu, petani di Ponorogo giat membudidayakan tanaman porang yang kini menjadi komoditas ekspor unggulan. Di Pasar Legi Ponorogo, hasil-hasil panen pertanian dan peternakan tersebut dipasarkan untuk mendorong perputaran roda ekonomi daerah.`;

      setTitle(generatedTitle);
      setOriginalContent(rawStandard);
      setContextualContent(localized);
      setLocalEntitiesAdded([
        {
          entity: "Kecamatan Pudak",
          category: "Geografis & Peternakan",
          description: "Sentra peternakan sapi perah dan agrowisata dataran tinggi Ponorogo",
        },
        {
          entity: "Porang",
          category: "Komoditas Unggulan",
          description: "Tanaman umbi bernilai ekonomi tinggi untuk pasar ekspor",
        },
        {
          entity: "Pasar Legi Ponorogo",
          category: "Pusat Perdagangan",
          description: "Pusat distribusi komoditas rakyat di pusat Kabupaten Ponorogo",
        },
      ]);

      setIsProcessing(false);
      setPreviewMode(true);
    }, 1200);
  };

  const handleAnalyzeManual = () => {
    if (!originalContent.trim()) return;
    setIsContextualizing(true);
    setTimeout(() => {
      // Contextualize the manual content
      let localized = originalContent;
      if (localized.toLowerCase().includes("pasar")) {
        localized = localized.replace(/pasar(?:\s+kota|\s+tradisional)?/gi, "Pasar Legi Ponorogo");
      }
      if (localized.toLowerCase().includes("petani") || localized.toLowerCase().includes("beras")) {
        localized = localized.replace(/padi|beras/gi, "porang dan padi lokal");
      }
      localized += ` (Diselaraskan dengan karakteristik bentang alam dan kearifan ekonomi lokal ${targetRegion}).`;

      setContextualContent(localized);
      setLocalEntitiesAdded([
        {
          entity: "Pasar Legi & Pertanian Ponorogo",
          category: "Konteks Lokal",
          description: "Penyesuaian istilah pasar umum ke pusat aktivitas ekonomi nyata di Ponorogo.",
        },
      ]);
      setIsContextualizing(false);
      setPreviewMode(true);
    }, 1000);
  };

  const handleSaveAndPublish = () => {
    const school = repository.getActiveSchool();
    const finalContent = contextualContent || originalContent;
    if (!title.trim() || !finalContent.trim()) {
      alert("Harap lengkapi judul dan isi materi pembelajaran.");
      return;
    }

    repository.saveMaterial({
      school_id: school.id,
      teacher_id: "usr-teacher-01",
      title: title.trim(),
      subject: subject,
      grade: grade,
      content: finalContent,
      is_contextualized: !!contextualContent,
      original_content: originalContent || undefined,
      published_to_classes: selectedClasses,
    });

    router.push("/teacher/materials");
  };

  return (
    <TeacherWorkspaceShell>
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Back Link & Header */}
        <div>
          <Link
            href="/teacher/materials"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Daftar Materi
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Penyusunan Materi Kontekstual
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Kembangkan materi pembelajaran SD yang diselaraskan dengan kearifan lokal wilayah Karesidenan Madiun.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                Target: {targetRegion}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-white px-3 pt-2 rounded-t-xl border">
          <button
            onClick={() => {
              setActiveTab("ai");
              setPreviewMode(false);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === "ai"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Generate dengan AI</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("manual");
              setPreviewMode(false);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === "manual"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <PenTool className="w-4 h-4" />
            <span>Tulis / Input Manual</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("upload");
              setPreviewMode(false);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === "upload"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Naskah Teks</span>
          </button>
        </div>

        {/* Configuration / Form Body */}
        <div className="bg-white p-6 rounded-b-xl border border-t-0 border-slate-200 shadow-xs space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Mata Pelajaran
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="IPS">IPS (Ilmu Pengetahuan Sosial)</option>
                <option value="Matematika">Matematika</option>
                <option value="Bahasa Indonesia">Bahasa Indonesia</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tingkat Kelas SD
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {[1, 2, 3, 4, 5, 6].map((g) => (
                  <option key={g} value={g}>
                    Kelas {g} SD
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Wilayah Konteks Lokal
              </label>
              <select
                value={targetRegion}
                onChange={(e) => setTargetRegion(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="Kabupaten Ponorogo">Kabupaten Ponorogo</option>
                <option value="Kota Madiun">Kota Madiun</option>
                <option value="Kabupaten Magetan">Kabupaten Magetan</option>
                <option value="Kabupaten Ngawi">Kabupaten Ngawi</option>
                <option value="Kabupaten Pacitan">Kabupaten Pacitan</option>
              </select>
            </div>
          </div>

          {/* AI TAB */}
          {activeTab === "ai" && (
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Topik / Materi Pokok
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Contoh: Bentang alam & kegiatan ekonomi"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Kecamatan / Sub-wilayah Khusus (Opsional)
                  </label>
                  <input
                    type="text"
                    value={targetDistrict}
                    onChange={(e) => setTargetDistrict(e.target.value)}
                    placeholder="Contoh: Kecamatan Pudak, Ngebel, atau Jetis"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tujuan Pembelajaran (Alur Tujuan Pembelajaran / Capaian Pembelajaran)
                </label>
                <textarea
                  rows={2}
                  value={learningObjectives}
                  onChange={(e) => setLearningObjectives(e.target.value)}
                  placeholder="Deskripsikan kompetensi atau pemahaman yang ingin dicapai siswa..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={handleGenerateAI}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-all"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sedang Merumuskan Materi Kontekstual...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Materi Kontekstual Sekarang</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* MANUAL TAB */}
          {activeTab === "manual" && (
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Judul Materi Pembelajaran
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Mengenal Kegiatan Ekonomi di Lingkungan Sekitar"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Isi Naskah Materi (Standar atau Bebas)
                </label>
                <textarea
                  rows={6}
                  value={originalContent}
                  onChange={(e) => setOriginalContent(e.target.value)}
                  placeholder="Tuliskan naskah pengantar atau materi ajar di sini..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAnalyzeManual}
                  disabled={isContextualizing || !originalContent.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold disabled:opacity-50 transition-all"
                >
                  {isContextualizing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Menganalisis Entitas Lokal...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Analisis Konteks Lokal ({targetRegion})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* UPLOAD TAB */}
          {activeTab === "upload" && (
            <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl text-center space-y-3">
              <Upload className="w-8 h-8 text-slate-400 mx-auto" />
              <div>
                <div className="text-xs font-semibold text-slate-800">
                  Unggah Dokumen Ringkasan atau Naskah Pelajaran
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Mendukung file teks (.txt, .md). Dokumen akan dianalisis untuk pengayaan konteks wilayah.
                </div>
              </div>
              <input
                type="file"
                accept=".txt,.md"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const text = event.target?.result as string;
                      setTitle(file.name.replace(/\.[^/.]+$/, ""));
                      setOriginalContent(text);
                      setActiveTab("manual");
                    };
                    reader.readAsText(file);
                  }
                }}
                className="text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Side-by-Side Contextual Preview & Approval */}
        {previewMode && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <CheckCircle className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Review Hasil Kontekstualisasi Materi
                  </h3>
                  <p className="text-xs text-slate-500">
                    Bandingkan naskah standar dengan penyesuaian kearifan lokal wilayah {targetRegion}.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewMode(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Edit Konfigurasi
                </button>
              </div>
            </div>

            {/* Local Entities Extracted Badge List */}
            {localEntitiesAdded.length > 0 && (
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  Konteks Wilayah yang Disisipkan
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {localEntitiesAdded.map((ent, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-3 rounded-lg border border-slate-200 text-xs shadow-2xs"
                    >
                      <div className="font-bold text-indigo-900">{ent.entity}</div>
                      <div className="text-[11px] text-indigo-600 font-medium mb-1">
                        {ent.category}
                      </div>
                      <div className="text-[11px] text-slate-600 leading-snug">
                        {ent.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Side-by-Side Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Materi Standar / Asli
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                    Umum
                  </span>
                </div>
                <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {originalContent || "(Tidak ada naskah pembanding)"}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Materi Kontekstual ({targetRegion})
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                    Rekomendasi Siap Ajar
                  </span>
                </div>
                <textarea
                  rows={7}
                  value={contextualContent}
                  onChange={(e) => setContextualContent(e.target.value)}
                  className="w-full p-2.5 bg-white border border-emerald-200 rounded-lg text-xs text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                />
              </div>
            </div>

            {/* Distribution Selection & Final CTA */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="block text-xs font-semibold text-slate-700 mb-1">
                  Publikasikan langsung ke Kelas:
                </span>
                <div className="flex flex-wrap gap-2">
                  {classes.map((cls) => {
                    const isSelected = selectedClasses.includes(cls.id);
                    return (
                      <button
                        key={cls.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedClasses(selectedClasses.filter((id) => id !== cls.id));
                          } else {
                            setSelectedClasses([...selectedClasses, cls.id]);
                          }
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                          isSelected
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        <span>{cls.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleSaveAndPublish}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs hover:shadow transition-all"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Simpan & Publikasikan Materi</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </TeacherWorkspaceShell>
  );
}
