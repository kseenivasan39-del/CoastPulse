"""
Scientific Validation & Uncertainty Quantification Module.
Computes confusion matrix, precision, recall, F1 score, IoU,
and uncertainty disclosures against independent ground reference masks.
"""

from typing import Dict, Any, Tuple
import numpy as np


class ScientificValidator:
    """
    Rigorously validates classification results against independent reference masks.
    Guarantees no accuracy metrics are manufactured without valid reference data.
    """

    @staticmethod
    def evaluate_binary_classification(
        classified_mask: np.ndarray,
        reference_mask: np.ndarray,
    ) -> Dict[str, Any]:
        """
        Computes standard remote-sensing validation metrics:
        - Confusion Matrix (TP, FP, TN, FN)
        - Precision, Recall, F1 Score
        - Intersection over Union (IoU / Jaccard Index)
        - Overall Accuracy (OA)
        """
        valid_pixels = (~np.isnan(classified_mask)) & (~np.isnan(reference_mask))
        c_bool = classified_mask[valid_pixels].astype(bool)
        r_bool = reference_mask[valid_pixels].astype(bool)

        if len(c_bool) == 0:
            raise ValueError("No valid overlapping pixels for scientific validation.")

        tp = int(np.sum(c_bool & r_bool))
        fp = int(np.sum(c_bool & ~r_bool))
        tn = int(np.sum(~c_bool & ~r_bool))
        fn = int(np.sum(~c_bool & r_bool))

        precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        f1 = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0
        iou = tp / (tp + fp + fn) if (tp + fp + fn) > 0 else 0.0
        accuracy = (tp + tn) / (tp + tn + fp + fn) if (tp + tn + fp + fn) > 0 else 0.0

        return {
            "confusion_matrix": {"TP": tp, "FP": fp, "TN": tn, "FN": fn},
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "f1_score": round(f1, 4),
            "iou": round(iou, 4),
            "overall_accuracy": round(accuracy, 4),
            "total_pixels_evaluated": int(len(c_bool)),
        }

    @staticmethod
    def assess_threshold_sensitivity(
        raster_db: np.ndarray,
        baseline_threshold_db: float = -16.5,
        delta_sweep: float = 1.0,
    ) -> Dict[str, Any]:
        """
        Assesses uncertainty by testing sensitivity to ±1.0 dB variation in threshold.
        """
        valid = raster_db[~np.isnan(raster_db)]
        count_baseline = int(np.sum(valid <= baseline_threshold_db))
        count_lower = int(np.sum(valid <= (baseline_threshold_db - delta_sweep)))
        count_upper = int(np.sum(valid <= (baseline_threshold_db + delta_sweep)))

        delta_pct = (
            abs(count_upper - count_lower) / count_baseline * 100
            if count_baseline > 0
            else 0.0
        )

        return {
            "baseline_threshold_db": baseline_threshold_db,
            "baseline_water_pixels": count_baseline,
            "lower_bound_pixels": count_lower,
            "upper_bound_pixels": count_upper,
            "sensitivity_uncertainty_pct": round(delta_pct, 2),
            "stability_status": "STABLE" if delta_pct < 15.0 else "SENSITIVE_TO_NOISE",
        }
