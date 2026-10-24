"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function CreateMaterialRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams?.get("tab") || "ai";

  useEffect(() => {
    if (tab === "ai") {
      router.replace("/teacher/materials?action=generate");
    } else if (["manual", "pdf", "photo"].includes(tab)) {
      const method = tab === "photo" ? "camera" : tab;
      router.replace(`/teacher/materials?method=${method}`);
    } else {
      router.replace("/teacher/materials?action=new");
    }
  }, [router, tab]);

  return null;
}

export default function CreateMaterialPage() {
  return (
    <Suspense fallback={null}>
      <CreateMaterialRedirect />
    </Suspense>
  );
}
