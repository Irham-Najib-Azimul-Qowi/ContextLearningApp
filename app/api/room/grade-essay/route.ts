import { NextResponse } from "next/server";
import { createLkbClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      room_code,
      student_name,
      essay_score,
      teacher_feedback = "",
      submission_id,
    } = body;

    if (!room_code || !student_name || essay_score === undefined) {
      return NextResponse.json(
        { error: "Data penilaian esai tidak lengkap." },
        { status: 400 }
      );
    }

    const cleanCode = room_code.trim().toLowerCase();
    const cleanName = student_name.trim();
    const numericEssayScore = Math.max(0, Math.min(100, Number(essay_score)));

    const lkbClient = createLkbClient();

    // Query submission
    let query = lkbClient.from("room_submissions").select("*");
    if (submission_id) {
      query = query.eq("id", submission_id);
    } else {
      query = query.eq("room_code", cleanCode).ilike("student_name", cleanName);
    }

    const { data: sub } = await query.maybeSingle();

    const mcScore = sub?.mc_score !== undefined && sub?.mc_score !== null ? Number(sub.mc_score) : null;
    const finalScore = mcScore !== null ? Math.round((mcScore + numericEssayScore) / 2) : numericEssayScore;

    if (sub) {
      await lkbClient
        .from("room_submissions")
        .update({
          essay_score: numericEssayScore,
          score: finalScore,
          status: "Dinilai",
          teacher_feedback: teacher_feedback.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", sub.id);
    }

    // Update user_synced_data
    const { data: allSyncRows } = await lkbClient
      .from("user_synced_data")
      .select("user_id, rooms");

    if (allSyncRows) {
      for (const row of allSyncRows) {
        if (!Array.isArray(row.rooms)) continue;
        let modified = false;

        const updatedRooms = row.rooms.map((r: any) => {
          const rCode = (r.code || "").trim().toLowerCase();
          if (rCode === cleanCode && Array.isArray(r.visitors)) {
            r.visitors = r.visitors.map((v: any) => {
              if ((v.name || "").trim().toLowerCase() === cleanName.toLowerCase()) {
                modified = true;
                return {
                  ...v,
                  essay_score: numericEssayScore,
                  score: finalScore,
                  status: "Dinilai",
                  teacher_feedback: teacher_feedback.trim(),
                };
              }
              return v;
            });
          }
          return r;
        });

        if (modified) {
          await lkbClient
            .from("user_synced_data")
            .update({ rooms: updatedRooms, updated_at: new Date().toISOString() })
            .eq("user_id", row.user_id);
        }
      }
    }

    return NextResponse.json({
      success: true,
      final_score: finalScore,
      essay_score: numericEssayScore,
      status: "Dinilai",
    });
  } catch (err: any) {
    console.error("[Grade Essay Route Error]", err);
    return NextResponse.json(
      { error: "Gagal menyimpan penilaian esai: " + (err.message || String(err)) },
      { status: 500 }
    );
  }
}
