"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  FileQuestion,
  BookOpen,
  Sparkles,
  MapPin,
  Camera,
  Upload,
  PenTool,
  Search,
  Copy,
  Check,
  DoorOpen,
  Trash2,
  Edit,
  Pencil,
  Eye,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  ExternalLink,
  Layers,
  Brain,
  Link2,
  FileText,
  Plus,
  Printer,
  Loader2,
} from "lucide-react";
import { TeacherWorkspaceShell } from "@/components/layout/teacher-workspace-shell";
import { repository } from "@/lib/db/repository";
import {
  Question,
  QuestionItem,
  getQuestionItems,
  LearningMaterial,
  School,
  UserProfile,
  LearningRoom,
} from "@/lib/db/types";
import { DepaskanPrintableDocument } from "@/components/print/depaskan-printable-document";
import { DeleteConfirmationModal } from "@/components/dialog/delete-confirmation-modal";
import { CameraCaptureModal } from "@/components/media/camera-capture-modal";

const SUBJECT_OPTIONS = [
  "Semua Mapel",
  "Matematika",
  "IPAS (Ilmu Pengetahuan Alam & Sosial)",
  "Bahasa Indonesia",
  "Pendidikan Pancasila",
  "Seni Budaya & Prakarya",
];

export interface QuestionDraftItem {
  id: string;
  type: "multiple_choice" | "essay";
  question_text: string;
  options: { key: string; text: string }[];
  correct_answer: string;
  explanation: string;
  rubric?: string;
}

