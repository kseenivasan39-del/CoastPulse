"""
Mock Provider Adapters for Isolated Unit and Integration Testing.
Provides predictable, reproducible satellite catalogue records without external network dependencies.
"""

import os
from typing import List, Dict, Any, Optional, AsyncGenerator
from datetime import datetime, timezone

from coastpulse_engine.discovery.base_adapter import BaseEOProviderAdapter
from coastpulse_engine.discovery.models import (
    STACItemRecord,
    STACAsset,
    DiscoverySearchCriteria,
    DownloadStatus,
)


class MockEOProviderAdapter(BaseEOProviderAdapter):
    """
    Mock adapter with configurable responses, simulated latency, and error injection.
    """

    def __init__(self, provider_id: str = "MOCK_PROVIDER", should_fail: bool = False):
        self._provider_id = provider_id
        self._should_fail = should_fail

    @property
    def provider_id(self) -> str:
        return self._provider_id

    @property
    def supported_collections(self) -> List[str]:
        return ["mock-sar-l2", "mock-optical-l2"]

    async def search(self, criteria: DiscoverySearchCriteria) -> List[STACItemRecord]:
        if self._should_fail:
            raise RuntimeError("Simulated network outage in mock provider.")

        mock_item = STACItemRecord(
            id="MOCK_SAR_L2_20261101T000000_TEST",
            collection="mock-sar-l2",
            provider=self._provider_id,
            bbox=[79.6, 10.2, 80.1, 11.4],
            geometry={
                "type": "Polygon",
                "coordinates": [[[79.6, 10.2], [80.1, 10.2], [80.1, 11.4], [79.6, 11.4], [79.6, 10.2]]],
            },
            acquisition_datetime=datetime(2026, 11, 1, 0, 0, 0, tzinfo=timezone.utc),
            properties={
                "sar:frequency_band": "L",
                "sar:polarizations": criteria.polarizations or ["HH", "HV"],
                "sar:orbit_direction": "ASCENDING",
                "mock:simulated": True,
            },
            assets={
                "data": STACAsset(
                    href="https://mock.earthobservation.org/data/MOCK_SAR_L2.h5",
                    type="application/x-hdf5",
                    roles=["data"],
                    file_size_bytes=4096,
                    checksum_sha256="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                )
            },
            is_available_for_download=True,
            download_status=DownloadStatus.DISCOVERED,
        )
        return [mock_item]

    async def check_availability(self, item_id: str) -> bool:
        return not self._should_fail

    async def download_asset(
        self,
        item: STACItemRecord,
        asset_key: str,
        destination_dir: str,
        chunk_size_bytes: int = 1024,
    ) -> AsyncGenerator[Dict[str, Any], None]:
        if self._should_fail:
            yield {"status": DownloadStatus.FAILED, "error": "Simulated download failure"}
            return

        os.makedirs(destination_dir, exist_ok=True)
        dest_path = os.path.join(destination_dir, f"{item.id}.dat")
        payload = b"MOCK_EO_PAYLOAD_BYTES" * 32

        yield {
            "status": DownloadStatus.DOWNLOADING,
            "bytes_downloaded": 0,
            "total_bytes": len(payload),
            "file_path": dest_path,
        }

        with open(dest_path, "wb") as f:
            f.write(payload)

        yield {
            "status": DownloadStatus.COMPLETED,
            "bytes_downloaded": len(payload),
            "total_bytes": len(payload),
            "file_path": dest_path,
        }
