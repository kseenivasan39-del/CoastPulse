import pytest
import os
import shutil
from datetime import datetime, timezone
from coastpulse_engine.discovery import (
    EODiscoveryManager,
    DiscoverySearchCriteria,
    DownloadStatus,
    SensorType,
    NASAASFProviderAdapter,
    CopernicusSentinel1Adapter,
    CopernicusSentinel2Adapter,
    USGSCommercialLandsatAdapter,
    MockEOProviderAdapter,
)

@pytest.fixture
def temp_storage(tmp_path):
    storage_dir = str(tmp_path / "raw_storage")
    os.makedirs(storage_dir, exist_ok=True)
    yield storage_dir
    shutil.rmtree(storage_dir, ignore_errors=True)

@pytest.mark.asyncio
async def test_eo_manager_registration_and_listing():
    manager = EODiscoveryManager()
    providers = manager.list_providers()
    provider_ids = [p["provider_id"] for p in providers]

    # Verify initial priority providers are present
    assert "NASA_ASF" in provider_ids
    assert "COPERNICUS_S1" in provider_ids
    assert "COPERNICUS_S2" in provider_ids
    assert "USGS_LANDSAT" in provider_ids

@pytest.mark.asyncio
async def test_federated_discovery_search():
    manager = EODiscoveryManager()
    criteria = DiscoverySearchCriteria(
        bbox=[79.6, 10.2, 80.1, 11.4],
        product_type="GCOV",
        polarizations=["HH", "HV"],
        max_results=10,
    )
    items = await manager.search_all(criteria)
    assert len(items) >= 2

    # Check STAC compliance
    for item in items:
        assert item.id
        assert item.collection
        assert len(item.bbox) == 4
        assert item.geometry["type"] == "Polygon"
        assert item.acquisition_datetime
        # Crucial requirement: metadata discovery != downloaded
        assert item.download_status == DownloadStatus.DISCOVERED

@pytest.mark.asyncio
async def test_mock_provider_adapter_isolation(temp_storage):
    """Verifies that mock adapters are cleanly separated and support simulated operations."""
    mock_adapter = MockEOProviderAdapter(provider_id="MOCK_TEST_PROVIDER")
    manager = EODiscoveryManager(storage_base_dir=temp_storage)
    manager.register_provider(mock_adapter)

    items = await mock_adapter.search(DiscoverySearchCriteria())
    assert len(items) == 1
    assert items[0].provider == "MOCK_TEST_PROVIDER"

    # Test download and checksum verification
    job = await manager.execute_ingestion_job(items[0])
    assert job["status"] == DownloadStatus.COMPLETED
    assert os.path.exists(job["file_path"])
    assert len(job["sha256"]) == 64

    # Verify provenance logging
    prov = manager.get_provenance_history(items[0].id)
    assert len(prov) == 1
    assert prov[0].event_type == "INGESTION_COMPLETED"
    assert prov[0].hash_signature == job["sha256"]

@pytest.mark.asyncio
async def test_storage_limit_enforcement(temp_storage):
    """Enforces configurable storage threshold."""
    # Set a small 100-byte storage limit
    manager = EODiscoveryManager(storage_base_dir=temp_storage, max_storage_bytes=100)
    mock_adapter = MockEOProviderAdapter(provider_id="MOCK_STORAGE")
    manager.register_provider(mock_adapter)

    items = await mock_adapter.search(DiscoverySearchCriteria())
    
    # Pre-fill storage beyond limit
    big_file = os.path.join(temp_storage, "big_dummy.dat")
    with open(big_file, "wb") as f:
        f.write(b"X" * 200)

    # Ingestion must be rejected
    with pytest.raises(RuntimeError, match="storage quota exceeded"):
        await manager.execute_ingestion_job(items[0])
