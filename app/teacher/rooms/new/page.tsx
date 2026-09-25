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
  Layers,
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

  const [roomType, setRoomType] = useState<"material" | "question" | "both">("material");
  const [selectedResourceId, setSelectedResourceId] = useState<string>("");
  const [secondaryResourceId, setSecondaryResourceId] = useState<string>("");
  const [customTitle, setCustomTitle] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [subject, setSubject] = useState("Matematika");
  const [grade, setGrade] = useState<number>(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate random 6-character room code
  const generateRandomCode = (type: "material" | "question" | "both") => {
    const prefix = type === "material" ? "MTR" : type === "question" ? "SOL" : "ROM";
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
      setSubject(mats[0].subject || "Matematika");
      setGrade(mats[0].grade || 5);
    }
    if (qs.length > 0) {
      setSecondaryResourceId(qs[0].id);
    }

    setRoomCode(generateRandomCode("material"));
  }, []);

  const handleTypeChange = (newType: "material" | "question" | "both") => {
    setRoomType(newType);
    setRoomCode(generateRandomCode(newType));
    if (newType === "material" && materials.length > 0) {
      setSelectedResourceId(materials[0].id);
      setCustomTitle(materials[0].title);
      setSubject(materials[0].subject || "Matematika");
      setGrade(materials[0].grade || 5);
    } else if (newType === "question" && questions.length > 0) {
      setSelectedResourceId(questions[0].id);
      setCustomTitle(`Latihan Soal: ${questions[0].topic || "Kontekstual"}`);
      setSubject(questions[0].subject || "Matematika");
      setGrade(questions[0].grade || 5);
    } else if (newType === "both") {
      if (materials.length > 0) {
        setSelectedResourceId(materials[0].id);
        setCustomTitle(`Paket Terpadu: ${materials[0].title}`);
        setSubject(materials[0].subject || "Matematika");
        setGrade(materials[0].grade || 5);
      }
      if (questions.length > 0) {
        setSecondaryResourceId(questions[0].id);
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
      secondary_resource_id: roomType === "both" ? secondaryResourceId : undefined,
      subject,
      grade,
      region_name: school?.region_name || "Kota Madiun",
      teacher_id: user?.id || "usr-teacher-01",
      teacher_name: user?.full_name || "Pengajar Depaskan",
    });

    setTimeout(() => {
      router.push(`/teacher/rooms?created=${newRoom.code}`);
    }, 400);
  };

  return (
    <TeacherWorkspaceShell activeGroupId="rooms">
      <div className="max-w-3xl mx-auto space-y-6 pb-12">
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
            Buat Ruang Belajar (Room) Baru
          </h1>
          <p className="text-xs sm:text-sm text-[#756F7A] font-semibold mt-1">
            Publikasikan materi ajar, paket soal latihan, atau keduanya bersamaan agar dapat diakses murid tanpa login.
          </p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="p-6 sm:p-8 rounded-[28px] sm:rounded-[36px] bg-white border border-[#E9E5E8] shadow-xs space-y-6"
        >
          {/* Step 1: Select Type */}
          <div>
            <label className="text-xs font-black text-[#23212A] uppercase tracking-wider block mb-3">
              1. Tipe Konten yang Ingin Dipublikasikan
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Materi */}
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
                  <div className="font-black text-xs text-[#23212A]">
                    Materi Saja
                  </div>
                  <div className="text-[10px] text-[#756F7A]">
                    Siswa membaca bahan ajar
                  </div>
                </div>
              </button>

              {/* Soal */}
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
                  <div className="font-black text-xs text-[#23212A]">
                    Soal Saja
                  </div>
                  <div className="text-[10px] text-[#756F7A]">
                    Siswa menjawab latihan
                  </div>
                </div>
              </button>

              {/* Keduanya Bareng */}
              <button
                type="button"
                onClick={() => handleTypeChange("both")}
                className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition-all cursor-pointer text-left ${
                  roomType === "both"
                    ? "border-[#51465B] bg-[#51465B]/5 shadow-xs"
                    : "border-[#E9E5E8] hover:border-slate-300"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    roomType === "both"
                      ? "bg-[#51465B] text-[#FFD36D]"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-black text-xs text-[#23212A]">
                    Keduanya Bareng
                  </div>
                  <div className="text-[10px] text-[#756F7A]">
                    Materi + Soal Latihan
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Step 2: Content Selection */}
          {(roomType === "material" || roomType === "both") && (
            <div>
              <label className="text-xs font-black text-[#23212A] uppercase tracking-wider block mb-2">
                Pilih Modul Materi
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {materials.map((mat) => (
                  <div
                    key={mat.id}
                    onClick={() => {
                      setSelectedResourceId(mat.id);
                      if (roomType === "material") setCustomTitle(mat.title);
                      else setCustomTitle(`Paket Terpadu: ${mat.title}`);
                    }}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                      selectedResourceId === mat.id
                        ? "border-[#51465B] bg-[#51465B]/5 font-bold"
                        : "border-[#E9E5E8] hover:bg-slate-50"
                    }`}
                  >
                    <div>
                      <div className="text-[#23212A]">{mat.title}</div>
                      <div className="text-[10px] text-[#756F7A] mt-0.5">
                        Kelas {mat.grade} &bull; {mat.subject} &bull; {mat.id}
                      </div>
                    </div>
                    {selectedResourceId === mat.id && (
                      <Check className="w-4 h-4 text-[#51465B] shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(roomType === "question" || roomType === "both") && (
            <div>
              <label className="text-xs font-black text-[#23212A] uppercase tracking-wider block mb-2">
                Pilih Butir Soal Latihan
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {questions.map((q) => {
                  const isSelected =
                    roomType === "question"
                      ? selectedResourceId === q.id
                      : secondaryResourceId === q.id;

                  return (
                    <div
                      key={q.id}
                      onClick={() => {
                        if (roomType === "question") {
                          setSelectedResourceId(q.id);
                          setCustomTitle(`Latihan: ${q.topic}`);
                        } else {
                          setSecondaryResourceId(q.id);
                        }
                      }}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? "border-[#51465B] bg-[#51465B]/5 font-bold"
                          : "border-[#E9E5E8] hover:bg-slate-50"
                      }`}
                    >
                      <div className="pr-2">
                        <div className="text-[#23212A] line-clamp-1">{q.question_text}</div>
                        <div className="text-[10px] text-[#756F7A] mt-0.5">
                          Topik: {q.topic} &bull; Kunci: {q.correct_answer}
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-[#51465B] shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Title & Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-[#23212A] mb-1.5">
                Judul Tampilan Room Siswa
              </label>
              <input
                type="text"
                required
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E5E8] bg-[#FAF7F3] text-xs font-bold text-[#23212A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#23212A] mb-1.5 flex items-center justify-between">
                <span>Kode Akses Siswa</span>
                <button
                  type="button"
                  onClick={() => setRoomCode(generateRandomCode(roomType))}
                  className="text-[11px] text-[#51465B] font-bold flex items-center gap-1 cursor-pointer hover:underline"
                >
                  <Shuffle className="w-3 h-3" />
                  <span>Acak Kode</span>
                </button>
              </label>
              <input
                type="text"
                required
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E5E8] bg-[#FAF7F3] font-mono font-bold text-xs text-[#51465B]"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-[#E9E5E8] flex justify-end gap-3">
            <Link
              href="/teacher/rooms"
              className="py-3 px-5 rounded-2xl border border-[#E9E5E8] hover:bg-[#FAF7F3] text-xs font-bold text-[#756F7A]"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-3 px-7 rounded-2xl bg-[#51465B] hover:bg-[#3E3547] text-white font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <DoorOpen className="w-4 h-4 text-[#FFD36D]" />
              <span>{isSubmitting ? "Menerbitkan Room..." : "Terbitkan Room Belajar"}</span>
            </button>
          </div>
        </form>
      </div>
    </TeacherWorkspaceShell>
  );
}
