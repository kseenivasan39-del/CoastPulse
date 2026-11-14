# AI Coding Agent Instructions

This document operationalizes project guidelines, architectural contracts, and safety rules for AI coding assistants working in the CoastPulse repository.

## 1. Project Context

- **Project**: CoastPulse
- **Purpose**: Scientific coastal ecosystem intelligence and Earth-observation platform utilizing NASA-ISRO NISAR dual-band radar data.
- **Primary Users**: Remote sensing scientists, coastal resilience researchers, disaster management authorities.

## 2. Source of Truth

Before proposing or implementing significant changes, inspect the documentation in `/docs`:
- `PRD.md` — Core requirements, scope, target users, acceptance criteria.
- `DESIGN_SYSTEM.md` — Visual tokens, dark palette, typography, interactive states.
- `ARCHITECTURE.md` — Monorepo structure, data flow, component boundaries.
- `DATABASE.md` — Entity models, schema definitions, migration rules.
- `SECURITY.md` — JWT auth, path traversal safeguards, input validation.
- `CODE_STYLE.md` — Python/TypeScript naming conventions, error handling.
- `TESTING.md` — Verification strategies and automated test commands.

Do not contradict these documents without explicitly noting the change.

## 3. General Rules

1. **Zero Data Fabrication**: Never fabricate synthetic satellite observations or fake calculations disguised as live radar data. If a dataset or band is absent, gracefully report data unavailability.
2. **Understand Before Modifying**: Inspect existing code, dependencies, and state stores before adding new functions or files.
3. **Preserve Mission-Control Identity**: Respect the established dark aesthetic (`#02050b`, `#ff8c2b`, `#00e5ff`, `#142036`).
4. **Windowed Raster Reading**: Always utilize windowed reading (`rasterio.windows.from_bounds`) for geospatial queries to avoid reading entire rasters into memory.
5. **No Breaking Schema Changes**: Modify database entities only through documented Alembic migration scripts.
6. **Check Live Systems**: After code changes, verify frontend build integrity (`npm run build`) and test endpoints to ensure zero regressions.

## 4. Conflict Handling

If a user request conflicts with scientific defensibility, physics constraints, or documented architectural contracts:
- Clearly explain the physical or technical limitation.
- Propose an authoritative alternative grounded in verifiable remote sensing practices.
