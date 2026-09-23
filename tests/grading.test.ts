import test from "node:test";
import assert from "node:assert/strict";
import { repository } from "../lib/db/repository";

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
    assert.strictEqual(graded.status, "graded");
    assert.strictEqual(graded.essay_score, 35);
    assert.strictEqual(graded.score, 60 + 35, "Total composite score should be 95");
    assert.strictEqual(graded.teacher_feedback, "Uraian sangat bagus dan sesuai.");
  });
});
