"""
Abstract Base Sensor Processing Pipeline for Earth Observation Data.
Ensures sensor-specific radiometric, polarimetric and geometric handling.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, Generator, Tuple
import numpy as np


class BaseSensorPipeline(ABC):
    """
    Abstract contract for sensor-specific calibration, speckle filtering,
    tiled processing and quality control.
    """

    @property
    @abstractmethod
    def sensor_name(self) -> str:
        """Sensor or instrument name (e.g. 'NISAR_L_SAR', 'SENTINEL_1_C_SAR')."""
        pass

    @property
    @abstractmethod
    def radiometric_quantity(self) -> str:
        """Physical radiometric quantity produced (e.g. 'gamma0', 'sigma0', 'beta0')."""
        pass

    @abstractmethod
    def inspect_metadata(self, source_path: str) -> Dict[str, Any]:
        """
        Inspects raw file metadata, projection, grid resolution, and variables
        before reading or converting data arrays.
        """
        pass

    @abstractmethod
    def process_tiled(
        self,
        source_path: str,
        output_cog_path: str,
        tile_size: int = 512,
        apply_speckle_filter: bool = True,
    ) -> Dict[str, Any]:
        """
        Executes windowed / tiled processing on CPU without loading entire rasters into memory.
        Returns execution summary with QC metrics, provenance and SHA256 checksums.
        """
        pass
