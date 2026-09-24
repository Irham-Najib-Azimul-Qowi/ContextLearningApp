import test from "node:test";
import assert from "node:assert/strict";
import { contextEngine } from "../lib/context-engine/pipeline";
import { defaultRetriever } from "../lib/context-engine/retrieval-adapter";

test("Contextual AI Engine Pipeline Tests", async (t) => {
  await t.test("defaultRetriever returns verified facts for Ponorogo", async () => {
    const response = await defaultRetriever.retrieve({
      region_id: "35.02",
      category: "commodity",
      query: "beras hasil bumi",
    });

    assert.ok(response.results.length > 0, "Should return at least one entity for Ponorogo");
    const porang = response.results.find((r) => r.name.toLowerCase().includes("porang"));
    assert.ok(porang, "Should retrieve Porang as primary agricultural commodity");
    assert.strictEqual(porang?.region_name, "Kabupaten Ponorogo");
  });

  await t.test("Contextual pipeline preserves mathematical quantities ($20 * 12.000 = 240.000$)", async () => {
    const result = await contextEngine.executePipeline({
      questionText:
        "Seorang pedagang membeli 20 kg beras dengan harga Rp12.000 per kilogram. Berapa total uang yang harus dibayarkan?",
      subject: "Matematika",
      grade: 5,
      regionId: "35.02",
      regionName: "Kabupaten Ponorogo",
      options: [
        { key: "A", text: "Rp220.000" },
        { key: "B", text: "Rp240.000" },
        { key: "C", text: "Rp260.000" },
        { key: "D", text: "Rp280.000" },
      ],
      explanation: "20 kg * Rp12.000 = Rp240.000",
    });

    assert.ok(result.contextualized_text.includes("porang"), "Commodity should be replaced with porang");
    assert.ok(result.contextualized_text.includes("20 kg"), "Original quantity 20 kg MUST be preserved");
    assert.ok(result.contextualized_text.includes("12.000"), "Original unit price Rp12.000 MUST be preserved");
    assert.strictEqual(result.validation.math_numbers_strictly_preserved, true, "Mathematical calculation must be valid");
    assert.strictEqual(result.validation.is_valid, true, "Overall validation must pass");
  });

  await t.test("Contextual pipeline handles cultural and tradition topics in Ponorogo", async () => {
    const result = await contextEngine.executePipeline({
      questionText:
        "Kesenian tradisional yang menggunakan topeng singa dan bulu merak adalah...",
      subject: "IPS",
      grade: 5,
      regionId: "35.02",
      regionName: "Kabupaten Ponorogo",
      options: [
        { key: "A", text: "Tari Gandrung" },
        { key: "B", text: "Kesenian Daerah Reog" },
        { key: "C", text: "Kuda Lumping" },
        { key: "D", text: "Wayang Orang" },
      ],
      explanation: "Kesenian tradisional khas daerah.",
    });

    assert.ok(result.contextualized_text.length > 0);
    assert.ok(result.variables.length > 0);
    assert.strictEqual(result.validation.is_valid, true);
  });
});
