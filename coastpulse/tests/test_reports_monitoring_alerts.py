import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.monitoring_service import (
    MonitoringAlertManager,
    AlertSeverity,
)

@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client

def test_report_generation_and_pdf_export(client):
    # 1. Generate Report
    payload = {
        "title": "Comprehensive Nagapattinam Wetland Bulletin",
        "study_area_id": "AOI_NAGAPATTINAM_01",
        "granule_ids": ["NISAR_L1_PR_GCOV_001_020_A_129_20260401T003000"],
    }
    gen_res = client.post("/api/v1/reports/generate", json=payload)
    assert gen_res.status_code == 201
    report = gen_res.json()
    report_id = report["id"]

    # 2. Download Binary PDF Report
    pdf_res = client.get(f"/api/v1/reports/{report_id}/pdf")
    assert pdf_res.status_code == 200
    assert pdf_res.headers["content-type"] == "application/pdf"
    assert pdf_res.content.startswith(b"%PDF-")  # Valid PDF binary signature
    assert len(pdf_res.content) > 1000

def test_export_statistics_csv(client):
    res = client.get("/api/v1/reports/export/statistics.csv")
    assert res.status_code == 200
    assert res.headers["content-type"] == "text/csv; charset=utf-8"
    csv_text = res.text
    # Verify header row
    assert "Analysis_ID" in csv_text
    assert "Mean_Delta_dB" in csv_text
    assert "Provenance_Hash" in csv_text

def test_monitoring_manager_and_alert_deduplication():
    mgr = MonitoringAlertManager()
    user_id = "usr-test-analyst"
    area = mgr.create_monitoring_area(
        user_id=user_id,
        name="Muthupet Wetland Zone",
        aoi_bbox=[79.4, 10.2, 79.7, 10.5],
        threshold_db=2.5,
    )
    assert area.id.startswith("mon-")
    assert area.name == "Muthupet Wetland Zone"

    # Scenario 1: New satellite acquisitions exist, but NO completed analysis yet.
    # CRUCIAL SAFETY: No change alert must be triggered merely by new acquisitions.
    new_acqs = [{"id": "NISAR_L2_PR_GCOV_035"}]
    alert_early = mgr.check_catalogue_and_evaluate(
        area_id=area.id,
        available_acquisitions=new_acqs,
        completed_analysis=None,
    )
    assert alert_early is None  # Must NOT emit alert without analysis

    # Scenario 2: Completed, quality-checked analysis exceeding threshold
    valid_analysis = {
        "qc_passed": True,
        "provenance_hash": "a1b2c3d4e5f67890",
        "metrics": {
            "mean_delta_db": 3.14,
            "water_gain_ha": 1500.0,
        },
    }
    alert = mgr.check_catalogue_and_evaluate(
        area_id=area.id,
        available_acquisitions=new_acqs,
        completed_analysis=valid_analysis,
    )
    assert alert is not None
    assert alert.severity == AlertSeverity.SIGNIFICANT_CHANGE
    assert "exceeding configured 2.5 dB" in alert.message
    assert alert.delivery_status == "DELIVERED"

    # Scenario 3: Deduplication check (same analysis hash must NOT create duplicate alerts)
    dup_alert = mgr.check_catalogue_and_evaluate(
        area_id=area.id,
        available_acquisitions=new_acqs,
        completed_analysis=valid_analysis,
    )
    assert dup_alert is None  # Duplicate suppressed

    # Scenario 4: Pause monitoring
    mgr.pause_monitoring(area.id)
    assert mgr._monitoring_areas[area.id].is_paused is True
    # Paused area generates zero alerts
    new_analysis = {
        "qc_passed": True,
        "provenance_hash": "different_hash",
        "metrics": {"mean_delta_db": 4.5},
    }
    assert mgr.check_catalogue_and_evaluate(area.id, new_acqs, new_analysis) is None
