import pytest


def test_create_and_get_requirement(client, auth_headers, test_project):
    payload = {
        "title": "Password Reset via Email Link",
        "description": "User clicks forgot password, receives email with 15-minute expiration token.",
        "project_id": test_project["id"],
        "priority": "High",
        "status": "Draft",
    }
    res = client.post("/api/v1/requirements", json=payload, headers=auth_headers)
    assert res.status_code == 201
    req = res.json()
    assert req["title"] == payload["title"]

    get_res = client.get(f"/api/v1/requirements/{req['id']}", headers=auth_headers)
    assert get_res.status_code == 200
    assert get_res.json()["title"] == payload["title"]


def test_list_requirements_filter(client, auth_headers, test_project, test_requirement):
    res = client.get(
        f"/api/v1/requirements?project_id={test_project['id']}&priority=High",
        headers=auth_headers,
    )
    assert res.status_code == 200
    reqs = res.json()
    assert len(reqs) >= 1


def test_update_requirement(client, auth_headers, test_requirement):
    update_data = {"status": "Approved", "priority": "Critical"}
    res = client.put(
        f"/api/v1/requirements/{test_requirement['id']}",
        json=update_data,
        headers=auth_headers,
    )
    assert res.status_code == 200
    assert res.json()["status"] == "Approved"


def test_delete_requirement(client, auth_headers, test_project):
    create_res = client.post(
        "/api/v1/requirements",
        json={
            "title": "Temp Req",
            "description": "To be deleted requirement description",
            "project_id": test_project["id"],
        },
        headers=auth_headers,
    )
    r_id = create_res.json()["id"]

    del_res = client.delete(f"/api/v1/requirements/{r_id}", headers=auth_headers)
    assert del_res.status_code == 204
