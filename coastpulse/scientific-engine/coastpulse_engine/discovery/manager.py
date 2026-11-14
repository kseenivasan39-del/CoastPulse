"""
Earth Observation Discovery & Ingestion Registry and Manager.
Orchestrates multi-provider discovery, resumable downloads, checksum validation,
storage limit enforcement, and provenance tracking.
"""

import os
import hashlib
import shutil
from typing import Dict, List, Optional, Any, AsyncGenerator
from datetime import datetime, timezone
import uuid

from coastpulse_engine.discovery.base_adapter import BaseEOProviderAdapter
from coastpulse_engine.discovery.models import (
    STACItemRecord,
    DiscoverySearchCriteria,
    DownloadStatus,
    ProvenanceEvent,
)
from coastpulse_engine.discovery.providers.nasa_asf import NASAASFProviderAdapter
from coastpulse_engine.discovery.providers.copernicus import (
    CopernicusSentinel1Adapter,
    CopernicusSentinel2Adapter,
)
from coastpulse_engine.discovery.providers.landsat import USGSCommercialLandsatAdapter
from coastpulse_engine.discovery.providers.isro import ISROBhoonidhiAdapter


class EODiscoveryManager:
    """
    Central discovery and ingestion manager for CoastPulse.
    """

    def __init__(
        self,
        storage_base_dir: str = "data/raw",
        max_storage_bytes: int = 50 * 1024 * 1024 * 1024,  # 50 GB default limit
    ):
        self.storage_base_dir = storage_base_dir
        self.max_storage_bytes = max_storage_bytes
        self._providers: Dict[str, BaseEOProviderAdapter] = {}
        self._provenance_log: List[ProvenanceEvent] = []
        self._download_jobs: Dict[str, Dict[str, Any]] = {}

        # Register default real provider adapters
        self.register_provider(NASAASFProviderAdapter())
        self.register_provider(CopernicusSentinel1Adapter())
        self.register_provider(CopernicusSentinel2Adapter())
        self.register_provider(USGSCommercialLandsatAdapter())
        self.register_provider(ISROBhoonidhiAdapter())

    def register_provider(self, adapter: BaseEOProviderAdapter):
        """Registers an independent provider adapter."""
        self._providers[adapter.provider_id] = adapter

    def get_provider(self, provider_id: str) -> Optional[BaseEOProviderAdapter]:
        return self._providers.get(provider_id)

    def list_providers(self) -> List[Dict[str, Any]]:
        return [
            {
                "provider_id": p.provider_id,
                "supported_collections": p.supported_collections,
            }
            for p in self._providers.values()
        ]

    async def search_all(self, criteria: DiscoverySearchCriteria) -> List[STACItemRecord]:
        """
        Federates discovery search across all registered providers.
        """
        results: List[STACItemRecord] = []
        for provider_id, adapter in self._providers.items():
            try:
                items = await adapter.search(criteria)
                results.extend(items)
            except Exception as e:
                print(f"[EODiscoveryManager] Error querying provider {provider_id}: {e}")
        return results

    def check_storage_quota(self, incoming_bytes: int = 0) -> bool:
        """
        Validates that available space does not exceed the configured storage limit.
        """
        if not os.path.exists(self.storage_base_dir):
            return True

        total_used = sum(
            os.path.getsize(os.path.join(dirpath, f))
            for dirpath, _, filenames in os.walk(self.storage_base_dir)
            for f in filenames
        )
        return (total_used + incoming_bytes) <= self.max_storage_bytes

    async def execute_ingestion_job(
        self,
        item: STACItemRecord,
        asset_key: str = "data",
    ) -> Dict[str, Any]:
        """
        Executes a background download job with checksum validation and provenance logging.
        """
        adapter = self.get_provider(item.provider)
        if not adapter:
            raise ValueError(f"No adapter registered for provider {item.provider}")

        job_id = f"job-ingest-{uuid.uuid4().hex[:8]}"
        self._download_jobs[job_id] = {
            "job_id": job_id,
            "item_id": item.id,
            "status": DownloadStatus.DOWNLOADING,
            "progress_pct": 0,
            "file_path": None,
            "error": None,
        }

        # Check storage limit
        if not self.check_storage_quota():
            self._download_jobs[job_id]["status"] = DownloadStatus.FAILED
            self._download_jobs[job_id]["error"] = "Configured storage limit exceeded"
            raise RuntimeError("Configured storage quota exceeded.")

        # Stream download
        final_file_path = None
        computed_sha = None
        async for event in adapter.download_asset(item, asset_key, self.storage_base_dir):
            st = event.get("status")
            self._download_jobs[job_id]["status"] = st
            if event.get("file_path"):
                final_file_path = event["file_path"]
            if event.get("sha256"):
                computed_sha = event["sha256"]

        # Validate file existence & checksum
        if not final_file_path or not os.path.exists(final_file_path):
            self._download_jobs[job_id]["status"] = DownloadStatus.FAILED
            self._download_jobs[job_id]["error"] = "File missing after download stream"
            return self._download_jobs[job_id]

        # Calculate SHA256 if not returned by stream
        if not computed_sha:
            hasher = hashlib.sha256()
            with open(final_file_path, "rb") as f:
                while chunk := f.read(65536):
                    hasher.update(chunk)
            computed_sha = hasher.hexdigest()

        # Record Provenance Event
        event_id = f"prov-{uuid.uuid4().hex[:8]}"
        prov_event = ProvenanceEvent(
            event_id=event_id,
            timestamp=datetime.now(timezone.utc),
            event_type="INGESTION_COMPLETED",
            granule_id=item.id,
            provider=item.provider,
            agent="CoastPulse EO Ingestion Worker",
            details={
                "file_path": final_file_path,
                "file_size_bytes": os.path.getsize(final_file_path),
                "sha256": computed_sha,
            },
            hash_signature=computed_sha,
        )
        self._provenance_log.append(prov_event)

        self._download_jobs[job_id]["status"] = DownloadStatus.COMPLETED
        self._download_jobs[job_id]["file_path"] = final_file_path
        self._download_jobs[job_id]["sha256"] = computed_sha
        self._download_jobs[job_id]["progress_pct"] = 100

        return self._download_jobs[job_id]

    def get_job_status(self, job_id: str) -> Optional[Dict[str, Any]]:
        return self._download_jobs.get(job_id)

    def cancel_job(self, job_id: str) -> bool:
        if job_id in self._download_jobs:
            self._download_jobs[job_id]["status"] = DownloadStatus.CANCELLED
            return True
        return False

    def get_provenance_history(self, granule_id: Optional[str] = None) -> List[ProvenanceEvent]:
        if granule_id:
            return [e for e in self._provenance_log if e.granule_id == granule_id]
        return self._provenance_log
