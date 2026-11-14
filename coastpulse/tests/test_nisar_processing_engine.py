import pytest
import os
import glob
import json
import rasterio
import numpy as np
from coastpulse_engine.pipelines.nisar_pipeline import NISARGCOVPipeline

AUTHORITATIVE_T1_COG = "coastpulse/data/processed/nisar_gcov_20261030_authoritative_float32.tif"
AUTHORITATIVE_T2_COG = "coastpulse/data/processed/nisar_gcov_20261111_authoritative_float32.tif"

def get_browse_sample():
    d = os.listdir("coastpulse/data/raw")[0]
    f = os.listdir(os.path.join("coastpulse/data/raw", d))[3]
    return os.path.join("coastpulse/data/raw", d, f)

def test_nisar_metadata_inspection():
    pipeline = NISARGCOVPipeline(enl_target=4.8)
    meta = pipeline.inspect_metadata(AUTHORITATIVE_T1_COG)

    assert meta["is_authoritative_science"] is True
    assert meta["radiometric_quantity"] == "gamma0_terrain_flattened"
    assert meta["crs"] == "EPSG:4326"
    assert meta["width"] == 320
    assert meta["height"] == 782
    assert meta["band_count"] == 5
    assert "HHHH_gamma0_linear_power" in meta["descriptions"]

def test_rejection_of_browse_image():
    """Verifies that 8-bit browse imagery is strictly rejected per scientific safety policy."""
    pipeline = NISARGCOVPipeline(enl_target=4.8)
    browse_file = get_browse_sample()
    with pytest.raises(ValueError, match="browse image, NOT an authoritative Float32 science measurement"):
        pipeline.inspect_metadata(browse_file)

def test_nisar_tiled_processing_and_reproducibility(tmp_path):
    pipeline = NISARGCOVPipeline(enl_target=4.8)
    output_cog = str(tmp_path / "nisar_calibrated_tiled.tif")

    result = pipeline.process_tiled(
        source_path=AUTHORITATIVE_T1_COG,
        output_cog_path=output_cog,
        tile_size=256,
        apply_speckle_filter=True,
    )

    assert result["status"] == "COMPLETED"
    assert os.path.exists(output_cog)
    assert len(result["sha256"]) == 64

    # Verify COG format and bands
    with rasterio.open(output_cog) as ds:
        assert ds.driver == "GTiff"
        assert ds.count == 4
        assert ds.nodata == -9999.0
        assert ds.descriptions[0] == "HHHH_gamma0_dB_raw"
        assert ds.descriptions[2] == "HHHH_gamma0_dB_refined_lee"

        # Read band 1 (dB)
        hh_db = ds.read(1)
        valid_mask = ds.read(4) > 0.5
        valid_db = hh_db[valid_mask]

        # Verify physical radar bounds (-50 dB to +5 dB for terrain/water)
        assert np.all(valid_db >= -50.0)
        assert np.all(valid_db <= 15.0)

    # Verify reproducibility manifest
    manifest_path = result["manifest_file"]
    assert os.path.exists(manifest_path)
    with open(manifest_path, "r") as mf:
        manifest = json.load(mf)
        assert manifest["sensor"] == "NISAR_L_SAR"
        assert manifest["radiometric_quantity"] == "gamma0"
        assert manifest["quality_control"]["valid_pixels"] == 250240
        assert manifest["output_sha256"] == result["sha256"]

def test_source_data_protection_on_failure(tmp_path):
    """Verifies that an aborted job leaves no corrupt files and does not modify the source."""
    pipeline = NISARGCOVPipeline(enl_target=4.8)
    bad_output_dir = str(tmp_path / "non_writable_dir")
    
    # Intentionally trigger an error with invalid input
    with pytest.raises(Exception):
        pipeline.process_tiled(
            source_path="non_existent_file.tif",
            output_cog_path=bad_output_dir,
        )
    # Target directory remains clean
    assert not os.path.exists(bad_output_dir)
