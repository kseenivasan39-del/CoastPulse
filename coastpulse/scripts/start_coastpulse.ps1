param (
    [ValidateSet("local", "development", "lan", "self-hosted-public")]
    [string]$Profile = "local",

    [ValidateSet("start", "init-db", "check", "stop")]
    [string]$Action = "start"
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = (Resolve-Path "$ScriptDir\..").Path

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   CoastPulse - Coastal SAR Intelligence Platform         " -ForegroundColor Cyan
Write-Host "   Profile: $Profile | Action: $Action                    " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Profile Environment Setup
$EnvSource = Join-Path $ProjectRoot "environments\.env.$Profile"
$EnvTarget = Join-Path $ProjectRoot ".env"

if (-not (Test-Path $EnvSource)) {
    Write-Error "Profile configuration file not found: $EnvSource"
    exit 1
}

Write-Host "[1/5] Applying environment profile '$Profile'..." -ForegroundColor Green
Copy-Item $EnvSource $EnvTarget -Force

# 2. Storage Initialisation
Write-Host "[2/5] Initialising storage directories..." -ForegroundColor Green
$Dirs = @(
    (Join-Path $ProjectRoot "data"),
    (Join-Path $ProjectRoot "data\raw"),
    (Join-Path $ProjectRoot "data\processed"),
    (Join-Path $ProjectRoot "data\cache"),
    (Join-Path $ProjectRoot "backups")
)

foreach ($Dir in $Dirs) {
    if (-not (Test-Path $Dir)) {
        New-Item -ItemType Directory -Path $Dir -Force | Out-Null
        Write-Host "  + Created $Dir" -ForegroundColor Gray
    }
}

# 3. Database Initialisation & Verification
Write-Host "[3/5] Validating database and database schemas..." -ForegroundColor Green
$env:PYTHONPATH = "$ProjectRoot\backend;$ProjectRoot\scientific-engine"

$initScript = Join-Path $ProjectRoot "scripts\init_db.py"
python $initScript
if ($LASTEXITCODE -ne 0) {
    Write-Error "Database initialisation failed."
    exit 1
}

if ($Action -eq "init-db") {
    Write-Host "Database initialisation complete. Exiting." -ForegroundColor Green
    exit 0
}

if ($Action -eq "check") {
    Write-Host "[4/5] Executing self-test check..." -ForegroundColor Green
    $testTarget = Join-Path $ProjectRoot "tests\test_health.py"
    python -m pytest $testTarget -v
    Write-Host "CoastPulse health check verified." -ForegroundColor Green
    exit 0
}

# 4. Service Launch
Write-Host "[4/5] Starting CoastPulse Backend on 127.0.0.1:8000..." -ForegroundColor Green
$backendDir = Join-Path $ProjectRoot "backend"
$BackendProc = Start-Process -FilePath "python" -ArgumentList "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000" -WorkingDirectory $backendDir -PassThru

Write-Host "[5/5] Starting CoastPulse Frontend on 127.0.0.1:3000..." -ForegroundColor Green
$frontendDir = Join-Path $ProjectRoot "frontend"
$FrontendProc = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory $frontendDir -PassThru

Write-Host "----------------------------------------------------------" -ForegroundColor Yellow
Write-Host " CoastPulse is running successfully!" -ForegroundColor Green
Write-Host " Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host " Backend:  http://127.0.0.1:8000" -ForegroundColor Cyan
Write-Host " API Docs: http://127.0.0.1:8000/docs" -ForegroundColor Cyan
Write-Host " Backend PID:  $($BackendProc.Id)" -ForegroundColor Gray
Write-Host " Frontend PID: $($FrontendProc.Id)" -ForegroundColor Gray
Write-Host " Press Ctrl+C in their console windows to stop." -ForegroundColor Yellow
Write-Host "----------------------------------------------------------" -ForegroundColor Yellow
