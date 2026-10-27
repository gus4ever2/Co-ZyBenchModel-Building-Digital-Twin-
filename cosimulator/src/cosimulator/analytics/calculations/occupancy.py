"""Peak occupancy summary for all thermal-zone timesteps."""

from dataclasses import dataclass
from math import isfinite
from typing import Any

from cosimulator.analytics.contracts import AnalyticsInput, AnalyticsResult


def _number(value: Any) -> float | None:
    if isinstance(value, (int, float)) and not isinstance(value, bool) and isfinite(value):
        return float(value)
    return None


@dataclass(slots=True)
class OccupancyData:
    peak: float | None = None


class OccupancyResult(AnalyticsResult):
    peakOccupants: float | None = None


def calculate_occupancy(input: AnalyticsInput, data: OccupancyData) -> None:
    """Keep the largest valid occupant count observed in any zone."""
    for zone in (input.results.get("zone_results") or {}).values():
        occupants = _number(zone.get("occupant_count"))
        if occupants is not None:
            data.peak = occupants if data.peak is None else max(data.peak, occupants)


def create_occupancy_result(data: OccupancyData) -> OccupancyResult:
    return OccupancyResult(peakOccupants=data.peak)
