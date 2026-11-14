"""
Abstract Base Provider Adapter for Earth Observation Satellite Data Ingestion.
Ensures clean decoupling between provider APIs and the CoastPulse core platform.
"""

from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any, AsyncGenerator
from coastpulse_engine.discovery.models import (
    STACItemRecord,
    DiscoverySearchCriteria,
    DownloadStatus,
)


class BaseEOProviderAdapter(ABC):
    """
    Abstract interface for satellite data providers.
    Every satellite provider (NASA ASF, Copernicus, Landsat) must implement this interface.
    """

    @property
    @abstractmethod
    def provider_id(self) -> str:
        """Unique identifier (e.g. 'NASA_ASF', 'COPERNICUS_S1', 'COPERNICUS_S2', 'USGS_LANDSAT')."""
        pass

    @property
    @abstractmethod
    def supported_collections(self) -> List[str]:
        """List of STAC collection IDs provided by this adapter."""
        pass

    @abstractmethod
    async def search(self, criteria: DiscoverySearchCriteria) -> List[STACItemRecord]:
        """
        Queries provider catalogue or CMR/STAC API.
        Returns discovered STAC items matching the criteria.
        """
        pass

    @abstractmethod
    async def check_availability(self, item_id: str) -> bool:
        """
        Verifies whether the item's assets are currently available for download
        without initiating the transfer.
        """
        pass

    @abstractmethod
    async def download_asset(
        self,
        item: STACItemRecord,
        asset_key: str,
        destination_dir: str,
        chunk_size_bytes: int = 1024 * 1024,
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Streams asset bytes with resumable download support, yielding progress events:
        {"bytes_downloaded": int, "total_bytes": int, "status": DownloadStatus, "file_path": str}
        """
        pass
