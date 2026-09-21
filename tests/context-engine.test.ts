import { describe, it } from "node:test";
import assert from "node:assert";
import { extractContextVariables } from "../lib/context-engine/variable-extractor";
import { mapContextToTemplate } from "../lib/context-engine/context-mapper";
import { validateContextualization } from "../lib/context-engine/educational-validator";
import { executeContextualization } from "../lib/context-engine";

describe("Contextual AI Engine Pipeline Tests", () => {
  it("should extract bracketed contextual variables from template text", () => {
    const text = "Seorang [OCCUPATION] menjual 20 kg [COMMODITY] di [MARKET].";
    const { detected } = extractContextVariables(text);

    assert.strictEqual(detected.length, 3);
    assert.strictEqual(detected[0].key, "OCCUPATION");
    assert.strictEqual(detected[1].key, "COMMODITY");
    assert.strictEqual(detected[2].key, "MARKET");
  });

  it("should map variables to Samarinda (Kalimantan Timur) context", () => {
    const text = "Seorang [OCCUPATION] memiliki 24 kg [COMMODITY]. Sebanyak 9 kg dijual di [MARKET].";
    const { detected } = extractContextVariables(text);

    const mapped = mapContextToTemplate(text, detected, "region-samarinda");

    assert.ok(mapped.contextualizedText.includes("Nelayan Air Tawar"));
    assert.ok(mapped.contextualizedText.includes("Ikan Haruan"));
    assert.ok(mapped.contextualizedText.includes("Pasar Pagi"));
  });

  it("should map variables to Sleman (DI Yogyakarta) context", () => {
    const text = "Seorang [OCCUPATION] memiliki 24 kg [COMMODITY]. Sebanyak 9 kg dijual di [MARKET].";
    const { detected } = extractContextVariables(text);

    const mapped = mapContextToTemplate(text, detected, "region-sleman");

    assert.ok(mapped.contextualizedText.includes("Petani Salak Pondoh"));
    assert.ok(mapped.contextualizedText.includes("Salak Pondoh"));
    assert.ok(mapped.contextualizedText.includes("Pasar Beringharjo"));
  });

  it("should strictly preserve numeric values and validate mathematics subtraction", () => {
    const orig = "Seorang pedagang memiliki 24 kg beras. Sebanyak 9 kg dijual di pasar.";
    const cont = "Seorang Nelayan Air Tawar memiliki 24 kg Ikan Haruan. Sebanyak 9 kg dijual di Pasar Pagi.";

    const report = validateContextualization("Matematika", orig, cont);

    assert.strictEqual(report.is_valid, true);
    assert.strictEqual(report.status, "verified");
    assert.strictEqual(report.recalculated_answer, "15 kg");
  });

  it("should flag validation warning if mathematical numbers were altered", () => {
    const orig = "Seorang pedagang memiliki 24 kg beras. Sebanyak 9 kg dijual di pasar.";
    const cont = "Seorang Nelayan Air Tawar memiliki 50 kg Ikan Haruan. Sebanyak 9 kg dijual di Pasar Pagi.";

    const report = validateContextualization("Matematika", orig, cont);

    assert.strictEqual(report.is_valid, false);
    assert.strictEqual(report.status, "needs_review");
  });

  it("should execute full contextualization pipeline successfully", () => {
    const result = executeContextualization({
      subject: "Matematika",
      grade: 5,
      original_text: "Seorang [OCCUPATION] menjual 12 kg [COMMODITY] di [MARKET].",
      context_variables: [
        { key: "OCCUPATION", category: "economy", replaceable: true, original_value: "[OCCUPATION]" },
        { key: "COMMODITY", category: "economy", replaceable: true, original_value: "[COMMODITY]" },
        { key: "MARKET", category: "infrastructure", replaceable: true, original_value: "[MARKET]" },
      ],
      correct_answer: "B",
      region_id: "region-samarinda",
    });

    assert.strictEqual(result.validation.is_valid, true);
    assert.ok(result.contextualized_text.includes("Nelayan Air Tawar"));
    assert.ok(result.region_name.includes("Samarinda"));
  });
});
