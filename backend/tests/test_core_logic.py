"""
Core logic tests - runnable with either `pytest` or plain
`python -m unittest`. Deliberately stdlib-only (unittest) so they run
even on a machine without pytest installed.
"""
import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.analytics import density, flow, risk
from app.decision import decision_engine


class TestDensity(unittest.TestCase):
    def test_classify_density_levels(self):
        self.assertEqual(density.classify_density(0), "LOW")
        self.assertEqual(density.classify_density(30), "LOW")
        self.assertEqual(density.classify_density(31), "MEDIUM")
        self.assertEqual(density.classify_density(60), "MEDIUM")
        self.assertEqual(density.classify_density(61), "HIGH")
        self.assertEqual(density.classify_density(80), "HIGH")
        self.assertEqual(density.classify_density(81), "CRITICAL")
        self.assertEqual(density.classify_density(500), "CRITICAL")

    def test_zone_for_point_quadrants(self):
        # 2x2 grid over a 1000x1000 frame
        self.assertEqual(density.zone_for_point(10, 10, 1000, 1000), "ZONE A")
        self.assertEqual(density.zone_for_point(900, 10, 1000, 1000), "ZONE B")
        self.assertEqual(density.zone_for_point(10, 900, 1000, 1000), "ZONE C")
        self.assertEqual(density.zone_for_point(900, 900, 1000, 1000), "ZONE D")

    def test_compute_zone_density_counts(self):
        dets = [
            {"bbox": [5, 5, 15, 15]},     # zone A
            {"bbox": [905, 5, 915, 15]},  # zone B
            {"bbox": [910, 5, 920, 15]},  # zone B
        ]
        result = density.compute_zone_density(dets, 1000, 1000)
        self.assertEqual(result["ZONE A"]["count"], 1)
        self.assertEqual(result["ZONE B"]["count"], 2)
        self.assertEqual(result["ZONE C"]["count"], 0)
        self.assertEqual(result["ZONE D"]["count"], 0)

    def test_overall_density_score_scales_with_busiest_zone(self):
        zd_low = {"ZONE A": {"count": 5, "level": "LOW"}}
        zd_high = {"ZONE A": {"count": 90, "level": "CRITICAL"}}
        self.assertLess(density.overall_density_score(zd_low), density.overall_density_score(zd_high))

    def test_heatmap_shape_and_range(self):
        dets = [{"bbox": [100, 100, 120, 140]}, {"bbox": [300, 200, 320, 240]}]
        heat = density.generate_heatmap(dets, 640, 480)
        self.assertEqual(heat.shape, (480, 640))
        self.assertGreaterEqual(heat.min(), 0.0)
        self.assertLessEqual(heat.max(), 1.0 + 1e-6)


class TestFlow(unittest.TestCase):
    def test_flow_stationary_with_no_history(self):
        est = flow.FlowEstimator()
        result = est.update([{"bbox": [0, 0, 10, 10], "track_id": 1}])
        self.assertEqual(result["direction"], "STATIONARY")

    def test_flow_detects_dominant_direction(self):
        est = flow.FlowEstimator()
        est.update([{"bbox": [0, 0, 10, 10], "track_id": 1}])
        # move strongly to the east (+x)
        result = est.update([{"bbox": [50, 0, 60, 10], "track_id": 1}])
        self.assertEqual(result["direction"], "E")
        self.assertGreater(result["concentration"], 0)


class TestRisk(unittest.TestCase):
    def test_low_inputs_give_low_risk(self):
        r = risk.compute_risk_score(density_score=5, growth_pct=0, flow_concentration=0.1, busiest_zone_count=3)
        self.assertEqual(r["level"], "LOW")

    def test_high_inputs_give_critical_risk(self):
        r = risk.compute_risk_score(density_score=100, growth_pct=50, flow_concentration=0.9, busiest_zone_count=100)
        self.assertEqual(r["level"], "CRITICAL")

    def test_score_is_clamped_0_100(self):
        r = risk.compute_risk_score(density_score=1000, growth_pct=500, flow_concentration=5, busiest_zone_count=9999)
        self.assertLessEqual(r["score"], 100.0)
        self.assertGreaterEqual(r["score"], 0.0)

    def test_classify_risk_boundaries(self):
        self.assertEqual(risk.classify_risk(0), "LOW")
        self.assertEqual(risk.classify_risk(40), "LOW")
        self.assertEqual(risk.classify_risk(41), "MEDIUM")
        self.assertEqual(risk.classify_risk(65), "MEDIUM")
        self.assertEqual(risk.classify_risk(66), "HIGH")
        self.assertEqual(risk.classify_risk(80), "HIGH")
        self.assertEqual(risk.classify_risk(81), "CRITICAL")


class TestDecisionEngine(unittest.TestCase):
    def test_no_recommendation_below_trigger(self):
        risk_state = {"score": 30, "level": "LOW"}
        zd = {"ZONE A": {"count": 5, "level": "LOW"}}
        rec = decision_engine.generate_recommendations(risk_state, zd, {"direction": "N", "concentration": 0.1})
        self.assertFalse(rec["triggered"])

    def test_recommendation_triggers_at_high(self):
        risk_state = {"score": 70, "level": "HIGH"}
        zd = {"ZONE A": {"count": 5, "level": "LOW"}, "ZONE B": {"count": 70, "level": "HIGH"}}
        rec = decision_engine.generate_recommendations(risk_state, zd, {"direction": "NE", "concentration": 0.7})
        self.assertTrue(rec["triggered"])
        self.assertEqual(rec["zone"], "ZONE B")
        self.assertTrue(any("Deploy" in a for a in rec["actions"]))

    def test_critical_adds_alternate_route_and_medical(self):
        risk_state = {"score": 90, "level": "CRITICAL"}
        zd = {"ZONE B": {"count": 95, "level": "CRITICAL"}}
        rec = decision_engine.generate_recommendations(risk_state, zd, {"direction": "S", "concentration": 0.3})
        actions_text = " ".join(rec["actions"])
        self.assertIn("alternate route", actions_text.lower())
        self.assertIn("medical", actions_text.lower())

    def test_volunteer_alert_shape(self):
        risk_state = {"score": 90, "level": "CRITICAL"}
        zd = {"ZONE B": {"count": 95, "level": "CRITICAL"}}
        rec = decision_engine.generate_recommendations(risk_state, zd, {"direction": "S", "concentration": 0.3})
        alert = decision_engine.volunteer_alert(rec)
        self.assertEqual(alert["zone"], "ZONE B")
        self.assertIn("Move to ZONE B", alert["task"])

    def test_no_alert_when_not_triggered(self):
        rec = {"triggered": False}
        self.assertIsNone(decision_engine.volunteer_alert(rec))


if __name__ == "__main__":
    unittest.main()
