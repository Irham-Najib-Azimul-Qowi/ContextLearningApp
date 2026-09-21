"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/navbar";
import Container from "@/components/ui/container";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { BookOpen, Sparkles, Eye, ArrowRight } from "lucide-react";
import { repository } from "@/lib/db/repository";
import { LearningMaterial } from "@/lib/db/types";

export default function StudentMaterialsPage() {
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<LearningMaterial | null>(null);

  useEffect(() => {
    setMaterials(repository.getMaterials());
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <Container className="py-8 sm:py-10">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary">Bahan Bacaan Siswa</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Materi Pembelajaran Kontekstual
          </h1>
          <p className="text-sm text-muted mt-1">
            Pelajari konsep mata pelajaran melalui cerita dan contoh nyata dari lingkungan sekitar tempat tinggal kita.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((m) => (
            <Card key={m.id} className="hover:border-primary/30 transition-all flex flex-col">
              <CardHeader className="p-5 pb-3 border-b border-border/60">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{m.subject}</Badge>
                  <span className="text-xs text-muted font-medium">Kelas {m.grade} SD</span>
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

                <div className="pt-2 border-t border-border/60 flex items-center justify-end">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setSelectedMaterial(m)}
                    className="text-xs shadow-xs"
                  >
                    <Eye className="h-3.5 w-3.5 mr-1" /> Baca Materi Lengkap
                  </Button>
                </div>
              </CardContent>
            </Card>
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
            <div className="space-y-5">
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" /> Cerita &amp; Konteks Wilayah Lokal:
                </span>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                  {selectedMaterial.contextualized_content || selectedMaterial.original_content}
                </p>
              </div>

              {selectedMaterial.original_content && selectedMaterial.contextualized_content && (
                <div className="space-y-1.5 pt-2 border-t border-border/60">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted block">
                    Uraian Konsep Dasar:
                  </span>
                  <p className="text-xs text-muted leading-relaxed whitespace-pre-line">
                    {selectedMaterial.original_content}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-border/60 text-right">
                <Button variant="outline" size="sm" onClick={() => setSelectedMaterial(null)}>
                  Tutup Bacaan
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </Container>
    </div>
  );
}
