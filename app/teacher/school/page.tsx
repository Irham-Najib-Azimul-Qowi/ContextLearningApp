"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/navbar";
import Container from "@/components/ui/container";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  School as SchoolIcon,
  MapPin,
  Save,
  PlusCircle,
  CheckCircle2,
  Sparkles,
  Layers,
} from "lucide-react";
import { repository } from "@/lib/db/repository";
import { Region, School, LocalKnowledgeItem, EntityCategory } from "@/lib/db/types";

export default function SchoolProfilePage() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<string>("region-samarinda");
  const [school, setSchool] = useState<School | null>(null);
  const [knowledgeItems, setKnowledgeItems] = useState<LocalKnowledgeItem[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form states
  const [schoolName, setSchoolName] = useState("");
  const [address, setAddress] = useState("");
  const [localCharacteristics, setLocalCharacteristics] = useState("");

  // New Entity Modal / Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategory, setNewCategory] = useState<EntityCategory>("economy");
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  useEffect(() => {
    const rList = repository.getRegions();
    setRegions(rList);
    const schools = repository.getSchools();
    if (schools.length > 0) {
      const s = schools[0];
      setSchool(s);
      setSchoolName(s.name);
      setAddress(s.address || "");
      setLocalCharacteristics(s.local_characteristics || "");
      if (s.region_id) setSelectedRegionId(s.region_id);
    }
  }, []);

  useEffect(() => {
    setKnowledgeItems(repository.getLocalKnowledge(selectedRegionId));
  }, [selectedRegionId]);

  const handleRegionSwitch = (regId: string) => {
    setSelectedRegionId(regId);
    const targetRegion = regions.find((r) => r.id === regId);
    if (targetRegion) {
      setLocalCharacteristics(
        targetRegion.geographical_summary + " " + targetRegion.economic_summary
      );
    }
  };

  const handleSaveSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!school) return;

    const targetRegion = regions.find((r) => r.id === selectedRegionId);
    const updated = repository.updateSchool({
      ...school,
      name: schoolName,
      address,
      region_id: selectedRegionId,
      province: targetRegion ? targetRegion.province : school.province,
      regency: targetRegion ? targetRegion.regency : school.regency,
      district: targetRegion ? targetRegion.district : school.district,
      local_characteristics: localCharacteristics,
    });

    setSchool(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAddEntity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newDesc.trim()) return;

    repository.addLocalKnowledge({
      region_id: selectedRegionId,
      entity_category: newCategory,
      entity_name: newName,
      description: newDesc,
      verification_status: "teacher_provided",
      source: "Ditambahkan oleh Guru",
    });

    setKnowledgeItems(repository.getLocalKnowledge(selectedRegionId));
    setNewName("");
    setNewDesc("");
    setShowAddModal(false);
  };

  const currentRegion = regions.find((r) => r.id === selectedRegionId);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <Container className="py-8 sm:py-10">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary">Karakteristik Wilayah</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Profil Sekolah & Basis Pengetahuan Wilayah
          </h1>
          <p className="text-sm text-muted mt-1">
            Konfigurasi lokasi sekolah Anda untuk memandu AI dan Context Engine dalam memilih entitas lokal terdekat.
          </p>
        </div>

        {saveSuccess && (
          <div className="mb-6 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-success font-medium">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            Profil sekolah dan wilayah kontekstual berhasil diperbarui!
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: School Information Form */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <SchoolIcon className="h-4 w-4 text-primary" /> Pengaturan Sekolah
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <form onSubmit={handleSaveSchool} className="space-y-4">
                  <Input
                    label="Nama Sekolah Dasar"
                    type="text"
                    required
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                  />

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                      Pilih Basis Wilayah Kontekstual
                    </label>
                    <select
                      value={selectedRegionId}
                      onChange={(e) => handleRegionSwitch(e.target.value)}
                      className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {regions.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.regency} ({r.province})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1 text-xs text-muted bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <p>
                      <strong>Provinsi:</strong> {currentRegion?.province}
                    </p>
                    <p>
                      <strong>Kabupaten/Kota:</strong> {currentRegion?.regency}
                    </p>
                    <p>
                      <strong>Kecamatan:</strong> {currentRegion?.district}
                    </p>
                  </div>

                  <Input
                    label="Alamat Sekolah"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                      Karakteristik Lingkungan Siswa
                    </label>
                    <textarea
                      rows={3}
                      value={localCharacteristics}
                      onChange={(e) => setLocalCharacteristics(e.target.value)}
                      className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <Button type="submit" variant="primary" size="sm" className="w-full">
                    <Save className="h-4 w-4" /> Simpan Profil Sekolah
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Local Knowledge Base Catalog */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between py-4">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" /> Basis Pengetahuan Lokal Terverifikasi
                  </CardTitle>
                  <p className="text-xs text-muted mt-0.5">
                    Entitas di wilayah {currentRegion?.regency} yang digunakan oleh Context Engine.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddModal(true)}
                  className="text-xs gap-1"
                >
                  <PlusCircle className="h-3.5 w-3.5" /> Tambah Entitas Guru
                </Button>
              </CardHeader>

              <CardContent className="p-4 divide-y divide-border/60">
                {knowledgeItems.length === 0 ? (
                  <p className="py-6 text-center text-xs text-muted">
                    Belum ada entitas terdaftar untuk wilayah ini.
                  </p>
                ) : (
                  knowledgeItems.map((item) => (
                    <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-foreground">{item.entity_name}</h4>
                          <Badge
                            variant={
                              item.entity_category === "economy"
                                ? "primary"
                                : item.entity_category === "infrastructure"
                                ? "secondary"
                                : item.entity_category === "transportation"
                                ? "warning"
                                : "neutral"
                            }
                          >
                            {item.entity_category}
                          </Badge>
                        </div>
                        <Badge
                          variant={
                            item.verification_status === "verified" ? "success" : "neutral"
                          }
                        >
                          {item.verification_status === "verified" ? "Terverifikasi" : "Entitas Guru"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted leading-relaxed">{item.description}</p>
                      {item.suitability_notes && (
                        <p className="text-[11px] text-primary font-medium">
                          Rekomendasi Soal: {item.suitability_notes}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Add Entity Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-border">
              <h3 className="text-base font-bold text-foreground mb-1">
                Tambah Entitas Konteks Lokal
              </h3>
              <p className="text-xs text-muted mb-4">
                Tambahkan tempat, komoditas, atau profesi khas di sekitar sekolah Anda.
              </p>

              <form onSubmit={handleAddEntity} className="space-y-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                    Kategori Entitas
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as EntityCategory)}
                    className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="geography">Geografi (Sungai, Danau, Gunung)</option>
                    <option value="infrastructure">Infrastruktur (Pasar, Jembatan, Dermaga)</option>
                    <option value="economy">Ekonomi (Komoditas, Mata Pencaharian)</option>
                    <option value="transportation">Transportasi (Perahu, Klotok, Andong)</option>
                    <option value="social">Sosial (Gotong Royong, Ronda)</option>
                    <option value="culture">Budaya (Kain Tenun, Batik, Festival)</option>
                  </select>
                </div>

                <Input
                  label="Nama Entitas"
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: Pasar Segiri / Petani Kakao"
                />

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                    Deskripsi Singkat & Manfaat Pembelajaran
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Jelaskan peran entitas ini dalam kehidupan sehari-hari siswa..."
                    className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddModal(false)}
                  >
                    Batal
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    Simpan Entitas
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
