"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  PlusCircle,
  Sparkles,
  CheckCircle2,
  UsersRound,
  Eye,
  Send,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-[#DCE0EA] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#252B3A] tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#5865D8]" />
            Materi Ajar Kontekstual
          </h1>
          <p className="text-xs text-[#697386] mt-0.5">
            Susun dan terbitkan bahan bacaan yang diperkaya dengan kearifan lokal sekitar sekolah.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowCreateModal(true)}
          className="bg-[#5865D8] hover:bg-[#4753C4] text-xs font-semibold"
        >
          <PlusCircle className="w-4 h-4 mr-1.5" /> Buat Materi Ajar
        </Button>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {materials.map((m) => (
          <div key={m.id} className="bg-white rounded-xl border border-[#DCE0EA] p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-[#5865D8]">
                  {m.subject} • Kelas {m.grade}
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-[#238B68]">
                  Diterbitkan
                </span>
              </div>
              <h3 className="text-base font-bold text-[#252B3A] mt-2">{m.topic}</h3>
              <p className="text-xs text-[#697386] line-clamp-1 mt-0.5">{m.learning_objectives}</p>
            </div>

            <div className="rounded-lg bg-[#F7F8FC] p-3 text-xs text-[#697386] leading-relaxed line-clamp-4 border border-[#EDEFF5]">
              {m.contextualized_content || m.original_content}
            </div>

            <div className="pt-2 border-t border-[#EDEFF5] flex items-center justify-between">
              <span className="text-[11px] text-[#238B68] font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Siap untuk Siswa
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedMaterial(m)}
                className="text-xs h-7 border-[#DCE0EA]"
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
              <label className="font-semibold text-[#252B3A] block mb-1">Mata Pelajaran:</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value as QuestionSubject)}
                className="w-full rounded-xl border border-[#DCE0EA] bg-white px-3 py-2"
              >
                <option value="IPS">IPS</option>
                <option value="Matematika">Matematika</option>
                <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                <option value="IPA">IPA</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-[#252B3A] block mb-1">Tingkat Kelas:</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full rounded-xl border border-[#DCE0EA] bg-white px-3 py-2"
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
            <label className="font-semibold text-[#252B3A] block mb-1">Topik Materi:</label>
            <Input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Contoh: Ekosistem Sungai dan Interaksi Sosial"
            />
          </div>

          <div>
            <label className="font-semibold text-[#252B3A] block mb-1">Tujuan Pembelajaran:</label>
            <Input
              type="text"
              value={objectives}
              onChange={(e) => setObjectives(e.target.value)}
              placeholder="Siswa mampu memahami kenampakan alam..."
            />
          </div>

          <div>
            <label className="font-semibold text-[#252B3A] block mb-1">Uraian Materi Standar:</label>
            <textarea
              rows={3}
              required
              value={originalContent}
              onChange={(e) => setOriginalContent(e.target.value)}
              placeholder="Tulis uraian materi kurikulum standar..."
              className="w-full rounded-xl border border-[#DCE0EA] bg-white p-3 text-xs"
            />
          </div>

          <div>
            <label className="font-semibold text-[#5865D8] block mb-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Uraian Kontekstual Lokal (Opsional):
            </label>
            <textarea
              rows={3}
              value={contextualizedContent}
              onChange={(e) => setContextualizedContent(e.target.value)}
              placeholder="Uraian yang menghubungkan konsep dengan sungai, pasar, atau budaya lokal..."
              className="w-full rounded-xl border border-indigo-200 bg-indigo-50/30 p-3 text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DCE0EA]">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowCreateModal(false)} className="text-xs">
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" className="bg-[#5865D8] text-xs">
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
              <span className="font-bold text-[#697386] block mb-1 uppercase tracking-wider">
                Tujuan Pembelajaran:
              </span>
              <p className="text-[#252B3A] font-medium">{selectedMaterial.learning_objectives}</p>
            </div>

            {selectedMaterial.contextualized_content && (
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 space-y-1">
                <span className="font-bold text-[#5865D8] flex items-center gap-1 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" /> Uraian Kontekstual Wilayah:
                </span>
                <p className="text-[#252B3A] leading-relaxed whitespace-pre-line">
                  {selectedMaterial.contextualized_content}
                </p>
              </div>
            )}

            <div>
              <span className="font-bold text-[#697386] block mb-1 uppercase tracking-wider">
                Naskah Materi Pokok:
              </span>
              <p className="text-[#697386] leading-relaxed whitespace-pre-line">
                {selectedMaterial.original_content}
              </p>
            </div>

            <div className="pt-3 border-t border-[#DCE0EA] text-right">
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
