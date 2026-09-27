import httpx
from typing import Dict, Any
from app.ai.base import BaseAIProvider
from app.core.config import settings


class OpenAICompatibleProvider(BaseAIProvider):
    """
    Pluggable LLM Provider using OpenAI-compatible REST API endpoints.
    Compatible with OpenAI, Gemini OpenAI API layer, Ollama, Groq, OpenRouter, etc.
    """

    def __init__(
        self,
        api_key: str = None,
        model_name: str = None,
        base_url: str = None,
    ):
        self.api_key = api_key or settings.AI_API_KEY
        self.model_name = model_name or settings.AI_MODEL_NAME
        self.base_url = (base_url or settings.AI_BASE_URL).rstrip("/")

    async def complete_prompt(self, prompt: str, system_message: str = "") -> Dict[str, Any]:
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}",
        }

        messages = []
        if system_message:
            messages.append({"role": "system", "content": system_message})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": self.model_name,
            "messages": messages,
            "temperature": 0.2,
            "response_format": {"type": "json_object"},
        }

        url = f"{self.base_url}/chat/completions"

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, headers=headers, json=payload)
            if response.status_code != 200:
                raise ValueError(
                    f"LLM Provider error [{response.status_code}]: {response.text}"
                )

            data = response.json()
            choice = data["choices"][0]
            raw_text = choice["message"]["content"]
            tokens = data.get("usage", {}).get("total_tokens", 0)

            return {
                "raw_response": raw_text,
                "tokens_used": tokens,
            }
