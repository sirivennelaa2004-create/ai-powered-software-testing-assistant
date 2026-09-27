from typing import Dict, List
from pydantic import BaseModel


class StatusCount(BaseModel):
    name: str
    count: int


class DashboardStatsResponse(BaseModel):
    total_projects: int
    total_requirements: int
    total_test_cases: int
    total_executions: int
    total_bugs: int
    pass_rate_percentage: float
    test_case_status_distribution: Dict[str, int]
    test_case_type_distribution: Dict[str, int]
    bug_severity_distribution: Dict[str, int]
    bug_status_distribution: Dict[str, int]
    recent_activity: List[dict]
