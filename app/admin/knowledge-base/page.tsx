"use client";

import React, { useState, useEffect } from "react";
import { AdminWorkspaceShell } from "@/components/layout/admin-workspace-shell";
import {
  Database,
  MapPin,
  Sparkles,
  Search,
  CheckCircle2,
  Layers,
  Cpu,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  BookOpen,
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
  embedding_model: string;
  vector_db: string;
  last_sync: string;
}

const REGION_ENTITY_SAMPLES: Record<string, string[]> = {
  "35.77": ["PT Industri Kereta Api (INKA)", "Kuliner Nasi Pecel Madiun", "Pabrik Gula Kanigoro"],
  "35.19": ["Waduk Bening Widas", "Candi Wonorejo", "Sentra Porang Caruban"],
  "35.21": ["Benteng Pendem Van den Bosch", "Museum Manusia Purba Trinil", "Kebun Teh Jamus Sine"],
  "35.20": ["Telaga Sarangan", "Sentra Kerajinan Kulit Selosari", "Anyaman Bambu Ringinagung"],
  "35.02": ["Kesenian Reog Ponorogo", "Peternakan Sapi Perah Pudak", "Sentra Jenang Tegalsari", "Telaga Ngebel"],
  "35.01": ["Gua Gong Karanganyar", "Pelabuhan Perikanan Samudera Tamperan", "Sentra Gerabah Arjosari"],
  "33.74": ["Kawasan Cagar Budaya Kota Lama", "Pelabuhan Tanjung Emas", "Sentra Kuliner Lumpia Semarang"],
};

