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
} from "lucide-react";
import { TeacherWorkspaceShell } from "@/components/layout/teacher-workspace-shell";
import { repository } from "@/lib/db/repository";
import { LearningRoom, School, UserProfile } from "@/lib/db/types";

export default function TeacherRoomsPage() {
  const [rooms, setRooms] = useState<LearningRoom[]>([]);
  const [, setSchool] = useState<School | null>(null);
  const [, setUser] = useState<UserProfile | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"all" | "material" | "question" | "both">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = () => {
    const activeSchool = repository.getActiveSchool();
    setSchool(activeSchool);
    const currentUser = repository.getCurrentUser();
    setUser(currentUser);
    const allRooms = repository.getRooms(currentUser?.id);
    setRooms(allRooms);
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
      <div className="space-y-6 sm:space-y-8 pb-12">
        {/* ===================================================================
            1. JUDUL SAJA (HAPUS CARD PALING ATAS BERISI JUDUL)
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
            2. TOOLBAR: BUTTON TAMBAH ROOM + SEARCH BAR + FILTER ROOM LANGSUNG AKTIF
            =================================================================== */}
        {/* Toolbar: Button Tambah Room + Search Bar + Filter Room (Dark Gradient Wrapper) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-[#3E3547] via-[#332A3B] to-[#251E2B] p-3.5 sm:p-4 rounded-[24px] sm:rounded-3xl border border-[#5A4F65] shadow-lg">
          {/* Button Tambah Room */}
          <Link
            href="/teacher/rooms/new"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#FFD36D] to-[#FDB040] hover:from-[#FFE085] hover:to-[#FFBD59] text-[#251E2B] text-xs sm:text-sm font-extrabold shadow-md hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-0.5 active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tambah Room</span>
          </Link>

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
    </TeacherWorkspaceShell>
  );
}
