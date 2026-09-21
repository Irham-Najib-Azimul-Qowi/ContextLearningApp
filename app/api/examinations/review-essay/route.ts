import { NextRequest, NextResponse } from "next/server";
import { repository } from "@/lib/db/repository";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { answer_id, score, feedback } = body;

    if (!answer_id || score === undefined) {
      return NextResponse.json(
        { error: "Answer ID dan nilai essay diperlukan." },
        { status: 400 }
      );
    }

    const updated = repository.gradeEssay(answer_id, Number(score), feedback || "");
    if (!updated) {
      return NextResponse.json(
        { error: "Data jawaban siswa tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      answer: updated,
    });
  } catch (error) {
    console.error("API error reviewing essay:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan penilaian essay." },
      { status: 500 }
    );
  }
}
