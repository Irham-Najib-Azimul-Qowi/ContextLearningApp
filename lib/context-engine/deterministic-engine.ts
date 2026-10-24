/**
 * DETERMINISTIC CONTEXT ENGINE (Depaskan Context Engine)
 *
 * Implements the deterministic contextualization vertical slice:
 * 1. Retains original material unchanged.
 * 2. Identifies explicitly supported contextual slots.
 * 3. Applies verified LKB substitutions with strict contract boundaries.
 * 4. Records full transformation provenance (original, replacement, rule, reason).
 * 5. Computes structured text diffs for visual UI change highlighting.
 * 6. Validates invariants independently before acceptance.
 */

import {
  SUPPORTED_CONTEXT_SLOTS,
  AuditedTransformation,
  TextDiffChunk,
  InvariantValidationReport,
} from "./contract";
import {
  ContextCategory,
  ContextCandidateEntity,
  ContextMapping,
  NormalizedContent,
  QuestionDraftItem,
  MaterialContextualizedResult,
} from "./types";
import { defaultRetriever, LocalContextRetriever } from "./retrieval-adapter";
import { validateQuestionInvariants, validateMaterialInvariants } from "./independent-validator";

export interface DeterministicSlotMatch {
  id: string;
  category: ContextCategory;
  pattern: string;
  matchedText: string;
  index: number;
}

export interface DeterministicEngineResult {
  isViable: boolean;
  modelUsed: string;
  originalText: string;
  contextualizedText: string;
  transformations: AuditedTransformation[];
  diffChunks: TextDiffChunk[];
  validation: InvariantValidationReport;
  retrievedEntities: ContextCandidateEntity[];
  questionDraftItem?: QuestionDraftItem;
  materialResult?: MaterialContextualizedResult;
  fallbackReason?: string;
}

export class DeterministicContextEngine {
  private retriever: LocalContextRetriever;

  constructor(retriever: LocalContextRetriever = defaultRetriever) {
    this.retriever = retriever;
  }

  /**
   * Identify explicitly supported context slots in the text.
   * Prioritizes longer phrases (e.g. 'pasar tradisional' before 'pasar').
   */
  identifySlots(text: string): DeterministicSlotMatch[] {
    const matches: DeterministicSlotMatch[] = [];
    let slotCounter = 1;

    // Collect all supported categories and their patterns
    const candidatePatterns: { category: ContextCategory; pattern: string }[] = [];
    (Object.keys(SUPPORTED_CONTEXT_SLOTS) as ContextCategory[]).forEach((cat) => {
      SUPPORTED_CONTEXT_SLOTS[cat].patterns.forEach((pat) => {
        candidatePatterns.push({ category: cat, pattern: pat.toLowerCase() });
      });
    });

    // Sort descending by length so compound phrases are matched first
    candidatePatterns.sort((a, b) => b.pattern.length - a.pattern.length);

    // Track matched character spans to avoid overlapping matches
    const occupiedSpans: [number, number][] = [];

    candidatePatterns.forEach(({ category, pattern }) => {
      // Word boundary regex
      const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`\\b${escaped}\\b`, "gi");
      let match: RegExpExecArray | null;

      while ((match = regex.exec(text)) !== null) {
        const start = match.index;
        const end = start + match[0].length;

        // Check for span collision
        const overlaps = occupiedSpans.some(
          ([s, e]) => (start >= s && start < e) || (end > s && end <= e)
        );

        if (!overlaps) {
          occupiedSpans.push([start, end]);
          matches.push({
            id: `slot-${slotCounter++}`,
            category,
            pattern,
            matchedText: match[0],
            index: start,
          });
        }
      }
    });

