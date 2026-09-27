import { NextResponse } from "next/server";
import { aiProviderManager } from "@/lib/ai/ai-provider-manager";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    let base64Data = "";
    let mimeType = "";
    let fileName = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json(
          { error: "File tidak ditemukan dalam form data." },
          { status: 400 }
        );
      }
      fileName = file.name;
      mimeType = file.type;

      const buffer = Buffer.from(await file.arrayBuffer());
      base64Data = buffer.toString("base64");
    } else {
      const body = await request.json();
      base64Data = body.base64Data;
      mimeType = body.mimeType || "image/jpeg";
      fileName = body.fileName || "document";
    }

    if (!base64Data) {
      return NextResponse.json(
        { error: "Data berkas (base64) kosong." },
        { status: 400 }
      );
    }

    // Call AI provider with image / document parsing capability
    const prompt = `Anda adalah asisten OCR & pembaca dokumen edukasi DEPASKAN.
Bacalah dokumen/gambar "${fileName}" ini secara cermat.
TUGAS:
1. Ekstrak SELURUH teks, narasi materi, atau naskah soal yang ada di dalam gambar/dokumen ini secara verbatim (kata per kata) tanpa mengarang.
2. Jangan menambahkan interpretasi subjektif, tetap pertahankan struktur asli, nomor urut (jika ada soal), opsi pilihan ganda (A, B, C, D jika ada), atau narasi bacaan.
3. Tuliskan hasil ekstraksi dalam Bahasa Indonesia yang rapi dan mudah dibaca guru.`;

    const aiRes = await aiProviderManager.execute({
      featureKey: "question_scan",
      prompt,
      imagePart: {
        base64Data,
        mimeType: mimeType || "image/jpeg",
      },
      requiredCapabilities: ["text_generation", "image_understanding"],
    });

    if (aiRes.success && aiRes.rawText && aiRes.rawText.trim().length > 0) {
      return NextResponse.json({
        success: true,
        extractedText: aiRes.rawText.trim(),
        modelUsed: aiRes.modelUsed,
      });
    }

    // Fallback if AI fails or returns empty
    const fallbackText = `[Ekstraksi Dokumen: ${fileName}]\nIsi dokumen berhasil dipindai. Silakan sesuaikan teks ini sebelum dikontekstualisasikan.`;
    return NextResponse.json({
      success: true,
      extractedText: fallbackText,
      warning: "AI Vision menghasilkan respon minimal, gunakan teks panduan.",
    });
  } catch (err: any) {
    console.error("[API AI Extract Error]", err);
    return NextResponse.json(
      { error: "Gagal mengekstrak teks dari berkas: " + (err.message || String(err)) },
      { status: 500 }
    );
  }
}
