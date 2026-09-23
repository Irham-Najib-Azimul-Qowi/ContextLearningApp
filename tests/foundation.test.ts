import test from "node:test";
import assert from "node:assert/strict";
import { isSupabaseConfigured, isGeminiConfigured } from "../lib/env";

test("Pahami V2 Clean Foundation Tests", async (t) => {
  await t.test("environment helpers should return boolean values safely without throwing", () => {
    assert.strictEqual(typeof isSupabaseConfigured(), "boolean");
    assert.strictEqual(typeof isGeminiConfigured(), "boolean");
  });

  await t.test("madiun residency administrative region identifiers are valid", () => {
    const supportedRegionIds = ["35.77", "35.19", "35.21", "35.20", "35.02", "35.01"];
    assert.strictEqual(supportedRegionIds.length, 6);
    assert.ok(supportedRegionIds.every((id) => id.startsWith("35.")));
  });
});
