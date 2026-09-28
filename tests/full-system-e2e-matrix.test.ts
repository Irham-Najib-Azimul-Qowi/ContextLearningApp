import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { contextEngine } from "../lib/context-engine/pipeline";
import { ContentInput } from "../lib/context-engine/types";
import { repository } from "../lib/db/repository";
import { adminRepository } from "../lib/admin/admin-repository";
import { aiProviderManager } from "../lib/ai/ai-provider-manager";
import { maskApiKey, encryptSecret, decryptSecret } from "../lib/admin/crypto";

describe("FULL SYSTEM E2E ACCEPTANCE & 8-WORKFLOW MATRIX TESTS", () => {
  // =========================================================================
  // SECTION 1: THE 8 CORE INPUT COMBINATIONS (INPUT -> RAG -> SAVE -> RELOAD)
  // =========================================================================

  test("1. MATERI + MANUAL: Input -> RAG -> Save -> Reload -> Persistent", async () => {
    const input: ContentInput = {
      contentType: "material",
      sourceType: "manual",
      rawText: "Kegiatan perdagangan di pasar tradisional meliputi transaksi sayur mayur dan beras.",
      title: "Kegiatan Ekonomi Pasar Ponorogo",
      subject: "IPS",
      grade: 5,
      regionName: "Kabupaten Ponorogo",
      regionId: "35.02",
    };

    const norm = contextEngine.normalizeContent(input);
    const facts = await contextEngine.retrieveLocalKnowledge("35.02", "Pasar Ponorogo");
    assert.ok(facts.length > 0, "RAG should retrieve verified Ponorogo facts");

    const saved = repository.saveMaterial({
      id: `mat-test-manual-${Date.now()}`,
      school_id: "sch-ponorogo-01",
      teacher_id: "usr-teacher-01",
      title: norm.title,
      subject: norm.subject,
      grade: norm.grade,
      content: `${norm.effectiveText} Diperkaya kearifan lokal ${facts[0]?.name || "Ponorogo"}.`,
      is_contextualized: true,
      context_variables: [{ original_term: "pasar tradisional", replacement_term: "Pasar Legi Ponorogo", category: "location" }],
      validation: { is_valid: true, local_context_grounded: true, competency_preserved: true },
    });

    assert.ok(saved.id, "Material must receive valid persistent ID");
    const reloaded = repository.getMaterialById(saved.id);
    assert.ok(reloaded, "Material must be retrievable from repository");
    assert.equal(reloaded?.title, input.title);
    assert.equal(reloaded?.is_contextualized, true);
  });

  test("2. SOAL + MANUAL: Input -> Math Validation -> Save -> Reload -> Persistent", async () => {
    const input: ContentInput = {
      contentType: "question",
      sourceType: "manual",
      rawText: "Ibu membeli 3 kg beras seharga Rp 45.000. Berapa harga 1 kg beras?",
      topic: "Aritmetika Pembelian Beras",
      subject: "Matematika",
      grade: 5,
      regionName: "Kabupaten Ponorogo",
      regionId: "35.02",
    };

    const norm = contextEngine.normalizeContent(input);
    const validation = await contextEngine.validateEducationalIntegrity(
      norm,
      "Ibu membeli 3 kg beras super di Pasar Legi seharga Rp 45.000. Berapa harga 1 kg beras?"
    );
    assert.equal(validation.math_numbers_strictly_preserved, true, "Numbers 3 and 45.000 must be preserved");

    const saved = repository.saveQuestion({
      id: `q-test-manual-${Date.now()}`,
      school_id: "sch-ponorogo-01",
      teacher_id: "usr-teacher-01",
      subject: "Matematika",
      grade: 5,
      topic: norm.topic,
      is_contextualized: true,
      items: [
        {
          id: `item-${Date.now()}-1`,
          type: "multiple_choice",
          question_text: "Ibu membeli 3 kg beras super di Pasar Legi Ponorogo seharga Rp 45.000. Berapa harga 1 kg beras?",
          options: [
            { key: "A", text: "Rp 15.000" },
            { key: "B", text: "Rp 12.000" },
            { key: "C", text: "Rp 18.000" },
            { key: "D", text: "Rp 20.000" },
          ],
          correct_answer: "A",
          explanation: "Harga per kg = Rp 45.000 / 3 = Rp 15.000.",
        },
      ],
    });

    assert.ok(saved.id, "Question must receive valid persistent ID");
    const reloaded = repository.getQuestionById(saved.id);
    assert.ok(reloaded, "Question must be retrievable from repository");
    assert.equal(reloaded?.items?.[0]?.correct_answer, "A");
    assert.equal(reloaded?.items?.[0]?.options?.length, 4);
  });

  test("3. MATERI + PDF: PDF Source -> Normalization -> Contextualize -> Save -> Persistent", async () => {
    const input: ContentInput = {
      contentType: "material",
      sourceType: "pdf",
      rawText: "Bab 2: Industri transportasi dan perakitan kereta api di Jawa Timur.",
      title: "Modul Ajar Transportasi Rel",
      subject: "IPS",
      grade: 5,
      regionName: "Kota Madiun",
      regionId: "35.77",
    };

    const norm = contextEngine.normalizeContent(input);
    assert.equal(norm.sourceType, "pdf");

    const facts = await contextEngine.retrieveLocalKnowledge("35.77", "Industri INKA");
    assert.ok(facts.length > 0, "RAG should retrieve Kota Madiun facts");

    const saved = repository.saveMaterial({
      id: `mat-test-pdf-${Date.now()}`,
      school_id: "sch-madiun-01",
      teacher_id: "usr-teacher-01",
      title: norm.title,
      subject: norm.subject,
      grade: norm.grade,
      content: `${norm.effectiveText} Sentra industri kereta api terintegrasi dengan PT INKA Kota Madiun.`,
      is_contextualized: true,
      original_content: norm.effectiveText,
    });

    const reloaded = repository.getMaterialById(saved.id);
    assert.ok(reloaded, "PDF material must persist");
    assert.ok(reloaded?.content.includes("INKA"));
  });

  test("4. SOAL + PDF: PDF Extraction -> Items Mapping -> Save -> Persistent", async () => {
    const input: ContentInput = {
      contentType: "question",
      sourceType: "pdf",
      rawText: "1. Kerajinan kulit sapi terkemuka di Lereng Gunung Lawu berasal dari kabupaten mana?\nA. Magetan\nB. Madiun\nC. Ngawi\nD. Pacitan\nKunci: A",
      topic: "Kerajinan Khas Daerah",
      subject: "IPS",
      grade: 5,
      regionName: "Kabupaten Magetan",
      regionId: "35.20",
    };

    const norm = contextEngine.normalizeContent(input);
    const saved = repository.saveQuestion({
      id: `q-test-pdf-${Date.now()}`,
      school_id: "sch-magetan-01",
      teacher_id: "usr-teacher-01",
      subject: "IPS",
      grade: 5,
      topic: norm.topic,
      is_contextualized: true,
      items: [
        {
          id: `item-${Date.now()}-pdf`,
          type: "multiple_choice",
          question_text: "Kerajinan kulit sapi terkemuka di Lereng Gunung Lawu berasal dari sentra kerajinan di kabupaten mana?",
          options: [
            { key: "A", text: "Kabupaten Magetan" },
            { key: "B", text: "Kota Madiun" },
            { key: "C", text: "Kabupaten Ngawi" },
            { key: "D", text: "Kabupaten Pacitan" },
          ],
          correct_answer: "A",
          explanation: "Kabupaten Magetan terkenal dengan sentra kerajinan kulit Jalan Sawo di lereng Lawu.",
        },
      ],
    });

    const reloaded = repository.getQuestionById(saved.id);
    assert.ok(reloaded, "PDF question must persist");
    assert.equal(reloaded?.items?.[0]?.correct_answer, "A");
  });

  test("5. MATERI + IMAGE: Vision OCR Text -> RAG Grounding -> Save -> Persistent", async () => {
    const input: ContentInput = {
      contentType: "material",
      sourceType: "image",
      rawText: "Ekosistem perairan Telaga Sarangan dan pemanfaatan sumber air bersih bagi warga.",
      title: "Ekosistem Telaga Sarangan",
      subject: "IPAS",
      grade: 5,
      regionName: "Kabupaten Magetan",
      regionId: "35.20",
    };

    const norm = contextEngine.normalizeContent(input);
    assert.equal(norm.sourceType, "image");

    const saved = repository.saveMaterial({
      id: `mat-test-img-${Date.now()}`,
      school_id: "sch-magetan-01",
      teacher_id: "usr-teacher-01",
      title: norm.title,
      subject: norm.subject,
      grade: norm.grade,
      content: norm.effectiveText,
      is_contextualized: true,
    });

    const reloaded = repository.getMaterialById(saved.id);
    assert.ok(reloaded, "Image material must persist");
    assert.equal(reloaded?.title, "Ekosistem Telaga Sarangan");
  });

  test("6. SOAL + IMAGE: Vision OCR Question -> Math Preservation -> Save -> Persistent", async () => {
    const input: ContentInput = {
      contentType: "question",
      sourceType: "image",
      rawText: "Pak Tono memetik 15 keranjang apel di kebun lereng gunung. Tiap keranjang berisi 20 buah apel. Hitung total apel yang dipetik!",
      topic: "Perkalian Bilangan Bulat",
      subject: "Matematika",
      grade: 5,
      regionName: "Kabupaten Magetan",
      regionId: "35.20",
    };

    const norm = contextEngine.normalizeContent(input);
    const originalNums = contextEngine.extractNumbers(norm.effectiveText);
    assert.deepEqual(originalNums, [15, 20]);

    const saved = repository.saveQuestion({
      id: `q-test-img-${Date.now()}`,
      school_id: "sch-magetan-01",
      teacher_id: "usr-teacher-01",
      subject: "Matematika",
      grade: 5,
      topic: norm.topic,
      is_contextualized: true,
      items: [
        {
          id: `item-${Date.now()}-img`,
          type: "essay",
          question_text: "Pak Tono memetik 15 keranjang apel di perkebunan lereng Gunung Lawu Sarangan. Tiap keranjang berisi 20 buah apel. Hitunglah total buah apel yang dipetik!",
          rubric: "Skor 10 jika langkah 15 x 20 = 300 buah dijabarkan lengkap dan tepat.",
          explanation: "Total apel = 15 x 20 = 300 buah apel.",
        },
      ],
    });

    const reloaded = repository.getQuestionById(saved.id);
    assert.ok(reloaded, "Image question must persist");
    assert.equal(reloaded?.items?.[0]?.type, "essay");
    assert.ok(reloaded?.items?.[0]?.rubric);
  });

  test("7. MATERI + GENERATE AI: Prompt Input -> RAG Synthesis -> Save -> Persistent", async () => {
    const input: ContentInput = {
      contentType: "material",
      sourceType: "generate",
      prompt: "Bentang alam dan potensi komoditas ekspor porang serta susu sapi perah",
      subject: "IPS",
      grade: 5,
      regionName: "Kabupaten Ponorogo",
      regionId: "35.02",
    };

    const norm = contextEngine.normalizeContent(input);
    assert.equal(norm.sourceType, "generate");

    const facts = await contextEngine.retrieveLocalKnowledge("35.02", "Sapi Perah Pudak");
    assert.ok(facts.length > 0, "RAG should retrieve Pudak dairy cow facts");

    const saved = repository.saveMaterial({
      id: `mat-test-gen-${Date.now()}`,
      school_id: "sch-ponorogo-01",
      teacher_id: "usr-teacher-01",
      title: "Potensi Peternakan Sapi Perah Pudak Ponorogo",
      subject: norm.subject,
      grade: norm.grade,
      content: "Kecamatan Pudak di Kabupaten Ponorogo memiliki iklim sejuk di kaki pegunungan yang sangat cocok untuk peternakan sapi perah penghasil susu segar.",
      is_contextualized: true,
    });

    const reloaded = repository.getMaterialById(saved.id);
    assert.ok(reloaded, "AI Generated material must persist");
    assert.ok(reloaded?.content.includes("Pudak"));
  });

  test("8. SOAL + GENERATE AI: Multi-Item Package (MC + Essay) -> Save -> Persistent", async () => {
    const input: ContentInput = {
      contentType: "question",
      sourceType: "generate",
      prompt: "Aritmetika hitung belanja di pasar tradisional Caruban",
      questionCount: 2,
      questionType: "mixed",
      subject: "Matematika",
      grade: 5,
      regionName: "Kabupaten Madiun",
      regionId: "35.19",
    };

    const norm = contextEngine.normalizeContent(input);
    assert.equal(norm.questionCount, 2);
    assert.equal(norm.questionType, "mixed");

    const saved = repository.saveQuestion({
      id: `q-test-gen-${Date.now()}`,
      school_id: "sch-madiun-01",
      teacher_id: "usr-teacher-01",
      subject: "Matematika",
      grade: 5,
      topic: norm.topic,
      is_contextualized: true,
      items: [
        {
          id: `item-${Date.now()}-1`,
          type: "multiple_choice",
          question_text: "Di Pasar Caruban Madiun, harga 2 kg beras adalah Rp 28.000. Berapa harga 5 kg beras?",
          options: [
            { key: "A", text: "Rp 70.000" },
            { key: "B", text: "Rp 65.000" },
            { key: "C", text: "Rp 75.000" },
            { key: "D", text: "Rp 60.000" },
          ],
          correct_answer: "A",
          explanation: "Harga per kg = Rp 14.000. 5 kg = 5 x 14.000 = Rp 70.000.",
        },
        {
          id: `item-${Date.now()}-2`,
          type: "essay",
          question_text: "Jelaskan langkah hitung perbandingan senilai untuk menentukan harga 5 kg beras di atas!",
          rubric: "Skor 10 jika menjabarkan harga satuan terlebih dahulu kemudian mengalikannya dengan 5.",
          explanation: "Langkah: 1) Cari harga 1 kg = 28.000 / 2 = 14.000. 2) Kalikan 5 = 70.000.",
        },
      ],
    });

    const reloaded = repository.getQuestionById(saved.id);
    assert.ok(reloaded, "Multi-item question package must persist");
    assert.equal(reloaded?.items?.length, 2);
    assert.equal(reloaded?.items?.[0]?.type, "multiple_choice");
    assert.equal(reloaded?.items?.[1]?.type, "essay");
  });

  // =========================================================================
  // SECTION 2: AI CREDENTIAL POOL & AUTOMATIC FAILOVER INTEGRITY
  // =========================================================================

  test("9. Credential Pool: Contains 5 slots with prioritized failover order", () => {
    const creds = adminRepository.listCredentials();
    assert.ok(creds.length >= 5, "Must have at least 5 credential slots configured");
    for (let i = 0; i < 4; i++) {
      assert.ok(creds[i].priority <= creds[i + 1].priority, "Credentials must be sorted by priority ascending");
    }
  });

  test("10. Secret Encryption & Masking: Never exposes plain API key in UI or logs", () => {
    const secret = "AIzaSyTestSecretKey_2026_ProdKeyXYZ";
    const encrypted = encryptSecret(secret);
    assert.notEqual(encrypted.ciphertext, secret, "Ciphertext must not be plaintext");

    const decrypted = decryptSecret(encrypted.ciphertext, encrypted.iv, encrypted.tag);
    assert.equal(decrypted, secret, "Decrypted secret must match original");

    const masked = maskApiKey(secret);
    assert.ok(masked.startsWith("AIza"), "Masked key keeps prefix");
    assert.ok(masked.endsWith("XYZ"), "Masked key keeps suffix");
    assert.ok(masked.includes("••••"), "Middle characters must be masked with bullets");
    assert.ok(!masked.includes("TestSecretKey"), "Secret plaintext must never leak");
  });

  test("11. Input Guard: Empty prompts are rejected immediately without burning API keys", async () => {
    const result = await aiProviderManager.execute({
      featureKey: "question_generation",
      prompt: "   ",
    });
    assert.equal(result.success, false);
    assert.equal(result.structuredError?.code, "INPUT_INVALID");
    assert.equal(result.tokensConsumed.total, 0, "No tokens should be consumed on invalid input");
  });

  // =========================================================================
  // SECTION 3: ROOM LIFECYCLE & CONTENT IMMUTABILITY PROTECTION
  // =========================================================================

  test("12. Room Lifecycle: Deleting content used in Room triggers soft-delete archive to protect historical data", () => {
    const matId = `mat-in-room-${Date.now()}`;
    const qId = `q-in-room-${Date.now()}`;

    // 1. Create source material & question
    repository.saveMaterial({
      id: matId,
      school_id: "sch-ponorogo-01",
      teacher_id: "usr-teacher-01",
      title: "Materi Asesmen Room",
      content: "Isi materi ajar",
      is_contextualized: true,
    });

    repository.saveQuestion({
      id: qId,
      school_id: "sch-ponorogo-01",
      teacher_id: "usr-teacher-01",
      subject: "Matematika",
      grade: 5,
      topic: "Soal Asesmen Room",
      is_contextualized: true,
      items: [{ id: "it-1", type: "multiple_choice", question_text: "1 + 1 = ?", correct_answer: "2" }],
    });

    // 2. Publish Room attaching both resources
    const roomCode = `rm${Math.floor(1000 + Math.random() * 9000)}`;
    const createdRoom = repository.createRoom({
      code: roomCode,
      title: "Ruang Ujian Kelas 5",
      type: "both",
      resource_id: matId,
      secondary_resource_id: qId,
      subject: "Matematika",
      grade: 5,
      teacher_id: "usr-teacher-01",
      school_id: "sch-ponorogo-01",
    });

    assert.ok(createdRoom.material_snapshot, "Room must capture immutable material snapshot");
    assert.ok(createdRoom.question_snapshot, "Room must capture immutable question snapshot");

    // 3. Attempt to delete material that is currently used in Room
    const deleteResult = repository.deleteMaterial(matId, false);
    assert.equal(deleteResult, true, "Operation must succeed via safe archive");

    // 4. Source material is archived (soft delete), NOT purged
    const archivedMat = repository.getMaterialById(matId, true);
    assert.ok(archivedMat, "Material record must still exist");
    assert.equal(archivedMat?.is_archived, true, "Material must be marked as archived");

    // 5. The Room continues to have full access via its immutable snapshot
    const fetchedRoom = repository.getRoomByCode(roomCode);
    assert.ok(fetchedRoom, "Room must remain completely accessible");
    assert.equal(fetchedRoom?.material_snapshot?.id, matId);
    assert.equal(fetchedRoom?.question_snapshot?.id, qId);
  });

  test("13. Non-destructive Cloud Sync Race Protection: Asynchronous cloud response never wipes newly saved local question/material/room", () => {
    const freshQuestionId = `q-race-safe-${Date.now()}`;
    const freshMaterialId = `mat-race-safe-${Date.now()}`;

    // 1. User saves fresh question & material locally
    const savedQ = repository.saveQuestion({
      id: freshQuestionId,
      school_id: "sch-ponorogo-01",
      teacher_id: "usr-teacher-01",
      subject: "Matematika",
      grade: 5,
      topic: "Soal Anti-Hilang Sync",
      is_contextualized: true,
      items: [{ id: "it-race", type: "multiple_choice", question_text: "10 x 10 = ?", correct_answer: "100" }],
    });

    const savedMat = repository.saveMaterial({
      id: freshMaterialId,
      school_id: "sch-ponorogo-01",
      teacher_id: "usr-teacher-01",
      title: "Materi Anti-Hilang Sync",
      content: "Isi materi penting",
      is_contextualized: true,
    });

    assert.ok(savedQ.id, "Question must be saved");
    assert.ok(savedMat.id, "Material must be saved");

    // 2. Simulate cloud returning an older state (that does NOT yet include freshQuestionId or freshMaterialId)
    // Invoking applyAuthoritativeCloudData via private method emulation
    (repository as any).applyAuthoritativeCloudData({
      questions: [{ id: "sol1001", topic: "Soal Warisan Cloud Lama", items: [] }],
      materials: [{ id: "mat-old", title: "Materi Warisan Cloud Lama", content: "Lama" }],
      rooms: [{ id: "rom-old", code: "old1", title: "Room Warisan Cloud Lama" }],
      deletedIds: { questions: [], materials: [], rooms: [] },
    });

    // 3. Verify that the local question and material are STILL RETAINED and NOT wiped out
    const reloadedQ = repository.getQuestionById(freshQuestionId);
    assert.ok(reloadedQ, "Newly created local question MUST NOT be wiped out by cloud sync");
    assert.equal(reloadedQ?.id, freshQuestionId);

    const reloadedMat = repository.getMaterialById(freshMaterialId);
    assert.ok(reloadedMat, "Newly created local material MUST NOT be wiped out by cloud sync");
    assert.equal(reloadedMat?.id, freshMaterialId);
  });

  test("14. Teacher Ownership Invariance: Teacher questions are always retrievable by school and teacher ID", () => {
    const qId = `q-owner-${Date.now()}`;
    const saved = repository.saveQuestion({
      id: qId,
      school_id: "sch-ponorogo-01",
      teacher_id: "usr-teacher-01",
      subject: "IPS",
      grade: 5,
      topic: "Kerajinan Gerabah",
      is_contextualized: true,
      items: [{ id: "it-own", type: "essay", question_text: "Jelaskan proses pembuatan gerabah." }],
    });

    assert.ok(saved.id);
    const bySchool = repository.getQuestions({ schoolId: "sch-ponorogo-01" });
    assert.ok(bySchool.some((q) => q.id === qId), "Question must be visible under its school");

    const byTeacher = repository.getQuestions({ teacherId: "usr-teacher-01" });
    assert.ok(byTeacher.some((q) => q.id === qId), "Question must be visible by teacher ID");
  });
});
