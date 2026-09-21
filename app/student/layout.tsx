import React from "react";
import { StudentWorkspaceShell } from "@/components/layout/student-workspace-shell";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StudentWorkspaceShell>{children}</StudentWorkspaceShell>;
}
