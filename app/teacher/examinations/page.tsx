"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ClipboardList,
  PlusCircle,
  Clock,
  UsersRound,
  CheckCircle2,
  Eye,
  Award,
  Calendar,
  Printer,
  ScanLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-[#DCE0EA] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#252B3A] tracking-tight flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-[#5865D8]" />
            Ruang Ujian & Penilaian Siswa
          </h1>
          <p className="text-xs text-[#697386] mt-0.5">
            Jadwalkan penilaian kontekstual, cetak LJK, koreksi lembar jawaban scan, dan review hasil evaluasi.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/teacher/examinations/scan-correction">
            <Button variant="outline" size="sm" className="text-xs border-[#238B68] text-[#238B68] bg-emerald-50/50">
              <ScanLine className="w-3.5 h-3.5 mr-1" /> Koreksi Scan LJK
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowCreateModal(true)}
            className="bg-[#5865D8] hover:bg-[#4753C4] text-xs font-semibold"
          >
            <PlusCircle className="w-4 h-4 mr-1.5" /> Buat Ruang Ujian
          </Button>
        </div>
      </div>

      {/* Exams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {exams.map((exam) => (
          <div key={exam.id} className="bg-white rounded-xl border border-[#DCE0EA] p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-[#5865D8]">
                  {exam.subject} • Kelas {exam.grade}
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-[#238B68]">
                  Berlangsung
                </span>
              </div>
              <h3 className="text-base font-bold text-[#252B3A] mt-2">{exam.title}</h3>
              <p className="text-xs text-[#697386] flex items-center gap-1.5 mt-0.5">
                <UsersRound className="w-3.5 h-3.5 text-[#5865D8]" /> {exam.class_name || "Kelas 5 SD"}
                <span className="text-slate-300">•</span>
                <Clock className="w-3.5 h-3.5 text-[#697386]" /> {exam.duration_minutes} Menit
              </p>
            </div>

            <p className="text-xs text-[#697386] leading-relaxed line-clamp-2">
              {exam.description || "Ujian evaluasi kompetensi kontekstual berbasis lingkungan sekolah."}
            </p>

            <div className="rounded-lg border border-[#EDEFF5] bg-[#F7F8FC] p-3 space-y-1 text-xs text-[#697386]">
              <div className="flex items-center justify-between">
                <span>Jumlah Butir Soal:</span>
                <strong className="text-[#252B3A]">{exam.question_count || exam.questions?.length || 3} Butir</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Status Pengumpulan:</span>
                <strong className="text-[#238B68]">1 Terkumpul (Budi Pratama)</strong>
              </div>
            </div>

            <div className="pt-2 border-t border-[#EDEFF5] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setReviewModalOpen(true)}
                className="text-xs font-semibold text-[#5865D8] hover:underline flex items-center gap-1"
              >
                <Award className="w-3.5 h-3.5" /> Review Essay
              </button>

              <div className="flex items-center gap-1">
                <Link href="/teacher/print">
                  <Button variant="ghost" size="sm" className="h-7 text-xs px-2 text-[#697386]" title="Cetak Naskah">
                    <Printer className="w-3.5 h-3.5" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedExam(exam)}
                  className="text-xs h-7 border-[#DCE0EA]"
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
            <label className="font-semibold text-[#252B3A] block mb-1">Judul Ujian / Penilaian:</label>
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
              <label className="font-semibold text-[#252B3A] block mb-1">Kelas Sasaran:</label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full rounded-xl border border-[#DCE0EA] bg-white px-3 py-2 text-xs"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-[#252B3A] block mb-1">Durasi Ujian (Menit):</label>
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
            <label className="font-semibold text-[#252B3A] block mb-1">
              Pilih Soal dari Bank Soal ({selectedQuestionIds.length} Soal Terpilih):
            </label>
            <div className="max-h-48 overflow-y-auto rounded-xl border border-[#DCE0EA] bg-[#F7F8FC] p-2 divide-y divide-[#EDEFF5]">
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
                    className="mt-0.5 rounded text-[#5865D8]"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-[#252B3A]">
                      [{q.subject}] {q.topic}
                    </span>
                    <p className="text-[#697386] line-clamp-1 mt-0.5">{q.original_text}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DCE0EA]">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowCreateModal(false)} className="text-xs">
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" className="bg-[#5865D8] text-xs">
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
            <div className="rounded-xl border border-[#DCE0EA] bg-[#F7F8FC] p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[#697386]">Skor Pilihan Ganda (Otomatis Deterministik):</span>
                <strong className="text-[#238B68] font-bold">100 / 100 (2/2 Benar)</strong>
              </div>
            </div>

            <div className="space-y-2 border-t border-[#DCE0EA] pt-3">
              <span className="font-bold text-[#5865D8] block uppercase tracking-wider">
                Soal Uraian / Essay:
              </span>
              <p className="font-medium text-[#252B3A] bg-[#F7F8FC] p-2.5 rounded-lg border border-[#DCE0EA]">
                Jelaskan bagaimana kondisi bentang alam perairan Sungai Mahakam memengaruhi mata pencaharian masyarakat!
              </p>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#697386] uppercase">Jawaban Siswa:</span>
                <p className="text-[#252B3A] p-2.5 rounded-lg border border-indigo-100 bg-indigo-50/40 leading-relaxed">
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
                <div className="text-[11px] text-[#697386] self-end pb-2">
                  Skor Maksimal: 10 Poin
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#252B3A] block mb-1">Catatan Umpan Balik Guru:</label>
                <textarea
                  rows={2}
                  value={essayFeedback}
                  onChange={(e) => setEssayFeedback(e.target.value)}
                  className="w-full rounded-xl border border-[#DCE0EA] bg-white p-2 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DCE0EA]">
              <Button type="button" variant="outline" size="sm" onClick={() => setReviewModalOpen(false)} className="text-xs">
                Tutup
              </Button>
              <Button type="submit" variant="primary" size="sm" className="bg-[#5865D8] text-xs">
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
          <div className="space-y-4 divide-y divide-[#EDEFF5] text-xs">
            {repository.getQuestions().map((q, i) => (
              <div key={q.id} className="pt-3 first:pt-0 space-y-1">
                <span className="font-bold text-[#5865D8]">Nomor {i + 1} ({q.subject})</span>
                <p className="text-[#252B3A] leading-relaxed">{q.original_text}</p>
              </div>
            ))}
          </div>
          <div className="pt-3 border-t border-[#DCE0EA] text-right">
            <Button variant="outline" size="sm" onClick={() => setSelectedExam(null)} className="text-xs">
              Tutup
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
