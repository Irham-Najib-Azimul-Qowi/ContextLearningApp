"use client";

import React, { useState, useEffect } from "react";
import {
  ScanLine,
  Upload,
  CheckCircle2,
  AlertCircle,
  Eye,
  Check,
  RotateCcw,
  ClipboardList,
  Save,
  Printer,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { repository } from "@/lib/db/repository";
import { Examination, Profile, ScannedAnswerSheet } from "@/lib/db/types";

export default function ScanCorrectionPage() {
  const [exams, setExams] = useState<Examination[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [students, setStudents] = useState<Profile[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");

  // Scan workflow state
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [detectedAnswers, setDetectedAnswers] = useState<Record<string, string>>({});
  const [uncertainQuestions, setUncertainQuestions] = useState<string[]>([]);
  const [isGraded, setIsGraded] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [showAnswerSheetTemplate, setShowAnswerSheetTemplate] = useState(false);

  useEffect(() => {
    const schoolId = localStorage.getItem("cl_active_school_id") || "school-sd001-samarinda";
    const exList = repository.getExaminations(schoolId);
    setExams(exList);
    if (exList.length > 0) setSelectedExamId(exList[0].id);

    const stdList = repository.getStudentsBySchool(schoolId);
    setStudents(stdList);
    if (stdList.length > 0) setSelectedStudentId(stdList[0].id);
  }, []);

  const currentExam = exams.find((e) => e.id === selectedExamId);
  const currentStudent = students.find((s) => s.id === selectedStudentId);

  // Simulated Sheet Scanner
  const handleSimulateScan = () => {
    if (!currentExam) return;
    setIsExtracting(true);
    setScannedImage("/placeholder-answersheet.png");

    setTimeout(() => {
      // Deterministically detect student markings
      const detected: Record<string, string> = {};
      const questions = currentExam.questions || [];

      questions.forEach((q, idx) => {
        if (q.question_type === "multiple_choice") {
          // Mostly correct, but simulate 1 question with uncertain mark
          if (idx === 1) {
            detected[q.id] = q.correct_answer;
          } else {
            detected[q.id] = q.correct_answer;
          }
        }
      });

      setDetectedAnswers(detected);
      setUncertainQuestions([]);
      setIsExtracting(false);
      setIsGraded(false);
      setFinalScore(null);
    }, 800);
  };

  const handleConfirmAndGrade = () => {
    if (!currentExam || !currentStudent) return;

    // Calculate score deterministically
    let correct = 0;
    let total = 0;
    const questions = currentExam.questions || [];

    questions.forEach((q) => {
      if (q.question_type === "multiple_choice") {
        total++;
        if (detectedAnswers[q.id] === q.correct_answer) {
          correct++;
        }
      }
    });

    const score = total > 0 ? Math.round((correct / total) * 100) : 100;
    setFinalScore(score);
    setIsGraded(true);

    // Save into repository
    repository.confirmScannedGrading(
      "scan-001",
      detectedAnswers,
      "teacher-demo-01"
    );

    // Record attempt
    const existing = repository.getAttempt(currentExam.id, currentStudent.id);
    if (existing) {
      existing.score = score;
      existing.status = "graded";
      existing.submission_source = "scanned";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface p-5 rounded-xl border border-border shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <ScanLine className="w-5 h-5 text-success" />
            Koreksi Lembar Jawaban Ujian Berbasis Scan (LJK)
          </h1>
          <p className="text-xs text-foreground-secondary mt-0.5">
            Ekstraksi tanda pensil/pulpen siswa pada lembar jawaban kertas dan penskoran deterministik otomatis dengan verifikasi guru.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAnswerSheetTemplate(!showAnswerSheetTemplate)}
          className="text-xs border-border text-foreground hover:bg-surface-secondary"
        >
          <Printer className="w-4 h-4 mr-1.5 text-primary" />
          {showAnswerSheetTemplate ? "Tutup Template LJK" : "Lihat / Cetak Template LJK"}
        </Button>
      </div>

      {/* Standardized Answer Sheet Template Preview Modal */}
      {showAnswerSheetTemplate && currentExam && (
        <div className="bg-surface p-6 rounded-xl border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-sm font-bold text-foreground">Template Lembar Jawaban Komputer Standar (LJK)</h3>
            <span className="text-xs text-foreground-secondary">Format A4 • Siap Dicetak & Dibagikan</span>
          </div>

          <div className="max-w-md mx-auto p-5 border-2 border-border-strong rounded-lg space-y-4 text-xs font-mono bg-surface">
            <div className="text-center border-b border-border pb-2">
              <span className="font-bold text-sm block text-foreground">LEMBAR JAWABAN SISWA (LJK)</span>
              <span className="text-[11px] text-foreground-secondary">{currentExam.title}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] border border-border p-2 rounded-md bg-surface-secondary">
              <div>NISN: [ _ _ _ _ _ _ _ _ ]</div>
              <div>Kelas: [ 5-A ]</div>
            </div>

            <div className="space-y-2 pt-2">
              {(currentExam.questions || []).map((q, idx) => (
                <div key={q.id} className="flex items-center justify-between border-b border-border/50 pb-1">
                  <span className="font-bold w-6 text-foreground">{idx + 1}.</span>
                  <div className="flex gap-3">
                    {["A", "B", "C", "D"].map((opt) => (
                      <span
                        key={opt}
                        className="w-5 h-5 rounded-full border border-border-strong flex items-center justify-center text-[10px] text-foreground"
                      >
                        {opt}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Workflow Controls: Select Exam & Student */}
      <div className="bg-surface p-5 rounded-xl border border-border shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="font-semibold text-foreground block mb-1">Pilih Ujian yang Dikoreksi:</label>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.title} ({ex.subject} - Kelas {ex.grade})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-semibold text-foreground block mb-1">Identitas Siswa Pemilik Lembar:</label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {students.map((st) => (
              <option key={st.id} value={st.id}>
                {st.full_name} ({st.student_code || "STU-001"})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Upload / Capture Scanner Box */}
      <div className="bg-surface p-6 rounded-xl border border-border shadow-xs text-center space-y-3">
        <div className="max-w-md mx-auto p-6 border-2 border-dashed border-border-strong rounded-xl bg-surface-secondary">
          <ScanLine className="w-10 h-10 text-primary mx-auto mb-2" />
          <p className="text-xs font-semibold text-foreground">Unggah Foto atau Pindai Lembar Jawaban</p>
          <p className="text-[11px] text-foreground-secondary mt-0.5 mb-3">
            Format didukung: JPG, PNG, atau hasil pemindaian scanner resolusi 150 DPI+.
          </p>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSimulateScan}
            disabled={isExtracting}
            className="bg-success hover:bg-success/90 text-white text-xs font-semibold"
          >
            {isExtracting ? "Mendeteksi Tanda Jawaban..." : "Pindai Lembar Jawaban Siswa"}
          </Button>
        </div>
      </div>

      {/* Side-by-Side Review & Verification */}
      {scannedImage && currentExam && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Scanned Sheet Visual Preview */}
          <div className="bg-surface p-5 rounded-xl border border-border shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" /> Citra Lembar Jawaban Fisik
            </h3>
            <div className="border border-border rounded-lg p-6 bg-surface-secondary flex flex-col items-center justify-center min-h-[340px] text-xs text-foreground-secondary">
              <div className="w-48 bg-surface p-4 border border-border-strong shadow-xs space-y-2 font-mono text-[10px]">
                <div className="text-center border-b border-border pb-1 font-bold text-foreground">LJK: {currentStudent?.full_name}</div>
                <div className="text-foreground-secondary">ID: {currentStudent?.student_code}</div>
                <div className="space-y-1 pt-1">
                  {(currentExam.questions || []).map((q, idx) => (
                    <div key={q.id} className="flex justify-between items-center text-foreground">
                      <span>{idx + 1}.</span>
                      <span className="font-bold text-primary bg-primary/10 px-1 rounded">
                        [ {detectedAnswers[q.id] || "?"} ]
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <span className="text-[11px] text-foreground-secondary mt-3">
                Identifikasi tanda hitam terdeteksi otomatis.
              </span>
            </div>
          </div>

          {/* Right: Detected Answers Table with Teacher Override */}
          <div className="bg-surface p-5 rounded-xl border border-border shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-success" /> Hasil Deteksi & Verifikasi Guru
              </h3>
              <span className="text-xs text-foreground-secondary">Bisa dikoreksi manual</span>
            </div>

            <div className="divide-y divide-border text-xs max-h-80 overflow-y-auto">
              {(currentExam.questions || []).map((q, idx) => {
                const detected = detectedAnswers[q.id];
                const isCorrect = detected === q.correct_answer;

                return (
                  <div key={q.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-foreground">Soal {idx + 1}</span>
                      <span className="text-foreground-secondary ml-2 text-[11px]">Kunci: {q.correct_answer}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Detected Option Selector */}
                      <div className="flex gap-1">
                        {["A", "B", "C", "D"].map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() =>
                              setDetectedAnswers((prev) => ({
                                ...prev,
                                [q.id]: opt,
                              }))
                            }
                            className={`w-6 h-6 rounded-md text-xs font-bold transition-all ${
                              detected === opt
                                ? "bg-primary text-white shadow-xs"
                                : "bg-surface-secondary text-foreground hover:bg-border/60"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>

                      {/* Status Check */}
                      {isCorrect ? (
                        <span className="text-[11px] font-bold text-success flex items-center gap-0.5">
                          <Check className="w-3.5 h-3.5" /> Benar
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-error">Salah</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Final Grade Actions */}
            <div className="pt-3 border-t border-border flex items-center justify-between">
              {isGraded && finalScore !== null ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-foreground-secondary">Skor Akhir Terkoreksi:</span>
                  <span className="text-xl font-extrabold text-success font-mono">{finalScore} / 100</span>
                </div>
              ) : (
                <span className="text-xs text-foreground-secondary">Periksa pilihan sebelum menyimpan hasil</span>
              )}

              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleConfirmAndGrade}
                className="bg-success hover:bg-success/90 text-white text-xs font-semibold"
              >
                <Save className="w-3.5 h-3.5 mr-1" />
                {isGraded ? "Perbarui & Simpan Nilai" : "Konfirmasi & Nilai Otomatis"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
