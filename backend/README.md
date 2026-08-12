# WariMind AI — Backend

FastAPI service implementing the full analytics chain:

```
video → frame extraction → person detection → tracking → count
→ zone density → heatmap → flow → risk engine → decision engine → API
```

## Quick test without the server

```bash
cd backend
python run_demo.py ../data/demo/demo_crowd.mp4 --seconds 15
```

This runs the entire pipeline in-process and prints frame-by-frame status —
useful to confirm detection/analytics work before starting the full API.

## Running the API server

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Then check `http://localhost:8000/health`.

## Endpoints

| Method | Path                  | Purpose                              |
|--------|-----------------------|---------------------------------------|
| GET    | `/health`              | Liveness check                        |
| GET    | `/api/status`          | Pipeline status, device, FPS          |
| GET    | `/api/analytics`       | People count, zone density, flow      |
| GET    | `/api/risk`            | Current risk score/level              |
| GET    | `/api/recommendations` | Decision engine output + volunteer alert |
| GET    | `/api/events`          | Recent event log                      |
| GET    | `/api/video/feed`      | MJPEG annotated video stream          |
| POST   | `/api/demo/start`      | Start demo-mode processing            |
| POST   | `/api/demo/stop`       | Stop processing                       |
| POST   | `/api/normal/start`    | Start normal-mode processing          |
| WS     | `/ws/analytics`        | Optional 1s push of full state        |

## Detector backend

`app/vision/detector.py` tries Ultralytics YOLO first (needs `torch` +
`ultralytics` + a weight file in `models/`). If any of those are missing,
it **automatically falls back** to OpenCV's built-in HOG person detector —
no crash, no manual switch needed. Check which backend is active via
`GET /api/status` → `detector_backend`.

## Tests

```bash
# Pure logic (density/risk/decision) - no FastAPI needed
python -m unittest tests.test_core_logic -v

# API tests - needs fastapi + httpx installed
pytest tests/test_api.py
```
