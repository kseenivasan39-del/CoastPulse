"""
SAR Radiometric Calibration and Decibel Transformation Engine.
Handles linear power to dB conversion, speckle suppression,
and radiometric histogram statistics.
"""

from typing import Dict, Any, Tuple
import numpy as np
from scipy.ndimage import uniform_filter


class RadiometricProcessor:
    """
    Transforms calibrated linear microwave power to decibel (dB) space
    and computes rigorous statistical distributions.
    """

    @staticmethod
    def linear_to_db(linear_power: np.ndarray, floor_linear: float = 1e-5) -> np.ndarray:
        """
        Converts radar backscatter power to decibels:
        gamma0_dB = 10 * log10(gamma0_linear)
        Applies physical noise floor clipping (default -50 dB).
        """
        clipped = np.clip(linear_power, floor_linear, None)
        with np.errstate(invalid="ignore", divide="ignore"):
            db_data = 10.0 * np.log10(clipped)
        return db_data.astype(np.float32)

    @staticmethod
    def db_to_linear(db_values: np.ndarray) -> np.ndarray:
        """
        Converts decibel values back to linear radar power:
        gamma0_linear = 10^(gamma0_dB / 10)
        """
        return np.power(10.0, db_values / 10.0).astype(np.float32)

    @staticmethod
    def refined_lee_filter(image_linear: np.ndarray, window_size: int = 5, enl: float = 4.8) -> np.ndarray:
        """
        Speckle suppression using spatial variance adaptive filtering (Lee Filter).
        Preserves sharp coastal interfaces and linear creek structures.
        """
        valid_mask = ~np.isnan(image_linear)
        filled = np.nan_to_num(image_linear, nan=0.0)

        mean = uniform_filter(filled, size=window_size)
        sqr_mean = uniform_filter(filled ** 2, size=window_size)
        var = np.maximum(sqr_mean - mean ** 2, 0.0)

        # Theoretical noise variance for multi-look SAR
        noise_var = (mean ** 2) / enl
        weight = np.where(var > 0, np.maximum((var - noise_var) / var, 0.0), 0.0)

        filtered = mean + weight * (filled - mean)
        filtered[~valid_mask] = np.nan
        return filtered.astype(np.float32)

    @staticmethod
    def compute_spatial_statistics(raster_db: np.ndarray) -> Dict[str, float]:
        """
        Extracts robust spatial backscatter statistics ignoring masked/invalid pixels.
        """
        valid = raster_db[~np.isnan(raster_db)]
        if len(valid) == 0:
            return {"mean": 0.0, "std": 0.0, "median": 0.0, "p10": 0.0, "p90": 0.0}

        return {
            "mean": float(np.mean(valid)),
            "std": float(np.std(valid)),
            "median": float(np.median(valid)),
            "p10": float(np.percentile(valid, 10)),
            "p90": float(np.percentile(valid, 90)),
            "valid_pixel_count": int(len(valid)),
        }
