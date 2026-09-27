"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { IconNavigationRail } from "./icon-navigation-rail";
import { GlobalControls } from "./global-controls";
import { PahamiPuzzleLogo } from "@/components/landing/puzzle-logo";
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

      // 1. Trigger initial 2-way cloud sync across devices
      repository.syncWithCloud();

      // 2. Sync whenever window regains focus (switching back from another window/app)
      const handleFocus = () => {
        repository.syncWithCloud();
      };

      // 3. Sync whenever tab visibility changes to visible
      const handleVisibilityChange = () => {
        if (document.visibilityState === "visible") {
          repository.syncWithCloud();
        }
      };

      // 4. Background heartbeat sync every 30s to keep devices in sync while open
      const interval = setInterval(() => {
        if (document.visibilityState === "visible") {
          repository.syncWithCloud();
        }
      }, 30000);

      window.addEventListener("focus", handleFocus);
      document.addEventListener("visibilitychange", handleVisibilityChange);

      // 5. Trigger sync upon Supabase auth session initialization
      let authUnsubscribe: (() => void) | null = null;
      import("@/lib/supabase/client").then(({ createClient }) => {
        try {
          const supabase = createClient();
          const { data } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
              repository.syncWithCloud();
            }
          });
          authUnsubscribe = () => data.subscription.unsubscribe();
        } catch {
          // Fallback
        }
      });

      return () => {
        window.removeEventListener("focus", handleFocus);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        clearInterval(interval);
        if (authUnsubscribe) authUnsubscribe();
      };
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
      className={`h-screen max-h-screen w-full ${shellBg} flex flex-col md:flex-row relative overflow-hidden text-[#23212A] antialiased transition-colors duration-300`}
    >
      {/* 1. Mobile Top Bar (< md) */}
      <header className={`md:hidden flex items-center justify-between px-4 h-14 shrink-0 ${shellBg} z-20 relative select-none`}>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsCollapsed(false)}
            className={`p-2 rounded-2xl ${
              isQuestion
                ? "bg-[#251E2B]/10 hover:bg-[#251E2B]/20 text-[#251E2B]"
                : "bg-white/10 hover:bg-white/20 text-white"
            } transition-colors cursor-pointer flex items-center justify-center`}
            aria-label="Buka Menu Navigasi"
            title="Buka Menu"
          >
            <Menu className="w-5 h-5 stroke-[2.2]" />
          </button>
          <div className="flex items-center">
            <PahamiPuzzleLogo
              size="sm"
              theme={isQuestion ? "light" : "dark"}
              showText={true}
            />
          </div>
        </div>
        {/* Placeholder spacer for GlobalControls on mobile */}
        <div className="w-12 h-10" />
      </header>

      {/* 2. Left Vertical Navigation Sidebar (Desktop fixed screen height, fits without page scroll) */}
      <IconNavigationRail
        activeGroupId={activeGroupId}
        contextMode={contextMode}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
      />

      {/* 3. Floating Top-Right Controls (Collapsible Profile Circle -> Feature Themed Pill) */}
      <GlobalControls contextMode={contextMode} />

      {/* 4. Main Content Section (Layered Stacking Card with rounded corners revealing theme background) */}
      <div className={`flex-1 flex flex-col min-w-0 ${shellBg} h-[calc(100vh-56px)] md:h-screen md:max-h-screen overflow-hidden transition-colors duration-300`}>
        <main className="flex-1 bg-[#FAF7F3] rounded-t-[28px] md:rounded-t-none md:rounded-tl-[42px] md:rounded-bl-[42px] shadow-2xl p-4 sm:p-7 lg:p-9 h-full max-h-full overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
