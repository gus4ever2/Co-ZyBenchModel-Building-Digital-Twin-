"""Weekday-morning outdoor-air fraction summary."""

from dataclasses import dataclass, field
from math import isfinite
from typing import Any

from pydantic import Field

from cosimulator.analytics.contracts import AnalyticsInput, AnalyticsResult


def _number(value: Any) -> float | None:
    if isinstance(value, (int, float)) and not isinstance(value, bool) and isfinite(value):
        return float(value)
    return None


@dataclass(slots=True)
class VentilationData:
    active_simulation_id: str | None = None
    baseline_simulation_id: str | None = None
    total_fraction: float = 0.0
    sample_count: int = 0
    window_opening_total_by_zone: dict[str, float] = field(default_factory=dict)
    window_opening_sample_count_by_zone: dict[str, int] = field(default_factory=dict)
    baseline_window_opening_percent_by_zone: dict[str, float] = field(default_factory=dict)


class VentilationResult(AnalyticsResult):
    meanOutdoorAirFraction: float | None = None
    meanOutdoorAirPercent: float | None = None
    meanWindowOpeningPercentByZone: dict[str, float | None] = Field(default_factory=dict)
    meanWindowOpeningDeltaPercentByZone: dict[str, float | None] = Field(default_factory=dict)


def calculate_ventilation(input: AnalyticsInput, data: VentilationData) -> None:
    """Summarize outdoor air and per-zone window opening."""
    if data.active_simulation_id != input.simulation_id:
        data.active_simulation_id = input.simulation_id
        if data.baseline_simulation_id is None:
            data.baseline_simulation_id = input.simulation_id
        data.total_fraction = 0.0
        data.sample_count = 0
        data.window_opening_total_by_zone.clear()
        data.window_opening_sample_count_by_zone.clear()

    window_opening_results = input.results.get("window_opening_results") or {}
    for key, zone in window_opening_results.items():
        zone_name = zone.get("zone_name") or key
        factors = [
            factor
            for window in (zone.get("window_results") or [])
            if isinstance(window, dict)
            and isinstance((factor := window.get("opening_factor")), (int, float))
            and not isinstance(factor, bool)
            and isfinite(factor)
            and 0.0 <= factor <= 1.0
        ]
        timestep_mean = (
            sum(factors) / len(factors)
            if factors
            else _number(zone.get("mean_opening_percent"))
        )
        if not factors and timestep_mean is not None:
            timestep_mean = timestep_mean / 100.0
        if timestep_mean is not None and 0.0 <= timestep_mean <= 1.0:
            data.window_opening_total_by_zone[zone_name] = (
                data.window_opening_total_by_zone.get(zone_name, 0.0)
                + timestep_mean
            )
            data.window_opening_sample_count_by_zone[zone_name] = (
                data.window_opening_sample_count_by_zone.get(zone_name, 0) + 1
            )

    # Outdoor-air metrics retain their established Monday-Friday 08:00–10:00 window.
    timestamp = input.timestamp
    if timestamp is None or timestamp.weekday() >= 5 or not 8 <= timestamp.hour < 10:
        return

    fraction = _number(input.results.get("outdoor_air_flow_fraction"))
    if fraction is not None:
        data.total_fraction += fraction
        data.sample_count += 1


def create_ventilation_result(data: VentilationData) -> VentilationResult:
    mean = data.total_fraction / data.sample_count if data.sample_count else None
    mean_window_opening = {
        zone_name: (
            total / data.window_opening_sample_count_by_zone[zone_name] * 100.0
        )
        for zone_name, total in data.window_opening_total_by_zone.items()
    }
    if data.active_simulation_id == data.baseline_simulation_id:
        data.baseline_window_opening_percent_by_zone = dict(mean_window_opening)
        window_opening_delta = {zone_name: 0.0 for zone_name in mean_window_opening}
    else:
        window_opening_delta = {
            zone_name: (
                (value - baseline) / baseline * 100.0
                if baseline != 0.0
                else None
            )
            for zone_name, value in mean_window_opening.items()
            if (
                baseline := data.baseline_window_opening_percent_by_zone.get(
                    zone_name
                )
            )
            is not None
        }
    return VentilationResult(
        meanOutdoorAirFraction=mean,
        meanOutdoorAirPercent=mean * 100 if mean is not None else None,
        meanWindowOpeningPercentByZone=mean_window_opening,
        meanWindowOpeningDeltaPercentByZone=window_opening_delta,
    )
