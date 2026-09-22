"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormattedTextWithMath } from "@/components/ui/math-view";
import {
  Sparkles,
  ArrowRight,
  Layers,
  CheckCircle2,
  AlertCircle,
  Edit3,
  RotateCcw,
  MapPin,
  Check,
  ArrowLeft,
} from "lucide-react";
import { repository } from "@/lib/db/repository";
import { executeContextualization, ContextualizationResult } from "@/lib/context-engine";
import { Question, Region, LocalKnowledgeItem } from "@/lib/db/types";

function ContextPreviewInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const questionId = searchParams.get("question_id") || "q-math-01";

  const [question, setQuestion] = useState<Question | null>(null);
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<string>("region-samarinda");
  const [manualOverrides, setManualOverrides] = useState<Record<string, string>>({});
  const [contextResult, setContextResult] = useState<ContextualizationResult | null>(null);

  // Manual editor toggle for contextualized text
  const [isEditingManually, setIsEditingManually] = useState(false);
  const [editedText, setEditedText] = useState("");
  const [saveAlert, setSaveAlert] = useState(false);

  // Load question and regions
  useEffect(() => {
    const q = repository.getQuestionById(questionId) || repository.getQuestions()[0];
    if (q) {
      setQuestion(q);
    }
    const rList = repository.getRegions();
    setRegions(rList);
  }, [questionId]);

  // Execute contextualization whenever question, region, or manual overrides change
  useEffect(() => {
    if (!question || !selectedRegionId) return;

    const result = executeContextualization(
      {
        subject: question.subject,
        grade: question.grade,
        original_text: question.original_text,
        question_template: question.question_template,
        context_variables: question.context_variables as any,
        options: question.options,
        correct_answer: question.correct_answer,
        region_id: selectedRegionId,
      },
      manualOverrides
    );

    setContextResult(result);
    setEditedText(result.contextualized_text);
  }, [question, selectedRegionId, manualOverrides]);

  const handleSelectAlternative = (variableKey: string, entityName: string) => {
    setManualOverrides((prev) => ({
      ...prev,
      [variableKey]: entityName,
    }));
  };

  const handleReset = () => {
    setManualOverrides({});
    setIsEditingManually(false);
    if (question) {
      setEditedText(question.original_text);
    }
  };

  const handleApproveAndPublish = () => {
    if (!question || !contextResult) return;

    repository.saveContextualization({
      question_id: question.id,
      region_id: selectedRegionId,
      contextualized_text: isEditingManually ? editedText : contextResult.contextualized_text,
      contextualized_options: contextResult.options,
      variable_replacements: contextResult.variable_replacements,
      validation_status: contextResult.validation.status,
      validation_notes: contextResult.validation.notes.join(" | "),
      teacher_edited: isEditingManually,
      is_approved: true,
    });

    setSaveAlert(true);
    setTimeout(() => {
      setSaveAlert(false);
      router.push("/teacher/questions");
    }, 1200);
  };

  if (!question || !contextResult) {
    return (
      <div className="py-20 text-center">
        <p className="text-xs text-secondary-text">Memuat pratinjau kontekstualisasi...</p>
      </div>
    );
  }

  const regionalEntities = repository.getLocalKnowledge(selectedRegionId);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface p-5 rounded-xl border border-border shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/teacher/questions"
              className="text-xs font-semibold text-secondary-text hover:text-foreground flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Bank Soal
            </Link>
            <span className="text-border">/</span>
            <span className="text-xs font-semibold text-primary">Pratinjau Kontekstual</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Komparasi Kontekstualisasi Soal
          </h1>
          <p className="text-xs text-secondary-text mt-1">
            Bandingkan naskah kurikulum nasional dengan hasil adaptasi karakteristik lingkungan sekitar sekolah.
          </p>
        </div>

        {/* Region Switcher Bar */}
        <div className="flex items-center gap-2 bg-[#F2F4F8] border border-border p-2 rounded-lg">
          <MapPin className="h-4 w-4 text-primary shrink-0 ml-1" />
          <span className="text-xs font-semibold text-foreground">Target Wilayah:</span>
          <select
            value={selectedRegionId}
            onChange={(e) => {
              setSelectedRegionId(e.target.value);
              setManualOverrides({});
            }}
            className="rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-semibold text-foreground focus:border-primary focus:outline-none cursor-pointer"
          >
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.regency} ({r.province})
              </option>
            ))}
          </select>
        </div>
      </div>

      {saveAlert && (
        <div className="flex items-center gap-2 rounded-xl bg-success-subtle border border-emerald-200 p-4 text-xs font-semibold text-success">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Soal kontekstual berhasil disetujui dan disimpan ke Bank Soal! Mengalihkan...
        </div>
      )}

      {/* Side-by-Side Comparison Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Original Question Card (Neutral Surface) */}
        <div className="rounded-xl border border-border bg-[#F7F8FB] overflow-hidden flex flex-col shadow-2xs">
          <div className="py-3 px-4 border-b border-border bg-[#ECEFF5] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary-text" />
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                Naskah Asli (Kurikulum Nasional)
              </span>
            </div>
            <Badge variant="neutral">Sebelum Adaptasi</Badge>
          </div>

          <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="rounded-lg border border-border bg-surface p-4 min-h-[120px]">
                <p className="text-sm leading-relaxed text-foreground font-normal">
                  <FormattedTextWithMath text={question.original_text} />
                </p>
              </div>

              {/* Original Options */}
              {question.options && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-secondary-text block">
                    Opsi Jawaban Kurikulum:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {question.options.map((opt) => (
                      <div
                        key={opt.id}
                        className="rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-foreground flex items-center gap-2"
                      >
                        <span className="font-bold text-secondary-text">{opt.id}.</span> {opt.text}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="text-[11px] text-secondary-text space-y-0.5 pt-3 border-t border-border">
              <p>
                <strong>Mata Pelajaran:</strong> {question.subject} • Kelas {question.grade}
              </p>
              <p>
                <strong>Kompetensi Dasar:</strong> {question.learning_objective}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Contextualized Question Card (Highlighted Active Surface) */}
        <div className="rounded-xl border-2 border-primary/30 bg-surface overflow-hidden flex flex-col shadow-2xs">
          <div className="py-3 px-4 border-b border-primary/20 bg-primary-subtle flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                Hasil Kontekstualisasi ({contextResult.region_name})
              </span>
            </div>
            <Badge variant="primary">Context Engine Pipeline</Badge>
          </div>

          <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              {isEditingManually ? (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-primary block">
                    Edit Teks Manual:
                  </span>
                  <textarea
                    rows={4}
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    className="w-full rounded-lg border border-primary/50 bg-surface p-3 text-sm font-medium text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
              ) : (
                <div className="rounded-lg border border-primary/25 bg-primary-subtle/40 p-4 min-h-[120px]">
                  <p className="text-sm leading-relaxed text-foreground font-normal">
                    <FormattedTextWithMath text={contextResult.contextualized_text} />
                  </p>
                </div>
              )}

              {/* Contextualized Options */}
              {contextResult.options && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-primary block">
                    Opsi Jawaban Disesuaikan:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {contextResult.options.map((opt: { id: string; text: string }) => (
                      <div
                        key={opt.id}
                        className={`rounded-lg border px-3 py-2 text-xs font-medium flex items-center gap-2 ${
                          opt.id === question.correct_answer
                            ? "border-emerald-300 bg-success-subtle text-foreground font-semibold"
                            : "border-border bg-[#F7F8FB] text-foreground"
                        }`}
                      >
                        <span className="font-bold text-primary">{opt.id}.</span> {opt.text}
                        {opt.id === question.correct_answer && (
                          <span className="ml-auto text-[9px] font-bold text-success uppercase">
                            Kunci
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Validation Status Badge */}
              <div className="pt-2 border-t border-border flex items-center justify-between">
                <span className="text-xs font-semibold text-secondary-text">Status Validasi Pendidikan:</span>
                <Badge
                  variant={
                    contextResult.validation.status === "verified"
                      ? "success"
                      : contextResult.validation.status === "needs_review"
                      ? "warning"
                      : "neutral"
                  }
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {contextResult.validation.status === "verified"
                    ? "Konteks Terverifikasi & Presisi"
                    : "Perlu Tinjauan Nilai Matematika"}
                </Badge>
              </div>

              {contextResult.validation.notes.length > 0 && (
                <div className="rounded-lg bg-[#F2F4F8] border border-border p-2.5 text-xs text-secondary-text space-y-1">
                  {contextResult.validation.notes.map((n: string, i: number) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="text-primary font-bold">•</span>
                      <span>{n}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Approval & Action Bar */}
            <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingManually(!isEditingManually)}
                  className="text-xs"
                >
                  <Edit3 className="h-3.5 w-3.5 mr-1 text-primary" />
                  {isEditingManually ? "Batal Edit" : "Edit Teks Manual"}
                </Button>
                {Object.keys(manualOverrides).length > 0 && (
                  <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs">
                    <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset Pilihan
                  </Button>
                )}
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={handleApproveAndPublish}
                className="text-xs font-semibold"
              >
                <Check className="h-3.5 w-3.5 mr-1" /> Setujui & Simpan ke Bank Soal
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Local Context Variables Breakdown Panel */}
      <Card>
        <CardHeader className="py-3.5 border-b border-border">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
            <Layers className="h-4 w-4 text-primary" /> Pemetaan Entitas Lingkungan Lokal Wilayah
          </CardTitle>
          <p className="text-xs text-secondary-text mt-0.5">
            Pilih alternatif entitas pengetahuan lokal di bawah untuk mengganti kata/variabel kontekstual secara langsung.
          </p>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {((question.context_variables as any[]) || []).map((cv: any) => {
              const replacedWith = contextResult.variable_replacements?.[cv.key] || cv.original_value;
              const alternatives = regionalEntities.filter(
                (item: LocalKnowledgeItem) =>
                  item.entity_category?.toLowerCase() === cv.category?.toLowerCase()
              );

              return (
                <div
                  key={cv.key}
                  className="rounded-lg border border-border bg-surface p-3.5 space-y-2.5 shadow-2xs"
                >
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <span className="font-mono text-xs font-bold text-primary">[{cv.key}]</span>
                    <Badge variant="neutral">{cv.category}</Badge>
                  </div>

                  <div className="text-xs space-y-1">
                    <div className="flex items-center justify-between text-secondary-text">
                      <span>Naskah Asli:</span>
                      <span className="font-medium text-foreground line-through decoration-red-400">
                        {cv.original_value}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-secondary-text">
                      <span>Pengganti Lokal:</span>
                      <span className="font-bold text-primary">{replacedWith}</span>
                    </div>
                  </div>

                  {alternatives.length > 1 && (
                    <div className="pt-2 border-t border-border">
                      <span className="text-[10px] font-semibold text-secondary-text block mb-1">
                        Pilihan Alternatif di {contextResult.region_name}:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {alternatives.map((alt: LocalKnowledgeItem) => (
                          <button
                            key={alt.id}
                            type="button"
                            onClick={() => handleSelectAlternative(cv.key, alt.entity_name)}
                            className={`rounded-md px-2 py-1 text-[11px] font-medium border transition-colors cursor-pointer ${
                              replacedWith === alt.entity_name
                                ? "bg-primary text-white border-primary"
                                : "bg-[#F2F4F8] border-border text-foreground hover:bg-white hover:border-primary/50"
                            }`}
                          >
                            {alt.entity_name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ContextPreviewPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-secondary-text">Memuat...</div>}>
      <ContextPreviewInner />
    </Suspense>
  );
}
