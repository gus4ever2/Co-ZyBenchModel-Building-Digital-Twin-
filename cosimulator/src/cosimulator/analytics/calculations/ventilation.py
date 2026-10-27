"""Weekday-morning outdoor-air fraction summary."""

from dataclasses import dataclass
from math import isfinite
from typing import Any

from cosimulator.analytics.contracts import AnalyticsInput, AnalyticsResult


def _number(value: Any) -> float | None:
    if isinstance(value, (int, float)) and not isinstance(value, bool) and isfinite(value):
        return float(value)
    return None


@dataclass(slots=True)
class VentilationData:
    total_fraction: float = 0.0
    sample_count: int = 0


class VentilationResult(AnalyticsResult):
    meanOutdoorAirFraction: float | None = None
    meanOutdoorAirPercent: float | None = None


def calculate_ventilation(input: AnalyticsInput, data: VentilationData) -> None:
    """Keep the established Monday-Friday 08:00–10:00 time window only."""
    timestamp = input.timestamp
    if timestamp is None or timestamp.weekday() >= 5 or not 8 <= timestamp.hour < 10:
        return

    fraction = _number(input.results.get("outdoor_air_flow_fraction"))
    if fraction is not None:
        data.total_fraction += fraction
        data.sample_count += 1


def create_ventilation_result(data: VentilationData) -> VentilationResult:
    mean = data.total_fraction / data.sample_count if data.sample_count else None
    return VentilationResult(
        meanOutdoorAirFraction=mean,
        meanOutdoorAirPercent=mean * 100 if mean is not None else None,
    )
