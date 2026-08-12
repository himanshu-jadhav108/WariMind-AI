"""
Person detector with automatic GPU/CPU selection and a real, working
fallback path.

Primary:  Ultralytics YOLO (yolo11n/yolo11s) - "person" class only.
Fallback: OpenCV HOGDescriptor + pre-trained SVM people detector.
          This ships inside opencv-python itself, needs no internet,
          no extra weights, and no GPU. If Ultralytics/torch aren't
          installed, or the YOLO weight file is missing, we drop to
          this automatically so the POC still runs end-to-end.

Both paths return the same normalized output format:
    [{"bbox": [x1, y1, x2, y2], "confidence": float}, ...]
"""
import logging
import os

import cv2
import numpy as np

logger = logging.getLogger("warimind.detector")


class PersonDetector:
    def __init__(self, model_path: str, confidence_threshold: float = 0.35, force_cpu: bool = False):
        self.confidence_threshold = confidence_threshold
        self.backend = None
        self.device = "cpu"
        self._yolo_model = None
        self._hog = None

        # --- Try YOLO first -------------------------------------------------
        tried_yolo_reason = None
        try:
            from ultralytics import YOLO
            import torch

            self.device = "cpu"
            if not force_cpu and torch.cuda.is_available():
                self.device = "cuda"

            target_model = model_path if os.path.exists(model_path) else "yolo11n.pt"
            self._yolo_model = YOLO(target_model)
            self.backend = "yolo11"
            logger.info("Detector backend: YOLO (%s) on %s", target_model, self.device)
        except ImportError as e:
            tried_yolo_reason = f"ultralytics/torch not installed ({e})"
        except Exception as e:  # noqa: BLE001 - defensive, POC must not crash
            tried_yolo_reason = f"failed to load YOLO weights ({e})"

        # --- Fallback: OpenCV HOG people detector ---------------------------
        if self.backend is None:
            logger.warning("Falling back to OpenCV HOG person detector: %s", tried_yolo_reason)
            self._hog = cv2.HOGDescriptor()
            self._hog.setSVMDetector(cv2.HOGDescriptor_getDefaultPeopleDetector())
            self.backend = "opencv_hog"
            self.device = "cpu"

    def is_gpu(self) -> bool:
        return self.device == "cuda"

    def detect(self, frame: np.ndarray):
        if self.backend and self.backend.startswith("yolo"):
            return self._detect_yolo(frame)
        return self._detect_hog(frame)

    def _detect_yolo(self, frame: np.ndarray):
        results = self._yolo_model.predict(
            frame, classes=[0], conf=self.confidence_threshold,
            device=self.device, verbose=False,
        )
        detections = []
        for r in results:
            for box in r.boxes:
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                conf = float(box.conf[0])
                detections.append({"bbox": [x1, y1, x2, y2], "confidence": conf})
        return detections

    def _detect_hog(self, frame: np.ndarray):
        # HOG works best on modest resolutions; resize for speed/accuracy balance.
        h, w = frame.shape[:2]
        scale = 640.0 / w if w > 640 else 1.0
        small = cv2.resize(frame, (int(w * scale), int(h * scale))) if scale != 1.0 else frame

        rects, weights = self._hog.detectMultiScale(
            small, winStride=(8, 8), padding=(8, 8), scale=1.05,
        )
        detections = []
        for (x, y, bw, bh), weight in zip(rects, weights):
            conf = float(1 / (1 + np.exp(-weight)))  # squash HOG's SVM score to ~[0,1]
            if conf < self.confidence_threshold:
                continue
            x1, y1, x2, y2 = x / scale, y / scale, (x + bw) / scale, (y + bh) / scale
            detections.append({"bbox": [x1, y1, x2, y2], "confidence": conf})
        return detections
