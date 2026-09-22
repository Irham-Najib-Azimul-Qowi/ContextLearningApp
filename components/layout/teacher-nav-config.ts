import {
  LayoutDashboard,
  UsersRound,
  GraduationCap,
  BookOpen,
  ClipboardList,
  FileQuestion,
  Sparkles,
  PenLine,
  ScanLine,
  Compass,
  ClipboardCheck,
  Printer,
  MapPinned,
  MapPin,
  Building2,
  LucideIcon,
} from "lucide-react";

export interface SubmenuItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
}

export interface NavGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  hasSubmenu: boolean;
  matchPrefixes: string[];
  items?: SubmenuItem[];
}

export const TEACHER_NAV_GROUPS: NavGroup[] = [
  {
    id: "beranda",
    label: "Beranda",
    icon: LayoutDashboard,
    href: "/teacher/dashboard",
    hasSubmenu: false,
    matchPrefixes: ["/teacher/dashboard"],
  },
  {
    id: "kelas",
    label: "Kelas",
    icon: UsersRound,
    href: "/teacher/classes",
    hasSubmenu: true,
    matchPrefixes: [
      "/teacher/classes",
      "/teacher/students",
      "/teacher/materials",
      "/teacher/examinations",
    ],
    items: [
      {
        id: "classes",
        label: "Rombongan Belajar",
        href: "/teacher/classes",
        icon: UsersRound,
      },
      {
        id: "students",
        label: "Kelola Siswa",
        href: "/teacher/students",
        icon: GraduationCap,
      },
      {
        id: "materials",
        label: "Materi Ajar",
        href: "/teacher/materials",
        icon: BookOpen,
      },
      {
        id: "examinations",
        label: "Ujian & Penilaian",
        href: "/teacher/examinations",
        icon: ClipboardList,
        exact: true,
      },
    ],
  },
  {
    id: "bank-soal",
    label: "Bank Soal",
    icon: FileQuestion,
    href: "/teacher/questions",
    hasSubmenu: true,
    matchPrefixes: ["/teacher/questions"],
    items: [
      {
        id: "questions-all",
        label: "Semua Soal",
        href: "/teacher/questions",
        icon: FileQuestion,
        exact: true,
      },
      {
        id: "questions-gen",
        label: "Generate Soal AI",
        href: "/teacher/questions/generator",
        icon: Sparkles,
      },
      {
        id: "questions-manual",
        label: "Input Soal Manual",
        href: "/teacher/questions/manual",
        icon: PenLine,
      },
      {
        id: "questions-scan",
        label: "Scan Soal",
        href: "/teacher/questions/scan",
        icon: ScanLine,
      },
      {
        id: "questions-context",
        label: "Kontekstualisasi Soal",
        href: "/teacher/questions/context-preview",
        icon: Compass,
      },
    ],
  },
  {
    id: "dokumen",
    label: "Dokumen & Koreksi",
    icon: ClipboardCheck,
    href: "/teacher/print",
    hasSubmenu: true,
    matchPrefixes: ["/teacher/print", "/teacher/examinations/scan-correction"],
    items: [
      {
        id: "print",
        label: "Cetak Dokumen & Soal",
        href: "/teacher/print",
        icon: Printer,
      },
      {
        id: "scan-correction",
        label: "Koreksi Lembar Jawaban",
        href: "/teacher/examinations/scan-correction",
        icon: ScanLine,
      },
    ],
  },
  {
    id: "wilayah",
    label: "Wilayah",
    icon: MapPinned,
    href: "/teacher/school/settings",
    hasSubmenu: true,
    matchPrefixes: ["/teacher/school"],
    items: [
      {
        id: "school-settings",
        label: "Profil Wilayah Sekolah",
        href: "/teacher/school/settings",
        icon: MapPin,
      },
      {
        id: "school-institution",
        label: "Pengaturan Instansi",
        href: "/teacher/school",
        icon: Building2,
        exact: true,
      },
    ],
  },
];

/**
 * Finds the active NavGroup based on the current URL pathname.
 */
export function getActiveNavGroup(pathname: string): NavGroup {
  // Check special cases first (e.g., /teacher/examinations/scan-correction belongs to "dokumen")
  if (pathname.startsWith("/teacher/examinations/scan-correction")) {
    return TEACHER_NAV_GROUPS.find((g) => g.id === "dokumen") || TEACHER_NAV_GROUPS[0];
  }

  // Find matching group by prefix
  for (const group of TEACHER_NAV_GROUPS) {
    if (group.matchPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"))) {
      return group;
    }
  }

  // Fallback to Beranda
  return TEACHER_NAV_GROUPS[0];
}

/**
 * Checks if a specific submenu item is active given current pathname.
 */
export function isSubmenuItemActive(item: SubmenuItem, pathname: string): boolean {
  if (item.exact) {
    return pathname === item.href;
  }
  return pathname === item.href || pathname.startsWith(item.href + "/");
}
