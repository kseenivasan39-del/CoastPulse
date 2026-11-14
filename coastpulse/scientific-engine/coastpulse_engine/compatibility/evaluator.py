"""
SAR Cross-Scene Compatibility Engine.
Strictly checks physical and geometric comparability before temporal change analysis.
"""

from typing import List
from pydantic import BaseModel
from coastpulse_engine.metadata.models import SARSceneMetadata


class CompatibilityReport(BaseModel):
    is_compatible: bool
    rejection_reasons: List[str]
    advisories: List[str]
    delta_incidence_deg: float
    common_polarizations: List[str]


def evaluate_sar_compatibility(
    reference: SARSceneMetadata,
    secondary: SARSceneMetadata,
    max_incidence_delta_deg: float = 2.0,
) -> CompatibilityReport:
    """
    Evaluates if two SAR scenes are scientifically valid for temporal change detection.
    Never assume comparability without matching orbit geometry, frequency, and polarization.
    """
    rejections = []
    advisories = []

    # 1. Frequency Band Match
    if reference.radar_band != secondary.radar_band:
        rejections.append(
            f"Frequency mismatch: Reference is {reference.radar_band}-band ({reference.center_frequency_ghz:.2f} GHz), "
            f"secondary is {secondary.radar_band}-band ({secondary.center_frequency_ghz:.2f} GHz). "
            f"Different radar wavelengths interact fundamentally differently with target canopy and soil."
        )

    # 2. Orbit Direction
    if reference.orbit_pass != secondary.orbit_pass:
        rejections.append(
            f"Orbit geometry conflict: Reference is {reference.orbit_pass}, secondary is {secondary.orbit_pass}. "
            f"Opposite look directions invert shadow and layover effects along coastal features."
        )

    # 3. Relative Orbit / Track
    if reference.relative_orbit != secondary.relative_orbit:
        advisories.append(
            f"Different relative orbits (Track {reference.relative_orbit} vs {secondary.relative_orbit}). "
            f"Ensure rigorous radiometric terrain flattening (Gamma0) is used."
        )

    # 4. Incidence Angle Shift
    delta_inc = abs(reference.center_incidence_angle_deg - secondary.center_incidence_angle_deg)
    if delta_inc > max_incidence_delta_deg:
        rejections.append(
            f"Center incidence angle difference ({delta_inc:.2f}°) exceeds acceptable threshold "
            f"({max_incidence_delta_deg:.2f}°). Angular backscatter variation will distort true surface change."
        )

    # 5. Polarization Overlap
    common_pols = list(set(reference.polarizations).intersection(set(secondary.polarizations)))
    if not common_pols:
        rejections.append(
            f"No overlapping polarizations. Reference: {reference.polarizations}, "
            f"Secondary: {secondary.polarizations}."
        )

    # 6. Terrain Correction Check
    if not reference.is_terrain_corrected or not secondary.is_terrain_corrected:
        rejections.append("Both scenes must be Radiometrically Terrain Corrected (GCOV or RTC).")

    is_compatible = len(rejections) == 0

    return CompatibilityReport(
        is_compatible=is_compatible,
        rejection_reasons=rejections,
        advisories=advisories,
        delta_incidence_deg=round(delta_inc, 3),
        common_polarizations=sorted(common_pols),
    )
