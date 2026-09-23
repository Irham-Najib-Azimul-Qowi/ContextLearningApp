"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { TeacherWorkspaceShell } from "@/components/layout/teacher-workspace-shell";
import { repository } from "@/lib/db/repository";
import { LearningMaterial, ClassRoom } from "@/lib/db/types";
import {
  BookOpen,
  Plus,
  Sparkles,
  MapPin,
  CheckCircle,
  Share2,
  FileText,
  Search,
  School,
  Layers,
} from "lucide-react";

export default function TeacherMaterialsPage() {
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [activeSchool, setActiveSchool] = useState<string>("sch-ponorogo-01");
  const [selectedSubject, setSelectedSubject] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedMaterial, setSelectedMaterial] = useState<LearningMaterial | null>(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState<boolean>(false);
  const [selectedClassesToPublish, setSelectedClassesToPublish] = useState<string[]>([]);
  const [publishMessage, setPublishMessage] = useState<string | null>(null);

  useEffect(() => {
    const school = repository.getActiveSchool();
    setActiveSchool(school.id);
    setMaterials(repository.getMaterials(school.id));
    setClasses(repository.getClasses(school.id));
  }, []);

  const handleOpenPublish = (mat: LearningMaterial) => {
    setSelectedMaterial(mat);
    setSelectedClassesToPublish(mat.published_to_classes || []);
    setIsPublishModalOpen(true);
    setPublishMessage(null);
  };

  const handleSavePublish = () => {
    if (!selectedMaterial) return;
    repository.publishMaterial(selectedMaterial.id, selectedClassesToPublish);
    setMaterials(repository.getMaterials(activeSchool));
    setPublishMessage("Distribusi materi ke kelas berhasil diperbarui!");
    setTimeout(() => {
      setIsPublishModalOpen(false);
      setPublishMessage(null);
    }, 1200);
  };

  const toggleClassSelect = (classId: string) => {
    if (selectedClassesToPublish.includes(classId)) {
      setSelectedClassesToPublish(selectedClassesToPublish.filter((id) => id !== classId));
    } else {
      setSelectedClassesToPublish([...selectedClassesToPublish, classId]);
    }
  };

  const filteredMaterials = materials.filter((m) => {
    const matchSubject = selectedSubject === "ALL" || m.subject.toLowerCase() === selectedSubject.toLowerCase();
    const matchSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSubject && matchSearch;
  });

  return (
    <TeacherWorkspaceShell>
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                <BookOpen className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Modul Materi Pembelajaran
              </h1>
            </div>
            <p className="text-sm text-slate-500">
              Kelola bahan ajar kontekstual berbasis kearifan lokal Karesidenan Madiun & Ponorogo.
            </p>
          </div>

          <Link
            href="/teacher/materials/create"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-xs hover:shadow transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Materi Baru</span>
          </Link>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari judul materi atau isi bacaan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
            {["ALL", "Matematika", "Bahasa Indonesia", "IPS"].map((subj) => (
              <button
                key={subj}
                onClick={() => setSelectedSubject(subj)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedSubject === subj
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                {subj === "ALL" ? "Semua Mapel" : subj}
              </button>
            ))}
          </div>
        </div>

        {/* Materials List */}
        {filteredMaterials.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800 mb-1">
              Belum ada materi ditemukan
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
              Mulai membuat materi terkontekstualisasi dengan kearifan lokal menggunakan bantuan AI atau input manual.
            </p>
            <Link
              href="/teacher/materials/create"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              Buat Materi Sekarang
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMaterials.map((mat) => {
              const publishedClassesList = classes.filter((c) =>
                mat.published_to_classes?.includes(c.id)
              );

              return (
                <div
                  key={mat.id}
                  className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                          Kelas {mat.grade} SD
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-medium">
                          {mat.subject}
                        </span>
                        {mat.is_contextualized && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold">
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            Konteks Lokal Terverifikasi
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(mat.created_at).toLocaleDateString("id-ID")}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">
                      {mat.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                      {mat.content}
                    </p>

                    {/* Regional Badge */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>Fokus Wilayah: <strong>Kabupaten Ponorogo & Karesidenan Madiun</strong></span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs text-slate-500">
                        {publishedClassesList.length > 0 ? (
                          <span className="text-emerald-600 font-medium">
                            Aktif di {publishedClassesList.length} kelas ({publishedClassesList.map((c) => c.name).join(", ")})
                          </span>
                        ) : (
                          <span className="text-amber-600 font-medium">Draft (Belum dibagikan)</span>
                        )}
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenPublish(mat)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>Distribusi Kelas</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Publish to Classes */}
        {isPublishModalOpen && selectedMaterial && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-2 mb-2">
                <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <Share2 className="w-5 h-5" />
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Distribusi Materi ke Kelas
                </h3>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Pilih kelas murid yang diizinkan untuk membaca materi <strong>&ldquo;{selectedMaterial.title}&rdquo;</strong>.
              </p>

              {publishMessage && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>{publishMessage}</span>
                </div>
              )}

              <div className="space-y-2 mb-6 max-h-60 overflow-y-auto pr-1">
                {classes.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">
                    Belum ada kelas terdaftar di sekolah ini.
                  </p>
                ) : (
                  classes.map((cls) => {
                    const isChecked = selectedClassesToPublish.includes(cls.id);
                    return (
                      <label
                        key={cls.id}
                        onClick={() => toggleClassSelect(cls.id)}
                        className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                          isChecked
                            ? "bg-indigo-50/60 border-indigo-200 text-indigo-900 font-semibold"
                            : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <div>
                            <div>{cls.name}</div>
                            <div className="text-[11px] text-slate-400 font-normal">
                              Kode: {cls.code} &bull; {cls.student_count} Murid
                            </div>
                          </div>
                        </div>
                        <School className="w-4 h-4 text-slate-400" />
                      </label>
                    );
                  })
                )}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsPublishModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  onClick={handleSavePublish}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                >
                  Simpan Distribusi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TeacherWorkspaceShell>
  );
}
