"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { IconNavigationRail } from "./icon-navigation-rail";
import { GlobalControls } from "./global-controls";
import { repository } from "@/lib/db/repository";

interface TeacherWorkspaceShellProps {
  children: React.ReactNode;
  activeGroupId?: string;
  forcedContextMode?: "material" | "question";
}

export function TeacherWorkspaceShell({
  children,
  activeGroupId = "dashboard",
  forcedContextMode,
}: TeacherWorkspaceShellProps) {
  const pathname = usePathname();

  // Resolve initial context mode:
  // 1. Forced prop if given
  // 2. Route matching: /teacher/questions -> "question", /teacher/materials -> "material"
  // 3. Last used context mode from repository
  const getInitialMode = (): "material" | "question" => {
    if (forcedContextMode) return forcedContextMode;
    if (pathname && pathname.startsWith("/teacher/questions")) {
      return "question";
    }
    if (pathname && pathname.startsWith("/teacher/materials")) {
      return "material";
    }
    return repository.getLastContextMode();
  };

  const [contextMode, setContextMode] = useState<"material" | "question">(getInitialMode());
  
  // Initialize collapsed by default on mobile to prevent transition glitches during page navigation
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768;
    }
    return true;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsCollapsed(window.innerWidth < 768);
    }
  }, []);

  useEffect(() => {
    // If route specifies feature, set and persist it
    if (pathname && pathname.startsWith("/teacher/questions")) {
      setContextMode("question");
      repository.setLastContextMode("question");
    } else if (pathname && pathname.startsWith("/teacher/materials")) {
      setContextMode("material");
      repository.setLastContextMode("material");
    } else {
      setContextMode(repository.getLastContextMode());
    }

    // Listen to live context mode changes (e.g. from Preview tabs toggle on dashboard)
    const handleContextChange = (e: any) => {
      if (e.detail) {
        setContextMode(e.detail);
      }
    };
    window.addEventListener("contextModeChange", handleContextChange);
    return () => window.removeEventListener("contextModeChange", handleContextChange);
  }, [pathname]);

  const isQuestion = contextMode === "question";
  const shellBg = isQuestion ? "bg-[#FFD36D]" : "bg-[#51465B]";

  return (
    <div
      className={`h-screen max-h-screen w-full ${shellBg} flex flex-row relative overflow-hidden text-[#23212A] antialiased transition-colors duration-300`}
    >
      {/* 1. Left Vertical Navigation Sidebar (Desktop fixed screen height, fits without page scroll) */}
      <IconNavigationRail
        activeGroupId={activeGroupId}
        contextMode={contextMode}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
      />

      {/* 2. Floating Top-Right Controls (Collapsible Profile Circle -> Feature Themed Pill) */}
      <GlobalControls contextMode={contextMode} />

      {/* 3. Main Content Section (Layered Stacking Card with rounded corners revealing theme background) */}
      <div className={`flex-1 flex flex-col min-w-0 ${shellBg} h-screen max-h-screen overflow-hidden transition-colors duration-300`}>
        <main className="flex-1 bg-[#FAF7F3] rounded-tl-[24px] sm:rounded-tl-[42px] rounded-bl-[24px] sm:rounded-bl-[42px] shadow-2xl p-4 sm:p-7 lg:p-9 h-screen max-h-screen overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
