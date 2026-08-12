import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router, _pipeline
from app.state import state

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(message)s")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logging.info("Auto-starting WariMind AI Scenario Pipeline on backend startup...")
    _pipeline.start(mode="SCENARIO")
    yield


app = FastAPI(title="WariMind AI - POC Backend", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # POC only - not for production
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.websocket("/ws/analytics")
async def ws_analytics(websocket: WebSocket):
    """Simple push-on-interval websocket. The frontend can use this OR plain
    polling of /api/status /api/analytics /api/risk - whichever is simpler
    for a given demo machine's network setup."""
    await websocket.accept()
    try:
        while True:
            await websocket.send_json(state.snapshot())
            await asyncio.sleep(1.0)
    except WebSocketDisconnect:
        pass
