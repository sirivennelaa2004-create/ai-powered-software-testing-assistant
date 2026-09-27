import pytest
from app.ai.json_parser import extract_json_string, repair_json_string, parse_and_validate
from app.schemas.ai import RequirementAnalysisOutput
from app.ai.mock_provider import MockAIProvider
from app.ai.service import AIService


def test_extract_json_string_markdown_block():
    markdown_text = "Here is the response:\n```json\n{\"functional_requirements\": [\"req 1\"]}\n```"
    extracted = extract_json_string(markdown_text)
    assert extracted == '{"functional_requirements": ["req 1"]}'


def test_repair_json_string_trailing_comma():
    malformed_json = '{"functional_requirements": ["req 1", "req 2",],}'
    repaired = repair_json_string(malformed_json)
    assert repaired == '{"functional_requirements": ["req 1", "req 2"]}'


def test_parse_and_validate_success():
    raw = '```json\n{"functional_requirements": ["F1", "F2"], "risks": ["R1"]}\n```'
    model = parse_and_validate(raw, RequirementAnalysisOutput)
    assert model.functional_requirements == ["F1", "F2"]
    assert model.risks == ["R1"]


@pytest.mark.asyncio
async def test_mock_ai_provider_completion():
    provider = MockAIProvider()
    result = await provider.complete_prompt("Analyze requirement functional_requirements...")
    assert "raw_response" in result
    assert "functional_requirements" in result["raw_response"]


@pytest.mark.asyncio
async def test_ai_service_analyze_requirement():
    service = AIService(provider=MockAIProvider())
    structured, raw_text, tokens, provider_name = await service.analyze_requirement(
        title="User Login", description="User logs in with email and password."
    )
    assert isinstance(structured, RequirementAnalysisOutput)
    assert len(structured.functional_requirements) > 0
    assert provider_name == "MockAIProvider"
