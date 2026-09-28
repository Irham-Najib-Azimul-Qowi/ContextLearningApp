import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { repository } from "../lib/db/repository";

describe("Room Lifecycle, Snapshot Immutability & Content Archiving Tests", () => {
  test("Creating a room automatically captures immutable material and question snapshots", () => {
    // 1. Create a test material
    const mat = repository.saveMaterial({
      school_id: "sch-ponorogo-01",
      teacher_id: "usr-teacher-01",
      title: "Materi Asli Bentang Alam Ponorogo V1",
      subject: "IPS",
      grade: 5,
      content: "Naskah pelajaran tentang Telaga Ngebel dan dataran tinggi Pudak.",
      is_contextualized: true,
      published_to_classes: [],
    });

    // 2. Create a test question
    const q = repository.saveQuestion({
      school_id: "sch-ponorogo-01",
      teacher_id: "usr-teacher-01",
      subject: "IPS",
      grade: 5,
      topic: "Bentang Alam Ponorogo",
      type: "multiple_choice",
      question_text: "Di manakah sentra peternakan sapi perah di Ponorogo?",
      options: [
        { key: "A", text: "Kecamatan Pudak" },
        { key: "B", text: "Kecamatan Kota" },
        { key: "C", text: "Kecamatan Siman" },
        { key: "D", text: "Kecamatan Jenangan" },
      ],
      correct_answer: "A",
      explanation: "Kecamatan Pudak berada di lereng Gunung Wilis yang bersuhu sejuk.",
      is_contextualized: true,
    });

    // 3. Create a room for both
    const room = repository.createRoom({
      code: `testrom${Date.now().toString().slice(-4)}`,
      title: "Kelas Interaktif IPS Ponorogo",
      type: "both",
      resource_id: mat.id,
      secondary_resource_id: q.id,
      subject: "IPS",
      grade: 5,
      region_name: "Kabupaten Ponorogo",
      teacher_id: "usr-teacher-01",
      teacher_name: "Guru Pengampu",
    });

    // Verify snapshots were automatically captured
    assert.ok(room.material_snapshot, "Room must store immutable material snapshot");
    assert.equal(room.material_snapshot.title, "Materi Asli Bentang Alam Ponorogo V1");
    assert.ok(room.question_snapshot, "Room must store immutable question snapshot");
    assert.equal(room.question_snapshot.question_text, "Di manakah sentra peternakan sapi perah di Ponorogo?");

    // 4. Verify isContentUsedInRoom detects that both items are tied to this active room
    const matUsage = repository.isContentUsedInRoom("material", mat.id);
    assert.equal(matUsage.isUsed, true);
    assert.equal(matUsage.rooms.length >= 1, true);

    const qUsage = repository.isContentUsedInRoom("question", q.id);
    assert.equal(qUsage.isUsed, true);
    assert.equal(qUsage.rooms.length >= 1, true);

    // 5. Teacher attempts to delete the material: it MUST be archived rather than physically deleted
    const deleteMatResult = repository.deleteMaterial(mat.id);
    assert.equal(deleteMatResult, true);

    const archivedMat = repository.getMaterialById(mat.id, true);
    assert.ok(archivedMat, "Archived material record must still exist");
    assert.equal(archivedMat.is_archived, true, "Material must be marked as archived");

    // Must NOT appear in active materials list for new room usage
    const activeMaterials = repository.getMaterials();
    assert.equal(activeMaterials.some((m) => m.id === mat.id), false, "Archived material must not appear in active materials list");

    // 6. Teacher attempts to delete the question: it MUST be archived
    const deleteQResult = repository.deleteQuestion(q.id);
    assert.equal(deleteQResult, true);

    const archivedQ = repository.getQuestionById(q.id, true);
    assert.ok(archivedQ, "Archived question record must still exist");
    assert.equal(archivedQ.is_archived, true, "Question must be marked as archived");

    // Must NOT appear in active questions list
    const activeQuestions = repository.getQuestions();
    assert.equal(activeQuestions.some((item) => item.id === q.id), false, "Archived question must not appear in active questions list");

    // 7. Verify the Room and student access remain 100% functional via room snapshot
    const fetchedRoom = repository.getRoomByCode(room.code);
    assert.ok(fetchedRoom, "Room must remain available");
    assert.equal(fetchedRoom.material_snapshot?.title, "Materi Asli Bentang Alam Ponorogo V1");
    assert.equal(fetchedRoom.question_snapshot?.correct_answer, "A");

    // 8. Record a student visit / score in this room: historical result works cleanly
    const visitOk = repository.recordRoomVisit(room.code, "Siti Rahma", 100);
    assert.equal(visitOk, true);

    const updatedRoom = repository.getRoomByCode(room.code);
    assert.equal(updatedRoom?.visitors?.some((v) => v.name === "Siti Rahma"), true);
  });
});
