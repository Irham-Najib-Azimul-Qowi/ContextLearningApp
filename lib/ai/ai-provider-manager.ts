import { GoogleGenAI } from "@google/genai";
import { adminRepository } from "../admin/admin-repository";
import { decryptSecret } from "../admin/crypto";
import {
  AICredential,
  AIModelConfig,
  AIErrorClassification,
  AICapability,
} from "../admin/types";
import {
  AIErrorCode,
  AIStructuredError,
  createStructuredError,
  generateRequestId,
  ERROR_MESSAGES,
} from "./error-contract";

export interface AIExecutionOptions {
  featureKey:
    | "question_generation"
    | "question_scan"
    | "material_generation"
    | "contextual_rewriting"
    | "educational_validation";
  prompt: string;
  imagePart?: {
    base64Data: string;
    mimeType: string;
  };
  callerUserId?: string;
  requestId?: string;
  requiredCapabilities?: AICapability[];
}

export interface AIExecutionResult<T = any> {
  success: boolean;
  data?: T;
  rawText?: string;
  modelUsed: string;
  credentialUsed?: string;
  quotaGroupUsed?: string;
  isFailover: boolean;
  tokensConsumed: {
    input: number;
    output: number;
    total: number;
  };
  latencyMs: number;
  error?: string;
  structuredError?: AIStructuredError;
  requestId?: string;
}

function tryRepairTruncatedJson(str: string): any {
  if (!str) return undefined;
  const startBrace = str.indexOf("{");
  const startBracket = str.indexOf("[");

  if (startBrace !== -1 && (startBracket === -1 || startBrace < startBracket)) {
    const sub = str.slice(startBrace);
    let lastClose = sub.lastIndexOf("}");
    while (lastClose > 0) {
      const candidate = sub.slice(0, lastClose + 1).trim();
      const testCases = [
        candidate + "\n]}",
        candidate + "\n}",
        candidate + "]}",
        candidate + "}",
      ];
      for (const tc of testCases) {
        try {
          return JSON.parse(tc);
        } catch {
          // continue
        }
      }
      lastClose = sub.lastIndexOf("}", lastClose - 1);
    }
  } else if (startBracket !== -1) {
    const sub = str.slice(startBracket);
    let lastClose = sub.lastIndexOf("}");
    while (lastClose > 0) {
      const candidate = sub.slice(0, lastClose + 1).trim();
      const testCases = [candidate + "\n]", candidate + "]"];
      for (const tc of testCases) {
        try {
          return JSON.parse(tc);
        } catch {
          // continue
        }
      }
      lastClose = sub.lastIndexOf("}", lastClose - 1);
    }
  }
  return undefined;
}

export function extractJsonFromAiResponse<T = any>(text: string): T | undefined {
  if (!text) return undefined;
  const clean = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const firstBrace = clean.indexOf("{");
  const lastBrace = clean.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(clean.slice(firstBrace, lastBrace + 1)) as T;
    } catch {
      // Continue
    }
  }
  const firstBracket = clean.indexOf("[");
  const lastBracket = clean.lastIndexOf("]");
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    try {
      return JSON.parse(clean.slice(firstBracket, lastBracket + 1)) as T;
    } catch {
      // Continue
    }
  }
  try {
    return JSON.parse(clean) as T;
  } catch {
    // Continue
  }

  const salvaged = tryRepairTruncatedJson(clean);
  if (salvaged !== undefined) {
    return salvaged as T;
  }
  return undefined;
}

export class AIProviderManager {
  /**
   * Classify an error thrown by Gemini or HTTP network layer.
   */
  classifyError(err: any): AIErrorClassification {
    const msg = (err?.message || err?.toString() || "").toLowerCase();
    const status = err?.status || err?.statusCode || 0;

    if (
      status === 401 ||
      msg.includes("api_key_invalid") ||
      msg.includes("invalid api key") ||
      msg.includes("key not valid") ||
      msg.includes("unauthenticated")
    ) {
      return "INVALID_API_KEY";
    }
    if (status === 403 || msg.includes("permission_denied") || msg.includes("forbidden")) {
      return "PERMISSION_DENIED";
    }
    if (
      status === 429 ||
      msg.includes("resource_exhausted") ||
      msg.includes("quota exceeded") ||
      msg.includes("rate limit")
    ) {
      if (msg.includes("quota") || msg.includes("daily") || msg.includes("limit: 0")) {
        return "QUOTA_EXCEEDED";
      }
      return "RATE_LIMITED";
    }
    if (
      status === 503 ||
      msg.includes("model unavailable") ||
      msg.includes("overloaded") ||
      msg.includes("high demand")
    ) {
      return "MODEL_UNAVAILABLE";
    }
    if (
      msg.includes("timeout") ||
      msg.includes("timed out") ||
      msg.includes("deadline exceeded") ||
      err?.code === "ETIMEDOUT"
    ) {
      return "TIMEOUT";
    }
    if (msg.includes("network") || msg.includes("econnrefused") || msg.includes("fetch failed")) {
      return "NETWORK_ERROR";
    }
    if (msg.includes("safety") || msg.includes("blocked by safety")) {
      return "SAFETY_REJECTION";
    }
    if (msg.includes("json") || msg.includes("parse error") || msg.includes("unexpected token")) {
      return "INVALID_STRUCTURED_OUTPUT";
    }
    if (
      status === 404 ||
      msg.includes("not found") ||
      msg.includes("no longer available") ||
      msg.includes("is not supported")
    ) {
      return "MODEL_UNAVAILABLE";
    }

    return "UNKNOWN_ERROR";
  }

