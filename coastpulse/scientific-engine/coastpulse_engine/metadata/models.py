"""
NISAR Product Models and Metadata Validation Schemas.
Supports L1 GCOV (Geocoded Covariance), L2 GEMA, L1 GSLC.
"""

from enum import Enum
from typing import List, Optional, Tuple
from pydantic import BaseModel, Field


class RadarBand(str, Enum):
    L_BAND = "L"
    S_BAND = "S"
    C_BAND = "C"


class OrbitPass(str, Enum):
    ASCENDING = "ASCENDING"
    DESCENDING = "DESCENDING"


class ProductLevel(str, Enum):
    L1_SLC = "L1_SLC"      # Single Look Complex (Slant Range)
    L1_GCOV = "L1_GCOV"    # Geocoded Polarimetric Covariance Matrix (Primary NISAR backscatter product)
    L2_GEMA = "L2_GEMA"    # Geocoded Soil Moisture / Ecosystem Mask
    L1_GRD = "L1_GRD"      # Ground Range Detected (Sentinel-1 compatible baseline)


class PolarizationMode(str, Enum):
    SINGLE_HH = "HH"
    SINGLE_VV = "VV"
    DUAL_HH_HV = "HH+HV"
    DUAL_VV_VH = "VV+VH"
    QUAD = "HH+HV+VH+VV"


class SARSceneMetadata(BaseModel):
    granule_id: str = Field(..., description="Unique satellite granule / product identifier")
    satellite_mission: str = Field(..., description="e.g. NISAR-LSAR, NISAR-SSAR, SENTINEL-1A")
    product_level: ProductLevel = Field(..., description="Processing tier (e.g. L1_GCOV)")
    radar_band: RadarBand = Field(..., description="Radar frequency band (L, S, or C)")
    center_frequency_ghz: float = Field(..., ge=1.0, le=10.0, description="Center radar frequency in GHz")
    orbit_pass: OrbitPass = Field(..., description="Flight direction: ASCENDING or DESCENDING")
    relative_orbit: int = Field(..., description="Track / Relative orbit number")
    polarizations: List[str] = Field(..., description="Available polarization channels")
    incidence_angle_near_deg: float = Field(..., ge=15.0, le=60.0)
    incidence_angle_far_deg: float = Field(..., ge=15.0, le=60.0)
    center_incidence_angle_deg: float = Field(..., ge=15.0, le=60.0)
    spatial_resolution_m: float = Field(..., gt=0.0, description="Nominal ground resolution in meters")
    pixel_spacing_m: float = Field(..., gt=0.0)
    acquisition_start_utc: str = Field(...)
    acquisition_end_utc: str = Field(...)
    bounding_box_epsg4326: Tuple[float, float, float, float] = Field(
        ..., description="[min_lon, min_lat, max_lon, max_lat]"
    )
    is_terrain_corrected: bool = Field(True, description="RTC / geocoding applied")
    source_sha256: Optional[str] = Field(None, description="Cryptographic SHA-256 hash of original archive")
