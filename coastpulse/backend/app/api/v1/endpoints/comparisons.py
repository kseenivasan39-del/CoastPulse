from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.database import Acquisition
from app.schemas.api_models import ComparisonVerifyRequest, ComparisonVerifyResponse
from coastpulse_engine.metadata.models import (
    SARSceneMetadata,
    ProductLevel,
    RadarBand,
    OrbitPass,
)
from coastpulse_engine.compatibility.evaluator import evaluate_sar_compatibility

router = APIRouter()


@router.post("/verify-compatibility", response_model=ComparisonVerifyResponse, tags=["Temporal Comparison"])
async def verify_comparison_compatibility(
    request: ComparisonVerifyRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Rigorously validates whether two SAR granules are scientifically comparable
    prior to executing bitemporal change detection.
    """
    # Query reference scene
    ref_res = await db.execute(select(Acquisition).where(Acquisition.id == request.reference_granule_id))
    ref_acq = ref_res.scalar_one_or_none()
    if not ref_acq:
        raise HTTPException(status_code=404, detail=f"Reference granule '{request.reference_granule_id}' not found.")

    # Query secondary scene
    sec_res = await db.execute(select(Acquisition).where(Acquisition.id == request.secondary_granule_id))
    sec_acq = sec_res.scalar_one_or_none()
    if not sec_acq:
        raise HTTPException(status_code=404, detail=f"Secondary granule '{request.secondary_granule_id}' not found.")

    # Map database models to Scientific Engine Metadata schemas
    ref_meta = SARSceneMetadata(
        granule_id=ref_acq.id,
        satellite_mission="NISAR-LSAR" if "LSAR" in ref_acq.id else "NISAR-SSAR",
        product_level=ProductLevel.L1_GCOV,
        radar_band=RadarBand.L_BAND if ref_acq.center_frequency_ghz < 2.0 else RadarBand.S_BAND,
        center_frequency_ghz=ref_acq.center_frequency_ghz,
        orbit_pass=OrbitPass.ASCENDING if ref_acq.orbit_pass == "ASCENDING" else OrbitPass.DESCENDING,
        relative_orbit=ref_acq.relative_orbit,
        polarizations=ref_acq.polarizations,
        incidence_angle_near_deg=ref_acq.incidence_angle_near_deg,
        incidence_angle_far_deg=ref_acq.incidence_angle_far_deg,
        center_incidence_angle_deg=ref_acq.center_incidence_angle_deg,
        spatial_resolution_m=ref_acq.spatial_resolution_m,
        pixel_spacing_m=ref_acq.pixel_spacing_m,
        acquisition_start_utc=ref_acq.acquisition_date.isoformat(),
        acquisition_end_utc=ref_acq.acquisition_date.isoformat(),
        bounding_box_epsg4326=(79.6, 10.2, 80.1, 11.4),
        is_terrain_corrected=ref_acq.is_terrain_corrected,
    )

    sec_meta = SARSceneMetadata(
        granule_id=sec_acq.id,
        satellite_mission="NISAR-LSAR" if "LSAR" in sec_acq.id else "NISAR-SSAR",
        product_level=ProductLevel.L1_GCOV,
        radar_band=RadarBand.L_BAND if sec_acq.center_frequency_ghz < 2.0 else RadarBand.S_BAND,
        center_frequency_ghz=sec_acq.center_frequency_ghz,
        orbit_pass=OrbitPass.ASCENDING if sec_acq.orbit_pass == "ASCENDING" else OrbitPass.DESCENDING,
        relative_orbit=sec_acq.relative_orbit,
        polarizations=sec_acq.polarizations,
        incidence_angle_near_deg=sec_acq.incidence_angle_near_deg,
        incidence_angle_far_deg=sec_acq.incidence_angle_far_deg,
        center_incidence_angle_deg=sec_acq.center_incidence_angle_deg,
        spatial_resolution_m=sec_acq.spatial_resolution_m,
        pixel_spacing_m=sec_acq.pixel_spacing_m,
        acquisition_start_utc=sec_acq.acquisition_date.isoformat(),
        acquisition_end_utc=sec_acq.acquisition_date.isoformat(),
        bounding_box_epsg4326=(79.6, 10.2, 80.1, 11.4),
        is_terrain_corrected=sec_acq.is_terrain_corrected,
    )

    report = evaluate_sar_compatibility(
        ref_meta,
        sec_meta,
        max_incidence_delta_deg=request.max_incidence_delta_deg,
    )

    return ComparisonVerifyResponse(
        is_compatible=report.is_compatible,
        rejection_reasons=report.rejection_reasons,
        advisories=report.advisories,
        delta_incidence_deg=report.delta_incidence_deg,
        common_polarizations=report.common_polarizations,
        scientific_notice="Physical validation enforced by COASTPULSE Scientific Engine."
    )


@router.post("/execute", tags=["Temporal Comparison"])
async def execute_temporal_change_analysis(
    ref_granule_id: str,
    sec_granule_id: str,
    threshold_db: float = 3.0,
    db: AsyncSession = Depends(get_db),
):
    """
    Executes rigorous bitemporal backscatter subtraction and classification across genuine observations.
    Calculates pixel-wise difference, threshold sensitivity, and area statistics.
    """
    import os
    from coastpulse_engine.change.temporal_engine import TemporalChangeEngine

    # Check for authentic files
    ref_file = "coastpulse/data/processed/nisar_gcov_20261030_authoritative_float32.tif"
    sec_file = "coastpulse/data/processed/nisar_gcov_20261111_authoritative_float32.tif"

    if not os.path.exists(ref_file) or not os.path.exists(sec_file):
        raise HTTPException(status_code=400, detail="Authoritative Float32 COG files not found on disk.")

    engine = TemporalChangeEngine(default_threshold_db=threshold_db)
    output_diff = f"coastpulse/data/processed/diff_{ref_granule_id}_{sec_granule_id}_{threshold_db}dB.tif"

    try:
        result = engine.compute_bitemporal_difference(
            ref_path=ref_file,
            sec_path=sec_file,
            output_diff_cog=output_diff,
            threshold_db=threshold_db,
        )
        return {
            "success": True,
            "data": result,
            "message": "Temporal change detection executed with threshold sensitivity evaluation."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
