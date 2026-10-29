"""Zone-air-temperature and comfort-bound summary."""

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
class TemperatureData:
    total_c: float = 0.0
    sample_count: int = 0
    valid_bounds: int = 0
    violations: int = 0
    setpoints_by_zone: dict[str, dict[str, set[float]]] = field(default_factory=dict)


class TemperatureResult(AnalyticsResult):
    averageTemperatureC: float | None = None
    comfortViolationSteps: int | None = None
    setpointsByZone: dict[str, dict[str, list[float]]] = Field(default_factory=dict)


def calculate_temperature(input: AnalyticsInput, data: TemperatureData) -> None:
    """Accumulate temperatures and check only setpoint bounds that are present."""
    for name, zone in (input.results.get("zone_results") or {}).items():
        settings = data.setpoints_by_zone.setdefault(name, {"heatingC": set(), "coolingC": set()})
        for result_field, output_field in (("heating_setpoint_c", "heatingC"), ("cooling_setpoint_c", "coolingC")):
            value = _number(zone.get(result_field))
            if value is not None:
                settings[output_field].add(value)
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
        setpointsByZone={
            name: {field: sorted(values) for field, values in settings.items()}
            for name, settings in data.setpoints_by_zone.items()
        },
    )
