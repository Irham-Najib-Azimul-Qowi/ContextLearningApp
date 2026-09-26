"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Sparkles,
  MapPin,
  Camera,
  Upload,
  PenTool,
  Search,
  Copy,
  Check,
  DoorOpen,
  Trash2,
  Edit,
  Eye,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  ExternalLink,
  Layers,
  HelpCircle,
} from "lucide-react";
import { TeacherWorkspaceShell } from "@/components/layout/teacher-workspace-shell";
import { repository } from "@/lib/db/repository";
import { LearningMaterial, School, UserProfile, LearningRoom } from "@/lib/db/types";

const SUBJECT_OPTIONS = [
  "Semua Mapel",
  "Matematika",
  "IPAS (Ilmu Pengetahuan Alam & Sosial)",
  "Bahasa Indonesia",
  "Pendidikan Pancasila",
  "Seni Budaya & Prakarya",
];

export default function TeacherMaterialsPage() {
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [activeSchool, setActiveSchool] = useState<School | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [rooms, setRooms] = useState<LearningRoom[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState("Semua Mapel");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Creation Wizard Modal States
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedMethod, setSelectedMethod] = useState<"manual" | "camera" | "pdf" | "ai">("manual");

  // Step 1: Metadata (Judul, Mata Pelajaran, Jenjang/Kelas)
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Matematika");
  const [grade, setGrade] = useState(5);
  const [region, setRegion] = useState("Kota Madiun");

  // Step 2: Content Inputs
  const [manualDraft, setManualDraft] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [capturedPhotoName, setCapturedPhotoName] = useState<string | null>(null);

  // Step 3: Editable AI Review / Preview
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewNarrative, setPreviewNarrative] = useState("");

  // Step 4: Result
  const [createdMaterialId, setCreatedMaterialId] = useState<string | null>(null);

  // Room Publish Modal
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [materialToPublish, setMaterialToPublish] = useState<LearningMaterial | null>(null);
  const [generatedRoomCode, setGeneratedRoomCode] = useState("");
  const [roomCreatedSuccess, setRoomCreatedSuccess] = useState(false);

  // Material Preview Modal State
  const [selectedMaterialForPreview, setSelectedMaterialForPreview] = useState<LearningMaterial | null>(null);

  const loadData = () => {
    const school = repository.getActiveSchool();
    const user = repository.getCurrentUser();
    setActiveSchool(school);
    setCurrentUser(user);
    setRegion(school.region_name || "Kota Madiun");
    setMaterials(repository.getMaterials(school.id));
    setRooms(repository.getRooms(user.id));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Open Wizard
  const handleOpenWizard = () => {
    setSelectedMethod("manual");
    setWizardStep(1);
    setTitle("");
    setManualDraft("");
    setUploadedFileName(null);
    setCapturedPhotoName(null);
    setIsWizardOpen(true);
  };

  const handleSelectMethod = (method: "manual" | "camera" | "pdf" | "ai") => {
    setSelectedMethod(method);
    if (!title) {
      setTitle(
        method === "ai"
          ? "Numerasi Pasar Tradisional & Sentra UMKM"
          : method === "camera"
          ? "Modul Hasil Pindai Naskah Fisik"
          : method === "pdf"
          ? "Modul Kurikulum Merdeka Fase C"
          : "Penerapan Konsep Belajar Kontekstual"
      );
    }
    if (!manualDraft) {
      setManualDraft("Siswa diajak mengamati kegiatan transaksi pasar dan menghitung modal serta laba penjualan.");
    }
    setWizardStep(2);
  };

  // Submit Step 2
  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (selectedMethod === "ai") {
      handleTriggerAiContextTransformation();
    } else {
      if (!activeSchool) return;
      const content =
        selectedMethod === "manual"
          ? manualDraft
          : selectedMethod === "camera"
          ? capturedPhotoName
            ? `Naskah hasil pindai: ${capturedPhotoName}\n\n${manualDraft}`
            : manualDraft
          : uploadedFileName
          ? `Berkas dokumen: ${uploadedFileName}\n\n${manualDraft}`
          : manualDraft;

      const newMat = repository.saveMaterial({
        school_id: activeSchool.id,
        teacher_id: currentUser?.id || "usr-teacher-01",
        title: title.trim(),
        subject,
        grade,
        content: content || "Bahan ajar tematik Kurikulum Merdeka berbasis kearifan lokal.",
        is_contextualized: true,
        published_to_classes: [],
      });

      setCreatedMaterialId(newMat.id);
      loadData();
      setWizardStep(4);
    }
  };

  // Process AI Context Transformation
  const handleTriggerAiContextTransformation = () => {
    setIsAiGenerating(true);
    setTimeout(() => {
      setPreviewTitle(title || `Modul Ajar Tematik ${subject} Berbasis Kearifan Lokal ${region}`);
      setPreviewNarrative(
        `Kawasan ${region} memiliki potensi komoditas pangan dan kerajinan khas yang kaya. Melalui bahan ajar kontekstual ini, peserta didik diajak menelaah aktivitas ekonomi nyata para pedagang pasar tradisional di ${region}.\n\nDalam proses pembelajaran, siswa tidak hanya menghitung angka abstrak, tetapi langsung menganalisis simulasi transaksi harga grosir, perhitungan laba-rugi warung lokal, dan pengenalan mata uang secara bijak sesuai nilai-nilai kearifan lokal.`
      );
      setIsAiGenerating(false);
      setWizardStep(3);
    }, 1200);
  };

  // Final Save in Step 3
  const handleFinalSave = () => {
    if (!activeSchool) return;

    const newMat = repository.saveMaterial({
      school_id: activeSchool.id,
      teacher_id: currentUser?.id || "usr-teacher-01",
      title: previewTitle || title,
      subject,
      grade,
      content: previewNarrative,
      is_contextualized: true,
      published_to_classes: [],
    });

    setCreatedMaterialId(newMat.id);
    loadData();
    setWizardStep(4);
  };

  const handleDeleteMaterial = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus modul materi ini?")) {
      repository.deleteMaterial(id);
      loadData();
    }
  };

  const handleOpenPublishRoom = (mat: LearningMaterial) => {
    setMaterialToPublish(mat);
    const randomCode = `mtr${Math.floor(1000 + Math.random() * 9000)}`;
    setGeneratedRoomCode(randomCode);
    setRoomCreatedSuccess(false);
    setIsRoomModalOpen(true);
  };

  const handleCreateRoomForMaterial = () => {
    if (!materialToPublish || !currentUser) return;

    repository.createRoom({
      code: generatedRoomCode,
      title: materialToPublish.title,
      type: "material",
      resource_id: materialToPublish.id,
      subject: materialToPublish.subject,
      grade: materialToPublish.grade,
      region_name: activeSchool?.region_name || "Kota Madiun",
      teacher_id: currentUser.id,
      teacher_name: currentUser.full_name,
    });

    setRoomCreatedSuccess(true);
    loadData();
  };

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterSubject === "Semua Mapel" || m.subject.toLowerCase() === filterSubject.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <TeacherWorkspaceShell activeGroupId="materials">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-12 font-sans">
        {/* ===================================================================
            1. JUDUL HALAMAN
            =================================================================== */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#23212A] tracking-tight">
            Modul Materi Pembelajaran
          </h1>
          <p className="text-xs sm:text-sm text-[#756F7A] font-semibold mt-1">
            Rancang bahan ajar tematik Kurikulum Merdeka yang dikontekstualisasikan dengan kearifan lokal {activeSchool?.region_name}.
          </p>
        </div>

        {/* ===================================================================
            2. CARD UNTUK TAMBAH MATERI (DI ATAS SEARCH & FILTER BAR)
            =================================================================== */}
        <div className="p-4 sm:p-5 rounded-[24px] sm:rounded-3xl bg-gradient-to-r from-[#3E3547] via-[#332A3B] to-[#251E2B] border border-[#5A4F65] shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#FFD36D]/15 text-[#FFD36D] flex items-center justify-center shrink-0 border border-[#FFD36D]/30">
              <BookOpen className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white tracking-tight">
                Tambah Modul Materi
              </h2>
              <p className="text-xs text-gray-300 font-medium">
                Buat modul ajar tematik kontekstual dengan alur cepat step-by-step.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenWizard}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-gradient-to-r from-[#FFD36D] to-[#FDB040] hover:from-[#FFE085] hover:to-[#FFBD59] text-[#251E2B] text-xs sm:text-sm font-black shadow-md hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-0.5 active:scale-95 shrink-0 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Tambah Materi</span>
          </button>
        </div>

        {/* ===================================================================
            3. SEARCH BAR & FILTER
            =================================================================== */}
        <div className="space-y-4 pt-1">
          {/* Toolbar: Search Bar + Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-gradient-to-r from-[#3E3547] via-[#332A3B] to-[#251E2B] p-3.5 sm:p-4 rounded-[24px] sm:rounded-3xl border border-[#5A4F65] shadow-lg">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#FFD36D]" />
              <input
                type="text"
                placeholder="Cari judul materi atau kode unik..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-full bg-[#251E2B]/80 border-2 border-white/20 text-xs font-semibold text-white placeholder:text-gray-400 focus:outline-none focus:border-[#FFD36D] transition-colors"
              />
            </div>

            {/* Instant Filter Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="px-4 py-2.5 rounded-full bg-[#251E2B] border-2 border-white/20 text-xs font-bold text-[#FFD36D] focus:outline-none focus:border-[#FFD36D] cursor-pointer shadow-xs transition-colors"
              >
                {SUBJECT_OPTIONS.map((subj) => (
                  <option key={subj} value={subj} className="bg-[#251E2B] text-white">
                    {subj}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ===================================================================
              DAFTAR MATERI: CARD DENGAN WARNA KHAS MATERI (#51465B)
              Layout: Judul & ID di kanan, Kategori di bawahnya, Deskripsi di tengah,
              Button Lihat Materi + Button Hapus di samping kanannya.
              =================================================================== */}
          {filteredMaterials.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-[#E9E5E8] space-y-3">
              <div className="w-14 h-14 rounded-full bg-[#FAF7F3] text-slate-400 mx-auto flex items-center justify-center">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Belum ada modul ajar</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Mulai buat modul ajar baru menggunakan salah satu metode input di atas.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredMaterials.map((mat) => {
                return (
                  <div
                    key={mat.id}
                    className="p-5 sm:p-6 rounded-[28px] bg-[#51465B] text-white border border-[#675B73] shadow-md hover:shadow-xl transition-all duration-200 flex flex-col justify-between group relative overflow-hidden min-h-[220px]"
                  >
                    {/* Top: Judul & ID di samping kanan, Kategori di bawahnya */}
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-base sm:text-lg font-black text-white leading-snug line-clamp-2">
                          {mat.title}
                        </h3>

                        {/* ID di samping kanan judul */}
                        <button
                          type="button"
                          onClick={() => handleCopy(mat.id)}
                          className="shrink-0 py-1 px-2.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 font-mono text-[11px] font-bold text-gray-200 flex items-center gap-1 cursor-pointer transition-colors"
                          title="Klik untuk menyalin ID materi"
                        >
                          {copiedCode === mat.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-300 font-sans text-[10px]">Tersalin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-gray-300" />
                              <span>{mat.id}</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Di bawah judul: Kategori dengan warna lain */}
                      <div className="mt-1.5 text-xs sm:text-sm font-extrabold text-[#FFD36D] tracking-wide">
                        {mat.subject} &bull; Kelas {mat.grade} SD
                      </div>
                    </div>

                    {/* Di antara di tengah secara vertikal: sedikit deskripsi */}
                    <div className="my-auto py-3.5">
                      <p className="text-xs sm:text-sm text-gray-200/90 font-medium leading-relaxed line-clamp-2">
                        {mat.content ? mat.content.replace(/\n+/g, " ") : "Bahan ajar tematik Kurikulum Merdeka berbasis kearifan lokal."}
                      </p>
                    </div>

                    {/* Bottom: Button Lihat Materi + Button Hapus di samping kanannya */}
                    <div className="pt-3 border-t border-white/15 flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setSelectedMaterialForPreview(mat)}
                        className="flex-1 py-2.5 px-4 rounded-full bg-gradient-to-r from-[#FFD36D] to-[#FDB040] hover:from-[#FFE085] hover:to-[#FFBD59] text-[#251E2B] text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                      >
                        <Eye className="w-4 h-4 stroke-[2.2]" />
                        <span>Lihat Materi</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteMaterial(mat.id)}
                        className="p-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white transition-all cursor-pointer shadow-md active:scale-95 shrink-0"
                        title="Hapus Materi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* =====================================================================
          CREATION WIZARD MODAL (LOGIN & ROOM ENTRY INSPIRED CLEAN STEP FORM)
          Step 1: Pilih Metode (Ketik Manual, Motret, Upload, AI)
          Step 2: Lengkapi Data (Judul, Mapel, Kelas, Konten)
          Step 3: Review Hasil AI (jika AI)
          Step 4: Berhasil / Selesai
          ===================================================================== */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-[480px] bg-gradient-to-b from-[#3E3547] via-[#332A3B] to-[#251E2B] rounded-[32px] sm:rounded-[36px] border border-[#5A4F65] shadow-2xl p-7 sm:p-9 relative my-auto max-h-[90vh] overflow-y-auto text-white flex flex-col items-center text-center">
            
            {/* Close button */}
            <button
              type="button"
              onClick={() => setIsWizardOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Top Icon Badge */}
            <div className="w-12 h-12 rounded-2xl bg-white/10 text-[#FFD36D] flex items-center justify-center shadow-xs">
              <BookOpen className="w-6 h-6 stroke-[2.2]" />
            </div>

            {/* Step Dots Indicator (seperti di form login & masuk room) */}
            <div className="flex items-center justify-center gap-1.5 mt-3 mb-4">
              <div className={`h-1.5 rounded-full transition-all duration-300 ${wizardStep === 1 ? "w-6 bg-[#FFD36D]" : "w-2 bg-[#FFD36D]/50"}`} />
              <div className={`h-1.5 rounded-full transition-all duration-300 ${wizardStep === 2 ? "w-6 bg-[#FFD36D]" : "w-2 bg-white/20"}`} />
              <div className={`h-1.5 rounded-full transition-all duration-300 ${wizardStep >= 3 ? "w-6 bg-[#FFD36D]" : "w-2 bg-white/20"}`} />
            </div>

            {/* STEP 1: PILIH METODE (seperti memilih cara login) */}
            {wizardStep === 1 && (
              <div className="w-full space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="text-center mb-1">
                  <h3 className="text-xl font-black text-white tracking-tight">
                    Pilih Metode Materi
                  </h3>
                  <p className="text-xs text-gray-300 mt-1">
                    Pilih cara menyiapkan modul pembelajaran kontekstual
                  </p>
                </div>

                <div className="space-y-2.5 pt-1">
                  {/* Ketik Manual */}
                  <button
                    type="button"
                    onClick={() => handleSelectMethod("manual")}
                    className="w-full p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 hover:border-[#FFD36D] flex items-center gap-3.5 transition-all cursor-pointer group text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/10 text-[#FFD36D] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <PenTool className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-sm text-white group-hover:text-[#FFD36D] transition-colors">
                        Ketik Manual
                      </div>
                      <div className="text-[11px] text-gray-300 font-medium">
                        Tulis naskah materi secara mandiri
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#FFD36D] group-hover:translate-x-0.5 transition-all" />
                  </button>

                  {/* Motret Naskah */}
                  <button
                    type="button"
                    onClick={() => handleSelectMethod("camera")}
                    className="w-full p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 hover:border-[#FFD36D] flex items-center gap-3.5 transition-all cursor-pointer group text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/10 text-[#FFD36D] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-sm text-white group-hover:text-[#FFD36D] transition-colors">
                        Motret Naskah
                      </div>
                      <div className="text-[11px] text-gray-300 font-medium">
                        Pindai buku atau lembar fisik materi
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#FFD36D] group-hover:translate-x-0.5 transition-all" />
                  </button>

                  {/* Upload PDF */}
                  <button
                    type="button"
                    onClick={() => handleSelectMethod("pdf")}
                    className="w-full p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 hover:border-[#FFD36D] flex items-center gap-3.5 transition-all cursor-pointer group text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/10 text-[#FFD36D] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-sm text-white group-hover:text-[#FFD36D] transition-colors">
                        Upload PDF
                      </div>
                      <div className="text-[11px] text-gray-300 font-medium">
                        Unggah berkas modul dari perangkat
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#FFD36D] group-hover:translate-x-0.5 transition-all" />
                  </button>

                  {/* Generate AI */}
                  <button
                    type="button"
                    onClick={() => handleSelectMethod("ai")}
                    className="w-full p-4 rounded-2xl bg-gradient-to-r from-[#FFD36D]/20 to-[#FDB040]/10 hover:from-[#FFD36D]/30 hover:to-[#FDB040]/20 border border-[#FFD36D]/40 hover:border-[#FFD36D] flex items-center gap-3.5 transition-all cursor-pointer group text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#FFD36D] text-[#251E2B] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-sm text-[#FFD36D]">
                        Generate AI
                      </div>
                      <div className="text-[11px] text-gray-300 font-medium">
                        Ramu materi otomatis dengan kearifan lokal {region}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#FFD36D] group-hover:translate-x-0.5 transition-all" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: LENGKAPI DATA MATERI */}
            {wizardStep === 2 && (
              <form onSubmit={handleStep2Submit} className="w-full space-y-4 animate-in fade-in zoom-in-95 duration-200 text-left">
                <div className="text-center mb-2">
                  <h3 className="text-xl font-black text-white tracking-tight">
                    Lengkapi Materi
                  </h3>
                  <p className="text-xs text-gray-300 mt-0.5">
                    Metode: {selectedMethod === "manual" ? "Ketik Manual" : selectedMethod === "camera" ? "Motret Naskah" : selectedMethod === "pdf" ? "Upload PDF" : "Generate AI"}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-200 mb-1">
                    Judul Materi
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Operasi Hitung Belanja Pasar Tradisional"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-white/20 bg-[#251E2B]/80 focus:border-[#FFD36D] text-xs sm:text-sm font-bold text-white placeholder:text-gray-400 focus:outline-none transition-all shadow-inner"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-200 mb-1">
                      Mata Pelajaran
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3 py-3 rounded-2xl border-2 border-white/20 bg-[#251E2B] focus:border-[#FFD36D] text-xs font-bold text-white focus:outline-none"
                    >
                      <option value="Matematika">Matematika</option>
                      <option value="IPAS (Ilmu Pengetahuan Alam & Sosial)">IPAS</option>
                      <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                      <option value="Pendidikan Pancasila">Pendidikan Pancasila</option>
                      <option value="Seni Budaya & Prakarya">Seni Budaya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-200 mb-1">
                      Jenjang Kelas
                    </label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(Number(e.target.value))}
                      className="w-full px-3 py-3 rounded-2xl border-2 border-white/20 bg-[#251E2B] focus:border-[#FFD36D] text-xs font-bold text-white focus:outline-none"
                    >
                      {[1, 2, 3, 4, 5, 6].map((g) => (
                        <option key={g} value={g}>
                          Kelas {g} SD
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Konten Spesifik Metode */}
                {selectedMethod === "manual" && (
                  <div>
                    <label className="block text-xs font-bold text-gray-200 mb-1">
                      Draf Materi
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={manualDraft}
                      onChange={(e) => setManualDraft(e.target.value)}
                      placeholder="Tuliskan pokok materi pembelajaran..."
                      className="w-full p-3.5 rounded-2xl border-2 border-white/20 bg-[#251E2B]/80 focus:border-[#FFD36D] text-xs text-white placeholder:text-gray-400 focus:outline-none transition-all shadow-inner leading-relaxed"
                    />
                  </div>
                )}

                {selectedMethod === "camera" && (
                  <div className="p-4 border-2 border-dashed border-white/25 rounded-2xl text-center space-y-2 bg-[#251E2B]/50">
                    <Camera className="w-7 h-7 text-[#FFD36D] mx-auto" />
                    <p className="text-xs font-bold text-gray-200">Foto lembar naskah materi</p>
                    <button
                      type="button"
                      onClick={() => setCapturedPhotoName("foto_lembar_materi.jpg")}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      {capturedPhotoName ? "Foto Terpindai: foto_lembar_materi.jpg" : "Ambil Foto Sekarang"}
                    </button>
                  </div>
                )}

                {selectedMethod === "pdf" && (
                  <div className="p-4 border-2 border-dashed border-white/25 rounded-2xl text-center space-y-2 bg-[#251E2B]/50">
                    <Upload className="w-7 h-7 text-[#FFD36D] mx-auto" />
                    <p className="text-xs font-bold text-gray-200">Unggah berkas modul PDF</p>
                    <button
                      type="button"
                      onClick={() => setUploadedFileName("modul_ajar.pdf")}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      {uploadedFileName ? "Berkas Terunggah: modul_ajar.pdf" : "Pilih Berkas PDF"}
                    </button>
                  </div>
                )}

                {selectedMethod === "ai" && (
                  <div className="p-3.5 rounded-2xl bg-white/10 border border-white/20 text-xs text-gray-200 space-y-1">
                    <span className="font-bold text-[#FFD36D] block">Kearifan Lokal: {region}</span>
                    <p className="text-gray-300 text-[11px] leading-relaxed">
                      AI akan menyelaraskan narasi materi berbasis potensi dan data nyata daerah {region}.
                    </p>
                  </div>
                )}

                {/* Footer Buttons */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    className="w-1/2 py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
                  >
                    Kembali
                  </button>

                  <button
                    type="submit"
                    disabled={isAiGenerating}
                    className="w-1/2 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#FFD36D] to-[#FDB040] hover:from-[#FFE085] hover:to-[#FFBD59] text-[#251E2B] font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {selectedMethod === "ai" ? (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>{isAiGenerating ? "Memproses..." : "Buat dengan AI"}</span>
                      </>
                    ) : (
                      <>
                        <span>Simpan Materi</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: REVIEW AI (JIKA MENGGUNAKAN AI) */}
            {wizardStep === 3 && (
              <div className="w-full space-y-4 animate-in fade-in zoom-in-95 duration-200 text-left">
                <div className="text-center mb-1">
                  <h3 className="text-xl font-black text-white tracking-tight">
                    Review Hasil AI
                  </h3>
                  <p className="text-xs text-gray-300 mt-0.5">
                    Periksa draf materi kontekstual sebelum disimpan
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-200 mb-1">
                    Judul Modul
                  </label>
                  <input
                    type="text"
                    value={previewTitle}
                    onChange={(e) => setPreviewTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border-2 border-white/20 bg-[#251E2B]/80 focus:border-[#FFD36D] text-xs font-bold text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-200 mb-1">
                    Narasi Materi Kontekstual
                  </label>
                  <textarea
                    rows={5}
                    value={previewNarrative}
                    onChange={(e) => setPreviewNarrative(e.target.value)}
                    className="w-full p-3.5 rounded-2xl border-2 border-white/20 bg-[#251E2B]/80 focus:border-[#FFD36D] text-xs text-white focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setWizardStep(2)}
                    className="w-1/2 py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
                  >
                    Ubah Draf
                  </button>

                  <button
                    type="button"
                    onClick={handleFinalSave}
                    className="w-1/2 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#FFD36D] to-[#FDB040] hover:from-[#FFE085] hover:to-[#FFBD59] text-[#251E2B] font-extrabold text-xs shadow-md transition-all cursor-pointer"
                  >
                    Simpan Materi
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: SUKSES */}
            {wizardStep === 4 && (
              <div className="text-center py-4 space-y-4 animate-in fade-in zoom-in-95 duration-200 w-full">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-lg sm:text-xl font-black text-white">
                    Modul Ajar Berhasil Disimpan!
                  </h4>
                  <p className="text-xs text-gray-300 mt-1 max-w-xs mx-auto">
                    Materi telah tersimpan dan siap dibagikan ke siswa via room akses.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsWizardOpen(false)}
                    className="w-full py-3.5 px-7 rounded-2xl bg-gradient-to-r from-[#FFD36D] to-[#FDB040] text-[#251E2B] text-xs sm:text-sm font-extrabold shadow-md cursor-pointer"
                  >
                    Selesai & Tutup
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Publish Room Modal */}
      {isRoomModalOpen && materialToPublish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-gradient-to-b from-[#3E3547] via-[#332A3B] to-[#251E2B] rounded-[32px] sm:rounded-[36px] border border-[#5A4F65] shadow-2xl p-6 sm:p-8 text-center space-y-4 animate-in fade-in zoom-in-95 text-white">
            <div className="w-12 h-12 rounded-2xl bg-white/10 text-[#FFD36D] flex items-center justify-center mx-auto shadow-sm">
              <DoorOpen className="w-6 h-6 stroke-[2.2]" />
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Buka Room Materi
              </h3>
              <p className="text-xs text-gray-300 mt-1">
                Akses langsung tanpa akun dengan kode:
              </p>
            </div>

            <div className="p-3 bg-[#251E2B]/80 border-2 border-white/20 rounded-2xl">
              <span className="font-mono text-xl font-black tracking-widest text-[#FFD36D] lowercase">
                {generatedRoomCode}
              </span>
            </div>

            {roomCreatedSuccess ? (
              <div className="p-3 bg-emerald-950/70 border border-emerald-700/60 text-emerald-200 text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Room berhasil diaktifkan!</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleCreateRoomForMaterial}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FFD36D] to-[#FDB040] hover:from-[#FFE085] hover:to-[#FFBD59] text-[#251E2B] font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                Aktifkan Room Sekarang
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsRoomModalOpen(false)}
              className="text-xs font-bold text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          PREVIEW MODAL MATERI (OVERLAY LIHAT MATERI)
          ===================================================================== */}
      {selectedMaterialForPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-gradient-to-b from-[#3E3547] via-[#332A3B] to-[#251E2B] rounded-[32px] sm:rounded-[36px] border border-[#5A4F65] shadow-2xl p-6 sm:p-8 relative my-auto max-h-[90vh] flex flex-col text-white">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-white/15">
              <div className="space-y-1 pr-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-white/15 text-[#FFD36D] font-black text-[10px] uppercase tracking-wider">
                    {selectedMaterialForPreview.subject} &bull; Kelas {selectedMaterialForPreview.grade} SD
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-gray-300 font-mono text-[10px] font-bold">
                    {selectedMaterialForPreview.id}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-2">
                  {selectedMaterialForPreview.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMaterialForPreview(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="my-5 overflow-y-auto pr-2 space-y-4 max-h-[50vh]">
              <div className="p-4 sm:p-5 rounded-2xl bg-[#251E2B]/80 border border-white/10 text-gray-200 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                {selectedMaterialForPreview.content}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-white/15 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  const targetMat = selectedMaterialForPreview;
                  setSelectedMaterialForPreview(null);
                  handleOpenPublishRoom(targetMat);
                }}
                className="py-2.5 px-5 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all cursor-pointer border border-white/20 flex items-center gap-1.5"
              >
                <DoorOpen className="w-3.5 h-3.5 text-[#FFD36D]" />
                <span>Buka Room Siswa</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedMaterialForPreview(null)}
                className="py-2.5 px-6 rounded-2xl bg-gradient-to-r from-[#FFD36D] to-[#FDB040] hover:from-[#FFE085] hover:to-[#FFBD59] text-[#251E2B] text-xs font-black shadow-md transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </TeacherWorkspaceShell>
  );
}
