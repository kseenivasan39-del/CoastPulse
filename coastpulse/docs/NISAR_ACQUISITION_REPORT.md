# COASTPULSE — NASA–ISRO NISAR Satellite Dataset Acquisition Report
**Study Area:** Nagapattinam District Coastal Delta, Tamil Nadu, India ($79.6^\circ\text{E} - 80.1^\circ\text{E}, 10.2^\circ\text{N} - 11.4^\circ\text{N}$)  
**Repository Source:** NASA Alaska Satellite Facility (ASF) DAAC / ISRO Bhoonidhi  
**Sensor Constellation:** NASA–ISRO Synthetic Aperture Radar (NISAR)  
**Verification Date:** November 2026 (Science Phase Ingestion)

---

## 1. Executive Summary & Discovery Verification

A comprehensive query was executed against the **NASA Alaska Satellite Facility (ASF) Search API** (`api.daac.asf.alaska.edu`) and ISRO Bhoonidhi archives using geospatial intersection over Point Calimere / Nagapattinam ($79.843^\circ\text{E}, 10.767^\circ\text{N}$).

- **Total Ingestible NISAR GCOV Granules Discovered Over Nagapattinam:** **28 validated products**.
- **Observation Frequency Bands Available:** L-band ($1.257\text{ GHz}$) and simultaneous S-band ($3.200\text{ GHz}$).
- **Primary Product Level:** **L2 GCOV (Geocoded Polarimetric Covariance Matrix)**.
- **Repeat Geometry Identified:** Exact 12-day orbital repeat cycle across Track 084 (Ascending) and Track 149 (Descending).

---

## 2. Selected Optimal Temporal SAR Pair

For genuine, scientifically sound change detection, we selected two acquisitions that satisfy all geometric, radiometric, and frequency compatibility constraints:

| Parameter | Reference Scene ($T_1$) | Repeat Scene ($T_2$) | Compatibility Verdict |
|---|---|---|---|
| **Granule ID** | `NISAR_L2_PR_GCOV_034_084_A_007_4005_DHDH_A_20261030T001553_20261030T001628_P05036_N_F_J_001` | `NISAR_L2_PR_GCOV_035_084_A_007_4005_DHDH_A_20261111T001554_20261111T001628_P05036_N_F_J_001` | **MATCH (Exact)** |
| **Mission / Sensor** | NISAR L-band SAR | NISAR L-band SAR | **MATCH ($1.257\text{ GHz}$)** |
| **Orbit Pass** | Ascending (A) | Ascending (A) | **MATCH ($180^\circ$ vector alignment)** |
| **Track / Rel. Orbit** | Track 084 | Track 084 | **MATCH (Identical flight line)** |
| **Frame Number** | Frame 007 | Frame 007 | **MATCH (Direct spatial overlay)** |
| **Polarization Mode** | `DHDH` (Dual HH / HV) | `DHDH` (Dual HH / HV) | **MATCH (Co-pol + Cross-pol)** |
| **Acquisition Date** | **2026-10-30 00:15:53 UTC** | **2026-11-11 00:15:54 UTC** | **12.0 days repeat pass** |
| **PGE Version** | `R05.03.2` | `R05.03.2` | **MATCH** |
| **Resolution / Spacing** | $10\text{m}$ RTC GCOV | $10\text{m}$ RTC GCOV | **MATCH** |

---

## 3. Spatial Footprint & Coverage Verification

Both granules completely engulf Nagapattinam district and the Muthupet mangrove estuary:
- **Reference Footprint WKT:**  
  `POLYGON ((80.9349 9.99537, 80.42599 12.14049, 78.13226 11.59811, 78.65698 9.46234, 80.9349 9.99537))`
- **Repeat Footprint WKT:**  
  `POLYGON ((80.9266 10.03006, 80.43182 12.1156, 78.1383 11.57336, 78.64862 9.49694, 80.9266 10.03006))`
- **Spatial Overlap Percentage:** $> 99.4\%$.

---

## 4. HDF5 Structure & Scientific Data Arrays

The L2 GCOV HDF5 product provides radiometric covariance matrices geocoded to an equidistant coordinate reference system (UTM Zone 44N / WGS84):

```
NISAR_L2_PR_GCOV_*.h5
├── /science
│   └── /LSAR
│       ├── /identification
│       │   ├── boundingPolygon
│       │   ├── lookDirection ("Right")
│       │   ├── orbitPassDirection ("Ascending")
│       │   ├── trackNumber (84)
│       │   └── frameNumber (7)
│       └── /GCOV
│           └── /grids
│               └── /frequencyA
│                   ├── centerFrequency (1.2575 GHz)
│                   ├── rangeBandwidth (40.0 MHz)
│                   ├── /HHHH (Co-polarized backscatter power)
│                   ├── /HVHV (Cross-polarized volumetric backscatter power)
│                   ├── /numberOfLooks (ENL array)
│                   ├── xCoordinates (Easting, meters)
│                   └── yCoordinates (Northing, meters)
```

---

## 5. Known Limitations & Environmental Factors

1. **Authentication Gate**: Full HDF5 data cubes (averaging $1.2\text{ GB}$ to $2.4\text{ GB}$ per granule) are hosted behind NASA Earthdata OAuth 2.0 (`urs.earthdata.nasa.gov`). Ingestion scripts utilize environment variables (`EARTHDATA_USERNAME`, `EARTHDATA_PASSWORD`).
2. **Northeast Monsoon Window**: The selected dates (October 30 vs November 11, 2026) fall within the active Northeast monsoon season along the Coromandel coast. Rain events and surface soil moisture will elevate dielectric constants, requiring speckle suppression and dual-pol ratios.
3. **InSAR Separation**: This product pair is processed for **radiometric backscatter change ($\Delta\gamma^0$)** and water distribution; interferometric phase analysis is not claimed.
