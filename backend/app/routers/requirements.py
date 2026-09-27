from typing import List, Optional
from fastapi import APIRouter, Depends, status, Query, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User
from app.models.test_scenario import TestScenario
from app.models.ai_analysis import AIAnalysis
from app.schemas.requirement import (
    RequirementCreate,
    RequirementUpdate,
    RequirementResponse,
)
from app.schemas.test_scenario import ScenarioResponse
from app.schemas.test_case import TestCaseResponse, TestCaseCreate
from app.schemas.ai import (
    RequirementAnalysisOutput,
    ScenariosGenerationOutput,
    TestCasesGenerationOutput,
    AIAnalysisResponse,
)
from app.services.requirement_service import RequirementService
from app.services.test_case_service import TestCaseService
from app.ai.service import AIService
from app.routers.deps import get_current_active_user

router = APIRouter(prefix="/requirements", tags=["Requirement & AI Generator Management"])


@router.post("", response_model=RequirementResponse, status_code=status.HTTP_201_CREATED)
def create_requirement(
    req_in: RequirementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Create a new requirement under a project owned by user."""
    return RequirementService.create_requirement(db, req_in, current_user.id)


@router.get("", response_model=List[RequirementResponse])
def list_requirements(
    project_id: Optional[int] = Query(None, description="Filter by Project ID"),
    priority: Optional[str] = Query(None, description="Filter by Priority"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by Status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """List requirements with optional filters."""
    return RequirementService.get_requirements(
        db, current_user.id, project_id=project_id, priority=priority, status_filter=status_filter
    )


@router.get("/{req_id}", response_model=RequirementResponse)
def get_requirement(
    req_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get requirement by ID."""
    return RequirementService.get_requirement_by_id(db, req_id, current_user.id)


@router.put("/{req_id}", response_model=RequirementResponse)
def update_requirement(
    req_id: int,
    req_in: RequirementUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Update requirement details."""
    return RequirementService.update_requirement(db, req_id, req_in, current_user.id)


@router.delete("/{req_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_requirement(
    req_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Delete requirement."""
    RequirementService.delete_requirement(db, req_id, current_user.id)
    return None


@router.get("/{req_id}/scenarios", response_model=List[ScenarioResponse])
def get_requirement_scenarios(
    req_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get saved test scenarios for a requirement."""
    req = RequirementService.get_requirement_by_id(db, req_id, current_user.id)
    return req.scenarios


@router.get("/{req_id}/analyses", response_model=List[AIAnalysisResponse])
def get_requirement_analyses(
    req_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get saved AI requirement analyses for a requirement."""
    RequirementService.get_requirement_by_id(db, req_id, current_user.id)
    analyses = (
        db.query(AIAnalysis)
        .filter(
            AIAnalysis.entity_type == "requirement",
            AIAnalysis.requirement_id == req_id,
        )
        .all()
    )
    return analyses


# ----------------------------------------------------
# AI ENDPOINTS: Requirement Analysis, Scenarios & Granular Test Case Generators
# ----------------------------------------------------


@router.post("/{req_id}/analyze", response_model=AIAnalysisResponse)
async def analyze_requirement_ai(
    req_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Phase 7: AI Requirement Analysis."""
    req = RequirementService.get_requirement_by_id(db, req_id, current_user.id)

    ai_service = AIService()
    structured, raw_text, tokens, provider_name = await ai_service.analyze_requirement(
        title=req.title, description=req.description
    )

    analysis_record = AIAnalysis(
        entity_type="requirement",
        requirement_id=req.id,
        raw_response=raw_text,
        structured_result=structured.model_dump(),
        provider=provider_name,
        tokens_used=tokens,
    )
    db.add(analysis_record)
    db.commit()
    db.refresh(analysis_record)

    return analysis_record


@router.post("/{req_id}/generate-scenarios", response_model=List[ScenarioResponse])
async def generate_scenarios_ai(
    req_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Phase 8: AI Test Scenario Generation."""
    req = RequirementService.get_requirement_by_id(db, req_id, current_user.id)

    ai_service = AIService()
    structured, raw_text, tokens, provider_name = await ai_service.generate_scenarios(
        title=req.title, description=req.description
    )

    created_scenarios = []
    for item in structured.scenarios:
        scenario = TestScenario(
            requirement_id=req.id,
            title=item.title,
            description=item.description,
            scenario_type=item.scenario_type,
        )
        db.add(scenario)
        created_scenarios.append(scenario)

    db.commit()
    for sc in created_scenarios:
        db.refresh(sc)

    return created_scenarios


async def _helper_generate_tcs(
    req_id: int, target_focus: str, db: Session, current_user: User
) -> List[TestCaseResponse]:
    req = RequirementService.get_requirement_by_id(db, req_id, current_user.id)
    ai_service = AIService()
    structured, _, _, _ = await ai_service.generate_test_cases(
        req_title=req.title,
        req_description=req.description,
        scenario_title=f"{target_focus} Testing",
        scenario_type=target_focus,
        target_focus=target_focus,
    )

    created_tcs = []
    for item in structured.test_cases:
        tc_in = TestCaseCreate(
            custom_id=item.custom_id,
            title=item.title,
            objective=item.objective,
            preconditions=item.preconditions,
            test_data=item.test_data,
            steps=item.steps,
            expected_result=item.expected_result,
            test_type=item.test_type or target_focus,
            priority=item.priority,
            severity=item.severity,
            category=item.category,
            project_id=req.project_id,
            requirement_id=req.id,
            status="Not Run",
        )
        tc_obj = TestCaseService.create_test_case(db, tc_in, current_user.id)
        created_tcs.append(tc_obj)

    return created_tcs


@router.post("/{req_id}/generate-test-cases", response_model=List[TestCaseResponse])
async def generate_test_cases_ai(
    req_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Generate general test cases."""
    return await _helper_generate_tcs(req_id, "All", db, current_user)


@router.post("/{req_id}/generate-positive-test-cases", response_model=List[TestCaseResponse])
async def generate_positive_test_cases_ai(
    req_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Generate Positive test cases."""
    return await _helper_generate_tcs(req_id, "Positive", db, current_user)


@router.post("/{req_id}/generate-negative-test-cases", response_model=List[TestCaseResponse])
async def generate_negative_test_cases_ai(
    req_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Generate Negative test cases."""
    return await _helper_generate_tcs(req_id, "Negative", db, current_user)


@router.post("/{req_id}/generate-edge-test-cases", response_model=List[TestCaseResponse])
async def generate_edge_test_cases_ai(
    req_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Generate Edge case test cases."""
    return await _helper_generate_tcs(req_id, "Edge Case", db, current_user)


@router.post("/{req_id}/generate-boundary-test-cases", response_model=List[TestCaseResponse])
async def generate_boundary_test_cases_ai(
    req_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Generate Boundary-value analysis test cases."""
    return await _helper_generate_tcs(req_id, "Boundary", db, current_user)
