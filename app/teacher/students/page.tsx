"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  Copy,
  Check,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  const [, setImportFile] = useState<File | null>(null);
  const [importClassId, setImportClassId] = useState("");
  const [parsedPreview, setParsedPreview] = useState<Array<{ full_name: string; student_code?: string; grade?: number }>>([]);
  const [importErrors, setImportErrors] = useState<Array<{ row: number; name: string; error: string }>>([]);
  const [isProcessingImport, setIsProcessingImport] = useState(false);

  const loadStudents = useCallback((schoolId: string) => {
    const stds = repository.getStudentsBySchool(schoolId);
    setStudents(stds);
  }, []);

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
  }, [loadStudents]);

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
        grade: manualGrade,
        class_id: manualClassId,
        student_code: manualCode.trim() || undefined,
        teacher_id: "teacher-demo-01",
      });

      setDistributedCredentials([
        {
          name: student.full_name,
          student_code: student.student_code || "STU-001",
          tempPass: temporaryPassword,
        },
      ]);

      setManualName("");
      setManualCode("");
      setManualError("");
      setShowManualModal(false);
      setShowCredentialsModal(true);
      loadStudents(activeSchoolId);
    } catch (err: any) {
      setManualError(err.message || "Gagal membuat akun siswa.");
    }
  };

  // Handle File Upload and Preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file);
    setImportErrors([]);

    const fileExt = file.name.split(".").pop()?.toLowerCase();

    if (fileExt === "csv") {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          processRawRows(results.data);
        },
        error: (err) => {
          alert(`Gagal membaca file CSV: ${err.message}`);
        },
      });
    } else if (fileExt === "xlsx" || fileExt === "xls") {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: "binary" });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws);
          processRawRows(data);
        } catch (err: any) {
          alert(`Gagal membaca file Excel: ${err.message}`);
        }
      };
      reader.readAsBinaryString(file);
    } else {
      alert("Format file tidak didukung. Harap unggah file berformat .csv atau .xlsx");
    }
  };

  const processRawRows = (rawRows: any[]) => {
    const parsed: Array<{ full_name: string; student_code?: string; grade?: number }> = [];
    rawRows.forEach((row) => {
      const name = row["Nama Lengkap"] || row["Nama"] || row["full_name"] || row["name"];
      const code = row["Nomor Induk Siswa"] || row["NISN"] || row["student_code"] || row["code"];
      const grade = row["Tingkat Kelas"] || row["Kelas"] || row["grade"];

      if (name && typeof name === "string" && name.trim().length > 0) {
        parsed.push({
          full_name: name.trim(),
          student_code: code ? String(code).trim() : undefined,
          grade: grade ? Number(grade) : undefined,
        });
      }
    });

    setParsedPreview(parsed);
  };

  // Submit Batch Import
  const handleImportSubmit = () => {
    if (parsedPreview.length === 0 || !importClassId) {
      alert("Pilih kelas dan pastikan data pratinjau tidak kosong.");
      return;
    }

    setIsProcessingImport(true);

    try {
      const createdStudents: Array<{ name: string; student_code: string; tempPass: string }> = [];
      const failedRows: Array<{ row: number; name: string; error: string }> = [];

      parsedPreview.forEach((row, idx) => {
        try {
          const { student, temporaryPassword } = repository.createStudentAccount({
            school_id: activeSchoolId,
            full_name: row.full_name,
            grade: row.grade || 5,
            class_id: importClassId,
            student_code: row.student_code,
            teacher_id: "teacher-demo-01",
          });

          createdStudents.push({
            name: student.full_name,
            student_code: student.student_code || "STU-001",
            tempPass: temporaryPassword,
          });
        } catch (err: any) {
          failedRows.push({
            row: idx + 2,
            name: row.full_name,
            error: err.message,
          });
        }
      });

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
  const handleResetPassword = useCallback((student: Profile) => {
    const randomHex = Date.now().toString(36).slice(-4).toUpperCase();
    const newPass = `CL-${randomHex}#`;
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
  }, [activeSchoolId]);

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface p-5 rounded-xl border border-border shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            Kelola Akun Siswa
          </h1>
          <p className="text-xs text-secondary-text mt-1">
            Akun siswa diprovisi secara aman oleh guru sekolah. Siswa masuk melalui portal autentikasi sekolah.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadTemplate}
            className="text-xs"
          >
            <Download className="w-3.5 h-3.5 mr-1 text-secondary-text" /> Template CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowImportModal(true)}
            className="text-xs"
          >
            <Upload className="w-3.5 h-3.5 mr-1 text-primary" /> Impor CSV / Excel
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowManualModal(true)}
            className="text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Tambah Siswa
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-surface p-3.5 rounded-xl border border-border shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-secondary-text absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama siswa atau NISN/Kode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-border bg-[#F2F4F8] text-foreground focus:bg-surface focus:border-primary focus:outline-none"
          />
        </div>

        <select
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
          className="text-xs px-3 py-2 rounded-lg border border-border bg-[#F2F4F8] text-foreground focus:border-primary focus:outline-none cursor-pointer"
        >
          <option value="ALL">Semua Rombel Kelas</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} (Kelas {c.grade})
            </option>
          ))}
        </select>
      </div>

      {/* Student Table */}
      <div className="bg-surface rounded-xl border border-border shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#ECEFF5] border-b border-border text-foreground font-semibold">
              <tr>
                <th className="py-3 px-4">Nama Lengkap Siswa</th>
                <th className="py-3 px-4">Nomor Induk / Kode</th>
                <th className="py-3 px-4">Tingkat Kelas</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-secondary-text">
                    Belum ada siswa yang terdaftar sesuai filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-[#F2F4F8] transition-colors">
                    <td className="py-3 px-4 font-semibold text-foreground">{st.full_name}</td>
                    <td className="py-3 px-4 font-mono text-primary font-medium">{st.student_code || "-"}</td>
                    <td className="py-3 px-4 text-secondary-text">Kelas {st.grade || 5}</td>
                    <td className="py-3 px-4">
                      <Badge variant="success">
                        <CheckCircle2 className="w-3 h-3" /> Aktif
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleResetPassword(st)}
                        className="text-xs text-link hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer"
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
        <div className="fixed inset-0 bg-[#202638]/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-xl max-w-md w-full p-5 sm:p-6 shadow-xl border border-border-strong space-y-4">
            <div className="border-b border-border pb-3">
              <h2 className="text-base font-bold text-foreground">Tambah Siswa Baru</h2>
              <p className="text-xs text-secondary-text mt-0.5">Buat akun siswa dan dapatkan kredensial sementara</p>
            </div>
            <form onSubmit={handleManualSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-foreground block mb-1">Nama Lengkap Siswa:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Muhammad Rizky"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-surface text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-foreground block mb-1">Tingkat Kelas:</label>
                  <select
                    value={manualGrade}
                    onChange={(e) => setManualGrade(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-surface text-foreground focus:border-primary focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                      <option key={g} value={g}>
                        Kelas {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-foreground block mb-1">Rombel Kelas:</label>
                  <select
                    value={manualClassId}
                    onChange={(e) => setManualClassId(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-surface text-foreground focus:border-primary focus:outline-none"
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
                <label className="font-semibold text-foreground block mb-1">
                  Nomor Induk Siswa (Opsional - Dibuat Otomatis):
                </label>
                <input
                  type="text"
                  placeholder="Contoh: STU-SD01-005"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-surface font-mono text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {manualError && <p className="text-xs text-error font-medium">{manualError}</p>}

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowManualModal(false)} className="text-xs">
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="sm" className="text-xs">
                  Buat Akun Siswa
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Batch CSV/Excel Import */}
      {showImportModal && (
        <div className="fixed inset-0 bg-[#202638]/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-xl max-w-lg w-full p-5 sm:p-6 shadow-xl border border-border-strong space-y-4">
            <div className="border-b border-border pb-3">
              <h2 className="text-base font-bold text-foreground">Impor Siswa (CSV / Excel)</h2>
              <p className="text-xs text-secondary-text mt-0.5">
                Unggah file spreadsheet berformat .csv atau .xlsx sesuai kolom template.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-foreground block mb-1">Pilih Rombel Kelas Tujuan:</label>
                <select
                  value={importClassId}
                  onChange={(e) => setImportClassId(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-surface text-foreground focus:border-primary focus:outline-none"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (Kelas {c.grade})
                    </option>
                  ))}
                </select>
              </div>

              <div className="border-2 border-dashed border-border rounded-xl p-5 text-center bg-[#F7F8FB]">
                <FileSpreadsheet className="w-8 h-8 text-primary mx-auto mb-2" />
                <input
                  type="file"
                  accept=".csv, .xlsx, .xls"
                  onChange={handleFileChange}
                  className="text-xs text-secondary-text file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-hover cursor-pointer"
                />
              </div>

              {parsedPreview.length > 0 && (
                <div className="p-3 bg-success-subtle border border-emerald-200 rounded-lg text-xs text-success font-semibold flex items-center justify-between">
                  <span>{parsedPreview.length} data siswa terdeteksi siap diproses.</span>
                </div>
              )}

              {importErrors.length > 0 && (
                <div className="p-3 bg-error-subtle border border-red-200 rounded-lg text-xs text-error max-h-32 overflow-y-auto space-y-1">
                  <span className="font-semibold">Baris dengan kesalahan:</span>
                  {importErrors.map((err, idx) => (
                    <p key={idx}>
                      Baris {err.row}: {err.name} - {err.error}
                    </p>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowImportModal(false)} className="text-xs">
                Tutup
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleImportSubmit}
                disabled={parsedPreview.length === 0 || isProcessingImport}
                className="text-xs"
              >
                {isProcessingImport ? "Memproses..." : "Konfirmasi Impor"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: One-Time Credential Distribution */}
      {showCredentialsModal && (
        <div className="fixed inset-0 bg-[#202638]/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-xl max-w-lg w-full p-5 sm:p-6 shadow-xl border border-border-strong space-y-4">
            <div className="flex items-center gap-2 text-success border-b border-border pb-3">
              <CheckCircle2 className="w-5 h-5" />
              <div>
                <h2 className="text-base font-bold text-foreground">Kredensial Siswa Dibuat</h2>
                <p className="text-xs text-secondary-text mt-0.5">
                  Salin dan bagikan kredensial login kepada siswa untuk masuk ke portal sekolah.
                </p>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto border border-border rounded-lg divide-y divide-border">
              {distributedCredentials.map((c, idx) => (
                <div key={idx} className="p-3 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-foreground block">{c.name}</span>
                    <span className="font-mono text-[11px] text-primary">ID: {c.student_code}</span>
                    <span className="text-border mx-1.5">•</span>
                    <span className="font-mono text-[11px] font-semibold text-warning bg-warning-subtle px-1.5 py-0.5 rounded border border-amber-200">
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
                    className="p-1.5 rounded-md hover:bg-[#F2F4F8] text-secondary-text hover:text-foreground cursor-pointer"
                    title="Salin Kredensial"
                  >
                    {copiedIndex === idx ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-border">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setShowCredentialsModal(false)}
                className="text-xs"
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
