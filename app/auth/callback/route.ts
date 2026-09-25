import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const error = searchParams.get("error");
  const error_description = searchParams.get("error_description");

  if (error) {
    console.error("OAuth callback error:", error, error_description);
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error_description || error)}`);
  }

  if (code) {
    try {
      const supabase = await createClient();
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error("Error exchanging code for session:", exchangeError);
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(exchangeError.message)}`);
      }

      const user = data.user;
      if (user) {
        // Query user profile in Supabase to determine role and onboarding status
        const { data: profile, error: profileError } = await supabase
          .from("user_profiles")
          .select("id, role, school_id, is_verified")
          .eq("id", user.id)
          .single();

        if (profileError || !profile) {
          // New user -> direct to onboarding
          return NextResponse.redirect(`${origin}/auth/onboarding`);
        }

        // Existing user with established profile
        if (profile.role === "TEACHER") {
          return NextResponse.redirect(`${origin}/teacher/dashboard`);
        } else if (profile.role === "STUDENT") {
          return NextResponse.redirect(`${origin}/student/dashboard`);
        }
      }
    } catch (err: any) {
      console.error("Unexpected callback exception:", err);
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(err?.message || "Terjadi kesalahan autentikasi")}`);
    }
  }

  // Fallback to next or login
  return NextResponse.redirect(`${origin}${next}`);
}
