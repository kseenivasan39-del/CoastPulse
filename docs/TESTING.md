# Testing Strategy

## 1. Testing Goals

Ensure continuous scientific correctness, mathematical reproducibility, API contract stability, and responsive WebGL rendering across all CoastPulse capabilities.

## 2. Test Types

### Unit Testing
- Radiometric calibration formulas (linear power to decibels).
- Bounding box and coordinate projection math (EPSG:4326 to Web Mercator).
- Rasterio windowed array reading and nodata masking.
- Individual React component state transitions (Layer Store actions, preset toggles).

### Integration Testing
- FastAPI REST endpoints (`/api/v1/datasets`, `/api/v1/geospatial/statistics`, `/api/v1/comparisons/execute`).
- Database session commit, query filters, and Alembic migrations.
- STAC adapter response parsers using real/mocked provider payloads.

### End-to-End & Acceptance Verification
- Complete user journey: Launch app → View Global Explorer → Open Layer Manager → Toggle SAR Composite → Inspect Pixel Probe HUD.
- Bi-temporal change detection run: Select Baseline and Repeat → Execute change detection → Verify output GeoTIFF raster creation and summary stats.

## 3. Testing Tools & Commands

### Backend & Scientific Engine
- Framework: `pytest` with `pytest-asyncio`
- Execution:
  ```bash
  cd coastpulse
  pytest
  ```

### Frontend
- Framework: Jest / React Testing Library / Next.js Build Validation
- Execution:
  ```bash
  cd coastpulse/frontend
  npm run build
  ```

## 4. Test File Structure

```
coastpulse/
├── tests/
│   ├── test_ai_research_assistant.py
│   ├── test_backend_api.py
│   ├── test_geospatial_visualisation.py
│   ├── test_health.py
│   ├── test_nisar_ingestion.py
│   ├── test_nisar_processing_engine.py
│   ├── test_reports_monitoring_alerts.py
│   ├── test_scientific_engine.py
│   └── test_temporal_change_intelligence.py
```

## 5. Definition of Done for Testing

- [x] All automated pytest tests pass without regression.
- [x] `npm run build` succeeds cleanly with Turbopack and TypeScript verification.
- [x] Edge cases tested: zero-pixel bounds, out-of-granule coordinates, invalid polarization combinations.
