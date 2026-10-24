"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewQuestionRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/teacher/questions?action=new");
  }, [router]);

  return null;
}
