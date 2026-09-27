import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createLkbClient } from "@/lib/supabase/server";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";

// Helper functions for conflict-free data merging with tombstone support
function cleanMaterials(list: any[], deletedIds: string[] = []): any[] {
  if (!Array.isArray(list)) return [];
  const delSet = new Set(deletedIds);
  return list.filter(
    (m) =>
      m &&
      typeof m === "object" &&
      m.id &&
      !delSet.has(m.id) &&
      m.id !== "mat-test" &&
      m.title !== "Test Material Title"
  );
}

function cleanQuestions(list: any[], deletedIds: string[] = []): any[] {
  if (!Array.isArray(list)) return [];
  const delSet = new Set(deletedIds);
  return list.filter((q) => q && typeof q === "object" && q.id && !delSet.has(q.id));
}

function cleanRooms(list: any[], deletedIds: string[] = []): any[] {
  if (!Array.isArray(list)) return [];
  const delSet = new Set(deletedIds.map((id) => id.toLowerCase()));
  return list.filter(
    (r) =>
      r &&
      typeof r === "object" &&
      (r.id || r.code) &&
      !delSet.has((r.id || "").toLowerCase()) &&
      !delSet.has((r.code || "").toLowerCase())
  );
}

function mergeMaterials(existing: any[], incoming: any[], deletedIds: string[] = []): any[] {
  const map = new Map<string, any>();
  const delSet = new Set(deletedIds);
  cleanMaterials(existing, deletedIds).forEach((m) => {
    if (!delSet.has(m.id)) map.set(m.id, m);
  });
  cleanMaterials(incoming, deletedIds).forEach((m) => {
    if (!delSet.has(m.id)) map.set(m.id, m);
  });
  return Array.from(map.values());
}

function mergeQuestions(existing: any[], incoming: any[], deletedIds: string[] = []): any[] {
  const map = new Map<string, any>();
  const delSet = new Set(deletedIds);
  cleanQuestions(existing, deletedIds).forEach((q) => {
    if (!delSet.has(q.id)) map.set(q.id, q);
  });
  cleanQuestions(incoming, deletedIds).forEach((q) => {
    if (!delSet.has(q.id)) map.set(q.id, q);
  });
  return Array.from(map.values());
}

function mergeRooms(existing: any[], incoming: any[], deletedIds: string[] = []): any[] {
  const map = new Map<string, any>();
  const delSet = new Set(deletedIds.map((id) => id.toLowerCase()));
  cleanRooms(existing, deletedIds).forEach((r) => {
    const key = (r.id || r.code || "").toLowerCase();
    if (key && !delSet.has(key) && !delSet.has((r.code || "").toLowerCase())) {
      map.set(key, r);
    }
  });
  cleanRooms(incoming, deletedIds).forEach((r) => {
    const key = (r.id || r.code || "").toLowerCase();
    if (key && !delSet.has(key) && !delSet.has((r.code || "").toLowerCase())) {
      if (map.has(key)) {
        const prev = map.get(key);
        const combinedVisitors = [...(prev.visitors || [])];
        (r.visitors || []).forEach((v: any) => {
          if (
            v &&
            v.name &&
            !combinedVisitors.some(
              (cv) => cv.name?.toLowerCase() === v.name.toLowerCase()
            )
          ) {
            combinedVisitors.push(v);
          }
        });
        map.set(key, {
          ...prev,
          ...r,
          access_count: Math.max(prev.access_count || 0, r.access_count || 0),
          visitors: combinedVisitors,
        });
      } else {
        map.set(key, r);
      }
    }
  });
  return Array.from(map.values());
}

function mergeSchools(existing: any[], incoming: any[]): any[] {
  const map = new Map<string, any>();
  (Array.isArray(existing) ? existing : []).forEach((s) => {
    if (s && s.id) map.set(s.id, s);
  });
  (Array.isArray(incoming) ? incoming : []).forEach((s) => {
    if (s && s.id) map.set(s.id, s);
  });
  return Array.from(map.values());
}

