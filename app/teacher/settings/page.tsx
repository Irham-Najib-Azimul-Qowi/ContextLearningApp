"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Settings,
  User,
  School as SchoolIcon,
  MapPin,
  Shield,
  LogOut,
  CheckCircle2,
  Save,
  Globe,
  Palette,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { TeacherWorkspaceShell } from "@/components/layout/teacher-workspace-shell";
import { repository } from "@/lib/db/repository";
import { School } from "@/lib/db/types";

const ALL_REGIONS = [
  { id: "35.77", name: "Kota Madiun", desc: "Kota Pendekar & Sentra Industri Kereta Api (INKA)" },
  { id: "35.19", name: "Kabupaten Madiun", desc: "Sentra Kampung Pesilat & Agrikultur Caruban" },
  { id: "35.21", name: "Kabupaten Ngawi", desc: "Benteng Pendem Van den Bosch & Lumbung Padi Jawa Timur" },
  { id: "35.20", name: "Kabupaten Magetan", desc: "Telaga Sarangan, Kerajinan Kulit & Agrowisata Lereng Lawu" },
  { id: "35.02", name: "Kabupaten Ponorogo", desc: "Bumi Reog, Sentra Porang & Peternakan Sapi Perah Pudak" },
  { id: "35.01", name: "Kabupaten Pacitan", desc: "Kota 1001 Goa, Kawasan Geopark Gunung Sewu & Pesisir Pantai" },
  { id: "33.74", name: "Kota Semarang", desc: "Ibu Kota Jawa Tengah, Kota Lama, Lawang Sewu & Kawasan Pesisir Tanjung Emas" },
];

