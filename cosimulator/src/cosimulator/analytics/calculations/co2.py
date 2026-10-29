"""CO2 analytics: normal summary, baseline storage and delta-CO2 comparison."""

from dataclasses import dataclass, field
from datetime import datetime
from math import isfinite
from typing import Any

from cosimulator.analytics.contracts import AnalyticsInput, AnalyticsResult


def _number(value: Any) -> float | None:
    """Keep finite numeric simulation values and reject missing ones."""
    if isinstance(value, (int, float)) and not isinstance(value, bool) and isfinite(value):
        return float(value)
    return None


@dataclass(slots=True)
class Co2Data:
    """All state needed by this one CO2 analytic.

    During a normal analysis only the summary fields are used. During a
    multi-simulation comparison, the same object also keeps the first
    simulation's CO2 values and the deltas of every later simulation.
    """

    active_simulation_id: str | None = None
    total_ppm: float = 0.0
    sample_count: int = 0
    maximum_ppm: float | None = None
    threshold_steps: int = 0
    baseline_id: str | None = None
    baseline_values: dict[tuple[str, str], float | None] = field(
        default_factory=dict
    )
    delta_points: dict[str, dict[str, list[dict[str, Any]]]] = field(
        default_factory=dict
    )


class Co2Result(AnalyticsResult):
    averageCo2Ppm: float | None = None
    maxCo2Ppm: float | None = None
    co2ThresholdSteps: int | None = None
    comparison: dict[str, Any] | None = None

# Per-timestep aggregation --------------------------------------------------
# Normal analysis and comparison analysis share this single input pass.

def calculate_co2(input: AnalyticsInput, data: Co2Data) -> None:
    """Read one timestep and update every CO2 value this analytic owns."""
    _start_simulation(input.simulation_id, data)
    if data.baseline_id is None:
        data.baseline_id = input.simulation_id

    timestamp = input.timestamp.isoformat() if input.timestamp is not None else None
    zone_results = input.results.get("zone_results") or {}

    for zone_name, zone in zone_results.items():
        ppm = _number(zone.get("co2_concentration_ppm"))

        if ppm is not None:
            data.total_ppm += ppm
            data.sample_count += 1
            data.maximum_ppm = (
                ppm if data.maximum_ppm is None else max(data.maximum_ppm, ppm)
            )
            data.threshold_steps += ppm > 1000

        if timestamp is not None:
            _calculate_delta(input, data, timestamp, zone_name, ppm)


def create_co2_result(data: Co2Data) -> Co2Result:
    """Create the API result after the final timestep."""
    return Co2Result(
        averageCo2Ppm=data.total_ppm / data.sample_count if data.sample_count else None,
        maxCo2Ppm=data.maximum_ppm,
        co2ThresholdSteps=data.threshold_steps if data.sample_count else None,
        comparison=_comparison_result(data) if data.delta_points else None,
    )


def _start_simulation(simulation_id: str, data: Co2Data) -> None:
    """Reset only the ordinary summary when the next simulation begins."""
    if data.active_simulation_id == simulation_id:
        return

    data.active_simulation_id = simulation_id
    data.total_ppm = 0.0
    data.sample_count = 0
    data.maximum_ppm = None
    data.threshold_steps = 0

# Baseline and delta series -------------------------------------------------
# The first simulation supplies the baseline; later simulations append their
# aligned per-zone delta points for charts and comparison metrics.

def _calculate_delta(
    input: AnalyticsInput,
    data: Co2Data,
    timestamp: str,
    zone_name: str,
    ppm: float | None,
) -> None:
    """Store baseline CO2 once, then calculate delta CO2 for later runs."""
    key = (timestamp, zone_name)
    if input.simulation_id == data.baseline_id:
        data.baseline_values[key] = ppm
        return

    baseline_ppm = data.baseline_values.get(key)
    delta_ppm = baseline_ppm - ppm if baseline_ppm is not None and ppm is not None else None
    data.delta_points.setdefault(input.simulation_id, {}).setdefault(zone_name, []).append(
        {
            "timestamp": timestamp.replace("+00:00", "Z"),
            "deltaCo2Ppm": delta_ppm,
            "baselineCo2Ppm": baseline_ppm,
            "comparedCo2Ppm": ppm,
        }
    )


