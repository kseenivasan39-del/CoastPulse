"""
Bitemporal Change Detection & Spatial Cluster Engine.
Calculates pixel-wise difference, log-ratio (dB), thresholding,
and spatial clustering of significant changes.
"""

from typing import Dict, Any, Tuple
import numpy as np
from skimage.morphology import remove_small_objects
from scipy.ndimage import label


class ChangeDetector:
    """
    Rigorously detects surface changes between two calibrated repeat-pass SAR rasters.
    """

    @staticmethod
    def calculate_log_ratio(
        ref_linear: np.ndarray,
        sec_linear: np.ndarray,
    ) -> np.ndarray:
        """
        Calculates the logarithmic ratio of backscatter power:
        delta_dB = 10 * log10(sec_linear / ref_linear) = sec_dB - ref_dB
        """
        with np.errstate(invalid="ignore", divide="ignore"):
            ratio = sec_linear / ref_linear
            delta_db = 10.0 * np.log10(ratio)
        return delta_db.astype(np.float32)

    @staticmethod
    def classify_significant_change(
        delta_db: np.ndarray,
        threshold_db: float = 2.5,
        min_cluster_pixels: int = 15,
    ) -> Dict[str, Any]:
        """
        Classifies change into positive gain (e.g. roughing/inundation),
        negative loss (e.g. drying/canopy drop), and stable baseline.
        Spatial filtering removes isolated speckle false-alarms.
        """
        gain_mask = delta_db > threshold_db
        loss_mask = delta_db < -threshold_db

        # Morphological spatial filtering to remove isolated speckle blips
        filtered_gain = remove_small_objects(gain_mask, min_size=min_cluster_pixels)
        filtered_loss = remove_small_objects(loss_mask, min_size=min_cluster_pixels)

        # Count clustered features
        labeled_gain, num_gain_clusters = label(filtered_gain)
        labeled_loss, num_loss_clusters = label(filtered_loss)

        total_pixels = int(np.sum(~np.isnan(delta_db)))
        gain_pixels = int(np.sum(filtered_gain))
        loss_pixels = int(np.sum(filtered_loss))

        return {
            "gain_mask": filtered_gain,
            "loss_mask": filtered_loss,
            "num_gain_clusters": int(num_gain_clusters),
            "num_loss_clusters": int(num_loss_clusters),
            "gain_pixel_count": gain_pixels,
            "loss_pixel_count": loss_pixels,
            "total_evaluated_pixels": total_pixels,
            "gain_percentage": round((gain_pixels / total_pixels) * 100, 2) if total_pixels else 0.0,
            "loss_percentage": round((loss_pixels / total_pixels) * 100, 2) if total_pixels else 0.0,
        }
