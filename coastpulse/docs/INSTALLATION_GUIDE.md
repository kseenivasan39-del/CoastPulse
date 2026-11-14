# CoastPulse — Comprehensive Installation & Deployment Guide

This guide covers deployment instructions for CoastPulse across the four supported profiles: **local** (default secure workstation), **development**, **LAN** (internal laboratory network), and **self-hosted-public** (internet-facing with TLS reverse proxy).

---

## 1. Quick Start: One-Command Startup

For automated deployment on a local machine, CoastPulse provides lifecycle startup scripts that apply the target profile, initialise storage folders, migrate database tables, seed demonstration fixtures, and launch both frontend and backend services.

### Windows (PowerShell)
```powershell
# From the repository root (d:\Programs\PS 06 – Dancing with the SARs\coastpulse)
powershell -ExecutionPolicy Bypass -File scripts\start_coastpulse.ps1 -Profile local
```

Available actions:
- `-Action start` (default): Sets profile, checks storage and database, starts backend and frontend.
- `-Action init-db`: Applies migrations and seeds initial demonstration fixtures without starting servers.
- `-Action check`: Runs automated self-test health checks against live DB and disk storage.

### Linux / macOS (Bash)
```bash
chmod +x scripts/start_coastpulse.sh
./scripts/start_coastpulse.sh local start
```

---

## 2. Documented Native Alternative Installation

If you prefer step-by-step native setup without automation scripts:

### Prerequisites
- **Python**: Version 3.11 or 3.12 (with `pip` and `venv`).
- **Node.js**: Version 18.x or 20.x LTS (with `npm`).
- **GDAL / PROJ**: Pre-bundled with `rasterio` wheels on Windows/Linux; or install via OS package manager.
- **Database**: SQLite (default zero-configuration) or PostgreSQL 15+ with PostGIS 3.4+.

### Step 1: Environment Setup
```bash
# Navigate to the coastpulse directory
cd coastpulse

# Create and activate a Python virtual environment
python -m venv .venv

# Windows
.venv\Scripts\activate
# Linux/macOS
source .venv/bin/activate

# Install Python backend and scientific engine dependencies
pip install -r backend/requirements.txt
```

### Step 2: Configure Environment Profile
Copy the desired profile to `.env`:
```bash
# For local-only secure workstation (default)
cp environments/.env.local .env
```

### Step 3: Initialise Storage
Ensure data directories exist:
```bash
# Windows PowerShell
mkdir -p data/raw, data/processed, data/cache, backups

# Linux / macOS
mkdir -p data/raw data/processed data/cache backups
```

### Step 4: Run Database Migrations & Initial Seed
```bash
# Set PYTHONPATH to include backend and scientific engine
export PYTHONPATH="backend:scientific-engine"   # Linux/macOS
$env:PYTHONPATH = "backend;scientific-engine"   # Windows PowerShell

# Run schema creation and seed demonstration study areas
python scripts/init_db.py
```

### Step 5: Install & Build Frontend
```bash
cd frontend
npm install
npm run build   # Or 'npm run dev' for live development
```

### Step 6: Start Services
In Terminal 1 (Backend):
```bash
cd coastpulse/backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

In Terminal 2 (Frontend):
```bash
cd coastpulse/frontend
npm run start   # For production build, or 'npm run dev'
```

Access the interface at `http://localhost:3000` and API documentation at `http://127.0.0.1:8000/docs`.

---

## 3. Configuration Profiles

CoastPulse supports four validated profiles in `coastpulse/environments/`:

| Profile | Target Audience | Host Binding | Database | CORS Allowed |
| :--- | :--- | :--- | :--- | :--- |
| **`local`** *(Default)* | Single-user research workstation | `127.0.0.1:8000` | SQLite (`coastpulse_dev.db`) | Localhost only |
| **`development`** | Code contributors & testers | `127.0.0.1:8000` | SQLite (`coastpulse_dev.db`) | Localhost (debug active) |
| **`lan`** | Marine lab or vessel intranet | `0.0.0.0:8000` | PostgreSQL + PostGIS | Configurable LAN subnet |
| **`self-hosted-public`** | Cloud instance behind TLS proxy | `127.0.0.1:8000` | PostgreSQL + PostGIS | Verified domain FQDN only |

> [!IMPORTANT]
> The default configuration binds strictly to `127.0.0.1`. CoastPulse **never exposes itself to the public internet** by default.

---

## 4. Multi-Container Docker Deployment

For multi-user LAN or public deployments requiring PostgreSQL and Redis:
```bash
cd coastpulse
docker compose up -d
```
This boots:
1. `coastpulse-postgis`: PostgreSQL 16 + PostGIS 3.4
2. `coastpulse-redis`: Redis 7.2 task broker
3. `coastpulse-backend`: FastAPI application
4. `coastpulse-frontend`: Next.js web application

---

## 5. Public Cloud Deployment Requirements

Deploying CoastPulse publicly requires:
1. **Domain & DNS:** Registered domain with A/AAAA records pointing to host IP.
2. **Reverse Proxy & TLS:** Nginx, Caddy, or Traefik terminating TLS 1.3 with automated Let's Encrypt certificates.
3. **Loopback Backend:** Backend process must bind strictly to `127.0.0.1:8000`; never expose raw uvicorn ports to `0.0.0.0`.
4. **Firewall & Rate Limiting:** Restrict inbound traffic to ports 80 and 443; apply IP rate limits via Nginx or Cloudflare.
5. **Secret Rotation:** Replace `SECRET_KEY` in `.env` with a 256-bit cryptographic token:
   ```bash
   python -c "import secrets; print(secrets.token_hex(32))"
   ```

---

## 6. Installation Troubleshooting

- **`ModuleNotFoundError: No module named 'app'`**: Ensure `PYTHONPATH` includes both `coastpulse/backend` and `coastpulse/scientific-engine`.
- **Windows Path Exceeded (Error 206)**: Enable Long Paths in Windows registry or use the built-in `\\\\?\\` file access paths.
- **Port 8000 or 3000 In Use**: Check running processes via `netstat -ano | findstr 8000` (Windows) or `lsof -i :8000` (Linux) and stop stale services.
- **Database Lock on SQLite**: Verify no concurrent writer processes are held open; SQLite WAL mode is enabled automatically.
