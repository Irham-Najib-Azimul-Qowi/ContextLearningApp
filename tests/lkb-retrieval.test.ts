import test from "node:test";
import assert from "node:assert/strict";
import {
  MockLocalContextRetriever,
  SupabaseLocalContextRetriever,
  RetrievalRequest,
  RetrievalResponse,
} from "../lib/context-engine/retrieval-adapter";

test("Local Knowledge Base (LKB) Retrieval & Verification Tests", async (t) => {
  const retriever = new MockLocalContextRetriever();

  await t.test("Zero Region Leakage: searching Ponorogo facts in Kota Madiun yields no Ponorogo entities", async () => {
    const response = await retriever.retrieve({
      region_id: "35.77", // Kota Madiun
      query: "reog dhadak merak ponorogo",
      category: "tradition",
    });

    // Should not return Reog Ponorogo (35.02) when querying Kota Madiun (35.77)
    const hasReog = response.results.some((r) => r.name.toLowerCase().includes("reog"));
    assert.strictEqual(hasReog, false, "Must not leak Reog from Ponorogo to Kota Madiun");
    assert.strictEqual(response.requested_region_id, "35.77");
  });

  await t.test("Verified facts only: all returned entities have verification_status === 'verified'", async () => {
    const response = await retriever.retrieve({
      region_id: "35.77",
      query: "pecel pincuk madiun",
    });

    assert.ok(response.results.length > 0, "Should return verified pecel entity");
    for (const item of response.results) {
      assert.strictEqual(
        item.verification_status,
        "verified",
        "Returned entity must be verified"
      );
      assert.ok(item.entity_id, "Entity must have valid identifier");
      assert.ok(item.region_id, "Entity must have region_id");
      assert.ok(item.region_name, "Entity must have region_name");
      assert.ok(item.source_url, "Entity must have provenance source url");
    }
  });

  await t.test("District fallback behavior: district code resolves cleanly to parent regency", async () => {
    // 35.02.01 (Slahung, Ponorogo) -> falls back to 35.02
    const response = await retriever.retrieve({
      region_id: "35.02.01",
      query: "porang",
    });

    assert.ok(response.results.length > 0, "Should resolve to Ponorogo regional knowledge");
    assert.strictEqual(response.results[0].region_id, "35.02");
  });

  await t.test("Category isolation: mismatched category yields no false positives", async () => {
    // Searching culinary keyword with 'geography' filter
    const response = await retriever.retrieve({
      region_id: "35.77",
      category: "geography",
      query: "pecel sambal kacang",
    });

    const hasPecel = response.results.some((r) => r.name.toLowerCase().includes("pecel"));
    assert.strictEqual(hasPecel, false, "Culinary pecel must not match geography category filter");
  });

  await t.test("SupabaseLocalContextRetriever falls back gracefully when unconfigured", async () => {
    const supabaseRetriever = new SupabaseLocalContextRetriever();
    const response = await supabaseRetriever.retrieve({
      region_id: "35.02",
      query: "porang",
      limit: 3,
    });

    assert.ok(response.results.length > 0, "Should return results via graceful fallback");
    assert.ok(
      response.results.some((r) => r.name.toLowerCase().includes("porang")),
      "Should contain porang"
    );
  });
});
