import pytest


def test_get_dashboard_stats(client, auth_headers, test_project, test_requirement):
    res = client.get("/api/v1/dashboard/stats", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "total_projects" in data
    assert "total_requirements" in data
    assert "total_test_cases" in data
    assert "pass_rate_percentage" in data
    assert data["total_projects"] >= 1
    assert data["total_requirements"] >= 1
