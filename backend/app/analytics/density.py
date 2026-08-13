"""
Crowd density analytics with Polygon-based Zone mapping & temporal smoothing.

Map detections to polygon zones using OpenCV pointPolygonTest on normalized coordinates.
Computes:
  - people count per polygon zone
  - density level per zone (LOW/MEDIUM/HIGH/CRITICAL)
  - normalized 0-100 density score for risk engine
  - Gaussian density heatmap
"""
from collections import deque
import json
import os
import cv2
import numpy as np

from app.config import settings

_ZONES_CACHE = None
_ZONES_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "config", "zones.json")
_HISTORY_WINDOW = deque(maxlen=5)  # Rolling window for temporal count smoothing


def load_zones() -> list[dict]:
    global _ZONES_CACHE
    if os.path.exists(_ZONES_PATH):
        try:
            with open(_ZONES_PATH, "r", encoding="utf-8") as f:
                _ZONES_CACHE = json.load(f)
                return _ZONES_CACHE
        except Exception:
            pass

    # Default fallback polygon configuration
    _ZONES_CACHE = [
        {
            "id": "ZONE A",
            "name": "Zone A",
            "description": "Upstream Entry Corridor",
            "polygon": [[0.02, 0.05], [0.48, 0.05], [0.45, 0.48], [0.02, 0.48]],
            "color": "#10b981",
        },
        {
            "id": "ZONE B",
            "name": "Zone B",
            "description": "Main Bottleneck Corridor",
            "polygon": [[0.48, 0.05], [0.98, 0.05], [0.98, 0.48], [0.45, 0.48]],
            "color": "#ef4444",
        },
        {
            "id": "ZONE C",
            "name": "Zone C",
            "description": "Central Procession Flow",
            "polygon": [[0.02, 0.48], [0.45, 0.48], [0.48, 0.95], [0.02, 0.95]],
            "color": "#f59e0b",
        },
        {
            "id": "ZONE D",
            "name": "Zone D",
            "description": "Side Corridor & Exit Area",
            "polygon": [[0.45, 0.48], [0.98, 0.48], [0.98, 0.95], [0.48, 0.95]],
            "color": "#3b82f6",
        },
    ]
    return _ZONES_CACHE


def save_zones(zones_data: list[dict]):
    global _ZONES_CACHE
    _ZONES_CACHE = zones_data
    os.makedirs(os.path.dirname(_ZONES_PATH), exist_ok=True)
    with open(_ZONES_PATH, "w", encoding="utf-8") as f:
        json.dump(zones_data, f, indent=2)


def classify_density(count: int) -> str:
    for level, (lo, hi) in settings.DENSITY_THRESHOLDS.items():
        if lo <= count <= hi:
            return level
    return "CRITICAL"


def zone_for_point(cx: float, cy: float, frame_w: int, frame_h: int) -> str:
    """Determine which polygon zone contains point (cx, cy) using OpenCV pointPolygonTest."""
    zones = load_zones()
    norm_x = cx / max(1, frame_w)
    norm_y = cy / max(1, frame_h)

    for zone in zones:
        poly = np.array([[pt[0] * frame_w, pt[1] * frame_h] for pt in zone["polygon"]], dtype=np.int32)
        dist = cv2.pointPolygonTest(poly, (float(cx), float(cy)), False)
        if dist >= 0:
            return zone["id"]

    # Fallback if point lies outside defined polygons
    if norm_x < 0.5 and norm_y < 0.5:
        return "ZONE A"
    elif norm_x >= 0.5 and norm_y < 0.5:
        return "ZONE B"
    elif norm_x < 0.5 and norm_y >= 0.5:
        return "ZONE C"
    else:
        return "ZONE D"


def compute_zone_density(detections, frame_w: int, frame_h: int):
    """
    Returns {zone_name: {"count": int, "level": str, "description": str}}
    Assigns each detection centroid to a polygon zone and applies rolling temporal smoothing.
    """
    zones = load_zones()
    zone_counts = {z["id"]: 0 for z in zones}

    for d in detections:
        x1, y1, x2, y2 = d["bbox"]
        cx, cy = (x1 + x2) / 2.0, (y1 + y2) / 2.0
        zone_id = zone_for_point(cx, cy, frame_w, frame_h)
        d["zone_id"] = zone_id
        d["center"] = [int(cx), int(cy)]
        d["norm_center"] = [round(cx / frame_w, 4), round(cy / frame_h, 4)]
        if zone_id in zone_counts:
            zone_counts[zone_id] += 1

    # Temporal smoothing across recent frames
    _HISTORY_WINDOW.append(zone_counts)
    smoothed_counts = {}
    for z_id in zone_counts:
        smoothed_counts[z_id] = int(round(np.mean([h[z_id] for h in _HISTORY_WINDOW])))

    desc_map = {z["id"]: z.get("description", "") for z in zones}

    return {
        z_id: {
            "count": smoothed_counts[z_id],
            "level": classify_density(smoothed_counts[z_id]),
            "description": desc_map.get(z_id, ""),
        }
        for z_id in zone_counts
    }


def reset_smoothing():
    _HISTORY_WINDOW.clear()


def overall_density_score(zone_density: dict) -> float:
    crit_lo = settings.DENSITY_THRESHOLDS["CRITICAL"][0]
    if not zone_density:
        return 0.0
    busiest = max((z["count"] for z in zone_density.values()), default=0)
    return float(min(100.0, (busiest / crit_lo) * 100.0)) if crit_lo else 0.0


def generate_heatmap(detections, frame_w, frame_h, blur_radius_frac=0.06):
    heat = np.zeros((frame_h, frame_w), dtype=np.float32)
    for d in detections:
        x1, y1, x2, y2 = d["bbox"]
        cx, cy = int((x1 + x2) / 2), int((y1 + y2) / 2)
        if 0 <= cy < frame_h and 0 <= cx < frame_w:
            heat[cy, cx] += 1.0

    ksize = max(3, int(min(frame_w, frame_h) * blur_radius_frac) | 1)
    heat = cv2.GaussianBlur(heat, (ksize, ksize), 0)

    max_val = heat.max()
    if max_val > 0:
        heat = heat / max_val
    return heat


def heatmap_to_bgr(heat: np.ndarray) -> np.ndarray:
    heat_u8 = (heat * 255).astype(np.uint8)
    return cv2.applyColorMap(heat_u8, cv2.COLORMAP_JET)
