"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/navbar";
import Container from "@/components/ui/container";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import {
  Users,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Calendar,
} from "lucide-react";
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
    <div className="min-h-screen bg-background">
      <Navbar />

      <Container className="py-8 sm:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="primary">Kelas Belajar</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Daftar Kelas Saya
            </h1>
            <p className="text-sm text-muted mt-1">
              Lihat seluruh kelas yang Anda ikuti dan masukkan kode kelas baru dari guru Anda.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowJoinModal(true)}
            className="shadow-xs"
          >
            <PlusCircle className="h-4 w-4 mr-1" /> Gabung Kelas dengan Kode
          </Button>
        </div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <Card key={cls.id} className="hover:border-primary/30 transition-all flex flex-col">
              <CardHeader className="p-5 pb-3 border-b border-border/60">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">Kelas {cls.grade} SD</Badge>
                  <Badge variant="success">Terdaftar</Badge>
                </div>
                <CardTitle className="text-base font-bold text-foreground mt-2">
                  {cls.name}
                </CardTitle>
                <p className="text-xs text-muted flex items-center gap-1 mt-1">
                  <Calendar className="h-3.5 w-3.5" /> Tahun Ajaran {cls.academic_year}
                </p>
              </CardHeader>

              <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[10px] font-semibold text-muted uppercase tracking-wider block mb-1.5">
                    Mata Pelajaran:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {cls.subjects.map((sub) => (
                      <span
                        key={sub}
                        className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-medium text-foreground"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-border/60 text-xs text-muted">
                  Wali Kelas: <strong>Ibu Nurhaliza, S.Pd.</strong>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Join Class Modal */}
        <Modal
          isOpen={showJoinModal}
          onClose={() => setShowJoinModal(false)}
          title="Gabung ke Kelas Guru"
          description="Masukkan 6-8 digit kode kelas yang diberikan oleh guru Anda."
        >
          <form onSubmit={handleJoinClass} className="space-y-4">
            <Input
              label="Kode Gabung Kelas"
              type="text"
              required
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Contoh: SD01-5A"
              className="font-mono uppercase tracking-wider text-base"
            />

            {feedback && (
              <div
                className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                  feedback.type === "success"
                    ? "bg-emerald-50 text-success border border-emerald-200"
                    : "bg-red-50 text-error border border-red-200"
                }`}
              >
                {feedback.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0" />
                )}
                {feedback.msg}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowJoinModal(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSubmitting}
              >
                Gabung Sekarang
              </Button>
            </div>
          </form>
        </Modal>
      </Container>
    </div>
  );
}
