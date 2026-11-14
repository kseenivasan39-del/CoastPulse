"""
Global Coastal Event Watch Data Models and Lifecycle State Machine.
Defines explicit 7-stage validation lifecycle, sensor compatibility constraints,
evidence structures, and persistent subscriptions.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from enum import Enum
from pydantic import BaseModel, Field


class EventValidationStatus(str, Enum):
    OBSERVATION_DISCOVERED = "OBSERVATION_DISCOVERED"
    PROCESSING = "PROCESSING"
    POTENTIAL_EVENT = "POTENTIAL_EVENT"
    NEEDS_VALIDATION = "NEEDS_VALIDATION"
    VALIDATED_CHANGE = "VALIDATED_CHANGE"
    INSUFFICIENT_EVIDENCE = "INSUFFICIENT_EVIDENCE"
    DISMISSED = "DISMISSED"


class CoastalEventType(str, Enum):
    INUNDATION_WATER_EXTENT = "INUNDATION_WATER_EXTENT"
    MANGROVE_DISTURBANCE = "MANGROVE_DISTURBANCE"
    SHORELINE_EROSION = "SHORELINE_EROSION"
    COASTAL_VEGETATION_SHIFT = "COASTAL_VEGETATION_SHIFT"
    COASTAL_URBAN_EXPANSION = "COASTAL_URBAN_EXPANSION"
    POST_STORM_SURFACE_CHANGE = "POST_STORM_SURFACE_CHANGE"


class SensorCompatibility(BaseModel):
    sensor_id: str  # e.g., "NISAR_L_GCOV", "SENTINEL_1_C", "SENTINEL_2_MSI"
    wavelength_band: str  # e.g. "L-band (24 cm)", "C-band (5.6 cm)", "VNIR/SWIR"
    spatial_resolution_m: float
    compatible_event_types: List[CoastalEventType]
    limitations: str


SENSOR_REGISTRY: Dict[str, SensorCompatibility] = {
    "NISAR_L_BAND": SensorCompatibility(
        sensor_id="NISAR_L_BAND",
        wavelength_band="L-band (1.2575 GHz / 24 cm)",
        spatial_resolution_m=10.0,
        compatible_event_types=[
            CoastalEventType.INUNDATION_WATER_EXTENT,
            CoastalEventType.MANGROVE_DISTURBANCE,
            CoastalEventType.POST_STORM_SURFACE_CHANGE,
            CoastalEventType.COASTAL_VEGETATION_SHIFT,
        ],
        limitations="Penetrates upper canopy; double-bounce backscatter requires dual-pol (HH+HV) normalization to avoid soil moisture ambiguity.",
    ),
    "ISRO_S_BAND": SensorCompatibility(
        sensor_id="ISRO_S_BAND",
        wavelength_band="S-band (3.200 GHz / 9.3 cm)",
        spatial_resolution_m=10.0,
        compatible_event_types=[
            CoastalEventType.COASTAL_VEGETATION_SHIFT,
            CoastalEventType.POST_STORM_SURFACE_CHANGE,
            CoastalEventType.INUNDATION_WATER_EXTENT,
        ],
        limitations="Intermediate penetration; sensitive to top-canopy rough scattering and emergent wetland reeds.",
    ),
    "SENTINEL_1_C_BAND": SensorCompatibility(
        sensor_id="SENTINEL_1_C_BAND",
        wavelength_band="C-band (5.405 GHz / 5.6 cm)",
        spatial_resolution_m=10.0,
        compatible_event_types=[
            CoastalEventType.INUNDATION_WATER_EXTENT,
            CoastalEventType.SHORELINE_EROSION,
            CoastalEventType.COASTAL_URBAN_EXPANSION,
        ],
        limitations="Saturates in dense mangrove canopies; wind-induced waves cause specular threshold shifting.",
    ),
    "SENTINEL_2_MSI": SensorCompatibility(
        sensor_id="SENTINEL_2_MSI",
        wavelength_band="Optical Multi-Spectral (13 bands)",
        spatial_resolution_m=10.0,
        compatible_event_types=[
            CoastalEventType.MANGROVE_DISTURBANCE,
            CoastalEventType.SHORELINE_EROSION,
            CoastalEventType.COASTAL_VEGETATION_SHIFT,
            CoastalEventType.COASTAL_URBAN_EXPANSION,
        ],
        limitations="Completely obscured by tropical cyclone cloud cover; requires cloud mask (<15% cloud cover).",
    ),
}


class CoastalEventEvidence(BaseModel):
    satellite_sources: List[str]
    sensors_used: List[str]
    t1_acquisition_utc: str
    t2_acquisition_utc: str
    publication_latency_hours: float
    detection_method: str
    spatial_coverage_ha: float
    affected_area_ha: float
    confidence_score: float = Field(ge=0.0, le=1.0)
    uncertainty_description: str
    multi_sensor_verified: bool = False
    independent_confirmation_notes: Optional[str] = None


class CoastalEventRecord(BaseModel):
    event_id: str
    title: str
    event_type: CoastalEventType
    status: EventValidationStatus
    aoi_id: Optional[str] = None
    aoi_name: str
    region: str
    country: str
    coordinates: List[float]  # [lon, lat]
    bbox: List[float]  # [min_lon, min_lat, max_lon, max_lat]
    polygon_geojson: Optional[Dict[str, Any]] = None
    
    # Explicit 4-entity timestamp protocol
    acquisition_utc: str
    publication_utc: str
    processing_utc: str
    detection_utc: str
    
    evidence: CoastalEventEvidence
    validation_notes: List[str] = Field(default_factory=list)
    limitations: str
    provenance_hash: str


class EventSubscription(BaseModel):
    subscription_id: str
    user_id: str
    target_aoi_id: Optional[str] = None
    target_country: Optional[str] = None
    event_types: List[CoastalEventType]
    min_confidence: float = 0.65
    notification_channel: str = "IN_APP"  # IN_APP or EMAIL
    email_address: Optional[str] = None
    frequency: str = "IMMEDIATE"  # IMMEDIATE, DAILY_DIGEST
    is_active: bool = True
    created_at: str
