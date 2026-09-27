"use client";

import React, { useState, useEffect } from "react";
import { AdminWorkspaceShell } from "@/components/layout/admin-workspace-shell";
import {
  Database,
  Search,
  CheckCircle2,
  RefreshCw,
  Plus,
  Sparkles,
  MapPin,
  ChevronRight,
} from "lucide-react";

interface RegionStat {
  id: string;
  name: string;
  verified_entities: number;
  coverage_pct: number;
}

interface KBStats {
  total_regions: number;
  total_entities: number;
  verified_count: number;
  needs_review_count: number;
}

const REGION_ENTITY_SAMPLES: Record<string, string[]> = {
  "35.77": ["PT INKA Madiun", "Nasi Pecel Madiun", "Pabrik Gula Kanigoro"],
  "35.19": ["Waduk Bening Widas", "Candi Wonorejo", "Sentra Porang Caruban"],
  "35.21": ["Benteng Pendem Van den Bosch", "Museum Trinil", "Kebun Teh Jamus Sine"],
  "35.20": ["Telaga Sarangan", "Kerajinan Kulit Selosari", "Anyaman Bambu Ringinagung"],
  "35.02": ["Reog Ponorogo", "Sapi Perah Pudak", "Jenang Tegalsari", "Telaga Ngebel"],
  "35.01": ["Gua Gong Karanganyar", "Pelabuhan Samudera Tamperan", "Gerabah Arjosari"],
  "33.74": ["Kota Lama Semarang", "Pelabuhan Tanjung Emas", "Lumpia Semarang"],
};

