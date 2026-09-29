import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { repository } from "../lib/db/repository";

describe("Tombstone Deletion & Synchronization Integrity Tests", () => {
  it("Material deletion: creates tombstone and prevents resurrection", () => {
    // 1. Create a test material
    const testMat = repository.saveMaterial({
      title: "Uji Materi Ponorogo Anti Resurrect",
      subject: "IPS",
      grade: 5,
      school_id: "sch-ponorogo-01",
      content: "Konten uji materi untuk memastikan item tidak muncul kembali.",
      teacher_id: "usr-teacher-test",
      is_contextualized: true,
      published_to_classes: [],
    });

    assert.ok(testMat.id, "Material should have an ID");

    // Verify it is retrievable
    const beforeDelete = repository.getMaterial(testMat.id);
    assert.ok(beforeDelete, "Material should exist before deletion");

    // 2. Delete the material
    const deleted = repository.deleteMaterial(testMat.id);
    assert.equal(deleted, true, "deleteMaterial should return true");

    // 3. Verify it is removed from list and single getter
    const afterDelete = repository.getMaterial(testMat.id);
    assert.equal(afterDelete, undefined, "Deleted material must not be found by ID");

    const allMaterials = repository.getMaterials();
    const foundInList = allMaterials.some((m) => m.id === testMat.id);
    assert.equal(foundInList, false, "Deleted material must be absent from getMaterials()");

    // 4. Verify tombstone exists in repository
    const tombstones = repository.getDeletedIds();
    assert.ok(
      tombstones.materials.includes(testMat.id),
      "Deleted material ID must be present in tombstones"
    );
  });

  it("Question deletion: creates tombstone and prevents resurrection", () => {
    // 1. Create a test question
    const testQ = repository.saveQuestion({
      school_id: "sch-ponorogo-01",
      subject: "Matematika",
      grade: 5,
      topic: "Aritmatika Lokal Ponorogo",
      type: "multiple_choice",
      question_text: "Berapa hasil panen porang di desa Jetis?",
      correct_answer: "A",
      explanation: "Perhitungan hasil panen.",
    });

    assert.ok(testQ.id, "Question should have an ID");

    // Verify it exists
    const beforeDelete = repository.getQuestion(testQ.id);
    assert.ok(beforeDelete, "Question should exist before deletion");

    // 2. Delete the question
    const deleted = repository.deleteQuestion(testQ.id);
    assert.equal(deleted, true, "deleteQuestion should return true");

    // 3. Verify it is removed
    const afterDelete = repository.getQuestion(testQ.id);
    assert.equal(afterDelete, undefined, "Deleted question must not be found by ID");

    const allQuestions = repository.getQuestions();
    const foundInList = allQuestions.some((q) => q.id === testQ.id);
    assert.equal(foundInList, false, "Deleted question must be absent from getQuestions()");

    // 4. Verify tombstone exists
    const tombstones = repository.getDeletedIds();
    assert.ok(
      tombstones.questions.includes(testQ.id),
      "Deleted question ID must be present in tombstones"
    );
  });

  it("Room deletion: creates tombstone for ID and code, prevents resurrection", () => {
    // 1. Create a test room
    const testRoom = repository.createRoom({
      code: "tst99",
      title: "Ruang Uji Coba Hapus",
      type: "material",
      resource_id: "mat-pnr-01",
      subject: "IPS",
      grade: 5,
      region_name: "Kabupaten Ponorogo",
      teacher_id: "usr-teacher-01",
      teacher_name: "Guru Penguji",
    });

    assert.ok(testRoom.id, "Room should have an ID");
    assert.ok(testRoom.code, "Room should have a code");

    // Verify it exists
    const beforeDelete = repository.getRoomByCode(testRoom.code);
    assert.ok(beforeDelete, "Room should exist before deletion");

    // 2. Delete the room
    const deleted = repository.deleteRoom(testRoom.id);
    assert.equal(deleted, true, "deleteRoom should return true");

    // 3. Verify it is removed
    const afterDelete = repository.getRoomByCode(testRoom.code);
    assert.equal(afterDelete, undefined, "Deleted room must not be found by code");

    const allRooms = repository.getRooms();
    const foundInList = allRooms.some(
      (r) => r.id === testRoom.id || r.code === testRoom.code
    );
    assert.equal(foundInList, false, "Deleted room must be absent from getRooms()");

    // 4. Verify tombstones exist
    const tombstones = repository.getDeletedIds();
    assert.ok(
      tombstones.rooms.includes(testRoom.id.toLowerCase()) ||
        tombstones.rooms.includes(testRoom.code.toLowerCase()),
      "Deleted room ID or code must be present in tombstones"
    );
  });

  it("Next ID generators strictly skip all tombstoned IDs and never resurrect deleted items", () => {
    // 1. Manually add tombstoned IDs
    repository.addDeletedId("material", "mat1001");
    repository.addDeletedId("material", "mat1002");
    repository.addDeletedId("question", "sol1001");
    repository.addDeletedId("question", "sol1002");
    repository.addDeletedId("room", "rom1001");
    repository.addDeletedId("room", "rom1002");

    // 2. Generating next IDs must be strictly > 1002
    const nextMatId = repository.getNextMaterialId();
    const nextQId = repository.getNextQuestionId();
    const nextRoomCode = repository.getNextRoomCode();

    const matNum = parseInt(nextMatId.replace(/\D/g, ""), 10);
    const qNum = parseInt(nextQId.replace(/\D/g, ""), 10);
    const roomNum = parseInt(nextRoomCode.replace(/\D/g, ""), 10);

    assert.ok(matNum > 1002, `Next material ID (${nextMatId}) must be > 1002`);
    assert.ok(qNum > 1002, `Next question ID (${nextQId}) must be > 1002`);
    assert.ok(roomNum > 1002, `Next room code (${nextRoomCode}) must be > 1002`);
  });

  it("Active local items are never wiped out even if cloud sends conflicting tombstones", () => {
    // Save a new active question and material
    const activeQ = repository.saveQuestion({
      school_id: "sch-ponorogo-01",
      subject: "Matematika",
      grade: 5,
      topic: "Active Question Must Survive Sync",
      question_text: "Soal aktif harus bertahan",
    });
    const activeMat = repository.saveMaterial({
      title: "Active Material Must Survive Sync",
      content: "Materi aktif harus bertahan",
      subject: "IPS",
      grade: 5,
    });

    // Emulate cloud sync sending authoritative payload that contains tombstone matching the active items
    (repository as any).applyAuthoritativeCloudData({
      questions: [],
      materials: [],
      rooms: [],
      deletedIds: {
        questions: [activeQ.id],
        materials: [activeMat.id],
        rooms: [],
      },
    });

    // Verify active items survived
    const retrievedQ = repository.getQuestion(activeQ.id);
    const retrievedMat = repository.getMaterial(activeMat.id);

    assert.ok(retrievedQ, "Active question must survive sync and not be tombstoned");
    assert.ok(retrievedMat, "Active material must survive sync and not be tombstoned");
  });
});
