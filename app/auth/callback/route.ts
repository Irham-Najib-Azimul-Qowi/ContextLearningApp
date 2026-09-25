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
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("id, role, school_id, is_verified")
          .eq("id", user.id)
          .maybeSingle();

        const meta = user.user_metadata || {};
        const isTeacher = profile?.role === "TEACHER" || meta.role === "TEACHER";
        const isStudent = profile?.role === "STUDENT" || meta.role === "STUDENT";
        const isRegistered = !!profile || !!meta.onboarding_completed || isTeacher || isStudent;

        if (isRegistered) {
          // If profile table didn't have the user yet, ensure it is created
          if (!profile) {
            try {
              await supabase.from("user_profiles").upsert({
                id: user.id,
                email: user.email || "",
                full_name: meta.full_name || meta.name || user.email?.split("@")[0] || "Guru Depaskan",
                role: isStudent ? "STUDENT" : "TEACHER",
                school_id: null,
                is_verified: true,
                updated_at: new Date().toISOString(),
              });
            } catch (err) {
              console.warn("Silent fallback upserting profile in callback:", err);
            }
          }

          // Existing user with established profile -> directly to dashboard
          if (isStudent) {
            return NextResponse.redirect(`${origin}/student/dashboard`);
          }
          return NextResponse.redirect(`${origin}/teacher/dashboard`);
        }

        // Truly new user who hasn't completed onboarding yet
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
