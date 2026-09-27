import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createLkbClient } from "@/lib/supabase/server";

// Helper functions for conflict-free data merging
function cleanMaterials(list: any[]): any[] {
  if (!Array.isArray(list)) return [];
  return list.filter(
    (m) =>
      m &&
      typeof m === "object" &&
      m.id &&
      m.id !== "mat-test" &&
      m.title !== "Test Material Title"
  );
}

function cleanQuestions(list: any[]): any[] {
  if (!Array.isArray(list)) return [];
  return list.filter((q) => q && typeof q === "object" && q.id);
}

function cleanRooms(list: any[]): any[] {
  if (!Array.isArray(list)) return [];
  return list.filter((r) => r && typeof r === "object" && (r.id || r.code));
}

function mergeMaterials(existing: any[], incoming: any[]): any[] {
  const map = new Map<string, any>();
  cleanMaterials(existing).forEach((m) => map.set(m.id, m));
  cleanMaterials(incoming).forEach((m) => {
    // If incoming has same id, update with incoming
    map.set(m.id, m);
  });
  return Array.from(map.values());
}

function mergeQuestions(existing: any[], incoming: any[]): any[] {
  const map = new Map<string, any>();
  cleanQuestions(existing).forEach((q) => map.set(q.id, q));
  cleanQuestions(incoming).forEach((q) => {
    map.set(q.id, q);
  });
  return Array.from(map.values());
}

function mergeRooms(existing: any[], incoming: any[]): any[] {
  const map = new Map<string, any>();
  cleanRooms(existing).forEach((r) => {
    const key = (r.id || r.code || "").toLowerCase();
    if (key) map.set(key, r);
  });
  cleanRooms(incoming).forEach((r) => {
    const key = (r.id || r.code || "").toLowerCase();
    if (key) {
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

async function authenticateRequest(request: Request): Promise<any | null> {
  // 1. Check Bearer token in Authorization header
  const authHeader = request.headers.get("Authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : null;

  const lkbClient = createLkbClient();

  if (bearerToken) {
    const { data, error } = await lkbClient.auth.getUser(bearerToken);
    if (!error && data?.user) {
      return data.user;
    }
  }

  // 2. Fallback to SSR session cookies
  try {
    const serverSupabase = await createClient();
    const { data, error } = await serverSupabase.auth.getUser();
    if (!error && data?.user) {
      return data.user;
    }
  } catch {
    // Cookies unavailable
  }

  return null;
}

export async function GET(request: Request) {
  try {
    const user = await authenticateRequest(request);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Otentikasi sesi diperlukan untuk mengakses data.",
        },
        { status: 401 }
      );
    }

    const lkbClient = createLkbClient();

    // Query Supabase PostgreSQL table user_synced_data strictly by authenticated user ID
    const { data: row, error: queryErr } = await lkbClient
      .from("user_synced_data")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (queryErr) {
      console.warn("Error querying user_synced_data:", queryErr.message);
    }

    const meta = user.user_metadata || {};

    if (row) {
      const sanitizedMaterials = cleanMaterials(row.materials);
      const sanitizedQuestions = cleanQuestions(row.questions);
      const sanitizedRooms = cleanRooms(row.rooms);

      return NextResponse.json({
        success: true,
        data: {
          userId: user.id,
          email: user.email,
          onboardingCompleted: row.onboarding_completed ?? true,
          materials: sanitizedMaterials,
          questions: sanitizedQuestions,
          rooms: sanitizedRooms,
          schools: Array.isArray(row.schools) ? row.schools : [],
          activeSchool: row.active_school_id || null,
          profile: row.profile || meta.teacher_profile || null,
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
    const user = await authenticateRequest(request);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Otentikasi sesi diperlukan untuk sinkronisasi data.",
        },
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
      forceOverwrite,
      deletedItem,
    } = body;

    const lkbClient = createLkbClient();

    // 1. Fetch current existing cloud data for conflict-free reconciliation
    const { data: existingRow } = await lkbClient
      .from("user_synced_data")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    let finalMaterials: any[];
    let finalQuestions: any[];
    let finalRooms: any[];
    let finalSchools: any[];

    if (forceOverwrite) {
      finalMaterials = cleanMaterials(materials);
      finalQuestions = cleanQuestions(questions);
      finalRooms = cleanRooms(rooms);
      finalSchools = Array.isArray(schools) ? schools : [];
    } else {
      // Safe two-way union merge
      finalMaterials = mergeMaterials(existingRow?.materials, materials);
      finalQuestions = mergeQuestions(existingRow?.questions, questions);
      finalRooms = mergeRooms(existingRow?.rooms, rooms);
      finalSchools = mergeSchools(existingRow?.schools, schools);
    }

    // Handle explicit deletion if sent
    if (deletedItem && typeof deletedItem === "object") {
      const { type, id } = deletedItem;
      if (type === "material" && id) {
        finalMaterials = finalMaterials.filter((m) => m.id !== id);
      } else if (type === "question" && id) {
        finalQuestions = finalQuestions.filter((q) => q.id !== id);
      } else if (type === "room" && id) {
        finalRooms = finalRooms.filter(
          (r) =>
            (r.id || "").toLowerCase() !== id.toLowerCase() &&
            (r.code || "").toLowerCase() !== id.toLowerCase()
        );
      }
    }

    const finalProfile = {
      ...(existingRow?.profile || {}),
      ...(profile || {}),
    };

    // 2. Direct atomic upsert to Supabase PostgreSQL table
    const { error: upsertError } = await lkbClient
      .from("user_synced_data")
      .upsert(
        {
          user_id: user.id,
          user_email: user.email,
          profile: finalProfile,
          materials: finalMaterials,
          questions: finalQuestions,
          rooms: finalRooms,
          schools: finalSchools,
          active_school_id: activeSchool || existingRow?.active_school_id || null,
          onboarding_completed:
            onboardingCompleted !== undefined
              ? !!onboardingCompleted
              : existingRow?.onboarding_completed ?? true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (upsertError) {
      console.error("Error upserting user_synced_data:", upsertError);
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
        userId: user.id,
        email: user.email,
        materials: finalMaterials,
        questions: finalQuestions,
        rooms: finalRooms,
        schools: finalSchools,
        activeSchool: activeSchool || existingRow?.active_school_id || null,
        profile: finalProfile,
        onboardingCompleted: true,
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