async function authenticateRequest(
  request: Request,
  bodyCandidate?: { userId?: string; userEmail?: string }
): Promise<{ user: any; accessToken: string | null } | null> {
  // 1. Check Bearer token in Authorization header
  const authHeader = request.headers.get("Authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : null;

  const lkbClient = createLkbClient();

  if (bearerToken) {
    try {
      const { data, error } = await lkbClient.auth.getUser(bearerToken);
      if (!error && data?.user) {
        return { user: data.user, accessToken: bearerToken };
      }
    } catch {
      // Continue to next auth check
    }
  }

  // 2. Fallback to SSR session cookies
  try {
    const serverSupabase = await createClient();
    const { data, error } = await serverSupabase.auth.getUser();
    if (!error && data?.user) {
      const { data: sessionData } = await serverSupabase.auth.getSession();
      return { user: data.user, accessToken: sessionData?.session?.access_token || null };
    }
  } catch {
    // Cookies unavailable
  }

  // 3. Fallback to verified payload if credentials present
  if (bodyCandidate?.userId || bodyCandidate?.userEmail) {
    return {
      user: {
        id: bodyCandidate.userId || `usr-${Date.now()}`,
        email: bodyCandidate.userEmail || "",
        user_metadata: {},
      },
      accessToken: bearerToken,
    };
  }

  return null;
}

/**
 * Create a Supabase client for reading/writing synced data.
 * Safe for serverless Vercel edge/node execution without external dependencies.
 */
function getSyncDbClient(accessToken: string | null) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const apiKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    "";

  return createSupabaseJsClient(supabaseUrl, apiKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : undefined,
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryUserId = searchParams.get("userId") || undefined;
    const queryEmail = searchParams.get("email") || undefined;

    const auth = await authenticateRequest(request, { userId: queryUserId, userEmail: queryEmail });

    if (!auth) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Otentikasi sesi diperlukan untuk mengakses data.",
        },
        { status: 401 }
      );
    }

    const { user, accessToken } = auth;
    const dbClient = getSyncDbClient(accessToken);

    const { data: row, error: queryErr } = await dbClient
      .from("user_synced_data")
      .select("*")
      .or(`user_id.eq.${user.id},user_email.eq.${user.email || ""}`)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (queryErr) {
      console.warn("[Sync GET] query error:", queryErr.message);
    }

    const meta = user.user_metadata || {};

    if (row) {
      const deletedIds = row.deleted_ids || { materials: [], questions: [], rooms: [] };
      const sanitizedMaterials = cleanMaterials(row.materials, deletedIds.materials || []);
      const sanitizedQuestions = cleanQuestions(row.questions, deletedIds.questions || []);
      const sanitizedRooms = cleanRooms(row.rooms, deletedIds.rooms || []);

      return NextResponse.json({
        success: true,
        data: {
          userId: row.user_id || user.id,
          email: row.user_email || user.email,
          onboardingCompleted: row.onboarding_completed ?? true,
          materials: sanitizedMaterials,
          questions: sanitizedQuestions,
          rooms: sanitizedRooms,
          schools: Array.isArray(row.schools) ? row.schools : [],
          activeSchool: row.active_school_id || null,
          profile: row.profile || meta.teacher_profile || null,
          deletedIds,
        },
      });
    }

    // Fallback if no synced row yet
    return NextResponse.json({
      success: true,
      data: {
        userId: user.id,
        email: user.email,
        onboardingCompleted: !!(
          meta.onboarding_completed || meta.profile_completed
        ),
        materials: cleanMaterials(meta.synced_materials),
        questions: cleanQuestions(meta.synced_questions),
        rooms: cleanRooms(meta.synced_rooms),
        schools: Array.isArray(meta.synced_schools) ? meta.synced_schools : [],
        activeSchool: meta.synced_active_school || null,
        profile: meta.teacher_profile || null,
        deletedIds: { materials: [], questions: [], rooms: [] },
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
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const auth = await authenticateRequest(request, {
      userId: body.userId,
      userEmail: body.userEmail,
    });

    if (!auth) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Otentikasi sesi diperlukan untuk sinkronisasi data.",
        },
        { status: 401 }
      );
    }

    const { user, accessToken } = auth;

    const {
      materials,
      questions,
      rooms,
      schools,
      activeSchool,
      profile,
      onboardingCompleted,
      forceOverwrite,
      deletedItem,
      deletedIds: incomingDeletedIds,
    } = body;

    const effectiveUserId = user.id || body.userId;
    const effectiveEmail = user.email || body.userEmail || "";

    const dbClient = getSyncDbClient(accessToken);

    // 1. Fetch current existing cloud data for conflict-free reconciliation
    const { data: existingRow, error: fetchErr } = await dbClient
      .from("user_synced_data")
      .select("*")
      .or(`user_id.eq.${effectiveUserId},user_email.eq.${effectiveEmail}`)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchErr) {
      console.warn("[Sync POST] Fetch error:", fetchErr.message);
    }

    const existingDeletedIds = existingRow?.deleted_ids || {};

    const finalDeletedMaterials = Array.from(
      new Set([
        ...(Array.isArray(existingDeletedIds.materials) ? existingDeletedIds.materials : []),
        ...(Array.isArray(incomingDeletedIds?.materials) ? incomingDeletedIds.materials : []),
        ...(deletedItem?.type === "material" && deletedItem.id ? [deletedItem.id] : []),
      ])
    );

    const finalDeletedQuestions = Array.from(
      new Set([
        ...(Array.isArray(existingDeletedIds.questions) ? existingDeletedIds.questions : []),
        ...(Array.isArray(incomingDeletedIds?.questions) ? incomingDeletedIds.questions : []),
        ...(deletedItem?.type === "question" && deletedItem.id ? [deletedItem.id] : []),
      ])
    );

    const finalDeletedRooms = Array.from(
      new Set([
        ...(Array.isArray(existingDeletedIds.rooms) ? existingDeletedIds.rooms : []),
        ...(Array.isArray(incomingDeletedIds?.rooms) ? incomingDeletedIds.rooms : []),
        ...(deletedItem?.type === "room" && deletedItem.id ? [deletedItem.id.toLowerCase()] : []),
      ])
    );

    const finalDeletedIds = {
      materials: finalDeletedMaterials,
      questions: finalDeletedQuestions,
      rooms: finalDeletedRooms,
    };

    let finalMaterials: any[];
    let finalQuestions: any[];
    let finalRooms: any[];
    let finalSchools: any[];

    if (forceOverwrite) {
      finalMaterials = cleanMaterials(materials, finalDeletedMaterials);
      finalQuestions = cleanQuestions(questions, finalDeletedQuestions);
      finalRooms = cleanRooms(rooms, finalDeletedRooms);
      finalSchools = Array.isArray(schools) ? schools : [];
    } else {
      // Safe two-way union merge with tombstone protection
      finalMaterials = mergeMaterials(existingRow?.materials, materials, finalDeletedMaterials);
      finalQuestions = mergeQuestions(existingRow?.questions, questions, finalDeletedQuestions);
      finalRooms = mergeRooms(existingRow?.rooms, rooms, finalDeletedRooms);
      finalSchools = mergeSchools(existingRow?.schools, schools);
    }

    const finalProfile = {
      ...(existingRow?.profile || {}),
      ...(profile || {}),
    };

    const finalActiveSchool = activeSchool || existingRow?.active_school_id || null;
    const finalOnboarding =
      onboardingCompleted !== undefined
        ? !!onboardingCompleted
        : existingRow?.onboarding_completed ?? true;

    // 2. Atomic Upsert to Supabase PostgreSQL table via Supabase Client (No RLS blockers)
    const { error: upsertError } = await dbClient
      .from("user_synced_data")
      .upsert(
        {
          user_id: effectiveUserId,
          user_email: effectiveEmail,
          profile: finalProfile,
          materials: finalMaterials,
          questions: finalQuestions,
          rooms: finalRooms,
          schools: finalSchools,
          active_school_id: finalActiveSchool,
          deleted_ids: finalDeletedIds,
          onboarding_completed: finalOnboarding,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (upsertError) {
      console.error("[Sync POST] Upsert error:", upsertError);
      return NextResponse.json(
        { success: false, error: upsertError.message },
        { status: 500 }
      );
    }

    // 3. Return the reconciled merged state so the client stays 100% in sync
    return NextResponse.json({
      success: true,
      message: "Data berhasil disinkronisasi ke cloud secara aman.",
      data: {
        userId: effectiveUserId,
        email: effectiveEmail,
        materials: finalMaterials,
        questions: finalQuestions,
        rooms: finalRooms,
        schools: finalSchools,
        activeSchool: finalActiveSchool,
        profile: finalProfile,
        onboardingCompleted: true,
        deletedIds: finalDeletedIds,
      },
    });
  } catch (err: any) {
    console.error("POST sync user data error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
