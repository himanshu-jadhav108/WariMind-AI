"""
WariMind AI - Central Configuration
====================================
ALL prototype thresholds live here. Nothing in this file represents a real,
validated Wari (pilgrimage route) safety standard — these are placeholder
values for demonstration purposes and MUST be reviewed by domain experts
(crowd safety engineers, event organizers) before any real-world use.
"""
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PROJECT_ROOT = os.path.dirname(BASE_DIR)

# ---------------------------------------------------------------------------
# Vision pipeline
# ---------------------------------------------------------------------------
DEMO_VIDEO_PATH = os.path.join(PROJECT_ROOT, "data", "demo", "demo_crowd.mp4")
MODELS_DIR = os.path.join(PROJECT_ROOT, "models")
YOLO_MODEL_PATH = os.path.join(MODELS_DIR, "yolo11n.pt")  # user downloads this; optional

CONFIDENCE_THRESHOLD = 0.35          # detector confidence cutoff
INFERENCE_WIDTH = 640                # frames resized to this width before inference
PROCESS_EVERY_N_FRAMES = 1           # frame skipping for slow machines (1 = process every frame)
TARGET_DISPLAY_FPS = 20

# ---------------------------------------------------------------------------
# Zones - the monitored area is divided into a grid of named zones.
# ROWS x COLS defines the grid; ZONE_NAMES must have ROWS*COLS entries.
# ---------------------------------------------------------------------------
ZONE_ROWS = 2
ZONE_COLS = 2
ZONE_NAMES = ["ZONE A", "ZONE B", "ZONE C", "ZONE D"]

# ---------------------------------------------------------------------------
# Density thresholds (people per zone) - PROTOTYPE VALUES, configurable.
# ---------------------------------------------------------------------------
DENSITY_THRESHOLDS = {
    "LOW": (0, 30),
    "MEDIUM": (31, 60),
    "HIGH": (61, 80),
    "CRITICAL": (81, 10_000),
}

# ---------------------------------------------------------------------------
# Risk engine - Prototype Risk Estimation (heuristic, not scientifically
# validated). Weights sum to 1.0; tune freely.
# ---------------------------------------------------------------------------
RISK_WEIGHTS = {
    "density": 0.40,          # normalized current density (0-100 scale)
    "density_growth": 0.25,   # rate of density increase
    "flow_concentration": 0.20,  # how concentrated movement is into one zone
    "capacity_utilization": 0.15,  # people vs configured zone capacity
}

ZONE_CAPACITY = 100  # prototype max comfortable capacity per zone

RISK_LEVELS = {
    "LOW": (0, 40),
    "MEDIUM": (41, 65),
    "HIGH": (66, 80),
    "CRITICAL": (81, 100),
}

RISK_WINDOW_SIZE = 10  # number of recent samples used for trend/growth calc

# ---------------------------------------------------------------------------
# Decision engine
# ---------------------------------------------------------------------------
DECISION_RISK_TRIGGER = "HIGH"  # minimum level ("HIGH" or "CRITICAL") that triggers recommendations

# ---------------------------------------------------------------------------
# Compute
# ---------------------------------------------------------------------------
FORCE_CPU = os.environ.get("WARIMIND_FORCE_CPU", "0") == "1"
