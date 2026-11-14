# COASTPULSE — Phased Implementation Roadmap

This roadmap structures the delivery of COASTPULSE for NASA Space Apps Challenge 2026 (Problem Statement 06: *Dancing with the SARs*).

---

## Part 1: Project Foundation & System Architecture (Current Phase)
- [x] Monorepo directory structure (`frontend`, `backend`, `scientific-engine`, `data`, `docs`, `scripts`, `tests`, `docker`).
- [x] Configuration profiles and environment parameterization (`.env.example`).
- [x] System Architecture document (`docs/ARCHITECTURE.md`).
- [x] Scientific Data Provenance & Quality Governance Policy (`docs/DATA_PROVENANCE_POLICY.md`).
- [x] Multi-container Docker & Compose configuration (`docker-compose.yml`, Dockerfiles).
- [x] Backend initial service setup with FastAPI, health check, CORS, and settings management.
- [x] Scientific Engine core module structure with NISAR product specifications and validation models.
- [x] Frontend Next.js 16/React 19 foundation setup with Tailwind CSS, TypeScript, and dark theme design tokens.
- [x] Verification of runtime environments and unit test scaffolding.

---

## Part 2: Scientific Engine & Genuine NISAR Ingestion
- [ ] NISAR Product Metadata Parser (support L1 GCOV, L2 GEMA, L1 GSLC HDF5 and Cloud-Optimized GeoTIFFs).
- [ ] Rigorous SAR compatibility evaluation engine (orbit geometry, frequency, polarization, incidence angle checking).
- [ ] Radiometric calibration and speckle filtering algorithms (multi-temporal filter, enhanced Lee filter).
- [ ] Surface water delineation algorithms (adaptive Otsu thresholding, BDD, multi-temporal minimum backscatter).
- [ ] Radar Vegetation Index (RVI) calculation and dual-pol mangrove canopy backscatter monitoring.
- [ ] Uncertainty estimation and data provenance ledger with SHA-256 fingerprinting.
- [ ] Comprehensive unit test suite for scientific algorithms.

---

## Part 3: Backend API, PostGIS Catalog & Ingestion Pipelines
- [ ] PostGIS database schemas for granules, acquisitions, footprints, and analysis runs.
- [ ] Spatiotemporal catalog API for Nagapattinam district ($10.2^\circ\text{N} - 11.4^\circ\text{N}$, $79.6^\circ\text{E} - 80.1^\circ\text{E}$).
- [ ] Job management engine (asynchronous tasks for compute-intensive SAR algorithms).
- [ ] Dynamic raster tile provider / Cloud-Optimized GeoTIFF streaming endpoints.
- [ ] Gemini AI evidence-grounded scientific explanation service with strict schema validation.
- [ ] Integration test suite for backend APIs.

---

## Part 4: Frontend UI Modules & Interactive Map
- [ ] Design system implementation (deep navy, charcoal, cyan, teal accent tokens).
- [ ] Main application shell and responsive navigation (Dashboard, Explorer, Analysis, Ecosystem, Reports, Assistant).
- [ ] Interactive Geospatial Map with MapLibre GL:
  - Base layer switcher (satellite, bathymetry, dark canvas).
  - Multi-temporal SAR raster overlays with opacity and slider comparisons.
  - Nagapattinam coastal wetland boundary vector layers and transects.
- [ ] SAR Analysis and Change Detection interfaces with interactive threshold sliders and dual-pol histograms.
- [ ] Recharts-powered temporal backscatter plots and polarimetric decomposition charts.
- [ ] AI Research Assistant panel with verifiable citation tags.

---

## Part 5: End-to-End Integration, Real Data Verification & Scientific Reporting
- [ ] Ingest genuine benchmark datasets covering Nagapattinam (tsunami/cyclone affected coastal deltas).
- [ ] End-to-end verification of calibration, water extraction, and change quantification.
- [ ] Automated scientific report generation with exportable PDF/JSON formats including full provenance metadata.
- [ ] Performance profiling and caching optimizations.
- [ ] NASA Space Apps Challenge demonstration packaging, live deployment guide, and pitch documentation.
