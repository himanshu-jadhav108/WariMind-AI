#!/usr/bin/env python3
"""
Standalone end-to-end pipeline test - no FastAPI/uvicorn required.

Runs the full chain (detect -> track -> density -> flow -> risk -> decision)
against a video file and prints a summary every N frames. Useful for a quick
sanity check before starting the full server, and for environments where
you want to verify the vision/analytics stack works before wiring up the
API and frontend.

Usage:
    python run_demo.py [path/to/video.mp4] [--max-frames N]
"""
import argparse
import sys
import time

from app.config import settings
from app.state import state
from app.vision.pipeline import VideoPipeline


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("video", nargs="?", default=settings.DEMO_VIDEO_PATH)
    parser.add_argument("--max-frames", type=int, default=200)
    parser.add_argument("--seconds", type=float, default=15.0)
    args = parser.parse_args()

    print(f"WariMind AI - CLI pipeline test")
    print(f"Video: {args.video}")

    pipeline = VideoPipeline(video_path=args.video)
    pipeline.start(mode="DEMO")

    start = time.time()
    last_frame_seen = -1
    try:
        while time.time() - start < args.seconds:
            time.sleep(0.5)
            snap = state.snapshot()
            if snap["status"] == "ERROR":
                print(f"\nERROR: {snap['error']}")
                sys.exit(1)
            if snap["frame_count"] != last_frame_seen:
                last_frame_seen = snap["frame_count"]
                print(
                    f"frame={snap['frame_count']:>5} "
                    f"fps={snap['fps']:>5.1f} "
                    f"backend={snap['detector_backend']:<10} "
                    f"device={snap['compute_device']:<12} "
                    f"people={snap['people_count']:>3} "
                    f"density={snap['density_score']:>5.1f} "
                    f"risk={snap['risk']['level']:<8}({snap['risk']['score']}) "
                    f"flow={snap['flow']['direction']}"
                )
            if snap["frame_count"] >= args.max_frames:
                break
    finally:
        pipeline.stop()

    print("\nFinal event log:")
    for e in state.snapshot()["events"]:
        print(f"  [{e['time']}] {e['message']}")


if __name__ == "__main__":
    main()
