"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  BookOpen,
  Brain,
  ClipboardCheck,
  Bell,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  FileText,
  MapPin,
  CheckCircle2,
  Printer,
  Glasses,
  Lock,
  Copy,
  Check,
  Eye,
  Layers,
} from "lucide-react";
import { TeacherWorkspaceShell } from "@/components/layout/teacher-workspace-shell";
import { repository } from "@/lib/db/repository";
import { School, UserProfile, ClassRoom, Question, LearningMaterial, Exam, ExamAttempt } from "@/lib/db/types";

export default function TeacherDashboardPage() {
  const [school, setSchool] = useState<School | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);

  // Preview tab state: "question" (Quentext) or "material" (Mattext)
  const [activePreviewTab, setActivePreviewTab] = useState<"question" | "material">("question");
  const [selectedSampleIndex, setSelectedSampleIndex] = useState(0);
  const [copiedNotice, setCopiedNotice] = useState(false);

  useEffect(() => {
    const activeSchool = repository.getActiveSchool();
    setSchool(activeSchool);
    setUser(repository.getCurrentUser());
    setQuestions(repository.getQuestions({ schoolId: activeSchool.id }));
    setMaterials(repository.getMaterials(activeSchool.id));
  }, []);

  const todayFormatted = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const teacherFirstName = user?.full_name?.split(" ")[0]?.replace(",", "") || "Bu Siti";

  // Samples of Quentext (Soal)
  const SAMPLE_QUESTIONS = [
    {
      title: "Matematika Pasar Besar Madiun",
      subject: "Matematika Fase C • Kelas 5 SD",
      region: "Kota Madiun (Pasar Besar)",
      prompt:
        "Di Pasar Besar Kota Madiun, Bu Lastri membeli 3 kantong brem seharga Rp15.000 per kantong dan 2 kotak madumongso seharga Rp22.500 per kotak. Bu Lastri membayar dengan selembar uang Rp100.000. Berapakah uang kembalian yang diterima Bu Lastri?",
      options: [
        { label: "A", text: "Rp10.000", isCorrect: true },
        { label: "B", text: "Rp15.000", isCorrect: false },
        { label: "C", text: "Rp20.000", isCorrect: false },
        { label: "D", text: "Rp25.000", isCorrect: false },
      ],
      explanation:
        "Total belanja = (3 × Rp15.000) + (2 × Rp22.500) = Rp45.000 + Rp45.000 = Rp90.000. Kembalian = Rp100.000 - Rp90.000 = Rp10.000.",
      bpsSource: "Data Komoditas UMKM Pangan Olahan BPS Kota Madiun 2026",
    },
    {
      title: "Logistik Kereta Api Madiun",
      subject: "Matematika Fase C • Kelas 5 SD",
      region: "Kota Madiun (PT INKA)",
      prompt:
        "Rangkaian kereta logistik INKA membawa 6 gerbong peti kemas. Setiap gerbong terisi penuh beras lokal seberat 18,5 ton. Jika 2 gerbong diturunkan di stasiun tujuan pertama, berapa sisa ton beras yang masih diangkut kereta tersebut?",
      options: [
        { label: "A", text: "74,0 ton", isCorrect: true },
        { label: "B", text: "72,5 ton", isCorrect: false },
        { label: "C", text: "55,5 ton", isCorrect: false },
        { label: "D", text: "92,5 ton", isCorrect: false },
      ],
      explanation:
        "Sisa gerbong = 6 - 2 = 4 gerbong. Total sisa muatan = 4 × 18,5 ton = 74,0 ton beras.",
      bpsSource: "Data Distribusi Pangan & Angkutan Rel Dinas Perhubungan Madiun",
    },
  ];

  // Samples of Mattext (Materi)
  const SAMPLE_MATERIALS = [
    {
      title: "Penerapan Operasi Hitung Campuran dalam Perdagangan Tradisional Madiun",
      subject: "Modul Ajar Matematika & IPAS • Kelas 5 SD",
      region: "Kota Madiun",
      objective:
        "Peserta didik dapat menganalisis dan menyelesaikan masalah numerasi kontekstual yang terjadi dalam kegiatan jual-beli produk kuliner khas lokal.",
      narrative:
        "Pasar Besar Kota Madiun menjadi pusat perdagangan legendaris komoditas khas seperti brem, sambal pecel, dan madumongso. Melalui modul ajar ini, siswa diajak mengeksplorasi kalkulasi harga satuan, diskon pedagang pasar, dan estimasi keuntungan UMKM secara nyata.",
      steps: [
        "Identifikasi daftar harga bahan baku kedelai dan gula tebu lokal.",
        "Simulasi transaksi jual beli dengan operasi hitung campuran (kali, bagi, tambah, kurang).",
        "Refleksi nilai kearifan lokal gotong royong para pedagang pasar.",
      ],
      curriculum: "Kurikulum Merdeka - Capaian Pembelajaran Fase C",
    },
    {
      title: "Pemanfaatan Energi dan Transportasi Kereta Api Lokal Madiun",
      subject: "Modul Ajar IPAS & Sains • Kelas 5 SD",
      region: "Kota Madiun (PT INKA)",
      objective:
        "Memahami prinsip perubahan energi listrik dan gerak pada armada transportasi kereta rel listrik buatan pabrik dalam negeri.",
      narrative:
        "PT Industri Kereta Api (INKA) di Kota Madiun merupakan kebanggaan bangsa dalam teknologi transportasi. Modul ini menghubungkan konsep perpindahan energi sains kelas 5 dengan teknologi riil yang ada di lingkungan anak-anak Madiun.",
      steps: [
        "Pengamatan visual komponen lokomotif dan gerbong penumpang.",
        "Analisis efisiensi bahan bakar kereta dibandingkan truk angkutan barang.",
        "Eksperimen mini gaya gesek roda baja di atas rel.",
      ],
      curriculum: "Kurikulum Merdeka - Capaian Pembelajaran Fase C",
    },
  ];

  const currentQuestion = SAMPLE_QUESTIONS[selectedSampleIndex % SAMPLE_QUESTIONS.length];
  const currentMaterial = SAMPLE_MATERIALS[selectedSampleIndex % SAMPLE_MATERIALS.length];

  const handleCopy = (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedNotice(true);
      setTimeout(() => setCopiedNotice(false), 2000);
    }
  };

  return (
    <TeacherWorkspaceShell activeGroupId="dashboard">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* ====================================================================
            CENTER MAIN COLUMN (7 COLS ON DESKTOP)
            ==================================================================== */}
        <div className="xl:col-span-7 space-y-6">
          {/* 1. Header Greeting with Notification Bell */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#23212A] tracking-tight">
                Welcome back, {teacherFirstName}!
              </h1>
              <p className="text-xs sm:text-sm text-[#756F7A] font-semibold mt-0.5">
                {todayFormatted} &bull; Semester Ganjil TA 2026/2027
              </p>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                className="w-10 h-10 rounded-2xl bg-white border border-[#E9E5E8] flex items-center justify-center text-[#51465B] shadow-2xs hover:bg-[#FAF7F3] transition-colors cursor-pointer"
                title="Pemberitahuan"
                aria-label="Pemberitahuan"
              >
                <Bell className="w-5 h-5 text-[#51465B]" />
              </button>
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#F47D83] ring-2 ring-white" />
            </div>
          </div>

          {/* 2. Coral Salmon Banner: "Good Job!" with 3D Miniature Education Cart */}
          <div className="p-6 sm:p-7 rounded-[28px] sm:rounded-[32px] bg-[#F47D83] text-white shadow-md relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="relative z-10 max-w-md space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Good Job, Bu Guru!
              </h2>
              <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-normal">
                Konteks {school?.region_name || "Kota Madiun"} aktif untuk 21 siswa. 150+ butir soal kontekstual dan modul ajar terverifikasi BPS siap digunakan hari ini!
              </p>
            </div>

            {/* 3D Education Cart Graphic */}
            <div className="relative z-10 shrink-0">
              <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl overflow-hidden shadow-xl border-2 border-white/30 transform hover:scale-105 transition-transform bg-[#F47D83]">
                <img
                  src="/images/dashboard/education-cart.jpg"
                  alt="Education Cart"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Ambient Background Glow */}
            <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-white/15 blur-2xl pointer-events-none" />
          </div>

          {/* 3. Three Metric Cards Row (+8,5k Favorite, +5,2k Add to bag, +1,2k Orders) */}
          <div className="grid grid-cols-3 gap-3.5 sm:gap-4">
            {/* Metric 1 */}
            <div className="p-4 sm:p-5 rounded-[24px] sm:rounded-[28px] bg-white border border-[#E9E5E8] shadow-2xs text-center flex flex-col justify-center items-center hover:shadow-xs transition-shadow">
              <div className="text-2xl sm:text-3xl font-black text-[#23212A] tracking-tight">
                +8,5k
              </div>
              <div className="text-[11px] sm:text-xs font-semibold text-[#756F7A] mt-1">
                Bank Soal
              </div>
            </div>

            {/* Metric 2 */}
            <div className="p-4 sm:p-5 rounded-[24px] sm:rounded-[28px] bg-white border border-[#E9E5E8] shadow-2xs text-center flex flex-col justify-center items-center hover:shadow-xs transition-shadow">
              <div className="text-2xl sm:text-3xl font-black text-[#23212A] tracking-tight">
                +5,2k
              </div>
              <div className="text-[11px] sm:text-xs font-semibold text-[#756F7A] mt-1">
                Modul Ajar
              </div>
            </div>

            {/* Metric 3 */}
            <div className="p-4 sm:p-5 rounded-[24px] sm:rounded-[28px] bg-white border border-[#E9E5E8] shadow-2xs text-center flex flex-col justify-center items-center hover:shadow-xs transition-shadow">
              <div className="text-2xl sm:text-3xl font-black text-[#23212A] tracking-tight">
                +1,2k
              </div>
              <div className="text-[11px] sm:text-xs font-semibold text-[#756F7A] mt-1">
                Aktivitas Ujian
              </div>
            </div>
          </div>

          {/* 4. Bottom Showcase Section: "Recent Sold" equivalent */}
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-black text-[#23212A] tracking-tight">
              Aktivitas Terakhir
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-stretch">
              {/* Left Showcase Card: Editorial Bag with Photo */}
              <div className="sm:col-span-7 rounded-[24px] sm:rounded-[28px] bg-[#FAF7F3] border border-[#E9E5E8] p-4 flex flex-col justify-between hover:shadow-md transition-all group overflow-hidden">
                <div className="w-full h-36 sm:h-44 rounded-2xl overflow-hidden bg-white border border-[#E9E5E8] mb-3 relative">
                  <img
                    src="/images/dashboard/editorial-bag.jpg"
                    alt="Editorial Bag"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold">
                    Konteks Lokal
                  </div>
                </div>

                <div>
                  <h4 className="text-xs sm:text-sm font-black text-[#23212A] group-hover:text-[#51465B] transition-colors">
                    Kerajinan Lokal & Pasar Tradisional
                  </h4>
                  <p className="text-[11px] font-semibold text-[#756F7A] mt-0.5">
                    15 Butir Soal Terverifikasi &bull; Fase C SD
                  </p>
                </div>
              </div>

              {/* Right Tiles & Dresses Pill Card */}
              <div className="sm:col-span-5 flex flex-col justify-between gap-3.5">
                {/* Two Dark Mauve #51465B Icon Action Tiles (Quentext & Mattext) */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Quentext Tile */}
                  <Link
                    href="/teacher/questions/new"
                    className="p-4 rounded-2xl sm:rounded-3xl bg-[#FAF7F3] border border-[#E9E5E8] flex flex-col items-center justify-center gap-2 hover:bg-[#51465B] text-[#23212A] hover:text-white transition-all group cursor-pointer text-center"
                    title="Buat Soal Quentext Baru"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#51465B] group-hover:bg-[#FFD36D] text-white group-hover:text-[#51465B] flex items-center justify-center shadow-xs transition-colors">
                      <Brain className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <span className="text-[11px] font-bold">
                      Quentext
                    </span>
                  </Link>

                  {/* Mattext Tile */}
                  <Link
                    href="/teacher/materials/new"
                    className="p-4 rounded-2xl sm:rounded-3xl bg-[#FAF7F3] border border-[#E9E5E8] flex flex-col items-center justify-center gap-2 hover:bg-[#51465B] text-[#23212A] hover:text-white transition-all group cursor-pointer text-center"
                    title="Buat Materi Mattext Baru"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#51465B] group-hover:bg-[#FFD36D] text-white group-hover:text-[#51465B] flex items-center justify-center shadow-xs transition-colors">
                      <BookOpen className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <span className="text-[11px] font-bold">
                      Mattext
                    </span>
                  </Link>
                </div>

                {/* Coral Salmon Modul Tematik Pill Card */}
                <div className="p-4 rounded-2xl sm:rounded-3xl bg-[#E8B2B7] text-[#23212A] flex items-center justify-between shadow-2xs">
                  <div>
                    <div className="text-xs sm:text-sm font-black text-[#23212A]">
                      Modul Tematik SD
                    </div>
                    <div className="text-[10px] sm:text-[11px] font-semibold text-[#51465B]">
                      25 Modul Terbit &bull; Terverifikasi BPS
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-white/40 flex items-center justify-center text-[#51465B]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ====================================================================
            RIGHT PREVIEW HUB PANEL (5 COLS ON DESKTOP - WARM YELLOW #FFD36D)
            Menampilkan Preview Hasil Materi atau Soal
            ==================================================================== */}
        <div className="xl:col-span-5 rounded-[28px] sm:rounded-[36px] bg-[#FFD36D] p-5 sm:p-6 text-[#23212A] shadow-md space-y-4 border border-[#ECC159]">
          {/* 1. Header & Segmented Tabs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#51465B] block">
                  AI Contextual Generator
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[#23212A] tracking-tight">
                  Preview Hasil
                </h2>
              </div>

              {/* Sample Switcher */}
              <button
                type="button"
                onClick={() => setSelectedSampleIndex((prev) => prev + 1)}
                className="px-3 py-1.5 rounded-xl bg-white/50 hover:bg-white text-[11px] font-bold text-[#51465B] transition-colors cursor-pointer"
                title="Ganti Contoh Preview"
              >
                Ganti Contoh &rarr;
              </button>
            </div>

            {/* Segmented Buttons: Soal vs Materi */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-black/10 backdrop-blur-xs">
              <button
                type="button"
                onClick={() => setActivePreviewTab("question")}
                className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activePreviewTab === "question"
                    ? "bg-white text-[#23212A] shadow-sm"
                    : "text-[#51465B] hover:text-[#23212A]"
                }`}
              >
                <Brain className="w-3.5 h-3.5 text-[#51465B]" />
                <span>Preview Soal</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePreviewTab("material")}
                className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activePreviewTab === "material"
                    ? "bg-white text-[#23212A] shadow-sm"
                    : "text-[#51465B] hover:text-[#23212A]"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-[#51465B]" />
                <span>Preview Materi</span>
              </button>
            </div>
          </div>

          {/* 2. LIVE PREVIEW CARD */}
          {activePreviewTab === "question" ? (
            /* PREVIEW SOAL (QUENTEXT) */
            <div className="bg-white rounded-[24px] sm:rounded-[28px] p-5 shadow-sm border border-[#51465B]/15 space-y-3.5 text-xs leading-relaxed">
              {/* Badges */}
              <div className="flex items-center justify-between flex-wrap gap-1.5 pb-2.5 border-b border-slate-100">
                <span className="px-2.5 py-1 rounded-full bg-[#FAF7F3] border border-[#E9E5E8] text-[#51465B] font-extrabold text-[11px]">
                  {currentQuestion.subject}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Valid BPS</span>
                </span>
              </div>

              {/* Local Context Tag */}
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#51465B]">
                <MapPin className="w-3.5 h-3.5 text-[#F47D83]" />
                <span>Konteks: {currentQuestion.region}</span>
              </div>

              {/* Question Text */}
              <p className="font-semibold text-slate-900 text-xs sm:text-[13px] leading-relaxed">
                {currentQuestion.prompt}
              </p>

              {/* Multiple Choice Options */}
              <div className="space-y-1.5 pt-1">
                {currentQuestion.options.map((opt) => (
                  <div
                    key={opt.label}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-medium transition-all ${
                      opt.isCorrect
                        ? "bg-emerald-50/80 border-emerald-300 text-emerald-950 font-bold"
                        : "bg-[#FAF7F3] border-slate-200 text-slate-800"
                    }`}
                  >
                    <span>
                      <strong className="mr-1.5">{opt.label}.</strong> {opt.text}
                    </span>
                    {opt.isCorrect && (
                      <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-200/60 px-2 py-0.5 rounded-md">
                        Kunci Jawaban
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Explanation Box */}
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-[11px] text-amber-950 space-y-1">
                <span className="font-bold block">Pembahasan Guru:</span>
                <p className="text-slate-700 leading-relaxed">
                  {currentQuestion.explanation}
                </p>
                <span className="text-[10px] text-slate-500 block pt-1 border-t border-amber-200/50">
                  Sumber Faktual: {currentQuestion.bpsSource}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(currentQuestion.prompt)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[#51465B] hover:bg-[#3E3547] text-white font-extrabold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedNotice ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#FFD36D]" />
                      <span>Salin Soal</span>
                    </>
                  )}
                </button>

                <Link
                  href="/teacher/questions/generator"
                  className="py-2.5 px-3 rounded-xl bg-[#FAF7F3] hover:bg-slate-100 border border-slate-200 text-[#51465B] font-bold text-[11px] transition-colors"
                >
                  Generator AI
                </Link>
              </div>
            </div>
          ) : (
            /* PREVIEW MATERI (MATTEXT) */
            <div className="bg-white rounded-[24px] sm:rounded-[28px] p-5 shadow-sm border border-[#51465B]/15 space-y-3.5 text-xs leading-relaxed">
              {/* Badges */}
              <div className="flex items-center justify-between flex-wrap gap-1.5 pb-2.5 border-b border-slate-100">
                <span className="px-2.5 py-1 rounded-full bg-[#FAF7F3] border border-[#E9E5E8] text-[#51465B] font-extrabold text-[11px]">
                  {currentMaterial.subject}
                </span>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                  <span>Fase C SD</span>
                </span>
              </div>

              {/* Title & Region */}
              <div>
                <h4 className="font-black text-slate-900 text-xs sm:text-[13px] leading-snug">
                  {currentMaterial.title}
                </h4>
                <div className="flex items-center gap-1 text-[11px] font-bold text-[#51465B] mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#F47D83]" />
                  <span>Fokus Wilayah: {currentMaterial.region}</span>
                </div>
              </div>

              {/* Learning Objective */}
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-[11px] text-blue-950">
                <strong className="block text-blue-900 mb-0.5">Tujuan Pembelajaran:</strong>
                <p className="text-slate-700">{currentMaterial.objective}</p>
              </div>

              {/* Narrative Summary */}
              <div className="space-y-1">
                <strong className="text-slate-800 text-[11px]">Narasi Konteks Lokal:</strong>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {currentMaterial.narrative}
                </p>
              </div>

              {/* Step Highlights */}
              <div className="space-y-1.5 pt-1">
                <strong className="text-slate-800 text-[11px]">Langkah Aktivitas Belajar:</strong>
                <ol className="list-decimal pl-4 space-y-1 text-[11px] text-slate-700">
                  {currentMaterial.steps.map((st, i) => (
                    <li key={i}>{st}</li>
                  ))}
                </ol>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(`${currentMaterial.title}\n\n${currentMaterial.narrative}`)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[#51465B] hover:bg-[#3E3547] text-white font-extrabold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedNotice ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#FFD36D]" />
                      <span>Salin Modul</span>
                    </>
                  )}
                </button>

                <Link
                  href="/teacher/materials/new"
                  className="py-2.5 px-3 rounded-xl bg-[#FAF7F3] hover:bg-slate-100 border border-slate-200 text-[#51465B] font-bold text-[11px] transition-colors"
                >
                  Editor Modul
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </TeacherWorkspaceShell>
  );
}
