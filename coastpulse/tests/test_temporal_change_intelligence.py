import pytest
import os
import json
import rasterio
import numpy as np
from datetime import datetime, timezone
from coastpulse_engine.change.temporal_engine import TemporalChangeEngine

REF_COG = "coastpulse/data/processed/nisar_gcov_20261030_authoritative_float32.tif"
SEC_COG = "coastpulse/data/processed/nisar_gcov_20261111_authoritative_float32.tif"

def test_raster_alignment_verification():
    engine = TemporalChangeEngine()
    meta = engine.verify_raster_alignment(REF_COG, SEC_COG)

    assert meta["crs"] == "EPSG:4326"
    assert meta["width"] == 320
    assert meta["height"] == 782
    assert meta["pixel_area_m2"] > 0
    assert meta["pixel_area_ha"] > 0

def test_misaligned_raster_rejection(tmp_path):
    """Verifies that unaligned or mismatched rasters are strictly rejected."""
    engine = TemporalChangeEngine()
    bad_raster = str(tmp_path / "bad_dims.tif")

    # Create dummy raster with different dimensions (100x100)
    with rasterio.open(
        bad_raster,
        "w",
        driver="GTiff",
        width=100,
        height=100,
        count=1,
        dtype=rasterio.float32,
        crs="EPSG:4326",
        transform=rasterio.transform.from_bounds(79.0, 10.0, 80.0, 11.0, 100, 100),
    ) as dst:
        dst.write(np.zeros((100, 100), dtype=np.float32), 1)

    with pytest.raises(ValueError, match="Raster grid geometry mismatch"):
        engine.verify_raster_alignment(REF_COG, bad_raster)

def test_numerical_bitemporal_difference_with_known_arrays(tmp_path):
    """
    Independent numerical test with known synthetic arrays:
    - Array 1: constant -15.0 dB
    - Array 2: top half -10.0 dB (+5 dB shift -> INCREASE), bottom half -20.0 dB (-5 dB shift -> DECREASE)
    """
    engine = TemporalChangeEngine(default_threshold_db=3.0)
    t1_path = str(tmp_path / "synth_t1.tif")
    t2_path = str(tmp_path / "synth_t2.tif")
    out_diff = str(tmp_path / "synth_diff.tif")

    profile = {
        "driver": "GTiff",
        "width": 10,
        "height": 10,
        "count": 1,
        "dtype": rasterio.float32,
        "crs": "EPSG:32644",
        "transform": rasterio.transform.from_bounds(0, 0, 100, 100, 10, 10),
        "nodata": -9999.0,
    }

    arr1 = np.full((10, 10), -15.0, dtype=np.float32)
    arr2 = np.full((10, 10), -15.0, dtype=np.float32)
    arr2[:5, :] = -10.0  # +5 dB shift
    arr2[5:, :] = -20.0  # -5 dB shift

    with rasterio.open(t1_path, "w", **profile) as d1:
        d1.write(arr1, 1)
    with rasterio.open(t2_path, "w", **profile) as d2:
        d2.write(arr2, 1)

    result = engine.compute_bitemporal_difference(
        ref_path=t1_path,
        sec_path=t2_path,
        output_diff_cog=out_diff,
        threshold_db=3.0,
    )

    stats = result["statistics"]
    assert stats["total_pixels"] == 100
    assert stats["valid_pixels"] == 100
    assert stats["classes"]["increase"]["pixels"] == 50
    assert stats["classes"]["decrease"]["pixels"] == 50
    assert stats["classes"]["stable"]["pixels"] == 0
    assert stats["classes"]["increase"]["pct"] == 50.0
    assert stats["classes"]["decrease"]["pct"] == 50.0

    # Verify output raster
    with rasterio.open(out_diff) as ds:
        assert ds.count == 3
        delta_band = ds.read(1)
        class_band = ds.read(2)
        assert np.allclose(delta_band[:5, :], 5.0)
        assert np.allclose(delta_band[5:, :], -5.0)
        assert np.all(class_band[:5, :] == 2)  # Increase class
        assert np.all(class_band[5:, :] == 3)  # Decrease class

def test_genuine_nisar_change_detection_and_sensitivity(tmp_path):
    """
    Integration test using genuine NASA-ISRO NISAR repeat-pass observations for Nagapattinam.
    Evaluates sensitivity shifts and physical backscatter boundaries.
    """
    engine = TemporalChangeEngine(default_threshold_db=3.0)
    out_diff = str(tmp_path / "nisar_nagapattinam_diff_3db.tif")

    result = engine.compute_bitemporal_difference(
        ref_path=REF_COG,
        sec_path=SEC_COG,
        output_diff_cog=out_diff,
        threshold_db=3.0,
        band_index=3,  # Band 3 is HHHH_gamma0_dB
    )

    assert result["status"] == "COMPLETED"
    assert os.path.exists(out_diff)
    stats = result["statistics"]
    assert stats["valid_pixels"] == 250240

    # Stable percentage should dominate (> 90%) for 12-day repeat pass
    assert stats["classes"]["stable"]["pct"] > 90.0

    # Sensitivity dictionary must contain evaluations across threshold increments
    assert "1.5_dB" in stats["threshold_sensitivity"]
    assert "3.0_dB" in stats["threshold_sensitivity"]
    assert "4.0_dB" in stats["threshold_sensitivity"]

    # Higher threshold -> lower change percentage
    pct_1_5 = stats["threshold_sensitivity"]["1.5_dB"]["increase_pct"]
    pct_3_0 = stats["threshold_sensitivity"]["3.0_dB"]["increase_pct"]
    pct_4_0 = stats["threshold_sensitivity"]["4.0_dB"]["increase_pct"]
    assert pct_1_5 >= pct_3_0 >= pct_4_0

    # Verify manifest file
    manifest_path = result["manifest_file"]
    assert os.path.exists(manifest_path)
    with open(manifest_path, "r") as mf:
        manifest = json.load(mf)
        assert "legend" in manifest
        assert manifest["statistics"]["valid_pixels"] == 250240

def test_multi_temporal_trend_trajectory(tmp_path):
    """Tests multi-date (>=3) time-series analysis."""
    engine = TemporalChangeEngine()
    # Create 3 identical aligned rasters
    t1 = REF_COG
    t2 = SEC_COG
    t3 = str(tmp_path / "nisar_t3.tif")

    with rasterio.open(REF_COG) as src:
        prof = src.profile.copy()
        with rasterio.open(t3, "w", **prof) as dst:
            dst.write(src.read())

    dates = [
        datetime(2026, 10, 30, tzinfo=timezone.utc),
        datetime(2026, 11, 11, tzinfo=timezone.utc),
        datetime(2026, 11, 23, tzinfo=timezone.utc),
    ]

    res = engine.compute_multi_temporal_trend([t1, t2, t3], dates, band_index=3)
    assert res["num_acquisitions"] == 3
    assert len(res["temporal_series"]) == 3
    assert "temporal_stability_index" in res
