"""Green-wall area calculation from plant exchange results."""

from dataclasses import dataclass, field
from math import isfinite
from typing import Any

from pydantic import Field
from cosimulator.analytics.contracts import AnalyticsInput, AnalyticsResult


def _number(value: Any) -> float | None:
    return float(value) if isinstance(value, (int, float)) and not isinstance(value, bool) and isfinite(value) else None


@dataclass(slots=True)
class GreenWallData:
    total_area: float = 0.0
    sample_count: int = 0
    area_by_zone: dict[str, list[float]] = field(default_factory=dict)


class GreenWallResult(AnalyticsResult):
    averageGreenWallAreaM2: float | None = None
    byZone: dict[str, float | None] = Field(default_factory=dict)


def calculate_green_wall(input: AnalyticsInput, data: GreenWallData) -> None:
    """Use one area observation for both global and per-zone summaries."""
    for plant_key, values in (input.results.get("plant_co2_exchange_results") or {}).items():
        area = _number(values.get("green_wall_area_m2"))
        if area is None:
            continue
        zone_name = values.get("zone_name") or plant_key
        data.total_area += area
        data.sample_count += 1
        data.area_by_zone.setdefault(zone_name, []).append(area)


def create_green_wall_result(data: GreenWallData) -> GreenWallResult:
    return GreenWallResult(averageGreenWallAreaM2=data.total_area / data.sample_count if data.sample_count else None,
                           byZone={name: sum(values) / len(values) for name, values in data.area_by_zone.items()})