def _comparison_result(data: Co2Data) -> dict[str, Any]:
    """Build the CO2-only comparison payload from values this file collected."""
    comparisons: list[dict[str, Any]] = []
    timestamps: list[str] = []

    for simulation_id, zones in data.delta_points.items():
        thermal_zones: list[dict[str, Any]] = []
        for zone_name, points in zones.items():
            # Simulation timestamps represent the simulated clock. Keep the
            # established weekday windows rather than applying a local timezone.
            weekday_points = [
                (datetime.fromisoformat(point["timestamp"].replace("Z", "+00:00")), point)
                for point in points
            ]
            weekday_points = [item for item in weekday_points if item[0].weekday() < 5]
            night = [point for time, point in weekday_points if time.hour >= 22 or time.hour < 8]
            lights_on = [point for time, point in weekday_points if 8 <= time.hour < 22]

            def values(items: list[dict[str, Any]], field: str) -> list[float]:
                return [item[field] for item in items if item.get(field) is not None]

            def mean(items: list[float]) -> float | None:
                return sum(items) / len(items) if items else None

            daytime_deltas = values(lights_on, "deltaCo2Ppm")
            night_deltas = values(night, "deltaCo2Ppm")
            valid_deltas = values(points, "deltaCo2Ppm")

            def average_comparison(
                items: list[dict[str, Any]],
            ) -> dict[str, float | None]:
                paired_points = [
                    item
                    for item in items
                    if item.get("baselineCo2Ppm") is not None
                    and item.get("comparedCo2Ppm") is not None
                ]
                baseline_values = [item["baselineCo2Ppm"] for item in paired_points]
                compared_values = [item["comparedCo2Ppm"] for item in paired_points]
                baseline_mean = mean(baseline_values)
                compared_mean = mean(compared_values)
                difference_percent = (
                    (compared_mean - baseline_mean) / baseline_mean * 100.0
                    if baseline_mean not in (None, 0.0) and compared_mean is not None
                    else None
                )
                return {
                    "baselinePpm": baseline_mean,
                    "comparedPpm": compared_mean,
                    "differencePercent": difference_percent,
                }

            timestamps.extend(point["timestamp"] for point in points)
            thermal_zones.append(
                {
                    "zoneName": zone_name,
                    "deltaCo2Series": [
                        {"timestamp": point["timestamp"], "ppm": point["deltaCo2Ppm"]}
                        for point in points
                    ],
                    "summary": {
                        "meanDeltaCo2Ppm": (
                            sum(valid_deltas) / len(valid_deltas)
                            if valid_deltas
                            else None
                        ),
                        "maxDeltaCo2Ppm": max(valid_deltas) if valid_deltas else None,
                        "minDeltaCo2Ppm": min(valid_deltas) if valid_deltas else None,
                        "meanDaytimeWeekdayDeltaCo2Ppm": mean(daytime_deltas),
                        "maxDaytimeWeekdayDeltaCo2Ppm": max(daytime_deltas) if daytime_deltas else None,
                        "minDaytimeWeekdayDeltaCo2Ppm": min(daytime_deltas) if daytime_deltas else None,
                        "meanNightWeekdayDeltaCo2Ppm": mean(night_deltas),
                        "averageCo2": average_comparison(points),
                        "daytimeWeekdayAverageCo2": average_comparison(lights_on),
                        "nightWeekdayAverageCo2": average_comparison(night),
                    },
                }
            )

        comparisons.append(
            {"simulation": {"id": simulation_id}, "thermalZones": thermal_zones}
        )

    return {
        "comparisons": comparisons,
        "analysisRange": {
            "start": min(timestamps) if timestamps else None,
            "end": max(timestamps) if timestamps else None,
        },
    }
