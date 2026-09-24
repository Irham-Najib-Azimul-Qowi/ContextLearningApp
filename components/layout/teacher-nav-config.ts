import {
  LayoutDashboard,
  BookOpen,
  Brain,
  ClipboardCheck,
  Users,
  Settings,
  Package,
  LucideIcon,
} from "lucide-react";

export interface SubmenuItem {
  id: string;
  label: string;
  href: string;
  description: string;
}

export interface NavGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  hasSubmenu: boolean;
  subitems?: SubmenuItem[];
}

export const TEACHER_NAV_GROUPS: NavGroup[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/teacher/dashboard",
    hasSubmenu: false,
  },
  {
    id: "questions",
    label: "Soal (Quentext)",
    icon: Brain,
    href: "/teacher/questions",
    hasSubmenu: true,
    subitems: [
      {
        id: "questions-all",
        label: "Semua Soal",
        href: "/teacher/questions",
        description: "Katalog bank soal terkontekstualisasi",
      },
      {
        id: "questions-gen",
        label: "Generate Soal AI",
        href: "/teacher/questions/generator",
        description: "Buat butir soal otomatis via Gemini AI",
      },
      {
        id: "questions-manual",
        label: "Input Soal Manual",
        href: "/teacher/questions/manual",
        description: "Tulis soal sendiri & analisis konteks",
      },
      {
        id: "questions-scan",
        label: "Scan / Upload Soal",
        href: "/teacher/questions/scan",
        description: "Ekstraksi foto lembar soal fisik (OCR)",
      },
      {
        id: "questions-preview",
        label: "Kontekstualisasi Soal",
        href: "/teacher/questions/context-preview",
        description: "Komparasi side-by-side & validasi lokal",
      },
    ],
  },
  {
    id: "materials",
    label: "Materi (Mattext)",
    icon: BookOpen,
    href: "/teacher/materials",
    hasSubmenu: true,
    subitems: [
      {
        id: "materials-all",
        label: "Semua Modul Materi",
        href: "/teacher/materials",
        description: "Modul ajar kurikulum terkontekstualisasi",
      },
      {
        id: "materials-new",
        label: "Buat Materi Baru",
        href: "/teacher/materials/new",
        description: "Susun modul ajar berbasis konteks lokal",
      },
    ],
  },
  {
    id: "classes",
    label: "Daftar Siswa",
    icon: Users,
    href: "/teacher/classes",
    hasSubmenu: true,
    subitems: [
      {
        id: "classes-all",
        label: "Daftar Kelas",
        href: "/teacher/classes",
        description: "Kelola kelas dan kode gabung siswa",
      },
      {
        id: "classes-exams",
        label: "Ujian Kelas",
        href: "/teacher/examinations",
        description: "Jadwal dan sesi ujian kelas",
      },
    ],
  },
  {
    id: "evaluation",
    label: "Evaluasi & Hasil",
    icon: ClipboardCheck,
    href: "/teacher/examinations",
    hasSubmenu: true,
    subitems: [
      {
        id: "eval-exams",
        label: "Daftar Ujian",
        href: "/teacher/examinations",
        description: "Ruang ujian aktif dan terjadwal",
      },
      {
        id: "eval-essay",
        label: "Pemeriksaan Jawaban",
        href: "/teacher/examinations/review-essay",
        description: "Penilaian esai dengan bantuan AI",
      },
    ],
  },
  {
    id: "settings",
    label: "Pengaturan",
    icon: Settings,
    href: "/teacher/settings",
    hasSubmenu: false,
  },
];
