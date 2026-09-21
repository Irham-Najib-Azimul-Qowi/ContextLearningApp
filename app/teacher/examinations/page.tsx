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
  ClipboardList,
  PlusCircle,
  Clock,
  Users,
  CheckCircle2,
  Eye,
  Award,
  Calendar,
} from "lucide-react";
import { repository } from "@/lib/db/repository";
import { Examination, Question, ClassRoom, ExaminationAttempt, QuestionSubject } from "@/lib/db/types";

export default function TeacherExaminationsPage() {
  const [exams, setExams] = useState<Examination[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Examination | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState<QuestionSubject>("Matematika");
  const [grade, setGrade] = useState("5");
  const [classId, setClassId] = useState("");
  const [duration, setDuration] = useState("45");
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);

  // Essay grading state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [essayScore, setEssayScore] = useState("10");
  const [essayFeedback, setEssayFeedback] = useState("Jawaban sangat baik dan tepat menyebutkan konteks lingkungan sekitar.");

  useEffect(() => {
    setExams(repository.getExaminations());
    const cList = repository.getClasses();
    setClasses(cList);
    if (cList.length > 0) setClassId(cList[0].id);
    const qList = repository.getQuestions();
    setQuestions(qList);
    // Auto-select approved questions
    setSelectedQuestionIds(qList.map((q) => q.id));
  }, []);

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !classId) return;

    const targetClass = classes.find((c) => c.id === classId);

    const newExam = repository.createExamination(
      {
        teacher_id: "teacher-demo-01",
        class_id: classId,
        class_name: targetClass?.name || "Kelas 5",
        title,
        description,
        subject,
        grade: Number(grade),
        duration_minutes: Number(duration),
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
        status: "ongoing",
        show_results_immediately: true,
        allow_review: true,
      },
      selectedQuestionIds
    );

    setExams(repository.getExaminations());
    setShowCreateModal(false);
    setTitle("");
    setDescription("");
  };

  const handleGradeEssaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate updating essay answer
    alert("Penilaian essay berhasil disimpan dan skor akhir telah dipublikasikan ke siswa!");
    setReviewModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <Container className="py-8 sm:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="primary">Evaluasi &amp; Ujian</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Ruang Ujian &amp; Penilaian Siswa
            </h1>
            <p className="text-sm text-muted mt-1">
              Jadwalkan penilaian kontekstual, pantau pengumpulan lembar ujian siswa, dan review hasil evaluasi.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowCreateModal(true)}
            className="shadow-xs"
          >
            <PlusCircle className="h-4 w-4" /> Buat Ruang Ujian Baru
          </Button>
        </div>

        {/* Exams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => {
            const attempt = repository.getAttempt(exam.id, "student-demo-01");
            return (
              <Card key={exam.id} className="hover:border-primary/30 transition-all flex flex-col">
                <CardHeader className="p-5 pb-3 border-b border-border/60">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{exam.subject}</Badge>
                    <Badge variant="success">Sedang Berlangsung</Badge>
                  </div>
                  <CardTitle className="text-base font-bold text-foreground mt-2">
                    {exam.title}
                  </CardTitle>
                  <p className="text-xs text-muted flex items-center gap-1.5 mt-1">
                    <Users className="h-3.5 w-3.5 text-primary" /> {exam.class_name || "Kelas 5 SD"}
                    <span className="text-slate-300">•</span>
                    <Clock className="h-3.5 w-3.5 text-muted" /> {exam.duration_minutes} Menit
                  </p>
                </CardHeader>

                <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-xs text-muted leading-relaxed line-clamp-2">
                    {exam.description || "Ujian evaluasi kompetensi kontekstual berbasis lingkungan sekolah."}
                  </p>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1.5 text-xs text-muted">
                    <div className="flex items-center justify-between">
                      <span>Jumlah Butir Soal:</span>
                      <strong className="text-foreground">{exam.question_count || exam.questions?.length || 3} Butir</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Status Pengumpulan:</span>
                      <strong className="text-emerald-700">1 Terkumpul (Budi Pratama)</strong>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                    <button
                      onClick={() => setReviewModalOpen(true)}
                      className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                      <Award className="h-3.5 w-3.5" /> Review Jawaban &amp; Essay
                    </button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedExam(exam)}
                      className="text-xs"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" /> Naskah Soal
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Create Exam Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Jadwalkan Ruang Ujian Baru"
          description="Pilih kelas dan butir soal yang telah disetujui dari Bank Soal."
        >
          <form onSubmit={handleCreateExam} className="space-y-4">
            <Input
              label="Judul Penilaian / Ujian"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Penilaian Harian Matematika Kontekstual"
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                  Kelas Sasaran
                </label>
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                  Durasi Ujian (Menit)
                </label>
                <Input
                  type="number"
                  min={10}
                  max={180}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                Pilih Soal dari Bank Soal ({selectedQuestionIds.length} Soal Terpilih)
              </label>
              <div className="max-h-48 overflow-y-auto rounded-xl border border-border bg-slate-50/50 p-2 divide-y divide-border/60">
                {questions.map((q) => (
                  <label key={q.id} className="py-2 px-2 flex items-start gap-2.5 cursor-pointer hover:bg-white rounded-lg">
                    <input
                      type="checkbox"
                      checked={selectedQuestionIds.includes(q.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedQuestionIds([...selectedQuestionIds, q.id]);
                        } else {
                          setSelectedQuestionIds(selectedQuestionIds.filter((id) => id !== q.id));
                        }
                      }}
                      className="mt-0.5 rounded border-border text-primary focus:ring-primary"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-foreground">[{q.subject}] {q.topic}</span>
                      <p className="text-muted line-clamp-1 mt-0.5">{q.original_text}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCreateModal(false)}
              >
                Batal
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Terbitkan Ruang Ujian
              </Button>
            </div>
          </form>
        </Modal>

        {/* Essay Review Modal */}
        {reviewModalOpen && (
          <Modal
            isOpen={reviewModalOpen}
            onClose={() => setReviewModalOpen(false)}
            title="Review Jawaban Siswa: Budi Pratama"
            description="Penilaian Lembar Jawaban Ujian Matematika & IPAS Kontekstual"
          >
            <form onSubmit={handleGradeEssaySubmit} className="space-y-4">
              <div className="rounded-xl border border-border bg-slate-50 p-3 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted">Skor Pilihan Ganda (Otomatis Server):</span>
                  <strong className="text-success font-bold">100 / 100 (2/2 Benar)</strong>
                </div>
                <p className="text-[11px] text-muted italic">
                  * Multiple choice dinilai deterministik di server tanpa biaya API AI.
                </p>
              </div>

              <div className="space-y-2 border-t border-border/60 pt-3">
                <span className="text-xs font-bold uppercase tracking-wider text-primary block">
                  Soal Uraian / Essay:
                </span>
                <p className="text-xs font-medium text-foreground bg-slate-50 p-2.5 rounded-lg border border-border">
                  Jelaskan bagaimana kondisi bentang alam perairan Sungai Mahakam memengaruhi mata pencaharian masyarakat!
                </p>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-muted uppercase">Jawaban Siswa (Budi Pratama):</span>
                  <p className="text-xs text-foreground p-2.5 rounded-lg border border-indigo-100 bg-indigo-50/40 leading-relaxed">
                    &quot;Karena kami tinggal di dekat Sungai Mahakam, warga banyak yang menjadi nelayan ikan haruan dan pengemudi perahu klotok untuk mengantar orang ke Pasar Pagi.&quot;
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Input
                    label="Nilai Essay (0–10)"
                    type="number"
                    min={0}
                    max={10}
                    value={essayScore}
                    onChange={(e) => setEssayScore(e.target.value)}
                  />
                  <div className="text-[11px] text-muted self-end pb-2">
                    Skor Maksimal: 10 Poin
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                    Catatan Umpan Balik Guru
                  </label>
                  <textarea
                    rows={2}
                    value={essayFeedback}
                    onChange={(e) => setEssayFeedback(e.target.value)}
                    className="w-full rounded-xl border border-border bg-white p-2.5 text-xs focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setReviewModalOpen(false)}
                >
                  Tutup
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Simpan &amp; Rilis Nilai ke Siswa
                </Button>
              </div>
            </form>
          </Modal>
        )}

        {/* View Question Paper Modal */}
        {selectedExam && (
          <Modal
            isOpen={Boolean(selectedExam)}
            onClose={() => setSelectedExam(null)}
            title={selectedExam.title}
            description={`Naskah Ujian • Durasi: ${selectedExam.duration_minutes} Menit`}
          >
            <div className="space-y-4 divide-y divide-border/60">
              {repository.getQuestions().map((q, i) => (
                <div key={q.id} className="pt-3 first:pt-0 space-y-1.5">
                  <span className="text-xs font-bold text-primary">Nomor {i + 1} ({q.subject})</span>
                  <p className="text-xs text-foreground leading-relaxed">{q.original_text}</p>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-border/60 text-right">
              <Button variant="outline" size="sm" onClick={() => setSelectedExam(null)}>
                Tutup
              </Button>
            </div>
          </Modal>
        )}
      </Container>
    </div>
  );
}
