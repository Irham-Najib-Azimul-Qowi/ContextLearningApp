"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Search, RefreshCw, FileText } from "lucide-react";
import { repository } from "@/lib/db/repository";
import { AuditLog } from "@/lib/db/types";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    refresh();
  }, []);

  const refresh = () => {
    setLogs([...repository.getAuditLogs()]);
  };

  const filtered = logs.filter((l) => {
    const matchesQuery =
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.actor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.resource_type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesQuery;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-[#DCE0EA] shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#252B3A] tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#5865D8]" />
            Log Audit Sistem & Keamanan Platform
          </h1>
          <p className="text-xs text-[#697386] mt-0.5">
            Catatan aktivitas administratif, verifikasi instansi, rotasi kredensial AI, dan provisi akun.
          </p>
        </div>

        <button
          type="button"
          onClick={refresh}
          className="text-xs text-[#697386] hover:text-[#252B3A] flex items-center gap-1 self-start sm:self-center"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Segarkan
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-[#DCE0EA]">
        <div className="relative">
          <Search className="w-4 h-4 text-[#697386] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari aksi, nama aktor, atau tipe sumber daya..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-[#DCE0EA] bg-[#F7F8FC] focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-[#DCE0EA] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F8FC] border-b border-[#DCE0EA] text-[#697386] font-semibold">
              <tr>
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4">Aksi Audit</th>
                <th className="py-3 px-4">Aktor & Peran</th>
                <th className="py-3 px-4">Tipe Sumber Daya</th>
                <th className="py-3 px-4">Detail Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDEFF5]">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-[#F7F8FC] transition-colors">
                  <td className="py-3 px-4 text-[#697386] font-mono text-[11px]">
                    {new Date(log.created_at).toLocaleString("id-ID")}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-[11px] text-[#5865D8] px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-[#252B3A] block">{log.actor_name}</span>
                    <span className="text-[10px] text-[#697386] uppercase font-mono">{log.actor_role}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-[#252B3A]">
                    {log.resource_type}
                  </td>
                  <td className="py-3 px-4 font-mono text-[10px] text-[#697386] max-w-xs truncate">
                    {JSON.stringify(log.details)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
