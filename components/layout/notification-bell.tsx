"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Bell, CheckCircle2, BookOpen, ClipboardList, Users } from "lucide-react";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  link?: string;
  type: "class" | "exam" | "material" | "grade" | "system";
  is_read: boolean;
  created_at: string;
}

export function NotificationBell({ initialNotifications = [] }: { initialNotifications?: NotificationItem[] }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    // Read from localStorage if any prototype notifications exist
    try {
      const stored = localStorage.getItem("contextlearning_notifications");
      if (stored) {
        setNotifications(JSON.parse(stored));
      } else if (initialNotifications.length > 0) {
        setNotifications(initialNotifications);
      }
    } catch {
      // ignore
    }
  }, [initialNotifications]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, is_read: true }));
    setNotifications(updated);
    try {
      localStorage.setItem("contextlearning_notifications", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "exam":
        return <ClipboardList className="h-4 w-4 text-primary" />;
      case "material":
        return <BookOpen className="h-4 w-4 text-secondary" />;
      case "class":
        return <Users className="h-4 w-4 text-warning" />;
      case "grade":
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      default:
        return <Bell className="h-4 w-4 text-muted" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Lihat notifikasi"
        className="relative rounded-xl border border-border bg-white p-2.5 text-muted hover:text-foreground hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-error text-[10px] font-bold text-white shadow-xs">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-border bg-white shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-3 bg-slate-50/50">
            <h4 className="text-sm font-bold text-foreground">Notifikasi</h4>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-medium text-primary hover:underline"
              >
                Tandai dibaca
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-border/40">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted">
                Belum ada notifikasi baru.
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 transition-colors hover:bg-slate-50 flex gap-3 ${
                    !item.is_read ? "bg-indigo-50/20" : ""
                  }`}
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {item.title}
                    </p>
                    <p className="text-xs text-muted line-clamp-2 mt-0.5">
                      {item.message}
                    </p>
                    <span className="text-[10px] text-muted/80 mt-1 block">
                      {item.created_at}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-border/60 p-2 text-center bg-slate-50/50">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-medium text-primary hover:underline block py-1"
            >
              Lihat Semua Notifikasi
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
