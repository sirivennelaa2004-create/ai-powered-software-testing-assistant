import pytest


def test_create_and_get_test_case(client, auth_headers, test_project, test_requirement):
    payload = {
        "title": "Verify Login Response Status 200",
        "objective": "Ensure 200 OK returned on correct credentials",
        "preconditions": "User exist",
        "test_data": "email: test@test.com",
        "steps": ["Submit email and password"],
        "expected_result": "200 OK",
        "test_type": "Positive",
        "priority": "P0",
        "severity": "High",
        "project_id": test_project["id"],
        "requirement_id": test_requirement["id"],
    }
    create_res = client.post("/api/v1/test-cases", json=payload, headers=auth_headers)
    assert create_res.status_code == 201
    tc = create_res.json()
    assert tc["title"] == payload["title"]
    assert tc["custom_id"].startswith("TC-")

    get_res = client.get(f"/api/v1/test-cases/{tc['id']}", headers=auth_headers)
    assert get_res.status_code == 200
    assert get_res.json()["title"] == payload["title"]


def test_filter_and_search_test_cases(client, auth_headers, test_project, test_requirement):
    # Create test case
    client.post(
        "/api/v1/test-cases",
        json={
            "title": "Searchable Unique Title Query",
            "expected_result": "Success",
            "priority": "P1",
            "test_type": "Security",
            "project_id": test_project["id"],
            "requirement_id": test_requirement["id"],
        },
        headers=auth_headers,
    )

    # Search filter
    search_res = client.get(
        f"/api/v1/test-cases?project_id={test_project['id']}&search=Searchable",
        headers=auth_headers,
    )
    assert search_res.status_code == 200
    results = search_res.json()
    assert len(results) == 1
    assert "Searchable" in results[0]["title"]


def test_execute_test_case(client, auth_headers, test_project, test_requirement):
    tc_res = client.post(
        "/api/v1/test-cases",
        json={
            "title": "Execution Test",
            "expected_result": "Success",
            "project_id": test_project["id"],
            "requirement_id": test_requirement["id"],
        },
        headers=auth_headers,
    )
    tc_id = tc_res.json()["id"]

    exec_payload = {
        "test_case_id": tc_id,
        "actual_result": "Executed successfully with 200 OK",
        "status": "Passed",
        "notes": "Passed in automated regression pipeline",
    }
    exec_res = client.post(
        f"/api/v1/test-cases/{tc_id}/execute",
        json=exec_payload,
        headers=auth_headers,
    )
    assert exec_res.status_code == 200
    exec_data = exec_res.json()
    assert exec_data["status"] == "Passed"

    # Verify TC status updated to Passed
    get_tc = client.get(f"/api/v1/test-cases/{tc_id}", headers=auth_headers)
    assert get_tc.json()["status"] == "Passed"


def test_test_case_quality_analysis(client, auth_headers, test_project, test_requirement):
    tc_res = client.post(
        "/api/v1/test-cases",
        json={
            "title": "Unclear Test Case Title For Quality Audit",
            "expected_result": "Should pass",
            "project_id": test_project["id"],
            "requirement_id": test_requirement["id"],
        },
        headers=auth_headers,
    )
    tc_id = tc_res.json()["id"]

    res = client.post(f"/api/v1/test-cases/{tc_id}/analyze-quality", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "quality_score" in data
    assert 0 <= data["quality_score"] <= 100
    assert "issues" in data
    assert "suggestions" in data
    assert "improved_test_case" in data

