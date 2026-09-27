import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createLkbClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryEmail = searchParams.get("email");
    const queryUserId = searchParams.get("userId");

    // 1. Check Bearer token from header
    const authHeader = request.headers.get("Authorization");
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

    let user: any = null;
    const lkbClient = createLkbClient();

    if (bearerToken) {
      const { data, error } = await lkbClient.auth.getUser(bearerToken);
      if (!error && data?.user) {
        user = data.user;
      }
    }

    // 2. Fallback to cookies
    if (!user) {
      try {
        const serverSupabase = await createClient();
        const { data, error } = await serverSupabase.auth.getUser();
        if (!error && data?.user) {
          user = data.user;
        }
      } catch {
        // Cookies unavailable
      }
    }

    const effectiveUserId = user?.id || queryUserId;
    const effectiveEmail = user?.email || queryEmail;

    if (!effectiveUserId && !effectiveEmail) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 3. Query PostgreSQL table user_synced_data
    const orFilter = [
      effectiveUserId ? `user_id.eq.${effectiveUserId}` : null,
      effectiveEmail ? `user_email.eq.${effectiveEmail}` : null,
    ]
      .filter(Boolean)
      .join(",");

    const { data: row } = await lkbClient
      .from("user_synced_data")
      .select("*")
      .or(orFilter)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const meta = user?.user_metadata || {};

    if (row) {
      return NextResponse.json({
        success: true,
        data: {
          userId: row.user_id || effectiveUserId,
          email: row.user_email || effectiveEmail,
          onboardingCompleted: row.onboarding_completed ?? true,
          materials: Array.isArray(row.materials) ? row.materials : [],
          questions: Array.isArray(row.questions) ? row.questions : [],
          rooms: Array.isArray(row.rooms) ? row.rooms : [],
          schools: Array.isArray(row.schools) ? row.schools : [],
          activeSchool: row.active_school_id || null,
          profile: row.profile || meta.teacher_profile || null,
        },
      });
    }

    // Fallback to user_metadata
    return NextResponse.json({
      success: true,
      data: {
        userId: effectiveUserId,
        email: effectiveEmail,
        onboardingCompleted: !!(
          meta.onboarding_completed || meta.profile_completed
        ),
        materials: Array.isArray(meta.synced_materials)
          ? meta.synced_materials
          : [],
        questions: Array.isArray(meta.synced_questions)
          ? meta.synced_questions
          : [],
        rooms: Array.isArray(meta.synced_rooms) ? meta.synced_rooms : [],
        schools: Array.isArray(meta.synced_schools) ? meta.synced_schools : [],
        activeSchool: meta.synced_active_school || null,
        profile: meta.teacher_profile || null,
      },
    });
  } catch (err: any) {
    console.error("GET sync user data error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

    let user: any = null;
    const lkbClient = createLkbClient();

    if (bearerToken) {
      const { data, error } = await lkbClient.auth.getUser(bearerToken);
      if (!error && data?.user) {
        user = data.user;
      }
    }

    if (!user) {
      try {
        const serverSupabase = await createClient();
        const { data, error } = await serverSupabase.auth.getUser();
        if (!error && data?.user) {
          user = data.user;
        }
      } catch {
        // Cookies unavailable
      }
    }

    const body = await request.json();
    const {
      userId,
      userEmail,
      materials,
      questions,
      rooms,
      schools,
      activeSchool,
      profile,
      onboardingCompleted,
    } = body;

    const targetUserId = user?.id || userId;
    const targetEmail = user?.email || userEmail;

    if (!targetUserId && !targetEmail) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Upsert into user_synced_data table in Supabase
    const { error: upsertError } = await lkbClient
      .from("user_synced_data")
      .upsert(
        {
          user_id: targetUserId || `usr-${Date.now()}`,
          user_email: targetEmail,
          profile: profile || null,
          materials: Array.isArray(materials) ? materials : [],
          questions: Array.isArray(questions) ? questions : [],
          rooms: Array.isArray(rooms) ? rooms : [],
          schools: Array.isArray(schools) ? schools : [],
          active_school_id: activeSchool || null,
          onboarding_completed:
            onboardingCompleted !== undefined ? !!onboardingCompleted : true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (upsertError) {
      console.warn("Error upserting user_synced_data:", upsertError);
    }

    // Extra backup: update user_metadata in Supabase Auth if session exists
    if (user) {
      try {
        const currentMeta = user.user_metadata || {};
        const serverSupabase = await createClient();
        await serverSupabase.auth.updateUser({
          data: {
            ...currentMeta,
            onboarding_completed: true,
            teacher_profile: profile || currentMeta.teacher_profile,
            synced_materials: materials,
            synced_questions: questions,
            synced_rooms: rooms,
          },
        });
      } catch {
        // Fallback
      }
    }

    return NextResponse.json({
      success: true,
      message: "Data berhasil disinkronisasi ke cloud.",
    });
  } catch (err: any) {
    console.error("POST sync user data error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
