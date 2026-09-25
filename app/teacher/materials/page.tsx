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
  FileText,
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

const REGION_OPTIONS = [
  "Kota Madiun",
  "Kabupaten Madiun",
  "Kabupaten Ponorogo",
  "Kabupaten Ngawi",
  "Kabupaten Magetan",
  "Kabupaten Pacitan",
  "Kota Semarang",
];

const SUBJECT_OPTIONS = [
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
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Creation Wizard Modal States
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedMethod, setSelectedMethod] = useState<"manual" | "camera" | "pdf" | "ai">("manual");

  // Step 1: Metadata
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Matematika");
  const [grade, setGrade] = useState(5);
  const [region, setRegion] = useState("Kota Madiun");

  // Step 2: Content Inputs
  const [manualObjective, setManualObjective] = useState("");
  const [manualNarrative, setManualNarrative] = useState("");
  const [manualSteps, setManualSteps] = useState("1. Eksplorasi masalah kontekstual\n2. Diskusi kelompok terarah\n3. Refleksi dan penarikan kesimpulan");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [capturedPhotoName, setCapturedPhotoName] = useState<string | null>(null);

  // Step 3: Editable Preview
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewObjective, setPreviewObjective] = useState("");
  const [previewNarrative, setPreviewNarrative] = useState("");
  const [previewSteps, setPreviewSteps] = useState<string[]>([]);

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
    setManualObjective("Peserta didik mampu memahami konsep kontekstual melalui studi kasus nyata di lingkungan sekitar.");
    setManualNarrative("Pembelajaran dimulai dengan menelaah kegiatan ekonomi dan budaya lokal daerah " + (activeSchool?.region_name || "Madiun") + ".");
    setIsWizardOpen(true);
  };

  // Proceed from Step 1 to Step 2
  const handleNextToContent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setWizardStep(2);
  };

  // Process AI Generation in Step 2
  const handleSimulateAi = () => {
    setIsAiGenerating(true);
    setTimeout(() => {
      setPreviewTitle(title || `Modul Ajar Tematik ${subject} Berbasis Konteks ${region}`);
      setPreviewObjective(`Peserta didik dapat menganalisis permasalahan numerasi dan sains nyata di lingkungan ${region} dengan kritis.`);
      setPreviewNarrative(
        `Kawasan ${region} memiliki potensi komoditas dan aktivitas ekonomi yang unik. Melalui modul ajar ini, siswa diajak mengeksplorasi kalkulasi harga satuan, estimasi keuntungan UMKM lokal, dan gotong royong antar pedagang pasar tradisional secara langsung.`
      );
      setPreviewSteps([
        "Identifikasi data komoditas pangan lokal yang diperoleh dari data publik daerah.",
        "Simulasi transaksi jual beli dengan penerapan operasi hitung campuran (tambah, kurang, kali, bagi).",
        "Refleksi nilai sosial dan kearifan lokal para pelaku usaha di lingkungan sekitar.",
      ]);
      setIsAiGenerating(false);
      setWizardStep(3);
    }, 1200);
  };

  // Proceed from Step 2 to Step 3 (Review & Preview)
  const handleNextToPreview = () => {
    if (selectedMethod === "ai") {
      handleSimulateAi();
      return;
    }

    setPreviewTitle(title);
    setPreviewObjective(manualObjective || "Peserta didik menguasai capaian pembelajaran fase C.");
    setPreviewNarrative(
      manualNarrative ||
        `Modul ini disusun khusus untuk peserta didik di ${region}, mengintegrasikan narasi lokal ke dalam materi ${subject}.`
    );
    const splitSteps = manualSteps
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    setPreviewSteps(splitSteps.length > 0 ? splitSteps : ["Pengenalan masalah", "Aktivitas terbimbing", "Evaluasi mandiri"]);
    setWizardStep(3);
  };

  // Final Save to Repository in Step 3
  const handleFinalSave = () => {
    if (!activeSchool) return;

    const formattedContent = `${previewObjective}\n\nNarasi Konteks:\n${previewNarrative}\n\nLangkah Belajar:\n${previewSteps.join("\n")}`;

    const newMaterial = repository.saveMaterial({
      title: previewTitle,
      subject,
      grade,
      school_id: activeSchool.id,
      teacher_id: currentUser?.id || "usr-teacher-01",
      content: formattedContent,
      is_contextualized: true,
      published_to_classes: [],
    });

    setCreatedMaterialId(newMaterial.id);
    loadData();
    setWizardStep(4);
  };

  // Delete Material
  const handleDeleteMaterial = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus modul ajar ini dari daftar?")) {
      repository.deleteMaterial(id);
      loadData();
    }
  };

  // Publish Material to Room
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
    return (
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <TeacherWorkspaceShell activeGroupId="materials">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-12">
        {/* ===================================================================
            1. HEADER BANNER
            =================================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 sm:p-7 rounded-[28px] sm:rounded-[32px] border border-[#E9E5E8] shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#51465B] text-white flex items-center justify-center shadow-xs shrink-0">
              <BookOpen className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#23212A] tracking-tight">
                Modul Materi Pembelajaran
              </h1>
              <p className="text-xs text-[#756F7A] mt-0.5">
                Rancang bahan ajar tematik Kurikulum Merdeka yang dikontekstualisasikan dengan kearifan lokal {activeSchool?.region_name}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari naskah materi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E9E5E8] bg-[#FAF7F3] text-xs font-semibold text-[#23212A] focus:outline-none focus:ring-2 focus:ring-[#51465B]/20"
              />
            </div>
          </div>
        </div>

        {/* ===================================================================
            2. OPSI METODE INPUT MATERI (4 PILIHAN UTAMA SESUAI PERMINTAAN)
            Ketik Manual, Motret Langsung, Upload PDF, Generate AI
            =================================================================== */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-black text-[#23212A] tracking-tight">
              Pilih Metode Pembuatan Modul Ajar
            </h2>
            <span className="text-xs font-bold text-[#756F7A]">
              Form Terpandu Step-by-Step
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Opsi 1: Ketik Manual */}
            <button
              type="button"
              onClick={() => handleOpenWizard("manual")}
              className="p-5 rounded-[24px] bg-white border border-[#E9E5E8] hover:border-[#51465B] hover:shadow-md transition-all text-left group flex flex-col justify-between cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#51465B]/10 text-[#51465B] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <PenTool className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#23212A] group-hover:text-[#51465B] transition-colors">
                  Ketik Manual
                </h3>
                <p className="text-[11px] text-[#756F7A] mt-0.5 leading-relaxed">
                  Tulis narasi kontekstual, tujuan, dan langkah ajar secara langsung.
                </p>
              </div>
            </button>

            {/* Opsi 2: Motret Langsung */}
            <button
              type="button"
              onClick={() => handleOpenWizard("camera")}
              className="p-5 rounded-[24px] bg-white border border-[#E9E5E8] hover:border-[#51465B] hover:shadow-md transition-all text-left group flex flex-col justify-between cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Camera className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#23212A] group-hover:text-blue-700 transition-colors">
                  Motret Langsung
                </h3>
                <p className="text-[11px] text-[#756F7A] mt-0.5 leading-relaxed">
                  Pindai lembar naskah materi cetak via kamera & Vision OCR.
                </p>
              </div>
            </button>

            {/* Opsi 3: Upload PDF */}
            <button
              type="button"
              onClick={() => handleOpenWizard("pdf")}
              className="p-5 rounded-[24px] bg-white border border-[#E9E5E8] hover:border-[#51465B] hover:shadow-md transition-all text-left group flex flex-col justify-between cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Upload className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#23212A] group-hover:text-amber-800 transition-colors">
                  Upload PDF
                </h3>
                <p className="text-[11px] text-[#756F7A] mt-0.5 leading-relaxed">
                  Unggah berkas PDF modul siap dikontekstualisasikan.
                </p>
              </div>
            </button>

            {/* Opsi 4: Generate AI */}
            <button
              type="button"
              onClick={() => handleOpenWizard("ai")}
              className="p-5 rounded-[24px] bg-[#FFD36D]/30 border-2 border-[#FFD36D] hover:border-[#51465B] hover:shadow-md transition-all text-left group flex flex-col justify-between cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#51465B] text-[#FFD36D] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Sparkles className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#23212A] group-hover:text-[#51465B] transition-colors">
                  Generate AI
                </h3>
                <p className="text-[11px] text-[#756F7A] mt-0.5 leading-relaxed">
                  Otomasi penyusunan materi berbasis data riil statistik BPS daerah.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* ===================================================================
            3. DAFTAR BERKAS MATERI PEMBELAJARAN
            Format berkas kartu yang rapi dengan kode unik & relasi room
            =================================================================== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#23212A] tracking-tight">
                Daftar Berkas Materi ({filteredMaterials.length})
              </h2>
              <p className="text-xs text-[#756F7A]">
                Salin kode unik materi untuk membuat soal latihan atau publikasikan ke Ruang Belajar siswa
              </p>
            </div>
          </div>

          {filteredMaterials.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-[28px] border border-[#E9E5E8] space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#FAF7F3] text-slate-400 mx-auto flex items-center justify-center">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Belum ada modul ajar</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Mulai buat modul ajar baru menggunakan salah satu dari 4 metode input di atas.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
              {filteredMaterials.map((mat) => {
                // Find if this material is already active in a room
                const activeRoom = rooms.find(
                  (r) => r.type === "material" && r.resource_id === mat.id
                );

                return (
                  <div
                    key={mat.id}
                    className="p-5 sm:p-6 rounded-[24px] sm:rounded-[28px] bg-white border border-[#E9E5E8] hover:border-[#51465B]/30 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      {/* Top Bar: Subject Badge & Unique Code */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="px-3 py-1 rounded-full bg-[#FAF7F3] border border-[#E9E5E8] text-[#51465B] font-extrabold text-[11px]">
                          {mat.subject} • Kelas {mat.grade} SD
                        </span>

                        {/* Kode Unik Materi with Copy Button */}
                        <button
                          type="button"
                          onClick={() => handleCopy(mat.id)}
                          className="py-1 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10px] font-mono font-bold text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
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

                      {/* Title */}
                      <h3 className="text-base font-black text-[#23212A] tracking-tight leading-snug">
                        {mat.title}
                      </h3>

                      {/* Narrative Snippet */}
                      <p className="text-xs text-[#756F7A] line-clamp-3 leading-relaxed mt-2">
                        {mat.content.replace(/^Narasi Konteks:/m, "")}
                      </p>
                    </div>

                    {/* Bottom Status & Actions */}
                    <div className="pt-3 border-t border-[#E9E5E8] flex flex-wrap items-center justify-between gap-2.5">
                      {/* Room Publication Status */}
                      {activeRoom ? (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Aktif di Room: <strong>{activeRoom.code}</strong></span>
                        </div>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-400">
                          Belum dipublikasikan
                        </span>
                      )}

                      <div className="flex items-center gap-2">
                        {/* Publish via Room Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenPublishRoom(mat)}
                          className="py-2 px-3.5 rounded-xl bg-[#51465B] hover:bg-[#3D3445] text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                        >
                          <DoorOpen className="w-3.5 h-3.5 text-[#FFD36D]" />
                          <span>{activeRoom ? "Kelola Room" : "Bagikan ke Room"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteMaterial(mat.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Hapus materi ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* =====================================================================
          4. MODAL WIZARD STEP-BY-STEP INPUT MATERI
          Step 1: Identitas & Konteks
          Step 2: Input Konten Sesuai Metode
          Step 3: Preview, Review & Edit
          Step 4: Berhasil Disimpan
          ===================================================================== */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-[28px] sm:rounded-[36px] border border-slate-200 shadow-2xl max-w-2xl w-full p-6 sm:p-8 relative my-auto max-h-[92vh] overflow-y-auto">
            {/* Header Wizard & Step Indicator */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#51465B] block">
                  Langkah {wizardStep} dari 4 •{" "}
                  {selectedMethod === "manual"
                    ? "Ketik Manual"
                    : selectedMethod === "camera"
                    ? "Motret Langsung (OCR)"
                    : selectedMethod === "pdf"
                    ? "Upload PDF"
                    : "Generate AI"}
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  {wizardStep === 1
                    ? "Form Identitas & Konteks Modul"
                    : wizardStep === 2
                    ? "Input Konten Materi"
                    : wizardStep === 3
                    ? "Tinjau & Edit Pratinjau Modul"
                    : "Modul Berhasil Dibuat!"}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsWizardOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* STEP 1: FORM IDENTITAS & KONTEKS */}
            {wizardStep === 1 && (
              <form onSubmit={handleNextToContent} className="space-y-4 pt-5">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Judul / Topik Pembelajaran
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Operasi Hitung Campuran dalam Perdagangan Tradisional"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#FAF7F3] text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#51465B]/20"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Mata Pelajaran
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#FAF7F3] text-xs font-semibold text-slate-900"
                    >
                      {SUBJECT_OPTIONS.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Tingkat Kelas
                    </label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#FAF7F3] text-xs font-semibold text-slate-900"
                    >
                      <option value={5}>Fase C • Kelas 5 SD</option>
                      <option value={4}>Fase B • Kelas 4 SD</option>
                      <option value={6}>Fase C • Kelas 6 SD</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Wilayah Konteks Lokal (BPS & Kearifan Daerah)
                  </label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#FAF7F3] text-xs font-semibold text-slate-900"
                  >
                    {REGION_OPTIONS.map((reg) => (
                      <option key={reg} value={reg}>
                        {reg}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsWizardOpen(false)}
                    className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 px-6 rounded-xl bg-[#51465B] hover:bg-[#3D3445] text-white font-black text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Lanjut ke Input Konten</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#FFD36D]" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: INPUT KONTEN SESUAI METODE */}
            {wizardStep === 2 && (
              <div className="space-y-4 pt-5">
                {selectedMethod === "manual" && (
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Tujuan Pembelajaran
                      </label>
                      <textarea
                        rows={2}
                        value={manualObjective}
                        onChange={(e) => setManualObjective(e.target.value)}
                        placeholder="Peserta didik mampu menyelesaikan kalkulasi numerasi belanja komoditas lokal..."
                        className="w-full p-3 rounded-xl border border-slate-200 bg-[#FAF7F3] text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#51465B]/20"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Narasi Kontekstual ({region})
                      </label>
                      <textarea
                        rows={4}
                        value={manualNarrative}
                        onChange={(e) => setManualNarrative(e.target.value)}
                        placeholder="Tuliskan latar belakang situasi lokal, komoditas, atau studi kasus..."
                        className="w-full p-3 rounded-xl border border-slate-200 bg-[#FAF7F3] text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#51465B]/20"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Langkah Aktivitas Belajar (Satu per baris)
                      </label>
                      <textarea
                        rows={3}
                        value={manualSteps}
                        onChange={(e) => setManualSteps(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-200 bg-[#FAF7F3] text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#51465B]/20"
                      />
                    </div>
                  </div>
                )}

                {selectedMethod === "camera" && (
                  <div className="p-6 rounded-2xl bg-[#FAF7F3] border-2 border-dashed border-slate-300 text-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto">
                      <Camera className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Motret Lembar Naskah Modul</h4>
                      <p className="text-xs text-slate-500">Ambil foto dokumen menggunakan kamera atau unggah foto</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCapturedPhotoName("naskah_modul_sd_halaman1.jpg")}
                      className="py-2.5 px-5 rounded-xl bg-blue-700 text-white font-bold text-xs shadow-xs hover:bg-blue-800 transition-colors cursor-pointer"
                    >
                      {capturedPhotoName ? "Foto Terpilih: " + capturedPhotoName : "Ambil Foto Sekarang"}
                    </button>
                  </div>
                )}

                {selectedMethod === "pdf" && (
                  <div className="p-6 rounded-2xl bg-[#FAF7F3] border-2 border-dashed border-slate-300 text-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                      <Upload className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Unggah Dokumen PDF Modul</h4>
                      <p className="text-xs text-slate-500">Pilih berkas PDF modul kurikulum merdeka (.pdf)</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUploadedFileName("modul_fase_c_matematika.pdf")}
                      className="py-2.5 px-5 rounded-xl bg-amber-800 text-white font-bold text-xs shadow-xs hover:bg-amber-900 transition-colors cursor-pointer"
                    >
                      {uploadedFileName ? "Berkas: " + uploadedFileName : "Pilih Berkas PDF"}
                    </button>
                  </div>
                )}

                {selectedMethod === "ai" && (
                  <div className="space-y-3">
                    <div className="p-4 rounded-2xl bg-[#FFD36D]/20 border border-[#FFD36D] space-y-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#51465B]" />
                        <h4 className="text-xs font-bold text-slate-900">Contextual AI Generator</h4>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        AI akan secara otomatis merelasikan topik dengan data publik BPS komoditas wilayah {region}.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Instruksi Tambahan (Opsional)
                      </label>
                      <input
                        type="text"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="Contoh: Fokuskan pada sentra brem Madiun dan penghitungan keuntungan dagang"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#FAF7F3] text-xs font-medium text-slate-900"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Kembali</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextToPreview}
                    disabled={isAiGenerating}
                    className="py-2.5 px-6 rounded-xl bg-[#51465B] hover:bg-[#3D3445] text-white font-black text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  >
                    {isAiGenerating ? (
                      <span>Mengontekstualisasikan AI...</span>
                    ) : (
                      <>
                        <span>Tinjau & Edit Pratinjau</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#FFD36D]" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: PREVIEW & REVIEW / EDITABLE FIELDS */}
            {wizardStep === 3 && (
              <div className="space-y-4 pt-5">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Pratinjau Modul: Anda dapat mengoreksi dan mengedit teks di bawah ini sebelum menyimpan.</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Judul Modul (Bisa diedit)
                    </label>
                    <input
                      type="text"
                      value={previewTitle}
                      onChange={(e) => setPreviewTitle(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-[#FAF7F3] text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Tujuan Pembelajaran
                    </label>
                    <textarea
                      rows={2}
                      value={previewObjective}
                      onChange={(e) => setPreviewObjective(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-[#FAF7F3] text-xs font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Narasi Kontekstual Lokal
                    </label>
                    <textarea
                      rows={4}
                      value={previewNarrative}
                      onChange={(e) => setPreviewNarrative(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-[#FAF7F3] text-xs font-medium text-slate-900 leading-relaxed"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setWizardStep(2)}
                    className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Kembali Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleFinalSave}
                    className="py-2.5 px-6 rounded-xl bg-[#51465B] hover:bg-[#3D3445] text-white font-black text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Simpan & Terbitkan</span>
                    <Check className="w-4 h-4 text-[#FFD36D]" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: RESULT / FINISH */}
            {wizardStep === 4 && (
              <div className="py-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Modul Ajar Berhasil Disimpan!
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                    Modul telah masuk ke daftar berkas materi dan siap digunakan untuk mengajar atau membuat soal latihan.
                  </p>
                </div>

                {createdMaterialId && (
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 inline-flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-semibold">Kode Unik Materi:</span>
                    <span className="text-xs font-mono font-bold text-[#51465B]">{createdMaterialId}</span>
                  </div>
                )}

                <div className="flex items-center justify-center gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsWizardOpen(false)}
                    className="py-2.5 px-5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs cursor-pointer"
                  >
                    Tutup & Lihat Berkas
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsWizardOpen(false);
                      const saved = materials.find((m) => m.id === createdMaterialId);
                      if (saved) handleOpenPublishRoom(saved);
                    }}
                    className="py-2.5 px-5 rounded-xl bg-[#51465B] hover:bg-[#3D3445] text-white font-black text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <DoorOpen className="w-4 h-4 text-[#FFD36D]" />
                    <span>Publikasikan via Room</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          5. MODAL PUBLIKASIKAN MATERI KE ROOM (AKSES SISWA TANPA LOGIN)
          ===================================================================== */}
      {isRoomModalOpen && materialToPublish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-[28px] sm:rounded-[36px] border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-7 relative animate-in fade-in zoom-in-95">
            <button
              type="button"
              onClick={() => setIsRoomModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#51465B] text-[#FFD36D] flex items-center justify-center shadow-xs">
                <DoorOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Publikasikan Materi via Room
                </h3>
                <p className="text-xs text-slate-500">Siswa dapat langsung membaca tanpa perlu login</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-[#FAF7F3] border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Modul Terpilih:</span>
                <span className="font-bold text-slate-900">{materialToPublish.title}</span>
              </div>

              {!roomCreatedSuccess ? (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Kode Akses Room
                    </label>
                    <input
                      type="text"
                      value={generatedRoomCode}
                      onChange={(e) => setGeneratedRoomCode(e.target.value.toUpperCase())}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#FAF7F3] font-mono font-bold text-sm text-[#51465B]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleCreateRoomForMaterial}
                    className="w-full py-3 rounded-xl bg-[#51465B] hover:bg-[#3D3445] text-white font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Terbitkan Room Belajar</span>
                    <ArrowRight className="w-4 h-4 text-[#FFD36D]" />
                  </button>
                </>
              ) : (
                <div className="text-center space-y-3 pt-2">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                    <p className="text-xs font-bold">Room Belajar Berhasil Dibuka!</p>
                    <div className="text-2xl font-mono font-black text-[#51465B] tracking-wider my-2">
                      {generatedRoomCode}
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Tautan siswa: <code>{typeof window !== "undefined" ? window.location.origin : ""}/room/{generatedRoomCode}</code>
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(`${typeof window !== "undefined" ? window.location.origin : ""}/room/${generatedRoomCode}`)}
                      className="flex-1 py-2.5 rounded-xl bg-[#FAF7F3] border border-slate-200 hover:bg-slate-100 text-slate-800 font-bold text-xs"
                    >
                      {copiedCode ? "Tautan Tersalin!" : "Salin Tautan"}
                    </button>
                    <Link
                      href={`/room/${generatedRoomCode}`}
                      target="_blank"
                      className="py-2.5 px-4 rounded-xl bg-[#51465B] text-white font-bold text-xs flex items-center gap-1.5"
                    >
                      <span>Buka Room</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </TeacherWorkspaceShell>
  );
}
