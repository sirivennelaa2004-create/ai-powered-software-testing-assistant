from typing import List, Optional
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User
from app.models.ai_analysis import AIAnalysis
from app.schemas.bug_report import BugCreate, BugUpdate, BugResponse
from app.schemas.ai import AIAnalysisResponse, DeepBugAnalysisOutput
from app.services.bug_service import BugService
from app.ai.service import AIService
from app.routers.deps import get_current_active_user

router = APIRouter(prefix="/bugs", tags=["Bug Reporting & AI Diagnostics"])


@router.post("", response_model=BugResponse, status_code=status.HTTP_201_CREATED)
def create_bug(
    bug_in: BugCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Log a new bug report under a project owned by user."""
    return BugService.create_bug(db, bug_in, current_user.id)


@router.get("", response_model=List[BugResponse])
def list_bugs(
    project_id: Optional[int] = Query(None, description="Filter by Project ID"),
    severity: Optional[str] = Query(None, description="Filter by Severity"),
    priority: Optional[str] = Query(None, description="Filter by Priority"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by Status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """List bug reports with optional filters."""
    return BugService.get_bugs(
        db,
        current_user.id,
        project_id=project_id,
        severity=severity,
        priority=priority,
        status_filter=status_filter,
    )


@router.get("/{bug_id}", response_model=BugResponse)
def get_bug(
    bug_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get single bug report by ID."""
    return BugService.get_bug_by_id(db, bug_id, current_user.id)


@router.put("/{bug_id}", response_model=BugResponse)
def update_bug(
    bug_id: int,
    bug_in: BugUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Update bug report status, severity, priority, or description."""
    return BugService.update_bug(db, bug_id, bug_in, current_user.id)


@router.delete("/{bug_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_bug(
    bug_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Delete bug report."""
    BugService.delete_bug(db, bug_id, current_user.id)
    return None


@router.get("/{bug_id}/analyses", response_model=List[AIAnalysisResponse])
def get_bug_analyses(
    bug_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get AI analysis history for a bug report."""
    BugService.get_bug_by_id(db, bug_id, current_user.id)
    analyses = (
        db.query(AIAnalysis)
        .filter(
            AIAnalysis.entity_type == "bug",
            AIAnalysis.bug_report_id == bug_id,
        )
        .all()
    )
    return analyses


# ----------------------------------------------------
# AI BUG DIAGNOSTICS: Part 3 Requirement
# ----------------------------------------------------


@router.post("/{bug_id}/analyze", response_model=AIAnalysisResponse)
@router.post("/{bug_id}/analyze-ai", response_model=AIAnalysisResponse)
async def analyze_bug_ai(
    bug_id: int,
    auto_update_severity_priority: bool = Query(
        True, description="Optionally update bug severity and priority with AI suggestions"
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Part 3: Deep AI Bug Diagnostics.
    Analyzes root causes, severity, priority, affected area, reproduction quality, debugging questions, and recommended next steps.
    """
    bug = BugService.get_bug_by_id(db, bug_id, current_user.id)

    ai_service = AIService()
    structured, raw_text, tokens, provider_name = await ai_service.analyze_bug_deep(
        title=bug.title,
        description=bug.description,
        steps=bug.steps_to_reproduce,
        expected_result=bug.expected_result,
        actual_result=bug.actual_result,
        environment=bug.environment,
    )

    if auto_update_severity_priority:
        bug.severity = structured.suggested_severity
        bug.priority = structured.suggested_priority
        db.add(bug)

    analysis_record = AIAnalysis(
        entity_type="bug",
        bug_report_id=bug.id,
        raw_response=raw_text,
        structured_result=structured.model_dump(),
        provider=provider_name,
        tokens_used=tokens,
    )
    db.add(analysis_record)
    db.commit()
    db.refresh(analysis_record)

    return analysis_record
