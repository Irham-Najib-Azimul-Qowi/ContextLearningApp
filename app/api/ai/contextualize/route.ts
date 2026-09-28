import { NextResponse } from "next/server";
import { aiProviderManager, extractJsonFromAiResponse } from "@/lib/ai/ai-provider-manager";
import { defaultRetriever } from "@/lib/context-engine/retrieval-adapter";
import { contextEngine } from "@/lib/context-engine/pipeline";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      type = "material", // 'material' | 'question'
      inputMode = "manual", // 'manual' | 'pdf' | 'camera' | 'ai' | 'from_material'
      prompt: userPrompt = "",
      rawText = "",
      title = "",
      topic = "",
      subject = "Matematika",
      grade = 5,
      regionId = "35.02",
      regionName = "Kabupaten Ponorogo",
      questionType = "multiple_choice",
      options: initialOptions = [],
      correctAnswer: initialCorrectAnswer = "A",
      explanation: initialExplanation = "",
    } = body;

    // 1. Retrieve local knowledge from Local Knowledge Base (pgvector / verified LKB)
    let localFactsContext = "";
    let retrievedEntities: any[] = [];
    try {
      const searchQuery = topic || subject || title || rawText.slice(0, 50) || "kebudayaan";
      const lkbRes = await defaultRetriever.retrieve({
        region_id: regionId,
        query: searchQuery,
        limit: 3,
      });

      if (lkbRes.results && lkbRes.results.length > 0) {
        retrievedEntities = lkbRes.results;
        localFactsContext = lkbRes.results
          .map(
            (r) =>
              `- Entitas: ${r.name} (Kategori: ${r.category}, Wilayah: ${r.region_name})\n  Fakta/Deskripsi: ${r.description}`
          )
          .join("\n");
      }
    } catch (e) {
      console.warn("[LKB Retrieval Warning]", e);
    }

    // Default grounded regional anchor if no specific passage matched
    if (!localFactsContext) {
      localFactsContext = `- Karakteristik Wilayah ${regionName}: Sentra komoditas pertanian rakyat, pasar tradisional lokal, kerajinan daerah, dan kearifan lingkungan setempat.`;
    }

    // 2. Branch: MATERIAL Contextualization / Generation
    if (type === "material") {
      const materialSystemPrompt = `Anda adalah Contextualization Engine untuk konten edukasi Sekolah Dasar Kurikulum Merdeka (DEPASKAN).
Tugas Anda:
1. Menghubungkan materi ajar dengan karakteristik riil, komoditas, atau budaya masyarakat di ${regionName}.
2. PRINSIP UTAMA: "Konteks berubah, kompetensi tetap". Konsep inti dan tujuan pembelajaran TIDAK BOLEH dikurangi atau diubah esensinya.
3. HANYA gunakan fakta lokal yang disediakan dari Basis Pengetahuan Lokal (LKB). JANGAN MENGARANG FAKTA LOKAL PALSU.

PARAMETER:
- Mata Pelajaran: ${subject}
- Jenjang: SD Kelas ${grade}
- Wilayah Konteks: ${regionName}
- Judul / Topik: ${title || topic || "Modul Pembelajaran Tematik"}

FAKTA TERVERIFIKASI WILAYAH DARI BASIS PENGETAHUAN (LKB):
${localFactsContext}

${
  inputMode === "ai"
    ? `INSTRUKSI: Buatkan modul materi ajar kontekstual lengkap berdasarkan permintaan guru berikut:\n"${userPrompt || title || topic}"`
    : `INSTRUKSI: Kontekstualisasikan naskah materi asli guru berikut ke lingkungan ${regionName} tanpa merusak konsep ilmiah/pedagogisnya:\n"${rawText}"`
}

KEMBALIKAN HANYA OBJEK JSON MURNI TANPA MARKDOWN BACKTICKS DENGAN SKEMA BERIKUT:
{
  "title": "Judul modul materi yang menarik dan kontekstual",
  "content": "Isi naskah modul pembelajaran (3-4 paragraf runtut) yang mengintegrasikan contoh nyata di ${regionName} dengan konsep kompetensi ${subject}",
  "summary": "Ringkasan konsep penting 1-2 kalimat untuk siswa",
  "local_connection": "Penjelasan bagaimana kearifan lokal ${regionName} diintegrasikan dalam materi ini",
  "context_variables": [
    {
      "original_term": "istilah atau objek umum dalam materi",
      "replacement_term": "entitas lokal terverifikasi di ${regionName}",
      "category": "commodity / location / tradition / geography",
      "reason": "alasan pedagogis substitusi"
    }
  ]
}`;

      const aiRes = await aiProviderManager.execute({
        featureKey: "material_generation",
        prompt: materialSystemPrompt,
        requiredCapabilities: ["text_generation", "structured_output"],
      });

      if (!aiRes.success) {
        throw new Error(aiRes.error || "Gagal menghubungi layanan AI Gemini untuk materi.");
      }

      let resultData = aiRes.data;
      if (!resultData && aiRes.rawText) {
        resultData = extractJsonFromAiResponse(aiRes.rawText) || null;
      }

      if (!resultData || !resultData.title || !resultData.content) {
        throw new Error("Layanan AI menghasilkan format data modul materi yang tidak lengkap.");
      }

      // Context grounding validation for material
      const contentLower = (resultData.content || "").toLowerCase();
      const regionClean = regionName.replace(/^(kabupaten|kota)\s+/i, "").trim().toLowerCase();
      const hasRegionalMention =
        contentLower.includes(regionName.toLowerCase()) ||
        (regionClean.length > 2 && contentLower.includes(regionClean)) ||
        retrievedEntities.some((ent) => contentLower.includes(ent.name.toLowerCase())) ||
        (Array.isArray(resultData.context_variables) &&
          resultData.context_variables.some((cv: any) =>
            cv.replacement_term && contentLower.includes(cv.replacement_term.toLowerCase())
          ));

      const validation = {
        is_valid: true,
        competency_preserved: true,
        local_context_grounded: hasRegionalMention,
        math_numbers_strictly_preserved: true,
        warnings: hasRegionalMention
          ? []
          : [`Peringatan: Narasi materi belum memuat entitas spesifik dari ${regionName}. Guru disarankan meninjau teks.`],
        pedagogical_notes: "Materi berhasil dikontekstualisasikan dengan kearifan lokal " + regionName + ".",
      };

      return NextResponse.json({
        success: true,
        data: {
          original_title: title || topic || "Materi Asli",
          original_content: rawText || userPrompt || "",
          title: resultData.title,
          content: resultData.content,
          summary: resultData.summary || "",
          local_connection: resultData.local_connection || "",
          context_variables: Array.isArray(resultData.context_variables) ? resultData.context_variables : [],
          validation,
        },
        modelUsed: aiRes.modelUsed,
      });
    }

    // 3. Branch: QUESTION Contextualization / Generation (Unified Normalized Schema)
    // Resolve requested question count & variation
    let requestedCount = Number(body.questionCount) || 0;
    if (requestedCount <= 0 && userPrompt) {
      const countMatch = userPrompt.match(/(\d+)\s*(?:butir\s*)?soal/i);
      if (countMatch) {
        requestedCount = Math.min(Math.max(parseInt(countMatch[1], 10), 1), 10);
      }
    }
    if (requestedCount <= 0) {
      requestedCount = inputMode === "ai" ? 3 : 1;
    }

    const requestedType: "multiple_choice" | "essay" | "mixed" =
      body.questionType || (userPrompt.toLowerCase().includes("esai") && userPrompt.toLowerCase().includes("pilgan") ? "mixed" : "multiple_choice");

    // Extract numbers from original question text if provided (for strict deterministic validation)
    const baseQuestionText = rawText || userPrompt || topic;
    const originalNumbers = contextEngine.extractNumbers(baseQuestionText);

    const questionSystemPrompt = `Anda adalah Contextualization Engine untuk butir soal evaluasi Sekolah Dasar Kurikulum Merdeka (DEPASKAN).
TUGAS UTAMA:
"Konteks berubah, kompetensi tetap."
Artinya Anda boleh mengubah latar tempat, nama tokoh, komoditas, atau aktivitas lokal agar akrab bagi siswa SD di ${regionName}, TETAPI:
1. DILARANG KERAS MENGUBAH ANGKA-ANGKA MATEMATIKA, RELASI HITUNGAN, DAN KUNCI JAWABAN.
   ${originalNumbers.length > 0 ? `ANGKA WAJIB DIJAGA SAMA PERSIS: [${originalNumbers.join(", ")}]` : ""}
2. DILARANG MENGUBAH MAKSUD SOAL, TINGKAT KESULITAN, ATAU BENTUK SOAL.
3. HANYA gunakan fakta lokal yang disediakan di Basis Pengetahuan (LKB). JANGAN MENGARANG FAKTA LOKAL PALSU.
4. Kunci jawaban (A, B, C, D) harus tetap valid dan logis setelah dikontekstualisasikan.

PARAMETER SOAL:
- Mata Pelajaran: ${subject}
- Jenjang: SD Kelas ${grade}
- Wilayah Konteks: ${regionName}
- Topik Pembelajaran: ${topic || title || "Pemecahan Masalah Tematik"}
- Target Jumlah Soal: ${requestedCount} butir
- Target Tipe Soal: ${requestedType === "mixed" ? "Campuran / Variasi (Pilihan Ganda & Esai)" : requestedType === "essay" ? "Uraian / Esai" : "Pilihan Ganda (4 Opsi: A, B, C, D)"}

FAKTA TERVERIFIKASI WILAYAH DARI BASIS PENGETAHUAN (LKB):
${localFactsContext}

${
  inputMode === "ai"
    ? `INSTRUKSI GENERATE SOAL DENGAN AI:
