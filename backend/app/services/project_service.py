from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate


class ProjectService:
    @staticmethod
    def create_project(db: Session, project_in: ProjectCreate, user_id: int) -> Project:
        project = Project(
            name=project_in.name,
            description=project_in.description,
            owner_id=user_id,
        )
        db.add(project)
        db.commit()
        db.refresh(project)
        return project

    @staticmethod
    def get_projects(db: Session, user_id: int) -> List[Project]:
        return db.query(Project).filter(Project.owner_id == user_id).all()

    @staticmethod
    def get_project_by_id(db: Session, project_id: int, user_id: int) -> Project:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found",
            )
        if project.owner_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this project",
            )
        return project

    @staticmethod
    def update_project(
        db: Session, project_id: int, project_in: ProjectUpdate, user_id: int
    ) -> Project:
        project = ProjectService.get_project_by_id(db, project_id, user_id)
        if project_in.name is not None:
            project.name = project_in.name
        if project_in.description is not None:
            project.description = project_in.description
        db.commit()
        db.refresh(project)
        return project

    @staticmethod
    def delete_project(db: Session, project_id: int, user_id: int) -> None:
        project = ProjectService.get_project_by_id(db, project_id, user_id)
        db.delete(project)
        db.commit()
