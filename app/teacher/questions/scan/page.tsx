"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ScanQuestionRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams?.get("mode") === "pdf" ? "pdf" : "camera";

  useEffect(() => {
    router.replace(`/teacher/questions?method=${mode}`);
  }, [router, mode]);

  return null;
}

export default function ScanQuestionPage() {
  return (
    <Suspense fallback={null}>
      <ScanQuestionRedirect />
    </Suspense>
  );
}
