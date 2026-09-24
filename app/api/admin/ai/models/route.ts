import { NextResponse } from "next/server";
import { getAuthenticatedAdmin, hasPermission } from "@/lib/admin/auth";
import { adminRepository } from "@/lib/admin/admin-repository";

export async function GET() {
  try {
    const authData = await getAuthenticatedAdmin();
    if (!authData || !hasPermission(authData.admin, "ai.models.manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const models = adminRepository.listModels();
    return NextResponse.json({ success: true, models });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const authData = await getAuthenticatedAdmin();
    if (!authData || !hasPermission(authData.admin, "ai.models.manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { featureKey, primaryModel, fallbackModel, temperature, timeoutMs, maxOutputTokens } = body;

    if (!featureKey) {
      return NextResponse.json({ error: "featureKey wajib diisi." }, { status: 400 });
    }

    const updated = adminRepository.updateModel(featureKey, {
      primary_model: primaryModel,
      fallback_model: fallbackModel,
      temperature: typeof temperature === "number" ? temperature : undefined,
      timeout_ms: typeof timeoutMs === "number" ? timeoutMs : undefined,
      max_output_tokens: typeof maxOutputTokens === "number" ? maxOutputTokens : undefined,
    });

    if (!updated) {
      return NextResponse.json({ error: "Konfigurasi model fitur tidak ditemukan." }, { status: 404 });
    }

    adminRepository.recordAuditLog({
      admin_id: authData.admin.id,
      admin_username: authData.admin.username,
      action: "MODEL_CONFIG_UPDATED",
      target_type: "MODEL",
      target_id: featureKey,
      result: "SUCCESS",
      metadata: { primaryModel, fallbackModel },
    });

    return NextResponse.json({ success: true, model: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
