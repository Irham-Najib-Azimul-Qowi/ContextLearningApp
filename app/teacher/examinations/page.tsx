"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ClipboardList,
  PlusCircle,
  Clock,
  UsersRound,
  Eye,
  Award,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { repository } from "@/lib/db/repository";
import { Examination, Question, ClassRoom, QuestionSubject } from "@/lib/db/types";

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
  const [essayFeedback, setEssayFeedback] = useState(
    "Jawaban sangat baik dan tepat menyebutkan konteks lingkungan sekitar."
  );

  useEffect(() => {
    const schoolId = localStorage.getItem("cl_active_school_id") || "school-sd001-samarinda";
    setExams(repository.getExaminations(schoolId));
    const cList = repository.getClasses(schoolId);
    setClasses(cList);
    if (cList.length > 0) setClassId(cList[0].id);
    const qList = repository.getQuestions(schoolId);
    setQuestions(qList);
    setSelectedQuestionIds(qList.map((q) => q.id));
  }, []);

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !classId) return;

    const schoolId = localStorage.getItem("cl_active_school_id") || "school-sd001-samarinda";
    const targetClass = classes.find((c) => c.id === classId);

    repository.createExamination(
      {
        teacher_id: "teacher-demo-01",
        school_id: schoolId,
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

    setExams(repository.getExaminations(schoolId));
    setShowCreateModal(false);
    setTitle("");
    setDescription("");
  };

  const handleGradeEssaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Penilaian essay berhasil disimpan dan skor akhir telah dipublikasikan ke siswa!");
    setReviewModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface p-5 rounded-xl border border-border shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary" />
            Ruang Ujian & Penilaian
          </h1>
          <p className="text-xs text-secondary-text mt-1">
            Jadwalkan penilaian harian kontekstual, pantau pengumpulan siswa, dan lakukan koreksi essay.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/teacher/examinations/scan-correction">
            <Button variant="outline" size="sm" className="text-xs">
              Koreksi Lembar Scan
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowCreateModal(true)}
            className="text-xs font-semibold"
          >
            <PlusCircle className="w-4 h-4 mr-1.5" /> Buat Ruang Ujian
          </Button>
        </div>
      </div>

      {/* Exams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {exams.map((exam) => (
          <div key={exam.id} className="bg-surface rounded-xl border border-border p-5 shadow-2xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <Badge variant="primary">
                  {exam.subject} · Kelas {exam.grade}
                </Badge>
                <Badge variant="success">
                  Berlangsung
                </Badge>
              </div>
              <h3 className="text-base font-bold text-foreground mt-2">{exam.title}</h3>
              <p className="text-xs text-secondary-text flex items-center gap-1.5 mt-0.5">
                <UsersRound className="w-3.5 h-3.5 text-primary" /> {exam.class_name || "Kelas 5"}
                <span className="text-border">·</span>
                <Clock className="w-3.5 h-3.5 text-secondary-text" /> {exam.duration_minutes} Menit
              </p>
            </div>

            <p className="text-xs text-secondary-text leading-relaxed line-clamp-2">
              {exam.description || "Ujian evaluasi kompetensi kontekstual berbasis lingkungan sekolah."}
            </p>

            <div className="rounded-lg border border-border bg-[#F2F4F8] p-3 space-y-1.5 text-xs text-secondary-text">
              <div className="flex items-center justify-between">
                <span>Jumlah Butir Soal:</span>
                <strong className="text-foreground">{exam.question_count || exam.questions?.length || 3} Butir</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Status Pengumpulan:</span>
                <strong className="text-success">1 Terkumpul (Budi Pratama)</strong>
              </div>
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-between">
              <button
                type="button"
                onClick={() => setReviewModalOpen(true)}
                className="text-xs font-semibold text-link hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Award className="w-3.5 h-3.5" /> Review Essay
              </button>

              <div className="flex items-center gap-1">
                <Link href="/teacher/print">
                  <Button variant="ghost" size="sm" className="h-7 text-xs px-2 text-secondary-text hover:text-foreground" title="Cetak Naskah">
                    <Printer className="w-3.5 h-3.5" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedExam(exam)}
                  className="text-xs h-7"
                >
                  <Eye className="w-3.5 h-3.5 mr-1" /> Naskah
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Exam Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Jadwalkan Ruang Ujian Baru"
        description="Pilih kelas dan butir soal yang telah disetujui dari Bank Soal."
      >
        <form onSubmit={handleCreateExam} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-foreground block mb-1">Judul Ujian / Penilaian:</label>
            <Input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Penilaian Harian Matematika Kontekstual"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-foreground block mb-1">Kelas Sasaran:</label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-foreground block mb-1">Durasi Ujian (Menit):</label>
              <Input
                type="number"
                min={10}
                max={180}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-foreground block mb-1">
              Pilih Soal dari Bank Soal ({selectedQuestionIds.length} Soal Terpilih):
            </label>
            <div className="max-h-48 overflow-y-auto rounded-lg border border-border bg-[#F2F4F8] p-2 divide-y divide-border">
              {questions.map((q) => (
                <label key={q.id} className="py-2 px-2 flex items-start gap-2.5 cursor-pointer hover:bg-surface rounded-md">
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
                    className="mt-0.5 rounded text-primary focus:ring-primary"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-foreground">
                      [{q.subject}] {q.topic}
                    </span>
                    <p className="text-secondary-text line-clamp-1 mt-0.5">{q.original_text}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowCreateModal(false)} className="text-xs">
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" className="text-xs">
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
          description="Evaluasi Jawaban Lembar Ujian Kontekstual"
        >
          <form onSubmit={handleGradeEssaySubmit} className="space-y-4 text-xs">
            <div className="rounded-lg border border-border bg-[#F2F4F8] p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-secondary-text">Skor Pilihan Ganda (Otomatis Deterministik):</span>
                <strong className="text-success font-bold">100 / 100 (2/2 Benar)</strong>
              </div>
            </div>

            <div className="space-y-2 border-t border-border pt-3">
              <span className="font-bold text-primary block uppercase tracking-wider">
                Soal Uraian / Essay:
              </span>
              <p className="font-medium text-foreground bg-[#F2F4F8] p-3 rounded-lg border border-border">
                Jelaskan bagaimana kondisi bentang alam perairan Sungai Mahakam memengaruhi mata pencaharian masyarakat!
              </p>

              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-secondary-text uppercase">Jawaban Siswa:</span>
                <p className="text-foreground p-3 rounded-lg border border-primary/20 bg-primary-subtle leading-relaxed">
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
                <div className="text-[11px] text-secondary-text self-end pb-2">
                  Skor Maksimal: 10 Poin
                </div>
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">Catatan Umpan Balik Guru:</label>
                <textarea
                  rows={2}
                  value={essayFeedback}
                  onChange={(e) => setEssayFeedback(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface text-foreground p-2.5 text-xs focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button type="button" variant="outline" size="sm" onClick={() => setReviewModalOpen(false)} className="text-xs">
                Tutup
              </Button>
              <Button type="submit" variant="primary" size="sm" className="text-xs">
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
          <div className="space-y-4 divide-y divide-border text-xs">
            {repository.getQuestions().map((q, i) => (
              <div key={q.id} className="pt-3 first:pt-0 space-y-1">
                <span className="font-semibold text-primary">Nomor {i + 1} ({q.subject})</span>
                <p className="text-foreground leading-relaxed font-normal">{q.original_text}</p>
              </div>
            ))}
          </div>
          <div className="pt-3 border-t border-border text-right">
            <Button variant="outline" size="sm" onClick={() => setSelectedExam(null)} className="text-xs">
              Tutup
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
