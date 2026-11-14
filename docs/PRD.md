# Product Requirements Document

## 1. Product Overview

Product Name: **CoastPulse**
One-Line Description: Scientific Earth-observation platform utilizing NASA–ISRO NISAR dual-band radar and multi-sensor satellite data to monitor and assess changes in vulnerable coastal wetlands, dynamic water extent, and mangrove ecosystems.
Product Type: Geospatial Analytics Platform / Scientific Web Application
Primary Platform: Web (Responsive Desktop & Mission Control Workspace)

## 2. Problem

What problem are we solving?
Coastal ecosystems (wetlands, estuaries, deltas, and mangroves) are experiencing accelerated loss and severe morphological shifts due to climate hazards, storm surges, and anthropomorphic encroachment. Optical satellites are severely impaired by persistent cloud cover and atmospheric attenuation during monsoons and storms.

Why does this problem matter?
Mangroves and coastal barriers protect millions of lives and critical infrastructure from cyclones and sea-level rise. Decision-makers and researchers lack access to authoritative, cloud-penetrating radar remote sensing products that separate verifiable physical backscatter changes from synthetic hallucinations.

How are users solving this today?
Traditional methods rely on sporadic manual field surveys or delayed optical imagery mosaics (Sentinel-2, Landsat) that are obscured during extreme weather events. Existing platforms often display interpolated or mocked data without physical calibration provenance.

## 3. Goals

Primary Goal:
Deliver an end-to-end, scientifically defensible coastal intelligence system that ingests genuine NASA-ISRO NISAR L-band and S-band radar cross-sections ($\gamma^0, \sigma^0$), computes rigorous radiometric calibrations and temporal change detection, and presents interactive multi-layer visualization for coastal resilience.

Secondary Goals:
- Automate satellite observation discovery via STAC / CMR API adapters (NASA ASF, ISRO Bhoonidhi, Copernicus, USGS).
- Provide a pixel-level geospatial inspector displaying exact backscatter intensity in decibels (dB), linear power, polarimetric decomposition, and valid mask flags.
- Deliver an evidence-grounded AI Research Assistant constrained to physical radar cross-sections with zero speculative hallucination.
- Facilitate reproducible scientific reporting with automated PDF generation and cryptographic verification hashes.

## 4. Target Users

### User Type 1: Coastal Resilience Researcher / GIS Specialist
Name: Dr. Remote Sensing Scientist
Description: Investigates wetland degradation and shoreline dynamics across coastal regions like Nagapattinam and the Muthupet mangrove complex.
Needs:
- Raw and calibrated backscatter values ($\gamma^0_{HH}, \gamma^0_{HV}$) in dB.
- Bi-temporal change detection maps with configurable statistical thresholds ($> 3.0\text{ dB}$).
- Windowed raster statistics and histograms over custom Areas of Interest (AOIs).
Pain Points:
- Black-box algorithms without documented radiometric calibration formulas.
- Tools that synthesize fake observations when granules are missing.

### User Type 2: Disaster Management & Coastal Zone Authority
Name: Regional Emergency Coordinator
Description: Monitors flood inundation and storm surge breaches during monsoons and cyclone landfalls.
Needs:
- Rapid flood extent and shoreline recession vector layers.
- Clear distinction between open water, flooded vegetation, and stable land.
- Exportable high-resolution reports with acquisition timestamps and spatial coordinates.
Pain Points:
- Unreliable optical imagery blocked by storm clouds.
- Complex desktop GIS software that cannot be accessed quickly in field operations.

## 5. User Stories

- As a GIS researcher, I want to toggle between HH and HV polarization channels so that I can inspect surface roughness and volume scattering independently.
- As a coastal scientist, I want to run bi-temporal change detection between two NISAR repeat passes so that I can identify verified mangrove disturbances and water logging.
- As an environmental planner, I want to inspect individual pixels on the map so that I can view exact longitude/latitude, radar cross-section values, and PGE processing levels.
- As an emergency officer, I want to download authoritative analytical PDF reports so that I can submit verified evidence to regional government taskforces.

## 6. Core Features

### Feature 1 - Global Explorer & Interactive Geospatial Canvas
Purpose: Primary interactive MapLibre GL workspace displaying multi-sensor coastal layers.
User Flow: User launches platform → directly enters Global Explorer → selects an active coastal observatory or custom AOI → navigates satellite observation granules.
Inputs: Coordinate bounds, active layer selections, opacity and contrast parameters.
Outputs: Hardware-accelerated WebGL map rendering raster overlays and vector boundaries.
Acceptance Criteria:
- Default landing directly on Global Explorer workspace.
- Renders basemaps (satellite true-color, dark vector, bathymetry).
- Supports dynamic layer ordering, opacity sliders, and min/max contrast stretching.

