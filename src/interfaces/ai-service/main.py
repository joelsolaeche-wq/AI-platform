"""
FastAPI AI microservice — interface layer.

Thin HTTP layer. All heavy lifting (LLM calls, vector math) is delegated to
adapters in `src/infrastructure/ai-service/`. Business rules are NOT here.

Exposed endpoints:
  GET  /health             — liveness probe
  POST /rerank             — rerank candidate passages against a query
  POST /summarize-lesson   — generate a short summary for a lesson

The NestJS API calls this service over HTTP when it needs Python-native
ML tooling (e.g. reranking, token-aware chunking).
"""
from __future__ import annotations

import os
import sys
from typing import List

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

# Make the sibling infrastructure package importable when running locally.
_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if _ROOT not in sys.path:
    sys.path.insert(0, _ROOT)

from infrastructure.ai_service.claude_client import ClaudeClient  # noqa: E402
from infrastructure.ai_service.reranker import Reranker  # noqa: E402

app = FastAPI(title="AI Learning — AI Service", version="0.1.0")

_claude = ClaudeClient(
    api_key=os.environ.get("ANTHROPIC_API_KEY", ""),
    model=os.environ.get("ANTHROPIC_MODEL", "claude-sonnet-4-20250514"),
)
_reranker = Reranker()


class RerankRequest(BaseModel):
    query: str = Field(min_length=1)
    candidates: List[str]
    top_k: int = Field(default=5, ge=1, le=50)


class RerankHit(BaseModel):
    index: int
    score: float


class RerankResponse(BaseModel):
    hits: List[RerankHit]


class SummarizeRequest(BaseModel):
    lesson_id: str
    title: str
    content: str = Field(min_length=1)


class SummarizeResponse(BaseModel):
    lesson_id: str
    summary: str


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/rerank", response_model=RerankResponse)
def rerank(req: RerankRequest) -> RerankResponse:
    if not req.candidates:
        raise HTTPException(status_code=400, detail="candidates must not be empty")
    scored = _reranker.rerank(req.query, req.candidates, req.top_k)
    return RerankResponse(hits=[RerankHit(index=i, score=s) for i, s in scored])


@app.post("/summarize-lesson", response_model=SummarizeResponse)
async def summarize_lesson(req: SummarizeRequest) -> SummarizeResponse:
    try:
        summary = await _claude.summarize(req.title, req.content)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"upstream LLM error: {exc}") from exc
    return SummarizeResponse(lesson_id=req.lesson_id, summary=summary)
