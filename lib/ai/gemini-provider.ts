import { aiProviderManager } from "./ai-provider-manager";

export interface GenerateQuestionParams {
  subject: "Matematika" | "Bahasa Indonesia" | "IPS";
  grade: number; // 1-6 SD
  topic: string;
  type: "multiple_choice" | "essay";
  localContextRegion?: string; // e.g. "Ponorogo"
}

export interface GeneratedQuestionResult {
  question_text: string;
  type: "multiple_choice" | "essay";
  options?: { key: string; text: string }[];
  correct_answer: string;
  explanation: string;
  topic: string;
  subject: "Matematika" | "Bahasa Indonesia" | "IPS";
  grade: number;
}

export class GeminiProvider {
  async generateQuestion(params: GenerateQuestionParams): Promise<GeneratedQuestionResult> {
    const prompt = `Anda adalah pakar kurikulum Sekolah Dasar (SD) di Indonesia.
Buat 1 butir soal ${params.type === "multiple_choice" ? "Pilihan Ganda (4 pilihan A-D)" : "Uraian / Esai"} bermutu tinggi untuk jenjang SD Kelas ${params.grade}, mata pelajaran ${params.subject}, dengan topik "${params.topic}".
${params.localContextRegion ? `Gunakan konteks karakteristik wilayah ${params.localContextRegion} (Karesidenan Madiun & Jawa Tengah) secara natural dan mendidik.` : ""}

KEMBALIKAN HANYA OBJEK JSON MURNI TANPA MARKDOWN BACKTICKS DENGAN FORMAT BERIKUT:
{
  "question_text": "Teks soal lengkap",
  "type": "${params.type}",
  "options": [
    {"key": "A", "text": "Pilihan A"},
    {"key": "B", "text": "Pilihan B"},
    {"key": "C", "text": "Pilihan C"},
    {"key": "D", "text": "Pilihan D"}
  ],
  "correct_answer": "B",
  "explanation": "Penjelasan langkah penyelesaian yang jelas untuk siswa SD"
}`;

    try {
      const result = await aiProviderManager.execute({
        featureKey: "question_generation",
        prompt,
        requiredCapabilities: ["text_generation", "structured_output"],
      });

      if (result.success && result.data && result.data.question_text) {
        return {
          question_text: result.data.question_text,
          type: params.type,
          options: params.type === "multiple_choice" ? result.data.options : undefined,
          correct_answer: result.data.correct_answer || (params.type === "multiple_choice" ? "A" : ""),
          explanation: result.data.explanation || "Pembahasan terperinci.",
          topic: params.topic,
          subject: params.subject,
          grade: params.grade,
        };
      }
      throw new Error(result.error || "Gagal menghasilkan butir soal dari AI Gemini.");
    } catch (err: any) {
      console.error("[GeminiProvider generateQuestion Error]", err);
      throw new Error("AI belum dapat memproses butir soal: " + (err.message || String(err)));
    }
  }

  async scanQuestionImage(base64Data: string, mimeType: string): Promise<GeneratedQuestionResult> {
    const prompt = `Analisis foto naskah soal sekolah dasar ini. Ekstrak pertanyaan, opsi pilihan ganda (jika ada), kunci jawaban estimasi, dan topik materi dalam format JSON:
{
  "question_text": "Teks pertanyaan hasil pembacaan gambar",
  "type": "multiple_choice",
  "options": [
    {"key": "A", "text": "Opsi A"},
    {"key": "B", "text": "Opsi B"},
    {"key": "C", "text": "Opsi C"},
    {"key": "D", "text": "Opsi D"}
  ],
  "correct_answer": "B",
  "explanation": "Pembahasan soal"
}`;

    try {
      const result = await aiProviderManager.execute({
        featureKey: "question_scan",
        prompt,
        imagePart: {
          base64Data,
          mimeType,
        },
        requiredCapabilities: ["text_generation", "image_understanding", "structured_output"],
      });

      if (result.success && result.data && result.data.question_text) {
        return {
          question_text: result.data.question_text,
          type: "multiple_choice",
          options: result.data.options || [
            { key: "A", text: "Pilihan A" },
            { key: "B", text: "Pilihan B" },
            { key: "C", text: "Pilihan C" },
            { key: "D", text: "Pilihan D" },
          ],
          correct_answer: result.data.correct_answer || "B",
          explanation: result.data.explanation || "Hasil pembacaan visual OCR cerdas.",
          topic: "Hasil Pindai Foto Soal",
          subject: "Matematika",
          grade: 5,
        };
      }
      throw new Error(result.error || "Gagal mengekstrak soal dari citra foto.");
    } catch (err: any) {
      console.error("[GeminiProvider scanQuestionImage Error]", err);
      throw new Error("Sistem belum dapat membaca naskah foto soal: " + (err.message || String(err)));
    }
  }
}

export const geminiProvider = new GeminiProvider();
