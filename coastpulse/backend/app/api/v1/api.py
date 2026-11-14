from fastapi import APIRouter
from app.api.v1.endpoints import (
    health,
    auth,
    workspaces,
    datasets,
    acquisitions,
    study_areas,
    processing,
    analysis,
    comparisons,
    reports,
    assistant,
    geospatial,
    discovery,
    event_watch,
)

api_router = APIRouter()

# Register versioned v1 endpoints
api_router.include_router(health.router, prefix="", tags=["System Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & User Management"])
api_router.include_router(workspaces.router, prefix="/workspaces", tags=["Research Workspaces"])
api_router.include_router(discovery.router, prefix="/discovery", tags=["Earth Observation Discovery & Ingestion"])
api_router.include_router(event_watch.router, prefix="/event-watch", tags=["Global Coastal Event Watch"])
api_router.include_router(datasets.router, prefix="/datasets", tags=["Dataset Catalogue"])
api_router.include_router(acquisitions.router, prefix="/acquisitions", tags=["Acquisitions"])
api_router.include_router(study_areas.router, prefix="/study-areas", tags=["Study Areas"])
api_router.include_router(processing.router, prefix="/processing", tags=["Processing Jobs"])
api_router.include_router(analysis.router, prefix="/analysis", tags=["Analysis"])
api_router.include_router(comparisons.router, prefix="/comparisons", tags=["Temporal Comparison"])
api_router.include_router(reports.router, prefix="/reports", tags=["Scientific Reports"])
api_router.include_router(assistant.router, prefix="/assistant", tags=["AI Research Assistant"])
api_router.include_router(geospatial.router, prefix="/geospatial", tags=["Geospatial Services"])
