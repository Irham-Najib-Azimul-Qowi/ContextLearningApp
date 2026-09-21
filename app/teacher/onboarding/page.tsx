"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  School,
  Search,
  Plus,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  Building2,
  Compass,
  Check,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { repository } from "@/lib/db/repository";
import { School as SchoolType, EducationLevel } from "@/lib/db/types";

type OnboardingStep = "profile" | "choice" | "search_school" | "create_school" | "confirm_done";

export default function TeacherOnboardingPage() {
  const router = useRouter();

  const [step, setStep] = useState<OnboardingStep>("choice");
  const [teacherName, setTeacherName] = useState("Ibu Nurhaliza, S.Pd.");
  const [teacherCode, setTeacherCode] = useState("TCH-SAM-001");

  // Search Existing School State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>("ALL");
  const [existingSchools, setExistingSchools] = useState<SchoolType[]>(repository.getSchools());
  const [selectedExistingSchool, setSelectedExistingSchool] = useState<SchoolType | null>(null);
  const [invitationCode, setInvitationCode] = useState("");
  const [joinSuccessMsg, setJoinSuccessMsg] = useState("");

  // Create New School State
  const [schoolName, setSchoolName] = useState("");
  const [educationalLevel, setEducationalLevel] = useState<EducationLevel>("SD");
  const [npsn, setNpsn] = useState("");
  const [province, setProvince] = useState("Kalimantan Timur");
  const [regency, setRegency] = useState("Kota Samarinda");
  const [district, setDistrict] = useState("Samarinda Kota");
  const [village, setVillage] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [createdSchoolResult, setCreatedSchoolResult] = useState<SchoolType | null>(null);

  // GPS Acquisition
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Peramban Anda tidak mendukung geolokasi.");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(Number(pos.coords.latitude.toFixed(6)));
        setLongitude(Number(pos.coords.longitude.toFixed(6)));
        setGpsLoading(false);
      },
      (err) => {
        setGpsLoading(false);
        alert(`Gagal mengambil lokasi GPS: ${err.message}. Anda tetap dapat mengisi alamat secara manual.`);
      },
      { timeout: 8000 }
    );
  };

  // Duplicate Check
  const handleNameChange = (val: string) => {
    setSchoolName(val);
    if (val.trim().length > 3) {
      const dup = repository.checkDuplicateSchool(val, regency);
      if (dup) {
        setDuplicateWarning(`Peringatan: Sekolah "${dup.name}" (${dup.code}) sudah terdaftar di ${regency}.`);
      } else {
        setDuplicateWarning(null);
      }
    } else {
      setDuplicateWarning(null);
    }
  };

  const handleCreateSchoolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolName.trim() || !regency.trim() || !province.trim()) {
      setErrorMsg("Nama sekolah, provinsi, dan kabupaten/kota wajib diisi.");
      return;
    }

    try {
      const { school } = repository.createSchool({
        name: schoolName.trim(),
        educational_level: educationalLevel,
        province,
        regency,
        district,
        village,
        address,
        npsn: npsn.trim() || undefined,
        latitude,
        longitude,
        createdBy: "teacher-demo-01",
      });

      setCreatedSchoolResult(school);
      localStorage.setItem("cl_active_school_id", school.id);
      setStep("confirm_done");
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal mendaftarkan sekolah.");
    }
  };

  const handleJoinSchoolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExistingSchool) return;

    if (invitationCode.trim()) {
      try {
        repository.acceptInvitation(invitationCode.trim(), "teacher-demo-01");
        setJoinSuccessMsg(`Berhasil bergabung ke ${selectedExistingSchool.name} menggunakan kode undangan!`);
      } catch (err: any) {
        setErrorMsg(err.message || "Kode undangan tidak valid.");
        return;
      }
    } else {
      try {
        repository.requestJoinSchool("teacher-demo-01", selectedExistingSchool.id);
        setJoinSuccessMsg(`Permohonan bergabung telah dikirim ke Koordinator ${selectedExistingSchool.name}.`);
      } catch (err: any) {
        setErrorMsg(err.message);
        return;
      }
    }

    localStorage.setItem("cl_active_school_id", selectedExistingSchool.id);
    setTimeout(() => {
      router.push("/teacher/dashboard");
    }, 1500);
  };

  const filteredSchools = existingSchools.filter((s) => {
    const matchesQuery =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.regency.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevelFilter === "ALL" || s.educational_level === selectedLevelFilter;
    return matchesQuery && matchesLevel;
  });

  return (
    <div className="min-h-screen bg-[#EDEFF5] flex flex-col justify-between">
      {/* Header */}
      <header className="h-16 px-6 border-b border-[#DCE0EA] bg-white flex items-center justify-between">
        <Link href="/teacher/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#5865D8] flex items-center justify-center text-white font-bold">
            <School className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm text-[#252B3A]">Onboarding Ruang Kerja Sekolah</span>
        </Link>
        <span className="text-xs text-[#697386]">Langkah Onboarding Pendidik</span>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-2xl bg-white rounded-2xl border border-[#DCE0EA] p-6 sm:p-8 shadow-sm">
          {/* STEP 1: Choice between Join Existing or Register New */}
          {step === "choice" && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-xl font-bold text-[#252B3A]">Pilih Ruang Kerja Sekolah</h1>
                <p className="text-xs text-[#697386] mt-1">
                  ContextLearning mendukung multi-sekolah independen (SD, SMP, SMA).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Option A: Search & Join */}
                <button
                  type="button"
                  onClick={() => setStep("search_school")}
                  className="p-5 rounded-xl border-2 border-[#DCE0EA] hover:border-[#5865D8] bg-[#F7F8FC] hover:bg-white text-left transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#5865D8] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Search className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-sm text-[#252B3A]">Gabung Sekolah Terdaftar</h3>
                    <p className="text-xs text-[#697386] mt-1 leading-relaxed">
                      Cari sekolah yang sudah memiliki akun di ContextLearning atau masukkan kode undangan dari koordinator.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center text-xs font-semibold text-[#5865D8] group-hover:translate-x-1 transition-transform">
                    Cari Sekolah <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </button>

                {/* Option B: Register New School */}
                <button
                  type="button"
                  onClick={() => setStep("create_school")}
                  className="p-5 rounded-xl border-2 border-[#DCE0EA] hover:border-[#238B68] bg-[#F7F8FC] hover:bg-white text-left transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#238B68] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Plus className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-sm text-[#252B3A]">Daftarkan Sekolah Baru</h3>
                    <p className="text-xs text-[#697386] mt-1 leading-relaxed">
                      Sekolah Anda belum ada? Daftarkan instansi baru dengan mengisi identitas wilayah dan koordinat GPS.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center text-xs font-semibold text-[#238B68] group-hover:translate-x-1 transition-transform">
                    Registrasi Baru <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </button>
              </div>

              <div className="pt-2 text-center">
                <Link href="/teacher/dashboard" className="text-xs text-[#697386] hover:underline">
                  Kembali ke Dashboard Aktif
                </Link>
              </div>
            </div>
          )}

          {/* STEP 2A: Search Existing School */}
          {step === "search_school" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#252B3A]">Cari & Gabung Sekolah</h2>
                  <p className="text-xs text-[#697386]">Pilih instansi untuk mengajukan keanggotaan guru</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setStep("choice")} className="text-xs">
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Kembali
                </Button>
              </div>

              {/* Filters */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-[#697386] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Ketik nama sekolah, kabupaten, atau kode SCH-..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-[#DCE0EA] bg-[#F7F8FC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5865D8]/30"
                    />
                  </div>
                  <select
                    value={selectedLevelFilter}
                    onChange={(e) => setSelectedLevelFilter(e.target.value)}
                    className="text-xs px-3 py-2 rounded-xl border border-[#DCE0EA] bg-[#F7F8FC] text-[#252B3A] focus:outline-none"
                  >
                    <option value="ALL">Semua Jenjang</option>
                    <option value="SD">SD</option>
                    <option value="SMP">SMP</option>
                    <option value="SMA">SMA</option>
                  </select>
                </div>
              </div>

              {/* School Cards List */}
              <div className="max-h-64 overflow-y-auto space-y-2 border border-[#DCE0EA] rounded-xl p-2 bg-[#F7F8FC]">
                {filteredSchools.length === 0 ? (
                  <div className="text-center py-6 text-xs text-[#697386]">
                    Tidak ada sekolah yang cocok. Anda dapat mendaftarkan sekolah baru.
                  </div>
                ) : (
                  filteredSchools.map((school) => {
                    const isSelected = selectedExistingSchool?.id === school.id;
                    return (
                      <div
                        key={school.id}
                        onClick={() => setSelectedExistingSchool(school)}
                        className={`p-3 rounded-lg border text-left cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? "bg-white border-[#5865D8] shadow-xs ring-1 ring-[#5865D8]"
                            : "bg-white border-[#DCE0EA] hover:border-slate-300"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-[#252B3A]">{school.name}</span>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-[#5865D8]">
                              {school.educational_level}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#697386] mt-0.5">
                            {school.district}, {school.regency} • Kode: {school.code}
                          </p>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#5865D8]" />}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Selected School Action */}
              {selectedExistingSchool && (
                <form onSubmit={handleJoinSchoolSubmit} className="space-y-3 pt-2 border-t border-[#DCE0EA]">
                  <div>
                    <label className="text-xs font-semibold text-[#252B3A] block mb-1">
                      Kode Undangan Guru (Opsional):
                    </label>
                    <input
                      type="text"
                      placeholder="Masukkan INV-XXXX jika memiliki kode dari koordinator"
                      value={invitationCode}
                      onChange={(e) => setInvitationCode(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-[#DCE0EA] bg-[#F7F8FC] font-mono"
                    />
                    <span className="text-[10px] text-[#697386]">
                      Jika tidak memiliki kode, permohonan Anda akan menunggu persetujuan koordinator sekolah.
                    </span>
                  </div>

                  {errorMsg && <p className="text-xs text-[#C94F58] font-medium">{errorMsg}</p>}
                  {joinSuccessMsg && (
                    <div className="p-2.5 rounded-lg bg-emerald-50 text-[#238B68] text-xs font-medium flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{joinSuccessMsg}</span>
                    </div>
                  )}

                  <Button type="submit" variant="primary" className="w-full bg-[#5865D8] text-xs">
                    Ajukan Gabung ke {selectedExistingSchool.name}
                  </Button>
                </form>
              )}
            </div>
          )}

          {/* STEP 2B: Register New School Form */}
          {step === "create_school" && (
            <form onSubmit={handleCreateSchoolSubmit} className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#DCE0EA] pb-3">
                <div>
                  <h2 className="text-base font-bold text-[#252B3A]">Daftarkan Sekolah Baru</h2>
                  <p className="text-xs text-[#697386]">Isi identitas dan wilayah geografis sekolah</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setStep("choice")} className="text-xs">
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Kembali
                </Button>
              </div>

              {/* Educational Level Selection Cards */}
              <div>
                <label className="text-xs font-semibold text-[#252B3A] block mb-1.5">
                  Jenjang Pendidikan Instansi:
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {(["SD", "SMP", "SMA"] as EducationLevel[]).map((lvl) => {
                    const isSel = educationalLevel === lvl;
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setEducationalLevel(lvl)}
                        className={`py-3 px-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                          isSel
                            ? "bg-[#5865D8]/10 border-[#5865D8] text-[#5865D8] font-bold shadow-xs"
                            : "bg-[#F7F8FC] border-[#DCE0EA] text-[#252B3A] hover:bg-white"
                        }`}
                      >
                        <Building2 className={`w-5 h-5 ${isSel ? "text-[#5865D8]" : "text-[#697386]"}`} />
                        <span className="text-xs">{lvl}</span>
                        <span className="text-[9px] text-[#697386]">
                          {lvl === "SD" ? "Kelas 1-6" : lvl === "SMP" ? "Kelas 7-9" : "Kelas 10-12"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* School Name & NPSN */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-[#252B3A] block mb-1">
                    Nama Resmi Sekolah:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: SD Negeri 005 Samarinda Ilir"
                    value={schoolName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[#DCE0EA] bg-[#F7F8FC] focus:bg-white"
                  />
                  {duplicateWarning && (
                    <p className="text-[11px] text-[#C68A28] flex items-center gap-1 mt-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {duplicateWarning}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#252B3A] block mb-1">
                    NPSN (Opsional):
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 30401234"
                    value={npsn}
                    onChange={(e) => setNpsn(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[#DCE0EA] bg-[#F7F8FC] font-mono"
                  />
                </div>
              </div>

              {/* Region Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#252B3A] block mb-1">Provinsi:</label>
                  <input
                    type="text"
                    required
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[#DCE0EA] bg-[#F7F8FC]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#252B3A] block mb-1">
                    Kabupaten / Kota:
                  </label>
                  <input
                    type="text"
                    required
                    value={regency}
                    onChange={(e) => setRegency(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[#DCE0EA] bg-[#F7F8FC]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#252B3A] block mb-1">Kecamatan:</label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[#DCE0EA] bg-[#F7F8FC]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#252B3A] block mb-1">
                    Kelurahan / Desa (Opsional):
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Sidomulyo"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[#DCE0EA] bg-[#F7F8FC]"
                  />
                </div>
              </div>

              {/* Full Address */}
              <div>
                <label className="text-xs font-semibold text-[#252B3A] block mb-1">
                  Alamat Lengkap Jalan:
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Jl. Pangeran Hidayatullah No. 45"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-[#DCE0EA] bg-[#F7F8FC]"
                />
              </div>

              {/* Optional GPS Synchronization */}
              <div className="p-3 rounded-xl bg-[#F7F8FC] border border-[#DCE0EA] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#252B3A] flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-[#5865D8]" /> Koordinat GPS Sekolah (Opsional)
                  </span>
                  <p className="text-[11px] text-[#697386] mt-0.5">
                    {latitude && longitude
                      ? `Lat: ${latitude}, Long: ${longitude} (Tersimpan)`
                      : "Gunakan posisi perangkat untuk adaptasi konteks wilayah"}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGetLocation}
                  disabled={gpsLoading}
                  className="text-xs border-[#CBD5E1]"
                >
                  {gpsLoading ? "Mendeteksi..." : "Gunakan GPS"}
                </Button>
              </div>

              {errorMsg && <p className="text-xs text-[#C94F58] font-medium">{errorMsg}</p>}

              <Button type="submit" variant="primary" className="w-full bg-[#238B68] hover:bg-[#1E7758] text-xs">
                Simpan & Daftarkan Sekolah
              </Button>
            </form>
          )}

          {/* STEP 3: Confirm Done */}
          {step === "confirm_done" && createdSchoolResult && (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#238B68] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#252B3A]">Sekolah Berhasil Didaftarkan!</h2>
                <p className="text-xs text-[#697386] mt-1">
                  Ruang kerja sekolah Anda telah aktif. Anda terdaftar sebagai Koordinator Sekolah.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F7F8FC] border border-[#DCE0EA] text-left max-w-sm mx-auto text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#697386]">Nama Sekolah:</span>
                  <span className="font-semibold text-[#252B3A]">{createdSchoolResult.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#697386]">Kode Sekolah:</span>
                  <span className="font-mono font-bold text-[#5865D8]">{createdSchoolResult.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#697386]">Jenjang:</span>
                  <span className="font-semibold text-[#252B3A]">{createdSchoolResult.educational_level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#697386]">Status Verifikasi:</span>
                  <span className="text-amber-600 font-medium">Menunggu Verifikasi Pusat</span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => router.push("/teacher/dashboard")}
                  className="bg-[#5865D8] hover:bg-[#4753C4] text-xs"
                >
                  Masuk ke Ruang Kerja Guru <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
