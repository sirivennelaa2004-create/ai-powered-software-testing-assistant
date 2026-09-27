from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class ExecutionCreate(BaseModel):
    test_case_id: int
    actual_result: str = Field(..., min_length=1)
    status: str = Field(..., description="Passed, Failed, Blocked")
    notes: Optional[str] = None
    create_bug_if_failed: Optional[bool] = True


class ExecutionResponse(BaseModel):
    id: int
    test_case_id: int
    executed_by: Optional[int] = None
    execution_time: datetime
    actual_result: str
    status: str
    notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
