import { NextRequest, NextResponse } from "next/server";
import { aiService } from "@/lib/ai/gemini-provider";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { error: "Data gambar belum disertakan." },
        { status: 400 }
      );
    }

    const result = await aiService.scanQuestionImage(
      imageBase64,
      mimeType || "image/jpeg"
    );

    return NextResponse.json({
      success: true,
      data: result,
      is_live_ai: aiService.isConfigured(),
    });
  } catch (error) {
    console.error("API error scanning question image:", error);
    return NextResponse.json(
      { error: "Gagal memproses gambar soal." },
      { status: 500 }
    );
  }
}
