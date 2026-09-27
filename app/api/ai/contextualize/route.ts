import { NextResponse } from "next/server";
import { aiProviderManager } from "@/lib/ai/ai-provider-manager";
import { defaultRetriever } from "@/lib/context-engine/retrieval-adapter";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      type = "material", // 'material' | 'question'
      inputMode = "manual", // 'manual' | 'pdf' | 'camera' | 'ai'
      prompt: userPrompt = "",
      rawText = "",
      title = "",
      topic = "",
      subject = "Matematika",
      grade = 5,
      regionId = "35.02",
      regionName = "Kabupaten Ponorogo",
      questionType = "multiple_choice",
    } = body;

    // 1. Retrieve local knowledge from LKB (pgvector / verified seed facts)
    let localFactsContext = "";
    try {
      const searchQuery = topic || subject || title || "kebudayaan";
      const lkbRes = await defaultRetriever.retrieve({
        region_id: regionId,
        query: searchQuery,
        limit: 2,
      });

      if (lkbRes.results && lkbRes.results.length > 0) {
        localFactsContext = lkbRes.results
          .map(
            (r) =>
              `- Entitas: ${r.name} (${r.region_name}, Kategori: ${r.category})\n  Deskripsi: ${r.description}`
          )
          .join("\n");
      }
    } catch (e) {
      console.warn("[LKB Retrieval Warning]", e);
    }

    if (!localFactsContext) {
      localFactsContext = `- Karakteristik Wilayah ${regionName}: Sentra komoditas lokal, pasar tradisional, budaya gotong royong, dan kearifan lokal setempat.`;
    }

    // 2. Branch: MATERIAL Contextualization
    if (type === "material") {
      const systemPrompt = `Anda adalah pakar kurikulum Merdeka Sekolah Dasar (SD) spesialisasi pembelajaran kontekstual berbasis kearifan lokal (DEPASKAN).
Tugas Anda adalah mengontekstualisasikan atau menyusun modul materi ajar untuk:
- Mata Pelajaran: ${subject}
- Jenjang: SD Kelas ${grade}
- Wilayah Konteks: ${regionName}
- Judul / Topik: ${title || topic || "Materi Tematik"}

Konteks Terverifikasi Wilayah dari Basis Pengetahuan (LKB):
${localFactsContext}

${
  inputMode === "ai"
    ? `Instruksi Khusus: Buatkan modul materi ajar berdasarkan prompt guru berikut:\n"${userPrompt || title}"`
    : `Instruksi Khusus: Kontekstualisasikan materi asli guru berikut dengan mengintegrasikan nilai-nilai, aktivitas ekonomi, atau budaya lokal ${regionName} tanpa merusak esensi kompetensi dasar:\n"${rawText}"`
}

KEMBALIKAN HANYA OBJEK JSON MURNI TANPA MARKDOWN BACKTICKS DENGAN STRUKTUR BERIKUT:
{
  "title": "Judul modul materi yang menarik dan kontekstual",
  "content": "Isi modul materi lengkap (3-4 paragraf) dengan narasi yang menghubungkan konsep pembelajaran dengan kehidupan nyata masyarakat di ${regionName}.",
  "summary": "Ringkasan konsep penting 1-2 kalimat untuk siswa",
  "local_connection": "Penjelasan bagaimana kearifan lokal ${regionName} diintegrasikan dalam materi ini"
}`;

      const aiRes = await aiProviderManager.execute({
        featureKey: "material_generation",
        prompt: systemPrompt,
        requiredCapabilities: ["text_generation", "structured_output"],
      });

      let resultData = aiRes.data;
      if (!resultData && aiRes.rawText) {
        try {
          const clean = aiRes.rawText.replace(/```json/g, "").replace(/```/g, "").trim();
          resultData = JSON.parse(clean);
        } catch {
          resultData = null;
        }
      }

      if (resultData && resultData.title && resultData.content) {
        return NextResponse.json({
          success: true,
          data: resultData,
          modelUsed: aiRes.modelUsed,
        });
      }

      // High-precision pedagogical fallback for material
      const fallbackMaterial = {
        title: title || `Modul Ajar Tematik ${subject} Berbasis Kearifan Lokal ${regionName}`,
        content: `Kawasan ${regionName} memiliki potensi komoditas pangan, kerajinan, dan kearifan lokal yang sangat kaya. Melalui bahan ajar kontekstual ini, peserta didik diajak menelaah aktivitas nyata para pengrajin dan pedagang lokal di ${regionName}.\n\nDalam kegiatan belajar ini, siswa tidak hanya mempelajari konsep abstrak, namun langsung diajak mengamati dan memecahkan persoalan yang relevan dengan lingkungan sekitar mereka, menumbuhkan rasa bangga terhadap budaya daerah.`,
        summary: `Pembelajaran kontekstual ${subject} kelas ${grade} yang memadukan kompetensi dasar dengan karakteristik khas ${regionName}.`,
        local_connection: `Mengangkat kearifan lokal dan denyut aktivitas ekonomi masyarakat ${regionName}.`,
      };

      return NextResponse.json({
        success: true,
        data: fallbackMaterial,
        isFallback: true,
      });
    }

    // 3. Branch: QUESTION Contextualization / Generation (Normalized Schema)
    const systemPromptQuestion = `Anda adalah pakar evaluasi pembelajaran Sekolah Dasar Kurikulum Merdeka (DEPASKAN).
Tugas Anda adalah menghasilkan butir soal yang telah dinormalisasi ke skema DEPASKAN untuk:
- Mata Pelajaran: ${subject}
- Jenjang: SD Kelas ${grade}
- Wilayah Konteks: ${regionName}
- Topik: ${topic || title || "Pemecahan Masalah Tematik"}
- Tipe Soal: ${questionType === "multiple_choice" ? "Pilihan Ganda (4 Opsi: A, B, C, D)" : "Uraian / Esai"}

Fakta Terverifikasi Wilayah dari Basis Pengetahuan (LKB):
${localFactsContext}

${
  inputMode === "ai"
    ? `Instruksi Khusus: Buatlah 1 butir soal berdasarkan prompt guru: "${userPrompt || topic}".`
    : `Instruksi Khusus: Kontekstualisasikan butir soal asli berikut agar berakar pada situasi nyata di ${regionName} dengan tetap menjaga tingkat kesulitan numerik/konseptual:\n"${rawText}"`
}

KEMBALIKAN HANYA OBJEK JSON MURNI TANPA MARKDOWN BACKTICKS DENGAN STRUKTUR BERIKUT:
{
  "questions": [
    {
      "question_text": "Teks soal lengkap berbasis konteks nyata di ${regionName}",
      "type": "${questionType}",
      ${
        questionType === "multiple_choice"
          ? `"options": [
        {"key": "A", "text": "Pilihan jawaban A"},
        {"key": "B", "text": "Pilihan jawaban B"},
        {"key": "C", "text": "Pilihan jawaban C"},
        {"key": "D", "text": "Pilihan jawaban D"}
      ],
      "correct_answer": "A",`
          : `"rubric": "Rubrik penilaian langkah pengerjaan dan skor maksimal esai",`
      }
      "explanation": "Pembahasan lengkap langkah penyelesaian dan kunci konsep pedagogis",
      "points": 10
    }
  ]
}`;

    const aiRes = await aiProviderManager.execute({
      featureKey: "question_generation",
      prompt: systemPromptQuestion,
      requiredCapabilities: ["text_generation", "structured_output"],
    });

    let qData = aiRes.data;
    if (!qData && aiRes.rawText) {
      try {
        const clean = aiRes.rawText.replace(/```json/g, "").replace(/```/g, "").trim();
        qData = JSON.parse(clean);
      } catch {
        qData = null;
      }
    }

    if (qData && Array.isArray(qData.questions) && qData.questions.length > 0) {
      const validated = qData.questions.map((q: any) => ({
        question_text: q.question_text || "Teks soal kontekstual.",
        type: questionType,
        options:
          questionType === "multiple_choice" && Array.isArray(q.options) && q.options.length >= 2
            ? q.options
            : [
                { key: "A", text: "Pilihan A" },
                { key: "B", text: "Pilihan B" },
                { key: "C", text: "Pilihan C" },
                { key: "D", text: "Pilihan D" },
              ],
        correct_answer: q.correct_answer || (questionType === "multiple_choice" ? "A" : ""),
        explanation: q.explanation || "Pembahasan terperinci sesuai kurikulum.",
        rubric: q.rubric || (questionType === "essay" ? "Rubrik penilaian esai komprehensif." : undefined),
        points: q.points || 10,
      }));

      return NextResponse.json({
        success: true,
        data: { questions: validated },
        modelUsed: aiRes.modelUsed,
      });
    }

    // High-precision fallback for question
    const fallbackQuestions = [
      questionType === "multiple_choice"
        ? {
            question_text: `Di sentra pasar tradisional ${regionName}, seorang pedagang menjual 3 paket komoditas lokal seharga Rp15.000 per paket. Jika seorang pembeli membayar dengan selembar uang Rp50.000, berapakah uang kembalian yang diterima pembeli?`,
            type: "multiple_choice",
            options: [
              { key: "A", text: "Rp5.000" },
              { key: "B", text: "Rp7.500" },
              { key: "C", text: "Rp10.000" },
              { key: "D", text: "Rp12.000" },
            ],
            correct_answer: "A",
            explanation: `Total belanja = 3 × Rp15.000 = Rp45.000. Uang bayar = Rp50.000. Kembalian = Rp50.000 - Rp45.000 = Rp5.000.`,
            points: 10,
          }
        : {
            question_text: `Di sentra kerajinan ${regionName}, pengrajin memproduksi 25 suvenir dalam 5 hari kerja. Jelaskan langkah-langkah untuk menghitung rata-rata produksi suvenir per hari dan hitung berapa suvenir yang dapat dihasilkan dalam 12 hari kerja dengan laju yang sama!`,
            type: "essay",
            rubric: `1. Menghitung laju harian: 25 / 5 = 5 suvenir/hari (Skor 50).\n2. Menghitung produksi 12 hari: 12 × 5 = 60 suvenir (Skor 30).\n3. Kesimpulan dan penjelasan runtut (Skor 20).`,
            explanation: `Laju produksi per hari = 25 / 5 = 5 suvenir. Dalam 12 hari, total suvenir = 12 × 5 = 60 suvenir.`,
            points: 10,
          },
    ];

    return NextResponse.json({
      success: true,
      data: { questions: fallbackQuestions },
      isFallback: true,
    });
  } catch (err: any) {
    console.error("[API AI Contextualize Error]", err);
    return NextResponse.json(
      { error: "Gagal memproses kontekstualisasi: " + (err.message || String(err)) },
      { status: 500 }
    );
  }
}
