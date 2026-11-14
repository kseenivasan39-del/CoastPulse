# Database Schema & Model Specification

This document serves as the authoritative source of truth for the CoastPulse persistence layer.

## 1. Database Engine

- **Default Engine**: SQLite 3 (with Write-Ahead Logging `WAL` mode enabled).
- **Production Target**: PostgreSQL 16+ with PostGIS spatial extensions.
- **ORM / Migrations**: SQLAlchemy 2.0+ and Alembic.

## 2. Naming Conventions

- **Tables**: Lowercase, plural, snake_case (e.g., `satellite_observations`, `study_areas`).
- **Columns**: Lowercase, snake_case (e.g., `acquisition_date`, `source_product_id`).
- **Primary Keys**: `id` (Integer autoincrement or UUID string).
- **Foreign Keys**: `[singular_table]_id` (e.g., `user_id`, `study_area_id`).
- **Timestamps**: `created_at`, `updated_at` (stored in ISO 8601 UTC format).

## 3. Core Tables

### `users`
Purpose: Authentication, identity management, and research access roles.
Columns:
- `id` (String, PK, UUID)
- `email` (String, Unique, Indexed)
- `hashed_password` (String)
- `full_name` (String)
- `role` (String: `admin`, `scientist`, `observer`, default `scientist`)
- `is_active` (Boolean, default True)
- `created_at` (DateTime UTC)
- `updated_at` (DateTime UTC)

### `satellite_observations`
Purpose: Authoritative registry of ingested and discovered satellite granules.
Columns:
- `id` (String, PK, e.g., `granule-nisar-20261030`)
- `granule_id` (String, Unique, Indexed)
- `satellite` (String: `NISAR`, `Sentinel-1`, `Sentinel-2`, `Landsat-9`)
- `sensor` (String: `L-SAR`, `S-SAR`, `C-SAR`, `MSI`, `OLI-2`)
- `polarization` (String: `HH+HV`, `VV+VH`, `Single HH`)
- `orbit_direction` (String: `Ascending`, `Descending`)
- `acquisition_date` (DateTime UTC, Indexed)
- `spatial_resolution_m` (Float)
- `processing_level` (String: `L2 GCOV`, `L1 SLC`, `L2A Surface Reflectance`)
- `min_lon`, `min_lat`, `max_lon`, `max_lat` (Float, Bounding Box coordinates)
- `file_path` (String, Path to authoritative GeoTIFF on disk)
- `ingestion_status` (String: `READY`, `PROCESSING`, `FAILED`)
- `created_at` (DateTime UTC)

### `study_areas`
Purpose: User-defined and system-monitored coastal Areas of Interest (AOIs).
Columns:
- `id` (String, PK, UUID)
- `user_id` (String, FK -> `users.id`, nullable for system defaults)
- `name` (String, Indexed)
- `region` (String, e.g., `Tamil Nadu`, `Mekong Delta`)
- `country` (String)
- `min_lon`, `min_lat`, `max_lon`, `max_lat` (Float)
- `area_km2` (Float)
- `created_at` (DateTime UTC)

### `change_analyses`
Purpose: Bi-temporal change detection execution logs and reproducible run manifests.
Columns:
- `id` (String, PK, UUID)
- `baseline_observation_id` (String, FK -> `satellite_observations.id`)
- `repeat_observation_id` (String, FK -> `satellite_observations.id`)
- `polarization_channel` (String: `HH`, `HV`)
- `threshold_db` (Float, default 3.0)
- `output_geotiff_path` (String)
- `changed_area_ha` (Float)
- `inundation_area_ha` (Float)
- `execution_duration_sec` (Float)
- `verification_hash` (String, SHA-256)
- `created_at` (DateTime UTC)

### `coastal_events`
Purpose: Global Coastal Event Watch validation lifecycle tracking.
Columns:
- `id` (String, PK, UUID)
- `event_type` (String: `inundation`, `mangrove_loss`, `shoreline_shift`)
- `location_name` (String)
- `coordinates_json` (Text / GeoJSON)
- `status` (String: `OBSERVATION_DISCOVERED`, `PROCESSING`, `POTENTIAL_EVENT`, `NEEDS_VALIDATION`, `VALIDATED_CHANGE`, `DISMISSED`)
- `confidence_score` (Float, 0.0 - 1.0)
- `created_at` (DateTime UTC)
- `updated_at` (DateTime UTC)

## 4. Relationships

- `users` → `study_areas`: One user can create many study areas.
- `satellite_observations` → `change_analyses`: An observation can serve as baseline or repeat in multiple change runs.
- `study_areas` → `coastal_events`: One study area monitors many potential coastal events.

## 5. Constraints & Integrity Rules

- Foreign key constraints enforced on SQLite via `PRAGMA foreign_keys = ON;`.
- Bounding box checks: `min_lon <= max_lon` and `min_lat <= max_lat`.
- Threshold validation: `threshold_db > 0.0`.
- Unique constraints on `granule_id` prevent duplicate ingestion of identical satellite scenes.

## 6. Migration Rules

1. Every schema change must be accompanied by an Alembic migration script inside `coastpulse/alembic/versions/`.
2. Downgrade routines (`def downgrade()`) must be implemented for rollback testing.
3. Production upgrades must execute non-destructive operations (no unannounced column drops).
