"use client";

import React, { useState, useEffect } from "react";
import { AdminWorkspaceShell } from "@/components/layout/admin-workspace-shell";
import {
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  User,
  Shield,
  Code,
} from "lucide-react";

interface AuditLog {
  id: string;
  admin_id: string;
  admin_username: string;
  action: string;
  target_type: string;
  target_id: string | null;
  result: "SUCCESS" | "DENIED" | "FAILED";
  metadata?: Record<string, any>;
  ip_address?: string;
  created_at: string;
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAction, setFilterAction] = useState("ALL");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/security/audit-logs?limit=100");
      const data = await res.json();
      if (data?.success) {
        setLogs(data.logs || []);
      }
    } catch {
      // Handled silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.admin_username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.target_id && log.target_id.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesAction = filterAction === "ALL" || log.action.includes(filterAction);

    return matchesSearch && matchesAction;
  });

  return (
    <AdminWorkspaceShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E9E5E8]">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#51465B]/60 uppercase tracking-wider mb-1">
              <span>Sistem & Keamanan</span>
              <span>•</span>
              <span>Forensik & Jejak Audit Kredensial</span>
            </div>
            <h1 className="text-2xl font-black text-[#51465B] flex items-center gap-2.5">
              <ShieldAlert className="w-6 h-6 text-[#FFD36D]" />
              Immutable Audit Logs & Security Trails
            </h1>
            <p className="text-xs text-neutral-500 mt-1 max-w-2xl">
              Catatan riwayat seluruh aktivitas developer: login admin, modifikasi kredensial API key AI, reset circuit breaker, perubahan setting, dan manajemen user.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#E9E5E8] hover:bg-neutral-50 text-xs font-bold text-[#51465B] flex items-center gap-2 shadow-xs transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Segarkan Log
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-3xl p-4 border border-[#E9E5E8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari aksi, username, atau target ID..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E9E5E8] bg-[#FAF7F3] focus:bg-white text-xs font-bold text-[#51465B] focus:outline-none focus:ring-2 focus:ring-[#51465B]"
            />
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-neutral-400" />
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-[#E9E5E8] bg-[#FAF7F3] text-xs font-bold text-[#51465B] focus:outline-none"
              >
                <option value="ALL">Semua Aksi</option>
                <option value="LOGIN">Aktivitas Login</option>
                <option value="CREDENTIAL">Manajemen Kredensial AI</option>
                <option value="MODEL">Konfigurasi Model</option>
                <option value="SETTING">Pengaturan Sistem</option>
                <option value="USER">Manajemen Pengguna</option>
                <option value="CIRCUIT">Circuit Breaker</option>
              </select>
            </div>

            <span className="text-[10px] font-mono px-2 py-1 rounded-full bg-neutral-100 text-neutral-600 font-bold">
              {filteredLogs.length} Log
            </span>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="bg-white rounded-3xl border border-[#E9E5E8] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F3] border-b border-[#E9E5E8] text-[#51465B] font-extrabold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Waktu (WIB)</th>
                  <th className="py-3 px-4">Operator Admin</th>
                  <th className="py-3 px-4">Aksi Dilakukan</th>
                  <th className="py-3 px-4">Tipe & Target</th>
                  <th className="py-3 px-4">Hasil</th>
                  <th className="py-3 px-4 text-right">Rincian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9E5E8] font-medium text-neutral-700">
                {loading && logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-neutral-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#51465B]" />
                      Memuat log keamanan...
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-neutral-400">
                      Belum ada audit log yang sesuai dengan filter.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#FAF7F3]/50 transition-colors">
                      <td className="py-3 px-4 text-[11px] text-neutral-500 font-mono whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString("id-ID", {
                          dateStyle: "short",
                          timeStyle: "medium",
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-extrabold text-[#51465B] block">{log.admin_username}</span>
                        <span className="text-[10px] text-neutral-400 font-mono block">{log.admin_id}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-[11px] font-bold text-[#51465B] bg-[#FAF7F3] px-2 py-0.5 rounded-md border border-[#E9E5E8]">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <span className="font-bold text-[#51465B] block">{log.target_type}</span>
                        <span className="text-[10px] text-neutral-400 font-mono block truncate max-w-[150px]">
                          {log.target_id || "-"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {log.result === "SUCCESS" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            Success
                          </span>
                        )}
                        {log.result === "DENIED" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            <AlertTriangle className="w-3 h-3" />
                            Denied
                          </span>
                        )}
                        {log.result === "FAILED" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            <AlertTriangle className="w-3 h-3" />
                            Failed
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-2.5 py-1 rounded-lg bg-[#FAF7F3] hover:bg-[#51465B] hover:text-white text-[#51465B] text-[11px] font-bold border border-[#E9E5E8] transition-colors"
                        >
                          Lihat Detail
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal JSON Viewer */}
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-[#E9E5E8] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E9E5E8]">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-[#51465B]" />
                  <h3 className="font-black text-sm text-[#51465B]">Detail Log Forensik #{selectedLog.id}</h3>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="w-7 h-7 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-black text-xs"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-[#FAF7F3] border border-[#E9E5E8]">
                  <div>
                    <span className="text-[10px] text-neutral-400 font-bold block">Aksi:</span>
                    <span className="font-bold text-[#51465B]">{selectedLog.action}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 font-bold block">Operator:</span>
                    <span className="font-bold text-[#51465B]">{selectedLog.admin_username}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 font-bold block">Target Type:</span>
                    <span className="font-bold text-[#51465B]">{selectedLog.target_type}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 font-bold block">Waktu:</span>
                    <span className="font-mono text-[11px] text-[#51465B]">{selectedLog.created_at}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-[#51465B]">Metadata Payload:</span>
                  <pre className="p-3 rounded-2xl bg-neutral-900 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-60 leading-relaxed">
                    {JSON.stringify(selectedLog.metadata || {}, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedLog(null)}
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
