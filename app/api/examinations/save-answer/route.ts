import { NextRequest, NextResponse } from "next/server";
import { repository } from "@/lib/db/repository";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { attempt_id, question_id, selected_option, essay_answer } = body;

    if (!attempt_id || !question_id) {
      return NextResponse.json(
        { error: "Attempt ID dan Question ID diperlukan." },
        { status: 400 }
      );
    }

    const saved = repository.saveStudentAnswer(
      attempt_id,
      question_id,
      selected_option,
      essay_answer
    );

    return NextResponse.json({
      success: true,
      answer: saved,
    });
  } catch (error) {
    console.error("API error saving answer:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan jawaban." },
      { status: 500 }
    );
  }
}
