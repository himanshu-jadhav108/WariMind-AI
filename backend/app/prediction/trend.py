"""
Prototype trend-based congestion prediction.

This is intentionally simple: it looks at the recent window of density
scores and reports whether density is rising, falling, or stable, and
projects that trend forward as a qualitative "predicted status".

Explicitly NOT a validated forecasting model - labeled "Prototype estimate"
everywhere it surfaces to the user, per the honesty requirement.
"""
from collections import deque

from app.config import settings


class TrendPredictor:
    def __init__(self, window_size: int = None):
        self.window_size = window_size or settings.RISK_WINDOW_SIZE
        self.history = deque(maxlen=self.window_size)

    def add_sample(self, density_score: float):
        self.history.append(density_score)

    def growth_rate(self) -> float:
        """% change from the start to the end of the current window."""
        if len(self.history) < 2:
            return 0.0
        start, end = self.history[0], self.history[-1]
        if start <= 0:
            return 0.0 if end <= 0 else 100.0
        return round(((end - start) / start) * 100.0, 1)

    def trend_label(self) -> str:
        growth = self.growth_rate()
        if growth > 5:
            return "INCREASING"
        if growth < -5:
            return "DECREASING"
        return "STABLE"

    def predicted_status(self, current_risk_level: str) -> str:
        """Naive forward projection: if trend is increasing and risk is
        already HIGH/CRITICAL, predict escalation; otherwise hold steady."""
        trend = self.trend_label()
        order = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
        idx = order.index(current_risk_level) if current_risk_level in order else 0

        if trend == "INCREASING" and idx < len(order) - 1:
            return f"{order[idx + 1]} RISK (Prototype estimate)"
        if trend == "DECREASING" and idx > 0:
            return f"{order[idx - 1]} RISK (Prototype estimate)"
        return f"{current_risk_level} RISK (Prototype estimate)"

    def snapshot(self, current_risk_level: str) -> dict:
        return {
            "trend": self.trend_label(),
            "growth_pct": self.growth_rate(),
            "predicted_status": self.predicted_status(current_risk_level),
            "window_size": len(self.history),
        }
