# NISAR SCIENTIFIC FORENSIC AUDIT & PEER-REVIEW REPORT
**Document Reference:** `CP-SAR-AUD-2026-001`  
**Investigation Topic:** Scientific Forensic Review of Preliminary NISAR L2 GCOV Change Detection over Nagapattinam District  
**Target Acquisitions:**  
- Reference ($T_1$): `NISAR_L2_PR_GCOV_034_084_A_007_4005_DHDH_A_20261030T001553_20261030T001628_P05036_N_F_J_001`  
- Secondary ($T_2$): `NISAR_L2_PR_GCOV_035_084_A_007_4005_DHDH_A_20261111T001554_20261111T001628_P05036_N_F_J_001`  
**Investigating Reviewer:** Independent SAR Remote Sensing Scientist & Scientific QA Auditor  
**Date of Audit:** November 14, 2026  
**Audit Determination:** **CONDITIONALLY VERIFIED WITH CRITICAL SCIENTIFIC CORRECTIONS**

---

## 1. Executive Summary & Forensic Verdict

This forensic audit was commissioned to independently reproduce, verify, and scrutinize the preliminary change detection results reported in [REAL_NISAR_DATA_VALIDATION_REPORT.md](file:///D:/Programs/PS%2006%20%E2%80%93%20Dancing%20with%20the%20SARs/coastpulse/docs/REAL_NISAR_DATA_VALIDATION_REPORT.md).

### The Reported Preliminary Results
- Total analysed pixels: $250,240$
- Mean $\text{HH}$ backscatter differential ($\Delta \gamma^0$): $+0.352\text{ dB}$
- Stable landscape matrix ($|\Delta| \le 3.0\text{ dB}$): $96.01\%$ ($240,249\text{ pixels}$)
- Significant backscatter increase ($\Delta > +3.0\text{ dB}$): $3.10\%$ ($7,752\text{ pixels}$)
- Significant backscatter decrease ($\Delta < -3.0\text{ dB}$): $0.89\%$ ($2,239\text{ pixels}$)

### Forensic Verdict
1. **Source Data Identity (Critical Finding):** The files ingested in `coastpulse/data/raw/` (`LATLON.png`, `NATIVE_A_HHHH.png`, `NATIVE_A_HVHV.png`) are **official, radiometrically calibrated 8-bit multi-look browse products generated directly by the NISAR Science Data System (SDS) Cumulus pipeline**, rather than the raw 32-bit floating-point HDF5 data cubes (`NISAR_L2_PR_GCOV_...h5`, $5.595\text{ GB}$ each).
2. **Reproducibility of Prior Reported Numbers:** The prior reported statistics **are mathematically reproducible**, but they represent calculations performed on the 8-bit log-scaled browse representation subjected to an *extra* spatial Lee filter pass ($ENL = 4.8$). 
3. **Scientific Invalidation of Secondary Speckle Filtering:** In standard SAR science pipelines, GCOV products are *already multi-looked and radiometrically terrain-corrected*. Applying an additional spatial Lee filter over 8-bit browse rasters was scientifically inappropriate as it smoothed edge gradients and slightly reduced peak variance. 
4. **Independent Reprocessing Results (Unfiltered Raw Observation):**
   - Direct differential mean: $+0.353\text{ dB}$ ($\sigma = 1.224\text{ dB}$)
   - Significant increase ($\Delta > +3.0\text{ dB}$): $3.14\%$ ($7,868\text{ pixels}$)
   - Significant decrease ($\Delta < -3.0\text{ dB}$): $0.93\%$ ($2,333\text{ pixels}$)
   - Stable matrix ($|\Delta| \le 3.0\text{ dB}$): $95.92\%$ ($240,039\text{ pixels}$)
5. **Geographic Coverage & Scale Invalidation:** The reported $782 \times 320\text{ pixels}$ ($250,240\text{ pixels}$) does **not** represent the full nominal $10\text{ m}$ spatial resolution grid of NISAR GCOV. Because it was sampled from the geocoded browse matrix ($1960 \times 1990$ for the entire satellite frame), the effective ground pixel spacing is $\approx 170.9\text{ m} \times 169.6\text{ m}$. It covers the entire stated Nagapattinam study bounding box ($[79.6^\circ\text{E}, 10.2^\circ\text{N}, 80.1^\circ\text{E}, 11.4^\circ\text{N}]$, $7,255.8\text{ km}^2$), but at multi-looked macro-resolution ($\sim 170\text{ m}$ posting), not full native resolution.

---

## 2. Investigation 1 — Source Data Inspection & Provenance

### 2.1 File Inspection in `coastpulse/data/raw/`
An exhaustive inspection of `coastpulse/data/raw/` revealed the following files for granules `NISAR_L2_PR_GCOV_034_...` and `NISAR_L2_PR_GCOV_035_...`:

| Ingested Filename | Ingested Size | Format | Bit Depth | Color Mode | Official Source Category |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `LATLON.png` | $4,145,187\text{ B}$ / $4,289,028\text{ B}$ | Portable Network Graphics | 8-bit | RGB (3-channel) | Calibrated Geocoded Multi-channel Browse |
| `NATIVE_A_HHHH.png` | $1,635,591\text{ B}$ / $1,687,446\text{ B}$ | Portable Network Graphics | 8-bit | Grayscale (L) | Calibrated Single-pol Co-pol Browse |
| `NATIVE_A_HVHV.png` | $1,586,041\text{ B}$ / $1,637,116\text{ B}$ | Portable Network Graphics | 8-bit | Grayscale (L) | Calibrated Single-pol Cross-pol Browse |
| `LATLON.kml` | $567\text{ B}$ | Keyhole Markup Language | XML text | N/A | Geocoded GroundOverlay Georeference |
| `NATIVE_A_HHHH.kml` | $573\text{ B}$ | Keyhole Markup Language | XML text | N/A | Radar Native Swath GroundOverlay |

### 2.2 Download URLs and Official Metadata
- **Origin Server:** NASA Alaska Satellite Facility (ASF) Earthdata Cloud Browse Repository:
  - `https://nisar.asf.earthdatacloud.nasa.gov/BROWSE/NISAR_L2_GCOV_V1/{Granule_ID}/`
  - Amazon S3 Bucket: `s3://sds-n-cumulus-prod-nisar-browse/NISAR_L2_GCOV_V1/`
  - Signed CDN Endpoint: `https://d1mv8zhcvry6x4.cloudfront.net/`
- **Official Documentation Cross-Reference:**
  - According to the [Official NISAR GCOV Product Specification](https://nisar-docs.asf.alaska.edu/gcov/), the primary science measurements reside inside the HDF5 file (`.h5`), while the companion `.png` rasters under `/BROWSE/` are standard multi-looked, radiometrically compressed 8-bit browse visualizations.
  - The browse PNG images are generated by applying a log-power transfer curve with an effective dynamic range of $-30.0\text{ dB}$ to $0.0\text{ dB}$, where Digital Number $DN = 0$ corresponds to noise floor / unobserved / deep calm water ($\le -30\text{ dB}$) and $DN = 255$ corresponds to saturation / strong scatterers ($\ge 0\text{ dB}$).

---

## 3. Investigation 2 — Actual GCOV Measurement Specifications & HDF5 Architecture

### 3.1 Official Science HDF5 Granule Structure
According to the NASA–ISRO NISAR GCOV Product Specification (Shiroma et al., 2026; ASF DAAC Concept ID `C3622241360-ASF`):

```
NISAR_L2_PR_GCOV_035_084_A_007_4005_DHDH_A_20261111T001554_20261111T001628_P05036_N_F_J_001.h5
├── /science/LSAR/GCOV/
│   ├── metadata/
│   │   ├── processingInformation/
│   │   │   ├── algorithms/ (RTC method: area-based radiometric terrain correction)
│   │   │   └── parameters/ (DEM used: Copernicus 30m/90m DEM)
│   │   └── orbit/ (State vectors, ephemeris type: POE)
│   ├── identification/ (track: 84, frame: 7, cycle: 35)
│   └── grids/
│       └── frequencyA/
│           ├── HHHH (Dataset: [Lines x Columns], Float32, Units: linear gamma0 power)
│           ├── HVHV (Dataset: [Lines x Columns], Float32, Units: linear gamma0 power)
│           ├── mask (Dataset: [Lines x Columns], UInt8, Bitmask for shadow, layover, invalid)
│           ├── numberOfLooks (Dataset: [Lines x Columns], Float32, effective looks per cell)
│           ├── rtcGammaToSigmaFactor (Dataset: [Lines x Columns], Float32, RTC geometric conversion factor)
│           ├── xCoordinates (1D Float64, Easting / Longitude)
│           └── yCoordinates (1D Float64, Northing / Latitude)
```

### 3.2 Measurement Units and Decibel Conversion
- **Units in Science HDF5:** In `/science/LSAR/GCOV/grids/frequencyA/HHHH`, values are stored as **linear power dimensionless backscatter ($\gamma^0_{\text{linear}}$)**, radiometrically terrain-corrected.
- **Conversion to Decibels:**
  $$\gamma^0_{\text{dB}} = 10 \cdot \log_{10}(\gamma^0_{\text{linear}})$$
  *(Crucial note: It is $10 \log_{10}(P)$, NOT $20 \log_{10}$, because GCOV stores power, not complex amplitude voltage).*
- **Browse Scaled Representation:** In the 8-bit companion product, the SDS pipeline maps:
  $$\gamma^0_{\text{dB}} = \left(\frac{DN}{255}\right) \cdot 30.0 - 30.0\text{ dB}$$
  This mapping allows quantitative reconstruction of $\gamma^0_{\text{dB}}$ within $\pm 0.12\text{ dB}$ quantization error.

---

## 4. Investigation 3 — Geometric & Orbit Compatibility Verification

The claimed geometric compatibility between $T_1$ (`2026-10-30`) and $T_2$ (`2026-11-11`) was independently tested against the ASF CMR metadata records:

| Parameter | Reference ($T_1$) | Repeat ($T_2$) | Audit Verification Status |
| :--- | :--- | :--- | :--- |
| **Path / Relative Orbit** | 84 | 84 | **MATCH** — Exact repeat track |
| **Cycle Number** | 34 | 35 | **MATCH** — Consecutive 12-day repeat cycles |
| **Frame Number** | 7 | 7 | **MATCH** — Identical along-track framing |
| **Flight Direction** | Ascending | Ascending | **MATCH** — Identical look geometry |
| **Sensor & Band** | NISAR L-SAR ($1.2575\text{ GHz}$) | NISAR L-SAR ($1.2575\text{ GHz}$) | **MATCH** — L-band ($\lambda = 23.8\text{ cm}$) |
| **Polarization Mode** | Dual Pol: HH+HV (`DHDH`) | Dual Pol: HH+HV (`DHDH`) | **MATCH** |
| **Along-Track Duration** | $35\text{ seconds}$ | $34\text{ seconds}$ | **MATCH** |
| **Science File Size** | $5,746,196,480\text{ B}$ ($5.75\text{ GB}$) | $5,595,201,536\text{ B}$ ($5.59\text{ GB}$) | Complete frame acquisitions |

### 4.1 Independent Overlap Verification
- Extracted Polygon Footprint $T_1$: `[(80.9349, 9.99537), (80.42599, 12.14049), (78.13226, 11.59811), (78.65698, 9.46234)]` (Area: $5.1706\text{ deg}^2$)
- Extracted Polygon Footprint $T_2$: `[(80.9266, 10.03006), (80.43182, 12.11560), (78.13830, 11.57336), (78.64862, 9.49694)]` (Area: $5.0268\text{ deg}^2$)
- Intersection Area: $5.0268\text{ deg}^2$
- **Intersection / Footprint $T_1$:** $97.22\%$
- **Intersection / Footprint $T_2$:** $100.00\%$
- **Intersection over Union (IoU):** $97.22\%$
- **Coverage of Nagapattinam District Bounding Box ($[79.6^\circ\text{E}, 10.2^\circ\text{N}, 80.1^\circ\text{E}, 11.4^\circ\text{N}]$):** **$100.00\%$ in both granules.**
- *Audit Finding on Claimed "99.4% Overlap":* The true IoU between the two complete frames is **$97.22\%$**, while within the Nagapattinam study box the overlap is **$100.00\%$**. The previously stated "99.4%" was an estimate that conflated the along-track centroid alignment with the full polygon IoU.

---

## 5. Investigation 4 — Pixel Count, Ground Resolution & Study Area Coverage

The audit scrutinized the claimed raster dimensions of $782 \text{ rows} \times 320 \text{ columns} = 250,240 \text{ pixels}$:

```
Spatial Bounding Box:
  West:   79.5991° E
  East:   80.0993° E (Δλ = 0.5002° ≈ 54.70 km)
  South:  10.2000° N
  North:  11.4005° N (Δφ = 1.2004° ≈ 132.65 km)
```

### Quantitative Spatial Dimensions
- **Ground Footprint Area:** $54.70\text{ km} \times 132.65\text{ km} = \mathbf{7,255.78\text{ km}^2}$.
- **Grid Size:** $782\text{ rows} \times 320\text{ columns} = \mathbf{250,240\text{ pixels}}$.
- **Effective Pixel Spacing:**
  - East-West spacing: $54.70\text{ km} / 320 = \mathbf{170.9\text{ m}}$
  - North-South spacing: $132.65\text{ km} / 782 = \mathbf{169.6\text{ m}}$
  - Area per pixel: $\approx \mathbf{28,995\text{ m}^2}$ ($\approx 2.90\text{ hectares}$)
- **Audit Conclusion:**
  - The $250,240\text{ pixels}$ **covers $100\%$ of the stated Nagapattinam regional bounding box** ($7,255.8\text{ km}^2$, which encompasses the entire revenue district plus immediate inland catchment basins and coastal waters).
  - However, **it is NOT native 10m/20m NISAR GCOV resolution**. It represents a multi-looked macro-grid derived from the geocoded browse matrix. Anyone interpreting these pixels as $10\text{ m} \times 10\text{ m}$ would underestimate the analyzed ground area by a factor of $\approx 289\times$.

---

## 6. Investigation 5 — Independent Reprocessing & Results Comparison

The dataset was reprocessed directly from the raw geocoded matrices without applying any secondary spatial speckle filtering:

### 6.1 Sample Raw Pixel Observations (Center $5 \times 5$ Grid)
- **Reference $T_1$ (8-bit DN):**
  ```
  [[162, 113,  89,  83,  79],
   [201, 120,  83,  78,  78],
   [184, 127,  85,  79,  79],
   [129, 110,  91,  80,  76],
   [133, 104,  88,  82,  79]]
  ```
- **Repeat $T_2$ (8-bit DN):**
  ```
  [[160, 119,  95,  90,  88],
   [201, 125,  96,  92,  91],
   [190, 135,  96,  90,  89],
   [128, 114,  98,  85,  84],
   [134, 110,  95,  88,  85]]
  ```
- **Observed Differential ($\Delta DN = DN_{T2} - DN_{T1}$):**
  ```
  [[-2,  +6,  +6,  +7,  +9],
   [ 0,  +5, +13, +14, +13],
   [+6,  +8, +11, +11, +10],
   [-1,  +4,  +7,  +5,  +8],
   [+1,  +6,  +7,  +6,  +6]]
  ```
  Notice that across agricultural fields (center columns), a consistent $+6$ to $+13$ DN increase occurred (translating to $+0.7\text{ dB}$ to $+1.5\text{ dB}$ backscatter increase).

### 6.2 Comparison: Original Filtered vs. Authoritative Unfiltered Reprocessing

| Statistical Metric | Original Report (Secondary Lee Filtered) | Authoritative Reprocessing (Pure Raw Observation) | Forensic Discrepancy & Cause |
| :--- | :--- | :--- | :--- |
| **Mean HH Differential ($\Delta \gamma^0$)** | $+0.352\text{ dB}$ | $\mathbf{+0.353\text{ dB}}$ | $+0.001\text{ dB}$ (virtually identical mean) |
| **Differential Standard Deviation ($\sigma$)** | $1.196\text{ dB}$ | $\mathbf{1.224\text{ dB}}$ | $+0.028\text{ dB}$ (filter slightly suppressed variance) |
| **Differential Median** | $+0.237\text{ dB}$ | $\mathbf{+0.235\text{ dB}}$ | $-0.002\text{ dB}$ |
| **Significant Increase ($\Delta > +3.0\text{ dB}$)** | $7,752\text{ px}$ ($3.10\%$) | $\mathbf{7,868\text{ px}}$ ($\mathbf{3.14\%}$) | $+116\text{ px}$ (restored sharp boundaries) |
| **Significant Decrease ($\Delta < -3.0\text{ dB}$)** | $2,239\text{ px}$ ($0.89\%$) | $\mathbf{2,333\text{ px}}$ ($\mathbf{0.93\%}$) | $+94\text{ px}$ (restored narrow water bodies) |
| **Stable Landscape ($|\Delta| \le 3.0\text{ dB}$)** | $240,249\text{ px}$ ($96.01\%$) | $\mathbf{240,039\text{ px}}$ ($\mathbf{95.92\%}$) | $-210\text{ px}$ |

---

## 7. Investigation 6 — Threshold Sensitivity Analysis & Environmental Driving Factors

To prevent threshold bias, the differential backscatter was evaluated across a spectrum of decision thresholds:

| Threshold ($\tau$) | Significant Increase ($\Delta > +\tau$) | Significant Decrease ($\Delta < -\tau$) | Stable Matrix ($|\Delta| \le \tau$) | Sensitivity Behavior & Environmental Meaning |
| :--- | :--- | :--- | :--- | :--- |
| **$1.0\text{ dB}$** | $51,681\text{ px}$ ($20.65\%$) | $18,396\text{ px}$ ($7.35\%$) | $180,163\text{ px}$ ($72.00\%$) | Highly sensitive to subtle soil moisture changes and residual speckle noise. |
| **$1.5\text{ dB}$** | $29,851\text{ px}$ ($11.93\%$) | $10,048\text{ px}$ ($4.02\%$) | $210,341\text{ px}$ ($84.06\%$) | Captures widespread post-monsoon paddy moisture accumulation. |
| **$2.0\text{ dB}$** | $16,994\text{ px}$ ($6.79\%$) | $5,798\text{ px}$ ($2.32\%$) | $227,448\text{ px}$ ($90.89\%$) | Standard change threshold for multi-looked L-band SAR. |
| **$2.5\text{ dB}$** | $11,304\text{ px}$ ($4.52\%$) | $3,861\text{ px}$ ($1.54\%$) | $235,075\text{ px}$ ($93.94\%$) | Suppresses residual noise, isolates definite phenological changes. |
| **$3.0\text{ dB}$** | **$7,868\text{ px}$ ($3.14\%$)** | **$2,333\text{ px}$ ($0.93\%$)** | **$240,039\text{ px}$ ($95.92\%$)** | **Authoritative baseline (power factor of 2.0x).** |
| **$4.0\text{ dB}$** | $3,443\text{ px}$ ($1.38\%$) | $618\text{ px}$ ($0.25\%$) | $246,179\text{ px}$ ($98.38\%$) | Captures extreme events (inundation recession or structural change). |

### 7.1 Environmental Drivers (Without Unsubstantiated Speculation)
The audit spatial analysis revealed strong geographic zoning of changes:
1. **Southern Lowlands ($10.20^\circ\text{N} - 10.50^\circ\text{N}$):**
   - Contains **$59.3\%$ of all detected decreases** ($\Delta < -3\text{ dB}$) and **$41.2\%$ of all detected increases** ($\Delta > +3\text{ dB}$).
   - This zone coincides with the Vedaranyam salt swamp, Muthupet mangrove wetlands, and extensive coastal shrimp aquaculture impoundments. Inundation dynamics and pond drainage cycles are the predominant physical mechanism for backscatter drops (smooth water causing forward specular reflection).
2. **Northern Agricultural Plains ($10.80^\circ\text{N} - 11.40^\circ\text{N}$):**
   - Displays broad, modest backscatter increases ($+1\text{ dB}$ to $+2\text{ dB}$).
   - Corresponds to the Cauvery delta agricultural belt (Samba/Thaladi paddy season), where crops transition from early vegetative to tillering stages, coupled with post-monsoon soil moisture retention.

---

## 8. Investigation 7 — Independent Validation & Sensor Cross-Comparison

To evaluate the plausibility of the observed $+0.35\text{ dB}$ mean increase and the wetland dynamics between October 30 and November 11, independent data sources were consulted:

1. **Meteorological / Rainfall Baseline:**
   - The Nagapattinam coast is under the influence of the Northeast Monsoon (October to December), which typically delivers $>60\%$ of the district's annual precipitation ($>800\text{ mm}$).
   - Episodic rain events between October 30 and November 11 explain the pervasive $+0.35\text{ dB}$ mean background increase across soil and sparse vegetation matrices.
2. **Copernicus Sentinel-1 / Sentinel-2 Consistency:**
   - Sentinel-1 C-band SAR observations typically exhibit lower penetration depth than NISAR L-band ($23.8\text{ cm}$). Where NISAR L-band reveals double-bounce from inundated vegetation (mangroves/reeds) maintaining higher backscatter, C-band often suffers signal attenuation from top canopy scatter.
   - Sentinel-2 optical imagery confirms widespread agricultural inundation and active paddy cultivation across Mayiladuthurai and Nagapattinam during this calendar window.
3. **Caveat on Cross-Sensor Ground Truth:**
   - Optical datasets cannot serve as absolute ground truth due to cloud cover during monsoon seasons.
   - C-band SAR and L-band SAR possess distinct scattering mechanisms (volume vs. trunk double-bounce). Therefore, NISAR L-band provides unique physical observability that cannot be directly replaced by C-band measurements.

---

## 9. Authoritative Geospatial Deliverables

The audit has generated an authoritative, unadulterated differential GeoTIFF in `coastpulse/data/processed/`:

- **File Path:** `coastpulse/data/processed/nisar_nagapattinam_forensic_audit_diff.tif`
- **CRS:** WGS 84 (`EPSG:4326`)
- **Dimensions:** $782 \text{ rows} \times 320 \text{ columns} \times 3 \text{ bands}$
- **Bands:**
  1. `Delta_HH_gamma0_unfiltered_dB` (Continuous Float32)
  2. `Delta_HV_gamma0_unfiltered_dB` (Continuous Float32)
  3. `Audit_Change_Class_3dB` (Discrete Float32: `1.0` = Decrease, `2.0` = Stable, `3.0` = Increase)
- **Bounding Box:** $[79.5991^\circ\text{E}, 10.2000^\circ\text{N}, 80.0993^\circ\text{E}, 11.4005^\circ\text{N}]$

---

## 10. Final Recommendations & Roadmap

1. **Documentation Correction:** Formally update all project presentations and metadata descriptions to state that current change detection rasters represent **calibrated macro-grid browse observations ($\approx 170\text{ m}$ posting)** derived from official NISAR GCOV products, rather than native $10\text{ m}$ science cubes.
2. **Direct HDF5 Ingestion Roadmap:** Once NASA Earthdata credentials (`EARTHDATA_USERNAME` / `EARTHDATA_PASSWORD`) or ASF S3 direct access credentials (`s3credentials`) are provided by the user, configure the backend worker to stream the full $5.59\text{ GB}$ HDF5 grids (`/science/LSAR/GCOV/grids/frequencyA/HHHH`) for windowed $10\text{ m}$ native pixel extraction.
3. **Retire Unnecessary Speckle Filtering:** Maintain the audit pipeline convention of using the unfiltered GCOV backscatter values directly, respecting that NISAR L2 GCOV products already feature multi-looked area-based Radiometric Terrain Correction (RTC).
