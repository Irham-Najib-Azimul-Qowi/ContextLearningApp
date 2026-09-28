import { NextResponse } from "next/server";
import { getAuthenticatedAdmin, hasPermission } from "@/lib/admin/auth";
import { repository } from "@/lib/db/repository";

export async function GET(request: Request) {
  try {
    const authData = await getAuthenticatedAdmin();
    if (!authData || !hasPermission(authData.admin, "users.read")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const searchQuery = (searchParams.get("q") || "").toLowerCase();
    const statusFilter = searchParams.get("status") || "ALL";

    // Get ALL rooms system-wide (no teacher filter for admin)
    const allRooms = repository.getRooms();
    const allSchools = repository.getSchools();
    const allUsers = repository.getUsers();

    let rooms = allRooms.map((r: any) => {
      const school = allSchools.find((s: any) => s.id === r.school_id);
      const teacher = allUsers.find((u: any) => u.id === r.teacher_id);
      return {
        id: r.id,
        code: r.code,
        title: r.title,
        description: r.description || "",
        school_id: r.school_id,
        school_name: school?.name || "Tidak diketahui",
        region_name: school?.region_name || "-",
        teacher_id: r.teacher_id,
        teacher_name: teacher?.full_name || r.teacher_name || "-",
        resource_type: r.resource_type || "question",
        resource_id: r.resource_id,
        question_ids: r.question_ids || [],
        material_ids: r.material_ids || [],
        is_active: r.is_active !== false,
        access_count: r.access_count || 0,
        visitor_count: r.visitors?.length || 0,
        visitors: (r.visitors || []).map((v: any) => ({
          name: v.name,
          accessed_at: v.accessed_at,
          score: v.score,
          completed: v.completed,
        })),
        created_at: r.created_at,
      };
    });

    // Apply search filter
    if (searchQuery) {
      rooms = rooms.filter(
        (r: any) =>
          r.title.toLowerCase().includes(searchQuery) ||
          r.code.toLowerCase().includes(searchQuery) ||
          r.school_name.toLowerCase().includes(searchQuery) ||
          (r.teacher_name || "").toLowerCase().includes(searchQuery)
      );
    }

    // Apply status filter
    if (statusFilter === "ACTIVE") {
      rooms = rooms.filter((r: any) => r.is_active);
    } else if (statusFilter === "INACTIVE") {
      rooms = rooms.filter((r: any) => !r.is_active);
    }

    return NextResponse.json({
      success: true,
      rooms,
      stats: {
        totalRooms: allRooms.length,
        activeRooms: allRooms.filter((r: any) => r.is_active !== false).length,
        totalVisitors: allRooms.reduce((acc: number, r: any) => acc + (r.visitors?.length || 0), 0),
        totalAccess: allRooms.reduce((acc: number, r: any) => acc + (r.access_count || 0), 0),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
