import { NextRequest, NextResponse } from "next/server";
import { repository } from "@/lib/db/repository";

export async function GET() {
  try {
    const schools = repository.getSchools();
    const regions = repository.getRegions();
    return NextResponse.json({
      success: true,
      schools,
      regions,
    });
  } catch (error) {
    console.error("API error fetching school info:", error);
    return NextResponse.json(
      { error: "Gagal memuat profil sekolah." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = repository.updateSchool(body);
    return NextResponse.json({
      success: true,
      school: updated,
    });
  } catch (error) {
    console.error("API error updating school profile:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan perubahan sekolah." },
      { status: 500 }
    );
  }
}
