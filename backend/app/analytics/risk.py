"""
Prototype Risk Estimation engine.

This is a transparent, heuristic scoring formula - NOT a scientifically
validated predictive model. The formula and weights are fully visible here
and in backend/app/config/settings.py (RISK_WEIGHTS).

    risk_score = w1*density + w2*density_growth + w3*flow_concentration
                 + w4*capacity_utilization

All four inputs are normalized to a 0-100 scale before weighting, and the
final score is clamped to [0, 100].
"""
from app.config import settings


def _clamp(value, lo=0.0, hi=100.0):
    return max(lo, min(hi, value))


def classify_risk(score: float) -> str:
    for level, (lo, hi) in settings.RISK_LEVELS.items():
        if lo <= score <= hi:
            return level
    return "CRITICAL"


def compute_risk_score(density_score: float, growth_pct: float,
                        flow_concentration: float, busiest_zone_count: int) -> dict:
    """
    density_score:        0-100, from analytics.density.overall_density_score
    growth_pct:            e.g. +18.0 means density rose 18% over the window
    flow_concentration:    0-1, from analytics.flow.FlowEstimator
    busiest_zone_count:    raw person count in the most crowded zone
    """
    w = settings.RISK_WEIGHTS

    density_component = _clamp(density_score)
    growth_component = _clamp(50 + growth_pct)  # 0% growth -> 50 (neutral midpoint)
    flow_component = _clamp(flow_concentration * 100)
    capacity_component = _clamp((busiest_zone_count / settings.ZONE_CAPACITY) * 100)

    score = (
        w["density"] * density_component
        + w["density_growth"] * growth_component
        + w["flow_concentration"] * flow_component
        + w["capacity_utilization"] * capacity_component
    )
    score = round(_clamp(score), 1)

    return {
        "score": score,
        "level": classify_risk(score),
        "components": {
            "density": round(density_component, 1),
            "density_growth": round(growth_component, 1),
            "flow_concentration": round(flow_component, 1),
            "capacity_utilization": round(capacity_component, 1),
        },
        "weights": w,
        "label": "Prototype Risk Estimation",
    }
