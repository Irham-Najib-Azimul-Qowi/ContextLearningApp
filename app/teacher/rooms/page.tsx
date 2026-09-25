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

  useEffect(() => {
    const activeSchool = repository.getActiveSchool();
    setSchool(activeSchool);
    const currentUser = repository.getCurrentUser();
    setUser(currentUser);
    const allRooms = repository.getRooms(currentUser?.id);
    setRooms(allRooms);
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
      <div className="space-y-6 sm:space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#51465B] bg-[#51465B]/10 px-2.5 py-0.5 rounded-full">
                Sistem Berbagi Akses Siswa
              </span>
              <span className="text-xs text-[#756F7A] font-semibold">
                Tanpa Akun Murid
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#23212A] tracking-tight mt-1">
              Room Akses Materi & Soal
            </h1>
            <p className="text-xs sm:text-sm text-[#756F7A] font-semibold mt-0.5">
              Bagikan modul dan paket soal kontekstual ke siswa via URL langsung atau 6 digit kode room.
            </p>
          </div>

          <Link
            href="/teacher/rooms/new"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#51465B] hover:bg-[#3D3445] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-0.5 active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Buat Room Baru</span>
          </Link>
        </div>

        {/* Info Banner: How It Works */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs sm:text-[13px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-200/70 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold block">Akses Praktis untuk Siswa:</span>
              <span className="text-amber-800/90 leading-relaxed block mt-0.5">
                Siswa tidak memerlukan akun atau login. Cukup beri siswa <strong>URL langsung</strong> atau minta siswa memasukkan <strong>Kode Room</strong> di beranda lalu mengisi nama mereka.
              </span>
            </div>
          </div>
          <Link
            href="/room"
            target="_blank"
            className="px-3.5 py-1.5 rounded-xl bg-white text-amber-900 font-bold border border-amber-300 shadow-2xs hover:bg-amber-100/50 transition-colors shrink-0 flex items-center gap-1.5 text-xs"
          >
            <span>Coba Portal Masuk Kode</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Segmented Filter */}
          <div className="flex items-center gap-1 bg-[#23212A]/5 p-1 rounded-2xl self-start">
            <button
              type="button"
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterType === "all"
                  ? "bg-white text-[#23212A] shadow-xs"
                  : "text-[#756F7A] hover:text-[#23212A]"
              }`}
            >
              Semua Room ({rooms.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("material")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterType === "material"
                  ? "bg-white text-[#23212A] shadow-xs"
                  : "text-[#756F7A] hover:text-[#23212A]"
              }`}
            >
              Materi Modul
            </button>
            <button
              type="button"
              onClick={() => setFilterType("question")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterType === "question"
                  ? "bg-white text-[#23212A] shadow-xs"
                  : "text-[#756F7A] hover:text-[#23212A]"
              }`}
            >
              Latihan Soal
            </button>
            <button
              type="button"
              onClick={() => setFilterType("both")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterType === "both"
                  ? "bg-white text-[#23212A] shadow-xs"
                  : "text-[#756F7A] hover:text-[#23212A]"
              }`}
            >
              Materi & Soal
            </button>
          </div>

          {/* Search Box */}
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756F7A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kode atau judul..."
              className="w-full pl-9 pr-3.5 py-2 rounded-2xl bg-white border border-[#E9E5E8] text-xs font-medium text-[#23212A] placeholder:text-[#756F7A]/60 focus:outline-none focus:ring-2 focus:ring-[#51465B]"
            />
          </div>
        </div>

        {/* Room Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredRooms.map((room) => {
            const isMaterial = room.type === "material";
            const isBoth = room.type === "both";
            const visitorCount = room.visitors?.length || room.access_count || 0;

            return (
              <div
                key={room.id}
                className="bg-white rounded-3xl border border-[#E9E5E8] p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Badge & Type */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isBoth
                          ? "bg-emerald-50 text-emerald-800"
                          : isMaterial
                          ? "bg-[#51465B]/10 text-[#51465B]"
                          : "bg-[#FFD36D]/30 text-[#51465B]"
                      }`}
                    >
                      {isBoth ? (
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                      ) : isMaterial ? (
                        <BookOpen className="w-3 h-3" />
                      ) : (
                        <Brain className="w-3 h-3" />
                      )}
                      <span>{isBoth ? "Materi + Soal" : isMaterial ? "Modul Materi" : "Paket Soal"}</span>
                    </span>

                    <span className="text-[11px] font-bold text-[#756F7A] bg-[#FAF7F3] px-2 py-0.5 rounded-lg border border-[#E9E5E8]">
                      Kelas {room.grade} &bull; {room.subject}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-black text-[#23212A] group-hover:text-[#51465B] transition-colors leading-snug line-clamp-2 mb-2">
                    {room.title}
                  </h3>

                  {/* Region Context Tag */}
                  <div className="text-[11px] font-semibold text-[#756F7A] mb-4">
                    Konteks: {room.region_name}
                  </div>

                  {/* Code Highlight Box */}
                  <div className="bg-[#FAF7F3] border border-[#E9E5E8] rounded-2xl p-3 flex items-center justify-between mb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#756F7A] block">
                        Kode Akses Siswa
                      </span>
                      <span className="font-mono text-base font-black tracking-widest text-[#23212A]">
                        {room.code}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyCode(room.code)}
                      className="px-2.5 py-1.5 rounded-xl bg-white border border-[#E9E5E8] text-[11px] font-bold text-[#51465B] hover:bg-[#51465B] hover:text-white transition-all cursor-pointer flex items-center gap-1"
                      title="Salin Kode Akses"
                    >
                      {copiedCode === room.code ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="space-y-2 pt-3 border-t border-[#E9E5E8]">
                  <div className="flex items-center justify-between text-xs text-[#756F7A]">
                    <span className="font-bold flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-[#51465B]" />
                      <span>{visitorCount} siswa mengakses</span>
                    </span>

                    {room.visitors && room.visitors.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedRoom(room)}
                        className="text-[11px] font-bold text-[#51465B] hover:underline cursor-pointer"
                      >
                        Lihat Nama &rarr;
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleCopyLink(room.code)}
                      className="w-full py-2 px-3 rounded-xl bg-white border border-[#E9E5E8] text-[11px] font-bold text-[#23212A] hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {copiedLink === room.code ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Link Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Salin Link</span>
                        </>
                      )}
                    </button>

                    <Link
                      href={`/room/${room.code}`}
                      target="_blank"
                      className="w-full py-2 px-3 rounded-xl bg-[#FAF7F3] border border-[#E9E5E8] text-[11px] font-bold text-[#51465B] hover:bg-[#51465B] hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5 text-center"
                    >
                      <span>Buka Room</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredRooms.length === 0 && (
          <div className="py-16 text-center bg-white rounded-3xl border border-[#E9E5E8] p-8 max-w-md mx-auto">
            <DoorOpen className="w-12 h-12 text-[#756F7A]/40 mx-auto mb-3" />
            <h3 className="text-base font-black text-[#23212A]">Belum Ada Room</h3>
            <p className="text-xs text-[#756F7A] mt-1 mb-5">
              Terbitkan materi atau latihan soal Anda menjadi room dengan kode unik dan URL yang dapat langsung diakses siswa.
            </p>
            <Link
              href="/teacher/rooms/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#51465B] text-white text-xs font-bold"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Room Pertama</span>
            </Link>
          </div>
        )}

        {/* Modal List Visitors */}
        {selectedRoom && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div>
                  <span className="text-[10px] font-bold text-[#756F7A] uppercase tracking-wider">
                    Kode: {selectedRoom.code}
                  </span>
                  <h3 className="text-base font-black text-[#23212A]">
                    Daftar Siswa Mengakses
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedRoom(null)}
                  className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500 font-bold"
                >
                  &times;
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {selectedRoom.visitors && selectedRoom.visitors.length > 0 ? (
                  selectedRoom.visitors.map((visitor, idx) => (
                    <div
                      key={idx}
                      className="py-2.5 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#51465B]/10 text-[#51465B] font-black flex items-center justify-center text-[11px]">
                          {visitor.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-[#23212A]">{visitor.name}</div>
                          <div className="text-[10px] text-[#756F7A]">
                            {new Date(visitor.accessed_at).toLocaleString("id-ID", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </div>

                      {visitor.score !== undefined ? (
                        <span className="font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/60 text-xs">
                          Skor: {visitor.score}
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md">
                          Selesai Membaca
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400">
                    Belum ada siswa yang mengakses room ini.
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedRoom(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TeacherWorkspaceShell>
  );
}
