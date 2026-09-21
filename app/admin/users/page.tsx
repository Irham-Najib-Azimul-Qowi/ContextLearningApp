"use client";

import React, { useState, useEffect } from "react";
import { UsersRound, Search, ShieldCheck, GraduationCap, School } from "lucide-react";
import { repository } from "@/lib/db/repository";
import { Profile } from "@/lib/db/types";

export default function AdminUsersPage() {
  const [schools, setSchools] = useState(repository.getSchools());
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
      <div className="bg-white p-5 rounded-xl border border-[#DCE0EA] shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#252B3A] tracking-tight flex items-center gap-2">
            <UsersRound className="w-5 h-5 text-[#5865D8]" />
            Manajemen Akun Pengguna Platform
          </h1>
          <p className="text-xs text-[#697386] mt-0.5">
            Pengelolaan identitas guru terverifikasi Google dan akun siswa yang diprovisi sekolah.
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-xl border border-[#DCE0EA] flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#697386] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama pengguna atau sekolah..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-[#DCE0EA] bg-[#F7F8FC] focus:bg-white focus:outline-none"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="text-xs px-3 py-2 rounded-lg border border-[#DCE0EA] bg-[#F7F8FC] text-[#252B3A]"
        >
          <option value="ALL">Semua Peran</option>
          <option value="teacher">Guru</option>
          <option value="student">Siswa</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#DCE0EA] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F8FC] border-b border-[#DCE0EA] text-[#697386] font-semibold">
              <tr>
                <th className="py-3 px-4">Nama Pengguna</th>
                <th className="py-3 px-4">Peran Platform</th>
                <th className="py-3 px-4">Sekolah / Tenant Afiliasi</th>
                <th className="py-3 px-4">Metode Autentikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDEFF5]">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-[#F7F8FC] transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-bold text-[#252B3A] block">{u.full_name}</span>
                    <span className="text-[11px] text-[#697386] font-mono">{u.email}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        u.role === "teacher"
                          ? "bg-indigo-50 text-[#5865D8] border border-indigo-100"
                          : "bg-amber-50 text-amber-700 border border-amber-100"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-[#252B3A] block">{u.school_name}</span>
                    <span className="text-[10px] text-[#697386] font-mono">{u.school_code}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[11px] font-medium text-[#252B3A]">
                      {u.role === "teacher" ? "Google OAuth (Verified)" : "Kredensial Sekolah"}
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
