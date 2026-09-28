import { NextResponse } from "next/server";
import { contextEngine } from "@/lib/context-engine/pipeline";
import { ContentInput } from "@/lib/context-engine/types";
import { createStructuredError } from "@/lib/ai/error-contract";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      type = "material", // 'material' | 'question'
      inputMode = "manual", // 'manual' | 'pdf' | 'camera' | 'ai' | 'from_material'
      prompt: userPrompt = "",
      rawText = "",
      title = "",
      topic = "",
      subject = "Matematika",
      grade = 5,
      regionId = "35.02",
      regionName = "Kabupaten Ponorogo",
      questionCount,
      questionType,
      options = [],
      correctAnswer = "A",
      explanation = "",
    } = body;

    const contentInput: ContentInput = {
      contentType: type === "material" ? "material" : "question",
      sourceType: inputMode || "manual",
      rawText,
      prompt: userPrompt,
      title,
      topic,
      subject,
      grade: Number(grade) || 5,
      regionId: regionId || "35.02",
      regionName: regionName || "Kabupaten Ponorogo",
      questionCount: questionCount ? Number(questionCount) : undefined,
      questionType,
      options,
      correctAnswer,
      explanation,
    };

    // Execute via unified ContextualAIEngine pipeline
    const result = await contextEngine.contextualize(contentInput);

    return NextResponse.json({
      success: true,
      data: result.type === "material" ? result.material : result.questions,
      modelUsed: result.modelUsed,
      requestId: result.requestId,
      retrievedEntities: result.retrievedEntities,
    });
  } catch (err: any) {
    console.error("[API AI Contextualize Error]", err);
    const msg = err?.message || String(err);

    let errCode: any = "UNKNOWN_ERROR";
    if (msg.includes("Pastikan materi atau soal sudah diisi") || msg.includes("kosong")) {
      errCode = "INPUT_INVALID";
    } else if (msg.includes("kuota") || msg.includes("quota")) {
      errCode = "AI_QUOTA_EXHAUSTED";
    } else if (msg.includes("rate limit")) {
      errCode = "AI_RATE_LIMITED";
    } else if (msg.includes("tidak tersedia") || msg.includes("unavailable")) {
      errCode = "AI_MODEL_UNAVAILABLE";
    } else if (msg.includes("timeout") || msg.includes("lama")) {
      errCode = "AI_TIMEOUT";
    } else if (msg.includes("format data") || msg.includes("struktur")) {
      errCode = "AI_INVALID_RESPONSE";
    }

    const structured = createStructuredError(errCode, msg);
    return NextResponse.json(
      {
        success: false,
        error: structured,
      },
      { status: errCode === "INPUT_INVALID" ? 400 : 500 }
    );
  }
}
