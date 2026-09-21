"use client";

import React, { useState, useEffect } from "react";
import {
  School as SchoolIcon,
  MapPin,
  Save,
  PlusCircle,
  CheckCircle2,
  Sparkles,
  Compass,
  Building,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <div className="bg-white p-5 rounded-xl border border-[#DCE0EA] shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#252B3A] tracking-tight flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#5865D8]" />
            Lokasi Sekolah & Konteks Wilayah
          </h1>
          <p className="text-xs text-[#697386] mt-0.5">
            Pengaturan geolokasi dan basis kearifan lokal yang digunakan Context Engine untuk adaptasi materi dan soal.
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs text-[#238B68] font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Pengaturan lokasi dan profil sekolah berhasil disimpan!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: School Information & GPS Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-5 rounded-xl border border-[#DCE0EA] shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#252B3A] flex items-center gap-2">
              <SchoolIcon className="w-4 h-4 text-[#5865D8]" /> Pengaturan Instansi Sekolah
            </h3>

            <form onSubmit={handleSaveSchool} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#252B3A] block mb-1">Nama Sekolah:</label>
                <input
                  type="text"
                  required
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#DCE0EA] bg-[#F7F8FC]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#252B3A] block mb-1">Provinsi:</label>
                <input
                  type="text"
                  required
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#DCE0EA] bg-[#F7F8FC]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#252B3A] block mb-1">Kabupaten / Kota:</label>
                <input
                  type="text"
                  required
                  value={regency}
                  onChange={(e) => setRegency(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#DCE0EA] bg-[#F7F8FC]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#252B3A] block mb-1">Kecamatan:</label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#DCE0EA] bg-[#F7F8FC]"
                />
              </div>

              {/* GPS Geolocation Box */}
              <div className="p-3 rounded-xl bg-[#F7F8FC] border border-[#DCE0EA] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#252B3A] flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-[#5865D8]" /> Sinkronisasi GPS
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGetGPS}
                    disabled={gpsLoading}
                    className="text-[11px] h-7 border-[#CBD5E1]"
                  >
                    {gpsLoading ? "Mendeteksi..." : "Ambil GPS"}
                  </Button>
                </div>
                <p className="text-[11px] text-[#697386]">
                  {latitude && longitude
                    ? `Koordinat: ${latitude}, ${longitude}`
                    : "Belum disinkronkan dengan sensor lokasi perangkat."}
                </p>
              </div>

              <div>
                <label className="font-semibold text-[#252B3A] block mb-1">Karakteristik Lingkungan Siswa:</label>
                <textarea
                  rows={3}
                  value={localCharacteristics}
                  onChange={(e) => setLocalCharacteristics(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#DCE0EA] bg-[#F7F8FC] text-xs"
                />
              </div>

              <Button type="submit" variant="primary" size="sm" className="w-full bg-[#5865D8] hover:bg-[#4753C4] text-xs">
                <Save className="w-3.5 h-3.5 mr-1" /> Simpan Perubahan Lokasi
              </Button>
            </form>
          </div>
        </div>

        {/* Right Column: Hierarchical Context Engine & Knowledge Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hierarchical Context Fallback Banner */}
          <div className="bg-white p-5 rounded-xl border border-[#DCE0EA] shadow-xs">
            <h3 className="text-sm font-bold text-[#252B3A] flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-[#5865D8]" />
              Hierarki Adaptasi Context Engine
            </h3>
            <p className="text-xs text-[#697386] mb-3 leading-relaxed">
              Jika entitas tingkat kecamatan tidak tersedia, Context Engine secara bertingkat mengambil entitas kabupaten/kota, provinsi, hingga konteks nasional.
            </p>

            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200">
                <span className="font-bold text-[#5865D8] block">1. Kecamatan</span>
                <span className="text-[10px] text-blue-700">{district}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-200">
                <span className="font-bold text-indigo-700 block">2. Kabupaten/Kota</span>
                <span className="text-[10px] text-indigo-800">{regency}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-700 block">3. Provinsi</span>
                <span className="text-[10px] text-slate-600">{province}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-700 block">4. Nasional</span>
                <span className="text-[10px] text-slate-600">Indonesia</span>
              </div>
            </div>
          </div>

          {/* Local Knowledge Base Catalog */}
          <div className="bg-white rounded-xl border border-[#DCE0EA] p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#252B3A]">Entitas Kearifan Lokal Wilayah Terdaftar</h3>
                <p className="text-xs text-[#697386]">Objek nyata yang diintegrasikan ke dalam bank soal</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddModal(true)}
                className="text-xs border-[#DCE0EA]"
              >
                <PlusCircle className="w-3.5 h-3.5 mr-1 text-[#5865D8]" /> Tambah Entitas Guru
              </Button>
            </div>

            <div className="divide-y divide-[#EDEFF5]">
              {knowledgeItems.map((item) => (
                <div key={item.id} className="py-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#252B3A]">{item.entity_name}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                        {item.entity_category}
                      </span>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-[#238B68]">
                      Terverifikasi
                    </span>
                  </div>
                  <p className="text-xs text-[#697386] leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Add Entity */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#DCE0EA] space-y-4">
            <h2 className="text-base font-bold text-[#252B3A]">Tambah Entitas Kearifan Lokal</h2>
            <form onSubmit={handleAddEntity} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#252B3A] block mb-1">Kategori Entitas:</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as EntityCategory)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-[#DCE0EA] bg-[#F7F8FC]"
                >
                  <option value="geography">Geografi (Sungai, Danau, Gunung)</option>
                  <option value="infrastructure">Infrastruktur (Pasar, Pelabuhan, Jembatan)</option>
                  <option value="economy">Ekonomi (Komoditas, Nelayan, Petani)</option>
                  <option value="transportation">Transportasi (Perahu, Klotok, Andong)</option>
                  <option value="social">Sosial (Gotong Royong, Ronda)</option>
                  <option value="culture">Budaya (Kain Tenun, Batik, Tarian)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#252B3A] block mb-1">Nama Entitas:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pasar Segiri / Petani Kakao"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-[#DCE0EA] bg-[#F7F8FC]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#252B3A] block mb-1">Deskripsi Kontekstual:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Jelaskan peran objek/profesi ini dalam kehidupan lokal..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-[#DCE0EA] bg-[#F7F8FC]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#DCE0EA]">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddModal(false)} className="text-xs">
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="sm" className="bg-[#5865D8] text-xs">
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