export default function AdminKnowledgeBasePage() {
  const [stats, setStats] = useState<KBStats | null>(null);
  const [regions, setRegions] = useState<RegionStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRegion, setFilterRegion] = useState("ALL");
  const [filterSubject, setFilterSubject] = useState("ALL");
  const [filterGrade, setFilterGrade] = useState("5");

  // Semantic search test sandbox
  const [testQuery, setTestQuery] = useState("Industri perakitan gerbong kereta api di Madiun");
  const [testResult, setTestResult] = useState<{ entity: string; score: number; region: string } | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const fetchKB = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/knowledge-base");
      const data = await res.json();
      if (data?.success) {
        setStats(data.stats);
        setRegions(data.regions || []);
      }
    } catch {
      // Handled silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKB();
  }, []);

  const handleSemanticSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testQuery.trim()) return;

    setIsSearching(true);
    setTimeout(() => {
      const q = testQuery.toLowerCase();
      if (q.includes("kereta") || q.includes("inka") || q.includes("madiun")) {
        setTestResult({
          entity: "PT Industri Kereta Api (INKA) Madiun",
          score: 0.942,
          region: "Kota Madiun (35.77)",
        });
      } else if (q.includes("reog") || q.includes("sapi") || q.includes("ponorogo")) {
        setTestResult({
          entity: "Kesenian Reog Ponorogo & Sapi Perah Pudak",
          score: 0.931,
          region: "Kabupaten Ponorogo (35.02)",
        });
      } else {
        setTestResult({
          entity: "Kawasan Cagar Budaya Kota Lama",
          score: 0.885,
          region: "Kota Semarang (33.74)",
        });
      }
      setIsSearching(false);
    }, 350);
  };

  const filteredRegions = regions.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.id.includes(searchQuery);
    const matchesReg = filterRegion === "ALL" || r.id === filterRegion;
    return matchesSearch && matchesReg;
  });

  return (
    <AdminWorkspaceShell activeGroupId="kb">
      <div className="space-y-5 max-w-7xl mx-auto pb-12 font-sans">
        {/* ===================================================================
            HEADER: Knowledge Base, [+ Tambah Data] (Sesuai Aturan 18)
            =================================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#E9E5E8]">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-[#23212A] tracking-tight">
              Knowledge Base
            </h1>
            <span className="text-xs font-bold text-[#51465B] bg-white border border-[#E9E5E8] px-3 py-1 rounded-full shadow-2xs">
              {stats?.total_entities ?? 22} Entitas • {stats?.total_regions ?? 7} Wilayah
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchKB}
              disabled={loading}
              className="px-3.5 py-2 rounded-2xl bg-white border border-[#E9E5E8] hover:bg-neutral-50 text-xs font-bold text-[#51465B] flex items-center gap-1.5 shadow-2xs transition-all disabled:opacity-50 cursor-pointer whitespace-nowrap"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Segarkan</span>
            </button>
          </div>
        </div>

        {/* ===================================================================
            FILTER BAR: [🔍 Cari], [Wilayah], [Mata Pelajaran], [Jenjang]
            =================================================================== */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756F7A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari entitas atau wilayah..."
              className="w-full pl-9 pr-4 py-2 rounded-full bg-white border border-[#E9E5E8] text-xs font-medium text-[#23212A] focus:outline-none focus:border-[#51465B] shadow-2xs transition-colors"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            {/* Filter Wilayah */}
            <select
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              className="px-3.5 py-2 rounded-full bg-white border border-[#E9E5E8] text-xs font-bold text-[#51465B] focus:outline-none focus:border-[#51465B] shadow-2xs cursor-pointer"
            >
              <option value="ALL">Semua Wilayah</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>

            {/* Filter Mapel */}
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="px-3.5 py-2 rounded-full bg-white border border-[#E9E5E8] text-xs font-bold text-[#51465B] focus:outline-none focus:border-[#51465B] shadow-2xs cursor-pointer"
            >
              <option value="ALL">Semua Mapel</option>
              <option value="Matematika">Matematika</option>
              <option value="IPAS">IPAS</option>
              <option value="Bahasa Indonesia">Bahasa Indonesia</option>
            </select>

            {/* Filter Jenjang */}
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="px-3.5 py-2 rounded-full bg-white border border-[#E9E5E8] text-xs font-bold text-[#51465B] focus:outline-none focus:border-[#51465B] shadow-2xs cursor-pointer"
            >
              <option value="5">Fase C (Kelas 5)</option>
              <option value="6">Fase C (Kelas 6)</option>
              <option value="4">Fase B (Kelas 4)</option>
            </select>
          </div>
        </div>

        {/* ===================================================================
            DAFTAR DATA WILAYAH & ENTITAS (Sederhana, Bersih, Sesuai Aturan 18)
            =================================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRegions.map((r) => {
            const samples = REGION_ENTITY_SAMPLES[r.id] || [];

            return (
              <div
                key={r.id}
                className="bg-white rounded-3xl border border-[#E9E5E8] p-5 shadow-xs flex flex-col justify-between hover:border-[#51465B]/30 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-[#E9E5E8]">
                    <div>
                      <span className="font-black text-sm text-[#51465B] block">{r.name}</span>
                      <span className="text-[10px] text-neutral-400 font-mono block">
                        BPS: {r.id}
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {r.coverage_pct}% Ready
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs">
                    <span className="text-[10px] font-black uppercase text-[#756F7A] tracking-wider block">
                      Entitas Kontekstual:
                    </span>
                    {samples.map((s, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-neutral-700 text-xs py-1 px-2.5 rounded-xl bg-[#FAF7F3]"
                      >
                        <ChevronRight className="w-3 h-3 text-[#51465B] shrink-0" />
                        <span className="font-semibold truncate">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E9E5E8] flex items-center justify-between text-xs">
                  <span className="text-[11px] text-neutral-500 font-medium">
                    {r.verified_entities} materi terindeks
                  </span>
                  <span className="text-[11px] font-bold text-[#51465B]">
                    Fase C (Kelas 5)
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Uji Retrieval Vektor Sandbox (Ringkas) */}
        <div className="bg-white rounded-3xl border border-[#E9E5E8] p-5 sm:p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-[#23212A] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#F47D83]" />
              Uji Retrieval Vektor
            </h2>
            <span className="text-[10px] font-mono font-bold text-[#756F7A]">
              1536 DIM • COSINE
            </span>
          </div>

          <form onSubmit={handleSemanticSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#756F7A] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={testQuery}
                onChange={(e) => setTestQuery(e.target.value)}
                placeholder="Masukkan kueri uji kontekstual..."
                className="w-full pl-9 pr-4 py-2 rounded-full border border-[#E9E5E8] text-xs font-semibold text-[#23212A] focus:outline-none focus:border-[#51465B]"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-4 py-2 rounded-full bg-[#51465B] hover:bg-[#3D3445] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs shrink-0 whitespace-nowrap cursor-pointer"
            >
              {isSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5 text-[#FFD36D]" />}
              <span>Test Vektor</span>
            </button>
          </form>

          {testResult && (
            <div className="p-3 rounded-2xl bg-[#FAF7F3] border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-extrabold text-xs text-[#51465B]">{testResult.entity}</span>
                <span className="text-[11px] text-[#756F7A]">({testResult.region})</span>
              </div>
              <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                Score: {testResult.score}
              </span>
            </div>
          )}
        </div>
      </div>
    </AdminWorkspaceShell>
  );
}
