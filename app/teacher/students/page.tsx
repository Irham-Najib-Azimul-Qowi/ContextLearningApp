"use client";

import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import {
  GraduationCap,
  Plus,
  Upload,
  Download,
  Search,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  UsersRound,
  Copy,
  Check,
  RefreshCw,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { repository } from "@/lib/db/repository";
import { Profile, ClassRoom } from "@/lib/db/types";

export default function TeacherStudentsPage() {
  const [activeSchoolId, setActiveSchoolId] = useState("school-sd001-samarinda");
  const [students, setStudents] = useState<Profile[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal States
  const [showManualModal, setShowManualModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [distributedCredentials, setDistributedCredentials] = useState<
    Array<{ name: string; student_code: string; tempPass: string }>
  >([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Manual Form State
  const [manualName, setManualName] = useState("");
  const [manualGrade, setManualGrade] = useState(5);
  const [manualClassId, setManualClassId] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [manualError, setManualError] = useState("");

  // Import State
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importClassId, setImportClassId] = useState("");
  const [parsedPreview, setParsedPreview] = useState<Array<{ full_name: string; student_code?: string; grade?: number }>>([]);
  const [importErrors, setImportErrors] = useState<Array<{ row: number; name: string; error: string }>>([]);
  const [isProcessingImport, setIsProcessingImport] = useState(false);

  useEffect(() => {
    const schoolId = localStorage.getItem("cl_active_school_id") || "school-sd001-samarinda";
    setActiveSchoolId(schoolId);
    const cls = repository.getClasses(schoolId);
    setClasses(cls);
    if (cls.length > 0) {
      setManualClassId(cls[0].id);
      setImportClassId(cls[0].id);
    }
    loadStudents(schoolId);
  }, []);

  const loadStudents = (schoolId: string) => {
    const stds = repository.getStudentsBySchool(schoolId);
    setStudents(stds);
  };

  // Download Sample CSV Template
  const handleDownloadTemplate = () => {
    const csvContent = "Nama Lengkap,Nomor Induk Siswa,Tingkat Kelas\nAndi Wijaya,STU-001,5\nBambang Sudirman,STU-002,5\nCitra Lestari,STU-003,5";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "template_import_siswa_contextlearning.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Manual Registration Submit
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim() || !manualClassId) {
      setManualError("Nama siswa dan kelas wajib dipilih.");
      return;
    }

    try {
      const { student, temporaryPassword } = repository.createStudentAccount({
        school_id: activeSchoolId,
        full_name: manualName.trim(),
        grade: Number(manualGrade),
        class_id: manualClassId,
        student_code: manualCode.trim() || undefined,
        teacher_id: "teacher-demo-01",
      });

      setDistributedCredentials([
        {
          name: student.full_name,
          student_code: student.student_code!,
          tempPass: temporaryPassword,
        },
      ]);

      setShowManualModal(false);
      setShowCredentialsModal(true);
      setManualName("");
      setManualCode("");
      setManualError("");
      loadStudents(activeSchoolId);
    } catch (err: any) {
      setManualError(err.message || "Gagal mendaftarkan siswa.");
    }
  };

  // File Upload Handling (CSV & Excel)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file);
    setImportErrors([]);

    const fileName = file.name.toLowerCase();

    if (fileName.endsWith(".csv")) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const rows = results.data.map((r: any) => ({
            full_name: r["Nama Lengkap"] || r["nama"] || r["Nama"] || "",
            student_code: r["Nomor Induk Siswa"] || r["nisn"] || r["NISN"] || undefined,
            grade: Number(r["Tingkat Kelas"] || r["kelas"] || 5),
          }));
          setParsedPreview(rows.filter((r) => r.full_name));
        },
      });
    } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data: any[] = XLSX.utils.sheet_to_json(ws);
        const rows = data.map((r: any) => ({
          full_name: r["Nama Lengkap"] || r["nama"] || r["Nama"] || "",
          student_code: r["Nomor Induk Siswa"] || r["nisn"] || r["NISN"] || undefined,
          grade: Number(r["Tingkat Kelas"] || r["kelas"] || 5),
        }));
        setParsedPreview(rows.filter((r) => r.full_name));
      };
      reader.readAsBinaryString(file);
    }
  };

  const handleImportSubmit = () => {
    if (parsedPreview.length === 0 || !importClassId) return;
    setIsProcessingImport(true);

    try {
      const { createdCount, failedRows, createdStudents } = repository.batchImportStudents(
        activeSchoolId,
        "teacher-demo-01",
        importClassId,
        parsedPreview
      );

      setImportErrors(failedRows);
      setDistributedCredentials(createdStudents);
      setIsProcessingImport(false);
      setShowImportModal(false);
      setShowCredentialsModal(true);
      loadStudents(activeSchoolId);
    } catch (err: any) {
      alert(`Gagal memproses impor: ${err.message}`);
      setIsProcessingImport(false);
    }
  };

  // Reset Student Password
  const handleResetPassword = (student: Profile) => {
    const newPass = `CL-${Math.random().toString(36).substring(2, 8).toUpperCase()}#`;
    repository.logAudit({
      actor_id: "teacher-demo-01",
      actor_name: "Ibu Nurhaliza, S.Pd.",
      actor_role: "teacher",
      action: "STUDENT_PASSWORD_RESET",
      resource_type: "student",
      resource_id: student.id,
      school_id: activeSchoolId,
      details: { student_name: student.full_name, student_code: student.student_code },
    });

    setDistributedCredentials([
      {
        name: student.full_name,
        student_code: student.student_code || "STU-001",
        tempPass: newPass,
      },
    ]);
    setShowCredentialsModal(true);
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.student_code && s.student_code.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesClass = selectedClassId === "ALL" || s.class_id === selectedClassId;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-[#DCE0EA] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#252B3A] tracking-tight flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#5865D8]" />
            Kelola Akun Siswa
          </h1>
          <p className="text-xs text-[#697386] mt-0.5">
            Akun siswa diprovisi secara aman oleh guru sekolah. Siswa login melalui portal khusus sekolah.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadTemplate}
            className="text-xs border-[#DCE0EA]"
          >
            <Download className="w-3.5 h-3.5 mr-1 text-[#697386]" /> Template CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowImportModal(true)}
            className="text-xs border-[#DCE0EA]"
          >
            <Upload className="w-3.5 h-3.5 mr-1 text-[#5865D8]" /> Impor CSV / Excel
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowManualModal(true)}
            className="text-xs bg-[#5865D8] hover:bg-[#4753C4]"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Tambah Siswa Manual
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl border border-[#DCE0EA]">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#697386] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama siswa atau NISN/Kode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-[#DCE0EA] bg-[#F7F8FC] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#5865D8]"
          />
        </div>

        <select
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
          className="text-xs px-3 py-2 rounded-lg border border-[#DCE0EA] bg-[#F7F8FC] text-[#252B3A] focus:outline-none"
        >
          <option value="ALL">Semua Rombongan Belajar</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} (Kelas {c.grade})
            </option>
          ))}
        </select>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-[#DCE0EA] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F8FC] border-b border-[#DCE0EA] text-[#697386] font-semibold">
              <tr>
                <th className="py-3 px-4">Nama Lengkap Siswa</th>
                <th className="py-3 px-4">Kode Siswa / NISN</th>
                <th className="py-3 px-4">Tingkat Kelas</th>
                <th className="py-3 px-4">Status Akun</th>
                <th className="py-3 px-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDEFF5]">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#697386]">
                    Belum ada siswa yang terdaftar di sekolah ini. Tambahkan siswa secara manual atau impor spreadsheet.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-[#F7F8FC] transition-colors">
                    <td className="py-3 px-4 font-semibold text-[#252B3A]">{st.full_name}</td>
                    <td className="py-3 px-4 font-mono text-[#5865D8] font-medium">{st.student_code || "-"}</td>
                    <td className="py-3 px-4 text-[#252B3A]">Kelas {st.grade || 5}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-[#238B68]">
                        <CheckCircle2 className="w-3 h-3" /> Aktif
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleResetPassword(st)}
                        className="text-xs text-[#5865D8] hover:underline font-medium inline-flex items-center gap-1"
                      >
                        <KeyRound className="w-3 h-3" /> Reset Sandi
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Manual Student Provisioning */}
      {showManualModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#DCE0EA] space-y-4">
            <h2 className="text-base font-bold text-[#252B3A]">Tambah Siswa Baru</h2>
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#252B3A] block mb-1">Nama Lengkap Siswa:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Muhammad Rizky"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-[#DCE0EA] bg-[#F7F8FC]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#252B3A] block mb-1">Tingkat Kelas:</label>
                  <select
                    value={manualGrade}
                    onChange={(e) => setManualGrade(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[#DCE0EA] bg-[#F7F8FC]"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                      <option key={g} value={g}>
                        Kelas {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#252B3A] block mb-1">Rombel Kelas:</label>
                  <select
                    value={manualClassId}
                    onChange={(e) => setManualClassId(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[#DCE0EA] bg-[#F7F8FC]"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#252B3A] block mb-1">
                  Nomor Induk Siswa (Opsional - Dibuat Otomatis jika Kosong):
                </label>
                <input
                  type="text"
                  placeholder="Contoh: STU-SD01-005"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-[#DCE0EA] bg-[#F7F8FC] font-mono"
                />
              </div>

              {manualError && <p className="text-xs text-[#C94F58] font-medium">{manualError}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowManualModal(false)} className="text-xs">
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="sm" className="bg-[#5865D8] text-xs">
                  Buat Akun Siswa
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Batch CSV/Excel Import */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#DCE0EA] space-y-4">
            <div>
              <h2 className="text-base font-bold text-[#252B3A]">Impor Siswa (CSV / Excel)</h2>
              <p className="text-xs text-[#697386] mt-0.5">
                Unggah file spreadsheet berformat .csv atau .xlsx sesuai format kolom template.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#252B3A] block mb-1">Pilih Kelas Tujuan:</label>
                <select
                  value={importClassId}
                  onChange={(e) => setImportClassId(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-[#DCE0EA] bg-[#F7F8FC]"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (Kelas {c.grade})
                    </option>
                  ))}
                </select>
              </div>

              <div className="border-2 border-dashed border-[#CBD5E1] rounded-xl p-5 text-center bg-[#F7F8FC]">
                <FileSpreadsheet className="w-8 h-8 text-[#5865D8] mx-auto mb-2" />
                <input
                  type="file"
                  accept=".csv, .xlsx, .xls"
                  onChange={handleFileChange}
                  className="text-xs text-[#697386] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#5865D8] file:text-white hover:file:bg-[#4753C4]"
                />
              </div>

              {parsedPreview.length > 0 && (
                <div className="p-3 bg-emerald-50 rounded-lg text-xs text-[#238B68] font-medium flex items-center justify-between">
                  <span>{parsedPreview.length} data siswa terdeteksi siap diproses.</span>
                </div>
              )}

              {importErrors.length > 0 && (
                <div className="p-3 bg-red-50 rounded-lg text-xs text-[#C94F58] max-h-32 overflow-y-auto space-y-1">
                  <span className="font-semibold">Baris dengan kesalahan:</span>
                  {importErrors.map((err, idx) => (
                    <p key={idx}>
                      Baris {err.row}: {err.name} - {err.error}
                    </p>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#DCE0EA]">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowImportModal(false)} className="text-xs">
                Tutup
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleImportSubmit}
                disabled={parsedPreview.length === 0 || isProcessingImport}
                className="bg-[#238B68] hover:bg-[#1E7758] text-xs"
              >
                {isProcessingImport ? "Memproses..." : "Konfirmasi Impor"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: One-Time Credential Distribution */}
      {showCredentialsModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#DCE0EA] space-y-4">
            <div className="flex items-center gap-2 text-[#238B68]">
              <CheckCircle2 className="w-5 h-5" />
              <h2 className="text-base font-bold text-[#252B3A]">Kredensial Siswa Dibuat</h2>
            </div>
            <p className="text-xs text-[#697386]">
              Salin dan bagikan kredensial login kepada siswa. Demi alasan keamanan, kata sandi sementara tidak akan ditampilkan kembali setelah jendela ini ditutup.
            </p>

            <div className="max-h-60 overflow-y-auto border border-[#DCE0EA] rounded-xl divide-y divide-[#EDEFF5]">
              {distributedCredentials.map((c, idx) => (
                <div key={idx} className="p-3 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#252B3A] block">{c.name}</span>
                    <span className="font-mono text-[11px] text-[#5865D8]">ID: {c.student_code}</span>
                    <span className="text-[#CBD5E1] mx-1.5">•</span>
                    <span className="font-mono text-[11px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                      Sandi: {c.tempPass}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`Nama: ${c.name} | ID: ${c.student_code} | Sandi: ${c.tempPass}`);
                      setCopiedIndex(idx);
                      setTimeout(() => setCopiedIndex(null), 2000);
                    }}
                    className="p-1.5 rounded-md hover:bg-[#F1F3F9] text-[#697386]"
                    title="Salin Kredensial"
                  >
                    {copiedIndex === idx ? <Check className="w-4 h-4 text-[#238B68]" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setShowCredentialsModal(false)}
                className="bg-[#5865D8] text-xs"
              >
                Selesai & Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
