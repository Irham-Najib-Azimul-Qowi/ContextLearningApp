import { describe, it } from "node:test";
import assert from "node:assert";
import { repository } from "../lib/db/repository";

describe("Security and Data Isolation Tests", () => {
  it("must strip answer keys, explanations, and rubrics in student exam payloads", () => {
    const studentPayload = repository.getStudentExamPayload(
      "exam-01-samarinda",
      "student-demo-01"
    );

    assert.ok(studentPayload);
    assert.ok(studentPayload.questions && studentPayload.questions.length > 0);

    // Verify each question sent to the student DOES NOT contain correct_answer or explanation
    for (const q of studentPayload.questions) {
      assert.strictEqual((q as any).correct_answer, undefined);
      assert.strictEqual((q as any).explanation, undefined);
      assert.strictEqual((q as any).rubric, undefined);
    }
  });

  it("must reject exam access for students not enrolled in the class", () => {
    const unauthorizedPayload = repository.getStudentExamPayload(
      "exam-01-samarinda",
      "unauthorized-student-999"
    );

    assert.strictEqual(unauthorizedPayload, null);
  });
});
