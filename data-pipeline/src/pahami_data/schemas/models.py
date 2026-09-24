"""
Pydantic Schemas for Local Knowledge Base (LKB) Entities, Sources, and Retrieval
"""

from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field, HttpUrl, field_validator
import re

CategoryType = Literal[
    "geography",
    "built_environment",
    "livelihood",
    "mobility",
    "community",
    "culture",
    "nature_environment",
    "administratif"
]

VerificationStatus = Literal["verified", "in_review", "draft"]
RegionLevel = Literal["province", "regency", "city", "district", "village"]
RetrievalMode = Literal["structured_lexical", "semantic", "hybrid"]
FallbackLevel = Literal["exact", "district_to_regency", "regency_to_residency", "none"]


class QuantitativeConstraints(BaseModel):
    typical_units: Optional[str] = Field(None, description="e.g. 'kg', 'ton', 'km', 'orang'")
    min_val: Optional[float] = Field(None, description="Realistic lower bound for problem generation")
    max_val: Optional[float] = Field(None, description="Realistic upper bound for problem generation")


class EvidenceRecord(BaseModel):
    source_id: str = Field(..., description="Stable ID of registered source in lkb_sources")
    url: str = Field(..., description="Source reference URL")
    claim: str = Field(..., min_length=5, description="Factual claim extracted from source")
    section_reference: Optional[str] = Field(None, description="Page number or document chapter")
    reviewer: str = Field("member1_rag_engineer", description="Name of human reviewer")
    verified_at: str = Field("2026-09-23", description="Verification date YYYY-MM-DD")
    license_note: Optional[str] = Field(None, description="Source license or attribution requirement")


class EntityRecord(BaseModel):
    entity_id: str = Field(..., pattern=r"^ctx_ent_\d{4}_[a-z0-9_]+$", description="Canonical unique ID")
    region_id: str = Field(..., pattern=r"^(35\.(77|19|21|20|02|01)|33\.74)(\.\d{2})?$", description="Official region code")
    category: CategoryType
    subcategory: str
    canonical_name: str = Field(..., min_length=2)
    aliases: List[str] = Field(default_factory=list)
    short_description: str = Field(..., min_length=20)
    educational_usage: str = Field(..., min_length=15)
    grade_suitability: List[int] = Field(default_factory=lambda: [1, 2, 3, 4, 5, 6])
    subject_tags: List[str] = Field(default_factory=lambda: ["matematika", "bahasa_indonesia", "ips"])
    safe_for_word_problem: bool = True
    quantitative_constraints: Optional[QuantitativeConstraints] = None
    verification_status: VerificationStatus = "verified"
    dedup_fingerprint: Optional[str] = None
    evidence: List[EvidenceRecord] = Field(default_factory=list)

    @field_validator("grade_suitability")
    @classmethod
    def validate_grades(cls, v: List[int]) -> List[int]:
        for grade in v:
            if grade < 1 or grade > 6:
                raise ValueError("grade_suitability must contain SD grades 1 to 6")
        return sorted(list(set(v)))


class MediaAssetRecord(BaseModel):
    media_id: str = Field(..., pattern=r"^med_[a-z0-9_]+$", description="Canonical media ID")
    entity_id: str
    source_url: str
    image_url: str
    title: str
    caption: str
    alt_text: str
    author: str
    license_type: str = "Wikimedia Commons / CC-BY-SA"
    license_url: Optional[str] = None
    attribution_text: str
    verification_status: VerificationStatus = "verified"


class SourceRecord(BaseModel):
    source_id: str = Field(..., description="Stable identifier e.g. src_bps_madiun_2024")
    publisher: str
    title: str
    url: str
    published_at: Optional[str] = None
    retrieved_at: str
    license: str
    attribution_note: Optional[str] = None
    import_mode: str = "manual_curated"


class RegionRecord(BaseModel):
    region_id: str
    name: str
    popular_name: Optional[str] = None
    level: RegionLevel
    parent_id: Optional[str] = None
    code_source: str = "BPS_KEMENDAGRI_2024"


class PassageChunk(BaseModel):
    passage_id: str
    entity_id: str
    region_id: str
    source_id: str
    content: str
    chunk_sequence: int = 0
    embedding: Optional[List[float]] = None
    model_id: str = "intfloat/multilingual-e5-small"
    revision_hash: str
    status: VerificationStatus = "verified"


class IngestionReport(BaseModel):
    run_id: str
    region_id: str
    total_entities_processed: int = 0
    total_entities_inserted: int = 0
    total_passages_indexed: int = 0
    warnings: List[str] = Field(default_factory=list)
    status: str = "success"


class RetrievalRequest(BaseModel):
    region_id: str = Field(..., description="Requested region code, e.g. 35.77")
    category: Optional[CategoryType] = None
    subcategory: Optional[str] = None
    query: str = Field(..., min_length=1)
    grade: Optional[int] = Field(None, ge=1, le=6)
    subject: Optional[str] = None
    limit: int = Field(5, ge=1, le=20)
    mode: RetrievalMode = "structured_lexical"


class RetrievalEntityItem(BaseModel):
    entity_id: str
    name: str
    category: CategoryType
    subcategory: str
    region_id: str
    educational_usage: str
    quantitative_constraints: Optional[QuantitativeConstraints] = None
    evidence: List[Dict[str, Any]] = Field(default_factory=list)
    media_assets: List[Dict[str, Any]] = Field(default_factory=list)
    verification_status: VerificationStatus


class RetrievalResponse(BaseModel):
    requested_region_id: str
    matched_region_id: str
    region_fallback_level: FallbackLevel
    retrieval_mode_used: RetrievalMode
    results: List[RetrievalEntityItem] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
