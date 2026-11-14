# CoastPulse — Coastal Ecosystem Intelligence from SAR Observations

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python: 3.12+](https://img.shields.io/badge/python-3.12+-teal.svg)](https://www.python.org/)
[![Next.js: 16/React 19](https://img.shields.io/badge/Next.js-React_19-black.svg)](https://nextjs.org/)
[![Earth Observation: NISAR SAR](https://img.shields.io/badge/SAR-NISAR_L--band_&_S--band-00d2ff.svg)](https://nisar.jpl.nasa.gov/)

**CoastPulse** is a scientifically grounded Earth-observation and coastal resilience platform developed for **NASA Space Apps Challenge 2026** (Problem Statement 06: *Dancing with the SARs*).

The platform leverages genuine **NASA–ISRO Synthetic Aperture Radar (NISAR)** and multi-sensor satellite observations (Copernicus Sentinel-1, Sentinel-2, USGS Landsat) to detect, quantify, and visualize changes across vulnerable coastal deltas, wetlands, and mangrove ecosystems.

Initial Authoritative Domain: **Nagapattinam District, Tamil Nadu, India** (Bay of Bengal coastal transition zone).

---

## 🛰️ Core Capabilities

- **Global Geospatial Explorer**: Interactive MapLibre GL WebGL canvas displaying calibrated SAR rasters ($\gamma^0_{HH}, \gamma^0_{HV}$ in dB), false-color composites, and optical reference layers.
- **Bi-Temporal SAR Change Intelligence**: Pixel-by-pixel change detection engine evaluating backscatter ratios ($\pm 3.0\text{ dB}$ threshold) to identify mangrove disturbances, water extent fluctuations, and coastal accretion/erosion.
- **Scientific Pixel Inspector & Zonal Statistics**: Real-time sampling HUD displaying exact band values, row/col coordinates, min/max/mean/median/std dev, and 10-bin histograms over viewports and AOIs.
- **Multi-Sensor Satellite Event Watch**: Automated STAC/CMR catalogue polling and discovery feed across NASA ASF, ISRO Bhoonidhi, and Copernicus portals with explicit validation state tracking.
- **Evidence-Grounded AI Research Assistant**: Interactive assistant restricted strictly to verified radar cross-sections and physical measurements with zero speculative hallucination.
- **Cryptographic Reproducibility**: Automated PDF technical report generation with SHA-256 execution verification manifests.

---

## 🏛️ Monorepo Architecture

```
coastpulse/
├── frontend/             # Next.js 16, React 19, TypeScript, Tailwind CSS, MapLibre GL
├── backend/              # Python 3.12+ FastAPI API & orchestration service
├── scientific-engine/    # coastpulse_engine package (calibration, change detection, reports)
├── data/                 # Authoritative GeoTIFFs, KML footprints, and metadata
└── docs/                 # Complete Vibe Coding Blueprint & technical specifications
```

---

## 📚 Blueprint Documentation Suite

CoastPulse implements the complete **Vibe Coding Blueprint** documentation system in [`docs/`](./docs/):

- [`docs/PRD.md`](./docs/PRD.md) — Product Requirements Document (Problem, Goals, User Stories, Scope).
- [`docs/DESIGN_SYSTEM.md`](./docs/DESIGN_SYSTEM.md) — Nocturnal mission-control design language, colors, and typography.
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — System architecture, data flow, component responsibilities.
- [`docs/DATABASE.md`](./docs/DATABASE.md) — Database models, entity relationships, and migration rules.
- [`docs/SECURITY.md`](./docs/SECURITY.md) — Authentication, RBAC, path traversal protection, and secret management.
- [`docs/CODE_STYLE.md`](./docs/CODE_STYLE.md) — Python & TypeScript coding standards and error handling patterns.
- [`docs/TESTING.md`](./docs/TESTING.md) — Verification strategies, test coverage, and execution commands.
- [`docs/AGENTS.md`](./docs/AGENTS.md) — AI coding agent operating rules and safety boundaries.

---

## 🚀 Quick Start

### 1. Prerequisites
- Python 3.12+
- Node.js 20+
- GDAL / PROJ (for native rasterio bindings)

### 2. Backend Service
```bash
cd coastpulse
python -m venv .venv
source .venv/bin/activate  # Or on Windows: .venv\Scripts\activate
pip install -r backend/requirements.txt
pip install -e scientific-engine/

# Run database migrations and seed
python scripts/init_db.py

# Launch FastAPI server
python scripts/run_backend.py
```
FastAPI documentation will be available at `http://127.0.0.1:8000/docs`.

### 3. Frontend Application
```bash
cd coastpulse/frontend
npm install
npm run build
npm run start
```
CoastPulse will be available at `http://localhost:3000`.

---

## 🧪 Testing & Validation

```bash
# Run backend test suite
cd coastpulse
pytest

# Run frontend build verification
cd coastpulse/frontend
npm run build
```

---

## 📄 License
This project is licensed under the MIT License. Developed for NASA Space Apps Challenge 2026.
