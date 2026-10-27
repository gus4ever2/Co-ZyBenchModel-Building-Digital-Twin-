"""Focused tests for the function-based analytics pipeline."""

import unittest
from datetime import datetime, timedelta, timezone

from cosimulator.analytics.calculations.co2 import Co2Data, calculate_co2, create_co2_result
from cosimulator.analytics.contracts import AnalyticsInput
from cosimulator.analytics.data import enrich
from cosimulator.analytics.runner import create_comparison_states, run


def step(index: int = 0, co2: float = 600, energy: float = 3_600_000, temperature: float = 22) -> dict:
    """Create one small Mongo-like timestep used by unit and API tests."""
    return {
        "simulation_timestamp": datetime(2026, 10, 12, 8, tzinfo=timezone.utc) + timedelta(minutes=index * 15),
        "timestep_number": index,
        "results": {
            "meter_results": {"hvac_electricity_j": energy},
            "outdoor_air_flow_fraction": 0.2,
            "zone_results": {"Office": {"co2_concentration_ppm": co2, "zone_air_temp_c": temperature,
                              "mean_radiant_temperature_c": 24, "occupant_count": 2,
                              "heating_setpoint_c": 20, "cooling_setpoint_c": 26}},
            "zone_internal_variable_values": {"Office": {"floor_area_m2": 10, "air_volume_m3": 30}},
            "plant_co2_exchange_results": {"Office": {"green_wall_area_m2": 3}},
        },
    }


class AnalyticsTests(unittest.TestCase):
    def test_standard_metrics(self):
        response = run("simulation", [step(), step(1, co2=800, temperature=28)])
        self.assertEqual(response.metrics["totalHvacKwh"], 2)
        self.assertEqual(response.metrics["averageCo2Ppm"], 700)
        self.assertEqual(response.metrics["comfortViolationSteps"], 1)
        self.assertEqual(response.metrics["hvacKwhPerM2"], 0.2)

    def test_missing_values_remain_null(self):
        metrics = run("empty", [{"results": {}}]).metrics
        self.assertIsNone(metrics["totalHvacKwh"])
        self.assertIsNone(metrics["averageCo2Ppm"])

    def test_comparison_calculates_delta_once(self):
        data = Co2Data()
        for simulation_id, co2 in (("baseline", 700), ("scenario", 600)):
            document = step(co2=co2)
            calculate_co2(AnalyticsInput(simulation_id=simulation_id,
                                         timestamp=document["simulation_timestamp"],
                                         timestep_number=0,
                                         results=document["results"]), data)
        result = create_co2_result(data).comparison
        self.assertEqual(result["comparisons"][0]["thermalZones"][0]["summary"]["meanDeltaCo2Ppm"], 100)

    def test_co2_comparison_weekday_windows_and_missing_values(self):
        data = Co2Data()
        times = [
            datetime(2026, 10, 12, 7, 45, tzinfo=timezone.utc),
            datetime(2026, 10, 12, 8, 0, tzinfo=timezone.utc),
            datetime(2026, 10, 12, 8, 15, tzinfo=timezone.utc),
            datetime(2026, 10, 12, 10, 0, tzinfo=timezone.utc),
            datetime(2026, 10, 12, 22, 0, tzinfo=timezone.utc),
            datetime(2026, 10, 17, 8, 0, tzinfo=timezone.utc),
        ]
        for simulation_id in ("baseline", "scenario"):
            for index, timestamp in enumerate(times):
                ppm = 700 if simulation_id == "baseline" else 700 - (index + 1) * 10
                if simulation_id == "scenario" and index == 2:
                    ppm = None
                calculate_co2(AnalyticsInput(
                    simulation_id=simulation_id,
                    timestamp=timestamp,
                    timestep_number=index,
                    results={"zone_results": {"Office": {"co2_concentration_ppm": ppm}}},
                ), data)

        summary = create_co2_result(data).comparison["comparisons"][0]["thermalZones"][0]["summary"]
        self.assertEqual(summary["meanMorningWeekdayDeltaCo2Ppm"], 20)
        self.assertEqual(summary["maxMorningWeekdayDeltaCo2Ppm"], 20)
        self.assertEqual(summary["minMorningWeekdayDeltaCo2Ppm"], 20)
        self.assertEqual(summary["meanMorningWeekdayDeltaCo2RatePpmPerHour"], 40)
        self.assertEqual(summary["meanLightsOnDeltaCo2Ppm"], 30)
        self.assertEqual(summary["meanLightsOffDeltaCo2Ppm"], 30)
        self.assertAlmostEqual(summary["meanNightWeekdayDeltaCo2RatePpmPerHour"], 10 / 12)

    def test_co2_window_without_samples_returns_null(self):
        data = Co2Data()
        for simulation_id, ppm in (("baseline", 700), ("scenario", 600)):
            calculate_co2(AnalyticsInput(
                simulation_id=simulation_id,
                timestamp=datetime(2026, 10, 17, 8, tzinfo=timezone.utc),
                timestep_number=0,
                results={"zone_results": {"Office": {"co2_concentration_ppm": ppm}}},
            ), data)
        summary = create_co2_result(data).comparison["comparisons"][0]["thermalZones"][0]["summary"]
        self.assertIsNone(summary["meanMorningWeekdayDeltaCo2Ppm"])
        self.assertIsNone(summary["meanLightsOnDeltaCo2Ppm"])

    def test_comparison_runner_reuses_one_state_for_two_runs(self):
        persistent_states = create_comparison_states()
        run("baseline", [step(0, co2=700)], persistent_states=persistent_states)
        response = run("scenario", [step(0, co2=600)], persistent_states=persistent_states)

        result = response.results["co2"]["comparison"]
        summary = result["comparisons"][0]["thermalZones"][0]["summary"]
        self.assertEqual(persistent_states["co2"][1].baseline_id, "baseline")
        self.assertEqual(summary["meanDeltaCo2Ppm"], 100)

    def test_enrich_does_not_change_source_document(self):
        document = step()
        enriched = enrich(document)
        self.assertNotIn("hvac_electricity_kwh", document["results"]["meter_results"])
        self.assertEqual(enriched["results"]["meter_results"]["hvac_electricity_kwh"], 1)


if __name__ == "__main__":
    unittest.main()
