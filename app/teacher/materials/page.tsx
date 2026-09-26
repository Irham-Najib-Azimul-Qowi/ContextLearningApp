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
  const [patentMaterialId, setPatentMaterialId] = useState("");

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
    setPreviewTitle("");
    setPreviewNarrative("");
    setPatentMaterialId(repository.getNextMaterialId());
    setIsWizardOpen(true);
  };

  const handleSelectMethod = (method: "manual" | "camera" | "pdf" | "ai") => {
    setSelectedMethod(method);
    setTitle("");
    setManualDraft("");
    setWizardStep(2);
  };

  // Submit Step 2: Validasi Identitas & Masuk Form Konten
  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setWizardStep(3);
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
    }, 1000);
  };

  // Submit Step 3: Simpan Modul Materi dari Form Konten
  const handleStep3Save = () => {
    if (!activeSchool || !title.trim()) return;

    let content = manualDraft;
    if (selectedMethod === "camera") {
      content = capturedPhotoName ? `Naskah hasil pindai: ${capturedPhotoName}\n\n${manualDraft}` : manualDraft;
    } else if (selectedMethod === "pdf") {
      content = uploadedFileName ? `Berkas dokumen: ${uploadedFileName}\n\n${manualDraft}` : manualDraft;
    } else if (selectedMethod === "ai") {
      content = previewNarrative || manualDraft;
    }

    const newMat = repository.saveMaterial({
      id: patentMaterialId || undefined,
      school_id: activeSchool.id,
      teacher_id: currentUser?.id || "usr-teacher-01",
      title: (selectedMethod === "ai" && previewTitle) ? previewTitle : title.trim(),
      subject,
      grade,
      content: content || "Bahan ajar tematik Kurikulum Merdeka berbasis kearifan lokal.",
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
      <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6 pb-12 font-sans">
        {/* ===================================================================
            1. HEADER: BUTTON TAMBAH DI SEBELAH KIRI JUDUL & DESKRIPSI
            =================================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center items-start gap-4 sm:gap-5">
          <button
            type="button"
            onClick={handleOpenWizard}
            className="px-4 py-2.5 rounded-full bg-[#51465B] hover:bg-[#3E3547] text-[#FFD36D] border border-[#645770]/40 text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all cursor-pointer flex items-center gap-2 active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tambah Materi</span>
          </button>

          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#23212A] tracking-tight">
              Modul Materi Pembelajaran
            </h1>
            <p className="text-xs sm:text-sm text-[#756F7A] mt-0.5">
              Rancang bahan ajar tematik Kurikulum Merdeka yang dikontekstualisasikan dengan kearifan lokal {activeSchool?.region_name || "wilayah"}.
            </p>
          </div>
        </div>

        {/* ===================================================================
            2. SEARCH BAR & FILTER: LANGSUNG TANPA DIBUNGKUS CARD
            =================================================================== */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Bar: Kontras & Berpadu dengan Desain Web */}
          <div className="relative flex-1 max-w-md w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#51465B]" />
            <input
              type="text"
              placeholder="Cari judul materi atau ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-full bg-white border-2 border-[#51465B]/25 text-xs font-semibold text-[#23212A] placeholder:text-[#756F7A] focus:outline-none focus:border-[#51465B] shadow-xs transition-colors"
            />
          </div>

          {/* Instant Filter Dropdown: Rata Kanan, Ukuran Mengikuti Isi */}
          <div className="flex items-center justify-end gap-2 ml-auto shrink-0">
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="w-auto px-4 py-2 rounded-full bg-white border-2 border-[#51465B]/25 text-xs font-bold text-[#51465B] focus:outline-none focus:border-[#51465B] cursor-pointer shadow-xs transition-colors"
            >
              {SUBJECT_OPTIONS.map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ===================================================================
            3. DAFTAR MATERI: MINI DASHBOARD CARD (DARK MAUVE #51465B & BORDER #FFD36D)
            =================================================================== */}
        <div>
          {filteredMaterials.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border-2 border-[#51465B]/20 space-y-3 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-[#51465B]/10 text-[#51465B] mx-auto flex items-center justify-center">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black text-[#23212A]">Belum ada modul ajar</h3>
              <p className="text-xs text-[#756F7A] max-w-sm mx-auto font-medium">
                Mulai buat modul ajar baru menggunakan tombol Tambah Materi di atas.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredMaterials.map((mat) => {
                return (
                  <div
                    key={mat.id}
                    className="relative p-5 rounded-[26px] bg-[#51465B] text-white border-2 border-[#FFD36D] shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group overflow-hidden min-h-[220px]"
                  >
                    {/* Ambient Glow khas Dashboard */}
                    <div className="absolute -top-10 -left-10 w-28 h-28 rounded-full bg-white/10 blur-xl pointer-events-none" />

                    {/* Top: Judul, Ikon & ID di samping kanan */}
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-2xl bg-[#FFD36D] text-[#51465B] flex items-center justify-center shadow-md group-hover:scale-105 group-hover:rotate-1 transition-transform shrink-0">
                            <BookOpen className="w-5 h-5 text-[#51465B] stroke-[2.4]" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm sm:text-base font-black text-white leading-snug line-clamp-1">
                              {mat.title}
                            </h3>
                            <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/15 text-white/90 border border-white/20">
                                {mat.subject} &bull; Kelas {mat.grade} SD
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* ID di samping kanan: mini kapsul rapi */}
                        <button
                          type="button"
                          onClick={() => handleCopy(mat.id)}
                          className="shrink-0 py-1 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 font-mono text-[10px] font-bold text-[#FFD36D] flex items-center gap-1 cursor-pointer transition-colors"
                          title="Klik untuk menyalin ID materi"
                        >
                          {copiedCode === mat.id ? (
                            <>
                              <Check className="w-3 h-3 text-[#FFD36D]" />
                              <span className="font-sans text-[9px]">Tersalin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-[#FFD36D]" />
                              <span>{mat.id}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Tengah: Cuplikan Konten */}
                    <div className="my-auto py-2.5">
                      <p className="text-xs text-white/85 font-normal leading-relaxed line-clamp-2">
                        {mat.content ? mat.content.replace(/\n+/g, " ") : "Bahan ajar tematik Kurikulum Merdeka berbasis kearifan lokal."}
                      </p>
                    </div>

                    {/* Bottom: Button Lihat Materi (Warm Yellow) + Button Hapus */}
                    <div className="pt-3 border-t border-white/20 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedMaterialForPreview(mat)}
                        className="flex-1 py-2 px-3.5 rounded-xl bg-[#FFD36D] hover:bg-[#F5C75A] text-[#23212A] text-xs font-black flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all cursor-pointer group/btn"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#23212A] stroke-[2.4]" />
                        <span>Lihat Materi</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteMaterial(mat.id)}
                        className="p-2 rounded-xl bg-white/10 hover:bg-rose-500/25 text-white/70 hover:text-rose-300 border border-white/15 hover:border-rose-400/40 transition-all cursor-pointer shrink-0"
                        title="Hapus Materi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
          Step 1: Pilih Metode (Ketik Manual, Ambil Foto, Upload PDF, AI)
          Step 2: Identitas Materi
          Step 3: Konten Materi
          Step 4: Berhasil / Selesai
          ===================================================================== */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div
            className={`w-full ${
              wizardStep === 3 ? "max-w-4xl lg:max-w-5xl" : "max-w-[540px]"
            } bg-gradient-to-b from-[#3E3547] via-[#332A3B] to-[#251E2B] rounded-[32px] sm:rounded-[36px] border border-[#5A4F65] shadow-2xl p-6 sm:p-8 relative my-auto max-h-[92vh] overflow-y-auto text-white flex flex-col text-left transition-all duration-300`}
          >
            {/* ===================================================================
                MODAL HEADER: JUDUL DI KIRI ATAS, PROGRES STEP DI BAWAHNYA, X DI KANAN ATAS
                =================================================================== */}
            <div className="w-full flex items-start justify-between pb-4 border-b border-white/10 mb-5">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  {wizardStep === 4 ? "Materi Tersimpan" : "Tambah Materi"}
                </h3>
                {/* Progress Step langsung di bawah judul (tanpa teks deskripsi 'Langkah 1...') */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1.5">
                    <div className={`h-1.5 rounded-full transition-all duration-300 ${wizardStep === 1 ? "w-6 bg-[#FFD36D]" : "w-2 bg-[#FFD36D]/60"}`} />
                    <div className={`h-1.5 rounded-full transition-all duration-300 ${wizardStep === 2 ? "w-6 bg-[#FFD36D]" : wizardStep > 2 ? "w-2 bg-[#FFD36D]/60" : "w-2 bg-white/20"}`} />
                    <div className={`h-1.5 rounded-full transition-all duration-300 ${wizardStep === 3 ? "w-6 bg-[#FFD36D]" : wizardStep > 3 ? "w-2 bg-[#FFD36D]/60" : "w-2 bg-white/20"}`} />
                    <div className={`h-1.5 rounded-full transition-all duration-300 ${wizardStep === 4 ? "w-6 bg-[#FFD36D]" : "w-2 bg-white/20"}`} />
                  </div>
                  <span className="text-[11px] font-bold text-[#FFD36D]">
                    {wizardStep === 1 ? "Metode Input" : wizardStep === 2 ? "Identitas" : wizardStep === 3 ? "Konten Materi" : "Selesai"}
                  </span>
                </div>
              </div>

              {/* Close / Batal Button di pojok kanan atas */}
              <button
                type="button"
                onClick={() => setIsWizardOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-3"
                title="Batal / Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ===================================================================
                STEP 1: PILIH METODE (UKURAN CARD PEMBUNGKUS KONSISTEN & NAMA FITUR TEPAT)
                =================================================================== */}
            {wizardStep === 1 && (
              <div className="w-full space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  {/* Card Kotak 1: Ketik Manual */}
                  <button
                    type="button"
                    onClick={() => handleSelectMethod("manual")}
                    className="p-5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 hover:border-[#FFD36D] flex flex-col items-center justify-center text-center gap-3 transition-all cursor-pointer group active:scale-95 aspect-square h-full"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white/10 group-hover:bg-[#FFD36D] text-[#FFD36D] group-hover:text-[#251E2B] flex items-center justify-center transition-all shadow-xs">
                      <PenTool className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <span className="font-bold text-xs text-white group-hover:text-[#FFD36D] transition-colors leading-tight">
                      Ketik Manual
                    </span>
                  </button>

                  {/* Card Kotak 2: Ambil Foto */}
                  <button
                    type="button"
                    onClick={() => handleSelectMethod("camera")}
                    className="p-5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 hover:border-[#FFD36D] flex flex-col items-center justify-center text-center gap-3 transition-all cursor-pointer group active:scale-95 aspect-square h-full"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white/10 group-hover:bg-[#FFD36D] text-[#FFD36D] group-hover:text-[#251E2B] flex items-center justify-center transition-all shadow-xs">
                      <Camera className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <span className="font-bold text-xs text-white group-hover:text-[#FFD36D] transition-colors leading-tight">
                      Ambil Foto
                    </span>
                  </button>

                  {/* Card Kotak 3: Upload PDF */}
                  <button
                    type="button"
                    onClick={() => handleSelectMethod("pdf")}
                    className="p-5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 hover:border-[#FFD36D] flex flex-col items-center justify-center text-center gap-3 transition-all cursor-pointer group active:scale-95 aspect-square h-full"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white/10 group-hover:bg-[#FFD36D] text-[#FFD36D] group-hover:text-[#251E2B] flex items-center justify-center transition-all shadow-xs">
                      <Upload className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <span className="font-bold text-xs text-white group-hover:text-[#FFD36D] transition-colors leading-tight">
                      Upload PDF
                    </span>
                  </button>

                  {/* Card Kotak 4: Generate AI */}
                  <button
                    type="button"
                    onClick={() => handleSelectMethod("ai")}
                    className="p-5 rounded-2xl bg-gradient-to-br from-[#FFD36D]/20 to-[#FDB040]/10 hover:from-[#FFD36D]/30 hover:to-[#FDB040]/20 border border-[#FFD36D]/40 hover:border-[#FFD36D] flex flex-col items-center justify-center text-center gap-3 transition-all cursor-pointer group active:scale-95 aspect-square h-full"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#FFD36D] text-[#251E2B] flex items-center justify-center transition-all shadow-xs group-hover:scale-105">
                      <Sparkles className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <span className="font-bold text-xs text-[#FFD36D] transition-colors leading-tight">
                      Generate AI
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* ===================================================================
                STEP 2: IDENTITAS MATERI
                =================================================================== */}
            {wizardStep === 2 && (
              <form onSubmit={handleStep2Submit} className="w-full space-y-4 animate-in fade-in zoom-in-95 duration-200">
                {/* ID Materi: Kiri 'ID Materi', Kanan ID-nya (Tanpa strip, 4 angka) */}
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-200">ID Materi</span>
                  <span className="font-mono text-xs font-black text-[#FFD36D] bg-[#251E2B] px-3.5 py-1.5 rounded-xl border border-[#FFD36D]/30 select-none">
                    {patentMaterialId}
                  </span>
                </div>

                {/* Judul Materi: Kosong default, placeholder transparan tanpa kata 'Contoh' */}
                <div>
                  <label className="block text-xs font-bold text-gray-200 mb-1">
                    Judul Materi
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Operasi Hitung Belanja Pasar Tradisional"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-white/20 bg-[#251E2B]/80 focus:border-[#FFD36D] text-xs sm:text-sm font-bold text-white placeholder:text-white/30 focus:outline-none transition-all shadow-inner"
                  />
                </div>

                {/* Mapel & Kelas: Proporsi rapi, nama maksimal 2 kata */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-200 mb-1">
                      Mata Pelajaran
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-white/20 bg-[#251E2B] focus:border-[#FFD36D] text-xs font-bold text-white focus:outline-none"
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
                      Kelas
                    </label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-white/20 bg-[#251E2B] focus:border-[#FFD36D] text-xs font-bold text-white focus:outline-none"
                    >
                      {[1, 2, 3, 4, 5, 6].map((g) => (
                        <option key={g} value={g}>
                          Kelas {g} SD
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Footer Navigasi Identitas: Button 'Lanjut' Satu Kata */}
                <div className="pt-3 flex items-center justify-between border-t border-white/10 gap-3">
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    className="py-2.5 px-5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
                  >
                    Kembali
                  </button>
                  <button
                    type="submit"
                    disabled={!title.trim()}
                    className="py-2.5 px-6 rounded-2xl bg-[#FFD36D] hover:bg-[#F5C754] text-[#251E2B] font-extrabold text-xs shadow-md transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
                  >
                    <span>Lanjut</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            {/* ===================================================================
                STEP 3: FORM INPUT KONTEN MATERI (REVIEW LANGSUNG SAAT INPUT MANUAL)
                =================================================================== */}
            {wizardStep === 3 && (
              <div className="w-full space-y-4 animate-in fade-in zoom-in-95 duration-200">
                {/* Input Manual Konten: Naskah Lebar & Lapang */}
                {selectedMethod === "manual" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-200">
                        Naskah Materi
                      </label>
                      <span className="text-[11px] text-gray-400 font-mono">
                        {manualDraft.length} karakter
                      </span>
                    </div>
                    <textarea
                      rows={12}
                      required
                      value={manualDraft}
                      onChange={(e) => setManualDraft(e.target.value)}
                      placeholder="Ketik materi pembelajaran secara lengkap di sini. Masukkan stimulus cerita lokal, data rill komoditas, atau aktivitas eksplorasi siswa..."
                      className="w-full p-4 rounded-2xl border-2 border-white/20 bg-[#251E2B]/90 focus:border-[#FFD36D] text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none transition-all shadow-inner leading-relaxed min-h-[280px]"
                    />
                  </div>
                )}

                {/* Motret Naskah: Scan Simulator & Editor */}
                {selectedMethod === "camera" && (
                  <div className="space-y-4">
                    <div className="p-4 border-2 border-dashed border-white/25 rounded-2xl text-center space-y-2 bg-[#251E2B]/50">
                      <Camera className="w-8 h-8 text-[#FFD36D] mx-auto" />
                      <p className="text-xs font-bold text-gray-200">
                        {capturedPhotoName ? `Foto terlampir: ${capturedPhotoName}` : "Foto lembar naskah materi dari buku atau modul fisik"}
                      </p>
                      <button
                        type="button"
                        onClick={() => setCapturedPhotoName("foto_lembar_materi.jpg")}
                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        {capturedPhotoName ? "Foto Ulang" : "Ambil Foto"}
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-200">
                        Catatan Materi
                      </label>
                      <textarea
                        rows={8}
                        value={manualDraft}
                        onChange={(e) => setManualDraft(e.target.value)}
                        placeholder="Periksa atau tambahkan penjelasan untuk hasil pindaian..."
                        className="w-full p-4 rounded-2xl border-2 border-white/20 bg-[#251E2B]/90 focus:border-[#FFD36D] text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none transition-all shadow-inner leading-relaxed min-h-[180px]"
                      />
                    </div>
                  </div>
                )}

                {/* Upload PDF: File & Editor */}
                {selectedMethod === "pdf" && (
                  <div className="space-y-4">
                    <div className="p-4 border-2 border-dashed border-white/25 rounded-2xl text-center space-y-2 bg-[#251E2B]/50">
                      <Upload className="w-8 h-8 text-[#FFD36D] mx-auto" />
                      <p className="text-xs font-bold text-gray-200">
                        {uploadedFileName ? `Dokumen: ${uploadedFileName}` : "Unggah berkas modul ajar format PDF"}
                      </p>
                      <button
                        type="button"
                        onClick={() => setUploadedFileName("modul_ajar_kontekstual.pdf")}
                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        {uploadedFileName ? "Ganti PDF" : "Upload PDF"}
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-200">
                        Catatan Materi
                      </label>
                      <textarea
                        rows={8}
                        value={manualDraft}
                        onChange={(e) => setManualDraft(e.target.value)}
                        placeholder="Ketik intisari atau panduan belajar dari modul PDF ini..."
                        className="w-full p-4 rounded-2xl border-2 border-white/20 bg-[#251E2B]/90 focus:border-[#FFD36D] text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none transition-all shadow-inner leading-relaxed min-h-[180px]"
                      />
                    </div>
                  </div>
                )}

                {/* Generate AI: Penyesuaian Kearifan Lokal & Editor Luas */}
                {selectedMethod === "ai" && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <span className="font-bold text-[#FFD36D] text-xs block">Kearifan Lokal Wilayah: {region}</span>
                        <span className="text-[11px] text-gray-300">
                          AI merumuskan narasi tematik berbasis komoditas dan budaya nyata {region}.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleTriggerAiContextTransformation}
                        disabled={isAiGenerating}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FFD36D] to-[#FDB040] text-[#251E2B] text-xs font-bold shadow-md cursor-pointer shrink-0 disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{isAiGenerating ? "Merumuskan..." : previewNarrative ? "Generate Ulang" : "Generate AI"}</span>
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-200">
                        Narasi Materi
                      </label>
                      <textarea
                        rows={11}
                        value={previewNarrative || manualDraft}
                        onChange={(e) => {
                          setPreviewNarrative(e.target.value);
                          setManualDraft(e.target.value);
                        }}
                        placeholder="Klik Generate AI di atas atau ketik langsung draf narasi tematik di sini..."
                        className="w-full p-4 rounded-2xl border-2 border-white/20 bg-[#251E2B]/90 focus:border-[#FFD36D] text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none transition-all shadow-inner leading-relaxed min-h-[260px]"
                      />
                    </div>
                  </div>
                )}

                {/* Footer Buttons Step 3: Button 'Simpan' Satu Kata */}
                <div className="pt-3 flex items-center justify-between border-t border-white/10 gap-3">
                  <button
                    type="button"
                    onClick={() => setWizardStep(2)}
                    className="py-2.5 px-5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
                  >
                    Kembali
                  </button>

                  <button
                    type="button"
                    onClick={handleStep3Save}
                    disabled={isAiGenerating || (!manualDraft.trim() && !previewNarrative.trim() && !capturedPhotoName && !uploadedFileName)}
                    className="py-2.5 px-7 rounded-2xl bg-gradient-to-r from-[#FFD36D] to-[#FDB040] hover:from-[#FFE085] hover:to-[#FFBD59] text-[#251E2B] font-extrabold text-xs shadow-md transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
                  >
                    <span>Simpan</span>
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            )}

            {/* ===================================================================
                STEP 4: SUKSES / BERHASIL DISIMPAN DENGAN ID PATEN
                =================================================================== */}
            {wizardStep === 4 && (
              <div className="text-center py-4 space-y-4 animate-in fade-in zoom-in-95 duration-200 w-full">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-lg sm:text-xl font-black text-white">
                    Modul Materi Berhasil Disimpan!
                  </h4>
                  <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-xl bg-white/10 border border-white/15">
                    <span className="text-[11px] text-gray-300">ID Paten:</span>
                    <span className="font-mono text-xs font-bold text-[#FFD36D]">{createdMaterialId || patentMaterialId}</span>
                  </div>
                </div>
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsWizardOpen(false);
                      const mat = materials.find((m) => m.id === createdMaterialId) || materials[0];
                      if (mat) handleOpenPublishRoom(mat);
                    }}
                    className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-[#51465B] hover:bg-[#3E3547] text-[#FFD36D] text-xs font-bold border border-[#645770]/40 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <DoorOpen className="w-4 h-4" />
                    <span>Terbitkan Room Materi</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsWizardOpen(false)}
                    className="w-full sm:w-auto py-3 px-7 rounded-2xl bg-gradient-to-r from-[#FFD36D] to-[#FDB040] text-[#251E2B] text-xs font-extrabold shadow-md cursor-pointer"
                  >
                    Selesai & Lihat Modul
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
