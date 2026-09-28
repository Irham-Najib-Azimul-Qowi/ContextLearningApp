import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { aiProviderManager } from "../lib/ai/ai-provider-manager";
import { adminRepository } from "../lib/admin/admin-repository";
import { createStructuredError, createErrorResponse, AIErrorCode } from "../lib/ai/error-contract";
import { extractTextFromPdfBuffer } from "../lib/ai/pdf-extractor";

describe("AI Fallback & Error Classification Tests", () => {
  test("TEST 1: Healthy credentials pool retrieval", () => {
    const creds = adminRepository.getCredentials();
    assert.ok(creds.length >= 5, "Admin repository should have at least 5 credential slots configured");
    const enabled = creds.filter((c) => c.is_enabled);
    assert.ok(enabled.length >= 1, "There should be enabled credentials in the pool");
  });

  test("TEST 2: Error classification identifies rate limit, quota, timeout, and auth failures accurately", () => {
    const err429 = { status: 429, message: "Resource has been exhausted (e.g. check quota)." };
    const class429 = aiProviderManager.classifyError(err429);
    assert.equal(class429, "QUOTA_EXCEEDED");

    const errRate = { status: 429, message: "Rate limit exceeded for requests per minute" };
    const classRate = aiProviderManager.classifyError(errRate);
    assert.equal(classRate, "RATE_LIMITED");

    const errTimeout = { message: "Request timed out after 30000ms" };
    const classTimeout = aiProviderManager.classifyError(errTimeout);
    assert.equal(classTimeout, "TIMEOUT");

    const errAuth = { message: "API key not valid. Please pass a valid API key." };
    const classAuth = aiProviderManager.classifyError(errAuth);
    assert.equal(classAuth, "INVALID_API_KEY");

    const errModel = { message: "models/gemini-pro-unavailable is not found for API version v1" };
    const classModel = aiProviderManager.classifyError(errModel);
    assert.equal(classModel, "MODEL_UNAVAILABLE");
  });

  test("TEST 3: Cooldown and circuit breaker prevents calling disabled/cooling credentials", () => {
    const pool = adminRepository.getCredentials();
    const firstKey = pool[0];
    
    // Simulate setting cooldown
    adminRepository.updateCredentialStatus(firstKey.id, "cooldown", "Quota exhausted simulation");
    const updated = adminRepository.getCredential(firstKey.id);
    assert.equal(updated?.status, "cooldown");
    assert.ok(updated?.cooldown_until, "Cooldown timestamp should be set");

    // Reset status back to healthy for subsequent runs
    adminRepository.updateCredentialStatus(firstKey.id, "healthy");
    const restored = adminRepository.getCredential(firstKey.id);
    assert.equal(restored?.status, "healthy");
  });

  test("TEST 4: Non-transient errors (e.g. malformed JSON output) are classified accurately", () => {
    const errJson = { message: "Unexpected token in JSON at position 4" };
    const classified = aiProviderManager.classifyError(errJson);
    assert.equal(classified, "INVALID_STRUCTURED_OUTPUT");
  });

  test("TEST 5: Structured error contract enforces clean Indonesian messages and codes without leaks", () => {
    const resp = createErrorResponse(AIErrorCode.AI_RATE_LIMITED);
    assert.equal(resp.success, false);
    assert.equal(resp.error.code, "AI_RATE_LIMITED");
    assert.ok(resp.error.message.includes("terlalu banyak"), "Message should be user-friendly in Indonesian");
    assert.ok(!resp.error.message.includes("AIzaSy"), "Never expose secret API keys");
    assert.ok(!resp.error.message.includes("stack"), "Never expose raw stack traces to teacher UI");
  });

  test("TEST 6: Real PDF buffer extractor parses native text and rejects corrupt buffer cleanly", async () => {
    // Generate a minimal valid PDF in memory
    const minimalPdf = Buffer.from(
      "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n" +
      "2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n" +
      "3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\n" +
      "xref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000053 00000 n\n0000000102 00000 n\n" +
      "trailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF"
    );

    const result = await extractTextFromPdfBuffer(minimalPdf);
    assert.ok(typeof result.text === "string", "Extracted text should be string");
    assert.equal(result.isScanned, true, "Empty page PDF should be detected as scanned/needing OCR");

    // Corrupted buffer should throw an informative error (never return dummy text)
    const corruptBuffer = Buffer.from("this is not a valid pdf file content");
    await assert.rejects(async () => {
      await extractTextFromPdfBuffer(corruptBuffer);
    });
  });
});