  /**
   * Select the best eligible credential considering priority, health status, and circuit breaker.
   */
  selectCredential(
    excludedQuotaGroups: Set<string> = new Set(),
    excludedCredIds: Set<string> = new Set()
  ): AICredential | null {
    const creds = adminRepository.listCredentials().filter((c) => c.is_enabled);

    for (const cred of creds) {
      if (excludedCredIds.has(cred.id)) {
        continue;
      }
      if (excludedQuotaGroups.has(cred.quota_group)) {
        continue; // Quota group exhausted, do not rotate to same group
      }

      // 1. Health Status Checks: Do not route to rate_limited, invalid, or disabled credentials
      if (
        cred.health_status === "rate_limited" ||
        cred.health_status === "invalid" ||
        cred.health_status === "disabled"
      ) {
        continue;
      }

      // 2. Check Circuit Breaker
      if (cred.circuit_state === "OPEN") {
        const now = Date.now();
        const openedAt = cred.circuit_opened_at ? new Date(cred.circuit_opened_at).getTime() : now;
        const elapsed = (now - openedAt) / 1000;
        const cooldown = cred.cooldown_seconds || 60;
        if (cred.circuit_opened_at && elapsed > cooldown) {
          // Transition to HALF_OPEN for a canary test
          adminRepository.updateCredential(cred.id, {
            circuit_state: "HALF_OPEN",
            cooldown_until: null,
          });
          return cred;
        }
        continue;
      }

      return cred;
    }

    return null;
  }

  getAvailableCredential(
    excludedQuotaGroups: Set<string> = new Set(),
    excludedCredIds: Set<string> = new Set()
  ): AICredential | null {
    return this.selectCredential(excludedQuotaGroups, excludedCredIds);
  }

