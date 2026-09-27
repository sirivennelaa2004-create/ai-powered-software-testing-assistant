import pytest
from typing import Generator
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

import sys
import os

# Add backend directory to sys.path for test discovery
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app
from app.database.session import Base, get_db
from app.core.security import create_access_token

# In-memory SQLite for super-fast, isolated testing
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db() -> Generator[Session, None, None]:
    """Create fresh database tables for each test function."""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db: Session) -> Generator[TestClient, None, None]:
    """Override get_db dependency to use test database session."""
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(client: TestClient) -> dict:
    """Register primary test user."""
    payload = {
        "email": "tester@example.com",
        "password": "Password123!",
        "full_name": "Test Tester",
        "role": "QA Lead",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    user_data = response.json()
    user_data["raw_password"] = payload["password"]
    return user_data


@pytest.fixture
def auth_headers(client: TestClient, test_user: dict) -> dict:
    """Generate authorization Bearer headers for primary test user."""
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": test_user["email"], "password": test_user["raw_password"]},
    )
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def secondary_user(client: TestClient) -> dict:
    """Register secondary user for authorization/multi-tenant tests."""
    payload = {
        "email": "other@example.com",
        "password": "Password456!",
        "full_name": "Other Tester",
        "role": "Developer",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    user_data = response.json()
    user_data["raw_password"] = payload["password"]
    return user_data


@pytest.fixture
def secondary_auth_headers(client: TestClient, secondary_user: dict) -> dict:
    """Generate authorization Bearer headers for secondary user."""
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": secondary_user["email"], "password": secondary_user["raw_password"]},
    )
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def test_project(client: TestClient, auth_headers: dict) -> dict:
    """Create sample project owned by primary user."""
    response = client.post(
        "/api/v1/projects",
        json={"name": "E-Commerce App QA", "description": "Testing project for E-Commerce platform"},
        headers=auth_headers,
    )
    return response.json()


@pytest.fixture
def test_requirement(client: TestClient, auth_headers: dict, test_project: dict) -> dict:
    """Create sample requirement under sample project."""
    response = client.post(
        "/api/v1/requirements",
        json={
            "title": "User Authentication & JWT Issuance",
            "description": "Users must log in with email and password, receiving a valid 24h JWT token.",
            "project_id": test_project["id"],
            "priority": "High",
            "status": "Draft",
        },
        headers=auth_headers,
    )
    return response.json()
