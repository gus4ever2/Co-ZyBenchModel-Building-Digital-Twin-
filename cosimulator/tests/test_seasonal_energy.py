from datetime import datetime
import math

import pytest

from cosimulator.analytics.runner import run
from cosimulator.analytics.service import AnalyticsService


def row(timestamp, kwh=1.0):
    return {"simulation_timestamp": timestamp, "results": {
        "meter_results": {"heating_electricity_j": kwh * 3_600_000,
                         "cooling_electricity_j": kwh * 2 * 3_600_000,
                         "hvac_electricity_j": kwh * 4 * 3_600_000},
        "zone_internal_variable_values": {"Office": {"floor_area_m2": 10, "air_volume_m3": 30}},
    }}


def test_periods_partition_all_months_and_preserve_annual_energy():
    response = run("case", [row(datetime(2006, month, 15, 12)) for month in range(1, 13)])
    periods = response.results["seasonal_energy"]["periods"]
    assert periods["maySeptember"]["timestepCount"] == 5
    assert periods["octoberApril"]["timestepCount"] == 7
    assert periods["maySeptember"]["metrics"]["totalHeatingKwh"] == 5
    assert periods["octoberApril"]["metrics"]["totalCoolingKwh"] == 14
    assert sum(p["metrics"]["totalHvacKwh"] for p in periods.values()) == response.metrics["totalHvacKwh"]
    assert periods["maySeptember"]["metrics"]["hvacKwhPerM2"] == 2


def test_interval_end_boundaries_do_not_move_energy_into_the_next_period():
    response = run("case", [row(datetime(2006, 5, 1)), row(datetime(2006, 5, 1, 0, 20)),
                            row(datetime(2006, 10, 1)), row(datetime(2006, 10, 1, 0, 20))])
    periods = response.results["seasonal_energy"]["periods"]
    assert periods["maySeptember"]["timestepCount"] == 2
    assert periods["octoberApril"]["timestepCount"] == 2
    assert any(point["hvacKwh"] is None for point in periods["octoberApril"]["series"])
    assert periods["maySeptember"]["series"][0]["timestamp"] == "2006-05-01T00:20:00Z"


def test_three_simulations_use_the_same_baseline_and_match_graph_timestamps():
    t1, t2 = datetime(2006, 6, 1, 12), datetime(2006, 6, 1, 12, 20)
    responses = {
        "baseline": run("baseline", [row(t1, 1), row(t2, 2)]).model_dump(),
        "first": run("first", [row(t1, .5), row(t2, 3)]).model_dump(),
        "second": run("second", [row(t1, 2), row(datetime(2006, 6, 2, 12), 1)]).model_dump(),
    }
    AnalyticsService._attach_seasonal_deltas(responses, "baseline")
    first = responses["first"]["results"]["seasonal_energy"]["periods"]["maySeptember"]
    second = responses["second"]["results"]["seasonal_energy"]["periods"]["maySeptember"]
    assert first["metrics"]["totalHvacKwhDelta"] == 2
    assert first["metrics"]["totalHvacKwhDeltaPercent"] == pytest.approx(100 / 6)
    assert [p["hvacDeltaKwh"] for p in first["series"]] == [-2, 4]
    assert second["series"][0]["hvacDeltaKwh"] == 4
    assert second["series"][1]["hvacDeltaKwh"] is None


def test_empty_period_and_missing_meters_are_not_fabricated_zeroes():
    response = run("case", [{"simulation_timestamp": datetime(2006, 6, 1), "results": {}}])
    periods = response.results["seasonal_energy"]["periods"]
    assert periods["maySeptember"]["metrics"]["totalHvacKwh"] is None
    assert periods["octoberApril"]["metrics"]["totalHvacKwh"] is None
    responses = {"baseline": response.model_dump(), "case": run("case", []).model_dump()}
    AnalyticsService._attach_seasonal_deltas(responses, "baseline")
    assert responses["case"]["results"]["seasonal_energy"]["periods"]["maySeptember"]["metrics"]["totalHvacKwhDeltaPercent"] is None
