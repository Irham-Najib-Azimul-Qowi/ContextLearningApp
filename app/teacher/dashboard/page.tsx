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
} from "lucide-react";
import { TeacherWorkspaceShell } from "@/components/layout/teacher-workspace-shell";
import { repository } from "@/lib/db/repository";
import { School, UserProfile, ClassRoom, Question, LearningMaterial, Exam, ExamAttempt } from "@/lib/db/types";

const ACTIVE_CLIENTS = [
  {
    name: "Amy Pope",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    color: "border-blue-400 bg-blue-100 text-blue-800",
  },
  {
    name: "Lee Waters",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    color: "border-slate-500 bg-slate-100 text-slate-800",
  },
  {
    name: "Jonesy Jr",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
    color: "border-emerald-500 bg-emerald-100 text-emerald-800",
  },
  {
    name: "Jenny Wall",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
    color: "border-purple-400 bg-purple-100 text-purple-800",
  },
];

export default function TeacherDashboardPage() {
  const [school, setSchool] = useState<School | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [allSchools, setAllSchools] = useState<School[]>([]);

  useEffect(() => {
    const activeSchool = repository.getActiveSchool();
    setSchool(activeSchool);
    setUser(repository.getCurrentUser());
    setClasses(repository.getClasses(activeSchool.id));
    setQuestions(repository.getQuestions({ schoolId: activeSchool.id }));
    setMaterials(repository.getMaterials(activeSchool.id));
    setExams(repository.getExams(activeSchool.id));
    setAttempts(repository.getAttempts());
    setAllSchools(repository.getSchools());
  }, []);

  const handleSwitchSchool = (newSchoolId: string) => {
    repository.setActiveSchoolId(newSchoolId);
    const newSchool = repository.getActiveSchool();
    setSchool(newSchool);
    setClasses(repository.getClasses(newSchool.id));
    setQuestions(repository.getQuestions({ schoolId: newSchool.id }));
    setMaterials(repository.getMaterials(newSchool.id));
    setExams(repository.getExams(newSchool.id));
  };

  const todayFormatted = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    weekday: "long",
  }).format(new Date());

  const teacherFirstName = user?.full_name?.split(" ")[0]?.replace(",", "") || "Bu Siti";

  return (
    <TeacherWorkspaceShell activeGroupId="dashboard">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* ====================================================================
            CENTER MAIN COLUMN (8 COLS ON DESKTOP - MATCHING REFERENCE IMAGE)
            ==================================================================== */}
        <div className="xl:col-span-8 space-y-6">
          {/* 1. Header Greeting with Notification Bell */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#23212A] tracking-tight">
                Welcome back, {teacherFirstName}!
              </h1>
              <p className="text-xs sm:text-sm text-[#756F7A] font-medium mt-0.5">
                {todayFormatted}
              </p>
            </div>

            {/* Notification Bell with Badge */}
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
                Good Job!
              </h2>
              <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-normal">
                Konteks {school?.region_name || "Kota Madiun"} aktif dengan 21 siswa. 150+ butir soal dan modul ajar telah siap digunakan hari ini. Tetap semangat!
              </p>
            </div>

            {/* 3D Education Cart Graphic matching the reference mockup */}
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
          <div className="grid grid-cols-3 gap-3.5 sm:gap-5">
            {/* Metric 1 */}
            <div className="p-4 sm:p-5 rounded-[24px] sm:rounded-[28px] bg-white border border-[#E9E5E8] shadow-2xs text-center flex flex-col justify-center items-center hover:shadow-xs transition-shadow">
              <div className="text-2xl sm:text-3xl font-black text-[#23212A] tracking-tight">
                +8,5k
              </div>
              <div className="text-[11px] sm:text-xs font-semibold text-[#756F7A] mt-1">
                Favorite
              </div>
            </div>

            {/* Metric 2 */}
            <div className="p-4 sm:p-5 rounded-[24px] sm:rounded-[28px] bg-white border border-[#E9E5E8] shadow-2xs text-center flex flex-col justify-center items-center hover:shadow-xs transition-shadow">
              <div className="text-2xl sm:text-3xl font-black text-[#23212A] tracking-tight">
                +5,2k
              </div>
              <div className="text-[11px] sm:text-xs font-semibold text-[#756F7A] mt-1">
                Add to bag
              </div>
            </div>

            {/* Metric 3 */}
            <div className="p-4 sm:p-5 rounded-[24px] sm:rounded-[28px] bg-white border border-[#E9E5E8] shadow-2xs text-center flex flex-col justify-center items-center hover:shadow-xs transition-shadow">
              <div className="text-2xl sm:text-3xl font-black text-[#23212A] tracking-tight">
                +1,2k
              </div>
              <div className="text-[11px] sm:text-xs font-semibold text-[#756F7A] mt-1">
                Orders
              </div>
            </div>
          </div>

          {/* 4. Bottom Showcase Section: "Recent Sold" equivalent */}
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-black text-[#23212A] tracking-tight">
              Recent Sold
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
                    Editorial Bag: Kerajinan Lokal
                  </h4>
                  <p className="text-[11px] font-semibold text-[#756F7A] mt-0.5">
                    $1,8k earned &bull; 15 Butir Soal Terverifikasi
                  </p>
                </div>
              </div>

              {/* Right Tiles & Dresses Pill Card */}
              <div className="sm:col-span-5 flex flex-col justify-between gap-3.5">
                {/* Two Dark Mauve #51465B Icon Action Tiles (Glasses & Lock/Bag) */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Quentext Tile */}
                  <Link
                    href="/teacher/questions/new"
                    className="p-4 rounded-2xl sm:rounded-3xl bg-[#FAF7F3] border border-[#E9E5E8] flex flex-col items-center justify-center gap-2 hover:bg-[#51465B] text-[#23212A] hover:text-white transition-all group cursor-pointer text-center"
                    title="Buat Soal Quentext Baru"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#51465B] group-hover:bg-[#FFD36D] text-white group-hover:text-[#51465B] flex items-center justify-center shadow-xs transition-colors">
                      <Glasses className="w-6 h-6 stroke-[2.2]" />
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
                      <Lock className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <span className="text-[11px] font-bold">
                      Mattext
                    </span>
                  </Link>
                </div>

                {/* Coral Salmon Dresses Pill Card */}
                <div className="p-4 rounded-2xl sm:rounded-3xl bg-[#E8B2B7] text-[#23212A] flex items-center justify-between shadow-2xs">
                  <div>
                    <div className="text-xs sm:text-sm font-black text-[#23212A]">
                      Dresses
                    </div>
                    <div className="text-[10px] sm:text-[11px] font-semibold text-[#51465B]">
                      25 items &bull; $3,5k earned
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
            RIGHT PERFORMANCE PANEL (4 COLS ON DESKTOP - #FFD36D WARM YELLOW)
            ==================================================================== */}
        <div className="xl:col-span-4 rounded-[28px] sm:rounded-[36px] bg-[#FFD36D] p-6 sm:p-7 text-[#23212A] shadow-md space-y-6 border border-[#ECC159]">
          {/* 1. Header: "Performance" */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-[#23212A] tracking-tight">
              Performance
            </h2>
          </div>

          {/* 2. New clients (21) - see all */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-extrabold text-[#23212A]">
                New clients (21)
              </span>
              <Link
                href="/teacher/classes"
                className="text-[11px] font-bold text-[#51465B] hover:underline"
              >
                see all
              </Link>
            </div>

            {/* 4 Circular Avatars with Names */}
            <div className="grid grid-cols-4 gap-2 text-center">
              {ACTIVE_CLIENTS.map((client, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 ${client.color} shadow-xs mb-1.5 flex items-center justify-center`}
                  >
                    <img
                      src={client.avatar}
                      alt={client.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-[#23212A] truncate w-full">
                    {client.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Your progress */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#51465B]">
              Your progress
            </h3>

            {/* Card 1: Total Income ($ 15,5k) */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs space-y-2.5 border border-[#51465B]/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#23212A]">
                  Total Income
                </span>
                <span className="text-sm font-black text-[#23212A]">
                  $ 15,5k
                </span>
              </div>

              {/* Progress Bar (Gold fill on light track) */}
              <div className="h-1.5 w-full bg-[#F5E8C7] rounded-full overflow-hidden">
                <div className="h-full bg-[#E59B28] rounded-full w-[80%]" />
              </div>

              <div className="flex items-center justify-between text-[10px] sm:text-[11px]">
                <span className="text-[#756F7A] font-semibold flex items-center gap-1">
                  <ShoppingBag className="w-3.5 h-3.5 text-[#51465B]" />
                  <span>150 orders</span>
                </span>
                <span className="text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  <span>15%</span>
                </span>
              </div>
            </div>

            {/* Card 2: Worst Selling ($ 5,4k) */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs space-y-2.5 border border-[#51465B]/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#23212A]">
                  Worst Selling
                </span>
                <span className="text-sm font-black text-[#23212A]">
                  $ 5,4k
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 w-full bg-[#F5E8C7] rounded-full overflow-hidden">
                <div className="h-full bg-[#E59B28] rounded-full w-[45%]" />
              </div>

              <div className="flex items-center justify-between text-[10px] sm:text-[11px]">
                <span className="text-[#756F7A] font-semibold flex items-center gap-1">
                  <ShoppingBag className="w-3.5 h-3.5 text-[#51465B]" />
                  <span>85 orders</span>
                </span>
                <span className="text-rose-700 font-extrabold bg-rose-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <TrendingDown className="w-3 h-3" />
                  <span>10%</span>
                </span>
              </div>
            </div>

            {/* Card 3: Best Selling ($ 10,6k) */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs space-y-2.5 border border-[#51465B]/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#23212A]">
                  Best Selling
                </span>
                <span className="text-sm font-black text-[#23212A]">
                  $ 10,6k
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 w-full bg-[#F5E8C7] rounded-full overflow-hidden">
                <div className="h-full bg-[#E59B28] rounded-full w-[90%]" />
              </div>

              <div className="flex items-center justify-between text-[10px] sm:text-[11px]">
                <span className="text-[#756F7A] font-semibold flex items-center gap-1">
                  <ShoppingBag className="w-3.5 h-3.5 text-[#51465B]" />
                  <span>65 orders</span>
                </span>
                <span className="text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  <span>45%</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Context & Region Switcher */}
          <div className="pt-2 border-t border-[#51465B]/20 space-y-2.5">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#51465B] block">
              Sekolah & Daerah Aktif:
            </label>
            <select
              value={school?.id}
              onChange={(e) => handleSwitchSchool(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-[#51465B]/20 text-xs font-bold text-[#23212A] focus:outline-hidden focus:border-[#51465B] shadow-2xs"
            >
              {allSchools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.region_name})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </TeacherWorkspaceShell>
  );
}
