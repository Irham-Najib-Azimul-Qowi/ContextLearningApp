import {
  LayoutDashboard,
  BookOpen,
  Brain,
  DoorOpen,
  LucideIcon,
} from "lucide-react";

export interface NavGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
}

export const TEACHER_NAV_GROUPS: NavGroup[] = [
  {
    id: "dashboard",
    label: "Dasbor",
    icon: LayoutDashboard,
    href: "/teacher/dashboard",
  },
  {
    id: "materials",
    label: "Materi",
    icon: BookOpen,
    href: "/teacher/materials",
  },
  {
    id: "questions",
    label: "Soal",
    icon: Brain,
    href: "/teacher/questions",
  },
  {
    id: "rooms",
    label: "Room",
    icon: DoorOpen,
    href: "/teacher/rooms",
  },
];
