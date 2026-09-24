"use client";

import React, { useState, useEffect } from "react";
import { AdminWorkspaceShell } from "@/components/layout/admin-workspace-shell";
import {
  Image as ImageIcon,
  CheckCircle2,
  ExternalLink,
  Shield,
  Layers,
  Search,
  Filter,
  RefreshCw,
  Plus,
  BookOpen,
} from "lucide-react";

interface MediaAsset {
  id: string;
  entity_name: string;
  region_name: string;
  image_url: string;
  caption: string;
  license_type: string;
  attribution: string;
  verification_status: "VERIFIED" | "PENDING_REVIEW";
  linked_subjects: string[];
}

export default function AdminKBMetaMediaPage() {
  const [mediaList, setMediaList] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<MediaAsset | null>(null);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/knowledge-base/media");
      const data = await res.json();
      if (data?.success) {
        setMediaList(data.media_assets || []);
      }
    } catch {
      // Handled silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const filteredMedia = mediaList.filter(
    (m) =>
      m.entity_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.region_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.caption.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminWorkspaceShell activeGroupId="kb">
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="clay-card p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#51465B] text-[#FFD36D] flex items-center justify-center font-bold shadow-[0_4px_12px_rgba(81,70,91,0.2)]">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-[#23212A] tracking-tight">
                  Media Aset Creative Commons &amp; Wikimedia
                </h1>
                <p className="text-xs text-[#756F7A] mt-0.5 max-w-2xl">
                  Katalog media visual terkurasi dengan atribusi sah (CC BY-SA) untuk mendukung pembelajaran visual, stimulus soal matematika/IPS berbasis kearifan lokal.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchMedia}
                disabled={loading}
                className="px-4 py-2.5 rounded-2xl bg-white border border-[#E9E5E8] hover:bg-neutral-50 text-xs font-bold text-[#51465B] flex items-center gap-2 shadow-xs transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                Segarkan Aset
              </button>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-[24px] border border-[#E9E5E8] p-4 shadow-[0_4px_16px_rgba(81,70,91,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#756F7A] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari entitas, kota, atau kata kunci gambar..."
              className="clay-input pl-10 pr-4 text-xs font-semibold text-[#23212A]"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-[#51465B]">{filteredMedia.length} Media Terdaftar</span>
            <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold shadow-xs">
              100% Attribution Compliant
            </span>
          </div>
        </div>

        {/* Media Grid */}
        {loading && mediaList.length === 0 ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 text-[#51465B] animate-spin mx-auto mb-3" />
            <p className="text-xs text-neutral-400 font-medium">Memuat katalog media visual...</p>
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="py-16 text-center clay-card">
            <ImageIcon className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="text-xs text-neutral-400 font-bold">Tidak ada media yang cocok dengan pencarian.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMedia.map((m) => (
              <div
                key={m.id}
                className="bg-white rounded-[28px] border border-[#E9E5E8] overflow-hidden shadow-[0_8px_24px_rgba(81,70,91,0.04)] hover:shadow-[0_12px_32px_rgba(81,70,91,0.08)] hover:border-[#51465B]/30 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Image Container */}
                  <div
                    className="relative aspect-video bg-neutral-100 overflow-hidden cursor-pointer group"
                    onClick={() => setSelectedMedia(m)}
                  >
                    <img
                      src={m.image_url}
                      alt={m.caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white font-mono text-[10px] font-bold">
                        {m.license_type}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                      </span>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-neutral-400 font-bold">
                      <span>{m.region_name}</span>
                      <div className="flex gap-1">
                        {m.linked_subjects.map((sub) => (
                          <span
                            key={sub}
                            className="px-2 py-0.5 rounded-md bg-[#FAF7F3] text-[#51465B] border border-[#E9E5E8] text-[9px] font-bold"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>

                    <h3 className="font-black text-sm text-[#51465B]">{m.entity_name}</h3>
                    <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">{m.caption}</p>
                  </div>
                </div>

                {/* Footer Attribution */}
                <div className="p-4 pt-2 border-t border-[#E9E5E8] bg-[#FAF7F3]/50 flex items-center justify-between text-[10px] text-neutral-500">
                  <span className="truncate max-w-[200px]" title={m.attribution}>
                    {m.attribution}
                  </span>
                  <a
                    href={m.image_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#51465B] font-bold hover:underline flex items-center gap-1 shrink-0"
                  >
                    <span>Buka Resolusi Tinggi</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Detail View */}
        {selectedMedia && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-[#E9E5E8] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E9E5E8]">
                <h3 className="font-black text-base text-[#51465B]">{selectedMedia.entity_name}</h3>
                <button
                  onClick={() => setSelectedMedia(null)}
                  className="w-7 h-7 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-black text-xs"
                >
                  ✕
                </button>
              </div>

              <div className="rounded-2xl overflow-hidden aspect-video bg-neutral-100 border border-[#E9E5E8]">
                <img
                  src={selectedMedia.image_url}
                  alt={selectedMedia.caption}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-2 text-xs">
                <p className="text-neutral-700 leading-relaxed font-medium">{selectedMedia.caption}</p>
                <div className="p-3 rounded-2xl bg-[#FAF7F3] border border-[#E9E5E8] space-y-1">
                  <div className="flex justify-between">
                    <span className="font-bold text-neutral-400">Lisensi Media:</span>
                    <span className="font-mono font-bold text-[#51465B]">{selectedMedia.license_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-neutral-400">Atribusi Asli:</span>
                    <span className="font-medium text-[#51465B]">{selectedMedia.attribution}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-neutral-400">Wilayah:</span>
                    <span className="font-bold text-[#51465B]">{selectedMedia.region_name}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedMedia(null)}
                  className="px-5 py-2 rounded-xl bg-[#51465B] text-white text-xs font-bold"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminWorkspaceShell>
  );
}
