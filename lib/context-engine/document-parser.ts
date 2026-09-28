/**
 * Document & Exam Text Parser (DEPASKAN Engine)
 * Sanitizes and extracts questions, materials, and metadata without misinterpreting
 * section headers (e.g. "A. Pilihan Ganda", "Bagian I") or exam titles as questions.
 */

export interface ParsedQuestionDraft {
  id: string;
  type: "multiple_choice" | "essay";
  original_question_text?: string;
  question_text: string;
  options: { key: string; text: string }[];
  correct_answer: string;
  explanation: string;
  rubric?: string;
  points?: number;
  context_variables?: any[];
  validation?: any;
}

/**
 * Checks whether a single line of text is an exam title, section header,
 * administrative metadata, or generic instruction rather than an actual question.
 */
export function isSectionHeaderOrMetadata(line: string): boolean {
  const trimmed = (line || "").trim();
  if (!trimmed) return true;

  // Normalize by stripping leading bullets, numbers, hyphens, and hashes
  const clean = trimmed
    .replace(/^[#\*\-\s]+/, "")
    .replace(/^(?:[A-Za-z0-9IVXLCDMivxlcdm]+[\.\:\)]|\bbagian\s+[a-z0-9ivx]+\s*[\:\-]?)\s*/i, "")
    .trim();

  // 1. Explicit Section Header: e.g. "Pilihan Ganda", "Soal Uraian", "Bagian A: Pilihan Ganda"
  if (
    /^(?:pilihan\s*ganda|pilgan|multiple\s*choice|soal\s*pilihan\s*ganda|soal\s*pilihan|soal\s*uraian|soal\s*esai|uraian|esai|essay|isian\s*singkat|menjodohkan|true\s*false|benar\s*salah)\b/i.test(
      clean
    )
  ) {
    return true;
  }

  // Also check original trimmed line for section header patterns with prefix
  if (
    /^(?:[A-Za-z0-9IVXLCDMivxlcdm]+[\.\:\)]|\bbagian\s+[a-z0-9ivx]+\s*[\:\-]?)\s*(?:pilihan\s*ganda|pilgan|multiple\s*choice|soal\s*pilihan|soal\s*uraian|soal\s*esai|uraian|esai|essay|isian\s*singkat|menjodohkan)\b/i.test(
      trimmed
    )
  ) {
    return true;
  }

  // 2. Exam Titles / Document Headers
  if (
    /^(?:penilaian\s*(?:harian|tengah\s*semester|akhir\s*semester|akhir\s*tahun|sumatif|formatif)|asesmen\s*(?:nasional|sumatif|formatif|madrasah|sekolah|tengah|akhir)|ujian\s*(?:sekolah|akhir|nasional|semester|madrasah)|ulangan\s*(?:harian|umum|semester|kenaikan)|lembar\s*(?:soal|kerja|asesmen|jawaban)|lks|lkpd|modul\s*ajar|kisi[\s\-]*kisi|kartu\s*soal|bank\s*soal)\b/i.test(
      trimmed
    ) ||
    /^(?:pts|pas|pat|asts|asas|sts|sas|us|un|try\s*out)\b/i.test(trimmed)
  ) {
    return true;
  }

  // 3. Institution / Administrative Headers
  if (
    /^(?:pemerintah\s*kabupaten|pemerintah\s*kota|dinas\s*pendidikan|kementerian\s*agama|kemenag|koordinator\s*wilayah|korwil|uptd|sd\s*negeri|sdn|sekolah\s*dasar|madrasah\s*ibtidaiyah|mis?\b)/i.test(
      trimmed
    )
  ) {
    return true;
  }

  // 4. Metadata fields: "Mata Pelajaran: ...", "Kelas: ...", "Nama: ...", "Waktu: ..."
  if (
    /^(?:mata\s*pelajaran|mapel|tema|sub\s*tema|kelas(?:\s*[\/\,]\s*semester)?|semester|tahun\s*ajaran|tahun\s*pelajaran|hari(?:\s*[\/\,]\s*tanggal)?|tanggal|waktu|alokasi\s*waktu|nama(?:\s*siswa|\s*peserta)?|no(?:\.|\s*)?(?:peserta|absen|induk)|nisn?|sekolah)\s*[\:\-]/i.test(
      trimmed
    )
  ) {
    return true;
  }

  // 5. Generic Instructions / Preambles
  if (
    /^(?:petunjuk\s*(?:umum|khusus|pengerjaan)?|instruksi)\s*[\:\-]?/i.test(trimmed) ||
    /^(?:pilihlah|berilah|jawablah|bacalah|kerjakan)\s+(?:salah\s+satu|tanda\s+silang|jawaban|pertanyaan|soal|teks\s+berikut|dengan\s+tepat)\b/i.test(
      trimmed
    )
  ) {
    return true;
  }

  return false;
}

/**
 * Cleans preamble, exam titles, section headers, and instructions from raw text.
 */
