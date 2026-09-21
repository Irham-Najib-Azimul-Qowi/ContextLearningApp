import { GoogleGenAI } from "@google/genai";
import { repository } from "../db/repository";
import { AICredential } from "../db/types";

export interface AIExecutionOptions {
  schoolId?: string;
  userId: string;
  operationType: "question_generation" | "contextualization" | "multimodal_extraction" | "material_generation";
  model?: string;
}

export interface AIExecutionResult<T> {
  data: T;
  source: "gemini" | "curriculum_fallback";
  modelUsed: string;
  durationMs: number;
}

/**
 * Server-Side Centralized AI Provider Manager
 * Manages pool of authorized Gemini credentials, health checks, quota boundaries,
 * token accounting, and secure server-side execution.
 * Teachers and students NEVER provide raw API keys.
 */
export class AIProviderManager {
  /**
   * Selects an active, healthy Gemini credential based on priority and status
   */
  private selectAvailableCredential(preferredModel?: string): { credential?: AICredential; rawKey: string } | null {
    const credentials = repository.getAICredentials();
    const activeCredentials = credentials
      .filter((c) => c.status === "active" && c.health_status !== "failing")
      .sort((a, b) => a.priority - b.priority || b.weight - a.weight);

    // Filter by model if requested
    const suitable = preferredModel
      ? activeCredentials.filter((c) => c.supported_models.includes(preferredModel))
      : activeCredentials;

    const candidate = suitable[0] || activeCredentials[0];

    // Priority 1: Check environment variable GEMINI_API_KEY (server-side secure)
    const envKey = process.env.GEMINI_API_KEY;
    if (envKey) {
      return {
        credential: candidate,
        rawKey: envKey,
      };
    }

    // Priority 2: If credential has encrypted/stored key
    if (candidate && candidate.encrypted_key) {
      return {
        credential: candidate,
        rawKey: candidate.encrypted_key,
      };
    }

    return null;
  }

  /**
   * Executes a Gemini prompt with automatic credential routing, usage logging, and fallback
   */
  async executePrompt<T>(
    options: AIExecutionOptions,
    runner: (client: GoogleGenAI, model: string) => Promise<{ data: T; inputTokens?: number; outputTokens?: number }>,
    fallbackRunner: () => Promise<T>
  ): Promise<AIExecutionResult<T>> {
    const startTime = Date.now();
    const targetModel = options.model || "gemini-2.5-flash";
    const selected = this.selectAvailableCredential(targetModel);

    if (!selected) {
      // Fallback cleanly if no server credentials configured
      const data = await fallbackRunner();
      return {
        data,
        source: "curriculum_fallback",
        modelUsed: "local-curriculum-engine",
        durationMs: Date.now() - startTime,
      };
    }

    let client: GoogleGenAI;
    try {
      client = new GoogleGenAI({ apiKey: selected.rawKey });
    } catch {
      const data = await fallbackRunner();
      return {
        data,
        source: "curriculum_fallback",
        modelUsed: "local-curriculum-engine",
        durationMs: Date.now() - startTime,
      };
    }

    // Attempt execution with bounded retry
    let lastError: any = null;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const result = await runner(client, targetModel);
        const durationMs = Date.now() - startTime;

        // Log AI usage securely
        repository.logAIUsage({
          request_id: `req-${Date.now()}`,
          school_id: options.schoolId,
          user_id: options.userId,
          operation_type: options.operationType,
          model: targetModel,
          credential_id: selected.credential?.id || "env-cluster",
          project_id: selected.credential?.project_id || "contextlearning-prod-ai",
          input_tokens: result.inputTokens || 350,
          output_tokens: result.outputTokens || 400,
          duration_ms: durationMs,
          success: true,
        });

        return {
          data: result.data,
          source: "gemini",
          modelUsed: targetModel,
          durationMs,
        };
      } catch (err: any) {
        lastError = err;
        console.warn(`[AIProviderManager] Attempt ${attempt} failed:`, err?.message || err);
        if (attempt < 2) {
          // Exponential backoff
          await new Promise((resolve) => setTimeout(resolve, 600));
        }
      }
    }

    // Log failure
    const durationMs = Date.now() - startTime;
    repository.logAIUsage({
      request_id: `req-${Date.now()}`,
      school_id: options.schoolId,
      user_id: options.userId,
      operation_type: options.operationType,
      model: targetModel,
      credential_id: selected.credential?.id || "env-cluster",
      project_id: selected.credential?.project_id || "contextlearning-prod-ai",
      input_tokens: 0,
      output_tokens: 0,
      duration_ms: durationMs,
      success: false,
      error_category: lastError?.status || "API_ERROR",
    });

    // Gracefully degrade to deterministic curriculum fallback
    const fallbackData = await fallbackRunner();
    return {
      data: fallbackData,
      source: "curriculum_fallback",
      modelUsed: "local-curriculum-engine",
      durationMs,
    };
  }
}

export const aiProviderManager = new AIProviderManager();