  /**
   * Central execution gateway with circuit breaker, quota-group failover, and capability checks.
   */
  async execute<T = any>(options: AIExecutionOptions): Promise<AIExecutionResult<T>> {
    const startTime = Date.now();
    const requestId = options.requestId || generateRequestId();

    // 1. Guard against empty/malformed request: DO NOT BURN API KEYS ON INVALID INPUT!
    if (!options.prompt || !options.prompt.trim()) {
      return {
        success: false,
        modelUsed: "none",
        isFailover: false,
        tokensConsumed: { input: 0, output: 0, total: 0 },
        latencyMs: 0,
        error: ERROR_MESSAGES.INPUT_INVALID,
        structuredError: createStructuredError("INPUT_INVALID"),
        requestId,
      };
    }

    const modelConfig = adminRepository.getModelByFeature(options.featureKey);
    let isFailover = false;

    // Capability check
    const requiredCaps =
      options.requiredCapabilities || modelConfig?.required_capabilities || ["text_generation"];
    if (options.imagePart && !requiredCaps.includes("image_understanding")) {
      requiredCaps.push("image_understanding");
    }

    // Candidate models cascade
    const candidateModels: string[] = [];
    if (modelConfig?.primary_model) candidateModels.push(modelConfig.primary_model);
    if (modelConfig?.fallback_model && !candidateModels.includes(modelConfig.fallback_model)) {
      candidateModels.push(modelConfig.fallback_model);
    }
    const RESILIENT_FALLBACKS = [
      "gemini-3.6-flash",
      "gemini-3-flash-preview",
      "gemini-3.8-flash",
      "gemini-3.7-flash",
      "gemini-3.5-flash",
      "gemini-flash-latest",
      "gemini-flash-lite-latest",
      "gemini-pro-latest",
    ];
    for (const m of RESILIENT_FALLBACKS) {
      if (!candidateModels.includes(m)) {
        candidateModels.push(m);
      }
    }

    const exhaustedQuotaGroups = new Set<string>();
    const excludedCredIds = new Set<string>();
    const totalCredentialsCount = adminRepository.listCredentials().length;
    const maxAttempts = Math.max(totalCredentialsCount, 5);

    let attempts = 0;
    let lastErrorMsg = "";
    let lastClassification: AIErrorClassification = "UNKNOWN_ERROR";
    let lastModelAttempted = candidateModels[0] || "gemini-flash-lite-latest";
    let initialCredId: string | null = null;

    adminRepository.recordAIAuditEvent("AI_REQUEST_STARTED", {
      requestId,
      featureKey: options.featureKey,
      callerUserId: options.callerUserId,
      hasImage: Boolean(options.imagePart),
    });

    while (attempts < maxAttempts) {
      attempts++;
      const credential = this.selectCredential(exhaustedQuotaGroups, excludedCredIds);

      // Decrypt plaintext API key safely in memory, fallback to process.env.GEMINI_API_KEY
      let plaintextKey = "";
      if (credential) {
        try {
          plaintextKey = decryptSecret(
            credential.encrypted_api_key,
            credential.iv,
            credential.auth_tag
          );
        } catch {
          plaintextKey = process.env.GEMINI_API_KEY || "";
        }
      } else {
        plaintextKey = process.env.GEMINI_API_KEY || "";
      }

      // Check if it's a dummy placeholder key or missing
      if (!plaintextKey || plaintextKey.includes("DEV_DEMO_KEY")) {
        if (credential) {
          excludedCredIds.add(credential.id);
          adminRepository.updateCredential(credential.id, {
            health_status: "disabled",
            last_error: "Kredensial belum memiliki API key aktif di environment.",
          });
          continue; // Try next credential slot in pool
        }
        lastErrorMsg =
          "GEMINI_API_KEY belum disetel pada Environment Variables platform / server. Harap tambahkan API key di dashboard.";
        lastClassification = "INVALID_API_KEY";
        break;
      }

      const credName = credential?.name || "Direct Environment Gemini Key";
      const credId = credential?.id || "cred-gemini-primary";
      const quotaGroup = credential?.quota_group || "project_pahami_prod";

      if (!initialCredId) {
        initialCredId = credId;
      } else if (initialCredId !== credId) {
        isFailover = true;
      }

      const client = new GoogleGenAI({ apiKey: plaintextKey });
      let credentialHandled = false;

      // Try candidate models in order for this credential
      for (let mIdx = 0; mIdx < candidateModels.length; mIdx++) {
        const currentModel = candidateModels[mIdx];
        lastModelAttempted = currentModel;

        try {
          let responseText = "";

          const genConfig: any = {
            temperature: modelConfig?.temperature ?? 0.2,
            maxOutputTokens: Math.max(modelConfig?.max_output_tokens ?? 8192, 8192),
          };
          if (requiredCaps.includes("structured_output")) {
            genConfig.responseMimeType = "application/json";
          }

            if (options.imagePart) {
              const contents = [
                options.prompt,
                {
                  inlineData: {
                    data: options.imagePart.base64Data,
                    mimeType: options.imagePart.mimeType,
                  },
                },
              ];
              const resp = await client.models.generateContent({
                model: currentModel,
                contents,
                config: genConfig,
              });
              responseText = resp.text || "";
            } else {
              const resp = await client.models.generateContent({
                model: currentModel,
                contents: options.prompt,
                config: genConfig,
              });
              responseText = resp.text || "";
            }

          const latencyMs = Date.now() - startTime;
          const estTokensIn = Math.ceil(options.prompt.length / 4);
          const estTokensOut = Math.ceil(responseText.length / 4);

          // Success: Reset circuit breaker & record usage & audit
          if (credential) {
            adminRepository.updateCredential(credential.id, {
              consecutive_errors: 0,
              circuit_state: "CLOSED",
              health_status: "healthy",
              last_used_at: new Date().toISOString(),
              last_success_at: new Date().toISOString(),
              success_count: (credential.success_count || 0) + 1,
              last_error: null,
            });
          }

          adminRepository.recordUsageEvent({
            credential_id: credId,
            credential_name: credName,
            quota_group: quotaGroup,
            feature_key: options.featureKey,
            model: currentModel,
            input_tokens: estTokensIn,
            output_tokens: estTokensOut,
            total_tokens: estTokensIn + estTokensOut,
            latency_ms: latencyMs,
            status: isFailover ? "FAILED_OVER" : "SUCCESS",
            caller_user_id: options.callerUserId,
          });

          if (isFailover) {
            adminRepository.recordAIAuditEvent("AI_FALLBACK_TRIGGERED", {
              requestId,
              featureKey: options.featureKey,
              primaryCredentialId: initialCredId,
              successfulCredentialId: credId,
              model: currentModel,
            });
          }

          adminRepository.recordAIAuditEvent("AI_REQUEST_SUCCESS", {
            requestId,
            credentialId: credId,
            model: currentModel,
            latencyMs,
            isFailover,
          });

          let parsedData: any = undefined;
          if (requiredCaps.includes("structured_output")) {
            parsedData = extractJsonFromAiResponse(responseText);
          }

          return {
            success: true,
            data: parsedData,
            rawText: responseText,
            modelUsed: currentModel,
            credentialUsed: credName,
            quotaGroupUsed: quotaGroup,
            isFailover,
            tokensConsumed: {
              input: estTokensIn,
              output: estTokensOut,
              total: estTokensIn + estTokensOut,
            },
            latencyMs,
            requestId,
          };
        } catch (err: any) {
          const classification = this.classifyError(err);
          const errorMsg = err?.message || err?.toString() || "Unknown error";
          lastErrorMsg = errorMsg;
          lastClassification = classification;

          console.warn(
            `[AIProviderManager] Request failed on ${credName} with model ${currentModel} (${classification}):`,
            errorMsg
          );

          // Fatal credential authentication error:
          if (classification === "INVALID_API_KEY" || classification === "PERMISSION_DENIED") {
            if (credential) {
              adminRepository.updateCredential(credential.id, {
                consecutive_errors: (credential.consecutive_errors || 0) + 1,
                circuit_state: "OPEN",
                circuit_opened_at: new Date().toISOString(),
                health_status: "invalid",
                last_error: errorMsg,
                last_error_at: new Date().toISOString(),
                failure_count: (credential.failure_count || 0) + 1,
              });
              adminRepository.recordAIAuditEvent("AI_CREDENTIAL_DISABLED", {
                credentialId: credential.id,
                reason: classification,
              });
            }
            excludedCredIds.add(credId);
            credentialHandled = true;
            break; // Try next credential
          }

          // If current model failed due to QUOTA_EXCEEDED, RATE_LIMITED:
          if (classification === "QUOTA_EXCEEDED" || classification === "RATE_LIMITED") {
            // First check if there are other candidate models to try on this key!
            // In Google AI Studio, a rate limit / 429 on one model (e.g. 3.8-flash) does not affect other models (e.g. 3.6-flash).
            if (mIdx < candidateModels.length - 1) {
              console.warn(
                `[AI Failover] Model ${currentModel} hit ${classification} on ${credential?.name || credId}. Cascading to next model: ${candidateModels[mIdx + 1]}...`
              );
              isFailover = true;
              continue;
            }

            // Only if ALL models failed on this key, rotate to next credential
            if (credential) {
              const cooldownSecs = credential.cooldown_seconds || 60;
              const cooldownUntil = new Date(Date.now() + cooldownSecs * 1000).toISOString();
              adminRepository.updateCredential(credential.id, {
                consecutive_errors: (credential.consecutive_errors || 0) + 1,
                circuit_state: "OPEN",
                circuit_opened_at: new Date().toISOString(),
                cooldown_until: cooldownUntil,
                health_status: "rate_limited",
                last_error: errorMsg,
                last_error_at: new Date().toISOString(),
                failure_count: (credential.failure_count || 0) + 1,
              });
              adminRepository.recordAIAuditEvent("AI_CREDENTIAL_COOLDOWN", {
                credentialId: credential.id,
                quotaGroup: credential.quota_group,
                cooldownUntil,
                reason: classification,
              });
              exhaustedQuotaGroups.add(credential.quota_group);
            }
            excludedCredIds.add(credId);
            credentialHandled = true;
            break; // Immediately rotate to another credential with separate quota group
          }

          // For MODEL_UNAVAILABLE or TIMEOUT: try next model in cascade on same credential
          if (mIdx < candidateModels.length - 1) {
            isFailover = true;
            continue;
          }

          // If all models in cascade failed on this credential:
          if (credential) {
            adminRepository.updateCredential(credential.id, {
              consecutive_errors: (credential.consecutive_errors || 0) + 1,
              health_status: "degraded",
              last_error: errorMsg,
              last_error_at: new Date().toISOString(),
              failure_count: (credential.failure_count || 0) + 1,
            });
          }
          excludedCredIds.add(credId);
          credentialHandled = true;
        }
      }

      if (credentialHandled) {
        isFailover = true;
      }
    }

    // ALL PROVIDERS / KEYS / MODELS EXHAUSTED OR OFFLINE
    const latencyMs = Date.now() - startTime;
    adminRepository.recordUsageEvent({
      feature_key: options.featureKey,
      model: lastModelAttempted,
      input_tokens: 0,
      output_tokens: 0,
      total_tokens: 0,
      latency_ms: latencyMs,
      status: "ERROR",
      error_type: lastClassification,
      error_message: lastErrorMsg || "All credentials and models exhausted.",
      caller_user_id: options.callerUserId,
    });

    adminRepository.recordAIAuditEvent("AI_ALL_CREDENTIALS_FAILED", {
      requestId,
      featureKey: options.featureKey,
      lastError: lastErrorMsg,
      lastClassification,
      attempts,
    });

    let finalCode: AIErrorCode = "ALL_AI_CREDENTIALS_FAILED";
    if (lastClassification === "QUOTA_EXCEEDED") finalCode = "AI_QUOTA_EXHAUSTED";
    else if (lastClassification === "RATE_LIMITED") finalCode = "AI_RATE_LIMITED";
    else if (lastClassification === "MODEL_UNAVAILABLE") finalCode = "AI_MODEL_UNAVAILABLE";
    else if (lastClassification === "TIMEOUT") finalCode = "AI_TIMEOUT";
    else if (lastClassification === "NETWORK_ERROR") finalCode = "AI_PROVIDER_UNAVAILABLE";
    else if (lastClassification === "INVALID_STRUCTURED_OUTPUT") finalCode = "AI_INVALID_RESPONSE";
    else if (lastClassification === "INVALID_API_KEY") finalCode = "ALL_AI_CREDENTIALS_FAILED";

    const structuredError = createStructuredError(
      finalCode,
      ERROR_MESSAGES[finalCode] || `Layanan AI sedang mencapai batas kapasitas (${lastErrorMsg.slice(0, 100)}).`,
      lastErrorMsg
    );

    return {
      success: false,
      modelUsed: lastModelAttempted,
      isFailover: true,
      tokensConsumed: { input: 0, output: 0, total: 0 },
      latencyMs,
      error: structuredError.message,
      structuredError,
      requestId,
    };
  }