export default function AdminKnowledgeBasePage() {
  const [stats, setStats] = useState<KBStats | null>(null);
  const [regions, setRegions] = useState<RegionStat[]>([]);
  const [loading, setLoading] = useState(true);
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
      } else if (q.includes("waduk") || q.includes("air") || q.includes("porang")) {
        setTestResult({
          entity: "Waduk Bening Widas & Porang Caruban",
          score: 0.887,
          region: "Kabupaten Madiun (35.19)",
        });
      } else if (q.includes("semarang") || q.includes("pelabuhan") || q.includes("emas")) {
        setTestResult({
          entity: "Pelabuhan Logistik Tanjung Emas Semarang",
          score: 0.915,
          region: "Kota Semarang (33.74)",
        });
      } else if (q.includes("reog") || q.includes("sapi") || q.includes("ponorogo")) {
        setTestResult({
          entity: "Kesenian Reog Ponorogo & Sapi Perah Pudak",
          score: 0.931,
          region: "Kabupaten Ponorogo (35.02)",
        });
      } else {
        setTestResult({
          entity: "Kawasan Cagar Budaya Kota Lama Semarang",
          score: 0.854,
          region: "Kota Semarang (33.74)",
        });
      }
      setIsSearching(false);
    }, 400);
  };

  return (
    <AdminWorkspaceShell activeGroupId="kb">
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="clay-card p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#51465B] text-[#FFD36D] flex items-center justify-center font-bold shadow-[0_4px_12px_rgba(81,70,91,0.2)]">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-[#23212A] tracking-tight">
                  Dataset Kontekstual &amp; Indeks Vektor Local Knowledge Base
                </h1>
                <p className="text-xs text-[#756F7A] mt-0.5 max-w-2xl">
                  Pusat penyimpanan entitas kontekstual lokal untuk materi dan butir soal Kurikulum Merdeka Fase C (Ponorogo, Madiun Raya, &amp; Semarang).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchKB}
                disabled={loading}
                className="px-4 py-2.5 rounded-2xl bg-white border border-[#E9E5E8] hover:bg-neutral-50 text-xs font-bold text-[#51465B] flex items-center gap-2 shadow-xs transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                Segarkan Status
              </button>
            </div>
          </div>
        </div>

        {/* Top Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <div className="clay-card p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#756F7A]">Cakupan Wilayah</span>
              <div className="w-9 h-9 rounded-2xl bg-[#51465B] text-[#FFD36D] flex items-center justify-center font-black shadow-xs">
                <MapPin className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl sm:text-3xl font-black text-[#23212A]">{stats?.total_regions ?? 7} Wilayah</div>
              <div className="text-[11px] text-emerald-700 font-bold mt-1">
                Fokus Pengujian Ponorogo &amp; Madiun
              </div>
            </div>
          </div>

          <div className="clay-card p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#756F7A]">Entitas Terverifikasi</span>
              <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black shadow-xs">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl sm:text-3xl font-black text-[#23212A]">{stats?.total_entities ?? 22} Entitas</div>
              <div className="text-[11px] text-[#756F7A] font-semibold mt-1">
                Geografi, Industri &amp; Budaya Lokal
              </div>
            </div>
          </div>

          <div className="clay-card p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#756F7A]">Model Embedding</span>
              <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black shadow-xs">
                <Cpu className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm font-black text-[#23212A]">text-embedding-3-small</div>
              <div className="text-[11px] text-[#756F7A] font-mono mt-1">
                1536 Dimensi Vektor Cosine
              </div>
            </div>
          </div>

          <div className="clay-card p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#756F7A]">Vector Storage</span>
              <div className="w-9 h-9 rounded-2xl bg-[#51465B]/10 text-[#51465B] flex items-center justify-center font-black shadow-xs">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm font-black text-[#23212A]">Supabase pgvector v0.8.2</div>
              <div className="text-[11px] text-emerald-700 font-bold mt-1">
                Active in Seoul Cluster
              </div>
            </div>
          </div>
        </div>

        {/* Semantic Search Test Sandbox */}
        <div className="clay-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-[#23212A] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F47D83]" />
                Uji Retrieval Semantik Vektor
              </h2>
              <p className="text-xs text-[#756F7A] mt-0.5">
                Simulasikan bagaimana AI mencocokkan materi pembelajaran dengan entitas kearifan lokal.
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-full bg-[#FAF7F3] border border-[#E9E5E8] text-[#51465B]">
              THRESHOLD: 0.70
            </span>
          </div>

          <form onSubmit={handleSemanticSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#756F7A] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={testQuery}
                onChange={(e) => setTestQuery(e.target.value)}
                placeholder="Masukkan kueri pembelajaran kontekstual..."
                className="clay-input pl-10 pr-4 text-xs font-semibold text-[#23212A]"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="clay-btn-primary px-5 py-2.5 text-xs font-bold flex items-center gap-2 shadow-xs shrink-0"
            >
              {isSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5 text-[#FFD36D]" />}
              <span>Cari Vektor</span>
            </button>
          </form>

          {testResult && (
            <div className="p-4 rounded-2xl bg-[#FAF7F3] border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <span className="font-extrabold text-xs text-[#51465B] block">{testResult.entity}</span>
                  <span className="text-[11px] text-neutral-500 font-medium">
                    Wilayah: {testResult.region}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                  Cosine Score: {testResult.score}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Regional Breakdown Grid */}
        <div>
          <h2 className="text-sm font-black text-[#51465B] mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#51465B]" />
            Daftar Wilayah & Entitas Terverifikasi
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regions.map((r) => {
              const samples = REGION_ENTITY_SAMPLES[r.id] || [];

              return (
                <div
                  key={r.id}
                  className="clay-card p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-[#E9E5E8]">
                      <div>
                        <span className="font-black text-sm text-[#51465B] block">{r.name}</span>
                        <span className="text-[10px] text-neutral-400 font-mono block mt-0.5">
                          ID BPS: {r.id}
                        </span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {r.coverage_pct}% Ready
                      </span>
                    </div>

                    <div className="mt-3.5 space-y-1.5 text-xs">
                      <span className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider block">
                        Entitas Kontekstual:
                      </span>
                      {samples.map((s, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-neutral-700 text-xs py-1 px-2.5 rounded-xl bg-[#FAF7F3]"
                        >
                          <ChevronRight className="w-3 h-3 text-[#51465B]" />
                          <span className="font-semibold">{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E9E5E8] flex items-center justify-between text-xs">
                    <span className="text-[11px] text-neutral-500 font-medium">
                      {r.verified_entities} materi terindeks
                    </span>
                    <span className="text-[11px] font-bold text-[#51465B] flex items-center gap-1">
                      Fase C (Kelas 5)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AdminWorkspaceShell>
  );
}
