# Code Style & Conventions

This document establishes the programming standards, patterns, and conventions across Python and TypeScript modules in CoastPulse.

## 1. General Principles

- **Clarity over Cleverness**: Write readable, self-describing code. Explicit is better than implicit.
- **Scientific Precision**: Always document mathematical units ($dB$, linear amplitude, meters, degrees) in variable names and docstrings.
- **Single Responsibility**: Each function, React component, and API route should handle one focused responsibility.
- **Consistency over Novelty**: Adhere to existing patterns across the monorepo rather than introducing competing libraries.

## 2. Naming Conventions

### Python (Backend & Scientific Engine)
- **Functions & Methods**: `snake_case` (e.g., `calculate_backscatter_difference()`).
- **Classes**: `PascalCase` (e.g., `TemporalChangeEngine`, `NisarPipeline`).
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `DEFAULT_NODATA_VALUE = -9999.0`).
- **Modules / Files**: `snake_case.py` (e.g., `radiometric.py`, `geospatial.py`).

### TypeScript / React (Frontend)
- **Components**: `PascalCase` (e.g., `LeftDataDrawer.tsx`, `CentralSatelliteCanvas.tsx`).
- **Hooks & Utilities**: `camelCase` (e.g., `useLayerStore()`, `calculateGeodesicArea()`).
- **Interfaces & Types**: `PascalCase` (e.g., `LayerDefinition`, `CoastalLocation`).
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `GLOBAL_COASTAL_OBSERVATORIES`).

## 3. Directory & File Organization

- Put shared frontend utilities in `frontend/src/lib/`.
- Put reusable visual components in `frontend/src/components/common/` or `frontend/src/components/layout/`.
- Put domain modules in `frontend/src/components/modules/`.
- Backend endpoints reside strictly in `backend/app/api/v1/endpoints/`.
- Scientific algorithms reside strictly in `scientific-engine/coastpulse_engine/`.

## 4. Error Handling

- **Python**: Catch specific exceptions (`RasterioIOError`, `ValueError`). Raise `fastapi.HTTPException` with informative error payloads. Never write bare `except: pass`.
- **TypeScript**: Handle asynchronous promises with `try / catch` blocks. Update UI state with user-friendly error banners rather than letting errors bubble into unhandled rejections.

## 5. Comments & Documentation

- Docstrings must specify input array shapes, expected units, and returned data structures.
- Comment *why* a particular remote sensing edge case is handled (e.g., `// -9999.0 indicates synthetic aperture radar shadow or slant-range layover`).
- Avoid redundant comments that merely rephrase the syntax.

## 6. Formatting & Tooling

- **Python**: Formatted with `black` / `ruff`, type-checked with `mypy`.
- **TypeScript**: Formatted with Prettier, linted with ESLint, type-checked with `tsc --noEmit`.
