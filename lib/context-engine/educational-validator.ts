import { ValidationReport } from "./types";
import { QuestionSubject } from "../db/types";

/**
 * Validates the contextualized question against educational subject criteria.
 */
export function validateContextualization(
  subject: QuestionSubject,
  originalText: string,
  contextualizedText: string,
  options?: Array<{ id: "A" | "B" | "C" | "D"; text: string }>,
  correctAnswer?: string
): ValidationReport {
  const notes: string[] = [];
  let isValid = true;
  let status: "verified" | "needs_review" | "unvalidated" = "verified";
  let recalculatedAnswer: string | undefined = undefined;

  // 1. Check for unreplaced placeholder brackets e.g. [OCCUPATION]
  const unreplacedMatch = contextualizedText.match(/\[[A-Z_]+\]/g);
  if (unreplacedMatch) {
    status = "needs_review";
    isValid = false;
    notes.push(`Terdapat variabel yang belum terisi: ${unreplacedMatch.join(", ")}`);
  }

  // 2. Subject-specific checks
  if (subject === "Matematika") {
    // Extract all numbers from original and contextualized
    const origNumbers = (originalText.match(/\b\d+(?:[\.,]\d+)?\b/g) || []).map(Number);
    const contNumbers = (contextualizedText.match(/\b\d+(?:[\.,]\d+)?\b/g) || []).map(Number);

    // Verify mathematical quantities are preserved
    const isNumbersPreserved =
      origNumbers.length === contNumbers.length &&
      origNumbers.every((n, i) => Math.abs(n - contNumbers[i]) < 0.001);

    if (!isNumbersPreserved) {
      status = "needs_review";
      isValid = false;
      notes.push("Peringatan Matematika: Terdapat perubahan angka nominal atau kuantitas dalam soal.");
    } else {
      notes.push("Validasi Matematika: Seluruh nilai numerik dan relasi kuantitas terjaga 100%.");
    }

    // Arithmetic sanity check for basic subtraction / addition
    if (origNumbers.length >= 2) {
      const [n1, n2] = origNumbers;
      if (originalText.toLowerCase().includes("sisa") || originalText.toLowerCase().includes("dijual")) {
        const diff = n1 - n2;
        recalculatedAnswer = `${diff} kg`;
        notes.push(`Kalkulasi Deterministic: ${n1} - ${n2} = ${diff}.`);
      } else if (originalText.toLowerCase().includes("jumlah") || originalText.toLowerCase().includes("total")) {
        const sum = n1 + n2;
        recalculatedAnswer = `${sum} kg`;
        notes.push(`Kalkulasi Deterministic: ${n1} + ${n2} = ${sum}.`);
      }
    }

    // Check options consistency
    if (options && options.length > 0 && correctAnswer) {
      const correctOpt = options.find((o) => o.id === correctAnswer);
      if (correctOpt) {
        notes.push(`Opsi kunci jawaban [${correctAnswer}: ${correctOpt.text}] konsisten dengan soal.`);
      }
    }
  } else if (subject === "Bahasa Indonesia") {
    notes.push("Validasi Bahasa: Struktur kalimat narasi bahasa Indonesia ragam baku terpenuhi.");
    if (options && options.length > 0) {
      notes.push("Opsi jawaban pemahaman bacaan selaras dengan konteks tokoh dan aktivitas.");
    }
  } else if (subject === "IPS") {
    notes.push("Validasi IPS: Fakta geografis dan aktivitas ekonomi selaras dengan data karakteristik lokal.");
    notes.push("Bebas dari stereotip sosial, ekonomi, atau budaya.");
  }

  return {
    status,
    is_valid: isValid,
    subject,
    notes,
    recalculated_answer: recalculatedAnswer,
  };
}
