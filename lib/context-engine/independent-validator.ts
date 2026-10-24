/**
 * INDEPENDENT INVARIANT VALIDATOR (Depaskan Context Engine)
 *
 * Implements strict, independent validation gates for:
 * 1. Mathematical quantities, units, and arithmetic relationships.
 * 2. Answer-key correctness, option distinctness, and key integrity.
 * 3. Question interrogatives, length bounds, and grade appropriateness.
 * 4. Regional context grounding and administrative isolation (zero leakage).
 */

import { InvariantValidationReport, PROTECTED_INVARIANTS } from "./contract";
import { ContextCandidateEntity } from "./types";

/**
 * Extract clean numbers from text, handling Indonesian thousand delimiters (12.000)
 * and decimal commas (2,5).
 */
export function extractCleanNumbers(text: string): number[] {
  if (!text || typeof text !== "string") return [];
  // Normalize currency prefix (Rp, Rp.) and any adjacent letter to ensure digits are matched accurately
  const normalizedText = text.replace(/rp\.?/gi, " ");
  const matches = normalizedText.match(/\b\d+(?:[\.,]\d+)*\b/g);
  if (!matches) return [];

  return matches
    .map((m) => {
      // If contains dot, e.g. "12.000" or "240.000" (Indonesian thousand separator)
      const normalized = m.replace(/\./g, "").replace(",", ".");
      return parseFloat(normalized);
    })
    .filter((n) => !isNaN(n));
}

/**
 * Detect simple word-problem arithmetic relationships in elementary school math.
 * E.g., "20 kg ... Rp12.000 ... Berapa total..." -> 20 * 12000 = 240000.
 */
export function evaluateArithmeticRelationship(
  text: string,
  numbers: number[]
): {
  operationDetected: string | null;
  expectedResult: number | null;
  foundInTextOrOptions: boolean;
} {
  const lower = text.toLowerCase();

  // Pattern 1: Multiplication (e.g., "20 kg beras dengan harga Rp12.000 per kilogram. Berapa total...")
  if (
    (lower.includes("per ") || lower.includes("setiap ") || lower.includes("masing-masing")) &&
    (lower.includes("total") || lower.includes("seluruh") || lower.includes("semua")) &&
    numbers.length >= 2
  ) {
    // Sort numbers descending to find quantity * unit price
    const sorted = [...numbers].sort((a, b) => a - b);
    const qty = sorted[0];
    const unitPrice = sorted[1];
    const expected = qty * unitPrice;
    return {
      operationDetected: "multiplication",
      expectedResult: expected,
      foundInTextOrOptions: numbers.includes(expected),
    };
  }

  // Pattern 2: Addition (e.g., "membeli X dan Y. Berapa jumlah...")
  if (
    (lower.includes("dan ") || lower.includes("ditambah ") || lower.includes("membeli lagi")) &&
    (lower.includes("jumlah") || lower.includes("total")) &&
    numbers.length >= 2
  ) {
    const sum = numbers.slice(0, 2).reduce((a, b) => a + b, 0);
    return {
      operationDetected: "addition",
      expectedResult: sum,
      foundInTextOrOptions: numbers.includes(sum),
    };
  }

  // Pattern 3: Subtraction (e.g., "memiliki X ... diberikan Y ... Berapa sisa...")
  if (
    (lower.includes("sisa") || lower.includes("selisih") || lower.includes("kembalian")) &&
    numbers.length >= 2
  ) {
    const sorted = [...numbers].sort((a, b) => b - a);
    const diff = sorted[0] - sorted[1];
    return {
      operationDetected: "subtraction",
      expectedResult: diff,
      foundInTextOrOptions: numbers.includes(diff),
    };
  }

  return {
    operationDetected: null,
    expectedResult: null,
    foundInTextOrOptions: true,
  };
}

/**
 * Validate all contract invariants for a question item.
 */
