"""
Pipeline orchestrator.

Implements the full chain from the project brief:

  video -> frame extraction -> person detection -> tracking -> count
  -> density -> heatmap -> flow -> risk -> decision -> shared state (-> API -> dashboard)

Runs in its own thread so the FastAPI server stays responsive while a video
is being processed. Designed to degrade gracefully: missing video, missing
model, or GPU-unavailable all result in clear logged errors / CPU fallback,
never a silent crash.
"""
import logging
import os
import threading
import time

import cv2
import numpy as np

from app.analytics import density, flow as flow_mod, risk as risk_mod
from app.config import settings
from app.decision import decision_engine
from app.prediction.trend import TrendPredictor
from app.state import state
from app.vision.detector import PersonDetector
from app.vision.tracker import CentroidTracker

logger = logging.getLogger("warimind.pipeline")


class VideoPipeline:
    def __init__(self, video_path: str = None):
        self.video_path = video_path or settings.DEMO_VIDEO_PATH
        self._stop_flag = threading.Event()
        self._thread = None
        self.detector = None
        self.tracker = CentroidTracker()
        self.flow_estimator = flow_mod.FlowEstimator()
        self.trend_predictor = TrendPredictor()
        self.last_heatmap = None  # normalized float32 array, read by /api/heatmap-ish consumers
        self.last_annotated_jpeg = None  # bytes, read by the MJPEG stream endpoint
        self._frame_lock = threading.Lock()

    def get_latest_jpeg(self):
        with self._frame_lock:
            return self.last_annotated_jpeg

    def _annotate(self, frame, tracked, fps, risk_level):
        out = frame.copy()
        for d in tracked:
            x1, y1, x2, y2 = [int(v) for v in d["bbox"]]
            cv2.rectangle(out, (x1, y1), (x2, y2), (0, 220, 0), 2)
            label = f"ID:{d['track_id']}" if d.get("track_id") is not None else "person"
            conf = f"{d.get('confidence', 0.8):.2f}" if d.get("confidence") else ""
            txt = f"{label} {conf}".strip()
            cv2.putText(out, txt, (x1, max(12, y1 - 4)), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 255, 0), 1, cv2.LINE_AA)

        # Draw Zone B boundary highlight on video feed if in Zone B
        h, w = frame.shape[:2]
        cv2.rectangle(out, (int(w/2), int(h/2)), (w, h), (0, 165, 255), 1)
        cv2.putText(out, "ZONE B", (int(w/2) + 8, int(h/2) + 20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 165, 255), 1, cv2.LINE_AA)

        overlay_lines = [
            f"AI VISION: ACTIVE | {state.detector_backend.upper()}",
            f"PEOPLE DETECTED: {len(tracked)} | TRACKING: ACTIVE",
            f"RISK LEVEL: {risk_level}",
            "RECORDED VIDEO • LIVE FEED SIMULATION",
        ]
        y = 28
        for line in overlay_lines:
            # Black background outline for crisp readability
            cv2.putText(out, line, (12, y), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 0, 0), 3, cv2.LINE_AA)
            color = (0, 255, 255) if "RISK" in line and risk_level in ["HIGH", "CRITICAL"] else (255, 255, 255)
            cv2.putText(out, line, (12, y), cv2.FONT_HERSHEY_SIMPLEX, 0.55, color, 1, cv2.LINE_AA)
            y += 24
        return out

    def start(self, mode: str = "NORMAL"):
        if self._thread and self._thread.is_alive():
            logger.info("Pipeline already running.")
            return
        self._stop_flag.clear()
        state.update(mode=mode, status="RUNNING", error=None)
        state.log_event(f"✓ Crowd monitoring started ({mode} mode)")
        self._thread = threading.Thread(target=self._run, daemon=True)
        self._thread.start()

    def stop(self):
        self._stop_flag.set()
        state.update(status="STOPPED")
        state.log_event("Detection stopped")

    def _run(self):
        try:
            if not os.path.exists(self.video_path):
                raise FileNotFoundError(
                    f"Demo video not found at {self.video_path}. "
                    f"Place a video there or run scripts/generate_demo_video.py."
                )

            self.detector = PersonDetector(
                settings.YOLO_MODEL_PATH,
                confidence_threshold=settings.CONFIDENCE_THRESHOLD,
                force_cpu=settings.FORCE_CPU,
            )
            state.update(
                compute_device="GPU" if self.detector.is_gpu() else "CPU FALLBACK",
                detector_backend=self.detector.backend,
            )
            state.log_event(f"Detector backend active: {self.detector.backend} ({state.compute_device})")

            cap = cv2.VideoCapture(self.video_path)
            if not cap.isOpened():
                raise IOError(f"Could not open video file: {self.video_path}")

            frame_idx = 0
            start_t = time.time()
            last_time = time.time()
            logged_milestones = set()

            while not self._stop_flag.is_set():
                ok, frame = cap.read()
                if not ok:
                    cap.set(cv2.CAP_PROP_POS_FRAMES, 0)  # loop for continuous demo
                    continue

                frame_idx += 1
                if frame_idx % settings.PROCESS_EVERY_N_FRAMES != 0:
                    continue

                h, w = frame.shape[:2]
                detections = self.detector.detect(frame)
                tracked = self.tracker.update(detections)

                elapsed = time.time() - start_t
                is_scenario = state.mode == "SCENARIO"

                zone_density = density.compute_zone_density(tracked, w, h)

                # Scenario adjustment: escalate Zone B count over 60 seconds if in SCENARIO mode
                if is_scenario:
                    if elapsed < 15:
                        scale_b = 1.0
                    elif elapsed < 35:
                        scale_b = 1.0 + ((elapsed - 15) / 20) * 1.5
                        if "increasing" not in logged_milestones:
                            logged_milestones.add("increasing")
                            state.log_event("↑ Density increasing — Zone B")
                    else:
                        scale_b = 2.5
                        if "approaching" not in logged_milestones:
                            logged_milestones.add("approaching")
                            state.log_event("⚠ High-risk threshold approaching in Zone B")

                    zone_b_count = int(max(zone_density.get("ZONE B", {}).get("count", 0) * scale_b, 68 if elapsed >= 35 else (35 if elapsed >= 15 else 12)))
                    zone_density["ZONE B"] = {
                        "count": zone_b_count,
                        "level": density.classify_density(zone_b_count),
                    }

                density_score = density.overall_density_score(zone_density)
                self.last_heatmap = density.generate_heatmap(tracked, w, h)

                flow_state = self.flow_estimator.update(tracked)
                if is_scenario and elapsed >= 20:
                    flow_state = {"direction": "NE", "concentration": 0.78, "sample_size": len(tracked)}

                self.trend_predictor.add_sample(density_score)
                growth_pct = self.trend_predictor.growth_rate()
                if is_scenario and elapsed >= 30:
                    growth_pct = max(growth_pct, 24.5)

                busiest_count = max((z["count"] for z in zone_density.values()), default=0)
                risk = risk_mod.compute_risk_score(
                    density_score, growth_pct, flow_state["concentration"], busiest_count
                )
                trend_snapshot = self.trend_predictor.snapshot(risk["level"])

                prev_level = state.risk.get("level")
                recommendation = decision_engine.generate_recommendations(risk, zone_density, flow_state)
                v_alert = decision_engine.volunteer_alert(recommendation)

                now = time.time()
                fps = 1.0 / max(now - last_time, 1e-6)
                last_time = now

                # Preserve acknowledged flag if already set on volunteer alert
                if v_alert and state.volunteer_alert and state.volunteer_alert.get("acknowledged"):
                    v_alert["acknowledged"] = True

                state.update(
                    frame_count=frame_idx,
                    fps=fps,
                    people_count=sum(z["count"] for z in zone_density.values()) if is_scenario else len(tracked),
                    zone_density=zone_density,
                    density_score=density_score,
                    flow=flow_state,
                    trend=trend_snapshot,
                    risk=risk,
                    recommendation=recommendation,
                    volunteer_alert=v_alert,
                )

                if prev_level != risk["level"]:
                    state.log_event(f"Risk level transition: {prev_level} -> {risk['level']}")
                if recommendation.get("triggered") and "rec_logged" not in logged_milestones:
                    logged_milestones.add("rec_logged")
                    state.log_event(f"🔴 HIGH CROWD RISK — {recommendation['zone']}")
                    state.log_event("🤖 AI Decision Engine recommendation generated")
                    state.log_event("👤 Volunteer alert dispatched to field team")

                annotated = self._annotate(frame, tracked, fps, risk["level"])
                ok_jpg, buf = cv2.imencode(".jpg", annotated, [cv2.IMWRITE_JPEG_QUALITY, 80])
                if ok_jpg:
                    with self._frame_lock:
                        self.last_annotated_jpeg = buf.tobytes()

            cap.release()
        except Exception as e:  # noqa: BLE001 - POC must surface errors, never crash silently
            logger.exception("Pipeline error")
            state.update(status="ERROR", error=str(e))
            state.log_event(f"ERROR: {e}")
