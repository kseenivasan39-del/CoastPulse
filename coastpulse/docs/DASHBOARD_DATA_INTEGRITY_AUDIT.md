# CoastPulse — Dashboard Data Integrity and Live Functionality Audit

**Audit Timestamp:** 2026-11-14T03:32:00+05:30  
**Audit Scope:** Live CoastPulse Mission Dashboard, Frontend Code (`DashboardView.tsx`), Shared In-Memory Data (`mockData.ts`), Database Tables (`coastpulse_dev.db`), and Scientific Storage Artifacts (`data/processed`).  
**Audit Rule:** Strict observational audit only. Zero application code modifications were made. All findings are substantiated by exact lines of source code, database queries, and filesystem checks.

---

## Executive Summary & Systemic Finding

The CoastPulse application currently exhibits a clear architectural dichotomy:
1. **The Scientific & Backend Engine (`coastpulse/scientific-engine` and `coastpulse/backend`):** Fully operational, backed by genuine NASA/ISRO NISAR L2 GCOV rasters (`nisar_gcov_20261030_authoritative_float32.tif`, `nisar_gcov_20261111_authoritative_float32.tif`), mathematical calibration routines, and 46/46 passing pytest tests.
2. **The Frontend Mission Dashboard (`DashboardView.tsx`):** Renders static client-side demonstrative constants imported from `src/lib/mockData.ts` rather than fetching dynamic records from the live backend endpoints (`/api/v1/acquisitions`, `/api/v1/study-areas`, `/api/v1/processing`). Consequently, the metrics, charts, and job lists shown on the active dashboard do not yet reflect the authentic October–November 2026 NISAR observations processed on the host.

---

## Section A: Dashboard KPI Verification

| Metric Displayed | Value | Source in Code / DB | Calculation Function | Calculation Date | Geographic Coverage | Units | Classification | Verification Finding & Evidence |
| :--- | :---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Total Study Area** | `271,500 ha` | `NAGAPATTINAM_STUDY_AREA.totalAreaHa` (`mockData.ts:8`) / `study_areas` DB table | Hardcoded constant seeded in `seed.py:27` | Seeded 2026-11-13 | Nagapattinam District, TN, India | Hectares (`ha`) | **PARTIALLY VERIFIED** | Corresponds to the official administrative geographic area of Nagapattinam District (~$2,715\text{ km}^2$). The analysis bounding box `[79.6°E - 80.1°E, 10.2°N - 11.4°N]` covers $725,464\text{ ha}$, of which the land district represents $271,500\text{ ha}$. Not dynamically computed from polygon geometry on the dashboard. |
| **Wetland Extent** | `48,600 ha` | `NAGAPATTINAM_STUDY_AREA.wetlandAreaHa` (`mockData.ts:9`) / `study_areas` DB table | Static administrative estimate | Seeded 2026-11-13 | Muthupet & Point Calimere wetland complex | Hectares (`ha`) | **PARTIALLY VERIFIED** | Static environmental literature reference for the combined Point Calimere Wildlife Sanctuary and Muthupet tidal wetlands. Not computed from live raster segmentation. |
| **Coastal Front** | `187.9 km` | `NAGAPATTINAM_STUDY_AREA.coastalLengthKm` (`mockData.ts:11`) / `study_areas` DB table | Static administrative coastline length | Seeded 2026-11-13 | Bay of Bengal coastline of Nagapattinam district | Kilometers (`km`) | **PARTIALLY VERIFIED** | Derived from Survey of India district coastline records (pre-Mayiladuthurai bifurcation records ~187.9 km). Not computed dynamically from vector coastline layers on the dashboard. |
| **Delineated Water Extent** | `34,820 ha` | Static string literal (`DashboardView.tsx:109`) | None | Hardcoded | Muthupet / Cauvery Delta | Hectares (`ha`) | **SIMULATED** | No backing database record or raster calculation exists for `34,820 ha` (+1,420 ha post-tide fluctuation). The genuine October–November 2026 NISAR change raster measures $250,240$ total pixels ($782 \times 320$) with inundation shifts, but this card displays a static placeholder string. |
| **Mangrove RVI Canopy Health** | `0.68 RVI` | Static string literal (`DashboardView.tsx:116`) | None | Hardcoded | Muthupet Mangrove Reserve | Radar Vegetation Index (unitless $[0, 1]$) | **SIMULATED** | No live calculation is executed. While the scientific formula $RVI = \frac{4 \cdot \sigma^0_{HV}}{\sigma^0_{HH} + \sigma^0_{HV}}$ is implemented in `coastpulse_engine/change/detector.py`, the dashboard value `0.68 RVI` is hardcoded demonstration text. |
| **Available SAR Granules** | `5` | `SAMPLE_SAR_GRANULES.length` (`DashboardView.tsx:95`) | Array length count in `mockData.ts` | Hardcoded in mock array | Nagapattinam Footprint | Count | **SIMULATED** | Evaluates client mock array length (`5`), whereas the live database (`/api/v1/acquisitions`) holds **4** verified granules (2 genuine NISAR L2 October/November 2026 scenes + 2 pre-launch April 2026 simulated scenes). |
| **Active Processing Tasks** | `3` | `SAMPLE_PROCESSING_JOBS.length` (`DashboardView.tsx:102`) | Array length count in `mockData.ts` | Hardcoded in mock array | Muthupet wetland | Count | **SIMULATED** | Evaluates client mock array length (`3`), whereas the live database (`/api/v1/processing`) holds **14** executed and completed processing jobs. |

