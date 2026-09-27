from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class RequirementCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=5)
    project_id: int
    priority: Optional[str] = "Medium"
    status: Optional[str] = "Draft"


class RequirementUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, min_length=5)
    priority: Optional[str] = None
    status: Optional[str] = None


class RequirementResponse(BaseModel):
    id: int
    title: str
    description: str
    project_id: int
    priority: str
    status: str
    created_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
