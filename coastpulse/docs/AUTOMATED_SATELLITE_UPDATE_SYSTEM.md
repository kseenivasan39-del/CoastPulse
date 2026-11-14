# CoastPulse Automated Satellite Observation Discovery & Update System

## 1. System Overview

CoastPulse incorporates a continuous, background Earth-observation discovery pipeline designed to federate updates from international space agency catalogues into local coastal intelligence workspaces.

Supported Provider Adapters:
1. **NASA ASF DAAC:** NASA–ISRO NISAR L-band (1.2575 GHz) L2 GCOV / L1 SLC radar products.
2. **ISRO Bhoonidhi (NRSC / SAC Ahmedabad):** NISAR S-band (3.200 GHz) polarimetric covariance products and EOS-04 (RISAT-1A) C-band Hybrid-Pol stripmap radar.
3. **Copernicus Data Space (ESA):** Sentinel-1 C-band (5.405 GHz) IW GRDH and Sentinel-2 MSI multispectral Level-2A surface reflectance.
4. **USGS EarthExplorer / Landsat:** Landsat-8 and Landsat-9 OLI-2 / TIRS-2 Collection-2 Level-2 surface reflectance.

---

## 2. Scientific Integrity & Timestamp Protocol

A core scientific principle of CoastPulse is the strict separation of Earth-observation temporal events:

| Timestamp Entity | Definition | Mechanism |
| :--- | :--- | :--- |
| **Acquisition Timestamp (`acquisition_datetime`)** | Exact physical moment the satellite sensor passed over the target coordinate and illuminated the terrain. | Extracted from raw HDF5/SAFE internal ephemeris header. |
| **Publication Timestamp (`publication_datetime`)** | When the ground segment processing facility (e.g. NASA JPL PGE, ISRO SAC, ESA IPF) compiled and catalogued the granule. | Retrieved from provider STAC / CMR metadata. |
| **Ingestion Timestamp (`discovered_at` / `downloaded_at`)** | When CoastPulse's local polling service verified and logged the granule into the local catalogue. | Local system clock UTC. |

> [!IMPORTANT]
> Catalogue polling must never be presented as live continuous Earth observation. Low-Earth orbit satellites (such as NISAR with a 12-day repeat orbit) only capture imagery during their discrete orbital overflight passes.

---

## 3. Architecture & Operational Lifecycle

```
[Space Agencies]
NASA ASF | ISRO Bhoonidhi | Copernicus CDSE | USGS
       │
       ▼ (Periodic Polling Loop: Every 300s)
[SatelliteUpdateMonitorService]
       │
       ├── 1. Query Providers via STAC / CMR Criteria
       ├── 2. SHA256 Checksum Verification & Duplicate Rejection
       ├── 3. Spatial Intersection with User Saved AOIs
       │       └── If Overlap: Emit Alert to `aoi_observation_notifications`
       ├── 4. Record to `satellite_observation_feed` in SQLite
       └── 5. Update Health & Telemetry in `satellite_provider_status`
```

---

## 4. API Endpoints

- `GET /api/v1/discovery/monitor`: Retrieves real-time telemetry, provider health states, next scheduled checks, and unread AOI alerts.
- `POST /api/v1/discovery/monitor/poll-now`: Manually initiates an immediate multi-provider catalogue check.
- `GET /api/v1/discovery/providers`: Lists all registered space agency adapters.
- `POST /api/v1/discovery/search`: Federates multi-provider searches across bounding boxes.
- `POST /api/v1/discovery/ingest/{provider_id}/{item_id}`: Approves local download and triggers cryptographic checksum validation.

---

## 5. Verification & Tests

Automated integration tests verify provider discovery, NISAR S-band polarimetry, and duplicate prevention:

```bash
python -m pytest coastpulse/backend/tests/test_satellite_poller.py -v
```

Output:
```
test_isro_bhoonidhi_adapter_registration PASSED
test_isro_bhoonidhi_search PASSED
test_satellite_poller_pipeline_and_aoi_matching PASSED
============================== 3 passed in 2.86s ==============================
```
