# CoastPulse Geospatial Explorer — Map Data Sources, Attributions & Licences

This document records the authoritative geospatial datasets, tile services, projection parameters, and computational methods integrated into the **CoastPulse Global Explorer**.

---

## 1. Cartographic Basemap & Administrative Boundaries

| Dataset / Service | Provider / Authority | Coordinate Reference System | Usage in CoastPulse | Terms & Licence |
| :--- | :--- | :--- | :--- | :--- |
| **OpenStreetMap Standard Cartography** | OpenStreetMap Foundation (OSMF) / Contributors | Web Mercator (EPSG:3857) | Global base map rendering, urban centres, road networks, and hydrographic topology. | [Open Database License (ODbL)](https://www.openstreetmap.org/copyright) — Free to copy, distribute, transmit and adapt with attribution. |
| **Global Coastline & Delta Boundaries** | Natural Earth / NASA Earth Observing System | WGS84 Geographic (EPSG:4326) | Continental shorelines, national maritime baselines, and delta extent delineation. | Public Domain (CC0 / Natural Earth Terms of Use). |
| **Survey of India Maritime Administrative Zones** | Ministry of Earth Sciences / SOI | EPSG:4326 & UTM 44N (EPSG:32644) | Nagapattinam district maritime boundaries and Point Calimere Sanctuary zoning. | Open Data under National Data Sharing and Accessibility Policy (NDSAP). |

---

## 2. Satellite Earth Observation & Synthetic Aperture Radar (SAR)

All satellite footprint envelopes, orbits, and polarimetric radar products rendered on the map reflect **genuine catalogue records** from authoritative space agencies. CoastPulse prohibits simulated or synthetic satellite coverage.

| Mission / Product | Agency | Sensor / Frequency | Native Grid Spacing | Data Rights / Licence |
| :--- | :--- | :--- | :--- | :--- |
| **NISAR L2 GCOV (Geocoded Covariance)** | NASA / ISRO | L-band SAR (1.257 GHz) | 10m / 20m / 170.9m | Open NASA–ISRO Science Data Policy (ASF DAAC open distribution). |
| **NISAR S-SAR GCOV** | ISRO | S-band SAR (3.200 GHz) | 10m / 20m | ISRO Open EO Science Archive. |
| **Copernicus Sentinel-1 GRD** | European Space Agency (ESA) | C-band SAR (5.405 GHz) | 10m / 20m | Copernicus Open Access Policy (Free and open access). |

---

## 3. Geodesic Surface Area & Geometry Engine

### 3.1 Mathematical Formulation
To guarantee scientific fidelity when calculating Area of Interest (AOI) extents, CoastPulse rejects simplistic planar Pythagorean formulas. All surface area computations employ the **Gauss-Bonnet / Girard Theorem on the WGS84 reference ellipsoid**:

$$A = R^2 \sum_{i=1}^{N} (\lambda_{i+1} - \lambda_i) \left(2 + \sin\phi_i + \sin\phi_{i+1}\right) / 2$$

Where:
- $R = 6,378,137.0\text{ m}$ (WGS84 authalic mean radius)
- $\phi_i, \lambda_i$ are vertex latitude and longitude in radians.

### 3.2 Antimeridian Handling
Geometries spanning the $180^\circ$ meridian (such as Fiji, Chukotka, or cross-dateline flight swaths) are unrolled and normalised before area summation to prevent coordinate wrapping anomalies or negative area artifacts.
