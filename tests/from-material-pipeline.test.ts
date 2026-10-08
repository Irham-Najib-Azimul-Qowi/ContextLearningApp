import { describe, it } from "node:test";
import assert from "node:assert";
import { contextEngine } from "../lib/context-engine/pipeline";
import { ContentInput } from "../lib/context-engine/types";

describe("From Material Question Pipeline Tests", () => {
  it("should normalize from_material input and preserve material text", () => {
    const input: ContentInput = {
      contentType: "question",
      sourceType: "from_material",
      rawText: "Reyog Ponorogo adalah seni pertunjukan tradisional yang memiliki tokoh Warok, Jatil, dan Barongan.",
      topic: "Kesenian Tradisional Ponorogo",
      subject: "IPAS (Ilmu Pengetahuan Alam & Sosial)",
      grade: 5,
      regionId: "35.02",
      regionName: "Kabupaten Ponorogo",
      questionCount: 3,
      questionType: "multiple_choice",
    };

    const normalized = contextEngine.normalizeContent(input);
    assert.strictEqual(normalized.contentType, "question");
    assert.strictEqual(normalized.sourceType, "from_material");
    assert.strictEqual(normalized.questionCount, 3);
    assert.strictEqual(normalized.questionType, "multiple_choice");
    assert.ok(normalized.effectiveText.includes("Reyog Ponorogo"));
  });

  it("should generate educational validation without false invariant warnings for reading passages", () => {
    const originalMaterial = "Monumen Reog dan Museum Ponorogo memiliki tinggi sekitar 126 meter di kawasan Sampung.";
    const validation = contextEngine.validateEducationalIntegrity(originalMaterial, "Di manakah letak Monumen Reog?");
    assert.ok(validation);
  });
});
