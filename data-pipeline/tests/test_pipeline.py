"""
Unit Tests for Pipeline Normalization, Fingerprinting, and Chunking
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from pahami_data.processing.normalizer import (
    clean_text,
    compute_dedup_fingerprint,
    validate_region,
    chunk_entity_to_passages,
)
from pahami_data.schemas.models import EntityRecord, EvidenceRecord
from pahami_data.embedding.embedder import LocalE5Embedder, EMBEDDING_DIM


def test_clean_text():
    dirty = "  Kota   Madiun\r\n\t Jawa Timur  "
    assert clean_text(dirty) == "Kota Madiun Jawa Timur"


def test_compute_dedup_fingerprint():
    fp1 = compute_dedup_fingerprint("35.77", "Nasi Pecel Madiun")
    fp2 = compute_dedup_fingerprint("35.77", "  nasi  pecel  madiun! ")
    assert fp1 == fp2


def test_validate_region():
    valid, msg = validate_region("35.77")
    assert valid is True

    valid_sub, msg = validate_region("35.77.01")
    assert valid_sub is True

    invalid, msg = validate_region("33.74")
    assert invalid is False


def test_chunking_and_embedding():
    entity = EntityRecord(
        entity_id="ctx_ent_3577_inka_01",
        region_id="35.77",
        category="mobility",
        subcategory="railway",
        canonical_name="PT INKA Madiun",
        short_description="Pusat manufaktur perkeretaapian terintegrasi di Asia Tenggara.",
        educational_usage="Perhitungan kecepatan kereta api untuk matematika SD.",
        grade_suitability=[5],
        evidence=[
            EvidenceRecord(
                source_id="src_pt_inka_official",
                url="https://www.inka.co.id",
                claim="PT INKA memproduksi kereta api di Madiun.",
                reviewer="member1",
                verified_at="2026-09-23"
            )
        ]
    )
    chunks = chunk_entity_to_passages(entity)
    assert len(chunks) == 2
    assert chunks[0].entity_id == entity.entity_id

    embedder = LocalE5Embedder(force_deterministic=True)
    assert embedder.dimensions == EMBEDDING_DIM
    vec = embedder.embed_query("kecepatan kereta")
    assert len(vec) == 384
    # Check unit L2 norm
    norm = sum(x * x for x in vec)
    assert abs(norm - 1.0) < 1e-4
