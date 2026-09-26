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
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [roomType, setRoomType] = useState<"material" | "question" | "both">("material");
  const [selectedResourceId, setSelectedResourceId] = useState("");
  const [secondaryResourceId, setSecondaryResourceId] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [subject, setSubject] = useState("Matematika");
  const [grade, setGrade] = useState(5);
  const [createdRoom, setCreatedRoom] = useState<LearningRoom | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateRandomCode = (type: "material" | "question" | "both") => {
    const prefix = type === "material" ? "mat" : type === "question" ? "sol" : "rom";
    const num = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}${num}`;
  };

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
    const code = generateRandomCode("material");
    setRoomCode(code);
    if (materials.length > 0) {
      setSelectedResourceId(materials[0].id);
      setCustomTitle(materials[0].title);
      setSubject(materials[0].subject || "Matematika");
      setGrade(materials[0].grade || 5);
    } else {
      setCustomTitle("Modul Pembelajaran Tematik");
    }
    setCreatedRoom(null);
    setIsWizardOpen(true);
  };

  // Step 1: Select Type
  const handleSelectType = (type: "material" | "question" | "both") => {
    setRoomType(type);
    setRoomCode(generateRandomCode(type));
    if (type === "material" && materials.length > 0) {
      setSelectedResourceId(materials[0].id);
      setCustomTitle(materials[0].title);
      setSubject(materials[0].subject || "Matematika");
      setGrade(materials[0].grade || 5);
    } else if (type === "question" && questions.length > 0) {
      setSelectedResourceId(questions[0].id);
      setCustomTitle(`Latihan: ${questions[0].topic || "Kontekstual"}`);
      setSubject(questions[0].subject || "Matematika");
      setGrade(questions[0].grade || 5);
    } else if (type === "both") {
      if (materials.length > 0) {
        setSelectedResourceId(materials[0].id);
        setCustomTitle(`Paket: ${materials[0].title}`);
        setSubject(materials[0].subject || "Matematika");
        setGrade(materials[0].grade || 5);
      }
      if (questions.length > 0) {
        setSecondaryResourceId(questions[0].id);
      }
    }
    setWizardStep(2);
  };

  // Step 2: Submit Room
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
    setWizardStep(3);
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
            1. JUDUL HALAMAN
            =================================================================== */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#23212A] tracking-tight">
            Room Akses Materi & Soal
          </h1>
          <p className="text-xs sm:text-sm text-[#756F7A] font-semibold mt-1">
            Bagikan modul materi dan paket soal kontekstual langsung ke siswa via URL atau kode room tanpa akun.
          </p>
        </div>

        {/* ===================================================================
            2. CARD UNTUK TAMBAH ROOM (DI ATAS SEARCH & FILTER BAR)
            =================================================================== */}
        <div className="p-4 sm:p-5 rounded-[24px] sm:rounded-3xl bg-gradient-to-r from-[#3E3547] via-[#332A3B] to-[#251E2B] border border-[#5A4F65] shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#FFD36D]/15 text-[#FFD36D] flex items-center justify-center shrink-0 border border-[#FFD36D]/30">
              <DoorOpen className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white tracking-tight">
                Tambah Ruang Belajar (Room)
              </h2>
              <p className="text-xs text-gray-300 font-medium">
                Buat room akses instan agar siswa dapat membaca materi atau latihan soal tanpa login.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenWizard}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-gradient-to-r from-[#FFD36D] to-[#FDB040] hover:from-[#FFE085] hover:to-[#FFBD59] text-[#251E2B] text-xs sm:text-sm font-black shadow-md hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-0.5 active:scale-95 shrink-0 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Tambah Room</span>
          </button>
        </div>

        {/* ===================================================================
            3. SEARCH BAR & FILTER ROOM
            =================================================================== */}
        <div className="space-y-4 pt-1">
          {/* Toolbar: Search Bar + Filter Room */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-[#3E3547] via-[#332A3B] to-[#251E2B] p-3.5 sm:p-4 rounded-[24px] sm:rounded-3xl border border-[#5A4F65] shadow-lg">
            {/* Search Bar */}
          <div className="relative flex-1 max-w-md w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#FFD36D]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kode room, judul, atau mapel..."
              className="w-full pl-9 pr-4 py-2.5 rounded-full bg-[#251E2B]/80 border-2 border-white/20 text-xs font-semibold text-white placeholder:text-gray-400 focus:outline-none focus:border-[#FFD36D] transition-colors"
            />
          </div>

          {/* Filter Room */}
          <div className="flex items-center gap-1.5 overflow-x-auto shrink-0">
            <button
              type="button"
              onClick={() => setFilterType("all")}
              className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filterType === "all"
                  ? "bg-gradient-to-r from-[#FFD36D] to-[#FDB040] text-[#251E2B] font-black shadow-xs"
                  : "bg-white/10 hover:bg-white/15 text-white border border-white/15"
              }`}
            >
              Semua ({rooms.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("material")}
              className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filterType === "material"
                  ? "bg-gradient-to-r from-[#FFD36D] to-[#FDB040] text-[#251E2B] font-black shadow-xs"
                  : "bg-white/10 hover:bg-white/15 text-white border border-white/15"
              }`}
            >
              Materi
            </button>
            <button
              type="button"
              onClick={() => setFilterType("question")}
              className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filterType === "question"
                  ? "bg-gradient-to-r from-[#FFD36D] to-[#FDB040] text-[#251E2B] font-black shadow-xs"
                  : "bg-white/10 hover:bg-white/15 text-white border border-white/15"
              }`}
            >
              Soal
            </button>
            <button
              type="button"
              onClick={() => setFilterType("both")}
              className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filterType === "both"
                  ? "bg-gradient-to-r from-[#FFD36D] to-[#FDB040] text-[#251E2B] font-black shadow-xs"
                  : "bg-white/10 hover:bg-white/15 text-white border border-white/15"
              }`}
            >
              Materi & Soal
            </button>
          </div>
        </div>

          {/* ===================================================================
              DAFTAR ROOM:
              - Gradasi jika materi & soal (from-[#51465B] via-[#634839] to-[#854D0E])
              - Warna materi jika materi saja (#51465B)
              - Warna soal jika soal saja (#854D0E)
              Layout: Judul & ID di samping kanan, Kategori di bawahnya,
              Deskripsi di tengah secara vertikal, Button Lihat Room + Button Hapus di samping kanannya.
              =================================================================== */}
          {filteredRooms.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-[#E9E5E8] space-y-3">
              <div className="w-14 h-14 rounded-full bg-[#FAF7F3] text-[#756F7A] mx-auto flex items-center justify-center">
                <DoorOpen className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-[#23212A]">Tidak ada room ditemukan</h3>
              <p className="text-xs text-[#756F7A] max-w-sm mx-auto">
                Silakan sesuaikan kata kunci pencarian atau buat room baru untuk dibagikan ke siswa.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredRooms.map((room) => {
                const isMaterial = room.type === "material";
                const isQuestion = room.type === "question";
                const isBoth = room.type === "both";

                // Card Color Style:
                // Gradasi jika materi & soal, atau salah satu jika hanya materi / hanya soal
                const cardColorClass = isBoth
                  ? "bg-gradient-to-br from-[#51465B] via-[#634839] to-[#854D0E] text-white border border-white/20 shadow-md hover:shadow-xl"
                  : isMaterial
                  ? "bg-[#51465B] text-white border border-[#675B73] shadow-md hover:shadow-xl"
                  : "bg-[#854D0E] text-white border border-[#A16207]/40 shadow-md hover:shadow-xl";

                const roomDescription = isBoth
                  ? `Ruang belajar tematik memuat modul materi pembelajaran dan butir latihan soal untuk wilayah ${room.region_name}.`
                  : isMaterial
                  ? `Ruang eksplorasi modul bahan ajar tematik Kurikulum Merdeka untuk wilayah ${room.region_name}.`
                  : `Ruang asesmen interaktif pengerjaan butir latihan soal kontekstual untuk wilayah ${room.region_name}.`;

                return (
                  <div
                    key={room.id}
                    className={`rounded-[28px] p-5 sm:p-6 transition-all duration-200 flex flex-col justify-between group relative overflow-hidden min-h-[220px] ${cardColorClass}`}
                  >
                    {/* Top: Judul & ID di samping kanan, Kategori di bawahnya */}
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-base sm:text-lg font-black text-white leading-snug line-clamp-2">
                          {room.title}
                        </h3>

                        {/* ID di samping kanan judul (Kode Room) */}
                        <button
                          type="button"
                          onClick={() => handleCopyCode(room.code)}
                          className="shrink-0 py-1 px-2.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 font-mono text-[11px] font-bold text-gray-200 flex items-center gap-1 cursor-pointer transition-colors"
                          title="Klik untuk menyalin kode room"
                        >
                          {copiedCode === room.code ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-300 font-sans text-[10px]">Tersalin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-gray-300" />
                              <span>{room.code}</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Di bawah judul: Kategori dengan warna lain */}
                      <div className="mt-1.5 text-xs sm:text-sm font-extrabold text-[#FFD36D] tracking-wide">
                        {isBoth ? "Materi & Soal" : isMaterial ? "Materi" : "Soal"} &bull; {room.subject} &bull; Kelas {room.grade} SD
                      </div>
                    </div>

                    {/* Di antara di tengah secara vertikal: sedikit deskripsi */}
                    <div className="my-auto py-3.5">
                      <p className="text-xs sm:text-sm text-gray-200/90 font-medium leading-relaxed line-clamp-2">
                        {roomDescription}
                      </p>
                    </div>

                    {/* Bottom: Button Lihat Room + Button Hapus di samping kanannya */}
                    <div className="pt-3 border-t border-white/15 flex items-center gap-2.5">
                      <Link
                        href={`/room/${room.code}`}
                        target="_blank"
                        className="flex-1 py-2.5 px-4 rounded-full bg-gradient-to-r from-[#FFD36D] to-[#FDB040] hover:from-[#FFE085] hover:to-[#FFBD59] text-[#251E2B] text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 text-center"
                      >
                        <Eye className="w-4 h-4 stroke-[2.2]" />
                        <span>Lihat Room</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDeleteRoom(room.id)}
                        className="p-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white transition-all cursor-pointer shadow-md active:scale-95 shrink-0"
                        title="Hapus Room"
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
      {/* =====================================================================
          CREATION WIZARD MODAL (LOGIN & ROOM ENTRY INSPIRED CLEAN STEP FORM)
          Step 1: Pilih Tipe Ruang (Materi, Soal, Materi & Soal)
          Step 2: Konfigurasi Konten & Nama Room (Pilih materi/soal, Judul, Kode)
          Step 3: Berhasil / Salin Link & Buka Room
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
              <DoorOpen className="w-6 h-6 stroke-[2.2]" />
            </div>

            {/* Step Dots Indicator */}
            <div className="flex items-center justify-center gap-1.5 mt-3 mb-4">
              <div className={`h-1.5 rounded-full transition-all duration-300 ${wizardStep === 1 ? "w-6 bg-[#FFD36D]" : "w-2 bg-[#FFD36D]/50"}`} />
              <div className={`h-1.5 rounded-full transition-all duration-300 ${wizardStep === 2 ? "w-6 bg-[#FFD36D]" : "w-2 bg-white/20"}`} />
              <div className={`h-1.5 rounded-full transition-all duration-300 ${wizardStep === 3 ? "w-6 bg-[#FFD36D]" : "w-2 bg-white/20"}`} />
            </div>

            {/* STEP 1: PILIH TIPE ROOM (seperti memilih cara login) */}
            {wizardStep === 1 && (
              <div className="w-full space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="text-center mb-1">
                  <h3 className="text-xl font-black text-white tracking-tight">
                    Pilih Tipe Ruang
                  </h3>
                  <p className="text-xs text-gray-300 mt-1">
                    Tentukan format aktivitas yang akan diakses siswa
                  </p>
                </div>

                <div className="space-y-2.5 pt-1">
                  {/* Tipe 1: Materi */}
                  <button
                    type="button"
                    onClick={() => handleSelectType("material")}
                    className="w-full p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 hover:border-[#FFD36D] flex items-center gap-3.5 transition-all cursor-pointer group text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/10 text-[#FFD36D] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-sm text-white group-hover:text-[#FFD36D] transition-colors">
                        Room Materi
                      </div>
                      <div className="text-[11px] text-gray-300 font-medium">
                        Siswa membaca & mempelajari modul tematik
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#FFD36D] group-hover:translate-x-0.5 transition-all" />
                  </button>

                  {/* Tipe 2: Soal Latihan */}
                  <button
                    type="button"
                    onClick={() => handleSelectType("question")}
                    className="w-full p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 hover:border-[#FFD36D] flex items-center gap-3.5 transition-all cursor-pointer group text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/10 text-[#FFD36D] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <FileQuestion className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-sm text-white group-hover:text-[#FFD36D] transition-colors">
                        Room Soal Latihan
                      </div>
                      <div className="text-[11px] text-gray-300 font-medium">
                        Siswa mengerjakan butir asesmen kontekstual
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#FFD36D] group-hover:translate-x-0.5 transition-all" />
                  </button>

                  {/* Tipe 3: Materi & Soal */}
                  <button
                    type="button"
                    onClick={() => handleSelectType("both")}
                    className="w-full p-4 rounded-2xl bg-gradient-to-r from-[#FFD36D]/20 to-[#FDB040]/10 hover:from-[#FFD36D]/30 hover:to-[#FDB040]/20 border border-[#FFD36D]/40 hover:border-[#FFD36D] flex items-center gap-3.5 transition-all cursor-pointer group text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#FFD36D] text-[#251E2B] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-sm text-[#FFD36D]">
                        Room Materi & Soal
                      </div>
                      <div className="text-[11px] text-gray-300 font-medium">
                        Paket komplit modul ajar sekaligus latihan soal
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#FFD36D] group-hover:translate-x-0.5 transition-all" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: KONFIGURASI KONTEN & NAMA ROOM */}
            {wizardStep === 2 && (
              <form onSubmit={handleSaveRoom} className="w-full space-y-4 animate-in fade-in zoom-in-95 duration-200 text-left">
                <div className="text-center mb-2">
                  <h3 className="text-xl font-black text-white tracking-tight">
                    Konfigurasi Room
                  </h3>
                  <p className="text-xs text-gray-300 mt-0.5">
                    Tipe: {roomType === "material" ? "Room Materi" : roomType === "question" ? "Room Soal Latihan" : "Materi & Soal"}
                  </p>
                </div>

                {/* Resource Picker */}
                {(roomType === "material" || roomType === "both") && (
                  <div>
                    <label className="block text-xs font-bold text-gray-200 mb-1">
                      Pilih Modul Materi
                    </label>
                    <select
                      value={selectedResourceId}
                      onChange={(e) => {
                        setSelectedResourceId(e.target.value);
                        const mat = materials.find((m) => m.id === e.target.value);
                        if (mat) {
                          setCustomTitle(roomType === "both" ? `Paket: ${mat.title}` : mat.title);
                          setSubject(mat.subject);
                          setGrade(mat.grade);
                        }
                      }}
                      className="w-full px-3.5 py-3 rounded-2xl border-2 border-white/20 bg-[#251E2B] focus:border-[#FFD36D] text-xs font-bold text-white focus:outline-none"
                    >
                      {materials.map((m) => (
                        <option key={m.id} value={m.id}>
                          [{m.id}] {m.title} ({m.subject})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {(roomType === "question" || roomType === "both") && (
                  <div>
                    <label className="block text-xs font-bold text-gray-200 mb-1">
                      Pilih Butir / Paket Soal
                    </label>
                    <select
                      value={roomType === "both" ? secondaryResourceId : selectedResourceId}
                      onChange={(e) => {
                        if (roomType === "both") {
                          setSecondaryResourceId(e.target.value);
                        } else {
                          setSelectedResourceId(e.target.value);
                          const q = questions.find((item) => item.id === e.target.value);
                          if (q) {
                            setCustomTitle(`Latihan: ${q.topic || "Kontekstual"}`);
                            setSubject(q.subject);
                            setGrade(q.grade);
                          }
                        }
                      }}
                      className="w-full px-3.5 py-3 rounded-2xl border-2 border-white/20 bg-[#251E2B] focus:border-[#FFD36D] text-xs font-bold text-white focus:outline-none"
                    >
                      {questions.map((q) => (
                        <option key={q.id} value={q.id}>
                          [{q.id}] {q.topic || "Butir Asesmen"} ({q.subject})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Nama Room */}
                <div>
                  <label className="block text-xs font-bold text-gray-200 mb-1">
                    Nama / Judul Ruang Belajar
                  </label>
                  <input
                    type="text"
                    required
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Contoh: Belajar Pecahan Pasar Tradisional"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-white/20 bg-[#251E2B]/80 focus:border-[#FFD36D] text-xs sm:text-sm font-bold text-white placeholder:text-gray-400 focus:outline-none transition-all shadow-inner"
                  />
                </div>

                {/* Kode Room */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-gray-200">
                      Kode Akses Room
                    </label>
                    <button
                      type="button"
                      onClick={() => setRoomCode(generateRandomCode(roomType))}
                      className="text-[11px] font-bold text-[#FFD36D] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Shuffle className="w-3 h-3" />
                      <span>Acak Ulang</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ""))}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-white/20 bg-[#251E2B]/80 focus:border-[#FFD36D] text-base font-mono font-black text-[#FFD36D] text-center tracking-widest focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-white/15">
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    className="py-2.5 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
                  >
                    Kembali
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="py-3 px-6 rounded-2xl bg-gradient-to-r from-[#FFD36D] to-[#FDB040] hover:from-[#FFE085] hover:to-[#FFBD59] text-[#251E2B] font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? "Menerbitkan..." : "Terbitkan Room"}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: SUKSES */}
            {wizardStep === 3 && createdRoom && (
              <div className="w-full text-center py-4 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg sm:text-xl font-black text-white">
                  Ruang Belajar Siap Diakses!
                </h4>
                <p className="text-xs text-gray-300 max-w-sm mx-auto">
                  Siswa dapat langsung membuka room tanpa registrasi menggunakan kode:
                </p>

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
