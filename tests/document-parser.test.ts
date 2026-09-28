import test from "node:test";
import assert from "node:assert/strict";
import {
  isSectionHeaderOrMetadata,
  cleanDocumentPreambleAndHeaders,
  extractMeaningfulTitle,
  parseRawQuestionsToDraft,
} from "../lib/context-engine/document-parser";

test("Document & Exam Parser (Anti-Title/Header Pollution)", async (t) => {
  await t.test("should identify section headers, exam titles, and metadata accurately", () => {
    assert.strictEqual(isSectionHeaderOrMetadata("A. Pilihan Ganda"), true);
    assert.strictEqual(isSectionHeaderOrMetadata("B. Soal Uraian"), true);
    assert.strictEqual(isSectionHeaderOrMetadata("I. PILIHAN GANDA"), true);
    assert.strictEqual(isSectionHeaderOrMetadata("Bagian A: Pilihan Ganda"), true);
    assert.strictEqual(isSectionHeaderOrMetadata("PENILAIAN AKHIR SEMESTER (PAS) GANJIL"), true);
    assert.strictEqual(isSectionHeaderOrMetadata("ASESMEN SUMATIF LINGKUP MATERI"), true);
    assert.strictEqual(isSectionHeaderOrMetadata("Mata Pelajaran: Ilmu Pengetahuan Alam (IPA)"), true);
    assert.strictEqual(isSectionHeaderOrMetadata("Kelas / Semester: V (Lima) / 1"), true);
    assert.strictEqual(isSectionHeaderOrMetadata("Nama Siswa: ............................."), true);
    assert.strictEqual(isSectionHeaderOrMetadata("Waktu: 90 Menit"), true);
    assert.strictEqual(isSectionHeaderOrMetadata("Petunjuk Umum: Pilihlah salah satu jawaban yang benar!"), true);
    assert.strictEqual(isSectionHeaderOrMetadata("Berilah tanda silang (X) pada huruf A, B, C, atau D!"), true);

    // Legitimate questions must NOT be identified as headers
    assert.strictEqual(isSectionHeaderOrMetadata("1. Pak Budi membeli beras seberat 25 kg di pasar."), false);
    assert.strictEqual(isSectionHeaderOrMetadata("Berapakah sisa uang kembalian yang diterima Siti?"), false);
    assert.strictEqual(isSectionHeaderOrMetadata("Mengapa tanaman memerlukan fotosintesis untuk bertumbuh?"), false);
  });

  await t.test("should parse questions cleanly when preceded by 'A. Pilihan Ganda' (Screenshot Bug Fix)", () => {
    const rawExamInput = `
A. Pilihan Ganda
1. Sebuah toko kelontong di Pasar Besar memiliki persediaan 40 kg beras. Hari ini terjual 15 kg beras. Berapa sisa beras toko tersebut?
A. 20 kg
B. 25 kg
C. 30 kg
D. 35 kg
Kunci Jawaban: B
Pembahasan: 40 kg - 15 kg = 25 kg.

2. Bu Siti membeli 3 ikat bayam seharga Rp9.000. Berapa harga 1 ikat bayam?
A. Rp2.500
B. Rp3.000
C. Rp3.500
D. Rp4.000
Kunci: B

B. Soal Uraian
3. Jelaskan cara menjaga kelestarian sumber daya air di lingkungan sekitarmu!
Rubrik: Skor 4 jika lengkap memuat 3 cara pelestarian.
`;

    const parsed = parseRawQuestionsToDraft(rawExamInput, "Aritmetika dan Lingkungan");

    // Must be exactly 3 questions (NOT 4 or 5)
    assert.strictEqual(parsed.length, 3);

    // Question 1 must be the actual question, NOT "A. Pilihan Ganda"!
    assert.ok(!parsed[0].question_text.includes("Pilihan Ganda"));
    assert.ok(parsed[0].question_text.includes("Sebuah toko kelontong di Pasar Besar memiliki persediaan 40 kg beras"));
    assert.strictEqual(parsed[0].type, "multiple_choice");
    assert.strictEqual(parsed[0].options.length, 4);
    assert.ok(parsed[0].options[1].text.includes("25 kg"));
    assert.strictEqual(parsed[0].correct_answer, "B");
    assert.ok(parsed[0].explanation.includes("25 kg"));

    // Question 2
    assert.ok(parsed[1].question_text.includes("Bu Siti membeli 3 ikat bayam"));
    assert.strictEqual(parsed[1].type, "multiple_choice");
    assert.strictEqual(parsed[1].correct_answer, "B");

    // Question 3 must be the essay question, NOT "B. Soal Uraian"!
    assert.ok(!parsed[2].question_text.includes("Soal Uraian"));
    assert.ok(parsed[2].question_text.includes("Jelaskan cara menjaga kelestarian"));
    assert.strictEqual(parsed[2].type, "essay");
    assert.ok(parsed[2].rubric?.includes("Skor 4"));
  });

  await t.test("should extract meaningful title ignoring exam headers", () => {
    const docWithExamHeader = `
PENILAIAN AKHIR SEMESTER KELAS 5
Mata Pelajaran: IPA
Tema: Ekosistem dan Rantai Makanan Sawah
A. Pilihan Ganda
1. Contoh produsen pada ekosistem sawah adalah padi.
`;

    const title = extractMeaningfulTitle(docWithExamHeader);
    assert.ok(!title.includes("PENILAIAN"));
    assert.ok(!title.includes("Mata Pelajaran"));
    assert.ok(!title.includes("Pilihan Ganda"));
    assert.strictEqual(title, "Ekosistem dan Rantai Makanan Sawah");
  });

  await t.test("should clean document preamble completely", () => {
    const raw = `
PEMERINTAH KABUPATEN MADIUN
DINAS PENDIDIKAN
ASESMEN SUMATIF SEMESTER 1
Mata Pelajaran: Matematika
Kelas: 5

1. Pak Tani memanen 100 kg jagung.
`;
    const cleaned = cleanDocumentPreambleAndHeaders(raw);
    assert.ok(!cleaned.includes("PEMERINTAH"));
    assert.ok(!cleaned.includes("DINAS PENDIDIKAN"));
    assert.ok(!cleaned.includes("ASESMEN"));
    assert.ok(cleaned.includes("Pak Tani memanen 100 kg jagung."));
  });

  await t.test("should never return 'A. Pilihan Ganda' as question text even on single header paste", () => {
    const singleHeaderOnly = "A. Pilihan Ganda";
    const result = parseRawQuestionsToDraft(singleHeaderOnly, "Pecahan");
    assert.strictEqual(result.length, 1);
    assert.notStrictEqual(result[0].question_text, "A. Pilihan Ganda");
    assert.ok(result[0].question_text.includes("Pecahan"));
  });
});
