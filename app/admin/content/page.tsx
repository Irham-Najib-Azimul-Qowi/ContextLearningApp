"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  FileText,
  Search,
  ArrowRight,
  Sparkles,
  PenTool,
  Camera,
  Filter,
  CheckCircle2,
  Clock,
  Eye,
} from "lucide-react";
import { AdminWorkspaceShell } from "@/components/layout/admin-workspace-shell";

type TabKey = "materials" | "questions";

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("materials");
  const [materials, setMaterials] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalMaterials: 0, totalQuestions: 0 });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchContent = (q?: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);

    fetch(`/api/admin/content?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.success) {
          setMaterials(data.materials || []);
          setQuestions(data.questions || []);
          setStats(data.stats || { totalMaterials: 0, totalQuestions: 0 });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleSearch = () => {
    fetchContent(search);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const sourceIcon = (source: string) => {
    switch (source) {
      case "ai_generated":
        return <Sparkles className="w-3.5 h-3.5 text-amber-600" />;
      case "scan":
      case "photo":
        return <Camera className="w-3.5 h-3.5 text-blue-600" />;
      default:
        return <PenTool className="w-3.5 h-3.5 text-[#51465B]" />;
    }
  };

  const sourceLabel = (source: string) => {
    switch (source) {
      case "ai_generated":
        return "AI Generate";
      case "scan":
        return "Scan/PDF";
      case "photo":
        return "Foto";
      default:
        return "Manual";
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "approved":
      case "published":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            Approved
          </span>
        );
      case "review":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800">
            <Eye className="w-3 h-3" />
            Review
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-gray-100 text-gray-700">
            <Clock className="w-3 h-3" />
            Draft
          </span>
        );
    }
  };

  return (
    <AdminWorkspaceShell activeGroupId="content">
      <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E9E5E8]">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#23212A] tracking-tight">
              Monitoring Konten
            </h1>
            <p className="text-xs text-[#756F7A] mt-0.5">
              Pantau seluruh materi dan soal yang dibuat guru di seluruh sekolah.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#51465B] bg-[#51465B]/10 px-3 py-1.5 rounded-full">
              {stats.totalMaterials} Materi
            </span>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-full">
              {stats.totalQuestions} Bank Soal
            </span>
          </div>
        </div>

        {/* Tab Switcher + Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-[#FAF7F3] border border-[#E9E5E8] rounded-2xl p-1">
            <button
              type="button"
              onClick={() => setActiveTab("materials")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "materials"
                  ? "bg-[#51465B] text-white shadow-md"
                  : "text-[#756F7A] hover:text-[#23212A]"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 inline mr-1.5" />
              Materi ({materials.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("questions")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "questions"
                  ? "bg-[#51465B] text-white shadow-md"
                  : "text-[#756F7A] hover:text-[#23212A]"
              }`}
            >
              <FileText className="w-3.5 h-3.5 inline mr-1.5" />
              Soal ({questions.length})
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#756F7A]" />
              <input
                type="text"
                placeholder="Cari judul, mapel, sekolah..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-[#E9E5E8] text-xs font-medium text-[#23212A] placeholder:text-[#B8B2BD] focus:outline-none focus:border-[#51465B] transition-colors"
              />
            </div>
            <button
              type="button"
              onClick={handleSearch}
              className="px-3.5 py-2.5 rounded-xl bg-[#51465B] text-white text-xs font-bold hover:bg-[#3E3547] transition-colors"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Table */}
        <div className="bg-white rounded-3xl border border-[#E9E5E8] shadow-xs overflow-hidden">
          {loading ? (
            <div className="text-center py-16 text-xs text-[#756F7A] animate-pulse font-bold">
              Memuat data konten dari seluruh sekolah...
            </div>
          ) : activeTab === "materials" ? (
            /* Materials Tab */
            materials.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen className="w-10 h-10 text-[#E9E5E8] mx-auto mb-3" />
                <p className="text-xs text-[#756F7A] font-bold">
                  Belum ada materi yang dibuat guru.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[700px]">
                  <thead>
                    <tr className="border-b border-[#E9E5E8] bg-[#FAF7F3] text-[10px] uppercase tracking-wider font-black text-[#756F7A]">
                      <th className="py-3 px-4">Judul</th>
                      <th className="py-3 px-4">Mapel</th>
                      <th className="py-3 px-4">Kelas</th>
                      <th className="py-3 px-4">Sekolah</th>
                      <th className="py-3 px-4">Guru</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Dibuat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9E5E8]">
                    {materials.map((m) => (
                      <tr key={m.id} className="hover:bg-[#FAF7F3]/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#23212A] max-w-[200px] truncate">
                            {m.title}
                          </div>
                          {m.content_preview && (
                            <div className="text-[10px] text-[#B8B2BD] mt-0.5 max-w-[200px] truncate">
                              {m.content_preview}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 font-medium text-[#51465B]">{m.subject}</td>
                        <td className="py-3 px-4 text-[#756F7A]">{m.grade}</td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-[#23212A] text-[11px]">{m.school_name}</div>
                          <div className="text-[10px] text-[#B8B2BD]">{m.region_name}</div>
                        </td>
                        <td className="py-3 px-4 text-[#756F7A] text-[11px]">{m.teacher_name}</td>
                        <td className="py-3 px-4">{statusBadge(m.status)}</td>
                        <td className="py-3 px-4 text-[#756F7A] font-mono text-[10px] whitespace-nowrap">
                          {m.created_at
                            ? new Date(m.created_at).toLocaleDateString("id-ID", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            /* Questions Tab */
            questions.length === 0 ? (
              <div className="text-center py-16">
                <FileText className="w-10 h-10 text-[#E9E5E8] mx-auto mb-3" />
                <p className="text-xs text-[#756F7A] font-bold">
                  Belum ada bank soal yang dibuat guru.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[800px]">
                  <thead>
                    <tr className="border-b border-[#E9E5E8] bg-[#FAF7F3] text-[10px] uppercase tracking-wider font-black text-[#756F7A]">
                      <th className="py-3 px-4">Judul</th>
                      <th className="py-3 px-4">Mapel</th>
                      <th className="py-3 px-4">Kelas</th>
                      <th className="py-3 px-4">Topik</th>
                      <th className="py-3 px-4">Soal</th>
                      <th className="py-3 px-4">Sumber</th>
                      <th className="py-3 px-4">Sekolah</th>
                      <th className="py-3 px-4">Guru</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Dibuat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9E5E8]">
                    {questions.map((q) => (
                      <tr key={q.id} className="hover:bg-[#FAF7F3]/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#23212A] max-w-[180px] truncate">
                            {q.title}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium text-[#51465B]">{q.subject}</td>
                        <td className="py-3 px-4 text-[#756F7A]">{q.grade}</td>
                        <td className="py-3 px-4 text-[#756F7A] text-[11px] max-w-[120px] truncate">
                          {q.topic}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-[#51465B]/10 text-[#51465B]">
                            {q.question_count} butir
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold">
                            {sourceIcon(q.source)}
                            <span>{sourceLabel(q.source)}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-[#23212A] text-[11px]">{q.school_name}</div>
                          <div className="text-[10px] text-[#B8B2BD]">{q.region_name}</div>
                        </td>
                        <td className="py-3 px-4 text-[#756F7A] text-[11px]">{q.teacher_name}</td>
                        <td className="py-3 px-4">{statusBadge(q.status)}</td>
                        <td className="py-3 px-4 text-[#756F7A] font-mono text-[10px] whitespace-nowrap">
                          {q.created_at
                            ? new Date(q.created_at).toLocaleDateString("id-ID", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>
    </AdminWorkspaceShell>
  );
}
