"""
Quantitative Benchmark Evaluation Module for LKB Retrieval
Evaluates 30 human-reviewed test cases measuring Recall@5, Precision@5, Region Leakage, and Latency.
"""

import json
import time
from pathlib import Path
from typing import Dict, Any, List
from pahami_data.schemas.models import (
    EntityRecord,
    RegionRecord,
    RetrievalRequest,
)
from pahami_data.storage.database import LocalLkbStore
from pahami_data.retrieval.engine import LkbRetrievalEngine


def run_benchmark(
    seed_file: Path,
    eval_file: Path
) -> Dict[str, Any]:
    with open(seed_file, "r", encoding="utf-8") as f:
        seed_data = json.load(f)

    with open(eval_file, "r", encoding="utf-8") as f:
        eval_queries = json.load(f)

    store = LocalLkbStore()
    for r_data in seed_data["regions"]:
        store.upsert_region(RegionRecord(**r_data))
    for e_data in seed_data["entities"]:
        store.upsert_entity(EntityRecord(**e_data))

    engine = LkbRetrievalEngine(store)

    total_queries = len(eval_queries)
    latencies: List[float] = []
    recall_scores: List[float] = []
    precision_scores: List[float] = []
    region_leakages: int = 0
    total_returned_entities: int = 0
    entities_with_source: int = 0
    trick_cases_passed: int = 0
    trick_cases_total: int = 0
    detailed_results: List[Dict[str, Any]] = []

    for item in eval_queries:
        req = RetrievalRequest(
            region_id=item["region_id"],
            category=item.get("category"),
            query=item["query"],
            grade=item.get("grade"),
            subject=item.get("subject"),
            limit=5,
            mode="structured_lexical"
        )

        start_t = time.perf_counter()
        resp = engine.retrieve(req)
        latency_ms = (time.perf_counter() - start_t) * 1000.0
        latencies.append(latency_ms)

        returned_ids = [res.entity_id for res in resp.results]
        expected_ids = item.get("expected_entity_ids", [])
        is_trick = item.get("is_trick_case", False)

        # Region leakage check
        for res in resp.results:
            total_returned_entities += 1
            if res.region_id != resp.matched_region_id:
                region_leakages += 1
            if res.evidence and len(res.evidence) > 0:
                entities_with_source += 1

        if is_trick:
            trick_cases_total += 1
            # Trick case passes if no wrong entities were leaked
            if len(returned_ids) == 0:
                trick_cases_passed += 1
                case_passed = True
            else:
                case_passed = False
        else:
            hits = len(set(returned_ids).intersection(set(expected_ids)))
            rec = hits / len(expected_ids) if expected_ids else 1.0
            prec = hits / len(returned_ids) if returned_ids else 0.0
            recall_scores.append(rec)
            precision_scores.append(prec)
            case_passed = (rec > 0.0)

        detailed_results.append({
            "id": item["id"],
            "description": item["description"],
            "query": item["query"],
            "region_id": item["region_id"],
            "matched_region_id": resp.matched_region_id,
            "fallback_level": resp.region_fallback_level,
            "returned_ids": returned_ids,
            "expected_ids": expected_ids,
            "latency_ms": round(latency_ms, 2),
            "passed": case_passed
        })

    avg_recall = sum(recall_scores) / len(recall_scores) if recall_scores else 0.0
    avg_precision = sum(precision_scores) / len(precision_scores) if precision_scores else 0.0
    avg_latency = sum(latencies) / len(latencies) if latencies else 0.0
    leakage_rate = (region_leakages / total_returned_entities * 100.0) if total_returned_entities > 0 else 0.0
    source_completeness = (entities_with_source / total_returned_entities * 100.0) if total_returned_entities > 0 else 100.0

    return {
        "total_queries": total_queries,
        "standard_queries": total_queries - trick_cases_total,
        "trick_queries": trick_cases_total,
        "trick_cases_passed": trick_cases_passed,
        "average_recall_at_5": round(avg_recall * 100.0, 1),
        "average_precision_at_5": round(avg_precision * 100.0, 1),
        "region_leakage_rate": round(leakage_rate, 2),
        "source_completeness": round(source_completeness, 1),
        "average_latency_ms": round(avg_latency, 2),
        "detailed_results": detailed_results
    }
