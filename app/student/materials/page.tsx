"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, Sparkles, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { repository } from "@/lib/db/repository";
import { LearningMaterial } from "@/lib/db/types";

export default function StudentMaterialsPage() {
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<LearningMaterial | null>(null);

  useEffect(() => {
    setMaterials(repository.getMaterials());
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-[#DCE0EA] shadow-xs">
        <h1 className="text-xl font-bold text-[#252B3A] tracking-tight flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#5865D8]" />
          Bahan Bacaan & Materi Kontekstual
        </h1>
        <p className="text-xs text-[#697386] mt-0.5">
          Pelajari konsep mata pelajaran melalui cerita dan contoh nyata dari lingkungan sekitar sekolah.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {materials.map((m) => (
          <div key={m.id} className="bg-white rounded-xl border border-[#DCE0EA] p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-[#5865D8]">
                  {m.subject}
                </span>
                <span className="text-[11px] text-[#697386]">Kelas {m.grade} SD</span>
              </div>
              <h3 className="text-base font-bold text-[#252B3A] mt-2">{m.topic}</h3>
              <p className="text-xs text-[#697386] line-clamp-1 mt-0.5">{m.learning_objectives}</p>
            </div>

            <div className="rounded-lg bg-[#F7F8FC] p-3 text-xs text-[#697386] leading-relaxed line-clamp-4 border border-[#EDEFF5]">
              {m.contextualized_content || m.original_content}
            </div>

            <div className="pt-2 border-t border-[#EDEFF5] flex justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setSelectedMaterial(m)}
                className="bg-[#5865D8] hover:bg-[#4753C4] text-xs"
              >
                <Eye className="w-3.5 h-3.5 mr-1" /> Baca Selengkapnya
              </Button>
            </div>
          </div>
        ))}
      </div>

      {selectedMaterial && (
        <Modal
          isOpen={Boolean(selectedMaterial)}
          onClose={() => setSelectedMaterial(null)}
          title={selectedMaterial.topic}
          description={`${selectedMaterial.subject} • Kelas ${selectedMaterial.grade} SD`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 space-y-1.5">
              <span className="font-bold text-[#5865D8] flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-4 h-4" /> Cerita &amp; Konteks Wilayah Lokal:
              </span>
              <p className="text-[#252B3A] leading-relaxed whitespace-pre-line text-sm">
                {selectedMaterial.contextualized_content || selectedMaterial.original_content}
              </p>
            </div>

            {selectedMaterial.original_content && selectedMaterial.contextualized_content && (
              <div className="space-y-1 pt-2 border-t border-[#EDEFF5]">
                <span className="font-bold text-[#697386] uppercase tracking-wider block">
                  Uraian Konsep Dasar:
                </span>
                <p className="text-[#697386] leading-relaxed whitespace-pre-line">
                  {selectedMaterial.original_content}
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-[#DCE0EA] text-right">
              <Button variant="outline" size="sm" onClick={() => setSelectedMaterial(null)} className="text-xs">
                Tutup Bacaan
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
