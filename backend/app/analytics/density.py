"""
Crowd density analytics.

Divides the frame into a configurable grid of zones and computes:
  - people count per zone
  - density level per zone (LOW/MEDIUM/HIGH/CRITICAL) from config thresholds
  - a normalized 0-100 "density score" used by the risk engine
  - a Gaussian heatmap over detected person positions (OpenCV-based, real,
    not a static image - it is recomputed every frame from actual detections)
"""
import cv2
import numpy as np

from app.config import settings


def classify_density(count: int) -> str:
    for level, (lo, hi) in settings.DENSITY_THRESHOLDS.items():
        if lo <= count <= hi:
            return level
    return "CRITICAL"


def zone_for_point(x, y, frame_w, frame_h):
    col = min(int(x / frame_w * settings.ZONE_COLS), settings.ZONE_COLS - 1)
    row = min(int(y / frame_h * settings.ZONE_ROWS), settings.ZONE_ROWS - 1)
    idx = row * settings.ZONE_COLS + col
    return settings.ZONE_NAMES[idx] if idx < len(settings.ZONE_NAMES) else f"ZONE {idx}"


def compute_zone_density(detections, frame_w, frame_h):
    """Returns {zone_name: {"count": int, "level": str}} for every configured zone."""
    zone_counts = {name: 0 for name in settings.ZONE_NAMES}
    for d in detections:
        x1, y1, x2, y2 = d["bbox"]
        cx, cy = (x1 + x2) / 2, (y1 + y2) / 2
        zone = zone_for_point(cx, cy, frame_w, frame_h)
        if zone in zone_counts:
            zone_counts[zone] += 1

    return {
        name: {"count": count, "level": classify_density(count)}
        for name, count in zone_counts.items()
    }


def overall_density_score(zone_density: dict) -> float:
    """Normalize the busiest zone's count to a 0-100 scale using the CRITICAL
    threshold's lower bound as the "100" reference point. This deliberately
    keys off the most congested zone, since that is what matters for safety."""
    crit_lo = settings.DENSITY_THRESHOLDS["CRITICAL"][0]
    if not zone_density:
        return 0.0
    busiest = max(z["count"] for z in zone_density.values())
    return float(min(100.0, (busiest / crit_lo) * 100.0)) if crit_lo else 0.0


def generate_heatmap(detections, frame_w, frame_h, blur_radius_frac=0.06):
    """Real Gaussian density heatmap from actual detection centroids using
    OpenCV. Returns a single-channel float32 array normalized to [0, 1]."""
    heat = np.zeros((frame_h, frame_w), dtype=np.float32)
    for d in detections:
        x1, y1, x2, y2 = d["bbox"]
        cx, cy = int((x1 + x2) / 2), int((y1 + y2) / 2)
        if 0 <= cy < frame_h and 0 <= cx < frame_w:
            heat[cy, cx] += 1.0

    ksize = max(3, int(min(frame_w, frame_h) * blur_radius_frac) | 1)  # odd kernel size
    heat = cv2.GaussianBlur(heat, (ksize, ksize), 0)

    max_val = heat.max()
    if max_val > 0:
        heat = heat / max_val
    return heat


def heatmap_to_bgr(heat: np.ndarray) -> np.ndarray:
    """Convert a normalized [0,1] heatmap into a JET colormap BGR image for overlay."""
    heat_u8 = (heat * 255).astype(np.uint8)
    return cv2.applyColorMap(heat_u8, cv2.COLORMAP_JET)
