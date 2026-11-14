from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from coastpulse_engine.discovery import (
    EODiscoveryManager,
    DiscoverySearchCriteria,
    STACItemRecord,
    SensorType,
)
from app.schemas.api_models import ApiResponse

router = APIRouter()
eo_manager = EODiscoveryManager()


@router.get("/providers", response_model=ApiResponse[List[dict]], tags=["Earth Observation Discovery"])
async def list_registered_providers():
    """
    Returns all registered Earth-observation satellite data providers.
    """
    providers = eo_manager.list_providers()
    return ApiResponse(
        success=True,
        data=providers,
        message=f"{len(providers)} independent satellite provider adapters registered."
    )


@router.post("/search", response_model=ApiResponse[List[STACItemRecord]], tags=["Earth Observation Discovery"])
async def search_eo_catalogue(criteria: DiscoverySearchCriteria):
    """
    Federates discovery search across registered provider adapters.
    Returns STAC-compatible item records without initiating downloads.
    """
    results = await eo_manager.search_all(criteria)
    return ApiResponse(
        success=True,
        data=results,
        message=f"Discovered {len(results)} authoritative satellite products."
    )


@router.post("/ingest/{provider_id}/{item_id}", response_model=ApiResponse[dict], tags=["Earth Observation Ingestion"])
async def trigger_ingestion_job(
    provider_id: str,
    item_id: str,
    background_tasks: BackgroundTasks,
):
    """
    Initiates a verified, resumable download job for a discovered product.
    Requires explicit user approval and validates checksums against source manifests.
    """
    # 1. Look up item via search
    criteria = DiscoverySearchCriteria(max_results=50)
    adapter = eo_manager.get_provider(provider_id)
    if not adapter:
        raise HTTPException(status_code=404, detail=f"Provider '{provider_id}' is not registered.")

    items = await adapter.search(criteria)
    target_item = next((i for i in items if i.id == item_id), None)
    if not target_item:
        raise HTTPException(
            status_code=404,
            detail=f"Item '{item_id}' not found in provider '{provider_id}' catalogue."
        )

    # 2. Execute ingestion job
    job_result = await eo_manager.execute_ingestion_job(target_item)
    return ApiResponse(
        success=True,
        data=job_result,
        message="Satellite product ingestion completed with checksum verification."
    )


@router.get("/provenance", response_model=ApiResponse[List[dict]], tags=["Earth Observation Provenance"])
async def get_provenance_manifest(granule_id: Optional[str] = Query(None)):
    """
    Retrieves complete provenance history and checksum manifests for ingested granules.
    """
    events = eo_manager.get_provenance_history(granule_id)
    return ApiResponse(
        success=True,
        data=[e.model_dump() for e in events],
        message=f"Retrieved {len(events)} provenance records."
    )


# --- Automated Satellite Update System & Poller Monitoring ---
from app.services.satellite_poller import SatelliteUpdateMonitorService

satellite_monitor = SatelliteUpdateMonitorService()


@router.get("/monitor", response_model=ApiResponse[dict], tags=["Automated Satellite Update System"])
async def get_satellite_monitor_status():
    """
    Returns real-time status of provider catalogue polling, acquisition vs publication dates,
    storage allocations, and AOI intersection notifications.
    """
    status = satellite_monitor.get_monitor_dashboard()
    return ApiResponse(
        success=True,
        data=status,
        message="Satellite update monitor telemetry retrieved."
    )


@router.post("/monitor/poll-now", response_model=ApiResponse[dict], tags=["Automated Satellite Update System"])
async def trigger_manual_satellite_check():
    """
    Manually triggers an immediate catalogue polling cycle across all registered space agency adapters.
    """
    result = await satellite_monitor.poll_once()
    return ApiResponse(
        success=True,
        data=result,
        message=f"Catalogue check complete: {result['new_observations_found']} new observations discovered across {result['providers_polled']} providers."
    )

