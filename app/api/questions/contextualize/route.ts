import { NextRequest, NextResponse } from "next/server";
import { executeContextualization } from "@/lib/context-engine";
import { repository } from "@/lib/db/repository";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      subject,
      grade,
      original_text,
      question_template,
      context_variables,
      options,
      correct_answer,
      region_id,
      manual_overrides,
    } = body;

    if (!original_text || !region_id) {
      return NextResponse.json(
        { error: "Teks soal dan ID wilayah wajib disertakan." },
        { status: 400 }
      );
    }

    const result = executeContextualization(
      {
        subject: subject || "Matematika",
        grade: Number(grade) || 5,
        original_text,
        question_template,
        context_variables: context_variables || [],
        options,
        correct_answer: correct_answer || "A",
        region_id,
      },
      manual_overrides
    );

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("API error contextualizing question:", error);
    return NextResponse.json(
      { error: "Gagal melakukan kontekstualisasi soal." },
      { status: 500 }
    );
  }
}
