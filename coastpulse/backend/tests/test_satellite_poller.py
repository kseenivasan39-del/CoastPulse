"""
Automated Satellite Observation Poller and Discovery Integration Tests.
Validates multi-provider adapters, acquisition vs publication separation,
duplicate prevention, and saved AOI intersection alerts.
"""

import pytest
import asyncio
import os
import sqlite3
from datetime import datetime, timezone, timedelta

from coastpulse_engine.discovery.manager import EODiscoveryManager
from coastpulse_engine.discovery.providers.isro import ISROBhoonidhiAdapter
from coastpulse_engine.discovery.providers.nasa_asf import NASAASFProviderAdapter
from coastpulse_engine.discovery.providers.copernicus import CopernicusSentinel1Adapter
from app.services.satellite_poller import SatelliteUpdateMonitorService


@pytest.fixture
def temp_test_db(tmp_path):
    db_file = tmp_path / "test_poller.db"
    conn = sqlite3.connect(str(db_file))
    conn.execute("""
        CREATE TABLE study_areas (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            min_lon REAL, min_lat REAL, max_lon REAL, max_lat REAL,
            created_at TEXT
        )
    """)
    # Seed test AOI (Nagapattinam Delta)
    conn.execute("""
        INSERT INTO study_areas VALUES ('AOI_TEST_01', 'Test Coastal AOI', 79.6, 10.2, 80.1, 11.4, '2026-01-01T00:00:00Z')
    """)
    conn.commit()
    conn.close()
    return str(db_file)


def test_isro_bhoonidhi_adapter_registration():
    mgr = EODiscoveryManager()
    providers = [p["provider_id"] for p in mgr.list_providers()]
    assert "ISRO_BHOONIDHI" in providers
    assert "NASA_ASF" in providers
    assert "COPERNICUS_S1" in providers


@pytest.mark.asyncio
async def test_isro_bhoonidhi_search():
    adapter = ISROBhoonidhiAdapter()
    results = await adapter.search(None)
    assert len(results) >= 2
    # Check NISAR S-band presence
    nisar_s = next((r for r in results if "NISAR_S" in r.id), None)
    assert nisar_s is not None
    assert nisar_s.properties["sar:frequency_band"] == "S"
    assert nisar_s.properties["sar:center_frequency"] == 3.200
    assert nisar_s.provider == "ISRO_BHOONIDHI"


@pytest.mark.asyncio
async def test_satellite_poller_pipeline_and_aoi_matching(temp_test_db):
    poller = SatelliteUpdateMonitorService(db_path=temp_test_db, polling_interval_seconds=60)
    
    # Run first poll
    res = await poller.poll_once()
    assert res["providers_polled"] == 5
    assert res["new_observations_found"] > 0
    assert res["notifications_generated"] > 0

    # Test Duplicate Ingestion Prevention (second poll must find 0 duplicates)
    res_second = await poller.poll_once()
    assert res_second["new_observations_found"] == 0

    # Verify telemetry dashboard
    dashboard = poller.get_monitor_dashboard()
    assert dashboard["total_observations_tracked"] > 0
    assert len(dashboard["providers"]) == 5
    assert len(dashboard["unread_notifications"]) > 0

    # Ensure timestamp separation
    obs = dashboard["recent_observations"][0]
    assert obs["acquisition_datetime"] is not None
    assert obs["publication_datetime"] is not None
    assert obs["discovered_at"] is not None
