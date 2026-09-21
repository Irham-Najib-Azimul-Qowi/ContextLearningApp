import { NextRequest, NextResponse } from "next/server";
import { repository } from "@/lib/db/repository";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { student_id, student_name, join_code } = body;

    if (!student_id || !join_code) {
      return NextResponse.json(
        { error: "ID siswa dan kode kelas harus diisi." },
        { status: 400 }
      );
    }

    const result = repository.joinClass(
      student_id,
      student_name || "Siswa",
      join_code
    );

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      class: result.class,
    });
  } catch (error) {
    console.error("API error joining class:", error);
    return NextResponse.json(
      { error: "Gagal memproses pendaftaran kelas." },
      { status: 500 }
    );
  }
}
