import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { terminateAdminSession, ADMIN_COOKIE_NAME } from "@/lib/admin/auth";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

    if (token) {
      await terminateAdminSession(token);
    }

    const response = NextResponse.json({ success: true, message: "Berhasil logout." });
    response.cookies.delete(ADMIN_COOKIE_NAME);
    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