    // Sort ascending by position in text
    return matches.sort((a, b) => a.index - b.index);
  }

  /**
   * Resolve verified LKB entities for the identified slots.
   */
  async resolveEntitiesForSlots(
    slots: DeterministicSlotMatch[],
    regionId: string
  ): Promise<{
    mappings: ContextMapping[];
    retrievedEntities: ContextCandidateEntity[];
    transformations: AuditedTransformation[];
  }> {
    const mappings: ContextMapping[] = [];
    const retrievedEntities: ContextCandidateEntity[] = [];
    const transformations: AuditedTransformation[] = [];

    for (const slot of slots) {
      const resp = await this.retriever.retrieve({
        region_id: regionId,
        category: slot.category,
        query: slot.matchedText,
        limit: 1,
      });

      if (resp.results.length > 0) {
        const matched = resp.results[0];
        retrievedEntities.push(matched);

        mappings.push({
          variable_id: slot.id,
          original_term: slot.matchedText,
          matched_entity: matched,
          educational_fit_score: 95,
          pedagogical_justification: `Substitusi '${slot.matchedText}' dengan entitas '${matched.name}' (${matched.region_name}) sesuai konteks lokal siswa.`,
        });

        transformations.push({
          slot_id: slot.id,
          category: slot.category,
          original_term: slot.matchedText,
          replacement_term: matched.name,
          start_index: slot.index,
          end_index: slot.index + slot.matchedText.length,
          reason: `Substitusi entitas lokal kategori ${slot.category} dengan '${matched.name}' dari LKB resmi.`,
          rule_applied: `LKB_DETERMINISTIC_SUBSTITUTION_${slot.category.toUpperCase()}`,
          status: "VERIFIED",
          confidence_score: 98,
        });
      } else {
        // Explicitly record unsupported / unmapped slot
        transformations.push({
          slot_id: slot.id,
          category: slot.category,
          original_term: slot.matchedText,
          replacement_term: slot.matchedText,
          start_index: slot.index,
          end_index: slot.index + slot.matchedText.length,
          reason: `Tidak ada entitas terverifikasi di LKB untuk wilayah '${regionId}' pada kategori '${slot.category}'. Istilah dipertahankan tanpa perubahan.`,
          rule_applied: "LKB_UNMAPPED_FALLBACK_RETAIN_ORIGINAL",
          status: "AMBIGUOUS_REJECTED",
          confidence_score: 100,
        });
      }
    }

    return { mappings, retrievedEntities, transformations };
  }

  /**
   * Apply deterministic substitutions to text with word boundaries and case handling.
   */
  applySubstitutions(text: string, mappings: ContextMapping[]): string {
    let result = text;
    mappings.forEach((m) => {
      const escaped = m.original_term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`\\b${escaped}\\b`, "gi");

      result = result.replace(regex, (match) => {
        const target = m.matched_entity.name;
        // If matched was all lowercase, use lowercase target
        if (match === match.toLowerCase()) {
          return target.toLowerCase();
        }
        // If matched was capitalized (e.g. "Beras"), capitalize first letter
        if (match[0] === match[0].toUpperCase()) {
          return target[0].toUpperCase() + target.slice(1);
        }
        return target;
      });
    });
    return result;
  }

  /**
   * Generate text diff chunks comparing original and adapted content for UI highlighting.
   */
  generateDiffChunks(
    originalText: string,
    transformations: AuditedTransformation[]
  ): TextDiffChunk[] {
    const verifiedTransformations = transformations.filter(
      (t) => t.status === "VERIFIED" && t.original_term !== t.replacement_term
    );

    if (verifiedTransformations.length === 0) {
      return [{ type: "unchanged", text: originalText }];
    }

    const chunks: TextDiffChunk[] = [];
    let lastIndex = 0;

    verifiedTransformations.forEach((t) => {
      const idx = originalText.toLowerCase().indexOf(t.original_term.toLowerCase(), lastIndex);
      if (idx !== -1) {
        if (idx > lastIndex) {
          chunks.push({
            type: "unchanged",
            text: originalText.slice(lastIndex, idx),
          });
        }
        chunks.push({
          type: "substituted",
          text: t.replacement_term.toLowerCase(),
          originalText: originalText.slice(idx, idx + t.original_term.length),
          category: t.category,
          reason: t.reason,
        });
        lastIndex = idx + t.original_term.length;
      }
    });

    if (lastIndex < originalText.length) {
      chunks.push({
        type: "unchanged",
        text: originalText.slice(lastIndex),
      });
    }

    return chunks;
  }

  /**
   * Execute deterministic contextualization for a question item.
   */
  async processQuestion(
    normalized: NormalizedContent
  ): Promise<DeterministicEngineResult> {
    const originalText = normalized.effectiveText.trim();
    if (!originalText) {
      return {
        isViable: false,
        modelUsed: "none",
        originalText: "",
        contextualizedText: "",
        transformations: [],
        diffChunks: [],
        validation: this.emptyValidationReport(normalized.regionId, normalized.regionName),
        retrievedEntities: [],
        fallbackReason: "Teks soal asli kosong.",
      };
    }

    // 1. Identify slots
    const slots = this.identifySlots(originalText);
    if (slots.length === 0) {
      // No supported slots found in original text -> fallback to LLM
      return {
        isViable: false,
        modelUsed: "deterministic-rule-engine-v1",
        originalText,
        contextualizedText: originalText,
        transformations: [],
        diffChunks: [{ type: "unchanged", text: originalText }],
        validation: this.emptyValidationReport(normalized.regionId, normalized.regionName),
        retrievedEntities: [],
        fallbackReason: "Tidak ditemukan slot konteks yang didukung dalam teks soal.",
      };
    }

    // 2. Resolve entities from LKB
    const { mappings, retrievedEntities, transformations } =
      await this.resolveEntitiesForSlots(slots, normalized.regionId);

    const verifiedCount = transformations.filter((t) => t.status === "VERIFIED").length;
    if (verifiedCount === 0) {
      return {
        isViable: false,
        modelUsed: "deterministic-rule-engine-v1",
        originalText,
        contextualizedText: originalText,
        transformations,
        diffChunks: [{ type: "unchanged", text: originalText }],
        validation: this.emptyValidationReport(normalized.regionId, normalized.regionName),
        retrievedEntities,
        fallbackReason: "Tidak ada entitas LKB yang dapat dipetakan untuk wilayah ini.",
      };
    }

    // 3. Apply substitutions to Question Text
    let contextualizedText = this.applySubstitutions(originalText, mappings);

    // Optionally append regional location clause if not already mentioned
    const regionClean = normalized.regionName.replace(/^(kabupaten|kota)\s+/i, "").trim().toLowerCase();
    if (
      !contextualizedText.toLowerCase().includes(normalized.regionName.toLowerCase()) &&
      !contextualizedText.toLowerCase().includes(regionClean)
    ) {
      if (/seorang pedagang/i.test(contextualizedText)) {
        contextualizedText = contextualizedText.replace(
          /seorang pedagang/i,
          `seorang pedagang di ${normalized.regionName}`
        );
      }
    }

    // 4. Apply substitutions to Options
    let updatedOptions = normalized.options;
    if (Array.isArray(normalized.options) && normalized.options.length > 0) {
      updatedOptions = normalized.options.map((opt) => ({
        key: opt.key,
        text: this.applySubstitutions(opt.text, mappings),
      }));
    } else {
      // Default 4 choices if none provided
      updatedOptions = [
        { key: "A", text: "Pilihan A" },
        { key: "B", text: "Pilihan B" },
        { key: "C", text: "Pilihan C" },
        { key: "D", text: "Pilihan D" },
      ];
    }

    // 5. Apply substitutions to Explanation
    const origExp = normalized.explanation || "";
    const updatedExplanation = origExp
      ? `${this.applySubstitutions(origExp, mappings)} (Disesuaikan secara deterministik untuk ${normalized.regionName}).`
      : `Soal disesuaikan dengan konteks kearifan lokal ${normalized.regionName} tanpa mengubah kuantitas angka dan kompetensi inti.`;

    // 6. Generate Diff Chunks
    const diffChunks = this.generateDiffChunks(originalText, transformations);

    // 7. Execute Independent Invariant Validation
    const validationReport = validateQuestionInvariants({
      originalText,
      contextualizedText,
      originalOptions: normalized.options,
      contextualizedOptions: updatedOptions,
      correctAnswer: normalized.correctAnswer || "A",
      subject: normalized.subject,
      grade: normalized.grade,
      targetRegionId: normalized.regionId,
      targetRegionName: normalized.regionName,
      retrievedEntities,
    });

    // Check if deterministic result passes validation
    const isViable = validationReport.is_valid && validationReport.status !== "INVALID";

    const questionDraftItem: QuestionDraftItem = {
      id: `q-item-det-${Date.now()}`,
      original_question_text: originalText,
      question_text: contextualizedText,
      type: normalized.questionType === "essay" ? "essay" : "multiple_choice",
      options: normalized.questionType === "essay" ? undefined : updatedOptions,
      correct_answer: (normalized.correctAnswer || "A").trim().toUpperCase(),
      explanation: updatedExplanation,
      rubric: normalized.questionType === "essay" ? "Kriteria penskoran esai lengkap." : "",
      points: 10,
      context_variables: transformations
        .filter((t) => t.status === "VERIFIED")
        .map((t) => ({
          original_term: t.original_term,
          replacement_term: t.replacement_term,
          category: t.category,
          reason: t.reason,
        })),
      diff_chunks: diffChunks,
      diffChunks: diffChunks,
      validation: {
        is_valid: validationReport.is_valid,
        status: validationReport.status,
        competency_preserved: validationReport.pedagogical_invariant.passed,
        answer_key_preserved: validationReport.answer_key_invariant.passed,
        math_numbers_strictly_preserved: validationReport.math_invariant.passed,
        local_context_grounded: validationReport.regional_invariant.passed,
        warnings: validationReport.warnings,
        pedagogical_notes: validationReport.is_valid
          ? "Validasi Deterministik Berhasil: Seluruh invarian matematika dan kompetensi kurikulum terjaga 100% presisi."
          : "Validasi Gagal: Terdapat ketidakcocokan invarian pada hasil adaptasi.",
      },
    };

    return {
      isViable,
      modelUsed: "deterministic-rule-engine-v1",
      originalText,
      contextualizedText,
      transformations,
      diffChunks,
      validation: validationReport,
      retrievedEntities,
      questionDraftItem,
      fallbackReason: isViable
        ? undefined
        : `Validasi invarian deterministik gagal: ${validationReport.warnings.join("; ")}`,
    };
  }

  /**
   * Execute deterministic contextualization for a learning material document.
   * Safe substitutions applied to paragraphs, headings, and narratives while strictly
   * preserving facts, quantities, formulas, and educational objectives.
   */
  async processMaterial(
    normalized: NormalizedContent
  ): Promise<DeterministicEngineResult> {
    const originalText = normalized.effectiveText.trim();
    if (!originalText) {
      return {
        isViable: false,
        modelUsed: "none",
        originalText: "",
        contextualizedText: "",
        transformations: [],
        diffChunks: [],
        validation: this.emptyValidationReport(normalized.regionId, normalized.regionName),
        retrievedEntities: [],
        fallbackReason: "Teks materi ajar asli kosong.",
      };
    }

    // 1. Identify explicitly supported context slots in the material text
    const slots = this.identifySlots(originalText);
    if (slots.length === 0) {
      return {
        isViable: false,
        modelUsed: "deterministic-rule-engine-v1",
        originalText,
        contextualizedText: originalText,
        transformations: [],
        diffChunks: [{ type: "unchanged", text: originalText }],
        validation: this.emptyValidationReport(normalized.regionId, normalized.regionName),
        retrievedEntities: [],
        fallbackReason: "Tidak ditemukan slot konteks yang didukung dalam teks materi.",
      };
    }

    // 2. Resolve verified entities from LKB
    const { mappings, retrievedEntities, transformations } =
      await this.resolveEntitiesForSlots(slots, normalized.regionId);

    const verifiedCount = transformations.filter((t) => t.status === "VERIFIED").length;
    if (verifiedCount === 0) {
      return {
        isViable: false,
        modelUsed: "deterministic-rule-engine-v1",
        originalText,
        contextualizedText: originalText,
        transformations,
        diffChunks: [{ type: "unchanged", text: originalText }],
        validation: this.emptyValidationReport(normalized.regionId, normalized.regionName),
        retrievedEntities,
        fallbackReason: "Tidak ada entitas LKB yang dapat dipetakan untuk wilayah ini.",
      };
    }

    // 3. Apply deterministic substitutions across the material paragraphs
    const contextualizedText = this.applySubstitutions(originalText, mappings);

    // Apply substitutions to title if title exists
    const contextualizedTitle = normalized.title
      ? this.applySubstitutions(normalized.title, mappings)
      : "Modul Pembelajaran Tematik";

    // 4. Generate structured text diff chunks for UI highlighting
    const diffChunks = this.generateDiffChunks(originalText, transformations);

    // 5. Execute Independent Invariant Validation for Materials
    const validationReport = validateMaterialInvariants({
      originalText,
      contextualizedText,
      subject: normalized.subject,
      grade: normalized.grade,
      targetRegionId: normalized.regionId,
      targetRegionName: normalized.regionName,
      retrievedEntities,
    });

    const isViable = validationReport.is_valid && validationReport.status !== "INVALID";

    const materialResult: MaterialContextualizedResult = {
      original_title: normalized.title || "Modul Pembelajaran",
      original_content: originalText,
      title: contextualizedTitle,
      content: contextualizedText,
      contextual_content: contextualizedText,
      summary: `Modul materi pembelajaran disesuaikan dengan konteks kearifan lokal ${normalized.regionName}.`,
      local_connection: `Integrasi entitas kearifan lokal (${retrievedEntities.map((e) => e.name).join(", ")}) ke dalam topik pembelajaran ${normalized.subject} di ${normalized.regionName}.`,
      context_variables: transformations
        .filter((t) => t.status === "VERIFIED")
        .map((t) => ({
          original_term: t.original_term,
          replacement_term: t.replacement_term,
          category: t.category,
          reason: t.reason,
        })),
      local_entities: retrievedEntities.map((e) => ({
        name: e.name,
        category: e.category,
        region_id: e.region_id,
        description: e.description,
      })),
      diff_chunks: diffChunks,
      diffChunks: diffChunks,
      validation: {
        is_valid: validationReport.is_valid,
        status: validationReport.status,
        competency_preserved: validationReport.pedagogical_invariant.passed,
        local_context_grounded: validationReport.regional_invariant.passed,
        math_numbers_strictly_preserved: validationReport.math_invariant.passed,
        warnings: validationReport.warnings,
        pedagogical_notes: validationReport.is_valid
          ? `Validasi Deterministik Berhasil: Seluruh kuantitas, fakta ilmiah, dan kompetensi materi terjaga 100% presisi untuk ${normalized.regionName}.`
          : `Validasi Invarian Gagal: ${validationReport.warnings.join("; ")}`,
      },
    };

    return {
      isViable,
      modelUsed: "deterministic-rule-engine-v1",
      originalText,
      contextualizedText,
      transformations,
      diffChunks,
      validation: validationReport,
      retrievedEntities,
      materialResult,
      fallbackReason: isViable
        ? undefined
        : `Validasi invarian materi gagal: ${validationReport.warnings.join("; ")}`,
    };
  }

  /**
   * Helper to construct empty validation report
   */
  private emptyValidationReport(regionId: string, regionName: string): InvariantValidationReport {
    return {
      is_valid: false,
      status: "INVALID",
      math_invariant: {
        passed: false,
        original_numbers: [],
        adapted_numbers: [],
        missing_numbers: [],
        arithmetic_valid: false,
      },
      answer_key_invariant: {
        passed: false,
        correct_key: "A",
        key_exists_in_options: false,
        correct_option_text: "",
        options_distinct: false,
      },
      pedagogical_invariant: {
        passed: false,
        interrogative_preserved: false,
        length_ratio: 0,
        grade_appropriate: false,
      },
      regional_invariant: {
        passed: false,
        target_region_id: regionId,
        target_region_name: regionName,
        grounded_entity_count: 0,
        zero_leakage_passed: true,
      },
      warnings: ["Pemrosesan deterministik tidak dapat dilanjutkan."],
      diagnostics: [],
    };
  }
}

export const deterministicEngine = new DeterministicContextEngine();
