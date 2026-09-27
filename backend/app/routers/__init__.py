from app.routers.auth import router as auth_router
from app.routers.projects import router as projects_router
from app.routers.requirements import router as requirements_router
from app.routers.test_cases import router as test_cases_router
from app.routers.bugs import router as bugs_router
from app.routers.dashboard import router as dashboard_router

__all__ = [
    "auth_router",
    "projects_router",
    "requirements_router",
    "test_cases_router",
    "bugs_router",
    "dashboard_router",
]
