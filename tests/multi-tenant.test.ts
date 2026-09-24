import test from "node:test";
import assert from "node:assert/strict";
import { repository } from "../lib/db/repository";

test("Multi-School Isolation and Class Membership Tests", async (t) => {
  await t.test("Schools are properly isolated by ID and region", () => {
    const schools = repository.getSchools();
    assert.strictEqual(schools.length >= 2, true);

    const ponorogoSchool = repository.getSchool("sch-ponorogo-01");
    assert.strictEqual(ponorogoSchool?.name, "SD Negeri 1 Ponorogo");
    assert.strictEqual(ponorogoSchool?.region_id, "35.02");

    const madiunSchool = repository.getSchool("sch-madiun-01");
    assert.strictEqual(madiunSchool?.name, "SD Negeri 001 Madiun");
    assert.strictEqual(madiunSchool?.region_id, "35.77");
  });

  await t.test("Classes and Question Bank are scoped strictly to school ID", () => {
    const ponorogoClasses = repository.getClasses("sch-ponorogo-01");
    assert.ok(ponorogoClasses.length > 0);
    assert.ok(ponorogoClasses.every((c) => c.school_id === "sch-ponorogo-01"));

    const ponorogoQuestions = repository.getQuestions({ schoolId: "sch-ponorogo-01" });
    assert.ok(ponorogoQuestions.length > 0);
    assert.ok(ponorogoQuestions.every((q) => q.school_id === "sch-ponorogo-01"));

    // Ensure non-existent school gets 0 questions
    const alienQuestions = repository.getQuestions({ schoolId: "sch-unknown-999" });
    assert.strictEqual(alienQuestions.length, 0);
  });

  await t.test("Student can join class securely via invite code", () => {
    const targetClass = repository.getClass("cls-pnr-5b");
    assert.ok(targetClass);

    const joinResult = repository.joinClassByCode(
      "usr-student-02",
      "Dewi Lestari",
      targetClass.code
    );

    assert.strictEqual(joinResult.success, true);
    assert.strictEqual(joinResult.classRoom?.id, targetClass.id);

    // Verify student is now enrolled in this class
    const studentClasses = repository.getStudentClasses("usr-student-02");
    assert.ok(studentClasses.some((c) => c.id === targetClass.id));
  });

  await t.test("Invalid class invite code is safely rejected", () => {
    const joinResult = repository.joinClassByCode(
      "usr-student-02",
      "Dewi Lestari",
      "INVALID-CODE-999"
    );

    assert.strictEqual(joinResult.success, false);
    assert.ok(joinResult.message.includes("tidak ditemukan"));
  });
});
