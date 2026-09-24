"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminRootPage() {
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/auth/me")
      .then((res) => {
        if (res.ok) {
          router.replace("/admin/dashboard");
        } else {
          router.replace("/admin/login");
        }
      })
      .catch(() => {
        router.replace("/admin/login");
      });
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FAF7F3] flex items-center justify-center font-sans">
      <div className="text-xs font-bold text-[#756F7A] animate-pulse">
        Memeriksa sesi otorisasi Admin...
      </div>
    </div>
  );
}
