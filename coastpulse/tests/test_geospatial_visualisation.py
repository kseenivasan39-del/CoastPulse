import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client

def test_inspect_pixel_valid_coordinates(client):
    """Verifies physical microwave backscatter inspection within Nagapattinam granule bounds."""
    # Target coordinate: Nagapattinam coast (79.843°E, 10.767°N)
    res = client.get("/api/v1/geospatial/inspect-pixel?lon=79.843&lat=10.767")
    assert res.status_code == 200
    data = res.json()
    assert data["is_within_footprint"] is True
    assert data["radiometric_quantity"] == "gamma0_terrain_flattened"
    assert data["units"] == "decibels (dB)"

    measurements = data["measurements"]
    assert "hh_gamma0_db" in measurements
    # Physical backscatter should be within valid bounds (-50 dB to +10 dB)
    if data["is_valid_measurement"] and measurements["hh_gamma0_db"] is not None:
        assert -50.0 <= measurements["hh_gamma0_db"] <= 10.0

    provenance = data["provenance"]
    assert "170.9m" in provenance["resolution"]
    assert provenance["crs"] == "EPSG:4326"

def test_inspect_pixel_out_of_bounds(client):
    """Verifies that coordinates outside of the satellite footprint report out-of-bounds without fabrication."""
    # North Pole coordinates
    res = client.get("/api/v1/geospatial/inspect-pixel?lon=0.0&lat=85.0")
    assert res.status_code == 200
    data = res.json()
    assert data["is_within_footprint"] is False
    assert "outside" in data["message"].lower()

def test_raster_tile_endpoint(client):
    """Verifies XYZ slippy map tile rendering delivers valid image/png buffers."""
    res = client.get("/api/v1/geospatial/tile/10/512/512.png?layer_type=water")
    assert res.status_code == 200
    assert res.headers["content-type"] == "image/png"
    assert len(res.content) > 100

def test_render_overlay_endpoint(client):
    """Verifies dynamic raster overlay generation for water, vegetation, and change layers."""
    for layer in ["water", "vegetation", "change", "sar"]:
        res = client.get(f"/api/v1/geospatial/render-overlay?layer_type={layer}")
        assert res.status_code == 200
        assert res.headers["content-type"] == "image/png"
        assert len(res.content) > 500
