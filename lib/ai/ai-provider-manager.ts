import { GoogleGenAI } from "@google/genai";
import { adminRepository } from "../admin/admin-repository";
import { decryptSecret } from "../admin/crypto";
import {
  AICredential,
  AIModelConfig,
  AIErrorClassification,
  AICapability,
} from "../admin/types";

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
    return undefined;
  }
}

export class AIProviderManager {
  /**
   * Classify an error thrown by Gemini or HTTP network layer.
   */
  classifyError(err: any): AIErrorClassification {
    const msg = (err?.message || err?.toString() || "").toLowerCase();
    const status = err?.status || err?.statusCode || 0;

    if (status === 401 || msg.includes("api_key_invalid") || msg.includes("invalid api key") || msg.includes("unauthenticated")) {
      return "INVALID_API_KEY";
    }
    if (status === 403 || msg.includes("permission_denied") || msg.includes("forbidden")) {
      return "PERMISSION_DENIED";
    }
    if (status === 429 || msg.includes("resource_exhausted") || msg.includes("quota exceeded") || msg.includes("rate limit")) {
      if (msg.includes("quota") || msg.includes("daily") || msg.includes("limit: 0")) {
        return "QUOTA_EXCEEDED";
      }
      return "RATE_LIMITED";
    }
    if (status === 503 || msg.includes("model unavailable") || msg.includes("overloaded") || msg.includes("high demand")) {
      return "MODEL_UNAVAILABLE";
    }
    if (msg.includes("timeout") || msg.includes("deadline exceeded") || err?.code === "ETIMEDOUT") {
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

    if (status === 404 || msg.includes("not found") || msg.includes("no longer available") || msg.includes("is not supported")) {
      return "MODEL_UNAVAILABLE";
    }

    return "UNKNOWN_ERROR";
  }

  /**
   * Select the best eligible credential considering priority, health status, and circuit breaker.
   */
  selectCredential(excludedQuotaGroups: Set<string> = new Set()): AICredential | null {
    const creds = adminRepository.listCredentials().filter((c) => c.is_enabled);

    for (const cred of creds) {
      if (excludedQuotaGroups.has(cred.quota_group)) {
        continue; // Quota group exhausted, do not rotate to same group
      }

      // Check Circuit Breaker
      if (cred.circuit_state === "OPEN") {
        const openedAt = cred.circuit_opened_at ? new Date(cred.circuit_opened_at).getTime() : 0;
        const elapsed = (Date.now() - openedAt) / 1000;
        if (elapsed > cred.cooldown_seconds) {
          // Transition to HALF_OPEN for a canary test
          adminRepository.updateCredential(cred.id, { circuit_state: "HALF_OPEN" });
          return cred;
        }
        // If it's the primary key and we have GEMINI_API_KEY in env, auto-recover
        if (process.env.GEMINI_API_KEY && cred.id === "cred-gemini-primary") {
          return cred;
        }
        continue;
      }

      if (cred.health_status === "invalid" || cred.health_status === "disabled") {
        // If it's the primary credential and GEMINI_API_KEY is in env, heal it
        if (process.env.GEMINI_API_KEY && cred.id === "cred-gemini-primary") {
          return cred;
        }
        continue;
      }

      return cred;
    }

    return null;
  }

  /**
   * Central execution gateway with circuit breaker, quota-group failover, and capability checks.
   */
  async execute<T = any>(options: AIExecutionOptions): Promise<AIExecutionResult<T>> {
    const startTime = Date.now();
    const modelConfig = adminRepository.getModelByFeature(options.featureKey);
    let isFailover = false;

    // Capability check
    const requiredCaps = options.requiredCapabilities || modelConfig?.required_capabilities || ["text_generation"];
    if (options.imagePart && !requiredCaps.includes("image_understanding")) {
      requiredCaps.push("image_understanding");
    }

    // Build adaptive candidate models cascade:
    // Prioritize configured primary & fallback, followed by ultra-reliable high-availability models
    const candidateModels: string[] = [];
    if (modelConfig?.primary_model) candidateModels.push(modelConfig.primary_model);
    if (modelConfig?.fallback_model && !candidateModels.includes(modelConfig.fallback_model)) {
      candidateModels.push(modelConfig.fallback_model);
    }
    const RESILIENT_FALLBACKS = [
      "gemini-flash-lite-latest",
      "gemini-3.1-flash-lite",
      "gemini-3.7-flash",
      "gemini-flash-latest",
    ];
    for (const m of RESILIENT_FALLBACKS) {
      if (!candidateModels.includes(m)) {
        candidateModels.push(m);
      }
    }

    const exhaustedQuotaGroups = new Set<string>();
    let attempts = 0;
    const maxAttempts = 3;
    let lastErrorMsg = "";
    let lastClassification: AIErrorClassification = "UNKNOWN_ERROR";
    let lastModelAttempted = candidateModels[0] || "gemini-flash-lite-latest";

    while (attempts < maxAttempts) {
      attempts++;
      const credential = this.selectCredential(exhaustedQuotaGroups);

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
        lastErrorMsg =
          "GEMINI_API_KEY belum disetel pada Environment Variables platform Vercel / server. Harap tambahkan GEMINI_API_KEY di dashboard Vercel.";
        lastClassification = "INVALID_API_KEY";
        break;
      }

      const credName = credential?.name || "Direct Environment Gemini Key";
      const credId = credential?.id || "cred-gemini-primary";
      const quotaGroup = credential?.quota_group || "project_pahami_prod";

      const client = new GoogleGenAI({ apiKey: plaintextKey });
      let credentialHandled = false;

      // Try candidate models in order for this credential
      for (let mIdx = 0; mIdx < candidateModels.length; mIdx++) {
        const currentModel = candidateModels[mIdx];
        lastModelAttempted = currentModel;

        try {
          let responseText = "";

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
            });
            responseText = resp.text || "";
          } else {
            const resp = await client.models.generateContent({
              model: currentModel,
              contents: options.prompt,
            });
            responseText = resp.text || "";
          }

          const latencyMs = Date.now() - startTime;
          const estTokensIn = Math.ceil(options.prompt.length / 4);
          const estTokensOut = Math.ceil(responseText.length / 4);

          // Success: Reset circuit breaker & record usage
          if (credential) {
            adminRepository.updateCredential(credential.id, {
              consecutive_errors: 0,
              circuit_state: "CLOSED",
              health_status: "healthy",
              last_used_at: new Date().toISOString(),
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

          // Fatal credential authentication error (API key invalid/forbidden):
          // Model fallback won't help; mark credential and proceed to next credential if available
          if (classification === "INVALID_API_KEY" || classification === "PERMISSION_DENIED") {
            if (credential) {
              adminRepository.updateCredential(credential.id, {
                consecutive_errors: credential.consecutive_errors + 1,
                circuit_state: "OPEN",
                circuit_opened_at: new Date().toISOString(),
                health_status: "invalid",
                last_error: errorMsg,
                last_error_at: new Date().toISOString(),
              });
            }
            credentialHandled = true;
            break; // Break model loop, try next credential in outer loop
          }

          // If current model failed due to QUOTA_EXCEEDED, MODEL_UNAVAILABLE, RATE_LIMITED, TIMEOUT, etc.
          // Try next model in candidateModels cascade!
          if (mIdx < candidateModels.length - 1) {
            isFailover = true;
            continue;
          }

          // If all models in the cascade failed on this credential:
          if (credential) {
            const newConsecutive = credential.consecutive_errors + 1;
            adminRepository.updateCredential(credential.id, {
              consecutive_errors: newConsecutive,
              health_status: "degraded",
              last_error: errorMsg,
              last_error_at: new Date().toISOString(),
            });
            if (classification === "QUOTA_EXCEEDED") {
              exhaustedQuotaGroups.add(credential.quota_group);
            }
          }
          credentialHandled = true;
        }
      }

      if (credentialHandled && exhaustedQuotaGroups.has(quotaGroup)) {
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
      error_type: lastClassification === "INVALID_API_KEY" ? "INVALID_API_KEY" : "QUOTA_EXCEEDED",
      error_message: lastErrorMsg || "All credentials and models exhausted.",
      caller_user_id: options.callerUserId,
    });

    const formattedError = lastErrorMsg.includes("belum disetel")
      ? lastErrorMsg
      : `Layanan AI sedang mencapai batas kapasitas atau sedang offline (${lastErrorMsg.slice(0, 120)}).`;

    return {
      success: false,
      modelUsed: lastModelAttempted,
      isFailover: true,
      tokensConsumed: { input: 0, output: 0, total: 0 },
      latencyMs,
      error: formattedError,
    };
  }

  /**
   * Health Test for a specific API Key credential without burning quota.
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
      });

      return { success: false, latencyMs, error: `[${classification}] ${msg}` };
    }
  }
}

export const aiProviderManager = new AIProviderManager();
