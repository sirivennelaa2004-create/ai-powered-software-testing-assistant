from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class ScenarioCreate(BaseModel):
    requirement_id: int
    title: str
    description: Optional[str] = None
    scenario_type: Optional[str] = "Positive"


class ScenarioResponse(BaseModel):
    id: int
    requirement_id: int
    title: str
    description: Optional[str] = None
    scenario_type: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
