"""
Comprehensive API test suite for COASTPULSE FastAPI backend.
Tests all endpoints across v1 routes.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


def test_health_check_endpoint(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "operational"
    assert data["service"] == "COASTPULSE"
    assert "Nagapattinam" in data["target_aoi"]


def test_datasets_endpoints(client):
    # List datasets
    response = client.get("/api/v1/datasets")
    assert response.status_code == 200
    datasets = response.json()
    assert len(datasets) >= 2
    assert any(d["id"] == "NISAR_LSAR_GCOV" for d in datasets)

    # Get specific dataset
    d_res = client.get("/api/v1/datasets/NISAR_LSAR_GCOV")
    assert d_res.status_code == 200
    assert d_res.json()["radar_band"] == "L"


def test_study_areas_endpoint(client):
    response = client.get("/api/v1/study-areas")
    assert response.status_code == 200
    areas = response.json()
    assert len(areas) >= 1
    assert areas[0]["id"] == "AOI_NAGAPATTINAM_01"


def test_acquisitions_endpoint(client):
    response = client.get("/api/v1/acquisitions")
    assert response.status_code == 200
    acqs = response.json()
    assert len(acqs) >= 2
    granule_id = acqs[0]["id"]

    # Get single acquisition
    single = client.get(f"/api/v1/acquisitions/{granule_id}")
    assert single.status_code == 200
    assert single.json()["id"] == granule_id
    assert len(single.json()["source_sha256"]) == 64


def test_comparison_compatibility_verification(client):
    # Compare identical orbit repeat pass (Compatible)
    payload_valid = {
        "reference_granule_id": "NISAR_L1_PR_GCOV_001_020_A_129_20260401T003000",
        "secondary_granule_id": "NISAR_L1_PR_GCOV_001_020_A_129_20260413T003000",
        "max_incidence_delta_deg": 2.0,
    }
    res = client.post("/api/v1/comparisons/verify-compatibility", json=payload_valid)
    assert res.status_code == 200
    assert res.json()["is_compatible"] is True

    # Unknown granule rejection
    payload_invalid = {
        "reference_granule_id": "NON_EXISTENT_ID",
        "secondary_granule_id": "NISAR_L1_PR_GCOV_001_020_A_129_20260413T003000",
    }
    res_err = client.post("/api/v1/comparisons/verify-compatibility", json=payload_invalid)
    assert res_err.status_code == 404


def test_processing_job_lifecycle(client):
    # Submit job
    payload = {
        "job_name": "Test Muthupet Adaptive Filter",
        "granule_id": "NISAR_L1_PR_GCOV_001_020_A_129_20260401T003000",
        "algorithm": "Adaptive Otsu Thresholding",
        "parameters": {"threshold": -16.4},
    }
    res = client.post("/api/v1/processing/submit", json=payload)
    assert res.status_code == 202
    job_data = res.json()
    job_id = job_data["id"]

    # Poll status
    status_res = client.get(f"/api/v1/processing/{job_id}")
    assert status_res.status_code == 200
    assert status_res.json()["id"] == job_id


def test_reports_generation(client):
    payload = {
        "title": "Automated Nagapattinam Coastal Report",
        "study_area_id": "AOI_NAGAPATTINAM_01",
        "granule_ids": ["NISAR_L1_PR_GCOV_001_020_A_129_20260401T003000"],
    }
    res = client.post("/api/v1/reports/generate", json=payload)
    assert res.status_code == 201
    report = res.json()
    assert "COASTPULSE" in report["content_markdown"]
    assert "integrity_hash" in report["provenance_manifest"]


def test_assistant_query(client):
    payload = {
        "prompt": "What caused the surface water increase?",
        "study_area_id": "AOI_NAGAPATTINAM_01",
    }
    res = client.post("/api/v1/assistant/query", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "hectares" in data["response_text"].lower() or "water" in data["response_text"].lower()
    assert len(data["citations"]) > 0
    assert "grounding_manifest" in data
