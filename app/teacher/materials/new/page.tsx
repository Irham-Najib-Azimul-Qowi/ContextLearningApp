"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewMaterialRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/teacher/materials?action=new");
  }, [router]);

  return null;
}
