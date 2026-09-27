import pytest


def test_ai_requirement_analysis_endpoint(client, auth_headers, test_requirement):
    res = client.post(
        f"/api/v1/requirements/{test_requirement['id']}/analyze",
        headers=auth_headers,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["entity_type"] == "requirement"
    assert data["requirement_id"] == test_requirement["id"]
    assert "structured_result" in data
    assert "functional_requirements" in data["structured_result"]


def test_ai_generate_scenarios_endpoint(client, auth_headers, test_requirement):
    res = client.post(
        f"/api/v1/requirements/{test_requirement['id']}/generate-scenarios",
        headers=auth_headers,
    )
    assert res.status_code == 200
    scenarios = res.json()
    assert isinstance(scenarios, list)
    assert len(scenarios) >= 1
    assert "scenario_type" in scenarios[0]


def test_ai_generate_test_cases_endpoint(client, auth_headers, test_requirement):
    res = client.post(
        f"/api/v1/requirements/{test_requirement['id']}/generate-test-cases",
        headers=auth_headers,
    )
    assert res.status_code == 200
    tcs = res.json()
    assert isinstance(tcs, list)
    assert len(tcs) >= 1
    assert tcs[0]["requirement_id"] == test_requirement["id"]
    assert tcs[0]["project_id"] == test_requirement["project_id"]


def test_ai_generate_granular_test_cases(client, auth_headers, test_requirement):
    endpoints = [
        "generate-positive-test-cases",
        "generate-negative-test-cases",
        "generate-edge-test-cases",
        "generate-boundary-test-cases",
    ]
    for ep in endpoints:
        res = client.post(
            f"/api/v1/requirements/{test_requirement['id']}/{ep}",
            headers=auth_headers,
        )
        assert res.status_code == 200
        tcs = res.json()
        assert isinstance(tcs, list)
        assert len(tcs) >= 1