---

## Section B: Temporal Chart Verification

**Chart Title:** *Multi-Temporal Mean Backscatter Profile ($\gamma^0\text{ dB}$)*  
**Component:** `DashboardView.tsx:168-206` rendering `SAMPLE_RADAR_TIMELINE`  

### 1. Acquisition Dates Displayed
The chart plots 5 data points:
- `2026-03-20`: Backscatter HH = $-12.4\text{ dB}$, HV = $-19.2\text{ dB}$, Water Index = $0.42$
- `2026-03-26`: Backscatter HH = $-12.1\text{ dB}$, HV = $-18.9\text{ dB}$, Water Index = $0.45$
- `2026-04-01`: Backscatter HH = $-11.8\text{ dB}$, HV = $-18.5\text{ dB}$, Water Index = $0.48$
- `2026-04-07`: Backscatter HH = $-12.5\text{ dB}$, HV = $-19.0\text{ dB}$, Water Index = $0.40$
- `2026-04-13`: Backscatter HH = $-11.5\text{ dB}$, HV = $-18.1\text{ dB}$, Water Index = $0.51$

### 2. Scientific Provenance Analysis
- **Data Source:** Hardcoded in `DashboardView.tsx:32-38`. It is **not** fetched from the database or computed from stored rasters.
- **Physical Feasibility of Values:** The values ($-11.5$ to $-12.5\text{ dB}$ for HH and $-18.1$ to $-19.2\text{ dB}$ for HV) represent realistic L-band radar backscatter levels over coastal wetland vegetation and saturated soil.
- **Sensor Representation:** The March 20–April 13, 2026 timeframe represents a pre-launch 6-day/12-day orbital repeat simulation.
- **Absence of October–November 2026 NISAR Observations:**
  - The repository contains authentic, calibrated NISAR observations:
    - **T1:** `2026-10-30` (`NISAR_L2_PR_GCOV_034_084_A_...`)
    - **T2:** `2026-11-11` (`NISAR_L2_PR_GCOV_035_084_A_...`)
  - These authentic dates are **completely omitted** from the dashboard chart because the chart is statically bound to `SAMPLE_RADAR_TIMELINE`.
- **Classification:** **SIMULATED** (Explicitly labeled in code at `DashboardView.tsx:209`: `* Calibrated sample baseline for interface development.`).

---

## Section C: Granule-Count & Subtitle Discrepancy

### 1. Discrepancy Breakdown
- **Large Metric Header:** Displays `5` (`SAMPLE_SAR_GRANULES.length`).
- **Detail Subtitle:** Explicitly reads `"3 NISAR L/S + 1 Sentinel-1"` (Sum = **4**).

### 2. Ground-Truth Inventory in Code & Database

