import { NextResponse } from "next/server";
import { createLkbClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { raw_qr, document_id, document_token } = body;

    let targetDocId = document_id;
    let targetToken = document_token;

    // Parse raw_qr JSON if provided
    if (raw_qr) {
      try {
        const parsed = typeof raw_qr === "string" ? JSON.parse(raw_qr) : raw_qr;
        if (parsed.app !== "DEPASKAN") {
          return NextResponse.json({
            valid: false,
            reason: "DITOLAK: QR code bukan berasal dari ekosistem DEPASKAN.",
          });
        }
        targetDocId = parsed.id;
        targetToken = parsed.tok;
      } catch {
        return NextResponse.json({
          valid: false,
          reason: "DITOLAK: Format QR Code tidak valid atau telah dimodifikasi.",
        });
      }
    }

    if (!targetDocId || !targetToken) {
      return NextResponse.json({
        valid: false,
        reason: "DITOLAK: Informasi tanda tangan dokumen tidak lengkap.",
      });
    }

    const lkbClient = createLkbClient();

    const { data: issuance, error } = await lkbClient
      .from("document_issuances")
      .select("*")
      .eq("id", targetDocId)
      .eq("document_token", targetToken)
      .maybeSingle();

    if (error || !issuance) {
      return NextResponse.json({
        valid: false,
        reason: "DITOLAK: Tanda tangan dokumen tidak terdaftar di server DEPASKAN. Kemungkinan dokumen palsu atau modifikasi.",
      });
    }

    return NextResponse.json({
      valid: true,
      issuance,
    });
  } catch (err: any) {
    console.error("[Verify Route Error]", err);
    return NextResponse.json(
      { valid: false, reason: "Kesalahan verifikasi server: " + (err.message || String(err)) },
      { status: 500 }
    );
  }
}
