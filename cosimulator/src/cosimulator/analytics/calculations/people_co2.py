"""Estimated people-generated CO2 concentration increase by thermal zone."""

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
class PeopleCo2Data:
    total_by_zone: dict[str, float] = field(default_factory=dict)
    sample_count_by_zone: dict[str, int] = field(default_factory=dict)


class PeopleCo2Result(AnalyticsResult):
    byZone: dict[str, float | None] = Field(default_factory=dict)


def calculate_people_co2(input: AnalyticsInput, data: PeopleCo2Data) -> None:
    """Estimate weekday-morning source strength from occupants and air volume."""
    timestamp = input.timestamp
    if timestamp is None or timestamp.weekday() >= 5 or not 8 <= timestamp.hour < 10:
        return

    zone_results = input.results.get("zone_results") or {}
    internal_values = input.results.get("zone_internal_variable_values") or {}
    for zone_name, zone in zone_results.items():
        occupants = _number(zone.get("occupant_count"))
        volume = _number((internal_values.get(zone_name) or {}).get("air_volume_m3"))
        if occupants is None or occupants <= 0 or volume is None or volume <= 0:
            continue

        ppm_per_hour = occupants * 132 * 3.82e-8 / volume * 1_000_000 * 3600
        data.total_by_zone[zone_name] = data.total_by_zone.get(zone_name, 0.0) + ppm_per_hour
        data.sample_count_by_zone[zone_name] = data.sample_count_by_zone.get(zone_name, 0) + 1


def create_people_co2_result(data: PeopleCo2Data) -> PeopleCo2Result:
    return PeopleCo2Result(
        byZone={
            zone_name: data.total_by_zone[zone_name] / sample_count
            for zone_name, sample_count in data.sample_count_by_zone.items()
        }
    )
