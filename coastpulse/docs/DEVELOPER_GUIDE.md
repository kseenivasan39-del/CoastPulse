# CoastPulse — Developer Guide & Architecture Manual

This document details the software architecture, coding conventions, scientific pipelines, and testing procedures for developers contributing to CoastPulse.

---

## 1. High-Level System Architecture

CoastPulse is partitioned into four decoupled tiers:

```mermaid
graph LR
    subgraph Client
        FE[Next.js 16 / React 19 Frontend]
        MapLibre[MapLibre GL JS Engine]
    end

    subgraph Service Tier
        API[FastAPI Gateway / ASGI]
        Auth[RBAC & JWT Session Manager]
    end

    subgraph Scientific Processing Engine
        NISAR[NISAR GCOV Pipeline]
        Filtering[Refined Lee Speckle Filter]
        ChangeDet[Log-Ratio Change Engine]
        Otsu[Otsu Water Segmenter]
    end

    subgraph Storage & Persistence
        DB[(PostgreSQL / SQLite)]
        COG[(Cloud-Optimized GeoTIFFs)]
    end

    FE -->|REST API v1| API
    API --> Auth
    API --> DB
    API --> Scientific Processing Engine
    Scientific Processing Engine --> COG
```

---

## 2. Directory Structure & Code Boundaries

```
coastpulse/
├── backend/                  # FastAPI Application Core
│   └── app/
│       ├── api/v1/           # Versioned REST endpoints (acquisitions, health, reports, etc.)
│       ├── core/             # Configuration (pydantic-settings), security (passlib, jwt)
│       ├── db/               # SQLAlchemy engine, session management, and seed fixtures
│       ├── models/           # Declarative ORM models
│       └── services/         # Background job runner, AI advisor, monitoring services
├── scientific-engine/        # Standalone Scientific Python Library (coastpulse_engine)
│   └── coastpulse_engine/
│       ├── calibration/      # Power-to-dB conversion, Refined Lee speckle filtering
│       ├── change/           # Log-ratio detector, Otsu segmentation, RVI calculation
│       ├── core/             # Spatial grid alignment, metadata inspection, raster utilities
│       ├── pipelines/        # Sensor-specific pipelines (NISAR GCOV, Sentinel-1)
│       ├── providers/        # EO discovery adapters (NASA ASF DAAC, Copernicus STAC)
│       └── reports/          # ReportLab PDF generation and CSV exporters
├── frontend/                 # Next.js 16 Web Application (App Router & MapLibre)
├── environments/             # Profile configuration presets (.env.local, .env.lan, etc.)
├── scripts/                  # Lifecycle scripts, DB initialisation, reproducible workflows
├── tests/                    # Complete pytest unit, integration, and scientific test suite
└── docs/                     # Engineering documentation and user manuals
```

---

## 3. Scientific Remote Sensing Standards

When adding new algorithms or sensor pipelines, follow these mandatory rules:

1. **No Browse Resampling:** Original radar measurements must be preserved. Never use 8-bit browse PNGs as inputs for radiometric or change analysis.
2. **Linear vs Decibel ($\text{dB}$):**
   - Filtering operations (Lee filter) must occur in the linear power domain.
   - Thresholding and visualization operations occur in decibels:
     $$\gamma^0_{\text{dB}} = 10 \cdot \log_{10}(\gamma^0_{\text{linear}})$$
3. **Compatibility Validation:** Before running comparisons between two SAR scenes, enforce:
   - Same radar frequency band (e.g., L-band to L-band).
   - Same orbit direction (Ascending vs Descending).
   - Same look direction (Right-looking vs Left-looking).
   - Incidence angle difference $\le 3.0^\circ$.
4. **Memory Management:** Always use windowed or tiled reading via `rasterio.windows.Window` to avoid loading multi-gigabyte rasters into memory.

---

## 4. Running Tests & Quality Checks

### Test Suite Execution
Set `PYTHONPATH` to include backend and scientific-engine:
```bash
# Windows PowerShell
$env:PYTHONPATH = "backend;scientific-engine"
python -m pytest tests -v

# Linux / macOS
PYTHONPATH="backend:scientific-engine" pytest tests -v
```

### Type Checking & Frontend Build
```bash
cd frontend
npm run type-check
npm run build
```

---

## 5. Adding a New Satellite Provider Adapter

To integrate a new satellite data source (e.g., Sentinel-2 MSI or PlanetScope):
1. Create a new subclass of `BaseProviderAdapter` in `coastpulse_engine/providers/`.
2. Implement the `search(aoi, date_range, product_type)` method returning standard GeoJSON FeatureCollections.
3. Register the adapter in `coastpulse_engine/providers/manager.py`.
4. Add corresponding unit tests in `tests/test_eo_discovery_ingestion.py`.