#### In `frontend/src/lib/mockData.ts`:
1. `NISAR_L1_PR_GCOV_001_020_A_129_20260401T003000` (NISAR L-band, Ascending, Track 129)
2. `NISAR_L1_PR_GCOV_001_020_A_129_20260413T003000` (NISAR L-band, Ascending, Track 129)
3. `NISAR_S1_PR_GCOV_002_020_A_129_20260401T003000` (NISAR S-band, Ascending, Track 129)
4. `S1A_IW_GRDH_1SDV_20260320T002514_Nagapattinam` (Sentinel-1A C-band, Ascending, Track 56)
5. `NISAR_L1_PR_GCOV_001_020_D_044_20260408T121500` (NISAR L-band, Descending, Track 44)  
*Actual count in mockData.ts:* **4 NISAR (3 L-band + 1 S-band) + 1 Sentinel-1 = 5 granules.** The detail string `"3 NISAR L/S + 1 Sentinel-1"` omitted the fifth descending granule `NISAR_L1_PR_GCOV_..._D_044`.

#### In the Live Database (`GET /api/v1/acquisitions`):
1. `NISAR_L2_PR_GCOV_035_084_A_..._20261111T001554` (NISAR L2, Ascending, Track 84, Genuine HDF5/GeoTIFF)
2. `NISAR_L2_PR_GCOV_034_084_A_..._20261030T001553` (NISAR L2, Ascending, Track 84, Genuine HDF5/GeoTIFF)
3. `NISAR_L1_PR_GCOV_001_020_A_129_20260413T003000` (NISAR L1, Ascending, Track 129)
4. `NISAR_L1_PR_GCOV_001_020_A_129_20260401T003000` (NISAR L1, Ascending, Track 129)  
*Actual database count:* **4 granules.**

---

## Section D: Processing Job Verification

The dashboard displays three cards from `mockData.ts:123-169`:

| Displayed Job ID | Displayed Name | Displayed Algorithm | Displayed Status | Progress % | Stated Elapsed | Verified Database Status |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| `job-sar-9021` | Muthupet Adaptive Water Delineation | Adaptive Otsu Bimodal Thresholding | `COMPLETED` | 100% | 42s | **INVALID (Non-existent in DB)** |
| `job-sar-9022` | Dual-Pol RVI Mangrove Canopy Health | Radar Vegetation Index ($4HV/(HH+HV)$) | `PROCESSING` | 68% | 28s | **SIMULATED (Non-existent in DB)** |
| `job-sar-9023` | Bitemporal Change Log-Ratio Execution | Ratio & Log-Difference (dB) | `QUEUED` | 0% | 0s | **SIMULATED (Non-existent in DB)** |

### Authentic Processing Jobs in Live Database (`GET /api/v1/processing`)
The database contains **14 real completed jobs** executed by the background job service:
- `job-88d1b03c`: Completed in $0.92\text{s}$ (Adaptive Otsu Thresholding, granule `NISAR_L1_PR_GCOV_..._20260401`)
- `job-773b41ad`: Completed in $0.83\text{s}$ (Adaptive Otsu Thresholding, granule `NISAR_L1_PR_GCOV_..._20260401`)
- `job-7b1860e2`: Completed in $0.96\text{s}$ (Adaptive Otsu Thresholding, granule `NISAR_L1_PR_GCOV_..._20260401`)
- Output rasters generated: `data/processed/job_output_job-*.tif` with accompanying `job_output_*_reproducibility_manifest.json`.

**Finding:** The dashboard does not render live jobs from the database; it renders static mock objects.

---

## Section E: Status Badges Audit

### 1. "L/S-Band Ingestion Ready" (`Header.tsx:31`)
- **Evidence:** Verified by `coastpulse_engine/providers/asf_adapter.py` and `nisar_pipeline.py`. The backend supports NISAR L2 GCOV HDF5 datasets and ESA Sentinel-1 GRD ingestion.
- **Classification:** **VERIFIED** (Accurately reflects engine capability).

### 2. "Scientific Grounding: Strict" (`Header.tsx:37`)
- **Evidence:** The AI Research Advisor service (`app/services/ai_advisor.py`) and pipeline compatibility validator (`app/api/v1/endpoints/comparisons.py`) enforce strict frequency, orbit direction, and look-angle equivalence, rejecting incompatible pairs.
- **Classification:** **VERIFIED** (Reflects backend architectural policy).

