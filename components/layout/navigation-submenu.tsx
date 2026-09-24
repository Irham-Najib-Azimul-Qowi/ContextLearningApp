"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, ChevronRight } from "lucide-react";
import { TEACHER_NAV_GROUPS } from "./teacher-nav-config";

interface NavigationSubmenuProps {
  openGroupId: string | null;
  onClose: () => void;
}

export function NavigationSubmenu({ openGroupId, onClose }: NavigationSubmenuProps) {
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);

  const group = TEACHER_NAV_GROUPS.find((g) => g.id === openGroupId);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (openGroupId) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openGroupId, onClose]);

  // Close on ESC key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    if (openGroupId) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openGroupId, onClose]);

  if (!group || !group.hasSubmenu || !group.subitems) {
    return null;
  }

  return (
    <div
      ref={panelRef}
      className="fixed left-[76px] sm:left-[80px] top-4 z-40 w-72 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-4 transition-all duration-200 animate-in fade-in slide-in-from-left-2"
      role="region"
      aria-label={`Submenu ${group.label}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <group.icon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm leading-tight">{group.label}</h3>
            <p className="text-[11px] text-slate-500">Kelompok Menu</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
          aria-label="Tutup Submenu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Subitems List */}
      <nav className="flex flex-col gap-1">
        {group.subitems.map((subitem) => {
          const isActive = pathname === subitem.href;
          return (
            <Link
              key={subitem.id}
              href={subitem.href}
              onClick={onClose}
              className={`flex items-center justify-between p-2.5 rounded-xl transition-all ${
                isActive
                  ? "bg-indigo-50 text-indigo-700 font-medium"
                  : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div className="flex-1 pr-2">
                <span className="text-xs font-semibold block">{subitem.label}</span>
                <span className="text-[11px] text-slate-500 line-clamp-1">
                  {subitem.description}
                </span>
              </div>
              <ChevronRight
                className={`w-3.5 h-3.5 shrink-0 ${
                  isActive ? "text-indigo-600" : "text-slate-400"
                }`}
              />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
