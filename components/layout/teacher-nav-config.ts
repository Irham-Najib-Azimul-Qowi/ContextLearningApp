import {
  LayoutDashboard,
  BookOpen,
  Brain,
  DoorOpen,
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
    label: "Dasbor",
    icon: LayoutDashboard,
    href: "/teacher/dashboard",
    hasSubmenu: false,
  },
  {
    id: "materials",
    label: "Materi",
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
    id: "questions",
    label: "Soal",
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
    id: "rooms",
    label: "Room",
    icon: DoorOpen,
    href: "/teacher/rooms",
    hasSubmenu: true,
    subitems: [
      {
        id: "rooms-all",
        label: "Daftar Room Akses",
        href: "/teacher/rooms",
        description: "Kelola link URL & kode akses materi/soal",
      },
      {
        id: "rooms-new",
        label: "Buat Room Baru",
        href: "/teacher/rooms/new",
        description: "Terbitkan kode akses baru untuk siswa",
      },
    ],
  },
];

