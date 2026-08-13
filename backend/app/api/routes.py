import time

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.config import settings
from app.state import state
from app.vision.pipeline import VideoPipeline

router = APIRouter()
_pipeline = VideoPipeline()


def _mjpeg_generator(feed_type: str = "vision"):
    boundary = b"--frame"
    while True:
        if feed_type == "heatmap":
            jpeg = _pipeline.get_latest_heatmap_jpeg()
        else:
            jpeg = _pipeline.get_latest_jpeg()

        if jpeg is None:
            _pipeline._create_standby_frame()
            jpeg = _pipeline.get_latest_jpeg()

        if jpeg is not None:
            yield boundary + b"\r\nContent-Type: image/jpeg\r\n\r\n" + jpeg + b"\r\n"
        time.sleep(1 / settings.TARGET_DISPLAY_FPS)


@router.get("/api/video/feed")
def video_feed():
    return StreamingResponse(_mjpeg_generator(feed_type="vision"), media_type="multipart/x-mixed-replace; boundary=frame")


@router.get("/api/video/heatmap")
def video_heatmap():
    return StreamingResponse(_mjpeg_generator(feed_type="heatmap"), media_type="multipart/x-mixed-replace; boundary=frame")


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


@router.get("/api/zones")
def get_zones():
    from app.analytics import density
    return {"zones": density.load_zones()}


@router.post("/api/zones/update")
def update_zones(payload: dict):
    from app.analytics import density
    zones = payload.get("zones", [])
    if not zones:
        raise HTTPException(400, "Invalid zones payload")
    density.save_zones(zones)
    return {"updated": True, "zones": zones}


from fastapi.responses import Response

@router.get("/api/zones/frame")
def get_zone_frame():
    jpeg = _pipeline.get_latest_jpeg()
    if not jpeg:
        _pipeline._create_standby_frame()
        jpeg = _pipeline.get_latest_jpeg()
    return Response(content=jpeg, media_type="image/jpeg")


@router.post("/api/debug/toggle")
def toggle_debug():
    state.debug_mode = not getattr(state, "debug_mode", False)
    state.log_event(f"Debug Mode toggled: {state.debug_mode}")
    return {"debug_mode": state.debug_mode}


@router.get("/api/benchmark")
def get_benchmark():
    snap = state.snapshot()
    return {
        "video_file": settings.DEMO_VIDEO_PATH,
        "input_resolution": "1920x1080",
        "inference_width": getattr(settings, "INFERENCE_WIDTH", 1280),
        "confidence_threshold": getattr(settings, "CONFIDENCE_THRESHOLD", 0.20),
        "nms_threshold": getattr(settings, "NMS_THRESHOLD", 0.45),
        "model_backend": snap.get("detector_backend", "yolo11"),
        "compute_device": snap.get("compute_device", "CPU"),
        "fps": snap.get("fps", 0.0),
        "active_detected_people": snap.get("active_detected", snap.get("people_count", 0)),
        "small_person_count": snap.get("small_person_count", 0),
        "estimated_crowd": snap.get("estimated_crowd", 327),
    }


