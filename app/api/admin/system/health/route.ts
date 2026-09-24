import { NextResponse } from "next/server";
import { getAuthenticatedAdmin, hasPermission } from "@/lib/admin/auth";
import { adminRepository } from "@/lib/admin/admin-repository";

export async function GET() {
  try {
    const authData = await getAuthenticatedAdmin();
    if (!authData || !hasPermission(authData.admin, "system.health.read")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const health = adminRepository.getSystemHealth();
    return NextResponse.json({ success: true, health });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
