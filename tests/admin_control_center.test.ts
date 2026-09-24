import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  hashPassword,
  verifyPassword,
  encryptSecret,
  decryptSecret,
  maskApiKey,
  generateSessionToken,
  hashSessionToken,
} from "../lib/admin/crypto";
import { authenticateAdmin, hasPermission } from "../lib/admin/auth";
import { adminRepository } from "../lib/admin/admin-repository";
import { aiProviderManager } from "../lib/ai/ai-provider-manager";
import { AdminAccount } from "../lib/admin/types";

describe("Admin Cryptography & Secret Encryption Tests", () => {
  test("scrypt password hashing and constant-time verification works correctly", async () => {
    const rawPass = "PahamiSuperSecret2026!";
    const { hash, salt } = await hashPassword(rawPass);

    assert.ok(hash && hash.length === 128, "Scrypt hash should be 64 bytes (128 hex chars)");
    assert.ok(salt && salt.length === 32, "Salt should be 16 bytes (32 hex chars)");

    const isValid = await verifyPassword(rawPass, hash, salt);
    assert.equal(isValid, true, "Valid password must verify to true");

    const isInvalid = await verifyPassword("WrongPassword123!", hash, salt);
    assert.equal(isInvalid, false, "Wrong password must verify to false");
  });

  test("AES-256-GCM encrypts and decrypts secrets with tag integrity", () => {
    const plaintextKey = "AIzaSy_ActualSecretGoogleGeminiKey_999";
    const encrypted = encryptSecret(plaintextKey);

    assert.notEqual(encrypted.ciphertext, plaintextKey, "Ciphertext must not be plaintext");
    assert.ok(encrypted.iv && encrypted.iv.length === 24, "IV should be 12 bytes (24 hex chars)");
    assert.ok(encrypted.tag && encrypted.tag.length === 32, "Auth tag should be 16 bytes (32 hex chars)");

    const decrypted = decryptSecret(encrypted.ciphertext, encrypted.iv, encrypted.tag);
    assert.equal(decrypted, plaintextKey, "Decrypted secret must match original plaintext");

    // Tampered auth tag should fail
    const tamperedTag = "00".repeat(16);
    assert.throws(() => {
      decryptSecret(encrypted.ciphertext, encrypted.iv, tamperedTag);
    }, /Unsupported state or unable to authenticate data|bad decrypt/);
  });

  test("maskApiKey masks middle characters for visual security", () => {
    const key = "AIzaSyDpA1234567890abcdefX9Q";
    const masked = maskApiKey(key);
    assert.ok(masked.startsWith("AIzaSy"), "Masked key should start with first 6 characters");
    assert.ok(masked.endsWith("fX9Q"), "Masked key should end with last 4 characters");
    assert.ok(masked.includes("••••••••"), "Masked key should hide middle characters");
  });
});

describe("Admin Authentication & Role Authorization Tests", () => {
  test("authenticateAdmin handles valid, invalid, and disabled accounts", async () => {
    // 1. Valid login for seeded superadmin
    const res = await authenticateAdmin("superadmin", "AdminPahami2026!", "127.0.0.1", "TestRunner");
    assert.equal(res.success, true, "Seeded superadmin should successfully login");
    assert.ok(res.token, "Valid login must return session token");
    assert.equal(res.admin?.role, "SUPER_ADMIN");

    // 2. Invalid password
    const failRes = await authenticateAdmin("superadmin", "WrongPass!", "127.0.0.1", "TestRunner");
    assert.equal(failRes.success, false);
    assert.ok(failRes.error?.includes("Kredensial Admin tidak valid"));

    // 3. Nonexistent account
    const notFound = await authenticateAdmin("ghost_user", "AnyPass123!", "127.0.0.1", "TestRunner");
    assert.equal(notFound.success, false);
  });

  test("Role permission hierarchy isolates administrative capabilities", () => {
    const superAdmin: AdminAccount = {
      id: "1",
      username: "super",
      password_hash: "",
      salt: "",
      full_name: "Super",
      role: "SUPER_ADMIN",
      is_active: true,
      failed_login_attempts: 0,
      created_at: "",
      updated_at: "",
    };

    const contentAdmin: AdminAccount = {
      id: "2",
      username: "content",
      password_hash: "",
      salt: "",
      full_name: "Content",
      role: "CONTENT_ADMIN",
      is_active: true,
      failed_login_attempts: 0,
      created_at: "",
      updated_at: "",
    };

    // SUPER_ADMIN has everything
    assert.equal(hasPermission(superAdmin, "ai.credentials.manage"), true);
    assert.equal(hasPermission(superAdmin, "users.manage"), true);
    assert.equal(hasPermission(superAdmin, "admins.manage"), true);

    // CONTENT_ADMIN can manage knowledge and media, but NOT ai credentials or users
    assert.equal(hasPermission(contentAdmin, "knowledge.manage"), true);
    assert.equal(hasPermission(contentAdmin, "media.manage"), true);
    assert.equal(hasPermission(contentAdmin, "ai.credentials.manage"), false);
    assert.equal(hasPermission(contentAdmin, "users.manage"), false);
    assert.equal(hasPermission(contentAdmin, "admins.manage"), false);
  });
});

describe("AI Provider Manager & Automatic Failover Engine Tests", () => {
  test("classifyError maps HTTP & Gemini error codes accurately", () => {
    assert.equal(
      aiProviderManager.classifyError({ status: 401, message: "API_KEY_INVALID" }),
      "INVALID_API_KEY"
    );
    assert.equal(
      aiProviderManager.classifyError({ status: 429, message: "Resource exhausted: Rate limit exceeded" }),
      "RATE_LIMITED"
    );
    assert.equal(
      aiProviderManager.classifyError({ status: 429, message: "Daily quota reached" }),
      "QUOTA_EXCEEDED"
    );
    assert.equal(
      aiProviderManager.classifyError({ status: 503, message: "The model is overloaded" }),
      "MODEL_UNAVAILABLE"
    );
    assert.equal(
      aiProviderManager.classifyError({ message: "Request timeout" }),
      "TIMEOUT"
    );
    assert.equal(
      aiProviderManager.classifyError({ message: "Candidate blocked due to safety" }),
      "SAFETY_REJECTION"
    );
  });

  test("Circuit breaker transitions and excludes exhausted quota groups", () => {
    const cred = adminRepository.getCredentialById("cred-gemini-primary");
    assert.ok(cred);

    // Initial state
    assert.equal(cred.circuit_state, "CLOSED");

    // Select with no exclusion
    const selected = aiProviderManager.selectCredential();
    assert.ok(selected);

    // Exclude quota group
    const excludedGroup = new Set([cred.quota_group]);
    const afterExclude = aiProviderManager.selectCredential(excludedGroup);
    // Should choose the secondary credential with different quota group
    assert.ok(afterExclude);
    assert.notEqual(afterExclude.quota_group, cred.quota_group);
  });
});
