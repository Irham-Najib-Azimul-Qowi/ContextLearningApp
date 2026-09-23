"""
Text Embedding Wrapper for intfloat/multilingual-e5-small (384 dimensions)
Enforces passage/query prefixing and L2 normalization.
Includes deterministic fallback for testing in air-gapped/offline environments.
"""

import math
import hashlib
from typing import List, Union
import numpy as np

EMBEDDING_DIM = 384
DEFAULT_MODEL_NAME = "intfloat/multilingual-e5-small"


class LocalE5Embedder:
    def __init__(self, model_name: str = DEFAULT_MODEL_NAME, force_deterministic: bool = False):
        self.model_name = model_name
        self.dimensions = EMBEDDING_DIM
        self._model = None
        self.force_deterministic = force_deterministic

        if not force_deterministic:
            try:
                from sentence_transformers import SentenceTransformer
                self._model = SentenceTransformer(model_name)
            except Exception as e:
                # Graceful fallback to deterministic embedder for offline/test mode
                self._model = None

    def embed_passages(self, texts: List[str]) -> List[List[float]]:
        """
        Embed document passages. Prepends 'passage: ' required by E5-small.
        """
        prefixed = [f"passage: {t}" for t in texts]
        return self._generate_embeddings(prefixed)

    def embed_query(self, query: str) -> List[float]:
        """
        Embed search query. Prepends 'query: ' required by E5-small.
        """
        prefixed = f"query: {query}"
        return self._generate_embeddings([prefixed])[0]

    def _generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        if self._model is not None and not self.force_deterministic:
            embeddings = self._model.encode(texts, normalize_embeddings=True)
            return [emb.tolist() for emb in embeddings]
        else:
            # Deterministic pseudo-embedding for testing & offline reproducibility
            return [self._deterministic_vector(t) for t in texts]

    def _deterministic_vector(self, text: str) -> List[float]:
        """Generates a reproducible 384-dimensional unit vector from text sha256."""
        vec = []
        for i in range(EMBEDDING_DIM):
            seed = f"{text}_{i}".encode("utf-8")
            val = (int(hashlib.sha256(seed).hexdigest()[:8], 16) / 0xFFFFFFFF) - 0.5
            vec.append(val)
        norm = math.sqrt(sum(x * x for x in vec)) or 1.0
        return [x / norm for x in vec]
