import { NextResponse } from "next/server";
import { aiProviderManager } from "@/lib/ai/ai-provider-manager";
import { createStructuredError } from "@/lib/ai/error-contract";
import { extractTextFromPdfBuffer } from "@/lib/ai/pdf-extractor";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    let buffer: Buffer | null = null;
    let base64Data = "";
    let mimeType = "";
    let fileName = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json(
          {
            success: false,
            error: createStructuredError(
              "INPUT_INVALID",
              "Berkas tidak ditemukan dalam formulir unggah."
            ),
          },
          { status: 400 }
        );
      }
      fileName = file.name;
      mimeType = file.type;

      const arrayBuf = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuf);
      base64Data = buffer.toString("base64");
    } else {
      const body = await request.json();
      base64Data = body.base64Data;
      mimeType = body.mimeType || "image/jpeg";
      fileName = body.fileName || "document";
      if (base64Data) {
        buffer = Buffer.from(base64Data, "base64");
      }
    }

    if (!base64Data || !buffer || buffer.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: createStructuredError("INPUT_INVALID", "Data berkas kosong atau tidak terbaca."),
        },
        { status: 400 }
      );
    }

    // MIME detection based on file extension and magic bytes
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
      mimeType = lowerName.endsWith(".pdf") ? "application/pdf" : "image/jpeg";
    }

    const isPdf = mimeType === "application/pdf";

    // =========================================================================
    // 1. PDF EXTRACTION PIPELINE (Level 1: Native Text, Level 2: Scanned OCR)
    // =========================================================================
    if (isPdf) {
      let extractedPdfText = "";
      let pageCount = 1;

      // Level 1: Try native text extraction for text-based PDFs
      try {
        const parsed = await extractTextFromPdfBuffer(buffer);
        if (parsed && !parsed.isScanned && parsed.text.trim().length > 20) {
          extractedPdfText = parsed.text.trim();
          pageCount = parsed.numPages || 1;
        }
      } catch (pdfErr) {
        console.warn("[PDF Native Parser]", pdfErr);
      }

      // If native text extraction succeeded with substantial text
      if (extractedPdfText.length > 20) {
        return NextResponse.json({
          success: true,
          extractedText: extractedPdfText,
          sourceType: "pdf",
          extractionMode: "native_text",
          pageCount,
        });
      }

      // Level 2: Scanned/Image-based PDF fallback via Gemini Vision Multimodal Document OCR
      const ocrPrompt = `Anda adalah asisten OCR dan pembaca dokumen edukasi Sekolah Dasar Kurikulum Merdeka (DEPASKAN).
Tugas Anda adalah membaca dan mengekstrak SELURUH isi naskah teks dari dokumen PDF yang dipindai (scanned document) ini secara utuh dan lengkap.

PANDUAN EKSTRAKSI:
1. Ekstrak teks secara verbatim (kata per kata) sesuai dengan naskah asli di setiap halaman.
2. JIKA BERISI BUTIR SOAL:
   - Ekstrak seluruh nomor butir soal (misal Soal 1, 2, 3, dst.).
   - Pertahankan seluruh teks pertanyaan, stimulus narasi, data/tabel, dan angka-angka hitungan tanpa mengubah angka sedikit pun.
   - Ekstrak seluruh pilihan jawaban (A, B, C, D) jika ada, serta kunci jawaban jika tertulis.
3. JIKA BERISI TEKS MATERI AJAR:
   - Ekstrak judul materi, capaian pembelajaran, dan seluruh alur paragraf bacaan secara runtut.
4. JANGAN membuat kesimpulan atau memotong isi teks. Jangan menambahkan kata pengantar atau penutup. Kembalikan langsung naskah teks yang berhasil dibaca.`;

      const aiRes = await aiProviderManager.execute({
        featureKey: "question_scan",
        prompt: ocrPrompt,
        imagePart: {
          base64Data,
          mimeType: "application/pdf",
        },
        requiredCapabilities: ["text_generation", "image_understanding"],
      });

      if (aiRes.success && aiRes.rawText && aiRes.rawText.trim().length > 15) {
        return NextResponse.json({
          success: true,
          extractedText: aiRes.rawText.trim(),
          sourceType: "pdf",
          extractionMode: "multimodal_ocr",
          modelUsed: aiRes.modelUsed,
        });
      }

      // If both native extraction and OCR failed, return structured error
      return NextResponse.json(
        {
          success: false,
          error: createStructuredError(
            "PDF_EXTRACTION_FAILED",
            "PDF berhasil diunggah, tetapi teks belum berhasil dibaca. Pastikan dokumen PDF memuat teks yang jelas atau unggah foto halaman.",
            aiRes.error
          ),
        },
        { status: 422 }
      );
    }

    // =========================================================================
    // 2. IMAGE / PHOTO / CAMERA OCR PIPELINE
    // =========================================================================
    const imageOcrPrompt = `Anda adalah asisten OCR pembaca citra visual naskah edukasi Sekolah Dasar (DEPASKAN).
Tugas Anda: Membaca dan mengekstrak naskah teks dari foto dokumen atau lembar kerja fisik ini secara akurat dan lengkap.

PANDUAN:
1. Bacalah seluruh teks yang terlihat pada gambar secara verbatim (apa adanya).
2. Jika memuat nomor soal (1, 2, 3, dst.), pertahankan penomoran dan urutan soal.
3. Untuk pilihan ganda, pertahankan opsi A, B, C, D dan seluruh angka matematika asli tanpa mengubah nilai hitungan sama sekali.
4. Kembalikan langsung naskah teks yang berhasil dibaca tanpa basa-basi atau markdown code block.`;

    const aiRes = await aiProviderManager.execute({
      featureKey: "question_scan",
      prompt: imageOcrPrompt,
      imagePart: {
        base64Data,
        mimeType,
      },
      requiredCapabilities: ["text_generation", "image_understanding"],
    });

    if (aiRes.success && aiRes.rawText && aiRes.rawText.trim().length > 10) {
      return NextResponse.json({
        success: true,
        extractedText: aiRes.rawText.trim(),
        sourceType: "image",
        modelUsed: aiRes.modelUsed,
      });
    }

    // OCR Failed: Return structured error with clear troubleshooting
    return NextResponse.json(
      {
        success: false,
        error: createStructuredError(
          "OCR_FAILED",
          "Teks pada gambar belum berhasil dibaca. Coba gunakan gambar yang lebih jelas, periksa pencahayaan, atau pastikan orientasi foto tegak.",
          aiRes.error
        ),
      },
      { status: 422 }
    );
  } catch (err: any) {
    console.error("[API AI Extract Error]", err);
    return NextResponse.json(
      {
        success: false,
        error: createStructuredError(
          "UNKNOWN_ERROR",
          "Terjadi kesalahan saat memproses berkas: " + (err.message || String(err))
        ),
      },
      { status: 500 }
    );
  }
}
