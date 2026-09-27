import { NextResponse } from "next/server";
import { createLkbClient } from "@/lib/supabase/server";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      doc_type = "room", // 'material' | 'question' | 'room'
      content_id,
      content_title,
      room_id,
      room_code,
      teacher_id,
      school_id,
      metadata = {},
    } = body;

    if (!content_id || !content_title) {
      return NextResponse.json(
        { error: "content_id dan content_title wajib disediakan." },
        { status: 400 }
      );
    }

    const docId = `DOC-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const randomHex = crypto.randomBytes(16).toString("hex");
    const docToken = `DEPASKAN_AUTH_${docId}_${randomHex}`;

    const lkbClient = createLkbClient();

    const { error: insertErr } = await lkbClient
      .from("document_issuances")
      .insert({
        id: docId,
        document_token: docToken,
        doc_type,
        content_id,
        content_title,
        content_version_id: "v1",
        room_id: room_id || null,
        room_code: room_code ? room_code.toLowerCase() : null,
        teacher_id: teacher_id || null,
        school_id: school_id || null,
        metadata,
      });

    if (insertErr) {
      console.error("[Document Issuance Insert Error]", insertErr);
      return NextResponse.json(
        { error: "Gagal mencatat penerbitan dokumen: " + insertErr.message },
        { status: 500 }
      );
    }

    const qrPayload = JSON.stringify({
      app: "DEPASKAN",
      id: docId,
      tok: docToken,
      type: doc_type,
      code: room_code || "",
    });

    return NextResponse.json({
      success: true,
      document_id: docId,
      document_token: docToken,
      qr_payload: qrPayload,
    });
  } catch (err: any) {
    console.error("[Issue Route Error]", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal: " + (err.message || String(err)) },
      { status: 500 }
    );
  }
}
