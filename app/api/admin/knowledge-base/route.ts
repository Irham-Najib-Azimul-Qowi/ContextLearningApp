import { NextResponse } from "next/server";
import { getAuthenticatedAdmin, hasPermission } from "@/lib/admin/auth";

const REGION_STATISTICS = [
  { id: "35.77", name: "Kota Madiun", verified_entities: 3, coverage_pct: 100 },
  { id: "35.19", name: "Kabupaten Madiun", verified_entities: 3, coverage_pct: 100 },
  { id: "35.21", name: "Kabupaten Ngawi", verified_entities: 3, coverage_pct: 100 },
  { id: "35.20", name: "Kabupaten Magetan", verified_entities: 3, coverage_pct: 100 },
  { id: "35.02", name: "Kabupaten Ponorogo", verified_entities: 4, coverage_pct: 100 },
  { id: "35.01", name: "Kabupaten Pacitan", verified_entities: 3, coverage_pct: 100 },
  { id: "33.74", name: "Kota Semarang", verified_entities: 3, coverage_pct: 100 },
];

export async function GET() {
  try {
    const authData = await getAuthenticatedAdmin();
    if (!authData || !hasPermission(authData.admin, "knowledge.read")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const totalRegions = REGION_STATISTICS.length;
    const totalEntities = REGION_STATISTICS.reduce((acc, r) => acc + r.verified_entities, 0);

    return NextResponse.json({
      success: true,
      stats: {
        total_regions: totalRegions,
        total_entities: totalEntities,
        verified_count: totalEntities,
        needs_review_count: 0,
        embedding_model: "text-embedding-3-small (1536 dim)",
        vector_db: "Supabase pgvector v0.8.2 (Seoul)",
        last_sync: "2026-09-24T12:00:00Z",
      },
      regions: REGION_STATISTICS,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
