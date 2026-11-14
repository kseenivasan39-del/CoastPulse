"""
Coastal Wetland Water Extent & Mangrove Canopy RVI Classifier.
Implements adaptive Otsu thresholding for water delineation and
Radar Vegetation Index (RVI) for mangrove canopy health monitoring.
"""

from typing import Dict, Any, Tuple
import numpy as np
from skimage.filters import threshold_otsu


class CoastalEcosystemAnalyzer:
    """
    Delineates surface water bodies and quantifies mangrove canopy structure.
    Does not infer a definitive ecological cause without supporting metadata.
    """

    @staticmethod
    def delineate_surface_water_otsu(
        hh_linear: np.ndarray,
        min_water_db: float = -28.0,
        max_water_db: float = -14.0,
    ) -> Tuple[np.ndarray, float]:
        """
        Adaptive Otsu bimodal separation on HH co-polarized backscatter.
        Specular reflection makes open water exhibit low backscatter (typically <= -16 dB).
        """
        valid = hh_linear[~np.isnan(hh_linear) & (hh_linear > 0)]
        if len(valid) == 0:
            return np.zeros_like(hh_linear, dtype=bool), -18.0

        hh_db = 10.0 * np.log10(valid)
        clipped_db = np.clip(hh_db, min_water_db, 0.0)

        try:
            computed_threshold_db = float(threshold_otsu(clipped_db))
            # Bound within physically reasonable radar water thresholds
            threshold_db = float(np.clip(computed_threshold_db, min_water_db, max_water_db))
        except Exception:
            threshold_db = -16.5

        full_db = 10.0 * np.log10(np.clip(hh_linear, 1e-5, None))
        water_mask = (full_db <= threshold_db) & (~np.isnan(hh_linear))

        return water_mask, round(threshold_db, 2)

    @staticmethod
    def calculate_radar_vegetation_index(
        hh_linear: np.ndarray,
        hv_linear: np.ndarray,
    ) -> np.ndarray:
        """
        Calculates Dual-Polarization Radar Vegetation Index (RVI):
        RVI = (4 * HV) / (HH + HV)
        Values range [0, 1]. Dense multi-layer mangrove canopy yields RVI > 0.6.
        """
        with np.errstate(invalid="ignore", divide="ignore"):
            denominator = hh_linear + hv_linear
            rvi = np.where(denominator > 0, (4.0 * hv_linear) / denominator, 0.0)
            rvi = np.clip(rvi, 0.0, 1.0)
            rvi[np.isnan(hh_linear) | np.isnan(hv_linear)] = np.nan
        return rvi.astype(np.float32)

    @staticmethod
    def estimate_area_hectares(pixel_count: int, pixel_spacing_m: float = 10.0) -> float:
        """
        Converts pixel counts to hectares based on pixel spacing:
        1 pixel at 10m x 10m = 100 m^2 = 0.01 hectares.
        """
        area_m2 = pixel_count * (pixel_spacing_m ** 2)
        return round(area_m2 / 10000.0, 2)
