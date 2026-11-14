"""
STAC-compatible Earth Observation Data Discovery and Ingestion Models.
Follows STAC Item Specification v1.0.0 conventions for metadata interoperability.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from enum import Enum
from pydantic import BaseModel, Field


class SensorType(str, Enum):
    SAR = "SAR"
    OPTICAL = "OPTICAL"
    MULTISPECTRAL = "MULTISPECTRAL"


class DownloadStatus(str, Enum):
    DISCOVERED = "DISCOVERED"
    QUEUED = "QUEUED"
    DOWNLOADING = "DOWNLOADING"
    VALIDATING = "VALIDATING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"


class STACAsset(BaseModel):
    href: str
    title: Optional[str] = None
    description: Optional[str] = None
    type: str  # e.g. "application/x-hdf5", "image/tiff; application=geotiff"
    roles: List[str] = Field(default_factory=list)  # ["data", "metadata", "thumbnail"]
    file_size_bytes: Optional[int] = None
    checksum_sha256: Optional[str] = None


class STACItemRecord(BaseModel):
    """
    STAC Item representing a discovered Earth Observation product.
    Strictly separates metadata discovery from actual local data download.
    """
    id: str
    collection: str  # e.g., "nisar-l2-gcov", "sentinel-1-grd", "sentinel-2-l2a", "landsat-9-c2l2"
    provider: str    # e.g., "NASA_ASF", "COPERNICUS_DATASAPCE", "USGS_EROS"
    bbox: List[float] = Field(description="[min_lon, min_lat, max_lon, max_lat]")
    geometry: Dict[str, Any] = Field(description="GeoJSON geometry dictionary")
    acquisition_datetime: datetime
    properties: Dict[str, Any] = Field(default_factory=dict)
    assets: Dict[str, STACAsset] = Field(default_factory=dict)
    
    # Discovery vs Download state
    is_available_for_download: bool = True
    download_status: DownloadStatus = DownloadStatus.DISCOVERED
    local_file_path: Optional[str] = None
    download_error: Optional[str] = None


class DiscoverySearchCriteria(BaseModel):
    bbox: Optional[List[float]] = None  # [min_lon, min_lat, max_lon, max_lat]
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    sensor_type: Optional[SensorType] = None
    product_type: Optional[str] = None  # e.g. "GCOV", "GRD", "L2A"
    polarizations: Optional[List[str]] = None  # e.g. ["HH", "HV"]
    max_results: int = 50


class ProvenanceEvent(BaseModel):
    event_id: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    event_type: str  # DISCOVERY, CHECKSUM_VERIFICATION, INGESTION, CALIBRATION
    granule_id: str
    provider: str
    agent: str
    details: Dict[str, Any] = Field(default_factory=dict)
    hash_signature: str