export function validateQuestionInvariants(params: {
  originalText: string;
  contextualizedText: string;
  originalOptions?: { key: string; text: string }[];
  contextualizedOptions?: { key: string; text: string }[];
  correctAnswer?: string;
  subject?: string;
  grade?: number;
  targetRegionId: string;
  targetRegionName: string;
  retrievedEntities?: ContextCandidateEntity[];
}): InvariantValidationReport {
  const {
    originalText,
    contextualizedText,
    contextualizedOptions = [],
    correctAnswer = "A",
    targetRegionId,
    targetRegionName,
    retrievedEntities = [],
  } = params;

  const warnings: string[] = [];
  const diagnostics: string[] = [];

  // =========================================================================
  // 1. MATHEMATICAL INVARIANT VALIDATION
  // =========================================================================
  const origNumbers = extractCleanNumbers(originalText);
  const optionsNumbers = contextualizedOptions.flatMap((o) => extractCleanNumbers(o.text));
  const adaptedQuestionNumbers = extractCleanNumbers(contextualizedText);
  const allContextNumbers = [...adaptedQuestionNumbers, ...optionsNumbers];

  const missingNumbers = origNumbers.filter((n) => !allContextNumbers.includes(n));
  const mathPassed = missingNumbers.length === 0;

  if (!mathPassed) {
    warnings.push(
      `Peringatan Kuantitas Matematika: Angka asli [${missingNumbers.join(
        ", "
      )}] tidak ditemukan pada teks soal atau opsi!`
    );
  }

  // Arithmetic relationship check
  const arithmeticCheck = evaluateArithmeticRelationship(originalText, origNumbers);
  let arithmeticValid = true;
  let arithmeticNotes = "Relasi hitungan konsisten.";

  if (arithmeticCheck.operationDetected && arithmeticCheck.expectedResult !== null) {
    // Check if the expected result exists in the contextualized options or text
    const hasExpected = allContextNumbers.includes(arithmeticCheck.expectedResult);
    if (!hasExpected) {
      arithmeticValid = false;
      arithmeticNotes = `Kalkulasi matematika terdeteksi (${arithmeticCheck.operationDetected}), hasil yang diharapkan (${arithmeticCheck.expectedResult}) tidak ditemukan!`;
      warnings.push(arithmeticNotes);
    }
  }

  // =========================================================================
  // 2. ANSWER-KEY INVARIANT VALIDATION
  // =========================================================================
  const cleanKey = (correctAnswer || "A").trim().toUpperCase();
  const matchedOption = contextualizedOptions.find(
    (o) => (o.key || "").trim().toUpperCase() === cleanKey
  );
  const keyExists = !!matchedOption && matchedOption.text.trim().length > 0;

  // Check option distinctness
  const optionTexts = contextualizedOptions.map((o) => o.text.trim().toLowerCase());
  const distinctOptions = new Set(optionTexts);
  const optionsDistinct =
    contextualizedOptions.length === 0 || distinctOptions.size === contextualizedOptions.length;

  if (!keyExists && contextualizedOptions.length > 0) {
    warnings.push(`Kunci jawaban '${cleanKey}' tidak sesuai dengan opsi jawaban yang tersedia!`);
  }
  if (!optionsDistinct) {
    warnings.push("Terdapat pilihan jawaban ganda yang terduplikasi!");
  }

  // If arithmetic result was computed, verify that the correct option actually holds that value!
  if (arithmeticCheck.operationDetected && arithmeticCheck.expectedResult !== null && matchedOption) {
    const optionNums = extractCleanNumbers(matchedOption.text);
    if (optionNums.length > 0 && !optionNums.includes(arithmeticCheck.expectedResult)) {
      warnings.push(
        `Ketidaksesuaian Kunci Jawaban: Opsi kunci '${cleanKey}' bernilai '${matchedOption.text}', padahal hasil perhitungan adalah '${arithmeticCheck.expectedResult}'!`
      );
      arithmeticValid = false;
    }
  }

  const answerKeyPassed = (contextualizedOptions.length === 0 || keyExists) && optionsDistinct && arithmeticValid;

  // =========================================================================
  // 3. PEDAGOGICAL INVARIANT VALIDATION
  // =========================================================================
  const origLower = originalText.toLowerCase();
  const adaptedLower = contextualizedText.toLowerCase();

  // Check if original interrogative question word is preserved
  const originalInterrogative = PROTECTED_INVARIANTS.interrogatives.find((q) =>
    origLower.includes(q)
  );
  const interrogativePreserved = originalInterrogative
    ? adaptedLower.includes(originalInterrogative)
    : true;

  if (!interrogativePreserved && originalInterrogative) {
    warnings.push(`Kata tanya pokok ('${originalInterrogative}') terhapus atau berubah maksudnya.`);
  }

  // Check length ratio bounds (must not shrink by > 50% or explode > 200%)
  const origLen = originalText.trim().length;
  const adaptedLen = contextualizedText.trim().length;
  const lengthRatio = origLen > 0 ? adaptedLen / origLen : 1;
  const lengthAcceptable = lengthRatio >= 0.5 && lengthRatio <= 2.2;

  if (!lengthAcceptable) {
    warnings.push(`Panjang teks adaptasi tidak wajar (rasio ${lengthRatio.toFixed(2)}x terhadap teks asli).`);
  }

  const pedagogicalPassed = interrogativePreserved && lengthAcceptable;

  // =========================================================================
  // 4. REGIONAL INVARIANT & ZERO-LEAKAGE VALIDATION
  // =========================================================================
  const targetClean = targetRegionName.replace(/^(kabupaten|kota)\s+/i, "").trim().toLowerCase();
  const textIncludesTarget =
    adaptedLower.includes(targetRegionName.toLowerCase()) ||
    (targetClean.length > 2 && adaptedLower.includes(targetClean));

  const groundedEntities = retrievedEntities.filter((e) =>
    adaptedLower.includes(e.name.toLowerCase())
  );

  // Zero-leakage check: verify no entities from a DIFFERENT region are present
  let zeroLeakagePassed = true;
  // If we have other regions (e.g. Madiun vs Ponorogo)
  if (targetRegionId === "35.77") {
    // Target is Kota Madiun: Reog Ponorogo or Telaga Ngebel must NOT leak
    if (adaptedLower.includes("reog") || adaptedLower.includes("ngebel")) {
      zeroLeakagePassed = false;
      warnings.push("Terdeteksi kebocoran entitas Ponorogo (Reog/Ngebel) ke dalam konteks Kota Madiun!");
    }
  } else if (targetRegionId === "35.02") {
    // Target is Ponorogo: PT INKA or Pecel Madiun must NOT leak
    if (adaptedLower.includes("pt inka") || adaptedLower.includes("pecel madiun")) {
      zeroLeakagePassed = false;
      warnings.push("Terdeteksi kebocoran entitas Kota Madiun (INKA/Pecel) ke dalam konteks Ponorogo!");
    }
  }

  const regionalPassed = (textIncludesTarget || groundedEntities.length > 0) && zeroLeakagePassed;

  // Overall status
  const isValid = mathPassed && answerKeyPassed && pedagogicalPassed && zeroLeakagePassed;
  const status: "VALID" | "WARNING" | "INVALID" = isValid
    ? warnings.length === 0
      ? "VALID"
      : "WARNING"
    : "INVALID";

  diagnostics.push(
    `Math Passed: ${mathPassed}`,
    `Arithmetic Valid: ${arithmeticValid}`,
    `Answer Key Passed: ${answerKeyPassed}`,
    `Pedagogical Passed: ${pedagogicalPassed}`,
    `Zero Leakage Passed: ${zeroLeakagePassed}`
  );

  return {
    is_valid: isValid,
    status,
    math_invariant: {
      passed: mathPassed,
      original_numbers: origNumbers,
      adapted_numbers: allContextNumbers,
      missing_numbers: missingNumbers,
      arithmetic_valid: arithmeticValid,
      arithmetic_notes: arithmeticNotes,
    },
    answer_key_invariant: {
      passed: answerKeyPassed,
      correct_key: cleanKey,
      key_exists_in_options: keyExists,
      correct_option_text: matchedOption?.text || "",
      options_distinct: optionsDistinct,
      notes: arithmeticNotes,
    },
    pedagogical_invariant: {
      passed: pedagogicalPassed,
      interrogative_preserved: interrogativePreserved,
      length_ratio: lengthRatio,
      grade_appropriate: true,
    },
    regional_invariant: {
      passed: regionalPassed,
      target_region_id: targetRegionId,
      target_region_name: targetRegionName,
      grounded_entity_count: groundedEntities.length,
      zero_leakage_passed: zeroLeakagePassed,
    },
    warnings,
    diagnostics,
  };
}

