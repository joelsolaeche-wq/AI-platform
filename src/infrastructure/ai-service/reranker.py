"""
Lightweight deterministic reranker.

Scaffold uses BM25-style term overlap so the service has a dependency-free
default. Swap with a cross-encoder model (e.g. voyage-rerank) in production.
"""
from __future__ import annotations

import math
import re
from collections import Counter
from typing import List, Tuple


_TOKEN = re.compile(r"\w+")


def _tokens(text: str) -> list[str]:
    return [t.lower() for t in _TOKEN.findall(text)]


class Reranker:
    def rerank(
        self,
        query: str,
        candidates: List[str],
        top_k: int,
    ) -> list[Tuple[int, float]]:
        q_terms = _tokens(query)
        if not q_terms:
            return []

        docs = [_tokens(c) for c in candidates]
        df = Counter()
        for d in docs:
            for term in set(d):
                df[term] += 1
        n = len(docs)

        scored: list[tuple[int, float]] = []
        for i, doc in enumerate(docs):
            if not doc:
                scored.append((i, 0.0))
                continue
            tf = Counter(doc)
            score = 0.0
            for term in q_terms:
                if term not in tf:
                    continue
                idf = math.log(1 + (n - df[term] + 0.5) / (df[term] + 0.5))
                score += idf * (tf[term] / len(doc))
            scored.append((i, score))

        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[:top_k]
