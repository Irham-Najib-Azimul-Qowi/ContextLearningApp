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

    // Robust MIME detection based on file extension and base64 magic bytes
    const lowerName = fileName.toLowerCase();
    if (lowerName.endsWith(".pdf") || base64Data.startsWith("JVBER")) {
      mimeType = "application/pdf";
    } else if (lowerName.endsWith(".png") || base64Data.startsWith("iVBORw0KGgo")) {
      mimeType = "image/png";
    } else if (lowerName.endsWith(".webp") || base64Data.startsWith("UklGR")) {
      mimeType = "image/webp";
    } else if (lowerName.endsWith(".gif") || base64Data.startsWith("R0lGOD")) {
      mimeType = "image/gif";
    } else if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg") || base64Data.startsWith("/9j/")) {
      mimeType = "image/jpeg";
    } else if (!mimeType || mimeType === "application/octet-stream") {
      mimeType = "image/jpeg";
    }

    // Call AI provider with image / document parsing capability
    const isPdf = mimeType === "application/pdf";
    const prompt = `Anda adalah asisten OCR dan pembaca dokumen edukasi Sekolah Dasar Kurikulum Merdeka (DEPASKAN).
Tugas Anda adalah membaca dan mengekstrak SELURUH isi teks dari ${isPdf ? "dokumen naskah PDF" : "foto / pindaian naskah"} "${fileName}" ini secara lengkap dan akurat.

PANDUAN EKSTRAKSI:
1. Ekstrak teks secara verbatim (kata per kata) sesuai dengan apa yang tertulis di dokumen/foto.
2. JIKA BERISI BUTIR SOAL:
   - Ekstrak seluruh nomor butir soal (misal Soal 1, 2, 3, dst.).
   - Pertahankan seluruh teks pertanyaan, stimulus narasi, tabel/data, dan angka-angka hitungan tanpa mengubah angka sedikit pun.
   - Ekstrak seluruh pilihan jawaban (A, B, C, D) jika ada, dan kunci jawaban / pembahasan jika tertera.
3. JIKA BERISI TEKS MATERI AJAR:
   - Ekstrak judul materi, subbab, dan seluruh paragraf bacaan secara runtut.
4. JANGAN membuat kesimpulan atau memotong isi teks. Jangan menambahkan kata pengantar atau penutup. Kembalikan langsung teks naskah yang berhasil diekstrak.`;

    const aiRes = await aiProviderManager.execute({
      featureKey: "question_scan",
      prompt,
      imagePart: {
        base64Data,
        mimeType,
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

    return NextResponse.json(
      {
        success: false,
        error: "AI Vision belum dapat membaca teks dari berkas " + fileName + ". Pastikan foto naskah jelas, tegak, dan terbaca dengan baik.",
      },
      { status: 422 }
    );
  } catch (err: any) {
    console.error("[API AI Extract Error]", err);
    return NextResponse.json(
      { success: false, error: "Gagal mengekstrak teks dari berkas: " + (err.message || String(err)) },
      { status: 500 }
    );
  }
}
