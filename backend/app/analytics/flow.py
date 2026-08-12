"""
Basic crowd flow estimation from tracked positions across frames.

This is a prototype analytical indicator, not a validated crowd-flow model.
It looks at how tracked centroids moved between the previous and current
frame to estimate a dominant direction and how "concentrated" (vs.
scattered) that movement is.
"""
import math
from collections import defaultdict


COMPASS = [
    ("N", (0, -1)), ("NE", (1, -1)), ("E", (1, 0)), ("SE", (1, 1)),
    ("S", (0, 1)), ("SW", (-1, 1)), ("W", (-1, 0)), ("NW", (-1, -1)),
]


def _nearest_compass(dx, dy):
    if dx == 0 and dy == 0:
        return None
    best, best_score = None, -1e9
    for name, (vx, vy) in COMPASS:
        norm = math.hypot(vx, vy)
        score = (dx * vx + dy * vy) / norm
        if score > best_score:
            best_score, best = score, name
    return best


class FlowEstimator:
    def __init__(self):
        self.prev_positions = {}  # track_id -> (x, y)

    def update(self, tracked_detections):
        vectors = []
        current_positions = {}
        for d in tracked_detections:
            tid = d.get("track_id")
            if tid is None:
                continue
            x1, y1, x2, y2 = d["bbox"]
            cx, cy = (x1 + x2) / 2, (y1 + y2) / 2
            current_positions[tid] = (cx, cy)
            if tid in self.prev_positions:
                px, py = self.prev_positions[tid]
                vectors.append((cx - px, cy - py))

        self.prev_positions = current_positions

        if not vectors:
            return {"direction": "STATIONARY", "concentration": 0.0, "sample_size": 0}

        direction_counts = defaultdict(int)
        for dx, dy in vectors:
            if abs(dx) < 1.0 and abs(dy) < 1.0:
                continue
            d = _nearest_compass(dx, dy)
            if d:
                direction_counts[d] += 1

        if not direction_counts:
            return {"direction": "STATIONARY", "concentration": 0.0, "sample_size": len(vectors)}

        dominant, dominant_count = max(direction_counts.items(), key=lambda kv: kv[1])
        concentration = dominant_count / len(vectors)  # 0-1: how unified the movement is

        return {
            "direction": dominant,
            "concentration": round(concentration, 3),
            "sample_size": len(vectors),
        }
