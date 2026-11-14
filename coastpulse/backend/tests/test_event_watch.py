"""
Automated unit and integration tests for Global Coastal Event Watch module.
Validates 7-stage lifecycle state machine, multi-sensor compatibility constraints,
evidence structures, and subscription management.
"""

import pytest
import sqlite3
from datetime import datetime, timezone

from app.models.event_watch import (
    EventValidationStatus,
    CoastalEventType,
    CoastalEventRecord,
    CoastalEventEvidence,
    EventSubscription,
    SENSOR_REGISTRY,
)
from app.services.event_watch_service import GlobalCoastalEventWatchService


@pytest.fixture
def test_db_path(tmp_path):
    return str(tmp_path / "test_event_watch.db")


def test_sensor_compatibility_registry():
    # 1. NISAR L-band must support Inundation and Mangroves, but not Urban Coherence
    nisar = SENSOR_REGISTRY["NISAR_L_BAND"]
    assert CoastalEventType.INUNDATION_WATER_EXTENT in nisar.compatible_event_types
    assert CoastalEventType.MANGROVE_DISTURBANCE in nisar.compatible_event_types
    assert "double-bounce" in nisar.limitations

    # 2. Sentinel-2 MSI must have cloud limitation documented
    s2 = SENSOR_REGISTRY["SENTINEL_2_MSI"]
    assert "cloud" in s2.limitations.lower()


def test_event_watch_seeding_and_retrieval(test_db_path):
    service = GlobalCoastalEventWatchService(db_path=test_db_path)
    events = service.list_events()

    # Initial seeding must contain 3 authoritative events
    assert len(events) == 3
    event_ids = [e["event_id"] for e in events]
    assert "EVT-2026-NAG-001" in event_ids
    assert "EVT-2026-SUN-002" in event_ids
    assert "EVT-2026-EVG-003" in event_ids

    # Nagapattinam event must have Float32 bitemporal evidence
    nag = service.get_event("EVT-2026-NAG-001")
    assert nag is not None
    assert nag["status"] == EventValidationStatus.VALIDATED_CHANGE.value
    assert nag["evidence"]["confidence_score"] == 0.985
    assert nag["multi_sensor_verified"] == 1


def test_event_validation_lifecycle_transition(test_db_path):
    service = GlobalCoastalEventWatchService(db_path=test_db_path)
    
    # Target Sundarbans event (currently NEEDS_VALIDATION)
    ev_before = service.get_event("EVT-2026-SUN-002")
    assert ev_before["status"] == EventValidationStatus.NEEDS_VALIDATION.value

    # Operator transitions to VALIDATED_CHANGE
    note = "Cross-checked with cloud-free Sentinel-2 optical imagery."
    updated = service.update_event_status(
        event_id="EVT-2026-SUN-002",
        new_status=EventValidationStatus.VALIDATED_CHANGE,
        validator_note=note,
    )

    assert updated["status"] == EventValidationStatus.VALIDATED_CHANGE.value
    assert len(updated["validation_notes"]) >= 2
    assert any(note in n for n in updated["validation_notes"])

    # Operator transitions to DISMISSED
    dismissed = service.update_event_status(
        event_id="EVT-2026-SUN-002",
        new_status=EventValidationStatus.DISMISSED,
        validator_note="Flagged as astronomical tidal mudflat shift, not permanent erosion.",
    )
    assert dismissed["status"] == EventValidationStatus.DISMISSED.value


def test_event_subscription_management(test_db_path):
    service = GlobalCoastalEventWatchService(db_path=test_db_path)
    
    sub = EventSubscription(
        subscription_id="sub-test-01",
        user_id="researcher_01",
        target_country="India",
        event_types=[CoastalEventType.INUNDATION_WATER_EXTENT, CoastalEventType.MANGROVE_DISTURBANCE],
        min_confidence=0.8,
        notification_channel="IN_APP",
        frequency="IMMEDIATE",
        is_active=True,
        created_at=datetime.now(timezone.utc).isoformat(),
    )

    service.create_subscription(sub)
    user_subs = service.list_subscriptions(user_id="researcher_01")
    assert len(user_subs) == 1
    assert user_subs[0]["subscription_id"] == "sub-test-01"
    assert user_subs[0]["target_country"] == "India"
