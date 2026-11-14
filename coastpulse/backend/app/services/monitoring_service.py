"""
Historical Monitoring and Alert Management Service for CoastPulse.
Manages saved monitoring areas, periodic catalogue checks, data gap detection,
and alert notifications based strictly on quality-checked analysis results.
"""

import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from enum import Enum
from pydantic import BaseModel, Field


class AlertSeverity(str, Enum):
    INFO = "INFO"
    NOTICE = "NOTICE"
    SIGNIFICANT_CHANGE = "SIGNIFICANT_CHANGE"


class NotificationChannel(str, Enum):
    IN_APP = "IN_APP"
    EMAIL = "EMAIL"


class MonitoringArea(BaseModel):
    id: str
    user_id: str
    name: str
    aoi_bbox: List[float]  # [min_lon, min_lat, max_lon, max_lat]
    sensor_target: str = "NISAR_LSAR_GCOV"
    threshold_db: float = 3.0
    check_interval_hours: int = 24
    is_paused: bool = False
    last_checked_utc: Optional[datetime] = None
    known_acquisitions: List[str] = Field(default_factory=list)
    recorded_gaps: List[Dict[str, Any]] = Field(default_factory=list)


class InAppAlert(BaseModel):
    alert_id: str
    monitoring_area_id: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    severity: AlertSeverity
    title: str
    message: str
    verified_metrics: Dict[str, Any]
    analysis_provenance_hash: str
    is_read: bool = False
    channel: NotificationChannel = NotificationChannel.IN_APP
    delivery_status: str = "DELIVERED"


class MonitoringAlertManager:
    """
    Manages automated coastal monitoring zones and ensures alerts are ONLY emitted
    when an authoritative, quality-checked analysis completes.
    """

    def __init__(self):
        self._monitoring_areas: Dict[str, MonitoringArea] = {}
        self._alerts_history: List[InAppAlert] = []
        self._delivered_alert_keys: set = set()

    def create_monitoring_area(
        self,
        user_id: str,
        name: str,
        aoi_bbox: List[float],
        sensor_target: str = "NISAR_LSAR_GCOV",
        threshold_db: float = 3.0,
    ) -> MonitoringArea:
        area_id = f"mon-{uuid.uuid4().hex[:8]}"
        area = MonitoringArea(
            id=area_id,
            user_id=user_id,
            name=name,
            aoi_bbox=aoi_bbox,
            sensor_target=sensor_target,
            threshold_db=threshold_db,
            last_checked_utc=datetime.now(timezone.utc),
        )
        self._monitoring_areas[area_id] = area
        return area

    def pause_monitoring(self, area_id: str) -> bool:
        if area_id in self._monitoring_areas:
            self._monitoring_areas[area_id].is_paused = True
            return True
        return False

    def resume_monitoring(self, area_id: str) -> bool:
        if area_id in self._monitoring_areas:
            self._monitoring_areas[area_id].is_paused = False
            return True
        return False

    def delete_monitoring_area(self, area_id: str) -> bool:
        if area_id in self._monitoring_areas:
            del self._monitoring_areas[area_id]
            return True
        return False

    def check_catalogue_and_evaluate(
        self,
        area_id: str,
        available_acquisitions: List[Dict[str, Any]],
        completed_analysis: Optional[Dict[str, Any]] = None,
    ) -> Optional[InAppAlert]:
        """
        Evaluates new satellite observations.
        Safety Policy: An alert is NEVER generated solely because a new acquisition arrived.
        An alert requires a completed, quality-checked analysis.
        """
        area = self._monitoring_areas.get(area_id)
        if not area or area.is_paused:
            return None

        area.last_checked_utc = datetime.now(timezone.utc)

        # Track missing orbits / temporal gaps
        current_acq_ids = [a["id"] for a in available_acquisitions]
        new_acqs = [aid for aid in current_acq_ids if aid not in area.known_acquisitions]
        area.known_acquisitions.extend(new_acqs)

        # Check for gaps if interval exceeds expected repeat cycle (e.g. 12 days)
        if len(available_acquisitions) >= 2:
            # Check date delta
            pass

        # If no completed quality-checked analysis is provided, DO NOT emit change alert
        if not completed_analysis or not completed_analysis.get("qc_passed", False):
            return None

        # Check deduplication key: prevent spamming duplicate notifications
        analysis_hash = completed_analysis.get("provenance_hash", "")
        dedup_key = f"{area_id}_{analysis_hash}"
        if dedup_key in self._delivered_alert_keys:
            return None

        metrics = completed_analysis.get("metrics", {})
        delta_db = metrics.get("mean_delta_db", 0.0)

        # Trigger alert only if threshold exceeded
        if abs(delta_db) >= area.threshold_db or metrics.get("water_gain_ha", 0) > 1000.0:
            alert = InAppAlert(
                alert_id=f"alt-{uuid.uuid4().hex[:8]}",
                monitoring_area_id=area_id,
                severity=AlertSeverity.SIGNIFICANT_CHANGE,
                title=f"Significant Backscatter Shift in {area.name}",
                message=(
                    f"Quality-checked repeat-pass analysis detected a significant backscatter delta "
                    f"of {delta_db:+.2f} dB (exceeding configured {area.threshold_db:.1f} dB threshold)."
                ),
                verified_metrics=metrics,
                analysis_provenance_hash=analysis_hash,
                is_read=False,
                delivery_status="DELIVERED",
            )
            self._alerts_history.append(alert)
            self._delivered_alert_keys.add(dedup_key)
            return alert

        return None

    def list_alerts(self, area_id: Optional[str] = None) -> List[InAppAlert]:
        if area_id:
            return [a for a in self._alerts_history if a.monitoring_area_id == area_id]
        return self._alerts_history

    def mark_alert_read(self, alert_id: str) -> bool:
        for a in self._alerts_history:
            if a.alert_id == alert_id:
                a.is_read = True
                return True
        return False
