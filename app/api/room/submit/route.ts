import { NextResponse } from "next/server";
import { createLkbClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      room_code,
      student_name,
      source = "Online",
      action = "visit", // 'visit' | 'submit_mc' | 'submit_essay' | 'submit_material'
      mc_answer,
      is_mc_correct,
      mc_score,
      essay_answer,
      document_id,
      device_info,
    } = body;

    if (!room_code || !student_name?.trim()) {
      return NextResponse.json(
        { error: "Kode room dan nama siswa wajib diisi." },
        { status: 400 }
      );
    }

    const cleanCode = room_code.trim().toLowerCase();
    const cleanName = student_name.trim();

    const lkbClient = createLkbClient();

    // 1. Check existing submission in public.room_submissions
    const { data: existingSub } = await lkbClient
      .from("room_submissions")
      .select("*")
      .eq("room_code", cleanCode)
      .ilike("student_name", cleanName)
      .maybeSingle();

    let updatedScore = existingSub?.score || 0;
    let updatedMcScore = existingSub?.mc_score || 0;
    const updatedEssayScore = existingSub?.essay_score;
    let updatedStatus = existingSub?.status || "Sedang mengerjakan";
    const answersObj = existingSub?.answers || {};

    if (action === "visit") {
      if (!existingSub) {
        updatedStatus = "Sedang mengerjakan";
      }
    } else if (action === "submit_mc") {
      const numericMcScore = mc_score !== undefined ? mc_score : is_mc_correct ? 100 : 0;
      updatedMcScore = numericMcScore;
      answersObj.mc = mc_answer;
      answersObj.is_mc_correct = is_mc_correct;

      if (updatedEssayScore !== null && updatedEssayScore !== undefined) {
        updatedScore = Math.round((updatedMcScore + updatedEssayScore) / 2);
        updatedStatus = "Dinilai";
      } else if (answersObj.essay) {
        updatedScore = updatedMcScore;
        updatedStatus = "Belum dinilai";
      } else {
        updatedScore = updatedMcScore;
        updatedStatus = "Selesai";
      }
    } else if (action === "submit_essay") {
      answersObj.essay = essay_answer;
      // Essay needs teacher grading; do not assign final automatic score
      updatedStatus = "Belum dinilai";
      if (updatedMcScore) {
        updatedScore = updatedMcScore;
      }
    } else if (action === "submit_material") {
      updatedScore = 100;
      updatedStatus = "Selesai";
    }

    let submissionId = existingSub?.id;

    if (existingSub) {
      await lkbClient
        .from("room_submissions")
        .update({
          score: updatedScore,
          mc_score: updatedMcScore,
          essay_score: updatedEssayScore,
          status: updatedStatus,
          answers: answersObj,
          source: source || existingSub.source,
          document_id: document_id || existingSub.document_id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingSub.id);
    } else {
      const { data: inserted, error: insertErr } = await lkbClient
        .from("room_submissions")
        .insert({
          room_id: `room-${cleanCode}`,
          room_code: cleanCode,
          student_name: cleanName,
          source,
          status: updatedStatus,
          score: updatedScore,
          mc_score: updatedMcScore,
          essay_score: updatedEssayScore,
          answers: answersObj,
          document_id,
          device_info,
        })
        .select("id")
        .single();

      if (!insertErr && inserted) {
        submissionId = inserted.id;
      }
    }

    // 2. Cross-device sync update in user_synced_data:
    // Find all users who own this room and update their synced rooms
    const { data: allSyncRows } = await lkbClient
      .from("user_synced_data")
      .select("user_id, rooms");

    if (allSyncRows) {
      for (const row of allSyncRows) {
        if (!Array.isArray(row.rooms)) continue;
        let modified = false;

        const updatedRooms = row.rooms.map((r: any) => {
          const rCode = (r.code || "").trim().toLowerCase();
          if (rCode === cleanCode) {
            modified = true;
            r.access_count = (r.access_count || 0) + (existingSub ? 0 : 1);
            if (!r.visitors) r.visitors = [];

            const visIdx = r.visitors.findIndex(
              (v: any) => (v.name || "").trim().toLowerCase() === cleanName.toLowerCase()
            );

            const visitorRecord = {
              name: cleanName,
              accessed_at: new Date().toISOString(),
              score: updatedScore,
              mc_score: updatedMcScore,
              essay_score: updatedEssayScore,
              completed: updatedStatus === "Selesai" || updatedStatus === "Dinilai",
              status: updatedStatus,
              source,
              essay_answer: answersObj.essay,
              document_id,
            };

            if (visIdx >= 0) {
              r.visitors[visIdx] = { ...r.visitors[visIdx], ...visitorRecord };
            } else {
              r.visitors.push(visitorRecord);
            }
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
      submissionId,
      status: updatedStatus,
      score: updatedScore,
    });
  } catch (err: any) {
    console.error("[Room Submit Route Error]", err);
    return NextResponse.json(
      { error: "Gagal menyimpan jawaban: " + (err.message || String(err)) },
      { status: 500 }
    );
  }
}
