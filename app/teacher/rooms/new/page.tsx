"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  DoorOpen,
  ArrowLeft,
  BookOpen,
  Brain,
  Check,
  Sparkles,
  Shuffle,
} from "lucide-react";
import { TeacherWorkspaceShell } from "@/components/layout/teacher-workspace-shell";
import { repository } from "@/lib/db/repository";
import { LearningMaterial, Question, School, UserProfile } from "@/lib/db/types";

export default function CreateRoomPage() {
  const router = useRouter();
  const [school, setSchool] = useState<School | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);

  const [roomType, setRoomType] = useState<"material" | "question">("material");
  const [selectedResourceId, setSelectedResourceId] = useState<string>("");
  const [customTitle, setCustomTitle] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [subject, setSubject] = useState("Matematika");
  const [grade, setGrade] = useState<number>(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate random 6-character room code
  const generateRandomCode = (type: "material" | "question") => {
    const prefix = type === "material" ? "MTR" : "SOL";
    const num = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${num}`;
  };

  useEffect(() => {
    const activeSchool = repository.getActiveSchool();
    setSchool(activeSchool);
    const currentUser = repository.getCurrentUser();
    setUser(currentUser);

    const mats = repository.getMaterials(activeSchool?.id);
    setMaterials(mats);
    const qs = repository.getQuestions({ schoolId: activeSchool?.id });
    setQuestions(qs);

    if (mats.length > 0) {
      setSelectedResourceId(mats[0].id);
      setCustomTitle(mats[0].title);
      setSubject(mats[0].subject || "IPS");
      setGrade(mats[0].grade || 5);
    }

    setRoomCode(generateRandomCode("material"));
  }, []);

  const handleTypeChange = (newType: "material" | "question") => {
    setRoomType(newType);
    setRoomCode(generateRandomCode(newType));
    if (newType === "material" && materials.length > 0) {
      setSelectedResourceId(materials[0].id);
      setCustomTitle(materials[0].title);
      setSubject(materials[0].subject || "IPS");
      setGrade(materials[0].grade || 5);
    } else if (newType === "question" && questions.length > 0) {
      setSelectedResourceId(questions[0].id);
      setCustomTitle(`Latihan Soal: ${questions[0].topic || "Kontekstual"}`);
      setSubject(questions[0].subject || "Matematika");
      setGrade(questions[0].grade || 5);
    }
  };

  const handleResourceSelect = (id: string) => {
    setSelectedResourceId(id);
    if (roomType === "material") {
      const mat = materials.find((m) => m.id === id);
      if (mat) {
        setCustomTitle(mat.title);
        setSubject(mat.subject);
        setGrade(mat.grade);
      }
    } else {
      const q = questions.find((item) => item.id === id);
      if (q) {
        setCustomTitle(`Latihan Soal: ${q.topic}`);
        setSubject(q.subject);
        setGrade(q.grade);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode || !customTitle || isSubmitting) return;

    setIsSubmitting(true);
    const newRoom = repository.createRoom({
      code: roomCode.trim().toUpperCase(),
      title: customTitle.trim(),
      type: roomType,
      resource_id: selectedResourceId,
      subject,
      grade,
      region_name: school?.region_name || "Kabupaten Ponorogo",
      teacher_id: user?.id || "usr-teacher-01",
      teacher_name: user?.full_name || "Pengajar Depaskan",
    });

    setTimeout(() => {
      router.push(`/teacher/rooms?created=${newRoom.code}`);
    }, 400);
  };

  return (
    <TeacherWorkspaceShell activeGroupId="rooms">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back navigation */}
        <Link
          href="/teacher/rooms"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#756F7A] hover:text-[#23212A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Room</span>
        </Link>

        {/* Title */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#23212A] tracking-tight">
            Buat Room Akses Baru
          </h1>
          <p className="text-xs sm:text-sm text-[#756F7A] font-semibold mt-1">
            Terbitkan materi atau soal terkontekstualisasi agar dapat diakses siswa via URL dan kode tanpa harus login.
          </p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl border border-[#E9E5E8] p-6 sm:p-8 shadow-xs space-y-6"
        >
          {/* Step 1: Select Type */}
          <div>
            <label className="text-xs font-bold text-[#23212A] uppercase tracking-wider block mb-2">
              1. Pilih Jenis Konten yang Ingin Dibagikan
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleTypeChange("material")}
                className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition-all cursor-pointer text-left ${
                  roomType === "material"
                    ? "border-[#51465B] bg-[#51465B]/5 shadow-xs"
                    : "border-[#E9E5E8] hover:border-slate-300"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    roomType === "material"
                      ? "bg-[#51465B] text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-black text-sm text-[#23212A]">
                    Modul Materi
                  </div>
                  <div className="text-[11px] text-[#756F7A]">
                    Siswa membaca materi kontekstual lokal
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange("question")}
                className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition-all cursor-pointer text-left ${
                  roomType === "question"
                    ? "border-[#51465B] bg-[#51465B]/5 shadow-xs"
                    : "border-[#E9E5E8] hover:border-slate-300"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    roomType === "question"
                      ? "bg-[#FFD36D] text-[#23212A]"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-black text-sm text-[#23212A]">
                    Latihan Soal
                  </div>
                  <div className="text-[11px] text-[#756F7A]">
                    Siswa menjawab soal dan melihat pembahasan
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Step 2: Select Content Source */}
          <div>
            <label className="text-xs font-bold text-[#23212A] uppercase tracking-wider block mb-2">
              2. Pilih Sumber {roomType === "material" ? "Materi" : "Soal"}
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {roomType === "material" ? (
                materials.map((mat) => (
                  <div
                    key={mat.id}
                    onClick={() => handleResourceSelect(mat.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                      selectedResourceId === mat.id
                        ? "border-[#51465B] bg-[#51465B]/5 font-bold"
                        : "border-[#E9E5E8] hover:bg-slate-50"
                    }`}
                  >
                    <div>
                      <div className="text-[#23212A]">{mat.title}</div>
                      <div className="text-[10px] text-[#756F7A] mt-0.5">
                        Kelas {mat.grade} &bull; {mat.subject} &bull; Terkontekstualisasi
                      </div>
                    </div>
                    {selectedResourceId === mat.id && (
                      <Check className="w-4 h-4 text-[#51465B] shrink-0" />
                    )}
                  </div>
                ))
              ) : (
                questions.map((q) => (
                  <div
                    key={q.id}
                    onClick={() => handleResourceSelect(q.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                      selectedResourceId === q.id
                        ? "border-[#51465B] bg-[#51465B]/5 font-bold"
                        : "border-[#E9E5E8] hover:bg-slate-50"
                    }`}
                  >
                    <div>
                      <div className="text-[#23212A]">{q.topic}: {q.question_text.slice(0, 75)}...</div>
                      <div className="text-[10px] text-[#756F7A] mt-0.5">
                        Kelas {q.grade} &bull; {q.subject} &bull; {q.type === "multiple_choice" ? "Pilihan Ganda" : "Esai"}
                      </div>
                    </div>
                    {selectedResourceId === q.id && (
                      <Check className="w-4 h-4 text-[#51465B] shrink-0" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Step 3: Title and Code Customization */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#23212A] block mb-1">
                Judul Room Tampilan Siswa
              </label>
              <input
                type="text"
                required
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E5E8] text-xs font-medium text-[#23212A] focus:outline-none focus:ring-2 focus:ring-[#51465B]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#23212A]">
                  Kode Akses Unik (6-8 Karakter)
                </label>
                <button
                  type="button"
                  onClick={() => setRoomCode(generateRandomCode(roomType))}
                  className="text-[10px] font-bold text-[#51465B] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Shuffle className="w-3 h-3" />
                  <span>Acak Kode</span>
                </button>
              </div>
              <input
                type="text"
                required
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="CONTOH: MTR-3502"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E5E8] text-xs font-mono font-black text-[#23212A] uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#51465B]"
              />
            </div>
          </div>

          {/* Preview Direct Link Info */}
          <div className="bg-[#FAF7F3] border border-[#E9E5E8] rounded-2xl p-4 text-xs space-y-1.5">
            <span className="font-bold text-[#23212A] block">
              URL Langsung yang Dapat Dibagikan:
            </span>
            <div className="font-mono text-[11px] text-[#51465B] bg-white px-3 py-2 rounded-lg border border-[#E9E5E8] truncate">
              {typeof window !== "undefined" ? window.location.origin : "https://depaskan.id"}/room/{roomCode || "KODE"}
            </div>
            <p className="text-[10px] text-[#756F7A]">
              Siswa yang membuka tautan di atas hanya diminta memasukkan Nama, lalu langsung membaca materi atau mengerjakan soal.
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E9E5E8]">
            <Link
              href="/teacher/rooms"
              className="px-4 py-2.5 rounded-xl border border-[#E9E5E8] text-xs font-bold text-[#756F7A] hover:bg-slate-50 transition-colors"
            >
              Batal
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#51465B] hover:bg-[#3D3445] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Menerbitkan..." : "Terbitkan Room Akses"}
            </button>
          </div>
        </form>
      </div>
    </TeacherWorkspaceShell>
  );
}
