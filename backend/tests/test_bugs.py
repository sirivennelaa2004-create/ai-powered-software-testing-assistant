import pytest


def test_create_and_get_bug(client, auth_headers, test_project):
    payload = {
        "title": "JWT Token Expiring Instantly On Login",
        "description": "User is redirected to login immediately after authentication.",
        "steps_to_reproduce": "1. Login\n2. Click dashboard",
        "expected_result": "User remains authenticated",
        "actual_result": "Redirected to login with 401",
        "environment": "Staging",
        "severity": "High",
        "priority": "P1",
        "project_id": test_project["id"],
    }
    create_res = client.post("/api/v1/bugs", json=payload, headers=auth_headers)
    assert create_res.status_code == 201
    bug = create_res.json()
    assert bug["title"] == payload["title"]

    get_res = client.get(f"/api/v1/bugs/{bug['id']}", headers=auth_headers)
    assert get_res.status_code == 200
    assert get_res.json()["title"] == payload["title"]


def test_ai_bug_analysis(client, auth_headers, test_project):
    create_res = client.post(
        "/api/v1/bugs",
        json={
            "title": "Null pointer crash on submit",
            "description": "Submitting form crashes app",
            "project_id": test_project["id"],
        },
        headers=auth_headers,
    )
    bug_id = create_res.json()["id"]

    analyze_res = client.post(
        f"/api/v1/bugs/{bug_id}/analyze-ai?auto_update_severity_priority=true",
        headers=auth_headers,
    )
    assert analyze_res.status_code == 200
    data = analyze_res.json()
    assert data["entity_type"] == "bug"
    assert "root_cause_analysis" in data["structured_result"] or "possible_root_causes" in data["structured_result"]

    deep_res = client.post(
        f"/api/v1/bugs/{bug_id}/analyze?auto_update_severity_priority=true",
        headers=auth_headers,
    )
    assert deep_res.status_code == 200
    deep_data = deep_res.json()
    assert deep_data["entity_type"] == "bug"
    assert "possible_root_causes" in deep_data["structured_result"]



def test_auto_bug_creation_on_failed_execution(client, auth_headers, test_project, test_requirement):
    tc_res = client.post(
        "/api/v1/test-cases",
        json={
            "title": "Failing Test for Auto Bug",
            "expected_result": "200 OK",
            "project_id": test_project["id"],
            "requirement_id": test_requirement["id"],
        },
        headers=auth_headers,
    )
    tc_id = tc_res.json()["id"]

    client.post(
        f"/api/v1/test-cases/{tc_id}/execute",
        json={
            "test_case_id": tc_id,
            "actual_result": "Got 500 Internal Server Error",
            "status": "Failed",
            "create_bug_if_failed": True,
        },
        headers=auth_headers,
    )

    bugs_res = client.get(
        f"/api/v1/bugs?project_id={test_project['id']}", headers=auth_headers
    )
    bugs = bugs_res.json()
    assert len(bugs) >= 1
    assert any("Failing Test for Auto Bug" in b["title"] for b in bugs)
