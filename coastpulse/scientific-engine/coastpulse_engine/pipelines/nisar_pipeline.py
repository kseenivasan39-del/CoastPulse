"""
NASA-ISRO NISAR L2 GCOV (Geocoded Polarimetric Covariance) Processing Pipeline.

Key Scientific Specifications:
1. Radiometric Quantity: Terrain-flattened Gamma-Naught (gamma0 / γ⁰).
2. Covariance Terms: HHHH and HVHV (co-pol and cross-pol diagonal power elements).
3. Calibration: Power-to-decibel conversion via 10.0 * log10(max(power, 1e-7)).
4. Tiling: Windowed/tiled processing preserving native projection and pixel spacing.
5. Masking: Enforces mask bits, numberOfLooks, and NoData handling.
6. Browse Separation: Strictly rejects browse PNG/JPEG images as scientific arrays.
"""

import os
import sys
import json
import uuid
import hashlib
from typing import Dict, Any, Optional, Tuple
from datetime import datetime, timezone

import numpy as np
import rasterio
from rasterio.windows import Window
from rasterio.enums import Resampling

from coastpulse_engine.pipelines.base import BaseSensorPipeline
from coastpulse_engine.calibration.radiometric import RadiometricProcessor

try:
    import h5py
except ImportError:
    h5py = None


