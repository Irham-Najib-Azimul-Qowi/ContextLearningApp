"""
Unit Tests for Pydantic Models and Schemas
"""

import pytest
import sys
from pathlib import Path

# Add src to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from pahami_data.schemas.models import (
    EntityRecord,
    EvidenceRecord,
    RegionRecord,
    RetrievalRequest,
    RetrievalResponse,
    QuantitativeConstraints,
)


def test_valid_entity_creation():
    evidence = EvidenceRecord(
        source_id="src_bps_kota_madiun_2024",
        url="https://madiunkota.bps.go.id",
        claim="Kota Madiun memiliki luas wilayah 33,23 km persegi.",
        reviewer="member1",
        verified_at="2026-09-23"
    )
    entity = EntityRecord(
        entity_id="ctx_ent_3577_kota_madiun_01",
        region_id="35.77",
        category="administratif",
        subcategory="boundary",
        canonical_name="Kota Madiun",
        aliases=["Madiun Kota"],
        short_description="Pusat pemerintahan dan perekonomian perkotaan di Karesidenan Madiun.",
        educational_usage="Materi pembelajaran IPS tentang wilayah kota administratif.",
        grade_suitability=[4, 5, 6],
        subject_tags=["ips"],
        safe_for_word_problem=True,
        quantitative_constraints=QuantitativeConstraints(typical_units="km2", min_val=10, max_val=50),
        verification_status="verified",
        evidence=[evidence]
    )
    assert entity.entity_id == "ctx_ent_3577_kota_madiun_01"
    assert entity.region_id == "35.77"
    assert len(entity.evidence) == 1
    assert entity.grade_suitability == [4, 5, 6]


def test_invalid_grade_suitability():
    with pytest.raises(ValueError):
        EntityRecord(
            entity_id="ctx_ent_3577_invalid_01",
            region_id="35.77",
            category="culture",
            subcategory="culinary",
            canonical_name="Invalid Test",
            short_description="Deskripsi pendek untuk pengetesan validasi kelas.",
            educational_usage="Keterangan pedagogis untuk pengetesan kelas.",
            grade_suitability=[0, 7] # Invalid SD grades
        )


def test_retrieval_request_response_contract():
    req = RetrievalRequest(
        region_id="35.77",
        category="culture",
        query="pecel madiun",
        grade=4,
        subject="matematika",
        limit=5,
        mode="structured_lexical"
    )
    assert req.region_id == "35.77"
    assert req.limit == 5

    res = RetrievalResponse(
        requested_region_id=req.region_id,
        matched_region_id=req.region_id,
        region_fallback_level="exact",
        retrieval_mode_used="structured_lexical",
        results=[],
        warnings=[]
    )
    assert res.matched_region_id == "35.77"
    assert res.region_fallback_level == "exact"
