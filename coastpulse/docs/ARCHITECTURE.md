# COASTPULSE — System Architecture Specification

## 1. Executive Overview

COASTPULSE is an advanced Earth Observation (EO) data pipeline and decision-support system designed to ingest, validate, process, and visualize radar backscatter observations from the NASA–ISRO SAR (NISAR) mission and compatible spaceborne SAR constellations (such as Sentinel-1 SAR).

This document outlines the architectural topology, data governance models, micro-service boundaries, and integration protocols required to fulfill high scientific rigor.

---

## 2. High-Level System Architecture

```mermaid
flowchart TD
    subgraph Data Sources [Satellite Data Ingestion]
        NISAR_L[NISAR L-band HDF5 / GCOV / GSLC]
        NISAR_S[NISAR S-band HDF5 / GCOV]
        S1_SAR[Sentinel-1 GRD / SLC Baseline]
        DEM[Copernicus 30m / NASADEM GLO-30]
    end

    subgraph Scientific Processing Engine [Python 3.12+ Core Engine]
        ValEngine[Product Inspector & Metadata Validator]
        RadiomCal[Radiometric Calibration & Gamma Nought Conversion]
        CompatCheck[Orbit & Geometric Compatibility Assessor]
        SpeckleFilt[Multi-Temporal Quegan-Yu Filter]
        ChangeDetect[Polarimetric Ratio & Log-Ratio Engine]
        WaterVegClas[Adaptive Thresholding & RVI/SDWI Classifier]
        UncertaintyAssess[Uncertainty & Quality Estimator]
    end

    subgraph Backend Service [FastAPI Service Layer]
        CatalogService[Dataset Catalog & Spatio-Temporal Queries]
        JobOrchestrator[Asynchronous Job Queue - Redis/Celery]
        GeoServer[Cloud-Optimized GeoTIFF / Tile Provider]
        ProvenanceLedger[Data Provenance & Audit Trail]
        AIAdvisor[Gemini Grounded Scientific Explainer]
    end

    subgraph Data Persistence [Storage Architecture]
        PostGIS[(PostgreSQL 16 + PostGIS)]
        Redis[(Redis Cache & Task Broker)]
        ObjectStore[(Object Store / Local LakeFS: raw & processed)]
    end

    subgraph Frontend Application [Next.js 16 + React 19]
        DeckMap[MapLibre GL / Deck.gl Dual-Viewer]
        SARAnalysisView[SAR Radiometric Inspector]
        ChangeView[Temporal Diff & Threshold Slider]
        EcosystemIntel[Ecosystem Classification & Biomass Trends]
        ReportGen[Reproducible Scientific Report Engine]
    end

    Data Sources --> ValEngine
    ValEngine --> RadiomCal
    RadiomCal --> CompatCheck
    CompatCheck --> SpeckleFilt
    SpeckleFilt --> ChangeDetect
    ChangeDetect --> WaterVegClas
    WaterVegClas --> UncertaintyAssess

    UncertaintyAssess --> GeoServer
    UncertaintyAssess --> ProvenanceLedger
    ProvenanceLedger --> PostGIS
    GeoServer --> ObjectStore

    JobOrchestrator <--> Redis
    JobOrchestrator --> Scientific Processing Engine

    Frontend Application <--> Backend Service
    Backend Service --> PostGIS
    Backend Service --> Redis
```

---

## 3. Core Subsystems

### 3.1 Scientific Engine (`scientific-engine/`)
The scientific engine is implemented as an independent, deterministic Python library:
- **`metadata_validator`**: Parses standard NISAR HDF5 structures (L-SAR and S-SAR products: L1 GCOV, L2 GEMA, L1 GSLC) and verify HDF5 groups `/science/LSAR/GCOV/grids/frequencyA/...`.
- **`compatibility_evaluator`**: Verifies scene cross-compatibility:
  - Exact match of Sensor Carrier Frequency ($f_0$, e.g., 1.26 GHz for L-band vs 3.2 GHz for S-band).
  - Orbit Pass Direction (Ascending vs Descending).
  - Look Angle / Center Incidence Angle range ($\pm 2^\circ$ tolerance for backscatter change detection).
  - Relative Orbit / Track geometry.
  - Consistent polarization channels (e.g. co-pol HH/VV and cross-pol HV/VH).
