from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.bug_report import BugReport
from app.schemas.bug_report import BugCreate, BugUpdate
from app.services.project_service import ProjectService


class BugService:
    @staticmethod
    def create_bug(db: Session, bug_in: BugCreate, user_id: int) -> BugReport:
        # Verify user owns the project
        ProjectService.get_project_by_id(db, bug_in.project_id, user_id)

        bug = BugReport(
            title=bug_in.title,
            description=bug_in.description,
            steps_to_reproduce=bug_in.steps_to_reproduce,
            expected_result=bug_in.expected_result,
            actual_result=bug_in.actual_result,
            environment=bug_in.environment or "Staging / QA",
            severity=bug_in.severity or "Medium",
            priority=bug_in.priority or "P2",
            status=bug_in.status or "Open",
            project_id=bug_in.project_id,
            test_case_id=bug_in.test_case_id,
            created_by=user_id,
        )
        db.add(bug)
        db.commit()
        db.refresh(bug)
        return bug

    @staticmethod
    def get_bugs(
        db: Session,
        user_id: int,
        project_id: Optional[int] = None,
        severity: Optional[str] = None,
        priority: Optional[str] = None,
        status_filter: Optional[str] = None,
    ) -> List[BugReport]:
        query = db.query(BugReport)

        if project_id:
            ProjectService.get_project_by_id(db, project_id, user_id)
            query = query.filter(BugReport.project_id == project_id)
        else:
            projects = ProjectService.get_projects(db, user_id)
            project_ids = [p.id for p in projects]
            query = query.filter(BugReport.project_id.in_(project_ids))

        if severity:
            query = query.filter(BugReport.severity == severity)
        if priority:
            query = query.filter(BugReport.priority == priority)
        if status_filter:
            query = query.filter(BugReport.status == status_filter)

        return query.all()

    @staticmethod
    def get_bug_by_id(db: Session, bug_id: int, user_id: int) -> BugReport:
        bug = db.query(BugReport).filter(BugReport.id == bug_id).first()
        if not bug:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bug report not found",
            )
        ProjectService.get_project_by_id(db, bug.project_id, user_id)
        return bug

    @staticmethod
    def update_bug(
        db: Session, bug_id: int, bug_in: BugUpdate, user_id: int
    ) -> BugReport:
        bug = BugService.get_bug_by_id(db, bug_id, user_id)

        if bug_in.title is not None:
            bug.title = bug_in.title
        if bug_in.description is not None:
            bug.description = bug_in.description
        if bug_in.steps_to_reproduce is not None:
            bug.steps_to_reproduce = bug_in.steps_to_reproduce
        if bug_in.expected_result is not None:
            bug.expected_result = bug_in.expected_result
        if bug_in.actual_result is not None:
            bug.actual_result = bug_in.actual_result
        if bug_in.environment is not None:
            bug.environment = bug_in.environment
        if bug_in.severity is not None:
            bug.severity = bug_in.severity
        if bug_in.priority is not None:
            bug.priority = bug_in.priority
        if bug_in.status is not None:
            bug.status = bug_in.status

        db.commit()
        db.refresh(bug)
        return bug

    @staticmethod
    def delete_bug(db: Session, bug_id: int, user_id: int) -> None:
        bug = BugService.get_bug_by_id(db, bug_id, user_id)
        db.delete(bug)
        db.commit()
