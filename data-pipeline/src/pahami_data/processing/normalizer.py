"""
Text Normalization, Deduplication Fingerprinting, and Topic-Focused Chunking
"""

import hashlib
import re
from typing import List, Tuple, Dict, Any
from pahami_data.schemas.models import EntityRecord, PassageChunk

VALID_REGION_PREFIXES = {"35.77", "35.19", "35.21", "35.20", "35.02", "35.01"}


def clean_text(text: str) -> str:
    """Normalize UTF-8 whitespace and control characters."""
    if not text:
        return ""
    text = re.sub(r"[\r\n\t]+", " ", text)
    text = re.sub(r"\s{2,}", " ", text)
    return text.strip()


def compute_dedup_fingerprint(region_id: str, canonical_name: str) -> str:
    """Stable fingerprint to detect duplicates and conflicts in the same region."""
    normalized_name = re.sub(r"[^\w\s]", "", canonical_name.lower().strip())
    normalized_name = re.sub(r"\s+", "_", normalized_name)
    raw = f"{region_id}:{normalized_name}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:16]


def validate_region(region_id: str) -> Tuple[bool, str]:
    """Verify that region_id belongs to the 6 Karesidenan Madiun regions."""
    main_code = region_id.split(".")[0] + "." + region_id.split(".")[1] if len(region_id.split(".")) >= 2 else ""
    if main_code in VALID_REGION_PREFIXES:
        return True, "Valid"
    return False, f"Region code {region_id} is outside Karesidenan Madiun scope (35.77, 35.19, 35.21, 35.20, 35.02, 35.01)"


def chunk_entity_to_passages(entity: EntityRecord) -> List[PassageChunk]:
    """
    Produce focused topic chunks from entity description and pedagogical notes.
    Preserves source provenance and entity reference per chunk.
    """
    passages: List[PassageChunk] = []
    source_id = entity.evidence[0].source_id if entity.evidence else "src_bps_kota_madiun_2024"

    # Chunk 1: Descriptive Fact
    content_desc = (
        f"{entity.canonical_name} ({entity.category}) di {entity.region_id}. "
        f"{entity.short_description}"
    )
    rev_hash_1 = hashlib.sha256(content_desc.encode("utf-8")).hexdigest()[:16]
    passages.append(
        PassageChunk(
            passage_id=f"{entity.entity_id}_chunk_01",
            entity_id=entity.entity_id,
            region_id=entity.region_id,
            source_id=source_id,
            content=content_desc,
            chunk_sequence=0,
            revision_hash=rev_hash_1,
            status=entity.verification_status
        )
    )

    # Chunk 2: Pedagogical Context
    content_pedagogical = (
        f"Konteks pembelajaran SD ({entity.canonical_name}): {entity.educational_usage} "
        f"Mata pelajaran relevan: {', '.join(entity.subject_tags)}."
    )
    rev_hash_2 = hashlib.sha256(content_pedagogical.encode("utf-8")).hexdigest()[:16]
    passages.append(
        PassageChunk(
            passage_id=f"{entity.entity_id}_chunk_02",
            entity_id=entity.entity_id,
            region_id=entity.region_id,
            source_id=source_id,
            content=content_pedagogical,
            chunk_sequence=1,
            revision_hash=rev_hash_2,
            status=entity.verification_status
        )
    )

    return passages
