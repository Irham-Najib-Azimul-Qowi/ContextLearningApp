"use client";

import React, { useState, useEffect } from "react";
import { School as SchoolIcon, Plus, CheckCircle2, AlertCircle, BookOpen, Users } from "lucide-react";
import { StudentWorkspaceShell } from "@/components/layout/student-workspace-shell";
import { repository } from "@/lib/db/repository";
import { ClassRoom } from "@/lib/db/types";

export default function StudentClassesPage() {
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [joinCode, setJoinCode] = useState("");
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  useEffect(() => {
    const user = repository.getCurrentUser();
    setClasses(repository.getStudentClasses(user.id));
  }, []);

  const handleJoinClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode) return;

    const user = repository.getCurrentUser();
    const result = repository.joinClassByCode(user.id, user.full_name, joinCode.trim().toUpperCase());

    if (result.success) {
      setMessage({ text: result.message, isError: false });
      setClasses(repository.getStudentClasses(user.id));
      setJoinCode("");
    } else {
      setMessage({ text: result.message, isError: true });
    }
  };

  return (
    <StudentWorkspaceShell>
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950">Kelas Saya</h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Daftar ruang belajar aktif yang kamu ikuti bersama guru dan teman sekelas.
        </p>
      </div>

      {/* Join Class Form Box */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs mb-8 max-w-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Gabung Kelas Baru</h2>
            <p className="text-xs text-slate-500">
              Masukkan 6 digit kode unik yang diberikan oleh bapak/ibu guru.
            </p>
          </div>
        </div>

        <form onSubmit={handleJoinClass} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            placeholder="Contoh: PNR-5A"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 uppercase font-mono font-bold tracking-wider text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-xs transition-transform active:scale-95 shrink-0"
          >
            Gabung Kelas
          </button>
        </form>

        {message && (
          <div
            className={`mt-4 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              message.isError
                ? "bg-rose-50 text-rose-700 border border-rose-200"
                : "bg-emerald-50 text-emerald-800 border border-emerald-200"
            }`}
          >
            {message.isError ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}
      </div>

      {/* Enrolled Classes List */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
          Kelas Terdaftar ({classes.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classes.map((cls) => (
            <div
              key={cls.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md mb-2 inline-block">
                  Kelas {cls.grade} SD
                </span>
                <h4 className="font-bold text-slate-950 text-base mb-1">{cls.name}</h4>
                <p className="text-xs text-slate-600 mb-1">{cls.subject}</p>
                <p className="text-xs text-slate-500">Guru: {cls.teacher_name}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 mt-4">
                <span>Kode: <strong className="font-mono text-slate-800">{cls.code}</strong></span>
                <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                  Status: Aktif
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </StudentWorkspaceShell>
  );
}
