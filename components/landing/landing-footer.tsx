"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PahamiPuzzleLogo } from "./puzzle-logo";
import { Shield, ExternalLink, Lock } from "lucide-react";

/**
 * LandingFooter
 * Clean, modern Dark Mauve footer with rounded top corners, brand identity,
 * concise navigation, and accessible student data privacy modal.
 */
export function LandingFooter() {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  return (
    <footer className="w-full bg-[#51465B] text-white rounded-t-[36px] sm:rounded-t-[48px] mt-16 px-6 sm:px-12 md:px-16 pt-12 pb-8 shadow-2xl relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFD36D]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto flex flex-col justify-between gap-10">
        {/* Top Tier: Logo & Links Grid */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 pb-8 border-b border-white/10">
          {/* Brand Col */}
          <div className="space-y-3 max-w-sm">
            <PahamiPuzzleLogo theme="dark" size="md" />
            <p className="text-xs text-white/70 leading-relaxed font-normal pt-1">
              Platform pembelajaran kontekstual berbasis AI untuk sekolah dasar. Menghubungkan kurikulum nasional dengan kekayaan kearifan lokal Karesidenan Madiun dan Kota Semarang.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] text-[#FFD36D] font-mono font-bold border border-white/15">
                <Shield className="w-3 h-3" />
                Hackathon IT Comp 2026
              </span>
            </div>
          </div>

          {/* Links Columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs">
            {/* Col 1: Layanan */}
            <div className="space-y-2.5">
              <span className="font-mono text-[10px] font-black uppercase tracking-wider text-white/50 block">
                Layanan Utama
              </span>
              <ul className="space-y-2 font-medium">
                <li>
                  <Link href="/login?intent=material" className="text-white/80 hover:text-[#FFD36D] transition-colors">
                    Kontekskan Materi
                  </Link>
                </li>
                <li>
                  <Link href="/login?intent=question" className="text-white/80 hover:text-[#FFD36D] transition-colors">
                    Kontekskan Soal
                  </Link>
                </li>
                <li>
                  <Link href="/student/exam-access" className="text-white/80 hover:text-[#FFD36D] transition-colors">
                    Akses Ujian Murid
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 2: Wilayah Prioritas */}
            <div className="space-y-2.5">
              <span className="font-mono text-[10px] font-black uppercase tracking-wider text-white/50 block">
                Cakupan Wilayah
              </span>
              <ul className="space-y-1.5 text-white/70 text-[11px]">
                <li>Kota & Kab. Madiun</li>
                <li>Kab. Ponorogo</li>
                <li>Kab. Magetan & Ngawi</li>
                <li>Kabupaten Pacitan</li>
                <li>Kota Semarang</li>
              </ul>
            </div>

            {/* Col 3: Legal & Akses Internal */}
            <div className="space-y-2.5 col-span-2 sm:col-span-1">
              <span className="font-mono text-[10px] font-black uppercase tracking-wider text-white/50 block">
                Legal & Developer
              </span>
              <ul className="space-y-2 font-medium">
                <li>
                  <button
                    type="button"
                    onClick={() => setShowPrivacyModal(true)}
                    className="text-white/80 hover:text-[#FFD36D] transition-colors text-left"
                  >
                    Kebijakan Privasi Siswa
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="text-white/80 hover:text-[#FFD36D] transition-colors text-left"
                  >
                    Ketentuan Penggunaan
                  </button>
                </li>
                <li>
                  <Link
                    href="/admin/login"
                    className="inline-flex items-center gap-1 text-[#FFD36D] hover:underline"
                  >
                    <Lock className="w-3 h-3" />
                    <span>Control Center</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Tier: Attribution & Copyright */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[11px] text-white/60">
          <div>
            <span>&copy; 2026 Tim Depaskan &bull; Hackathon IT Comp 2026. Hak Cipta Dilindungi.</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Aset Visual: Wikimedia Commons (CC BY-SA)</span>
            <span>&bull;</span>
            <span>Data: BPS & Cagar Budaya Daerah</span>
          </div>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 text-[#23212A]">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E9E5E8] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9E5E8]">
              <h3 className="font-black text-base text-[#51465B]">Kebijakan Privasi Siswa Depaskan</h3>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="w-7 h-7 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-bold text-xs"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2.5 text-xs text-[#756F7A] leading-relaxed">
              <p>
                Depaskan berkomitmen penuh melindungi privasi siswa sekolah dasar (Kelas 5 Fase C):
              </p>
              <ul className="list-disc list-inside space-y-1 pl-1 text-[#23212A] font-medium">
                <li>Kami tidak mengumpulkan nomor identitas kependudukan anak (NIK) ataupun alamat rumah pribadi.</li>
                <li>Pengerjaan ujian oleh murid hanya menggunakan nama panggilan atau inisial yang terdaftar di dalam ruang kelas sekolah.</li>
                <li>Seluruh data hasil ujian dan rapor terisolasi secara ketat per sekolah melalui Row Level Security (RLS) Supabase.</li>
                <li>Data prompt AI diproses tanpa menyimpan rekaman pribadi anak.</li>
              </ul>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="px-5 py-2 rounded-xl bg-[#51465B] text-white text-xs font-bold"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 text-[#23212A]">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E9E5E8] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9E5E8]">
              <h3 className="font-black text-base text-[#51465B]">Ketentuan Penggunaan Platform</h3>
              <button
                onClick={() => setShowTermsModal(false)}
                className="w-7 h-7 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-bold text-xs"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2.5 text-xs text-[#756F7A] leading-relaxed">
              <p>
                Ketentuan operasional platform Depaskan untuk kegiatan belajar mengajar:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-1 text-[#23212A] font-medium">
                <li>Platform ini digunakan oleh guru dan siswa untuk menyusun dan mengerjakan materi pembelajaran kontekstual berbasis Kurikulum Merdeka.</li>
                <li>Hasil generasi AI adalah alat bantu referensi yang selalu dapat disunting dan disesuaikan kembali oleh guru sebelum dibagikan ke siswa.</li>
                <li>Materi cetak berhak digandakan untuk keperluan kelas sekolah masing-masing tanpa dipungut biaya.</li>
              </ul>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowTermsModal(false)}
                className="px-5 py-2 rounded-xl bg-[#51465B] text-white text-xs font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
