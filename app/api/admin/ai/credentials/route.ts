import { NextResponse } from "next/server";
import { getAuthenticatedAdmin, hasPermission } from "@/lib/admin/auth";
import { adminRepository } from "@/lib/admin/admin-repository";
import { encryptSecret, maskApiKey } from "@/lib/admin/crypto";

export async function GET() {
  try {
    const authData = await getAuthenticatedAdmin();
    if (!authData || !hasPermission(authData.admin, "ai.credentials.manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Never return encrypted_api_key or ciphertext to client
    const credentials = adminRepository.listCredentials().map((c) => ({
      id: c.id,
      name: c.name,
      provider: c.provider,
      quota_group: c.quota_group,
      masked_key: c.masked_key,
      priority: c.priority,
      is_enabled: c.is_enabled,
      health_status: c.health_status,
      circuit_state: c.circuit_state,
      consecutive_errors: c.consecutive_errors,
      daily_request_limit: c.daily_request_limit,
      last_used_at: c.last_used_at,
      last_error: c.last_error,
      last_error_at: c.last_error_at,
      notes: c.notes,
      created_at: c.created_at,
    }));

    return NextResponse.json({ success: true, credentials });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authData = await getAuthenticatedAdmin();
    if (!authData || !hasPermission(authData.admin, "ai.credentials.manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { name, apiKey, quotaGroup, priority, notes } = body;

    if (!name || !apiKey) {
      return NextResponse.json({ error: "Nama konfigurasi dan API Key wajib diisi." }, { status: 400 });
    }

    const cleanKey = apiKey.trim();
    const encrypted = encryptSecret(cleanKey);

    const newCred = adminRepository.addCredential({
      name: name.trim(),
      provider: "gemini",
      quota_group: (quotaGroup || "default_project").trim(),
      encrypted_api_key: encrypted.ciphertext,
      iv: encrypted.iv,
      auth_tag: encrypted.tag,
      masked_key: maskApiKey(cleanKey),
      priority: Number(priority) || 1,
      is_enabled: true,
      health_status: "healthy",
      consecutive_errors: 0,
      circuit_state: "CLOSED",
      circuit_opened_at: null,
      cooldown_seconds: 60,
      daily_request_limit: 1500,
      notes: notes || undefined,
    });

    adminRepository.recordAuditLog({
      admin_id: authData.admin.id,
      admin_username: authData.admin.username,
      action: "CREDENTIAL_CREATED",
      target_type: "CREDENTIAL",
      target_id: newCred.id,
      result: "SUCCESS",
      metadata: { name: newCred.name, quota_group: newCred.quota_group, masked_key: newCred.masked_key },
    });

    return NextResponse.json({
      success: true,
      message: `Kredensial '${newCred.name}' berhasil dienkripsi dan disimpan.`,
      credential: {
        id: newCred.id,
        name: newCred.name,
        masked_key: newCred.masked_key,
        quota_group: newCred.quota_group,
        priority: newCred.priority,
        is_enabled: newCred.is_enabled,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const authData = await getAuthenticatedAdmin();
    if (!authData || !hasPermission(authData.admin, "ai.credentials.manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { id, is_enabled, priority, quota_group, name } = body;

    const updated = adminRepository.updateCredential(id, {
      is_enabled: typeof is_enabled === "boolean" ? is_enabled : undefined,
      priority: typeof priority === "number" ? priority : undefined,
      quota_group: quota_group ? quota_group.trim() : undefined,
      name: name ? name.trim() : undefined,
    });

    if (!updated) {
      return NextResponse.json({ error: "Kredensial tidak ditemukan." }, { status: 404 });
    }

    adminRepository.recordAuditLog({
      admin_id: authData.admin.id,
      admin_username: authData.admin.username,
      action: "CREDENTIAL_UPDATED",
      target_type: "CREDENTIAL",
      target_id: id,
      result: "SUCCESS",
      metadata: { is_enabled: updated.is_enabled, priority: updated.priority },
    });

    return NextResponse.json({ success: true, credential: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const authData = await getAuthenticatedAdmin();
    if (!authData || !hasPermission(authData.admin, "ai.credentials.manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID wajib diisi." }, { status: 400 });

    const deleted = adminRepository.deleteCredential(id);

    adminRepository.recordAuditLog({
      admin_id: authData.admin.id,
      admin_username: authData.admin.username,
      action: "CREDENTIAL_DELETED",
      target_type: "CREDENTIAL",
      target_id: id,
      result: deleted ? "SUCCESS" : "FAILED",
      metadata: { id },
    });

    return NextResponse.json({ success: deleted });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
