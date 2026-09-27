"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ManualQuestionPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/teacher/questions?method=manual");
  }, [router]);

  return null;
}
