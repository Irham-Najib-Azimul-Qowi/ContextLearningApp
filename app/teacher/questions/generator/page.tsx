"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function QuestionGeneratorRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/teacher/questions?action=generate");
  }, [router]);

  return null;
}
