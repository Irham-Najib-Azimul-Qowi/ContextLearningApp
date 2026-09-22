"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, Sparkles, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
      <div className="bg-surface p-5 rounded-xl border border-border shadow-xs">
        <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          Bahan Bacaan & Materi Kontekstual
        </h1>
        <p className="text-xs text-foreground-secondary mt-0.5">
          Pelajari konsep mata pelajaran melalui cerita dan contoh nyata dari lingkungan sekitar sekolah.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {materials.map((m) => (
          <div key={m.id} className="bg-surface rounded-xl border border-border p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">
                  {m.subject}
                </Badge>
                <span className="text-[11px] text-foreground-secondary">Kelas {m.grade}</span>
              </div>
              <h3 className="text-base font-bold text-foreground mt-2">{m.topic}</h3>
              <p className="text-xs text-foreground-secondary line-clamp-1 mt-0.5">{m.learning_objectives}</p>
            </div>

            <div className="rounded-lg bg-surface-secondary p-3 text-xs text-foreground-secondary leading-relaxed line-clamp-4 border border-border">
              {m.contextualized_content || m.original_content}
            </div>

            <div className="pt-2.5 border-t border-border flex justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setSelectedMaterial(m)}
                className="bg-primary hover:bg-primary-hover text-xs font-semibold"
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
          description={`${selectedMaterial.subject} • Kelas ${selectedMaterial.grade}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-1.5">
              <span className="font-bold text-primary flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-4 h-4" /> Cerita &amp; Konteks Wilayah Lokal:
              </span>
              <p className="text-foreground leading-relaxed whitespace-pre-line text-sm">
                {selectedMaterial.contextualized_content || selectedMaterial.original_content}
              </p>
            </div>

            {selectedMaterial.original_content && selectedMaterial.contextualized_content && (
              <div className="space-y-1 pt-2 border-t border-border">
                <span className="font-bold text-foreground-secondary uppercase tracking-wider block">
                  Uraian Konsep Dasar:
                </span>
                <p className="text-foreground-secondary leading-relaxed whitespace-pre-line">
                  {selectedMaterial.original_content}
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-border text-right">
              <Button variant="outline" size="sm" onClick={() => setSelectedMaterial(null)} className="text-xs border-border">
                Tutup Bacaan
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