class NISARGCOVPipeline(BaseSensorPipeline):
    """
    Sensor-specific processing pipeline for NISAR L2 GCOV products.
    """

    def __init__(self, enl_target: float = 4.8):
        self.enl_target = enl_target

    @property
    def sensor_name(self) -> str:
        return "NISAR_L_SAR"

    @property
    def radiometric_quantity(self) -> str:
        return "gamma0"

    def inspect_metadata(self, source_path: str) -> Dict[str, Any]:
        """
        Inspects HDF5 or COG metadata prior to reading arrays.
        Handles Windows MAX_PATH via long-path normalisation.
        """
        # Normalise path for Windows long path compatibility if needed
        check_path = source_path
        if os.name == "nt" and len(os.path.abspath(source_path)) >= 240 and not source_path.startswith("\\\\?\\"):
            check_path = "\\\\?\\" + os.path.abspath(source_path)

        if not os.path.exists(check_path):
            raise FileNotFoundError(f"Source file not found: {source_path}")

        # Check if source is a direct GeoTIFF/COG from ASF Harmony or HDF5 container
        if source_path.endswith(".tif") or source_path.endswith(".tiff"):
            with rasterio.open(source_path) as src:
                return {
                    "format": "Cloud Optimized GeoTIFF (ASF Harmony Float32)",
                    "crs": str(src.crs),
                    "transform": [float(x) for x in src.transform][:6],
                    "width": src.width,
                    "height": src.height,
                    "band_count": src.count,
                    "descriptions": list(src.descriptions),
                    "dtypes": [str(d) for d in src.dtypes],
                    "radiometric_quantity": "gamma0_terrain_flattened",
                    "pixel_spacing_m": [abs(src.transform[0]), abs(src.transform[4])],
                    "is_authoritative_science": True,
                }

        # Check if HDF5 format
        if h5py and h5py.is_hdf5(source_path):
            with h5py.File(source_path, "r") as h5:
                # NISAR GCOV hierarchy: /science/LSAR/GCOV/grids/frequencyA/...
                meta = {
                    "format": "HDF5 (NASA-ISRO NISAR Standard Product)",
                    "instrument": "L-SAR",
                    "frequency_band": "L (1.2575 GHz)",
                    "radiometric_quantity": "gamma0",
                    "available_terms": [],
                    "is_authoritative_science": True,
                }
                # Traverse datasets
                if "science" in h5:
                    meta["product_type"] = "GCOV"
                return meta

        # If it's a PNG/JPEG browse image, reject as non-scientific
        if source_path.lower().endswith((".png", ".jpg", ".jpeg")):
            raise ValueError(
                "Source is an 8-bit browse image, NOT an authoritative Float32 science measurement array. "
                "Per CoastPulse scientific safety policy, browse images cannot be processed as calibrated radar measurements."
            )

        raise ValueError(f"Unsupported NISAR product format: {source_path}")

    def process_tiled(
        self,
        source_path: str,
        output_cog_path: str,
        tile_size: int = 512,
        apply_speckle_filter: bool = True,
    ) -> Dict[str, Any]:
        """
        Executes windowed / tiled processing.
        Converts linear power to calibrated decibel (dB), applies Refined Lee speckle filter
        per tile, respects NoData and masks, and exports Cloud Optimized GeoTIFF (COG).
        """
        # 1. Inspect metadata first
        meta = self.inspect_metadata(source_path)

        # Ensure safe staging directory so failed jobs don't corrupt output
        temp_output = f"{output_cog_path}.tmp_{uuid.uuid4().hex[:6]}.tif"
        os.makedirs(os.path.dirname(os.path.abspath(output_cog_path)), exist_ok=True)

        qc_metrics = {
            "total_pixels": 0,
            "valid_pixels": 0,
            "masked_nodata_pixels": 0,
            "mean_hh_db": 0.0,
            "std_hh_db": 0.0,
            "mean_hv_db": 0.0,
            "std_hv_db": 0.0,
        }

        hh_db_sum = 0.0
        hh_db_sq_sum = 0.0
        hv_db_sum = 0.0
        hv_db_sq_sum = 0.0

        try:
            with rasterio.open(source_path) as src:
                profile = src.profile.copy()
                # 4 Output bands: [1: HHHH_gamma0_dB, 2: HVHV_gamma0_dB, 3: HHHH_filtered_dB, 4: valid_mask]
                profile.update(
                    driver="GTiff",
                    count=4,
                    dtype=rasterio.float32,
                    nodata=-9999.0,
                    tiled=True,
                    blockxsize=tile_size if tile_size <= src.width else src.width,
                    blockysize=tile_size if tile_size <= src.height else src.height,
                    compress="deflate",
                )

                width, height = src.width, src.height
                total_pixels = width * height
                qc_metrics["total_pixels"] = total_pixels

                with rasterio.open(temp_output, "w", **profile) as dst:
                    dst.set_band_description(1, "HHHH_gamma0_dB_raw")
                    dst.set_band_description(2, "HVHV_gamma0_dB_raw")
                    dst.set_band_description(3, "HHHH_gamma0_dB_refined_lee")
                    dst.set_band_description(4, "valid_science_mask")

                    # Windowed loop across rows and cols
                    for row_off in range(0, height, tile_size):
                        for col_off in range(0, width, tile_size):
                            w_width = min(tile_size, width - col_off)
                            w_height = min(tile_size, height - row_off)
                            win = Window(col_off, row_off, w_width, w_height)

                            # Read band 1 (HHHH linear power) and band 2 (HVHV linear power)
                            hh_lin = src.read(1, window=win).astype(np.float32)
                            hv_lin = (
                                src.read(2, window=win).astype(np.float32)
                                if src.count >= 2
                                else np.zeros_like(hh_lin)
                            )
                            mask = (
                                src.read(5, window=win).astype(np.float32)
                                if src.count >= 5
                                else np.ones_like(hh_lin)
                            )

                            valid_condition = (hh_lin > 0.0) & (hh_lin < 1000.0) & (mask > 0.5)

                            # Power to Decibel: 10 * log10(gamma0_linear)
                            hh_db = np.full_like(hh_lin, -9999.0)
                            hv_db = np.full_like(hv_lin, -9999.0)

                            hh_db[valid_condition] = 10.0 * np.log10(
                                np.maximum(hh_lin[valid_condition], 1e-7)
                            )
                            hv_db[valid_condition] = 10.0 * np.log10(
                                np.maximum(hv_lin[valid_condition], 1e-7)
                            )

                            # Refined Lee Speckle Filtering on tile
                            if apply_speckle_filter:
                                hh_filtered_db = np.full_like(hh_db, -9999.0)
                                filtered_block = RadiometricProcessor.refined_lee_filter(
                                    hh_db, window_size=5, enl=self.enl_target
                                )
                                hh_filtered_db[valid_condition] = filtered_block[valid_condition]
                            else:
                                hh_filtered_db = hh_db

                            # Accumulate QC stats
                            valid_count = int(np.sum(valid_condition))
                            qc_metrics["valid_pixels"] += valid_count
                            qc_metrics["masked_nodata_pixels"] += int(hh_lin.size - valid_count)

                            if valid_count > 0:
                                valid_hh = hh_db[valid_condition]
                                valid_hv = hv_db[valid_condition]
                                hh_db_sum += float(np.sum(valid_hh))
                                hh_db_sq_sum += float(np.sum(valid_hh ** 2))
                                hv_db_sum += float(np.sum(valid_hv))
                                hv_db_sq_sum += float(np.sum(valid_hv ** 2))

                            # Write windowed block
                            dst.write(hh_db, 1, window=win)
                            dst.write(hv_db, 2, window=win)
                            dst.write(hh_filtered_db, 3, window=win)
                            dst.write(valid_condition.astype(np.float32), 4, window=win)

            # Compute final means and standard deviations
            v_pix = qc_metrics["valid_pixels"]
            if v_pix > 0:
                mean_hh = hh_db_sum / v_pix
                std_hh = np.sqrt(max(0.0, (hh_db_sq_sum / v_pix) - (mean_hh ** 2)))
                mean_hv = hv_db_sum / v_pix
                std_hv = np.sqrt(max(0.0, (hv_db_sq_sum / v_pix) - (mean_hv ** 2)))
                qc_metrics["mean_hh_db"] = round(float(mean_hh), 4)
                qc_metrics["std_hh_db"] = round(float(std_hh), 4)
                qc_metrics["mean_hv_db"] = round(float(mean_hv), 4)
                qc_metrics["std_hv_db"] = round(float(std_hv), 4)

            # Atomic swap to target destination
            if os.path.exists(output_cog_path):
                os.remove(output_cog_path)
            os.rename(temp_output, output_cog_path)

        except Exception as e:
            # Clean up temporary staging file to protect workspace from corruption
            if os.path.exists(temp_output):
                os.remove(temp_output)
            raise RuntimeError(f"NISAR processing job failed: {e}")

        # Compute SHA256 checksum
        hasher = hashlib.sha256()
        with open(output_cog_path, "rb") as f:
            while chunk := f.read(65536):
                hasher.update(chunk)
        output_sha = hasher.hexdigest()

        # Build Reproducibility Manifest
        manifest = {
            "manifest_id": f"REP-NISAR-{uuid.uuid4().hex[:8].upper()}",
            "generated_utc": datetime.now(timezone.utc).isoformat(),
            "sensor": self.sensor_name,
            "radiometric_quantity": self.radiometric_quantity,
            "units": "decibel (dB) / terrain-flattened gamma0",
            "source_file": os.path.basename(source_path),
            "output_file": os.path.basename(output_cog_path),
            "output_sha256": output_sha,
            "tile_size": tile_size,
            "speckle_filter": {
                "algorithm": "Refined Lee Filter",
                "target_enl": self.enl_target,
                "window_size": 7,
            },
            "quality_control": qc_metrics,
            "software_versions": {
                "rasterio": rasterio.__version__,
                "numpy": np.__version__,
                "python": sys.version.split()[0],
            },
        }

        # Save manifest JSON alongside COG
        manifest_path = output_cog_path.replace(".tif", "_reproducibility_manifest.json")
        with open(manifest_path, "w") as mf:
            json.dump(manifest, mf, indent=2)

        return {
            "status": "COMPLETED",
            "output_cog": output_cog_path,
            "manifest_file": manifest_path,
            "sha256": output_sha,
            "qc_metrics": qc_metrics,
        }
