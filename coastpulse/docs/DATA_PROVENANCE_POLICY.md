# COASTPULSE — Scientific Data Provenance & Quality Governance Policy

## 1. Principles of Scientific Credibility

Scientific integrity is the foundational constraint of COASTPULSE. In Earth Observation and remote sensing applications, software must avoid black-box synthesis or uncalibrated approximations.

1. **Authenticity Guarantee**: Every raster or pixel processed by COASTPULSE originates from verified open-access satellite missions (NASA–ISRO NISAR, ESA Sentinel-1, or NASA/USGS Landsat/MODIS validation baselines).
2. **Immutable Provenance**: Raw products (HDF5 / SAFE / GeoTIFF) are preserved in their original format with recorded cryptographic hashes (SHA-256). No in-place editing or lossy transformations are permitted on source archives.
3. **Reproducibility**: Every analytical result is accompanied by a Complete Processing Manifest (CPM) detailing:
   - Input product IDs and download source URLs.
   - Exact git commit hash of the `scientific-engine`.
   - Algorithm version and hyperparameters (e.g., filter window sizes, Lee filter variance thresholds, radiometric normalization coefficients).
   - Execution timestamp and execution environment specs.

---

## 2. SAR Comparability & Compatibility Criteria

Two SAR acquisitions can **NEVER** be directly evaluated for surface change detection unless all following criteria are satisfied:

| Parameter | Constraint | Justification |
|---|---|---|
| **Radar Band (Frequency)** | Exact Match ($f_0 \pm 10\text{ MHz}$) | L-band ($\approx 1.25\text{ GHz}$) penetrates canopy and dry soil; S-band ($\approx 3.2\text{ GHz}$) and C-band ($\approx 5.4\text{ GHz}$) reflect off upper canopy. Comparing differing bands yields false change signals. |
| **Orbit Pass Direction** | Ascending vs Descending Separation | Radar look vectors differ by $\sim 180^\circ$ relative to ground topography, creating inverted foreshortening/layover and radically different aspect sensitivities. |
| **Incidence Angle ($\theta_i$)** | Tolerance within $\pm 2.0^\circ$ | Radar backscatter decreases exponentially with increasing incidence angle according to Lambert's law ($\sigma^0 \propto \cos^2 \theta$). Large angle shifts mask true physical surface changes. |
| **Polarization Mode** | Identical Transmit/Receive Channels | HH (co-polarized horizontal) is sensitive to double-bounce (flooded vegetation); HV/VH (cross-polarized) responds to volume scattering (canopy biomass); VV is sensitive to surface roughness (water roughness). Comparing cross-polarizations without normalization produces invalid metrics. |
| **Processing Level** | Radiometrically Terrain Corrected (RTC / GCOV) | Slant-range or non-geocoded amplitude scenes cannot be overlaid spatially without geometric and radiometric terrain correction. |

---

## 3. Strict Boundary: InSAR vs. Radiometric Backscatter

- **Radiometric Backscatter ($\sigma^0, \gamma^0$)**: Measures the amplitude/intensity of the microwave signal returned to the sensor antenna. Used for:
  - Surface water delineation (specular reflection leads to very low backscatter $\le -18\text{ dB}$).
  - Flooded vegetation detection (double-bounce returns with high co-pol backscatter).
  - Vegetation structure monitoring via Radar Vegetation Index ($RVI$).
- **Interferometric SAR (InSAR)**: Relies on the phase difference ($\Delta \phi$) between two coherent acquisitions separated in time or space. Used for:
  - Millimeter-scale ground subsidence and deformation.
  - Digital elevation modeling.
  - InSAR coherence tracking.

**Scientific Rule**: The platform will never present backscatter intensity differences as evidence of ground subsidence or tectonic uplift, and conversely, will never interpret phase decorrelation as simple biomass loss without coherence context.

---

## 4. Uncertainty & Error Quantification

Every generated scientific layer or report will include explicit uncertainty disclosures:
1. **Radiometric Resolution ($r_\gamma$)**: Stated based on equivalent number of looks ($ENL$).
2. **Noise Floor ($NESZ$)**: Backscatter values approaching the Noise Equivalent Sigma Zero (typically $-25\text{ dB}$ to $-30\text{ dB}$) are flagged as noise-limited.
3. **Wind-Induced Surface Roughness Caution**: Surface water detection includes advisory notifications on windy coastal conditions (wind speed $> 5\text{ m/s}$ induces capillary waves, raising water backscatter to resemble land).
4. **Tidal State Normalization**: Coastal wetland water distribution reports must indicate tidal phase at the exact acquisition timestamp (using INCOIS / regional tide models).

---

## 5. AI Reasoning & Evidence Grounding Policy

1. **Zero Hallucination Mandate**: The Gemini integration has strictly scoped system prompts and JSON schema enforcement.
2. **Context Anchoring**: The AI model is strictly passed computed numerical aggregates (e.g., mean backscatter change in dB, standard deviation, p-value of distribution shift, spatial area in hectares, confidence score).
3. **Prohibited Actions**:
   - The AI must never invent satellite metrics or extrapolate values outside the calculated domain.
   - The AI must not declare absolute ecological disaster or recovery without citing the underlying statistical bounds and limitations.
