# COASTPULSE — Coastal Ecosystem Intelligence from SAR Observations

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python: 3.12+](https://img.shields.io/badge/python-3.12+-teal.svg)](https://www.python.org/)
[![Next.js: 16/React 19](https://img.shields.io/badge/Next.js-React_19-black.svg)](https://nextjs.org/)
[![Earth Observation: NISAR SAR](https://img.shields.io/badge/SAR-NISAR_L--band_&_S--band-00d2ff.svg)](https://nisar.jpl.nasa.gov/)

**COASTPULSE** is a rigorous, scientifically grounded Earth observation platform developed for **NASA Space Apps Challenge 2026** (Problem Statement 06: *Dancing with the SARs*).

The platform leverages genuine **NASA–ISRO Synthetic Aperture Radar (NISAR)** and compatible multi-temporal SAR observations to monitor and assess changes in vulnerable coastal wetlands, dynamic water distribution, and mangrove ecosystems.

Initial Target Domain: **Nagapattinam District, Tamil Nadu, India** (Bay of Bengal coastal delta).

---

## 🛰️ Scientific Integrity & Provenance Principles

1. **Zero Data Fabrication**: We strictly reject synthetic or mocked satellite observations disguised as live analysis. All metrics originate from verified radar backscatter ($\gamma^0, \sigma^0$) and genuine geospatial calculations.
2. **Strict InSAR vs. Backscatter Separation**: Backscatter intensity change detection (e.g., dual-pol ratio, temporal speckle filtering) is never conflated with interferometric (InSAR) phase/coherence deformation analysis.
3. **Rigorous Compatibility Verification**: Radar scenes are evaluated for acquisition geometry (orbit direction, incidence angle range), polarization modes (HH, HV, VV, VH), radar band (L-band / S-band / C-band), spatial resolution, and processing levels before temporal comparisons are authorized.
4. **Evidence-Grounded AI**: The integrated AI assistant (powered by Gemini) acts exclusively as an evidence synthesizer and scientific interpreter of calculated analytical outputs; it is programmatically barred from inventing measurements or extrapolating unverified claims.

---

## 🏛️ Monorepo Architecture

```
coastpulse/
├── frontend/             # Next.js 16, React 19, TypeScript, Tailwind CSS, MapLibre GL
├── backend/              # Python 3.12+ FastAPI API & orchestration service
├── scientific-engine/    # Core SAR processing, NISAR HDF5/GeoTIFF validation, radiometric calibration
├── data/                 # Data catalogs, reference AOI bounds, and provenance records
│   ├── raw/              # Immutable raw observations and HDF5 products
│   ├── processed/        # Calibrated and orthorectified products
│   └── reference/        # Administrative boundaries & ground truth vectors
├── docs/                 # System architecture, scientific provenance, and validation papers
├── scripts/              # Ingestion, validation, and provisioning scripts
├── tests/                # Unit, integration, and scientific validation test suites
├── docker/               # Container definitions for services
├── docker-compose.yml    # Development stack orchestration (FastAPI, Next.js, PostGIS, Redis)
└── README.md             # Project overview and onboarding instructions
```

---

## 🚀 Quickstart Guide

### Prerequisites
- Python 3.12+
- Node.js 20+ (Node 22 recommended) and npm
- Docker and Docker Compose (optional for containerized runtime)

### 1. Environment Setup
```bash
cp .env.example .env
```

### 2. Backend & Scientific Engine Setup
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
pip install -e ../scientific-engine
uvicorn app.main:app --reload --port 8000
```
API Documentation will be live at `http://localhost:8000/docs`.

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
Interactive UI will be live at `http://localhost:3000`.

### 4. Running Tests
```bash
pytest tests/
```
