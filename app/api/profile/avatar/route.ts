import { NextResponse } from "next/server";
import { createClient, createLkbClient } from "@/lib/supabase/server";

async function authenticateRequest(request: Request): Promise<any | null> {
  const authHeader = request.headers.get("Authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : null;

  const lkbClient = createLkbClient();

  if (bearerToken) {
    const { data, error } = await lkbClient.auth.getUser(bearerToken);
    if (!error && data?.user) {
      return data.user;
    }
  }

  try {
    const serverSupabase = await createClient();
    const { data, error } = await serverSupabase.auth.getUser();
    if (!error && data?.user) {
      return data.user;
    }
  } catch {
    // Cookies unavailable
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "File gambar tidak ditemukan." },
        { status: 400 }
      );
    }

    // MIME type check
    const allowedMime = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedMime.includes(file.type)) {
      return NextResponse.json(
        { error: "Format file tidak didukung. Harap unggah file JPG, PNG, atau WebP." },
        { status: 400 }
      );
    }

    // Size limit check (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Ukuran file terlalu besar. Maksimal ukuran foto adalah 5 MB." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const fileName = `avatar-${user.id}-${Date.now()}.${ext}`;

    const lkbClient = createLkbClient();

    // Upload to Supabase storage 'avatars'
    const { error: uploadError } = await lkbClient.storage
      .from("avatars")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("[Avatar Upload Error]", uploadError);
      return NextResponse.json(
        { error: "Gagal mengunggah foto ke storage: " + uploadError.message },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = lkbClient.storage
      .from("avatars")
      .getPublicUrl(fileName);

    const avatarUrl = urlData.publicUrl;

    // Update user_profiles table
    await lkbClient
      .from("user_profiles")
      .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    // Update user_synced_data table if row exists
    const { data: syncRow } = await lkbClient
      .from("user_synced_data")
      .select("profile")
      .eq("user_id", user.id)
      .maybeSingle();

    if (syncRow) {
      const updatedProfile = { ...(syncRow.profile || {}), avatar_url: avatarUrl };
      await lkbClient
        .from("user_synced_data")
        .update({ profile: updatedProfile, updated_at: new Date().toISOString() })
        .eq("user_id", user.id);
    }

    return NextResponse.json({
      success: true,
      avatar_url: avatarUrl,
    });
  } catch (err: any) {
    console.error("[Avatar Route Error]", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal: " + (err.message || String(err)) },
      { status: 500 }
    );
  }
}
