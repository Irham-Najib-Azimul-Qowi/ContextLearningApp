"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ShieldCheck, Search, RefreshCw } from "lucide-react";
import { repository } from "@/lib/db/repository";
import { AuditLog } from "@/lib/db/types";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const refresh = useCallback(() => {
    setLogs([...repository.getAuditLogs()]);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filtered = logs.filter((l) => {
    const matchesQuery =
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.actor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.resource_type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesQuery;
  });

  return (
    <div className="space-y-6">
      <div className="bg-surface p-5 rounded-xl border border-border shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Log Audit Sistem &amp; Keamanan Platform
          </h1>
          <p className="text-xs text-foreground-secondary mt-0.5">
            Catatan aktivitas administratif, verifikasi instansi, rotasi kredensial AI, dan provisi akun.
          </p>
        </div>

        <button
          type="button"
          onClick={refresh}
          className="text-xs text-foreground-secondary hover:text-foreground flex items-center gap-1.5 self-start sm:self-center px-3 py-1.5 rounded-lg border border-border bg-surface-secondary"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Segarkan
        </button>
      </div>

      {/* Search */}
      <div className="bg-surface p-4 rounded-xl border border-border shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-foreground-secondary absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari aksi, nama aktor, atau tipe sumber daya..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-border bg-surface-secondary text-foreground focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-secondary border-b border-border text-foreground-secondary font-semibold">
              <tr>
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4">Aksi Audit</th>
                <th className="py-3 px-4">Aktor &amp; Peran</th>
                <th className="py-3 px-4">Tipe Sumber Daya</th>
                <th className="py-3 px-4">Detail Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-surface-secondary transition-colors">
                  <td className="py-3 px-4 text-foreground-secondary font-mono text-[11px]">
                    {new Date(log.created_at).toLocaleString("id-ID")}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-[11px] text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-foreground block">{log.actor_name}</span>
                    <span className="text-[10px] text-foreground-secondary uppercase font-mono">{log.actor_role}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-foreground">
                    {log.resource_type}
                  </td>
                  <td className="py-3 px-4 font-mono text-[10px] text-foreground-secondary max-w-xs truncate">
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
