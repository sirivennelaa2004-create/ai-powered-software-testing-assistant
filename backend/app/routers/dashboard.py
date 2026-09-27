from typing import Dict
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User
from app.models.project import Project
from app.models.requirement import Requirement
from app.models.test_case import TestCase
from app.models.test_execution import TestExecution
from app.models.bug_report import BugReport
from app.schemas.dashboard import DashboardStatsResponse
from app.services.project_service import ProjectService
from app.routers.deps import get_current_active_user

router = APIRouter(prefix="/dashboard", tags=["Testing Dashboard"])


@router.get("/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(
    project_id: int = Query(None, description="Optional Project ID filter"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Fetch comprehensive dashboard metrics, pass rate calculations, distribution counts, and recent activity.
    """
    projects = ProjectService.get_projects(db, current_user.id)
    project_ids = [p.id for p in projects]

    if project_id:
        ProjectService.get_project_by_id(db, project_id, current_user.id)
        filtered_project_ids = [project_id]
    else:
        filtered_project_ids = project_ids

    if not filtered_project_ids:
        return DashboardStatsResponse(
            total_projects=0,
            total_requirements=0,
            total_test_cases=0,
            total_executions=0,
            total_bugs=0,
            pass_rate_percentage=0.0,
            test_case_status_distribution={},
            test_case_type_distribution={},
            bug_severity_distribution={},
            bug_status_distribution={},
            recent_activity=[],
        )

    # Requirements count
    total_requirements = (
        db.query(Requirement)
        .filter(Requirement.project_id.in_(filtered_project_ids))
        .count()
    )

    # Test Cases queries
    test_cases_query = db.query(TestCase).filter(
        TestCase.project_id.in_(filtered_project_ids)
    )
    test_cases = test_cases_query.all()
    total_test_cases = len(test_cases)

    # Status distribution
    status_dist: Dict[str, int] = {}
    type_dist: Dict[str, int] = {}
    for tc in test_cases:
        status_dist[tc.status] = status_dist.get(tc.status, 0) + 1
        type_dist[tc.test_type] = type_dist.get(tc.test_type, 0) + 1

    # Executions count & pass rate
    tc_ids = [tc.id for tc in test_cases]
    total_executions = 0
    pass_rate = 0.0

    if tc_ids:
        executions = (
            db.query(TestExecution)
            .filter(TestExecution.test_case_id.in_(tc_ids))
            .all()
        )
        total_executions = len(executions)

    passed_tc_count = status_dist.get("Passed", 0)
    executed_tc_count = (
        passed_tc_count + status_dist.get("Failed", 0) + status_dist.get("Blocked", 0)
    )
    if executed_tc_count > 0:
        pass_rate = round((passed_tc_count / executed_tc_count) * 100, 1)

    # Bugs queries
    bugs_query = db.query(BugReport).filter(
        BugReport.project_id.in_(filtered_project_ids)
    )
    bugs = bugs_query.all()
    total_bugs = len(bugs)

    bug_severity_dist: Dict[str, int] = {}
    bug_status_dist: Dict[str, int] = {}
    for b in bugs:
        bug_severity_dist[b.severity] = bug_severity_dist.get(b.severity, 0) + 1
        bug_status_dist[b.status] = bug_status_dist.get(b.status, 0) + 1

    # Recent activity log
    recent_activity = []
    # Add recent bugs
    recent_bugs = (
        db.query(BugReport)
        .filter(BugReport.project_id.in_(filtered_project_ids))
        .order_by(BugReport.created_at.desc())
        .limit(3)
        .all()
    )
    for b in recent_bugs:
        recent_activity.append(
            {
                "type": "bug",
                "title": f"Bug logged: {b.title}",
                "timestamp": b.created_at.isoformat(),
                "status": b.status,
            }
        )

    # Add recent executions
    if tc_ids:
        recent_execs = (
            db.query(TestExecution)
            .filter(TestExecution.test_case_id.in_(tc_ids))
            .order_by(TestExecution.execution_time.desc())
            .limit(4)
            .all()
        )
        for ex in recent_execs:
            recent_activity.append(
                {
                    "type": "execution",
                    "title": f"Test Execution recorded ({ex.status})",
                    "timestamp": ex.execution_time.isoformat(),
                    "status": ex.status,
                }
            )

    return DashboardStatsResponse(
        total_projects=len(projects),
        total_requirements=total_requirements,
        total_test_cases=total_test_cases,
        total_executions=total_executions,
        total_bugs=total_bugs,
        pass_rate_percentage=pass_rate,
        test_case_status_distribution=status_dist,
        test_case_type_distribution=type_dist,
        bug_severity_distribution=bug_severity_dist,
        bug_status_distribution=bug_status_dist,
        recent_activity=recent_activity,
    )
