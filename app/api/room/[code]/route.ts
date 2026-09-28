import { NextResponse } from "next/server";
import { createLkbClient } from "@/lib/supabase/server";
import { repository } from "@/lib/db/repository";
import { LearningRoom, LearningMaterial, Question, resolveRoomQuestions } from "@/lib/db/types";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params;
    if (!code) {
      return NextResponse.json(
        { success: false, error: "Kode room wajib dicantumkan." },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");

    // 1. Look up in Supabase user_synced_data (authoritative cloud store for all created rooms)
    const lkbClient = createLkbClient();
    const { data: rows, error: queryErr } = await lkbClient
      .from("user_synced_data")
      .select("user_id, user_email, rooms, materials, questions");

    let matchedRoom: LearningRoom | null = null;
    let matchedTeacherRow: any = null;

    if (!queryErr && Array.isArray(rows)) {
      for (const row of rows) {
        if (Array.isArray(row.rooms)) {
          for (const r of row.rooms) {
            const rCode = (r.code || "").trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
            const rId = (r.id || "").trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
            if (rCode === cleanCode || rId === cleanCode) {
              matchedRoom = r;
              matchedTeacherRow = row;
              break;
            }
          }
        }
        if (matchedRoom) break;
      }
    }

    // 2. Fallback to repository seed rooms if not in user_synced_data
    if (!matchedRoom) {
      const seedRooms = repository.getRooms();
      matchedRoom =
        seedRooms.find((r) => {
          const rCode = (r.code || "").trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
          const rId = (r.id || "").trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
          return rCode === cleanCode || rId === cleanCode;
        }) || null;
    }

    if (!matchedRoom) {
      return NextResponse.json(
        {
          success: false,
          error: `Kode room "${cleanCode}" tidak ditemukan. Pastikan kodenya benar.`,
        },
        { status: 404 }
      );
    }

    // 3. Resolve attached Material if room has material
    let resolvedMaterial: LearningMaterial | null = null;
    if (matchedRoom.type === "material" || matchedRoom.type === "both") {
      const matId = matchedRoom.resource_id;

      // Search in teacher's synced materials
      if (matchedTeacherRow && Array.isArray(matchedTeacherRow.materials)) {
        resolvedMaterial =
          matchedTeacherRow.materials.find((m: any) => m.id === matId) || null;
      }

      // Search across all teachers if not found in creator's row
      if (!resolvedMaterial && Array.isArray(rows)) {
        for (const row of rows) {
          if (Array.isArray(row.materials)) {
            resolvedMaterial = row.materials.find((m: any) => m.id === matId) || null;
            if (resolvedMaterial) break;
          }
        }
      }

      // Search in repository SEED_MATERIALS
      if (!resolvedMaterial) {
        resolvedMaterial = repository.getMaterials().find((m) => m.id === matId) || null;
      }
    }

    // 4. Resolve attached Question if room has questions
    let resolvedQuestion: Question | null = null;
    if (matchedRoom.type === "question" || matchedRoom.type === "both") {
      const qId =
        matchedRoom.type === "both"
          ? matchedRoom.secondary_resource_id
          : matchedRoom.resource_id;

      // Collect available questions from creator, synced users, and repository
      const pool: Question[] = [];
      if (matchedTeacherRow && Array.isArray(matchedTeacherRow.questions)) {
        pool.push(...matchedTeacherRow.questions);
      }
      if (Array.isArray(rows)) {
        for (const row of rows) {
          if (Array.isArray(row.questions)) {
            pool.push(...row.questions);
          }
        }
      }
      pool.push(...repository.getQuestions());

      const { combinedQuestion } = resolveRoomQuestions(qId, pool);
      resolvedQuestion = combinedQuestion;
    }

    return NextResponse.json({
      success: true,
      room: matchedRoom,
      material: resolvedMaterial,
      question: resolvedQuestion,
    });
  } catch (err: any) {
    console.error("[GET /api/room/[code] Error]", err);
    return NextResponse.json(
      {
        success: false,
        error: "Gagal memuat room: " + (err.message || String(err)),
      },
      { status: 500 }
    );
  }
}
