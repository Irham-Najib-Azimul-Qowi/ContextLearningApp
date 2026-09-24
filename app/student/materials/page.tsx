"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { StudentWorkspaceShell } from "@/components/layout/student-workspace-shell";
import { repository } from "@/lib/db/repository";
import { LearningMaterial, ClassRoom } from "@/lib/db/types";
import {
  BookOpen,
  Sparkles,
  MapPin,
  ArrowRight,
  Eye,
  CheckCircle,
  Clock,
  Layers,
  Search,
} from "lucide-react";

export default function StudentMaterialsPage() {
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<LearningMaterial | null>(null);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    // Current student: usr-student-01
    const studentClasses = repository.getStudentClasses("usr-student-01");
    setClasses(studentClasses);

    const classIds = studentClasses.map((c) => c.id);
    const allMaterials = repository.getMaterials();

    // Filter materials published to this student's classes
    const available = allMaterials.filter((m) =>
      m.published_to_classes && m.published_to_classes.some((id) => classIds.includes(id))
    );
    setMaterials(available);
  }, []);

  const filteredMaterials = materials.filter((m) => {
    const matchSubject = activeTab === "ALL" || m.subject.toLowerCase() === activeTab.toLowerCase();
    const matchSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSubject && matchSearch;
  });

  return (
    <StudentWorkspaceShell>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header Sapaan Belajar */}
        <div className="bg-gradient-to-r from-sky-500 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Materi Asyik Berdasarkan Daerah Kita
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
              Bahan Bacaan & Cerita Belajar
            </h1>
            <p className="text-white/90 text-xs sm:text-sm leading-relaxed">
              Pelajari berbagai hal menarik di sekitarmu, mulai dari tanaman porang, sapi perah Pudak, hingga kesenian Reog Ponorogo!
            </p>
          </div>
          <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-white/10 rounded-full blur-xl" />
        </div>

        {/* Filter Mapel & Pencarian */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {["ALL", "Matematika", "Bahasa Indonesia", "IPS"].map((subj) => (
              <button
                key={subj}
                onClick={() => setActiveTab(subj)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === subj
                    ? "bg-sky-500 text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                {subj === "ALL" ? "Semua Pelajaran" : subj}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari materi cerita..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>
        </div>

        {/* Daftar Materi */}
        {filteredMaterials.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-1">
              Belum ada materi untuk dibaca
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Ibu Guru sedang menyiapkan bacaan seru untuk kelasmu. Silakan kembali lagi nanti ya!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMaterials.map((mat) => (
              <div
                key={mat.id}
                onClick={() => setSelectedMaterial(mat)}
                className="bg-white rounded-2xl border-2 border-slate-100 hover:border-sky-300 p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-lg bg-sky-100 text-sky-800 text-xs font-bold">
                      {mat.subject}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 text-xs font-bold">
                      Kelas {mat.grade} SD
                    </span>
                    {mat.is_contextualized && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        Khas Daerah Kita
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-600 transition-colors mb-2 line-clamp-2">
                    {mat.title}
                  </h3>

                  {(mat.image_url || mat.media_asset?.image_url) && (
                    <div className="mb-3 rounded-xl overflow-hidden max-h-36 bg-slate-100 border border-slate-200">
                      <img
                        src={mat.image_url || mat.media_asset?.image_url}
                        alt={mat.image_alt || mat.media_asset?.alt_text || mat.title}
                        className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                    {mat.content}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>Daerah Lokal Terpilih</span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 group-hover:translate-x-1 transition-transform">
                    <span>Baca Cerita</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Pop-up Baca Materi (Kid-Friendly Reader) */}
        {selectedMaterial && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
            <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold">
                      {selectedMaterial.subject} Kelas {selectedMaterial.grade}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      Kearifan Lokal
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
                    {selectedMaterial.title}
                  </h2>
                </div>

                <button
                  onClick={() => setSelectedMaterial(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  &times;
                </button>
              </div>

              {/* Konten Bacaan Nyaman */}
              <div className="my-6 overflow-y-auto pr-2 space-y-4 text-slate-700 text-sm sm:text-base leading-relaxed font-normal">
                {(selectedMaterial.image_url || selectedMaterial.media_asset?.image_url) && (
                  <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                    <div className="max-h-72 w-full bg-slate-900/5 flex items-center justify-center overflow-hidden">
                      <img
                        src={selectedMaterial.image_url || selectedMaterial.media_asset?.image_url}
                        alt={selectedMaterial.image_alt || selectedMaterial.media_asset?.alt_text || selectedMaterial.title}
                        className="w-full max-h-72 object-contain"
                      />
                    </div>
                    {(selectedMaterial.image_caption || selectedMaterial.media_asset?.caption) && (
                      <div className="px-3.5 py-2 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
                        <span className="font-medium text-slate-800">
                          📷 {selectedMaterial.image_caption || selectedMaterial.media_asset?.caption}
                        </span>
                        {(selectedMaterial.image_attribution || selectedMaterial.media_asset?.attribution_text) && (
                          <span className="text-[11px] text-slate-400">
                            Sumber: {selectedMaterial.image_attribution || selectedMaterial.media_asset?.attribution_text}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="p-4 bg-sky-50/50 rounded-2xl border border-sky-100 flex items-center gap-3 text-xs text-sky-900 font-medium">
                  <Sparkles className="w-5 h-5 text-sky-600 shrink-0" />
                  <span>
                    Materi ini dibuat khusus oleh Guru untuk siswa agar pelajaran lebih mudah dipahami dan berkaitan dengan kekayaan budaya serta lingkungan sehari-hari.
                  </span>
                </div>

                <div className="bg-white p-2 rounded-xl text-slate-800 whitespace-pre-line text-sm sm:text-base leading-relaxed">
                  {selectedMaterial.content}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedMaterial(null)}
                  className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  Selesai Membaca & Kembali
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentWorkspaceShell>
  );
}