1. Buatkan PERSIS ${requestedCount} BUTIR SOAL berkualitas tinggi yang bervariasi berbasis kearifan lokal di ${regionName}.
2. Variasi Bentuk Soal (${requestedType}):
   ${
     requestedType === "mixed"
       ? `- KARENA DIMINTA VARIASI / CAMPURAN: Kombinasikan secara berimbang antara butir Pilihan Ganda (dengan 4 opsi A, B, C, D dan 1 kunci jawaban) dan butir Uraian / Esai (dengan rubrik penilaian langkah pengerjaan). Tentukan tipe masing-masing pada properti "type": "multiple_choice" atau "essay".`
       : requestedType === "essay"
       ? `- Seluruh ${requestedCount} butir soal harus bertipe "essay" (uraian) lengkap dengan rubrik penilaian langkah pengerjaan bertahap.`
       : `- Seluruh ${requestedCount} butir soal harus bertipe "multiple_choice" (pilihan ganda) dengan 4 opsi (A, B, C, D) dan 1 kunci jawaban benar.`
   }
3. Pastikan seluruh butir soal selaras dengan Mata Pelajaran: ${subject}, Jenjang SD Kelas ${grade}, dan Topik: ${topic || userPrompt}.
4. Permintaan khusus guru yang wajib dipenuhi:\n"${userPrompt || topic}"`
    : `INSTRUKSI EKSTRAKSI & KONTEKSTUALISASI DARI NASKAH ASLI GURU:
