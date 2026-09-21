import { NextRequest, NextResponse } from "next/server";
import { repository } from "@/lib/db/repository";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const examId = searchParams.get("exam_id");
    const studentId = searchParams.get("student_id") || "student-demo-01";
    const studentName = searchParams.get("student_name") || "Budi Pratama";

    if (!examId) {
      return NextResponse.json(
        { error: "ID Ujian wajib disertakan." },
        { status: 400 }
      );
    }

    const payload = repository.getStudentExamPayload(examId, studentId);
    if (!payload) {
      return NextResponse.json(
        { error: "Ujian tidak ditemukan atau Anda tidak terdaftar di kelas ini." },
        { status: 404 }
      );
    }

    // Ensure attempt is initialized
    let attempt = payload.attempt;
    if (!attempt) {
      attempt = repository.startAttempt(examId, studentId, studentName);
    }

    const savedAnswers = repository.getStudentAnswers(attempt.id);

    return NextResponse.json({
      success: true,
      exam: payload,
      attempt,
      saved_answers: savedAnswers,
    });
  } catch (error) {
    console.error("API error fetching exam session:", error);
    return NextResponse.json(
      { error: "Gagal memuat sesi ujian." },
      { status: 500 }
    );
  }
}
