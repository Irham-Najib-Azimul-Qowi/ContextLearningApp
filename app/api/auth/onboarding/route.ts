import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { repository } from "@/lib/db/repository";

const VALID_TEACHER_PASSCODE = "GURU-PAHAMI-2026";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { role, fullName, schoolId, teacherPasscode, classCode } = body;

    if (!role || !fullName) {
      return NextResponse.json(
        { error: "Nama lengkap dan peran wajib diisi." },
        { status: 400 }
      );
    }

    let supabaseUser: { id: string; email: string } | null = null;
    let supabase = null;

    try {
      supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        supabaseUser = { id: user.id, email: user.email || "" };
      }
    } catch {
      // Supabase server client unavailable or session not found in mock/local mode
    }

    const userId = supabaseUser ? supabaseUser.id : `usr-${Date.now()}`;
    const email = supabaseUser ? supabaseUser.email : `${role.toLowerCase()}.${Date.now()}@pahami.local`;

    if (role === "TEACHER") {
      // Validate teacher verification code
      if (!teacherPasscode || teacherPasscode.trim() !== VALID_TEACHER_PASSCODE) {
        return NextResponse.json(
          { error: "Kode verifikasi guru tidak valid. Hubungi pengelola sekolah atau gunakan 'GURU-PAHAMI-2026'." },
          { status: 403 }
        );
      }

      if (!schoolId) {
        return NextResponse.json(
          { error: "Sekolah penugasan guru wajib dipilih." },
          { status: 400 }
        );
      }

      // If Supabase is connected, write to user_profiles table
      if (supabase && supabaseUser) {
        const { error: dbError } = await supabase.from("user_profiles").upsert({
          id: userId,
          email,
          full_name: fullName.trim(),
          role: "TEACHER",
          school_id: schoolId,
          is_verified: true,
          updated_at: new Date().toISOString(),
        });

        if (dbError) {
          console.error("Supabase teacher profile upsert error:", dbError);
        }
      }

      // Also persist in local repository state for client-side navigation
      repository.setCurrentRole("TEACHER");
      repository.setActiveSchoolId(schoolId);

      return NextResponse.json({
        success: true,
        redirectUrl: "/teacher/dashboard",
        message: "Profil guru berhasil diverifikasi dan didaftarkan.",
      });
    } else if (role === "STUDENT") {
      if (!classCode) {
        return NextResponse.json(
          { error: "Kode kelas wajib diisi untuk siswa." },
          { status: 400 }
        );
      }

      // Verify class code
      let matchedSchoolId: string | null = null;
      let matchedClassId: string | null = null;

      if (supabase && supabaseUser) {
        const { data: classroom } = await supabase
          .from("classrooms")
          .select("id, school_id, code")
          .eq("code", classCode.trim().toUpperCase())
          .single();

        if (classroom) {
          matchedClassId = classroom.id;
          matchedSchoolId = classroom.school_id;
        }
      }

      // Fallback check against repository classes
      if (!matchedClassId) {
        const repoClasses = repository.getClasses();
        const found = repoClasses.find(
          (c) => c.code.trim().toUpperCase() === classCode.trim().toUpperCase()
        );
        if (found) {
          matchedClassId = found.id;
          matchedSchoolId = found.school_id;
        }
      }

      if (!matchedClassId || !matchedSchoolId) {
        return NextResponse.json(
          { error: `Kode kelas '${classCode}' tidak ditemukan. Tanyakan kode kelas yang benar kepada guru Anda.` },
          { status: 404 }
        );
      }

      // Save student profile
      if (supabase && supabaseUser) {
        await supabase.from("user_profiles").upsert({
          id: userId,
          email,
          full_name: fullName.trim(),
          role: "STUDENT",
          school_id: matchedSchoolId,
          is_verified: true,
          updated_at: new Date().toISOString(),
        });

        // Insert class membership
        await supabase.from("class_memberships").upsert({
          class_id: matchedClassId,
          student_id: userId,
          joined_at: new Date().toISOString(),
        });
      }

      // Sync local repository
      repository.setCurrentRole("STUDENT");
      repository.setActiveSchoolId(matchedSchoolId);
      repository.joinClassByCode(userId, fullName.trim(), classCode.trim().toUpperCase());

      return NextResponse.json({
        success: true,
        redirectUrl: "/student/dashboard",
        message: "Berhasil bergabung ke kelas!",
      });
    }

    return NextResponse.json({ error: "Peran tidak valid." }, { status: 400 });
  } catch (err: any) {
    console.error("Onboarding error:", err);
    return NextResponse.json(
      { error: err?.message || "Terjadi kesalahan saat memproses data onboarding." },
      { status: 500 }
    );
  }
}
