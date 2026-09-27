from datetime import datetime
from typing import Optional, List, Union
from pydantic import BaseModel, Field, ConfigDict


class TestCaseCreate(BaseModel):
    custom_id: Optional[str] = None
    title: str = Field(..., min_length=3, max_length=255)
    objective: Optional[str] = None
    preconditions: Optional[str] = None
    test_data: Optional[str] = None
    steps: Union[List[str], str] = []
    expected_result: str
    test_type: Optional[str] = "Functional"
    priority: Optional[str] = "P2"
    severity: Optional[str] = "Medium"
    category: Optional[str] = "Functional"
    project_id: int
    requirement_id: int
    scenario_id: Optional[int] = None
    status: Optional[str] = "Not Run"


class TestCaseUpdate(BaseModel):
    custom_id: Optional[str] = None
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    objective: Optional[str] = None
    preconditions: Optional[str] = None
    test_data: Optional[str] = None
    steps: Optional[Union[List[str], str]] = None
    expected_result: Optional[str] = None
    test_type: Optional[str] = None
    priority: Optional[str] = None
    severity: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None


class TestCaseResponse(BaseModel):
    id: int
    custom_id: Optional[str] = None
    title: str
    objective: Optional[str] = None
    preconditions: Optional[str] = None
    test_data: Optional[str] = None
    steps: Union[List[str], str]
    expected_result: str
    test_type: str
    priority: str
    severity: str
    category: str
    status: str
    project_id: int
    requirement_id: int
    scenario_id: Optional[int] = None
    created_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
