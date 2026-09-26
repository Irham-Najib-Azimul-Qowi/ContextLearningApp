"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  DoorOpen,
  Plus,
  Copy,
  Check,
  Search,
  Trash2,
  Eye,
  BookOpen,
  FileQuestion,
  Layers,
  ArrowRight,
  X,
  CheckCircle2,
  Shuffle,
  ExternalLink,
} from "lucide-react";
import { TeacherWorkspaceShell } from "@/components/layout/teacher-workspace-shell";
import { repository } from "@/lib/db/repository";
import { LearningRoom, LearningMaterial, Question, School, UserProfile } from "@/lib/db/types";

export default function TeacherRoomsPage() {
  const [rooms, setRooms] = useState<LearningRoom[]>([]);
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeSchool, setActiveSchool] = useState<School | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"all" | "material" | "question" | "both">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Creation Wizard Modal State (Login & Room Entry Style)
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [roomType, setRoomType] = useState<"material" | "question" | "both">("material");
  const [selectedResourceId, setSelectedResourceId] = useState("");
  const [secondaryResourceId, setSecondaryResourceId] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [subject, setSubject] = useState("Matematika");
  const [grade, setGrade] = useState(5);
  const [createdRoom, setCreatedRoom] = useState<LearningRoom | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = () => {
    const school = repository.getActiveSchool();
    setActiveSchool(school);
    const user = repository.getCurrentUser();
    setCurrentUser(user);
    const allRooms = repository.getRooms(user?.id);
    setRooms(allRooms);
    const mats = repository.getMaterials(school?.id);
    setMaterials(mats);
    const qs = repository.getQuestions({ schoolId: school?.id });
    setQuestions(qs);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDeleteRoom = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus room akses ini?")) {
      repository.deleteRoom(id);
      loadData();
    }
  };

  // Open Wizard
  const handleOpenWizard = () => {
    setWizardStep(1);
    setRoomType("material");
    const patentCode = repository.getNextRoomCode();
    setRoomCode(patentCode);
    if (materials.length > 0) {
      setSelectedResourceId(materials[0].id);
    }
    if (questions.length > 0) {
      setSecondaryResourceId(questions[0].id);
    }
    setCustomTitle("");
    setSubject("Matematika");
    setGrade(5);
    setCreatedRoom(null);
    setIsWizardOpen(true);
  };

  // Step 1: Select Type
  const handleSelectType = (type: "material" | "question" | "both") => {
    setRoomType(type);
    setCustomTitle("");
    if (type === "material" && materials.length > 0) {
      setSelectedResourceId(materials[0].id);
    } else if (type === "question" && questions.length > 0) {
      setSelectedResourceId(questions[0].id);
    } else if (type === "both") {
      if (materials.length > 0) {
        setSelectedResourceId(materials[0].id);
      }
      if (questions.length > 0) {
        setSecondaryResourceId(questions[0].id);
      }
    }
    setWizardStep(2);
  };

  // Step 2: Next to Content Picker
  const handleStep2Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;
    setWizardStep(3);
  };

  // Step 3: Submit Room
  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode || !customTitle || isSubmitting) return;

    setIsSubmitting(true);
    const cleanCode = roomCode.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    const newRoom = repository.createRoom({
      code: cleanCode,
      title: customTitle.trim(),
      type: roomType,
      resource_id: selectedResourceId,
      secondary_resource_id: roomType === "both" ? secondaryResourceId : undefined,
      subject,
      grade,
      region_name: activeSchool?.region_name || "Kota Madiun",
      teacher_id: currentUser?.id || "usr-teacher-01",
      teacher_name: currentUser?.full_name || "Pengajar Depaskan",
    });

    setIsSubmitting(false);
    setCreatedRoom(newRoom);
    setWizardStep(4);
    loadData();
  };

  const filteredRooms = rooms.filter((r) => {
    const matchesFilter = filterType === "all" || r.type === filterType;
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <TeacherWorkspaceShell activeGroupId="rooms">
      <div className="space-y-6 sm:space-y-8 pb-12 font-sans">
        {/* ===================================================================
            1. HEADER: BUTTON TAMBAH DI SEBELAH KIRI JUDUL & DESKRIPSI
            =================================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <button
            type="button"
            onClick={handleOpenWizard}
            className="self-start sm:self-auto px-4 py-2.5 rounded-full bg-[#51465B] hover:bg-[#3E3547] text-[#FFD36D] text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all cursor-pointer flex items-center gap-2 active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tambah Room</span>
          </button>

          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#23212A] tracking-tight">
              Room Akses Siswa
            </h1>
            <p className="text-xs sm:text-sm text-[#756F7A] mt-1">
              Bagikan modul materi dan paket soal kontekstual langsung ke siswa via URL atau kode room tanpa akun.
            </p>
          </div>
        </div>

        {/* ===================================================================
            2. SEARCH BAR & FILTER ROOM: LANGSUNG TANPA DIBUNGKUS CARD
            =================================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#51465B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kode room, judul, atau mapel..."
              className="w-full pl-9 pr-4 py-2.5 rounded-full bg-white border-2 border-[#51465B]/25 text-xs font-semibold text-[#23212A] placeholder:text-[#756F7A]/70 focus:outline-none focus:border-[#51465B] shadow-xs transition-colors"
            />
          </div>

          {/* Filter Room Pills - Rata kanan & ukuran pas nama */}
          <div className="flex items-center gap-1.5 overflow-x-auto shrink-0 sm:ml-auto justify-end">
            <button
              type="button"
              onClick={() => setFilterType("all")}
              className={`w-auto inline-flex items-center justify-center whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filterType === "all"
                  ? "bg-[#51465B] text-white shadow-xs"
                  : "bg-white text-[#756F7A] hover:bg-slate-100 border-2 border-[#51465B]/20"
              }`}
            >
              Semua ({rooms.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("material")}
              className={`w-auto inline-flex items-center justify-center whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filterType === "material"
                  ? "bg-[#51465B] text-white shadow-xs"
                  : "bg-white text-[#756F7A] hover:bg-slate-100 border-2 border-[#51465B]/20"
              }`}
            >
              Materi
            </button>
            <button
              type="button"
              onClick={() => setFilterType("question")}
              className={`w-auto inline-flex items-center justify-center whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filterType === "question"
                  ? "bg-[#51465B] text-white shadow-xs"
                  : "bg-white text-[#756F7A] hover:bg-slate-100 border-2 border-[#51465B]/20"
              }`}
            >
              Soal
            </button>
            <button
              type="button"
              onClick={() => setFilterType("both")}
              className={`w-auto inline-flex items-center justify-center whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filterType === "both"
                  ? "bg-[#51465B] text-white shadow-xs"
                  : "bg-white text-[#756F7A] hover:bg-slate-100 border-2 border-[#51465B]/20"
              }`}
            >
              Materi & Soal
            </button>
          </div>
        </div>

        {/* ===================================================================
            3. DAFTAR ROOM: SESUAI 2 CARD DASBOR (MINI VERSION) & GRADASI UNTUK KEDUANYA
            =================================================================== */}
        <div>
          {filteredRooms.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border-2 border-[#51465B]/20 space-y-3">
              <div className="w-14 h-14 rounded-full bg-[#FAF7F3] text-[#756F7A] mx-auto flex items-center justify-center">
                <DoorOpen className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-[#23212A]">Tidak ada room ditemukan</h3>
              <p className="text-xs text-[#756F7A] max-w-sm mx-auto">
                Silakan sesuaikan kata kunci pencarian atau buat room baru menggunakan tombol di atas.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredRooms.map((room) => {
                const isMaterial = room.type === "material";
                const isBoth = room.type === "both";

                const roomDescription = isBoth
                  ? `Ruang belajar tematik memuat modul materi dan latihan soal untuk wilayah ${room.region_name || "lokal"}.`
                  : isMaterial
                  ? `Ruang eksplorasi bahan ajar tematik Kurikulum Merdeka untuk wilayah ${room.region_name || "lokal"}.`
                  : `Ruang asesmen interaktif pengerjaan butir latihan soal kontekstual untuk wilayah ${room.region_name || "lokal"}.`;

                if (isBoth) {
                  // Gradasi antara warna materi (#51465B) dan soal (#FFD36D)
                  return (
                    <div
                      key={room.id}
                      className="relative p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#51465B] via-[#43374D] to-[#B38A2D] border-2 border-[#FFD36D] shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between group overflow-hidden min-h-[220px] text-white"
                    >
                      <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#FFD36D]/20 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />

                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-[#FFD36D] text-[#23212A] flex items-center justify-center shrink-0 shadow-xs">
                            <Layers className="w-5 h-5 stroke-[2.2]" />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(room.code)}
                            className="shrink-0 py-1 px-2.5 rounded-xl bg-[#23212A]/50 hover:bg-[#23212A]/70 border border-[#FFD36D]/40 font-mono text-xs font-black text-[#FFD36D] flex items-center gap-1.5 cursor-pointer transition-colors"
                            title="Klik untuk menyalin kode room"
                          >
                            {copiedCode === room.code ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-300 font-sans text-[10px]">Tersalin</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-[#FFD36D]" />
                                <span>{room.code}</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="mt-3">
                          <h3 className="text-base font-extrabold text-white leading-snug line-clamp-2">
                            {room.title}
                          </h3>
                          <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white/90 border border-white/15">
                              Materi & Soal &bull; {room.subject} &bull; Kelas {room.grade} SD
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="my-auto py-3">
                        <p className="text-xs text-white/85 font-medium leading-relaxed line-clamp-2">
                          {roomDescription}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-white/15 flex items-center gap-2">
                        <Link
                          href={`/room/${room.code}`}
                          target="_blank"
                          className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#FFD36D] to-[#FDB040] hover:from-[#FFE085] hover:to-[#FFBD59] text-[#23212A] font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Buka Room</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteRoom(room.id)}
                          className="p-2.5 rounded-xl bg-white/10 hover:bg-rose-500/20 text-white/70 hover:text-rose-300 border border-white/20 hover:border-rose-400 transition-all cursor-pointer shrink-0"
                          title="Hapus Room"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                }

                if (isMaterial) {
                  // Style Materi: Gelap Mauve (#51465B) dengan aksen kuning (#FFD36D)
                  return (
                    <div
                      key={room.id}
                      className="relative p-5 sm:p-6 rounded-3xl bg-[#51465B] border-2 border-[#FFD36D] shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between group overflow-hidden min-h-[220px] text-white"
                    >
                      <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#FFD36D]/15 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />

                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-[#FFD36D]/20 text-[#FFD36D] flex items-center justify-center shrink-0 border border-[#FFD36D]/30">
                            <BookOpen className="w-5 h-5 stroke-[2.2]" />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(room.code)}
                            className="shrink-0 py-1 px-2.5 rounded-xl bg-[#23212A]/40 hover:bg-[#23212A]/60 border border-[#FFD36D]/30 font-mono text-xs font-black text-[#FFD36D] flex items-center gap-1.5 cursor-pointer transition-colors"
                            title="Klik untuk menyalin kode room"
                          >
                            {copiedCode === room.code ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-300 font-sans text-[10px]">Tersalin</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-[#FFD36D]/80" />
                                <span>{room.code}</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="mt-3">
                          <h3 className="text-base font-extrabold text-white leading-snug line-clamp-2">
                            {room.title}
                          </h3>
                          <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white/90 border border-white/15">
                              Materi &bull; {room.subject} &bull; Kelas {room.grade} SD
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="my-auto py-3">
                        <p className="text-xs text-white/80 font-medium leading-relaxed line-clamp-2">
                          {roomDescription}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-white/10 flex items-center gap-2">
                        <Link
                          href={`/room/${room.code}`}
                          target="_blank"
                          className="flex-1 py-2.5 px-4 rounded-xl bg-[#FFD36D] hover:bg-[#FFE085] text-[#23212A] font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Buka Room</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteRoom(room.id)}
                          className="p-2.5 rounded-xl bg-white/10 hover:bg-rose-500/20 text-white/70 hover:text-rose-300 border border-white/20 hover:border-rose-400 transition-all cursor-pointer shrink-0"
                          title="Hapus Room"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                }

                // Style Soal: Kuning Cerah (#FFD36D) dengan border & teks mauve (#51465B)
                return (
                  <div
                    key={room.id}
                    className="relative p-5 sm:p-6 rounded-3xl bg-[#FFD36D] border-2 border-[#51465B] shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between group overflow-hidden min-h-[220px] text-[#23212A]"
                  >
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#51465B]/15 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />

                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#51465B]/15 text-[#51465B] flex items-center justify-center shrink-0 border border-[#51465B]/20">
                          <FileQuestion className="w-5 h-5 stroke-[2.2]" />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(room.code)}
                          className="shrink-0 py-1 px-2.5 rounded-xl bg-white/60 hover:bg-white border border-[#51465B]/30 font-mono text-xs font-black text-[#51465B] flex items-center gap-1.5 cursor-pointer transition-colors"
                          title="Klik untuk menyalin kode room"
                        >
                          {copiedCode === room.code ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700 font-sans text-[10px]">Tersalin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-[#51465B]/80" />
                              <span>{room.code}</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="mt-3">
                        <h3 className="text-base font-extrabold text-[#23212A] leading-snug line-clamp-2">
                          {room.title}
                        </h3>
                        <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/60 text-[#51465B] border border-[#51465B]/20">
                            Soal &bull; {room.subject} &bull; Kelas {room.grade} SD
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="my-auto py-3">
                      <p className="text-xs text-[#51465B]/80 font-medium leading-relaxed line-clamp-2">
                        {roomDescription}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#51465B]/20 flex items-center gap-2">
                      <Link
                        href={`/room/${room.code}`}
                        target="_blank"
                        className="flex-1 py-2.5 px-4 rounded-xl bg-[#51465B] hover:bg-[#3E3547] text-[#FFD36D] font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Buka Room</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeleteRoom(room.id)}
                        className="p-2.5 rounded-xl bg-black/10 hover:bg-rose-500/20 text-[#23212A]/70 hover:text-rose-700 border border-[#51465B]/20 hover:border-rose-400 transition-all cursor-pointer shrink-0"
                        title="Hapus Room"
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

      {/* =====================================================================
          CREATION WIZARD MODAL (LOGIN & ROOM ENTRY INSPIRED CLEAN STEP FORM)
          ===================================================================== */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-[540px] bg-gradient-to-b from-[#3E3547] via-[#332A3B] to-[#251E2B] rounded-[32px] sm:rounded-[36px] border border-[#5A4F65] shadow-2xl p-6 sm:p-8 relative my-auto max-h-[92vh] overflow-y-auto text-white flex flex-col text-left transition-all duration-300">
            {/* ===================================================================
                MODAL HEADER: JUDUL DI KIRI ATAS, PROGRES STEP DI BAWAHNYA, X DI KANAN ATAS
                =================================================================== */}
            <div className="w-full flex items-start justify-between pb-4 border-b border-white/10 mb-5">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  {wizardStep === 1
                    ? "Tipe Room"
                    : wizardStep === 2
                    ? "Identitas Room"
                    : wizardStep === 3
                    ? "Pilih Konten"
                    : "Room Siap"}
                </h3>
                {/* Progress Step dots */}
                <div className="flex items-center gap-1.5 mt-2">
                  <div className={`h-1.5 rounded-full transition-all duration-300 ${wizardStep === 1 ? "w-6 bg-[#FFD36D]" : "w-2 bg-[#FFD36D]/60"}`} />
                  <div className={`h-1.5 rounded-full transition-all duration-300 ${wizardStep === 2 ? "w-6 bg-[#FFD36D]" : wizardStep > 2 ? "w-2 bg-[#FFD36D]/60" : "w-2 bg-white/20"}`} />
                  <div className={`h-1.5 rounded-full transition-all duration-300 ${wizardStep === 3 ? "w-6 bg-[#FFD36D]" : wizardStep > 3 ? "w-2 bg-[#FFD36D]/60" : "w-2 bg-white/20"}`} />
                  <div className={`h-1.5 rounded-full transition-all duration-300 ${wizardStep === 4 ? "w-6 bg-[#FFD36D]" : "w-2 bg-white/20"}`} />
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
                STEP 1: PILIH TIPE ROOM (BENTUK CARD KOTAK KONSISTEN)
                =================================================================== */}
            {wizardStep === 1 && (
              <div className="w-full space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="grid grid-cols-3 gap-3 pt-1">
                  {/* Card Kotak 1: Room Materi */}
                  <button
                    type="button"
                    onClick={() => handleSelectType("material")}
                    className="aspect-square h-full p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 hover:border-[#FFD36D] flex flex-col items-center justify-center text-center gap-2.5 transition-all cursor-pointer group active:scale-95"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-white/10 group-hover:bg-[#FFD36D] text-[#FFD36D] group-hover:text-[#251E2B] flex items-center justify-center transition-all shadow-xs">
                      <BookOpen className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <span className="font-bold text-xs text-white group-hover:text-[#FFD36D] transition-colors leading-tight">
                      Room Materi
                    </span>
                  </button>

                  {/* Card Kotak 2: Room Soal */}
                  <button
                    type="button"
                    onClick={() => handleSelectType("question")}
                    className="aspect-square h-full p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 hover:border-[#FFD36D] flex flex-col items-center justify-center text-center gap-2.5 transition-all cursor-pointer group active:scale-95"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-white/10 group-hover:bg-[#FFD36D] text-[#FFD36D] group-hover:text-[#251E2B] flex items-center justify-center transition-all shadow-xs">
                      <FileQuestion className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <span className="font-bold text-xs text-white group-hover:text-[#FFD36D] transition-colors leading-tight">
                      Room Soal
                    </span>
                  </button>

                  {/* Card Kotak 3: Materi & Soal */}
                  <button
                    type="button"
                    onClick={() => handleSelectType("both")}
                    className="aspect-square h-full p-4 rounded-2xl bg-gradient-to-br from-[#FFD36D]/20 to-[#FDB040]/10 hover:from-[#FFD36D]/30 hover:to-[#FDB040]/20 border border-[#FFD36D]/40 hover:border-[#FFD36D] flex flex-col items-center justify-center text-center gap-2.5 transition-all cursor-pointer group active:scale-95"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-[#FFD36D] text-[#251E2B] flex items-center justify-center transition-all shadow-xs group-hover:scale-105">
                      <Layers className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <span className="font-bold text-xs text-[#FFD36D] transition-colors leading-tight">
                      Materi & Soal
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* ===================================================================
                STEP 2: IDENTITAS RUANG BELAJAR
                =================================================================== */}
            {wizardStep === 2 && (
              <form onSubmit={handleStep2Next} className="w-full space-y-4 animate-in fade-in zoom-in-95 duration-200">
                {/* Kode Room */}
                <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-300">Kode Room</span>
                  <span className="font-mono text-sm font-black text-[#FFD36D] tracking-wider px-2.5 py-0.5 rounded-lg bg-black/30 border border-[#FFD36D]/30">
                    {roomCode}
                  </span>
                </div>

                {/* Judul Room */}
                <div>
                  <label className="block text-xs font-bold text-gray-200 mb-1">
                    Judul Room
                  </label>
                  <input
                    type="text"
                    required
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Judul ruang belajar..."
                    className="w-full px-4 py-3 rounded-2xl border-2 border-white/20 bg-[#251E2B]/80 focus:border-[#FFD36D] text-xs sm:text-sm font-bold text-white placeholder:text-gray-400/60 focus:outline-none transition-all shadow-inner"
                  />
                </div>

                {/* Mata Pelajaran & Kelas */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-200 mb-1">
                      Mata Pelajaran
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-white/20 bg-[#251E2B] focus:border-[#FFD36D] text-xs font-bold text-white focus:outline-none select-dark"
                    >
                      <option value="Matematika">Matematika</option>
                      <option value="IPAS">IPAS</option>
                      <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                      <option value="Pendidikan Pancasila">Pendidikan Pancasila</option>
                      <option value="Seni Budaya">Seni Budaya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-200 mb-1">
                      Kelas SD
                    </label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-white/20 bg-[#251E2B] focus:border-[#FFD36D] text-xs font-bold text-white focus:outline-none select-dark"
                    >
                      {[1, 2, 3, 4, 5, 6].map((g) => (
                        <option key={g} value={g}>
                          Kelas {g} SD
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Footer Buttons Step 2 */}
                <div className="pt-3 flex items-center justify-between border-t border-white/10 gap-3">
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    className="py-2.5 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
                  >
                    Kembali
                  </button>

                  <button
                    type="submit"
                    disabled={!customTitle.trim()}
                    className="py-2.5 px-6 rounded-2xl bg-[#FFD36D] hover:bg-[#FFE085] text-[#23212A] font-extrabold text-xs shadow-md transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
                  >
                    <span>Lanjut</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            {/* ===================================================================
                STEP 3: PILIH KONTEN
                =================================================================== */}
            {wizardStep === 3 && (
              <form onSubmit={handleSaveRoom} className="w-full space-y-4 animate-in fade-in zoom-in-95 duration-200">
                {/* Resource Picker Materi */}
                {(roomType === "material" || roomType === "both") && (
                  <div>
                    <label className="block text-xs font-bold text-gray-200 mb-1">
                      Pilih Materi
                    </label>
                    {materials.length === 0 ? (
                      <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-gray-400 text-center">
                        Belum ada modul materi tersimpan.
                      </div>
                    ) : (
                      <select
                        value={selectedResourceId}
                        onChange={(e) => setSelectedResourceId(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-white/20 bg-[#251E2B] focus:border-[#FFD36D] text-xs font-bold text-white focus:outline-none select-dark"
                      >
                        {materials.map((m) => (
                          <option key={m.id} value={m.id}>
                            [{m.id}] {m.title} ({m.subject})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                {/* Resource Picker Soal */}
                {(roomType === "question" || roomType === "both") && (
                  <div>
                    <label className="block text-xs font-bold text-gray-200 mb-1">
                      Pilih Soal
                    </label>
                    {questions.length === 0 ? (
                      <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-gray-400 text-center">
                        Belum ada butir soal tersimpan.
                      </div>
                    ) : (
                      <select
                        value={roomType === "both" ? secondaryResourceId : selectedResourceId}
                        onChange={(e) => {
                          if (roomType === "both") {
                            setSecondaryResourceId(e.target.value);
                          } else {
                            setSelectedResourceId(e.target.value);
                          }
                        }}
                        className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-white/20 bg-[#251E2B] focus:border-[#FFD36D] text-xs font-bold text-white focus:outline-none select-dark"
                      >
                        {questions.map((q) => (
                          <option key={q.id} value={q.id}>
                            [{q.id}] {q.topic || "Butir Asesmen"} ({q.subject})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                {/* Footer Buttons Step 3 */}
                <div className="pt-3 flex items-center justify-between border-t border-white/10 gap-3">
                  <button
                    type="button"
                    onClick={() => setWizardStep(2)}
                    className="py-2.5 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
                  >
                    Kembali
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="py-2.5 px-6 rounded-2xl bg-[#FFD36D] hover:bg-[#FFE085] text-[#23212A] font-extrabold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>{isSubmitting ? "Menyimpan..." : "Simpan"}</span>
                  </button>
                </div>
              </form>
            )}

            {/* ===================================================================
                STEP 4: SUKSES / SELESAI
                =================================================================== */}
            {wizardStep === 4 && createdRoom && (
              <div className="w-full text-center py-4 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-lg sm:text-xl font-black text-white">
                    Ruang Belajar Berhasil Diterbitkan!
                  </h4>
                  <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-xl bg-white/10 border border-white/15">
                    <span className="text-[11px] text-gray-300">Kode Room:</span>
                    <span className="font-mono text-sm font-bold text-[#FFD36D]">
                      {createdRoom.code}
                    </span>
                  </div>
                </div>

                {/* Big Code Card */}
                <div className="p-4 rounded-2xl bg-white/10 border-2 border-[#FFD36D]/60 max-w-xs mx-auto text-center space-y-2">
                  <span className="text-2xl sm:text-3xl font-mono font-black text-[#FFD36D] tracking-widest block">
                    {createdRoom.code}
                  </span>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleCopyCode(createdRoom.code)}
                      className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedCode === createdRoom.code ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-300">Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-gray-300" />
                          <span>Salin Kode</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const url = `${window.location.origin}/room/${createdRoom.code}`;
                        handleCopyCode(url);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-gray-300" />
                      <span>Salin Link</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                  <Link
                    href={`/room/${createdRoom.code}`}
                    target="_blank"
                    className="w-full py-3 px-5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 text-white font-extrabold text-xs sm:text-sm text-center transition-all flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Buka Room Sekarang</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setIsWizardOpen(false)}
                    className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-[#FFD36D] to-[#FDB040] text-[#251E2B] text-xs sm:text-sm font-extrabold shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    Selesai & Tutup
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </TeacherWorkspaceShell>
  );
}
