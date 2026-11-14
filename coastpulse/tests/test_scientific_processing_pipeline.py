"""
Unit tests for Scientific Engine Processing Modules:
- Radiometric calibration (linear to dB and speckle filtering)
- Bitemporal change detection (log-ratio and spatial clustering)
- Coastal water extent delineation (Otsu thresholding)
- Radar Vegetation Index (RVI) calculation
- Validation metrics (confusion matrix, precision, recall, IoU)

NOTE: Small synthetic rasters are used exclusively for automated unit test assertions.
"""

import numpy as np
import pytest
from coastpulse_engine.calibration.radiometric import RadiometricProcessor
from coastpulse_engine.change.detector import ChangeDetector
from coastpulse_engine.water_vegetation.ecosystem import CoastalEcosystemAnalyzer
from coastpulse_engine.uncertainty.validation import ScientificValidator


def test_linear_to_db_conversion():
    # 0.01 linear = -20 dB, 1.0 linear = 0 dB
    linear = np.array([[0.01, 0.1], [1.0, 10.0]], dtype=np.float32)
    db = RadiometricProcessor.linear_to_db(linear)
    assert np.isclose(db[0, 0], -20.0, atol=0.1)
    assert np.isclose(db[0, 1], -10.0, atol=0.1)
    assert np.isclose(db[1, 0], 0.0, atol=0.1)
    assert np.isclose(db[1, 1], 10.0, atol=0.1)


def test_refined_lee_filter():
    # Synthetic noisy raster with constant mean signal
    np.random.seed(42)
    clean = np.ones((20, 20), dtype=np.float32) * 0.05
    noise = clean + np.random.normal(0, 0.01, (20, 20)).astype(np.float32)
    filtered = RadiometricProcessor.refined_lee_filter(noise, window_size=5, enl=4.8)

    assert filtered.shape == (20, 20)
    # Variance of filtered image should be significantly lower than noisy input
    assert np.nanstd(filtered) < np.nanstd(noise)


def test_log_ratio_change_detection():
    # Reference T1 vs Repeat T2
    ref = np.ones((30, 30), dtype=np.float32) * 0.1  # -10 dB
    sec = np.ones((30, 30), dtype=np.float32) * 0.1  # -10 dB

    # Introduce a 10x10 block of inundation in T2 (drop to 0.001 = -30 dB)
    sec[10:20, 10:20] = 0.001

    delta_db = ChangeDetector.calculate_log_ratio(ref, sec)
    # Background should have 0 dB change
    assert np.isclose(delta_db[0, 0], 0.0, atol=0.01)
    # Flooded patch should have -20 dB drop
    assert np.isclose(delta_db[15, 15], -20.0, atol=0.1)

    result = ChangeDetector.classify_significant_change(delta_db, threshold_db=2.5, min_cluster_pixels=10)
    assert result["num_loss_clusters"] == 1
    assert result["loss_pixel_count"] == 100


def test_coastal_water_otsu_and_rvi():
    # Synthetic land-sea scene: water at 0.001 (-30 dB), land at 0.08 (-11 dB)
    hh = np.ones((40, 40), dtype=np.float32) * 0.08
    hh[:20, :] = 0.001  # top half is water
    hv = hh * 0.2

    water_mask, threshold_db = CoastalEcosystemAnalyzer.delineate_surface_water_otsu(hh)
    assert threshold_db <= -14.0
    assert np.sum(water_mask) == 800  # Exactly top half (20 * 40)

    # Test RVI: RVI = 4*HV / (HH + HV)
    # With HV = 0.2*HH => 4*(0.2) / (1 + 0.2) = 0.8 / 1.2 = 0.667 (mangrove canopy)
    rvi = CoastalEcosystemAnalyzer.calculate_radar_vegetation_index(hh, hv)
    assert np.isclose(rvi[25, 25], 0.667, atol=0.01)


def test_scientific_validation_metrics():
    # Ground reference vs classification
    ref = np.zeros((10, 10), dtype=bool)
    ref[:5, :5] = True  # 25 True pixels

    pred = np.zeros((10, 10), dtype=bool)
    pred[:5, :4] = True  # 20 True pixels (20 TP, 0 FP, 5 FN)

    metrics = ScientificValidator.evaluate_binary_classification(pred, ref)
    assert metrics["confusion_matrix"]["TP"] == 20
    assert metrics["confusion_matrix"]["FP"] == 0
    assert metrics["confusion_matrix"]["FN"] == 5
    assert metrics["precision"] == 1.0
    assert metrics["recall"] == 0.8
    assert metrics["iou"] == 20 / 25
