"""
Unit tests for backend health check endpoint.
"""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "operational"
    assert data["service"] == "COASTPULSE"
    assert "Nagapattinam" in data["target_aoi"]
    assert len(data["bounding_box"]) == 4
