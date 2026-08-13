"""
In-memory shared application state.

For this POC, "storage" is JSON-serializable Python state guarded by a lock -
no database. This is intentional (see project brief section 3): a Stage 2
demo does not need persistent production infrastructure.
"""
import threading
import time


class AppState:
    def __init__(self):
        self._lock = threading.Lock()
        self.status = "IDLE"                 # IDLE | RUNNING | STOPPED | ERROR
        self.mode = "NORMAL"                  # NORMAL | DEMO
        self.compute_device = "CPU FALLBACK"  # "GPU" or "CPU FALLBACK"
        self.detector_backend = "unknown"     # "yolo" or "opencv_hog"
        self.frame_count = 0
        self.fps = 0.0
        self.people_count = 0
        self.zone_density = {}
        self.density_score = 0.0
        self.flow = {"direction": "STATIONARY", "concentration": 0.0}
        self.trend = {"trend": "STABLE", "growth_pct": 0.0, "predicted_status": ""}
        self.risk = {"score": 0.0, "level": "LOW", "label": "Prototype Risk Estimation"}
        self.recommendation = {"triggered": False, "actions": []}
        self.volunteer_alert = None
        self.debug_mode = False
        self.events = []              # list of {"time": ..., "message": ...}
        self.error = None
        self._start_time = None

    def log_event(self, message: str):
        with self._lock:
            self.events.append({
                "time": time.strftime("%H:%M:%S"),
                "message": message,
            })
            self.events = self.events[-100:]  # cap event log

    def update(self, **kwargs):
        with self._lock:
            for k, v in kwargs.items():
                setattr(self, k, v)

    def acknowledge_volunteer_alert(self):
        with self._lock:
            if self.volunteer_alert:
                self.volunteer_alert["acknowledged"] = True
            self.events.append({
                "time": time.strftime("%H:%M:%S"),
                "message": "✓ Response acknowledged by volunteer",
            })

    def reset(self):
        with self._lock:
            self.status = "IDLE"
            self.frame_count = 0
            self.fps = 0.0
            self.people_count = 0
            self.zone_density = {}
            self.density_score = 0.0
            self.flow = {"direction": "STATIONARY", "concentration": 0.0}
            self.trend = {"trend": "STABLE", "growth_pct": 0.0, "predicted_status": ""}
            self.risk = {"score": 0.0, "level": "LOW", "label": "Prototype Risk Estimation", "components": {}}
            self.recommendation = {"triggered": False, "actions": []}
            self.volunteer_alert = None
            try:
                from app.analytics import density
                density.reset_smoothing()
            except Exception:
                pass
            self.events = [{
                "time": time.strftime("%H:%M:%S"),
                "message": "System reset to baseline state",
            }]
            self.error = None

    def snapshot(self) -> dict:
        with self._lock:
            return {
                "status": self.status,
                "mode": self.mode,
                "compute_device": self.compute_device,
                "detector_backend": self.detector_backend,
                "frame_count": self.frame_count,
                "fps": round(self.fps, 1),
                "people_count": self.people_count,
                "zone_density": self.zone_density,
                "density_score": round(self.density_score, 1),
                "flow": self.flow,
                "trend": self.trend,
                "risk": self.risk,
                "recommendation": self.recommendation,
                "volunteer_alert": self.volunteer_alert,
                "debug_mode": self.debug_mode,
                "events": self.events[-20:],
                "error": self.error,
            }


state = AppState()