export default function TeacherSettingsPage() {
  const router = useRouter();
  const [activeSchool, setActiveSchool] = useState<School | null>(null);
  const [userName, setUserName] = useState<string>("Bapak Irham Najib, S.Pd.");
  const [userEmail, setUserEmail] = useState<string>("irham.guru@gmail.com");
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("sch-ponorogo-01");
  const [targetRegion, setTargetRegion] = useState<string>("Kabupaten Ponorogo");
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Preference switches
  const [useLocalDialect, setUseLocalDialect] = useState<boolean>(true);
  const [autoAttachImages, setAutoAttachImages] = useState<boolean>(true);

  useEffect(() => {
    const school = repository.getActiveSchool();
    setActiveSchool(school);
    setSelectedSchoolId(school.id);
    setTargetRegion(school.region_name);

    const user = repository.getCurrentUser();
    if (user?.full_name) setUserName(user.full_name);
    if (user?.email) setUserEmail(user.email);
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    repository.setActiveSchoolId(selectedSchoolId);
    setActiveSchool(repository.getActiveSchool());
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleLogout = () => {
    router.push("/login");
  };

  return (
    <TeacherWorkspaceShell activeGroupId="settings">
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        {/* Header */}
        <div className="bg-white rounded-[28px] sm:rounded-[36px] border border-[#E9E5E8] p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#51465B] text-[#FFD36D] flex items-center justify-center shadow-xs">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#23212A] tracking-tight">
                Pengaturan Akun & Konfigurasi Wilayah
              </h1>
              <p className="text-xs text-[#756F7A]">
                Kelola profil pengajar, sinkronisasi identitas sekolah, preferensi Local Knowledge Base, dan keamanan akun.
              </p>
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* Card 1: User Profile */}
          <div className="bg-white rounded-[28px] sm:rounded-[36px] border border-[#E9E5E8] p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#E9E5E8]">
              <User className="w-4 h-4 text-[#51465B]" />
              <h2 className="text-sm font-extrabold text-[#23212A] uppercase tracking-wider">
                Profil Pengguna (Google OAuth)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-[#23212A] mb-1.5">
                  Nama Lengkap & Gelar
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F3] border border-[#E9E5E8] rounded-xl text-xs font-semibold text-[#23212A] focus:outline-none focus:ring-2 focus:ring-[#51465B]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#23212A] mb-1.5">
                  Alamat Email Akun
                </label>
                <input
                  type="email"
                  disabled
                  value={userEmail}
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-[#E9E5E8] rounded-xl text-xs font-mono text-[#756F7A] cursor-not-allowed"
                />
                <span className="text-[10px] text-[#756F7A] mt-1 block">
                  Terhubung via Google OAuth terverifikasi.
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: School & Region Configuration */}
          <div className="bg-white rounded-[28px] sm:rounded-[36px] border border-[#E9E5E8] p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#E9E5E8]">
              <SchoolIcon className="w-4 h-4 text-[#51465B]" />
              <h2 className="text-sm font-extrabold text-[#23212A] uppercase tracking-wider">
                Sekolah & Target Wilayah Kontekstual
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-[#23212A] mb-1.5">
                  Satuan Pendidikan Aktif
                </label>
                <select
                  value={selectedSchoolId}
                  onChange={(e) => {
                    setSelectedSchoolId(e.target.value);
                    const matched = repository.getSchools().find((s) => s.id === e.target.value);
                    if (matched) setTargetRegion(matched.region_name);
                  }}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F3] border border-[#E9E5E8] rounded-xl text-xs font-semibold text-[#23212A] focus:outline-none focus:ring-2 focus:ring-[#51465B]/20"
                >
                  {repository.getSchools().map((sch) => (
                    <option key={sch.id} value={sch.id}>
                      {sch.name} ({sch.region_name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#23212A] mb-1.5">
                  Target Konteks Wilayah (Prioritas RAG)
                </label>
                <select
                  value={targetRegion}
                  onChange={(e) => setTargetRegion(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F3] border border-[#E9E5E8] rounded-xl text-xs font-semibold text-[#23212A] focus:outline-none focus:ring-2 focus:ring-[#51465B]/20"
                >
                  {ALL_REGIONS.map((reg) => (
                    <option key={reg.id} value={reg.name}>
                      {reg.name} ({reg.id})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-3.5 rounded-[18px] bg-[#FAF7F3] border border-[#E9E5E8] text-xs text-[#756F7A] flex items-center gap-2.5 mt-2">
              <MapPin className="w-4 h-4 text-[#F47D83] shrink-0" />
              <span>
                Wilayah aktif saat ini menentukan filter data Local Knowledge Base (pgvector) pada saat pembuatan materi dan soal latihan Kelas 5 SD.
              </span>
            </div>
          </div>

          {/* Card 3: Pedagogical & AI Engine Preferences */}
          <div className="bg-white rounded-[28px] sm:rounded-[36px] border border-[#E9E5E8] p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#E9E5E8]">
              <Sparkles className="w-4 h-4 text-[#51465B]" />
              <h2 className="text-sm font-extrabold text-[#23212A] uppercase tracking-wider">
                Preferensi Contextual AI Engine
              </h2>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF7F3] border border-[#E9E5E8] cursor-pointer hover:bg-slate-100 transition-colors">
                <div>
                  <span className="font-bold text-xs text-[#23212A] block">
                    Gunakan Sisipan Istilah Budaya / Dialek Lokal Ramah Anak
                  </span>
                  <span className="text-[11px] text-[#756F7A] block mt-0.5">
                    Menyertakan istilah kearifan lokal seperti Reog, Benteng Van den Bosch, atau Kota Lama secara kontekstual.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={useLocalDialect}
                  onChange={(e) => setUseLocalDialect(e.target.checked)}
                  className="w-4 h-4 text-[#51465B] rounded-sm focus:ring-[#51465B]"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF7F3] border border-[#E9E5E8] cursor-pointer hover:bg-slate-100 transition-colors">
                <div>
                  <span className="font-bold text-xs text-[#23212A] block">
                    Sematkan Foto & Aset Visual Lokal Otomatis
                  </span>
                  <span className="text-[11px] text-[#756F7A] block mt-0.5">
                    Menampilkan gambar pendukung berlisensi terverifikasi yang cocok dengan materi ajar atau soal.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={autoAttachImages}
                  onChange={(e) => setAutoAttachImages(e.target.checked)}
                  className="w-4 h-4 text-[#51465B] rounded-sm focus:ring-[#51465B]"
                />
              </label>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-rose-200 text-rose-700 bg-rose-50/50 hover:bg-rose-100 text-xs font-bold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar dari Akun (Logout)</span>
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#51465B] hover:bg-[#3E3547] text-white text-xs font-black shadow-md transition-transform active:scale-95"
            >
              {isSaved ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#FFD36D]" />
                  <span>Pengaturan Berhasil Disimpan!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-[#FFD36D]" />
                  <span>Simpan Perubahan Pengaturan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </TeacherWorkspaceShell>
  );
}