- **`radiometric_processor`**: Converts raw digital numbers ($DN$) into calibrated backscatter coefficients ($\beta^0, \sigma^0, \gamma^0$) using metadata scale factors and terrain flattening.
- **`change_detector`**: Implements ratioing, difference metrics ($\Delta \gamma^0_{\text{dB}}$), and temporal speckle filtering.
- **`water_vegetation`**: Dual-polarization water indices (e.g., Radar Water Index, BDD) and Radar Vegetation Index ($RVI = \frac{4 \times HV}{HH + HV}$).
- **`uncertainty`**: Quantifies calibration uncertainty, radiometric resolution limits, and thermal noise floor ($NESZ$).

### 3.2 Backend Service Layer (`backend/`)
- **FastAPI Framework**: High-throughput, async-first REST/JSON API.
- **Database (PostgreSQL + PostGIS)**: Spatially indexed storage for granule footprints, scene metadata, processing parameters, and audit trails.
- **Job Orchestration**: Asynchronous execution for CPU-intensive SAR algorithms with real-time status reporting.
- **Provenance System**: Cryptographic hash tracking ($SHA-256$) of input files, configuration parameters, and output artifacts.
- **Gemini Evidence Service**: Prompts constrained with strict schema validation; inputs must contain computed statistics and confidence intervals; outputs must cite explicit radiometric bounds.

### 3.3 Frontend Layer (`frontend/`)
- **Next.js 16 & React 19**: Modern concurrent React architecture with Server Components and Client Components.
- **MapLibre GL**: WebGL-accelerated rendering for high-resolution SAR rasters, Cloud-Optimized GeoTIFFs (COGs), vector polygons, and coastal transects.
- **Tailwind CSS & shadcn/ui**: Cohesive deep navy & cyan scientific design system.
- **Recharts**: High-precision statistical visualizations (backscatter histograms, polarimetric decomposition signatures, temporal transects).

---

## 4. API Endpoints Architecture (REST v1)

| Domain | Method | Endpoint | Description |
|---|---|---|---|
| Health | `GET` | `/api/v1/health` | Service health status, database ping, and environment info |
| Catalog | `GET` | `/api/v1/catalog/granules` | Query available SAR scenes over Nagapattinam AOI |
| Metadata | `POST` | `/api/v1/sar/inspect` | Inspect HDF5/GeoTIFF metadata, channels, and geometry |
| Compatibility | `POST` | `/api/v1/sar/verify-compatibility` | Test scientific validity of comparing two scenes |
| Processing | `POST` | `/api/v1/jobs/submit` | Submit background change detection or water masking job |
| Jobs | `GET` | `/api/v1/jobs/{job_id}` | Query execution status, progress, and logs |
| Analysis | `GET` | `/api/v1/analysis/{analysis_id}` | Retrieve final raster URLs, metrics, and uncertainty bounds |
| Provenance | `GET` | `/api/v1/provenance/{granule_id}`| Audit trail, processing logs, and transformation steps |
| AI Explain | `POST` | `/api/v1/ai/explain` | Evidence-grounded synthesis of computed changes |

---

## 5. Security & Scientific Safeguards

1. **Role-Based Access & Integrity**: Raw satellite data directory is mounted read-only to processing workers to prevent unintentional mutations.
2. **Deterministic Processing**: Pipelines are versioned with reproducible execution environments (containerized GDAL/PROJ dependencies).
3. **Graceful Degradation**: Fallback to local processing and static reference validation datasets when external satellite portals are unreachable.
