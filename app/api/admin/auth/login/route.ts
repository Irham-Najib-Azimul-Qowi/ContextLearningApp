import { NextResponse } from "next/server";
import { authenticateAdmin, ADMIN_COOKIE_NAME } from "@/lib/admin/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || undefined;

    const result = await authenticateAdmin(username, password, ip, userAgent);

    if (!result.success || !result.token) {
      return NextResponse.json({ error: result.error || "Login gagal." }, { status: 401 });
    }

    const response = NextResponse.json({
      success: true,
      admin: result.admin,
    });

    // Set secure HttpOnly cookie
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: result.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 8 * 60 * 60, // 8 hours
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