### Feature 2 - Bi-Temporal SAR Change Intelligence
Purpose: Computes pixel-by-pixel radar backscatter differences ($\Delta\text{dB} = 10 \cdot \log_{10}(\gamma^0_{t2} / \gamma^0_{t1})$).
User Flow: User selects Baseline and Repeat granules → sets threshold ($\pm 3.0\text{ dB}$) → executes comparison → visualizes split-screen or swipe comparison.
Inputs: Baseline GeoTIFF, Repeat GeoTIFF, polarization channel.
Outputs: Multi-band difference raster (Delta HH, Delta HV, Change Class Map) and statistics summary.
Acceptance Criteria:
- Zero data fabrication: operations execute on genuine GeoTIFF float32 arrays.
- Generates reproducible run manifest with cryptographic hashes.

### Feature 3 - Pixel Probe HUD & Raster Statistics
Purpose: Real-time sampling and zonal statistical analysis of raster granules.
User Flow: User clicks any pixel on the raster canvas or requests extent statistics.
Inputs: Map click coordinates or bounding box (`min_lon, min_lat, max_lon, max_lat`).
Outputs: Exact band values ($HH\text{ dB}, HV\text{ dB}$), row/col indices, min, max, mean, median, std dev, and 10-bin histogram.
Acceptance Criteria:
- Backend calculates windowed statistics via `rasterio.windows.from_bounds`.
- Filters nodata (`-9999.0` and `NaN`) from scientific calculations.

### Feature 4 - Multi-Provider Satellite Event Watch & Monitor
Purpose: Discovers newly published satellite granules across global space agencies.
User Flow: System periodically checks STAC/CMR catalogues → displays discovered granules in observation feed → triggers validation workflow.
Inputs: Polling interval, AOI polygon, sensor filter (NISAR, Sentinel-1, Sentinel-2, Landsat).
Outputs: Discovery timeline, event classification, and processing status.

## 7. Non-Goals

The following are intentionally NOT part of this version:
- Fabricated or extrapolated synthetic satellite imagery when genuine granules are missing.
- InSAR phase interferometry deformation modeling (focus is strictly calibrated dual-pol backscatter and radiometric change detection).
- Commercial credit card billing or subscription paywalls.

## 8. MVP Scope

Must Have:
- Integrated Next.js 16 frontend with dark mission-control design system.
- FastAPI backend with scientific processing engine (NumPy, SciPy, Rasterio, GDAL).
- Full layer management system: Layer Library, Active Layers, Layer Styling, Layer Inspector.
- Working bi-temporal change detection engine on authoritative NISAR GCOV datasets.
- Raster statistics endpoint computing genuine mean, median, percentiles, and histograms.

Nice to Have:
- Before/after swipe comparison divider.
- Geodesic distance and polygon area measurement tools.
- Gemini AI research assistant integration for backscatter interpretation.

## 9. Success Metrics

Primary Metrics:
- Sub-second raster tile rendering and statistical sampling response (< 500 ms).
- 100% mathematical reproducibility of radiometric change calculations.
- Zero client-side JavaScript crashes during multi-layer WebGL rendering.

Secondary Metrics:
- Clean code coverage across backend unit and integration test suites.
- Strict compliance with Earth-observation metadata standards (EPSG:4326, CEOS ARD).

## 10. Constraints

- Technical: Python 3.12+, FastAPI, Next.js 16 (Turbopack), Tailwind CSS, MapLibre GL, Rasterio, SQLite/SQLAlchemy.
- Geospatial: WGS84 coordinate reference system (`EPSG:4326`), dual-polarization (HH+HV).
- Design: Dark mission-control aesthetic (`#02050b`, `#ff8c2b`, `#00e5ff`, `#142036`).

## 11. Assumptions

- Target demonstration granules (NISAR L2 GCOV) cover Nagapattinam and Tamil Nadu coastal deltas.
- Users operate standard modern web browsers supporting WebGL 2.0.

## 12. Definition of Done

- [x] Requirements implemented and verified.
- [x] Critical user flows (Explore, Change Analysis, Statistics) tested.
- [x] Next.js production build (`npm run build`) completes with zero errors.
- [x] Backend automated test suite passes.
- [x] Complete documentation maintained in `docs/`.
