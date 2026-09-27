import pytest


def test_create_and_get_project(client, auth_headers):
    payload = {"name": "Payment Gateway Integration", "description": "Stripe & PayPal testing"}
    create_res = client.post("/api/v1/projects", json=payload, headers=auth_headers)
    assert create_res.status_code == 201
    proj_data = create_res.json()
    assert proj_data["name"] == payload["name"]

    get_res = client.get(f"/api/v1/projects/{proj_data['id']}", headers=auth_headers)
    assert get_res.status_code == 200
    assert get_res.json()["name"] == payload["name"]


def test_list_user_projects(client, auth_headers, test_project):
    res = client.get("/api/v1/projects", headers=auth_headers)
    assert res.status_code == 200
    projects = res.json()
    assert len(projects) >= 1
    assert any(p["id"] == test_project["id"] for p in projects)


def test_update_project(client, auth_headers, test_project):
    update_payload = {"name": "Updated Project Name", "description": "Updated description"}
    res = client.put(
        f"/api/v1/projects/{test_project['id']}", json=update_payload, headers=auth_headers
    )
    assert res.status_code == 200
    assert res.json()["name"] == update_payload["name"]


def test_delete_project(client, auth_headers):
    create_res = client.post(
        "/api/v1/projects", json={"name": "Temp Project"}, headers=auth_headers
    )
    p_id = create_res.json()["id"]

    del_res = client.delete(f"/api/v1/projects/{p_id}", headers=auth_headers)
    assert del_res.status_code == 204

    get_res = client.get(f"/api/v1/projects/{p_id}", headers=auth_headers)
    assert get_res.status_code == 404


def test_unauthorized_cross_tenant_access(client, auth_headers, secondary_auth_headers, test_project):
    """Ensure secondary user cannot view or edit user A's project."""
    get_res = client.get(f"/api/v1/projects/{test_project['id']}", headers=secondary_auth_headers)
    assert get_res.status_code == 403

    put_res = client.put(
        f"/api/v1/projects/{test_project['id']}",
        json={"name": "Hacked Name"},
        headers=secondary_auth_headers,
    )
    assert put_res.status_code == 403

    del_res = client.delete(f"/api/v1/projects/{test_project['id']}", headers=secondary_auth_headers)
    assert del_res.status_code == 403
