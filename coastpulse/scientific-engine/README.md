# COASTPULSE Scientific Engine

Independent, deterministic SAR processing library for NISAR and compatible microwave remote sensing products.

## Modules:
- `metadata`: Schema verification for NISAR L1 GCOV, L2 GEMA, L1 GSLC.
- `compatibility`: Strict geometric, polarimetric, and frequency comparability rules.
- `calibration`: $\beta^0, \sigma^0, \gamma^0$ backscatter conversion and terrain flattening.
- `filtering`: Multi-temporal and spatial speckle suppression (Refined Lee, Quegan-Yu).
- `change`: Polarimetric log-ratio and difference detection.
- `water_vegetation`: Dual-pol thresholding (BDD, Otsu) and Radar Vegetation Index ($RVI$).
- `uncertainty`: Calibration error estimation and $NESZ$ noise floor tagging.
