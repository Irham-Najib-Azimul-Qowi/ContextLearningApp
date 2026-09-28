import test from "node:test";
import assert from "node:assert/strict";
import { repository } from "../lib/db/repository";
import { resolveRoomQuestions } from "../lib/db/types";

test("Examination & Assessment Scoring Engine Tests", async (t) => {
  await t.test("Multiple Choice deterministic auto-grading computes accurately", () => {
    // Start attempt for test exam
    const exam = repository.getExam("exam-pnr-01");
    assert.ok(exam, "Seeded exam exam-pnr-01 should exist");

    const attempt = repository.startAttempt(exam.id, "test-student-99", "Test Siswa");
    assert.strictEqual(attempt.status, "in_progress");

    // Answer questions: q-pnr-01 (key B), q-pnr-02 (key B)
    repository.saveAnswer(attempt.id, "q-pnr-01", "B"); // Correct
    repository.saveAnswer(attempt.id, "q-pnr-02", "B"); // Correct
    repository.saveAnswer(attempt.id, "q-pnr-03", "Tradisi Larung Sesaji di Telaga Ngebel Ponorogo.");

    // Submit attempt
    const submitted = repository.submitAttempt(attempt.id);
    assert.ok(submitted, "Submission should return updated attempt");
    assert.strictEqual(submitted?.status, "submitted", "Should be submitted pending essay review");
    assert.strictEqual(submitted?.mc_score, 60, "Both MC questions correct should yield 60 MC weight points");
  });

  await t.test("Teacher essay grading updates final composite score", () => {
    const attempt = repository.getStudentAttempt("exam-pnr-01", "test-student-99");
    assert.ok(attempt);

    // Teacher grades essay with 35 points out of 40
    const graded = repository.gradeEssay(attempt.id, 35, "Uraian sangat bagus dan sesuai.");
    assert.ok(graded);
    assert.strictEqual(graded.essay_score, 35);
    assert.strictEqual(graded.score, 60 + 35, "Total composite score should be 95");
    assert.strictEqual(graded.teacher_feedback, "Uraian sangat bagus dan sesuai.");
  });

  await t.test("Question Package supports multiple sub-questions with mixed MC and Essay items", () => {
    const qSeed = repository.getQuestions().find((q) => q.id === "q-pnr-04");
    assert.ok(qSeed, "q-pnr-04 seeded question package should exist");
    assert.strictEqual(qSeed.type, "mixed", "Package containing both MC and Essay should resolve to type 'mixed'");
    assert.ok(qSeed.items && qSeed.items.length === 3, "Package should contain 3 sub-questions");

    const mcItems = qSeed.items.filter((it) => it.type === "multiple_choice");
    const essayItems = qSeed.items.filter((it) => it.type === "essay");
    assert.strictEqual(mcItems.length, 2, "Should have 2 MC sub-questions");
    assert.strictEqual(essayItems.length, 1, "Should have 1 Essay sub-question");

    // Test saving new multi-item package
    const saved = repository.saveQuestion({
      school_id: "sch-ponorogo-01",
      teacher_id: "usr-teacher-01",
      subject: "Matematika",
      grade: 4,
      topic: "Paket Bangun Datar dan Estimasi Kearifan Reyog",
      type: "mixed",
      items: [
        {
          id: "item-test-1",
          type: "multiple_choice",
          question_text: "Berapa keliling caplokan dadak merak berdiameter 70 cm?",
          options: [
            { key: "A", text: "180 cm" },
            { key: "B", text: "220 cm" },
            { key: "C", text: "240 cm" },
            { key: "D", text: "260 cm" },
          ],
          correct_answer: "B",
          explanation: "Keliling lingkaran = pi * d = 22/7 * 70 = 220 cm.",
        },
        {
          id: "item-test-2",
          type: "essay",
          question_text: "Jelaskan langkah menghitung luas permukaan dadak merak reog!",
          rubric: "Menyebutkan rumus luas dan substitusi ukuran secara runtut.",
        },
      ],
      is_contextualized: true,
      created_at: new Date().toISOString(),
    });

    assert.ok(saved.id, "Saved question package should have an ID");
    assert.strictEqual(saved.type, "mixed", "Type should automatically infer 'mixed'");
    assert.strictEqual(saved.items?.length, 2, "Items length should be preserved");
    assert.strictEqual(saved.question_text, "Berapa keliling caplokan dadak merak berdiameter 70 cm?", "Fallback question text should match first item");
  });

  await t.test("Room Multi-Question & Content Resolution: resolves all 5 questions and their items completely", () => {
    // Create 5 distinct questions in repository
    const createdIds: string[] = [];
    for (let i = 1; i <= 5; i++) {
      const q = repository.saveQuestion({
        id: `sol-test-room-${i}`,
        school_id: "sch-ponorogo-01",
        teacher_id: "usr-teacher-01",
        subject: "Matematika",
        grade: 5,
        topic: `Topik Soal #${i}`,
        type: i % 2 === 0 ? "essay" : "multiple_choice",
        question_text: `Pertanyaan butir nomor ${i} tentang pasar Ponorogo`,
        options: i % 2 === 0 ? [] : [
          { key: "A", text: "Opsi A" },
          { key: "B", text: "Opsi B" },
          { key: "C", text: "Opsi C" },
          { key: "D", text: "Opsi D" },
        ],
        correct_answer: "B",
        explanation: `Pembahasan soal nomor ${i}`,
      });
      createdIds.push(q.id);
    }

    assert.strictEqual(createdIds.length, 5);

    // Resolve comma-separated IDs
    const commaSeparated = createdIds.join(",");
    const allQuestions = repository.getQuestions();
    const { questions, combinedQuestion, allItems } = resolveRoomQuestions(commaSeparated, allQuestions);

    assert.strictEqual(questions.length, 5, "Must resolve all 5 questions");
    assert.strictEqual(allItems.length, 5, "Must contain all 5 question items");
    assert.ok(combinedQuestion, "Combined question must be formed");
    assert.strictEqual(combinedQuestion?.items?.length, 5, "Combined question must hold all 5 items");
    assert.strictEqual(allItems[4].question_text, "Pertanyaan butir nomor 5 tentang pasar Ponorogo");
    assert.strictEqual(allItems[4].explanation, "Pembahasan soal nomor 5");
  });
});

