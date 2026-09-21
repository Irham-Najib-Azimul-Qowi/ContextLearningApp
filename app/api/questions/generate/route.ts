import { NextRequest, NextResponse } from "next/server";
import { aiService } from "@/lib/ai/gemini-provider";
import { QuestionSubject, QuestionType, QuestionDifficulty } from "@/lib/db/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      subject,
      grade,
      topic,
      learningObjective,
      questionType,
      difficulty,
      regionContext,
    } = body;

    if (!subject || !grade || !topic) {
      return NextResponse.json(
        { error: "Parameter mata pelajaran, jenjang kelas, dan topik wajib diisi." },
        { status: 400 }
      );
    }

    const questions = await aiService.generateQuestions({
      subject: subject as QuestionSubject,
      grade: Number(grade),
      topic,
      learningObjective: learningObjective || "Memahami konsep materi",
      questionType: (questionType as QuestionType) || "multiple_choice",
      difficulty: (difficulty as QuestionDifficulty) || "medium",
      regionContext,
    });

    return NextResponse.json({
      success: true,
      questions,
      is_live_ai: aiService.isConfigured(),
    });
  } catch (error) {
    console.error("API error generating question:", error);
    return NextResponse.json(
      { error: "Gagal membuat soal. Silakan coba kembali." },
      { status: 500 }
    );
  }
}
