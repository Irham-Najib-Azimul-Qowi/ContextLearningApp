"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  DoorOpen,
  Plus,
  Copy,
  Check,
  Search,
  Trash2,
  Eye,
  BookOpen,
  FileQuestion,
  Layers,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  Shuffle,
  ExternalLink,
  Pencil,
  BarChart3,
  Printer,
  Sparkles,
  Share2,
} from "lucide-react";
import { TeacherWorkspaceShell } from "@/components/layout/teacher-workspace-shell";
import { repository } from "@/lib/db/repository";
import {
  LearningRoom,
  LearningMaterial,
  Question,
  School,
  UserProfile,
  getQuestionItems,
  resolveRoomQuestions,
  resolveRoomMaterials,
} from "@/lib/db/types";
import { RoomDashboardView } from "@/components/room/room-dashboard-view";
import { DepaskanPrintableDocument } from "@/components/print/depaskan-printable-document";
import { DeleteConfirmationModal } from "@/components/dialog/delete-confirmation-modal";

function TeacherRoomsContent() {
  const searchParams = useSearchParams();
  const hasAutoOpenedRef = useRef(false);

  const [rooms, setRooms] = useState<LearningRoom[]>([]);
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeSchool, setActiveSchool] = useState<School | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"all" | "material" | "question" | "both">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Creation Wizard Modal State (Login & Room Entry Style)
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [roomType, setRoomType] = useState<"material" | "question" | "both">("material");
  const [selectedResourceId, setSelectedResourceId] = useState("");
  const [secondaryResourceId, setSecondaryResourceId] = useState("");
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [customTitle, setCustomTitle] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [subject, setSubject] = useState("Matematika");
  const [grade, setGrade] = useState(5);
  const [createdRoom, setCreatedRoom] = useState<LearningRoom | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Full-page Live Preview & Edit State (No Modal Overlay)
  const [previewRoom, setPreviewRoom] = useState<LearningRoom | null>(null);
  const [isEditingPreview, setIsEditingPreview] = useState(false);
  const [editRoomTitle, setEditRoomTitle] = useState("");
  const [editRoomSubject, setEditRoomSubject] = useState("Matematika");
  const [editRoomGrade, setEditRoomGrade] = useState(5);
  const [editRoomResourceId, setEditRoomResourceId] = useState("");
  const [editRoomSecondaryId, setEditRoomSecondaryId] = useState("");
  const [editQuestionIds, setEditQuestionIds] = useState<string[]>([]);
  const [previewTab, setPreviewTab] = useState<"dashboard" | "content">("dashboard");
  const [isPrintingRoom, setIsPrintingRoom] = useState(false);

  const handleStartEditRoom = () => {
    if (!previewRoom) return;
    setIsEditingPreview(true);
    setEditRoomTitle(previewRoom.title);
    setEditRoomSubject(previewRoom.subject || "Matematika");
    setEditRoomGrade(previewRoom.grade || 5);
    setEditRoomResourceId(previewRoom.resource_id || "");
    setEditRoomSecondaryId(previewRoom.secondary_resource_id || "");

    const rawQStr =
      previewRoom.type === "both"
        ? (previewRoom.secondary_resource_id || "")
        : (previewRoom.resource_id || "");
    const parsedQIds = rawQStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    setEditQuestionIds(parsedQIds);
  };

  const handleSaveEditedRoom = () => {
    if (!previewRoom || !editRoomTitle.trim()) return;
    const finalQIds =
      editQuestionIds.length > 0
        ? editQuestionIds.join(",")
        : previewRoom.type === "both"
        ? editRoomSecondaryId
        : editRoomResourceId;

    const updated = repository.updateRoom(previewRoom.id, {
      title: editRoomTitle.trim(),
      subject: editRoomSubject,
      grade: editRoomGrade,
      resource_id: previewRoom.type === "both" ? editRoomResourceId : finalQIds,
      secondary_resource_id: previewRoom.type === "both" ? finalQIds : undefined,
    });
    if (updated) {
      setPreviewRoom(updated);
    }
    setIsEditingPreview(false);
    loadData();
  };

  const loadData = () => {
    const school = repository.getActiveSchool();
    setActiveSchool(school);
    const user = repository.getCurrentUser();
    setCurrentUser(user);
    const allRooms = repository.getRooms(user?.id);
    setRooms(allRooms);
    const mats = repository.getMaterials();
    setMaterials(mats);
    const qs = repository.getQuestions();
    setQuestions(qs);
  };

  // Open Wizard
  const handleOpenWizard = () => {
    setWizardStep(1);
    setRoomType("material");
    const patentCode = repository.getNextRoomCode();
    setRoomCode(patentCode);
    if (materials.length > 0) {
      setSelectedResourceId(materials[0].id);
    }
    if (questions.length > 0) {
      setSecondaryResourceId(questions[0].id);
      setSelectedQuestionIds(questions.map((q) => q.id));
    } else {
      setSelectedQuestionIds([]);
    }
    setCustomTitle("");
    setSubject("Matematika");
    setGrade(5);
    setCreatedRoom(null);
    setIsWizardOpen(true);
  };

  useEffect(() => {
    loadData();
    const handleSync = () => loadData();
    window.addEventListener("repositorySyncCompleted", handleSync);
    window.addEventListener("storage", handleSync);
    const actionParam = searchParams?.get("action");
    if (!hasAutoOpenedRef.current && (actionParam === "new" || actionParam === "create")) {
      hasAutoOpenedRef.current = true;
      handleOpenWizard();
    }
    return () => {
      window.removeEventListener("repositorySyncCompleted", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, [searchParams]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleCopyLink = (code: string) => {
    const url = `${window.location.origin}/room/${code}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(code);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  // Custom Delete Confirmation Modal State
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: string;
    title: string;
    isDeleting: boolean;
  }>({
    isOpen: false,
    id: "",
    title: "",
    isDeleting: false,
  });

  const handleOpenDeleteModal = (id: string, title?: string) => {
    setDeleteModal({
      isOpen: true,
      id,
      title: title || "Room Akses Siswa",
      isDeleting: false,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.id) return;
    setDeleteModal((prev) => ({ ...prev, isDeleting: true }));
    try {
      await repository.deleteRoomAsync(deleteModal.id);
      loadData();
      if (previewRoom?.id === deleteModal.id || previewRoom?.code === deleteModal.id) {
        setPreviewRoom(null);
      }
      setDeleteModal({ isOpen: false, id: "", title: "", isDeleting: false });
    } catch (err) {
      console.error("Gagal menghapus room:", err);
      setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  // Step 1: Select Type
  const handleSelectType = (type: "material" | "question" | "both") => {
    setRoomType(type);
    setCustomTitle("");
    if (type === "material" && materials.length > 0) {
      setSelectedResourceId(materials[0].id);
    } else if (type === "question" && questions.length > 0) {
      setSelectedResourceId(questions[0].id);
      setSelectedQuestionIds(questions.map((q) => q.id));
    } else if (type === "both") {
      if (materials.length > 0) {
        setSelectedResourceId(materials[0].id);
      }
      if (questions.length > 0) {
        setSecondaryResourceId(questions[0].id);
        setSelectedQuestionIds([questions[0].id]);
      }
    }
    setWizardStep(2);
  };

  // Step 2: Next to Content Picker
  const handleStep2Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;
    setWizardStep(3);
  };

  // Step 3: Submit Room
  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode || !customTitle || isSubmitting) return;

    setIsSubmitting(true);
    const cleanCode = roomCode.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    const qIdsPayload =
      selectedQuestionIds.length > 0
        ? selectedQuestionIds.join(",")
        : roomType === "both"
        ? secondaryResourceId
        : selectedResourceId;

    const newRoom = repository.createRoom({
      code: cleanCode,
      title: customTitle.trim(),
      type: roomType,
      resource_id: roomType === "both" ? selectedResourceId : qIdsPayload,
      secondary_resource_id: roomType === "both" ? qIdsPayload : undefined,
      subject,
      grade,
      region_name: activeSchool?.region_name || "Kota Madiun",
      teacher_id: currentUser?.id || "usr-teacher-01",
      teacher_name: currentUser?.full_name || "Pengajar Depaskan",
    });

    setIsSubmitting(false);
    setCreatedRoom(newRoom);
    setWizardStep(4);
    loadData();
  };

  const filteredRooms = rooms.filter((r) => {
    const matchesFilter = filterType === "all" || r.type === filterType;
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const secQuestionId = isEditingPreview
    ? (editQuestionIds.length > 0 ? editQuestionIds.join(",") : editRoomSecondaryId)
    : (previewRoom?.secondary_resource_id || "");
  const priQuestionId = isEditingPreview
    ? (editQuestionIds.length > 0 && previewRoom?.type === "question" ? editQuestionIds.join(",") : editRoomResourceId)
    : (previewRoom?.resource_id || "");

  const rawQuestionIds = previewRoom
    ? (previewRoom.type === "question" ? priQuestionId : previewRoom.type === "both" ? secQuestionId : "")
    : "";

  const {
    questions: attachedQuestions,
    combinedQuestion: attachedQuestion,
  } = resolveRoomQuestions(rawQuestionIds, questions);

  const rawMaterialIds = previewRoom
    ? (previewRoom.type === "material" || previewRoom.type === "both" ? (isEditingPreview ? editRoomResourceId : previewRoom.resource_id) : "")
    : "";

  const {
    materials: attachedMaterials,
    primaryMaterial: attachedMaterial,
  } = resolveRoomMaterials(rawMaterialIds, materials);

  return (
    <TeacherWorkspaceShell activeGroupId="rooms">
      <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6 pb-12 font-sans">
        {previewRoom ? (
          /* ===================================================================
              LIVE PREVIEW & EDIT ROOM (LANGSUNG DI HALAMAN KONTEN - TANPA OVERLAY)
              =================================================================== */
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Top Bar: Tombol Kembali, Identitas Bersih & Tombol Edit/Simpan */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-[#51465B]/15">
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setPreviewRoom(null);
                    setIsEditingPreview(false);
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-white border-2 border-[#51465B]/25 text-[#51465B] hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Kembali</span>
                </button>

                {/* Identitas Bersih & Rapi Tanpa Terlalu Banyak Teks */}
                <div className="flex items-center gap-2 text-xs font-bold text-[#756F7A]">
                  <span className="font-mono text-[#51465B] font-black">{previewRoom.code}</span>
                  <span>&bull;</span>
                  <span>
                    {previewRoom.type === "both"
                      ? "Materi & Soal"
                      : previewRoom.type === "material"
                      ? "Materi"
                      : "Soal"}
                  </span>
                  <span>&bull;</span>
                  <span>{previewRoom.subject}</span>
                  <span>&bull;</span>
                  <span>Kelas {previewRoom.grade} SD</span>
                </div>
              </div>

              {/* Action Buttons Top Right: Bulat */}
              <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                {!isEditingPreview ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsPrintingRoom(true)}
                      className="px-4 py-2 rounded-full bg-white hover:bg-slate-100 text-[#51465B] border border-[#51465B]/25 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#51465B]" />
                      <span>Cetak PDF</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleStartEditRoom}
                      className="px-4 py-2 rounded-full bg-[#51465B] hover:bg-[#3E3547] text-[#FFD36D] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <Link
                      href={`/room/${previewRoom.code}`}
                      target="_blank"
                      className="px-4 py-2 rounded-full bg-[#FFD36D] hover:bg-[#FFE085] text-[#23212A] text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Buka Room Siswa</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsEditingPreview(false)}
                      className="px-4 py-2 rounded-full bg-slate-200 hover:bg-slate-300 text-[#23212A] text-xs font-bold cursor-pointer transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEditedRoom}
                      className="px-5 py-2 rounded-full bg-[#51465B] hover:bg-[#3E3547] text-[#FFD36D] text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Simpan</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Content Area */}
            {!isEditingPreview ? (
              <div className="space-y-6">
                {/* Room Clean Banner */}
                <div className="p-5 sm:p-6 rounded-3xl bg-[#51465B] text-white border-2 border-[#FFD36D] shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      {previewRoom.title}
                    </h1>
                  </div>

                  {/* Code & URL Share box */}
                  <div className="flex items-center gap-2.5 shrink-0 bg-white/10 p-2 sm:p-2.5 px-3 sm:px-4 rounded-2xl border border-white/20 flex-wrap">
                    <div className="text-center pr-2 border-r border-white/20">
                      <span className="text-[10px] text-white/70 block uppercase font-bold">Kode Room</span>
                      <span className="font-mono text-base sm:text-xl font-black text-[#FFD36D] tracking-widest">
                        {previewRoom.code}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(previewRoom.code)}
                      className="px-3.5 py-1.5 rounded-full bg-[#FFD36D] hover:bg-[#FFE085] text-[#23212A] text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-xs"
                      title="Salin Kode Akses Room"
                    >
                      {copiedCode === previewRoom.code ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-800 stroke-[2.5]" />
                          <span className="text-emerald-900 font-extrabold">Kode Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin Kode</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyLink(previewRoom.code)}
                      className="px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/25 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-xs"
                      title="Salin Tautan Lengkap untuk Siswa"
                    >
                      {copiedLink === previewRoom.code ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
                          <span className="text-emerald-300 font-extrabold">URL Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5 text-[#FFD36D]" />
                          <span>Salin URL</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Tab Switcher: Dashboard Room vs Pratinjau Konten */}
                <div className="flex items-center gap-2 p-1.5 bg-[#51465B]/10 rounded-2xl w-fit">
                  <button
                    type="button"
                    onClick={() => setPreviewTab("dashboard")}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                      previewTab === "dashboard"
                        ? "bg-[#51465B] text-[#FFD36D] shadow-xs"
                        : "text-[#51465B] hover:bg-white/50"
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Dashboard Room & Siswa</span>
                    {previewRoom.visitors && previewRoom.visitors.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-[#FFD36D] text-[#251E2B] text-[10px] font-black">
                        {previewRoom.visitors.length}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab("content")}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                      previewTab === "content"
                        ? "bg-[#51465B] text-[#FFD36D] shadow-xs"
                        : "text-[#51465B] hover:bg-white/50"
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Pratinjau Konten & Pembahasan</span>
                  </button>
                </div>

                {/* TAB 1: DASHBOARD ROOM */}
                {previewTab === "dashboard" && (
                  <RoomDashboardView
                    room={previewRoom}
                    material={attachedMaterial}
                    materials={attachedMaterials}
                    question={attachedQuestion}
                    questions={attachedQuestions}
                    onRefresh={loadData}
                  />
                )}

                {/* TAB 2: PRATINJAU KONTEN & PEMBAHASAN */}
                {previewTab === "content" && (
                  <div className="space-y-4">
                    <h2 className="text-sm font-black text-[#23212A] uppercase tracking-wider">
                      Pratinjau Konten Dalam Room
                    </h2>

                    {/* Attached Material Preview */}
                    {(previewRoom.type === "material" || previewRoom.type === "both") && (
                      <div className="bg-white rounded-3xl border-2 border-[#51465B]/20 p-6 sm:p-7 shadow-xs space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <span className="text-xs font-black text-[#51465B] uppercase tracking-wider flex items-center gap-1.5">
                            <BookOpen className="w-4 h-4 text-[#51465B]" />
                            Modul Materi Pembelajaran
                          </span>
                          {attachedMaterial && (
                            <span className="font-mono text-[11px] font-bold text-[#756F7A]">{attachedMaterial.id}</span>
                          )}
                        </div>
                        {attachedMaterial ? (
                          <div className="space-y-2">
                            <h3 className="text-base font-extrabold text-[#23212A]">{attachedMaterial.title}</h3>
                            <p className="text-xs sm:text-sm text-[#23212A]/85 whitespace-pre-wrap font-medium leading-relaxed max-h-60 overflow-y-auto pr-2">
                              {attachedMaterial.content}
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs text-[#756F7A] italic">Materi terkait belum dihubungkan.</p>
                        )}
                      </div>
                    )}

                    {/* Attached Question Preview */}
                    {(previewRoom.type === "question" || previewRoom.type === "both") && (
                      <div className="bg-white rounded-3xl border-2 border-[#FFD36D] p-6 sm:p-7 shadow-xs space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
                          <span className="text-xs font-black text-[#23212A] uppercase tracking-wider flex items-center gap-1.5">
                            <FileQuestion className="w-4 h-4 text-[#51465B]" />
                            Latihan / Asesmen Soal Kontekstual
                          </span>
                          {attachedQuestion && (
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-[#51465B] border border-purple-200">
                                {attachedQuestion.type === "mixed"
                                  ? "Kombinasi (PG & Esai)"
                                  : attachedQuestion.type === "essay"
                                  ? "Esai"
                                  : "Pilihan Ganda"}
                              </span>
                              <span className="font-mono text-[11px] font-bold text-[#756F7A]">{attachedQuestion.id}</span>
                            </div>
                          )}
                        </div>

                        {attachedQuestion ? (
                          <div className="space-y-4">
                            {(() => {
                              const qItems = getQuestionItems(attachedQuestion);
                              return qItems.map((item, idx) => (
                                <div
                                  key={item.id || idx}
                                  className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
                                >
                                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 flex-wrap gap-2">
                                    <div className="flex items-center gap-2">
                                      <span className="w-6 h-6 rounded-full bg-[#51465B] text-[#FFD36D] text-xs font-black flex items-center justify-center shrink-0">
                                        {idx + 1}
                                      </span>
                                      <span className="text-xs font-black text-[#23212A]">
                                        Soal {idx + 1}
                                      </span>
                                    </div>
                                    <span
                                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-black ${
                                        item.type === "essay"
                                          ? "bg-purple-100 text-purple-900 border border-purple-200"
                                          : "bg-amber-100 text-amber-900 border border-amber-200"
                                      }`}
                                    >
                                      {item.type === "essay" ? "Uraian / Esai" : "Pilihan Ganda"}
                                    </span>
                                  </div>

                                  <p className="text-xs sm:text-sm font-bold text-[#23212A] leading-relaxed">
                                    {item.question_text}
                                  </p>

                                  {/* Options if Multiple Choice */}
                                  {item.type === "multiple_choice" && item.options && item.options.length > 0 && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                      {item.options.map((opt) => {
                                        const isCorrect =
                                          item.correct_answer === opt.key || item.correct_answer === opt.text;
                                        return (
                                          <div
                                            key={opt.key}
                                            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between gap-2 ${
                                              isCorrect
                                                ? "bg-emerald-50 border-emerald-400 text-emerald-950 font-bold shadow-2xs"
                                                : "bg-white border-slate-200 text-[#23212A]"
                                            }`}
                                          >
                                            <div className="flex items-center gap-2">
                                              <span
                                                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                                                  isCorrect ? "bg-emerald-600 text-white" : "bg-slate-100 text-[#23212A]"
                                                }`}
                                              >
                                                {opt.key}
                                              </span>
                                              <span>{opt.text}</span>
                                            </div>
                                            {isCorrect && (
                                              <span className="text-[9px] bg-emerald-600 text-white font-black px-1.5 py-0.5 rounded-full">
                                                Kunci
                                              </span>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}

                                  {/* Rubrik if Essay */}
                                  {item.type === "essay" && item.rubric && (
                                    <div className="p-3 rounded-xl bg-purple-50/80 border border-purple-200 text-xs text-purple-950 font-medium space-y-1">
                                      <span className="font-bold block text-purple-900">Rubrik Penilaian:</span>
                                      <p className="leading-relaxed">{item.rubric}</p>
                                    </div>
                                  )}

                                  {/* Pembahasan Soal Khusus Guru */}
                                  {item.explanation && (
                                    <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 font-medium space-y-1">
                                      <span className="font-bold flex items-center gap-1.5 text-amber-900">
                                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                                        Pembahasan Soal (Khusus Guru):
                                      </span>
                                      <p className="leading-relaxed text-slate-800">{item.explanation}</p>
                                    </div>
                                  )}
                                </div>
                              ));
                            })()}
                          </div>
                        ) : (
                          <p className="text-xs text-[#756F7A] italic">Paket soal terkait belum dihubungkan.</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Edit Form */
              <div className="bg-white rounded-3xl border-2 border-[#51465B]/20 p-6 sm:p-8 shadow-sm space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#51465B] mb-1">Judul Room</label>
                  <input
                    type="text"
                    value={editRoomTitle}
                    onChange={(e) => setEditRoomTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border-2 border-[#51465B]/25 text-sm font-bold text-[#23212A] focus:border-[#51465B] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#51465B] mb-1">Mata Pelajaran</label>
                    <select
                      value={editRoomSubject}
                      onChange={(e) => setEditRoomSubject(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-2xl border-2 border-[#51465B]/25 text-xs font-bold text-[#23212A] focus:border-[#51465B] focus:outline-none"
                    >
                      {["Matematika", "IPAS", "Bahasa Indonesia", "Pancasila"].map((subj) => (
                        <option key={subj} value={subj}>
                          {subj}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#51465B] mb-1">Kelas SD</label>
                    <select
                      value={editRoomGrade}
                      onChange={(e) => setEditRoomGrade(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-2xl border-2 border-[#51465B]/25 text-xs font-bold text-[#23212A] focus:border-[#51465B] focus:outline-none"
                    >
                      {[1, 2, 3, 4, 5, 6].map((g) => (
                        <option key={g} value={g}>
                          Kelas {g} SD
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Resource Selection */}
                {(previewRoom.type === "material" || previewRoom.type === "both") && (
                  <div>
                    <label className="block text-xs font-bold text-[#51465B] mb-1">
                      Modul Materi Yang Dibagikan
                    </label>
                    <select
                      value={editRoomResourceId}
                      onChange={(e) => setEditRoomResourceId(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-2xl border-2 border-[#51465B]/25 text-xs font-bold text-[#23212A] focus:border-[#51465B] focus:outline-none"
                    >
                      <option value="">-- Pilih Materi --</option>
                      {materials.map((m) => (
                        <option key={m.id} value={m.id}>
                          [{m.id}] {m.title} ({m.subject} - Kelas {m.grade})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {(previewRoom.type === "question" || previewRoom.type === "both") && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-[#51465B]">
                        Paket Soal Yang Dibagikan ({editQuestionIds.length} Dipilih)
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          if (editQuestionIds.length === questions.length) {
                            setEditQuestionIds([]);
                          } else {
                            setEditQuestionIds(questions.map((q) => q.id));
                          }
                        }}
                        className="text-[11px] text-[#51465B] font-bold hover:underline cursor-pointer"
                      >
                        {editQuestionIds.length === questions.length ? "Hapus Semua" : "Pilih Semua"}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2.5 rounded-2xl border-2 border-[#51465B]/25 bg-slate-50/50">
                      {questions.map((q) => {
                        const isChecked = editQuestionIds.includes(q.id);
                        const qCount = getQuestionItems(q).length;
                        return (
                          <button
                            key={q.id}
                            type="button"
                            onClick={() => {
                              if (isChecked) {
                                setEditQuestionIds((prev) => prev.filter((id) => id !== q.id));
                              } else {
                                setEditQuestionIds((prev) => [...prev, q.id]);
                              }
                            }}
                            className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between gap-2 transition-all cursor-pointer ${
                              isChecked
                                ? "bg-white border-[#51465B] text-[#51465B] shadow-xs font-bold ring-1 ring-[#51465B]"
                                : "bg-white/80 border-slate-200 text-slate-600 hover:bg-white"
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <span className="font-mono text-[10px] block text-slate-400">{q.id}</span>
                              <span className="truncate block font-bold text-xs text-[#23212A]">
                                {q.topic || q.question_text.slice(0, 40)}
                              </span>
                              <span className="text-[10px] text-slate-500">{qCount} Butir • {q.subject}</span>
                            </div>
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-white text-[10px] ${
                                isChecked ? "bg-[#51465B]" : "border border-slate-300"
                              }`}
                            >
                              {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Normal List View */
          <>
            {/* ===================================================================
                1. HEADER: BUTTON TAMBAH DI SEBELAH KIRI JUDUL & DESKRIPSI
                =================================================================== */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <button
                type="button"
                onClick={handleOpenWizard}
                className="self-start sm:self-auto px-4 py-2.5 rounded-full bg-[#51465B] hover:bg-[#3E3547] text-[#FFD36D] text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all cursor-pointer flex items-center gap-2 active:scale-95 shrink-0"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Tambah Room</span>
              </button>

              <div>
                <h1 className="text-xl sm:text-2xl font-black text-[#23212A] tracking-tight">
                  Room Akses Siswa
                </h1>
                <p className="text-xs sm:text-sm text-[#756F7A] mt-1">
                  Bagikan modul materi dan paket soal kontekstual langsung ke siswa via URL atau kode room tanpa akun.
                </p>
              </div>
            </div>

            {/* ===================================================================
                2. SEARCH BAR & FILTER ROOM: LANGSUNG TANPA DIBUNGKUS CARD
                =================================================================== */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#51465B]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari kode room, judul, atau mapel..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-full bg-white border-2 border-[#51465B]/25 text-xs font-semibold text-[#23212A] placeholder:text-[#756F7A]/70 focus:outline-none focus:border-[#51465B] shadow-xs transition-colors"
                />
              </div>

              {/* Filter Room Pills - Sebaris & full sejajar search di mobile, rata kanan di desktop */}
              <div className="w-full sm:w-auto flex items-center justify-between gap-1 sm:gap-1.5 sm:ml-auto sm:justify-end flex-nowrap">
                <button
                  type="button"
                  onClick={() => setFilterType("all")}
                  className={`flex-1 sm:flex-none inline-flex items-center justify-center whitespace-nowrap px-2 sm:px-3.5 py-2 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                    filterType === "all"
                      ? "bg-[#51465B] text-white shadow-xs"
                      : "bg-white text-[#756F7A] hover:bg-slate-100 border-2 border-[#51465B]/20"
                  }`}
                >
                  Semua
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType("material")}
                  className={`flex-1 sm:flex-none inline-flex items-center justify-center whitespace-nowrap px-2 sm:px-3.5 py-2 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                    filterType === "material"
                      ? "bg-[#51465B] text-white shadow-xs"
                      : "bg-white text-[#756F7A] hover:bg-slate-100 border-2 border-[#51465B]/20"
                  }`}
                >
                  Materi
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType("question")}
                  className={`flex-1 sm:flex-none inline-flex items-center justify-center whitespace-nowrap px-2 sm:px-3.5 py-2 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                    filterType === "question"
                      ? "bg-[#51465B] text-white shadow-xs"
                      : "bg-white text-[#756F7A] hover:bg-slate-100 border-2 border-[#51465B]/20"
                  }`}
                >
                  Soal
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType("both")}
                  className={`flex-1 sm:flex-none inline-flex items-center justify-center whitespace-nowrap px-2 sm:px-3.5 py-2 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                    filterType === "both"
                      ? "bg-[#51465B] text-white shadow-xs"
                      : "bg-white text-[#756F7A] hover:bg-slate-100 border-2 border-[#51465B]/20"
                  }`}
                >
                  Materi & Soal
                </button>
              </div>
            </div>

            {/* ===================================================================
                3. DAFTAR ROOM: CARD BERSIH TANPA IKON/KATEGORI/DESKRIPSI, KODE JELAS, BUTTON BULAT
                =================================================================== */}
            <div>
              {filteredRooms.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border-2 border-[#51465B]/20 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-[#FAF7F3] text-[#756F7A] mx-auto flex items-center justify-center">
                    <DoorOpen className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-[#23212A]">Tidak ada room ditemukan</h3>
                  <p className="text-xs text-[#756F7A] max-w-sm mx-auto">
                    Silakan sesuaikan kata kunci pencarian atau buat room baru menggunakan tombol di atas.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {filteredRooms.map((room) => {
                    const isMaterial = room.type === "material";
                    const isBoth = room.type === "both";

                    if (isBoth) {
                      return (
                        <div
                          key={room.id}
                          className="relative p-5 rounded-[26px] bg-gradient-to-br from-[#51465B] via-[#43374D] to-[#B38A2D] border-2 border-[#FFD36D] shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group overflow-hidden min-h-[140px] text-white"
                        >
                          <div className="absolute -top-10 -left-10 w-28 h-28 bg-[#FFD36D]/15 rounded-full blur-xl pointer-events-none" />

                          {/* Top: Judul di kiri, Kode di kanan tanpa kapsul */}
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="text-sm sm:text-base font-black text-white leading-snug line-clamp-2">
                              {room.title}
                            </h3>
                            <span className="shrink-0 font-mono text-[11px] font-bold text-[#FFD36D] tracking-wider pt-0.5">
                              {room.code}
                            </span>
                          </div>

                          {/* Bottom: Button Bulat */}
                          <div className="pt-4 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setPreviewRoom(room);
                                setIsEditingPreview(false);
                              }}
                              className="flex-1 py-2.5 px-5 rounded-full bg-gradient-to-r from-[#FFD36D] to-[#FDB040] hover:from-[#FFE085] hover:to-[#FFBD59] text-[#23212A] text-xs font-black flex items-center justify-center shadow-xs hover:shadow transition-all cursor-pointer active:scale-95 whitespace-nowrap"
                            >
                              <span>Lihat Room</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenDeleteModal(room.id, `${room.title} (${room.code})`)}
                              className="w-9 h-9 rounded-full bg-white/10 hover:bg-rose-500/25 text-white/70 hover:text-rose-300 border border-white/20 flex items-center justify-center transition-all cursor-pointer shrink-0"
                              title="Hapus Room"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    }

                    if (isMaterial) {
                      return (
                        <div
                          key={room.id}
                          className="relative p-5 rounded-[26px] bg-[#51465B] border-2 border-[#FFD36D] shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group overflow-hidden min-h-[140px] text-white"
                        >
                          <div className="absolute -top-10 -left-10 w-28 h-28 bg-[#FFD36D]/15 rounded-full blur-xl pointer-events-none" />

                          {/* Top: Judul di kiri, Kode di kanan tanpa kapsul */}
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="text-sm sm:text-base font-black text-white leading-snug line-clamp-2">
                              {room.title}
                            </h3>
                            <span className="shrink-0 font-mono text-[11px] font-bold text-[#FFD36D] tracking-wider pt-0.5">
                              {room.code}
                            </span>
                          </div>

                          {/* Bottom: Button Bulat */}
                          <div className="pt-4 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setPreviewRoom(room);
                                setIsEditingPreview(false);
                              }}
                              className="flex-1 py-2.5 px-5 rounded-full bg-[#FFD36D] hover:bg-[#FFE085] text-[#23212A] text-xs font-black flex items-center justify-center shadow-xs hover:shadow transition-all cursor-pointer active:scale-95"
                            >
                              <span>Lihat Room</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenDeleteModal(room.id, `${room.title} (${room.code})`)}
                              className="w-9 h-9 rounded-full bg-white/10 hover:bg-rose-500/25 text-white/70 hover:text-rose-300 border border-white/20 flex items-center justify-center transition-all cursor-pointer shrink-0"
                              title="Hapus Room"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    }

                    // Style Soal: Kuning Cerah (#FFD36D)
                    return (
                      <div
                        key={room.id}
                        className="relative p-5 rounded-[26px] bg-[#FFD36D] border-2 border-[#51465B] shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group overflow-hidden min-h-[140px] text-[#23212A]"
                      >
                        <div className="absolute -top-10 -left-10 w-28 h-28 bg-[#51465B]/10 rounded-full blur-xl pointer-events-none" />

                        {/* Top: Judul di kiri, Kode di kanan tanpa kapsul */}
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-sm sm:text-base font-black text-[#23212A] leading-snug line-clamp-2">
                            {room.title}
                          </h3>
                          <span className="shrink-0 font-mono text-[11px] font-bold text-[#51465B] tracking-wider pt-0.5">
                            {room.code}
                          </span>
                        </div>

                        {/* Bottom: Button Bulat */}
                        <div className="pt-4 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewRoom(room);
                              setIsEditingPreview(false);
                            }}
                            className="flex-1 py-2.5 px-5 rounded-full bg-[#51465B] hover:bg-[#3E3547] text-[#FFD36D] text-xs font-black flex items-center justify-center shadow-xs hover:shadow transition-all cursor-pointer active:scale-95"
                          >
                            <span>Lihat Room</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDeleteModal(room.id, `${room.title} (${room.code})`)}
                            className="w-9 h-9 rounded-full bg-black/10 hover:bg-rose-500/25 text-[#23212A]/70 hover:text-rose-700 border border-[#51465B]/20 flex items-center justify-center transition-all cursor-pointer shrink-0"
                            title="Hapus Room"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* =====================================================================
          CREATION WIZARD MODAL (LOGIN & ROOM ENTRY INSPIRED CLEAN STEP FORM)
          ===================================================================== */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className={`w-full ${wizardStep === 3 ? "max-w-[620px]" : "max-w-[540px]"} bg-gradient-to-b from-[#3E3547] via-[#332A3B] to-[#251E2B] rounded-[32px] sm:rounded-[36px] border border-[#5A4F65] shadow-2xl p-6 sm:p-8 relative my-auto max-h-[92vh] overflow-y-auto text-white flex flex-col text-left transition-all duration-300`}>
            {/* ===================================================================
                MODAL HEADER: JUDUL DI KIRI ATAS, PROGRES STEP DI BAWAHNYA, X DI KANAN ATAS
                =================================================================== */}
            <div className="w-full flex items-start justify-between pb-4 border-b border-white/10 mb-5">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  {wizardStep === 1
                    ? "Tipe Room"
                    : wizardStep === 2
                    ? "Identitas Room"
                    : wizardStep === 3
                    ? "Pilih Konten"
                    : "Room Siap"}
                </h3>
                {/* Progress Step dots */}
                <div className="flex items-center gap-1.5 mt-2">
                  <div className={`h-1.5 rounded-full transition-all duration-300 ${wizardStep === 1 ? "w-6 bg-[#FFD36D]" : "w-2 bg-[#FFD36D]/60"}`} />
                  <div className={`h-1.5 rounded-full transition-all duration-300 ${wizardStep === 2 ? "w-6 bg-[#FFD36D]" : wizardStep > 2 ? "w-2 bg-[#FFD36D]/60" : "w-2 bg-white/20"}`} />
                  <div className={`h-1.5 rounded-full transition-all duration-300 ${wizardStep === 3 ? "w-6 bg-[#FFD36D]" : wizardStep > 3 ? "w-2 bg-[#FFD36D]/60" : "w-2 bg-white/20"}`} />
                  <div className={`h-1.5 rounded-full transition-all duration-300 ${wizardStep === 4 ? "w-6 bg-[#FFD36D]" : "w-2 bg-white/20"}`} />
                </div>
              </div>

              {/* Close / Batal Button di pojok kanan atas */}
              <button
                type="button"
                onClick={() => setIsWizardOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-3"
                title="Batal / Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ===================================================================
                STEP 1: PILIH TIPE ROOM (BENTUK CARD KOTAK KONSISTEN)
                =================================================================== */}
            {wizardStep === 1 && (
              <div className="w-full space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="grid grid-cols-3 gap-3 pt-1">
                  {/* Card Kotak 1: Room Materi */}
                  <button
                    type="button"
                    onClick={() => handleSelectType("material")}
                    className="aspect-square h-full p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 hover:border-[#FFD36D] flex flex-col items-center justify-center text-center gap-2.5 transition-all cursor-pointer group active:scale-95"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-white/10 group-hover:bg-[#FFD36D] text-[#FFD36D] group-hover:text-[#251E2B] flex items-center justify-center transition-all shadow-xs">
                      <BookOpen className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <span className="font-bold text-xs text-white group-hover:text-[#FFD36D] transition-colors leading-tight">
                      Room Materi
                    </span>
                  </button>

                  {/* Card Kotak 2: Room Soal */}
                  <button
                    type="button"
                    onClick={() => handleSelectType("question")}
                    className="aspect-square h-full p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 hover:border-[#FFD36D] flex flex-col items-center justify-center text-center gap-2.5 transition-all cursor-pointer group active:scale-95"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-white/10 group-hover:bg-[#FFD36D] text-[#FFD36D] group-hover:text-[#251E2B] flex items-center justify-center transition-all shadow-xs">
                      <FileQuestion className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <span className="font-bold text-xs text-white group-hover:text-[#FFD36D] transition-colors leading-tight">
                      Room Soal
                    </span>
                  </button>

                  {/* Card Kotak 3: Materi & Soal */}
                  <button
                    type="button"
                    onClick={() => handleSelectType("both")}
                    className="aspect-square h-full p-4 rounded-2xl bg-gradient-to-br from-[#FFD36D]/20 to-[#FDB040]/10 hover:from-[#FFD36D]/30 hover:to-[#FDB040]/20 border border-[#FFD36D]/40 hover:border-[#FFD36D] flex flex-col items-center justify-center text-center gap-2.5 transition-all cursor-pointer group active:scale-95"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-[#FFD36D] text-[#251E2B] flex items-center justify-center transition-all shadow-xs group-hover:scale-105">
                      <Layers className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <span className="font-bold text-xs text-[#FFD36D] transition-colors leading-tight">
                      Materi & Soal
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* ===================================================================
                STEP 2: IDENTITAS RUANG BELAJAR
                =================================================================== */}
            {wizardStep === 2 && (
              <form onSubmit={handleStep2Next} className="w-full space-y-4 animate-in fade-in zoom-in-95 duration-200">
                {/* Kode Room */}
                <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-300">Kode Room</span>
                  <span className="font-mono text-sm font-black text-[#FFD36D] tracking-wider px-2.5 py-0.5 rounded-lg bg-black/30 border border-[#FFD36D]/30">
                    {roomCode}
                  </span>
                </div>

                {/* Judul Room */}
                <div>
                  <label className="block text-xs font-bold text-gray-200 mb-1">
                    Judul Room
                  </label>
                  <input
                    type="text"
                    required
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Judul ruang belajar..."
                    className="w-full px-4 py-3 rounded-2xl border-2 border-white/20 bg-[#251E2B]/80 focus:border-[#FFD36D] text-xs sm:text-sm font-bold text-white placeholder:text-gray-400/60 focus:outline-none transition-all shadow-inner"
                  />
                </div>

                {/* Mata Pelajaran & Kelas */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-200 mb-1">
                      Mata Pelajaran
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-white/20 bg-[#251E2B] focus:border-[#FFD36D] text-xs font-bold text-white focus:outline-none select-dark"
                    >
                      <option value="Matematika">Matematika</option>
                      <option value="IPAS">IPAS</option>
                      <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                      <option value="Pendidikan Pancasila">Pendidikan Pancasila</option>
                      <option value="Seni Budaya">Seni Budaya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-200 mb-1">
                      Kelas SD
                    </label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-white/20 bg-[#251E2B] focus:border-[#FFD36D] text-xs font-bold text-white focus:outline-none select-dark"
                    >
                      {[1, 2, 3, 4, 5, 6].map((g) => (
                        <option key={g} value={g}>
                          Kelas {g} SD
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Footer Buttons Step 2 */}
                <div className="pt-3 flex items-center justify-between border-t border-white/10 gap-3">
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    className="py-2.5 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
                  >
                    Kembali
                  </button>

                  <button
                    type="submit"
                    disabled={!customTitle.trim()}
                    className="py-2.5 px-6 rounded-2xl bg-[#FFD36D] hover:bg-[#FFE085] text-[#23212A] font-extrabold text-xs shadow-md transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
                  >
                    <span>Lanjut</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            {/* ===================================================================
                STEP 3: PILIH KONTEN (DAFTAR LIST HORIZONTAL JUDUL & KODE SAJA)
                =================================================================== */}
            {wizardStep === 3 && (
              <form onSubmit={handleSaveRoom} className="w-full space-y-5 animate-in fade-in zoom-in-95 duration-200">
                {/* Resource Picker Materi */}
                {(roomType === "material" || roomType === "both") && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-200">
                        Pilih Materi ({materials.length})
                      </label>
                      <span className="text-[11px] text-[#FFD36D] font-medium flex items-center gap-1">
                        Geser horizontal &rarr;
                      </span>
                    </div>

                    {materials.length === 0 ? (
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-gray-400 text-center">
                        Belum ada modul materi tersimpan.
                      </div>
                    ) : (
                      <div className="flex items-stretch gap-3 overflow-x-auto pb-2.5 pt-1 -mx-1 px-1 scrollbar-thin">
                        {materials.map((m) => {
                          const isSelected = selectedResourceId === m.id;
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => setSelectedResourceId(m.id)}
                              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer min-w-[200px] max-w-[240px] shrink-0 flex flex-col justify-between gap-3 group active:scale-95 ${
                                isSelected
                                  ? "border-[#FFD36D] bg-[#FFD36D]/15 shadow-md shadow-[#FFD36D]/10 ring-1 ring-[#FFD36D]"
                                  : "border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span
                                  className={`font-mono text-[11px] font-black px-2.5 py-0.5 rounded-lg transition-colors ${
                                    isSelected
                                      ? "bg-[#FFD36D] text-[#251E2B] shadow-xs"
                                      : "bg-[#251E2B] text-[#FFD36D] border border-white/15"
                                  }`}
                                >
                                  {m.id}
                                </span>
                                {isSelected && (
                                  <span className="w-5 h-5 rounded-full bg-[#FFD36D] text-[#251E2B] flex items-center justify-center shrink-0 shadow-xs">
                                    <Check className="w-3 h-3 stroke-[3]" />
                                  </span>
                                )}
                              </div>

                              <div
                                className={`text-xs font-bold leading-snug line-clamp-2 transition-colors ${
                                  isSelected ? "text-white font-extrabold" : "text-gray-200 group-hover:text-white"
                                }`}
                                title={m.title}
                              >
                                {m.title}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Resource Picker Soal */}
                {(roomType === "question" || roomType === "both") && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-gray-200">
                          Pilih Soal ({questions.length})
                        </label>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFD36D] text-[#251E2B] font-black">
                          {selectedQuestionIds.length} Dipilih
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedQuestionIds.length === questions.length) {
                              setSelectedQuestionIds([]);
                            } else {
                              setSelectedQuestionIds(questions.map((q) => q.id));
                            }
                          }}
                          className="text-[11px] text-[#FFD36D] hover:underline font-bold cursor-pointer"
                        >
                          {selectedQuestionIds.length === questions.length ? "Hapus Pilihan" : "Pilih Semua"}
                        </button>
                        <span className="text-[11px] text-gray-400 font-medium">
                          &bull; Geser &rarr;
                        </span>
                      </div>
                    </div>

                    {questions.length === 0 ? (
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-gray-400 text-center">
                        Belum ada butir soal tersimpan.
                      </div>
                    ) : (
                      <div className="flex items-stretch gap-3 overflow-x-auto pb-2.5 pt-1 -mx-1 px-1 scrollbar-thin">
                        {questions.map((q) => {
                          const isSelected = selectedQuestionIds.includes(q.id);
                          const questionTitle = q.topic || q.question_text || "Butir Soal";
                          const qItemsCount = getQuestionItems(q).length;

                          return (
                            <button
                              key={q.id}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedQuestionIds((prev) => prev.filter((id) => id !== q.id));
                                } else {
                                  setSelectedQuestionIds((prev) => [...prev, q.id]);
                                }
                              }}
                              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer min-w-[210px] max-w-[250px] shrink-0 flex flex-col justify-between gap-3 group active:scale-95 ${
                                isSelected
                                  ? "border-[#FFD36D] bg-[#FFD36D]/20 shadow-md shadow-[#FFD36D]/15 ring-2 ring-[#FFD36D]"
                                  : "border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span
                                  className={`font-mono text-[11px] font-black px-2.5 py-0.5 rounded-lg transition-colors ${
                                    isSelected
                                      ? "bg-[#FFD36D] text-[#251E2B] shadow-xs"
                                      : "bg-[#251E2B] text-[#FFD36D] border border-white/15"
                                  }`}
                                >
                                  {q.id}
                                </span>
                                {isSelected ? (
                                  <span className="w-5 h-5 rounded-full bg-[#FFD36D] text-[#251E2B] flex items-center justify-center shrink-0 shadow-xs">
                                    <Check className="w-3 h-3 stroke-[3]" />
                                  </span>
                                ) : (
                                  <span className="w-5 h-5 rounded-full border border-white/25 flex items-center justify-center shrink-0" />
                                )}
                              </div>

                              <div
                                className={`text-xs font-bold leading-snug line-clamp-2 transition-colors ${
                                  isSelected ? "text-white font-extrabold" : "text-gray-200 group-hover:text-white"
                                }`}
                                title={questionTitle}
                              >
                                {questionTitle}
                              </div>

                              <div className="flex items-center justify-between text-[10px] text-gray-400 border-t border-white/10 pt-2">
                                <span>{q.subject}</span>
                                <span className="font-bold text-[#FFD36D]">{qItemsCount} Butir</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Buttons Step 3 */}
                <div className="pt-3 flex items-center justify-between border-t border-white/10 gap-3">
                  <button
                    type="button"
                    onClick={() => setWizardStep(2)}
                    className="py-2.5 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
                  >
                    Kembali
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="py-2.5 px-6 rounded-2xl bg-[#FFD36D] hover:bg-[#FFE085] text-[#23212A] font-extrabold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>{isSubmitting ? "Menyimpan..." : "Simpan"}</span>
                  </button>
                </div>
              </form>
            )}

            {/* ===================================================================
                STEP 4: SUKSES / SELESAI
                =================================================================== */}
            {wizardStep === 4 && createdRoom && (
              <div className="w-full text-center py-4 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-lg sm:text-xl font-black text-white">
                    Ruang Belajar Berhasil Diterbitkan!
                  </h4>
                  <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-xl bg-white/10 border border-white/15">
                    <span className="text-[11px] text-gray-300">Kode Room:</span>
                    <span className="font-mono text-sm font-bold text-[#FFD36D]">
                      {createdRoom.code}
                    </span>
                  </div>
                </div>

                {/* Big Code Card */}
                <div className="p-4 rounded-2xl bg-white/10 border-2 border-[#FFD36D]/60 max-w-xs mx-auto text-center space-y-2">
                  <span className="text-2xl sm:text-3xl font-mono font-black text-[#FFD36D] tracking-widest block">
                    {createdRoom.code}
                  </span>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleCopyCode(createdRoom.code)}
                      className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedCode === createdRoom.code ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-300">Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-gray-300" />
                          <span>Salin Kode</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyLink(createdRoom.code)}
                      className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedLink === createdRoom.code ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-300">URL Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5 text-gray-300" />
                          <span>Salin URL</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                  <Link
                    href={`/room/${createdRoom.code}`}
                    target="_blank"
                    className="w-full py-3 px-5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 text-white font-extrabold text-xs sm:text-sm text-center transition-all flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Buka Room Sekarang</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setIsWizardOpen(false)}
                    className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-[#FFD36D] to-[#FDB040] text-[#251E2B] text-xs sm:text-sm font-extrabold shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    Selesai & Tutup
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Printable Document Modal */}
      {isPrintingRoom && previewRoom && (
        <DepaskanPrintableDocument
          docType="room"
          contentId={previewRoom.id}
          title={previewRoom.title}
          subject={previewRoom.subject}
          grade={previewRoom.grade}
          regionName={previewRoom.region_name}
          content={attachedMaterial?.content || ""}
          roomCode={previewRoom.code}
          questions={
            attachedQuestion
              ? getQuestionItems(attachedQuestion).map((item, idx) => ({
                  number: idx + 1,
                  type: item.type,
                  question_text: item.question_text,
                  options: item.options,
                  correct_answer: item.correct_answer,
                }))
              : []
          }
          onClose={() => setIsPrintingRoom(false)}
        />
      )}

      {/* Custom Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        itemType="room"
        itemId={deleteModal.id}
        itemTitle={deleteModal.title}
        isDeleting={deleteModal.isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => {
          if (!deleteModal.isDeleting) {
            setDeleteModal({ isOpen: false, id: "", title: "", isDeleting: false });
          }
        }}
      />
    </TeacherWorkspaceShell>
  );
}

export default function TeacherRoomsPage() {
  return (
    <Suspense fallback={null}>
      <TeacherRoomsContent />
    </Suspense>
  );
}
