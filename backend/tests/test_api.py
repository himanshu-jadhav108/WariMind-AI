"""
API tests using FastAPI's TestClient (needs `fastapi` + `httpx` installed -
see requirements.txt). Not runnable in environments without those packages;
the pure-logic tests in test_core_logic.py cover the analytics/risk/decision
math independently of FastAPI.

Run with: pytest backend/tests/test_api.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest

fastapi = pytest.importorskip("fastapi")
from fastapi.testclient import TestClient  # noqa: E402
from app.main import app  # noqa: E402

client = TestClient(app)


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_status_shape():
    r = client.get("/api/status")
    assert r.status_code == 200
    body = r.json()
    for key in ["status", "mode", "compute_device", "detector_backend", "fps", "frame_count"]:
        assert key in body


def test_analytics_shape():
    r = client.get("/api/analytics")
    assert r.status_code == 200
    body = r.json()
    for key in ["people_count", "zone_density", "density_score", "flow", "trend"]:
        assert key in body


def test_risk_shape():
    r = client.get("/api/risk")
    assert r.status_code == 200
    assert "level" in r.json()


def test_recommendations_shape():
    r = client.get("/api/recommendations")
    assert r.status_code == 200
    assert "recommendation" in r.json()


def test_events_shape():
    r = client.get("/api/events")
    assert r.status_code == 200
    assert "events" in r.json()


def test_volunteer_acknowledge():
    r = client.post("/api/volunteer/acknowledge")
    assert r.status_code == 200
    assert r.json() == {"acknowledged": True}


def test_demo_reset():
    r = client.post("/api/demo/reset")
    assert r.status_code == 200
    assert r.json() == {"reset": True}
