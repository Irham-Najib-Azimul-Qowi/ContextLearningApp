"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreateRoomPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/teacher/rooms?action=new");
  }, [router]);

  return null;
}
