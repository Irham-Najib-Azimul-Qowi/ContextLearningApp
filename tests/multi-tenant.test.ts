import { describe, it } from "node:test";
import assert from "node:assert";
import { repository } from "../lib/db/repository";

describe("Multi-Tenant SaaS and Security Isolation Tests", () => {
  it("enforces school tenant boundaries: teacher must have active membership", () => {
    // Teacher demo has active membership in school-sd001-samarinda and school-smp01-samarinda
    const isMemberSchoolA = repository.verifyTeacherMembership(
      "teacher-demo-01",
      "school-sd001-samarinda"
    );
    assert.strictEqual(isMemberSchoolA, true);

    // Teacher demo DOES NOT have membership in school-sma01-samarinda
    const isMemberSchoolB = repository.verifyTeacherMembership(
      "teacher-demo-01",
      "school-sma01-samarinda"
    );
    assert.strictEqual(isMemberSchoolB, false);
  });

  it("prevents duplicate school creation in the same regency", () => {
    // Attempting to create duplicate "SD Negeri 001 Samarinda Kota" in Kota Samarinda
    assert.throws(
      () => {
        repository.createSchool({
          name: "SD Negeri 001 Samarinda",
          educational_level: "SD",
          province: "Kalimantan Timur",
          regency: "Kota Samarinda",
          district: "Samarinda Kota",
          createdBy: "teacher-demo-01",
        });
      },
      (err: any) => {
        return err.message.includes("sudah terdaftar");
      }
    );
  });

  it("protects AI credentials: raw API keys are masked and never exposed to queries", () => {
    const creds = repository.getAICredentials();
    assert.ok(creds.length > 0);

    for (const cred of creds) {
      // Must have masked key
      assert.ok(cred.api_key_masked.includes("..."));
      // The masked key must not expose full secret
      assert.ok(cred.api_key_masked.length < 25);
    }
  });

  it("provisions student accounts with unique codes and temporary credentials", () => {
    const { student, temporaryPassword } = repository.createStudentAccount({
      school_id: "school-sd001-samarinda",
      full_name: "Ahmad Zaki",
      grade: 5,
      class_id: "class-5a-samarinda",
      teacher_id: "teacher-demo-01",
    });

    assert.ok(student.id);
    assert.ok(student.student_code);
    assert.ok(temporaryPassword.length >= 6);

    // Verify lookup by student code
    const found = repository.getUserByStudentCode(student.student_code);
    assert.ok(found);
    assert.strictEqual(found.full_name, "Ahmad Zaki");
  });

  it("validates spreadsheet batch import and reports errors per row without silent drops", () => {
    const records = [
      { full_name: "Citra Kirana", student_code: "STU-TEST-001", grade: 5 },
      { full_name: "", student_code: "STU-TEST-002", grade: 5 }, // Invalid row (empty name)
      { full_name: "Dedi Prasetyo", student_code: "STU-TEST-003", grade: 5 },
    ];

    const result = repository.batchImportStudents(
      "school-sd001-samarinda",
      "teacher-demo-01",
      "class-5a-samarinda",
      records
    );

    assert.strictEqual(result.createdCount, 2);
    assert.strictEqual(result.failedRows.length, 1);
    assert.strictEqual(result.failedRows[0].row, 2);
  });

  it("grades scanned answer sheets deterministically without AI dependency for multiple-choice", () => {
    const exam = repository.getExaminationById("exam-01-samarinda");
    assert.ok(exam);

    const sheet = repository.saveScannedSheet({
      school_id: "school-sd001-samarinda",
      examination_id: "exam-01-samarinda",
      student_id: "student-demo-03",
      student_name: "Ahmad Fauzi",
      student_code: "STU-SD01-003",
      image_url: "/placeholder-scan.png",
      detected_answers: {
        "q-math-01": "B", // Correct
        "q-indo-01": "B", // Correct
      },
      uncertain_answers: [],
      status: "scanned",
      submission_source: "scanned",
    });

    const confirmed = repository.confirmScannedGrading(
      sheet.id,
      {
        "q-math-01": "B",
        "q-indo-01": "B",
      },
      "teacher-demo-01"
    );

    assert.strictEqual(confirmed.status, "graded");
    assert.strictEqual(confirmed.score, 100);

    // Verify student attempt has submission_source = "scanned"
    const attempt = repository.getAttempt("exam-01-samarinda", "student-demo-03");
    assert.ok(attempt);
    assert.strictEqual(attempt.submission_source, "scanned");
    assert.strictEqual(attempt.score, 100);
  });
});
