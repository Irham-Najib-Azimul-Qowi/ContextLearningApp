"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/navbar";
import Container from "@/components/ui/container";
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
  RefreshCw,
  Edit3,
  RotateCcw,
  Save,
  MapPin,
  HelpCircle,
  Check,
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
    }, 1500);
  };

  if (!question || !contextResult) {
    return (
      <Container className="py-20 text-center">
        <p className="text-sm text-muted">Memuat pratinjau kontekstualisasi...</p>
      </Container>
    );
  }

  const currentRegion = regions.find((r) => r.id === selectedRegionId);
  const regionalEntities = repository.getLocalKnowledge(selectedRegionId);

  return (
    <Container className="py-8 sm:py-10">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary">Flagship Feature</Badge>
            <span className="text-xs text-muted">Pipeline Kontekstualisasi Cerdas</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Pratinjau &amp; Komparasi Kontekstualisasi Soal
          </h1>
          <p className="text-sm text-muted mt-1">
            Bandingkan naskah soal kurikulum nasional dengan hasil adaptasi karakteristik lingkungan sekitar sekolah.
          </p>
        </div>

        {/* Region Switcher Bar */}
        <div className="flex items-center gap-2 bg-white border border-border p-2 rounded-2xl shadow-xs">
          <MapPin className="h-4 w-4 text-primary ml-1" />
          <span className="text-xs font-semibold text-foreground">Wilayah:</span>
          <select
            value={selectedRegionId}
            onChange={(e) => {
              setSelectedRegionId(e.target.value);
              setManualOverrides({});
            }}
            className="rounded-xl border-none bg-slate-100 px-3 py-1.5 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary/20"
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
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-success font-semibold">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          Soal kontekstual berhasil disetujui dan disimpan ke Bank Soal!
        </div>
      )}

      {/* Flagship Side-by-Side Comparison Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Left: Original Question Card */}
        <Card className="border-border">
          <CardHeader className="py-4 border-b border-border/60 bg-slate-50/50 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 rounded-full bg-slate-400" />
              <CardTitle className="text-base font-bold text-foreground">
                Soal Asli (Kurikulum Umum)
              </CardTitle>
            </div>
            <Badge variant="neutral">Sebelum Adaptasi</Badge>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 min-h-[140px]">
              <p className="text-sm leading-relaxed text-slate-800 font-medium">
                <FormattedTextWithMath text={question.original_text} />
              </p>
            </div>

            {/* Original Options */}
            {question.options && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                  Opsi Jawaban Asli:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {question.options.map((opt) => (
                    <div
                      key={opt.id}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 flex items-center gap-2"
                    >
                      <span className="font-bold text-muted">{opt.id}.</span> {opt.text}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-[11px] text-muted space-y-1 pt-2 border-t border-border/40">
              <p>
                <strong>Mata Pelajaran:</strong> {question.subject} • Kelas {question.grade} SD
              </p>
              <p>
                <strong>Kompetensi Dasar:</strong> {question.learning_objective}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Right: Contextualized Question Card */}
        <Card className="border-indigo-200 shadow-sm ring-1 ring-indigo-100">
          <CardHeader className="py-4 border-b border-indigo-100 bg-indigo-50/40 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 rounded-full bg-primary animate-pulse" />
              <CardTitle className="text-base font-bold text-primary">
                Soal Kontekstual ({contextResult.region_name})
              </CardTitle>
            </div>
            <Badge variant="primary">Hasil Pemrosesan Context Engine</Badge>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            {isEditingManually ? (
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  Edit Naskah Manual Guru:
                </span>
                <textarea
                  rows={4}
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="w-full rounded-xl border border-primary/40 bg-white p-3.5 text-sm font-medium focus:ring-2 focus:ring-primary/20"
                />
              </div>
            ) : (
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/30 p-4 min-h-[140px]">
                <p className="text-sm leading-relaxed text-foreground font-medium">
                  <FormattedTextWithMath text={contextResult.contextualized_text} />
                </p>
              </div>
            )}

            {/* Contextualized Options */}
            {contextResult.options && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  Opsi Jawaban Disesuaikan:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {contextResult.options.map((opt: { id: string; text: string }) => (
                    <div
                      key={opt.id}
                      className={`rounded-lg border px-3 py-2 text-xs font-medium flex items-center gap-2 ${
                        opt.id === question.correct_answer
                          ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                          : "border-indigo-100 bg-white text-foreground"
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

            {/* Educational Validation Status Badge */}
            <div className="pt-2 border-t border-border/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted">Status Validasi Pendidikan:</span>
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
                    : "Perlu Ditinjau Guru"}
                </Badge>
              </div>

              {/* Validation Notes */}
              <div className="mt-2 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-muted">
                {contextResult.validation.notes.map((n: string, i: number) => (
                  <p key={i} className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    {n}
                  </p>
                ))}
              </div>
            </div>

            {/* Interactive Control Buttons */}
            <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingManually(!isEditingManually)}
                  className="text-xs"
                >
                  <Edit3 className="h-3.5 w-3.5 mr-1" />
                  {isEditingManually ? "Gunakan Hasil Otomatis" : "Edit Teks Manual"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="text-xs text-muted hover:text-foreground"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset
                </Button>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={handleApproveAndPublish}
                className="shadow-xs"
              >
                <Check className="h-4 w-4 mr-1" /> Setujui &amp; Simpan Soal
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alternative Local Entity Selector Box */}
      <Card>
        <CardHeader className="py-4 border-b border-border/60">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> Pemetaan Variabel Kontekstual &amp; Pilihan Alternatif Lokal
          </CardTitle>
          <p className="text-xs text-muted mt-0.5">
            Guru memiliki kendali penuh untuk memilih entitas lokal lain yang lebih familiar bagi siswa di sekolah.
          </p>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(Object.entries(contextResult.variable_replacements) as [string, string][]).map(([varKey, currentVal]) => {

              // Get category for this variable
              const matchingVar = question.context_variables.find((v) => v.key === varKey);
              const category = matchingVar ? matchingVar.category : "economy";
              const candidateEntities = regionalEntities.filter((e) => e.entity_category === category);

              return (
                <div key={varKey} className="rounded-2xl border border-border bg-slate-50/50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-primary bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                      [{varKey}]
                    </span>
                    <span className="text-[10px] uppercase font-bold text-muted">
                      Kategori: {category}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-muted block">Entitas Terpilih Saat Ini:</span>
                    <p className="text-sm font-bold text-foreground mt-0.5">{currentVal}</p>
                  </div>

                  {candidateEntities.length > 1 && (
                    <div className="space-y-1.5 pt-2 border-t border-border/60">
                      <span className="text-[10px] font-semibold text-muted uppercase tracking-wider block">
                        Pilih Entitas Alternatif:
                      </span>
                      <div className="space-y-1">
                        {candidateEntities.map((cand) => (
                          <button
                            key={cand.id}
                            type="button"
                            onClick={() => handleSelectAlternative(varKey, cand.entity_name)}
                            className={`w-full text-left rounded-xl p-2 text-xs transition-all flex items-center justify-between ${
                              cand.entity_name === currentVal
                                ? "bg-primary text-white font-semibold shadow-xs"
                                : "bg-white border border-border text-foreground hover:bg-slate-100"
                            }`}
                          >
                            <span className="truncate">{cand.entity_name}</span>
                            {cand.entity_name === currentVal && (
                              <Check className="h-3 w-3 shrink-0 ml-1" />
                            )}
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
    </Container>
  );
}

export default function ContextPreviewPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Suspense fallback={<div className="py-20 text-center text-sm text-muted">Memuat...</div>}>
        <ContextPreviewInner />
      </Suspense>
    </div>
  );
}
