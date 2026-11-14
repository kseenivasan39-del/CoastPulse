# Global Coastal Event Watch — System Architecture

## 1. Module Purpose

The **Global Coastal Event Watch** module provides continuous, automated monitoring and evidence-based verification of coastal environmental shifts. It connects space agency observation pipelines to a structured, 7-stage validation lifecycle, ensuring that raw satellite anomalies are never confused with confirmed physical coastal disasters.

---

## 2. 7-Stage Event Validation Lifecycle State Machine

```
[Satellite Poller]
       │
       ▼
1. OBSERVATION_DISCOVERED  ──► Overflight detected in space agency catalogue
       │
       ▼
2. PROCESSING              ──► Radiometric terrain flattening & log-ratio/RVI computation
       │
       ▼
3. POTENTIAL_EVENT         ──► Statistically significant backscatter anomaly (Δγ⁰ > threshold)
       │
       ▼
4. NEEDS_VALIDATION        ──► Initial anomaly flagged; awaiting ancillary/optical cross-check
       │
       ├─────────────────────────────────┬──────────────────────────────┐
       ▼                                 ▼                              ▼
5. VALIDATED_CHANGE            6. INSUFFICIENT_EVIDENCE           7. DISMISSED
(Multi-sensor consensus /       (Persistent cloud cover /        (Astronomical tide /
 in-situ sensor verification)    calibration drift bound)         moisture transient)
```

### Lifecycle State Definitions:
1. `OBSERVATION_DISCOVERED`: New satellite overflight catalogued by NASA, ISRO, Copernicus, or USGS.
2. `PROCESSING`: Granules actively processing through radiometric calibration pipelines (e.g. Otsu dynamic water mask, RVI).
3. `POTENTIAL_EVENT`: Raw backscatter differential exceeds calibrated baseline bounds. Must be labelled as *Potential Detection* in all operator notifications.
4. `NEEDS_VALIDATION`: Preliminary anomaly requires operator review or multi-sensor consensus.
5. `VALIDATED_CHANGE`: Confirmed physical coastal event supported by multi-temporal or multi-sensor evidence.
6. `INSUFFICIENT_EVIDENCE`: Optical cloud occlusion or single-pass ambiguity prevents confirmation.
7. `DISMISSED`: Anomaly explained by astronomical spring tides, sensor noise, or agricultural flooding.

---

## 3. Four-Entity Strict Timestamp Protocol

Every tracked coastal event strictly isolates four temporal entities to prevent data fabrication and clarify data freshness:

```
[Satellite Overflight]    ──► 1. ACQUISITION_UTC   (Exact time microwave pulse hit terrain)
         │
[PGE Processing Facility] ──► 2. PUBLICATION_UTC   (When agency made granule publicly available)
         │
[CoastPulse Engine]       ──► 3. PROCESSING_UTC    (When calibration algorithm executed)
         │
[Event Watch Service]     ──► 4. DETECTION_UTC     (When event exceeded anomaly thresholds)
```

---

## 4. Backend Architecture & Data Models

- **Data Model:** `app/models/event_watch.py`
  - `CoastalEventRecord`: Core event schema with coordinate bounding boxes, spatial coverage, affected area, and confidence metrics.
  - `CoastalEventEvidence`: Provenance structure storing source granule IDs, sensors used, detection method, and independent in-situ verification notes.
  - `SensorCompatibility`: Physical resolution bounds and limitation documentation.
- **Service Layer:** `app/services/event_watch_service.py`
  - SQLite storage (`global_coastal_events`, `event_watch_subscriptions`, `event_watch_notifications`).
  - Audited state transition logic via `update_event_status()`.
- **API Endpoints:** `app/api/v1/endpoints/event_watch.py`
  - `GET /api/v1/event-watch/events`: Filtered query by status, event type, and confidence.
  - `GET /api/v1/event-watch/events/{id}`: Reproducible record retrieval.
  - `POST /api/v1/event-watch/events/{id}/transition`: State machine transition with operator notes.
  - `GET /api/v1/event-watch/sensor-compatibility`: Physical sensor suitability constraints.
  - `POST /api/v1/event-watch/subscriptions`: User alert thresholds.

---

## 5. Frontend Event Intelligence Studio

Accessible via the **Event Watch** tab in the main navigation:
- **Left Feed:** Filterable stream of tracked global events sorted by acquisition date.
- **Header Telemetry:** Location, country, affected area (ha), and confidence score.
- **Timestamp Deck:** Side-by-side 4-entity UTC timestamps.
- **Evidence Card:** Detection method, input satellites, and independent in-situ validation notes.
- **Physical Constraints Card:** Documented sensor uncertainties (e.g. C-band canopy saturation, tidal ingress).
- **Operator Decision Station:** Buttons to transition event state (`Validate Change`, `Request Validation`, `Dismiss`) with live audit trail logging.
