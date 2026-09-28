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
    const tab = searchParams.get("tab") || "all";
    const searchQuery = (searchParams.get("q") || "").toLowerCase();

    // Get ALL materials and questions system-wide (no school filter for admin)
    const allMaterials = repository.getMaterials();
    const allQuestions = repository.getQuestions();
    const allSchools = repository.getSchools();

    let materials = allMaterials.map((m: any) => {
      const school = allSchools.find((s: any) => s.id === m.school_id);
      return {
        id: m.id,
        title: m.title,
        subject: m.subject,
        grade: m.grade,
        school_id: m.school_id,
        school_name: school?.name || "Tidak diketahui",
        region_name: school?.region_name || "-",
        teacher_id: m.teacher_id,
        teacher_name: m.teacher_name || "-",
        status: m.status || "draft",
        content_preview: (m.content || "").substring(0, 150),
        created_at: m.created_at,
      };
    });

    let questions = allQuestions.map((q: any) => {
      const school = allSchools.find((s: any) => s.id === q.school_id);
      // Get question items count
      const itemCount = q.items?.length || 0;
      return {
        id: q.id,
        title: q.title,
        subject: q.subject,
        grade: q.grade,
        school_id: q.school_id,
        school_name: school?.name || "Tidak diketahui",
        region_name: school?.region_name || "-",
        teacher_id: q.teacher_id,
        teacher_name: q.teacher_name || "-",
        topic: q.topic || "-",
        question_count: itemCount,
        source: q.source || "manual",
        status: q.status || "draft",
        created_at: q.created_at,
      };
    });

    // Apply search filter
    if (searchQuery) {
      materials = materials.filter(
        (m: any) =>
          m.title.toLowerCase().includes(searchQuery) ||
          m.subject.toLowerCase().includes(searchQuery) ||
          m.school_name.toLowerCase().includes(searchQuery) ||
          (m.teacher_name || "").toLowerCase().includes(searchQuery)
      );
      questions = questions.filter(
        (q: any) =>
          q.title.toLowerCase().includes(searchQuery) ||
          q.subject.toLowerCase().includes(searchQuery) ||
          q.school_name.toLowerCase().includes(searchQuery) ||
          (q.teacher_name || "").toLowerCase().includes(searchQuery) ||
          (q.topic || "").toLowerCase().includes(searchQuery)
      );
    }

    return NextResponse.json({
      success: true,
      materials,
      questions,
      stats: {
        totalMaterials: allMaterials.length,
        totalQuestions: allQuestions.length,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
