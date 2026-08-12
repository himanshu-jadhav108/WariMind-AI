#!/usr/bin/env python3
"""
Generates a SYNTHETIC placeholder video so the pipeline can be started and
smoke-tested before you supply a real crowd video.

IMPORTANT / HONESTY NOTE:
This script draws simple moving silhouette shapes. It is useful for proving
the video -> frame -> analytics -> risk -> decision -> API chain runs without
crashing (frame reading, zone math, tracker IDs, risk scoring, event log).

It is NOT a substitute for a real crowd video. Solid synthetic shapes do NOT
reliably trigger real person detectors (neither YOLO nor OpenCV's HOG
detector, both of which are trained on real human image statistics/gradients).
For an actual detection demo, replace data/demo/demo_crowd.mp4 with real
crowd footage (a few minutes is enough) - see the top-level README.

Usage:
    python scripts/generate_demo_video.py
"""
import math
import os
import random

import cv2
import numpy as np

OUT_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "demo", "demo_crowd.mp4")
W, H = 960, 540
FPS = 20
DURATION_S = 30
N_PEOPLE_START = 8
N_PEOPLE_END = 45  # simulates the crowd building up in Zone B (bottom-right)


def main():
    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    writer = cv2.VideoWriter(OUT_PATH, fourcc, FPS, (W, H))

    n_frames = FPS * DURATION_S
    random.seed(42)

    # Each "person" is a small silhouette that drifts toward the bottom-right
    # quadrant (simulating Zone B congestion building over time), with a
    # staggered spawn schedule so the count ramps up like a real scenario.
    people = []
    for i in range(N_PEOPLE_END):
        spawn_frame = int((i / N_PEOPLE_END) * n_frames * 0.7)
        people.append({
            "spawn": spawn_frame,
            "x": random.uniform(0.05, 0.5) * W,
            "y": random.uniform(0.1, 0.9) * H,
            "target_x": random.uniform(0.6, 0.95) * W,
            "target_y": random.uniform(0.55, 0.95) * H,
            "speed": random.uniform(0.4, 1.2),
        })

    for f in range(n_frames):
        frame = np.full((H, W, 3), 235, dtype=np.uint8)  # light background
        cv2.putText(frame, "SYNTHETIC PLACEHOLDER VIDEO - replace with real crowd footage",
                    (20, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 0, 180), 1, cv2.LINE_AA)
        # draw zone grid guides
        cv2.line(frame, (W // 2, 0), (W // 2, H), (200, 200, 200), 1)
        cv2.line(frame, (0, H // 2), (W, H // 2), (200, 200, 200), 1)

        for p in people:
            if f < p["spawn"]:
                continue
            t = min(1.0, (f - p["spawn"]) / (n_frames * 0.6))
            p["x"] += (p["target_x"] - p["x"]) * 0.02 * p["speed"]
            p["y"] += (p["target_y"] - p["y"]) * 0.02 * p["speed"]
            cx, cy = int(p["x"]), int(p["y"])
            cv2.circle(frame, (cx, cy - 10), 6, (60, 60, 60), -1)   # head
            cv2.ellipse(frame, (cx, cy + 8), (8, 16), 0, 0, 360, (90, 90, 90), -1)  # body

        writer.write(frame)

    writer.release()
    print(f"Wrote {n_frames} frames ({DURATION_S}s @ {FPS}fps) to {OUT_PATH}")


if __name__ == "__main__":
    main()
