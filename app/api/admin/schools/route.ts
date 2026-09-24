import { NextResponse } from "next/server";
import { getAuthenticatedAdmin, hasPermission } from "@/lib/admin/auth";
import { repository } from "@/lib/db/repository";
import { adminRepository } from "@/lib/admin/admin-repository";

export async function GET() {
  try {
    const authData = await getAuthenticatedAdmin();
    if (!authData || !hasPermission(authData.admin, "schools.manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const schools = repository.getSchools();
    const classes = repository.getClasses();
    const users = repository.getUsers();

    const enriched = schools.map((sch) => {
      const schClasses = classes.filter((c: any) => c.school_id === sch.id);
      const schTeachers = users.filter((u: any) => u.school_id === sch.id && u.role === "TEACHER");
      const schStudents = users.filter((u: any) => u.school_id === sch.id && u.role === "STUDENT");

      return {
        id: sch.id,
        name: sch.name,
        slug: sch.slug,
        region_id: sch.region_id,
        region_name: sch.region_name,
        address: sch.address,
        class_count: schClasses.length,
        teacher_count: schTeachers.length,
        student_count: schStudents.length,
        status: "VERIFIED",
        created_at: sch.created_at,
      };
    });

    return NextResponse.json({ success: true, schools: enriched });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
