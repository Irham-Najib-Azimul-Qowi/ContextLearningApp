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
        const meta = user.user_metadata || {};

        // 1. Check user_synced_data table in Supabase (highest reliability across devices)
        const { data: synced } = await supabase
          .from("user_synced_data")
          .select("onboarding_completed, profile")
          .or(`user_id.eq.${user.id},user_email.eq.${user.email}`)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (synced?.onboarding_completed) {
          return NextResponse.redirect(`${origin}/teacher/dashboard`);
        }

        // 2. Check if user already completed onboarding across any device via user_metadata
        if (meta.onboarding_completed || meta.profile_completed || meta.teacher_profile) {
          if (meta.role === "STUDENT") {
            return NextResponse.redirect(`${origin}/student/dashboard`);
          }
          return NextResponse.redirect(`${origin}/teacher/dashboard`);
        }

        // 3. Query user profile table in Supabase
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("id, role, school_id, is_verified")
          .eq("id", user.id)
          .maybeSingle();

        if (profile) {
          if (profile.role === "TEACHER") {
            return NextResponse.redirect(`${origin}/teacher/dashboard`);
          } else if (profile.role === "STUDENT") {
            return NextResponse.redirect(`${origin}/student/dashboard`);
          }
        }

        // New user -> direct to onboarding
        return NextResponse.redirect(`${origin}/auth/onboarding`);
      }
    } catch (err: any) {
      console.error("Unexpected callback exception:", err);
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(err?.message || "Terjadi kesalahan autentikasi")}`);
    }
  }

  // Fallback to next or login
  return NextResponse.redirect(`${origin}${next}`);
}
