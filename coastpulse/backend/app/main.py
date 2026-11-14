import time
import uuid
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import api_router
from app.db.session import engine, Base, AsyncSessionLocal
from app.db.seed import seed_initial_fixtures

# Structured Logger Setup
class RequestIdFilter(logging.Filter):
    def filter(self, record):
        if not hasattr(record, "request_id"):
            record.request_id = "-"
        return True

handler = logging.StreamHandler()
handler.addFilter(RequestIdFilter())
handler.setFormatter(logging.Formatter("%(asctime)s [%(levelname)s] [%(name)s] [ReqID: %(request_id)s] %(message)s"))

root_logger = logging.getLogger()
root_logger.setLevel(logging.INFO if not settings.DEBUG else logging.DEBUG)
root_logger.handlers = [handler]

logger = logging.getLogger("coastpulse")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database schemas
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed initial Nagapattinam fixtures & authentic acquisitions
    async with AsyncSessionLocal() as session:
        await seed_initial_fixtures(session)

    yield

    # Cleanup connections
    await engine.dispose()


app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "Production-quality scientific Earth Observation platform API for NASA Space Apps Challenge 2026 "
        "(PS 06 — Dancing with the SARs). Focus: Nagapattinam coastal ecosystem change intelligence."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_middleware(request: Request, call_next):
    """
    Middleware: Generates X-Request-ID, logs processing latency, and formats structured error responses.
    """
    request_id = request.headers.get("X-Request-ID") or f"req-{uuid.uuid4().hex[:12]}"
    request.state.request_id = request_id

    start_time = time.time()
    try:
        response = await call_next(request)
        latency_ms = (time.time() - start_time) * 1000
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Response-Time-Ms"] = f"{latency_ms:.2f}"
        
        # Log request summary
        logger.info(
            f"{request.method} {request.url.path} - Status: {response.status_code} ({latency_ms:.2f}ms)",
            extra={"request_id": request_id},
        )
        return response
    except Exception as exc:
        latency_ms = (time.time() - start_time) * 1000
        logger.error(
            f"Unhandled server error on {request.method} {request.url.path}: {str(exc)}",
            exc_info=True,
            extra={"request_id": request_id},
        )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "error": {
                    "code": "INTERNAL_SERVER_ERROR",
                    "message": "An unexpected error occurred during request execution.",
                    "request_id": request_id,
                },
            },
            headers={"X-Request-ID": request_id},
        )


# Mount versioned API routes
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Root"])
async def root():
    return {
        "platform": settings.PROJECT_NAME,
        "description": "Earth Observation SAR Coastal Ecosystem Intelligence Platform",
        "api_docs": "/docs",
        "health_check": f"{settings.API_V1_STR}/health",
        "api_version": "v1",
        "environment": settings.ENVIRONMENT,
    }
