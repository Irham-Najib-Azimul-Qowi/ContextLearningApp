import * as pdfModule from "pdf-parse";

export interface PdfExtractResult {
  text: string;
  numPages: number;
  info?: any;
  isScanned: boolean;
}

/**
 * Extracts raw text from a PDF Buffer using pdf-parse.
 * Supports both v1 (function) and v2 (PDFParse class) with scan detection.
 */
export async function extractTextFromPdfBuffer(buffer: Buffer): Promise<PdfExtractResult> {
  if (!buffer || buffer.length === 0) {
    throw new Error("Berkas PDF kosong (0 byte).");
  }

  try {
    let rawText = "";
    let numPages = 1;
    let info: any = undefined;

    const mod: any = pdfModule;
    if (typeof mod.PDFParse === "function") {
      const parser = new mod.PDFParse({ data: buffer });
      const textResult = await parser.getText();
      rawText = (textResult?.text || "").trim();
      numPages = textResult?.total || textResult?.pages?.length || 1;
      try {
        info = await parser.getInfo();
      } catch {
        // optional info
      }
    } else if (typeof mod === "function" || typeof mod.default === "function") {
      const fn = typeof mod === "function" ? mod : mod.default;
      const data = await fn(buffer);
      rawText = (data.text || "").trim();
      numPages = data.numpages || 1;
      info = data.info;
    } else {
      throw new Error("Modul PDF Parser tidak dapat diinisialisasi.");
    }

    const cleanSample = rawText.replace(/--\s*\d+\s*of\s*\d+\s*--/gi, "").trim();
    const isScanned = cleanSample.length < 50;

    return {
      text: rawText,
      numPages,
      info,
      isScanned,
    };
  } catch (err: any) {
    throw new Error(`Gagal membaca berkas PDF: ${err.message || String(err)}`);
  }
}
