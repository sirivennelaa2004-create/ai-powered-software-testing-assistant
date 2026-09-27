from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field


class RequirementAnalysisOutput(BaseModel):
    functional_requirements: List[str] = Field(default_factory=list)
    possible_assumptions: List[str] = Field(default_factory=list)
    missing_information: List[str] = Field(default_factory=list)
    testable_conditions: List[str] = Field(default_factory=list)
    risks: List[str] = Field(default_factory=list)
    important_validation_points: List[str] = Field(default_factory=list)


class ScenarioItem(BaseModel):
    title: str
    description: Optional[str] = None
    scenario_type: str = Field(
        default="Positive",
        description="Positive, Negative, Edge Case, Boundary, Security, Validation",
    )


class ScenariosGenerationOutput(BaseModel):
    scenarios: List[ScenarioItem] = Field(default_factory=list)


class TestCaseGenItem(BaseModel):
    custom_id: Optional[str] = None
    title: str
    objective: Optional[str] = None
    preconditions: Optional[str] = None
    test_data: Optional[str] = None
    steps: List[str] = Field(default_factory=list)
    expected_result: str
    test_type: str = Field(default="Functional")
    priority: str = Field(default="P2")
    severity: str = Field(default="Medium")
    category: str = Field(default="Functional")


class TestCasesGenerationOutput(BaseModel):
    test_cases: List[TestCaseGenItem] = Field(default_factory=list)


class BugAnalysisOutput(BaseModel):
    root_cause_analysis: str
    suggested_severity: str = Field(default="Medium", description="Critical, High, Medium, Low")
    suggested_priority: str = Field(default="P2", description="P0, P1, P2, P3")
    recommended_fix_steps: List[str] = Field(default_factory=list)
    additional_test_recommendations: List[str] = Field(default_factory=list)


class DeepBugAnalysisOutput(BaseModel):
    possible_root_causes: List[str] = Field(default_factory=list)
    suggested_severity: str = Field(default="Medium")
    suggested_priority: str = Field(default="P2")
    affected_area: str = Field(default="Backend / Core Service")
    missing_information: List[str] = Field(default_factory=list)
    reproduction_quality: str = Field(default="Clear and Reproducible")
    additional_debugging_questions: List[str] = Field(default_factory=list)
    recommended_next_testing_steps: List[str] = Field(default_factory=list)


class TestCaseQualityOutput(BaseModel):
    quality_score: int = Field(..., ge=0, le=100, description="AI-generated quality assessment score from 0 to 100")
    issues: List[str] = Field(default_factory=list)
    suggestions: List[str] = Field(default_factory=list)
    improved_test_case: Optional[TestCaseGenItem] = None


class AIAnalysisResponse(BaseModel):
    id: int
    entity_type: str
    requirement_id: Optional[int] = None
    bug_report_id: Optional[int] = None
    structured_result: Dict[str, Any]
    provider: str
    tokens_used: int
    created_at: datetime

    class Config:
        from_attributes = True
