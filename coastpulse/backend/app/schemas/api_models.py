from typing import List, Optional, Dict, Any, Generic, TypeVar
from datetime import datetime, timezone
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from app.models.database import UserRole

T = TypeVar("T")


# ------------------------------------------------------------------------------
# Generic API Envelope & Pagination
# ------------------------------------------------------------------------------
class ApiResponse(BaseModel, Generic[T]):
    success: bool = True
    data: Optional[T] = None
    message: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    size: int
    pages: int


# ------------------------------------------------------------------------------
# User & Authentication Schemas
# ------------------------------------------------------------------------------
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: UserRole = UserRole.PUBLIC


class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=72, description="Password minimum 8 chars")
    full_name: Optional[str] = None
    role: Optional[UserRole] = UserRole.RESEARCHER


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in_seconds: int
    user_id: str
    email: str
    role: str


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirmRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8, max_length=72)


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    role: UserRole
    is_active: bool
    is_verified: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ------------------------------------------------------------------------------
# Workspace Schemas
# ------------------------------------------------------------------------------
class WorkspaceCreateRequest(BaseModel):
    name: str
    description: Optional[str] = None
    aoi_geojson: Optional[Dict[str, Any]] = None
    saved_granules: List[str] = []


class WorkspaceResponse(BaseModel):
    id: str
    user_id: str
    name: str
    description: Optional[str] = None
    aoi_geojson: Optional[Dict[str, Any]] = None
    saved_granules: List[str] = []
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ------------------------------------------------------------------------------
# Study Area Schemas
# ------------------------------------------------------------------------------
class StudyAreaBase(BaseModel):
    id: str
    name: str
    region: str
    min_lon: float
    min_lat: float
    max_lon: float
    max_lat: float
    total_area_ha: float
    wetland_area_ha: float
    coastal_length_km: float
    description: Optional[str] = None


class StudyAreaResponse(StudyAreaBase):
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ------------------------------------------------------------------------------
# Dataset & Acquisition Schemas
# ------------------------------------------------------------------------------
class DatasetResponse(BaseModel):
    id: str
    mission: str
    instrument: str
    provider: str
    radar_band: str
    description: Optional[str] = None
    license: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class AcquisitionResponse(BaseModel):
    id: str
    dataset_id: str
    study_area_id: str
    product_level: str
    orbit_pass: str
    relative_orbit: int
    center_frequency_ghz: float
    center_incidence_angle_deg: float
    incidence_angle_near_deg: float
    incidence_angle_far_deg: float
    spatial_resolution_m: float
    pixel_spacing_m: float
    polarizations: List[str]
    acquisition_date: datetime
    source_sha256: str
    is_terrain_corrected: bool
    is_sample_fixture: bool
    metadata_json: Optional[Dict[str, Any]] = None
    model_config = ConfigDict(from_attributes=True)


# ------------------------------------------------------------------------------
# Processing Job Schemas
# ------------------------------------------------------------------------------
class JobSubmitRequest(BaseModel):
    job_name: str
    granule_id: str
    algorithm: str
    parameters: Optional[Dict[str, Any]] = None


class JobResponse(BaseModel):
    id: str
    job_name: str
    granule_id: str
    algorithm: str
    status: str
    progress_percent: int
    parameters: Optional[Dict[str, Any]] = None
    logs: List[str] = []
    error_message: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ------------------------------------------------------------------------------
# Analysis & Comparison Schemas
# ------------------------------------------------------------------------------
class ComparisonVerifyRequest(BaseModel):
    reference_granule_id: str
    secondary_granule_id: str
    max_incidence_delta_deg: float = 2.0


class ComparisonVerifyResponse(BaseModel):
    is_compatible: bool
    rejection_reasons: List[str]
    advisories: List[str]
    delta_incidence_deg: float
    common_polarizations: List[str]
    scientific_notice: str


class AnalysisResultResponse(BaseModel):
    id: str
    title: str
    study_area_id: str
    reference_granule_id: str
    secondary_granule_id: Optional[str] = None
    analysis_type: str
    polarization: str
    mean_delta_db: Optional[float] = None
    std_delta_db: Optional[float] = None
    water_area_gain_ha: Optional[float] = None
    water_area_loss_ha: Optional[float] = None
    vegetation_biomass_shift_pct: Optional[float] = None
    uncertainty_margin_db: float
    confidence_score: float
    provenance_hash: str
    metrics_json: Optional[Dict[str, Any]] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ------------------------------------------------------------------------------
# Report Schemas
# ------------------------------------------------------------------------------
class ReportGenerateRequest(BaseModel):
    title: str
    study_area_id: str
    granule_ids: List[str]
    format: str = "markdown"  # markdown or json


class ReportResponse(BaseModel):
    id: str
    title: str
    report_type: str
    study_area_id: str
    granule_ids: List[str]
    content_markdown: str
    provenance_manifest: Dict[str, Any]
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ------------------------------------------------------------------------------
# AI Assistant Schemas
# ------------------------------------------------------------------------------
class AssistantQueryRequest(BaseModel):
    prompt: str
    context_granule_ids: Optional[List[str]] = None
    study_area_id: Optional[str] = None


class CitationItem(BaseModel):
    granule_id: str
    metric: str
    uncertainty: str


class AssistantQueryResponse(BaseModel):
    response_text: str
    citations: List[CitationItem]
    grounding_manifest: Dict[str, Any]
    disclaimer: str
