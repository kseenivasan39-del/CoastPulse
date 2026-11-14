# CoastPulse — Production Foundation Reference & Operator Runbook

## 1. Architecture & Service Boundaries

CoastPulse is engineered with clear architectural boundaries separating user interaction, API coordination, heavy scientific radar computing, database persistence, and local/cloud storage:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CoastPulse Architecture                         │
└────────────────────────────────────────────────────────────────────────┘

  [ Client / Web Browser ]
             │
             ▼ (Port 3000 / Next.js SSR & Static React 19 Client)
┌────────────────────────────────────────────────────────────────────────┐
│ 1. Frontend Layer: coastpulse/frontend                                 │
│    - MapLibre GL 2D/3D Geospatial Viewer                               │
│    - Bitemporal Swipe / Diff Inspector                                │
│    - Research Assistant Gemini UI & Provenance Inspector               │
│    - Workspace Manager & Scientific Granule Browser                    │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ (REST API v1 with Bearer JWT)
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 2. Backend API Service: coastpulse/backend (FastAPI / Port 8000)       │
│    - Binds strictly to 127.0.0.1 by default (Local-First Security)      │
│    - API Versioning under /api/v1                                      │
│    - JWT Authentication & Direct Bcrypt Hashing (12 rounds)           │
│    - Role-Based Access Control (public, researcher, analyst, admin)     │
│    - Request ID (X-Request-ID) tracing & Structured Logging            │
│    - Authentic Health Checks with DB latency & disk availability        │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
                    ▼                                ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│ 3. Database Persistence:             │  │ 4. Scientific Engine:        │
│    - Production: PostgreSQL/PostGIS  │  │    coastpulse_engine         │
│    - Lightweight Dev: SQLite+aiosqlite│  │    - HDF5 NISAR L2 GCOV reader│
│    - Alembic Revisions for Migrations│  │    - Radiometric Calibration  │
│    - Fully normalized relational data│  │    - Refined Lee Speckle Filter│
│      (Users, Workspaces, AOIs,       │  │    - Bitemporal Log-Ratio Chg │
│       Acquisitions, Results, Reports)│  │    - Otsu Water & RVI Indices │
└──────────────────────────────────────┘  └──────────────┬───────────────┘
                                                         │
                                                         ▼
                                          ┌──────────────────────────────┐
                                          │ 5. Storage Subsystem:        │
                                          │    - data/raw (authoritative)│
                                          │    - data/processed (COGs)   │
                                          │    - data/cache (rasters)    │
                                          └──────────────────────────────┘
```

---

## 2. Environment Variables & Validated Configuration

CoastPulse uses `pydantic-settings` with strict type validation in `coastpulse/backend/app/core/config.py`.

### Environment Configuration Template (`.env`)

```ini
# --- Core Application & Local Network Binding ---
ENVIRONMENT=production
PROJECT_NAME="CoastPulse - Coastal SAR Intelligence"
API_V1_STR=/api/v1
HOST=127.0.0.1
PORT=8000

# --- Security & JWT Settings ---
# In production, generate a 256-bit secret: openssl rand -hex 32
SECRET_KEY=coastpulse-super-secret-key-change-in-production-minimum-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
PASSWORD_RESET_TOKEN_EXPIRE_MINUTES=60

# --- Database Connection ---
# Production PostgreSQL + PostGIS:
DATABASE_URL=postgresql+asyncpg://coastpulse_user:coastpulse_secure_password@127.0.0.1:5432/coastpulse_db

# Lightweight Local Development SQLite Fallback (default when unset):
# DATABASE_URL=sqlite+aiosqlite:///./coastpulse_dev.db

# --- External EO & AI Credentials ---
# NASA Earthdata Login (ASF DAAC / CMR)
EARTHDATA_USERNAME=your_nasa_earthdata_username
EARTHDATA_PASSWORD=your_nasa_earthdata_password

# Google Gemini API Key (Strictly Grounded Assistant)
GEMINI_API_KEY=your_gemini_api_key

# --- Storage Paths ---
RAW_DATA_DIR=data/raw
PROCESSED_DATA_DIR=data/processed
CACHE_DIR=data/cache
```

---

## 3. Database Setup, Migrations & Reproducible Initialization

### 3.1 PostgreSQL with PostGIS Setup (Production)

1. Provision PostgreSQL container with PostGIS enabled:
   ```bash
   docker run --name coastpulse-postgis \
     -e POSTGRES_USER=coastpulse_user \
     -e POSTGRES_PASSWORD=coastpulse_secure_password \
     -e POSTGRES_DB=coastpulse_db \
     -p 127.0.0.1:5432:5432 \
     -d postgis/postgis:16-3.4
   ```

2. Run Alembic database migrations:
   ```bash
   cd coastpulse
   $env:PYTHONPATH="backend"
   python -m alembic upgrade head
   ```

3. Seed initial authoritative datasets and study areas:
   ```bash
   python -c "import asyncio; from app.db.session import async_session_factory; from app.db.seed import seed_initial_fixtures; asyncio.run(seed_initial_fixtures(async_session_factory()))"
   ```

### 3.2 SQLite Local Development Setup

For lightweight development without running Docker/Postgres:
1. `DATABASE_URL` defaults to `sqlite+aiosqlite:///./coastpulse_dev.db`.
2. The application automatically applies schemas and seeds authentic study areas and repeat-pass observations on startup.

