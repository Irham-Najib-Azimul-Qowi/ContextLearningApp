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

  // Open Wizard with specific method
  const handleOpenWizard = (method: "manual" | "camera" | "pdf" | "ai") => {
    setSelectedMethod(method);
    setWizardStep(1);
    setTitle(
      method === "ai"
        ? "Numerasi Pasar Tradisional & Sentra UMKM"
        : method === "camera"
        ? "Modul Hasil Pindai Naskah Fisik"
        : method === "pdf"
        ? "Modul Kurikulum Merdeka Fase C"
        : "Penerapan Konsep Belajar Kontekstual"
    );
    setManualDraft("Siswa diajak mengamati kegiatan transaksi pasar dan menghitung modal serta laba penjualan.");
    setIsWizardOpen(true);
  };

  // Proceed Step 1 -> Step 2
  const handleNextToContent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setWizardStep(2);
  };

  // Process AI Context Transformation (Sistem AI kita yang mengubah konteks lokal!)
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
      title: previewTitle,
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
    const randomCode = `MTR-${Math.floor(1000 + Math.random() * 9000)}`;
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
            1. JUDUL SAJA (HAPUS CARD PALING ATAS BERISI JUDUL)
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
            2. INPUT-INPUT MATERI: CARD BERWARNA, IKON AGAK BESAR & NAMA SAJA
            =================================================================== */}
        <div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {/* Opsi 1: Ketik Manual - Warna Pastel Lavender / Purple */}
            <button
              type="button"
              onClick={() => handleOpenWizard("manual")}
              className="p-5 sm:p-6 rounded-[28px] bg-gradient-to-br from-[#F5F0FA] to-[#ECE3F5] border-2 border-[#51465B]/25 hover:border-[#51465B] shadow-xs hover:shadow-md transition-all text-center flex flex-col items-center justify-center gap-3 cursor-pointer group transform hover:-translate-y-0.5 active:scale-95"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#51465B] text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                <PenTool className="w-7 h-7 stroke-[2.2]" />
              </div>
              <span className="text-sm sm:text-base font-black text-[#51465B] tracking-tight">
                Ketik Manual
              </span>
            </button>

            {/* Opsi 2: Motret Langsung - Warna Pastel Sky / Blue */}
            <button
              type="button"
              onClick={() => handleOpenWizard("camera")}
              className="p-5 sm:p-6 rounded-[28px] bg-gradient-to-br from-[#EBF5FB] to-[#D6EAF8] border-2 border-[#2980B9]/30 hover:border-[#2980B9] shadow-xs hover:shadow-md transition-all text-center flex flex-col items-center justify-center gap-3 cursor-pointer group transform hover:-translate-y-0.5 active:scale-95"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#2980B9] text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                <Camera className="w-7 h-7 stroke-[2.2]" />
              </div>
              <span className="text-sm sm:text-base font-black text-[#1F618D] tracking-tight">
                Motret Langsung
              </span>
            </button>

            {/* Opsi 3: Upload PDF - Warna Pastel Orange / Coral */}
            <button
              type="button"
              onClick={() => handleOpenWizard("pdf")}
              className="p-5 sm:p-6 rounded-[28px] bg-gradient-to-br from-[#FEF5E7] to-[#FDEBD0] border-2 border-[#D35400]/30 hover:border-[#D35400] shadow-xs hover:shadow-md transition-all text-center flex flex-col items-center justify-center gap-3 cursor-pointer group transform hover:-translate-y-0.5 active:scale-95"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#D35400] text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                <Upload className="w-7 h-7 stroke-[2.2]" />
              </div>
              <span className="text-sm sm:text-base font-black text-[#A04000] tracking-tight">
                Upload PDF
              </span>
            </button>

            {/* Opsi 4: Generate AI - Warna Pastel Gold / Amber */}
            <button
              type="button"
              onClick={() => handleOpenWizard("ai")}
              className="p-5 sm:p-6 rounded-[28px] bg-gradient-to-br from-[#FFFBF0] to-[#FFF3CD] border-2 border-[#FFD36D] hover:border-[#B7950B] shadow-xs hover:shadow-md transition-all text-center flex flex-col items-center justify-center gap-3 cursor-pointer group transform hover:-translate-y-0.5 active:scale-95"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#FFD36D] text-[#251E2B] flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                <Sparkles className="w-7 h-7 stroke-[2.2]" />
              </div>
              <span className="text-sm sm:text-base font-black text-[#251E2B] tracking-tight">
                Generate AI
              </span>
            </button>
          </div>
        </div>

        {/* ===================================================================
            3. DAFTAR BERKAS MATERI: JUDUL DAFTAR + SEARCH BAR & FILTER DI BAWAHNYA
            =================================================================== */}
        <div className="space-y-4 pt-2">
          {/* Judul Daftar */}
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[#23212A] tracking-tight">
              Daftar Berkas Materi ({filteredMaterials.length})
            </h2>
            <p className="text-xs text-[#756F7A] mt-0.5 font-medium">
              Koleksi bahan ajar tematik kontekstual siap pakai atau dibagikan via room.
            </p>
          </div>

          {/* Search Bar & Instant Filter Langsung di Bawah Judul Daftar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-3xl border border-[#E9E5E8] shadow-xs">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756F7A]" />
              <input
                type="text"
                placeholder="Cari judul materi atau kode unik..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-full bg-[#FAF7F3] border border-[#E9E5E8] text-xs font-semibold text-[#23212A] placeholder:text-[#756F7A]/60 focus:outline-none focus:ring-2 focus:ring-[#51465B]/20"
              />
            </div>

            {/* Instant Filter Dropdown (Langsung Aktif Tanpa Tombol Konfirmasi) */}
            <div className="flex items-center gap-2 shrink-0">
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="px-4 py-2.5 rounded-full bg-[#FAF7F3] border border-[#E9E5E8] text-xs font-bold text-[#51465B] focus:outline-none cursor-pointer"
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
              CARD HORIZONTAL DAFTAR MATERI DENGAN IKON & WARNA KHAS
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
            <div className="space-y-3 sm:space-y-4">
              {filteredMaterials.map((mat) => {
                const activeRoom = rooms.find(
                  (r) => r.type === "material" && r.resource_id === mat.id
                );

                return (
                  <div
                    key={mat.id}
                    className="p-5 sm:p-6 rounded-[28px] bg-gradient-to-r from-[#FBF8FC] to-white border-2 border-[#51465B]/20 hover:border-[#51465B] hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                  >
                    {/* Left: Characteristic Material Icon + Info */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-[#51465B] text-white flex items-center justify-center shrink-0 shadow-xs">
                        <BookOpen className="w-6 h-6 stroke-[2.2]" />
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-3 py-1 rounded-full bg-[#51465B]/10 text-[#51465B] font-black text-[10px] uppercase tracking-wider">
                            {mat.subject} &bull; Kelas {mat.grade} SD
                          </span>

                          {/* Kode Unik Materi with Copy Button */}
                          <button
                            type="button"
                            onClick={() => handleCopy(mat.id)}
                            className="py-1 px-3 rounded-full bg-slate-100 hover:bg-slate-200 text-[10px] font-mono font-bold text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
                            title="Klik untuk menyalin kode unik materi"
                          >
                            {copiedCode === mat.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-700 font-sans">Tersalin</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-slate-500" />
                                <span>{mat.id}</span>
                              </>
                            )}
                          </button>
                        </div>

                        <h3 className="text-base sm:text-lg font-black text-[#23212A] tracking-tight truncate group-hover:text-[#51465B] transition-colors">
                          {mat.title}
                        </h3>

                        <p className="text-xs text-[#756F7A] line-clamp-1 leading-relaxed">
                          {mat.content.replace(/^Narasi Konteks:/m, "")}
                        </p>
                      </div>
                    </div>

                    {/* Right: Actions Row */}
                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      {activeRoom ? (
                        <Link
                          href={`/room/${activeRoom.code}`}
                          target="_blank"
                          className="px-4 py-2 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-100 transition-colors"
                        >
                          <DoorOpen className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Room: {activeRoom.code}</span>
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenPublishRoom(mat)}
                          className="px-4 py-2 rounded-full bg-[#51465B] hover:bg-[#3D3445] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                        >
                          <DoorOpen className="w-3.5 h-3.5 text-[#FFD36D]" />
                          <span>Buka Room</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteMaterial(mat.id)}
                        className="p-2 rounded-full border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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
          CREATION WIZARD MODAL (STEP 1: JUDUL, MAPEL, JENJANG -> STEP 2: INPUT ->
          STEP 3: AI UBAH KONTEKS & REVIEW EDITABLE -> STEP 4: SELESAI)
          ===================================================================== */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-2xl max-w-xl w-full p-6 sm:p-8 relative my-auto max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#51465B] bg-[#51465B]/10 px-2.5 py-0.5 rounded-full">
                  Langkah {wizardStep} dari 3
                </span>
                <h3 className="text-lg font-black text-[#23212A] mt-1">
                  {wizardStep === 1
                    ? "Form Identitas Modul Ajar"
                    : wizardStep === 2
                    ? "Input Bahan Materi"
                    : wizardStep === 3
                    ? "Review & Tinjau Hasil Konteks AI"
                    : "Modul Berhasil Dibuat!"}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsWizardOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* STEP 1: IDENTITAS (JUDUL, MAPEL, JENJANG) */}
            {wizardStep === 1 && (
              <form onSubmit={handleNextToContent} className="space-y-4 pt-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Judul Materi
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Operasi Hitung Campuran dalam Perdagangan Tradisional"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-[#23212A] focus:outline-none focus:ring-2 focus:ring-[#51465B]/20"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Mata Pelajaran
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-[#23212A]"
                    >
                      <option value="Matematika">Matematika</option>
                      <option value="IPAS (Ilmu Pengetahuan Alam & Sosial)">IPAS</option>
                      <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                      <option value="Pendidikan Pancasila">Pendidikan Pancasila</option>
                      <option value="Seni Budaya & Prakarya">Seni Budaya & Prakarya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Jenjang / Tingkat Kelas
                    </label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-[#23212A]"
                    >
                      {[1, 2, 3, 4, 5, 6].map((g) => (
                        <option key={g} value={g}>
                          Kelas {g} Sekolah Dasar (SD)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-[#51465B] hover:bg-[#3D3445] text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Lanjut ke Input Materi</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: INPUT KONTEN SESUAI METODE + TOMBOL AI PROSES */}
            {wizardStep === 2 && (
              <div className="space-y-4 pt-4">
                {selectedMethod === "manual" && (
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Tulis Draf Materi / Konsep Asli:
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={manualDraft}
                      onChange={(e) => setManualDraft(e.target.value)}
                      placeholder="Tuliskan pokok bahasan atau materi dasar yang ingin dikontekstualisasikan oleh sistem AI..."
                      className="w-full p-3.5 rounded-2xl border border-slate-200 text-xs leading-relaxed text-[#23212A] focus:outline-none focus:ring-2 focus:ring-[#51465B]/20"
                    />
                  </div>
                )}

                {selectedMethod === "camera" && (
                  <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-2">
                    <Camera className="w-8 h-8 text-[#2980B9] mx-auto" />
                    <p className="text-xs font-bold text-slate-700">Foto lembar naskah materi cetak</p>
                    <button
                      type="button"
                      onClick={() => setCapturedPhotoName("foto_lks_materi.jpg")}
                      className="px-4 py-2 rounded-full bg-[#2980B9] text-white text-xs font-bold"
                    >
                      {capturedPhotoName ? "Foto Terpindai: foto_lks_materi.jpg" : "Ambil Foto via Kamera"}
                    </button>
                  </div>
                )}

                {selectedMethod === "pdf" && (
                  <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-2">
                    <Upload className="w-8 h-8 text-[#D35400] mx-auto" />
                    <p className="text-xs font-bold text-slate-700">Unggah berkas modul ajar PDF</p>
                    <button
                      type="button"
                      onClick={() => setUploadedFileName("modul_ajar_kurikulum.pdf")}
                      className="px-4 py-2 rounded-full bg-[#D35400] text-white text-xs font-bold"
                    >
                      {uploadedFileName ? "Berkas Terunggah: modul_ajar_kurikulum.pdf" : "Pilih Berkas PDF"}
                    </button>
                  </div>
                )}

                {selectedMethod === "ai" && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                    <span className="font-bold block">Integrasi Data Kontekstual {region}:</span>
                    <p>
                      Sistem AI akan otomatis meramu materi berbasis data kearifan lokal, komoditas, dan fakta lingkungan riil daerah {region}.
                    </p>
                  </div>
                )}

                <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    className="px-4 py-2 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Kembali
                  </button>

                  <button
                    type="button"
                    disabled={isAiGenerating}
                    onClick={handleTriggerAiContextTransformation}
                    className="px-6 py-2.5 rounded-full bg-[#51465B] hover:bg-[#3D3445] text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#FFD36D]" />
                    <span>{isAiGenerating ? "AI Sedang Menyesuaikan Konteks..." : "Sesuaikan Konteks dengan AI"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: REVIEW & TINJAU (DAPAT DIEDIT SEBELUM SIMPAN) */}
            {wizardStep === 3 && (
              <div className="space-y-4 pt-4">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Konteks berhasil disesuaikan oleh sistem AI! Anda dapat meninjau dan mengedit di bawah ini:</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Judul Modul
                  </label>
                  <input
                    type="text"
                    value={previewTitle}
                    onChange={(e) => setPreviewTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-[#23212A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Narasi Materi Kontekstual (Dapat Diedit)
                  </label>
                  <textarea
                    rows={6}
                    value={previewNarrative}
                    onChange={(e) => setPreviewNarrative(e.target.value)}
                    className="w-full p-3.5 rounded-2xl border border-slate-200 text-xs leading-relaxed text-[#23212A] focus:outline-none"
                  />
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setWizardStep(2)}
                    className="px-4 py-2 rounded-full border border-slate-200 text-xs font-bold text-slate-600"
                  >
                    Ubah Draf
                  </button>

                  <button
                    type="button"
                    onClick={handleFinalSave}
                    className="px-6 py-2.5 rounded-full bg-[#51465B] hover:bg-[#3D3445] text-white text-xs font-bold shadow-md"
                  >
                    Simpan ke Daftar Materi
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: SUKSES */}
            {wizardStep === 4 && (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-lg font-black text-[#23212A]">
                  Modul Ajar Berhasil Disimpan!
                </h4>
                <p className="text-xs text-[#756F7A] max-w-sm mx-auto">
                  Modul ajar Anda telah berhasil masuk ke daftar materi dan siap dibagikan ke siswa via Room Akses.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsWizardOpen(false)}
                    className="px-6 py-2.5 rounded-full bg-[#51465B] text-white text-xs font-bold"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 text-center space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-[#51465B] text-white flex items-center justify-center mx-auto shadow-sm">
              <DoorOpen className="w-6 h-6 stroke-[2.2]" />
            </div>

            <div>
              <h3 className="text-base font-black text-[#23212A]">
                Buka Room untuk Materi Ini
              </h3>
              <p className="text-xs text-[#756F7A] mt-1">
                Siswa dapat langsung mengakses tanpa akun dengan kode berikut:
              </p>
            </div>

            <div className="p-3 bg-[#FAF7F3] border border-[#E9E5E8] rounded-2xl">
              <span className="font-mono text-xl font-black tracking-widest text-[#23212A]">
                {generatedRoomCode}
              </span>
            </div>

            {roomCreatedSuccess ? (
              <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>Room berhasil diaktifkan!</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleCreateRoomForMaterial}
                className="w-full py-3 rounded-full bg-[#51465B] text-white font-bold text-xs shadow-md"
              >
                Aktifkan Room Sekarang
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsRoomModalOpen(false)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </TeacherWorkspaceShell>
  );
}
