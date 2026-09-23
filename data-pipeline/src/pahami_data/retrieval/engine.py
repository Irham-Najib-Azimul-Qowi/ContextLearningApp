"""
Retrieval Engine: Structured + Lexical Ranking, Region Fallback, and Optional Semantic Search
"""

import re
from typing import List, Optional, Dict, Any
from pahami_data.schemas.models import (
    RetrievalRequest,
    RetrievalResponse,
    RetrievalEntityItem,
    EntityRecord,
    QuantitativeConstraints,
)
from pahami_data.storage.database import LocalLkbStore
from pahami_data.embedding.embedder import LocalE5Embedder

VALID_REGIONS = {"35.77", "35.19", "35.21", "35.20", "35.02", "35.01"}
VALID_DISTRICTS = {
    # Kota Madiun (35.77)
    "35.77.01", "35.77.02", "35.77.03",
    # Kab Madiun (35.19)
    "35.19.01", "35.19.02", "35.19.03", "35.19.04", "35.19.05", "35.19.06",
    # Kab Ngawi (35.21)
    "35.21.01", "35.21.02", "35.21.03", "35.21.04",
    # Kab Magetan (35.20)
    "35.20.01", "35.20.02", "35.20.03", "35.20.04",
    # Kab Ponorogo (35.02)
    "35.02.01", "35.02.02", "35.02.03", "35.02.04",
    # Kab Pacitan (35.01)
    "35.01.01", "35.01.02", "35.01.03", "35.01.04"
}


class LkbRetrievalEngine:
    def __init__(self, store: LocalLkbStore, embedder: Optional[LocalE5Embedder] = None):
        self.store = store
        self.embedder = embedder or LocalE5Embedder(force_deterministic=True)

    def retrieve(self, request: RetrievalRequest) -> RetrievalResponse:
        warnings: List[str] = []
        target_region_id = request.region_id
        fallback_level = "exact"

        # 1. Region validation and hierarchy fallback
        if target_region_id not in VALID_REGIONS:
            # Check district pattern: e.g. 35.77.01 -> 35.77
            parts = target_region_id.split(".")
            if len(parts) >= 3:
                if target_region_id not in VALID_DISTRICTS:
                    return RetrievalResponse(
                        requested_region_id=request.region_id,
                        matched_region_id=request.region_id,
                        region_fallback_level="none",
                        retrieval_mode_used=request.mode,
                        results=[],
                        warnings=["Kode kecamatan tidak terdaftar dalam basis data resmi Karesidenan Madiun."]
                    )
                parent_code = f"{parts[0]}.{parts[1]}"
                if parent_code in VALID_REGIONS:
                    target_region_id = parent_code
                    fallback_level = "district_to_regency"
                else:
                    return RetrievalResponse(
                        requested_region_id=request.region_id,
                        matched_region_id=request.region_id,
                        region_fallback_level="none",
                        retrieval_mode_used=request.mode,
                        results=[],
                        warnings=["Kode wilayah di luar cakupan 6 daerah Karesidenan Madiun."]
                    )
            else:
                return RetrievalResponse(
                    requested_region_id=request.region_id,
                    matched_region_id=request.region_id,
                    region_fallback_level="none",
                    retrieval_mode_used=request.mode,
                    results=[],
                    warnings=["Wilayah tidak ditemukan dalam basis pengetahuan."]
                )

        mode_used = request.mode
        if mode_used == "semantic" and self.embedder is None:
            mode_used = "structured_lexical"
            warnings.append("Semantic search unavailable; defaulted to structured_lexical.")

        # 2. Filter candidates by region and status
        candidates = self.store.list_entities_by_region(target_region_id)

        # 3. Apply category, grade, and subject filters
        filtered: List[EntityRecord] = []
        for e in candidates:
            if request.category and e.category != request.category:
                continue
            if request.subcategory and e.subcategory != request.subcategory:
                continue
            if request.grade and request.grade not in e.grade_suitability:
                continue
            if request.subject and request.subject.lower() not in [s.lower() for s in e.subject_tags]:
                continue
            filtered.append(e)

        # 4. Lexical Scoring
        scored: List[tuple[float, EntityRecord]] = []
        tokens = [t.lower() for t in re.findall(r"\w+", request.query) if len(t) > 2]

        for e in filtered:
            score = 0.0
            name_lower = e.canonical_name.lower()
            desc_lower = e.short_description.lower()
            usage_lower = e.educational_usage.lower()
            aliases_lower = [a.lower() for a in e.aliases]

            if not tokens:
                score = 1.0
            else:
                for tok in tokens:
                    if tok in name_lower:
                        score += 5.0
                    for alias in aliases_lower:
                        if tok in alias:
                            score += 4.0
                    if tok in desc_lower:
                        score += 2.0
                    if tok in usage_lower:
                        score += 1.5

            if score > 0.0 or not tokens:
                scored.append((score, e))

        # Sort by score descending
        scored.sort(key=lambda x: x[0], reverse=True)
        top_candidates = [e for _, e in scored[:request.limit]]

        # Format output matching contract
        results = [
            RetrievalEntityItem(
                entity_id=e.entity_id,
                name=e.canonical_name,
                category=e.category,
                subcategory=e.subcategory,
                region_id=e.region_id,
                educational_usage=e.educational_usage,
                quantitative_constraints=e.quantitative_constraints,
                evidence=[ev.model_dump() for ev in e.evidence],
                verification_status=e.verification_status,
            )
            for e in top_candidates
        ]

        return RetrievalResponse(
            requested_region_id=request.region_id,
            matched_region_id=target_region_id,
            region_fallback_level=fallback_level,
            retrieval_mode_used=mode_used,
            results=results,
            warnings=warnings
        )