---

## 4. Role-Based Access Control (RBAC) & Authentication

### 4.1 Roles & Hierarchy

| Role | Permissions |
| :--- | :--- |
| `public` | Read-only access to study areas, datasets, public acquisitions, and analysis summaries. |
| `researcher` | Full read access, create personal workspaces, bookmark granules, query AI assistant, export reports. |
| `analyst` | All researcher privileges + submit heavy SAR processing jobs, run bitemporal change detection. |
| `administrator` | Full system access, inspect all user workspaces, manage processing workers, audit system logs. |

### 4.2 Security Architecture

- **Password Hashing:** Passwords are salted and hashed with direct `bcrypt` (`12` rounds of key derivation). No plain-text passwords or vulnerable legacy wrappers (`passlib`) are used.
- **JWT Tokens:** Issued via HS256 with explicit expiration (`exp`), user ID subject (`sub`), role claim (`role`), and token type claim (`access` vs `reset`).
- **Password Reset:** Generates a cryptographic one-time token with a 60-minute window. Email enumeration protection returns identical responses regardless of whether the target user exists.
- **Local-First Binding:** The Uvicorn server and Next.js frontend strictly bind to `127.0.0.1` by default to avoid inadvertent external network exposure.

---

## 5. Running the Application Locally

### 5.1 Starting the FastAPI Backend

```powershell
cd coastpulse
$env:PYTHONPATH="backend;scientific-engine"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Interactive OpenAPI documentation is available at:
`http://127.0.0.1:8000/docs`

### 5.2 Starting the Next.js Frontend

```powershell
cd coastpulse/frontend
npm install
npm run dev
```

The user interface will be live at:
`http://127.0.0.1:3000`

---

## 6. Running Automated Tests

The CoastPulse test suite comprehensively validates all 23 integration, security, and scientific test cases:

```powershell
cd coastpulse
$env:PYTHONPATH="backend;scientific-engine"
python -m pytest tests -v
```

### Verified Test Matrix:

1. `test_auth_workspaces.py`:
   - `test_auth_registration_and_login_lifecycle` (PASSED)
   - `test_password_reset_flow` (PASSED)
   - `test_workspace_crud_and_rbac` (PASSED)
2. `test_backend_api.py`:
   - `test_health_check_endpoint` (PASSED)
   - `test_datasets_endpoints` (PASSED)
   - `test_study_areas_endpoint` (PASSED)
   - `test_acquisitions_endpoint` (PASSED)
   - `test_comparison_compatibility_verification` (PASSED)
   - `test_processing_job_lifecycle` (PASSED)
   - `test_reports_generation` (PASSED)
   - `test_assistant_query` (PASSED)
3. `test_health.py`:
   - `test_health_check` (PASSED)
4. `test_nisar_ingestion.py`:
   - `test_nisar_filename_parser` (PASSED)
   - `test_asf_cmr_search_nagapattinam` (PASSED)
5. `test_scientific_engine.py`:
   - `test_identical_scenes_compatibility` (PASSED)
   - `test_frequency_mismatch_rejection` (PASSED)
   - `test_orbit_direction_rejection` (PASSED)
   - `test_incidence_angle_exceedance` (PASSED)
6. `test_scientific_processing_pipeline.py`:
   - `test_linear_to_db_conversion` (PASSED)
   - `test_refined_lee_filter` (PASSED)
   - `test_log_ratio_change_detection` (PASSED)
   - `test_coastal_water_otsu_and_rvi` (PASSED)
   - `test_scientific_validation_metrics` (PASSED)

---

## 7. Troubleshooting & Operational Guide

| Issue | Likely Cause | Solution |
| :--- | :--- | :--- |
| `ConnectionRefusedError: [WinError 1225]` | PostgreSQL is not running on 127.0.0.1:5432 | Start PostgreSQL via Docker or leave `DATABASE_URL` unset to use SQLite. |
| `429 RESOURCE_EXHAUSTED` from Gemini | Gemini free-tier daily or minute quota exceeded | The backend automatically logs a warning and falls back to deterministic grounded scientific synthesis. To use live AI, provide a paid tier `GEMINI_API_KEY`. |
| `401 Unauthorized` on `/api/v1/workspaces` | Missing or expired JWT Bearer token | Call `/api/v1/auth/login` to obtain an `access_token` and pass `Authorization: Bearer <token>`. |
| `403 Forbidden` on admin endpoints | Current user role is `researcher` or `public` | Request role escalation from an administrator or register with the required role. |
