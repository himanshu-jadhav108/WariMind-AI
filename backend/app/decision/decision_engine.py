"""
Decision Engine - WariMind AI's "hero feature".

Turns a risk state into concrete, rule-based recommendations. Every
recommendation here is generated deterministically from the current risk
level and the zone that triggered it - nothing is randomly chosen or
hardcoded per-demo.

Rules are intentionally simple and fully visible (no black-box ML) so the
logic can be explained and audited in the Stage 2 pitch.
"""
from app.config import settings

_LEVEL_ORDER = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]


def _meets_trigger(level: str) -> bool:
    return _LEVEL_ORDER.index(level) >= _LEVEL_ORDER.index(settings.DECISION_RISK_TRIGGER)


def generate_recommendations(risk: dict, zone_density: dict, flow: dict) -> dict:
    """
    risk:         output of analytics.risk.compute_risk_score
    zone_density: output of analytics.density.compute_zone_density
    flow:         output of analytics.flow.FlowEstimator.update
    """
    level = risk["level"]
    if not zone_density:
        busiest_zone, busiest_count = "UNKNOWN", 0
    else:
        busiest_zone, busiest_info = max(zone_density.items(), key=lambda kv: kv[1]["count"])
        busiest_count = busiest_info["count"]

    if not _meets_trigger(level):
        return {
            "triggered": False,
            "risk_level": level,
            "zone": None,
            "actions": [],
            "reason": f"Risk level {level} is below the {settings.DECISION_RISK_TRIGGER} trigger threshold.",
        }

    actions = [f"Deploy volunteers to {busiest_zone}"]

    if flow.get("concentration", 0) > 0.5:
        actions.append(f"Monitor incoming flow ({flow.get('direction', 'NE')} into {busiest_zone})")
    else:
        actions.append("Monitor incoming flow")

    actions.append("Consider alternate route")
    actions.append("Position medical support")

    return {
        "triggered": True,
        "risk_level": level,
        "zone": busiest_zone,
        "zone_count": busiest_count,
        "actions": actions,
        "reason": f"Risk level {level} in {busiest_zone} ({busiest_count} people) met or exceeded the "
                  f"{settings.DECISION_RISK_TRIGGER} trigger threshold.",
    }


def volunteer_alert(recommendation: dict) -> dict | None:
    """Shapes a decision-engine recommendation into the Volunteer View alert payload."""
    if not recommendation.get("triggered"):
        return None
    return {
        "title": f"{recommendation['risk_level']} CROWD RISK",
        "zone": recommendation["zone"],
        "task": f"Move to {recommendation['zone']}",
        "reason": "Increasing crowd density detected.",
        "actions": recommendation["actions"],
    }
