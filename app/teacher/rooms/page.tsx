"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  DoorOpen,
  Plus,
  Copy,
  Check,
  ExternalLink,
  BookOpen,
  Brain,
  Users,
  Search,
  Sparkles,
  Share2,
  Trash2,
  MapPin,
  Calendar,
  Eye,
} from "lucide-react";
import { TeacherWorkspaceShell } from "@/components/layout/teacher-workspace-shell";
import { repository } from "@/lib/db/repository";
import { LearningRoom, School, UserProfile } from "@/lib/db/types";

export default function TeacherRoomsPage() {
  const [rooms, setRooms] = useState<LearningRoom[]>([]);
  const [school, setSchool] = useState<School | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"all" | "material" | "question" | "both">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<LearningRoom | null>(null);

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

  const handleCopyLink = (code: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const fullUrl = `${origin}/room/${code}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(code);
    setTimeout(() => setCopiedLink(null), 2000);
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
            3. ROOM CARDS: KOTAK (GRID) DENGAN WARNA SESUAI ISI:
               - Soal saja: Warna khas soal (#FFD36D / Amber)
               - Materi saja: Warna khas materi (#51465B / Purple)
               - Keduanya: Gradasi antara warna materi & soal
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
              const visitorCount = room.visitors?.length || room.access_count || 0;

              // Card Color Style: Solid for Material (#51465B), Solid for Question (#854D0E), Gradient for Both
              const cardColorClass = isBoth
                ? "bg-gradient-to-br from-[#51465B] via-[#634839] to-[#854D0E] text-white border border-white/20 shadow-md hover:shadow-xl"
                : isMaterial
                ? "bg-[#51465B] text-white border border-[#675B73] shadow-md hover:shadow-xl"
                : "bg-[#854D0E] text-white border border-[#A16207]/40 shadow-md hover:shadow-xl";

              return (
                <div
                  key={room.id}
                  className={`rounded-[32px] p-6 transition-all duration-200 flex flex-col justify-between group relative overflow-hidden ${cardColorClass}`}
                >
                  {/* Top Content Header (Ikon Dihapus Sesuai Permintaan) */}
                  <div>
                    {/* Top Row: Type Badge + Grade (Tanpa Ikon) */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-[#FFD36D] shadow-2xs">
                        <span>{isBoth ? "Materi & Soal" : isMaterial ? "Materi" : "Soal"}</span>
                      </span>

                      <span className="text-[11px] font-bold text-white bg-white/10 px-2.5 py-1 rounded-full border border-white/15">
                        Kelas {room.grade} SD
                      </span>
                    </div>

                    {/* Room Title */}
                    <h3 className="text-base sm:text-lg font-black text-white leading-snug line-clamp-2 mb-2">
                      {room.title}
                    </h3>

                    {/* Subject & Region Context */}
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-200 mb-4">
                      <span>{room.subject}</span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#FFD36D]" />
                        <span>{room.region_name}</span>
                      </span>
                    </div>

                    {/* Code Highlight Box */}
                    <div className="bg-black/25 backdrop-blur-xs border border-white/15 rounded-2xl p-3.5 flex items-center justify-between mb-4 shadow-inner text-white">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-300 block">
                          Kode Room Siswa
                        </span>
                        <span className="font-mono text-base font-black tracking-widest text-[#FFD36D]">
                          {room.code}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleCopyCode(room.code)}
                          className="px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border border-white/20"
                          title="Salin Kode Akses"
                        >
                          {copiedCode === room.code ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Tersalin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-gray-200" />
                              <span>Salin</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="pt-3 border-t border-white/15 space-y-3">
                    <div className="flex items-center justify-between text-xs text-gray-200">
                      <span className="font-bold flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#FFD36D]" />
                        <span>{visitorCount} siswa mengakses</span>
                      </span>

                      {room.visitors && room.visitors.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedRoom(room)}
                          className="text-xs font-bold text-[#FFD36D] hover:underline cursor-pointer"
                        >
                          Lihat Siswa &rarr;
                        </button>
                      )}
                    </div>

                    {/* Action Buttons Row */}
                    <div className="flex items-center gap-2">
                      {/* Tombol Lihat Room */}
                      <Link
                        href={`/room/${room.code}`}
                        target="_blank"
                        className="flex-1 py-2 px-3 rounded-full bg-gradient-to-r from-[#FFD36D] to-[#FDB040] hover:from-[#FFE085] hover:to-[#FFBD59] text-[#251E2B] text-xs font-black text-center transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                      >
                        <Eye className="w-3.5 h-3.5 stroke-[2.2]" />
                        <span>Lihat Room</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleCopyLink(room.code)}
                        className="p-2 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors border border-white/20 cursor-pointer shadow-2xs"
                        title="Salin Tautan Room Langsung"
                      >
                        {copiedLink === room.code ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Share2 className="w-3.5 h-3.5 text-gray-200" />
                        )}
                      </button>

                      {/* Tombol Sampah Merah */}
                      <button
                        type="button"
                        onClick={() => handleDeleteRoom(room.id)}
                        className="p-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white transition-all cursor-pointer shadow-md active:scale-95 shrink-0"
                        title="Hapus Room"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Visitor List Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-black text-[#23212A]">
                  Daftar Siswa Mengakses
                </h3>
                <p className="text-xs text-[#756F7A]">
                  Room: {selectedRoom.title} ({selectedRoom.code})
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRoom(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold"
              >
                &times;
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 py-2 divide-y divide-slate-100">
              {selectedRoom.visitors && selectedRoom.visitors.map((v, i) => (
                <div key={i} className="pt-2 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#23212A] block">{v.name}</span>
                    <span className="text-[10px] text-[#756F7A]">{new Date(v.accessed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {v.score !== undefined && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-black text-[11px]">
                      Skor: {v.score}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedRoom(null)}
                className="w-full py-2.5 rounded-full bg-[#51465B] text-white text-xs font-bold"
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
