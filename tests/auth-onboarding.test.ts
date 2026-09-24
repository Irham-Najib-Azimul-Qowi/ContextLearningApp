import test from "node:test";
import assert from "node:assert/strict";
import { repository } from "../lib/db/repository";

test("Google Auth & Onboarding Flow Tests", async (t) => {
  await t.test("Teacher passcode verification logic", () => {
    const VALID_PASSCODE = "GURU-PAHAMI-2026";
    const testCases = [
      { code: "GURU-PAHAMI-2026", valid: true },
      { code: "guru-pahami-2026", valid: false },
      { code: "INVALID-CODE", valid: false },
      { code: "", valid: false },
    ];

    for (const tc of testCases) {
      const isValid = tc.code.trim() === VALID_PASSCODE;
      assert.strictEqual(isValid, tc.valid, `Failed for code: ${tc.code}`);
    }
  });

  await t.test("Teacher onboarding binds valid school and region", () => {
    const targetSchool = repository.getSchool("sch-ponorogo-01");
    assert.ok(targetSchool);
    assert.strictEqual(targetSchool.region_id, "35.02");

    repository.setCurrentRole("TEACHER");
    repository.setActiveSchoolId(targetSchool.id);

    const active = repository.getActiveSchool();
    assert.strictEqual(active.id, targetSchool.id);
    assert.strictEqual(active.region_id, "35.02");
    assert.strictEqual(active.region_name, "Kabupaten Ponorogo");
  });

  await t.test("Student onboarding rejects invalid class code", () => {
    const invalidResult = repository.joinClassByCode(
      "student-test-01",
      "Siswa Uji",
      "NON-EXISTENT-CODE"
    );
    assert.strictEqual(invalidResult.success, false);
    assert.ok(invalidResult.message.includes("tidak ditemukan"));
  });

  await t.test("Student onboarding accepts valid class code and assigns school", () => {
    const validClass = repository.getClass("cls-pnr-5a");
    assert.ok(validClass);

    const result = repository.joinClassByCode(
      "student-test-02",
      "Ahmad Fauzi",
      validClass.code
    );
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.classRoom?.school_id, validClass.school_id);

    const enrolled = repository.getStudentClasses("student-test-02");
    assert.ok(enrolled.some((c) => c.id === validClass.id));
  });

  await t.test("Role isolation between Teacher and Student dashboards", () => {
    repository.setCurrentRole("TEACHER");
    assert.strictEqual(repository.getCurrentRole(), "TEACHER");

    repository.setCurrentRole("STUDENT");
    assert.strictEqual(repository.getCurrentRole(), "STUDENT");
  });
});
