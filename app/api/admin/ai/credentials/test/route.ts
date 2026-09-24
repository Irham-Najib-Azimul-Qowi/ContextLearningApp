import { NextResponse } from "next/server";
import { getAuthenticatedAdmin, hasPermission } from "@/lib/admin/auth";
import { aiProviderManager } from "@/lib/ai/ai-provider-manager";

export async function POST(request: Request) {
  try {
    const authData = await getAuthenticatedAdmin();
    if (!authData || !hasPermission(authData.admin, "ai.credentials.manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { credentialId } = body;
    if (!credentialId) {
      return NextResponse.json({ error: "credentialId wajib diisi." }, { status: 400 });
    }

    const testResult = await aiProviderManager.testConnection(credentialId);

    return NextResponse.json(testResult);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Internal server error" }, { status: 500 });
  }
}
