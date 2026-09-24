import { NextResponse } from "next/server";
import { getAuthenticatedAdmin, hasPermission } from "@/lib/admin/auth";
import { adminRepository } from "@/lib/admin/admin-repository";

export async function GET() {
  try {
    const authData = await getAuthenticatedAdmin();
    if (!authData || !hasPermission(authData.admin, "ai.failover.manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const failovers = adminRepository.listFailoverEvents(50);
    const credentials = adminRepository.listCredentials().map((c) => ({
      id: c.id,
      name: c.name,
      quota_group: c.quota_group,
      priority: c.priority,
      health_status: c.health_status,
      circuit_state: c.circuit_state,
      consecutive_errors: c.consecutive_errors,
      cooldown_seconds: c.cooldown_seconds,
      last_error: c.last_error,
      last_error_at: c.last_error_at,
    }));

    return NextResponse.json({
      success: true,
      failovers,
      credentials,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authData = await getAuthenticatedAdmin();
    if (!authData || !hasPermission(authData.admin, "ai.failover.manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { credentialId, action } = body;

    if (action === "RESET_CIRCUIT") {
      adminRepository.updateCredential(credentialId, {
        circuit_state: "CLOSED",
        circuit_opened_at: null,
        consecutive_errors: 0,
        health_status: "healthy",
      });

      adminRepository.recordAuditLog({
        admin_id: authData.admin.id,
        admin_username: authData.admin.username,
        action: "CIRCUIT_BREAKER_RESET",
        target_type: "CREDENTIAL",
        target_id: credentialId,
        result: "SUCCESS",
        metadata: { action },
      });

      return NextResponse.json({ success: true, message: "Circuit breaker berhasil di-reset ke CLOSED." });
    }

    return NextResponse.json({ error: "Action tidak dikenal." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
