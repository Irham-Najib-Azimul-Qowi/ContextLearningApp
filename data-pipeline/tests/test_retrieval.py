"""
Unit Tests for Retrieval Engine
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from pahami_data.schemas.models import EntityRecord, RegionRecord, RetrievalRequest, EvidenceRecord
from pahami_data.storage.database import LocalLkbStore
from pahami_data.retrieval.engine import LkbRetrievalEngine


def setup_test_engine():
    store = LocalLkbStore()
    store.upsert_region(RegionRecord(region_id="35.77", name="Kota Madiun", level="city"))
    store.upsert_region(RegionRecord(region_id="35.02", name="Kabupaten Ponorogo", level="regency"))

    # Entity 1: Madiun Pecel
    store.upsert_entity(
        EntityRecord(
            entity_id="ctx_ent_3577_pecel_01",
            region_id="35.77",
            category="culture",
            subcategory="culinary",
            canonical_name="Nasi Pecel Madiun",
            short_description="Kuliner khas sayuran rebus disiram sambal kacang.",
            educational_usage="Perhitungan porsi makanan untuk SD.",
            grade_suitability=[3, 4, 5],
            subject_tags=["matematika"],
            evidence=[
                EvidenceRecord(
                    source_id="src_pemkot_madiun_official",
                    url="https://madiunkota.go.id",
                    claim="Pecel adalah kuliner khas Madiun.",
                    reviewer="member1",
                    verified_at="2026-09-23"
                )
            ]
        )
    )

    # Entity 2: Ponorogo Reog
    store.upsert_entity(
        EntityRecord(
            entity_id="ctx_ent_3502_reog_01",
            region_id="35.02",
            category="culture",
            subcategory="performing_arts",
            canonical_name="Reog Ponorogo",
            short_description="Seni pertunjukan tari tradisional dengan topeng singa merak.",
            educational_usage="Perhitungan berat topeng untuk matematika SD.",
            grade_suitability=[4, 5],
            subject_tags=["matematika", "ips"],
            evidence=[
                EvidenceRecord(
                    source_id="src_kemdikbud_cagar_budaya",
                    url="https://kebudayaan.kemdikbud.go.id",
                    claim="Reog adalah warisan budaya Ponorogo.",
                    reviewer="member1",
                    verified_at="2026-09-23"
                )
            ]
        )
    )

    return LkbRetrievalEngine(store)


def test_exact_retrieval():
    engine = setup_test_engine()
    req = RetrievalRequest(
        region_id="35.77",
        category="culture",
        query="pecel sambal kacang",
        limit=5
    )
    res = engine.retrieve(req)
    assert res.matched_region_id == "35.77"
    assert res.region_fallback_level == "exact"
    assert len(res.results) == 1
    assert res.results[0].entity_id == "ctx_ent_3577_pecel_01"


def test_district_fallback():
    engine = setup_test_engine()
    req = RetrievalRequest(
        region_id="35.77.01", # Kartoharjo district
        query="pecel",
        limit=5
    )
    res = engine.retrieve(req)
    assert res.matched_region_id == "35.77"
    assert res.region_fallback_level == "district_to_regency"
    assert len(res.results) == 1


def test_zero_region_leakage():
    engine = setup_test_engine()
    # Search Reog in Kota Madiun (35.77) -> Reog is in Ponorogo (35.02)
    req = RetrievalRequest(
        region_id="35.77",
        query="reog ponorogo",
        limit=5
    )
    res = engine.retrieve(req)
    # Should not return Ponorogo's entity
    returned_ids = [r.entity_id for r in res.results]
    assert "ctx_ent_3502_reog_01" not in returned_ids


def test_outside_region_rejection():
    engine = setup_test_engine()
    req = RetrievalRequest(
        region_id="33.74", # Semarang
        query="pasar",
        limit=5
    )
    res = engine.retrieve(req)
    assert res.region_fallback_level == "none"
    assert len(res.results) == 0
    assert len(res.warnings) > 0
