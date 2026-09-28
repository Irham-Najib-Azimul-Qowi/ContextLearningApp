import assert from "node:assert/strict";
import { repository } from "../lib/db/repository";
import { adminRepository } from "../lib/admin/admin-repository";
import { aiProviderManager } from "../lib/ai/ai-provider-manager";
import { extractTextFromPdfBuffer } from "../lib/ai/pdf-extractor";

const BASE_URL = "http://localhost:3000";

async function runRealSystemVerification() {
  console.log("============================================================");
  console.log("STARTING LIVE DEPASKAN FULL SYSTEM ACCEPTANCE AUDIT & TEST");
  console.log("BASE URL:", BASE_URL);
  console.log("============================================================\n");

  const results: Record<string, "PASS" | "FAIL"> = {};

  // -------------------------------------------------------------------------
  // 1. WORKFLOW: MANUAL SOAL -> REAL AI CONTEXTUALIZE -> PERSISTENCE
  // -------------------------------------------------------------------------
  console.log(">>> [1/10] Testing Real Manual Soal via /api/ai/contextualize...");
  try {
    const rawSoalText = `1. Pak Budi memiliki 2 3/4 kg beras. Ia membeli lagi 1 2/3 kg beras di pasar. Berapa jumlah beras Pak Budi sekarang?
A. 4 5/12 kg
B. 4 1/3 kg
C. 4 1/2 kg
D. 4 5/6 kg
Kunci: A

2. Bu Siti membagikan 15 kg mangga secara merata kepada 5 tetangganya di desa. Berapa kg mangga yang diterima setiap tetangga?
A. 2 kg
B. 3 kg
C. 4 kg
D. 5 kg
Kunci: B

3. Sebutkan dan jelaskan bagaimana tradisi gotong royong dan kearifan lokal dapat menjaga kelestarian lingkungan di lingkungan tempat tinggalmu!
Kunci: Gotong royong membersihkan saluran air dan kearifan lokal menjaga sumber mata air mencegah banjir dan kekeringan secara berkelanjutan.`;

    const res = await fetch(`${BASE_URL}/api/ai/contextualize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "question",
        inputMode: "manual",
        rawText: rawSoalText,
        subject: "Matematika",
        grade: 5,
        regionId: "35.02",
        regionName: "Kabupaten Ponorogo",
        questionCount: 3,
        questionType: "mixed",
      }),
    });

    const json = await res.json();
    console.log("API Response Status:", res.status, "Model Used:", json.modelUsed);
    assert.equal(res.status, 200, "Status must be 200");
    assert.ok(json.success, "Response must be success");
    const questionsList = json.data?.questions || json.data;
    assert.ok(Array.isArray(questionsList), "Data must contain an array of questions");
    assert.equal(questionsList.length, 3, "Must return exactly 3 questions (not 13, not 1)");

    // Check each question for non-empty explanation & rubric
    for (let i = 0; i < questionsList.length; i++) {
      const q = questionsList[i];
      assert.ok(q.question_text && q.question_text.length > 10, `Q${i + 1} text must exist`);
      assert.ok(q.explanation && q.explanation.length > 5, `Q${i + 1} explanation must NOT be empty`);
      if (q.type === "essay") {
        assert.ok(q.rubric && q.rubric.length > 5, `Q${i + 1} essay rubric must NOT be empty`);
      }
      console.log(`  ✓ Q${i + 1} (${q.type}): "${q.question_text.slice(0, 60)}..."`);
      console.log(`    Explanation: ${q.explanation.slice(0, 50)}...`);
      if (q.rubric) console.log(`    Rubric: ${q.rubric.slice(0, 50)}...`);
    }

    // Save to repository and verify reload persistence
    const savedQuestion = repository.saveQuestion({
      id: `q-live-test-${Date.now()}`,
      school_id: "sch-ponorogo-01",
      teacher_id: "usr-teacher-01",
      subject: "Matematika",
      grade: 5,
      topic: "Pecahan dan Gotong Royong Ponorogo",
      type: "mixed",
      is_contextualized: true,
      items: questionsList,
    });

    const reloaded = repository.getQuestionById(savedQuestion.id);
    assert.ok(reloaded, "Question must persist in repository");
    assert.equal(reloaded?.items?.length, 3, "Reloaded question must have 3 items");
    assert.equal(reloaded?.items?.[0].explanation, questionsList[0].explanation);
    console.log("  ✓ Persistence verified: Saved and reloaded successfully.\n");
    results["Manual Soal"] = "PASS";
  } catch (err: any) {
    console.error("  ✖ Manual Soal Failed:", err.message);
    results["Manual Soal"] = "FAIL";
  }

  // -------------------------------------------------------------------------
  // 2. WORKFLOW: MANUAL MATERI -> REAL AI CONTEXTUALIZE -> PERSISTENCE
  // -------------------------------------------------------------------------
  console.log(">>> [2/10] Testing Real Manual Materi via /api/ai/contextualize...");
  try {
    const rawMateriText = `Pada ekosistem sawah terdapat produsen yaitu padi, konsumen tingkat satu seperti belalang dan tikus, serta predator puncak seperti burung hantu dan elang. Rantai makanan menjaga populasi hama tetap seimbang.`;

    const res = await fetch(`${BASE_URL}/api/ai/contextualize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "material",
        inputMode: "manual",
        rawText: rawMateriText,
        title: "Ekosistem Sawah dan Rantai Makanan",
        subject: "IPAS (Ilmu Pengetahuan Alam & Sosial)",
        grade: 5,
        regionId: "35.02",
        regionName: "Kabupaten Ponorogo",
      }),
    });

    const json = await res.json();
    console.log("API Response Status:", res.status, "Model Used:", json.modelUsed);
    assert.equal(res.status, 200, "Status must be 200");
    assert.ok(json.success, "Response must be success");
    assert.ok(json.data.content && json.data.content.length > 50, "Materi content must be rich");
    assert.ok(json.data.context_variables && json.data.context_variables.length > 0, "Must have local context variables");
    console.log("  ✓ Material Content Preview:", json.data.content.slice(0, 100) + "...");
    console.log("  ✓ Context Variables:", json.data.context_variables.map((cv: any) => `${cv.original_term} -> ${cv.replacement_term}`).join(", "));

    // Save to repository and verify reload persistence
    const savedMaterial = repository.saveMaterial({
      id: `mat-live-test-${Date.now()}`,
      school_id: "sch-ponorogo-01",
      teacher_id: "usr-teacher-01",
      title: json.data.title || "Ekosistem Sawah Ponorogo",
      subject: "IPAS",
      grade: 5,
      content: json.data.content,
      context_variables: json.data.context_variables,
      is_contextualized: true,
      validation: { is_valid: true, local_context_grounded: true, competency_preserved: true },
    });

    const reloaded = repository.getMaterialById(savedMaterial.id);
    assert.ok(reloaded, "Material must persist in repository");
    assert.equal(reloaded?.title, savedMaterial.title);
    assert.equal(reloaded?.is_contextualized, true);
    console.log("  ✓ Persistence verified: Saved and reloaded successfully.\n");
    results["Manual Materi"] = "PASS";
  } catch (err: any) {
    console.error("  ✖ Manual Materi Failed:", err.message);
    results["Manual Materi"] = "FAIL";
  }

  // -------------------------------------------------------------------------
  // 3. WORKFLOW: GENERATE AI MATERI
  // -------------------------------------------------------------------------
  console.log(">>> [3/10] Testing Real Generate AI Materi...");
  try {
    const res = await fetch(`${BASE_URL}/api/ai/contextualize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "material",
        inputMode: "ai",
        prompt: "Buatkan modul ajar IPAS Kelas 5 tentang kearifan lokal pengelolaan air di Ponorogo untuk pertanian porang.",
        subject: "IPAS",
        grade: 5,
        regionId: "35.02",
        regionName: "Kabupaten Ponorogo",
      }),
    });

    const json = await res.json();
    assert.equal(res.status, 200);
    assert.ok(json.success);
    assert.ok(json.data.content.length > 100);
    console.log("  ✓ AI Generated Materi Preview:", json.data.content.slice(0, 120) + "...");
    results["Generate Materi"] = "PASS";
  } catch (err: any) {
    console.error("  ✖ Generate AI Materi Failed:", err.message);
    results["Generate Materi"] = "FAIL";
  }

  // -------------------------------------------------------------------------
  // 4. WORKFLOW: GENERATE AI SOAL
  // -------------------------------------------------------------------------
  console.log("\n>>> [4/10] Testing Real Generate AI Soal...");
  try {
    const res = await fetch(`${BASE_URL}/api/ai/contextualize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "question",
        inputMode: "ai",
        prompt: "Buatkan 2 butir soal Matematika Kelas 5 tentang perhitungan hasil panen padi dan porang di Ponorogo.",
        subject: "Matematika",
        grade: 5,
        regionId: "35.02",
        regionName: "Kabupaten Ponorogo",
        questionCount: 2,
        questionType: "multiple_choice",
      }),
    });

    const json = await res.json();
    assert.equal(res.status, 200);
    assert.ok(json.success);
    const questions = json.data?.questions || json.data;
    assert.ok(Array.isArray(questions) && questions.length >= 2);
    assert.ok(questions[0].explanation && questions[0].explanation.length > 5);
    console.log("  ✓ AI Generated Question 1:", questions[0].question_text.slice(0, 80) + "...");
    console.log("  ✓ Options:", questions[0].options?.map((o: any) => `${o.key}: ${o.text}`).join(" | "));
    console.log("  ✓ Correct Answer:", questions[0].correct_answer);
    results["Generate Soal"] = "PASS";
  } catch (err: any) {
    console.error("  ✖ Generate AI Soal Failed:", err.message);
    results["Generate Soal"] = "FAIL";
  }

  // -------------------------------------------------------------------------
  // 5. WORKFLOW: REAL PDF EXTRACTION & PIPELINE
  // -------------------------------------------------------------------------
  console.log("\n>>> [5/10] Testing PDF Text Extraction Pipeline...");
  try {
    // Generate valid text PDF in-memory using PDF format
    const sampleText = "Asesmen Sumatif Tengah Semester Kelas 5 SD Ponorogo: Hubungan Produsen Padi dan Konsumen di Sawah.";
    const pdfContent = `%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<</Font<</F1 4 0 R>>>>/Contents 5 0 R>>endobj\n4 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\n5 0 obj<</Length ${sampleText.length + 30}>>stream\nBT /F1 12 Tf 50 700 Td (${sampleText}) Tj ET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f\n0000000010 00000 n\n0000000053 00000 n\n0000000102 00000 n\n0000000200 00000 n\n0000000262 00000 n\ntrailer<</Size 6/Root 1 0 R>>\nstartxref\n360\n%%EOF`;
    const pdfBuffer = Buffer.from(pdfContent);

    const parsed = await extractTextFromPdfBuffer(pdfBuffer);
    console.log("  ✓ Native PDF Text Extracted:", JSON.stringify(parsed.text));
    assert.ok(parsed.text.includes("Ponorogo"), "Native PDF extraction must retrieve Ponorogo text");

    // Also test through /api/ai/extract endpoint with base64 payload
    const extractRes = await fetch(`${BASE_URL}/api/ai/extract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        base64Data: pdfBuffer.toString("base64"),
        mimeType: "application/pdf",
        fileName: "soal-evaluasi-ponorogo.pdf",
      }),
    });
    const extractJson = await extractRes.json();
    assert.equal(extractRes.status, 200, "Extract endpoint must return 200");
    assert.ok(extractJson.success, "Extract endpoint must succeed");
    assert.ok(extractJson.extractedText.includes("Ponorogo"), "Extracted text must match");
    console.log("  ✓ /api/ai/extract API Succeeded: mode =", extractJson.extractionMode);
    results["PDF Extraction"] = "PASS";
  } catch (err: any) {
    console.error("  ✖ PDF Extraction Failed:", err.message);
    results["PDF Extraction"] = "FAIL";
  }

  // -------------------------------------------------------------------------
  // 6. WORKFLOW: ROOM LIFECYCLE, STUDENT ATTEMPT, SUBMISSION & TEACHER RESULTS
  // -------------------------------------------------------------------------
  console.log("\n>>> [6/10] Testing Room Creation -> Student Access -> Submission -> Grading -> Teacher Results...");
  try {
    // 1. Create a question and a material
    const testQ = repository.saveQuestion({
      id: `q-room-flow-${Date.now()}`,
      school_id: "sch-ponorogo-01",
      teacher_id: "usr-teacher-01",
      subject: "Matematika",
      grade: 5,
      topic: "Uji Kompetensi Aritmetika",
      type: "mixed",
      items: [
        {
          id: `item-mc-1`,
          type: "multiple_choice",
          question_text: "Berapa 10 + 15?",
          options: [
            { key: "A", text: "20" },
            { key: "B", text: "25" },
            { key: "C", text: "30" },
            { key: "D", text: "35" },
          ],
          correct_answer: "B",
          explanation: "10 + 15 = 25.",
        },
        {
          id: `item-es-1`,
          type: "essay",
          question_text: "Jelaskan mengapa 10 + 15 = 25!",
          correct_answer: "Penjumlahan nilai satuan 0+5=5 dan puluhan 1+1=2 menghasilkan 25.",
          rubric: "Skor 10 jika menjelaskan nilai tempat puluhan dan satuan secara tepat.",
          explanation: "Konsep dasar nilai tempat bilangan bulat.",
        },
      ],
    });

    const testM = repository.saveMaterial({
      id: `mat-room-flow-${Date.now()}`,
      school_id: "sch-ponorogo-01",
      teacher_id: "usr-teacher-01",
      title: "Materi Belajar Hitung Penjumlahan",
      subject: "Matematika",
      grade: 5,
      content: "Penjumlahan adalah operasi matematika dasar yang menggabungkan dua kelompok bilangan.",
    });

    // 2. Teacher creates room with Material + Question
    const room = repository.createRoom({
      title: "Ruang Uji Coba Matematika Kelas 5",
      subject: "Matematika",
      grade: 5,
      teacher_id: "usr-teacher-01",
      teacher_name: "Ibu Siti Aminah",
      school_id: "sch-ponorogo-01",
      resource_id: testQ.id,
      secondary_resource_id: testM.id,
    });
    console.log("  ✓ Room Created:", room.id, "Code:", room.code);
    assert.ok(room.code && room.code.length > 0, "Room must have valid code");
    assert.ok(room.question_snapshot, "Room must capture immutable question snapshot");
    assert.ok(room.material_snapshot, "Room must capture immutable material snapshot");

    // 3. Student joins room
    const loadedRoom = repository.getRoomByCode(room.code);
    assert.ok(loadedRoom, "Room must be retrievable by code");
    console.log("  ✓ Student joined room:", loadedRoom?.title);

    // 4. Student enters room and completes interaction
    repository.recordRoomVisit(room.code, "Ahmad Dahlan", 90);
    const roomWithVisitor = repository.getRoomByCode(room.code);
    assert.ok(roomWithVisitor?.visitors?.some((v) => v.name === "Ahmad Dahlan" && v.score === 90));
    console.log("  ✓ Student visited & completed room! Recorded score: 90");

    // 5. Formal examination attempt & teacher essay grading
    const exam = repository.getExam("exam-pnr-01");
    if (exam) {
      const attempt = repository.startAttempt(exam.id, "usr-student-e2e-01", "Ahmad Dahlan");
      repository.saveAnswer(attempt.id, "q-pnr-01", "B");
      repository.saveAnswer(attempt.id, "q-pnr-02", "B");
      const submitted = repository.submitAttempt(attempt.id);
      assert.ok(submitted);
      const graded = repository.gradeEssay(attempt.id, 35, "Uraian sangat baik!");
      assert.equal(graded?.essay_score, 35);
      console.log("  ✓ Examination Attempt auto-graded & essay reviewed: Score =", graded?.score);
    }

    // 6. Verify snapshot immutability when original content is archived/deleted
    repository.deleteQuestion(testQ.id);
    repository.deleteMaterial(testM.id);
    const postDeleteRoom = repository.getRoomByCode(room.code);
    assert.ok(postDeleteRoom, "Room must remain completely intact after original content deletion");
    assert.ok(postDeleteRoom?.question_snapshot, "Question snapshot must remain preserved");
    assert.ok(postDeleteRoom?.material_snapshot, "Material snapshot must remain preserved");
    assert.ok(postDeleteRoom?.visitors && postDeleteRoom.visitors.length > 0, "Historical student results must NOT be lost");
    console.log("  ✓ Room Snapshot Immutability verified: Deletion of source content protected historical data.\n");
    results["Room & Student Flow"] = "PASS";
  } catch (err: any) {
    console.error("  ✖ Room & Student Flow Failed:", err.message);
    results["Room & Student Flow"] = "FAIL";
  }

  // -------------------------------------------------------------------------
  // 7. WORKFLOW: AI CREDENTIAL FAILOVER CASCADE (5 KEYS)
  // -------------------------------------------------------------------------
  console.log(">>> [7/10] Testing AI Credential Failover Cascade across 5 slots...");
  try {
    const creds = adminRepository.listCredentials();
    console.log("  Total Credential Slots in Admin Pool:", creds.length);
    assert.ok(creds.length >= 5, "Must have at least 5 credential slots");

    // Test priority ordering
    for (let i = 0; i < creds.length - 1; i++) {
      assert.ok(creds[i].priority <= creds[i + 1].priority, "Slots must be priority-ordered");
    }
    console.log("  ✓ Slot Priorities: " + creds.map(c => `#${c.priority} (${c.name})`).join(" -> "));

    // Simulate Slot 1 failure (simulate rate-limiting / quota exhausted)
    const slot1 = creds[0];
    adminRepository.updateCredential(slot1.id, {
      circuit_state: "OPEN",
      health_status: "rate_limited",
      last_error: "429 Quota Exceeded (Simulated)",
    });

    const activeCredAfterFail1 = aiProviderManager.getAvailableCredential();
    assert.notEqual(activeCredAfterFail1?.id, slot1.id, "Failover must bypass rate-limited Slot 1");
    console.log(`  ✓ Slot 1 Rate Limited -> Failover routed to: ${activeCredAfterFail1?.name}`);

    // Restore Slot 1
    adminRepository.updateCredential(slot1.id, {
      circuit_state: "CLOSED",
      health_status: "healthy",
      last_error: null,
    });
    console.log("  ✓ Slot 1 circuit breaker restored.\n");
    results["API Fallback"] = "PASS";
  } catch (err: any) {
    console.error("  ✖ AI Credential Failover Failed:", err.message);
    results["API Fallback"] = "FAIL";
  }

  // -------------------------------------------------------------------------
  // 8. WORKFLOW: ERROR STATE HANDLING (NO FAKE TEMPLATES)
  // -------------------------------------------------------------------------
  console.log(">>> [8/10] Testing Error Handling Contracts (No Fake Templates)...");
  try {
    // 1. Empty prompt rejection
    const emptyRes = await fetch(`${BASE_URL}/api/ai/contextualize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "question", rawText: "" }),
    });
    const emptyJson = await emptyRes.json();
    assert.equal(emptyRes.status, 400);
    assert.equal(emptyJson.success, false);
    assert.equal(emptyJson.error.code, "INPUT_INVALID");
    console.log("  ✓ Empty input rejected cleanly: code =", emptyJson.error.code);

    // 2. Corrupt PDF rejection
    const corruptPdfRes = await fetch(`${BASE_URL}/api/ai/extract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        base64Data: Buffer.from("this is definitely not a valid pdf file").toString("base64"),
        mimeType: "application/pdf",
        fileName: "broken.pdf",
      }),
    });
    const corruptJson = await corruptPdfRes.json();
    assert.equal(corruptJson.success, false);
    assert.ok(corruptJson.error.code === "PDF_EXTRACTION_FAILED" || corruptJson.error.code === "OCR_FAILED");
    assert.ok(!corruptJson.extractedText, "Must NEVER return dummy/fake text on extraction failure");
    console.log("  ✓ Corrupt PDF rejected cleanly: code =", corruptJson.error.code);
    results["Error Handling"] = "PASS";
  } catch (err: any) {
    console.error("  ✖ Error Handling Failed:", err.message);
    results["Error Handling"] = "FAIL";
  }

  // -------------------------------------------------------------------------
  // SUMMARY MATRIX
  // -------------------------------------------------------------------------
  console.log("\n============================================================");
  console.log("REAL SYSTEM AUDIT & E2E RESULTS SUMMARY");
  console.log("============================================================");
  console.table(results);
}

runRealSystemVerification().catch(console.error);
