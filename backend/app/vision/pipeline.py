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
        self.last_heatmap_jpeg = None
        self._frame_lock = threading.Lock()
        self._create_standby_frame()

    def _create_standby_frame(self):
        frame = np.full((540, 960, 3), (25, 25, 30), dtype=np.uint8)
        cv2.putText(frame, "WARIMIND AI - VISION ACTIVE", (30, 240), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (255, 255, 255), 2, cv2.LINE_AA)
        cv2.putText(frame, "Live crowd video feed stream initialized", (30, 290), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 220, 255), 1, cv2.LINE_AA)
        cv2.putText(frame, "RECORDED VIDEO • LIVE FEED SIMULATION", (30, 480), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (180, 180, 180), 1, cv2.LINE_AA)
        ok_jpg, buf = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
        if ok_jpg:
            with self._frame_lock:
                self.last_annotated_jpeg = buf.tobytes()
                self.last_heatmap_jpeg = buf.tobytes()

    def get_latest_jpeg(self):
        with self._frame_lock:
            return self.last_annotated_jpeg

    def get_latest_heatmap_jpeg(self):
        with self._frame_lock:
            return self.last_heatmap_jpeg or self.last_annotated_jpeg

    def _annotate(self, frame, tracked, fps, risk_level):
        out = frame.copy()
        h, w = frame.shape[:2]
        zones = density.load_zones()
        current_zone_density = getattr(state, "zone_density", {}) or {}

        # 1. Render Zone Polygons
        for z in zones:
            z_id = z["id"]
            poly_norm = z["polygon"]
            pts = np.array([[int(pt[0] * w), int(pt[1] * h)] for pt in poly_norm], dtype=np.int32)

            z_info = current_zone_density.get(z_id, {"count": 0, "level": "LOW"})
            z_level = z_info.get("level", "LOW")
            z_count = z_info.get("count", 0)

            # Define color by level (BGR format for OpenCV)
            if z_level in ["HIGH", "CRITICAL"]:
                bgr_color = (0, 0, 235)  # Bright Red
                thickness = 3
                fill_color = (0, 0, 160)
            elif z_level == "MEDIUM":
                bgr_color = (0, 180, 255)  # Amber
                thickness = 2
                fill_color = (0, 120, 200)
            else:
                bgr_color = (100, 220, 0)  # Emerald Green
                thickness = 1
                fill_color = (50, 150, 0)

            # Draw polygon boundary
            cv2.polylines(out, [pts], isClosed=True, color=bgr_color, thickness=thickness, lineType=cv2.LINE_AA)

            # Subtle transparent fill for high risk zones
            if z_level in ["HIGH", "CRITICAL"]:
                overlay = out.copy()
                cv2.fillPoly(overlay, [pts], fill_color)
                cv2.addWeighted(overlay, 0.15, out, 0.85, 0, out)

            # Compute label position (top-center of polygon)
            min_y = int(min(pt[1] for pt in poly_norm) * h)
            min_x = int(min(pt[0] for pt in poly_norm) * w)
            max_x = int(max(pt[0] for pt in poly_norm) * w)
            label_x = max(10, min(w - 150, (min_x + max_x) // 2 - 40))
            label_y = max(25, min_y + 22)

            label_txt = f"{z_id}: {z_level} ({z_count})"
            # Badge background
            (tw, th), _ = cv2.getTextSize(label_txt, cv2.FONT_HERSHEY_SIMPLEX, 0.45, 1)
            cv2.rectangle(out, (label_x - 4, label_y - th - 4), (label_x + tw + 4, label_y + 4), (15, 15, 20), -1)
            cv2.rectangle(out, (label_x - 4, label_y - th - 4), (label_x + tw + 4, label_y + 4), bgr_color, 1)
            cv2.putText(out, label_txt, (label_x, label_y), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 1, cv2.LINE_AA)

        # 2. Draw Tracked Person Bounding Boxes & Centers
        is_debug = getattr(state, "debug_mode", False)
        for d in tracked:
            x1, y1, x2, y2 = [int(v) for v in d["bbox"]]
            cx, cy = int((x1 + x2) / 2), int((y1 + y2) / 2)

            # Person Bounding Box
            cv2.rectangle(out, (x1, y1), (x2, y2), (0, 220, 0), 1)

            if is_debug:
                # Draw center point dot & track ID label
                cv2.circle(out, (cx, cy), 3, (0, 255, 255), -1)
                t_id = d.get("track_id", "")
                z_assigned = d.get("zone_id", "")
                dbg_txt = f"ID:{t_id} [{z_assigned}]"
                cv2.putText(out, dbg_txt, (x1, max(12, y1 - 4)), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 255, 255), 1, cv2.LINE_AA)

        # 3. HUD Overlay Lines
        overlay_lines = [
            f"AI VISION: ACTIVE | {state.detector_backend.upper()}",
            f"PEOPLE DETECTED: {len(tracked)} | ZONES: ACTIVE",
            f"RISK LEVEL: {risk_level}",
            "RECORDED VIDEO • LIVE FEED SIMULATION",
        ]
        if is_debug:
            overlay_lines.insert(0, "[ DEBUG MODE ACTIVE — SHOWING TRACKS & CENTROIDS ]")

        y = 28
        for line in overlay_lines:
            cv2.putText(out, line, (12, y), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 0, 0), 3, cv2.LINE_AA)
            color = (0, 255, 255) if "DEBUG" in line else ((0, 0, 255) if "RISK" in line and risk_level in ["HIGH", "CRITICAL"] else (255, 255, 255))
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

                # Scenario adjustment: Zone D & Zone B have high crowd density, Zone C has low crowd, Zone A has very low crowd
                if is_scenario:
                    if elapsed < 15:
                        scale_b = 1.0
                    elif elapsed < 35:
                        scale_b = 1.0 + ((elapsed - 15) / 20) * 1.5
                        if "increasing" not in logged_milestones:
                            logged_milestones.add("increasing")
                            state.log_event("↑ Density increasing — Zone D & Zone B")
                    else:
                        scale_b = 2.5
                        if "approaching" not in logged_milestones:
                            logged_milestones.add("approaching")
                            state.log_event("⚠ High crowd risk detected in Zone D & Zone B")

                    zone_b_count = int(max(zone_density.get("ZONE B", {}).get("count", 0) * scale_b, 68 if elapsed >= 35 else (35 if elapsed >= 15 else 12)))
                    zone_d_count = int(max(zone_density.get("ZONE D", {}).get("count", 0) * scale_b, 78 if elapsed >= 35 else (42 if elapsed >= 15 else 16)))
                    zone_c_count = int(min(zone_density.get("ZONE C", {}).get("count", 22), 24))
                    zone_a_count = int(min(zone_density.get("ZONE A", {}).get("count", 8), 10))

                    zone_density["ZONE A"] = {"count": zone_a_count, "level": "LOW"}
                    zone_density["ZONE B"] = {"count": zone_b_count, "level": density.classify_density(zone_b_count)}
                    zone_density["ZONE C"] = {"count": zone_c_count, "level": "LOW"}
                    zone_density["ZONE D"] = {"count": zone_d_count, "level": density.classify_density(zone_d_count)}

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

                active_detected = len(tracked)
                small_count = sum(1 for d in detections if d.get("is_small"))
                total_zone_people = sum(z["count"] for z in zone_density.values())
                raw_people_count = total_zone_people if is_scenario else active_detected
                estimated_crowd = int(round(raw_people_count * 3.2))

                state.update(
                    frame_count=frame_idx,
                    fps=fps,
                    people_count=raw_people_count,
                    active_detected=active_detected,
                    small_person_count=small_count,
                    estimated_crowd=estimated_crowd,
                    inference_width=getattr(settings, "INFERENCE_WIDTH", 1280),
                    confidence_threshold=getattr(settings, "CONFIDENCE_THRESHOLD", 0.20),
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
                
                # Generate blended Heatmap Overlay stream frame
                heatmap_overlay = annotated.copy()
                if self.last_heatmap is not None:
                    h_bgr = density.heatmap_to_bgr(self.last_heatmap)
                    heatmap_overlay = cv2.addWeighted(annotated, 0.65, h_bgr, 0.35, 0)
                ok_heat_jpg, heat_buf = cv2.imencode(".jpg", heatmap_overlay, [cv2.IMWRITE_JPEG_QUALITY, 80])

                if ok_jpg:
                    with self._frame_lock:
                        self.last_annotated_jpeg = buf.tobytes()
                        if ok_heat_jpg:
                            self.last_heatmap_jpeg = heat_buf.tobytes()

            cap.release()
        except Exception as e:  # noqa: BLE001 - POC must surface errors, never crash silently
            logger.exception("Pipeline error")
            state.update(status="ERROR", error=str(e))
            state.log_event(f"ERROR: {e}")
