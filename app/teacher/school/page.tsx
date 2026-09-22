"use client";

import React, { useState, useEffect } from "react";
import {
  School as SchoolIcon,
  MapPin,
  Save,
  PlusCircle,
  CheckCircle2,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { repository } from "@/lib/db/repository";
import { Region, School, LocalKnowledgeItem, EntityCategory } from "@/lib/db/types";

export default function SchoolProfilePage() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<string>("region-samarinda");
  const [school, setSchool] = useState<School | null>(null);
  const [knowledgeItems, setKnowledgeItems] = useState<LocalKnowledgeItem[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Form states
  const [schoolName, setSchoolName] = useState("");
  const [address, setAddress] = useState("");
  const [province, setProvince] = useState("Kalimantan Timur");
  const [regency, setRegency] = useState("Kota Samarinda");
  const [district, setDistrict] = useState("Samarinda Kota");
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [localCharacteristics, setLocalCharacteristics] = useState("");

  // New Entity Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategory, setNewCategory] = useState<EntityCategory>("economy");
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  useEffect(() => {
    const schoolId = localStorage.getItem("cl_active_school_id") || "school-sd001-samarinda";
    const s = repository.getSchoolById(schoolId) || repository.getSchools()[0];
    if (s) {
      setSchool(s);
      setSchoolName(s.name);
      setAddress(s.address || "");
      setProvince(s.province);
      setRegency(s.regency);
      setDistrict(s.district);
      setLatitude(s.latitude);
      setLongitude(s.longitude);
      setLocalCharacteristics(s.local_characteristics || "");
      if (s.region_id) setSelectedRegionId(s.region_id);
    }
    setRegions(repository.getRegions());
  }, []);

  useEffect(() => {
    setKnowledgeItems(repository.getLocalKnowledge(selectedRegionId));
  }, [selectedRegionId]);

  const handleGetGPS = () => {
    if (!navigator.geolocation) {
      alert("Peramban Anda tidak mendukung sensor GPS.");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lon = Number(pos.coords.longitude.toFixed(6));
        setLatitude(lat);
        setLongitude(lon);
        setGpsLoading(false);
        setSaveSuccess(false);
      },
      (err) => {
        setGpsLoading(false);
        alert(`Lokasi tidak dapat diakses (${err.message}). Anda tetap dapat mengatur wilayah secara manual.`);
      },
      { timeout: 8000 }
    );
  };

  const handleSaveSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!school) return;

    const updated = repository.updateSchool({
      ...school,
      name: schoolName,
      address,
      province,
      regency,
      district,
      latitude,
      longitude,
      region_id: selectedRegionId,
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface p-5 rounded-xl border border-border shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Lokasi Sekolah & Konteks Wilayah
          </h1>
          <p className="text-xs text-secondary-text mt-1">
            Pengaturan geolokasi dan basis kearifan lokal yang digunakan Context Engine untuk adaptasi materi dan soal.
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-2 rounded-xl bg-success-subtle border border-emerald-200 p-4 text-xs text-success font-semibold">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Pengaturan lokasi dan profil sekolah berhasil disimpan!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: School Information & GPS Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-surface p-5 rounded-xl border border-border shadow-2xs space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <SchoolIcon className="w-4 h-4 text-primary" /> Profil Instansi Sekolah
            </h3>

            <form onSubmit={handleSaveSchool} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-foreground block mb-1">Nama Sekolah:</label>
                <input
                  type="text"
                  required
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">Provinsi:</label>
                <input
                  type="text"
                  required
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">Kabupaten / Kota:</label>
                <input
                  type="text"
                  required
                  value={regency}
                  onChange={(e) => setRegency(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">Kecamatan:</label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* GPS Geolocation Box */}
              <div className="p-3 rounded-lg bg-[#F2F4F8] border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-primary" /> Koordinat GPS
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGetGPS}
                    disabled={gpsLoading}
                    className="text-[11px] h-7"
                  >
                    {gpsLoading ? "Mendeteksi..." : "Ambil GPS"}
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-secondary-text">
                  <div>Lat: {latitude ? latitude.toFixed(6) : "Belum diatur"}</div>
                  <div>Long: {longitude ? longitude.toFixed(6) : "Belum diatur"}</div>
                </div>
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">Alamat Lengkap:</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Karakteristik Wilayah Sekitar:
                </label>
                <textarea
                  rows={3}
                  value={localCharacteristics}
                  onChange={(e) => setLocalCharacteristics(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <Button type="submit" variant="primary" size="sm" className="w-full text-xs">
                <Save className="w-3.5 h-3.5 mr-1" /> Simpan Profil Sekolah
              </Button>
            </form>
          </div>
        </div>

        {/* Right Column: Local Knowledge Entities Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface p-5 rounded-xl border border-border shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Basis Pengetahuan Lokal Terdaftar</h3>
                <p className="text-xs text-secondary-text mt-0.5">
                  Entitas yang aktif digunakan dalam transformasi variabel soal untuk wilayah {school?.regency || "Samarinda"}
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddModal(true)}
                className="text-xs"
              >
                <PlusCircle className="w-3.5 h-3.5 mr-1 text-primary" /> Tambah Entitas Guru
              </Button>
            </div>

            <div className="divide-y divide-border">
              {knowledgeItems.map((item) => (
                <div key={item.id} className="py-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-foreground">{item.entity_name}</span>
                      <Badge variant="neutral">{item.entity_category}</Badge>
                    </div>
                    <Badge variant="success">Terverifikasi</Badge>
                  </div>
                  <p className="text-xs text-secondary-text leading-relaxed font-normal">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Add Entity */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#202638]/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-xl max-w-md w-full p-5 sm:p-6 shadow-xl border border-border-strong space-y-4">
            <div className="border-b border-border pb-3">
              <h2 className="text-base font-bold text-foreground">Tambah Entitas Kearifan Lokal</h2>
              <p className="text-xs text-secondary-text mt-0.5">Daftarkan entitas geografi, komoditas, atau budaya lokal</p>
            </div>
            <form onSubmit={handleAddEntity} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-foreground block mb-1">Kategori Entitas:</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as EntityCategory)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-surface text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="geography">Geografi (Sungai, Danau, Gunung)</option>
                  <option value="economy">Ekonomi & Pasar (Komoditas, Mata Pencaharian)</option>
                  <option value="culture">Budaya & Tradisi (Kain, Kesenian, Bangunan)</option>
                  <option value="flora_fauna">Flora & Fauna Lokal</option>
                  <option value="transportation">Transportasi Lokal</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">Nama Entitas:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ikan Haruan / Kapal Klotok"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-surface text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">Deskripsi Konteks:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Jelaskan peran atau keberadaan entitas ini dalam kehidupan masyarakat sekitar..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-border bg-surface text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddModal(false)} className="text-xs">
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="sm" className="text-xs">
                  Simpan Entitas
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
