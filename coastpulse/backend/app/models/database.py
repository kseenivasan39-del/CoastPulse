import datetime
import enum
from sqlalchemy import (
    Column,
    String,
    Float,
    Integer,
    Boolean,
    DateTime,
    JSON,
    ForeignKey,
    Text,
    Enum as SQLEnum,
)
from sqlalchemy.orm import relationship
from app.db.session import Base


class UserRole(str, enum.Enum):
    PUBLIC = "public"
    RESEARCHER = "researcher"
    ANALYST = "analyst"
    ADMINISTRATOR = "administrator"


class User(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(128), nullable=True)
    role = Column(SQLEnum(UserRole), default=UserRole.PUBLIC, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.datetime.now(datetime.UTC))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.datetime.now(datetime.UTC), onupdate=lambda: datetime.datetime.now(datetime.UTC))

    workspaces = relationship("Workspace", back_populates="owner", cascade="all, delete-orphan")


class Workspace(Base):
    __tablename__ = "workspaces"

    id = Column(String(64), primary_key=True, index=True)
    user_id = Column(String(64), ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(128), nullable=False)
    description = Column(Text, nullable=True)
    aoi_geojson = Column(JSON, nullable=True)  # Polygon or BBOX GeoJSON
    saved_granules = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.datetime.now(datetime.UTC))

    owner = relationship("User", back_populates="workspaces")


class StudyArea(Base):
    __tablename__ = "study_areas"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    region = Column(String(128), nullable=False)
    min_lon = Column(Float, nullable=False)
    min_lat = Column(Float, nullable=False)
    max_lon = Column(Float, nullable=False)
    max_lat = Column(Float, nullable=False)
    total_area_ha = Column(Float, nullable=False)
    wetland_area_ha = Column(Float, nullable=False)
    coastal_length_km = Column(Float, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.datetime.now(datetime.UTC))

    acquisitions = relationship("Acquisition", back_populates="study_area")
    analysis_results = relationship("AnalysisResult", back_populates="study_area")


class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(String(64), primary_key=True, index=True)
    mission = Column(String(64), nullable=False, index=True)  # NISAR-LSAR, NISAR-SSAR, SENTINEL-1A
    instrument = Column(String(64), nullable=False)           # L-SAR, S-SAR, C-SAR
    provider = Column(String(64), nullable=False)             # NASA-ISRO / ESA
    radar_band = Column(String(8), nullable=False)            # L, S, C
    description = Column(Text, nullable=True)
    license = Column(String(64), default="CC-BY-4.0")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.datetime.now(datetime.UTC))

    acquisitions = relationship("Acquisition", back_populates="dataset")


class Acquisition(Base):
    __tablename__ = "acquisitions"

    id = Column(String(128), primary_key=True, index=True)  # Granule ID
    dataset_id = Column(String(64), ForeignKey("datasets.id"), nullable=False)
    study_area_id = Column(String(64), ForeignKey("study_areas.id"), nullable=False)
    product_level = Column(String(32), nullable=False)     # L2_GCOV, L1_RSLC, L1_GRD
    orbit_pass = Column(String(16), nullable=False)        # ASCENDING, DESCENDING
    relative_orbit = Column(Integer, nullable=False)       # Track number
    center_frequency_ghz = Column(Float, nullable=False)
    center_incidence_angle_deg = Column(Float, nullable=False)
    incidence_angle_near_deg = Column(Float, nullable=False)
    incidence_angle_far_deg = Column(Float, nullable=False)
    spatial_resolution_m = Column(Float, nullable=False)
    pixel_spacing_m = Column(Float, nullable=False)
    polarizations = Column(JSON, nullable=False)           # ["HH", "HV"]
    acquisition_date = Column(DateTime(timezone=True), nullable=False, index=True)
    source_sha256 = Column(String(64), nullable=False)
    is_terrain_corrected = Column(Boolean, default=True)
    is_sample_fixture = Column(Boolean, default=False)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.datetime.now(datetime.UTC))

    dataset = relationship("Dataset", back_populates="acquisitions")
    study_area = relationship("StudyArea", back_populates="acquisitions")


class ProcessingJob(Base):
    __tablename__ = "processing_jobs"

    id = Column(String(64), primary_key=True, index=True)
    job_name = Column(String(128), nullable=False)
    granule_id = Column(String(128), nullable=False, index=True)
    algorithm = Column(String(128), nullable=False)
    status = Column(String(32), default="QUEUED", index=True)  # QUEUED, PROCESSING, COMPLETED, FAILED, CANCELLED
    progress_percent = Column(Integer, default=0)
    parameters = Column(JSON, nullable=True)
    logs = Column(JSON, default=list)
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.datetime.now(datetime.UTC))


class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(String(64), primary_key=True, index=True)
    title = Column(String(128), nullable=False)
    study_area_id = Column(String(64), ForeignKey("study_areas.id"), nullable=False)
    reference_granule_id = Column(String(128), nullable=False)
    secondary_granule_id = Column(String(128), nullable=True)
    analysis_type = Column(String(64), nullable=False)  # WATER_DELINEATION, CHANGE_DETECTION, MANGROVE_RVI
    polarization = Column(String(16), nullable=False)
    mean_delta_db = Column(Float, nullable=True)
    std_delta_db = Column(Float, nullable=True)
    water_area_gain_ha = Column(Float, nullable=True)
    water_area_loss_ha = Column(Float, nullable=True)
    vegetation_biomass_shift_pct = Column(Float, nullable=True)
    uncertainty_margin_db = Column(Float, default=0.42)
    confidence_score = Column(Float, default=95.0)
    provenance_hash = Column(String(64), nullable=False)
    metrics_json = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.datetime.now(datetime.UTC))

    study_area = relationship("StudyArea", back_populates="analysis_results")


class Report(Base):
    __tablename__ = "reports"

    id = Column(String(64), primary_key=True, index=True)
    title = Column(String(256), nullable=False)
    report_type = Column(String(32), default="TECHNICAL_BULLETIN")
    study_area_id = Column(String(64), ForeignKey("study_areas.id"), nullable=False)
    granule_ids = Column(JSON, nullable=False)
    content_markdown = Column(Text, nullable=False)
    provenance_manifest = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.datetime.now(datetime.UTC))
