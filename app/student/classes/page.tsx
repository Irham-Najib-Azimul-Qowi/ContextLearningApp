"use client";

import React, { useState, useEffect } from "react";
import {
  UsersRound,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { repository } from "@/lib/db/repository";
import { ClassRoom } from "@/lib/db/types";

export default function StudentClassesPage() {
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const studentId = "student-demo-01";
  const studentName = "Budi Pratama";

  useEffect(() => {
    setClasses(repository.getStudentClasses(studentId));
  }, []);

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/classes/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentId,
          student_name: studentName,
          join_code: joinCode.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Gagal bergabung ke kelas.");
      }

      setFeedback({ type: "success", msg: data.message });
      setClasses(repository.getStudentClasses(studentId));
      setJoinCode("");
      setTimeout(() => {
        setShowJoinModal(false);
        setFeedback(null);
      }, 1500);
    } catch (err: any) {
      setFeedback({ type: "error", msg: err.message || "Kode kelas salah atau tidak aktif." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface p-5 rounded-xl border border-border shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <UsersRound className="w-5 h-5 text-primary" />
            Daftar Kelas Saya
          </h1>
          <p className="text-xs text-foreground-secondary mt-0.5">
            Rombongan belajar yang Anda ikuti dan opsi bergabung dengan kode kelas guru.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowJoinModal(true)}
          className="bg-primary hover:bg-primary-hover text-xs font-semibold"
        >
          <PlusCircle className="w-4 h-4 mr-1.5" /> Gabung Kelas dengan Kode
        </Button>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {classes.map((cls) => (
          <div key={cls.id} className="bg-surface rounded-xl border border-border p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">
                  Kelas {cls.grade}
                </Badge>
                <Badge variant="success">
                  Terdaftar
                </Badge>
              </div>
              <h3 className="text-base font-bold text-foreground mt-2.5">{cls.name}</h3>
              <p className="text-xs text-foreground-secondary flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5" /> Tahun Ajaran {cls.academic_year}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-foreground-secondary uppercase tracking-wider block mb-1.5">
                Mata Pelajaran:
              </span>
              <div className="flex flex-wrap gap-1">
                {cls.subjects.map((sub) => (
                  <Badge
                    key={sub}
                    variant="neutral"
                    className="text-[11px]"
                  >
                    {sub}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="pt-2.5 border-t border-border text-xs text-foreground-secondary">
              Wali Kelas: <strong className="text-foreground">Ibu Nurhaliza, S.Pd.</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Join Class Modal */}
      <Modal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        title="Gabung ke Kelas Guru"
        description="Masukkan kode kelas yang diberikan oleh guru Anda."
      >
        <form onSubmit={handleJoinClass} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-foreground block mb-1">Kode Gabung Kelas:</label>
            <Input
              type="text"
              required
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Contoh: SD01-5A"
              className="font-mono uppercase tracking-wider text-base"
            />
          </div>

          {feedback && (
            <div
              className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                feedback.type === "success"
                  ? "bg-emerald-50 text-success border border-emerald-200"
                  : "bg-red-50 text-error border border-red-200"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              {feedback.msg}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowJoinModal(false)}
              className="text-xs border-border"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary-hover text-xs font-semibold"
            >
              {isSubmitting ? "Memproses..." : "Gabung Sekarang"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
