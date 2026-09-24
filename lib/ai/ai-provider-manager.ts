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
    if (status === 503 || msg.includes("model unavailable") || msg.includes("overloaded")) {
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
        continue;
      }

      if (cred.health_status === "invalid" || cred.health_status === "disabled") {
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
    let targetModel = modelConfig?.primary_model || "gemini-2.5-flash";
    let isFailover = false;

    // Capability check
    const requiredCaps = options.requiredCapabilities || modelConfig?.required_capabilities || ["text_generation"];
    if (options.imagePart && !requiredCaps.includes("image_understanding")) {
      requiredCaps.push("image_understanding");
    }

    const exhaustedQuotaGroups = new Set<string>();
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      attempts++;
      const credential = this.selectCredential(exhaustedQuotaGroups);

      if (!credential) {
        // No valid credentials available -> trigger high-precision fallback
        break;
      }

      // Decrypt plaintext API key safely in memory
      let plaintextKey = "";
      try {
        plaintextKey = decryptSecret(
          credential.encrypted_api_key,
          credential.iv,
          credential.auth_tag
        );
      } catch (err) {
        console.error(`[AIProviderManager] Decryption failed for credential ${credential.id}`);
        adminRepository.updateCredential(credential.id, {
          health_status: "invalid",
          last_error: "Decryption error on server",
          last_error_at: new Date().toISOString(),
        });
        continue;
      }

      try {
        const client = new GoogleGenAI({ apiKey: plaintextKey });
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
            model: targetModel,
            contents,
          });
          responseText = resp.text || "";
        } else {
          const resp = await client.models.generateContent({
            model: targetModel,
            contents: options.prompt,
          });
          responseText = resp.text || "";
        }

        const latencyMs = Date.now() - startTime;
        const estTokensIn = Math.ceil(options.prompt.length / 4);
        const estTokensOut = Math.ceil(responseText.length / 4);

        // Success: Reset circuit breaker & record usage
        adminRepository.updateCredential(credential.id, {
          consecutive_errors: 0,
          circuit_state: "CLOSED",
          health_status: "healthy",
          last_used_at: new Date().toISOString(),
        });

        adminRepository.recordUsageEvent({
          credential_id: credential.id,
          credential_name: credential.name,
          quota_group: credential.quota_group,
          feature_key: options.featureKey,
          model: targetModel,
          input_tokens: estTokensIn,
          output_tokens: estTokensOut,
          total_tokens: estTokensIn + estTokensOut,
          latency_ms: latencyMs,
          status: isFailover ? "FAILED_OVER" : "SUCCESS",
          caller_user_id: options.callerUserId,
        });

        let parsedData: any = undefined;
        if (requiredCaps.includes("structured_output")) {
          try {
            const clean = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
            parsedData = JSON.parse(clean);
          } catch {
            parsedData = undefined;
          }
        }

        return {
          success: true,
          data: parsedData,
          rawText: responseText,
          modelUsed: targetModel,
          credentialUsed: credential.name,
          quotaGroupUsed: credential.quota_group,
          isFailover,
          tokensConsumed: {
            input: estTokensIn,
            output: estTokensOut,
            total: estTokensIn + estTokensOut,
          },
          latencyMs,
        };
      } catch (err: any) {
        const latencyMs = Date.now() - startTime;
        const classification = this.classifyError(err);
        const errorMsg = err?.message || err?.toString() || "Unknown error";

        console.warn(`[AIProviderManager] Request failed on ${credential.name} (${classification}):`, errorMsg);

        // Update Credential Failure & Circuit Breaker
        const newConsecutive = credential.consecutive_errors + 1;
        let newCircuitState = credential.circuit_state;
        let circuitOpenedAt = credential.circuit_opened_at;

        if (newConsecutive >= 3 || classification === "INVALID_API_KEY") {
          newCircuitState = "OPEN";
          circuitOpenedAt = new Date().toISOString();
        }

        adminRepository.updateCredential(credential.id, {
          consecutive_errors: newConsecutive,
          circuit_state: newCircuitState,
          circuit_opened_at: circuitOpenedAt,
          health_status: classification === "INVALID_API_KEY" ? "invalid" : "degraded",
          last_error: errorMsg,
          last_error_at: new Date().toISOString(),
        });

        // Quota Group Awareness: If exhausted, exclude all credentials in this quota group
        if (classification === "QUOTA_EXCEEDED") {
          exhaustedQuotaGroups.add(credential.quota_group);
          adminRepository.addNotification(
            "WARNING",
            `Kuota AI Habis pada Grup ${credential.quota_group}`,
            `Grup kuota '${credential.quota_group}' telah mencapai batas penggunaan. Memindahkan request ke grup kuota alternatif jika tersedia.`
          );
        }

        // Model-specific fallback check
        if (classification === "MODEL_UNAVAILABLE" && modelConfig?.fallback_model && targetModel !== modelConfig.fallback_model) {
          const oldModel = targetModel;
          targetModel = modelConfig.fallback_model;
          isFailover = true;
          adminRepository.recordFailoverEvent({
            trigger_credential_id: credential.id,
            feature_key: options.featureKey,
            error_classification: classification,
            reason: `Model ${oldModel} unavailable, switched to fallback model ${targetModel}`,
          });
          continue; // Retry with fallback model
        }

        // Record Failover Event
        adminRepository.recordFailoverEvent({
          trigger_credential_id: credential.id,
          feature_key: options.featureKey,
          error_classification: classification,
          reason: `Credential ${credential.name} hit ${classification}: ${errorMsg}`,
        });

        isFailover = true;
      }
    }

    // ALL PROVIDERS / KEYS EXHAUSTED OR OFFLINE -> SAFE PEDAGOGICAL FALLBACK
    const latencyMs = Date.now() - startTime;
    adminRepository.recordUsageEvent({
      feature_key: options.featureKey,
      model: targetModel,
      input_tokens: 0,
      output_tokens: 0,
      total_tokens: 0,
      latency_ms: latencyMs,
      status: "ERROR",
      error_type: "QUOTA_EXCEEDED",
      error_message: "All credentials and quota groups exhausted. Applied safe pedagogical fallback.",
      caller_user_id: options.callerUserId,
    });

    return {
      success: false,
      modelUsed: targetModel,
      isFailover: true,
      tokensConsumed: { input: 0, output: 0, total: 0 },
      latencyMs,
      error: "Layanan AI sedang mencapai batas kapasitas atau sedang offline. Sistem menerapkan mode pemulihan terpadu.",
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
      const plaintextKey = decryptSecret(cred.encrypted_api_key, cred.iv, cred.auth_tag);
      const client = new GoogleGenAI({ apiKey: plaintextKey });

      // Lightweight test prompt
      const resp = await client.models.generateContent({
        model: "gemini-2.5-flash",
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
