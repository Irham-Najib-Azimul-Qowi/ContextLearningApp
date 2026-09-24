import { NextResponse } from "next/server";
import { getAuthenticatedAdmin, hasPermission } from "@/lib/admin/auth";
import { repository } from "@/lib/db/repository";
import { adminRepository } from "@/lib/admin/admin-repository";

export async function GET(request: Request) {
  try {
    const authData = await getAuthenticatedAdmin();
    if (!authData || !hasPermission(authData.admin, "users.read")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const roleFilter = searchParams.get("role");
    const searchQuery = (searchParams.get("q") || "").toLowerCase();

    const users = repository.getUsers();
    const schools = repository.getSchools();

    let filtered = users.map((u: any) => {
      const sch = schools.find((s: any) => s.id === u.school_id);
      return {
        id: u.id,
        full_name: u.full_name,
        email: u.email,
        role: u.role,
        school_id: u.school_id,
        school_name: sch?.name || "Belum terafiliasi",
        region_name: sch?.region_name || "-",
        is_active: true,
      };
    });

    if (roleFilter && roleFilter !== "ALL") {
      filtered = filtered.filter((u: any) => u.role === roleFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (u: any) =>
          u.full_name.toLowerCase().includes(searchQuery) ||
          u.email.toLowerCase().includes(searchQuery) ||
          u.school_name.toLowerCase().includes(searchQuery)
      );
    }

    return NextResponse.json({
      success: true,
      users: filtered,
      total: filtered.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const authData = await getAuthenticatedAdmin();
    if (!authData || !hasPermission(authData.admin, "users.manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { userId, action, reason } = body;

    // Log the user management action in immutable audit log
    adminRepository.recordAuditLog({
      admin_id: authData.admin.id,
      admin_username: authData.admin.username,
      action: action === "DEACTIVATE" ? "USER_DEACTIVATED" : "USER_ACTIVATED",
      target_type: "USER",
      target_id: userId,
      result: "SUCCESS",
      metadata: { action, reason: reason || "Administrative action by developer" },
    });

    return NextResponse.json({
      success: true,
      message: `Status akun pengguna '${userId}' berhasil diperbarui.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
