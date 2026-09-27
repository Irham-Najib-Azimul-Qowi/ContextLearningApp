import { NextResponse } from "next/server";
import { createLkbClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomCode = searchParams.get("room_code");

    if (!roomCode) {
      return NextResponse.json(
        { error: "Parameter room_code diperlukan." },
        { status: 400 }
      );
    }

    const cleanCode = roomCode.trim().toLowerCase();
    const lkbClient = createLkbClient();

    const { data: submissions, error } = await lkbClient
      .from("room_submissions")
      .select("*")
      .eq("room_code", cleanCode)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      submissions: submissions || [],
    });
  } catch (err: any) {
    console.error("[Room Submissions Query Error]", err);
    return NextResponse.json(
      { error: "Gagal memuat data pengerjaan room: " + (err.message || String(err)) },
      { status: 500 }
    );
  }
}
