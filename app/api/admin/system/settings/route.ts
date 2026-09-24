import { NextResponse } from "next/server";
import { getAuthenticatedAdmin, hasPermission } from "@/lib/admin/auth";
import { adminRepository } from "@/lib/admin/admin-repository";

export async function GET() {
  try {
    const authData = await getAuthenticatedAdmin();
    if (!authData || !hasPermission(authData.admin, "system.settings.manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const settings = adminRepository.getAllSettings();
    return NextResponse.json({ success: true, settings });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authData = await getAuthenticatedAdmin();
    if (!authData || !hasPermission(authData.admin, "system.settings.manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { key, value } = body;

    if (!key || typeof value !== "object") {
      return NextResponse.json({ error: "Key dan value object wajib diisi." }, { status: 400 });
    }

    const updated = adminRepository.setSetting(key, value, authData.admin.username);

    adminRepository.recordAuditLog({
      admin_id: authData.admin.id,
      admin_username: authData.admin.username,
      action: "SETTING_UPDATED",
      target_type: "SETTING",
      target_id: key,
      result: "SUCCESS",
      metadata: { key, value },
    });

    return NextResponse.json({ success: true, setting: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
