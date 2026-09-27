from typing import List, Optional
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User
from app.schemas.test_case import (
    TestCaseCreate,
    TestCaseUpdate,
    TestCaseResponse,
)
from app.schemas.test_execution import ExecutionCreate, ExecutionResponse
from app.schemas.bug_report import BugCreate, BugResponse
from app.schemas.ai import TestCaseQualityOutput
from app.services.test_case_service import TestCaseService
from app.services.bug_service import BugService
from app.ai.service import AIService
from app.routers.deps import get_current_active_user

router = APIRouter(prefix="/test-cases", tags=["Test Case Management & Execution"])


@router.post("", response_model=TestCaseResponse, status_code=status.HTTP_201_CREATED)
def create_test_case(
    tc_in: TestCaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Create a new test case manually."""
    return TestCaseService.create_test_case(db, tc_in, current_user.id)


@router.get("", response_model=List[TestCaseResponse])
def list_test_cases(
    project_id: Optional[int] = Query(None, description="Filter by Project ID"),
    requirement_id: Optional[int] = Query(None, description="Filter by Requirement ID"),
    scenario_id: Optional[int] = Query(None, description="Filter by Scenario ID"),
    priority: Optional[str] = Query(None, description="Filter by Priority (P0, P1, P2, P3)"),
    test_type: Optional[str] = Query(None, description="Filter by Test Type"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by Status"),
    search: Optional[str] = Query(None, description="Search term for title or custom_id"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """List test cases with flexible search and filtering."""
    return TestCaseService.get_test_cases(
        db,
        current_user.id,
        project_id=project_id,
        requirement_id=requirement_id,
        scenario_id=scenario_id,
        priority=priority,
        test_type=test_type,
        status_filter=status_filter,
        search=search,
    )


@router.get("/{tc_id}", response_model=TestCaseResponse)
def get_test_case(
    tc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get single test case by ID."""
    return TestCaseService.get_test_case_by_id(db, tc_id, current_user.id)


@router.put("/{tc_id}", response_model=TestCaseResponse)
def update_test_case(
    tc_id: int,
    tc_in: TestCaseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Update test case details."""
    return TestCaseService.update_test_case(db, tc_id, tc_in, current_user.id)


@router.delete("/{tc_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_test_case(
    tc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Delete test case."""
    TestCaseService.delete_test_case(db, tc_id, current_user.id)
    return None


# ----------------------------------------------------
# QUALITY ANALYSIS: Part 4 Requirement
# ----------------------------------------------------


@router.post("/{tc_id}/analyze-quality", response_model=TestCaseQualityOutput)
async def analyze_test_case_quality(
    tc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Part 4: Test Case Quality Analysis.
    Audits test case clarity, completeness, missing test data/preconditions, returning quality score, issues, and improved version.
    """
    tc = TestCaseService.get_test_case_by_id(db, tc_id, current_user.id)

    ai_service = AIService()
    structured, _, _, _ = await ai_service.analyze_test_case_quality(
        title=tc.title,
        objective=tc.objective,
        preconditions=tc.preconditions,
        test_data=tc.test_data,
        steps=tc.steps,
        expected_result=tc.expected_result,
        test_type=tc.test_type,
        priority=tc.priority,
    )

    return structured


# ----------------------------------------------------
# EXECUTION ENDPOINTS
# ----------------------------------------------------


@router.post("/{tc_id}/execute", response_model=ExecutionResponse)
def execute_test_case(
    tc_id: int,
    exec_in: ExecutionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Execute a test case and update its status."""
    exec_in.test_case_id = tc_id
    execution = TestCaseService.execute_test_case(db, exec_in, current_user.id)

    if exec_in.status.lower() == "failed" and exec_in.create_bug_if_failed:
        tc = TestCaseService.get_test_case_by_id(db, tc_id, current_user.id)
        bug_in = BugCreate(
            title=f"Bug: {tc.title} Failed Execution",
            description=f"Automated bug report logged during test execution.\nObjective: {tc.objective}",
            steps_to_reproduce="\n".join(tc.steps) if isinstance(tc.steps, list) else str(tc.steps),
            expected_result=tc.expected_result,
            actual_result=exec_in.actual_result,
            environment="Staging / QA",
            severity=tc.severity,
            priority=tc.priority,
            status="Open",
            project_id=tc.project_id,
            test_case_id=tc.id,
        )
        BugService.create_bug(db, bug_in, current_user.id)

    return execution


@router.get("/{tc_id}/executions", response_model=List[ExecutionResponse])
def get_test_case_executions(
    tc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get history of execution runs for a test case."""
    tc = TestCaseService.get_test_case_by_id(db, tc_id, current_user.id)
    return tc.executions
