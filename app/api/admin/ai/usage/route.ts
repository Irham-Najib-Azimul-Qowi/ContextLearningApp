import { NextResponse } from "next/server";
import { getAuthenticatedAdmin, hasPermission } from "@/lib/admin/auth";
import { adminRepository } from "@/lib/admin/admin-repository";

export async function GET(request: Request) {
  try {
    const authData = await getAuthenticatedAdmin();
    if (!authData || !hasPermission(authData.admin, "ai.usage.read")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const filterFeature = searchParams.get("feature") || "ALL";
    const limit = Number(searchParams.get("limit")) || 50;

    const events = adminRepository.listUsageEvents(limit, filterFeature);

    // Aggregate statistics
    const totalRequests = events.length;
    const successfulRequests = events.filter((e) => e.status === "SUCCESS" || e.status === "FAILED_OVER").length;
    const failedRequests = events.filter((e) => e.status === "ERROR" || e.status === "RATE_LIMITED" || e.status === "QUOTA_EXCEEDED").length;
    const totalInputTokens = events.reduce((sum, e) => sum + e.input_tokens, 0);
    const totalOutputTokens = events.reduce((sum, e) => sum + e.output_tokens, 0);
    const totalTokens = totalInputTokens + totalOutputTokens;

    const avgLatency =
      events.length > 0
        ? Math.round(events.reduce((sum, e) => sum + e.latency_ms, 0) / events.length)
        : 0;

    // Feature breakdown
    const featureBreakdown: Record<string, { requests: number; tokens: number }> = {};
    for (const ev of events) {
      if (!featureBreakdown[ev.feature_key]) {
        featureBreakdown[ev.feature_key] = { requests: 0, tokens: 0 };
      }
      featureBreakdown[ev.feature_key].requests++;
      featureBreakdown[ev.feature_key].tokens += ev.total_tokens;
    }

    return NextResponse.json({
      success: true,
      metrics: {
        totalRequests,
        successfulRequests,
        failedRequests,
        totalInputTokens,
        totalOutputTokens,
        totalTokens,
        avgLatencyMs: avgLatency,
      },
      featureBreakdown,
      events,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