### 3. "Zero Data Fabrication" (`Sidebar.tsx:92`)
- **Evidence:** While the **backend scientific engine** enforces zero fabrication (rejecting browse images and throwing 400 errors on invalid data), the **frontend mission dashboard** currently presents hardcoded mock arrays (`SAMPLE_RADAR_TIMELINE`, `SAMPLE_PROCESSING_JOBS`).
- **Classification:** **PARTIALLY VERIFIED** (True for the backend processing engine; violated on the client dashboard view).

---

## Section F: Geographic Verification

| Geographic Feature | Stated Value | Genuine Geographic Measurement | Ground Truth Difference |
| :--- | :--- | :--- | :--- |
| **Bounding Box** | `[79.6°E - 80.1°E, 10.2°N - 11.4°N]` | $0.5^\circ\text{ Lon} \times 1.2^\circ\text{ Lat}$ | Rectangular analysis bounding box spanning $7,254.6\text{ km}^2$ ($725,464\text{ ha}$). Encompasses the entire district plus offshore shelf waters. |
| **District Total Area** | `271,500 ha` ($2,715\text{ km}^2$) | Official Nagapattinam District Land Area | Accurate administrative district land area. |
| **Valid Science Data Footprint** | Stated as full coverage | Genuine NISAR Scene Raster (`782 × 320` px at $0.00155^\circ$ spacing) | The authentic NISAR L2 GCOV granules in `data/processed/` span exactly `[79.599°E - 80.099°E, 10.200°N - 11.400°N]`. |

---

## Section G: Bottom-Left Issue Indicator Audit

**Location:** Next.js Dev Tooling / Linter Error Overlay at the bottom-left of the viewport.  
**Exact Issues Detected in Application Build/Lint:**

1. **Issue 1 (Syntax / Code Quality):**
   - **File:** `coastpulse/frontend/src/lib/geoUtils.ts` (Line 169)
   - **Module:** Geospatial Utilities / Polygon Spherical Area Calculation
   - **Error Message:** `ESLint: 'totalAngle' is never reassigned. Use 'const' instead (prefer-const)`
2. **Issue 2 (React Hook Missing Dependency Warning):**
   - **File:** `coastpulse/frontend/src/components/modules/InteractiveMapView.tsx` (Line 240)
   - **Module:** Interactive MapLibre GL Map View
   - **Error Message:** `React Hook useEffect has missing dependencies: 'coordinates', 'drawMode', 'layerOpacity', and 'zoomLevel'. Either include them or remove the dependency array.`

*(Note: In addition, `/api/v1/health` reports a storage warning `status: warning` because `settings.PROCESSED_DIR` is evaluated relative to the backend execution directory rather than the repository root).*

---

## Section H: Itemized Provenance & Classification Matrix

| Item | Displayed Value | Classification |
| :--- | :--- | :---: |
| Study Area Label | Nagapattinam District Coastal Delta | **VERIFIED** |
| Total Area | 271,500 ha | **PARTIALLY VERIFIED** |
| Wetland Extent | 48,600 ha | **PARTIALLY VERIFIED** |
| Coastal Front | 187.9 km | **PARTIALLY VERIFIED** |
| Delineated Water Extent | 34,820 ha | **SIMULATED** |
| Mangrove RVI Health | 0.68 RVI | **SIMULATED** |
| Available SAR Granules Card | 5 (Detail: 3 NISAR + 1 S1) | **SIMULATED / INVALID** |
| Active Processing Tasks Card | 3 (1 Comp • 1 Run • 1 Queue) | **SIMULATED** |
| Backscatter Timeline (March–April) | 5 data points | **SIMULATED** |
| Processing Job `job-sar-9021` | Completed (42s) | **INVALID** |
| Processing Job `job-sar-9022` | Processing (68%) | **SIMULATED** |
| Processing Job `job-sar-9023` | Queued (0%) | **SIMULATED** |
| Header Badge: L/S-Band Ready | Active | **VERIFIED** |
| Header Badge: Grounding Strict | Active | **VERIFIED** |
| Sidebar Badge: Zero Data Fabrication | Active | **PARTIALLY VERIFIED** |
| Bottom-Left Issue Indicator | 2 problems (1 error, 1 warning) | **VERIFIED** |
