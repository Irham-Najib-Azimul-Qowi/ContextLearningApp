"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/navbar";
import Container from "@/components/ui/container";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bell,
  CheckCircle2,
  BookOpen,
  ClipboardList,
  Users,
  ArrowRight,
} from "lucide-react";
import { repository } from "@/lib/db/repository";
import { Notification } from "@/lib/db/types";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const userId = "teacher-demo-01"; // or student-demo-01

  useEffect(() => {
    setNotifications(repository.getNotifications(userId));
  }, [userId]);

  const handleMarkAsRead = (id: string) => {
    repository.markNotificationAsRead(id);
    setNotifications([...repository.getNotifications(userId)]);
  };

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "exam":
        return <ClipboardList className="h-5 w-5 text-primary" />;
      case "material":
        return <BookOpen className="h-5 w-5 text-secondary" />;
      case "class":
        return <Users className="h-5 w-5 text-warning" />;
      case "grade":
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      default:
        return <Bell className="h-5 w-5 text-muted" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <Container className="py-8 sm:py-10">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary">Pusat Informasi</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Semua Notifikasi &amp; Aktivitas
          </h1>
          <p className="text-sm text-muted mt-1">
            Pantau perkembangan kelas, penugasan materi, jadwal ujian, dan evaluasi hasil belajar.
          </p>
        </div>

        <Card>
          <CardHeader className="py-4 border-b border-border/60">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" /> Riwayat Notifikasi
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0 divide-y divide-border/60">
            {notifications.length === 0 ? (
              <div className="p-12 text-center text-sm text-muted">
                Belum ada notifikasi baru saat ini.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-5 flex items-start gap-4 transition-colors hover:bg-slate-50/70 ${
                    !n.is_read ? "bg-indigo-50/20" : ""
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 mt-0.5">
                    {getIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-foreground truncate">{n.title}</h4>
                      <span className="text-xs text-muted/70">{n.created_at}</span>
                    </div>

                    <p className="text-xs text-muted mt-1 leading-relaxed">{n.message}</p>

                    <div className="mt-3 flex items-center gap-4">
                      {n.link && (
                        <Link
                          href={n.link}
                          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                        >
                          Buka Halaman Terkait <ArrowRight className="h-3 w-3" />
                        </Link>
                      )}

                      {!n.is_read && (
                        <button
                          onClick={() => handleMarkAsRead(n.id)}
                          className="text-xs text-muted hover:text-foreground font-medium"
                        >
                          Tandai sudah dibaca
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}
