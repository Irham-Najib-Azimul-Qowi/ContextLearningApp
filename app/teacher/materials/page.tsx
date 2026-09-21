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
  BookOpen,
  PlusCircle,
  Sparkles,
  CheckCircle2,
  Users,
  Eye,
  Send,
} from "lucide-react";
import { repository } from "@/lib/db/repository";
import { LearningMaterial, QuestionSubject, ClassRoom } from "@/lib/db/types";

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<LearningMaterial | null>(null);

  // Form State
  const [subject, setSubject] = useState<QuestionSubject>("IPS");
  const [grade, setGrade] = useState("5");
  const [topic, setTopic] = useState("");
  const [objectives, setObjectives] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [contextualizedContent, setContextualizedContent] = useState("");
  const [targetClassId, setTargetClassId] = useState("");

  useEffect(() => {
    setMaterials(repository.getMaterials());
    setClasses(repository.getClasses());
    if (repository.getClasses().length > 0) {
      setTargetClassId(repository.getClasses()[0].id);
    }
  }, []);

  const handleCreateMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !originalContent.trim()) return;

    // Provide default contextualized adaptation if empty
    const cont =
      contextualizedContent.trim() ||
      `${originalContent}\n\nContoh Lokal (Samarinda): Di tepian Sungai Mahakam, interaksi ekonomi berlangsung setiap hari di dermaga Pasar Pagi dan aktivitas penyeberangan Kapal Klotok.`;

    const newM = repository.createMaterial({
      teacher_id: "teacher-demo-01",
      class_id: targetClassId || undefined,
      region_id: "region-samarinda",
      subject,
      grade: Number(grade),
      topic,
      learning_objectives: objectives || "Memahami keterkaitan bentang alam dan kehidupan sosial",
      original_content: originalContent,
      contextualized_content: cont,
      status: "published",
    });

    setMaterials(repository.getMaterials());
    setShowCreateModal(false);
    setTopic("");
    setOriginalContent("");
    setContextualizedContent("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <Container className="py-8 sm:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="primary">Bahan Pembelajaran</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Materi Ajar Kontekstual
            </h1>
            <p className="text-sm text-muted mt-1">
              Susun dan terbitkan bahan bacaan yang diperkaya dengan contoh fenomena alam dan budaya sekitar siswa.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowCreateModal(true)}
            className="shadow-xs"
          >
            <PlusCircle className="h-4 w-4" /> Buat Materi Ajar
          </Button>
        </div>

        {/* Materials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((m) => (
            <Card key={m.id} className="hover:border-primary/30 transition-all flex flex-col">
              <CardHeader className="p-5 pb-3 border-b border-border/60">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{m.subject}</Badge>
                  <Badge variant="neutral">Kelas {m.grade} SD</Badge>
                </div>
                <CardTitle className="text-base font-bold text-foreground mt-2">
                  {m.topic}
                </CardTitle>
                <p className="text-xs text-muted line-clamp-1 mt-0.5">
                  {m.learning_objectives}
                </p>
              </CardHeader>

              <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="rounded-xl bg-slate-50 p-3 text-xs text-muted leading-relaxed line-clamp-4 border border-slate-200">
                  {m.contextualized_content || m.original_content}
                </div>

                <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                  <Badge variant={m.status === "published" ? "success" : "warning"}>
                    {m.status === "published" ? "Diterbitkan" : "Draf"}
                  </Badge>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedMaterial(m)}
                    className="text-xs"
                  >
                    <Eye className="h-3.5 w-3.5 mr-1" /> Baca Selengkapnya
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Create Material Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Tambah Materi Pembelajaran Kontekstual"
          description="Tuliskan materi pembelajaran dan sertakan narasi yang relevan dengan lingkungan siswa."
        >
          <form onSubmit={handleCreateMaterial} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                  Mata Pelajaran
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value as QuestionSubject)}
                  className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="IPS">IPS</option>
                  <option value="Matematika">Matematika</option>
                  <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                  Kelas
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {[1, 2, 3, 4, 5, 6].map((g) => (
                    <option key={g} value={g}>
                      Kelas {g} SD
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                Pilih Kelas Sasaran
              </label>
              <select
                value={targetClassId}
                onChange={(e) => setTargetClassId(e.target.value)}
                className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (Kelas {c.grade} SD)
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Topik Materi"
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Contoh: Ekosistem Sungai dan Interaksi Sosial"
            />

            <Input
              label="Tujuan Pembelajaran"
              type="text"
              value={objectives}
              onChange={(e) => setObjectives(e.target.value)}
              placeholder="Siswa mampu memahami kenampakan alam..."
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                Materi Standar
              </label>
              <textarea
                rows={3}
                required
                value={originalContent}
                onChange={(e) => setOriginalContent(e.target.value)}
                placeholder="Tulis uraian materi standar..."
                className="w-full rounded-xl border border-border bg-white p-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" /> Penjelasan Kontekstual Lokal (Opsional / AI)
              </label>
              <textarea
                rows={3}
                value={contextualizedContent}
                onChange={(e) => setContextualizedContent(e.target.value)}
                placeholder="Uraian yang menghubungkan konsep dengan sungai, pasar, atau komoditas lokal sekitar sekolah..."
                className="w-full rounded-xl border border-indigo-200 bg-indigo-50/30 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
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
                <Send className="h-4 w-4" /> Terbitkan ke Kelas
              </Button>
            </div>
          </form>
        </Modal>

        {/* Detail Modal */}
        {selectedMaterial && (
          <Modal
            isOpen={Boolean(selectedMaterial)}
            onClose={() => setSelectedMaterial(null)}
            title={selectedMaterial.topic}
            description={`${selectedMaterial.subject} • Kelas ${selectedMaterial.grade} SD`}
          >
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-1">
                  Tujuan Pembelajaran:
                </span>
                <p className="text-xs text-foreground font-medium">{selectedMaterial.learning_objectives}</p>
              </div>

              {selectedMaterial.contextualized_content && (
                <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4" /> Uraian Kontekstual Wilayah:
                  </span>
                  <p className="text-xs text-foreground leading-relaxed whitespace-pre-line">
                    {selectedMaterial.contextualized_content}
                  </p>
                </div>
              )}

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-1">
                  Naskah Materi Inti:
                </span>
                <p className="text-xs text-muted leading-relaxed whitespace-pre-line">
                  {selectedMaterial.original_content}
                </p>
              </div>

              <div className="pt-4 border-t border-border/60 text-right">
                <Button variant="outline" size="sm" onClick={() => setSelectedMaterial(null)}>
                  Tutup
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </Container>
    </div>
  );
}
