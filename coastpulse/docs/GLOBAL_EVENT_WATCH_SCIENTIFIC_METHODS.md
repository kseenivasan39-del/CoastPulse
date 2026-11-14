# Global Coastal Event Watch — Scientific Methods & Sensor Compatibility

## 1. Physical Principles of Coastal SAR & Optical Remote Sensing

CoastPulse enforces physical sensor suitability constraints across all supported detection categories. No single Earth-observation sensor can accurately measure all coastal phenomena.

---

## 2. Sensor Compatibility Matrix

| Coastal Event Category | Primary Sensor | Secondary Sensor | Physical Scattering / Spectral Mechanism | Documented Physical Limitation |
| :--- | :--- | :--- | :--- | :--- |
| **Inundation & Water Extent** | **NISAR L-band (1.2575 GHz)** | Sentinel-1 C-band | Specular forward scattering causing steep backscatter loss ($\gamma^0 \le -16.4\text{ dB}$). Under closed canopies, trunk-water double-bounce increases co-pol backscatter. | Smooth runways or dry sandy flats can mimic specular water; dynamic Otsu thresholding required. |
| **Mangrove Canopy Disturbance** | **NISAR L-band Dual-Pol** | Sentinel-2 MSI | Volumetric canopy scattering in Cross-Pol (HV). Radar Vegetation Index: $\text{RVI} = \frac{4\cdot\gamma^0_{HV}}{\gamma^0_{HH} + \gamma^0_{HV}}$. | C-band saturates at low biomass; L-band is required for deep structural penetration. |
| **Shoreline Erosion** | **Sentinel-1 InSAR / GRD** | Sentinel-2 MNDWI | Modified Normalized Difference Water Index (MNDWI) and co-pol amplitude tracking. | Astronomical tidal phase shifts waterline; multi-pass tidal stage normalization required. |
| **Coastal Wetland Shift** | **Sentinel-2 MSI** | Landsat-9 OLI-2 | Red-edge (B5/B6/B7) and SWIR band absorption ratios for marsh plant vigor. | Tropical storm cloud cover obscures optical observations; SAR cross-pol ratio used as all-weather baseline. |
| **Coastal Urban Expansion** | **Sentinel-1 SLC** | High-Res Optical | Multi-temporal interferometric coherence ($\gamma > 0.7$) from rigid persistent scatterers. | Heavy vegetation decorrelation; false positives near bare dry rocky ground. |
| **Post-Storm Surface Change** | **NISAR L2 GCOV** | Sentinel-1 IW | Multi-temporal log-ratio differential: $\Delta\gamma^0 = 10\cdot\log_{10}\left(\frac{\gamma^0_{T2}}{\gamma^0_{T1}}\right)$. | Soil moisture spikes can mimic roughness increases; multi-sensor cross-check required. |

---

## 3. Evidence-Based Verification Protocol

To prevent false alarms and ungrounded claims, an anomaly flagged by a single satellite is classified as `POTENTIAL_EVENT` or `NEEDS_VALIDATION`. It can only transition to `VALIDATED_CHANGE` if one of the following verification criteria is satisfied:

1. **Multi-Temporal Repeat Confirmation:** The anomaly persists across a subsequent repeat pass (e.g., NISAR 12-day orbital cycle or Sentinel-1 6-day cycle).
2. **Multi-Sensor Cross-Check:** The radar backscatter change aligns with an independent optical index (e.g. Sentinel-2 MNDWI / NDVI) captured within a $\pm 48\text{ hour}$ window.
3. **In-Situ Hydrological or Gauge Consensus:** Verified against open in-situ river/tide gauge telemetry (e.g. USGS hydrological gauge network or Survey of India tidal stations).

---

## 4. Uncertainty Quantification

Every tracked event record explicitly publishes:
- **Radiometric Stability Bound:** $\pm 0.12\text{ dB}$ for calibrated NISAR GCOV products.
- **Speckle Filter Configuration:** Refined Lee ($7\times 7$ window) to suppress multiplicative Rayleigh speckle noise while preserving coastal structural edges.
- **Confidence Metric Calculation:**
  $$\text{Confidence} = w_1 \cdot C_{\text{radiometric}} + w_2 \cdot C_{\text{temporal}} + w_3 \cdot C_{\text{multi-sensor}}$$
  Where weights $w_1=0.4, w_2=0.3, w_3=0.3$ are deterministically derived from calibration metrics.
