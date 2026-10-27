"""Zone-air-temperature and comfort-bound summary."""

from dataclasses import dataclass
from math import isfinite
from typing import Any

from cosimulator.analytics.contracts import AnalyticsInput, AnalyticsResult


def _number(value: Any) -> float | None:
    if isinstance(value, (int, float)) and not isinstance(value, bool) and isfinite(value):
        return float(value)
    return None


@dataclass(slots=True)
class TemperatureData:
    total_c: float = 0.0
    sample_count: int = 0
    valid_bounds: int = 0
    violations: int = 0


class TemperatureResult(AnalyticsResult):
    averageTemperatureC: float | None = None
    comfortViolationSteps: int | None = None


def calculate_temperature(input: AnalyticsInput, data: TemperatureData) -> None:
    """Accumulate temperatures and check only setpoint bounds that are present."""
    for zone in (input.results.get("zone_results") or {}).values():
        temperature = _number(zone.get("zone_air_temp_c"))
        if temperature is None:
            continue

        data.total_c += temperature
        data.sample_count += 1
        heating = _number(zone.get("heating_setpoint_c"))
        cooling = _number(zone.get("cooling_setpoint_c"))
        if heating is not None or cooling is not None:
            data.valid_bounds += 1
            data.violations += (heating is not None and temperature < heating) or (cooling is not None and temperature > cooling)


def create_temperature_result(data: TemperatureData) -> TemperatureResult:
    return TemperatureResult(
        averageTemperatureC=data.total_c / data.sample_count if data.sample_count else None,
        comfortViolationSteps=data.violations if data.valid_bounds else None,
    )