export function cleanDocumentPreambleAndHeaders(rawText: string): string {
  if (!rawText || !rawText.trim()) return "";
  const lines = rawText.split(/\r?\n/);
  const cleanLines = lines.filter((l) => !isSectionHeaderOrMetadata(l));
  return cleanLines.join("\n").trim();
}

/**
 * Extracts a meaningful topic or title from content, prioritizing explicit
 * Tema / Topik / Judul labels and ignoring exam administrative headers.
 */
export function extractMeaningfulTitle(
  rawText: string,
  fallback: string = "Materi Pembelajaran Kontekstual"
): string {
  if (!rawText || !rawText.trim()) return fallback;
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  // 1. First priority: look for explicit Tema / Topik / Judul lines
  for (const line of lines) {
    const topicMatch = line.match(
      /^(?:tema|sub\s*tema|topik|judul|materi(?:\s*pembelajaran)?)\s*[\:\-]\s*(.+)$/i
    );
    if (topicMatch) {
      const val = topicMatch[1].replace(/^[#\*\s]+/, "").trim();
      if (val.length >= 3) {
        return val.slice(0, 80);
      }
    }
  }

  // 2. Second priority: first clean line that is not an exam title or metadata
  for (const line of lines) {
    if (isSectionHeaderOrMetadata(line)) continue;
    // Skip if it looks like a question number or question start
    if (isQuestionStart(line)) continue;
    const clean = line.replace(/^[#\*\d\.\-\s]+/, "").trim();
    if (clean.length >= 3 && clean.length <= 100) {
      return clean;
    }
  }

  return fallback;
}


/**
 * Checks if a line is an option line:
 * e.g. "A. Jawaban A", "B) Jawaban B", "(C) Jawaban C"
 * BUT ensures "A. Pilihan Ganda" is NOT treated as an option line!
 */
export function isOptionLine(line: string): boolean {
  const trimmed = (line || "").trim();
  if (isSectionHeaderOrMetadata(trimmed)) return false;
  return /^(?:(?:\([A-Ea-e]\))|[A-Ea-e][\.\:\)])\s+/i.test(trimmed);
}

/**
 * Checks if a line marks the beginning of a numbered question:
 * e.g. "1. ", "1) ", "Soal 1:", "No. 1. ", "Pertanyaan 1:"
 * AND ensures it is not an option line or section header.
 */
export function isQuestionStart(line: string): boolean {
  const trimmed = (line || "").trim();
  if (!trimmed) return false;
  if (isSectionHeaderOrMetadata(trimmed)) return false;
  if (isOptionLine(trimmed)) return false;

  return (
    /^(?:(?:soal|nomor|no)\.?\s*)?\d+[\.\:\)]/i.test(trimmed) ||
    /^#+\s*(?:(?:soal|nomor|no)\.?\s*)?\d+/i.test(trimmed) ||
    /^(?:pertanyaan|butir\s*soal)\s*\d+/i.test(trimmed)
  );
}

/**
 * Robustly parses raw question text into structured QuestionDraftItem array.
 * Immune to section headers, exam titles, preambles, and option letter collisions.
 */
export function parseRawQuestionsToDraft(
  rawText: string,
  defaultTopic: string = ""
): ParsedQuestionDraft[] {
  const fallbackQuestion = (idx: number = 1): ParsedQuestionDraft => ({
    id: `q-draft-${Date.now()}-${idx}`,
    type: "multiple_choice",
    question_text: defaultTopic
      ? `Berdasarkan topik ${defaultTopic}, jawablah pertanyaan berikut:`
      : "",
    options: [
      { key: "A", text: "" },
      { key: "B", text: "" },
      { key: "C", text: "" },
      { key: "D", text: "" },
    ],
    correct_answer: "A",
    explanation: "",
    rubric: "",
  });

  if (!rawText || !rawText.trim()) {
    return [fallbackQuestion(1)];
  }

  const lines = rawText.split(/\r?\n/);
  const chunks: string[] = [];
  let currentChunk: string[] = [];
  let hasStartedNumberedQuestions = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Completely drop any line that is a section header, exam title, or metadata
    if (isSectionHeaderOrMetadata(line)) {
      continue;
    }

    if (isQuestionStart(line)) {
      if (hasStartedNumberedQuestions && currentChunk.length > 0) {
        chunks.push(currentChunk.join("\n").trim());
      }
      currentChunk = [line];
      hasStartedNumberedQuestions = true;
    } else {
      if (hasStartedNumberedQuestions) {
        currentChunk.push(line);
      } else {
        // Pre-question text before any question number
        // Only keep if it does NOT match section headers
        currentChunk.push(line);
      }
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join("\n").trim());
  }

  // Filter chunks: ignore chunks that are section headers or empty
  let candidateChunks = chunks.filter((c) => {
    const trimmed = c.trim();
    if (trimmed.length < 3) return false;
    if (isSectionHeaderOrMetadata(trimmed)) return false;
    return true;
  });

  // If no numbered chunks were detected, try splitting by double-newlines
  if (candidateChunks.length === 0) {
    const paragraphs = rawText
      .split(/\n\s*\n+/)
      .map((p) => p.trim())
      .filter((p) => p.length >= 5 && !isSectionHeaderOrMetadata(p));
    candidateChunks = paragraphs.length > 0 ? paragraphs : [];
  }

  if (candidateChunks.length === 0) {
    return [fallbackQuestion(1)];
  }

  const parsedItems: ParsedQuestionDraft[] = [];

  for (let idx = 0; idx < candidateChunks.length; idx++) {
    const chunk = candidateChunks[idx];
    const chunkLines = chunk
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !isSectionHeaderOrMetadata(l));

    const options: { key: string; text: string }[] = [];
    let correctAnswer = "A";
    let explanation = "";
    let rubric = "";
    let isEssay = false;

    const questionTextLines: string[] = [];
    for (const cl of chunkLines) {
      const optMatch = cl.match(/^(?:(?:\(([A-Ea-e])\))|([A-Ea-e])[\.\:\)])\s*(.*)$/);
      const ansMatch = cl.match(/^(?:kunci|jawaban|kunci jawaban|ans|answer)[\s:]+(.*)$/i);
      const expMatch = cl.match(/^(?:pembahasan|penjelasan|alasan)[\s:]+(.*)$/i);
      const rubMatch = cl.match(/^(?:rubrik|pedoman penskoran)[\s:]+(.*)$/i);

      if (ansMatch) {
        const rawAns = ansMatch[1].trim();
        const singleLetter = rawAns.match(/\b([A-Ea-e])\b/);
        if (singleLetter) {
          correctAnswer = singleLetter[1].toUpperCase();
        } else {
          correctAnswer = rawAns;
          isEssay = true;
        }
      } else if (expMatch) {
        explanation = expMatch[1].trim();
      } else if (rubMatch) {
        rubric = rubMatch[1].trim();
        isEssay = true;
      } else if (optMatch && !isSectionHeaderOrMetadata(cl)) {
        options.push({
          key: (optMatch[1] || optMatch[2]).toUpperCase(),
          text: optMatch[3].trim(),
        });
      } else {
        if (options.length === 0) {
          questionTextLines.push(cl);
        } else {
          if (options.length > 0) {
            options[options.length - 1].text += " " + cl;
          }
        }
      }
    }

    let questionText = questionTextLines
      .join("\n")
      .replace(/^(?:#+\s*)?(?:(?:soal|nomor|no)\.?\s*)?\d+[\.\:\)]\s*/i, "")
      .trim();

    if (!questionText && chunkLines.length > 0) {
      questionText = chunkLines[0]
        .replace(/^(?:#+\s*)?(?:(?:soal|nomor|no)\.?\s*)?\d+[\.\:\)]\s*/i, "")
        .trim();
    }

    // If the question text is a section header or too short, skip it
    if (!questionText || isSectionHeaderOrMetadata(questionText) || questionText.length < 3) {
      continue;
    }

    const type: "multiple_choice" | "essay" =
      options.length >= 2 && !isEssay ? "multiple_choice" : "essay";

    let finalExplanation = explanation.trim();
    if (!finalExplanation) {
      if (type === "multiple_choice") {
        const selectedOpt = options.find((o) => o.key === correctAnswer);
        finalExplanation = `Kunci jawaban yang tepat adalah ${correctAnswer}${selectedOpt?.text ? ` (${selectedOpt.text})` : ""}. Pembahasan: Berdasarkan konsep materi ${defaultTopic || "terkait"}, jawaban yang sesuai adalah opsi ${correctAnswer}.`;
      } else {
        finalExplanation = `Pembahasan esai: Siswa menguraikan penjelasan terkait konsep ${defaultTopic || "materi"} secara runtut, logis, dan mengaitkannya dengan fenomena atau contoh di lingkungan nyata.`;
      }
    }

    let finalRubric = rubric.trim();
    if (!finalRubric && type === "essay") {
      finalRubric =
        "Kriteria Penilaian Esai (Skor 0-4):\n- Skor 4: Jawaban sangat lengkap, analisis akurat, dan mencantumkan contoh kontekstual yang relevan di daerah setempat.\n- Skor 3: Jawaban tepat dan runtut, namun penjelasan pendukung kurang mendalam.\n- Skor 2: Jawaban benar sebagian atau hanya menyebutkan konsep inti tanpa penjelasan.\n- Skor 1: Jawaban kurang tepat, tetapi siswa telah berusaha menuliskan konsep terkait.\n- Skor 0: Tidak menjawab atau jawaban tidak relevan.";
    }

    parsedItems.push({
      id: `q-draft-${Date.now()}-${idx + 1}`,
      type,
      original_question_text: chunk,
      question_text: questionText,
      options:
        options.length >= 2
          ? options
          : [
              { key: "A", text: "" },
              { key: "B", text: "" },
              { key: "C", text: "" },
              { key: "D", text: "" },
            ],
      correct_answer: correctAnswer,
      explanation: finalExplanation,
      rubric: finalRubric,
    });
  }

  return parsedItems.length > 0 ? parsedItems : [fallbackQuestion(1)];
}
