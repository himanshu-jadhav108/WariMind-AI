"""
Lightweight centroid tracker.

Ultralytics YOLO ships with a built-in ByteTrack/BoT-SORT tracker
(``model.track(...)``) which we use when the YOLO backend is active.
When we're on the OpenCV HOG fallback (no Ultralytics installed), we still
need consistent IDs across frames for flow/trend analysis, so we use this
simple, dependency-free centroid tracker. It is not as robust as ByteTrack
under heavy occlusion, but it is stable and requires nothing beyond numpy.
"""
import numpy as np


class CentroidTracker:
    def __init__(self, max_disappeared: int = 15, max_distance: float = 80.0):
        self.next_id = 0
        self.objects = {}       # id -> centroid (x, y)
        self.disappeared = {}   # id -> frames since last seen
        self.max_disappeared = max_disappeared
        self.max_distance = max_distance

    @staticmethod
    def _centroid(bbox):
        x1, y1, x2, y2 = bbox
        return ((x1 + x2) / 2.0, (y1 + y2) / 2.0)

    def update(self, detections):
        """detections: list of {"bbox": [...], "confidence": f}
        Returns list of same dicts, each with an added "track_id"."""
        input_centroids = [self._centroid(d["bbox"]) for d in detections]

        if len(self.objects) == 0:
            for c in input_centroids:
                self._register(c)
        elif len(input_centroids) == 0:
            for oid in list(self.disappeared.keys()):
                self._mark_disappeared(oid)
        else:
            object_ids = list(self.objects.keys())
            object_centroids = list(self.objects.values())

            D = np.linalg.norm(
                np.array(object_centroids)[:, None] - np.array(input_centroids)[None, :],
                axis=2,
            )
            rows = D.min(axis=1).argsort()
            cols = D.argmin(axis=1)[rows]

            used_rows, used_cols = set(), set()
            for row, col in zip(rows, cols):
                if row in used_rows or col in used_cols:
                    continue
                if D[row, col] > self.max_distance:
                    continue
                oid = object_ids[row]
                self.objects[oid] = input_centroids[col]
                self.disappeared[oid] = 0
                used_rows.add(row)
                used_cols.add(col)

            unused_rows = set(range(len(object_centroids))) - used_rows
            for row in unused_rows:
                self._mark_disappeared(object_ids[row])

            unused_cols = set(range(len(input_centroids))) - used_cols
            for col in unused_cols:
                self._register(input_centroids[col])

        # Assign track ids back onto detections in order by nearest match.
        id_by_centroid = {v: k for k, v in self.objects.items()}
        out = []
        for d, c in zip(detections, input_centroids):
            # find the closest registered centroid (handles float rounding)
            best_id, best_dist = None, float("inf")
            for oid, oc in self.objects.items():
                dist = (oc[0] - c[0]) ** 2 + (oc[1] - c[1]) ** 2
                if dist < best_dist:
                    best_dist, best_id = dist, oid
            out.append({**d, "track_id": best_id})
        return out

    def _register(self, centroid):
        self.objects[self.next_id] = centroid
        self.disappeared[self.next_id] = 0
        self.next_id += 1

    def _mark_disappeared(self, oid):
        self.disappeared[oid] += 1
        if self.disappeared[oid] > self.max_disappeared:
            self.objects.pop(oid, None)
            self.disappeared.pop(oid, None)
