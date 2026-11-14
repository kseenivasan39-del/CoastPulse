"""
Unit tests for Scientific Engine SAR compatibility evaluator.
Verifies that physical constraints (frequency, orbit, incidence angles) are rigorously checked.
"""

import pytest
from coastpulse_engine.metadata.models import (
    SARSceneMetadata,
    ProductLevel,
    RadarBand,
    OrbitPass,
)
from coastpulse_engine.compatibility.evaluator import evaluate_sar_compatibility


@pytest.fixture
def base_nisar_scene():
    return SARSceneMetadata(
        granule_id="NISAR_L1_PR_GCOV_001_020_A_129_20260401T003000",
        satellite_mission="NISAR-LSAR",
        product_level=ProductLevel.L1_GCOV,
        radar_band=RadarBand.L_BAND,
        center_frequency_ghz=1.257,
        orbit_pass=OrbitPass.ASCENDING,
        relative_orbit=129,
        polarizations=["HH", "HV"],
        incidence_angle_near_deg=34.0,
        incidence_angle_far_deg=41.0,
        center_incidence_angle_deg=37.5,
        spatial_resolution_m=10.0,
        pixel_spacing_m=10.0,
        acquisition_start_utc="2026-04-01T00:30:00Z",
        acquisition_end_utc="2026-04-01T00:30:35Z",
        bounding_box_epsg4326=(79.6, 10.2, 80.1, 11.4),
        is_terrain_corrected=True,
    )


def test_identical_scenes_compatibility(base_nisar_scene):
    # Comparing scene with compatible repeat pass
    secondary = base_nisar_scene.model_copy(
        update={
            "granule_id": "NISAR_L1_PR_GCOV_001_020_A_129_20260413T003000",
            "acquisition_start_utc": "2026-04-13T00:30:00Z",
            "acquisition_end_utc": "2026-04-13T00:30:35Z",
        }
    )
    report = evaluate_sar_compatibility(base_nisar_scene, secondary)
    assert report.is_compatible is True
    assert len(report.rejection_reasons) == 0
    assert report.common_polarizations == ["HH", "HV"]


def test_frequency_mismatch_rejection(base_nisar_scene):
    # S-band secondary should be rejected when compared to L-band
    s_band_scene = base_nisar_scene.model_copy(
        update={
            "radar_band": RadarBand.S_BAND,
            "center_frequency_ghz": 3.200,
        }
    )
    report = evaluate_sar_compatibility(base_nisar_scene, s_band_scene)
    assert report.is_compatible is False
    assert any("Frequency mismatch" in r for r in report.rejection_reasons)


def test_orbit_direction_rejection(base_nisar_scene):
    # Descending pass cannot be directly compared to Ascending
    descending_scene = base_nisar_scene.model_copy(
        update={"orbit_pass": OrbitPass.DESCENDING}
    )
    report = evaluate_sar_compatibility(base_nisar_scene, descending_scene)
    assert report.is_compatible is False
    assert any("Orbit geometry conflict" in r for r in report.rejection_reasons)


def test_incidence_angle_exceedance(base_nisar_scene):
    # Shift center incidence angle from 37.5° to 41.0° (delta 3.5° > 2.0° threshold)
    steep_angle_scene = base_nisar_scene.model_copy(
        update={"center_incidence_angle_deg": 41.0}
    )
    report = evaluate_sar_compatibility(base_nisar_scene, steep_angle_scene)
    assert report.is_compatible is False
    assert any("incidence angle difference" in r for r in report.rejection_reasons)
