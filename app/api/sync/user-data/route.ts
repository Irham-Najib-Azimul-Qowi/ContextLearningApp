import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const meta = user.user_metadata || {};

    return NextResponse.json({
      success: true,
      data: {
        userId: user.id,
        email: user.email,
        onboardingCompleted: !!(meta.onboarding_completed || meta.profile_completed),
        materials: Array.isArray(meta.synced_materials) ? meta.synced_materials : null,
        questions: Array.isArray(meta.synced_questions) ? meta.synced_questions : null,
        rooms: Array.isArray(meta.synced_rooms) ? meta.synced_rooms : null,
        schools: Array.isArray(meta.synced_schools) ? meta.synced_schools : null,
        activeSchool: meta.synced_active_school || null,
        profile: meta.teacher_profile || null,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      materials,
      questions,
      rooms,
      schools,
      activeSchool,
      profile,
      onboardingCompleted,
    } = body;

    const currentMeta = user.user_metadata || {};
    const updatedData: Record<string, any> = {
      ...currentMeta,
      updated_at: new Date().toISOString(),
    };

    if (onboardingCompleted !== undefined) {
      updatedData.onboarding_completed = !!onboardingCompleted;
    }
    if (materials !== undefined && Array.isArray(materials)) {
      updatedData.synced_materials = materials;
    }
    if (questions !== undefined && Array.isArray(questions)) {
      updatedData.synced_questions = questions;
    }
    if (rooms !== undefined && Array.isArray(rooms)) {
      updatedData.synced_rooms = rooms;
    }
    if (schools !== undefined && Array.isArray(schools)) {
      updatedData.synced_schools = schools;
    }
    if (activeSchool !== undefined) {
      updatedData.synced_active_school = activeSchool;
    }
    if (profile !== undefined) {
      updatedData.teacher_profile = profile;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      data: updatedData,
    });

    if (updateError) {
      console.warn("Failed to update user_metadata in Supabase Auth:", updateError);
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Data berhasil disinkronisasi ke cloud.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
