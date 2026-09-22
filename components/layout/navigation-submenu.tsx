"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { NavGroup, isSubmenuItemActive } from "./teacher-nav-config";

interface NavigationSubmenuProps {
  group: NavGroup;
  onClose: () => void;
  onNavigate?: () => void;
}

export function NavigationSubmenu({ group, onClose, onNavigate }: NavigationSubmenuProps) {
  const pathname = usePathname();

  if (!group.hasSubmenu || !group.items || group.items.length === 0) {
    return null;
  }

  return (
    <nav
      className="w-56 sm:w-60 bg-white border-r border-slate-200/90 flex flex-col shrink-0 z-10 select-none animate-in fade-in duration-100 h-screen"
      aria-label={`Submenu ${group.label}`}
    >
      {/* Submenu Panel Header */}
      <div className="h-12 px-3.5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-600" aria-hidden="true" />
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            {group.label}
          </h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-6 h-6 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          title="Tutup panel submenu"
          aria-label="Tutup panel"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Submenu Destination Items */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 text-xs">
        {group.items.map((item) => {
          const isActive = isSubmenuItemActive(item, pathname);
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => {
                if (onNavigate) onNavigate();
              }}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors group ${
                isActive
                  ? "bg-indigo-50 text-indigo-700 font-semibold shadow-2xs"
                  : "text-slate-700 font-medium hover:bg-slate-50 hover:text-slate-950"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
                }`}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
