from abc import ABC, abstractmethod
from typing import Dict, Any


class BaseAIProvider(ABC):
    """Abstract Base Class for pluggable AI Providers (OpenAI, Gemini, Ollama, Mock, etc.)."""

    @abstractmethod
    async def complete_prompt(self, prompt: str, system_message: str = "") -> Dict[str, Any]:
        """
        Send a prompt to the LLM and return a dict:
        {
          "raw_response": str,
          "tokens_used": int
        }
        """
        pass
