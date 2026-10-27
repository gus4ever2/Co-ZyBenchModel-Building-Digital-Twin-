"""Static building geometry extracted from simulation timestep results."""

from dataclasses import dataclass, field
from math import isfinite
from typing import Any

from pydantic import Field
from cosimulator.analytics.contracts import AnalyticsInput, AnalyticsResult


def _number(value: Any) -> float | None:
    return float(value) if isinstance(value, (int, float)) and not isinstance(value, bool) and isfinite(value) else None


@dataclass(slots=True)
class BuildingData:
    zones: dict[str, dict[str, float]] = field(default_factory=dict)


class BuildingResult(AnalyticsResult):
    totalFloorAreaM2: float | None = None
    totalVolumeM3: float | None = None
    byZone: dict[str, dict] = Field(default_factory=dict)


def calculate_building(input: AnalyticsInput, data: BuildingData) -> None:
    """Keep the first valid area and volume reported for each thermal zone."""
    for name, values in (input.results.get("zone_internal_variable_values") or {}).items():
        target = data.zones.setdefault(name, {})
        for field_name in ("floor_area_m2", "air_volume_m3"):
            value = _number(values.get(field_name))
            if value is not None:
                target.setdefault(field_name, value)


def create_building_result(data: BuildingData) -> BuildingResult:
    def total(field_name: str) -> float | None:
        values = [zone[field_name] for zone in data.zones.values() if field_name in zone]
        return sum(values) if values else None
    return BuildingResult(totalFloorAreaM2=total("floor_area_m2"), totalVolumeM3=total("air_volume_m3"), byZone=data.zones)
