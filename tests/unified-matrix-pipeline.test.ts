import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { contextEngine } from "../lib/context-engine/pipeline";
import { ContentInput } from "../lib/context-engine/types";

describe("Unified 10-Workflow Matrix & Pipeline Normalization Tests", () => {
  // =========================================================================
  // MATERI MATRIX (1 to 5)
  // =========================================================================
  test("MATERI #1: Manual Input Normalization & RAG Context Mapping", async () => {
    const input: ContentInput = {
      contentType: "material",
      sourceType: "manual",
      rawText: "Kegiatan ekonomi masyarakat pedesaan meliputi pertanian dan perdagangan di pasar.",
      title: "Kegiatan Ekonomi Masyarakat",
      subject: "IPS",
      grade: 5,
      regionName: "Kabupaten Ponorogo",
      regionId: "35.02",
    };

    const norm = contextEngine.normalizeContent(input);
    assert.equal(norm.contentType, "material");
    assert.equal(norm.sourceType, "manual");
    assert.equal(norm.effectiveText, input.rawText);

    const facts = await contextEngine.retrieveLocalKnowledge("35.02", "Kegiatan Ekonomi Ponorogo");
    assert.ok(facts.length > 0, "RAG should retrieve verified Ponorogo facts");
    assert.ok(facts.some((f) => f.name.toLowerCase().includes("reog") || f.name.toLowerCase().includes("pudak") || f.name.toLowerCase().includes("porang")));
  });

  test("MATERI #2: PDF Text Input Normalization & Pipeline Alignment", async () => {
    const input: ContentInput = {
      contentType: "material",
      sourceType: "pdf",
      rawText: "Bab 3: Interaksi Manusia dengan Lingkungan Alam dan Sosial Budaya di Jawa Timur.",
      title: "Modul Ajar PDF",
      subject: "IPS",
      grade: 5,
      regionName: "Kota Madiun",
      regionId: "35.77",
    };

    const norm = contextEngine.normalizeContent(input);
    assert.equal(norm.contentType, "material");
    assert.equal(norm.sourceType, "pdf");
    assert.equal(norm.effectiveText, input.rawText);

    const facts = await contextEngine.retrieveLocalKnowledge("35.77", "Industri Madiun");
    assert.ok(facts.length > 0, "RAG should retrieve verified Kota Madiun facts");
    assert.ok(facts.some((f) => f.name.toLowerCase().includes("inka") || f.name.toLowerCase().includes("pecel") || f.name.toLowerCase().includes("pendekar")));
  });

  test("MATERI #3: PDF Scan Input Normalization", async () => {
    const input: ContentInput = {
      contentType: "material",
      sourceType: "pdf",
      rawText: "Hasil OCR Halaman 1-3 Modul Kurikulum: Usaha pertanian dan perdagangan daerah.",
      title: "Materi Hasil Pindai PDF",
      subject: "IPS",
      grade: 5,
      regionName: "Kabupaten Magetan",
      regionId: "35.20",
    };

    const norm = contextEngine.normalizeContent(input);
    assert.equal(norm.contentType, "material");
    assert.equal(norm.regionName, "Kabupaten Magetan");
  });

  test("MATERI #4: Image / Photo OCR Input Normalization", async () => {
    const input: ContentInput = {
      contentType: "material",
      sourceType: "image",
      rawText: "Teks dari foto lembar buku tema: Telaga Sarangan dan potensi agrowisata sayur.",
      title: "Foto Modul Lembar Kerja",
      subject: "IPS",
      grade: 5,
      regionName: "Kabupaten Magetan",
      regionId: "35.20",
    };

    const norm = contextEngine.normalizeContent(input);
    assert.equal(norm.contentType, "material");
    assert.equal(norm.sourceType, "image");
    assert.ok(norm.effectiveText.includes("Telaga Sarangan"));
  });

  test("MATERI #5: Generate AI Input Normalization", async () => {
    const input: ContentInput = {
      contentType: "material",
      sourceType: "generate",
      prompt: "Bentang alam dan potensi komoditas ekspor daerah",
      subject: "IPS",
      grade: 5,
      regionName: "Kabupaten Ponorogo",
      regionId: "35.02",
    };

    const norm = contextEngine.normalizeContent(input);
    assert.equal(norm.contentType, "material");
    assert.equal(norm.sourceType, "generate");
    assert.equal(norm.effectiveText, "Bentang alam dan potensi komoditas ekspor daerah");
  });

  // =========================================================================
  // SOAL MATRIX (6 to 10)
  // =========================================================================
  test("SOAL #6: Manual Input Normalization & Math Preservation Verification", async () => {
    const input: ContentInput = {
      contentType: "question",
      sourceType: "manual",
      rawText: "Seorang pedagang membeli 5 karung beras seharga Rp 250.000. Berapa harga 1 karung beras?",
      subject: "Matematika",
      grade: 5,
      regionName: "Kabupaten Ponorogo",
      regionId: "35.02",
      structuredData: {
        type: "multiple_choice",
        options: [
          { key: "A", text: "Rp 50.000" },
          { key: "B", text: "Rp 40.000" },
          { key: "C", text: "Rp 60.000" },
          { key: "D", text: "Rp 55.000" },
        ],
        correctAnswer: "A",
      },
    };

    const norm = contextEngine.normalizeContent(input);
    assert.equal(norm.contentType, "question");
    assert.equal(norm.sourceType, "manual");
    assert.ok(norm.effectiveText.includes("250.000"));

    // Validation ensures mathematical numbers are strictly preserved
    const validation = await contextEngine.validateEducationalIntegrity(
      norm,
      "Seorang petani porang di Pudak menjual 5 karung bibit porang seharga Rp 250.000. Berapa harga 1 karung bibit porang?"
    );
    assert.equal(validation.math_numbers_strictly_preserved, true, "Numbers '5' and '250.000' must be strictly preserved");
  });

  test("SOAL #7: PDF Text Input Question Normalization", async () => {
    const input: ContentInput = {
      contentType: "question",
      sourceType: "pdf",
      rawText: "1. Kereta api api cepat diproduksi di pabrik manufaktur industri terkemuka. Kota manakah sentra PT INKA?\nA. Madiun\nB. Surabaya\nC. Solo\nD. Semarang\nKunci: A",
      subject: "IPS",
      grade: 5,
      regionName: "Kota Madiun",
      regionId: "35.77",
    };

    const norm = contextEngine.normalizeContent(input);
    assert.equal(norm.contentType, "question");
    assert.equal(norm.sourceType, "pdf");
    assert.ok(norm.effectiveText.includes("INKA"));
  });

  test("SOAL #8: PDF Scan Input Question Normalization", async () => {
    const input: ContentInput = {
      contentType: "question",
      sourceType: "pdf",
      rawText: "Pak Budi memanen 20 kg sayur kubis di lereng pegunungan. Hitunglah total harga jika per kg Rp 12.000.",
      subject: "Matematika",
      grade: 5,
      regionName: "Kabupaten Magetan",
      regionId: "35.20",
    };

    const norm = contextEngine.normalizeContent(input);
    assert.equal(norm.contentType, "question");
    assert.equal(norm.sourceType, "pdf");
  });

  test("SOAL #9: Image / Photo OCR Input Question Normalization", async () => {
    const input: ContentInput = {
      contentType: "question",
      sourceType: "image",
      rawText: "Berdasarkan gambar benteng bersejarah di Ngawi, jelaskan fungsi benteng Van Den Bosch pada masa kolonial!",
      subject: "IPS",
      grade: 5,
      regionName: "Kabupaten Ngawi",
      regionId: "35.21",
    };

    const norm = contextEngine.normalizeContent(input);
    assert.equal(norm.contentType, "question");
    assert.equal(norm.sourceType, "image");
    assert.ok(norm.effectiveText.includes("Van Den Bosch"));
  });

  test("SOAL #10: Generate AI Question Normalization", async () => {
    const input: ContentInput = {
      contentType: "question",
      sourceType: "generate",
      prompt: "Aritmetika sosial jual beli hasil panen bawang merah dan padi di sawah",
      subject: "Matematika",
      grade: 5,
      regionName: "Kabupaten Ngawi",
      regionId: "35.21",
    };

    const norm = contextEngine.normalizeContent(input);
    assert.equal(norm.contentType, "question");
    assert.equal(norm.sourceType, "generate");
    assert.ok(norm.effectiveText.includes("bawang merah"));
  });
});
