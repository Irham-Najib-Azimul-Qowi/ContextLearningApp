import { TeacherWorkspaceShell } from "@/components/layout/teacher-workspace-shell";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TeacherWorkspaceShell>{children}</TeacherWorkspaceShell>;
}
