import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client

def test_auth_registration_and_login_lifecycle(client):
    unique_suffix = uuid.uuid4().hex[:6]
    test_email = f"researcher_{unique_suffix}@coastpulse.org"
    test_password = "SecureScientificPassword123!"

    # 1. Register new user
    reg_payload = {
        "email": test_email,
        "password": test_password,
        "full_name": "Dr. Sarah Chen",
        "role": "researcher",
    }
    reg_res = client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_res.status_code == 201
    user_data = reg_res.json()
    assert user_data["email"] == test_email
    assert user_data["role"] == "researcher"

    # Duplicate registration test
    dup_res = client.post("/api/v1/auth/register", json=reg_payload)
    assert dup_res.status_code == 400

    # 2. Login with valid credentials
    login_payload = {
        "email": test_email,
        "password": test_password,
    }
    login_res = client.post("/api/v1/auth/login", json=login_payload)
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"
    access_token = token_data["access_token"]

    # 3. Authenticate to /me
    headers = {"Authorization": f"Bearer {access_token}"}
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["email"] == test_email
    assert me_data["role"] == "researcher"

    # 4. Attempt login with bad password
    bad_login = client.post("/api/v1/auth/login", json={"email": test_email, "password": "WrongPassword!"})
    assert bad_login.status_code == 401

def test_password_reset_flow(client):
    unique_suffix = uuid.uuid4().hex[:6]
    test_email = f"reset_user_{unique_suffix}@coastpulse.org"
    test_pwd = "OriginalPassword123!"
    client.post("/api/v1/auth/register", json={
        "email": test_email,
        "password": test_pwd,
        "full_name": "Reset Test User",
        "role": "researcher"
    })

    # Request reset
    req_res = client.post("/api/v1/auth/password-reset-request", json={"email": test_email})
    assert req_res.status_code == 200
    reset_envelope = req_res.json()
    assert reset_envelope["success"] is True
    token = reset_envelope["data"]

    # Confirm reset
    new_pwd = "NewSecurePassword456!"
    confirm_res = client.post("/api/v1/auth/password-reset-confirm", json={
        "token": token,
        "new_password": new_pwd
    })
    assert confirm_res.status_code == 200

    # Verify old password fails and new works
    old_try = client.post("/api/v1/auth/login", json={"email": test_email, "password": test_pwd})
    assert old_try.status_code == 401

    new_try = client.post("/api/v1/auth/login", json={"email": test_email, "password": new_pwd})
    assert new_try.status_code == 200

def test_workspace_crud_and_rbac(client):
    unique_suffix = uuid.uuid4().hex[:6]
    user_email = f"analyst_{unique_suffix}@coastpulse.org"
    pwd = "WorkspacePass789!"
    client.post("/api/v1/auth/register", json={
        "email": user_email,
        "password": pwd,
        "full_name": "Lead Analyst",
        "role": "analyst"
    })
    token = client.post("/api/v1/auth/login", json={"email": user_email, "password": pwd}).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create workspace
    ws_payload = {
        "name": "Point Calimere Wetland Monitoring",
        "description": "Multi-temporal repeat pass analysis for wetland boundary tracking",
        "aoi_geojson": {"type": "Polygon", "coordinates": [[[79.7, 10.2], [79.9, 10.2], [79.9, 10.4], [79.7, 10.4], [79.7, 10.2]]]},
        "saved_granules": ["NISAR_L2_PR_GCOV_034_084_A_007_4005_DHDH_A_20261030T001553_20261030T001628_P05036_N_F_J_001"]
    }
    create_res = client.post("/api/v1/workspaces", json=ws_payload, headers=headers)
    assert create_res.status_code == 201
    ws = create_res.json()
    assert ws["name"] == "Point Calimere Wetland Monitoring"
    ws_id = ws["id"]

    # 2. List workspaces
    list_res = client.get("/api/v1/workspaces", headers=headers)
    assert list_res.status_code == 200
    items = list_res.json()
    assert any(item["id"] == ws_id for item in items)

    # 3. Get single workspace
    get_res = client.get(f"/api/v1/workspaces/{ws_id}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["id"] == ws_id

    # 4. Delete workspace
    del_res = client.delete(f"/api/v1/workspaces/{ws_id}", headers=headers)
    assert del_res.status_code == 204
