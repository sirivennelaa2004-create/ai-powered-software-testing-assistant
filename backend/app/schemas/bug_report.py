from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class BugCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: str = Field(..., min_length=5)
    steps_to_reproduce: Optional[str] = None
    expected_result: Optional[str] = None
    actual_result: Optional[str] = None
    environment: Optional[str] = "Staging / QA"
    severity: Optional[str] = "Medium"
    priority: Optional[str] = "P2"
    status: Optional[str] = "Open"
    project_id: int
    test_case_id: Optional[int] = None


class BugUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = Field(None, min_length=5)
    steps_to_reproduce: Optional[str] = None
    expected_result: Optional[str] = None
    actual_result: Optional[str] = None
    environment: Optional[str] = None
    severity: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None


class BugResponse(BaseModel):
    id: int
    title: str
    description: str
    steps_to_reproduce: Optional[str] = None
    expected_result: Optional[str] = None
    actual_result: Optional[str] = None
    environment: str
    severity: str
    priority: str
    status: str
    project_id: int
    test_case_id: Optional[int] = None
    created_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
