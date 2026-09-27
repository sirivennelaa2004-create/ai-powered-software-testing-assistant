from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.requirement import Requirement
from app.schemas.requirement import RequirementCreate, RequirementUpdate
from app.services.project_service import ProjectService


class RequirementService:
    @staticmethod
    def create_requirement(
        db: Session, req_in: RequirementCreate, user_id: int
    ) -> Requirement:
        # Verify user owns the project
        ProjectService.get_project_by_id(db, req_in.project_id, user_id)

        requirement = Requirement(
            title=req_in.title,
            description=req_in.description,
            project_id=req_in.project_id,
            priority=req_in.priority or "Medium",
            status=req_in.status or "Draft",
            created_by=user_id,
        )
        db.add(requirement)
        db.commit()
        db.refresh(requirement)
        return requirement

    @staticmethod
    def get_requirements(
        db: Session,
        user_id: int,
        project_id: Optional[int] = None,
        priority: Optional[str] = None,
        status_filter: Optional[str] = None,
    ) -> List[Requirement]:
        query = db.query(Requirement)
        if project_id:
            # Verify user owns the project
            ProjectService.get_project_by_id(db, project_id, user_id)
            query = query.filter(Requirement.project_id == project_id)
        else:
            # Get user's projects first
            projects = ProjectService.get_projects(db, user_id)
            project_ids = [p.id for p in projects]
            query = query.filter(Requirement.project_id.in_(project_ids))

        if priority:
            query = query.filter(Requirement.priority == priority)
        if status_filter:
            query = query.filter(Requirement.status == status_filter)

        return query.all()

    @staticmethod
    def get_requirement_by_id(
        db: Session, req_id: int, user_id: int
    ) -> Requirement:
        req = db.query(Requirement).filter(Requirement.id == req_id).first()
        if not req:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Requirement not found",
            )
        # Verify user owns the associated project
        ProjectService.get_project_by_id(db, req.project_id, user_id)
        return req

    @staticmethod
    def update_requirement(
        db: Session, req_id: int, req_in: RequirementUpdate, user_id: int
    ) -> Requirement:
        req = RequirementService.get_requirement_by_id(db, req_id, user_id)

        if req_in.title is not None:
            req.title = req_in.title
        if req_in.description is not None:
            req.description = req_in.description
        if req_in.priority is not None:
            req.priority = req_in.priority
        if req_in.status is not None:
            req.status = req_in.status

        db.commit()
        db.refresh(req)
        return req

    @staticmethod
    def delete_requirement(db: Session, req_id: int, user_id: int) -> None:
        req = RequirementService.get_requirement_by_id(db, req_id, user_id)
        db.delete(req)
        db.commit()