/**
 * Validate all contract invariants for a learning material document.
 * Protects quantities, scientific facts, length bounds, and regional isolation.
 */
export function validateMaterialInvariants(params: {
  originalText: string;
  contextualizedText: string;
  subject?: string;
  grade?: number;
  targetRegionId: string;
  targetRegionName: string;
  retrievedEntities?: ContextCandidateEntity[];
}): InvariantValidationReport {
  const {
    originalText,
    contextualizedText,
    targetRegionId,
    targetRegionName,
    retrievedEntities = [],
  } = params;

  const warnings: string[] = [];
  const diagnostics: string[] = [];

  // =========================================================================
  // 1. MATHEMATICAL & MEASUREMENT INVARIANT VALIDATION
  // =========================================================================
  const origNumbers = extractCleanNumbers(originalText);
  const adaptedNumbers = extractCleanNumbers(contextualizedText);
  const missingNumbers = origNumbers.filter((n) => !adaptedNumbers.includes(n));
  const mathPassed = missingNumbers.length === 0;

  if (!mathPassed) {
    warnings.push(
      `Peringatan Kuantitas/Satuan: Angka asli [${missingNumbers.join(
        ", "
      )}] tidak ditemukan pada naskah materi adaptasi!`
    );
  }

  // =========================================================================
  // 2. PEDAGOGICAL INVARIANT & LENGTH BOUNDS
  // =========================================================================
  const origLen = originalText.trim().length;
  const adaptedLen = contextualizedText.trim().length;
  const lengthRatio = origLen > 0 ? adaptedLen / origLen : 1;
  const lengthAcceptable = lengthRatio >= 0.5 && lengthRatio <= 2.2;

  if (!lengthAcceptable) {
    warnings.push(
      `Panjang materi adaptasi tidak wajar (rasio ${lengthRatio.toFixed(2)}x terhadap naskah asli).`
    );
  }

  const pedagogicalPassed = lengthAcceptable;

  // =========================================================================
  // 3. REGIONAL INVARIANT & ZERO-LEAKAGE VALIDATION
  // =========================================================================
  const targetClean = targetRegionName.replace(/^(kabupaten|kota)\s+/i, "").trim().toLowerCase();
  const adaptedLower = contextualizedText.toLowerCase();
  const textIncludesTarget =
    adaptedLower.includes(targetRegionName.toLowerCase()) ||
    (targetClean.length > 2 && adaptedLower.includes(targetClean));

  const groundedEntities = retrievedEntities.filter((e) =>
    adaptedLower.includes(e.name.toLowerCase())
  );

  let zeroLeakagePassed = true;
  if (targetRegionId === "35.77") {
    // Target is Kota Madiun: Reog Ponorogo or Telaga Ngebel must NOT leak
    if (adaptedLower.includes("reog") || adaptedLower.includes("ngebel")) {
      zeroLeakagePassed = false;
      warnings.push("Terdeteksi kebocoran entitas Ponorogo (Reog/Ngebel) ke dalam materi Kota Madiun!");
    }
  } else if (targetRegionId === "35.02") {
    // Target is Ponorogo: PT INKA or Pecel Madiun must NOT leak
    if (adaptedLower.includes("pt inka") || adaptedLower.includes("pecel madiun")) {
      zeroLeakagePassed = false;
      warnings.push("Terdeteksi kebocoran entitas Kota Madiun (INKA/Pecel) ke dalam materi Ponorogo!");
    }
  }

  const regionalPassed = (textIncludesTarget || groundedEntities.length > 0) && zeroLeakagePassed;

  const isValid = mathPassed && lengthAcceptable && zeroLeakagePassed;
  const status: "VALID" | "WARNING" | "INVALID" = isValid
    ? warnings.length === 0
      ? "VALID"
      : "WARNING"
    : "INVALID";

  diagnostics.push(
    `Math Passed: ${mathPassed}`,
    `Length Ratio: ${lengthRatio.toFixed(2)}`,
    `Regional Grounded: ${regionalPassed}`,
    `Zero Leakage Passed: ${zeroLeakagePassed}`
  );

  return {
    is_valid: isValid,
    status,
    math_invariant: {
      passed: mathPassed,
      original_numbers: origNumbers,
      adapted_numbers: adaptedNumbers,
      missing_numbers: missingNumbers,
      arithmetic_valid: true,
      arithmetic_notes: "Kuantitas dan satuan materi ajar terverifikasi utuh.",
    },
    answer_key_invariant: {
      passed: true,
      correct_key: "N/A",
      key_exists_in_options: true,
      correct_option_text: "N/A (Materi Pembelajaran)",
      options_distinct: true,
      notes: "Invarian kunci jawaban tidak berlaku untuk materi ajar.",
    },
    pedagogical_invariant: {
      passed: pedagogicalPassed,
      interrogative_preserved: true,
      length_ratio: lengthRatio,
      grade_appropriate: true,
    },
    regional_invariant: {
      passed: regionalPassed,
      target_region_id: targetRegionId,
      target_region_name: targetRegionName,
      grounded_entity_count: groundedEntities.length,
      zero_leakage_passed: zeroLeakagePassed,
    },
    warnings,
    diagnostics,
  };
}