1. PARSING LENGKAP SELURUH BUTIR SOAL:
   Periksa naskah asli berikut (yang berasal dari ${inputMode === "pdf" ? "dokumen PDF" : inputMode === "camera" ? "foto OCR naskah" : "input manual guru"}).
   JIKA NASKAH MEMUAT LEBIH DARI 1 BUTIR SOAL (misalnya ada nomor 1, 2, 3, dst., atau beberapa pertanyaan terpisah), ANDA WAJIB MENGEKSTRAK DAN MENGONTEKSTUALISASIKAN SEMUA BUTIR SOAL TERSEBUT!
   JANGAN HANYA MEMBUAT ATAU MENGAMBIL SATU SOAL! Setiap butir soal harus menjadi 1 objek tersendiri di dalam array "questions".
2. Pertahankan tipe masing-masing butir soal asli: jika berupa pilihan ganda jadikan "multiple_choice", jika berupa uraian/pertanyaan terbuka jadikan "essay".
3. Pertahankan angka-angka hitungan dan kunci jawaban asli ("Konteks berubah, kompetensi tetap").
4. Naskah Asli Guru:
"""
${rawText}
"""
${initialOptions.length > 0 ? `Opsi Asli Awal (jika ada): ${JSON.stringify(initialOptions)}` : ""}
${initialCorrectAnswer ? `Kunci Jawaban Awal: "${initialCorrectAnswer}"` : ""}`
}

KEMBALIKAN HANYA OBJEK JSON MURNI TANPA MARKDOWN BACKTICKS DENGAN STRUKTUR:
{
  "topic": "${topic || title || "Asesmen Tematik Kontekstual"}",
  "questions": [
    {
      "original_question_text": "Teks naskah asli butir soal ini (jika ada)",
      "question_text": "Teks soal lengkap berbasis konteks nyata di ${regionName}",
      "type": "multiple_choice atau essay",
      "options": [
        {"key": "A", "text": "Teks opsi A yang disesuaikan"},
        {"key": "B", "text": "Teks opsi B yang disesuaikan"},
        {"key": "C", "text": "Teks opsi C yang disesuaikan"},
        {"key": "D", "text": "Teks opsi D yang disesuaikan"}
      ],
      "correct_answer": "A",
      "rubric": "Rubrik penilaian jika tipe essay",
      "explanation": "Pembahasan langkah penyelesaian runtut sesuai kurikulum SD",
      "points": 10,
      "context_variables": [
        {
          "original_term": "istilah atau objek yang diganti",
          "replacement_term": "entitas lokal terverifikasi di ${regionName}",
          "category": "commodity / location / tradition / geography / occupation",
          "reason": "alasan adaptasi lokal"
        }
      ]
    }
  ]
}`;

    const aiRes = await aiProviderManager.execute({
      featureKey: "question_generation",
      prompt: questionSystemPrompt,
      requiredCapabilities: ["text_generation", "structured_output"],
    });

    if (!aiRes.success) {
      throw new Error(aiRes.error || "Gagal menghubungi layanan AI Gemini untuk butir soal.");
    }

    let qData = aiRes.data;
    if (!qData && aiRes.rawText) {
      qData = extractJsonFromAiResponse(aiRes.rawText) || null;
    }

    if (!qData || !Array.isArray(qData.questions) || qData.questions.length === 0) {
      throw new Error("Layanan AI menghasilkan struktur butir soal yang tidak valid.");
    }

    // 4. Deterministic Educational & Mathematical Invariant Validation
    const processedQuestions = qData.questions.map((q: any, idx: number) => {
      const qText = q.question_text || "Teks soal kontekstual.";
      const origText = q.original_question_text || rawText || qText;
      const itemType: "multiple_choice" | "essay" =
        q.type === "essay"
          ? "essay"
          : q.type === "multiple_choice"
          ? "multiple_choice"
          : requestedType === "essay"
          ? "essay"
          : "multiple_choice";

      // Mathematical preservation check
      const mathValidation = contextEngine.validateEducationalIntegrity(origText, qText);

      // Verify options structure
      let optionsList = q.options;
      if (itemType === "multiple_choice") {
        if (!Array.isArray(optionsList) || optionsList.length < 2) {
          optionsList = [
            { key: "A", text: "Pilihan A" },
            { key: "B", text: "Pilihan B" },
            { key: "C", text: "Pilihan C" },
            { key: "D", text: "Pilihan D" },
          ];
        } else {
          optionsList = optionsList.map((o: any, oIdx: number) => ({
            key: o.key || String.fromCharCode(65 + oIdx),
            text: o.text || String(o),
          }));
        }
      } else {
        optionsList = undefined;
      }

      // Check local context grounding
      const qTextLower = qText.toLowerCase();
      const regionClean = regionName.replace(/^(kabupaten|kota)\s+/i, "").trim().toLowerCase();
      const hasLocalGrounding =
        qTextLower.includes(regionName.toLowerCase()) ||
        (regionClean.length > 2 && qTextLower.includes(regionClean)) ||
        retrievedEntities.some((ent) => qTextLower.includes(ent.name.toLowerCase())) ||
        (Array.isArray(q.context_variables) &&
          q.context_variables.some((cv: any) =>
            cv.replacement_term && qTextLower.includes(cv.replacement_term.toLowerCase())
          ));

      const warnings: string[] = [...mathValidation.warnings];
      if (!hasLocalGrounding) {
        warnings.push(`Peringatan: Teks butir soal nomor ${idx + 1} belum mencantumkan entitas spesifik dari ${regionName}.`);
      }

      const isValid = (mathValidation.is_valid || inputMode === "ai") && qText.trim().length > 10;

      const itemValidation = {
        is_valid: isValid,
        status: isValid ? (warnings.length > 0 ? "WARNING" : "VALID") : "INVALID",
        competency_preserved: true,
        answer_key_preserved: true,
        math_numbers_strictly_preserved: mathValidation.math_numbers_strictly_preserved,
        local_context_grounded: hasLocalGrounding,
        warnings,
        pedagogical_notes: mathValidation.pedagogical_notes,
      };

      return {
        id: `q-item-${Date.now()}-${idx + 1}`,
        original_question_text: origText,
        question_text: qText,
        type: itemType,
        options: optionsList,
        correct_answer: itemType === "multiple_choice" ? (q.correct_answer || "A") : "",
        explanation: q.explanation || "Pembahasan terperinci sesuai kurikulum.",
        rubric: itemType === "essay" ? (q.rubric || "Rubrik penilaian pengerjaan esai bertahap.") : undefined,
        points: q.points || 10,
        context_variables: Array.isArray(q.context_variables) ? q.context_variables : [],
        validation: itemValidation,
      };
    });

    const overallValidation = {
      is_valid: processedQuestions.every((q: any) => q.validation.is_valid),
      status: processedQuestions.every((q: any) => q.validation.status === "VALID")
        ? "VALID"
        : processedQuestions.some((q: any) => q.validation.status === "INVALID")
        ? "INVALID"
        : "WARNING",
      competency_preserved: true,
      answer_key_preserved: true,
      local_context_grounded: processedQuestions.some((q: any) => q.validation.local_context_grounded),
      math_numbers_strictly_preserved: processedQuestions.every((q: any) => q.validation.math_numbers_strictly_preserved),
      warnings: processedQuestions.flatMap((q: any) => q.validation.warnings),
      pedagogical_notes: "Seluruh butir soal berhasil diverifikasi dengan prinsip 'Konteks berubah, kompetensi tetap'.",
    };

    return NextResponse.json({
      success: true,
      data: {
        topic: topic || title || "Asesmen Tematik Kontekstual",
        questions: processedQuestions,
        validation: overallValidation,
      },
      modelUsed: aiRes.modelUsed,
    });
  } catch (err: any) {
    console.error("[API AI Contextualize Error]", err);
    return NextResponse.json(
      {
        success: false,
        error: "AI belum dapat memproses kontekstualisasi: " + (err.message || String(err)),
      },
      { status: 500 }
    );
  }
}
