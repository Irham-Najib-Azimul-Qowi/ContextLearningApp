import { describe, it } from "node:test";
import assert from "node:assert";
import { repository } from "../lib/db/repository";

describe("Deterministic Server-Side Grading Tests", () => {
  it("should accurately grade multiple-choice questions without LLM dependencies", () => {
    // Start attempt for student
    const attempt = repository.startAttempt(
      "exam-01-samarinda",
      "student-demo-test",
      "Siswa Penguji"
    );

    assert.ok(attempt.id);
    assert.strictEqual(attempt.status, "in_progress");

    // Save answer: q-math-01 correct answer is 'B'
    repository.saveStudentAnswer(attempt.id, "q-math-01", "B");
    // q-indo-01 correct answer is 'B'
    repository.saveStudentAnswer(attempt.id, "q-indo-01", "B");

    // Submit attempt
    const result = repository.submitAttempt(attempt.id);

    assert.strictEqual(result.attempt.status === "submitted" || result.attempt.status === "graded", true);
    assert.strictEqual(result.multipleChoiceScore, 100);
  });

  it("should calculate partial score if some answers are incorrect", () => {
    const attempt = repository.startAttempt(
      "exam-01-samarinda",
      "student-demo-partial",
      "Siswa Parsial"
    );

    // Save one correct ('B') and one wrong ('A')
    repository.saveStudentAnswer(attempt.id, "q-math-01", "B");
    repository.saveStudentAnswer(attempt.id, "q-indo-01", "A");

    const result = repository.submitAttempt(attempt.id);

    assert.strictEqual(result.multipleChoiceScore, 50);
  });
});
