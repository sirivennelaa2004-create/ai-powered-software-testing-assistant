import pytest


def test_register_user_success(client):
    payload = {
        "email": "newuser@example.com",
        "password": "Password123!",
        "full_name": "Jane Doe",
        "role": "QA Engineer",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == payload["email"]
    assert data["full_name"] == payload["full_name"]
    assert "id" in data
    assert "password" not in data
    assert "hashed_password" not in data


def test_register_duplicate_email(client, test_user):
    payload = {
        "email": test_user["email"],
        "password": "DifferentPassword123!",
        "full_name": "Duplicate User",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 409
    assert "already exists" in response.json()["detail"]


def test_login_success(client, test_user):
    payload = {
        "email": test_user["email"],
        "password": test_user["raw_password"],
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == test_user["email"]


def test_login_incorrect_password(client, test_user):
    payload = {
        "email": test_user["email"],
        "password": "WrongPassword!",
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 401


def test_get_me_success(client, auth_headers, test_user):
    response = client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == test_user["email"]


def test_get_me_unauthorized_no_token(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_get_me_invalid_token(client):
    response = client.get(
        "/api/v1/auth/me", headers={"Authorization": "Bearer invalid_token_str"}
    )
    assert response.status_code == 401
