"use client";

import React, { useState } from "react";
import { UsersRound, Search } from "lucide-react";
import { repository } from "@/lib/db/repository";
import { Badge } from "@/components/ui/badge";

export default function AdminUsersPage() {
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const teachers = [
    {
      id: "teacher-demo-01",
      full_name: "Ibu Nurhaliza, S.Pd.",
      email: "nurhaliza.guru@gmail.com",
      role: "teacher" as const,
      school_name: "SD Negeri 001 Samarinda Kota",
      school_code: "SCH-SD001",
      memberships_count: 2,
    },
  ];

  const students = repository.getStudentsBySchool("school-sd001-samarinda").map((st) => ({
    id: st.id,
    full_name: st.full_name,
    email: "-",
    role: "student" as const,
    school_name: "SD Negeri 001 Samarinda Kota",
    school_code: "SCH-SD001",
    student_code: st.student_code || "STU-001",
  }));

  const allUsers = [...teachers, ...students];

  const filtered = allUsers.filter((u) => {
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchesSearch =
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.school_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="bg-surface p-5 rounded-xl border border-border shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <UsersRound className="w-5 h-5 text-primary" />
            Manajemen Akun Pengguna Platform
          </h1>
          <p className="text-xs text-secondary mt-1">
            Pengelolaan identitas guru terverifikasi Google dan akun siswa yang diprovisi sekolah.
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-surface p-4 rounded-xl border border-border flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama pengguna atau sekolah..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-border bg-surface text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="text-xs px-3 py-2 rounded-lg border border-border bg-surface text-foreground focus:border-primary focus:outline-none"
        >
          <option value="ALL">Semua Peran</option>
          <option value="teacher">Guru</option>
          <option value="student">Siswa</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-subtle border-b border-border text-secondary font-semibold">
              <tr>
                <th className="py-3 px-4">Nama Pengguna</th>
                <th className="py-3 px-4">Peran Platform</th>
                <th className="py-3 px-4">Sekolah / Tenant Afiliasi</th>
                <th className="py-3 px-4">Metode Autentikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-surface-subtle/50 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-semibold text-foreground block">{u.full_name}</span>
                    <span className="text-[11px] text-muted font-mono">{u.email}</span>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={u.role === "teacher" ? "primary" : "warning"}>
                      {u.role === "teacher" ? "Guru" : "Siswa"}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-foreground block">{u.school_name}</span>
                    <span className="text-[11px] text-muted font-mono">{u.school_code}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs font-medium text-secondary">
                      {u.role === "teacher" ? "Google OAuth (Terverifikasi)" : "Kredensial Sekolah"}
                    </span>
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
