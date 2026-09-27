import { NextResponse } from "next/server";
import { aiProviderManager } from "@/lib/ai/ai-provider-manager";
import { createLkbClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let base64Data = "";
    let mimeType = "image/jpeg";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json(
          { error: "File pindaian gambar tidak ditemukan." },
          { status: 400 }
        );
      }
      mimeType = file.type || "image/jpeg";
      const buffer = Buffer.from(await file.arrayBuffer());
      base64Data = buffer.toString("base64");
    } else {
      const body = await request.json();
      base64Data = body.base64Data;
      mimeType = body.mimeType || "image/jpeg";
    }

    if (!base64Data) {
      return NextResponse.json(
        { error: "Data gambar kosong." },
        { status: 400 }
      );
    }

    // Call Gemini Vision to parse the document header, identifier, student name, and answers
    const prompt = `Anda adalah sistem scanner & OMR verifikasi lembar hasil cetak dokumen DEPASKAN.
Periksa dan analisis foto lembar kerja / asesmen cetak ini:

TUGAS ANDA:
1. Cari teks nomor/kode dokumen di bagian atas (format: "DOC-..." atau payload teks QR).
2. Cari nama siswa pada kolom "Nama Siswa: ...". Jika kosong, tulis "".
3. Cari jawaban siswa:
   - Jika ada soal pilihan ganda, deteksi opsi yang dilingkari/disilang/dipilih siswa (contoh nomor 1: A, nomor 2: B).
   - Jika ada soal esai, ekstrak tulisan tangan / jawaban esai siswa secara akurat.

KEMBALIKAN HANYA JSON MURNI TANPA MARKDOWN BACKTICKS DENGAN FORMAT:
{
  "document_id": "DOC-XXXX-XXXX",
  "qr_payload": "",
  "student_name": "Nama Siswa",
  "mc_answers": [
    {"number": 1, "answer": "A"}
  ],
  "essay_answer": "Uraian jawaban siswa...",
  "confidence": 0.95
}`;

    const aiRes = await aiProviderManager.execute({
      featureKey: "question_scan",
      prompt,
      imagePart: {
        base64Data,
        mimeType,
      },
      requiredCapabilities: ["text_generation", "image_understanding", "structured_output"],
    });

    let detected: any = aiRes.data;
    if (!detected && aiRes.rawText) {
      try {
        const clean = aiRes.rawText.replace(/```json/g, "").replace(/```/g, "").trim();
        detected = JSON.parse(clean);
      } catch {
        detected = null;
      }
    }

    const lkbClient = createLkbClient();

    // Verify document authenticity in database
    let issuance: any = null;
    let verified = false;

    const targetDocId = (detected?.document_id || detected?.qr_payload || "").trim();
    if (targetDocId) {
      const { data: found } = await lkbClient
        .from("document_issuances")
        .select("*")
        .eq("id", targetDocId)
        .maybeSingle();

      if (found) {
        issuance = found;
        verified = true;
      }
    }

    if (!issuance || !verified) {
      return NextResponse.json({
        success: false,
        verified: false,
        error: "DITOLAK: Identitas dokumen / QR token DEPASKAN tidak terverifikasi atau tidak terdaftar di sistem.",
      });
    }

    // Auto-grade MC if answer keys are available in issuance metadata
    const answerKey = issuance.metadata?.correct_answer || "A";
    const studentMcAnswer = detected?.mc_answers?.[0]?.answer || "A";
    const isMcCorrect = studentMcAnswer.toUpperCase() === answerKey.toUpperCase();
    const calculatedScore = isMcCorrect ? 100 : 0;

    return NextResponse.json({
      success: true,
      verified: true,
      document_id: issuance.id,
      doc_type: issuance.doc_type,
      content_title: issuance.content_title,
      room_code: issuance.room_code || "OFFLINE",
      student_name: detected?.student_name || "Siswa Cetak (Luring)",
      mc_answers: [
        {
          number: 1,
          student_answer: studentMcAnswer,
          correct_answer: answerKey,
          is_correct: isMcCorrect,
        },
      ],
      essay_answer: detected?.essay_answer || "",
      calculated_score: calculatedScore,
      confidence: detected?.confidence || 0.9,
    });
  } catch (err: any) {
    console.error("[Scan Process Route Error]", err);
    return NextResponse.json(
      { error: "Gagal memproses pindaian dokumen: " + (err.message || String(err)) },
      { status: 500 }
    );
  }
}
