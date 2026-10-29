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
    occupant_total_by_zone: dict[str, float] = field(default_factory=dict)
    occupant_samples_by_zone: dict[str, int] = field(default_factory=dict)
    co2_setpoint_total_by_zone: dict[str, float] = field(default_factory=dict)
    co2_setpoint_samples_by_zone: dict[str, int] = field(default_factory=dict)
    openable_window_names_by_zone: dict[str, set[str]] = field(default_factory=dict)
    whole_building_occupant_total: float = 0.0
    whole_building_occupant_samples: int = 0


class BuildingResult(AnalyticsResult):
    totalFloorAreaM2: float | None = None
    totalNetWallAreaM2: float | None = None
    totalVolumeM3: float | None = None
    totalOpenableWindowCount: float | None = None
    totalOpenableWindowAreaM2: float | None = None
    meanOccupantsWeekdays08To22: float | None = None
    byZone: dict[str, dict] = Field(default_factory=dict)


def calculate_building(input: AnalyticsInput, data: BuildingData) -> None:
    """Collect static geometry and weekday 08:00–22:00 zone occupancy data."""
    for name, values in (input.results.get("zone_internal_variable_values") or {}).items():
        target = data.zones.setdefault(name, {})
        for field_name in (
            "floor_area_m2",
            "net_wall_area_m2",
            "air_volume_m3",
            "openable_window_count",
            "openable_window_area_m2",
        ):
            value = _number(values.get(field_name))
            if value is not None:
                target.setdefault(field_name, value)

    timestamp = input.timestamp
    if timestamp is None or timestamp.weekday() >= 5 or not 8 <= timestamp.hour < 22:
        return

    timestep_occupants = 0.0
    has_occupancy_sample = False
    for name, values in (input.results.get("zone_results") or {}).items():
        target = data.zones.setdefault(name, {})
        occupants = _number(values.get("occupant_count"))
        if occupants is not None:
            data.occupant_total_by_zone[name] = (
                data.occupant_total_by_zone.get(name, 0.0) + occupants
            )
            data.occupant_samples_by_zone[name] = (
                data.occupant_samples_by_zone.get(name, 0) + 1
            )
            timestep_occupants += occupants
            has_occupancy_sample = True

        setpoint = _number(values.get("co2_setpoint_ppm"))
        if setpoint is not None:
            data.co2_setpoint_total_by_zone[name] = (
                data.co2_setpoint_total_by_zone.get(name, 0.0) + setpoint
            )
            data.co2_setpoint_samples_by_zone[name] = (
                data.co2_setpoint_samples_by_zone.get(name, 0) + 1
            )

    # Older saved timesteps did not persist window area/count geometry, but
    # they do contain the controlled window names when window control ran.
    for key, values in (input.results.get("window_opening_results") or {}).items():
        zone_name = values.get("zone_name") or key
        names = data.openable_window_names_by_zone.setdefault(zone_name, set())
        names.update(
            window.get("window_name")
            for window in (values.get("window_results") or [])
            if isinstance(window, dict) and window.get("window_name")
        )

    if has_occupancy_sample:
        data.whole_building_occupant_total += timestep_occupants
        data.whole_building_occupant_samples += 1


def create_building_result(data: BuildingData) -> BuildingResult:
    def total(field_name: str) -> float | None:
        values = [zone[field_name] for zone in data.zones.values() if field_name in zone]
        return sum(values) if values else None
    zones = {name: dict(values) for name, values in data.zones.items()}
    for zone_name, window_names in data.openable_window_names_by_zone.items():
        zones.setdefault(zone_name, {})["openable_window_count"] = float(
            len(window_names)
        )
    for zone_name, occupant_total in data.occupant_total_by_zone.items():
        zones.setdefault(zone_name, {})["meanOccupantsWeekdays08To22"] = (
            occupant_total / data.occupant_samples_by_zone[zone_name]
        )
    for zone_name, setpoint_total in data.co2_setpoint_total_by_zone.items():
        zones.setdefault(zone_name, {})[
            "meanCo2SetpointPpmWeekdays08To22"
        ] = setpoint_total / data.co2_setpoint_samples_by_zone[zone_name]
    return BuildingResult(
        totalFloorAreaM2=total("floor_area_m2"),
        totalNetWallAreaM2=total("net_wall_area_m2"),
        totalVolumeM3=total("air_volume_m3"),
        totalOpenableWindowCount=total("openable_window_count"),
        totalOpenableWindowAreaM2=total("openable_window_area_m2"),
        meanOccupantsWeekdays08To22=(
            data.whole_building_occupant_total
            / data.whole_building_occupant_samples
            if data.whole_building_occupant_samples
            else None
        ),
        byZone=zones,
    )
