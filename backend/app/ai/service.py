from typing import Dict, Any, Tuple
from app.core.config import settings
from app.ai.base import BaseAIProvider
from app.ai.mock_provider import MockAIProvider
from app.ai.openai_provider import OpenAICompatibleProvider
from app.ai.json_parser import parse_and_validate
from app.ai.prompts import (
    REQUIREMENT_ANALYSIS_PROMPT,
    GENERATE_SCENARIOS_PROMPT,
    GENERATE_TEST_CASES_PROMPT,
    BUG_ANALYSIS_PROMPT,
    DEEP_BUG_ANALYSIS_PROMPT,
    TEST_CASE_QUALITY_PROMPT,
)
from app.schemas.ai import (
    RequirementAnalysisOutput,
    ScenariosGenerationOutput,
    TestCasesGenerationOutput,
    BugAnalysisOutput,
    DeepBugAnalysisOutput,
    TestCaseQualityOutput,
)


def get_ai_provider() -> BaseAIProvider:
    """Factory to instantiate the configured AI Provider abstraction."""
    provider_name = settings.AI_PROVIDER.lower()
    if provider_name in ["openai", "gemini", "ollama", "groq"]:
        return OpenAICompatibleProvider()
    return MockAIProvider()


class AIService:
    """
    High-level AI Service Facade.
    Handles requirement analysis, scenario generation, test case generation, deep bug analysis, and test case quality scoring.
    """

    def __init__(self, provider: BaseAIProvider = None):
        self.provider = provider or get_ai_provider()

    async def analyze_requirement(
        self, title: str, description: str
    ) -> Tuple[RequirementAnalysisOutput, str, int, str]:
        prompt = REQUIREMENT_ANALYSIS_PROMPT.format(title=title, description=description)
        result = await self.provider.complete_prompt(
            prompt, system_message="You are a professional software testing AI."
        )

        raw_text = result["raw_response"]
        tokens = result.get("tokens_used", 0)

        structured = parse_and_validate(raw_text, RequirementAnalysisOutput)
        provider_name = getattr(self.provider, "__class__").__name__

        return structured, raw_text, tokens, provider_name

    async def generate_scenarios(
        self, title: str, description: str
    ) -> Tuple[ScenariosGenerationOutput, str, int, str]:
        prompt = GENERATE_SCENARIOS_PROMPT.format(title=title, description=description)
        result = await self.provider.complete_prompt(
            prompt, system_message="You are a QA Lead specializing in test design."
        )

        raw_text = result["raw_response"]
        tokens = result.get("tokens_used", 0)

        structured = parse_and_validate(raw_text, ScenariosGenerationOutput)
        provider_name = getattr(self.provider, "__class__").__name__

        return structured, raw_text, tokens, provider_name

    async def generate_test_cases(
        self,
        req_title: str,
        req_description: str,
        scenario_title: str,
        scenario_type: str,
        target_focus: str = "All",
    ) -> Tuple[TestCasesGenerationOutput, str, int, str]:
        prompt = GENERATE_TEST_CASES_PROMPT.format(
            req_title=req_title,
            req_description=req_description,
            scenario_title=scenario_title,
            scenario_type=scenario_type,
            target_focus=target_focus,
        )
        result = await self.provider.complete_prompt(
            prompt, system_message="You are a Senior Test Automation Architect."
        )

        raw_text = result["raw_response"]
        tokens = result.get("tokens_used", 0)

        structured = parse_and_validate(raw_text, TestCasesGenerationOutput)
        provider_name = getattr(self.provider, "__class__").__name__

        return structured, raw_text, tokens, provider_name

    async def analyze_bug(
        self,
        title: str,
        description: str,
        steps: str,
        expected_result: str,
        actual_result: str,
        environment: str,
    ) -> Tuple[BugAnalysisOutput, str, int, str]:
        prompt = BUG_ANALYSIS_PROMPT.format(
            title=title,
            description=description,
            steps=steps or "N/A",
            expected_result=expected_result or "N/A",
            actual_result=actual_result or "N/A",
            environment=environment or "N/A",
        )
        result = await self.provider.complete_prompt(
            prompt, system_message="You are a Senior Software Debugging & Security Specialist."
        )

        raw_text = result["raw_response"]
        tokens = result.get("tokens_used", 0)

        structured = parse_and_validate(raw_text, BugAnalysisOutput)
        provider_name = getattr(self.provider, "__class__").__name__

        return structured, raw_text, tokens, provider_name

    async def analyze_bug_deep(
        self,
        title: str,
        description: str,
        steps: str,
        expected_result: str,
        actual_result: str,
        environment: str,
    ) -> Tuple[DeepBugAnalysisOutput, str, int, str]:
        prompt = DEEP_BUG_ANALYSIS_PROMPT.format(
            title=title,
            description=description,
            steps=steps or "N/A",
            expected_result=expected_result or "N/A",
            actual_result=actual_result or "N/A",
            environment=environment or "N/A",
        )
        result = await self.provider.complete_prompt(
            prompt, system_message="You are a Senior Debugging AI Specialist."
        )

        raw_text = result["raw_response"]
        tokens = result.get("tokens_used", 0)

        structured = parse_and_validate(raw_text, DeepBugAnalysisOutput)
        provider_name = getattr(self.provider, "__class__").__name__

        return structured, raw_text, tokens, provider_name

    async def analyze_test_case_quality(
        self,
        title: str,
        objective: str,
        preconditions: str,
        test_data: str,
        steps: Any,
        expected_result: str,
        test_type: str,
        priority: str,
    ) -> Tuple[TestCaseQualityOutput, str, int, str]:
        prompt = TEST_CASE_QUALITY_PROMPT.format(
            title=title,
            objective=objective or "N/A",
            preconditions=preconditions or "N/A",
            test_data=test_data or "N/A",
            steps=str(steps),
            expected_result=expected_result,
            test_type=test_type,
            priority=priority,
        )
        result = await self.provider.complete_prompt(
            prompt, system_message="You are an Expert Software Test Auditor AI."
        )

        raw_text = result["raw_response"]
        tokens = result.get("tokens_used", 0)

        structured = parse_and_validate(raw_text, TestCaseQualityOutput)
        provider_name = getattr(self.provider, "__class__").__name__

        return structured, raw_text, tokens, provider_name