  /**
   * Health Test for a specific API Key credential without burning unnecessary quota.
   */
  async testConnection(credentialId: string): Promise<{ success: boolean; latencyMs: number; error?: string }> {
    const cred = adminRepository.getCredentialById(credentialId);
    if (!cred) return { success: false, latencyMs: 0, error: "Kredensial tidak ditemukan." };

    const startTime = Date.now();
    try {
      let plaintextKey = "";
      try {
        plaintextKey = decryptSecret(cred.encrypted_api_key, cred.iv, cred.auth_tag);
      } catch {
        plaintextKey = process.env.GEMINI_API_KEY || "";
      }

      if (!plaintextKey || plaintextKey.includes("DEV_DEMO_KEY")) {
        adminRepository.updateCredential(credentialId, {
          health_status: "invalid",
          last_error: "API Key kosong atau demo placeholder.",
          last_error_at: new Date().toISOString(),
        });
        return { success: false, latencyMs: 0, error: "API Key belum disetel atau tidak valid." };
      }

      const client = new GoogleGenAI({ apiKey: plaintextKey });

      // Lightweight test prompt with active Gemini Flash Lite model
      const resp = await client.models.generateContent({
        model: "gemini-flash-lite-latest",
        contents: "Balas hanya satu kata: OK",
      });

      const latencyMs = Date.now() - startTime;
      if (resp.text) {
        adminRepository.updateCredential(credentialId, {
          health_status: "healthy",
          consecutive_errors: 0,
          circuit_state: "CLOSED",
          last_used_at: new Date().toISOString(),
          last_success_at: new Date().toISOString(),
          cooldown_until: null,
          last_error: null,
        });
        return { success: true, latencyMs };
      }
      return { success: false, latencyMs, error: "Respons kosong dari Gemini." };
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      const classification = this.classifyError(err);
      const msg = err?.message || err?.toString() || "Gagal menghubungkan ke Gemini API";

      adminRepository.updateCredential(credentialId, {
        health_status: classification === "INVALID_API_KEY" ? "invalid" : "degraded",
        last_error: msg,
        last_error_at: new Date().toISOString(),
        failure_count: (cred.failure_count || 0) + 1,
      });

      return { success: false, latencyMs, error: `[${classification}] ${msg}` };
    }
  }
}

export const aiProviderManager = new AIProviderManager();
