"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  PlusCircle,
  Sparkles,
  CheckCircle2,
  Eye,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
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
    const schoolId = localStorage.getItem("cl_active_school_id") || "school-sd001-samarinda";
    setMaterials(repository.getMaterials(schoolId));
    const cls = repository.getClasses(schoolId);
    setClasses(cls);
    if (cls.length > 0) {
      setTargetClassId(cls[0].id);
    }
  }, []);

  const handleCreateMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !originalContent.trim()) return;

    const schoolId = localStorage.getItem("cl_active_school_id") || "school-sd001-samarinda";
    const cont =
      contextualizedContent.trim() ||
      `${originalContent}\n\nContoh Lokal (Kearifan Daerah): Di tepian Sungai Mahakam, interaksi ekonomi berlangsung setiap hari di dermaga Pasar Pagi dan penyeberangan Kapal Klotok.`;

    repository.createMaterial({
      teacher_id: "teacher-demo-01",
      school_id: schoolId,
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

    setMaterials(repository.getMaterials(schoolId));
    setShowCreateModal(false);
    setTopic("");
    setOriginalContent("");
    setContextualizedContent("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface p-5 rounded-xl border border-border shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Materi Ajar Kontekstual
          </h1>
          <p className="text-xs text-secondary-text mt-1">
            Susun dan terbitkan bahan ajar yang diperkaya dengan kearifan lokal lingkungan sekitar sekolah.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowCreateModal(true)}
          className="text-xs font-semibold"
        >
          <PlusCircle className="w-4 h-4 mr-1.5" /> Buat Materi Ajar
        </Button>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {materials.map((m) => (
          <div key={m.id} className="bg-surface rounded-xl border border-border p-5 shadow-2xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <Badge variant="primary">
                  {m.subject} · Kelas {m.grade}
                </Badge>
                <Badge variant="success">
                  Diterbitkan
                </Badge>
              </div>
              <h3 className="text-base font-bold text-foreground mt-2">{m.topic}</h3>
              <p className="text-xs text-secondary-text line-clamp-1 mt-0.5">{m.learning_objectives}</p>
            </div>

            <div className="rounded-lg bg-[#F2F4F8] p-3 text-xs text-foreground leading-relaxed line-clamp-4 border border-border">
              {m.contextualized_content || m.original_content}
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-between">
              <span className="text-[11px] text-success font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Siap untuk Siswa
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedMaterial(m)}
                className="text-xs h-7"
              >
                <Eye className="w-3.5 h-3.5 mr-1" /> Baca Selengkapnya
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Material Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Tambah Materi Pembelajaran Kontekstual"
        description="Sertakan contoh fenomena alam atau kegiatan sosial di wilayah sekolah."
      >
        <form onSubmit={handleCreateMaterial} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-foreground block mb-1">Mata Pelajaran:</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value as QuestionSubject)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
              >
                <option value="IPS">IPS</option>
                <option value="Matematika">Matematika</option>
                <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                <option value="IPA">IPA</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-foreground block mb-1">Tingkat Kelas:</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                  <option key={g} value={g}>
                    Kelas {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-foreground block mb-1">Topik Materi:</label>
            <Input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Contoh: Ekosistem Sungai dan Interaksi Sosial"
            />
          </div>

          <div>
            <label className="font-semibold text-foreground block mb-1">Tujuan Pembelajaran:</label>
            <Input
              type="text"
              value={objectives}
              onChange={(e) => setObjectives(e.target.value)}
              placeholder="Siswa mampu memahami kenampakan alam..."
            />
          </div>

          <div>
            <label className="font-semibold text-foreground block mb-1">Uraian Materi Standar:</label>
            <textarea
              rows={3}
              required
              value={originalContent}
              onChange={(e) => setOriginalContent(e.target.value)}
              placeholder="Tulis uraian materi kurikulum standar..."
              className="w-full rounded-lg border border-border bg-surface text-foreground p-3 text-xs focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-primary block mb-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Uraian Kontekstual Lokal (Opsional):
            </label>
            <textarea
              rows={3}
              value={contextualizedContent}
              onChange={(e) => setContextualizedContent(e.target.value)}
              placeholder="Uraian yang menghubungkan konsep dengan sungai, pasar, atau budaya lokal..."
              className="w-full rounded-lg border border-primary/25 bg-primary-subtle p-3 text-xs text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowCreateModal(false)} className="text-xs">
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" className="text-xs">
              <Send className="w-3.5 h-3.5 mr-1" /> Terbitkan ke Kelas
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
          description={`${selectedMaterial.subject} • Kelas ${selectedMaterial.grade}`}
        >
          <div className="space-y-4 text-xs">
            <div>
              <span className="font-semibold text-secondary-text block mb-1 uppercase tracking-wider">
                Tujuan Pembelajaran:
              </span>
              <p className="text-foreground font-medium">{selectedMaterial.learning_objectives}</p>
            </div>

            {selectedMaterial.contextualized_content && (
              <div className="rounded-lg border border-primary/25 bg-primary-subtle p-4 space-y-1">
                <span className="font-bold text-primary flex items-center gap-1 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" /> Uraian Kontekstual Wilayah:
                </span>
                <p className="text-foreground leading-relaxed whitespace-pre-line">
                  {selectedMaterial.contextualized_content}
                </p>
              </div>
            )}

            <div>
              <span className="font-semibold text-secondary-text block mb-1 uppercase tracking-wider">
                Naskah Materi Pokok:
              </span>
              <p className="text-secondary-text leading-relaxed whitespace-pre-line">
                {selectedMaterial.original_content}
              </p>
            </div>

            <div className="pt-3 border-t border-border text-right">
              <Button variant="outline" size="sm" onClick={() => setSelectedMaterial(null)} className="text-xs">
                Tutup
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
