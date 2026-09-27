from typing import List, Optional, Union
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.test_case import TestCase
from app.models.test_execution import TestExecution
from app.schemas.test_case import TestCaseCreate, TestCaseUpdate
from app.schemas.test_execution import ExecutionCreate
from app.services.project_service import ProjectService
from app.services.requirement_service import RequirementService


class TestCaseService:
    @staticmethod
    def create_test_case(
        db: Session, tc_in: TestCaseCreate, user_id: int
    ) -> TestCase:
        # Verify user owns the project
        ProjectService.get_project_by_id(db, tc_in.project_id, user_id)
        # Verify requirement exists & user owns it
        RequirementService.get_requirement_by_id(db, tc_in.requirement_id, user_id)

        # Auto-generate custom ID if missing
        custom_id = tc_in.custom_id
        if not custom_id:
            count = (
                db.query(TestCase)
                .filter(TestCase.project_id == tc_in.project_id)
                .count()
            )
            custom_id = f"TC-{count + 1:03d}"

        # Ensure steps is formatted as list or string
        steps_val = tc_in.steps
        if isinstance(steps_val, str):
            steps_val = [s.strip() for s in steps_val.split("\n") if s.strip()]

        test_case = TestCase(
            custom_id=custom_id,
            title=tc_in.title,
            objective=tc_in.objective,
            preconditions=tc_in.preconditions,
            test_data=tc_in.test_data,
            steps=steps_val,
            expected_result=tc_in.expected_result,
            test_type=tc_in.test_type or "Functional",
            priority=tc_in.priority or "P2",
            severity=tc_in.severity or "Medium",
            category=tc_in.category or "Functional",
            status=tc_in.status or "Not Run",
            project_id=tc_in.project_id,
            requirement_id=tc_in.requirement_id,
            scenario_id=tc_in.scenario_id,
            created_by=user_id,
        )
        db.add(test_case)
        db.commit()
        db.refresh(test_case)
        return test_case

    @staticmethod
    def get_test_cases(
        db: Session,
        user_id: int,
        project_id: Optional[int] = None,
        requirement_id: Optional[int] = None,
        scenario_id: Optional[int] = None,
        priority: Optional[str] = None,
        test_type: Optional[str] = None,
        status_filter: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[TestCase]:
        query = db.query(TestCase)

        if project_id:
            ProjectService.get_project_by_id(db, project_id, user_id)
            query = query.filter(TestCase.project_id == project_id)
        else:
            projects = ProjectService.get_projects(db, user_id)
            project_ids = [p.id for p in projects]
            query = query.filter(TestCase.project_id.in_(project_ids))

        if requirement_id:
            query = query.filter(TestCase.requirement_id == requirement_id)
        if scenario_id:
            query = query.filter(TestCase.scenario_id == scenario_id)
        if priority:
            query = query.filter(TestCase.priority == priority)
        if test_type:
            query = query.filter(TestCase.test_type == test_type)
        if status_filter:
            query = query.filter(TestCase.status == status_filter)
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                (TestCase.title.ilike(search_term))
                | (TestCase.objective.ilike(search_term))
                | (TestCase.custom_id.ilike(search_term))
            )

        return query.all()

    @staticmethod
    def get_test_case_by_id(db: Session, tc_id: int, user_id: int) -> TestCase:
        tc = db.query(TestCase).filter(TestCase.id == tc_id).first()
        if not tc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Test case not found",
            )
        ProjectService.get_project_by_id(db, tc.project_id, user_id)
        return tc

    @staticmethod
    def update_test_case(
        db: Session, tc_id: int, tc_in: TestCaseUpdate, user_id: int
    ) -> TestCase:
        tc = TestCaseService.get_test_case_by_id(db, tc_id, user_id)

        if tc_in.custom_id is not None:
            tc.custom_id = tc_in.custom_id
        if tc_in.title is not None:
            tc.title = tc_in.title
        if tc_in.objective is not None:
            tc.objective = tc_in.objective
        if tc_in.preconditions is not None:
            tc.preconditions = tc_in.preconditions
        if tc_in.test_data is not None:
            tc.test_data = tc_in.test_data
        if tc_in.steps is not None:
            steps_val = tc_in.steps
            if isinstance(steps_val, str):
                steps_val = [s.strip() for s in steps_val.split("\n") if s.strip()]
            tc.steps = steps_val
        if tc_in.expected_result is not None:
            tc.expected_result = tc_in.expected_result
        if tc_in.test_type is not None:
            tc.test_type = tc_in.test_type
        if tc_in.priority is not None:
            tc.priority = tc_in.priority
        if tc_in.severity is not None:
            tc.severity = tc_in.severity
        if tc_in.category is not None:
            tc.category = tc_in.category
        if tc_in.status is not None:
            tc.status = tc_in.status

        db.commit()
        db.refresh(tc)
        return tc

    @staticmethod
    def delete_test_case(db: Session, tc_id: int, user_id: int) -> None:
        tc = TestCaseService.get_test_case_by_id(db, tc_id, user_id)
        db.delete(tc)
        db.commit()

    @staticmethod
    def execute_test_case(
        db: Session, exec_in: ExecutionCreate, user_id: int
    ) -> TestExecution:
        tc = TestCaseService.get_test_case_by_id(db, exec_in.test_case_id, user_id)

        # Update test case status
        tc.status = exec_in.status
        db.add(tc)

        # Create execution record
        execution = TestExecution(
            test_case_id=tc.id,
            executed_by=user_id,
            actual_result=exec_in.actual_result,
            status=exec_in.status,
            notes=exec_in.notes,
        )
        db.add(execution)

        db.commit()
        db.refresh(execution)
        return execution
