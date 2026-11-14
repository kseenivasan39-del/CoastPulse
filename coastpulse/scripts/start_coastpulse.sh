#!/usr/bin/env bash
# ==============================================================================
# CoastPulse One-Command Startup & Lifecycle Script for Linux / macOS
# ==============================================================================
set -euo pipefail

PROFILE="${1:-local}"
ACTION="${2:-start}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo "=========================================================="
echo "   CoastPulse — Coastal SAR Intelligence Platform         "
echo "   Profile: ${PROFILE} | Action: ${ACTION}                "
echo "=========================================================="

# 1. Environment Profile
ENV_SOURCE="${PROJECT_ROOT}/environments/.env.${PROFILE}"
ENV_TARGET="${PROJECT_ROOT}/.env"

if [[ ! -f "${ENV_SOURCE}" ]]; then
    echo "Error: Profile file not found: ${ENV_SOURCE}" >&2
    exit 1
fi

echo "[1/5] Applying environment profile '${PROFILE}'..."
cp -f "${ENV_SOURCE}" "${ENV_TARGET}"

# 2. Storage Initialisation
echo "[2/5] Initialising storage directories..."
mkdir -p "${PROJECT_ROOT}/data/raw" \
         "${PROJECT_ROOT}/data/processed" \
         "${PROJECT_ROOT}/data/cache" \
         "${PROJECT_ROOT}/backups"

# 3. Database Schema Migration & Verification
echo "[3/5] Validating database and database schemas..."
export PYTHONPATH="${PROJECT_ROOT}/backend:${PROJECT_ROOT}/scientific-engine"

python3 - << 'EOF'
import asyncio
from app.db.session import engine, Base, AsyncSessionLocal
from app.db.seed import seed_initial_fixtures

async def init():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with AsyncSessionLocal() as session:
        await seed_initial_fixtures(session)
    print("Database initialisation and seed verification completed successfully.")

asyncio.run(init())
EOF

if [[ "${ACTION}" == "init-db" ]]; then
    echo "Database initialised. Exiting."
    exit 0
fi

if [[ "${ACTION}" == "check" ]]; then
    echo "[4/5] Executing self-test check..."
    pytest "${PROJECT_ROOT}/tests/test_health.py" -v
    echo "CoastPulse health check verified."
    exit 0
fi

# 4. Service Launch
echo "[4/5] Starting CoastPulse Backend on 127.0.0.1:8000..."
(cd "${PROJECT_ROOT}/backend" && python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8000) &
BACKEND_PID=$!

echo "[5/5] Starting CoastPulse Frontend on 127.0.0.1:3000..."
(cd "${PROJECT_ROOT}/frontend" && npm run dev) &
FRONTEND_PID=$!

echo "----------------------------------------------------------"
echo " CoastPulse is running successfully!"
echo " Frontend: http://localhost:3000"
echo " Backend:  http://127.0.0.1:8000"
echo " API Docs: http://127.0.0.1:8000/docs"
echo " Backend PID:  ${BACKEND_PID}"
echo " Frontend PID: ${FRONTEND_PID}"
echo " Press Ctrl+C to terminate services."
echo "----------------------------------------------------------"

trap "kill ${BACKEND_PID} ${FRONTEND_PID} 2>/dev/null || true; exit 0" SIGINT SIGTERM
wait
