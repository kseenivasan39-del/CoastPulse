"""
Unit tests for NISAR Ingestion Client and ASF Metadata Parser.
"""

import pytest
from coastpulse_engine.metadata.nisar_ingestion import NISARIngestionClient


def test_nisar_filename_parser():
    client = NISARIngestionClient()
    filename = "NISAR_L2_PR_GCOV_035_084_A_007_4005_DHDH_A_20261111T001554_20261111T001628_P05036_N_F_J_001.h5"
    meta = client.parse_nisar_filename(filename)

    assert meta["mission"] == "NISAR"
    assert meta["level"] == "L2"
    assert meta["product_type"] == "GCOV"
    assert meta["cycle_number"] == 35
    assert meta["relative_orbit"] == 84
    assert meta["pass_direction"] == "ASCENDING"
    assert meta["frame_number"] == 7
    assert meta["pol_code"] == "DHDH"
    assert "20261111" in meta["start_utc"]


@pytest.mark.asyncio
async def test_asf_cmr_search_nagapattinam():
    client = NISARIngestionClient()
    granules = await client.search_granules(point_lon=79.843, point_lat=10.767, processing_level="GCOV", max_results=5)
    
    # Must retrieve genuine NISAR granules from ASF
    assert len(granules) > 0
    first = granules[0]
    assert "NISAR" in first.granule_name
    assert first.product_level == "GCOV"
    assert first.relative_orbit in [84, 149]
    assert "h5" in first.download_url
    assert first.footprint_wkt.startswith("POLYGON")
