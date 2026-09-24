import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/admin/auth";
import { adminRepository } from "@/lib/admin/admin-repository";
import { verifyPassword, hashPassword } from "@/lib/admin/crypto";

export async function GET() {
  try {
    const authData = await getAuthenticatedAdmin();
    if (!authData) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      admin: {
        id: authData.admin.id,
        username: authData.admin.username,
        full_name: authData.admin.full_name,
        role: authData.admin.role,
        permissions: authData.permissions,
        created_at: authData.admin.created_at,
        last_login_at: authData.admin.last_login_at,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const authData = await getAuthenticatedAdmin();
    if (!authData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Kata sandi saat ini dan kata sandi baru wajib diisi." }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "Kata sandi baru minimal 8 karakter." }, { status: 400 });
    }

    // Verify current password
    const adminAccount = adminRepository.getAdminById(authData.admin.id);
    if (!adminAccount) {
      return NextResponse.json({ error: "Akun admin tidak ditemukan." }, { status: 404 });
    }

    const isValid = await verifyPassword(currentPassword, adminAccount.password_hash, adminAccount.salt);
    if (!isValid) {
      return NextResponse.json({ error: "Kata sandi saat ini tidak cocok." }, { status: 400 });
    }

    const { hash, salt } = await hashPassword(newPassword);
    adminRepository.updateAdminPassword(adminAccount.id, hash, salt);

    adminRepository.recordAuditLog({
      admin_id: authData.admin.id,
      admin_username: authData.admin.username,
      action: "ADMIN_PASSWORD_CHANGED",
      target_type: "ADMIN",
      target_id: authData.admin.id,
      result: "SUCCESS",
      metadata: { username: authData.admin.username },
    });

    return NextResponse.json({ success: true, message: "Kata sandi berhasil diperbarui." });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
