/**
 * Unified AI Error Handling & Contract System (DEPASKAN)
 * Standardized error codes and user-friendly Indonesian messages.
 */

export const AIErrorCode = {
  INPUT_INVALID: "INPUT_INVALID",
  PDF_EXTRACTION_FAILED: "PDF_EXTRACTION_FAILED",
  OCR_FAILED: "OCR_FAILED",
  AI_RATE_LIMITED: "AI_RATE_LIMITED",
  AI_QUOTA_EXHAUSTED: "AI_QUOTA_EXHAUSTED",
  AI_MODEL_UNAVAILABLE: "AI_MODEL_UNAVAILABLE",
  AI_PROVIDER_UNAVAILABLE: "AI_PROVIDER_UNAVAILABLE",
  AI_TIMEOUT: "AI_TIMEOUT",
  AI_AUTH_FAILED: "AI_AUTH_FAILED",
  AI_INVALID_RESPONSE: "AI_INVALID_RESPONSE",
  RAG_FAILED: "RAG_FAILED",
  RAG_NO_CONTEXT: "RAG_NO_CONTEXT",
  VALIDATION_FAILED: "VALIDATION_FAILED",
  ALL_AI_CREDENTIALS_FAILED: "ALL_AI_CREDENTIALS_FAILED",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

export type AIErrorCode = (typeof AIErrorCode)[keyof typeof AIErrorCode];

export interface AIStructuredError {
  code: AIErrorCode;
  message: string;
  details?: string;
  retryable?: boolean;
}

export interface AIResponsePayload<T = any> {
  success: boolean;
  data?: T;
  error?: AIStructuredError;
  requestId?: string;
  modelUsed?: string;
}

export const ERROR_MESSAGES: Record<AIErrorCode, string> = {
  INPUT_INVALID: "Teks belum dapat diproses. Pastikan materi atau soal sudah diisi.",
  PDF_EXTRACTION_FAILED: "PDF berhasil diunggah, tetapi teks belum berhasil dibaca.",
  OCR_FAILED: "Teks pada gambar belum berhasil dibaca. Coba gunakan gambar yang lebih jelas.",
  AI_RATE_LIMITED: "Layanan AI sedang terlalu banyak menerima permintaan. Sistem sedang mencoba layanan cadangan.",
  AI_QUOTA_EXHAUSTED: "Kuota layanan AI sedang habis. Sistem sedang mencoba layanan cadangan.",
  AI_MODEL_UNAVAILABLE: "Model AI yang digunakan sedang tidak tersedia.",
  AI_PROVIDER_UNAVAILABLE: "Layanan AI sedang mengalami gangguan. Silakan coba lagi.",
  AI_AUTH_FAILED: "Otentikasi layanan AI gagal. Periksa konfigurasi API key.",
  AI_TIMEOUT: "Proses AI membutuhkan waktu terlalu lama. Silakan coba lagi.",
  AI_INVALID_RESPONSE: "AI menghasilkan respons yang tidak sesuai format. Tidak ada hasil yang disimpan.",
  RAG_FAILED: "Basis pengetahuan lokal tidak dapat diakses saat ini.",
  RAG_NO_CONTEXT: "Konteks lokal yang sesuai belum ditemukan.",
  VALIDATION_FAILED: "Hasil belum dapat digunakan karena pemeriksaan isi belum berhasil.",
  ALL_AI_CREDENTIALS_FAILED: "Semua layanan AI yang tersedia sedang tidak dapat digunakan. Silakan coba lagi beberapa saat.",
  UNKNOWN_ERROR: "Terjadi kesalahan yang tidak terduga. Silakan coba lagi.",
};

export function createStructuredError(
  code: AIErrorCode,
  customMessage?: string,
  details?: string
): AIStructuredError {
  return {
    code,
    message: customMessage || ERROR_MESSAGES[code] || ERROR_MESSAGES.UNKNOWN_ERROR,
    details,
    retryable: [
      "AI_RATE_LIMITED",
      "AI_QUOTA_EXHAUSTED",
      "AI_MODEL_UNAVAILABLE",
      "AI_PROVIDER_UNAVAILABLE",
      "AI_TIMEOUT",
      "ALL_AI_CREDENTIALS_FAILED",
      "OCR_FAILED",
      "PDF_EXTRACTION_FAILED",
    ].includes(code),
  };
}

export function generateRequestId(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `DEP-${dateStr}-${rand}`;
}

export function createErrorResponse(
  code: AIErrorCode,
  customMessage?: string,
  details?: string
): { success: false; error: AIStructuredError; requestId: string } {
  return {
    success: false,
    error: createStructuredError(code, customMessage, details),
    requestId: generateRequestId(),
  };
}
