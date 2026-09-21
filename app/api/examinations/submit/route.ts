import { NextRequest, NextResponse } from "next/server";
import { repository } from "@/lib/db/repository";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { attempt_id } = body;

    if (!attempt_id) {
      return NextResponse.json(
        { error: "Attempt ID wajib disertakan." },
        { status: 400 }
      );
    }

    const gradingResult = repository.submitAttempt(attempt_id);

    return NextResponse.json({
      success: true,
      result: gradingResult,
    });
  } catch (error: any) {
    console.error("API error submitting exam attempt:", error);
    return NextResponse.json(
      { error: error?.message || "Gagal mengumpulkan lembar ujian." },
      { status: 500 }
    );
  }
}