function TeacherQuestionsContent() {
  const searchParams = useSearchParams();
  const hasAutoOpenedRef = useRef(false);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [activeSchool, setActiveSchool] = useState<School | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [rooms, setRooms] = useState<LearningRoom[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "multiple_choice" | "essay" | "mixed">("all");
  const [filterSubject, setFilterSubject] = useState("Semua Mapel");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Overlay "Tambah Soal dari Materi" State
  const [isFromMaterialOverlayOpen, setIsFromMaterialOverlayOpen] = useState(false);
  const [inputMaterialCode, setInputMaterialCode] = useState("");
  const [materialFilterSearch, setMaterialFilterSearch] = useState("");

  // Creation Wizard Modal States
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedMethod, setSelectedMethod] = useState<"manual" | "camera" | "pdf" | "ai" | "from_material">("manual");

  // Step 2: Identitas Soal (Topik, Mata Pelajaran, Jenjang) - Tipe Soal dipindah ke Step 3 per butir soal
  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState("Matematika");
  const [grade, setGrade] = useState(5);
  const [region, setRegion] = useState("Kota Madiun");

  // Step 2: Content Inputs & Upload States
  const [manualQuestionDraft, setManualQuestionDraft] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [capturedPhotoName, setCapturedPhotoName] = useState<string | null>(null);
  const [isPrintingQuestion, setIsPrintingQuestion] = useState(false);
  const [isExtractingText, setIsExtractingText] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const handleCameraCapture = (file: File) => {
    setCapturedPhotoName(file.name);
    handleExtractFromFile(file);
  };

  const handleExtractFromFile = async (file: File) => {
    setIsExtractingText(true);
    setExtractionError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/ai/extract", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.success && json.extractedText) {
        setManualQuestionDraft(json.extractedText);
      } else {
        throw new Error(json.error || "Gagal mengekstrak teks dari berkas.");
      }
    } catch (err: any) {
      setExtractionError(err.message || "Gagal memindai berkas.");
    } finally {
      setIsExtractingText(false);
    }
  };

  // Step 3: Multi-Question List Drafts (Bisa tambah banyak soal, pilih pilgan atau esai)
  const [questionsList, setQuestionsList] = useState<QuestionDraftItem[]>([
    {
      id: "q-draft-1",
      type: "multiple_choice",
      question_text: "",
      options: [
        { key: "A", text: "" },
        { key: "B", text: "" },
        { key: "C", text: "" },
        { key: "D", text: "" },
      ],
      correct_answer: "A",
      explanation: "",
      rubric: "",
    },
  ]);

  // Step 4: Result
  const [createdQuestionId, setCreatedQuestionId] = useState<string | null>(null);
  const [createdQuestionIds, setCreatedQuestionIds] = useState<string[]>([]);
  const [patentQuestionId, setPatentQuestionId] = useState("");

  // Multi-Question Draft Handlers
  const handleAddQuestion = (type: "multiple_choice" | "essay" = "multiple_choice") => {
    setQuestionsList((prev) => [
      ...prev,
      {
        id: `q-draft-${Date.now()}-${prev.length + 1}`,
        type,
        question_text: "",
        options: [
          { key: "A", text: "" },
          { key: "B", text: "" },
          { key: "C", text: "" },
          { key: "D", text: "" },
        ],
        correct_answer: "A",
        explanation: "",
        rubric: "",
      },
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questionsList.length <= 1) return;
    setQuestionsList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateQuestion = (index: number, field: keyof QuestionDraftItem, value: any) => {
    setQuestionsList((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleUpdateOption = (qIndex: number, optKey: string, text: string) => {
    setQuestionsList((prev) => {
      const next = [...prev];
      const opts = next[qIndex].options.map((o) =>
        o.key === optKey ? { ...o, text } : o
      );
      next[qIndex] = { ...next[qIndex], options: opts };
      return next;
    });
  };

  // Room Publish Modal
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [questionToPublish, setQuestionToPublish] = useState<Question | null>(null);
  const [generatedRoomCode, setGeneratedRoomCode] = useState("");
  const [roomCreatedSuccess, setRoomCreatedSuccess] = useState(false);

  // Full-page Live Preview & Edit State (No Modal Overlay)
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);
  const [isEditingPreview, setIsEditingPreview] = useState(false);
  const [editSubject, setEditSubject] = useState("Matematika");
  const [editGrade, setEditGrade] = useState(5);
  const [editTopic, setEditTopic] = useState("");
  const [editNotification, setEditNotification] = useState<string | null>(null);
  const [editableItems, setEditableItems] = useState<QuestionDraftItem[]>([]);

  const handleStartEditQuestion = (initialAddType?: "multiple_choice" | "essay") => {
    if (!previewQuestion) return;
    setIsEditingPreview(true);
    setEditSubject(previewQuestion.subject);
    setEditGrade(previewQuestion.grade);
    setEditTopic(previewQuestion.topic || "");

    const existingItems = getQuestionItems(previewQuestion);
    const mapped: QuestionDraftItem[] = existingItems.map((it, idx) => ({
      id: it.id || `item-edit-${Date.now()}-${idx + 1}`,
      type: it.type,
      question_text: it.question_text || "",
      options:
        it.options && it.options.length > 0
          ? it.options.map((o) => ({ key: o.key, text: o.text }))
          : [
              { key: "A", text: "" },
              { key: "B", text: "" },
              { key: "C", text: "" },
              { key: "D", text: "" },
            ],
      correct_answer: it.correct_answer || "A",
      explanation: it.explanation || "",
      rubric: it.rubric || "",
    }));

    if (initialAddType) {
      mapped.push({
        id: `item-edit-${Date.now()}-${mapped.length + 1}`,
        type: initialAddType,
        question_text: "",
        options: [
          { key: "A", text: "" },
          { key: "B", text: "" },
          { key: "C", text: "" },
          { key: "D", text: "" },
        ],
        correct_answer: "A",
        explanation: "",
        rubric: "",
      });
    }

    setEditableItems(mapped);
  };

  const handleAddItemToEdit = (type: "multiple_choice" | "essay" = "multiple_choice") => {
    setEditableItems((prev) => [
      ...prev,
      {
        id: `item-edit-${Date.now()}-${prev.length + 1}`,
        type,
        question_text: "",
        options: [
          { key: "A", text: "" },
          { key: "B", text: "" },
          { key: "C", text: "" },
          { key: "D", text: "" },
        ],
        correct_answer: "A",
        explanation: "",
        rubric: "",
      },
    ]);
  };

  const handleRemoveItemFromEdit = (index: number) => {
    if (editableItems.length <= 1) {
      alert("Paket soal harus memiliki setidaknya satu butir soal.");
      return;
    }
    setEditableItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateItemInEdit = (
    index: number,
    field: keyof QuestionDraftItem,
    value: any
  ) => {
    setEditableItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleUpdateItemOptionInEdit = (
    itemIndex: number,
    optKey: string,
    text: string
  ) => {
    setEditableItems((prev) => {
      const next = [...prev];
      const opts = next[itemIndex].options.map((o) =>
        o.key === optKey ? { ...o, text } : o
      );
      next[itemIndex] = { ...next[itemIndex], options: opts };
      return next;
    });
  };

  const handleSaveEditedQuestion = () => {
    if (!previewQuestion) return;
    const validItems = editableItems.filter((it) => it.question_text.trim());
    if (validItems.length === 0) {
      alert("Mohon isi teks pertanyaan setidaknya untuk satu butir soal.");
      return;
    }

    const itemsToSave: QuestionItem[] = validItems.map((it) => ({
      id: it.id,
      type: it.type,
      question_text: it.question_text.trim(),
      options:
        it.type === "multiple_choice"
          ? it.options.map((o) => ({
              key: o.key,
              text: o.text.trim() || `Pilihan ${o.key}`,
            }))
          : [],
      correct_answer: it.type === "multiple_choice" ? it.correct_answer : "",
      explanation: it.explanation.trim(),
      rubric: it.type === "essay" ? it.rubric?.trim() : undefined,
    }));

    const updated = repository.saveQuestion({
      id: previewQuestion.id,
      school_id: previewQuestion.school_id || activeSchool?.id || "sch-ponorogo-01",
      teacher_id: previewQuestion.teacher_id,
      subject: editSubject as any,
      grade: editGrade,
      topic: editTopic.trim() || itemsToSave[0].question_text.slice(0, 30),
      items: itemsToSave,
    });

    setPreviewQuestion(updated);
    setIsEditingPreview(false);
    setEditNotification(
      `Soal #${previewQuestion.id} berhasil diperbarui dengan ${itemsToSave.length} butir soal!`
    );
    setTimeout(() => setEditNotification(null), 4000);
    loadData();
  };

  const loadData = () => {
    const school = repository.getActiveSchool();
    const user = repository.getCurrentUser();
    setActiveSchool(school);
    setCurrentUser(user);
    setRegion(school.region_name || "Kota Madiun");
    setQuestions(repository.getQuestions({ schoolId: school.id }));
    setMaterials(repository.getMaterials(school.id));
    setRooms(repository.getRooms(user.id));
  };

  // Open Wizard (Step 1: Pilih Metode)
  const handleOpenWizard = (method?: "manual" | "camera" | "pdf" | "ai" | "from_material", linkedMaterial?: LearningMaterial) => {
    setPatentQuestionId(repository.getNextQuestionId());
    setUploadedFileName(null);
    setCapturedPhotoName(null);
    setTopic("");
    setManualQuestionDraft("");
    setAiPrompt("");
    setExtractionError(null);
    setCreatedQuestionId(null);
    setCreatedQuestionIds([]);
    setQuestionsList([
      {
        id: "q-draft-1",
        type: "multiple_choice",
        question_text: "",
        options: [
          { key: "A", text: "" },
          { key: "B", text: "" },
          { key: "C", text: "" },
          { key: "D", text: "" },
        ],
        correct_answer: "A",
        explanation: "",
        rubric: "",
      },
    ]);

    if (linkedMaterial) {
      setSelectedMethod("from_material");
      setTopic(linkedMaterial.title);
      setSubject(linkedMaterial.subject);
      setGrade(linkedMaterial.grade);
      setWizardStep(2);
    } else if (method) {
      setSelectedMethod(method);
      setWizardStep(2);
    } else {
      setSelectedMethod("manual");
      setWizardStep(1);
    }

    setIsWizardOpen(true);
  };

  useEffect(() => {
    loadData();
    const handleSync = () => loadData();
    window.addEventListener("repositorySyncCompleted", handleSync);
    window.addEventListener("storage", handleSync);
    const methodParam = searchParams?.get("method");
    const actionParam = searchParams?.get("action");
    if (!hasAutoOpenedRef.current && (methodParam === "manual" || actionParam === "manual" || actionParam === "new")) {
      hasAutoOpenedRef.current = true;
      handleOpenWizard("manual");
    }
    return () => {
      window.removeEventListener("repositorySyncCompleted", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, [searchParams]);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSelectMethod = (method: "manual" | "camera" | "pdf" | "ai" | "from_material") => {
    setSelectedMethod(method);
    setTopic("");
    setManualQuestionDraft("");
    setAiPrompt("");
    setExtractionError(null);
    setCreatedQuestionId(null);
    setCreatedQuestionIds([]);
    setQuestionsList([
      {
        id: "q-draft-1",
        type: "multiple_choice",
        question_text: "",
        options: [
          { key: "A", text: "" },
          { key: "B", text: "" },
          { key: "C", text: "" },
          { key: "D", text: "" },
        ],
        correct_answer: "A",
        explanation: "",
        rubric: "",
      },
    ]);

    if (method === "from_material" && materials.length > 0) {
      setTopic(materials[0].title);
      setSubject(materials[0].subject);
      setGrade(materials[0].grade);
    }
    setWizardStep(2);
  };

  // Handle Pick Material from Overlay
  const handleSelectMaterialFromOverlay = (mat: LearningMaterial) => {
    setIsFromMaterialOverlayOpen(false);
    handleOpenWizard("from_material", mat);
  };

  // Handle Submit Material Code from Overlay
  const handleSubmitMaterialCodeFromOverlay = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputMaterialCode.trim().toLowerCase();
    const target = materials.find(
      (m) => m.id.toLowerCase() === clean || m.title.toLowerCase().includes(clean)
    );

    if (!target) {
      alert("Kode atau judul materi tidak ditemukan. Silakan periksa kembali daftar materi yang tersedia.");
      return;
    }

    setIsFromMaterialOverlayOpen(false);
    handleOpenWizard("from_material", target);
  };

  // Step 2 -> Step 3: Validasi Identitas & Masuk Form Konten Soal
  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() && selectedMethod !== "ai") return;
    if (selectedMethod === "ai" && !aiPrompt.trim() && !topic.trim()) return;

    if (selectedMethod === "ai") {
      await handleTriggerAiContextTransformation();
      return;
    }

    setQuestionsList((prev) => {
      if (prev.length === 0) {
        return [
          {
            id: "q-draft-1",
            type: "multiple_choice",
            question_text: manualQuestionDraft || `Berdasarkan topik ${topic}, jawablah pertanyaan kontekstual berikut:`,
            options: [
              { key: "A", text: "" },
              { key: "B", text: "" },
              { key: "C", text: "" },
              { key: "D", text: "" },
            ],
            correct_answer: "A",
            explanation: "",
            rubric: "",
          },
        ];
      }
      const updated = [...prev];
      if (!updated[0].question_text.trim()) {
        updated[0] = {
          ...updated[0],
          question_text: manualQuestionDraft || `Berdasarkan topik ${topic}, jawablah pertanyaan kontekstual berikut:`,
        };
      }
      return updated;
    });

    setWizardStep(3);
  };

  // Process AI Context Transformation (Server-Side Gemini + LKB RAG)
  const handleTriggerAiContextTransformation = async () => {
    setIsAiGenerating(true);
    try {
      const res = await fetch("/api/ai/contextualize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "question",
          inputMode: selectedMethod,
          prompt: selectedMethod === "ai" ? (aiPrompt || topic) : "",
          rawText: manualQuestionDraft,
          topic: topic || aiPrompt || "Asesmen Tematik",
          subject,
          grade,
          regionId: activeSchool?.region_id || "35.02",
          regionName: region,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        if (json.data.topic) {
          setTopic(json.data.topic);
        }
        if (json.data.questions && Array.isArray(json.data.questions) && json.data.questions.length > 0) {
          const mapped: QuestionDraftItem[] = json.data.questions.map((q: any, idx: number) => ({
            id: `q-draft-${Date.now()}-${idx + 1}`,
            type: q.type === "essay" ? "essay" : "multiple_choice",
            question_text: q.question_text || q.question || "",
            options: q.options && Array.isArray(q.options)
              ? q.options.map((o: any, oIdx: number) => ({
                  key: o.key || String.fromCharCode(65 + oIdx),
                  text: o.text || String(o),
                }))
              : [
                  { key: "A", text: "" },
                  { key: "B", text: "" },
                  { key: "C", text: "" },
                  { key: "D", text: "" },
                ],
            correct_answer: q.correct_answer || q.correctAnswer || "A",
            explanation: q.explanation || "",
            rubric: q.rubric || "",
          }));
          setQuestionsList(mapped);
          setWizardStep(3);
        }
      }
    } catch (err) {
      console.error("AI question contextualization error:", err);
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Step 3 Save: Simpan Butir Soal dari Form Konten (Mendukung Multi-Soal Sekaligus)
  const handleStep3Save = () => {
    if (!activeSchool || !topic.trim()) return;

    const validQuestions = questionsList.filter((q) => q.question_text.trim());
    if (validQuestions.length === 0) return;

    const itemsToSave: QuestionItem[] = validQuestions.map((q, idx) => ({
      id: `item-${Date.now()}-${idx + 1}`,
      type: q.type,
      question_text: q.question_text.trim(),
      options:
        q.type === "multiple_choice"
          ? q.options.map((o) => ({
              key: o.key,
              text: o.text || `Pilihan ${o.key}`,
            }))
          : [],
      correct_answer: q.type === "multiple_choice" ? q.correct_answer : "",
      explanation: q.explanation.trim() || "Pembahasan butir evaluasi kontekstual.",
      rubric: q.type === "essay" ? q.rubric : undefined,
    }));

    const saved = repository.saveQuestion({
      id: patentQuestionId ? patentQuestionId : undefined,
      school_id: activeSchool.id,
      subject: subject as "Matematika" | "Bahasa Indonesia" | "IPS",
      grade,
      topic: topic.trim(),
      items: itemsToSave,
      teacher_id: currentUser?.id || "usr-teacher-01",
      is_contextualized: true,
    });

    setCreatedQuestionId(saved.id);
    setCreatedQuestionIds([saved.id]);
    loadData();
    setWizardStep(4);
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
      title: title || "Butir Soal",
      isDeleting: false,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.id) return;
    setDeleteModal((prev) => ({ ...prev, isDeleting: true }));
    try {
      await repository.deleteQuestionAsync(deleteModal.id);
      loadData();
      if (previewQuestion?.id === deleteModal.id) {
        setPreviewQuestion(null);
      }
      setDeleteModal({ isOpen: false, id: "", title: "", isDeleting: false });
    } catch (err) {
      console.error("Gagal menghapus soal:", err);
      setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const handleOpenPublishRoom = (q: Question) => {
    setQuestionToPublish(q);
    const randomCode = `sol${Math.floor(1000 + Math.random() * 9000)}`;
    setGeneratedRoomCode(randomCode);
    setRoomCreatedSuccess(false);
    setIsRoomModalOpen(true);
  };

  const handleCreateRoomForQuestion = () => {
    if (!questionToPublish || !currentUser) return;

    repository.createRoom({
      code: generatedRoomCode,
      title: `Latihan: ${questionToPublish.topic}`,
      type: "question",
      resource_id: questionToPublish.id,
      subject: questionToPublish.subject,
      grade: questionToPublish.grade,
      region_name: activeSchool?.region_name || "Kota Madiun",
      teacher_id: currentUser.id,
      teacher_name: currentUser.full_name,
    });

    setRoomCreatedSuccess(true);
    loadData();
  };

  const filteredQuestions = questions.filter((q) => {
    const qItems = getQuestionItems(q);
    const matchesSearch =
      q.question_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      qItems.some((it) => it.question_text.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType =
      filterType === "all" ||
      q.type === filterType ||
      (filterType === "multiple_choice" && qItems.some((it) => it.type === "multiple_choice")) ||
      (filterType === "essay" && qItems.some((it) => it.type === "essay")) ||
      (filterType === "mixed" &&
        (q.type === "mixed" ||
          (qItems.some((it) => it.type === "multiple_choice") &&
            qItems.some((it) => it.type === "essay"))));

    const matchesSubject = filterSubject === "Semua Mapel" || q.subject.toLowerCase() === filterSubject.toLowerCase();
    return matchesSearch && matchesType && matchesSubject;
  });

  const filteredMaterialsForOverlay = materials.filter(
    (m) =>
      m.title.toLowerCase().includes(materialFilterSearch.toLowerCase()) ||
      m.id.toLowerCase().includes(materialFilterSearch.toLowerCase()) ||
      m.subject.toLowerCase().includes(materialFilterSearch.toLowerCase())
  );

  return (
    <TeacherWorkspaceShell activeGroupId="questions">
      <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6 pb-12 font-sans">
        {previewQuestion ? (
          /* ===================================================================
              LIVE PREVIEW & EDIT SOAL (LANGSUNG DI HALAMAN KONTEN - TANPA OVERLAY)
              =================================================================== */
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Top Bar: Tombol Kembali, Identitas Bersih & Tombol Edit/Simpan */}
            {(() => {
              const previewItems = getQuestionItems(previewQuestion);
              const mcCount = previewItems.filter((i) => i.type === "multiple_choice").length;
              const essayCount = previewItems.filter((i) => i.type === "essay").length;

              return (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-[#51465B]/15">
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewQuestion(null);
                        setIsEditingPreview(false);
                        setEditableItems([]);
                      }}
                      className="px-3.5 py-1.5 rounded-full bg-white border-2 border-[#51465B]/25 text-[#51465B] hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Kembali</span>
                    </button>

                    {/* Identitas Bersih & Rapi */}
                    <div className="flex items-center gap-2 text-xs font-bold text-[#756F7A] flex-wrap">
                      <span className="font-mono text-[#51465B] font-black">{previewQuestion.id}</span>
                      <span>&bull;</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#51465B]/10 text-[#51465B] font-black">
                        {previewItems.length} Butir Soal
                      </span>
                      <span>&bull;</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold">
                        {previewQuestion.type === "mixed"
                          ? `Kombinasi (${mcCount} PG & ${essayCount} Esai)`
                          : previewQuestion.type === "essay"
                          ? "Esai"
                          : "Pilihan Ganda"}
                      </span>
                      <span>&bull;</span>
                      <span>{previewQuestion.subject}</span>
                      <span>&bull;</span>
                      <span>Kelas {previewQuestion.grade} SD</span>
                    </div>
                  </div>

                  {/* Action Buttons Top Right: Bulat */}
                  <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                    {!isEditingPreview ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setIsPrintingQuestion(true)}
                          className="px-4 py-2 rounded-full bg-white hover:bg-slate-100 text-[#51465B] border border-[#51465B]/25 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
                        >
                          <Printer className="w-3.5 h-3.5 text-[#51465B]" />
                          <span>Cetak PDF</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStartEditQuestion("multiple_choice")}
                          className="px-3.5 py-2 rounded-full bg-[#FAF7F3] hover:bg-[#F3EEFF] text-[#51465B] border border-[#51465B]/25 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
                          title="Tambah butir soal baru ke paket ini"
                        >
                          <Plus className="w-3.5 h-3.5 text-[#51465B]" />
                          <span>+ Tambah Soal</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStartEditQuestion()}
                          className="px-4 py-2 rounded-full bg-[#51465B] hover:bg-[#3E3547] text-[#FFD36D] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenPublishRoom(previewQuestion)}
                          className="px-4 py-2 rounded-full bg-[#FFD36D] hover:bg-[#FFE085] text-[#23212A] text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
                        >
                          <DoorOpen className="w-3.5 h-3.5" />
                          <span>Buat Room</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleAddItemToEdit("multiple_choice")}
                          className="px-3 py-1.5 rounded-full bg-[#FFD36D] hover:bg-[#FFE085] text-[#23212A] text-xs font-black flex items-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer"
                          title="Tambah Butir Soal Pilihan Ganda"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>+ Pilgan</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddItemToEdit("essay")}
                          className="px-3 py-1.5 rounded-full bg-[#51465B] hover:bg-[#3E3547] text-[#FFD36D] border border-[#FFD36D]/30 text-xs font-black flex items-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer"
                          title="Tambah Butir Soal Esai"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>+ Esai</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingPreview(false);
                            setEditableItems([]);
                          }}
                          className="px-3.5 py-1.5 rounded-full bg-slate-200 hover:bg-slate-300 text-[#23212A] text-xs font-bold cursor-pointer transition-colors"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveEditedQuestion}
                          className="px-4 py-1.5 rounded-full bg-[#51465B] hover:bg-[#3E3547] text-[#FFD36D] text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Simpan ({editableItems.length} Soal)</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Notification Alert if Saved */}
            {editNotification && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-xs font-bold flex items-center justify-between animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{editNotification}</span>
                </div>
                <button type="button" onClick={() => setEditNotification(null)} className="cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Content Area */}
            {!isEditingPreview ? (
              <div className="space-y-6">
                {/* Header Paket Soal & Daftar Sub-Soal */}
                {(() => {
                  const previewItems = getQuestionItems(previewQuestion);
                  const mcCount = previewItems.filter((i) => i.type === "multiple_choice").length;
                  const essayCount = previewItems.filter((i) => i.type === "essay").length;

                  return (
                    <div className="bg-white rounded-3xl border-2 border-[#51465B]/15 p-6 sm:p-8 shadow-xs space-y-6">
                      {/* Top Header Card */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#51465B]/10">
                        <div className="space-y-1">
                          <span className="text-[11px] font-black uppercase tracking-wider text-[#51465B] block">
                            Topik & Stimulus Asesmen
                          </span>
                          <h2 className="text-lg sm:text-xl font-black text-[#23212A]">
                            {previewQuestion.topic || "Paket Soal Kontekstual"}
                          </h2>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-3 py-1 rounded-full text-xs font-black bg-[#51465B] text-[#FFD36D]">
                            Total {previewItems.length} Butir Soal
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900">
                            {previewQuestion.type === "mixed"
                              ? `${mcCount} Pilihan Ganda & ${essayCount} Esai`
                              : previewQuestion.type === "essay"
                              ? `${essayCount} Butir Esai`
                              : `${mcCount} Butir Pilihan Ganda`}
                          </span>
                        </div>
                      </div>

                      {/* Stimulus Text / Pengantar jika ada */}
                      {previewQuestion.question_text &&
                        previewQuestion.question_text !== previewItems[0]?.question_text && (
                          <div className="p-4 rounded-2xl bg-[#FAF7F3] border border-[#E9E5E8] text-xs sm:text-sm font-medium text-[#23212A] leading-relaxed">
                            <span className="text-[11px] font-black uppercase text-[#51465B] block mb-1">
                              Pengantar Wacana / Stimulus Kontekstual:
                            </span>
                            {previewQuestion.question_text}
                          </div>
                        )}

                      {/* Render ALL Questions in the package sequentially */}
                      <div className="space-y-5">
                        {previewItems.map((item, idx) => (
                          <div
                            key={item.id || idx}
                            className="p-5 sm:p-6 rounded-2xl border-2 border-[#51465B]/15 bg-white shadow-2xs space-y-4"
                          >
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                              <div className="flex items-center gap-2.5">
                                <span className="w-7 h-7 rounded-full bg-[#51465B] text-[#FFD36D] text-xs font-black flex items-center justify-center shrink-0">
                                  {idx + 1}
                                </span>
                                <span className="text-xs font-black text-[#23212A]">
                                  Soal #{idx + 1}
                                </span>
                              </div>
                              <span
                                className={`text-[11px] px-3 py-1 rounded-full font-black ${
                                  item.type === "essay"
                                    ? "bg-purple-100 text-purple-900 border border-purple-200"
                                    : "bg-amber-100 text-amber-900 border border-amber-200"
                                }`}
                              >
                                {item.type === "essay" ? "Uraian / Esai" : "Pilihan Ganda"}
                              </span>
                            </div>

                            <p className="text-sm sm:text-base font-bold text-[#23212A] leading-relaxed">
                              {item.question_text}
                            </p>

                            {/* Multiple choice options */}
                            {item.type === "multiple_choice" && item.options && item.options.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                                {item.options.map((opt, optIdx) => {
                                  const optLabel = opt.key || String.fromCharCode(65 + optIdx);
                                  const isCorrect =
                                    item.correct_answer === optLabel || item.correct_answer === opt.text;
                                  return (
                                    <div
                                      key={optIdx}
                                      className={`p-3 rounded-xl border-2 text-xs flex items-center justify-between transition-all ${
                                        isCorrect
                                          ? "bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-xs"
                                          : "bg-[#FAF7F3] border-[#E9E5E8] text-[#23212A]"
                                      }`}
                                    >
                                      <span className="flex items-center gap-2">
                                        <span
                                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                                            isCorrect
                                              ? "bg-emerald-600 text-white"
                                              : "bg-[#51465B]/10 text-[#51465B]"
                                          }`}
                                        >
                                          {optLabel}
                                        </span>
                                        <span>{opt.text}</span>
                                      </span>
                                      {isCorrect && (
                                        <span className="text-[10px] bg-emerald-600 text-white font-black px-2 py-0.5 rounded-full">
                                          Kunci
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Rubric if Essay */}
                            {item.type === "essay" && item.rubric && (
                              <div className="p-3.5 rounded-xl bg-purple-50/80 border border-purple-200 text-xs text-purple-950 space-y-1">
                                <span className="font-extrabold text-purple-900 block">
                                  Pedoman Penskoran / Rubrik:
                                </span>
                                <p className="leading-relaxed font-medium">{item.rubric}</p>
                              </div>
                            )}

                            {/* Explanation */}
                            {item.explanation && (
                              <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 space-y-1">
                                <span className="font-extrabold text-amber-900 block">
                                  Pembahasan:
                                </span>
                                <p className="leading-relaxed font-medium">{item.explanation}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Aggregated Rooms using this Question */}
                {(() => {
                  const roomsUsingQ = rooms.filter(
                    (r) => r.resource_id === previewQuestion.id || r.secondary_resource_id === previewQuestion.id
                  );
                  const totalAccesses = roomsUsingQ.reduce(
                    (sum, r) => sum + (r.visitors?.length || r.access_count || 0),
                    0
                  );

                  return (
                    <div className="bg-white rounded-3xl border-2 border-[#51465B]/15 p-6 sm:p-7 shadow-xs space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                        <div>
                          <h3 className="text-sm font-black text-[#23212A] uppercase tracking-wider flex items-center gap-1.5">
                            <DoorOpen className="w-4 h-4 text-[#51465B]" />
                            Room yang Menggunakan Soal Ini
                          </h3>
                          <p className="text-xs text-[#756F7A]">
                            Satu paket soal dapat digunakan di banyak room kelas sekaligus untuk asesmen terstandar.
                          </p>
                        </div>
                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <span className="px-3 py-1 rounded-full bg-purple-50 text-[#51465B] font-extrabold text-xs border border-purple-200">
                            {roomsUsingQ.length} Room
                          </span>
                          <span className="px-3 py-1 rounded-full bg-[#FFD36D]/30 text-[#8C6D23] font-extrabold text-xs border border-[#FFD36D]/40">
                            {totalAccesses} Total Akses Siswa
                          </span>
                        </div>
                      </div>

                      {roomsUsingQ.length === 0 ? (
                        <div className="py-6 text-center text-xs text-slate-400">
                          Belum ada room kelas yang menggunakan soal ini. Klik &ldquo;Buat Room&rdquo; di atas untuk mulai membagikan.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {roomsUsingQ.map((r) => (
                            <div
                              key={r.id}
                              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-[#51465B] transition-all space-y-2"
                            >
                              <span className="font-bold text-xs text-[#23212A] block truncate">{r.title}</span>
                              <div className="flex items-center justify-between text-[11px] text-slate-500">
                                <span className="font-mono font-bold text-[#51465B] bg-white px-2 py-0.5 rounded-md border border-slate-200">
                                  {r.code}
                                </span>
                                <span className="font-semibold text-slate-700">
                                  {r.visitors?.length || r.access_count || 0} Akses
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Banner Tambah Butir Soal Baru ke Paket Ini */}
                <div className="p-5 rounded-3xl bg-gradient-to-r from-[#FAF7F3] to-[#F3EEFF] border-2 border-[#51465B]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                  <div>
                    <h3 className="text-sm font-black text-[#23212A] flex items-center gap-2">
                      <Plus className="w-4 h-4 text-[#51465B]" />
                      Ingin Menambahkan Butir Soal Baru ke Paket Ini?
                    </h3>
                    <p className="text-xs text-[#756F7A] mt-0.5">
                      Tambahkan variasi soal pilihan ganda atau esai baru dalam satu paket soal &ldquo;{previewQuestion.topic}&rdquo; dengan mudah.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStartEditQuestion("multiple_choice")}
                      className="px-4 py-2 rounded-full bg-[#FFD36D] hover:bg-[#FFE085] text-[#23212A] text-xs font-black flex items-center gap-1.5 shadow-xs hover:shadow transition-all cursor-pointer active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>+ Pilihan Ganda</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStartEditQuestion("essay")}
                      className="px-4 py-2 rounded-full bg-[#51465B] hover:bg-[#3E3547] text-[#FFD36D] text-xs font-black flex items-center gap-1.5 shadow-xs hover:shadow transition-all cursor-pointer active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>+ Esai</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Live Edit Mode */
              <div className="bg-white rounded-3xl border-2 border-[#51465B]/20 p-6 sm:p-8 shadow-sm space-y-6">
                {/* Header Edit Mode */}
                <div className="border-b border-[#51465B]/15 pb-4">
                  <h3 className="text-base sm:text-lg font-black text-[#23212A] flex items-center gap-2">
                    <Pencil className="w-4 h-4 text-[#51465B]" />
                    Edit Paket Soal #{previewQuestion.id} ({editableItems.length} Butir Soal)
                  </h3>
                  <p className="text-xs text-[#756F7A] mt-0.5">
                    Kelola seluruh butir pertanyaan, pilihan ganda, dan esai dalam paket soal ini.
                  </p>
                </div>

                {/* Metadata Paket: Mapel, Kelas, Topik */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#51465B] mb-1">Mata Pelajaran</label>
                    <select
                      value={editSubject}
                      onChange={(e) => setEditSubject(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-2xl border-2 border-[#51465B]/25 text-xs font-bold text-[#23212A] focus:border-[#51465B] focus:outline-none"
                    >
                      {SUBJECT_OPTIONS.filter((s) => s !== "Semua Mapel").map((subj) => (
                        <option key={subj} value={subj}>{subj}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#51465B] mb-1">Kelas SD</label>
                    <select
                      value={editGrade}
                      onChange={(e) => setEditGrade(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-2xl border-2 border-[#51465B]/25 text-xs font-bold text-[#23212A] focus:border-[#51465B] focus:outline-none"
                    >
                      {[1, 2, 3, 4, 5, 6].map((g) => (
                        <option key={g} value={g}>Kelas {g} SD</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#51465B] mb-1">Topik Paket Soal</label>
                    <input
                      type="text"
                      value={editTopic}
                      onChange={(e) => setEditTopic(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-2xl border-2 border-[#51465B]/25 text-xs font-bold text-[#23212A] focus:border-[#51465B] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Daftar Semua Butir Soal yang Sedang Diedit */}
                <div className="space-y-5 pt-2">
                  {editableItems.map((it, idx) => (
                    <div
                      key={it.id || idx}
                      className="p-5 rounded-2xl bg-[#FAF7F3]/70 border-2 border-[#51465B]/20 shadow-xs space-y-4"
                    >
                      {/* Baris Header Item: Nomor, Switcher Tipe, Tombol Hapus */}
                      <div className="flex items-center justify-between pb-3 border-b border-[#51465B]/10 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-full bg-[#51465B] text-white text-xs font-black flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-black text-[#23212A]">
                            Butir Soal #{idx + 1}
                          </span>
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-white text-[#51465B] border border-[#51465B]/20">
                            {it.type === "multiple_choice" ? "Pilihan Ganda" : "Esai"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Switcher Tipe Soal */}
                          <div className="inline-flex rounded-full bg-white p-0.5 border border-[#51465B]/20">
                            <button
                              type="button"
                              onClick={() => handleUpdateItemInEdit(idx, "type", "multiple_choice")}
                              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                it.type === "multiple_choice"
                                  ? "bg-[#51465B] text-white shadow-xs"
                                  : "text-[#756F7A] hover:text-[#51465B]"
                              }`}
                            >
                              Pilgan
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateItemInEdit(idx, "type", "essay")}
                              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                it.type === "essay"
                                  ? "bg-[#51465B] text-white shadow-xs"
                                  : "text-[#756F7A] hover:text-[#51465B]"
                              }`}
                            >
                              Esai
                            </button>
                          </div>

                          {/* Tombol Hapus Butir Soal */}
                          <button
                            type="button"
                            disabled={editableItems.length <= 1}
                            onClick={() => handleRemoveItemFromEdit(idx)}
                            className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Hapus butir soal ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Teks Pertanyaan Butir Soal */}
                      <div>
                        <label className="block text-xs font-bold text-[#51465B] mb-1">
                          Pertanyaan Soal #{idx + 1}
                        </label>
                        <textarea
                          rows={3}
                          value={it.question_text}
                          onChange={(e) => handleUpdateItemInEdit(idx, "question_text", e.target.value)}
                          placeholder="Tuliskan butir pertanyaan atau stimulus soal di sini..."
                          className="w-full p-3.5 rounded-2xl border-2 border-[#51465B]/20 bg-white text-xs text-[#23212A] font-medium leading-relaxed focus:border-[#51465B] focus:outline-none"
                        />
                      </div>

                      {/* Pilihan Ganda / Rubrik Esai */}
                      {it.type === "multiple_choice" ? (
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-[#51465B]">
                            Pilihan & Kunci Jawaban
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {it.options.map((opt) => (
                              <div
                                key={opt.key}
                                onClick={() => handleUpdateItemInEdit(idx, "correct_answer", opt.key)}
                                className={`p-2.5 rounded-xl border-2 flex items-center gap-2 transition-all cursor-pointer ${
                                  it.correct_answer === opt.key
                                    ? "border-emerald-500 bg-emerald-50/50"
                                    : "border-[#51465B]/20 bg-white"
                                }`}
                              >
                                <span
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                                    it.correct_answer === opt.key
                                      ? "bg-emerald-500 text-white"
                                      : "bg-[#51465B]/10 text-[#51465B]"
                                  }`}
                                >
                                  {opt.key}
                                </span>
                                <input
                                  type="text"
                                  value={opt.text}
                                  onChange={(e) => handleUpdateItemOptionInEdit(idx, opt.key, e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  placeholder={`Pilihan ${opt.key}...`}
                                  className="w-full text-xs font-semibold text-[#23212A] bg-transparent focus:outline-none"
                                />
                                <input
                                  type="radio"
                                  name={`correctAnswerEdit_${it.id}_${idx}`}
                                  checked={it.correct_answer === opt.key}
                                  onChange={() => handleUpdateItemInEdit(idx, "correct_answer", opt.key)}
                                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 shrink-0 cursor-pointer"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-xs font-bold text-[#51465B] mb-1">
                            Rubrik Penilaian Esai
                          </label>
                          <textarea
                            rows={2}
                            value={it.rubric || ""}
                            onChange={(e) => handleUpdateItemInEdit(idx, "rubric", e.target.value)}
                            placeholder="Contoh: Skor 100 jika menjawab runtut dan lengkap, Skor 50 jika sebagian..."
                            className="w-full p-3 rounded-2xl border-2 border-[#51465B]/20 bg-white text-xs text-[#23212A] font-medium leading-relaxed focus:border-[#51465B] focus:outline-none"
                          />
                        </div>
                      )}

                      {/* Penjelasan / Pembahasan */}
                      <div>
                        <label className="block text-xs font-bold text-[#51465B] mb-1">
                          Penjelasan / Pembahasan (Opsional)
                        </label>
                        <textarea
                          rows={2}
                          value={it.explanation || ""}
                          onChange={(e) => handleUpdateItemInEdit(idx, "explanation", e.target.value)}
                          placeholder="Penjelasan ringkas konsep materi untuk pembahasan guru/siswa..."
                          className="w-full p-3 rounded-2xl border-2 border-[#51465B]/20 bg-white text-xs text-[#23212A] font-medium leading-relaxed focus:border-[#51465B] focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tombol Tambah Butir Soal Baru ke Paket Ini */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F3] border-2 border-dashed border-[#51465B]/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-[#23212A] flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-[#51465B]" />
                      Tambah Butir Soal Baru ke Paket Ini
                    </h4>
                    <p className="text-[11px] text-[#756F7A] mt-0.5">
                      Tambahkan pertanyaan baru (pilihan ganda atau esai) ke dalam paket soal ini.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleAddItemToEdit("multiple_choice")}
                      className="px-4 py-2 rounded-xl bg-[#FFD36D] hover:bg-[#FFE085] text-[#23212A] text-xs font-black flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>+ Pilihan Ganda</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddItemToEdit("essay")}
                      className="px-4 py-2 rounded-xl bg-[#51465B] hover:bg-[#3E3547] text-[#FFD36D] text-xs font-black flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>+ Esai</span>
                    </button>
                  </div>
                </div>

                {/* Action Bar Bawah untuk Simpan */}
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
                  <div className="text-xs font-bold text-[#756F7A]">
                    {editableItems.length} butir soal dirancang dalam paket ini
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingPreview(false);
                        setEditableItems([]);
                      }}
                      className="px-4 py-2 rounded-full bg-slate-200 hover:bg-slate-300 text-[#23212A] text-xs font-bold cursor-pointer transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEditedQuestion}
                      className="px-5 py-2.5 rounded-full bg-[#51465B] hover:bg-[#3E3547] text-[#FFD36D] text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Simpan Semua ({editableItems.length} Soal)</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Normal List View */
          <>
            {/* ===================================================================
                1. HEADER: BUTTON TAMBAH DI SEBELAH KIRI JUDUL & DESKRIPSI
                =================================================================== */}
            <div className="flex flex-col sm:flex-row sm:items-center items-start gap-4 sm:gap-5">
              <button
                type="button"
                onClick={() => handleOpenWizard()}
                className="px-4 py-2.5 rounded-full bg-[#FFD36D] hover:bg-[#F5C754] text-[#51465B] border border-[#E5BE60] text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all cursor-pointer flex items-center gap-2 active:scale-95 shrink-0"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Tambah Soal</span>
              </button>

              <div>
                <h1 className="text-xl sm:text-2xl font-black text-[#23212A] tracking-tight">
                  Bank Soal Kontekstual
                </h1>
                <p className="text-xs sm:text-sm text-[#756F7A] mt-0.5">
                  Katalog butir asesmen pilihan ganda dan esai Kurikulum Merdeka yang diselaraskan dengan kearifan lokal {activeSchool?.region_name || "wilayah"}.
                </p>
              </div>
            </div>

            {/* ===================================================================
                2. SEARCH BAR & FILTER: LANGSUNG TANPA DIBUNGKUS CARD
                =================================================================== */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#51465B]" />
                <input
                  type="text"
                  placeholder="Cari butir soal, topik, atau ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-full bg-white border-2 border-[#51465B]/25 text-xs font-semibold text-[#23212A] placeholder:text-[#756F7A] focus:outline-none focus:border-[#51465B] shadow-xs transition-colors"
                />
              </div>

              {/* Mobile Filter: Sebaris & full sejajar search (Dua dropdown berdampingan 50%-50%) */}
              <div className="w-full flex sm:hidden items-center gap-2 flex-nowrap">
                <div className="flex-1 min-w-0">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-full bg-white border-2 border-[#51465B]/25 text-xs font-bold text-[#51465B] focus:outline-none focus:border-[#51465B] cursor-pointer shadow-xs transition-colors truncate"
                  >
                    <option value="all">Semua Tipe</option>
                    <option value="multiple_choice">Pilihan Ganda</option>
                    <option value="essay">Esai</option>
                    <option value="mixed">Kombinasi (PG & Esai)</option>
                  </select>
                </div>
                <div className="flex-1 min-w-0">
                  <select
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-full bg-white border-2 border-[#51465B]/25 text-xs font-bold text-[#51465B] focus:outline-none focus:border-[#51465B] cursor-pointer shadow-xs transition-colors truncate"
                  >
                    {SUBJECT_OPTIONS.map((subj) => (
                      <option key={subj} value={subj}>
                        {subj}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Desktop / Tablet Filter Pills & Dropdown: Rata Kanan, Ukuran Sesuai Isi */}
              <div className="hidden sm:flex items-center justify-end gap-1.5 ml-auto shrink-0 flex-nowrap">
                <button
                  type="button"
                  onClick={() => setFilterType("all")}
                  className={`w-auto px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    filterType === "all"
                      ? "bg-[#51465B] text-[#FFD36D] shadow-sm border border-[#51465B]"
                      : "bg-white text-[#51465B] hover:bg-[#51465B]/10 border-2 border-[#51465B]/25 shadow-xs"
                  }`}
                >
                  Semua
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType("multiple_choice")}
                  className={`w-auto px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    filterType === "multiple_choice"
                      ? "bg-[#51465B] text-[#FFD36D] shadow-sm border border-[#51465B]"
                      : "bg-white text-[#51465B] hover:bg-[#51465B]/10 border-2 border-[#51465B]/25 shadow-xs"
                  }`}
                >
                  Pilihan Ganda
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType("essay")}
                  className={`w-auto px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    filterType === "essay"
                      ? "bg-[#51465B] text-[#FFD36D] shadow-sm border border-[#51465B]"
                      : "bg-white text-[#51465B] hover:bg-[#51465B]/10 border-2 border-[#51465B]/25 shadow-xs"
                  }`}
                >
                  Esai
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType("mixed")}
                  className={`w-auto px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    filterType === "mixed"
                      ? "bg-[#51465B] text-[#FFD36D] shadow-sm border border-[#51465B]"
                      : "bg-white text-[#51465B] hover:bg-[#51465B]/10 border-2 border-[#51465B]/25 shadow-xs"
                  }`}
                >
                  Kombinasi
                </button>

                <select
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="w-auto px-3.5 py-1.5 rounded-full bg-white border-2 border-[#51465B]/25 text-xs font-bold text-[#51465B] focus:outline-none focus:border-[#51465B] cursor-pointer shadow-xs transition-colors"
                >
                  {SUBJECT_OPTIONS.map((subj) => (
                    <option key={subj} value={subj}>
                      {subj}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ===================================================================
                3. DAFTAR SOAL: CARD BERSIH TANPA IKON/KATEGORI/DESKRIPSI, ID JELAS, BUTTON BULAT
                =================================================================== */}
            <div>
              {filteredQuestions.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border-2 border-[#51465B]/20 space-y-3 shadow-xs">
                  <div className="w-14 h-14 rounded-2xl bg-[#FFD36D]/20 text-[#51465B] mx-auto flex items-center justify-center">
                    <FileQuestion className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-black text-[#23212A]">Belum ada butir soal</h3>
                  <p className="text-xs text-[#756F7A] max-w-sm mx-auto font-medium">
                    Mulai buat butir soal baru menggunakan tombol Tambah Soal di atas.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {filteredQuestions.map((q) => {
                    const items = getQuestionItems(q);
                    const mcCount = items.filter((it) => it.type === "multiple_choice").length;
                    const essayCount = items.filter((it) => it.type === "essay").length;

                    return (
                      <div
                        key={q.id}
                        className="relative p-5 rounded-[26px] bg-[#FFD36D] text-[#23212A] border-2 border-[#51465B] shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group overflow-hidden min-h-[160px]"
                      >
                        {/* Ambient Glow */}
                        <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-white/40 blur-xl pointer-events-none" />

                        {/* Top: Judul di kiri, ID di kanan tanpa kapsul */}
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="text-sm sm:text-base font-black text-[#23212A] leading-snug line-clamp-2">
                              {q.topic || q.question_text}
                            </h3>
                            <span className="shrink-0 font-mono text-[11px] font-bold text-[#51465B] tracking-wider pt-0.5">
                              {q.id}
                            </span>
                          </div>

                          {/* Item count & Composition Badges */}
                          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
                            <span className="px-2.5 py-0.5 rounded-full bg-[#51465B]/15 text-[#3D3445] border border-[#51465B]/20">
                              {items.length} Butir Soal
                            </span>

                            {mcCount > 0 && essayCount > 0 ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-purple-900/15 text-purple-900 border border-purple-900/20">
                                {mcCount} PG &amp; {essayCount} Esai
                              </span>
                            ) : mcCount > 0 ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-indigo-900/15 text-indigo-900 border border-indigo-900/20">
                                Pilihan Ganda
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-950/15 text-amber-950 border border-amber-950/20">
                                Esai
                              </span>
                            )}

                            {q.subject && (
                              <span className="px-2 py-0.5 rounded-full bg-white/60 text-[#23212A] border border-[#51465B]/15">
                                {q.subject}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Bottom: Button Bulat */}
                        <div className="pt-4 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewQuestion(q);
                              setIsEditingPreview(false);
                            }}
                            className="flex-1 py-2.5 px-5 rounded-full bg-[#51465B] hover:bg-[#3D3445] text-white text-xs font-black flex items-center justify-center shadow-xs hover:shadow transition-all cursor-pointer active:scale-95 whitespace-nowrap"
                          >
                            <span>Lihat Soal</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenDeleteModal(q.id, q.topic || q.question_text.slice(0, 60))}
                            className="w-9 h-9 rounded-full bg-black/10 hover:bg-rose-500/25 text-[#23212A]/70 hover:text-rose-700 border border-[#51465B]/20 flex items-center justify-center transition-all cursor-pointer shrink-0"
                            title="Hapus Soal"
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
          OVERLAY KHUSUS: TAMBAH SOAL DARI MATERI
          ===================================================================== */}
      {isFromMaterialOverlayOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-gradient-to-b from-[#3E3547] via-[#332A3B] to-[#251E2B] rounded-[32px] sm:rounded-[36px] border border-[#5A4F65] shadow-2xl p-6 sm:p-8 relative my-auto max-h-[90vh] flex flex-col text-white">
            {/* Header Overlay */}
            <div className="flex items-center justify-between pb-4 border-b border-white/15">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 text-[#FFD36D] flex items-center justify-center shadow-xs">
                  <Link2 className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                    Tambah Soal dari Materi
                  </h3>
                  <p className="text-xs text-gray-300">
                    Pilih materi yang tersedia untuk diubah menjadi butir soal
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsFromMaterialOverlayOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Masukkan Kode Materi */}
            <div className="py-4 space-y-4">
              <form onSubmit={handleSubmitMaterialCodeFromOverlay} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ketik kode materi (contoh: mat-xxxx)..."
                  value={inputMaterialCode}
                  onChange={(e) => setInputMaterialCode(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-2xl border-2 border-white/20 bg-[#251E2B]/80 text-xs sm:text-sm font-bold text-white placeholder:text-gray-400 focus:outline-none focus:border-[#FFD36D]"
                />
                <button
                  type="submit"
                  disabled={!inputMaterialCode.trim()}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#FFD36D] to-[#FDB040] text-[#251E2B] font-extrabold text-xs shadow-md disabled:opacity-40 cursor-pointer"
                >
                  Pilih
                </button>
              </form>

              {/* Divider ATAU */}
              <div className="flex items-center gap-3 py-1">
                <div className="h-px bg-white/15 flex-1" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Atau Pilih Materi di Bawah
                </span>
                <div className="h-px bg-white/15 flex-1" />
              </div>

              {/* Search Inside Overlay */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari materi dari daftar..."
                  value={materialFilterSearch}
                  onChange={(e) => setMaterialFilterSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-2xl border-2 border-white/15 bg-[#251E2B]/60 text-xs font-medium text-white placeholder:text-gray-400 focus:outline-none focus:border-[#FFD36D]"
                />
              </div>

              {/* Daftar Materi yang Muncul di Overlay */}
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {filteredMaterialsForOverlay.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-400">
                    Tidak ada materi yang sesuai.
                  </div>
                ) : (
                  filteredMaterialsForOverlay.map((mat) => (
                    <div
                      key={mat.id}
                      onClick={() => handleSelectMaterialFromOverlay(mat)}
                      className="p-3.5 rounded-2xl border border-white/15 hover:border-[#FFD36D] bg-[#251E2B]/80 hover:bg-[#251E2B] transition-all cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-gray-400 bg-white/10 px-2 py-0.5 rounded-md">
                            {mat.id}
                          </span>
                          <span className="text-[10px] font-bold text-[#FFD36D]">
                            {mat.subject} &bull; Kelas {mat.grade} SD
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#FFD36D] truncate">
                          {mat.title}
                        </h4>
                      </div>

                      <button
                        type="button"
                        className="px-3.5 py-1.5 rounded-xl bg-white/10 group-hover:bg-[#FFD36D] text-white group-hover:text-[#251E2B] text-xs font-bold transition-all shrink-0 cursor-pointer"
                      >
                        Pilih
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Footer Overlay */}
            <div className="pt-3 border-t border-white/15 flex justify-end">
              <button
                type="button"
                onClick={() => setIsFromMaterialOverlayOpen(false)}
                className="py-2 px-5 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/20 cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          CREATION WIZARD MODAL (LOGIN & ROOM ENTRY INSPIRED CLEAN STEP FORM)
          Step 1: Pilih Metode (Ketik Manual, Motret, Upload, AI, Dari Materi)
          Step 2: Lengkapi Data (Judul, Mapel, Kelas, Bentuk Soal, Konten/Opsi)
          Step 3: Review / Kunci Jawaban & Rubrik
          Step 4: Berhasil / Selesai
          ===================================================================== */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div
            className={`w-full ${
              wizardStep === 3 ? "max-w-4xl lg:max-w-5xl" : "max-w-[560px]"
            } bg-gradient-to-b from-[#3E3547] via-[#332A3B] to-[#251E2B] rounded-[32px] sm:rounded-[36px] border border-[#5A4F65] shadow-2xl p-6 sm:p-8 relative my-auto max-h-[92vh] overflow-y-auto text-white flex flex-col text-left transition-all duration-300`}
          >
            {/* ===================================================================
                MODAL HEADER: JUDUL DI KIRI ATAS, PROGRES STEP DI BAWAHNYA, X DI KANAN ATAS
                =================================================================== */}
            <div className="w-full flex items-start justify-between pb-4 border-b border-white/10 mb-5">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  {wizardStep === 4 ? "Soal Tersimpan" : "Tambah Soal"}
                </h3>
                {/* Progress Step langsung di bawah judul (tanpa teks deskripsi 'Langkah 1...') */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1.5">
                    <div className={`h-1.5 rounded-full transition-all duration-300 ${wizardStep === 1 ? "w-6 bg-[#FFD36D]" : "w-2 bg-[#FFD36D]/60"}`} />
                    <div className={`h-1.5 rounded-full transition-all duration-300 ${wizardStep === 2 ? "w-6 bg-[#FFD36D]" : wizardStep > 2 ? "w-2 bg-[#FFD36D]/60" : "w-2 bg-white/20"}`} />
                    <div className={`h-1.5 rounded-full transition-all duration-300 ${wizardStep === 3 ? "w-6 bg-[#FFD36D]" : wizardStep > 3 ? "w-2 bg-[#FFD36D]/60" : "w-2 bg-white/20"}`} />
                    <div className={`h-1.5 rounded-full transition-all duration-300 ${wizardStep === 4 ? "w-6 bg-[#FFD36D]" : "w-2 bg-white/20"}`} />
                  </div>
                  <span className="text-[11px] font-bold text-[#FFD36D]">
                    {wizardStep === 1 ? "Metode Input" : wizardStep === 2 ? "Identitas" : wizardStep === 3 ? "Konten Soal" : "Selesai"}
                  </span>
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
                STEP 1: PILIH METODE (CARD HORIZONTAL DISUSUN VERTIKAL, GENERATE AI PALING ATAS)
                =================================================================== */}
            {wizardStep === 1 && (
              <div className="w-full space-y-2.5 sm:space-y-3 animate-in fade-in zoom-in-95 duration-200 pt-1">
                {/* Card Horizontal 1: Generate AI (Paling Atas) */}
                <button
                  type="button"
                  onClick={() => handleSelectMethod("ai")}
                  className="w-full p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#FFD36D]/20 via-[#FFD36D]/10 to-transparent hover:from-[#FFD36D]/25 hover:via-[#FFD36D]/15 hover:to-white/5 border border-[#FFD36D]/40 hover:border-[#FFD36D] flex items-center justify-between gap-3.5 transition-all cursor-pointer group active:scale-[0.99] text-left shadow-xs"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#FFD36D] text-[#251E2B] flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-xs">
                      <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm sm:text-base text-[#FFD36D] group-hover:text-white transition-colors">
                          Generate AI
                        </span>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#FFD36D]/25 text-[#FFD36D] border border-[#FFD36D]/30 shrink-0">
                          Rekomendasi
                        </span>
                      </div>
                      <p className="text-xs text-gray-300 line-clamp-1 mt-0.5">
                        Susun butir soal kontekstual otomatis dengan kecerdasan buatan Gemini
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[#FFD36D] shrink-0 group-hover:translate-x-1 transition-transform ml-2" />
                </button>

                {/* Card Horizontal 2: Ketik Manual */}
                <button
                  type="button"
                  onClick={() => handleSelectMethod("manual")}
                  className="w-full p-3.5 sm:p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 hover:border-[#FFD36D] flex items-center justify-between gap-3.5 transition-all cursor-pointer group active:scale-[0.99] text-left"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/10 group-hover:bg-[#FFD36D] text-[#FFD36D] group-hover:text-[#251E2B] flex items-center justify-center shrink-0 transition-all shadow-xs">
                      <PenTool className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-sm sm:text-base text-white group-hover:text-[#FFD36D] transition-colors block">
                        Ketik Manual
                      </span>
                      <p className="text-xs text-gray-300 line-clamp-1 mt-0.5">
                        Tulis butir soal pilihan ganda atau esai secara langsung
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#FFD36D] shrink-0 group-hover:translate-x-1 transition-transform ml-2" />
                </button>

                {/* Card Horizontal 3: Ambil Foto */}
                <button
                  type="button"
                  onClick={() => handleSelectMethod("camera")}
                  className="w-full p-3.5 sm:p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 hover:border-[#FFD36D] flex items-center justify-between gap-3.5 transition-all cursor-pointer group active:scale-[0.99] text-left"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/10 group-hover:bg-[#FFD36D] text-[#FFD36D] group-hover:text-[#251E2B] flex items-center justify-center shrink-0 transition-all shadow-xs">
                      <Camera className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-sm sm:text-base text-white group-hover:text-[#FFD36D] transition-colors block">
                        Ambil Foto
                      </span>
                      <p className="text-xs text-gray-300 line-clamp-1 mt-0.5">
                        Foto lembar kerja siswa atau naskah soal fisik untuk diekstraksi
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#FFD36D] shrink-0 group-hover:translate-x-1 transition-transform ml-2" />
                </button>

                {/* Card Horizontal 4: Upload PDF */}
                <button
                  type="button"
                  onClick={() => handleSelectMethod("pdf")}
                  className="w-full p-3.5 sm:p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 hover:border-[#FFD36D] flex items-center justify-between gap-3.5 transition-all cursor-pointer group active:scale-[0.99] text-left"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/10 group-hover:bg-[#FFD36D] text-[#FFD36D] group-hover:text-[#251E2B] flex items-center justify-center shrink-0 transition-all shadow-xs">
                      <Upload className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-sm sm:text-base text-white group-hover:text-[#FFD36D] transition-colors block">
                        Upload PDF
                      </span>
                      <p className="text-xs text-gray-300 line-clamp-1 mt-0.5">
                        Unggah naskah dokumen soal PDF untuk diekstraksi butirnya
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#FFD36D] shrink-0 group-hover:translate-x-1 transition-transform ml-2" />
                </button>

                {/* Card Horizontal 5: Dari Materi */}
                <button
                  type="button"
                  onClick={() => handleSelectMethod("from_material")}
                  className="w-full p-3.5 sm:p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 hover:border-[#FFD36D] flex items-center justify-between gap-3.5 transition-all cursor-pointer group active:scale-[0.99] text-left"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/10 group-hover:bg-[#FFD36D] text-[#FFD36D] group-hover:text-[#251E2B] flex items-center justify-center shrink-0 transition-all shadow-xs">
                      <Link2 className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-sm sm:text-base text-white group-hover:text-[#FFD36D] transition-colors block">
                        Dari Materi
                      </span>
                      <p className="text-xs text-gray-300 line-clamp-1 mt-0.5">
                        Buat soal turunan dari modul materi yang sudah ada
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#FFD36D] shrink-0 group-hover:translate-x-1 transition-transform ml-2" />
                </button>
              </div>
            )}

            {/* ===================================================================
                STEP 2: IDENTITAS SOAL
                =================================================================== */}
            {wizardStep === 2 && (
              <form onSubmit={handleStep2Submit} className="w-full space-y-4 animate-in fade-in zoom-in-95 duration-200">
                {/* ID Soal: Kiri 'ID Soal', Kanan ID-nya (Tanpa strip, 4 angka) */}
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-200">ID Soal</span>
                  <span className="font-mono text-xs font-black text-[#FFD36D] bg-[#251E2B] px-3.5 py-1.5 rounded-xl border border-[#FFD36D]/30 select-none">
                    {patentQuestionId}
                  </span>
                </div>

                {/* AI Prompt Area jika metode Generate AI */}
                {selectedMethod === "ai" && (
                  <div>
                    <label className="block text-xs font-bold text-[#FFD36D] mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Apa yang ingin dibuat?</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={aiPrompt}
                      onChange={(e) => {
                        setAiPrompt(e.target.value);
                        if (!topic) setTopic(e.target.value.slice(0, 45));
                      }}
                      placeholder="Contoh: Buat 3 soal pilihan ganda operasi hitung belanja di Pasar Legi Ponorogo untuk kelas 5 SD..."
                      className="w-full px-4 py-3 rounded-2xl border-2 border-white/20 bg-[#251E2B]/80 focus:border-[#FFD36D] text-xs sm:text-sm font-medium text-white placeholder:text-white/30 focus:outline-none transition-all shadow-inner leading-relaxed"
                    />
                  </div>
                )}

                {/* Topik Soal: Kosong default, placeholder transparan tanpa 'Contoh' */}
                <div>
                  <label className="block text-xs font-bold text-gray-200 mb-1">
                    Topik Soal
                  </label>
                  <input
                    type="text"
                    required
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Operasi Hitung Belanja Pasar Tradisional"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-white/20 bg-[#251E2B]/80 focus:border-[#FFD36D] text-xs sm:text-sm font-bold text-white placeholder:text-white/30 focus:outline-none transition-all shadow-inner"
                  />
                </div>

                {/* Mapel & Kelas: Proporsi rapi, nama maksimal 2 kata */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-200 mb-1">
                      Mata Pelajaran
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-white/20 bg-[#251E2B] focus:border-[#FFD36D] text-xs font-bold text-white focus:outline-none"
                    >
                      <option value="Matematika">Matematika</option>
                      <option value="IPAS (Ilmu Pengetahuan Alam & Sosial)">IPAS</option>
                      <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                      <option value="Pendidikan Pancasila">Pendidikan Pancasila</option>
                      <option value="Seni Budaya & Prakarya">Seni Budaya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-200 mb-1">
                      Kelas
                    </label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-white/20 bg-[#251E2B] focus:border-[#FFD36D] text-xs font-bold text-white focus:outline-none"
                    >
                      {[1, 2, 3, 4, 5, 6].map((g) => (
                        <option key={g} value={g}>
                          Kelas {g} SD
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Footer Navigasi Identitas: Button 'Generate' jika AI, 'Lanjut' jika method lain */}
                <div className="pt-3 flex items-center justify-between border-t border-white/10 gap-3">
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    className="py-2.5 px-5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
                  >
                    Kembali
                  </button>
                  <button
                    type="submit"
                    disabled={isAiGenerating || (selectedMethod === "ai" ? !aiPrompt.trim() && !topic.trim() : !topic.trim())}
                    className="py-2.5 px-6 rounded-2xl bg-[#FFD36D] hover:bg-[#F5C754] text-[#251E2B] font-extrabold text-xs shadow-md transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
                  >
                    {isAiGenerating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Merumuskan AI...</span>
                      </>
                    ) : selectedMethod === "ai" ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Generate</span>
                      </>
                    ) : (
                      <>
                        <span>Lanjut</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* ===================================================================
                STEP 3: FORM INPUT KONTEN SOAL (TINJAU & EDIT LANGSUNG)
                Mendukung input banyak butir soal, pilih Pilgan / Esai per butir,
                dan tombol tambah soal nomor berikutnya di bawah form soal.
                =================================================================== */}
            {wizardStep === 3 && (
              <div className="w-full space-y-5 animate-in fade-in zoom-in-95 duration-200">
                {/* Hidden File Inputs */}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setCapturedPhotoName(f.name);
                      handleExtractFromFile(f);
                    }
                  }}
                />
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setUploadedFileName(f.name);
                      handleExtractFromFile(f);
                    }
                  }}
                />

                {/* Pemilihan Modul Rujukan jika dari materi */}
                {selectedMethod === "from_material" && (
                  <div>
                    <label className="block text-xs font-bold text-gray-200 mb-1">
                      Modul Rujukan
                    </label>
                    <select
                      value={topic}
                      onChange={(e) => {
                        const selectedMat = materials.find((m) => m.title === e.target.value);
                        if (selectedMat) {
                          setTopic(selectedMat.title);
                          setSubject(selectedMat.subject);
                          setGrade(selectedMat.grade);
                        }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-white/20 bg-[#251E2B] focus:border-[#FFD36D] text-xs font-bold text-white focus:outline-none"
                    >
                      {materials.map((m) => (
                        <option key={m.id} value={m.title}>
                          [{m.id}] {m.title} ({m.subject})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Motret Naskah: Scan Camera & Editor */}
                {selectedMethod === "camera" && (
                  <div className="space-y-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="p-4 border-2 border-dashed border-white/25 rounded-2xl text-center space-y-3 bg-[#251E2B]/50">
                      <Camera className="w-8 h-8 text-[#FFD36D] mx-auto" />
                      <p className="text-xs font-bold text-gray-200">
                        {capturedPhotoName ? `Foto terlampir: ${capturedPhotoName}` : "Foto lembar naskah soal fisik untuk diekstraksi OCR"}
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsCameraModalOpen(true)}
                          disabled={isExtractingText}
                          className="px-4 py-2.5 rounded-xl bg-[#51465B] hover:bg-[#3D3445] text-[#FFD36D] text-xs font-extrabold transition-all cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50 shadow-xs"
                        >
                          {isExtractingText ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FFD36D]" /> : <Camera className="w-3.5 h-3.5 text-[#FFD36D]" />}
                          <span>Buka Kamera (Laptop/HP)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => cameraInputRef.current?.click()}
                          disabled={isExtractingText}
                          className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <Upload className="w-3.5 h-3.5 text-[#FFD36D]" />
                          <span>Pilih dari Berkas</span>
                        </button>
                      </div>
                    </div>

                    {extractionError && (
                      <div className="p-3 rounded-xl bg-rose-900/60 border border-rose-500/50 text-rose-200 text-xs font-semibold">
                        {extractionError}
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                          HASIL EKSTRAKSI TEKS (DAPAT DIEDIT GURU)
                        </label>
                        <span className="text-[11px] text-gray-400 font-mono">
                          {manualQuestionDraft.length} karakter
                        </span>
                      </div>
                      <textarea
                        rows={6}
                        value={manualQuestionDraft}
                        onChange={(e) => setManualQuestionDraft(e.target.value)}
                        placeholder="Teks hasil OCR soal akan muncul di sini. Koreksi naskah jika terdapat saltik..."
                        className="w-full p-4 rounded-2xl border-2 border-white/20 bg-[#251E2B]/90 focus:border-[#FFD36D] text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none transition-all shadow-inner leading-relaxed min-h-[120px]"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleTriggerAiContextTransformation}
                      disabled={isAiGenerating || !manualQuestionDraft.trim()}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#FFD36D] to-[#FDB040] text-[#251E2B] text-xs font-bold shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isAiGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      <span>{isAiGenerating ? "Memproses & Menormalisasi Butir Soal..." : "Kontekstualisasikan Soal"}</span>
                    </button>
                  </div>
                )}

                {/* Upload PDF: File & Editor */}
                {selectedMethod === "pdf" && (
                  <div className="space-y-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="p-4 border-2 border-dashed border-white/25 rounded-2xl text-center space-y-2 bg-[#251E2B]/50">
                      <Upload className="w-8 h-8 text-[#FFD36D] mx-auto" />
                      <p className="text-xs font-bold text-gray-200">
                        {uploadedFileName ? `Dokumen: ${uploadedFileName}` : "Unggah naskah dokumen soal format PDF"}
                      </p>
                      <button
                        type="button"
                        onClick={() => pdfInputRef.current?.click()}
                        disabled={isExtractingText}
                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {isExtractingText ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FFD36D]" /> : <Upload className="w-3.5 h-3.5 text-[#FFD36D]" />}
                        <span>{isExtractingText ? "Mengekstrak PDF..." : uploadedFileName ? "Ganti PDF" : "Upload PDF Sekarang"}</span>
                      </button>
                    </div>

                    {extractionError && (
                      <div className="p-3 rounded-xl bg-rose-900/60 border border-rose-500/50 text-rose-200 text-xs font-semibold">
                        {extractionError}
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                          HASIL EKSTRAKSI TEKS DARI DOKUMEN PDF (DAPAT DIEDIT GURU)
                        </label>
                        <span className="text-[11px] text-gray-400 font-mono">
                          {manualQuestionDraft.length} karakter
                        </span>
                      </div>
                      <textarea
                        rows={6}
                        value={manualQuestionDraft}
                        onChange={(e) => setManualQuestionDraft(e.target.value)}
                        placeholder="Teks hasil ekstraksi PDF akan muncul di sini. Koreksi sebelum normalisasi..."
                        className="w-full p-4 rounded-2xl border-2 border-white/20 bg-[#251E2B]/90 focus:border-[#FFD36D] text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none transition-all shadow-inner leading-relaxed min-h-[120px]"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleTriggerAiContextTransformation}
                      disabled={isAiGenerating || !manualQuestionDraft.trim()}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#FFD36D] to-[#FDB040] text-[#251E2B] text-xs font-bold shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isAiGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      <span>{isAiGenerating ? "Memproses & Menormalisasi Butir Soal..." : "Kontekstualisasikan Soal"}</span>
                    </button>
                  </div>
                )}

                {/* AI Generator Helper Bar di Step 3 jika metode AI */}
                {selectedMethod === "ai" && (
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="text-xs">
                      <span className="font-bold text-[#FFD36D] block">Kearifan Lokal: {region}</span>
                      <span className="text-[11px] text-gray-300">
                        AI merumuskan butir asesmen otomatis dengan data riil {region}.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleTriggerAiContextTransformation}
                      disabled={isAiGenerating}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FFD36D] to-[#FDB040] text-[#251E2B] text-xs font-bold shadow-md cursor-pointer shrink-0 disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {isAiGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      <span>{isAiGenerating ? "Merumuskan..." : "Generate AI Ulang"}</span>
                    </button>
                  </div>
                )}

                {/* Daftar Form Buat Soal Pertama Sampai Pembahasan */}
                <div className="space-y-5">
                  {questionsList.map((q, index) => (
                    <div
                      key={q.id || index}
                      className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/15 space-y-4"
                    >
                      {/* Baris Header Butir Soal: Nomor Soal, Switcher Tipe Soal (Pilgan / Esai), dan Tombol Hapus */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-xl bg-[#FFD36D] text-[#251E2B] text-xs font-black flex items-center justify-center shadow-xs">
                            {index + 1}
                          </span>
                          <span className="text-sm font-black text-white">
                            Soal #{index + 1}
                          </span>
                          <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-white/10 text-gray-300 border border-white/10">
                            {q.type === "multiple_choice" ? "Pilihan Ganda" : "Soal Esai"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Switcher Tipe Soal untuk butir soal ini */}
                          <div className="inline-flex rounded-xl bg-[#251E2B] p-1 border border-white/15">
                            <button
                              type="button"
                              onClick={() => handleUpdateQuestion(index, "type", "multiple_choice")}
                              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                                q.type === "multiple_choice"
                                  ? "bg-[#FFD36D] text-[#251E2B] shadow-xs font-black"
                                  : "text-gray-300 hover:text-white"
                              }`}
                            >
                              Pilihan Ganda
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateQuestion(index, "type", "essay")}
                              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                                q.type === "essay"
                                  ? "bg-[#FFD36D] text-[#251E2B] shadow-xs font-black"
                                  : "text-gray-300 hover:text-white"
                              }`}
                            >
                              Esai
                            </button>
                          </div>

                          {/* Tombol Hapus Butir Soal (hanya tampil jika lebih dari 1 butir) */}
                          {questionsList.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestion(index)}
                              className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/20 transition-all cursor-pointer"
                              title={`Hapus Soal #${index + 1}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Teks Pertanyaan Soal */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-gray-200">
                          Pertanyaan Soal #{index + 1}
                        </label>
                        <textarea
                          rows={3}
                          required
                          value={q.question_text}
                          onChange={(e) => handleUpdateQuestion(index, "question_text", e.target.value)}
                          placeholder={`Tuliskan stimulus konteks atau pertanyaan soal #${index + 1} di sini...`}
                          className="w-full p-3.5 rounded-2xl border-2 border-white/20 bg-[#251E2B]/90 focus:border-[#FFD36D] text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none transition-all shadow-inner leading-relaxed min-h-[90px]"
                        />
                      </div>

                      {/* Form Opsi Pilihan Ganda / Rubrik Esai */}
                      {q.type === "multiple_choice" ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-gray-200">
                              Opsi Jawaban
                            </label>
                            <span className="text-[11px] text-gray-400">
                              Isi opsi dan tentukan kunci jawaban
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {q.options.map((opt) => (
                              <div
                                key={opt.key}
                                className="flex items-center gap-2 p-2 rounded-2xl bg-[#251E2B]/80 border-2 border-white/15 focus-within:border-[#FFD36D]"
                              >
                                <span className="w-7 h-7 rounded-xl bg-white/10 text-[#FFD36D] text-xs font-black flex items-center justify-center shrink-0">
                                  {opt.key}
                                </span>
                                <input
                                  type="text"
                                  required
                                  value={opt.text}
                                  onChange={(e) => handleUpdateOption(index, opt.key, e.target.value)}
                                  placeholder={`Pilihan jawaban ${opt.key}`}
                                  className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none font-medium"
                                />
                              </div>
                            ))}
                          </div>

                          {/* Kunci Jawaban Selector */}
                          <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-2xl bg-white/5 border border-white/10">
                            <span className="text-xs font-bold text-gray-200">
                              Kunci Jawaban Benar:
                            </span>
                            <div className="flex items-center gap-2">
                              {["A", "B", "C", "D"].map((key) => (
                                <button
                                  key={key}
                                  type="button"
                                  onClick={() => handleUpdateQuestion(index, "correct_answer", key)}
                                  className={`w-8 h-8 rounded-xl font-black text-xs transition-all cursor-pointer ${
                                    q.correct_answer === key
                                      ? "bg-[#FFD36D] text-[#251E2B] shadow-md scale-105"
                                      : "bg-white/10 text-white hover:bg-white/20"
                                  }`}
                                >
                                  {key}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Rubrik Penskoran Soal Esai */
                        <div className="space-y-1">
                          <label className="block text-xs font-bold text-gray-200">
                            Rubrik Penskoran Esai
                          </label>
                          <textarea
                            rows={3}
                            value={q.rubric || ""}
                            onChange={(e) => handleUpdateQuestion(index, "rubric", e.target.value)}
                            placeholder="Uraikan kriteria penilaian jawaban esai secara bertahap..."
                            className="w-full p-3.5 rounded-2xl border-2 border-white/20 bg-[#251E2B]/90 focus:border-[#FFD36D] text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none transition-all shadow-inner leading-relaxed min-h-[90px]"
                          />
                        </div>
                      )}

                      {/* Pembahasan Soal */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-gray-200">
                          Pembahasan Soal #{index + 1}
                        </label>
                        <textarea
                          rows={2}
                          value={q.explanation}
                          onChange={(e) => handleUpdateQuestion(index, "explanation", e.target.value)}
                          placeholder="Uraikan pembahasan dan cara penyelesaian soal di sini..."
                          className="w-full p-3 rounded-2xl border-2 border-white/20 bg-[#251E2B]/90 focus:border-[#FFD36D] text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none transition-all shadow-inner leading-relaxed"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* ===============================================================
                    BUTTON TAMBAH UNTUK TAMBAH SOAL NOMOR BERIKUTNYA
                    (Pilihan Ganda atau Esai, Langsung Buat Banyak Soal di Sini)
                    =============================================================== */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border-2 border-dashed border-[#FFD36D]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-[#FFD36D] text-[#251E2B] text-[10px] font-black uppercase">
                        Nomor #{questionsList.length + 1}
                      </span>
                      <h4 className="text-xs sm:text-sm font-extrabold text-white">
                        Tambah Soal Nomor Berikutnya
                      </h4>
                    </div>
                    <p className="text-[11px] text-gray-300 mt-1 leading-relaxed">
                      Pilih format soal untuk nomor berikutnya (Pilihan Ganda atau Esai) dan tambahkan langsung ke paket ini:
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => handleAddQuestion("multiple_choice")}
                      className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#FFD36D] hover:bg-[#F5C754] text-[#251E2B] font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                      <span>+ Pilihan Ganda</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddQuestion("essay")}
                      className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/25 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                      <span>+ Soal Esai</span>
                    </button>
                  </div>
                </div>

                {/* Footer Buttons Step 3: Button 'Simpan' Satu Kata */}
                <div className="pt-3 flex items-center justify-between border-t border-white/10 gap-3">
                  <button
                    type="button"
                    onClick={() => setWizardStep(2)}
                    className="py-2.5 px-5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
                  >
                    Kembali
                  </button>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-gray-300 font-medium hidden sm:inline">
                      {questionsList.length} butir soal dirancang
                    </span>
                    <button
                      type="button"
                      onClick={handleStep3Save}
                      disabled={questionsList.every((q) => !q.question_text.trim())}
                      className="py-2.5 px-7 rounded-2xl bg-gradient-to-r from-[#FFD36D] to-[#FDB040] hover:from-[#FFE085] hover:to-[#FFBD59] text-[#251E2B] font-extrabold text-xs shadow-md transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
                    >
                      <span>Simpan ({questionsList.length} Soal)</span>
                      <Check className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ===================================================================
                STEP 4: SUKSES / BERHASIL DISIMPAN DENGAN ID PATEN
                =================================================================== */}
            {wizardStep === 4 && (
              <div className="w-full text-center py-4 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-lg sm:text-xl font-black text-white">
                    {questionsList.length > 1
                      ? `Paket Soal (${questionsList.length} Butir) Berhasil Disimpan!`
                      : "Paket Soal Berhasil Disimpan!"}
                  </h4>
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-3 max-w-md mx-auto">
                    <span className="text-[11px] text-gray-300">ID Paten:</span>
                    {(createdQuestionIds.length > 0 ? createdQuestionIds : [patentQuestionId]).map((id) => (
                      <span
                        key={id}
                        className="font-mono text-xs font-bold text-[#FFD36D] bg-white/10 px-3 py-1 rounded-xl border border-white/15"
                      >
                        {id}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsWizardOpen(false);
                      const firstId = createdQuestionIds[0] || createdQuestionId;
                      const q = questions.find((item) => item.id === firstId) || questions[0];
                      if (q) handleOpenPublishRoom(q);
                    }}
                    className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-[#51465B] hover:bg-[#3E3547] text-[#FFD36D] text-xs font-bold border border-[#645770]/40 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <DoorOpen className="w-4 h-4" />
                    <span>Terbitkan Room Soal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsWizardOpen(false)}
                    className="w-full sm:w-auto py-3 px-7 rounded-2xl bg-gradient-to-r from-[#FFD36D] to-[#FDB040] text-[#251E2B] text-xs font-extrabold shadow-md cursor-pointer"
                  >
                    Selesai & Lihat Soal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Publish Room Modal */}
      {isRoomModalOpen && questionToPublish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-gradient-to-b from-[#3E3547] via-[#332A3B] to-[#251E2B] rounded-[32px] sm:rounded-[36px] border border-[#5A4F65] shadow-2xl p-6 sm:p-8 text-center space-y-4 animate-in fade-in zoom-in-95 text-white">
            <div className="w-12 h-12 rounded-2xl bg-white/10 text-[#FFD36D] flex items-center justify-center mx-auto shadow-sm">
              <DoorOpen className="w-6 h-6 stroke-[2.2]" />
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Buka Room Soal
              </h3>
              <p className="text-xs text-gray-300 mt-1">
                Siswa dapat langsung berlatih tanpa akun dengan kode:
              </p>
            </div>

            <div className="p-3 bg-[#251E2B]/80 border-2 border-white/20 rounded-2xl">
              <span className="font-mono text-xl font-black tracking-widest text-[#FFD36D] lowercase">
                {generatedRoomCode}
              </span>
            </div>

            {roomCreatedSuccess ? (
              <div className="p-3 bg-emerald-950/70 border border-emerald-700/60 text-emerald-200 text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Room berhasil diaktifkan!</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleCreateRoomForQuestion}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FFD36D] to-[#FDB040] hover:from-[#FFE085] hover:to-[#FFBD59] text-[#251E2B] font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                Aktifkan Room Sekarang
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsRoomModalOpen(false)}
              className="text-xs font-bold text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Printable Document Modal */}
      {isPrintingQuestion && previewQuestion && (
        <DepaskanPrintableDocument
          docType="question"
          contentId={previewQuestion.id}
          title={previewQuestion.topic || previewQuestion.question_text.slice(0, 40)}
          subject={previewQuestion.subject}
          grade={previewQuestion.grade}
          regionName={activeSchool?.region_name || "Ponorogo"}
          content={previewQuestion.question_text}
          teacherName={currentUser?.full_name}
          questions={getQuestionItems(previewQuestion).map((item, idx) => ({
            number: idx + 1,
            type: item.type,
            question_text: item.question_text,
            options: item.options,
            correct_answer: item.correct_answer,
          }))}
          onClose={() => setIsPrintingQuestion(false)}
        />
      )}

      {/* Custom Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        itemType="soal"
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

      {/* Live Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={handleCameraCapture}
        title="Potret Lembar Naskah Soal"
        description="Arahkan kamera ke lembar naskah soal fisik secara tegak lurus untuk diekstraksi."
      />
    </TeacherWorkspaceShell>
  );
}

export default function TeacherQuestionsPage() {
  return (
    <Suspense fallback={null}>
      <TeacherQuestionsContent />
    </Suspense>
  );
}
