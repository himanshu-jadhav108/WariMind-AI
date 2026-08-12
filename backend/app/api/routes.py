import time

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.config import settings
from app.state import state
from app.vision.pipeline import VideoPipeline

router = APIRouter()
_pipeline = VideoPipeline()


def _mjpeg_generator():
    boundary = b"--frame"
    while True:
        jpeg = _pipeline.get_latest_jpeg()
        if jpeg is not None:
            yield boundary + b"\r\nContent-Type: image/jpeg\r\n\r\n" + jpeg + b"\r\n"
        time.sleep(1 / settings.TARGET_DISPLAY_FPS)


@router.get("/api/video/feed")
def video_feed():
    return StreamingResponse(_mjpeg_generator(), media_type="multipart/x-mixed-replace; boundary=frame")


@router.get("/health")
def health():
    return {"status": "ok"}


@router.get("/api/status")
def api_status():
    snap = state.snapshot()
    return {
        "status": snap["status"],
        "mode": snap["mode"],
        "compute_device": snap["compute_device"],
        "detector_backend": snap["detector_backend"],
        "fps": snap["fps"],
        "frame_count": snap["frame_count"],
    }


@router.get("/api/analytics")
def api_analytics():
    snap = state.snapshot()
    return {
        "people_count": snap["people_count"],
        "zone_density": snap["zone_density"],
        "density_score": snap["density_score"],
        "flow": snap["flow"],
        "trend": snap["trend"],
    }


@router.get("/api/risk")
def api_risk():
    return state.snapshot()["risk"]


@router.get("/api/recommendations")
def api_recommendations():
    snap = state.snapshot()
    return {
        "recommendation": snap["recommendation"],
        "volunteer_alert": snap["volunteer_alert"],
    }


@router.get("/api/events")
def api_events():
    return {"events": state.snapshot()["events"]}


@router.post("/api/scenario/start")
def scenario_start():
    state.reset()
    _pipeline.start(mode="SCENARIO")
    return {"started": True, "mode": "SCENARIO"}


@router.post("/api/volunteer/acknowledge")
def volunteer_acknowledge():
    state.acknowledge_volunteer_alert()
    return {"acknowledged": True}


@router.post("/api/demo/reset")
def demo_reset():
    _pipeline.stop()
    state.reset()
    return {"reset": True}


@router.post("/api/demo/start")
def demo_start():
    if not settings.__dict__.get("DEMO_VIDEO_PATH"):
        raise HTTPException(500, "DEMO_VIDEO_PATH not configured")
    _pipeline.start(mode="DEMO")
    return {"started": True}


@router.post("/api/demo/stop")
def demo_stop():
    _pipeline.stop()
    return {"stopped": True}


@router.post("/api/normal/start")
def normal_start():
    _pipeline.start(mode="NORMAL")
    return {"started": True}
