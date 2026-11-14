# Security Guidelines

## 1. Authentication

- **Provider**: Internal JWT Token Engine.
- **Algorithms**: HS256 for symmetric signing or RS256 for public-key verification.
- **Password Hashing**: Argon2id / Bcrypt via `passlib[argon2]`.
- **Token Expiry**: Short-lived Access Tokens (30 minutes) and Refresh Tokens (7 days).

## 2. Authorization & RBAC

- **Admin**: Full system management, user role modification, direct raster pipeline trigger, audit log review.
- **Scientist**: Full access to raw/processed rasters, change detection runs, AOI creation, PDF report generation.
- **Observer / Public**: Read-only access to published public rasters, basic map exploration, pre-generated statistics.
- **Rule**: Authorization checks are strictly enforced server-side via FastAPI dependency injection (`get_current_active_user`).

## 3. Secrets Management

- **Zero Secret Commits**: Production passwords, API keys, and private tokens must never be committed to Git.
- **Environment Isolation**: All configuration is read dynamically from `.env` via Pydantic `BaseSettings`.
- **Client Boundary**: Public variables in Next.js must carry the `NEXT_PUBLIC_` prefix; sensitive space agency credentials (NASA Earthdata, ISRO SAC) reside strictly on the backend.

## 4. API Security

- **Input Validation**: All incoming requests are strictly validated using Pydantic v2 schemas. Coordinate bounds are checked for global geometric validity (`-180 <= lon <= 180`, `-90 <= lat <= 90`).
- **Path Traversal Protection**: GeoTIFF file retrieval and windowed reading strictly validate target file paths against an allowed base directory (`coastpulse/data/processed/`). Attempts to pass `../` or arbitrary system paths are rejected with HTTP 400.
- **CORS Configuration**: Restrict allowed origins to designated frontend URLs (`http://localhost:3000`, `http://127.0.0.1:3000`, and authorized production domains).
- **Rate Limiting**: Critical endpoints (login, heavy raster difference calculations) apply rate limiting to prevent denial-of-service degradation.

## 5. Scientific Data Protection & Provenance

- **Read-Only Raw Archives**: Raw Level-1 and Level-2 granules are mounted with read-only filesystem permissions to prevent inadvertent overwrite.
- **Cryptographic Hashing**: All generated bi-temporal difference GeoTIFFs generate an accompanying SHA-256 hash stored in the reproducibility manifest.

## 6. Security Checklist

- [x] Server-side JWT authentication and token expiration implemented.
- [x] Strict coordinate and raster path traversal checks enforced.
- [x] Zero hard-coded credentials in codebase; verified via `.gitignore`.
- [x] Database foreign keys and constraints enabled.
- [x] Dependencies scanned and pinned in `requirements.txt` and `package.json`.
