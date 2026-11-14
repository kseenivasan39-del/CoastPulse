"""
Global Coastal Event Watch REST API Endpoints.
Provides event querying, lifecycle status transitions, sensor compatibility inspection,
and alert subscription management.
"""

from typing import List, Optional
from datetime import datetime, timezone
import uuid
from fastapi import APIRouter, HTTPException, Query, Body
from pydantic import BaseModel

from app.schemas.api_models import ApiResponse
from app.models.event_watch import (
    EventValidationStatus,
    CoastalEventType,
    CoastalEventRecord,
    EventSubscription,
    SENSOR_REGISTRY,
    SensorCompatibility,
)
from app.services.event_watch_service import GlobalCoastalEventWatchService

router = APIRouter()
event_service = GlobalCoastalEventWatchService()


class StatusTransitionRequest(BaseModel):
    new_status: EventValidationStatus
    validator_note: str


class CreateSubscriptionRequest(BaseModel):
    user_id: str = "default_operator"
    target_aoi_id: Optional[str] = None
    target_country: Optional[str] = None
    event_types: List[CoastalEventType]
    min_confidence: float = 0.65
    notification_channel: str = "IN_APP"
    email_address: Optional[str] = None
    frequency: str = "IMMEDIATE"


@router.get("/events", response_model=ApiResponse[List[dict]], tags=["Global Coastal Event Watch"])
async def list_coastal_events(
    event_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    country: Optional[str] = Query(None),
    min_confidence: Optional[float] = Query(None),
):
    """
    Retrieves tracked global coastal events with full evidence manifests and validation lifecycle states.
    """
    events = event_service.list_events(
        event_type=event_type,
        status=status,
        country=country,
        min_confidence=min_confidence,
    )
    return ApiResponse(
        success=True,
        data=events,
        message=f"Retrieved {len(events)} coastal events with strict evidence manifests."
    )


@router.get("/events/{event_id}", response_model=ApiResponse[dict], tags=["Global Coastal Event Watch"])
async def get_coastal_event(event_id: str):
    """
    Retrieves full reproducible record for an individual coastal event.
    """
    event = event_service.get_event(event_id)
    if not event:
        raise HTTPException(status_code=404, detail=f"Coastal event '{event_id}' not found.")
    return ApiResponse(
        success=True,
        data=event,
        message="Event record and multi-sensor evidence retrieved."
    )


@router.post("/events/{event_id}/transition", response_model=ApiResponse[dict], tags=["Global Coastal Event Watch"])
async def transition_event_status(
    event_id: str,
    req: StatusTransitionRequest,
):
    """
    Transitions event validation state according to the 7-stage lifecycle.
    Requires audit notes. Anomaly never automatically becomes confirmed disaster without validation.
    """
    updated = event_service.update_event_status(
        event_id=event_id,
        new_status=req.new_status,
        validator_note=req.validator_note,
    )
    if not updated:
        raise HTTPException(status_code=404, detail=f"Event '{event_id}' not found.")
    return ApiResponse(
        success=True,
        data=updated,
        message=f"Event lifecycle updated to {req.new_status.value}."
    )


@router.get("/sensor-compatibility", response_model=ApiResponse[List[SensorCompatibility]], tags=["Global Coastal Event Watch"])
async def get_sensor_compatibility():
    """
    Returns scientific sensor compatibility, resolution bounds, and physical detection limitations.
    """
    return ApiResponse(
        success=True,
        data=list(SENSOR_REGISTRY.values()),
        message="Sensor compatibility constraints retrieved."
    )


@router.post("/subscriptions", response_model=ApiResponse[dict], tags=["Global Coastal Event Watch"])
async def subscribe_to_events(req: CreateSubscriptionRequest):
    """
    Creates an alert subscription for saved AOIs, countries, or specific event types.
    """
    now = datetime.now(timezone.utc).isoformat()
    sub_id = f"sub-{uuid.uuid4().hex[:8]}"
    sub = EventSubscription(
        subscription_id=sub_id,
        user_id=req.user_id,
        target_aoi_id=req.target_aoi_id,
        target_country=req.target_country,
        event_types=req.event_types,
        min_confidence=req.min_confidence,
        notification_channel=req.notification_channel,
        email_address=req.email_address,
        frequency=req.frequency,
        is_active=True,
        created_at=now,
    )
    created = event_service.create_subscription(sub)
    return ApiResponse(
        success=True,
        data=created.model_dump(),
        message=f"Event subscription '{sub_id}' created successfully."
    )


@router.get("/subscriptions", response_model=ApiResponse[List[dict]], tags=["Global Coastal Event Watch"])
async def list_subscriptions(user_id: str = Query("default_operator")):
    """
    Lists active subscriptions and alert thresholds for the user.
    """
    subs = event_service.list_subscriptions(user_id=user_id)
    return ApiResponse(
        success=True,
        data=subs,
        message=f"Retrieved {len(subs)} active subscriptions."
    )
