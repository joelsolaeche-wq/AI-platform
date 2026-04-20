"""Anthropic Claude adapter for the Python AI service."""
from __future__ import annotations

from anthropic import AsyncAnthropic


class ClaudeClient:
    _SYSTEM = (
        "You are an educational content summarizer. Produce a concise, "
        "learner-friendly 2–3 sentence summary of the lesson provided."
    )

    def __init__(self, api_key: str, model: str) -> None:
        self._client = AsyncAnthropic(api_key=api_key) if api_key else None
        self._model = model

    async def summarize(self, title: str, content: str) -> str:
        if self._client is None:
            raise RuntimeError("ANTHROPIC_API_KEY is not set")

        msg = await self._client.messages.create(
            model=self._model,
            max_tokens=300,
            system=self._SYSTEM,
            messages=[
                {
                    "role": "user",
                    "content": f"Lesson title: {title}\n\nLesson content:\n{content}",
                }
            ],
        )
        parts = [b.text for b in msg.content if getattr(b, "type", "") == "text"]
        return "\n".join(parts).strip()
