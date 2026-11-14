# CoastPulse — User Guide & Operator Manual

CoastPulse is an advanced Earth-observation intelligence application designed for coastal geomorphology, flood detection, shoreline erosion monitoring, and SAR remote sensing analysis.

---

## 1. Navigating the Global Explorer

The CoastPulse interface centers around a full-screen interactive MapLibre GL map connected to real backend APIs:

- **Search Bar:** Query coastal cities, administrative regions, or direct coordinate bounding boxes (e.g., `Nagapattinam`, `10.76, 79.84`).
- **Layer Switcher:** Toggle between OpenStreetMap baseline, ESRI World Imagery, SAR Backscatter Overlays ($\gamma^0$ in dB), and Otsu Water Masks.
- **Opacity Sliders:** Dynamically adjust raster layer transparency from 0% to 100% to inspect land cover beneath radar layers.
- **Area of Interest (AOI) Tools:**
  - Draw custom polygons or bounding boxes.
  - Automatically calculate geodesic area in square kilometers ($km^2$).
  - Save AOIs to your private research workspace.

---

## 2. Demonstration Case Study: Nagapattinam District, India

CoastPulse includes pre-staged, authentic NASA/ISRO NISAR L2 GCOV (Geocoded Covariance) data for Nagapattinam District, Tamil Nadu:

- **Reference Granule (T1):** `NISAR_L2_PR_GCOV_034_084_A_..._20261030` (October 30, 2026)
- **Secondary Granule (T2):** `NISAR_L2_PR_GCOV_035_084_A_..._20261111` (November 11, 2026)
- **Sensor:** NISAR L-band SAR (1.257 GHz), Descending Track 84, Right-looking, Incidence angle 37.2°.

### Running the Case Study Analysis
1. Open the **Analysis & Comparison** module from the navigation bar.
2. Select the **Nagapattinam Demonstration Study Area**.
3. Choose **October 30, 2026** as Reference (T1) and **November 11, 2026** as Secondary (T2).
4. Select the processing algorithm:
   - **Log-Ratio Differential:** Detects backscatter loss (inundation) and backscatter gain.
   - **Refined Lee Speckle Filter (7×7 window):** Suppresses SAR speckle while preserving sharp water-land boundaries.
   - **Otsu Dynamic Thresholding:** Automatically segments open water bodies from coastal vegetation.
5. Click **Execute Analysis**. Processing runs asynchronously in background workers.

---

## 3. Pixel Inspection & Forensic Evidence

- **Pixel Value Tool:** Click anywhere on an active raster layer. CoastPulse queries the authentic Float32 GeoTIFF on disk and displays:
  - Exact coordinates (WGS84 Latitude / Longitude).
  - Radiometric backscatter value ($\gamma^0$ in decibels dB).
  - Polarization channel (HH or HV).
- **Forensic Guard:** If a user clicks outside the valid scientific footprint or on no-data pixels, the system explicitly reports `No valid data at this location` rather than interpolating false numbers.

---

## 4. Exporting Reports & Geospatial Artifacts

CoastPulse provides reproducible research exports for formal compliance, disaster response, and scientific publications:

1. **Scientific PDF Report:**
   - Navigate to **Reports** > **Generate Report**.
   - Generates a PDF containing processing parameters, sensor metadata, statistical distributions, map thumbnails, and a SHA-256 reproducibility manifest.
2. **Tabular Statistics (CSV):**
   - Click **Export CSV** to download summary metrics (mean backscatter, gain/loss pixel counts, inundation area in $km^2$, uncertainty bounds).
3. **GeoTIFF / COG Export:**
   - Download the full Float32 calibrated change GeoTIFF for further GIS analysis in QGIS, ArcGIS, or GDAL.

---

## 5. CoastPulse AI Research Advisor

The built-in AI Assistant is an evidence-grounded research partner:
- **Scope-Constrained:** The assistant only discusses datasets, acquisitions, and analysis results present in the system catalogue.
- **Citation-Backed:** Every answer cites source granules, orbit numbers, and documented mathematical algorithms.
- **Refusal on Insufficient Evidence:** If asked about an area without coverage or hypothetical disaster causes without supporting data, the assistant explicitly declines to speculate.
- **Offline Mode:** When external API keys are omitted, the assistant operates using an offline deterministic knowledge base.
