import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  isIdOrCodeMatch,
  detectResourceCategory,
  resolveRoomQuestions,
  resolveRoomMaterials,
  Question,
  LearningMaterial,
} from "../lib/db/types";
import { repository } from "../lib/db/repository";

describe("ID & Code Normalization and System-wide Sync Matrix", () => {
  beforeEach(() => {
    if (typeof localStorage !== "undefined") {
      localStorage.clear();
    }
  });

  describe("1. detectResourceCategory", () => {
    test("detects room prefixes accurately", () => {
      assert.deepEqual(detectResourceCategory("rom1001"), { category: "room", stem: "1001" });
      assert.deepEqual(detectResourceCategory("room5a"), { category: "room", stem: "5a" });
      assert.deepEqual(detectResourceCategory("rm12"), { category: "room", stem: "12" });
    });

    test("detects material prefixes accurately", () => {
      assert.deepEqual(detectResourceCategory("mat1001"), { category: "material", stem: "1001" });
      assert.deepEqual(detectResourceCategory("mtrpnr01"), { category: "material", stem: "pnr01" });
      assert.deepEqual(detectResourceCategory("materibacaan"), { category: "material", stem: "bacaan" });
    });

    test("detects question prefixes accurately", () => {
      assert.deepEqual(detectResourceCategory("sol1001"), { category: "question", stem: "1001" });
      assert.deepEqual(detectResourceCategory("soal5"), { category: "question", stem: "5" });
      assert.deepEqual(detectResourceCategory("que01"), { category: "question", stem: "01" });
      assert.deepEqual(detectResourceCategory("q1234"), { category: "question", stem: "1234" });
    });

    test("identifies un-prefixed identifiers as unknown category with identical stem", () => {
      assert.deepEqual(detectResourceCategory("1001"), { category: "unknown", stem: "1001" });
      assert.deepEqual(detectResourceCategory("abc-123"), { category: "unknown", stem: "abc-123" });
    });
  });

  describe("2. isIdOrCodeMatch", () => {
    test("matches exact, lowercase, and delimiter-varied identifiers", () => {
      assert.equal(isIdOrCodeMatch("rom-1001", "ROM-1001"), true);
      assert.equal(isIdOrCodeMatch("rom-1001", "rom_1001"), true);
      assert.equal(isIdOrCodeMatch("rom 1001", "rom1001"), true);
      assert.equal(isIdOrCodeMatch("mat-pnr-01", "MAT-PNR-01"), true);
    });

    test("matches bare numbers with prefixed resource IDs", () => {
      assert.equal(isIdOrCodeMatch("1001", "rom1001"), true);
      assert.equal(isIdOrCodeMatch("1001", "ROM-1001"), true);
      assert.equal(isIdOrCodeMatch("1001", "mat1001"), true);
      assert.equal(isIdOrCodeMatch("1001", "sol1001"), true);
      assert.equal(isIdOrCodeMatch("1001", "q-1001"), true);
    });

    test("matches between different aliases of the same domain", () => {
      assert.equal(isIdOrCodeMatch("sol1001", "soal1001"), true);
      assert.equal(isIdOrCodeMatch("mat1001", "mtr1001"), true);
      assert.equal(isIdOrCodeMatch("rom1001", "room1001"), true);
    });

    test("REJECTS cross-domain false positives", () => {
      // Material should NEVER match Question
      assert.equal(isIdOrCodeMatch("mat1001", "sol1001"), false);
      assert.equal(isIdOrCodeMatch("mat1001", "q-1001"), false);

      // Room should NEVER match Question or Material
      assert.equal(isIdOrCodeMatch("rom1001", "sol1001"), false);
      assert.equal(isIdOrCodeMatch("rom1001", "mat1001"), false);
    });

    test("respects expectedCategory parameter", () => {
      assert.equal(isIdOrCodeMatch("1001", "rom1001", "room"), true);
      assert.equal(isIdOrCodeMatch("1001", "mat1001", "room"), false);
      assert.equal(isIdOrCodeMatch("1001", "sol1001", "material"), false);
    });
  });

  describe("3. Room Questions and Materials Resolution", () => {
    const mockQuestions: Question[] = [
      {
        id: "sol1001",
        school_id: "sch-1",
        teacher_id: "tea-1",
        subject: "Matematika",
        grade: 5,
        type: "multiple_choice",
        question_text: "Hitung 5 x 5",
        options: [
          { key: "A", text: "25" },
          { key: "B", text: "20" },
        ],
        correct_answer: "A",
        explanation: "5 x 5 = 25",
        topic: "Perkalian",
        is_contextualized: true,
        created_at: new Date().toISOString(),
      },
      {
        id: "q-1002",
        school_id: "sch-1",
        teacher_id: "tea-1",
        subject: "Matematika",
        grade: 5,
        type: "essay",
        question_text: "Jelaskan konsep pecahan",
        correct_answer: "Pecahan adalah bagian dari keseluruhan",
        explanation: "Pecahan menunjukkan bagian dari keseluruhan.",
        topic: "Pecahan",
        is_contextualized: true,
        created_at: new Date().toISOString(),
      },
    ];

    const mockMaterials: LearningMaterial[] = [
      {
        id: "mat1001",
        school_id: "sch-1",
        teacher_id: "tea-1",
        title: "Kearifan Lokal Madiun",
        subject: "IPAS",
        grade: 5,
        content: "Madiun terkenal dengan Brem dan Pecel.",
        is_contextualized: true,
        created_at: new Date().toISOString(),
      },
    ];

    test("resolves questions using bare ID tokens", () => {
      const { questions, combinedQuestion } = resolveRoomQuestions("1001", mockQuestions);
      assert.equal(questions.length, 1);
      assert.equal(questions[0].id, "sol1001");
      assert.ok(combinedQuestion);
    });

    test("resolves questions using multiple comma-separated tokens with mixed formatting", () => {
      const { questions, combinedQuestion, allItems } = resolveRoomQuestions(
        " 1001 ,  SOL-1002 ",
        mockQuestions
      );
      assert.equal(questions.length, 2);
      assert.equal(allItems.length, 2);
      assert.equal(combinedQuestion?.type, "mixed");
    });

    test("resolves materials using bare ID or prefixed ID tokens", () => {
      const res1 = resolveRoomMaterials("1001", mockMaterials);
      assert.equal(res1.materials.length, 1);
      assert.equal(res1.primaryMaterial?.title, "Kearifan Lokal Madiun");

      const res2 = resolveRoomMaterials("MAT-1001", mockMaterials);
      assert.equal(res2.materials.length, 1);
      assert.equal(res2.primaryMaterial?.id, "mat1001");
    });
  });

  describe("4. Repository Integration & Content Usage Detection", () => {
    test("finds room by code regardless of user input prefixes or casing", () => {
      const room = repository.createRoom({
        code: "rom1001",
        title: "Kelas 5A Eksplorasi",
        type: "both",
        resource_id: "mat-pnr-01",
        secondary_resource_id: "sol1001",
        subject: "Matematika",
        grade: 5,
        teacher_id: "tea-1",
      });

      assert.equal(repository.getRoomByCode("rom1001")?.id, room.id);
      assert.equal(repository.getRoomByCode("ROM-1001")?.id, room.id);
      assert.equal(repository.getRoomByCode("1001")?.id, room.id);
      assert.equal(repository.getRoom("rom 1001")?.id, room.id);
    });

    test("accurately detects if content is used in a room even if ID formatting differs", () => {
      repository.createRoom({
        code: "rom2002",
        title: "Room Uji Penggunaan",
        type: "both",
        resource_id: "mat1001",
        secondary_resource_id: "1001",
        subject: "Matematika",
        grade: 5,
        teacher_id: "tea-1",
      });

      // Material ID '1001' or 'mat-1001' should match 'mat1001'
      const matUsage = repository.isContentUsedInRoom("material", "1001");
      assert.equal(matUsage.isUsed, true);
      assert.ok(matUsage.rooms.length > 0);

      // Question ID 'sol1001' or 'q-1001' should match token '1001'
      const qUsage = repository.isContentUsedInRoom("question", "sol1001");
      assert.equal(qUsage.isUsed, true);
    });

    test("updates and deletes rooms with prefix-agnostic id/code", () => {
      repository.createRoom({
        code: "rom3003",
        title: "Room Akan Dihapus",
        type: "material",
        resource_id: "mat-1",
        subject: "IPA",
        grade: 4,
        teacher_id: "tea-1",
      });

      // Update via bare code
      const updated = repository.updateRoom("3003", { title: "Room Berubah Judul" });
      assert.equal(updated?.title, "Room Berubah Judul");

      // Delete via code with hyphens
      const deleted = repository.deleteRoom("ROM-3003");
      assert.equal(deleted, true);
      assert.equal(repository.getRoomByCode("3003"), undefined);
    });
  });
});
