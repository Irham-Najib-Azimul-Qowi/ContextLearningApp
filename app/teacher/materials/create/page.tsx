"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { TeacherWorkspaceShell } from "@/components/layout/teacher-workspace-shell";
import { repository } from "@/lib/db/repository";
import { ClassRoom } from "@/lib/db/types";
import { ContextualProgress } from "@/components/context/contextual-progress";
import {
  BookOpen,
  ArrowLeft,
  Sparkles,
  Bot,
  PenTool,
  Upload,
  Camera,
  FileText,
  CheckCircle,
  MapPin,
  RefreshCw,
  Eye,
  Check,
  Building,
  Printer,
  Share2,
  AlertCircle,
  FileCheck,
} from "lucide-react";

const REGION_OPTIONS = [
  { id: "35.77", name: "Kota Madiun", desc: "Kota Pendekar & Sentra Industri Kereta Api (INKA)" },
  { id: "35.19", name: "Kabupaten Madiun", desc: "Sentra Kampung Pesilat & Agrikultur Caruban" },
  { id: "35.21", name: "Kabupaten Ngawi", desc: "Benteng Pendem Van den Bosch & Lumbung Padi Jawa Timur" },
  { id: "35.20", name: "Kabupaten Magetan", desc: "Telaga Sarangan, Kerajinan Kulit & Agrowisata Lereng Lawu" },
  { id: "35.02", name: "Kabupaten Ponorogo", desc: "Bumi Reog, Sentra Porang & Peternakan Sapi Perah Pudak" },
  { id: "35.01", name: "Kabupaten Pacitan", desc: "Kota 1001 Goa, Kawasan Geopark Gunung Sewu & Pesisir Pantai" },
  { id: "33.74", name: "Kota Semarang", desc: "Ibu Kota Jawa Tengah, Kota Lama, Lawang Sewu & Kawasan Pesisir Tanjung Emas" },
];

function CreateMaterialContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as "ai" | "manual" | "pdf" | "photo" | null;

  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [activeTab, setActiveTab] = useState<"ai" | "manual" | "pdf" | "photo">(
    tabParam && ["ai", "manual", "pdf", "photo"].includes(tabParam) ? tabParam : "ai"
  );

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

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
  const [showStudentPreviewModal, setShowStudentPreviewModal] = useState<boolean>(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const school = repository.getActiveSchool();
    const clss = repository.getClasses(school.id);
    setClasses(clss);
    if (clss.length > 0) {
      setSelectedClasses([clss[0].id]);
    }
    // sync default region with active school if found
    if (school?.region_name) {
      const match = REGION_OPTIONS.find((r) => r.name.toLowerCase().includes(school.region_name.toLowerCase()));
      if (match) {
        setTargetRegion(match.name);
      }
    }
  }, []);

  const triggerStepProgress = (onComplete: () => void) => {
    setIsProcessing(true);
    setCurrentStepIndex(0);

    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      if (step < 6) {
        setCurrentStepIndex(step);
      } else {
        clearInterval(interval);
        setIsProcessing(false);
        onComplete();
      }
    }, 450);
  };

  const handleGenerateAI = () => {
    triggerStepProgress(() => {
      const generatedTitle = `Kearifan Pengelolaan Sumber Daya Alam di ${targetRegion}`;
      let rawStandard = "";
      let localized = "";
      let entities = [];

      if (targetRegion.includes("Semarang")) {
        rawStandard =
          "Masyarakat di daerah dataran rendah dan pesisir melakukan berbagai aktivitas ekonomi perdagangan dan pelabuhan. Di pusat kota, terdapat banyak pusat perniagaan serta peninggalan bangunan bersejarah yang menarik wisatawan.";
        localized =
          `Di ${targetRegion} (Kode Wilayah 33.74), kegiatan ekonomi sangat dipengaruhi oleh posisi strategisnya sebagai kota metropolitan pelabuhan. Kawasan Pelabuhan Tanjung Emas menjadi pusat bongkar muat barang industri, sementara kawasan cagar budaya Kota Lama Semarang menjadi denyut pariwisata ekonomi kreatif. Siswa kelas 5 SD dapat mengamati bagaimana sungai Banjir Kanal Barat berfungsi mengalirkan air perkotaan agar terhindar dari banjir rob.`;
        entities = [
          { entity: "Pelabuhan Tanjung Emas", category: "Infrastruktur & Perdagangan", description: "Pusat logistik maritim internasional Kota Semarang" },
          { entity: "Kota Lama Semarang", category: "Warisan Sejarah & Wisata", description: "Sentra ekonomi kreatif 'Little Netherland' bersejarah" },
          { entity: "Sungai Banjir Kanal Barat", category: "Geografi Perkotaan", description: "Infrastruktur pengendali aliran air dan ruang terbuka hijau" },
        ];
      } else {
        rawStandard =
          "Kegiatan ekonomi masyarakat di Indonesia sangat beragam tergantung pada bentang alamnya. Masyarakat di daerah pegunungan biasanya bekerja sebagai petani sayur dan peternak sapi perah. Sementara di daerah perbukitan, masyarakat menanam berbagai komoditas bernilai tinggi. Di pasar tradisional, hasil panen tersebut dijual dan didistribusikan.";
        localized =
          `Kegiatan ekonomi masyarakat di ${targetRegion} sangat dipengaruhi oleh kondisi alamnya. Di dataran tinggi seperti ${targetDistrict || "Kecamatan Pudak"}, udara sejuk mendukung peternakan sapi perah penghasil susu segar berkualitas tinggi serta sayuran segar. Selain itu, petani giat membudidayakan tanaman porang yang kini menjadi komoditas ekspor unggulan. Di pasar rakyat terdekat, hasil panen tersebut dipasarkan untuk mendorong perputaran roda ekonomi daerah.`;
        entities = [
          { entity: targetDistrict || "Kecamatan Pudak", category: "Geografis & Peternakan", description: `Sentra agrowisata dan produksi susu dataran tinggi ${targetRegion}` },
          { entity: "Tanaman Porang", category: "Komoditas Unggulan", description: "Komoditas umbi bernilai ekonomi tinggi untuk pasar ekspor" },
          { entity: "Pasar Tradisional Daerah", category: "Pusat Perdagangan", description: "Sentra transaksi komoditas pangan masyarakat lokal" },
        ];
      }

      setTitle(generatedTitle);
      setOriginalContent(rawStandard);
      setContextualContent(localized);
      setLocalEntitiesAdded(entities);
      setPreviewMode(true);
    });
  };

  const handleAnalyzeManualOrUploaded = (textToAnalyze: string, customTitle?: string) => {
    if (!textToAnalyze.trim()) return;

    triggerStepProgress(() => {
      let localized = textToAnalyze;
      if (localized.toLowerCase().includes("pasar")) {
        localized = localized.replace(/pasar(?:\s+kota|\s+tradisional)?/gi, `Pasar Rakyat ${targetRegion}`);
      }
      if (localized.toLowerCase().includes("petani") || localized.toLowerCase().includes("beras")) {
        localized = localized.replace(/padi|beras/gi, "porang dan tanaman pangan lokal");
      }
      localized += `\n\n(Materi ini telah diperkaya dengan konteks bentang alam dan kearifan ekonomi nyata di ${targetRegion}).`;

      if (customTitle && !title) {
        setTitle(customTitle);
      }
      setOriginalContent(textToAnalyze);
      setContextualContent(localized);
      setLocalEntitiesAdded([
        {
          entity: `${targetRegion} & Agrikultur Lokal`,
          category: "Konteks Wilayah Terpilih",
          description: `Penyesuaian istilah umum menuju aktivitas nyata yang dapat diamati siswa Kelas 5 di ${targetRegion}.`,
        },
      ]);
      setPreviewMode(true);
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const mockPdfText =
      `PENGANTAR ILMU PENGETAHUAN SOSIAL KELAS 5 SD\nBab 3: Interaksi Manusia dengan Lingkungan Alam dan Sosial\n\nManusia senantiasa berinteraksi dengan lingkungan hidupnya untuk memenuhi kebutuhan harian. Bentang alam seperti pegunungan, perbukitan, dataran rendah, serta pesisir pantai melahirkan ragam mata pencaharian yang khas. Pada daerah dataran tinggi, masyarakat banyak membudidayakan sayur-mayur dan ternak, sedangkan di kawasan dataran rendah masyarakat aktif dalam kegiatan perniagaan dan perdagangan umum.`;

    const cleanTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    setTitle(`Materi Ajar: ${cleanTitle}`);
    setOriginalContent(mockPdfText);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoPreviewUrl(URL.createObjectURL(file));
    setUploadedFileName(file.name);

    const mockOcrText =
      `HASIL VISION OCR BUKU TEMATIK KELAS 5\nTema: Usaha Ekonomi yang Dikelola Sendiri dan Kelompok\n\nUsaha ekonomi masyarakat terbagi menjadi usaha perseorangan dan kelompok. Contoh usaha perseorangan antara lain pertanian skala keluarga, industri kerajinan rakyat, dan pedagang keliling. Hasil panen pertanian biasanya dijual kepada para pengepul atau dibawa langsung ke pasar desa.`;

    setTitle("Materi Buku Siswa (Hasil Scan Kamera)");
    setOriginalContent(mockOcrText);
  };

  const handleSaveAndPublish = (asDraft: boolean = false) => {
    const school = repository.getActiveSchool();
    const finalContent = contextualContent || originalContent;
    if (!title.trim() || !finalContent.trim()) {
      alert("Harap lengkapi judul dan naskah materi pembelajaran.");
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
      published_to_classes: asDraft ? [] : selectedClasses,
    });

    router.push("/teacher/materials");
  };

  return (
    <TeacherWorkspaceShell activeGroupId="materials">
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Back Link & Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/teacher/materials/new"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#756F7A] hover:text-[#23212A] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Pilih Metode Input Lain</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1 rounded-full bg-[#51465B] text-[#FFD36D] text-xs font-bold flex items-center gap-1.5 shadow-xs">
              <MapPin className="w-3.5 h-3.5 text-[#F47D83]" />
              <span>Wilayah: {targetRegion}</span>
            </span>
          </div>
        </div>

        {/* Step Progress Overlay when Processing */}
        {isProcessing && (
          <div className="py-6">
            <ContextualProgress
              currentStepIndex={currentStepIndex}
              regionName={targetRegion}
              title="Contextual AI Engine Menyelaraskan Materi Ajar"
            />
          </div>
        )}

        {!isProcessing && !previewMode && (
          <>
            {/* Page Title Card */}
            <div className="bg-white rounded-[28px] sm:rounded-[36px] border border-[#E9E5E8] p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-[#51465B] text-[#FFD36D] flex items-center justify-center shadow-xs">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-[#23212A] tracking-tight">
                    Studio Penyusunan Materi Kontekstual
                  </h1>
                  <p className="text-xs text-[#756F7A]">
                    Pilih metode input materi, sesuaikan sasaran wilayah, dan adaptasikan konten ajar SD Kelas 5 berbasis kearifan lokal.
                  </p>
                </div>
              </div>

              {/* 4 Input Method Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-6 mt-6 border-t border-[#E9E5E8]">
                <button
                  type="button"
                  onClick={() => setActiveTab("ai")}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-[18px] text-xs font-bold transition-all border ${
                    activeTab === "ai"
                      ? "bg-[#51465B] text-white border-[#51465B] shadow-md"
                      : "bg-[#FAF7F3] text-[#756F7A] border-[#E9E5E8] hover:bg-slate-100"
                  }`}
                >
                  <Bot className={`w-5 h-5 mb-1.5 ${activeTab === "ai" ? "text-[#FFD36D]" : "text-[#51465B]"}`} />
                  <span>Generate dengan AI</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("manual")}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-[18px] text-xs font-bold transition-all border ${
                    activeTab === "manual"
                      ? "bg-[#51465B] text-white border-[#51465B] shadow-md"
                      : "bg-[#FAF7F3] text-[#756F7A] border-[#E9E5E8] hover:bg-slate-100"
                  }`}
                >
                  <PenTool className={`w-5 h-5 mb-1.5 ${activeTab === "manual" ? "text-[#FFD36D]" : "text-[#51465B]"}`} />
                  <span>Ketik Manual</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("pdf")}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-[18px] text-xs font-bold transition-all border ${
                    activeTab === "pdf"
                      ? "bg-[#51465B] text-white border-[#51465B] shadow-md"
                      : "bg-[#FAF7F3] text-[#756F7A] border-[#E9E5E8] hover:bg-slate-100"
                  }`}
                >
                  <FileText className={`w-5 h-5 mb-1.5 ${activeTab === "pdf" ? "text-[#FFD36D]" : "text-[#51465B]"}`} />
                  <span>Upload PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("photo")}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-[18px] text-xs font-bold transition-all border ${
                    activeTab === "photo"
                      ? "bg-[#51465B] text-white border-[#51465B] shadow-md"
                      : "bg-[#FAF7F3] text-[#756F7A] border-[#E9E5E8] hover:bg-slate-100"
                  }`}
                >
                  <Camera className={`w-5 h-5 mb-1.5 ${activeTab === "photo" ? "text-[#FFD36D]" : "text-[#51465B]"}`} />
                  <span>Ambil Foto / OCR</span>
                </button>
              </div>
            </div>

            {/* Target Settings Card */}
            <div className="bg-white rounded-[28px] sm:rounded-[36px] border border-[#E9E5E8] p-6 sm:p-8 shadow-xs space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#23212A] mb-1.5">
                    Mata Pelajaran
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F3] border border-[#E9E5E8] rounded-xl text-xs font-semibold text-[#23212A] focus:outline-none focus:ring-2 focus:ring-[#51465B]/20"
                  >
                    <option value="IPS">IPS (Ilmu Pengetahuan Sosial)</option>
                    <option value="Matematika">Matematika</option>
                    <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#23212A] mb-1.5">
                    Tingkat Kelas SD
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F3] border border-[#E9E5E8] rounded-xl text-xs font-semibold text-[#23212A] focus:outline-none focus:ring-2 focus:ring-[#51465B]/20"
                  >
                    {[1, 2, 3, 4, 5, 6].map((g) => (
                      <option key={g} value={g}>
                        Kelas {g} SD
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#23212A] mb-1.5">
                    Target Wilayah Kontekstual
                  </label>
                  <select
                    value={targetRegion}
                    onChange={(e) => setTargetRegion(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F3] border border-[#E9E5E8] rounded-xl text-xs font-semibold text-[#23212A] focus:outline-none focus:ring-2 focus:ring-[#51465B]/20"
                  >
                    {REGION_OPTIONS.map((reg) => (
                      <option key={reg.id} value={reg.name}>
                        {reg.name} ({reg.id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* TAB 1: AI GENERATION */}
              {activeTab === "ai" && (
                <div className="space-y-4 pt-4 border-t border-[#E9E5E8]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#23212A] mb-1.5">
                        Topik / Pokok Bahasan
                      </label>
                      <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Contoh: Bentang alam & kegiatan ekonomi"
                        className="w-full px-3.5 py-2.5 bg-[#FAF7F3] border border-[#E9E5E8] rounded-xl text-xs text-[#23212A] font-medium focus:outline-none focus:ring-2 focus:ring-[#51465B]/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#23212A] mb-1.5">
                        Fokus Titik Wilayah / Kecamatan (Opsional)
                      </label>
                      <input
                        type="text"
                        value={targetDistrict}
                        onChange={(e) => setTargetDistrict(e.target.value)}
                        placeholder="Contoh: Kecamatan Pudak, Kota Lama, dsb."
                        className="w-full px-3.5 py-2.5 bg-[#FAF7F3] border border-[#E9E5E8] rounded-xl text-xs text-[#23212A] font-medium focus:outline-none focus:ring-2 focus:ring-[#51465B]/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#23212A] mb-1.5">
                      Tujuan Pembelajaran (Alur Capaian Siswa SD)
                    </label>
                    <textarea
                      rows={2}
                      value={learningObjectives}
                      onChange={(e) => setLearningObjectives(e.target.value)}
                      placeholder="Tuliskan kompetensi atau capaian pembelajaran yang diharapkan..."
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F3] border border-[#E9E5E8] rounded-xl text-xs text-[#23212A] font-medium focus:outline-none focus:ring-2 focus:ring-[#51465B]/20"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleGenerateAI}
                      className="px-6 py-3 rounded-2xl bg-[#51465B] hover:bg-[#3E3547] text-white text-xs font-black shadow-md flex items-center gap-2 transition-transform active:scale-95"
                    >
                      <Sparkles className="w-4 h-4 text-[#FFD36D]" />
                      <span>Generate Materi Kontekstual Sekarang</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: MANUAL TYPING */}
              {activeTab === "manual" && (
                <div className="space-y-4 pt-4 border-t border-[#E9E5E8]">
                  <div>
                    <label className="block text-xs font-bold text-[#23212A] mb-1.5">
                      Judul Materi
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Contoh: Mengenal Kegiatan Ekonomi dan Sumber Daya Alam di Sekitarku"
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F3] border border-[#E9E5E8] rounded-xl text-xs text-[#23212A] font-medium focus:outline-none focus:ring-2 focus:ring-[#51465B]/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#23212A] mb-1.5">
                      Naskah Teks Materi Pelajaran
                    </label>
                    <textarea
                      rows={6}
                      value={originalContent}
                      onChange={(e) => setOriginalContent(e.target.value)}
                      placeholder="Ketik atau tempel naskah materi standar di sini..."
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F3] border border-[#E9E5E8] rounded-xl text-xs text-[#23212A] font-medium focus:outline-none focus:ring-2 focus:ring-[#51465B]/20 leading-relaxed"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleAnalyzeManualOrUploaded(originalContent, title)}
                      disabled={!originalContent.trim()}
                      className="px-6 py-3 rounded-2xl bg-[#51465B] hover:bg-[#3E3547] text-white text-xs font-black shadow-md flex items-center gap-2 disabled:opacity-50 transition-transform active:scale-95"
                    >
                      <Sparkles className="w-4 h-4 text-[#FFD36D]" />
                      <span>Analisis & Selaraskan ke Konteks {targetRegion}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: UPLOAD PDF */}
              {activeTab === "pdf" && (
                <div className="space-y-4 pt-4 border-t border-[#E9E5E8]">
                  <label className="border-2 border-dashed border-[#E9E5E8] hover:border-[#51465B] rounded-[24px] p-8 flex flex-col items-center justify-center text-center cursor-pointer bg-[#FAF7F3]/60 hover:bg-[#FAF7F3] transition-all block">
                    <input
                      type="file"
                      accept=".pdf,.txt,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="w-12 h-12 rounded-2xl bg-[#51465B] text-[#FFD36D] flex items-center justify-center mb-3 shadow-xs">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="font-extrabold text-[#23212A] text-sm block">
                      Klik atau Seret File Dokumen PDF / Modul Ajar
                    </span>
                    <span className="text-xs text-[#756F7A] mt-1 block">
                      Mendukung format PDF, TXT, DOCX (Maksimal 10 MB)
                    </span>
                  </label>

                  {uploadedFileName && (
                    <div className="p-4 rounded-[20px] bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileCheck className="w-6 h-6 text-emerald-600" />
                        <div>
                          <span className="text-xs font-bold text-emerald-950 block">Dokumen Berhasil Diekstraksi:</span>
                          <span className="text-[11px] text-emerald-800 font-mono">{uploadedFileName}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAnalyzeManualOrUploaded(originalContent, title)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                      >
                        Kontekstualkan Naskah PDF
                      </button>
                    </div>
                  )}

                  {!uploadedFileName && (
                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedFileName("Buku_Tematik_Tema_3_Bentang_Alam.pdf");
                          setTitle("Buku Tematik: Bentang Alam & Kegiatan Ekonomi");
                          setOriginalContent(
                            "Bentang alam mempengaruhi corak kehidupan manusia. Di daerah pegunungan, hawa sejuk memungkinkan budidaya perkebunan dan peternakan. Di pasar tradisional, masyarakat berkumpul memperjualbelikan komoditas pertanian."
                          );
                        }}
                        className="text-xs text-[#51465B] underline font-semibold"
                      >
                        Gunakan Contoh PDF Buku Tematik Kelas 5 untuk Simulasi Cepat
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: CAMERA / PHOTO OCR */}
              {activeTab === "photo" && (
                <div className="space-y-4 pt-4 border-t border-[#E9E5E8]">
                  <label className="border-2 border-dashed border-[#E9E5E8] hover:border-[#51465B] rounded-[24px] p-8 flex flex-col items-center justify-center text-center cursor-pointer bg-[#FAF7F3]/60 hover:bg-[#FAF7F3] transition-all block">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <div className="w-12 h-12 rounded-2xl bg-[#51465B] text-[#FFD36D] flex items-center justify-center mb-3 shadow-xs">
                      <Camera className="w-6 h-6" />
                    </div>
                    <span className="font-extrabold text-[#23212A] text-sm block">
                      Ambil Foto Lembar Buku atau Unggah Gambar
                    </span>
                    <span className="text-xs text-[#756F7A] mt-1 block">
                      Gemini Vision OCR akan mengekstrak naskah pelajaran secara otomatis
                    </span>
                  </label>

                  {photoPreviewUrl && (
                    <div className="p-4 rounded-[20px] bg-slate-50 border border-[#E9E5E8] flex flex-col sm:flex-row items-center gap-4">
                      <img
                        src={photoPreviewUrl}
                        alt="Pratinjau Foto"
                        className="w-24 h-24 object-cover rounded-xl border border-slate-200 shrink-0"
                      />
                      <div className="flex-1 text-xs">
                        <span className="font-bold text-[#23212A] block mb-1">Foto Berhasil Dipindai:</span>
                        <p className="text-[#756F7A] text-[11px] line-clamp-2">{originalContent}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAnalyzeManualOrUploaded(originalContent, title)}
                        className="px-4 py-2 rounded-xl bg-[#51465B] hover:bg-[#3E3547] text-white font-bold text-xs shadow-xs"
                      >
                        Kontekstualkan Hasil Foto
                      </button>
                    </div>
                  )}

                  {!photoPreviewUrl && (
                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoPreviewUrl("/window.svg");
                          setUploadedFileName("snapshot_buku_lks.jpg");
                          setTitle("Materi Buku LKS Siswa Kelas 5");
                          setOriginalContent(
                            "Usaha ekonomi keluarga meliputi pertanian sayur dan perdagangan kecil. Di pasar desa, komoditas dijual untuk memenuhi kebutuhan sehari-hari."
                          );
                        }}
                        className="text-xs text-[#51465B] underline font-semibold"
                      >
                        Gunakan Contoh Foto Lembar Lembar Kerja untuk Simulasi
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* REVIEW & EDITOR STUDIO */}
        {!isProcessing && previewMode && (
          <div className="space-y-6">
            <div className="bg-white rounded-[28px] sm:rounded-[36px] border border-[#E9E5E8] p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E9E5E8]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-[#23212A] tracking-tight">
                      Studio Review & Editor Kontekstual
                    </h2>
                    <p className="text-xs text-[#756F7A]">
                      Bandingkan naskah standar kurikulum dengan adaptasi berbasis kearifan lokal {targetRegion}.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewMode(false)}
                    className="px-4 py-2 rounded-xl border border-[#E9E5E8] bg-white text-xs font-bold text-[#756F7A] hover:bg-slate-50 transition-colors"
                  >
                    Edit Input
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowStudentPreviewModal(true)}
                    className="px-4 py-2 rounded-xl border border-[#51465B] bg-[#FAF7F3] text-xs font-bold text-[#51465B] hover:bg-[#51465B] hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Pratinjau Siswa</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-xl border border-[#E9E5E8] bg-white text-xs font-bold text-[#23212A] hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#51465B]" />
                    <span>Cetak A4</span>
                  </button>
                </div>
              </div>

              {/* Title Editor */}
              <div className="mt-6">
                <label className="block text-xs font-bold text-[#23212A] mb-1">
                  Judul Materi Pembelajaran
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#FAF7F3] border border-[#E9E5E8] rounded-xl text-sm font-bold text-[#23212A] focus:outline-none focus:ring-2 focus:ring-[#51465B]/20"
                />
              </div>

              {/* Local Entities Extracted Pill List */}
              {localEntitiesAdded.length > 0 && (
                <div className="mt-5 p-4 rounded-[22px] bg-[#FAF7F3] border border-[#E9E5E8]">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#51465B] mb-2 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#F47D83]" />
                    <span>Fakta & Kearifan Lokal Terverifikasi yang Disematkan</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {localEntitiesAdded.map((ent, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-3 rounded-[16px] border border-[#E9E5E8] text-xs shadow-2xs"
                      >
                        <div className="font-extrabold text-[#51465B]">{ent.entity}</div>
                        <div className="text-[10px] font-bold text-[#F47D83] uppercase tracking-wider mb-1">
                          {ent.category}
                        </div>
                        <div className="text-[11px] text-[#756F7A] leading-snug">
                          {ent.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Side-by-Side Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {/* Left: Original */}
                <div className="p-5 rounded-[24px] border border-[#E9E5E8] bg-slate-50/60 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-black uppercase tracking-wider text-[#756F7A]">
                        Naskah Asli / Kurikulum Standar
                      </span>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold">
                        Umum
                      </span>
                    </div>
                    <div className="text-xs text-[#23212A] leading-relaxed whitespace-pre-line bg-white p-4 rounded-[16px] border border-slate-200 min-h-[180px]">
                      {originalContent || "(Tidak ada naskah pembanding)"}
                    </div>
                  </div>
                  <div className="text-[11px] text-[#756F7A] mt-2">
                    Referensi konten awal sebelum adaptasi regional.
                  </div>
                </div>

                {/* Right: Contextualized */}
                <div className="p-5 rounded-[24px] border border-[#51465B]/20 bg-[#FAF7F3] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-black uppercase tracking-wider text-[#51465B] flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#F47D83]" />
                        <span>Materi Kontekstual ({targetRegion})</span>
                      </span>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#51465B] text-[#FFD36D] font-bold">
                        Siap Ajar
                      </span>
                    </div>
                    <textarea
                      rows={8}
                      value={contextualContent}
                      onChange={(e) => setContextualContent(e.target.value)}
                      className="w-full p-4 bg-white border border-[#E9E5E8] rounded-[16px] text-xs font-medium text-[#23212A] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#51465B]/20 min-h-[180px]"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#756F7A] mt-2">
                    <span>Dapat disunting langsung oleh guru.</span>
                    <span>{contextualContent.split(/\s+/).filter(Boolean).length} kata</span>
                  </div>
                </div>
              </div>

              {/* Publishing & Class Distribution Row */}
              <div className="mt-8 pt-6 border-t border-[#E9E5E8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="block text-xs font-bold text-[#23212A] mb-1.5">
                    Publikasikan ke Ruang Kelas SD:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {classes.map((cls) => {
                      const isSelected = selectedClasses.includes(cls.id);
                      return (
                        <button
                          key={cls.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedClasses(selectedClasses.filter((id) => id !== cls.id));
                            } else {
                              setSelectedClasses([...selectedClasses, cls.id]);
                            }
                          }}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all ${
                            isSelected
                              ? "bg-[#51465B] text-white border-[#51465B] shadow-xs"
                              : "bg-white text-[#756F7A] border-[#E9E5E8] hover:bg-slate-50"
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#FFD36D]" />}
                          <span>{cls.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSaveAndPublish(true)}
                    className="px-5 py-3 rounded-2xl border border-[#E9E5E8] bg-white hover:bg-slate-50 text-[#51465B] text-xs font-extrabold shadow-xs transition-colors"
                  >
                    Simpan Sebagai Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveAndPublish(false)}
                    className="px-6 py-3 rounded-2xl bg-[#51465B] hover:bg-[#3E3547] text-white text-xs font-black shadow-md flex items-center gap-2 transition-transform active:scale-95"
                  >
                    <CheckCircle className="w-4 h-4 text-[#FFD36D]" />
                    <span>Setujui & Publikasikan Materi</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Student Preview Modal */}
            {showStudentPreviewModal && (
              <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-[32px] max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#E9E5E8] space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E9E5E8]">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                        SD
                      </span>
                      <span className="text-xs font-bold text-[#756F7A]">
                        Pratinjau Tampilan Siswa Kelas 5
                      </span>
                    </div>
                    <button
                      onClick={() => setShowStudentPreviewModal(false)}
                      className="text-xs font-bold text-[#756F7A] hover:text-[#23212A]"
                    >
                      Tutup
                    </button>
                  </div>

                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#F47D83] bg-rose-50 px-2.5 py-1 rounded-full">
                      {subject} &bull; Kelas {grade} SD
                    </span>
                    <h2 className="text-xl font-black text-[#23212A] mt-2">
                      {title}
                    </h2>
                  </div>

                  <div className="p-5 rounded-[20px] bg-[#FAF7F3] border border-[#E9E5E8] text-xs text-[#23212A] leading-relaxed whitespace-pre-line font-medium">
                    {contextualContent}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => setShowStudentPreviewModal(false)}
                      className="px-5 py-2.5 rounded-xl bg-[#51465B] text-white text-xs font-bold"
                    >
                      Selesai Meninjau
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </TeacherWorkspaceShell>
  );
}

export default function CreateMaterialPage() {
  return (
    <Suspense
      fallback={
        <TeacherWorkspaceShell activeGroupId="materials">
          <div className="flex items-center justify-center min-h-[50vh]">
            <RefreshCw className="w-8 h-8 text-[#51465B] animate-spin" />
          </div>
        </TeacherWorkspaceShell>
      }
    >
      <CreateMaterialContent />
    </Suspense>
  );
}
